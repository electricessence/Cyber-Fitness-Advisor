/**
 * Facts-Based Architecture: Core Types
 * 
 * This module defines the core types for the facts-based assessment system.
 * Facts represent stable domain knowledge about a user's security posture,
 * independent of how questions are asked or answered.
 */

// Core fact categories as defined in the architecture
export type FactCategory = 
  | 'device'        // Device capabilities, OS, hardware
  | 'software'      // Installed applications, versions, configurations  
  | 'behavior'      // User habits, preferences, practices
  | 'knowledge'     // User awareness, understanding, expertise
  | 'environment'   // Network, workplace, threat landscape
  | 'compliance';   // Regulatory, organizational requirements

// Fact value types - facts can hold different types of values
export type FactValue = 
  | boolean         // Simple true/false facts
  | number          // Numeric values (versions, counts, scores)
  | string          // Text values (OS names, software versions)
  | string[]        // Lists (installed software, enabled features)
  | Record<string, any>; // Complex objects for structured data

// A fact represents a single piece of domain knowledge
export interface Fact {
  /** Unique identifier for this fact */
  id: string;
  
  /** Human-readable name for this fact */
  name: string;
  
  /** The category this fact belongs to */
  category: FactCategory;
  
  /** The actual value of this fact */
  value: FactValue;
  
  /** When this fact was established */
  establishedAt: Date;
  
  /** How this fact was established (which question/answer) */
  establishedBy: {
    questionId: string;
    answerId?: string;
    answerValue?: any;
  };
  
  /** How confident we are in this fact (0-1) */
  confidence: number;
  
  /** When this fact might expire/need refresh */
  expiresAt?: Date;
  
  /** Additional metadata */
  metadata?: Record<string, any>;
}

// Collection of all facts about a user
export interface FactsProfile {
  /** All established facts keyed by fact ID */
  facts: Record<string, Fact>;
  
  /** When this profile was last updated */
  lastUpdated: Date;
  
  /** Version of the facts schema */
  version: string;
}

// Configuration for how an answer establishes facts
export interface AnswerFactMapping {
  /** The question ID this mapping applies to */
  questionId: string;
  
  /** Function that extracts facts from an answer */
  extractFacts: (answer: any, existingFacts: FactsProfile) => Fact[];
  
  /** Optional conditions for when this mapping applies */
  conditions?: {
    /** Only apply if answer has this value */
    answerValue?: any;
    /** Only apply if answer option has this ID */
    optionId?: string;
    /** Only apply if these facts already exist */
    requiresFacts?: string[];
  };
}

// Result of processing an answer through the facts system
export interface FactExtractionResult {
  /** Facts that were established */
  factsEstablished: Fact[];
  
  /** Facts that were updated */
  factsUpdated: Fact[];
  
  /** Facts that were invalidated/removed */
  factsInvalidated: string[];
  
  /** Any conflicts or issues encountered */
  conflicts: FactConflict[];
}

// Represents a conflict between facts
export interface FactConflict {
  /** The fact IDs involved in the conflict */
  factIds: string[];
  
  /** Description of the conflict */
  description: string;
  
  /** Suggested resolution */
  resolution: 'keep-newest' | 'keep-highest-confidence' | 'manual-review';
}

// Query interface for finding facts
export interface FactQuery {
  /** Category to filter by */
  category?: FactCategory;
  
  /** Fact IDs to include */
  ids?: string[];
  
  /** Pattern to match against fact names */
  namePattern?: RegExp;
  
  /** Minimum confidence threshold */
  minConfidence?: number;
  
  /** Only include non-expired facts */
  onlyValid?: boolean;
}
