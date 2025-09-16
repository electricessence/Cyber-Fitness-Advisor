/**
 * Badge System Integration Test
 * 
 * Test to verify the badge system is working correctly with the assessment store
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BadgeEngine } from '../features/badges/badgeEngine';
import { ACHIEVEMENT_BADGES } from '../features/badges/badgeDefinitions';
import type { BadgeEvaluationContext } from '../features/badges/badgeEngine';

describe('Badge System Integration', () => {
  let badgeEngine: BadgeEngine;
  let mockContext: BadgeEvaluationContext;

  beforeEach(() => {
    badgeEngine = new BadgeEngine();
    mockContext = {
      answers: {},
      currentScore: 0,
      currentLevel: 0,
      deviceProfile: {
        currentDevice: {
          type: 'desktop',
          os: 'windows',
          browser: 'chrome'
        },
        otherDevices: {
          hasWindows: true,
          hasMac: false,
          hasLinux: false,
          hasIPhone: false,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'windows'
      },
      quickWinsCompleted: 0,
      earnedBadges: []
    };
  });

  it('should evaluate all badges correctly', () => {
    const result = badgeEngine.evaluateAllBadges(mockContext);
    
    expect(result).toBeDefined();
    expect(result.allProgress).toHaveLength(ACHIEVEMENT_BADGES.length);
    expect(result.newlyUnlocked).toHaveLength(0); // No badges unlocked initially
    expect(result.totalBadgesEarned).toBe(0);
  });

  it('should unlock "First Steps" badge after 5 answers', () => {
    // Simulate 5 answers
    for (let i = 0; i < 5; i++) {
      mockContext.answers[`question_${i}`] = {
        questionId: `question_${i}`,
        value: 'yes',
        timestamp: new Date(),
        pointsEarned: 5,
        questionText: `Test question ${i}`
      };
    }

    const result = badgeEngine.evaluateAllBadges(mockContext);
    const firstStepsBadge = result.allProgress.find(p => p.badgeId === 'first_steps');
    
    expect(firstStepsBadge).toBeDefined();
    expect(firstStepsBadge?.isUnlocked).toBe(true);
    expect(firstStepsBadge?.progress).toBe(1);
  });

  it('should track progress toward "Quick Starter" badge', () => {
    // Simulate 2 quick wins (need 3 for badge)
    mockContext.quickWinsCompleted = 2;

    const result = badgeEngine.evaluateAllBadges(mockContext);
    const quickStarterBadge = result.allProgress.find(p => p.badgeId === 'quick_starter');
    
    expect(quickStarterBadge).toBeDefined();
    expect(quickStarterBadge?.isUnlocked).toBe(false);
    expect(quickStarterBadge?.progress).toBeCloseTo(2/3, 2); // 2 out of 3
    expect(quickStarterBadge?.currentValue).toBe(2);
    expect(quickStarterBadge?.targetValue).toBe(3);
  });

  it('should unlock "Security Conscious" badge at level 3', () => {
    mockContext.currentLevel = 3;

    const result = badgeEngine.evaluateAllBadges(mockContext);
    const securityConsciousBadge = result.allProgress.find(p => p.badgeId === 'security_conscious');
    
    expect(securityConsciousBadge).toBeDefined();
    expect(securityConsciousBadge?.isUnlocked).toBe(true);
    expect(securityConsciousBadge?.progress).toBe(1);
  });

  it('should track score-based badge progress', () => {
    mockContext.currentScore = 50; // 50% toward perfect score

    const result = badgeEngine.evaluateAllBadges(mockContext);
    const perfectScoreBadge = result.allProgress.find(p => p.badgeId === 'perfect_score');
    
    expect(perfectScoreBadge).toBeDefined();
    expect(perfectScoreBadge?.isUnlocked).toBe(false);
    expect(perfectScoreBadge?.progress).toBe(0.5); // 50/100
  });

  it('should provide next recommended badges', () => {
    // Add some progress
    mockContext.answers['password_manager'] = {
      questionId: 'password_manager',
      value: 'yes',
      timestamp: new Date(),
      pointsEarned: 10,
      questionText: 'Do you use a password manager?'
    };
    mockContext.quickWinsCompleted = 2;

    const recommended = badgeEngine.getNextRecommendedBadges(mockContext);
    
    expect(recommended).toBeDefined();
    expect(recommended.length).toBeGreaterThan(0);
    expect(recommended.length).toBeLessThanOrEqual(3);
  });

  it('should organize badges by category', () => {
    const categories = badgeEngine.getBadgesByCategory();
    
    expect(categories).toBeDefined();
    expect(categories.foundation).toBeDefined();
    expect(categories.domain).toBeDefined();
    expect(categories.milestone).toBeDefined();
    expect(categories.streak).toBeDefined();
    expect(categories.special).toBeDefined();
  });

  it('should handle domain mastery evaluation', () => {
    // Add password-related answers
    mockContext.answers['password_manager'] = {
      questionId: 'password_manager',
      value: 'yes',
      timestamp: new Date(),
      pointsEarned: 25,
      questionText: 'Password manager'
    };
    mockContext.answers['password_strength'] = {
      questionId: 'password_strength',
      value: 'all_unique',
      timestamp: new Date(),
      pointsEarned: 25,
      questionText: 'Password strength'
    };

    const result = badgeEngine.evaluateAllBadges(mockContext);
    const passwordMasterBadge = result.allProgress.find(p => p.badgeId === 'password_master');
    
    expect(passwordMasterBadge).toBeDefined();
    expect(passwordMasterBadge?.progress).toBeGreaterThan(0);
  });

  it('should detect newly unlocked badges', () => {
    // Start with no earned badges
    mockContext.earnedBadges = [];
    
    // Add enough answers to unlock first_steps
    for (let i = 0; i < 5; i++) {
      mockContext.answers[`question_${i}`] = {
        questionId: `question_${i}`,
        value: 'yes',
        timestamp: new Date(),
        pointsEarned: 5,
        questionText: `Test question ${i}`
      };
    }

    const result = badgeEngine.evaluateAllBadges(mockContext);
    
    expect(result.newlyUnlocked).toHaveLength(1);
    expect(result.newlyUnlocked[0].badge.id).toBe('first_steps');
    expect(result.newlyUnlocked[0].isNewlyUnlocked).toBe(true);
  });
});