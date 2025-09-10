// Unified Question Bank (Clean Schema)
// Uses the new simplified schema with priority-based ordering and facts-based state management

import type { QuestionBank } from '../engine/schema';
import { onboardingQuestions, coreAssessmentQuestions } from './questions/index.js';

// Combine all question groups into the question bank
const questionBank: QuestionBank = {
  version: 2.0, // Numeric version
  domains: [
    {
      id: 'unified',
      title: 'Unified Assessment',
      levels: [
        {
          level: 1,
          questions: [...onboardingQuestions, ...coreAssessmentQuestions]
        }
      ]
    }
  ]
};

// Export both default and named
export default questionBank;
export { questionBank };
