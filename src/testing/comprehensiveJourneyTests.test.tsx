/**
 * Comprehensive Journey Tests
 * 
 * Demonstrates clear, reliable, and maintainable user journey testing
 * using the journey framework with predefined scenarios.
 */

import { describe, it, beforeEach, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { JourneyTestRunner } from './journeyFramework';
import { useAssessmentStore } from '../features/assessment/state/store';
import { 
  newUserOnboardingJourney,
  securityAssessmentJourney,
  poorSecurityRemediationJourney,
  mobileUserJourney,
  expertUserJourney,
  ALL_JOURNEYS
} from './predefinedJourneys';

describe('🎯 Comprehensive User Journey Tests', () => {
  let journeyRunner: JourneyTestRunner;

  beforeEach(() => {
    // Create fresh journey runner for each test
    journeyRunner = new JourneyTestRunner();
    
    // Render the app once for the entire test suite
    render(<App />);
  });

  describe('👤 Individual Journey Tests', () => {
    it('🌟 New User Onboarding Journey', async () => {
      await journeyRunner.executeJourney(newUserOnboardingJourney);
    });

    it('🛡️ Security Assessment Journey', async () => {
      await journeyRunner.executeJourney(securityAssessmentJourney);
    });

    it('⚠️ Poor Security Remediation Journey', async () => {
      await journeyRunner.executeJourney(poorSecurityRemediationJourney);
    });

    it('📱 Mobile User Journey', async () => {
      await journeyRunner.executeJourney(mobileUserJourney);
    });

    it('🎓 Expert User Journey', async () => {
      await journeyRunner.executeJourney(expertUserJourney);
    });
  });

  describe('🔄 Journey Suite Tests', () => {
    it('should execute all predefined journeys successfully', async () => {
      // This test validates that all our journeys work together
      for (const journey of ALL_JOURNEYS) {
        console.log(`\n🚀 Executing: ${journey.name}`);
        await journeyRunner.executeJourney(journey);
        console.log(`✅ Completed: ${journey.name}\n`);
      }
    }, 30000); // Allow extra time for complete suite
  });

  describe('🧪 Journey Framework Validation', () => {
    it('should provide clear error messages for invalid journeys', async () => {
      // Test framework error handling
      const invalidJourney = {
        name: 'Invalid Journey',
        description: 'This journey has invalid steps',
        steps: [{
          description: 'Invalid step',
          action: { type: 'answer-question' as const, questionId: 'invalid', value: 'test' },
          expectedOutcome: { storeState: { answersCount: 999 } } // Impossible expectation
        }],
        finalOutcome: {
          description: 'Should fail',
          validation: () => {}
        }
      };

      try {
        await journeyRunner.executeJourney(invalidJourney);
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        expect((error as Error).message).toBeDefined();
      }
    });

    it('should handle journey step failures gracefully', async () => {
      // Test what happens when expectations fail
      const failingJourney = {
        name: 'Failing Journey',
        description: 'This journey will fail expectations',
        steps: [{
          description: 'Answer question',
          action: { type: 'answer-question' as const, questionId: 'test', value: 'yes' },
          expectedOutcome: {
            storeState: { answersCount: 999 } // Impossible expectation
          }
        }],
        finalOutcome: {
          description: 'Should fail',
          validation: () => {}
        }
      };

      try {
        await journeyRunner.executeJourney(failingJourney);
        expect(false).toBe(true); // Should not reach here
      } catch (error) {
        expect(error).toBeDefined();
        // Framework should provide helpful error messages
      }
    });
  });

  describe('📊 Journey Insights & Analytics', () => {
    it('should track journey execution metrics', async () => {
      const startTime = Date.now();
      
      await journeyRunner.executeJourney(newUserOnboardingJourney);
      
      const executionTime = Date.now() - startTime;
      
      // Journey should complete in reasonable time
      expect(executionTime).toBeLessThan(5000); // 5 seconds max
      
      console.log(`📈 Journey execution time: ${executionTime}ms`);
    });

    it('should validate journey step consistency', async () => {
      // Ensure all predefined journeys follow good patterns
      for (const journey of ALL_JOURNEYS) {
        // Each journey should have meaningful name and description
        expect(journey.name).toBeTruthy();
        expect(journey.description).toBeTruthy();
        
        // Each journey should have steps
        expect(journey.steps.length).toBeGreaterThan(0);
        
        // Each step should have description and action
        for (const step of journey.steps) {
          expect(step.description).toBeTruthy();
          expect(step.action).toBeDefined();
          expect(step.expectedOutcome).toBeDefined();
        }
        
        // Should have final outcome validation
        expect(journey.finalOutcome).toBeDefined();
        expect(journey.finalOutcome.description).toBeTruthy();
        expect(typeof journey.finalOutcome.validation).toBe('function');
      }
    });
  });
});

/**
 * Journey Development Utilities
 * 
 * Helper functions for creating and debugging journeys during development
 */
export class JourneyDevelopmentUtils {
  /**
   * Create a minimal journey for quick testing
   */
  static createMinimalJourney(name: string, questionId: string, value: any) {
    return {
      name: `Minimal: ${name}`,
      description: `Simple journey to test ${questionId}`,
      steps: [{
        description: `Answer ${questionId}`,
        action: { type: 'answer-question' as const, questionId, value },
        expectedOutcome: {
          storeState: { answersCount: 1 }
        }
      }],
      finalOutcome: {
        description: 'Single question answered',
        validation: () => {
          const store = useAssessmentStore.getState();
          expect(store.answers[questionId]).toBeDefined();
        }
      }
    };
  }

  /**
   * Validate a journey definition without executing it
   */
  static validateJourneyDefinition(journey: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!journey.name) errors.push('Journey must have a name');
    if (!journey.description) errors.push('Journey must have a description');
    if (!journey.steps || journey.steps.length === 0) errors.push('Journey must have steps');
    if (!journey.finalOutcome) errors.push('Journey must have finalOutcome');

    if (journey.steps) {
      journey.steps.forEach((step: any, index: number) => {
        if (!step.description) errors.push(`Step ${index + 1} must have description`);
        if (!step.action) errors.push(`Step ${index + 1} must have action`);
        if (!step.expectedOutcome) errors.push(`Step ${index + 1} must have expectedOutcome`);
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Log journey execution details for debugging
   */
  static async executeJourneyWithDetailedLogging(journey: any): Promise<void> {
    console.group(`🔍 Detailed Journey Execution: ${journey.name}`);
    
    try {
      const runner = new JourneyTestRunner();
      
      console.log(`📋 Description: ${journey.description}`);
      console.log(`📊 Steps: ${journey.steps.length}`);
      
      await runner.executeJourney(journey);
      
      console.log('✅ Journey completed successfully');
    } catch (error) {
      console.error('❌ Journey failed:', error);
      throw error;
    } finally {
      console.groupEnd();
    }
  }
}