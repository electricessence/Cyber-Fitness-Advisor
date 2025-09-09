/**
 * Content Semantic Version
 * 
 * Defines the locked semantic rules version for the conditional question engine.
 * This version is exposed globally for debugging and compatibility checking.
 */

export const CONTENT_SEMVER = "2.0.0";

/**
 * Semantic Rules Summary for Runtime Access
 */
export const SEMANTIC_RULES = {
  version: CONTENT_SEMVER,
  visibility: {
    default: "visible (non-suite) or hidden (suite)",
    anyGatePasses: "visible if ANY gate passes",
    hidePrecedence: "hide actions override show actions",
    deterministic: "conflicts resolved by question ID alphabetical order"
  },
  patching: {
    order: "last writer wins, stable order (question ID, then gate index)",
    merging: "field-level merging, not full replacement",
    visibility: "patches only apply to visible questions"
  },
  scoring: {
    inclusion: "visible + not nonScoring questions only",
    hiddenAnswers: "retained but excluded from scoring"
  },
  suites: {
    unlocking: "ANY gate passing unlocks suite",
    visibility: "suite questions become visible when unlocked"
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
