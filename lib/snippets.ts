import type { HttpMethod } from './endpoints/types';

export type SnippetLang = 'fetch' | 'axios' | 'curl';

export const SNIPPET_LANGS: { id: SnippetLang; label: string }[] = [
  { id: 'fetch', label: 'fetch' },
  { id: 'axios', label: 'axios' },
  { id: 'curl', label: 'cURL' },
];

/** Fills :params and appends non-empty query values. Unfilled params stay as :name. */
export function buildPath(template: string, params: Record<string, string>, query: Record<string, string>) {
  const filled = template.replace(/:(\w+)/g, (_, name: string) => {
    const value = params[name]?.trim();
    return value ? encodeURIComponent(value) : `:${name}`;
  });
  const qs = new URLSearchParams(Object.entries(query).filter(([, v]) => v.trim() !== '')).toString();
  return qs ? `${filled}?${qs}` : filled;
}

interface SnippetInput {
  method: HttpMethod;
  path: string;
  body: unknown;
  auth: boolean;
  /** The success response is 204: there is no JSON to read */
  noContent: boolean;
  baseUrl: string;
}

const pad = (text: string, spaces: number) =>
  text
    .split('\n')
    .map((line, i) => (i === 0 ? line : ' '.repeat(spaces) + line))
    .join('\n');

// Snippets never contain the real token: they use a variable / env placeholder.
export function buildSnippets({ method, path, body, auth, noContent, baseUrl }: SnippetInput): Record<SnippetLang, string> {
  const hasBody = body !== undefined;
  const json = hasBody ? JSON.stringify(body, null, 2) : '';
  const url = '`${API_URL}' + path + '`';

  // ── fetch ─────────────────────────────────────────────
  const fetchHeaders = [
    hasBody ? "'Content-Type': 'application/json'" : null,
    auth ? 'Authorization: `Bearer ${accessToken}`' : null,
  ].filter(Boolean);

  const fetchLines = [`const res = await fetch(${url}, {`, `  method: '${method}',`];
  if (fetchHeaders.length) fetchLines.push(`  headers: {`, ...fetchHeaders.map((h) => `    ${h},`), `  },`);
  if (hasBody) fetchLines.push(`  body: JSON.stringify(${pad(json, 2)}),`);
  fetchLines.push(`});`);
  fetchLines.push(
    noContent
      ? `if (!res.ok) throw await res.json(); // success has no body (204)`
      : `const data = await res.json();\nif (!res.ok) throw data; // { error, code? } or { errors: [...] }`,
  );

  // ── axios ─────────────────────────────────────────────
  const m = method.toLowerCase();
  const headersCfg = auth ? 'headers: { Authorization: `Bearer ${accessToken}` }' : '';
  let axiosCall: string;
  if (method === 'GET' || (method === 'DELETE' && !hasBody)) {
    axiosCall = `axios.${m}(${url}${headersCfg ? `, { ${headersCfg} }` : ''})`;
  } else if (method === 'DELETE') {
    axiosCall = `axios.delete(${url}, {\n  data: ${pad(json, 2)},${headersCfg ? `\n  ${headersCfg},` : ''}\n})`;
  } else {
    const payload = hasBody ? pad(json, 0) : 'null';
    axiosCall = `axios.${m}(${url}, ${payload}${headersCfg ? `, { ${headersCfg} }` : ''})`;
  }
  const axiosCode = noContent
    ? `await ${axiosCall};\n// axios throws on 4xx/5xx: read err.response.data`
    : `const { data } = await ${axiosCall};\n// axios throws on 4xx/5xx: read err.response.data`;

  // ── cURL ──────────────────────────────────────────────
  const shellQuote = (s: string) => `'${s.replace(/'/g, `'\\''`)}'`;
  const curlParts = [`curl -X ${method} ${shellQuote(`${baseUrl || 'http://localhost:8080'}${path}`)}`];
  if (auth) curlParts.push(`  -H "Authorization: Bearer $ACCESS_TOKEN"`);
  if (hasBody) curlParts.push(`  -H 'Content-Type: application/json'`, `  -d ${shellQuote(JSON.stringify(body))}`);

  return {
    fetch: `// API_URL = your backend URL, accessToken = from Verify the login code\n${fetchLines.join('\n')}`,
    axios: `import axios from 'axios';\n\n${axiosCode}`,
    curl: curlParts.join(' \\\n'),
  };
}
