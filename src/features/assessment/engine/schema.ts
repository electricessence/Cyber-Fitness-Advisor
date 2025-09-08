export type QuestionType = 'YN' | 'SCALE' | 'ACTION';

// Import gate types from conditions to avoid duplication
import type { Gate } from './conditions';

export interface AnswerOption {
  id: string;
  text: string; // What the user sees as the choice
  displayText?: string; // How this choice appears in status/results
  points: number; // Points awarded for this choice
  target: 'shields-up' | 'todo' | 'needs-improvement' | 'hidden'; // Where this goes in the UI
  impact?: string; // Educational message about this choice's security impact
  advice?: string; // Additional advice/guidance for this choice
  followUp?: {
    // Conditions that trigger follow-up questions
    showQuestions?: string[]; // Question IDs to reveal
    hideQuestions?: string[]; // Question IDs to hide
    modifyQuestions?: { [questionId: string]: Partial<Question> }; // Modify other questions
  };
}

// Legacy ActionOption for backward compatibility
export interface ActionOption {
  id: string;
  text: string;
  displayText?: string;
  points: number;
  impact: string;
  advice?: string;
}

export interface SecurityTopic {
  id: string;
  title: string;
  threat: string; // Primary threat this topic addresses
  description: string; // Detailed explanation of the threat
  impact: string; // What happens if this threat succeeds
  examples: string[]; // Real-world examples of this threat
}

export interface SecurityTopics {
  topics: Record<string, SecurityTopic>;
}

export interface Question {
  id: string;
  text: string; // The question text
  
  // Legacy fields for backward compatibility
  type?: QuestionType; // Optional now - if not provided, will use options
  weight: number; // Base points for this question
  affirmativeText?: string; // Clean text for positive responses in security status
  negativeText?: string; // Text for negative responses in security status
  actionOptions?: ActionOption[]; // For legacy ACTION type questions
  
  // Common fields
  category?: string; // Optional categorization
  quickWin?: boolean; // High impact, easy to implement
  timeEstimate?: string; // "2 minutes", "5 minutes"
  explanation?: string; // Why this matters
  actionHint?: string; // How to do this
  relatedTopics?: string[]; // References to security topics this question addresses
  
  // New flexible answer options - optional for backward compatibility
  options?: AnswerOption[]; // All possible answers - if not provided, will be generated from type
  
  // Phase 2.2: Gates system for conditional visibility
  gates?: Gate[]; // When this question should appear (OR logic - any gate passes)
  
  // Phase 2.2: Onboarding support
  nonScoring?: boolean; // If true, this question doesn't contribute to score
  
  // Legacy conditions (kept for backward compatibility)
  conditions?: {
    requireAnswers?: { [questionId: string]: string[] }; // Require specific answers to other questions
    browserInfo?: { browsers?: string[]; platforms?: string[] }; // Browser/platform requirements
    userProfile?: { techComfort?: string[]; concerns?: string[] }; // User profile requirements
  };
  
  // UI hints
  defaultLayout?: 'buttons' | 'radio' | 'dropdown'; // Suggested UI layout
  allowMultiple?: boolean; // Allow selecting multiple options

  // Unified model extensions (Phase: onboarding vs assessment)
  phase?: 'onboarding' | 'assessment';
  phaseOrder?: number; // Ordering within its phase (lower first)
  // Simple prerequisite system (lightweight vs full gates) for onboarding ordering
  prerequisites?: {
    // All of these question IDs must be answered (any value)
    answered?: string[];
    // At least one of these must be answered (any value)
    anyAnswered?: string[];
  };
  // Device/browser targeting (declarative replacement for imperative showIf in legacy onboarding)
  deviceFilter?: {
    os?: string[]; // e.g. ['windows','mac','linux','mobile']
    browser?: string[]; // e.g. ['chrome','firefox','safari','edge']
  };
  // Optional custom predicate (kept narrow in scope and non-persistent). Prefer declarative fields above.
  // Not persisted; evaluated at runtime only. Avoid heavy logic.
  runtimeVisibleFn?: (ctx: { answers: Record<string, unknown>; deviceProfile?: any }) => boolean;
}

export interface Level {
  level: number;
  questions: Question[];
}

export interface Domain {
  id: string;
  title: string;
  levels: Level[];
}

export interface QuestionBank {
  version: number;
  domains: Domain[];
  suites?: Suite[]; // Phase 2.2: Unlockable question suites
}

// Phase 2.2: Unlockable question suites
export interface Suite {
  id: string;
  title: string;
  description: string;
  gates: Gate[]; // Multiple gates with OR semantics - unlocks if any passes
  questions: Question[];
}

export interface Answer {
  questionId: string;
  value: boolean | number | string; // string for ACTION type (option ID)
  timestamp?: Date;
  pointsEarned?: number;
  questionText?: string; // Store for historic reference
  
  // Expiration system for time-sensitive answers
  expiresAt?: Date; // When this answer becomes outdated
  expirationReason?: string; // Why this expires (e.g., "Virus scan should be done weekly")
  isExpired?: boolean; // Cached expiration status for quick access
}

export interface UserProgress {
  answers: Record<string, Answer>;
  scores: {
    overall: number;
    domains: Record<string, number>;
  };
  level: number;
  badges: string[];
  lastUpdated: Date;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (progress: UserProgress, questions: QuestionBank) => boolean;
}

export interface LevelThresholds {
  [level: number]: number;
}

export const DEFAULT_LEVEL_THRESHOLDS: LevelThresholds = {
  0: 0,    // Getting Started
  1: 15,   // Quick wins kick in early!
  2: 35,   // Basic Protection 
  3: 60,   // Good Security Habits
  4: 80    // Well Protected
};
