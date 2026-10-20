import type { Metadata } from 'next';
import { CodeBlock } from '@/components/code-block';

export const metadata: Metadata = { title: 'Talk to Danny' };

// Fill these in before deploying
const CONTACT = {
  name: 'Danny',
  role: 'Backend',
  email: 'danny@uniogate.com',
  whatsapp: '+234 800 000 0000',
  hours: 'Weekdays, 9am – 9pm WAT',
};

const ASK_FOR = [
  { title: 'Backend URLs & access', items: ['Staging backend URL (HTTPS)', 'A test owner and a test sales rep account', 'Your web domain added to the backend’s allowed origins (CORS)'] },
  { title: 'Firebase & push', items: ['google-services.json (Android)', 'firebaseConfig + VAPID key (web)', 'Bundle ID / package name confirmation before release', 'iOS: wait until the Apple account is ready'] },
  { title: 'Payments (sandbox)', items: ['How to complete verification on a test business', 'Test bank details for withdrawals that succeed or fail', 'Anything that moves real money: always check first'] },
  { title: 'Changes', items: ['A new endpoint or a new field you need', 'A response that doesn’t match these docs', 'Wording of user-facing errors'] },
];

const BUG_TEMPLATE = `Endpoint:   POST /sales/create
When:       2026-10-20 14:32 WAT
Backend:    staging
Signed in:  owner of "Ada Stores" (or sales rep)

Request body:
{ "amount": 5000, "paymentType": "any" }

Expected:   201 Sale started
Got:        500 { "error": "Failed to create sale" }

Steps:      1. … 2. … 3. …
Screenshot: (attach)`;

export default function ContactPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-semibold text-brand">Talk to Danny</p>
        <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-navy">When you need the backend side</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink/80">
          Most answers are in these docs. Reach out for the things below, or when the docs and the real API disagree:
          that’s a bug either way.
        </p>
      </header>

      <section className="flex flex-col gap-5 rounded-card bg-brand px-7 py-7 text-white sm:flex-row sm:items-center">
        <span className="grid size-14 shrink-0 place-items-center rounded-full bg-white/15 font-display text-xl font-semibold">
          {CONTACT.name[0]}
        </span>
        <div className="flex-1">
          <p className="font-display text-xl font-semibold">{CONTACT.name}</p>
          <p className="text-sm text-white/75">{CONTACT.role} · {CONTACT.hours}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`mailto:${CONTACT.email}`} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-brand transition hover:bg-white/90">
            Email
          </a>
          <a
            href={`https://wa.me/${CONTACT.whatsapp.replace(/\D/g, '')}`}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            WhatsApp
          </a>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy">Ask Danny for</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {ASK_FOR.map((g) => (
            <div key={g.title} className="rounded-card border border-line bg-white p-5">
              <p className="font-semibold text-navy">{g.title}</p>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink/75 marker:text-brand">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="font-display text-lg font-semibold text-navy">Reporting a bug</h2>
        <p className="max-w-2xl text-sm leading-6 text-ink/80">
          Copy this, fill it in and send it. The request body and the exact response save a lot of back-and-forth.
          Never paste access tokens or real customer details.
        </p>
        <CodeBlock title="Bug report" code={BUG_TEMPLATE} />
      </section>

      <section className="rounded-card border border-line bg-white px-6 py-5">
        <p className="font-semibold text-navy">Golden rules</p>
        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink/80 marker:text-brand">
          <li>Payments are confirmed by the server. Never mark a sale as paid from the app.</li>
          <li>Disable “Withdraw” and “Charge” after the first tap. They move real money.</li>
          <li>Show the error message the API returns. Branch on <code className="font-mono">code</code> when there is one.</li>
          <li>Store tokens securely (Keychain / Keystore). Never log them.</li>
        </ul>
      </section>
    </div>
  );
}
