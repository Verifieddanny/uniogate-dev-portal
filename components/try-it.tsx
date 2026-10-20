'use client';

import { useCallback, useMemo, useState } from 'react';
import type { Endpoint, Field } from '@/lib/endpoints/types';
import { isLive, useEnv } from '@/lib/env-context';
import { SNIPPET_LANGS, buildPath, buildSnippets, type SnippetLang } from '@/lib/snippets';
import { CodeBlock } from './code-block';
import { MethodBadge } from './method-badge';
import { statusTone } from './response-list';

interface Result {
  source: 'live' | 'simulated';
  status: number;
  ms: number;
  body: unknown;
  label?: string;
}

const initialValues = (fields?: Field[]) =>
  Object.fromEntries((fields ?? []).map((f) => [f.name, f.example === undefined ? '' : String(f.example)]));

const inputClass =
  'w-full rounded-[10px] border border-line bg-white px-3 py-2 font-mono text-sm outline-none transition focus:border-brand';

function ParamInputs({
  title,
  fields,
  values,
  onChange,
}: {
  title: string;
  fields: Field[];
  values: Record<string, string>;
  onChange: (name: string, value: string) => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold tracking-wider text-muted uppercase">{title}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <label key={f.name} className="block">
            <span className="flex items-center gap-1.5 font-mono text-xs text-navy">
              {f.name}
              {f.required && <span className="text-brand">*</span>}
            </span>
            <input
              value={values[f.name] ?? ''}
              onChange={(e) => onChange(f.name, e.target.value)}
              placeholder={f.required ? 'required' : 'optional'}
              className={`mt-1 ${inputClass}`}
            />
          </label>
        ))}
      </div>
    </div>
  );
}

function hasAccessToken(body: unknown): body is { accessToken: string } {
  return typeof body === 'object' && body !== null && typeof (body as { accessToken?: unknown }).accessToken === 'string';
}

