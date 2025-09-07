import type { Answer } from '../assessment/engine/schema';
import type { DeviceProfile } from '../assessment/engine/deviceScenarios';

/**
 * Security Level Progression System
 * Game-like advancement through security maturity levels
 */

export interface SecurityLevel {
  id: string;
  title: string;
  description: string;
  badge: string;
  color: string;
  minScore: number;
  benefits: string[];
  nextLevelHint?: string;
}

export const SECURITY_LEVELS: SecurityLevel[] = [
  {
    id: 'getting_started',
    title: 'Getting Started',
    description: 'Learning the basics of digital security',
    badge: '🛡️',
    color: 'gray',
    minScore: 0,
    benefits: [
      'Understanding security fundamentals',
      'Starting your security journey'
    ],
    nextLevelHint: 'Complete a few quick security wins to level up!'
  },
  {
    id: 'security_aware',
    title: 'Security Aware',
    description: 'You know the basics and have some protections in place',
    badge: '🔒',
    color: 'blue',
    minScore: 15,
    benefits: [
      'Basic device protection enabled',
      'Password awareness improved',
      'Understanding common threats'
    ],
    nextLevelHint: 'Set up stronger authentication to advance!'
  },
  {
    id: 'well_protected',
    title: 'Well Protected',
    description: 'Strong security habits are becoming second nature',
    badge: '🔐',
    color: 'green',
    minScore: 40,
    benefits: [
      'Multi-factor authentication in use',
      'Regular security updates',
      'Good password hygiene',
      'Backup systems in place'
    ],
    nextLevelHint: 'Add advanced privacy controls to reach the next level!'
  },
  {
    id: 'security_savvy',
    title: 'Security Savvy',
    description: 'You have comprehensive security practices',
    badge: '🛡️⭐',
    color: 'purple',
    minScore: 70,
    benefits: [
      'Advanced threat protection',
      'Privacy-focused browsing',
      'Secure communication tools',
      'Network security awareness'
    ],
    nextLevelHint: 'Fine-tune advanced settings to reach expert level!'
  },
  {
    id: 'security_expert',
    title: 'Security Expert',
    description: 'You have mastered digital security best practices',
    badge: '👑',
    color: 'gold',
    minScore: 90,
    benefits: [
      'Comprehensive threat protection',
      'Advanced privacy controls',
      'Secure infrastructure',
      'Security mentorship capabilities'
    ]
  }
];

export interface ProgressionInfo {
  currentLevel: SecurityLevel;
  nextLevel?: SecurityLevel;
  currentScore: number;
  pointsToNextLevel?: number;
  recentAchievements: string[];
  suggestedActions: string[];
}

/**
 * Calculate current security level and progression info
 */
export function calculateSecurityProgression(
  score: number,
  recentAnswers: Answer[],
  deviceProfile: DeviceProfile
): ProgressionInfo {
  // Find current level
  let currentLevel = SECURITY_LEVELS[0];
  for (let i = SECURITY_LEVELS.length - 1; i >= 0; i--) {
    if (score >= SECURITY_LEVELS[i].minScore) {
      currentLevel = SECURITY_LEVELS[i];
      break;
    }
  }

  // Find next level
  const nextLevel = SECURITY_LEVELS.find(level => level.minScore > score);
  const pointsToNextLevel = nextLevel ? nextLevel.minScore - score : undefined;

  // Generate recent achievements
  const recentAchievements = generateRecentAchievements(recentAnswers);

  // Generate suggested actions
  const suggestedActions = generateSuggestedActions(currentLevel, deviceProfile, score);

  return {
    currentLevel,
    nextLevel,
    currentScore: score,
    pointsToNextLevel,
    recentAchievements,
    suggestedActions
  };
}

/**
 * Generate recent achievements based on recent answers
 */
