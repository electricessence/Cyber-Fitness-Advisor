import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from "../../features/assessment/state/store";

describe('Complete Onboarding Flow Automation', () => {
  let store: ReturnType<typeof useAssessmentStore.getState>;

  beforeEach(() => {
    store = useAssessmentStore.getState();
    store.resetAssessment();
    
    // Simulate device detection facts as would happen at app startup
    // Since v1.1 auto-confirms confident detections, inject both detected + confirmed facts
    store.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
    store.factsActions.injectFact('browser_detected', 'firefox', { source: 'auto-detection' });
    store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
    store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
    // Auto-confirm (mirrors initializeStore behavior)
    store.factsActions.injectFact('os', 'windows', { source: 'auto-detection' });
    store.factsActions.injectFact('os_confirmed', true, { source: 'auto-detection' });
    store.factsActions.injectFact('browser', 'firefox', { source: 'auto-detection' });
    store.factsActions.injectFact('browser_confirmed', true, { source: 'auto-detection' });
    
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

  it('should skip OS/browser confirmation when auto-detected and go straight to assessment', () => {
    // STEP 1: First onboarding question should be Privacy Notice
    const firstQuestions = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(firstQuestions[0]?.id).toBe('privacy_notice');
    
    // STEP 2: Answer Privacy Notice
    store.answerQuestion('privacy_notice', 'understood');
    
    // STEP 3: With auto-confirm, OS and browser detection confirms are SKIPPED
    // No more onboarding questions should be pending (detection handled them)
    const remainingOnboarding = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(remainingOnboarding.length).toBe(0);
    
    // STEP 4: First available question should be an assessment question (e.g. password_manager)
    const assessmentQuestions = store.getAvailableQuestions().filter(q => q.phase !== 'onboarding');
    expect(assessmentQuestions.length).toBeGreaterThan(0);
  });

  it('should show browser selection when browser detection is unknown', () => {
    // After resetAssessment(), initializeStore() auto-confirms OS from jsdom
    // (OS='linux' from jsdom UA). So OS is already confirmed.
    // We override browser_detected to 'unknown' to simulate failed browser detection.
    store.resetAssessment();
    const freshStore = useAssessmentStore.getState();
    
    // Override browser detection to 'unknown' (OS stays auto-confirmed from jsdom)
    freshStore.factsActions.injectFact('browser_detected', 'unknown', { source: 'test-override' });
    
    // Answer privacy notice
    freshStore.answerQuestion('privacy_notice', 'understood');
    
    // With OS auto-confirmed + browser 'unknown', browser_selection should appear
    const onboarding = freshStore.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    expect(onboarding.length).toBeGreaterThan(0);
    expect(onboarding[0]?.id).toBe('browser_selection');
  });
});