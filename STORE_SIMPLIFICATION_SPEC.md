# Store Simplification Specification

## Problem Statement
The assessment store is overcomplicated. Simplify it dramatically.

## Goals
1. **Simple registry pattern** - Reusable get/set/update collections
2. **Clear naming** - Methods that make sense (`get`, `set`, `update`, `tryAdd`)
3. **Fewer abstractions** - Direct state operations
4. **Keep working** - All 216 tests pass

## Core Pattern: Simple Registry

```typescript
interface Registry<T> {
  // Core operations
  get(key: string): T | undefined
  set(key: string, value: T): void
  update(key: string, value: T): void  // overwrites existing
  tryAdd(key: string, value: T): boolean  // only if not exists
  getOrAdd(key: string, factory: () => T): T  // get or create with factory
  has(key: string): boolean
  delete(key: string): boolean
  clear(): void
  
  // Collection access
  keys(): string[]
  values(): T[]
  entries(): [string, T][]
  
  // Direct data access for persistence/serialization
  readonly data: Record<string, T>  // underlying storage object
  
  // Observable support (for Zustand integration)
  subscribe?(listener: (data: Record<string, T>) => void): () => void
}
```

### Design Considerations

#### 1. **Underlying Storage**: Plain Object
```typescript
class RegistryImpl<T> implements Registry<T> {
  constructor(public readonly data: Record<string, T> = {}) {}
  
  set(key: string, value: T): void {
    this.data[key] = value;
    this.notifySubscribers?.();
  }
  
  // Registry is just a helper - data can be serialized directly
  toJSON() { return this.data; }
  fromJSON(obj: Record<string, T>) { Object.assign(this.data, obj); }
}
```

#### 2. **Zustand Integration**: Registry Updates Store
```typescript
// Registry notifies Zustand when data changes
const facts = new Registry(get().factsData);
facts.subscribe((newData) => set({ factsData: newData }));

// Or simpler: Registry directly updates Zustand
facts.set('os', 'windows'); // triggers set({ factsData: { ...factsData, os: 'windows' }})
```

### Usage Examples
```typescript
// Registry with observable Zustand integration
const facts = createRegistry(get().factsData, (newData) => set({ factsData: newData }));

// Get or create with factory function
const userPrefs = settings.getOrAdd('user_preferences', () => ({ theme: 'dark' }))

// Direct data access for persistence
localStorage.setItem('facts', JSON.stringify(facts.data));

// Load from persistence
const savedFacts = JSON.parse(localStorage.getItem('facts') || '{}');
facts.fromJSON(savedFacts);
```

## Store Integration Strategy

### Current Zustand Pattern
```typescript
// Current: Complex facts slice + enhanced actions
const store = create(persist((set, get) => ({
  factsProfile: { facts: {}, lastUpdated: new Date() },
  factsActions: { injectFact: (id, value, metadata) => {/* complex logic */} }
})));
```

### Simplified Registry Pattern  
```typescript
// New: Simple registries with Zustand reactivity
const store = create(persist((set, get) => ({
  // Raw data (persisted to localStorage)
  factsData: {} as Record<string, any>,
  answersData: {} as Record<string, any>,
  scoresData: {} as Record<string, number>,
  
  // Registry helpers (not persisted, recreated on load)
  facts: createRegistry(get().factsData, (data) => set({ factsData: data })),
  answers: createRegistry(get().answersData, (data) => set({ answersData: data })),
  scores: createRegistry(get().scoresData, (data) => set({ scoresData: data })),
})));
```

## Apply Registry Pattern To Everything

### Facts Registry
```typescript
// Instead of: injectFact(factId, value, metadata)
facts.set('os_detected', 'windows')
facts.get('browser_detected') // 'chrome'
facts.getOrAdd('device_capabilities', () => detectCapabilities())
```

### Answers Registry  
```typescript
answers.set('password_manager', 'yes')
answers.get('two_factor_auth') // 'hardware'
answers.getOrAdd('security_score', () => calculateScore())
```

### Scores Registry
```typescript
scores.set('overall', 85)
scores.getOrAdd('domain_privacy', () => calculatePrivacyScore())
```

## What Changes
- ❌ Remove `injectFact` - use `facts.set()`
- ❌ Remove complex metadata, confidence, establishedAt  
- ❌ Remove dual-layer facts management
- ❌ Remove enhanced actions complexity
- ✅ Simple registries with clear methods
- ✅ **Registry wraps plain object** - easy JSON serialization
- ✅ **Observable integration** - Registry updates trigger Zustand reactivity
- ✅ **Separation of data/helpers** - Data persists, registries recreated
- ✅ `getOrAdd()` for lazy initialization patterns

## Benefits of This Design

### 1. **Perfect Persistence**
- Registry `.data` is plain object → direct JSON.stringify/parse
- Zustand persist middleware works seamlessly  
- No complex serialization logic needed

### 2. **Reactivity Built-In**
- Registry updates → Zustand set() → React re-renders
- No manual subscription management
- Same reactive behavior as current store

### 3. **Simple Mental Model**
- Registry = helper methods around a plain object
- Object = the actual data (what gets saved)
- Zustand = reactivity and component updates

## Implementation Plan

1. **Create Registry utility** - Generic foundation class/interface
2. **Replace facts system** - Use `Registry<any>` instead of complex slice
3. **Replace other collections** - Apply same pattern to answers, scores, settings
4. **Use `getOrAdd` for lazy patterns** - Score calculations, device detection, etc.
5. **Validate with tests** - All 216 tests must pass

## Success Criteria
- ✅ All 216 tests pass
- ✅ Much simpler code (fewer lines, clearer intent)  
- ✅ Reusable registry pattern throughout
- ✅ Breaking changes are fine if they reduce complexity

---

**Result**: Store becomes a collection of simple registries instead of over-engineered abstractions.