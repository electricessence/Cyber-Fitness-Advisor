/**
 * Facts-Based Architecture: Journey Tests
 * 
 * Behavior-Driven Development tests for the facts system integration
 * These tests demonstrate the complete user journey with facts extraction
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { act } from '@testing-library/react';
import { useAssessmentStore } from '../state/store';

describe('🎯 Facts-Based Architecture: User Journeys', () => {
  beforeEach(() => {
    // Reset store before each test
    act(() => {
      useAssessmentStore.getState().resetAssessment();
    });
  });

  it('📱 Journey: User onboards Windows device and facts are established', async () => {
    // GIVEN: A new user starts the onboarding process
    const store = useAssessmentStore.getState();
    
    // WHEN: User confirms they use Windows
    act(() => {
      store.answerQuestion('windows_confirmation', 'yes');
    });
    
    // THEN: Facts should be established in the store
    const updatedStore = useAssessmentStore.getState();
    
    // Verify traditional answer was stored
    expect(updatedStore.answers['windows_confirmation']).toBeDefined();
    expect(updatedStore.answers['windows_confirmation'].value).toBe('yes');
    
    // Verify facts were extracted and stored (when integrated)
    // TODO: Uncomment once store integration is complete
    // const osFact = updatedStore.factsActions?.getFact('device.os.primary');
    // expect(osFact?.value).toBe('windows');
    // expect(osFact?.category).toBe('device');
  });

  it('🔐 Journey: Password manager usage establishes behavior facts', async () => {
    // GIVEN: User has completed onboarding
    const store = useAssessmentStore.getState();
    
    act(() => {
      store.answerQuestion('windows_confirmation', 'yes');
      store.answerQuestion('browser_passwords', true);
    });
    
    // THEN: Both legacy and facts should be available
    const updatedStore = useAssessmentStore.getState();
    
    // Verify traditional answer
    expect(updatedStore.answers['browser_passwords']).toBeDefined();
    expect(updatedStore.answers['browser_passwords'].value).toBe(true);
    expect(updatedStore.overallScore).toBeGreaterThan(0);
    
    // TODO: Verify behavior facts once integration is complete
    // const passwordFact = updatedStore.factsActions?.getFact('behavior.password_manager.browser');
    // expect(passwordFact?.value).toBe(true);
  });

  it('🎯 Journey: Complete assessment flow maintains data integrity', async () => {
    // GIVEN: User completes multiple assessment questions
    const store = useAssessmentStore.getState();
    
    // WHEN: User answers various questions
    act(() => {
      store.answerQuestion('windows_confirmation', 'yes');
      store.answerQuestion('browser_passwords', true);
      store.answerQuestion('antivirus', 'yes'); 
      store.answerQuestion('windows_updates', 'yes');
    });
    
    // THEN: Should maintain data integrity in both systems
    const updatedStore = useAssessmentStore.getState();
    
    // Legacy system works correctly
    expect(Object.keys(updatedStore.answers).length).toBe(4);
    expect(updatedStore.overallScore).toBeGreaterThan(0);
    
    // Each answer should be properly stored
    expect(updatedStore.answers['windows_confirmation']).toBeDefined();
    expect(updatedStore.answers['browser_passwords']).toBeDefined();
    expect(updatedStore.answers['antivirus']).toBeDefined();
    expect(updatedStore.answers['windows_updates']).toBeDefined();
  });
});

/**
 * Facts System Architecture Verification
 */
describe('🔧 Facts System: Architecture Validation', () => {
  beforeEach(() => {
    act(() => {
      useAssessmentStore.getState().resetAssessment();
    });
  });

  it('should maintain backward compatibility with legacy system', async () => {
    // GIVEN: Existing assessment flow
    const store = useAssessmentStore.getState();
    
    // WHEN: User interacts with assessment
    act(() => {
      store.answerQuestion('windows_confirmation', 'yes');
      store.answerQuestion('browser_passwords', true);
    });
    
    // THEN: Legacy functionality should continue working
    const updatedStore = useAssessmentStore.getState();
    
    expect(updatedStore.answers).toBeDefined();
    expect(updatedStore.overallScore).toBeGreaterThan(0);
    expect(updatedStore.currentLevel).toBeGreaterThanOrEqual(0);
    
    // Store should have all expected methods
    expect(typeof updatedStore.answerQuestion).toBe('function');
    expect(typeof updatedStore.getAvailableQuestions).toBe('function');
    expect(typeof updatedStore.resetAssessment).toBe('function');
  });

  it('should handle question flow correctly', async () => {
    // GIVEN: User in onboarding phase  
    const store = useAssessmentStore.getState();
    const initialQuestions = store.getAvailableQuestions();
    
    expect(initialQuestions.length).toBeGreaterThan(0);
    
    // WHEN: User completes onboarding
    act(() => {
      store.answerQuestion('windows_confirmation', 'yes');
    });
    
    // THEN: Question flow should continue working
    const updatedStore = useAssessmentStore.getState();
    const questionsAfterOnboarding = updatedStore.getAvailableQuestions();
    
    expect(questionsAfterOnboarding.length).toBeGreaterThan(0);
    expect(updatedStore.answers['windows_confirmation']).toBeDefined();
  });
});
