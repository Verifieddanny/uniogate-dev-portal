import type { Metadata } from 'next';
import Link from 'next/link';
import { NotificationPlayground } from '@/components/notification-playground';
import { RealPush } from '@/components/real-push';

export const metadata: Metadata = { title: 'Notifications' };

const STEPS = [
  { title: 'After sign-in', text: 'Ask for permission, get the FCM token, then call Register device for push with { token, platform }.' },
  { title: 'Token changes', text: 'Firebase can rotate the token. Call Register device again with the new one (it’s safe to repeat).' },
  { title: 'On log-out', text: 'Call Unregister device first, then Log out, then clear the tokens.' },
  { title: 'On tap', text: 'Read data.type and route as shown below. In the foreground, show an in-app toast for sale.confirmed.' },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-10">
      <header>
        <p className="text-sm font-semibold text-brand">Notifications</p>
        <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-navy">Every push the app can receive</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink/80">
          See each notification on Android, iOS and the web, what triggers it, who gets it and where a tap should go.
          Then send one to this browser to feel it.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2">
        {STEPS.map((s, i) => (
          <div key={s.title} className="rounded-card border border-line bg-white p-5">
            <p className="text-xs font-semibold text-brand">Step {i + 1}</p>
            <p className="mt-1 font-semibold text-navy">{s.title}</p>
            <p className="mt-1.5 text-sm leading-6 text-ink/75">{s.text}</p>
          </div>
        ))}
      </section>

      <NotificationPlayground />
      <RealPush />

      <section className="rounded-card bg-lavender px-6 py-5 text-sm leading-6 text-navy">
        <p className="font-semibold">Setup checklist (get these from Danny)</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Android: <code className="font-mono">google-services.json</code>, plus a notification channel with id <code className="font-mono">payments</code> (high importance).</li>
          <li>Web: the <code className="font-mono">firebaseConfig</code> object and the VAPID key, plus <code className="font-mono">public/firebase-messaging-sw.js</code>.</li>
          <li>iOS: on hold until UnioGate’s Apple Developer account is set up.</li>
          <li>Use the native FCM token (not an Expo push token). Test end-to-end with <Link href="/reference/test-push" className="font-semibold text-brand hover:underline">Send a test push</Link>.</li>
        </ul>
      </section>
    </div>
  );
}