export function TryIt({ endpoint }: { endpoint: Endpoint }) {
  const { env, update } = useEnv();
  const live = isLive(env);
  const needsToken = endpoint.auth !== 'none';
  const takesBody = endpoint.method !== 'GET' && endpoint.body !== undefined;
  const noContent = endpoint.responses[0]?.status === 204;

  const exampleText = useMemo(
    () => (endpoint.exampleBody === undefined ? '{}' : JSON.stringify(endpoint.exampleBody, null, 2)),
    [endpoint],
  );

  const [pathValues, setPathValues] = useState(() => initialValues(endpoint.pathParams));
  const [queryValues, setQueryValues] = useState(() => initialValues(endpoint.query));
  const [bodyText, setBodyText] = useState(exampleText);
  const [scenario, setScenario] = useState(endpoint.responses[0]?.id ?? '');
  const [lang, setLang] = useState<SnippetLang>('fetch');
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);
  const [tokenSaved, setTokenSaved] = useState(false);

  // Parse once per edit: drives validation, the request and the snippets
  const parsed = useMemo((): { ok: true; value: unknown } | { ok: false; error: string } => {
    if (!takesBody || !bodyText.trim()) return { ok: true, value: undefined };
    try {
      return { ok: true, value: JSON.parse(bodyText) };
    } catch (e) {
      return { ok: false, error: (e as Error).message };
    }
  }, [bodyText, takesBody]);
  const bodyValue = parsed.ok ? parsed.value : undefined;

  const missingParams = (endpoint.pathParams ?? []).filter((p) => !pathValues[p.name]?.trim()).map((p) => p.name);
  const path = buildPath(endpoint.path, pathValues, queryValues);
  const canSend = !sending && parsed.ok && missingParams.length === 0;

  const snippets = useMemo(
    () => buildSnippets({ method: endpoint.method, path, body: bodyValue, auth: needsToken, noContent, baseUrl: env.baseUrl }),
    [endpoint.method, path, bodyValue, needsToken, noContent, env.baseUrl],
  );

  const send = useCallback(async () => {
    if (!canSend) return;
    setSending(true);
    setNetworkError(null);
    setTokenSaved(false);
    const started = performance.now();

    try {
      if (!live) {
        const r = endpoint.responses.find((x) => x.id === scenario) ?? endpoint.responses[0];
        await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400));
        if (r) setResult({ source: 'simulated', status: r.status, ms: Math.round(performance.now() - started), body: r.body, label: r.label });
        return;
      }

      const headers: Record<string, string> = { Accept: 'application/json' };
      if (bodyValue !== undefined) headers['Content-Type'] = 'application/json';
      if (needsToken && env.token) headers.Authorization = `Bearer ${env.token}`;

      const res = await fetch(`${env.baseUrl}${path}`, {
        method: endpoint.method,
        headers,
        body: bodyValue !== undefined ? JSON.stringify(bodyValue) : undefined,
      });
      const text = await res.text();
      let body: unknown = text || null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        /* not JSON (e.g. an HTML error page): show it as text */
      }
      // Match the response to a documented case, so the "what to do" advice shows for live calls too
      const known = endpoint.responses.find((r) => r.status === res.status);
      setResult({ source: 'live', status: res.status, ms: Math.round(performance.now() - started), body, label: known?.label });
    } catch (err) {
      setResult(null);
      setNetworkError(err instanceof Error ? err.message : String(err));
    } finally {
      setSending(false);
    }
  }, [canSend, live, endpoint, scenario, bodyValue, needsToken, env.token, env.baseUrl, path]);

  const activeCase = result?.source === 'simulated' ? endpoint.responses.find((r) => r.id === scenario) : undefined;

  return (
    <div className="space-y-4">
      {/* ── Request ─────────────────────────────────────── */}
      <div className="overflow-hidden rounded-card border border-line bg-white">
        <div className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-4">
          <MethodBadge method={endpoint.method} />
          <code className="min-w-0 flex-1 truncate font-mono text-sm text-navy">
            <span className="text-muted">{live ? env.baseUrl : '{API_URL}'}</span>
            {path}
          </code>
          <button
            onClick={send}
            disabled={!canSend}
            className="rounded-full bg-brand px-5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>

        <div className="space-y-5 px-5 py-5">
          {live ? (
            <p className="rounded-[10px] bg-emerald-50 px-3.5 py-2.5 text-sm text-emerald-800">
              <strong>Live.</strong> This sends a real request to <code className="font-mono">{env.baseUrl}</code>. Real data changes,
              and real money for sales and withdrawals.
            </p>
          ) : (
            <label className="flex flex-wrap items-center gap-3 rounded-[10px] bg-lavender px-3.5 py-2.5 text-sm text-navy">
              <span>
                <strong>Simulated.</strong> Nothing leaves your browser. Pretend the server answers with:
              </span>
              <select
                value={scenario}
                onChange={(e) => setScenario(e.target.value)}
                className="rounded-lg border border-line bg-white px-2.5 py-1.5 text-sm outline-none focus:border-brand"
              >
                {endpoint.responses.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.status} · {r.label}
                  </option>
                ))}
              </select>
            </label>
          )}

          {live && needsToken && !env.token && (
            <p className="rounded-[10px] bg-amber-50 px-3.5 py-2.5 text-sm text-amber-800">
              This endpoint needs an access token. Add one in the connection panel (top right), or run Verify the login
              code here and click “Use this access token”.
            </p>
          )}

          {endpoint.pathParams && (
            <ParamInputs
              title="Path parameters"
              fields={endpoint.pathParams}
              values={pathValues}
              onChange={(n, v) => setPathValues((p) => ({ ...p, [n]: v }))}
            />
          )}

          {endpoint.query && (
            <ParamInputs
              title="Query parameters"
              fields={endpoint.query}
              values={queryValues}
              onChange={(n, v) => setQueryValues((p) => ({ ...p, [n]: v }))}
            />
          )}

          {takesBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold tracking-wider text-muted uppercase">Request body (JSON)</p>
                {bodyText !== exampleText && (
                  <button onClick={() => setBodyText(exampleText)} className="text-xs font-semibold text-brand hover:underline">
                    Reset to example
                  </button>
                )}
              </div>
              <textarea
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    void send();
                  }
                }}
                spellCheck={false}
                rows={Math.min(16, Math.max(4, bodyText.split('\n').length + 1))}
                className={`block w-full resize-y rounded-[14px] border bg-navy p-4 font-mono text-[13px] leading-6 text-slate-100 outline-none transition ${
                  parsed.ok ? 'border-transparent focus:border-brand' : 'border-red-400'
                }`}
              />
              <p className="text-xs text-muted">
                {parsed.ok ? (
                  <>Edit freely. Press ⌘/Ctrl + Enter to send.</>
                ) : (
                  <span className="text-red-600">Invalid JSON: {parsed.error}</span>
                )}
              </p>
            </div>
          )}

          {missingParams.length > 0 && (
            <p className="text-xs text-red-600">Fill in: {missingParams.join(', ')}</p>
          )}
        </div>
      </div>

      {/* ── Response ────────────────────────────────────── */}
      {networkError && (
        <div className="rounded-card border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          <p className="font-semibold">Couldn’t reach {env.baseUrl}</p>
          <p className="mt-1 text-red-700">{networkError}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-red-700">
            <li>Is the backend running at that URL? (no trailing slash)</li>
            <li>Does the backend allow requests from this site (CORS)?</li>
            <li>This page is HTTPS: the browser blocks plain-HTTP backends other than localhost.</li>
          </ul>
        </div>
      )}

      {result && (
        <div className="overflow-hidden rounded-card border border-line bg-white">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-line px-5 py-3.5">
            <span className={`rounded-md px-2 py-0.5 font-mono text-sm font-semibold ring-1 ring-inset ${statusTone(result.status)}`}>
              {result.status}
            </span>
            {result.label && <span className="text-sm font-semibold text-navy">{result.label}</span>}
            <span className="ml-auto flex items-center gap-2 text-xs text-muted">
              <span className={`rounded-full px-2 py-0.5 font-medium ${result.source === 'live' ? 'bg-emerald-50 text-emerald-700' : 'bg-lavender text-navy'}`}>
                {result.source === 'live' ? 'Live' : 'Simulated'}
              </span>
              {result.ms} ms
            </span>
          </div>

          <div className="space-y-4 p-5">
            {activeCase && (
              <p className="text-sm leading-6 text-ink/80">
                <span className="font-semibold text-navy">What the app should do: </span>
                {activeCase.ui}
              </p>
            )}

            {result.body === null ? (
              <p className="rounded-[14px] bg-surface px-4 py-3 text-sm text-muted">No response body.</p>
            ) : (
              <CodeBlock
                title="Response body"
                code={typeof result.body === 'string' ? result.body : JSON.stringify(result.body, null, 2)}
              />
            )}

            {result.source === 'live' && hasAccessToken(result.body) && (
              <button
                onClick={() => {
                  if (hasAccessToken(result.body)) update({ token: result.body.accessToken });
                  setTokenSaved(true);
                }}
                disabled={tokenSaved}
                className="rounded-full border border-brand px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand-50 disabled:border-emerald-600 disabled:text-emerald-700"
              >
                {tokenSaved ? 'Saved ✓ Other endpoints will use it' : 'Use this access token'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Code ────────────────────────────────────────── */}
      <div className="space-y-2">
        <div role="tablist" className="flex gap-1">
          {SNIPPET_LANGS.map((l) => (
            <button
              key={l.id}
              role="tab"
              aria-selected={lang === l.id}
              onClick={() => setLang(l.id)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                lang === l.id ? 'bg-navy font-semibold text-white' : 'text-muted hover:text-navy'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        <CodeBlock title="Copy into the app" code={snippets[lang]} />
      </div>
    </div>
  );
}
