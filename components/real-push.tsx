'use client';

import { useEffect, useState } from 'react';
import { getWebPushToken, onForegroundPush } from '@/lib/firebase';
import { isLive, useEnv } from '@/lib/env-context';

type StepState = 'idle' | 'working' | 'done' | 'error';

interface Step {
  state: StepState;
  message?: string;
}

const dot: Record<StepState, string> = {
  idle: 'bg-slate-300',
  working: 'animate-pulse bg-amber-400',
  done: 'bg-emerald-500',
  error: 'bg-red-500',
};

export function RealPush() {
  const { env } = useEnv();
  const live = isLive(env);
  const ready = live && !!env.token;

  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [enable, setEnable] = useState<Step>({ state: 'idle' });
  const [register, setRegister] = useState<Step>({ state: 'idle' });
  const [test, setTest] = useState<Step>({ state: 'idle' });
  const [incoming, setIncoming] = useState<{ title: string; body: string; type?: string } | null>(null);

  // Tab in focus → Firebase hands the push to the page instead of the OS. Show it ourselves.
  useEffect(() => {
    let unsubscribe = () => {};
    onForegroundPush((p) => {
      setIncoming({ title: p.notification?.title ?? 'Notification', body: p.notification?.body ?? '', type: p.data?.type });
    }).then((fn) => (unsubscribe = fn));
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!incoming) return;
    const t = setTimeout(() => setIncoming(null), 6000);
    return () => clearTimeout(t);
  }, [incoming]);

  async function call(path: string, init: RequestInit) {
    const res = await fetch(`${env.baseUrl}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${env.token}` },
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`${res.status}: ${text.slice(0, 160) || res.statusText}`);
    }
  }

  async function doEnable() {
    setEnable({ state: 'working' });
    try {
      const token = await getWebPushToken();
      setFcmToken(token);
      setEnable({ state: 'done', message: 'This browser can receive pushes.' });
    } catch (e) {
      setEnable({ state: 'error', message: (e as Error).message });
    }
  }

  async function doRegister() {
    if (!fcmToken) return;
    setRegister({ state: 'working' });
    try {
      await call('/devices', { method: 'POST', body: JSON.stringify({ token: fcmToken, platform: 'web' }) });
      setRegister({ state: 'done', message: 'Saved for the signed-in user.' });
    } catch (e) {
      setRegister({ state: 'error', message: (e as Error).message });
    }
  }

  async function doTest() {
    setTest({ state: 'working' });
    try {
      await call('/devices/test', { method: 'POST' });
      setTest({ state: 'done', message: 'Sent. Look for “UnioGate test 🎉”.' });
    } catch (e) {
      setTest({ state: 'error', message: (e as Error).message });
    }
  }

  const steps = [
    {
      n: 1,
      title: 'Allow notifications in this browser',
      text: 'Asks permission and gets this browser’s Firebase token.',
      step: enable,
      action: doEnable,
      label: 'Enable',
      disabled: enable.state === 'working',
    },
    {
      n: 2,
      title: 'Register this browser with the backend',
      text: 'Calls POST /devices as the signed-in user, exactly like the app will.',
      step: register,
      action: doRegister,
      label: 'Register',
      disabled: !fcmToken || !ready || register.state === 'working',
    },
    {
      n: 3,
      title: 'Send a real push',
      text: 'Calls POST /devices/test. Firebase delivers it to every device you registered.',
      step: test,
      action: doTest,
      label: 'Send test',
      disabled: register.state !== 'done' || test.state === 'working',
    },
  ];

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-display text-lg font-semibold text-navy">Real push, end to end</h2>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-ink/75">
          This goes through Firebase and the backend for real. Close or background this tab after step 3 to see the
          system notification; while the tab is focused it appears as a toast here instead.
        </p>
      </div>

      {!ready && (
        <p className="rounded-[10px] bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
          Steps 2 and 3 need Live mode with a backend URL and an access token (top right). Step 1 works anytime.
        </p>
      )}

      <ol className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
        {steps.map((s) => (
          <li key={s.n} className="flex flex-wrap items-center gap-4 px-5 py-4">
            <span className="grid size-8 shrink-0 place-items-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand">
              {s.n}
            </span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 font-semibold text-navy">
                <span className={`size-2 rounded-full ${dot[s.step.state]}`} />
                {s.title}
              </p>
              <p className="mt-0.5 text-sm text-ink/70">{s.step.message ?? s.text}</p>
              {s.n === 1 && fcmToken && (
                <code className="mt-1.5 block truncate font-mono text-xs text-muted" title={fcmToken}>
                  {fcmToken}
                </code>
              )}
            </div>
            <button
              onClick={s.action}
              disabled={s.disabled}
              className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {s.step.state === 'working' ? '…' : s.label}
            </button>
          </li>
        ))}
      </ol>

      <p className="text-xs text-muted">
        Then try the real thing: create a sale in Live mode and pay it on the checkout page. “Payment received” arrives
        here within seconds.
      </p>

      {incoming && (
        <div role="status" className="fixed top-20 right-5 z-50 w-80 rounded-[16px] bg-white p-4 shadow-2xl ring-1 ring-line">
          <p className="text-xs font-semibold text-brand">Push received (tab in focus)</p>
          <p className="mt-1 font-semibold text-navy">{incoming.title}</p>
          <p className="text-sm text-ink/75">{incoming.body}</p>
          {incoming.type && <code className="mt-2 block font-mono text-xs text-muted">data.type = {incoming.type}</code>}
        </div>
      )}
    </section>
  );
}
