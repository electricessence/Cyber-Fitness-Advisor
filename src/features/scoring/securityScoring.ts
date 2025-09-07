import type { Answer } from '../assessment/engine/schema';
import type { Question } from '../assessment/engine/schema';
import type { DeviceProfile } from '../assessment/engine/deviceScenarios';

/**
 * Security Scoring System
 * Calculates actual security posture, not just completion percentage
 */

export interface SecurityScore {
  overall: number; // 0-100, relative security strength
  breakdown: {
    device: number;
    passwords: number;
    network: number;
    browsing: number;
    privacy: number;
    backup: number;
  };
  relative: {
    percentile: number; // Where user ranks relative to others (0-100)
    description: string; // "Better than X% of users"
  };
  actionItems: number; // Outstanding tasks/activities
}

export interface QuestionScoring {
  basePoints: number;
  securityImpact: 'critical' | 'high' | 'medium' | 'low';
  deviceMultiplier?: number; // Some questions more important on certain devices
  expirationDays?: number; // How often this should be re-verified
}

/**
 * Question scoring matrix - defines how much each question contributes to actual security
 */
export const QUESTION_SCORING: Record<string, QuestionScoring> = {
  // Device Security (Critical for protection)
  'device-lock-enabled': {
    basePoints: 15,
    securityImpact: 'critical',
    deviceMultiplier: 1.5, // More critical on mobile
  },
  'device-encryption-enabled': {
    basePoints: 20,
    securityImpact: 'critical',
  },
  'os-updates-enabled': {
    basePoints: 18,
    securityImpact: 'critical',
    expirationDays: 30, // Should check monthly
  },
  'antivirus-installed': {
    basePoints: 12,
    securityImpact: 'high',
    deviceMultiplier: 2.0, // Much more critical on Windows
    expirationDays: 7, // Should verify weekly
  },
  
  // Password Security (Foundation of security)
  'password-manager-used': {
    basePoints: 25,
    securityImpact: 'critical',
  },
  'unique-passwords': {
    basePoints: 20,
    securityImpact: 'critical',
  },
  '2fa-enabled-main-accounts': {
    basePoints: 22,
    securityImpact: 'critical',
  },
  
  // Network Security
  'wifi-wpa3-enabled': {
    basePoints: 10,
    securityImpact: 'high',
  },
  'vpn-usage': {
    basePoints: 8,
    securityImpact: 'medium',
  },
  'public-wifi-precautions': {
    basePoints: 12,
    securityImpact: 'high',
  },
  
  // Browsing & Privacy
  'ad-blocker-installed': {
    basePoints: 6,
    securityImpact: 'medium',
  },
  'browser-security-settings': {
    basePoints: 8,
    securityImpact: 'medium',
  },
  'social-media-privacy': {
    basePoints: 5,
    securityImpact: 'low',
  },
  
  // Backup & Recovery
  'regular-backups': {
    basePoints: 15,
    securityImpact: 'high',
    expirationDays: 14, // Should verify bi-weekly
  },
  'backup-encryption': {
    basePoints: 10,
    securityImpact: 'medium',
  },
  
  // Default for unknown questions
  'default': {
    basePoints: 5,
    securityImpact: 'low',
  },
};

/**
 * Calculate security score based on actual protection level
 */
