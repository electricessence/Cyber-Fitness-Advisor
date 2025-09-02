export type QuestionType = 'YN' | 'SCALE';

export interface Question {
  id: string;
  type: QuestionType;
  weight: number;
  text: string;
  quickWin?: boolean; // High impact, easy to implement
  timeEstimate?: string; // "2 minutes", "5 minutes"
  explanation?: string;
  actionHint?: string;
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
  value: boolean | number;
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
