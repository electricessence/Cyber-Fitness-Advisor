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
      store.answerQuestion('windows_detection_confirm', 'yes');
    });
    
    // THEN: Facts should be established in the store
    const updatedStore = useAssessmentStore.getState();
    
    // Verify traditional answer was stored
    expect(updatedStore.answers['windows_detection_confirm']).toBeDefined();
    expect(updatedStore.answers['windows_detection_confirm'].value).toBe('yes');
    
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
      store.answerQuestion('windows_detection_confirm', 'yes');
      store.answerQuestion('password_manager', 'yes');
    });
    
    // THEN: Both legacy and facts should be available
    const updatedStore = useAssessmentStore.getState();
    
    // Verify traditional answer
    expect(updatedStore.answers['password_manager']).toBeDefined();
    expect(updatedStore.answers['password_manager'].value).toBe('yes');
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
      store.answerQuestion('windows_detection_confirm', 'yes');
      store.answerQuestion('password_manager', 'yes');
      store.answerQuestion('virus_scan_recent', 'this_week'); 
      store.answerQuestion('software_updates', 'automatic');
    });
    
    // THEN: Should maintain data integrity in both systems
    const updatedStore = useAssessmentStore.getState();
    
    // Legacy system works correctly
    expect(Object.keys(updatedStore.answers).length).toBe(4);
    expect(updatedStore.overallScore).toBeGreaterThan(0);
    
    // Each answer should be properly stored
    expect(updatedStore.answers['windows_detection_confirm']).toBeDefined();
    expect(updatedStore.answers['password_manager']).toBeDefined();
    expect(updatedStore.answers['virus_scan_recent']).toBeDefined();
    expect(updatedStore.answers['software_updates']).toBeDefined();
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
      store.answerQuestion('windows_detection_confirm', 'yes');
      store.answerQuestion('password_manager', 'yes');
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
      store.answerQuestion('windows_detection_confirm', 'yes');
    });
    
    // THEN: Question flow should continue working
    const updatedStore = useAssessmentStore.getState();
    const questionsAfterOnboarding = updatedStore.getAvailableQuestions();
    
    expect(questionsAfterOnboarding.length).toBeGreaterThan(0);
    expect(updatedStore.answers['windows_detection_confirm']).toBeDefined();
  });
});
