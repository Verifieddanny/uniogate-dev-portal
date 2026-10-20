import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ENDPOINTS, GROUPS, getEndpoint, neighbours } from '@/lib/endpoints';
import type { AuthLevel } from '@/lib/endpoints/types';
import { MethodBadge } from '@/components/method-badge';
import { FieldList } from '@/components/field-list';
import { CodeBlock } from '@/components/code-block';
import { ResponseList } from '@/components/response-list';
import Link from 'next/link';
import { TryIt } from '@/components/try-it';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
    return ENDPOINTS.map((e) => ({ slug: e.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const e = getEndpoint(slug);
    return { title: e ? e.title : 'Not found' };
}

const AUTH_LABEL: Record<AuthLevel, { text: string; tone: string }> = {
    none: { text: 'No sign-in needed', tone: 'bg-surface text-muted' },
    user: { text: 'Signed-in user', tone: 'bg-brand-50 text-brand' },
    owner: { text: 'Business owner only', tone: 'bg-navy text-white' },
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <section className="space-y-4">
            <h2 className="font-display text-lg font-semibold text-navy">{title}</h2>
            {children}
        </section>
    );
}

export default async function EndpointPage({ params }: Props) {
    const { slug } = await params;
    const e = getEndpoint(slug);
    if (!e) notFound();

    const group = GROUPS.find((g) => g.id === e.group);
    const auth = AUTH_LABEL[e.auth];
    const { prev, next } = neighbours(e.slug);

    return (
        <article className="space-y-12">
            <header>
                <p className="text-sm font-semibold text-brand">{group?.title}</p>
                <h1 className="mt-1.5 font-display text-3xl font-semibold tracking-tight text-navy md:text-[34px]">
                    {e.title}
                </h1>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                    <MethodBadge method={e.method} />
                    <code className="rounded-[10px] bg-white px-3 py-1 font-mono text-sm text-navy ring-1 ring-line">{e.path}</code>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${auth.tone}`}>{auth.text}</span>
                </div>
                <p className="mt-6 max-w-2xl text-[15px] leading-7 text-ink/80">{e.summary}</p>
            </header>

            <Section title="When to call it">
                <p className="max-w-2xl rounded-card bg-lavender px-5 py-4 text-sm leading-6 text-navy">{e.whenToCall}</p>
            </Section>

            {e.pathParams && (
                <Section title="Path parameters">
                    <FieldList fields={e.pathParams} />
                </Section>
            )}

            {e.query && (
                <Section title="Query parameters">
                    <FieldList fields={e.query} />
                </Section>
            )}

            {e.body && (
                <Section title="Request body">
                    <FieldList fields={e.body} />
                    {e.exampleBody !== undefined && (
                        <CodeBlock title="Example body" code={JSON.stringify(e.exampleBody, null, 2)} />
                    )}
                </Section>
            )}

            <Section title="Responses">
                <ResponseList responses={e.responses} />
            </Section>

            {e.notes && e.notes.length > 0 && (
                <Section title="Good to know">
                    <ul className="list-disc space-y-1.5 pl-5 text-sm leading-6 text-ink/80 marker:text-brand">
                        {e.notes.map((n) => (
                            <li key={n}>{n}</li>
                        ))}
                    </ul>
                </Section>
            )}

            <Section title="Try it">
                <TryIt key={e.slug} endpoint={e} />
            </Section>
            <nav className="grid gap-3 border-t border-line pt-8 sm:grid-cols-2">
                {prev ? (
                    <Link href={`/reference/${prev.slug}`} className="rounded-card border border-line bg-white p-4 transition hover:border-brand">
                        <span className="text-xs text-muted">← Previous</span>
                        <span className="mt-1 block font-semibold text-navy">{prev.title}</span>
                    </Link>
                ) : <span />}
                {next && (
                    <Link href={`/reference/${next.slug}`} className="rounded-card border border-line bg-white p-4 text-right transition hover:border-brand">
                        <span className="text-xs text-muted">Next →</span>
                        <span className="mt-1 block font-semibold text-navy">{next.title}</span>
                    </Link>
                )}
            </nav>
        </article>
    );
}