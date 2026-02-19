import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from "../../features/assessment/state/store";

describe('Complete Onboarding Flow Automation', () => {
  let store: ReturnType<typeof useAssessmentStore.getState>;

  beforeEach(() => {
    store = useAssessmentStore.getState();
    store.resetAssessment();
    
    // Simulate device detection facts as would happen at app startup
    // Detection sets os_detected/browser_detected but NOT os_confirmed/browser_confirmed
    // — the user must confirm via the detection confirmation questions
    store.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
    store.factsActions.injectFact('browser_detected', 'firefox', { source: 'auto-detection' });
    store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
    store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
    
    // Set up device profile to simulate complete device detection
    store.setDeviceProfile({
      currentDevice: {
        os: 'windows',
        browser: 'firefox',
        type: 'desktop'
      },
      otherDevices: {
        hasWindows: true,
        hasMac: false,
        hasLinux: false,
        hasIPhone: false,
        hasAndroid: false,
        hasIPad: false
      }
    });
  });

  it('should follow correct onboarding sequence: privacy → OS confirm → browser confirm', () => {
    // STEP 1: First question should be Privacy Notice
    const firstQuestions = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(firstQuestions[0]?.id).toBe('privacy_notice');
    
    // STEP 2: Answer Privacy Notice
    store.answerQuestion('privacy_notice', 'understood');
    
    // STEP 3: Second question should be OS detection confirmation
    const secondQuestions = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(secondQuestions[0]?.id).toBe('windows_detection_confirm');
    expect(secondQuestions[0]?.statement).toContain('Detected: Windows');
    
    // STEP 4: Confirm OS detection
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // STEP 5: Third question should be Browser detection confirmation
    const thirdQuestions = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(thirdQuestions[0]?.id).toBe('firefox_detection_confirm');
    expect(thirdQuestions[0]?.statement).toContain('Detected: Firefox');
    
    // STEP 6: Confirm browser detection
    store.answerQuestion('firefox_detection_confirm', 'yes');
    
    // STEP 7: No more onboarding questions — tech_comfort, usage_context, etc. were moved to assessment
    const remainingOnboarding = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(remainingOnboarding.length).toBe(0);
    
    // STEP 8: First available question should now be an assessment question
    const assessmentQuestions = store.getAvailableQuestions().filter(q => q.phase !== 'onboarding');
    expect(assessmentQuestions.length).toBeGreaterThan(0);
  });

  it('should show browser selection when browser detection is unknown', () => {
    // Reset and inject unknown browser detection
    store.resetAssessment();
    const freshStore = useAssessmentStore.getState();
    
    // Override browser to 'unknown' — OS stays as-is from resetAssessment → initializeStore
    freshStore.factsActions.injectFact('browser_detected', 'unknown', { source: 'test-override' });
    
    // Answer privacy notice
    freshStore.answerQuestion('privacy_notice', 'understood');
    
    // Answer OS confirmation (initializeStore sets os_detected from jsdom UA)
    // After OS is confirmed, with browser_detected='unknown' → browser_selection should appear
    const osQuestions = freshStore.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    if (osQuestions[0]?.id.includes('detection_confirm')) {
      freshStore.answerQuestion(osQuestions[0].id, 'yes');
    }
    
    const onboarding = freshStore.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(onboarding.length).toBeGreaterThan(0);
    expect(onboarding[0]?.id).toBe('browser_selection');
  });
});