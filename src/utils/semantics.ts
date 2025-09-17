/**
 * Content Semantic Version for Cyber Fitness Advisor
 * 
 * This version tracks changes to content rules, gate behavior, 
 * and semantic processing. Incremented when content structure
 * or interpretation changes in ways that could affect user experience.
 */
export const CONTENT_SEMVER = "2.0.0";

/**
 * Semantic rules and diagnostics exposed to window for debugging
 */
export const CFASemantics = {
  version: CONTENT_SEMVER,
  
  getRules() {
    return {
      visibility: "visible if any gate passes; hidden if any passing gate hides it",
      patching: "last writer wins, stable order (question id, then gate index)",
      scoring: "only visible + not nonScoring questions. Hidden answers retained but excluded",
      onboarding: "non-scored, one-time seed if undefined, idempotent on schema bump",
      suites: "unlocked by any qualifying gate (OR logic)",
      cycles: "detected and prevented by authoring linter"
    };
  },
  
  getDiagnostics() {
    // Returns diagnostic data for development tools
    return {
      invalidRefs: [],
      cycles: [],
      conflicts: [],
      patches: []
    };
  }
};

// Expose to window for development/debugging
declare global {
  interface Window {
    __cfaSemantics?: typeof CFASemantics;
  }
}

if (typeof window !== 'undefined') {
  window.__cfaSemantics = CFASemantics;
}
