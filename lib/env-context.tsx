'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

export type Mode = 'simulated' | 'live';

export interface Env {
  mode: Mode;
  baseUrl: string;
  token: string;
}

const DEFAULT_ENV: Env = { mode: 'simulated', baseUrl: '', token: '' };
const PREFS_KEY = 'uniogate-dev-portal:prefs'; // mode + baseUrl, remembered
const TOKEN_KEY = 'uniogate-dev-portal:token'; // this tab only

interface EnvContextValue {
  env: Env;
  update: (patch: Partial<Env>) => void;
  ready: boolean;
}

const EnvContext = createContext<EnvContextValue | null>(null);

function read(storage: () => Storage, key: string): string | null {
  try {
    return storage().getItem(key);
  } catch {
    return null;
  }
}

function write(storage: () => Storage, key: string, value: string) {
  try {
    storage().setItem(key, value);
  } catch {
    /* private mode / blocked storage: keep it in memory only */
  }
}

export function EnvProvider({ children }: { children: React.ReactNode }) {
  const [env, setEnv] = useState<Env>(DEFAULT_ENV);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const prefs = read(() => localStorage, PREFS_KEY);
    const token = read(() => sessionStorage, TOKEN_KEY) ?? '';
    let saved: Partial<Env> = {};
    try {
      saved = prefs ? JSON.parse(prefs) : {};
    } catch {
      saved = {};
    }
    setEnv({ ...DEFAULT_ENV, ...saved, token });
    setReady(true);
  }, []);

  const update = useCallback((patch: Partial<Env>) => {
    setEnv((prev) => {
      const next = { ...prev, ...patch };
      write(() => localStorage, PREFS_KEY, JSON.stringify({ mode: next.mode, baseUrl: next.baseUrl }));
      write(() => sessionStorage, TOKEN_KEY, next.token);
      return next;
    });
  }, []);

  return <EnvContext.Provider value={{ env, update, ready }}>{children}</EnvContext.Provider>;
}

export function useEnv() {
  const ctx = useContext(EnvContext);
  if (!ctx) throw new Error('useEnv must be used inside <EnvProvider>');
  return ctx;
}

/** Live only counts when a backend URL is actually set */
export const isLive = (env: Env) => env.mode === 'live' && env.baseUrl.trim() !== '';