import { API_URL } from './config';

export type Entry = {
  date: string;
  response: string;
  updatedAt?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number
  ) {
    super(message);
  }
}

// Render's free tier can take ~a minute to wake up, so be patient.
const TIMEOUT_MS = 70_000;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    if (res.status === 204) return undefined as T;
    const body = await res.json().catch(() => null);
    if (!res.ok) throw new ApiError(body?.message || `Request failed (${res.status})`, res.status);
    return body as T;
  } finally {
    clearTimeout(timer);
  }
}

export const api = {
  list: () => request<Entry[]>('/entries'),
  put: (date: string, response: string) =>
    request<Entry>(`/entries/${date}`, { method: 'PUT', body: JSON.stringify({ response }) }),
  remove: (date: string) => request<void>(`/entries/${date}`, { method: 'DELETE' }),
  wake: () => request<{ ok: boolean }>('/health').catch(() => null),
};