export function calculateSecurityScore(
  answers: Record<string, Answer>,
  deviceProfile: DeviceProfile | null,
  allQuestions: Question[]
): SecurityScore {
  let totalPoints = 0;
  let maxPossiblePoints = 0;
  const breakdown = {
    device: 0,
    passwords: 0,
    network: 0,
    browsing: 0,
    privacy: 0,
    backup: 0,
  };
  let actionItems = 0;

  // Get relevant questions for scoring
  const relevantQuestions = allQuestions.filter(q => 
    !deviceProfile || isQuestionRelevantForDevice(q, deviceProfile)
  );

  for (const question of relevantQuestions) {
    const scoring = QUESTION_SCORING[question.id] || QUESTION_SCORING['default'];
    const answer = answers[question.id];
    
    // Calculate max possible points for this question
    let maxPoints = scoring.basePoints;
    if (scoring.deviceMultiplier && deviceProfile) {
      maxPoints *= getDeviceMultiplier(question, deviceProfile, scoring.deviceMultiplier);
    }
    maxPossiblePoints += maxPoints;

    // Calculate actual points earned
    if (answer && !answer.isExpired) {
      let pointsEarned = 0;
      
      if (question.type === 'YN') {
        // Yes/No questions: full points if true, 0 if false
        pointsEarned = answer.value === true ? maxPoints : 0;
      } else if (question.type === 'SCALE') {
        // Scale questions: proportional points based on numeric value
        if (typeof answer.value === 'number') {
          // Assuming scale is 1-5, normalize to 0-1 ratio
          const scaleRatio = (answer.value - 1) / 4; // Convert 1-5 to 0-1
          pointsEarned = maxPoints * Math.max(0, scaleRatio);
        }
      } else if (question.type === 'ACTION') {
        // Action questions: points when action is completed
        pointsEarned = answer.value ? maxPoints : 0;
        if (!answer.value) {
          actionItems++;
        }
      } else if (question.options && question.options.length > 0) {
        // New flexible option system: award points based on security level of chosen option
        const chosenOption = question.options.find(opt => opt.id === answer.value);
        if (chosenOption) {
          // Award points based on option's security value (0-1)
          const securityRatio = getOptionSecurityRatio(chosenOption);
          pointsEarned = maxPoints * securityRatio;
        }
      }

      totalPoints += pointsEarned;
      
      // Add to breakdown by category
      const category = getCategoryFromQuestion(question);
      breakdown[category] += pointsEarned;
    } else {
      // Unanswered questions count as action items if they're actionable
      if (question.type === 'ACTION' || isActionableQuestion(question)) {
        actionItems++;
      }
    }
  }

  // Calculate overall score (0-100)
  const overall = maxPossiblePoints > 0 ? Math.round((totalPoints / maxPossiblePoints) * 100) : 0;

  // Calculate relative percentile (simplified for now - could be based on real user data)
  const percentile = calculatePercentile(overall);

  return {
    overall,
    breakdown: {
      device: Math.round((breakdown.device / getTotalMaxPoints('device', relevantQuestions)) * 100) || 0,
      passwords: Math.round((breakdown.passwords / getTotalMaxPoints('passwords', relevantQuestions)) * 100) || 0,
      network: Math.round((breakdown.network / getTotalMaxPoints('network', relevantQuestions)) * 100) || 0,
      browsing: Math.round((breakdown.browsing / getTotalMaxPoints('browsing', relevantQuestions)) * 100) || 0,
      privacy: Math.round((breakdown.privacy / getTotalMaxPoints('privacy', relevantQuestions)) * 100) || 0,
      backup: Math.round((breakdown.backup / getTotalMaxPoints('backup', relevantQuestions)) * 100) || 0,
    },
    relative: {
      percentile,
      description: getPercentileDescription(percentile),
    },
    actionItems,
  };
}

/**
 * Check if question is relevant for user's device
 */
function isQuestionRelevantForDevice(question: Question, deviceProfile: DeviceProfile): boolean {
  // Check if question has platform restrictions via conditions
  if (question.conditions?.browserInfo?.platforms) {
    return question.conditions.browserInfo.platforms.some((platform: string) => {
      switch (platform) {
        case 'windows': return deviceProfile.currentDevice.os === 'windows';
        case 'mac': return deviceProfile.currentDevice.os === 'mac';
        case 'linux': return deviceProfile.currentDevice.os === 'linux';
        case 'android': return deviceProfile.currentDevice.os === 'android';
        case 'ios': return deviceProfile.currentDevice.os === 'ios';
        case 'mobile': return ['android', 'ios'].includes(deviceProfile.currentDevice.os);
        case 'desktop': return ['windows', 'mac', 'linux'].includes(deviceProfile.currentDevice.os);
        default: return true;
      }
    });
  }
  
  return true; // Universal question if no platform restrictions
}

