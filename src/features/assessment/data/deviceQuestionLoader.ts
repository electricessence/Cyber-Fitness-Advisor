import type { QuestionBank, Question, Domain } from '../engine/schema';
import type { DeviceProfile } from '../engine/deviceScenarios';
import { getApplicableScenarios } from '../engine/deviceScenarios';
import deviceQuestionsData from './deviceQuestions.json';

/**
 * Load questions based on user's device profile
 */
export function loadDeviceSpecificQuestions(deviceProfile: DeviceProfile): QuestionBank {
  const applicableScenarios = getApplicableScenarios(deviceProfile);
  const domains: Domain[] = [];
  
  // Collect domains from all applicable scenarios
  for (const scenario of applicableScenarios) {
    const scenarioData = (deviceQuestionsData as any).deviceScenarios[scenario.id];
    if (scenarioData && scenarioData.domains) {
      // Add all domains from this scenario
      domains.push(...scenarioData.domains);
    }
  }
  
  return {
    version: deviceQuestionsData.version,
    domains: domains
  };
}

/**
 * Get all questions flattened from device-specific question bank
 */
export function getAllDeviceQuestions(deviceProfile: DeviceProfile): Question[] {
  const questionBank = loadDeviceSpecificQuestions(deviceProfile);
  const allQuestions: Question[] = [];
  
  questionBank.domains.forEach(domain => {
    domain.levels.forEach(level => {
      level.questions.forEach(question => {
        allQuestions.push(question);
      });
    });
  });
  
  return allQuestions;
}

/**
 * Check if a question is relevant to user's device profile
 */
export function isQuestionRelevantToDevice(question: Question, deviceProfile: DeviceProfile): boolean {
  const applicableQuestions = getAllDeviceQuestions(deviceProfile);
  return applicableQuestions.some(q => q.id === question.id);
}

/**
 * Get question statistics for device profile
 */
export function getDeviceQuestionStats(deviceProfile: DeviceProfile) {
  const questionBank = loadDeviceSpecificQuestions(deviceProfile);
  const stats = {
    totalDomains: questionBank.domains.length,
    totalQuestions: 0,
    questionsByScenario: {} as { [scenarioId: string]: number }
  };
  
  const applicableScenarios = getApplicableScenarios(deviceProfile);
  
  // Count questions by scenario
  for (const scenario of applicableScenarios) {
    const scenarioData = (deviceQuestionsData as any).deviceScenarios[scenario.id];
    if (scenarioData && scenarioData.domains) {
      let questionCount = 0;
      scenarioData.domains.forEach((domain: any) => {
        domain.levels.forEach((level: any) => {
          questionCount += level.questions.length;
        });
      });
      stats.questionsByScenario[scenario.id] = questionCount;
      stats.totalQuestions += questionCount;
    }
  }
  
  return stats;
}
