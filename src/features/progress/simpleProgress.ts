/**
 * Simplified Progress Calculation 
 * Replaces the old personalizedQuestionBank progress functions
 */

import type { QuestionBank, Answer } from '../assessment/engine/schema';
import type { DeviceProfile } from '../assessment/engine/deviceScenarios';

export interface ProgressData {
  answered: number;
  total: number;
  percentage: number;
  level: number;
  nextLevelRequirement: number;
  deviceAware?: boolean;
}

/**
 * Calculate personalized progress based on user's device profile
 */
export function getPersonalizedProgress(
  questionBank: QuestionBank,
  deviceProfile: DeviceProfile | null,
  answers: Record<string, Answer>,
  currentLevel: number
): ProgressData {
  // Simple calculation - count all questions and answered questions
  let totalQuestions = 0;
  let answeredQuestions = 0;
  
  // Use deviceProfile for potential filtering in the future
  const isDeviceSpecific = deviceProfile !== null;
  
  questionBank.domains.forEach(domain => {
    domain.levels.forEach(level => {
      level.questions.forEach(question => {
        totalQuestions++;
        if (answers[question.id]) {
          answeredQuestions++;
        }
      });
    });
  });
  
  const percentage = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;
  
  return {
    answered: answeredQuestions,
    total: totalQuestions,
    percentage: Math.round(percentage),
    level: currentLevel,
    nextLevelRequirement: Math.max(0, (currentLevel + 1) * 5 - answeredQuestions),
    // Include device info for debugging
    ...(isDeviceSpecific && { deviceAware: true })
  };
}

/**
 * Create a simplified question bank
 * Replaces the complex personalized question bank creation
 */
export function createSimpleQuestionBank(deviceProfile: DeviceProfile | null): QuestionBank {
  // For now, return a basic question bank structure
  // Future enhancement: filter by device profile
  const hasDeviceProfile = deviceProfile !== null;
  
  return {
    version: 1,
    domains: [
      {
        id: 'security-basics',
        title: hasDeviceProfile ? 'Security Basics' : 'Getting Started',
        levels: [
          {
            level: 0,
            questions: [
              {
                id: 'device_confirmation',
                text: 'Device confirmation completed',
                type: 'YN',
                weight: 5,
                priority: 5,
                explanation: 'Confirming your device helps us provide relevant security advice.',
                quickWin: false,
                options: []
              },
              {
                id: 'tech_comfort',
                text: 'Technology comfort level assessed',
                type: 'YN', 
                weight: 5,
                priority: 5,
                explanation: 'Understanding your tech comfort helps us adjust our recommendations.',
                quickWin: false,
                options: []
              },
              {
                id: 'security_priority',
                text: 'Security priority identified',
                type: 'YN',
                weight: 5,
                priority: 5,
                explanation: 'Knowing your main security concerns helps us prioritize recommendations.',
                quickWin: false,
                options: []
              },
              {
                id: 'current_habits',
                text: 'Current security habits evaluated',
                type: 'YN',
                weight: 10,
                priority: 10,
                explanation: 'Understanding your current practices helps us build on what you already do.',
                quickWin: true,
                options: []
              }
            ]
          }
        ]
      }
    ]
  };
}
