import type { Metadata } from 'next';
import { EmailPreview } from '@/components/email-preview';

export const metadata: Metadata = { title: 'Email preview' };

export default function EmailsPage() {
  return (
    <div className="space-y-8">
      <header>
        <p className="text-sm font-semibold text-brand">Email preview</p>
        <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-navy">What users get in their inbox</h1>
        <p className="mt-4 max-w-2xl text-[15px] leading-7 text-ink/80">
          The real templates, rendered live. Change the code or business name and switch screen sizes to see exactly
          what lands in a user’s inbox before they type the code into the app.
        </p>
      </header>
      <EmailPreview />
    </div>
  );
}
