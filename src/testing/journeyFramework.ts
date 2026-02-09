/**
 * User Journey Testing Framework
 * 
 * Provides clear, reusable patterns for testing complete user workflows
 * with predictable outcomes and easy maintenance.
 */

import { act } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useAssessmentStore } from '../features/assessment/state/store';
import type { UserEvent } from '@testing-library/user-event';
import { expect } from 'vitest';

// Journey Step Definition
export interface JourneyStep {
  /** Human-readable description of what this step does */
  description: string;
  /** The action to perform */
  action: JourneyAction;
  /** Expected outcome after this step */
  expectedOutcome: JourneyExpectation;
  /** Optional setup before this step */
  setup?: () => void | Promise<void>;
  /** Optional cleanup after this step */
  cleanup?: () => void | Promise<void>;
}

// Action Types
export type JourneyAction = 
  | { type: 'answer-question'; questionId: string; value: string | boolean | number }
  | { type: 'click-button'; buttonText: string }
  | { type: 'wait'; milliseconds: number }
  | { type: 'navigate'; path: string }
  | { type: 'custom'; execute: (user: UserEvent) => Promise<void> | void };

// Expectation Types
export interface JourneyExpectation {
  /** Expected store state changes */
  storeState?: {
    answersCount?: number;
    scoreRange?: { min: number; max: number };
    hasAnswers?: string[];
    currentQuestionId?: string;
  };
  /** Expected UI elements */
  ui?: {
    shouldSee?: string[];
    shouldNotSee?: string[];
    buttonsShouldBeEnabled?: string[];
    buttonsShouldBeDisabled?: string[];
  };
  /** Custom validation function */
  customValidation?: () => void | Promise<void>;
}

// Journey Definition
export interface UserJourney {
  /** Human-readable journey name */
  name: string;
  /** Journey description */
  description: string;
  /** Prerequisites for this journey */
  prerequisites?: string[];
  /** Steps that make up this journey */
  steps: JourneyStep[];
  /** Expected final outcome */
  finalOutcome: {
    description: string;
    validation: () => void | Promise<void>;
  };
}

/**
 * Journey Test Runner
 * Executes a complete user journey with detailed reporting
 */
export class JourneyTestRunner {
  private user: UserEvent;
  private currentStep = 0;

  constructor() {
    this.user = userEvent.setup();
  }

  /**
   * Execute a complete user journey (assumes app is already rendered)
   */
  async executeJourney(journey: UserJourney): Promise<void> {
    console.log(`🚀 Starting journey: ${journey.name}`);
    console.log(`📋 Description: ${journey.description}`);

    // Reset application state (resetAssessment handles initializeStore internally)
    act(() => {
      useAssessmentStore.getState().resetAssessment();
    });

    // Execute each step
    for (let i = 0; i < journey.steps.length; i++) {
      this.currentStep = i + 1;
      const step = journey.steps[i];
      
      console.log(`📍 Step ${this.currentStep}: ${step.description}`);

      // Setup
      if (step.setup) {
        await step.setup();
      }

      // Execute action
      await this.executeAction(step.action);

      // Validate outcome
      await this.validateExpectation(step.expectedOutcome);

      // Cleanup
      if (step.cleanup) {
        await step.cleanup();
      }
    }

    // Validate final outcome
    console.log(`🎯 Validating final outcome...`);
    await journey.finalOutcome.validation();
    
    console.log(`✅ Journey completed successfully: ${journey.name}`);
  }

  /**
   * Execute a journey action
   */
  private async executeAction(action: JourneyAction): Promise<void> {
    switch (action.type) {
      case 'answer-question':
        act(() => {
          useAssessmentStore.getState().answerQuestion(action.questionId, action.value);
        });
        break;

      case 'click-button':
        const button = await screen.findByRole('button', { name: new RegExp(action.buttonText, 'i') });
        await this.user.click(button);
        break;

      case 'wait':
        await new Promise(resolve => setTimeout(resolve, action.milliseconds));
        break;

      case 'custom':
        await action.execute(this.user);
        break;

      default:
        throw new Error(`Unknown action type: ${(action as any).type}`);
    }

    // Always wait for React updates
    await waitFor(() => {}, { timeout: 100 });
  }

