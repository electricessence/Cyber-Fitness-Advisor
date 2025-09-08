import type { Question, QuestionBank } from './schema';
import { DEFAULT_LEVEL_THRESHOLDS } from './schema';

export function normalizeAnswer(question: Question, value: boolean | number | string): number {
  // Handle new three-option system
  if (value === 'yes') return 1;
  if (value === 'no') return 0;
  if (value === 'unsure') return 0.3; // Partial credit for awareness but uncertainty
  
  if (question.type === 'YN') {
    return value as boolean ? 1 : 0;
  } else if (question.type === 'SCALE') {
    // SCALE: convert 1-5 to 0-1, with a slight boost for any effort
    const numValue = value as number;
    return Math.max(0, (numValue - 1) / 4);
  } else if (question.type === 'ACTION') {
    // ACTION: check if the selected option gives any points
    const selectedOption = question.actionOptions?.find(opt => opt.id === value as string);
    return selectedOption && selectedOption.points > 0 ? 1 : 0;
  }
  return 0;
}

export function calculateQuestionPoints(question: Question, value: boolean | number | string): number {
  // Phase 2.2: Onboarding questions don't contribute to score
  if (question.nonScoring) {
    return 0;
  }

  // Handle onboarding questions (they have weight but no type)
  if (!question.type && question.weight) {
    // For onboarding questions, give full points for positive responses
    const positiveResponses = ['yes', 'weekly', 'monthly', 'unique', 'strong', 'automatic', 'high', 'expert', 'desktop', 'mobile'];
    const partialResponses = ['sometimes', 'basic', 'medium', 'novice'];
    
    if (positiveResponses.includes(value as string)) {
      return question.weight;
    } else if (partialResponses.includes(value as string)) {
      return question.weight * 0.6; // 60% credit for partial answers
    } else {
      return question.weight * 0.2; // 20% credit for any answer (better than nothing)
    }
  }

  // Handle new three-option system
  if (value === 'yes') {
    let points = question.weight || 0;
    if (question.quickWin) points *= 1.25;
    return points;
  }
  if (value === 'no') return 0;
  if (value === 'unsure') {
    // Partial credit for awareness - 30% of full points  
    let points = (question.weight || 0) * 0.3;
    if (question.quickWin) points *= 1.25;
    return points;
  }

  if (question.type === 'ACTION') {
    // For ACTION questions, use the points directly from the selected option
    const selectedOption = question.actionOptions?.find(opt => opt.id === value as string);
    let points = selectedOption?.points || 0;
    
    // Quick win bonus! 25% boost for easy high-impact actions
    if (question.quickWin && points > 0) {
      points *= 1.25;
    }
    
    return points;
  } else {
    // For YN and SCALE questions, use the normalized approach
    const normalized = normalizeAnswer(question, value);
    let points = question.weight * normalized;
    
    // Quick win bonus! 25% boost for easy high-impact actions
    if (question.quickWin && normalized > 0) {
      points *= 1.25;
    }
    
    return points;
  }
}

export function calculateDomainScore(
  domain: { levels: { questions: Question[] }[] },
  answers: Record<string, { questionId: string; value: boolean | number | string }>
): { score: number; maxPossible: number; progress: number } {
  let totalPoints = 0;
  let maxPoints = 0;
  let answeredQuestions = 0;
  let totalQuestions = 0;

  domain.levels.forEach(level => {
    level.questions.forEach(question => {
      totalQuestions++;
      let questionWeight = question.weight;
      if (question.quickWin) questionWeight *= 1.25; // Factor in quick win bonus
      
      maxPoints += questionWeight;
      
      const answer = answers[question.id];
      if (answer) {
        answeredQuestions++;
        totalPoints += calculateQuestionPoints(question, answer.value);
      }
    });
  });

  const score = maxPoints > 0 ? (totalPoints / maxPoints) * 100 : 0;
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  
  return { score, maxPossible: maxPoints, progress };
}

