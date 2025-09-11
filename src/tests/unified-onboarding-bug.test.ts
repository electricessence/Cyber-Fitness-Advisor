/**
 * Test the UnifiedOnboarding component specifically
 * This may reveal differences between the component logic and the store logic
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';
import { getOnboardingQuestions } from '../features/assessment/data/contentService';

describe('UnifiedOnboarding OS Detection Bug', () => {
  beforeEach(() => {
    // Use the exact same setup as the working test
    initializeStore();
  });

  it('should match the exact flow of UnifiedOnboarding component', () => {
    const store = useAssessmentStore.getState();
    
    console.log('\n🔍 === SIMULATING UnifiedOnboarding COMPONENT ===');
    
    // Step 1: Get onboarding questions (same as component)
    const onboardingQuestions = getOnboardingQuestions();
    console.log(`Total onboarding questions: ${onboardingQuestions.length}`);
    
    // Step 2: Filter using facts-based logic (same as fixed component)
    const { factsProfile } = store;
    const facts = factsProfile.facts;
    
    console.log('Facts available for filtering:');
    Object.entries(facts).forEach(([id, fact]) => {
      console.log(`- ${id}: ${fact.value}`);
    });
    
    // Filter onboarding questions using the same facts-based logic as the component
    const visibleOnboardingQuestions = onboardingQuestions.filter(question => {
      let isVisible = true;
      
      // Check include conditions - question is visible if facts match
      if (question.conditions?.include) {
        let includeMatches = false;
        for (const [factId, expectedValue] of Object.entries(question.conditions.include)) {
          const fact = facts[factId];
          if (fact && fact.value === expectedValue) {
            includeMatches = true;
            break;
          }
        }
        if (!includeMatches) {
          isVisible = false;
        }
      }
      
      // Check exclude conditions - question is hidden if facts match
      if (question.conditions?.exclude && isVisible) {
        for (const [factId, expectedValue] of Object.entries(question.conditions.exclude)) {
          const fact = facts[factId];
          if (fact && fact.value === expectedValue) {
            isVisible = false;
            break;
          }
        }
      }
      
      return isVisible;
    });
    
    console.log(`Visible onboarding questions: ${visibleOnboardingQuestions.length}`);
    console.log('Visible question IDs:', visibleOnboardingQuestions.map(q => q.id));
    
    // Step 3: Check initial state
    const hasWindowsDetection = visibleOnboardingQuestions.some(q => q.id === 'windows_detection_confirm');
    const hasMacDetection = visibleOnboardingQuestions.some(q => q.id === 'mac_detection_confirm');
    const hasLinuxDetection = visibleOnboardingQuestions.some(q => q.id === 'linux_detection_confirm');
    
    console.log('\n🎯 === INITIAL DETECTION QUESTIONS ===');
    console.log('Windows detection visible:', hasWindowsDetection);
    console.log('Mac detection visible:', hasMacDetection); 
    console.log('Linux detection visible:', hasLinuxDetection);
    
    expect(hasWindowsDetection).toBe(true);
    expect(hasMacDetection).toBe(false);
    expect(hasLinuxDetection).toBe(false);
    
    // Step 4: Answer Windows detection (same as component would do)
    console.log('\n✅ === USER CONFIRMS WINDOWS ===');
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // Step 5: Re-evaluate conditions after answer (component would do this on re-render)
    const newFactsProfile = store.factsProfile;
    const newFacts = newFactsProfile.facts;
    
    console.log('\nAfter Windows confirmation - new facts:');
    Object.entries(newFacts).forEach(([id, fact]) => {
      console.log(`- ${id}: ${fact.value}`);
    });
    
    const newVisibleOnboardingQuestions = onboardingQuestions.filter(question => {
      let isVisible = true;
      
      // Check include conditions - question is visible if facts match
      if (question.conditions?.include) {
        let includeMatches = false;
        for (const [factId, expectedValue] of Object.entries(question.conditions.include)) {
          const fact = newFacts[factId];
          if (fact && fact.value === expectedValue) {
            includeMatches = true;
            break;
          }
        }
        if (!includeMatches) {
          isVisible = false;
        }
      }
      
      // Check exclude conditions - question is hidden if facts match
      if (question.conditions?.exclude && isVisible) {
        for (const [factId, expectedValue] of Object.entries(question.conditions.exclude)) {
          const fact = newFacts[factId];
          if (fact && fact.value === expectedValue) {
            isVisible = false;
            break;
          }
        }
      }
      
      return isVisible;
    });
    
    console.log(`New visible onboarding questions: ${newVisibleOnboardingQuestions.length}`);
    console.log('New visible question IDs:', newVisibleOnboardingQuestions.map(q => q.id));
    
    // Step 6: Check detection questions after Windows confirmation
    const hasWindowsAfter = newVisibleOnboardingQuestions.some(q => q.id === 'windows_detection_confirm');
    const hasMacAfter = newVisibleOnboardingQuestions.some(q => q.id === 'mac_detection_confirm');
    const hasLinuxAfter = newVisibleOnboardingQuestions.some(q => q.id === 'linux_detection_confirm');
    
    console.log('\n🐛 === AFTER WINDOWS CONFIRMATION ===');
    console.log('Windows detection visible:', hasWindowsAfter);
    console.log('Mac detection visible:', hasMacAfter);
    console.log('Linux detection visible:', hasLinuxAfter);
    
    // Check facts to understand the state
    console.log('\n📊 === FACTS ANALYSIS ===');
    const osConfirmedFact = store.factsActions.getFact('os_confirmed');
    const osDetectedFact = store.factsActions.getFact('os_detected');
    const osFact = store.factsActions.getFact('os');
    
    console.log('os_confirmed fact:', osConfirmedFact?.value);
    console.log('os_detected fact:', osDetectedFact?.value);
    console.log('os fact:', osFact?.value);
    
    // The bug report says Mac detection continues to appear
    // This should be false if our fix works
    expect(hasMacAfter).toBe(false);
    expect(hasLinuxAfter).toBe(false);
    
    if (hasMacAfter || hasLinuxAfter) {
      console.error('🚨 BUG REPRODUCED: Mac/Linux detection still visible after Windows confirmation!');
    } else {
      console.log('✅ BUG NOT REPRODUCED: Fix appears to be working correctly');
    }
  });
});