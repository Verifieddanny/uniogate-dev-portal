'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState } from 'react';
import { Icon, type IconName } from './icons';
import { ENDPOINTS, GROUPS } from '@/lib/endpoints';
import { MethodBadge } from './method-badge';

const PAGES: { href: string; label: string; icon: IconName }[] = [
    { href: '/', label: 'Getting started', icon: 'book' },
    { href: '/emails', label: 'Email preview', icon: 'mail' },
    { href: '/notifications', label: 'Notifications', icon: 'bell' },
    { href: '/contact', label: 'Talk to Danny', icon: 'chat' },
];

const itemClass = (active: boolean) =>
    `flex items-center gap-2.5 rounded-[10px] px-2.5 py-2 text-sm transition ${active ? 'bg-brand-50 font-semibold text-brand' : 'text-ink/75 hover:bg-surface hover:text-navy'
    }`;

export function Sidebar() {
    const pathname = usePathname();
    const [query, setQuery] = useState('');

    const groups = useMemo(() => {
        const term = query.trim().toLowerCase();
        return GROUPS.map((g) => ({
            ...g,
            items: ENDPOINTS.filter(
                (e) => e.group === g.id && (!term || `${e.title} ${e.method} ${e.path}`.toLowerCase().includes(term)),
            ),
        })).filter((g) => g.items.length > 0);
    }, [query]);

    return (
        <div className="flex h-full flex-col">
            <div className="px-5 pt-6 pb-5">
                <Link href="/" className="flex items-center gap-2.5">
                    <span className="grid size-8 place-items-center rounded-[10px] bg-brand font-display text-sm font-bold text-white">
                        U
                    </span>
                    <span className="font-display text-[15px] font-semibold text-navy">
                        UnioGate <span className="font-normal text-muted">Dev Portal</span>
                    </span>
                </Link>
            </div>

            <div className="px-4 pb-3">
                <label className="relative block">
                    <span className="sr-only">Search endpoints</span>
                    <Icon name="search" className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-muted" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search endpoints"
                        className="w-full rounded-[10px] border border-line bg-surface py-2 pr-3 pl-9 text-sm outline-none transition placeholder:text-muted focus:border-brand focus:bg-white"
                    />
                </label>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 pb-10">
                {!query && (
                    <ul className="space-y-0.5">
                        {PAGES.map(({ href, label, icon }) => (
                            <li key={href}>
                                <Link href={href} className={itemClass(pathname === href)}>
                                    <Icon name={icon} className="shrink-0" />
                                    {label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                {groups.map((g) => (
                    <div key={g.id} className="mt-6">
                        <p className="px-2.5 pb-1.5 text-[11px] font-semibold tracking-wider text-muted uppercase">{g.title}</p>
                        <ul className="space-y-0.5">
                            {g.items.map((e) => {
                                const href = `/reference/${e.slug}`;
                                return (
                                    <li key={e.slug}>
                                        <Link href={href} className={itemClass(pathname === href)}>
                                            <MethodBadge method={e.method} size="sm" />
                                            <span className="truncate">{e.title}</span>
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                ))}

                {query && groups.length === 0 && (
                    <p className="px-2.5 pt-6 text-sm text-muted">No endpoints match “{query}”.</p>
                )}
            </nav>
        </div>
    );
}