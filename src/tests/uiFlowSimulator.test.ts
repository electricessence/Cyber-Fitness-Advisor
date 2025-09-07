import { describe, it, expect } from 'vitest';
import type { DeviceProfile } from '../features/assessment/engine/deviceScenarios';
import { simulateUserFlow } from './deviceScenarioFlows.test';

/**
 * UI Flow Simulator - Tests the complete user experience flows
 * These tests simulate user interactions and verify the UI responds correctly
 */
describe('UI Flow Simulations', () => {
  
  describe('Complete Windows + iPhone User Journey', () => {
    const deviceProfile: DeviceProfile = {
      currentDevice: { type: 'desktop', os: 'windows', browser: 'firefox' },
      otherDevices: {
        hasWindows: true, hasMac: false, hasLinux: false,
        hasIPhone: true, hasAndroid: false, hasIPad: false
      },
      primaryDesktop: 'windows',
      primaryMobile: 'ios'
    };

    it('should guide user through optimal security path', () => {
      // Simulate user giving good answers
      const goodAnswers = {
        'windows_update_frequency': 'immediately',
        'windows_virus_scan_frequency': 'automatic_daily', 
        'ios_passcode_security': 'face_id_touch_id',
        'password_management_strategy': 'dedicated_password_manager'
      };

      const result = simulateUserFlow(deviceProfile, goodAnswers);
      
      expect(result.answeredQuestions).toBe(4);
      expect(result.upcomingFollowUps.length).toBe(0); // No follow-ups needed for good answers
      
      // Should have few remaining questions (most handled by good practices)
      expect(result.unansweredQuestions.length).toBeGreaterThan(0);
      expect(result.unansweredQuestions.length).toBeLessThan(10);
    });

    it('should create intensive follow-up schedule for poor security practices', () => {
      // Simulate user giving poor answers
      const poorAnswers = {
        'windows_update_frequency': 'ignore_them',
        'windows_virus_scan_frequency': 'rarely_never',
        'ios_passcode_security': 'no_lock',
        'password_management_strategy': 'reuse_passwords'
      };

      const result = simulateUserFlow(deviceProfile, poorAnswers);
      
      expect(result.answeredQuestions).toBe(4);
      expect(result.upcomingFollowUps.length).toBe(4); // All answers create follow-ups
      
      // Check that follow-ups have appropriate urgency
      const urgentFollowUps = result.upcomingFollowUps.filter(f => 
        f.reason.includes('urgent') || f.reason.includes('critical')
      );
      expect(urgentFollowUps.length).toBeGreaterThan(0);
    });

    it('should create mixed follow-up schedule for inconsistent practices', () => {
      const mixedAnswers = {
        'windows_update_frequency': 'within_week', // Good but could be better
        'windows_virus_scan_frequency': 'monthly', // Moderate
        'ios_passcode_security': 'face_id_touch_id', // Excellent
        'password_management_strategy': 'browser_passwords' // Okay
      };

      const result = simulateUserFlow(deviceProfile, mixedAnswers);
      
      expect(result.upcomingFollowUps.length).toBe(3); // iOS doesn't need follow-up
      
      // Should have mix of urgency levels
      const reasons = result.upcomingFollowUps.map(f => f.reason);
      expect(reasons.some(r => r.includes('reminder'))).toBe(true);
      expect(reasons.some(r => r.includes('check'))).toBe(true);
    });
  });

  describe('Mobile-First iPhone User Journey', () => {
    const deviceProfile: DeviceProfile = {
      currentDevice: { type: 'mobile', os: 'ios', browser: 'safari' },
      otherDevices: {
        hasWindows: false, hasMac: true, hasLinux: false,
        hasIPhone: true, hasAndroid: false, hasIPad: false
      },
      primaryDesktop: 'mac',
      primaryMobile: 'ios'
    };

    it('should focus on iOS and Mac ecosystem security', () => {
      const answers = {
        'ios_passcode_enabled': 'yes',
        'ios_biometric_enabled': 'yes',
        'ios_auto_updates': 'yes',
        'macos_update_frequency': 'automatic'
      };

      const result = simulateUserFlow(deviceProfile, answers);
      
      // Should have good coverage of Apple ecosystem
      expect(result.answeredQuestions).toBeGreaterThan(0);
      
      // Check that no Windows-specific questions appear in unanswered
      const windowsQuestions = result.unansweredQuestions.filter(q => 
        q.id.includes('windows') && !q.id.includes('cross_platform')
      );
      expect(windowsQuestions.length).toBe(0);
    });
  });

  describe('Basic User (Older Adult) Journey', () => {
    const deviceProfile: DeviceProfile = {
      currentDevice: { type: 'desktop', os: 'windows', browser: 'edge' },
      otherDevices: {
        hasWindows: true, hasMac: false, hasLinux: false,
        hasIPhone: false, hasAndroid: false, hasIPad: false
      },
      primaryDesktop: 'windows',
      primaryMobile: 'none'
    };

    it('should prioritize essential security with simple language', () => {
      const answers = {
        'windows_defender_enabled': 'yes',
        'windows_firewall_enabled': 'yes',
        'email_provider_security': 'gmail'
      };

      const result = simulateUserFlow(deviceProfile, answers);
      
      // Should focus on basics, not overwhelm with advanced options
      expect(result.unansweredQuestions.length).toBeLessThan(15);
      
      // No mobile questions should appear
      const mobileQuestions = result.unansweredQuestions.filter(q => 
        q.text.includes('phone') || q.text.includes('mobile')
      );
      expect(mobileQuestions.length).toBe(0);
    });
  });
});

