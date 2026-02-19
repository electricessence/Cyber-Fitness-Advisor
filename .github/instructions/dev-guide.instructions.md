# Cyber Fitness Advisor — Developer Guide (for new dev-agents)

## Project Goal

Cyber Fitness Advisor is a **browser-only, zero-backend SPA** (static, GitHub Pages–friendly) that helps individuals **improve their internet security and privacy** through structured guidance.

It must feel like a **fitness app for security**:

* Progress is tier-based (unlocking levels), not just points.
* Users answer small, high-impact questions that dynamically unlock new paths.
* Daily tasks provide bite-sized wins.
* Score and badges provide feedback, but **tiers are unlocked by prerequisites**, not by raw points.

---

## Core Concepts

### Facts

* **Facts** are the single source of truth.
* Every answer asserts facts (e.g., `usesPasswordManager=true`).
* Facts can also come from onboarding, device detection, or inference.
* All conditional logic (visibility, unlocking, recommendations) is fact-based.

### Questions

* Each question has: `id, text, type (YN/SCALE/CHOICE/MULTI), weight, tags (impact, difficulty, estMinutes, category), nonScoring?`.
* Questions can assert facts and may expire (`validForDays`, `expiresAt`).
* Visibility and flow are controlled by **gates** (conditions on facts).

### Gates

* Gates evaluate facts with comparators (`equals, not_equals, in, not_in, contains, not_contains, exists, not_exists, gt, gte, lt, lte, truthy, falsy, regex`).
* If **any gate passes**, a question is visible.
* **Hide gates override show gates.**
* Gates can also unlock suites, patch questions, or assert new facts.

### Suites (Scenarios/Workouts)

* A suite is a group of related questions (e.g., “Password Power-Up”).
* Unlocks if any of its gates pass.
* Completing a suite grants a badge and can assert facts that unlock higher tiers.

### Tiers

* **Tier 0: Onboarding** (non-scored, seeds facts).
* **Tier 1: Shields Up** (browser safety, easy wins).
* **Tier 2: Password Management & MFA**.
* **Tier 3: Email Security**.
* **Tier 4+: Data safety, network segmentation, advanced practices.**
* Tiers unlock when **prerequisite facts are asserted** — not by points.

### Daily Task

* Each day, the engine picks one **high-impact, easy, short** task:

  * Must be visible, not completed, not expired, not on cooldown.
  * Scored by heuristic: impact + (1/difficulty) + (1/estMinutes).
  * Bonus if it unlocks a tier.
* Completing it gives streak/badge credit.

### Scoring

* Score is feedback, not progression.
* Only visible, scored questions count.
* YN → Yes=1/No=0; SCALE → (x−1)/4 normalized.
* Score bar shows 0–100 with tier badge.
* Diminishing returns: early high-impact questions boost fast; advanced ones less so.

### Personalization

* Onboarding asserts facts about platform (`os.primary`, `phone`), readiness (`willingnessLevel`), etc.
* Combined facts (e.g., Windows + iPhone) unlock tailored flows.

### Authoring & Tooling

* Content authored in **TypeScript** (`.ts` files in `src/features/assessment/data/questions/`).
* TypeScript provides type safety, IDE autocomplete, and compile-time validation.
* Schema defined by `Question` and `AnswerOption` interfaces in `src/features/assessment/engine/schema.ts`.
* Priority constants in `src/features/assessment/data/questions/priorities.ts` organize flows.
* Diagnostics panel shows runtime errors.
* Docs:

  * `SEMANTICS.md` (this rulebook).
  * `QUESTION_AUTHORING.md` (examples).
  * `FACTS_REFERENCE.md` (canonical facts).
  * `DEPLOY_PAGES.md`.

---

## Acceptance Criteria

* Strict TypeScript; CI runs lint, typecheck, test, build, Pages deploy.
* Facts-first engine; hide>show precedence; deterministic condition evaluation.
* Tiers unlock via facts; onboarding seeds but doesn’t score.
* Daily task appears, completes, and rolls over.
* Personas (fixtures of facts) validate flows.
* Lighthouse ≥ 90; accessible UI.
* Docs and schema published; Diagnostics panel clean on seed content.
