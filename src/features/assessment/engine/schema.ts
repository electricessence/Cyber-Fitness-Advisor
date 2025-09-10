// Import gate types from conditions to avoid duplication
import type { Gate } from './conditions';

export interface AnswerOption {
  id: string; // Stable identifier for tests and logic
  text: string; // What the user sees as the choice (can change for UI)
  facts: Record<string, boolean | string>; // Required - every answer establishes facts
  feedback?: string; // Optional - skip for smooth flow, include for acknowledgment
  icon?: string; // Optional emoji or icon (e.g. "✅", "❌", "🖥️")
  points?: number; // Optional gamification points (only if > 0)
  
  // Visibility conditions - same pattern as Question conditions
  // Supports wildcards: "*" means "any non-empty value"
  conditions?: {
    include?: Record<string, boolean | string | ArrayLike<boolean | string>>; // Show this option if facts match
    exclude?: Record<string, boolean | string | ArrayLike<boolean | string>>; // Hide this option if facts match
  };
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
  description?: string; // Why this matters
  
  // Simple conditional visibility
  conditions?: {
    include?: Record<string, boolean | string | ArrayLike<boolean | string>>;
    exclude?: Record<string, boolean | string | ArrayLike<boolean | string>>;
  };
  
  // Phase management
  phase?: 'onboarding' | 'assessment';
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
  value: string; // The answer text (since AnswerOption uses text as ID)
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
