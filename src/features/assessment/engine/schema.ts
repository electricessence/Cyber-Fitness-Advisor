// Import gate types from conditions to avoid duplication
import type { Gate } from './conditions';

export interface AnswerOption {
  id: string; // Stable identifier for tests and logic
  text: string; // What the user sees as the choice (can change for UI)
  facts?: Record<string, boolean | string>; // Optional for backward compatibility - every answer should establish facts
  feedback?: string; // Optional - skip for smooth flow, include for acknowledgment
  icon?: string; // Optional emoji or icon (e.g. "✅", "❌", "🖥️")
  points?: number; // Optional gamification points (only if > 0)
  
  // Security Status display
  statement?: string; // Human-readable statement for Security Status (e.g., "Desktop OS: Windows")
  statusCategory?: 'shields-up' | 'to-do' | 'room-for-improvement'; // Override default categorization
  
  // Visibility conditions - same pattern as Question conditions
  // Supports wildcards: "*" means "any non-empty value"
  conditions?: {
    include?: Record<string, boolean | string | ArrayLike<boolean | string>>; // Show this option if facts match
    exclude?: Record<string, boolean | string | ArrayLike<boolean | string>>; // Hide this option if facts match
  };
  
  // Legacy properties for backward compatibility
  displayText?: string; // Alternative display text
  target?: string; // Target outcome for recommendations
  advice?: string; // Advice text for this option
  impact?: string; // Impact level for recommendations
  followUp?: string | any; // Follow-up information - flexible type
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
  statement?: string; // Optional statement before the question (for onboarding)
  
  // Core importance - higher number = more critical/urgent (no ceiling)
  priority: number; // e.g., 10000 = must happen first, 1000 = critical, 100 = standard
  
  // Required flexible answer options
  options: AnswerOption[]; // All possible answers
  
  // Optional gamification points (separate from importance)
  points?: number; // Only if > 0, purely for user engagement
  
  // Optional metadata
  tags?: string[]; // Replaces quickWin, category, etc. e.g., ['quickwin', 'password', 'critical']
  journeyIntent?: 'onboarding' | 'probe' | 'action-guided' | 'action-critical' | 'checklist' | 'insight';
  description?: string; // Why this matters

  // Actionability metadata — shown on improvement slides, used for ordering & gating
  difficulty?: 'beginner' | 'intermediate' | 'advanced'; // How challenging the remediation action is
  effort?: string; // Human-readable time estimate for the action (e.g. "2 minutes", "15 minutes")
  
  // Simple conditional visibility
  conditions?: {
    include?: Record<string, boolean | string | ArrayLike<boolean | string>>;
    exclude?: Record<string, boolean | string | ArrayLike<boolean | string>>;
    browserInfo?: any; // Flexible browser information for conditions
  };
  
  // Phase management
  phase?: 'onboarding' | 'assessment';
  
  // Legacy properties for backward compatibility
  type?: string; // Question type for component logic
  explanation?: string; // Educational information about the question
  actionHint?: string; // Hint for action-type questions
  actionOptions?: any[]; // Action-specific options for ActionQuestionCard
  weight?: number; // Question weight (maps to priority)
  relatedTopics?: string[]; // Related educational topics
  quickWin?: boolean; // Quick win flag for UI
  timeEstimate?: string; // Time estimate for completion
  affirmativeText?: string; // Text for affirmative responses
  negativeText?: string; // Text for negative responses
  deviceFilter?: string | any; // Device filter for availability - string or object
  prerequisites?: string[] | { answered?: string[]; anyAnswered?: string[]; }; // Prerequisites for this question
  runtimeVisibleFn?: (state: any) => boolean; // Runtime visibility function
  category?: string; // Question category
  phaseOrder?: number; // Phase ordering
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
  value: string | boolean | number; // The answer value - flexible for different question types
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
