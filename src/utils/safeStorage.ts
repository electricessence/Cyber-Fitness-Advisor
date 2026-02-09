class MemoryStorage implements Storage {
  private store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

const memoryStorage = new MemoryStorage();

/**
 * Lazily resolve the current storage backend.
 * Validates that the storage actually works before returning it,
 * falling back to in-memory storage when localStorage is broken
 * (e.g., jsdom with invalid --localstorage-file, private browsing, SSR).
 */
function getCurrentStorage(): Storage {
  try {
    if (typeof window !== 'undefined' && window.localStorage
        && typeof window.localStorage.setItem === 'function') {
      return window.localStorage;
    }
  } catch {
    // localStorage unavailable (private browsing, SSR, etc.)
  }
  return memoryStorage;
}

/** Lazy-delegating Storage wrapper — always calls through to the current environment's storage. */
export const safeStorage: Storage = {
  get length() { return getCurrentStorage().length; },
  clear() { getCurrentStorage().clear(); },
  getItem(key: string) { return getCurrentStorage().getItem(key); },
  key(index: number) { return getCurrentStorage().key(index); },
  removeItem(key: string) { getCurrentStorage().removeItem(key); },
  setItem(key: string, value: string) { getCurrentStorage().setItem(key, value); },
};

export function readStorage(key: string): string | null {
  try {
    return safeStorage.getItem(key);
  } catch (error) {
    if (import.meta.env?.MODE === 'development') {
      console.warn('Unable to read storage key', key, error);
    }
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    safeStorage.setItem(key, value);
  } catch (error) {
    if (import.meta.env?.MODE === 'development') {
      console.warn('Unable to write storage key', key, error);
    }
  }
}

export function removeStorage(key: string): void {
  try {
    safeStorage.removeItem(key);
  } catch (error) {
    if (import.meta.env?.MODE === 'development') {
      console.warn('Unable to remove storage key', key, error);
    }
  }
}

export function readJSONStorage<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}
