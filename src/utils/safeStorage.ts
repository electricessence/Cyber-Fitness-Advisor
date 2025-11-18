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

const browserStorage = typeof window !== 'undefined' ? window.localStorage : null;

export const safeStorage: Storage = browserStorage ?? memoryStorage;

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
