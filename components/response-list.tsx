'use client';

import { useState } from 'react';
import type { ResponseCase } from '@/lib/endpoints/types';
import { CodeBlock } from './code-block';

export const statusTone = (status: number) =>
    status < 300
        ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
        : status < 500
            ? 'bg-amber-50 text-amber-700 ring-amber-600/20'
            : 'bg-red-50 text-red-700 ring-red-600/20';

export function ResponseList({ responses }: { responses: ResponseCase[] }) {
    const [activeId, setActiveId] = useState(responses[0]?.id);
    const active = responses.find((r) => r.id === activeId) ?? responses[0];
    if (!active) return null;

    return (
        <div className="overflow-hidden rounded-card border border-line bg-white">
            <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line p-2">
                {responses.map((r) => (
                    <button
                        key={r.id}
                        role="tab"
                        aria-selected={r.id === active.id}
                        onClick={() => setActiveId(r.id)}
                        className={`flex shrink-0 items-center gap-2 rounded-[10px] px-3 py-2 text-sm transition ${r.id === active.id ? 'bg-surface font-semibold text-navy' : 'text-muted hover:text-navy'
                            }`}
                    >
                        <span className={`rounded-md px-1.5 py-0.5 font-mono text-xs font-semibold ring-1 ring-inset ${statusTone(r.status)}`}>
                            {r.status}
                        </span>
                        {r.label}
                    </button>
                ))}
            </div>

            <div className="space-y-4 p-5">
                <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <dt className="text-xs font-semibold tracking-wider text-muted uppercase">When</dt>
                        <dd className="mt-1 text-sm leading-6 text-ink/80">{active.when}</dd>
                    </div>
                    <div>
                        <dt className="text-xs font-semibold tracking-wider text-muted uppercase">What the app should do</dt>
                        <dd className="mt-1 text-sm leading-6 text-ink/80">{active.ui}</dd>
                    </div>
                </dl>
                {active.body === null ? (
                    <p className="rounded-[14px] bg-surface px-4 py-3 text-sm text-muted">No response body.</p>
                ) : (
                    <CodeBlock
                        title="Response body"
                        code={typeof active.body === 'string' ? active.body : JSON.stringify(active.body, null, 2)}
                    />
                )}
            </div>
        </div>
    );
}