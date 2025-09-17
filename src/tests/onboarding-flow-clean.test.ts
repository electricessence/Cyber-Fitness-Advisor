/**
 * Clean onboarding flow test without console.log contamination
  it('should handle browser detection flow correctly', () => {
    const store = useAssessmentStore.getState();
    
    // Complete initial flow
    store.answerQuestion('privacy_notice', 'understood');
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // Browser confirmation should be available
    const browserQuestion = store.getAvailableQuestions()[0];
    expect(browserQuestion?.id).toBe('firefox_detection_confirm');
    
    // Confirm browser detection
    store.answerQuestion('firefox_detection_confirm', 'yes');
    
    // Check browser facts
    const browserConfirmed = store.factsActions.getFact('browser_confirmed');
    expect(browserConfirmed?.value).toBe(true);
    
    const browserFact = store.factsActions.getFact('browser');
    expect(browserFact?.value).toBe('firefox');e device detection and OS confirmation flow
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store';
import type { Question } from '../features/assessment/engine/schema';

describe('Onboarding Flow - Clean', () => {
  beforeEach(() => {
    const store = useAssessmentStore.getState();
    store.resetAssessment();
    
    // Simulate device detection at app startup
    store.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
    store.factsActions.injectFact('browser_detected', 'firefox', { source: 'auto-detection' });
    store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
    store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
  });

  it('should show device detection confirmation after privacy notice', () => {
    const store = useAssessmentStore.getState();
    
    // Step 1: Privacy notice should be first
    const firstQuestion = store.getAvailableQuestions()[0];
    expect(firstQuestion?.id).toBe('privacy_notice');
    
    // Step 2: Answer privacy notice
    store.answerQuestion('privacy_notice', 'yes');
    
    // Step 3: OS detection confirmation should be next
    const secondQuestion = store.getAvailableQuestions()[0];
    expect(secondQuestion?.id).toBe('windows_detection_confirm');
    expect(secondQuestion?.statement).toContain('Windows');
    
    // Step 4: Confirm Windows detection
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // Step 5: Browser detection confirmation should be next
    const thirdQuestion = store.getAvailableQuestions()[0];
    expect(thirdQuestion?.id).toBe('firefox_detection_confirm');
    expect(thirdQuestion?.statement).toContain('Firefox');
  });

  it('should not show os_selection when OS is already detected', () => {
    const store = useAssessmentStore.getState();
    
    // OS selection should be excluded when os_detected exists
    const availableQuestions = store.getAvailableQuestions();
    const osSelectionQuestion = availableQuestions.find((q: Question) => q.id === 'os_selection');
    expect(osSelectionQuestion).toBeUndefined();
  });

  it('should establish os_confirmed fact when user confirms detection', () => {
    const store = useAssessmentStore.getState();
    
    // Answer privacy notice
    store.answerQuestion('privacy_notice', 'understood');
    
    // Confirm Windows detection
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // Check that os_confirmed fact is established
    const osConfirmed = store.factsActions.getFact('os_confirmed');
    expect(osConfirmed?.value).toBe(true);
    
    const osFact = store.factsActions.getFact('os');
    expect(osFact?.value).toBe('windows');
  });

  it('should handle browser detection flow correctly', () => {
    const store = useAssessmentStore.getState();
    
    // Complete initial flow
    store.answerQuestion('privacy_notice', 'yes');
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // Browser confirmation should be available
    const browserQuestion = store.getAvailableQuestions()[0];
    expect(browserQuestion?.id).toBe('firefox_detection_confirm');
    
    // Confirm browser detection
    store.answerQuestion('firefox_detection_confirm', 'yes');
    
    // Check browser facts
    const browserConfirmed = store.factsActions.getFact('browser_confirmed');
    expect(browserConfirmed?.value).toBe(true);
    
    const browserFact = store.factsActions.getFact('browser');
    expect(browserFact?.value).toBe('firefox');
  });
});