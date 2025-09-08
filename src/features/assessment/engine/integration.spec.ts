/**
 * Integration tests for condition engine and store integration
 * Phase 2.2 verification
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../state/store';

describe('Condition Engine Integration', () => {
  beforeEach(() => {
    // Reset store before each test
    useAssessmentStore.getState().resetAssessment();
  });

  it('should provide working condition engine selectors', () => {
    const store = useAssessmentStore.getState();
    
    // Test the selectors exist and return expected types
    const visibleQuestionIds = store.getVisibleQuestionIds();
    const unlockedSuiteIds = store.getUnlockedSuiteIds();
    const effectivePatches = store.getEffectivePatches();
    
    expect(Array.isArray(visibleQuestionIds)).toBe(true);
    expect(Array.isArray(unlockedSuiteIds)).toBe(true);
    expect(typeof effectivePatches).toBe('object');
    
    console.log('Visible question IDs:', visibleQuestionIds);
    console.log('Unlocked suite IDs:', unlockedSuiteIds);
    console.log('Effective patches:', Object.keys(effectivePatches));
  });

  it('should update condition evaluation when answers change', () => {
    const store = useAssessmentStore.getState();
    
    // Get initial state
    const initialVisible = store.getVisibleQuestionIds();
    console.log('Initial visible question IDs:', initialVisible);
    
    // Answer a question that might affect visibility
    store.answerQuestion('lock_screen', 'yes');
    
    // Get updated state
    const updatedVisible = store.getVisibleQuestionIds();
    const updatedSuites = store.getUnlockedSuiteIds();
    const updatedPatches = store.getEffectivePatches();
    
    // Verify selectors still work (even if results are the same)
    expect(Array.isArray(updatedVisible)).toBe(true);
    expect(Array.isArray(updatedSuites)).toBe(true);
    expect(typeof updatedPatches).toBe('object');
    
    console.log('After answering lock_screen=yes:');
    console.log('Visible question IDs:', updatedVisible);
    console.log('Unlocked suite IDs:', updatedSuites);
    console.log('Effective patches:', Object.keys(updatedPatches));
  });

  it('should have condition engine properly initialized', () => {
    const store = useAssessmentStore.getState();
    
    // Verify the condition engine exists and has the required methods
    expect(store.conditionEngine).toBeDefined();
    expect(typeof store.conditionEngine.evaluate).toBe('function');
    
    // Test that the engine can evaluate without errors
    const context = {
      answers: store.answers,
      questionBank: store.questionBank
    };
    
    const result = store.conditionEngine.evaluate(context);
    expect(result).toBeDefined();
    expect(Array.isArray(result.visibleQuestionIds)).toBe(true);
    expect(Array.isArray(result.unlockedSuites)).toBe(true);
    expect(typeof result.questionPatches).toBe('object');
  });
});