export function calculateOverallScore(
  questionBank: QuestionBank,
  answers: Record<string, { questionId: string; value: boolean | number | string; pointsEarned?: number }>
): { 
  overallScore: number;
  domainScores: Record<string, number>;
  level: number;
  quickWinsCompleted: number;
  totalQuickWins: number;
} {
  const domainScores: Record<string, number> = {};
  let totalWeightedScore = 0;
  let totalWeight = 0;
  let quickWinsCompleted = 0;
  let totalQuickWins = 0;

  // Calculate domain scores and track quick wins
  questionBank.domains.forEach(domain => {
    const result = calculateDomainScore(domain, answers);
    domainScores[domain.id] = Math.round(result.score);
    
    // Debug: Log domain scores to catch any string concatenation issues
    if (domain.title === 'Device Security') {
      console.log('Device Security domain score:', domainScores[domain.id], typeof domainScores[domain.id]);
    }
    
    // Weight domains by their importance (Quick Wins domain gets 2x weight)
    const domainWeight = domain.id === 'quickwins' ? 2 : 1;
    totalWeightedScore += result.score * domainWeight;
    totalWeight += domainWeight;

    // Count quick wins
    domain.levels.forEach(level => {
      level.questions.forEach(question => {
        if (question.quickWin) {
          totalQuickWins++;
          const answer = answers[question.id];
          if (answer && normalizeAnswer(question, answer.value) > 0.5) {
            quickWinsCompleted++;
          }
        }
      });
    });
  });

  // Add points from onboarding questions and other standalone questions
  let onboardingPoints = 0;
  Object.values(answers).forEach(answer => {
    // Check if this is an onboarding question (has pointsEarned but not in question bank)
    const isInQuestionBank = questionBank.domains.some(d => 
      d.levels.some(l => l.questions.some(q => q.id === answer.questionId))
    );
    
    if (!isInQuestionBank && answer.pointsEarned && answer.pointsEarned > 0) {
      onboardingPoints += answer.pointsEarned;
    }
  });

  // Include onboarding points in overall score calculation
  if (onboardingPoints > 0) {
    totalWeightedScore += onboardingPoints;
    totalWeight += 1; // Give onboarding questions equal weight to a domain
  }

  const overallScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
  const level = calculateLevel(overallScore);

  return {
    overallScore: Math.round(overallScore),
    domainScores,
    level,
    quickWinsCompleted,
    totalQuickWins
  };
}

export function calculateLevel(score: number): number {
  const thresholds = Object.entries(DEFAULT_LEVEL_THRESHOLDS)
    .map(([level, threshold]) => ({ level: parseInt(level), threshold }))
    .sort((a, b) => b.threshold - a.threshold);
  
  for (const { level, threshold } of thresholds) {
    if (score >= threshold) {
      return level;
    }
  }
  return 0;
}

export function getNextLevelProgress(score: number): { 
  currentLevel: number;
  nextLevel: number | null;
  pointsNeeded: number;
  progress: number;
} {
  const currentLevel = calculateLevel(score);
  const currentThreshold = DEFAULT_LEVEL_THRESHOLDS[currentLevel];
  const nextLevel = currentLevel + 1;
  const nextThreshold = DEFAULT_LEVEL_THRESHOLDS[nextLevel];

  if (!nextThreshold) {
    return {
      currentLevel,
      nextLevel: null,
      pointsNeeded: 0,
      progress: 100
    };
  }

  const pointsNeeded = Math.max(0, nextThreshold - score);
  const progress = Math.min(100, ((score - currentThreshold) / (nextThreshold - currentThreshold)) * 100);

  return {
    currentLevel,
    nextLevel,
    pointsNeeded,
    progress
  };
}

// Get the most impactful unanswered questions (prioritize quick wins)
export function getTopRecommendations(
  questionBank: QuestionBank,
  answers: Record<string, { questionId: string; value: boolean | number | string }>,
  limit: number = 3
): Array<{
  question: Question;
  domain: string;
  potentialPoints: number;
  impact: 'high' | 'medium' | 'low';
}> {
  const recommendations: Array<{
    question: Question;
    domain: string;
    potentialPoints: number;
    impact: 'high' | 'medium' | 'low';
  }> = [];

  questionBank.domains.forEach(domain => {
    domain.levels.forEach(level => {
      level.questions.forEach(question => {
        const answer = answers[question.id];
        
        // Skip if already answered positively
        if (answer && normalizeAnswer(question, answer.value) > 0.7) {
          return;
        }

        let potentialPoints = question.weight;
        if (question.quickWin) potentialPoints *= 1.25;

        let impact: 'high' | 'medium' | 'low' = 'low';
        if (question.quickWin && question.weight >= 8) impact = 'high';
        else if (question.weight >= 7 || question.quickWin) impact = 'medium';

        recommendations.push({
          question,
          domain: domain.title,
          potentialPoints,
          impact
        });
      });
    });
  });

  // Sort by impact and potential points
  return recommendations
    .sort((a, b) => {
      // Prioritize quick wins
      if (a.question.quickWin && !b.question.quickWin) return -1;
      if (!a.question.quickWin && b.question.quickWin) return 1;
      
      // Then by impact level
      const impactOrder = { high: 3, medium: 2, low: 1 };
      const impactDiff = impactOrder[b.impact] - impactOrder[a.impact];
      if (impactDiff !== 0) return impactDiff;
      
      // Finally by potential points
      return b.potentialPoints - a.potentialPoints;
    })
    .slice(0, limit);
}

