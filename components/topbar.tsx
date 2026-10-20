'use client';

import { useState } from 'react';
import { Icon, type IconName } from './icons';
import { isLive, useEnv, type Mode } from '@/lib/env-context';

const MODES: { id: Mode; label: string; icon: IconName }[] = [
  { id: 'simulated', label: 'Simulated', icon: 'simulated' },
  { id: 'live', label: 'Live', icon: 'live' },
];

const inputClass =
  'w-full rounded-[10px] border border-line bg-white px-3.5 py-2.5 font-mono text-sm outline-none transition placeholder:font-sans placeholder:text-muted focus:border-brand';

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { env, update, ready } = useEnv();
  const [open, setOpen] = useState(false);
  const live = isLive(env);

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-5 md:px-10">
        <button
          onClick={onMenu}
          aria-label="Open menu"
          className="-ml-1 rounded-[10px] p-2 text-navy hover:bg-surface lg:hidden"
        >
                    <Icon name="menu" size={20} />
        </button>

        <div className="ml-auto flex items-center gap-2">
          <div role="tablist" aria-label="Request mode" className="flex rounded-full bg-surface p-1 text-sm">
            {MODES.map(({ id, label, icon }) => (
              <button
                key={id}
                role="tab"
                aria-selected={env.mode === id}
                onClick={() => {
                  update({ mode: id });
                  if (id === 'live' && !env.baseUrl) setOpen(true);
                }}
                className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition ${
                  env.mode === id ? 'bg-white text-navy shadow-sm' : 'text-muted hover:text-navy'
                }`}
              >
                <Icon name={icon} />
                {label}
              </button>
            ))}
          </div>

          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex items-center gap-2 rounded-full border border-line px-3 py-2 text-sm text-navy transition hover:border-brand"
          >
            <span
              className={`size-2 rounded-full ${
                live ? 'bg-emerald-500' : env.mode === 'live' ? 'bg-amber-500' : 'bg-slate-300'
              }`}
            />
            <span className="hidden max-w-52 truncate sm:inline">
              {!ready ? '…' : env.baseUrl || 'Connect a backend'}
            </span>
             <Icon name="arrowDown" className={`text-muted transition ${open ? 'rotate-180' : ''}`} />
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-line bg-white px-5 py-6 md:px-10">
          <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-semibold text-navy">Backend URL</span>
              <input
                value={env.baseUrl}
                onChange={(e) => update({ baseUrl: e.target.value.replace(/\/+$/, '') })}
                placeholder="http://localhost:8080"
                className={`mt-1.5 ${inputClass}`}
              />
              <span className="mt-1.5 block text-xs text-muted">No trailing slash. Ask Danny for the staging URL.</span>
            </label>

            <label className="block">
              <span className="text-sm font-semibold text-navy">Access token</span>
              <input
                type="password"
                value={env.token}
                onChange={(e) => update({ token: e.target.value.trim() })}
                placeholder="Paste the accessToken from verify-otp"
                className={`mt-1.5 ${inputClass}`}
              />
              <span className="mt-1.5 block text-xs text-muted">Kept in this tab only. Gone when you close it.</span>
            </label>
          </div>

          <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted">
              {env.mode === 'simulated'
                ? 'Simulated: requests never leave your browser. Responses are realistic examples.'
                : live
                  ? 'Live: requests go to your backend with this token.'
                  : 'Live needs a backend URL. Until you add one, requests are simulated.'}
            </p>
            <button
              onClick={() => setOpen(false)}
              className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </header>
  );
}