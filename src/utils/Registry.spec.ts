import { describe, it, expect, beforeEach } from 'vitest';
import { RegistryImpl, createRegistry, createZustandRegistry } from './Registry';

describe('Registry Pattern', () => {
  let registry: RegistryImpl<string>;

  beforeEach(() => {
    registry = new RegistryImpl<string>();
  });

  describe('Basic Operations', () => {
    it('should get and set values', () => {
      registry.set('key1', 'value1');
      expect(registry.get('key1')).toBe('value1');
      expect(registry.get('nonexistent')).toBeUndefined();
    });

    it('should check if keys exist', () => {
      registry.set('existing', 'value');
      expect(registry.has('existing')).toBe(true);
      expect(registry.has('nonexistent')).toBe(false);
    });

    it('should try add only if not exists', () => {
      const added1 = registry.tryAdd('new', 'value1');
      const added2 = registry.tryAdd('new', 'value2');
      
      expect(added1).toBe(true);
      expect(added2).toBe(false);
      expect(registry.get('new')).toBe('value1');
    });

    it('should get or add with factory', () => {
      const factoryCalls: string[] = [];
      const factory = () => {
        factoryCalls.push('called');
        return 'factory-value';
      };

      const value1 = registry.getOrAdd('test', factory);
      const value2 = registry.getOrAdd('test', factory);

      expect(value1).toBe('factory-value');
      expect(value2).toBe('factory-value');
      expect(factoryCalls).toHaveLength(1); // Factory called only once
    });

    it('should delete values', () => {
      registry.set('toDelete', 'value');
      expect(registry.has('toDelete')).toBe(true);
      
      const deleted = registry.delete('toDelete');
      expect(deleted).toBe(true);
      expect(registry.has('toDelete')).toBe(false);
      
      const deletedAgain = registry.delete('toDelete');
      expect(deletedAgain).toBe(false);
    });

    it('should clear all values', () => {
      registry.set('key1', 'value1');
      registry.set('key2', 'value2');
      
      registry.clear();
      
      expect(registry.keys()).toHaveLength(0);
      expect(registry.has('key1')).toBe(false);
      expect(registry.has('key2')).toBe(false);
    });
  });

  describe('Collection Methods', () => {
    beforeEach(() => {
      registry.set('a', 'valueA');
      registry.set('b', 'valueB');
      registry.set('c', 'valueC');
    });

    it('should return keys', () => {
      const keys = registry.keys();
      expect(keys).toEqual(['a', 'b', 'c']);
    });

    it('should return values', () => {
      const values = registry.values();
      expect(values).toEqual(['valueA', 'valueB', 'valueC']);
    });

    it('should return entries', () => {
      const entries = registry.entries();
      expect(entries).toEqual([
        ['a', 'valueA'],
        ['b', 'valueB'],
        ['c', 'valueC']
      ]);
    });
  });

  describe('Serialization', () => {
    it('should serialize to JSON', () => {
      registry.set('key1', 'value1');
      registry.set('key2', 'value2');
      
      const json = registry.toJSON();
      expect(json).toEqual({
        key1: 'value1',
        key2: 'value2'
      });
    });

    it('should deserialize from JSON', () => {
      const data = { key1: 'value1', key2: 'value2' };
      registry.fromJSON(data);
      
      expect(registry.get('key1')).toBe('value1');
      expect(registry.get('key2')).toBe('value2');
    });
  });

  describe('Change Notifications', () => {
    it('should notify on changes', () => {
      const changes: Record<string, string>[] = [];
      const notifyingRegistry = new RegistryImpl<string>({}, (data) => {
        changes.push({ ...data });
      });

      notifyingRegistry.set('key1', 'value1');
      notifyingRegistry.set('key2', 'value2');
      notifyingRegistry.delete('key1');

      expect(changes).toHaveLength(3);
      expect(changes[0]).toEqual({ key1: 'value1' });
      expect(changes[1]).toEqual({ key1: 'value1', key2: 'value2' });
      expect(changes[2]).toEqual({ key2: 'value2' });
    });
  });

  describe('Factory Functions', () => {
    it('should create registry with createRegistry', () => {
      const changes: any[] = [];
      const reg = createRegistry({ initial: 'value' }, (data) => changes.push(data));
      
      expect(reg.get('initial')).toBe('value');
      
      reg.set('new', 'test');
      expect(changes).toHaveLength(1);
    });

    it('should create Zustand-integrated registry', () => {
      let storeData: Record<string, string> = { existing: 'value' };
      const setData = (newData: Record<string, string>) => {
        storeData = { ...newData };
      };
      
      const reg = createZustandRegistry(() => storeData, setData);
      
      expect(reg.get('existing')).toBe('value');
      
      reg.set('new', 'test');
      expect(storeData).toEqual({ existing: 'value', new: 'test' });
    });
  });
});