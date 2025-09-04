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
  answers: Record<string, { questionId: string; value: boolean | number | string }>
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
