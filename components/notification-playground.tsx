'use client';

import { useEffect, useState } from 'react';
import { PUSH_TYPES, type PushType } from '@/lib/notifications';
import { CodeBlock } from './code-block';

type Platform = 'android' | 'ios' | 'web';
type Permission = NotificationPermission | 'unsupported';

const PLATFORMS: { id: Platform; label: string }[] = [
  { id: 'android', label: 'Android' },
  { id: 'ios', label: 'iOS' },
  { id: 'web', label: 'Web' },
];

function AppMark({ size = 'size-5' }: { size?: string }) {
  return (
    <span className={`grid ${size} shrink-0 place-items-center rounded-md bg-brand font-display text-[10px] font-bold text-white`}>
      U
    </span>
  );
}

/** A faithful-enough mock of how each OS draws the notification */
function Mock({ push, platform }: { push: PushType; platform: Platform }) {
  if (platform === 'ios') {
    return (
      <div className="rounded-[22px] bg-white/75 p-3.5 shadow-lg ring-1 ring-black/5 backdrop-blur">
        <div className="flex gap-3">
          <AppMark size="size-9 rounded-[9px] text-sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-[15px] font-semibold text-black">{push.title}</p>
              <span className="shrink-0 text-xs text-black/45">now</span>
            </div>
            <p className="text-[15px] leading-5 text-black/85">{push.body}</p>
          </div>
        </div>
      </div>
    );
  }

  if (platform === 'web') {
    return (
      <div className="rounded-xl bg-white p-4 shadow-xl ring-1 ring-black/10">
        <div className="flex items-center gap-2 text-xs text-black/55">
          <AppMark size="size-4 text-[8px]" />
          <span>dev-portal · uniogate</span>
        </div>
        <p className="mt-2 text-sm font-semibold text-black">{push.title}</p>
        <p className="mt-0.5 text-sm text-black/70">{push.body}</p>
      </div>
    );
  }

  return (
    <div className="rounded-[20px] bg-white p-4 shadow-lg ring-1 ring-black/5">
      <div className="flex items-center gap-2 text-xs text-black/60">
        <AppMark size="size-4 rounded-full text-[8px]" />
        <span>UnioGate · now</span>
      </div>
      <p className="mt-2 text-[15px] font-semibold text-black">{push.title}</p>
      <p className="text-sm text-black/70">{push.body}</p>
    </div>
  );
}

export function NotificationPlayground() {
  const [selected, setSelected] = useState(PUSH_TYPES[0]!.type);
  const [platform, setPlatform] = useState<Platform>('android');
  const [permission, setPermission] = useState<Permission>('default');
  const [toast, setToast] = useState<string | null>(null);

  const push = PUSH_TYPES.find((p) => p.type === selected)!;

  useEffect(() => {
    setPermission(typeof Notification === 'undefined' ? 'unsupported' : Notification.permission);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  async function sendToBrowser() {
    if (typeof Notification === 'undefined') {
      setToast('This browser doesn’t support notifications.');
      return;
    }
    let p = Notification.permission;
    if (p === 'default') p = await Notification.requestPermission();
    setPermission(p);
    if (p !== 'granted') {
      setToast('Notifications are blocked for this site. Allow them in the browser’s site settings.');
      return;
    }
    const n = new Notification(push.title, { body: push.body, icon: '/email-logo.png', tag: push.type, data: push.data });
    n.onclick = () => {
      window.focus();
      setToast(`Tapped → the app would open: ${push.route}`);
      n.close();
    };
    setToast('Sent. Check your system notifications.');
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* Types */}
        <ul className="space-y-2">
          {PUSH_TYPES.map((p) => (
            <li key={p.type}>
              <button
                onClick={() => setSelected(p.type)}
                className={`w-full rounded-[14px] border px-4 py-3 text-left transition ${
                  selected === p.type ? 'border-brand bg-brand-50' : 'border-line bg-white hover:border-brand/40'
                }`}
              >
                <code className="font-mono text-xs text-brand">{p.type}</code>
                <p className="mt-0.5 truncate text-sm font-semibold text-navy">{p.title}</p>
              </button>
            </li>
          ))}
        </ul>

        {/* Preview */}
        <div className="space-y-4">
          <div role="tablist" className="flex rounded-full bg-white p-1 ring-1 ring-line">
            {PLATFORMS.map((pl) => (
              <button
                key={pl.id}
                role="tab"
                aria-selected={platform === pl.id}
                onClick={() => setPlatform(pl.id)}
                className={`flex-1 rounded-full py-1.5 text-sm transition ${
                  platform === pl.id ? 'bg-navy font-semibold text-white' : 'text-muted hover:text-navy'
                }`}
              >
                {pl.label}
              </button>
            ))}
          </div>

          <div className="rounded-card bg-gradient-to-br from-brand to-navy p-6 sm:p-8">
            <Mock push={push} platform={platform} />
          </div>

          <button
            onClick={sendToBrowser}
            className="w-full rounded-full bg-brand py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Send this to my browser
          </button>
          <p className="text-center text-xs text-muted">
            {permission === 'denied'
              ? 'Blocked: allow notifications for this site in your browser settings.'
              : permission === 'unsupported'
                ? 'This browser can’t show notifications.'
                : 'A local preview using your browser’s notifications. Real pushes come from Firebase.'}
          </p>
        </div>
      </div>

      <dl className="grid gap-4 rounded-card border border-line bg-white p-5 sm:grid-cols-3">
        <div>
          <dt className="text-xs font-semibold tracking-wider text-muted uppercase">Sent when</dt>
          <dd className="mt-1 text-sm leading-6 text-ink/80">{push.trigger}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wider text-muted uppercase">Who gets it</dt>
          <dd className="mt-1 text-sm leading-6 text-ink/80">{push.audience}</dd>
        </div>
        <div>
          <dt className="text-xs font-semibold tracking-wider text-muted uppercase">On tap, open</dt>
          <dd className="mt-1 text-sm leading-6 text-ink/80">{push.route}</dd>
        </div>
      </dl>

      <CodeBlock
        title="Payload the app receives (FCM)"
        code={JSON.stringify({ notification: { title: push.title, body: push.body }, data: push.data }, null, 2)}
      />

      {toast && (
        <div role="status" className="fixed right-5 bottom-5 z-50 max-w-sm rounded-[14px] bg-navy px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </div>
  );
}
