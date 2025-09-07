import type { Answer, Question, QuestionBank } from '../assessment/engine/schema';
import type { DeviceProfile } from '../assessment/engine/deviceScenarios';

export interface SecurityGap {
  questionId: string;
  category: string;
  severity: 'critical' | 'medium' | 'unknown';
  description: string;
  recommendation: string;
}

export interface SecurityScoreBreakdown {
  answeredQuestions: number;
  totalSecurityPoints: number;
  maxPossiblePoints: number;
  coveragePercentage: number;
}

export interface SecurityScoreInfo {
  overallSecurityScore: number; // 0-100 - how secure you actually are
  criticalVulnerabilities: number;
  securityGaps: SecurityGap[];
  achievements: string[];
  breakdown: SecurityScoreBreakdown;
}

/**
 * Check if a question is relevant to the user's device/platform
 */
function isQuestionRelevantToUser(question: Question, deviceProfile: DeviceProfile | null): boolean {
  if (!deviceProfile) return true;
  
  // If question has conditions, check them
  if (question.conditions?.browserInfo) {
    const browserInfo = question.conditions.browserInfo;
    
    // Check platform (OS)
    if (browserInfo.platforms && browserInfo.platforms.length > 0) {
      const userOS = deviceProfile.currentDevice.os;
      if (!browserInfo.platforms.includes(userOS)) {
        return false;
      }
    }
    
    // Check browser
    if (browserInfo.browsers && browserInfo.browsers.length > 0) {
      const userBrowser = deviceProfile.currentDevice.browser;
      if (!browserInfo.browsers.includes(userBrowser)) {
        return false;
      }
    }
  }
  
  return true;
}

/**
 * Calculate security score from answers based on actual security impact
 * This represents how secure the user actually is, not just completion percentage
 */
export function calculateRealSecurityScore(
  answers: Record<string, Answer>, 
  questionBank: QuestionBank,
  deviceProfile: DeviceProfile | null
): SecurityScoreInfo {
  let totalSecurityScore = 0;
  let maxPossibleScore = 0;
  let criticalVulnerabilities = 0;
  const securityGaps: SecurityGap[] = [];
  const achievements: string[] = [];

  // Weight categories by security impact
  const categoryWeights = {
    'system_security': 1.2,        // OS updates, firewall - critical
    'password_security': 1.1,      // Password practices - very important
    'data_protection': 1.0,        // Encryption, backups - important
    'network_security': 0.9,       // WiFi, VPN - contextual
    'browser_security': 0.8,       // Browser settings - moderate
    'email_security': 0.7,         // Email practices - moderate
    'social_media': 0.5,           // Social media - lower impact
    'physical_security': 0.6       // Device physical security - contextual
  };

  // Process each domain
  questionBank.domains.forEach(domain => {
    domain.levels.forEach(level => {
      level.questions.forEach(question => {
        // Skip if question not relevant to user's device
        if (!isQuestionRelevantToUser(question, deviceProfile)) {
          return;
        }

        const answer = answers[question.id];
        const categoryWeight = categoryWeights[question.category as keyof typeof categoryWeights] || 1.0;
        let questionMaxScore = 0;
        let questionActualScore = 0;

        // Calculate max possible score for this question
        if (question.type === 'YN') {
          questionMaxScore = (question.weight || 5) * categoryWeight;
        } else if (question.type === 'SCALE') {
          questionMaxScore = (question.weight || 5) * categoryWeight;
        } else if (question.type === 'ACTION' && question.actionOptions) {
          // Max score is the highest point option
          const maxPoints = Math.max(...question.actionOptions.map(opt => opt.points || 0));
          questionMaxScore = maxPoints * categoryWeight;
        }

        maxPossibleScore += questionMaxScore;

        if (answer) {
          // Calculate actual score based on answer
          if (question.type === 'YN') {
            questionActualScore = answer.value === true 
              ? questionMaxScore 
              : 0;
          } else if (question.type === 'SCALE') {
            const scaleValue = typeof answer.value === 'number' ? answer.value : 1;
            // Scale 1-5, where 5 is best security practice
            questionActualScore = (scaleValue / 5) * questionMaxScore;
          } else if (question.type === 'ACTION' && question.actionOptions) {
            const selectedOption = question.actionOptions.find(opt => opt.id === answer.value);
            if (selectedOption) {
              questionActualScore = (selectedOption.points || 0) * categoryWeight;
            }
          }

          totalSecurityScore += questionActualScore;

          // Track critical vulnerabilities
          const isHighImpact = (question.weight || 5) >= 8;
          const isLowScore = questionActualScore < (questionMaxScore * 0.3);
          
          if (isHighImpact && isLowScore) {
            criticalVulnerabilities++;
            securityGaps.push({
              questionId: question.id,
              category: question.category || 'other',
              severity: 'critical',
              description: question.text,
              recommendation: question.actionHint || 'Improve this security practice'
            });
          } else if (questionActualScore < (questionMaxScore * 0.6)) {
            securityGaps.push({
              questionId: question.id,
              category: question.category || 'other', 
              severity: 'medium',
              description: question.text,
              recommendation: question.actionHint || 'Consider improving this'
            });
          }

          // Track achievements
          if (questionActualScore >= questionMaxScore * 0.9) {
            achievements.push(`Excellent ${question.category} security!`);
          }
        } else {
          // Unanswered question - assume worst case for scoring
          if ((question.weight || 5) >= 8) {
            criticalVulnerabilities++;
            securityGaps.push({
              questionId: question.id,
              category: question.category || 'other',
              severity: 'unknown',
              description: question.text,
              recommendation: 'Complete this security assessment'
            });
          }
        }
      });
    });
  });

  // Calculate percentage (0-100)
  const securityPercentage = maxPossibleScore > 0 
    ? Math.round((totalSecurityScore / maxPossibleScore) * 100)
    : 0;

  return {
    overallSecurityScore: securityPercentage,
    criticalVulnerabilities,
    securityGaps,
    achievements: [...new Set(achievements)], // Remove duplicates
    breakdown: {
      answeredQuestions: Object.keys(answers).length,
      totalSecurityPoints: Math.round(totalSecurityScore),
      maxPossiblePoints: Math.round(maxPossibleScore),
      coveragePercentage: securityPercentage
    }
  };
}

/**
 * Get security level based on actual security score (not curriculum progress)
 */
export function getSecurityLevelFromScore(securityScore: number): string {
  if (securityScore >= 90) return "Highly Secure";
  if (securityScore >= 75) return "Well Protected";
  if (securityScore >= 60) return "Moderately Secure";
  if (securityScore >= 40) return "Vulnerable";
  return "At Risk";
}

/**
 * Get comparative security status
 */
export function getSecurityComparison(securityScore: number): string {
  if (securityScore >= 85) return "Top 10% - Exceptional security practices";
  if (securityScore >= 70) return "Top 25% - Above average protection";
  if (securityScore >= 55) return "Average - Typical security level";
  if (securityScore >= 35) return "Below average - Needs improvement";
  return "Bottom 25% - Significant security risks";
}
