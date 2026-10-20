'use client';

import { useState } from 'react';
import { Icon } from './icons';

export function CodeBlock({ code, title }: { code: string; title?: string }) {
    const [copied, setCopied] = useState(false);

    async function copy() {
        try {
            await navigator.clipboard.writeText(code);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard blocked: nothing to do */
        }
    }

    return (
        <div className="overflow-hidden rounded-[14px] bg-navy">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
                <span className="text-xs font-medium text-white/60">{title ?? 'JSON'}</span>
                <button
                    onClick={copy}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-white/70 transition hover:bg-white/10 hover:text-white"
                >
                    <Icon name={copied ? 'check' : 'copy'} size={14} />
                    {copied ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-6 text-slate-100">
                <code>{code}</code>
            </pre>
        </div>
    );
}