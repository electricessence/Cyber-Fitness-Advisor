/**
 * OS Detection Bug Fix Test
 * 
 * Tests for the specific bug where Mac and Linux detection questions
 * were still showing after Windows OS confirmation.
 * 
 * Bug: After confirming Windows detection, Mac and Linux detection 
 * questions should be hidden, but they were still appearing.
 * 
 * Root Cause: OS detection questions only checked for `os_detected` 
 * matching their type, but didn't exclude when `os_confirmed` was true.
 * 
 * Fix: Added exclude condition { "os_confirmed": true } to all OS 
 * detection confirmation questions.
 */
// @ts-nocheck
import { describe, it, expect, beforeEach } from 'vitest';
import { useAssessmentStore, initializeStore } from '../features/assessment/state/store';

describe('OS Detection Bug Fix - Prevent Multiple OS Questions', () => {
  beforeEach(() => {
    initializeStore();
  });

  it('CRITICAL: Mac and Linux detection questions must be hidden after Windows confirmation', () => {
    const store = useAssessmentStore.getState();
    
    // Confirm Windows OS
    store.answerQuestion('windows_detection_confirm', 'yes');
    
    // After Windows confirmation, no OS detection questions should appear
    const questions = store.getVisibleQuestionIds();
    const hasAnyOSDetection = questions.some(id => 
      id.includes('detection_confirm') && 
      ['windows', 'mac', 'linux'].some(os => id.includes(os))
    );
    
    expect(hasAnyOSDetection).toBe(false);
    expect(store.factsActions.getFact('os_confirmed')?.value).toBe(true);
    expect(store.factsActions.getFact('os')?.value).toBe('windows');
  });
});