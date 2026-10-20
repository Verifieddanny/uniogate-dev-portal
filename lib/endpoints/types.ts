export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/** none = public · user = any signed-in user · owner = business owner only */
export type AuthLevel = 'none' | 'user' | 'owner';

export interface Field {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  required: boolean;
  description: string;
  example?: unknown;
  rules?: string;
}

export interface ResponseCase {
  id: string;
  status: number;
  label: string;
  /** When this happens, in plain words */
  when: string;
  /** What the app should do or show */
  ui: string;
  body: unknown;
}

export interface Endpoint {
  slug: string;
  group: string;
  method: HttpMethod;
  path: string;
  title: string;
  auth: AuthLevel;
  summary: string;
  whenToCall: string;
  pathParams?: Field[];
  query?: Field[];
  body?: Field[];
  exampleBody?: unknown;
  responses: ResponseCase[];
  notes?: string[];
}

export interface Group {
  id: string;
  title: string;
  description: string;
}