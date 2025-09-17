import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore } from '../features/assessment/state/store.js';

describe('Complete Onboarding Flow Automation', () => {
  let store: ReturnType<typeof useAssessmentStore.getState>;
  
  beforeEach(() => {
    // Get fresh store state for each test
    store = useAssessmentStore.getState();
    store.resetAssessment();
    
    // Simulate device detection facts as would happen at app startup
    store.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
    store.factsActions.injectFact('browser_detected', 'firefox', { source: 'auto-detection' });
    store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
    store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
  });

  it('should follow correct onboarding sequence with device detection at startup', () => {
    console.log('\n🔄 === COMPLETE ONBOARDING FLOW TEST ===');
    
    // Device detection already happened in beforeEach (simulating app startup)
    console.log('\n✅ Step 1: Device detection already completed at app startup');
    console.log('    os_detected:', store.factsActions.getFact('os_detected')?.value);
    console.log('    browser_detected:', store.factsActions.getFact('browser_detected')?.value);
    
    // STEP 2: First question should be Privacy Notice
    console.log('\n📋 Step 2: First question after startup should be Privacy Notice');
    const allQuestions1 = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    const firstQuestion = allQuestions1[0];
    
    console.log('  First onboarding question:', firstQuestion?.id);
    console.log('  Expected: privacy_notice');
    expect(firstQuestion?.id).toBe('privacy_notice');
    
    // STEP 3: Answer Privacy Notice
    console.log('\n✅ Step 3: User answers Privacy Notice');
    store.answerQuestion('privacy_notice', 'acknowledge');
    console.log('  Privacy Notice answered');
    
    // STEP 4: Second question should be OS DETECTION (not selection)
    console.log('\n🖥️ Step 4: Second question should be OS detection confirmation');
    const allQuestions2 = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    const secondQuestion = allQuestions2[0];
    
    // Debug logging to understand why detection question isn't appearing
    console.log('  All available onboarding questions:');
    allQuestions2.forEach(q => {
      console.log(`    - ${q.id} (priority: ${q.priority})`);
    });
    
    // Check facts state 
    const hasOsDetected = store.factsActions.hasFactValue('os_detected', 'windows');
    const hasOsConfirmed = store.factsActions.hasFactValue('os_confirmed', true);
    console.log('  Facts state:');
    console.log(`    - os_detected=windows: ${hasOsDetected}`);
    console.log(`    - os_confirmed=true: ${hasOsConfirmed}`);
    
    console.log('  Second onboarding question:', secondQuestion?.id);
    console.log('  Second question statement:', secondQuestion?.statement);
    console.log('  Expected: windows_detection_confirm (not os_selection)');
    
    // This should be detection confirmation, NOT manual selection
    expect(secondQuestion?.id).toBe('windows_detection_confirm');
    expect(secondQuestion?.statement).toContain('Detected: Windows');
    
    // STEP 5: Answer OS Detection
    console.log('\n✅ Step 5: User confirms Windows detection');
    store.answerQuestion('windows_detection_confirm', 'yes');
    console.log('  Windows detection confirmed');
    console.log('  os_confirmed fact:', store.factsActions.getFact('os_confirmed')?.value);
    
    // STEP 6: Third question should be Browser DETECTION (not selection)
    console.log('\n🦊 Step 6: Third question should be Firefox detection confirmation');
    const allQuestions3 = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    const thirdQuestion = allQuestions3[0];
    
    console.log('  Third onboarding question:', thirdQuestion?.id);
    console.log('  Third question statement:', thirdQuestion?.statement);
    console.log('  Expected: firefox_detection_confirm (not browser_selection)');
    
    // This should be detection confirmation, NOT manual selection
    expect(thirdQuestion?.id).toBe('firefox_detection_confirm');
    expect(thirdQuestion?.statement).toContain('Detected: Firefox');
    
    // STEP 7: Answer Browser Detection
    console.log('\n✅ Step 7: User confirms Firefox detection');
    store.answerQuestion('firefox_detection_confirm', 'yes');
    console.log('  Firefox detection confirmed');
    console.log('  browser_confirmed fact:', store.factsActions.getFact('browser_confirmed')?.value);
    
    // STEP 8: Check remaining onboarding questions
    console.log('\n🔍 Step 8: Checking remaining onboarding flow');
    const allQuestions4 = store.getAvailableQuestions().filter(q => q.phase === 'onboarding');
    const fourthQuestion = allQuestions4[0];
    
    console.log('  Fourth onboarding question:', fourthQuestion?.id);
    console.log('  Remaining onboarding questions:', allQuestions4.length);
    
    if (allQuestions4.length > 0) {
      console.log('  Next questions:');
      allQuestions4.slice(0, 3).forEach((q, i) => {
        console.log(`    ${i+1}. ${q.id} (${q.statement})`);
      });
    }
    
    console.log('\n🎯 === FLOW VERIFICATION ===');
    console.log('✅ Device detection injected at startup');
    console.log('✅ Privacy Notice appeared first');
    console.log('✅ OS Detection (not selection) appeared second');
    console.log('✅ Browser Detection (not selection) appeared third');
    console.log('✅ Onboarding flow follows correct sequence');
  });

  it('should handle different browser detections correctly', () => {
    console.log('\n🔄 === MULTI-BROWSER DETECTION TEST ===');
    
    const browsers = ['firefox', 'chrome', 'edge', 'safari'];
    
    browsers.forEach(browser => {
      console.log(`\n🧪 Testing ${browser.toUpperCase()} detection flow...`);
      
      // Reset for each browser test
      store.resetAssessment();
      
      // Get fresh store reference after reset
      const freshStore = useAssessmentStore.getState();
      
      // Inject detection for this browser (simulating app startup)
      freshStore.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
      freshStore.factsActions.injectFact('browser_detected', browser, { source: 'auto-detection' });
      freshStore.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
      
      // Answer privacy and OS
      freshStore.answerQuestion('privacy_notice', 'understood');
      freshStore.answerQuestion('windows_detection_confirm', 'yes');
      
      // Check browser detection question
      const questions = freshStore.getAvailableQuestions().filter(q => q.phase === 'onboarding');
      const browserQuestion = questions[0];
      
      console.log(`  ${browser} detection question:`, browserQuestion?.id);
      console.log(`  Statement:`, browserQuestion?.statement);
      
      expect(browserQuestion?.id).toBe(`${browser}_detection_confirm`);
      expect(browserQuestion?.statement?.toLowerCase()).toContain(browser);
    });
  });
});