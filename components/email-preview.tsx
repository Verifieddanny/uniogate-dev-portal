'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { inviteEmail, otpEmail } from '@/lib/email-templates';

type TemplateId = 'otp' | 'invite';
type Width = 'desktop' | 'mobile';

const TEMPLATES: { id: TemplateId; label: string; from: string; trigger: string }[] = [
  { id: 'otp', label: 'Login code', from: 'UnioGate <otp@uniogate.com>', trigger: 'Request a login code' },
  { id: 'invite', label: 'Sales rep invite', from: 'UnioGate <invites@uniogate.com>', trigger: 'Invite a sales rep' },
];

const WIDTHS: Record<Width, number> = { desktop: 640, mobile: 375 };

const inputClass =
  'mt-1.5 w-full rounded-[10px] border border-line bg-white px-3 py-2 text-sm outline-none transition focus:border-brand';

export function EmailPreview() {
  const [template, setTemplate] = useState<TemplateId>('otp');
  const [code, setCode] = useState('482913');
  const [businessName, setBusinessName] = useState('Ada Stores');
  const [width, setWidth] = useState<Width>('desktop');
  const [height, setHeight] = useState(680);
  const frame = useRef<HTMLIFrameElement>(null);

  const meta = TEMPLATES.find((t) => t.id === template)!;
  // Read the year in the browser: Cache Components forbids reading the clock while prerendering
  const [year, setYear] = useState(2026);
  useEffect(() => setYear(new Date().getFullYear()), []);

  const email = useMemo(
    () =>
      template === 'otp'
        ? otpEmail(code, '/email-logo.png', year)
        : inviteEmail({ businessName, code }, '/email-logo.png', year),
    [template, code, businessName, year],
  );

  // Grow the iframe to fit the email, so there's a single scrollbar (the page's)
  const fit = () => {
    const doc = frame.current?.contentDocument;
    if (doc?.body) setHeight(doc.body.scrollHeight + 8);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-card border border-line bg-white p-5 sm:grid-cols-2 lg:grid-cols-4">
        <label className="block text-sm font-semibold text-navy">
          Email
          <select value={template} onChange={(e) => setTemplate(e.target.value as TemplateId)} className={inputClass}>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-semibold text-navy">
          Code
          <input
            value={code}
            maxLength={6}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className={`${inputClass} font-mono tracking-widest`}
          />
        </label>
        <label className="block text-sm font-semibold text-navy">
          Business name
          <input
            value={businessName}
            disabled={template !== 'invite'}
            onChange={(e) => setBusinessName(e.target.value)}
            className={`${inputClass} disabled:bg-surface disabled:text-muted`}
          />
        </label>
        <div className="text-sm font-semibold text-navy">
          Screen
          <div role="tablist" className="mt-1.5 flex rounded-full bg-surface p-1">
            {(['desktop', 'mobile'] as const).map((w) => (
              <button
                key={w}
                role="tab"
                aria-selected={width === w}
                onClick={() => setWidth(w)}
                className={`flex-1 rounded-full py-1.5 text-sm capitalize transition ${
                  width === w ? 'bg-white font-semibold text-navy shadow-sm' : 'font-normal text-muted'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* How it looks in the inbox list */}
      <div className="overflow-hidden rounded-card border border-line bg-white">
        <p className="border-b border-line px-5 py-2.5 text-xs font-semibold tracking-wider text-muted uppercase">
          In the inbox
        </p>
        <div className="flex items-start gap-3 px-5 py-4">
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-brand font-display text-sm font-bold text-white">U</span>
          <div className="min-w-0">
            <p className="text-sm text-muted">{meta.from}</p>
            <p className="truncate text-sm">
              <span className="font-semibold text-navy">{email.subject}</span>
              <span className="text-muted"> · {email.preheader}</span>
            </p>
          </div>
        </div>
      </div>

      {/* The email itself */}
      <div className="rounded-card bg-lavender p-4 sm:p-8">
        <div className="mx-auto overflow-hidden rounded-[14px] bg-white shadow-sm transition-all" style={{ maxWidth: WIDTHS[width] }}>
          <iframe
            ref={frame}
            title={`${meta.label} email preview`}
            srcDoc={email.html}
            onLoad={fit}
            sandbox="allow-same-origin"
            className="block w-full"
            style={{ height }}
          />
        </div>
      </div>

      <p className="text-sm text-muted">
        Sent by the server when the app calls <span className="font-semibold text-navy">{meta.trigger}</span>. The app never
        sends emails itself; it only needs to show the code screen afterwards.
      </p>
    </div>
  );
}