/**
 * Calculate expiration date and reason for time-sensitive answers
 */
export function calculateAnswerExpiration(questionId: string, value: boolean | number | string): { 
  expiresAt?: Date; 
  expirationReason?: string; 
} {
  const now = new Date();
  
  // Define expiration rules based on question and answer patterns
  const expirationRules: Record<string, Record<string, { days: number; reason: string }>> = {
    // DEBUG: Immediate expiration for testing
    'debug_expiration_test': {
      'yes': { days: -1, reason: 'DEBUG: This expired yesterday for testing' },
      'test_immediate': { days: 0, reason: 'DEBUG: This expires right now' },
      'test_soon': { days: 1, reason: 'DEBUG: This expires tomorrow' }
    },
    
    // Windows Updates - main question with different follow-up schedules
    'windows_updates': {
      // 'automatic' has no expiration - it's self-maintaining
      'manual_when_notified': { days: 90, reason: 'Check if manual update routine is working well' },
      'every_so_often': { days: 30, reason: 'Monthly update check - establish better routine' },
      'never': { days: 7, reason: 'Urgent - unpatched systems are high-risk targets' }
    },
    
    // Windows Updates follow-ups
    'windows_updates_followup_manual': {
      'up_to_date': { days: 90, reason: 'Quarterly check-in on manual update habits' },
      'will_update_now': { days: 90, reason: 'Quarterly check-in on manual update habits' },
      'behind_updates': { days: 30, reason: 'Monthly check until update routine is established' }
    },
    
    'windows_updates_followup_sporadic': {
      'within_month': { days: 30, reason: 'Monthly reminder to maintain update routine' },
      'few_months': { days: 7, reason: 'Weekly check until update routine is established' },
      'long_time': { days: 7, reason: 'Weekly check until update routine is established' }
    },
    
    'windows_updates_followup_never': {
      'enable_automatic': { days: 180, reason: 'Verify automatic updates are working correctly' },
      'manual_commitment': { days: 7, reason: 'Weekly accountability check for manual update commitment' },
      'still_resistant': { days: 3, reason: 'High-risk: frequent check-ins needed for unpatched system' }
    },
    
    // Virus/malware scanning questions
    'virus_scan_recent': {
      'today': { days: 7, reason: 'Daily scans should be checked weekly' },
      'this_week': { days: 7, reason: 'Weekly scans need follow-up' },
      'this_month': { days: 14, reason: 'Monthly scans should be more frequent' },
      'few_months': { days: 30, reason: 'Old scans need immediate attention' },
      'never': { days: 1, reason: 'No scanning protection - urgent action needed' }
    },
    
    // Software update questions
    'software_updates': {
      'manual': { days: 30, reason: 'Manual updates should be checked monthly' },
      'weekly': { days: 7, reason: 'Check for new updates' },
      'monthly': { days: 30, reason: 'Time for update check' }
      // 'automatic' has no expiration - it's self-maintaining
    },
    
    // Password-related questions
    'password_change_frequency': {
      'never': { days: 90, reason: 'Passwords should be changed regularly' },
      'yearly': { days: 365, reason: 'Time for annual password update' },
      'few_months': { days: 90, reason: 'Quarterly password review due' }
    },
    
    // Backup questions
    'data_backup': {
      'weekly': { days: 7, reason: 'Weekly backup check due' },
      'monthly': { days: 30, reason: 'Monthly backup verification needed' },
      'rarely': { days: 30, reason: 'Backup system needs attention' }
    },
    
    // Security training/awareness
    'security_training': {
      'last_year': { days: 365, reason: 'Annual security training refresh' },
      'few_years': { days: 180, reason: 'Security knowledge needs updating' }
    }
  };
  
  // Check for direct question matches
  if (expirationRules[questionId]) {
    const rule = expirationRules[questionId][value as string];
    if (rule) {
      const expiresAt = new Date(now.getTime() + rule.days * 24 * 60 * 60 * 1000);
      return { expiresAt, expirationReason: rule.reason };
    }
  }
  
  // Check for pattern-based matches (for onboarding questions)
  const valueStr = value.toString().toLowerCase();
  
  // Time-based patterns
  if (valueStr.includes('week') || valueStr === 'weekly') {
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { expiresAt, expirationReason: 'Weekly task due for review' };
  }
  
  if (valueStr.includes('month') || valueStr === 'monthly') {
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return { expiresAt, expirationReason: 'Monthly security check due' };
  }
  
  if (valueStr.includes('never') || valueStr.includes('no')) {
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { expiresAt, expirationReason: 'Security gap needs immediate attention' };
  }
  
  // No expiration needed (e.g., "automatic", "yes", "always")
  return {};
}

