import type { Field } from '@/lib/endpoints/types';

export function FieldList({ fields }: { fields: Field[] }) {
  return (
    <ul className="divide-y divide-line overflow-hidden rounded-card border border-line bg-white">
      {fields.map((f) => (
        <li key={f.name} className="px-5 py-4">
          <div className="flex flex-wrap items-center gap-2">
            <code className="font-mono text-sm font-semibold text-navy">{f.name}</code>
            <span className="font-mono text-xs text-muted">{f.type}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                f.required ? 'bg-brand-50 text-brand' : 'bg-surface text-muted'
              }`}
            >
              {f.required ? 'Required' : 'Optional'}
            </span>
          </div>
          <p className="mt-1.5 text-sm leading-6 text-ink/80">{f.description}</p>
          {(f.rules || f.example !== undefined) && (
            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
              {f.rules && <span>{f.rules}</span>}
              {f.example !== undefined && (
                <span>
                  e.g. <code className="font-mono text-navy">{JSON.stringify(f.example)}</code>
                </span>
              )}
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}