/**
 * UI State Test Generator
 * Generates expected UI states for different scenarios
 */
export function generateUIState(deviceProfile: DeviceProfile, answers: Record<string, any>) {
  const flowResult = simulateUserFlow(deviceProfile, answers);
  
  return {
    // Onboarding state
    onboarding: {
      shouldShow: !deviceProfile,
      detectedDevice: deviceProfile?.currentDevice,
      questions: [] // Would be populated from device onboarding questions
    },
    
    // Main assessment state
    assessment: {
      currentQuestions: flowResult.unansweredQuestions.slice(0, 5), // Show first 5
      progress: {
        answered: flowResult.answeredQuestions,
        total: flowResult.totalQuestions,
        percentage: Math.round((flowResult.answeredQuestions / flowResult.totalQuestions) * 100)
      },
      score: flowResult.securityScore
    },
    
    // Response catalog state
    responses: {
      total: flowResult.answeredQuestions,
      expired: flowResult.expiredAnswers.length,
      upcomingFollowUps: flowResult.upcomingFollowUps
    },
    
    // Recommendations state
    recommendations: {
      urgent: flowResult.upcomingFollowUps.filter(f => 
        f.reason.includes('urgent') || f.reason.includes('critical')
      ).length,
      routine: flowResult.upcomingFollowUps.filter(f => 
        f.reason.includes('reminder') || f.reason.includes('check')
      ).length
    },
    
    // Navigation state
    navigation: {
      availableDomains: [...new Set(flowResult.unansweredQuestions.map(() => 
        // Extract domain from question structure - simplified for now
        'general'
      ))],
      currentDomain: 'general',
      showDeviceSpecificSections: true
    }
  };
}

/**
 * Test UI Component Behavior
 * These tests verify that UI components respond correctly to different states
 */
describe('UI Component Behavior Tests', () => {
  it('should show device onboarding for new users', () => {
    const uiState = generateUIState(null as any, {});
    expect(uiState.onboarding.shouldShow).toBe(true);
  });

  it('should show progress based on answered questions', () => {
    const deviceProfile: DeviceProfile = {
      currentDevice: { type: 'desktop', os: 'windows', browser: 'chrome' },
      otherDevices: { hasWindows: true, hasMac: false, hasLinux: false, hasIPhone: true, hasAndroid: false, hasIPad: false },
      primaryDesktop: 'windows',
      primaryMobile: 'ios'
    };

    const answers = {
      'windows_update_frequency': 'immediately',
      'ios_passcode_security': 'face_id_touch_id'
    };

    const uiState = generateUIState(deviceProfile, answers);
    expect(uiState.assessment.progress.answered).toBe(2);
    expect(uiState.assessment.progress.percentage).toBeGreaterThan(0);
  });

  it('should highlight urgent follow-ups in recommendations', () => {
    const deviceProfile: DeviceProfile = {
      currentDevice: { type: 'desktop', os: 'windows', browser: 'chrome' },
      otherDevices: { hasWindows: true, hasMac: false, hasLinux: false, hasIPhone: false, hasAndroid: false, hasIPad: false },
      primaryDesktop: 'windows',
      primaryMobile: 'none'
    };

    const poorAnswers = {
      'windows_update_frequency': 'ignore_them',
      'windows_virus_scan_frequency': 'rarely_never'
    };

    const uiState = generateUIState(deviceProfile, poorAnswers);
    expect(uiState.recommendations.urgent).toBeGreaterThan(0);
  });
});

/**
 * Integration Test Helper
 * Simulates complete user journeys from start to finish
 */
export function simulateCompleteUserJourney(
  startingDevice: { os: string; browser: string; type: string },
  onboardingAnswers: Record<string, any>,
  assessmentAnswers: Record<string, any>
) {
  // Step 1: Device detection and onboarding
  const deviceProfile: DeviceProfile = {
    currentDevice: startingDevice as any,
    otherDevices: {
      hasWindows: onboardingAnswers.primary_desktop === 'windows' || startingDevice.os === 'windows',
      hasMac: onboardingAnswers.primary_desktop === 'mac' || startingDevice.os === 'mac',
      hasLinux: onboardingAnswers.primary_desktop === 'linux',
      hasIPhone: onboardingAnswers.primary_mobile === 'iphone',
      hasAndroid: onboardingAnswers.primary_mobile === 'android',
      hasIPad: false
    },
    primaryDesktop: onboardingAnswers.primary_desktop,
    primaryMobile: onboardingAnswers.primary_mobile === 'iphone' ? 'ios' : 
                   onboardingAnswers.primary_mobile === 'android' ? 'android' : undefined
  };

  // Step 2: Assessment flow
  const assessmentResult = simulateUserFlow(deviceProfile, assessmentAnswers);

  // Step 3: Generate final UI state
  const finalUIState = generateUIState(deviceProfile, assessmentAnswers);

  return {
    deviceProfile,
    assessmentResult,
    finalUIState,
    journey: {
      onboardingCompleted: true,
      questionsAnswered: assessmentResult.answeredQuestions,
      securityScore: assessmentResult.securityScore,
      followUpSchedule: assessmentResult.upcomingFollowUps,
      nextSteps: finalUIState.recommendations
    }
  };
}
