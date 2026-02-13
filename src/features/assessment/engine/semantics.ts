/**
 * Content Semantic Version
 * 
 * Defines the locked semantic rules version for the conditional question engine.
 * This version is exposed globally for debugging and compatibility checking.
 */

export const CONTENT_SEMVER = "3.0.0";

/**
 * Semantic Rules Summary for Runtime Access
 */
export const SEMANTIC_RULES = {
  version: CONTENT_SEMVER,
  visibility: {
    default: "visible unless conditions.include/exclude hide it",
    conditions: "include = ALL must match; exclude = ANY match hides",
    deterministic: "purely data-driven from question bank conditions + facts"
  },
  scoring: {
    inclusion: "visible + not nonScoring questions only",
    hiddenAnswers: "retained but excluded from scoring"
  },
  onboarding: {
    scoring: "non-scored by default (nonScoring: true)",
    seeding: "idempotent - only fills missing values",
    versioning: "schema bumps trigger review, not reset"
  }
} as const;

/**
 * Expose semantic version globally for debugging
 */
if (typeof window !== 'undefined') {
  (window as any).__cfaSemantics = {
    version: CONTENT_SEMVER,
    rules: SEMANTIC_RULES,
    timestamp: new Date().toISOString()
  };
}
