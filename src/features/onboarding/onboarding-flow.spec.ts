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

  it('should follow correct onboarding sequence: privacy → ad_blocker → browser confirm', () => {
    // STEP 1: First question should be Privacy Notice (highest priority: 10000)
    const firstQuestions = store.getOrderedAvailableQuestions();
    expect(firstQuestions[0]?.id).toBe('privacy_notice');
    
    // STEP 2: Answer Privacy Notice
    store.answerQuestion('privacy_notice', 'understood');
    
    // STEP 3: Next highest-priority question should be ad_blocker (98), then browser detection (97)
    const allQuestions = store.getOrderedAvailableQuestions();
    expect(allQuestions[0]?.id).toBe('ad_blocker');
    
    // STEP 4: Answer ad_blocker probe
    store.answerQuestion('ad_blocker', 'no');
    
    // STEP 5: Browser detection confirm should appear next (priority 97)
    const afterAdBlock = store.getOrderedAvailableQuestions();
    expect(afterAdBlock[0]?.id).toBe('firefox_detection_confirm');
    expect(afterAdBlock[0]?.statement).toContain('Detected: Firefox');
    
    // STEP 6: Confirm browser detection
    store.answerQuestion('firefox_detection_confirm', 'yes');
    
    // STEP 7: Deep-dive ad-block questions should now be available (browser-specific)
    const afterBrowser = store.getOrderedAvailableQuestions();
    // First available should be a browser-specific ad-block deep-dive or next assessment question
    expect(afterBrowser.length).toBeGreaterThan(0);
    
    // OS detection questions should NOT have appeared yet — they're deferred to priority 80
    const osDetectionQuestion = afterBrowser.find(q => q.id === 'windows_detection_confirm');
    // OS detection is deferred but still available (priority 80)
    expect(osDetectionQuestion).toBeDefined();
  });

  it('should show browser selection when browser detection is unknown', () => {
    // Reset and inject unknown browser detection
    store.resetAssessment();
    const freshStore = useAssessmentStore.getState();
    
    // Override browser to 'unknown' — OS stays as-is from resetAssessment → initializeStore
    freshStore.factsActions.injectFact('browser_detected', 'unknown', { source: 'test-override' });
    
    // Answer privacy notice
    freshStore.answerQuestion('privacy_notice', 'understood');
    
    // After privacy, ad_blocker is next (98), then browser_selection (96) for unknown browser
    // Answer ad_blocker first
    freshStore.answerQuestion('ad_blocker', 'no');
    
    // With browser_detected='unknown' and privacy_acknowledged=true → browser_selection should appear
    const available = freshStore.getOrderedAvailableQuestions();
    const browserSelection = available.find(q => q.id === 'browser_selection');
    expect(browserSelection).toBeDefined();
  });
});