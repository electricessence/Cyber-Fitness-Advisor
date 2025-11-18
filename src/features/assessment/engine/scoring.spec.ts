import { describe, expect, it } from 'vitest';
import type { Question, QuestionBank, Answer } from './schema';
import { calculateOverallScore } from './scoring';

function buildQuestion(id: string, points: number): Question {
  return {
    id,
    text: `Question ${id}`,
    priority: 100,
    options: [
      { id: 'yes', text: 'Yes', points },
      { id: 'no', text: 'No', points: 0 }
    ]
  };
}

describe('calculateOverallScore', () => {
  const questionBank: QuestionBank = {
    version: 1,
    domains: [
      {
        id: 'habits',
        title: 'Habits',
        levels: [
          {
            level: 1,
            questions: [buildQuestion('q1', 20), buildQuestion('q2', 20)]
          }
        ]
      }
    ]
  };

  it('treats unanswered relevant questions as zero when computing coverage', () => {
    const answers: Record<string, Answer> = {
      q1: { questionId: 'q1', value: 'yes' }
    } as any;

    const result = calculateOverallScore(questionBank, answers, {
      relevantQuestionIds: ['q1', 'q2'],
      minimumConfidenceSample: 2
    });

    expect(result.coveragePercentage).toBe(50);
    expect(result.scoreConfidence).toBeCloseTo(0.5, 5);
    expect(result.percentage).toBe(25);
    expect(result.answeredRelevantQuestions).toBe(1);
    expect(result.totalRelevantQuestions).toBe(2);
  });

  it('converges on the raw coverage once enough cards are answered', () => {
    const answers: Record<string, Answer> = {
      q1: { questionId: 'q1', value: 'yes' },
      q2: { questionId: 'q2', value: 'yes' }
    } as any;

    const result = calculateOverallScore(questionBank, answers, {
      relevantQuestionIds: ['q1', 'q2'],
      minimumConfidenceSample: 2
    });

    expect(result.coveragePercentage).toBe(100);
    expect(result.scoreConfidence).toBe(1);
    expect(result.percentage).toBe(100);
    expect(result.answeredRelevantQuestions).toBe(2);
    expect(result.totalRelevantQuestions).toBe(2);
  });
});
