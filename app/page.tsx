import Link from 'next/link';
import { Icon, type IconName } from '@/components/icons';
import { GROUPS, endpointsIn } from '@/lib/endpoints';

const CONVENTIONS = [
  { title: 'Sign-in', text: 'No passwords. Request a code → verify it → you get an accessToken and refreshToken.' },
  { title: 'Auth header', text: 'Send Authorization: Bearer <accessToken> on every protected call. On 401, refresh once, then retry.' },
  { title: 'Money', text: 'Amounts are strings like "5000.00", in naira unless a currency says otherwise. Never use floats for display maths.' },
  { title: 'Errors', text: 'Validation errors come as { errors: [{ path, msg }] }. Everything else is { error, code? }. Branch on code, show error.' },
];

export default function GettingStarted() {
  return (
    <div className="space-y-14">
      <header className="overflow-hidden rounded-card bg-brand px-7 py-10 text-white md:px-10 md:py-12">
        <p className="text-sm font-medium text-white/70">UnioGate Dev Portal</p>
        <h1 className="mt-2 max-w-xl font-display text-3xl font-semibold tracking-tight md:text-4xl">
          Everything you need to build the UnioGate app.
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-7 text-white/80">
          Every endpoint in plain words, what to show the user for each response, and a console you can run in
          Simulated mode or against a real backend.
        </p>
      </header>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy">The basics</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {CONVENTIONS.map((c) => (
            <div key={c.title} className="rounded-card border border-line bg-white p-5">
              <p className="font-semibold text-navy">{c.title}</p>
              <p className="mt-1.5 text-sm leading-6 text-ink/75">{c.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-navy">API reference</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {GROUPS.map((g) => {
            const first = endpointsIn(g.id)[0];
            const card = (
              <>
                <p className="font-semibold text-navy">{g.title}</p>
                <p className="mt-1 text-sm leading-6 text-ink/70">{g.description}</p>
              </>
            );
            return first ? (
              <Link
                key={g.id}
                href={`/reference/${first.slug}`}
                className="group rounded-card border border-line bg-white p-5 transition hover:border-brand"
              >
                {card}
                 <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand">
                  Open <Icon name="arrowRight" className="transition group-hover:translate-x-0.5" />
                </span>
              </Link>
            ) : (
              <div key={g.id} className="rounded-card border border-line bg-white/60 p-5 opacity-70">
                {card}
                <span className="mt-3 inline-block text-xs font-medium text-muted">Coming in step 2</span>
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
                {([
          { href: '/emails', icon: 'mail', title: 'Email preview', text: 'See the exact OTP and invite emails.' },
          { href: '/notifications', icon: 'bell', title: 'Notifications', text: 'Every push type, and send one to this browser.' },
          { href: '/contact', icon: 'chat', title: 'Talk to Danny', text: 'What to ask for, and how to report a bug.' },
        ] as { href: string; icon: IconName; title: string; text: string }[]).map(({ href, icon, title, text }) => (
          <Link key={href} href={href} className="rounded-card border border-line bg-white p-5 transition hover:border-brand">
            <Icon name={icon} size={20} className="text-brand" />
            <p className="mt-3 font-semibold text-navy">{title}</p>
            <p className="mt-1 text-sm leading-6 text-ink/70">{text}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}