/**
 * Test Suite for Simplified Assessment Store
 * 
 * Verifies the Registry pattern successfully replaces the complex facts system
 * with simple, intuitive get/set operations.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useSimplifiedStore, initializeSimplifiedStore } from './simplifiedStore';

describe('🔧 Simplified Assessment Store', () => {

  beforeEach(() => {
    // Reset store state before each test
    const store = useSimplifiedStore.getState();
    store.resetAssessment();
    initializeSimplifiedStore();
  });

  describe('📋 Registry Pattern Implementation', () => {
    
    it('should initialize with Registry instances properly', () => {
      const state = useSimplifiedStore.getState();
      
      expect(state.facts).toBeDefined();
      expect(state.answers).toBeDefined();
      expect(typeof state.facts.get).toBe('function');
      expect(typeof state.facts.set).toBe('function');
      expect(typeof state.answers.get).toBe('function');
      expect(typeof state.answers.set).toBe('function');
    });

    it('should support simple fact storage and retrieval', () => {
      const { setFact, getFact } = useSimplifiedStore.getState();
      
      // Test simple fact storage - replacing "injectFact" complexity
      setFact('user_experience', 'beginner');
      setFact('security_score', 85);
      setFact('has_vpn', true);
      
      // Verify simple retrieval
      expect(getFact('user_experience')).toBe('beginner');
      expect(getFact('security_score')).toBe(85);
      expect(getFact('has_vpn')).toBe(true);
      expect(getFact('nonexistent')).toBeUndefined();
    });

    it('should handle device detection facts automatically', () => {
      const { getFact } = useSimplifiedStore.getState();
      
      // Verify device facts are set during initialization
      expect(getFact('os_detected')).toBeDefined();
      expect(getFact('browser_detected')).toBeDefined();
      expect(getFact('device_type')).toBeDefined();
    });

  });

  describe('📝 Answer Management', () => {

    it('should handle question answers with proper structure', () => {
      const { answerQuestion, answers } = useSimplifiedStore.getState();
      
      // Answer different types of questions
      answerQuestion('password_manager', true);
      answerQuestion('security_level', 'intermediate');
      answerQuestion('backup_frequency', 30);
      
      // Verify answers are stored correctly
      const passwordAnswer = answers.get('password_manager');
      expect(passwordAnswer?.questionId).toBe('password_manager');
      expect(passwordAnswer?.value).toBe(true);
      expect(passwordAnswer?.timestamp).toBeInstanceOf(Date);
      
      const levelAnswer = answers.get('security_level');
      expect(levelAnswer?.value).toBe('intermediate');
      
      const backupAnswer = answers.get('backup_frequency');
      expect(backupAnswer?.value).toBe(30);
    });

    it('should persist answers through Registry data access', () => {
      const { answerQuestion } = useSimplifiedStore.getState();
      
      answerQuestion('test_question', 'test_answer');
      
      // Verify persistence through raw data access
      const state = useSimplifiedStore.getState();
      expect(state.answersData['test_question']).toBeDefined();
      expect(state.answersData['test_question'].value).toBe('test_answer');
    });

  });

  describe('🔄 State Management', () => {

    it('should reset assessment cleanly', () => {
      const { setFact, answerQuestion, resetAssessment } = useSimplifiedStore.getState();
      
      // Add some data
      setFact('test_fact', 'test_value');
      answerQuestion('test_question', 'test_answer');
      
      // Reset everything
      resetAssessment();
      
      // Verify clean state
      const state = useSimplifiedStore.getState();
      expect(Object.keys(state.factsData)).toHaveLength(0);
      expect(Object.keys(state.answersData)).toHaveLength(0);
      expect(state.overallScore).toBe(0);
    });

    it('should maintain device profile for backwards compatibility', () => {
      const state = useSimplifiedStore.getState();
      
      expect(state.deviceProfile).toBeDefined();
      expect(state.deviceProfile?.currentDevice).toBeDefined();
      expect(state.deviceProfile?.otherDevices).toBeDefined();
    });

  });

  describe('💾 Data Persistence', () => {

    it('should expose raw data for persistence', () => {
      const { setFact, answerQuestion } = useSimplifiedStore.getState();
      
      setFact('persistent_fact', 'should_persist');
      answerQuestion('persistent_question', 'should_persist');
      
      const state = useSimplifiedStore.getState();
      
      // Raw data should be accessible for localStorage persistence
      expect(state.factsData['persistent_fact']).toBe('should_persist');
      expect(state.answersData['persistent_question']).toBeDefined();
      expect(state.answersData['persistent_question'].value).toBe('should_persist');
    });

  });

  describe('🧩 Registry Collection Operations', () => {

    it('should support Registry collection methods', () => {
      const { facts } = useSimplifiedStore.getState();
      
      // Set up test data
      facts.set('key1', 'value1');
      facts.set('key2', 'value2');
      facts.set('key3', 'value3');
      
      // Test has method
      expect(facts.has('key1')).toBe(true);
      expect(facts.has('nonexistent')).toBe(false);
      
      // Test keys, values, entries
      const keys = Array.from(facts.keys());
      const values = Array.from(facts.values());
      const entries = Array.from(facts.entries());
      
      expect(keys).toContain('key1');
      expect(values).toContain('value1');
      expect(entries.some(([k, v]) => k === 'key2' && v === 'value2')).toBe(true);
    });

    it('should support tryAdd and getOrAdd operations', () => {
      const { facts } = useSimplifiedStore.getState();
      
      // tryAdd should only add if key doesn't exist
      expect(facts.tryAdd('new_key', 'new_value')).toBe(true);
      expect(facts.tryAdd('new_key', 'different_value')).toBe(false);
      expect(facts.get('new_key')).toBe('new_value');
      
      // getOrAdd should return existing or add new
      expect(facts.getOrAdd('existing_key', () => 'default_value')).toBe('default_value');
      expect(facts.getOrAdd('existing_key', () => 'different_default')).toBe('default_value');
    });

  });

});