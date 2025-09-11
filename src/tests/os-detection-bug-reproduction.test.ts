/**
 * OS Detection Bug Reproduction Test
 * 
 * This test reproduces the exact bug the user is experiencing:
 * After confirming Windows, Mac detection still appears.
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('OS Detection Bug - Exact User Experience', () => {
  beforeEach(() => {
    initializeStore();
  });

  it('REPRODUCES BUG: Mac detection should NOT appear after Windows confirmation', () => {
    const store = useAssessmentStore.getState();
    
    console.log('\n🔍 === INITIAL STATE ===');
    const initialQuestions = store.getVisibleQuestionIds();
    const initialFacts = store.factsActions.getFacts();
    
    console.log('Initial visible questions:', initialQuestions);
    console.log('Initial facts:', Object.fromEntries(
      Object.entries(initialFacts).map(([k, v]) => [k, v.value])
    ));
    
    // Step 1: User sees Windows detection and confirms it
    const hasWindowsInitially = initialQuestions.includes('windows_detection_confirm');
    const hasMacInitially = initialQuestions.includes('mac_detection_confirm');
    
    console.log('\n🎯 === STEP 1: Windows Detection ===');
    console.log('Windows detection visible:', hasWindowsInitially);
    console.log('Mac detection visible:', hasMacInitially);
    
    expect(hasWindowsInitially).toBe(true);
    expect(hasMacInitially).toBe(false); // Should be false initially
    
    // Step 2: User clicks "Yes" on Windows detection
    console.log('\n✅ === STEP 2: User Confirms Windows ===');
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // Step 3: Check what questions appear after Windows confirmation
    const afterWindowsQuestions = store.getVisibleQuestionIds();
    const afterWindowsFacts = store.factsActions.getFacts();
    
    console.log('\n📊 === AFTER WINDOWS CONFIRMATION ===');
    console.log('Visible questions:', afterWindowsQuestions);
    console.log('Updated facts:', Object.fromEntries(
      Object.entries(afterWindowsFacts).map(([k, v]) => [k, v.value])
    ));
    
    // Check critical facts
    const osConfirmed = store.factsActions.getFact('os_confirmed');
    const osValue = store.factsActions.getFact('os');
    const osDetected = store.factsActions.getFact('os_detected');
    
    console.log('\n🔍 === CRITICAL FACTS ANALYSIS ===');
    console.log('os_confirmed:', osConfirmed?.value);
    console.log('os:', osValue?.value);
    console.log('os_detected:', osDetected?.value);
    
    // THE BUG: After Windows confirmation, Mac detection should NOT be visible
    const hasWindowsAfter = afterWindowsQuestions.includes('windows_detection_confirm');
    const hasMacAfter = afterWindowsQuestions.includes('mac_detection_confirm');
    const hasLinuxAfter = afterWindowsQuestions.includes('linux_detection_confirm');
    
    console.log('\n🐛 === BUG CHECK ===');
    console.log('Windows detection after confirmation:', hasWindowsAfter);
    console.log('Mac detection after confirmation:', hasMacAfter);
    console.log('Linux detection after confirmation:', hasLinuxAfter);
    
    // What SHOULD happen:
    expect(hasWindowsAfter).toBe(false); // Windows question should disappear
    expect(hasMacAfter).toBe(false);     // 🐛 THIS IS THE BUG - should be false but might be true
    expect(hasLinuxAfter).toBe(false);   // Linux should also not appear
    
    // Facts should be properly set
    expect(osConfirmed?.value).toBe(true);
    expect(osValue?.value).toBe('windows');
    
    // If this test fails, it means the bug is reproduced
    if (hasMacAfter) {
      console.error('🚨 BUG CONFIRMED: Mac detection is still visible after Windows confirmation!');
      console.error('This means the exclude condition { "os_confirmed": true } is not working properly.');
    }
  });

  it('DEBUG: Check individual question condition evaluation', () => {
    const store = useAssessmentStore.getState();
    
    // First confirm Windows
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // Get the Mac detection question manually
    const questionBank = store.questionBank;
    let macDetectionQuestion: any = null;
    
    // Find the Mac detection question in the question bank
    questionBank.domains.forEach(domain => {
      domain.levels.forEach(level => {
        level.questions.forEach(question => {
          if (question.id === 'mac_detection_confirm') {
            macDetectionQuestion = question;
          }
        });
      });
    });
    
    console.log('\n🔍 === MAC DETECTION QUESTION ANALYSIS ===');
    console.log('Mac question found:', !!macDetectionQuestion);
    
    if (macDetectionQuestion) {
      console.log('Mac question conditions:', macDetectionQuestion.conditions);
      
      // Check include condition: { "os_detected": "mac" }
      const osDetectedFact = store.factsActions.getFact('os_detected');
      const includeMatches = osDetectedFact?.value === 'mac';
      console.log('Include condition (os_detected = mac):', includeMatches);
      console.log('Actual os_detected value:', osDetectedFact?.value);
      
      // Check exclude condition: { "os_confirmed": true }
      const osConfirmedFact = store.factsActions.getFact('os_confirmed');
      const excludeMatches = osConfirmedFact?.value === true;
      console.log('Exclude condition (os_confirmed = true):', excludeMatches);
      console.log('Actual os_confirmed value:', osConfirmedFact?.value);
      
      // Question should be visible if include matches AND exclude doesn't match
      const shouldBeVisible = includeMatches && !excludeMatches;
      console.log('Question should be visible:', shouldBeVisible);
      
      const actuallyVisible = store.getVisibleQuestionIds().includes('mac_detection_confirm');
      console.log('Question actually visible:', actuallyVisible);
      
      if (shouldBeVisible !== actuallyVisible) {
        console.error('🚨 CONDITION EVALUATION MISMATCH!');
      }
    }
  });
});