/**
 * Test Data and Utilities for Vitest
 * Simple reusable test data for onboarding and other Q&A flows
 */

import type { DetectedDevice } from '../features/device/deviceDetection';

// Test Device Scenarios for reuse across tests
export const TEST_DEVICES: Record<string, DetectedDevice> = {
  windowsChrome: {
    type: 'desktop',
    os: 'windows',
    browser: 'chrome'
  },
  macSafari: {
    type: 'desktop', 
    os: 'mac',
    browser: 'safari'
  },
  linuxFirefox: {
    type: 'desktop',
    os: 'linux', 
    browser: 'firefox'
  },
  iPhone: {
    type: 'mobile',
    os: 'ios',
    browser: 'safari'
  },
  androidChrome: {
    type: 'mobile',
    os: 'android',
    browser: 'chrome'
  },
  unknownDevice: {
    type: 'desktop',
    os: 'unknown',
    browser: 'unknown'
  }
};

// Test Answer Scenarios for common test cases
export const TEST_ANSWER_SCENARIOS = {
  confirmDetection: {
    windows_confirmation: 'yes',
    chrome_confirmation: 'yes'
  },
  denyDetection: {
    windows_confirmation: 'no',
    os_selection: 'mac',
    browser_selection: 'safari'
  },
  unknownDeviceFlow: {
    os_selection: 'linux',
    browser_selection: 'firefox'
  },
  mobileFlow: {
    os_selection: 'mobile'
  }
};

/**
 * Create a test scenario object
 */
export function createTestScenario(
  device: DetectedDevice,
  answers: Record<string, any>,
  description: string
) {
  return { device, answers, description };
}

/**
 * Assert that a question sequence is logically ordered
 */
export function validateQuestionSequence(
  questionsShown: string[],
  expectedBefore: { question: string, shouldComeBefore: string }[]
): string[] {
  const issues: string[] = [];
  
  for (const { question, shouldComeBefore } of expectedBefore) {
    const questionIndex = questionsShown.indexOf(question);
    const beforeIndex = questionsShown.indexOf(shouldComeBefore);
    
    if (questionIndex !== -1 && beforeIndex !== -1 && questionIndex >= beforeIndex) {
      issues.push(`Question '${question}' should come before '${shouldComeBefore}'`);
    }
  }
  
  return issues;
}
