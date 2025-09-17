/**
 * Application constants
 */

// Time constants (in milliseconds)
export const TIME_CONSTANTS = {
  /** 1 day in milliseconds */
  ONE_DAY: 24 * 60 * 60 * 1000,
  /** 1 week in milliseconds */
  ONE_WEEK: 7 * 24 * 60 * 60 * 1000,
  /** 1 month (30 days) in milliseconds */
  ONE_MONTH: 30 * 24 * 60 * 60 * 1000,
  /** 90 days in milliseconds */
  NINETY_DAYS: 90 * 24 * 60 * 60 * 1000,
  /** 180 days in milliseconds */
  ONE_HUNDRED_EIGHTY_DAYS: 180 * 24 * 60 * 60 * 1000,
} as const;

// Score constants
export const SCORE_CONSTANTS = {
  /** Badge threshold for halfway hero */
  HALFWAY_THRESHOLD: 50,
  /** Maximum impact score */
  MAX_IMPACT_SCORE: 100,
  /** Perfect score */
  PERFECT_SCORE: 100,
} as const;

// Performance constants
export const PERFORMANCE_CONSTANTS = {
  /** Maximum render time budget (ms) */
  RENDER_TIME_BUDGET: 100,
  /** Maximum transition time budget (ms) */
  TRANSITION_TIME_BUDGET: 1000,
  /** Brief UI delay for state updates (ms) */
  UI_UPDATE_DELAY: 50,
} as const;