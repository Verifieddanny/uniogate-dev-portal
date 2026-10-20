import type { HttpMethod } from '@/lib/endpoints/types';

const STYLES: Record<HttpMethod, string> = {
  GET: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  POST: 'bg-brand-50 text-brand ring-brand/20',
  PUT: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  PATCH: 'bg-amber-50 text-amber-700 ring-amber-600/20',
  DELETE: 'bg-red-50 text-red-700 ring-red-600/20',
};

export function MethodBadge({ method, size = 'md' }: { method: HttpMethod; size?: 'sm' | 'md' }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-md font-mono font-semibold ring-1 ring-inset ${
        size === 'sm' ? 'w-13 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs'
      } ${STYLES[method]}`}
    >
      {method}
    </span>
  );
}