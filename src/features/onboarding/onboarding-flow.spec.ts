import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from "../../features/assessment/state/store";

describe('Complete Onboarding Flow Automation', () => {
  let store: ReturnType<typeof useAssessmentStore.getState>;

  beforeEach(() => {
    store = useAssessmentStore.getState();
    store.resetAssessment();
    
    // Simulate device detection facts as would happen at app startup
    store.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
    store.factsActions.injectFact('browser_detected', 'firefox', { source: 'auto-detection' });
    store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
    store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
  });

  it('should follow correct onboarding sequence with device detection at startup', () => {
    // STEP 1: First question should be Privacy Notice
    const firstQuestions = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(firstQuestions[0]?.id).toBe('privacy_notice');
    
    // STEP 2: Answer Privacy Notice
    store.answerQuestion('privacy_notice', 'acknowledge');
    
    // STEP 3: Second question should be OS DETECTION (not selection)
    const secondQuestions = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(secondQuestions[0]?.id).toBe('windows_detection_confirm');
    expect(secondQuestions[0]?.statement).toContain('Detected: Windows');
    
    // STEP 4: Answer OS Detection
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // STEP 5: Third question should be Browser DETECTION (not selection)
    const thirdQuestions = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(thirdQuestions[0]?.id).toBe('firefox_detection_confirm');
    expect(thirdQuestions[0]?.statement).toContain('Detected: Firefox');
  });

  it('should handle different browser detections correctly', () => {
    const browsers = ['firefox', 'chrome', 'edge', 'safari'];
    
    browsers.forEach(browser => {
      // Reset and inject facts for this browser
      store.resetAssessment();
      
      // Get fresh store reference after reset
      const freshStore = useAssessmentStore.getState();
      freshStore.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
      freshStore.factsActions.injectFact('browser_detected', browser, { source: 'auto-detection' });
      freshStore.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
      freshStore.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
      
      // Complete privacy notice and OS detection flow
      freshStore.factsActions.injectFact('privacy_acknowledged', true, { source: 'user-confirmed' });
      freshStore.factsActions.injectFact('os', 'windows', { source: 'user-confirmed' });
      freshStore.factsActions.injectFact('os_confirmed', true, { source: 'user-confirmed' });
      
      // Check browser detection question appears
      const questions = freshStore.getAvailableQuestions().filter(q => q.phase === 'onboarding');
      const browserQuestion = questions[0];
      
      expect(browserQuestion?.id).toBe(`${browser}_detection_confirm`);
      expect(browserQuestion?.statement?.toLowerCase()).toContain(browser);
    });
  });
});