/**
 * Check if a question's conditions are met and it should be available
 */
export function shouldQuestionBeAvailable(
  question: Question,
  answers: { [questionId: string]: any },
  _userProgress?: any
): boolean {
  // If no conditions, question is always available
  if (!question.conditions) {
    return true;
  }

  const { requireAnswers, browserInfo, userProfile } = question.conditions;

  // Check required answers
  if (requireAnswers) {
    for (const [requiredQuestionId, allowedValues] of Object.entries(requireAnswers)) {
      const userAnswer = answers[requiredQuestionId];
      
      if (!userAnswer) {
        return false; // Required question not answered yet
      }

      // Handle different answer types
      let answerValue: string;
      if (typeof userAnswer === 'object' && userAnswer.value !== undefined) {
        answerValue = String(userAnswer.value);
      } else {
        answerValue = String(userAnswer);
      }

      if (!allowedValues.includes(answerValue)) {
        return false; // Answer doesn't match required values
      }
    }
  }

  // Check browser/platform requirements
  if (browserInfo) {
    // TODO: Implement browser/platform detection if needed
    // For now, assume all browser/platform conditions are met
  }

  // Check user profile requirements  
  if (userProfile) {
    // TODO: Implement user profile checking if needed
    // For now, assume all user profile conditions are met
  }

  return true;
}

/**
 * Get follow-up expiration schedule based on original answer
 */
export function getFollowUpExpirationSchedule(
  _originalQuestionId: string,
  originalAnswer: any
): { expiresAt?: Date; expirationReason?: string } {
  const answerValue = typeof originalAnswer === 'object' && originalAnswer.value !== undefined 
    ? String(originalAnswer.value) 
    : String(originalAnswer);

  const now = new Date();

  // Define follow-up schedules for different answer patterns
  const followUpSchedules: { [key: string]: { days: number; reason: string } } = {
    // Good practices - long follow-up schedules
    'automatic': { days: 90, reason: 'Quarterly check-in' },
    'yes': { days: 60, reason: 'Bi-monthly verification' },
    'always': { days: 90, reason: 'Quarterly validation' },
    
    // Manual/inconsistent practices - medium follow-up
    'manual': { days: 30, reason: 'Monthly reminder' },
    'sometimes': { days: 21, reason: 'Bi-weekly check' },
    'occasionally': { days: 14, reason: 'Bi-weekly reminder' },
    
    // Poor practices - short follow-up schedules
    'never': { days: 7, reason: 'Urgent security gap follow-up' },
    'no': { days: 14, reason: 'Security improvement needed' },
    'rarely': { days: 10, reason: 'Security practice improvement' },
  };

  // Find matching schedule
  for (const [pattern, schedule] of Object.entries(followUpSchedules)) {
    if (answerValue.toLowerCase().includes(pattern)) {
      const expiresAt = new Date(now.getTime() + schedule.days * 24 * 60 * 60 * 1000);
      return { expiresAt, expirationReason: schedule.reason };
    }
  }

  // Default follow-up schedule (monthly)
  const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return { expiresAt, expirationReason: 'Monthly security follow-up' };
}