  /**
   * Validate journey expectations
   */
  private async validateExpectation(expectation: JourneyExpectation): Promise<void> {
    // Validate store state
    if (expectation.storeState) {
      const store = useAssessmentStore.getState();
      
      if (expectation.storeState.answersCount !== undefined) {
        expect(Object.keys(store.answers)).toHaveLength(expectation.storeState.answersCount);
      }
      
      if (expectation.storeState.scoreRange) {
        expect(store.overallScore).toBeGreaterThanOrEqual(expectation.storeState.scoreRange.min);
        expect(store.overallScore).toBeLessThanOrEqual(expectation.storeState.scoreRange.max);
      }
      
      if (expectation.storeState.hasAnswers) {
        expectation.storeState.hasAnswers.forEach(questionId => {
          expect(store.answers[questionId]).toBeDefined();
        });
      }
    }

    // Validate UI state
    if (expectation.ui) {
      if (expectation.ui.shouldSee) {
        for (const text of expectation.ui.shouldSee) {
          await screen.findByText(new RegExp(text, 'i'));
        }
      }
      
      if (expectation.ui.shouldNotSee) {
        for (const text of expectation.ui.shouldNotSee) {
          expect(screen.queryByText(new RegExp(text, 'i'))).toBeNull();
        }
      }
    }

    // Custom validation
    if (expectation.customValidation) {
      await expectation.customValidation();
    }
  }
}

/**
 * Journey Builder - Fluent API for creating journeys
 */
export class JourneyBuilder {
  private journey: Partial<UserJourney> = {
    steps: []
  };

  static create(name: string): JourneyBuilder {
    const builder = new JourneyBuilder();
    builder.journey.name = name;
    return builder;
  }

  description(desc: string): JourneyBuilder {
    this.journey.description = desc;
    return this;
  }

  step(description: string): StepBuilder {
    return new StepBuilder(this, description);
  }

  finalOutcome(description: string, validation: () => void | Promise<void>): JourneyBuilder {
    this.journey.finalOutcome = { description, validation };
    return this;
  }

  build(): UserJourney {
    if (!this.journey.name || !this.journey.description || !this.journey.finalOutcome) {
      throw new Error('Journey must have name, description, and finalOutcome');
    }
    return this.journey as UserJourney;
  }

  addStep(step: JourneyStep): JourneyBuilder {
    this.journey.steps!.push(step);
    return this;
  }
}

/**
 * Step Builder - Fluent API for creating journey steps
 */
export class StepBuilder {
  private step: Partial<JourneyStep> = {};
  private journeyBuilder: JourneyBuilder;

  constructor(journeyBuilder: JourneyBuilder, description: string) {
    this.journeyBuilder = journeyBuilder;
    this.step.description = description;
  }

  answerQuestion(questionId: string, value: string | boolean | number): StepBuilder {
    this.step.action = { type: 'answer-question', questionId, value };
    return this;
  }

  clickButton(buttonText: string): StepBuilder {
    this.step.action = { type: 'click-button', buttonText };
    return this;
  }

  wait(milliseconds: number): StepBuilder {
    this.step.action = { type: 'wait', milliseconds };
    return this;
  }

  custom(execute: (user: UserEvent) => Promise<void> | void): StepBuilder {
    this.step.action = { type: 'custom', execute };
    return this;
  }

  expectStoreState(storeState: JourneyExpectation['storeState']): StepBuilder {
    if (!this.step.expectedOutcome) {
      this.step.expectedOutcome = {};
    }
    this.step.expectedOutcome.storeState = storeState;
    return this;
  }

  expectUI(ui: JourneyExpectation['ui']): StepBuilder {
    if (!this.step.expectedOutcome) {
      this.step.expectedOutcome = {};
    }
    this.step.expectedOutcome.ui = ui;
    return this;
  }

  expectCustom(validation: () => void | Promise<void>): StepBuilder {
    if (!this.step.expectedOutcome) {
      this.step.expectedOutcome = {};
    }
    this.step.expectedOutcome.customValidation = validation;
    return this;
  }

  then(): JourneyBuilder {
    if (!this.step.expectedOutcome) {
      this.step.expectedOutcome = {}; // Default empty expectation
    }
    return this.journeyBuilder.addStep(this.step as JourneyStep);
  }
}