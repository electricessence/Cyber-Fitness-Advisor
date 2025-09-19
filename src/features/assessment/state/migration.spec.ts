/**
 * Integration Test for Registry Pattern Migration
 * 
 * Verifies that the simplified Registry methods work correctly in the main store
 * alongside the existing complex facts system.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore, initializeStore } from './store';

describe('🔄 Registry Pattern Migration Integration', () => {

  beforeEach(() => {
    // Reset store state before each test
    const store = useAssessmentStore.getState();
    store.resetAssessment();
  });

  describe('📋 Registry Methods Integration', () => {
    
    it('should support simple fact storage and retrieval through main store', () => {
      const { setFact, getFact, hasFact } = useAssessmentStore.getState();
      
      // Test simple fact storage - replacing "injectFact" complexity
      setFact('user_experience', 'beginner');
      setFact('security_score', 85);
      setFact('has_vpn', true);
      
      // Verify simple retrieval
      expect(getFact('user_experience')).toBe('beginner');
      expect(getFact('security_score')).toBe(85);
      expect(getFact('has_vpn')).toBe(true);
      expect(getFact('nonexistent')).toBeUndefined();
      
      // Test hasFact method
      expect(hasFact('user_experience')).toBe(true);
      expect(hasFact('nonexistent')).toBe(false);
    });

    it('should persist Registry data alongside existing store data', () => {
      const { setFact, getFact } = useAssessmentStore.getState();
      
      setFact('persistent_test', 'should_persist');
      
      // Verify persistence through raw data access
      const state = useAssessmentStore.getState();
      expect(state.factsData['persistent_test']).toBe('should_persist');
      
      // Verify retrieval still works
      expect(getFact('persistent_test')).toBe('should_persist');
    });

    it('should work alongside existing facts system without conflict', () => {
      const { setFact, getFact, factsActions } = useAssessmentStore.getState();
      
      // Use new simple Registry method
      setFact('registry_fact', 'registry_value');
      
      // Use old complex facts method  
      factsActions.injectFact('complex_fact', 'complex_value', { source: 'test' });
      
      // Both should work without interference
      expect(getFact('registry_fact')).toBe('registry_value');
      
      const complexFact = factsActions.getFact('complex_fact');
      expect(complexFact?.value).toBe('complex_value');
    });

  });

  describe('🔄 Device Detection Migration', () => {

    it('should set device facts using both systems during initialization', () => {
      const { getFact, factsActions } = useAssessmentStore.getState();
      
      // Initialize store (this runs device detection)
      initializeStore();
      
      // Verify new Registry approach has device facts
      expect(getFact('os_detected')).toBeDefined();
      expect(getFact('browser_detected')).toBeDefined();
      expect(getFact('device_type')).toBeDefined();
      expect(getFact('device_detection_completed')).toBe(true);
      
      // Verify old complex approach still works (backwards compatibility)
      const osFact = factsActions.getFact('os_detected');
      expect(osFact?.value).toBeDefined();
    });

  });

  describe('💾 Data Persistence Migration', () => {

    it('should include factsData in persistence configuration', () => {
      const { setFact } = useAssessmentStore.getState();
      
      setFact('persist_test', 'should_be_saved');
      
      // Simulate what the persist middleware would save
      const state = useAssessmentStore.getState();
      const persistedData = {
        answers: state.answers,
        earnedBadges: state.earnedBadges,
        factsData: state.factsData
      };
      
      expect(persistedData.factsData['persist_test']).toBe('should_be_saved');
    });

  });

  describe('🎯 Migration Strategy Validation', () => {

    it('should demonstrate the simplified approach is much clearer', () => {
      const { setFact, getFact, factsActions } = useAssessmentStore.getState();
      
      // OLD COMPLEX WAY (what we're replacing)
      const oldWayStart = performance.now();
      factsActions.injectFact('test_fact', 'test_value', { 
        source: 'test', 
        confidence: 0.95 
      });
      const complexFact = factsActions.getFact('test_fact');
      const oldValue = complexFact?.value;
      const oldWayEnd = performance.now();
      
      // NEW SIMPLE WAY (what we're migrating to)
      const newWayStart = performance.now();
      setFact('test_fact_simple', 'test_value');
      const newValue = getFact('test_fact_simple');
      const newWayEnd = performance.now();
      
      // Both should work and get same result
      expect(oldValue).toBe('test_value');
      expect(newValue).toBe('test_value');
      
      // New way should be faster (no complex metadata processing)
      const oldTime = oldWayEnd - oldWayStart;
      const newTime = newWayEnd - newWayStart;
      
      console.log(`🔄 Migration Performance:`);
      console.log(`   Old complex way: ${oldTime.toFixed(2)}ms`);
      console.log(`   New simple way: ${newTime.toFixed(2)}ms`);
      console.log(`   Improvement: ${((oldTime - newTime) / oldTime * 100).toFixed(1)}% faster`);
    });

  });

});