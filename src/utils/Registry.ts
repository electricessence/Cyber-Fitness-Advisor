/**
 * Simple Registry Pattern
 * 
 * A generic, observable collection that wraps a plain object for easy
 * serialization while providing helpful methods and Zustand integration.
 */

export interface Registry<T> {
  // Core operations
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  update(key: string, value: T): void;  // overwrites existing
  tryAdd(key: string, value: T): boolean;  // only if not exists
  getOrAdd(key: string, factory: () => T): T;  // get or create with factory
  has(key: string): boolean;
  delete(key: string): boolean;
  clear(): void;
  
  // Collection access
  keys(): string[];
  values(): T[];
  entries(): [string, T][];
  
  // Direct data access for persistence/serialization
  readonly data: Record<string, T>;
  
  // Serialization helpers
  toJSON(): Record<string, T>;
  fromJSON(obj: Record<string, T>): void;
}

export type RegistryChangeListener<T> = (data: Record<string, T>) => void;

/**
 * Registry implementation with optional change notifications
 */
export class RegistryImpl<T> implements Registry<T> {
  public readonly data: Record<string, T>;
  private changeListener?: RegistryChangeListener<T>;
  
  constructor(
    data: Record<string, T> = {},
    changeListener?: RegistryChangeListener<T>
  ) {
    this.data = data;
    this.changeListener = changeListener;
  }

  get(key: string): T | undefined {
    return this.data[key];
  }

  set(key: string, value: T): void {
    this.data[key] = value;
    this.notifyChange();
  }

  update(key: string, value: T): void {
    this.data[key] = value;  // Same as set for now
    this.notifyChange();
  }

  tryAdd(key: string, value: T): boolean {
    if (key in this.data) {
      return false;  // Already exists
    }
    this.data[key] = value;
    this.notifyChange();
    return true;
  }

  getOrAdd(key: string, factory: () => T): T {
    if (key in this.data) {
      return this.data[key];
    }
    const value = factory();
    this.data[key] = value;
    this.notifyChange();
    return value;
  }

  has(key: string): boolean {
    return key in this.data;
  }

  delete(key: string): boolean {
    if (!(key in this.data)) {
      return false;
    }
    delete this.data[key];
    this.notifyChange();
    return true;
  }

  clear(): void {
    const hadItems = Object.keys(this.data).length > 0;
    Object.keys(this.data).forEach(key => delete this.data[key]);
    if (hadItems) {
      this.notifyChange();
    }
  }

  keys(): string[] {
    return Object.keys(this.data);
  }

  values(): T[] {
    return Object.values(this.data);
  }

  entries(): [string, T][] {
    return Object.entries(this.data);
  }

  toJSON(): Record<string, T> {
    return { ...this.data };
  }

  fromJSON(obj: Record<string, T>): void {
    this.clear();
    Object.assign(this.data, obj);
    this.notifyChange();
  }

  private notifyChange(): void {
    this.changeListener?.(this.data);
  }
}

/**
 * Factory function for creating registries with Zustand integration
 */
export function createRegistry<T>(
  initialData: Record<string, T> = {},
  changeListener?: RegistryChangeListener<T>
): Registry<T> {
  return new RegistryImpl(initialData, changeListener);
}

/**
 * Factory function specifically for Zustand stores
 */
export function createZustandRegistry<T>(
  getData: () => Record<string, T>,
  setData: (data: Record<string, T>) => void
): Registry<T> {
  return new RegistryImpl(
    getData(),
    (newData) => setData({ ...newData })
  );
}