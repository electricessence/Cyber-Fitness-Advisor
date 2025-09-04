export type QuestionType = 'YN' | 'SCALE' | 'ACTION';

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
  
  // Conditions for when this question should appear
  conditions?: {
    requireAnswers?: { [questionId: string]: string[] }; // Require specific answers to other questions
    browserInfo?: { browsers?: string[]; platforms?: string[] }; // Browser/platform requirements
    userProfile?: { techComfort?: string[]; concerns?: string[] }; // User profile requirements
  };
  
  // UI hints
  defaultLayout?: 'buttons' | 'radio' | 'dropdown'; // Suggested UI layout
  allowMultiple?: boolean; // Allow selecting multiple options
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
}

export interface Answer {
  questionId: string;
  value: boolean | number | string; // string for ACTION type (option ID)
  timestamp?: Date;
  pointsEarned?: number;
  questionText?: string; // Store for historic reference
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
