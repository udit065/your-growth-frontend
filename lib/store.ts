/**
 * Offline-first entries store.
 *
 * Everything is cached on the device, so screens render instantly from the cache.
 * Changes are applied locally right away and queued; the queue is flushed to the
 * server in the background, and the cache is then refreshed from the server.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSyncExternalStore } from 'react';
import { api, ApiError, type Entry } from './api';

export type { Entry };

type PendingOp = { type: 'put'; response: string } | { type: 'delete' };

export type ReminderSettings = { enabled: boolean; hour: number; minute: number };

type State = {
  hydrated: boolean;
  entries: Record<string, Entry>;
  pending: Record<string, PendingOp>;
  reminder: ReminderSettings;
  syncing: boolean;
  lastSyncedAt: number | null;
  error: string | null;
};

type Persisted = Pick<State, 'entries' | 'pending' | 'reminder' | 'lastSyncedAt'>;

const STORAGE_KEY = 'your-growth:v1';

let state: State = {
  hydrated: false,
  entries: {},
  pending: {},
  reminder: { enabled: true, hour: 21, minute: 0 },
  syncing: false,
  lastSyncedAt: null,
  error: null,
};

const listeners = new Set<() => void>();
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function persist() {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const data: Persisted = {
      entries: state.entries,
      pending: state.pending,
      reminder: state.reminder,
      lastSyncedAt: state.lastSyncedAt,
    };
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(() => {});
  }, 150);
}

function setState(patch: Partial<State>) {
  state = { ...state, ...patch };
  if (
    state.hydrated &&
    ('entries' in patch || 'pending' in patch || 'reminder' in patch || 'lastSyncedAt' in patch)
  ) {
    persist();
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getState() {
  return state;
}

/** Select a slice of state. The selector must return a stable reference (no new objects). */
export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state)
  );
}

export const useEntries = () => useStore((s) => s.entries);

// ---------- lifecycle ----------

let hydrating: Promise<void> | null = null;

export function hydrate() {
  if (!hydrating) {
    hydrating = (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const saved = JSON.parse(raw) as Partial<Persisted>;
          state = {
            ...state,
            entries: saved.entries ?? {},
            pending: saved.pending ?? {},
            reminder: { ...state.reminder, ...saved.reminder },
            lastSyncedAt: saved.lastSyncedAt ?? null,
          };
        }
      } catch {
        // Corrupt cache: start fresh, the server is the source of truth.
      }
      setState({ hydrated: true });
    })();
  }
  return hydrating;
}

// ---------- sync ----------

let running: Promise<void> | null = null;
let rerun = false;

function withoutKey<T>(obj: Record<string, T>, key: string) {
  const next = { ...obj };
  delete next[key];
  return next;
}

async function flushPending() {
  for (const [date, op] of Object.entries(state.pending)) {
    try {
      if (op.type === 'put') await api.put(date, op.response);
      else await api.remove(date);
    } catch (e) {
      // The server rejected this change outright (e.g. validation): drop it.
      // Network/server errors are re-thrown so the op stays queued.
      if (!(e instanceof ApiError && e.status >= 400 && e.status < 500)) throw e;
    }
    // Only clear it if it wasn't changed again while the request was in flight.
    if (state.pending[date] === op) setState({ pending: withoutKey(state.pending, date) });
  }
}

async function pull() {
  const list = await api.list();
  const entries: Record<string, Entry> = {};
  for (const e of list) entries[e.date] = { date: e.date, response: e.response, updatedAt: e.updatedAt };
  // Local changes that haven't reached the server yet win.
  for (const [date, op] of Object.entries(state.pending)) {
    if (op.type === 'put') entries[date] = { ...entries[date], date, response: op.response };
    else delete entries[date];
  }
  setState({ entries, lastSyncedAt: Date.now(), error: null });
}

export function sync(): Promise<void> {
  if (running) {
    rerun = true;
    return running;
  }
  running = (async () => {
    await hydrate();
    setState({ syncing: true });
    try {
      do {
        rerun = false;
        await flushPending();
        await pull();
      } while (rerun);
    } catch (e) {
      setState({ error: e instanceof Error ? e.message : 'Sync failed' });
    } finally {
      running = null;
      setState({ syncing: false });
    }
  })();
  return running;
}

// ---------- mutations (instant, synced in the background) ----------

export function saveEntry(date: string, response: string) {
  const text = response.trim();
  if (!text) return;
  const prev = state.entries[date];
  setState({
    entries: { ...state.entries, [date]: { ...prev, date, response: text } },
    pending: { ...state.pending, [date]: { type: 'put', response: text } },
  });
  sync();
}

export function deleteEntry(date: string) {
  setState({
    entries: withoutKey(state.entries, date),
    pending: { ...state.pending, [date]: { type: 'delete' } },
  });
  sync();
}

export function setReminder(patch: Partial<ReminderSettings>) {
  setState({ reminder: { ...state.reminder, ...patch } });
}