function generateRecentAchievements(recentAnswers: Answer[]): string[] {
  const achievements: string[] = [];
  
  // Look at last few answers for achievements
  recentAnswers.slice(-5).forEach(answer => {
    if (answer.pointsEarned && answer.pointsEarned > 0) {
      if (answer.questionId.includes('password_manager')) {
        achievements.push('🔐 Password Manager Activated');
      } else if (answer.questionId.includes('two_factor') || answer.questionId.includes('2fa')) {
        achievements.push('🔒 Two-Factor Authentication Enabled');
      } else if (answer.questionId.includes('update')) {
        achievements.push('🔄 Auto-Updates Configured');
      } else if (answer.questionId.includes('backup')) {
        achievements.push('💾 Backup System Established');
      } else if (answer.questionId.includes('lock_screen')) {
        achievements.push('📱 Screen Lock Secured');
      } else if (answer.pointsEarned >= 10) {
        achievements.push('⭐ High-Impact Security Win');
      }
    }
  });

  return [...new Set(achievements)]; // Remove duplicates
}

/**
 * Generate contextual suggested actions based on current level and profile
 */
function generateSuggestedActions(
  currentLevel: SecurityLevel,
  deviceProfile: DeviceProfile,
  currentScore: number
): string[] {
  const suggestions: string[] = [];

  // Level-based suggestions
  if (currentLevel.id === 'getting_started') {
    suggestions.push('Enable device screen locks');
    suggestions.push('Set up browser password saving');
    if (deviceProfile.otherDevices.hasWindows) {
      suggestions.push('Turn on Windows automatic updates');
    }
    if (deviceProfile.otherDevices.hasIPhone) {
      suggestions.push('Enable iPhone Face ID or Touch ID');
    }
  } else if (currentLevel.id === 'security_aware') {
    suggestions.push('Set up a dedicated password manager');
    suggestions.push('Enable two-factor authentication');
    suggestions.push('Configure automatic backups');
  } else if (currentLevel.id === 'well_protected') {
    suggestions.push('Review app permissions');
    suggestions.push('Set up secure email practices');
    suggestions.push('Configure privacy-focused browsing');
  } else if (currentLevel.id === 'security_savvy') {
    suggestions.push('Implement network security measures');
    suggestions.push('Set up encrypted messaging');
    suggestions.push('Review financial account security');
  }

  // Device-specific suggestions
  if (deviceProfile.otherDevices.hasWindows && currentScore < 50) {
    suggestions.push('Configure Windows Defender settings');
  }
  if (deviceProfile.otherDevices.hasIPhone && currentScore < 30) {
    suggestions.push('Review iOS privacy settings');
  }
  if (deviceProfile.otherDevices.hasAndroid && currentScore < 30) {
    suggestions.push('Check Android security settings');
  }

  return suggestions.slice(0, 3); // Limit to top 3 suggestions
}

/**
 * Check if user just leveled up
 */
export function checkLevelUp(previousScore: number, newScore: number): SecurityLevel | null {
  // Find the highest level that the previous score qualified for
  let previousLevel: SecurityLevel | undefined;
  for (let i = SECURITY_LEVELS.length - 1; i >= 0; i--) {
    if (previousScore >= SECURITY_LEVELS[i].minScore) {
      previousLevel = SECURITY_LEVELS[i];
      break;
    }
  }
  
  // Find the highest level that the new score qualifies for
  let newLevel: SecurityLevel | undefined;
  for (let i = SECURITY_LEVELS.length - 1; i >= 0; i--) {
    if (newScore >= SECURITY_LEVELS[i].minScore) {
      newLevel = SECURITY_LEVELS[i];
      break;
    }
  }
  
  if (previousLevel && newLevel && previousLevel.id !== newLevel.id) {
    return newLevel;
  }
  
  return null;
}

/**
 * Get level-up celebration message
 */
export function getLevelUpMessage(newLevel: SecurityLevel): string {
  const messages = {
    'security_aware': '🎉 Great job! You\'ve learned the security basics and are building good habits.',
    'well_protected': '🔒 Excellent progress! Your security setup is getting solid.',
    'security_savvy': '⭐ Outstanding! You\'ve mastered advanced security practices.',
    'security_expert': '👑 Incredible! You\'re now a security expert. Well done!'
  };
  
  return messages[newLevel.id as keyof typeof messages] || `🎉 Congratulations! You've reached ${newLevel.title}!`;
}
