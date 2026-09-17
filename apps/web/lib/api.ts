/**
 * API client — apps/web
 *
 * Wrapper fetch type-safe pour les appels vers apps/api (Hono cote serveur).
 *
 * - credentials: 'include' → cookies session Auth.js propages automatiquement.
 * - Base URL depuis process.env.NEXT_PUBLIC_API_URL (vide si reverse-proxy Next).
 * - Validation Zod cote client : on parse la reponse pour detecter les drift
 *   de schema avant d'utiliser les donnees.
 * - Erreurs uniformisees via ApiError (status + code + message + details).
 */

import { z } from 'zod';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string | undefined;
  public readonly details: unknown;

  constructor(
    status: number,
    code: string | undefined,
    message: string,
    details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface FetchOptions<T> {
  method?: HttpMethod;
  body?: unknown;
  schema?: z.ZodType<T>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  cache?: RequestCache;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function api<T>(path: string, opts: FetchOptions<T> = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;

  const res = await fetch(url, {
    method: opts.method ?? 'GET',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(opts.headers ?? {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal,
    cache: opts.cache,
  });

  if (!res.ok) {
    let body: unknown = undefined;
    try {
      body = await res.json();
    } catch {
      // reponse non-JSON, on garde body=undefined
    }
    const errBody = body as { code?: string; message?: string } | undefined;
    throw new ApiError(
      res.status,
      errBody?.code,
      errBody?.message ?? `API error ${res.status}`,
      body
    );
  }

  const data = (await res.json()) as T;
  return opts.schema ? opts.schema.parse(data) : data;
}

/** Helper GET. */
export function get<T>(path: string, schema?: z.ZodType<T>) {
  return api<T>(path, { method: 'GET', schema });
}

/** Helper POST. */
export function post<T>(path: string, body?: unknown, schema?: z.ZodType<T>) {
  return api<T>(path, { method: 'POST', body, schema });
}