# Cyber Fitness Advisor - Semantic Rules v2.0

## Overview

This document defines the locked semantic rules for the Cyber Fitness Advisor's conditional question engine. These rules govern question visibility, patching, scoring, and suite unlocking.

**Content Semantic Version: `2.0.0`**

## Core Principles

### 1. Visibility Rules

- **Default State**: Questions without gates are **visible by default** (non-suite questions)
- **Suite Questions**: Hidden by default; only visible when suite is unlocked
- **Any Gate Passes**: Question becomes visible if **ANY** gate condition passes
- **Hide Precedence**: **Hide actions always override show actions** regardless of evaluation order
- **Deterministic Resolution**: When conflicts arise, resolved by question ID alphabetical order

### 2. Gate Evaluation Logic

#### Condition Operators
- **`all`**: ALL conditions must be true (AND logic)
- **`any`**: AT LEAST ONE condition must be true (OR logic) 
- **`none`**: NONE of the conditions must be true (NOT logic)
- **Gate Passes**: `all AND any AND none` must all evaluate to true

#### Comparators
- **Exact Matching**: `equals`, `not_equals`
- **Array Membership**: `in`, `not_in` with `values` array
- **Content Matching**: `contains`, `not_contains` (substring for strings, element for arrays)
- **Existence**: `exists`, `not_exists` (checks for undefined/null)
- **Numeric**: `greater_than`, `less_than`, `greater_equal`, `less_equal`
- **Boolean Evaluation**: `truthy`, `falsy` (JavaScript truthiness)

### 3. Patching Rules

- **Gate-Attached**: Patches defined in `gate.patch` object
- **Last Writer Wins**: When multiple patches target same question, later patches override earlier ones
- **Field Merging**: Individual fields are merged; full replacement only for explicitly overwritten fields
- **Stable Order**: Patch application follows deterministic order (question ID, then gate index)
- **Visibility Required**: Patches only apply to visible questions

### 4. Suite Unlocking

- **Multi-Gate Support**: Suites can have multiple gates with OR semantics
- **Any Gate Unlocks**: Suite unlocks if **ANY** gate passes
- **Question Visibility**: When suite unlocks, all suite questions become visible
- **Gate Actions**: Gates can also unlock suites via `unlockSuites` action
- **Priority Ordering**: Suites sorted by priority for display (higher priority first)

### 5. Scoring Semantics

- **Visible + Scored Only**: Only questions that are both visible AND not marked `nonScoring` count toward score
- **Hidden Answer Retention**: Hidden questions retain their answers but are excluded from scoring
- **Weight Consideration**: Question weight affects scoring when visible
- **Domain Aggregation**: Scores aggregate by domain, then roll up to overall score

### 6. Onboarding Integration

- **Non-Scored**: Onboarding questions have `nonScoring: true` by default
- **Idempotent Seeding**: Onboarding answers only seed empty values, never overwrite existing answers
- **Schema Versioning**: Content version bumps trigger onboarding review but don't force reset
- **One-Time Flow**: Onboarding completes once; subsequent access is summary/review only

## Resolution Examples

### Example 1: Hide vs Show Conflict
```json
Gate A: { "show": ["question1"], ... }
Gate B: { "hide": ["question1"], ... }
```
**Result**: `question1` is **hidden** (hide precedence)

### Example 2: Patch Merging
```json
Gate A: { "patch": { "q1": { "text": "Version A", "weight": 10 } } }
Gate B: { "patch": { "q1": { "text": "Version B", "priority": 5 } } }
```
**Result**: `q1` gets `{ text: "Version B", weight: 10, priority: 5 }` (merge + last writer wins)

### Example 3: Suite Multi-Gate
```json
Suite: {
  "gates": [
    { "all": [{ "questionId": "expert", "when": "equals", "value": true }] },
    { "all": [{ "questionId": "score", "when": "greater_than", "value": 80 }] }
  ]
}
```
**Result**: Suite unlocks if user is expert **OR** score > 80

## Cycle Detection

- **Construction Validation**: Cycles detected when engine is created/updated
- **Runtime Validation**: Lightweight cycle check during evaluation (cached dependency graph)
- **Error Details**: Cycle detection returns readable dependency chain
- **Fail-Fast**: Engine throws error on cycle detection, preventing infinite loops

## Performance Guarantees

- **Multi-Pass Evaluation**: Engine uses 4-pass algorithm for deterministic results
- **Cached Dependencies**: Dependency graph cached and validated
- **Stable Ordering**: All outputs (questions, suites, patches) have deterministic order
- **Memory Efficient**: No deep recursion; iterative evaluation

## Migration Compatibility

- **Backward Compatible**: v2.0 maintains compatibility with v1.x question structures
- **Graceful Degradation**: Unknown comparators or actions log warnings but don't break evaluation
- **Version Detection**: Content includes version number for migration logic

---

**Version History:**
- **v2.0.0**: Locked semantics for Phase 2.5 release
- **v1.x**: Development iterations with semantic refinements

**Last Updated**: September 8, 2025  
**Next Review**: On content model changes only
