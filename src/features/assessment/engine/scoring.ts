import type { Question, QuestionBank, Answer, AnswerOption } from './schema';
import { SCORE_CONSTANTS } from '../../../utils/constants';

export interface ScoreCalculationOptions {
  /** Explicit list of question IDs that should count toward the score */
  relevantQuestionIds?: string[];
  /** Override for how many answered cards we need before trusting the raw average */
  minimumConfidenceSample?: number;
}

function getQuestionMaxPoints(question: Question): number {
  if ((question as any).type === 'YN') {
    return (question as any).weight || 0;
  }

  if (question.options && question.options.length > 0) {
    return Math.max(...question.options.map(opt => opt.points || 0));
  }

  return question.points || 0;
}

function isQuickWin(question: Question): boolean {
  if (question.quickWin) {
    return true;
  }
  if (!question.tags) {
    return false;
  }
  return question.tags.some(tag => tag.toLowerCase() === 'quickwin');
}

// Calculate points for a single question based on selected answer
export function calculateQuestionPoints(question: Question, value: string | boolean | number): number {
  // Handle YN (Yes/No) questions - legacy compatibility
  if ((question as any).type === 'YN') {
    const weight = (question as any).weight || 0;
    // For YN questions: full weight if true/yes, 0 if false/no
    if (value === true || value === 'yes' || value === 'true') {
      return weight;
    }
    return 0;
  }

  // Handle new format with options array
  if (question.options) {
    // Find the selected option by ID (preferred) or fallback to text
    const selectedOption = question.options.find(opt => opt.id === value || opt.text === value);
    if (!selectedOption) return 0;

    // Return the points for this option
    return selectedOption.points || 0;
  }

  // Fallback: if no options and no type, return 0
  return 0;
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
      let maxQuestionPoints = 0;
      if ((question as any).type === 'YN') {
        // YN questions: max points is the weight
        maxQuestionPoints = (question as any).weight || 0;
      } else if (question.options) {
        // New format: max of all option points
        maxQuestionPoints = Math.max(...question.options.map(opt => opt.points || 0));
      }
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
export function calculateOverallScore(
  questionBank: QuestionBank,
  answers: Record<string, Answer>,
  options: ScoreCalculationOptions = {}
) {
  const relevantQuestionIds = new Set(options.relevantQuestionIds ?? []);
  Object.keys(answers).forEach(id => relevantQuestionIds.add(id));

  if (relevantQuestionIds.size === 0) {
    for (const domain of questionBank.domains) {
      for (const level of domain.levels) {
        for (const question of level.questions) {
          relevantQuestionIds.add(question.id);
        }
      }
    }
  }

  const minimumConfidenceSample = options.minimumConfidenceSample ?? SCORE_CONSTANTS.MIN_CONFIDENT_ANSWERS;

  let totalScore = 0;
  let maxPossibleScore = 0;
  let answeredRelevantCount = 0;
  let totalRelevantQuestions = 0;
  let quickWinsCompleted = 0;
  let totalQuickWins = 0;
  const domainScores: Record<string, { score: number; maxScore: number; }> = {};

  const processQuestion = (question: Question, domainId?: string) => {
    if (!relevantQuestionIds.has(question.id)) {
      return;
    }

    totalRelevantQuestions++;

    const maxPoints = getQuestionMaxPoints(question);
    maxPossibleScore += maxPoints;

    if (domainId) {
      if (!domainScores[domainId]) {
        domainScores[domainId] = { score: 0, maxScore: 0 };
      }
      domainScores[domainId].maxScore += maxPoints;
    }

    const answer = answers[question.id];
    if (isQuickWin(question)) {
      totalQuickWins++;
      if (answer) {
        quickWinsCompleted++;
      }
    }

    if (!answer) {
      return;
    }

    answeredRelevantCount++;
    const points = calculateQuestionPoints(question, answer.value);
    totalScore += points;

    if (domainId) {
      domainScores[domainId].score += points;
    }
  };

  // Navigate through domains -> levels -> questions
  for (const domain of questionBank.domains) {
    for (const level of domain.levels) {
      for (const question of level.questions) {
        processQuestion(question, domain.id);
      }
    }
  }

  // Include suite questions if they are part of the relevant set
  if (questionBank.suites) {
    for (const suite of questionBank.suites) {
      for (const question of suite.questions) {
        processQuestion(question);
      }
    }
  }

  const rawPercentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
  const hasAnswers = answeredRelevantCount > 0;
  const effectiveSampleTarget = totalRelevantQuestions > 0
    ? Math.min(totalRelevantQuestions, minimumConfidenceSample)
    : minimumConfidenceSample;
  const scoreConfidence = hasAnswers
    ? Math.min(1, answeredRelevantCount / Math.max(1, effectiveSampleTarget))
    : 0;
  const adjustedPercentage = hasAnswers ? rawPercentage * scoreConfidence : 0;
  const levelData = getNextLevelProgress(totalScore);

  return {
    overallScore: totalScore,
    maxPossibleScore,
    domainScores,
    percentage: Math.round(adjustedPercentage),
    coveragePercentage: Math.round(rawPercentage),
    scoreConfidence,
    answeredRelevantQuestions: answeredRelevantCount,
    totalRelevantQuestions,
    level: levelData.currentLevel,
    quickWinsCompleted,
    totalQuickWins
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
  _question: any, // Allow any type for legacy compatibility
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