/**
 * Get device-specific scoring multiplier
 */
function getDeviceMultiplier(question: Question, deviceProfile: DeviceProfile, baseMultiplier: number): number {
  // Antivirus more important on Windows
  if (question.id.includes('antivirus') && deviceProfile.operatingSystem === 'Windows') {
    return baseMultiplier;
  }
  
  // Device lock more important on mobile
  if (question.id.includes('lock') && ['Android', 'iOS'].includes(deviceProfile.operatingSystem)) {
    return baseMultiplier;
  }
  
  return 1.0;
}

/**
 * Get security ratio for a multiple choice option (0-1)
 */
function getOptionSecurityRatio(option: any): number {
  // This would be defined per question - for now use a simple heuristic
  const secureKeywords = ['strong', 'enabled', 'yes', 'always', 'high', 'secure'];
  const insecureKeywords = ['weak', 'disabled', 'no', 'never', 'low', 'none'];
  
  const text = option.text.toLowerCase();
  
  if (secureKeywords.some(keyword => text.includes(keyword))) {
    return 1.0;
  } else if (insecureKeywords.some(keyword => text.includes(keyword))) {
    return 0.0;
  }
  
  return 0.5; // Neutral/medium option
}

/**
 * Categorize question by security domain
 */
function getCategoryFromQuestion(question: Question): keyof SecurityScore['breakdown'] {
  const id = question.id.toLowerCase();
  
  if (id.includes('password') || id.includes('2fa') || id.includes('auth')) {
    return 'passwords';
  } else if (id.includes('device') || id.includes('lock') || id.includes('encryption') || id.includes('antivirus')) {
    return 'device';
  } else if (id.includes('wifi') || id.includes('network') || id.includes('vpn')) {
    return 'network';
  } else if (id.includes('browser') || id.includes('ad-block')) {
    return 'browsing';
  } else if (id.includes('privacy') || id.includes('social')) {
    return 'privacy';
  } else if (id.includes('backup') || id.includes('recovery')) {
    return 'backup';
  }
  
  return 'device'; // Default category
}

/**
 * Check if question requires action
 */
function isActionableQuestion(question: Question): boolean {
  return question.type === 'action' || 
         question.type === 'boolean' ||
         question.id.includes('install') ||
         question.id.includes('enable') ||
         question.id.includes('setup');
}

/**
 * Get total max points for a category
 */
function getTotalMaxPoints(category: keyof SecurityScore['breakdown'], questions: Question[]): number {
  return questions
    .filter(q => getCategoryFromQuestion(q) === category)
    .reduce((total, q) => {
      const scoring = QUESTION_SCORING[q.id] || QUESTION_SCORING['default'];
      return total + scoring.basePoints;
    }, 0);
}

/**
 * Calculate where user ranks relative to others (0-100 percentile)
 */
function calculatePercentile(score: number): number {
  // Simplified percentile calculation based on typical security score distributions
  // In reality, this would use actual user data
  
  if (score >= 90) return 95; // Top 5%
  if (score >= 80) return 85; // Top 15%
  if (score >= 70) return 70; // Top 30%
  if (score >= 60) return 55; // Above average
  if (score >= 50) return 40; // Below average
  if (score >= 40) return 25; // Bottom 75%
  if (score >= 30) return 15; // Bottom 85%
  return 5; // Bottom 95%
}

/**
 * Get user-friendly description of percentile ranking
 */
function getPercentileDescription(percentile: number): string {
  if (percentile >= 95) return "More secure than 95% of users - excellent!";
  if (percentile >= 85) return "More secure than 85% of users - great job!";
  if (percentile >= 70) return "More secure than 70% of users - doing well!";
  if (percentile >= 55) return "More secure than average users";
  if (percentile >= 40) return "Below average security - room for improvement";
  if (percentile >= 25) return "Well below average - significant improvements needed";
  return "Much less secure than most users - urgent attention required";
}
