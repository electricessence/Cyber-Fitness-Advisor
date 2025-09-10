import type { Question, QuestionBank, Answer, AnswerOption } from './schema';

// Calculate points for a single question based on selected answer
export function calculateQuestionPoints(question: Question, value: string): number {
  // Find the selected option by ID (preferred) or fallback to text
  const selectedOption = question.options?.find(opt => opt.id === value || opt.text === value);
  if (!selectedOption) return 0;

  // Return the points for this option
  return selectedOption.points || 0;
}

// Calculate domain score for legacy compatibility 
export function calculateDomainScore(
  domain: { levels: { questions: Question[] }[] },
  answers: Record<string, { questionId: string; value: string }>
): { score: number; maxPossible: number; progress: number } {
  let totalPoints = 0;
  let maxPoints = 0;
  let answeredQuestions = 0;
  let totalQuestions = 0;

  // Process all questions in all levels
  for (const level of domain.levels) {
    for (const question of level.questions) {
      totalQuestions++;
      
      // Calculate max possible points for this question
      const maxQuestionPoints = Math.max(...question.options.map(opt => opt.points || 0));
      maxPoints += maxQuestionPoints;
      
      // Check if answered
      const answer = answers[question.id];
      if (answer) {
        answeredQuestions++;
        totalPoints += calculateQuestionPoints(question, answer.value);
      }
    }
  }

  const progress = totalQuestions > 0 ? answeredQuestions / totalQuestions : 0;
  
  return {
    score: totalPoints,
    maxPossible: maxPoints,
    progress
  };
}

// Main overall score calculation for new simplified schema
export function calculateOverallScore(questionBank: QuestionBank, answers: Record<string, Answer>) {
  let totalScore = 0;
  let maxPossibleScore = 0;
  const domainScores: Record<string, { score: number; maxScore: number; }> = {};

  // Navigate through domains -> levels -> questions
  for (const domain of questionBank.domains) {
    for (const level of domain.levels) {
      for (const question of level.questions) {
        const answer = answers[question.id];
        if (!answer) continue;

        const points = calculateQuestionPoints(question, answer.value);
        totalScore += points;

        // Calculate max possible score for this question
        const maxPoints = Math.max(...question.options.map((opt: AnswerOption) => opt.points || 0));
        maxPossibleScore += maxPoints;

        // Track domain scores
        if (domain.id) {
          if (!domainScores[domain.id]) {
            domainScores[domain.id] = { score: 0, maxScore: 0 };
          }
          domainScores[domain.id].score += points;
          domainScores[domain.id].maxScore += maxPoints;
        }
      }
    }
  }

  return {
    overallScore: totalScore,
    maxPossibleScore,
    domainScores,
    percentage: maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0
  };
}

// Level progression system
export function getNextLevelProgress(currentScore: number) {
  // Simple level system: every 100 points is a level
  const pointsPerLevel = 100;
  const currentLevel = Math.floor(currentScore / pointsPerLevel);
  const pointsInCurrentLevel = currentScore % pointsPerLevel;
  const pointsToNextLevel = pointsPerLevel - pointsInCurrentLevel;
  
  return {
    currentLevel,
    nextLevel: currentLevel + 1,
    pointsNeeded: pointsToNextLevel,
    progress: Math.round((pointsInCurrentLevel / pointsPerLevel) * 100)
  };
}

// Get top recommendations based on scores
export function getTopRecommendations(questionBank: QuestionBank, answers: Record<string, Answer>) {
  const recommendations: Array<{
    questionId: string;
    text: string;
    priority: number;
    domain?: string;
  }> = [];

  // Navigate through domains -> levels -> questions
  for (const domain of questionBank.domains) {
    for (const level of domain.levels) {
      for (const question of level.questions) {
        const answer = answers[question.id];
        if (!answer) continue;

        const points = calculateQuestionPoints(question, answer.value);
        const maxPoints = Math.max(...question.options.map((opt: AnswerOption) => opt.points || 0));
        
        // If scoring less than 50% of max points, recommend improvement
        if (points < maxPoints * 0.5) {
          recommendations.push({
            questionId: question.id,
            text: `Consider improving: ${question.text}`,
            priority: question.priority || 0,
            domain: domain.id
          });
        }
      }
    }
  }

  // Sort by priority (higher = more important)
  return recommendations.sort((a, b) => b.priority - a.priority).slice(0, 5);
}

export function calculateAnswerExpiration(
  question: Question, 
  value: string | boolean | number
): { expiresAt: Date; expirationReason: string } | null {
  if (!value) return null; // Handle undefined/null values
  
  const now = new Date();
  const valueStr = value.toString().toLowerCase();
  
  // Time-based patterns - specific to virus scans
  if (valueStr === 'this_week') {
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { expiresAt, expirationReason: 'Weekly scans need follow-up' };
  }
  
  if (valueStr.includes('week') || valueStr === 'weekly') {
    const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return { expiresAt, expirationReason: 'Weekly security practices should be verified regularly' };
  }
  
  if (valueStr.includes('month') || valueStr === 'monthly') {
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return { expiresAt, expirationReason: 'Monthly practices should be reconfirmed' };
  }
  
  // Don't set expiration for automatic updates - they're permanent
  if (valueStr.includes('automatic') || valueStr.includes('auto')) {
    return null; // No expiration for automatic settings
  }
  
  // Default: no expiration
  return null;
}

// Legacy compatibility function
export function isQuestionAnswered(questionId: string, answers: Record<string, any>): boolean {
  return questionId in answers && answers[questionId]?.value != null;
}

// Simplified scoring for the new schema
export function getQuestionScore(question: Question, answer: string): number {
  return calculateQuestionPoints(question, answer);
}
