import type { Metadata } from 'next';
import { Sora, Plus_Jakarta_Sans, Geist_Mono } from 'next/font/google';
import { EnvProvider } from '@/lib/env-context';
import { Shell } from '@/components/shell';
import './globals.css';

const sora = Sora({ subsets: ['latin'], variable: '--font-sora' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta' });
const mono = Geist_Mono({ subsets: ['latin'], variable: '--font-geist-mono' });

export const metadata: Metadata = {
  title: { default: 'UnioGate Dev Portal', template: '%s · UnioGate Dev Portal' },
  description: 'API reference, email previews and notification playground for building the UnioGate app.',
  robots: { index: false, follow: false }, // internal tool: keep it out of search engines
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sora.variable} ${jakarta.variable} ${mono.variable}`}>
      <body>
        <EnvProvider>
          <Shell>{children}</Shell>
        </EnvProvider>
      </body>
    </html>
  );
}