# Cyber Fitness Advisor — Action Plan

> Last updated: 2026-02-18 (feature/phase-progress-bar branch)
> Latest commit: `efb5580` — 270/270 tests passing

---

## Current State

- **Branch**: `feature/phase-progress-bar` (3 commits ahead of main `8e3a858`)
- **Tests**: 270/270 passing, clean
- **68 questions** across 9 TypeScript content files
- Priority system restructured for flow ordering (ad-blocker first at 98)

## Key Decisions Made

### 1. TS-as-Content (not JSON)

The project originally planned JSON content packs with a JSON schema validator.
That system was **never connected to the runtime** — the TS question arrays drove
the app from day one. After analysis, TS is the better content format because:

- **Type safety at authoring time** — misspell a field and the compiler catches it
- **IDE autocomplete** — `journeyIntent: '` shows valid options immediately
- **Named priority constants** — `ASSESSMENT_PRIORITIES.AD_BLOCKER` not magic `95`
- **Zero extra tooling** — no separate schema, linter, or loader needed

**Action**: Delete the dead JSON artifacts (schema, seed-content, author-lint) and
document the TS content authoring pattern.

### 2. Flows, Not Phases

The phase bar (Phase 1: Orientation, Phase 2: Quick Wins, Phase 3: Building Habits)
is being **removed**. Replaced by a simple progress bar that grows — no labels,
no "X of Y", no phase titles.

**Terminology**: We use **"flow"** (or "mini-flow") — a short question sequence
(1-3 questions max) that races to find a gap and close it with an action.
Not "phases", not "stints".

### 3. Hunt-to-Help Philosophy

Every question is a search probe: "Can I help you here?" The app races to deliver
value. The first flow after browser confirmation is ad-blocker — the fastest win.

---

## Immediate TODO (Next Session)

### A. Remove Phase UI from QuestionDeck

**File**: `src/components/questions/QuestionDeck.tsx`

1. **Delete the `phaseProgress` useMemo** (~lines 211-252) — the entire block that
   computes onboarding/quickWin/remaining counts
2. **Delete the `phaseBar` useMemo** (~lines 327-354) — the block that picks
   "Phase 1 - Orientation" / "Phase 2 - Quick Wins" / "Phase 3 - Building Habits"
3. **Replace the phase bar render** (~lines 548-570) with a simple progress bar:
   - Just a thin bar that shows `answeredCount / totalQuestionCount` as width %
   - No label text, no "X/Y" counter — just the bar growing
   - Keep the amber/warm color palette (user likes the bubble chip style)
4. **Keep the journey intent chips** (Orientation, Guided Action, etc.) — those are
   the small bubble badges on each card, not the phase bar

### B. Delete Dead JSON Artifacts

1. Delete `schema/questions.schema.json` (341 lines — never used at runtime)
2. Delete `src/data/seed-content/seed-content-v1.json` (270 lines — never loaded)
3. Delete `src/data/seed-content/facts-first-seed-pack.json` (643 lines — never loaded)
4. Delete `scripts/author-lint.ts` (153 lines — validates dead JSON files)
5. Remove `"author:lint"` script from `package.json`
6. Remove the `author:lint` step from `.github/workflows/static.yml`
7. Remove the "Validate seed content structure" step from `static.yml`
8. Update `.github/instructions/dev-guide.instructions.md` to remove `author:lint` ref

### C. Update Terminology in Docs

- Replace "stint" with "flow" in `docs/ARCHITECTURE.md` and
  `.github/copilot-instructions.md`
- Remove "Phase 1/2/3" language, replace with flow-based language
- Update `docs/QUESTION_AUTHORING.md` to document TS content authoring pattern
- Rename the onboarding `journeyIntent` label from "Orientation" to something
  better (e.g. "Setup" or "Browser Check") — this is the chip on each card

### D. Verify Ad-Blocker Flow Content

The first flow for a desktop user should be:

1. Browser confirm (auto-detected, user taps to confirm)
2. "Do you use an ad blocker?" (priority 95 — first assessment question)
3. If NO: browser-specific install guide (priority 94, e.g. `adblock_firefox_desktop`)
4. Celebrate the win

**Check**: Walk through the content in `securityHygiene.ts` (ad_blocker question)
and `adBlockDeepDive.ts` (9 browser-specific install flows) to ensure the copy is
tight, the conditions are correct, and the flow feels like a helpful friend, not a
security audit.

**This flow is the benchmark** — it sets the pattern for every flow that follows.

### E. Run Tests and Commit

- `pnpm test` — expect 270/270 passing
- Follow phased commit process (Stage, Critical Review, Full Regression, Commit)
- Commit message: `refactor: remove phase UI, delete dead JSON artifacts, adopt flow terminology`

---

## Architecture Reference

### Question Priority Ranges (Flow Ordering)

```text
Flow 1 - Welcome:    10000      (privacy notice — 1 tap, trust)
Flow 2 - Your Setup:  97-79    (browser + OS detection/confirmation)
Flow 3 - Ad Blocker:  98-92    (probe, browser-specific install, followup)
Flow 4 - Passwords:   90-86    (probe, type, master pw, barrier)
Flow 5 - Account Sec: 85-81    (probe, method, backup codes, barrier)
Flow 6 - About You:   78-77    (tech_comfort, usage_context — earned after 3 wins)
Flow 7 - Daily Habits:75-70    (software_updates, phishing, screen_lock)
(no flow) Deep Assessment: 68-38  (everything else)
```

### Content Files

| File | Count | Purpose |
|------|-------|---------|
| `onboarding.ts` | 18 | Privacy notice, OS/browser detection + confirmation |
| `securityHygiene.ts` | 6 | Core probes: ad_blocker, screen_lock, phishing, etc. |
| `adBlockDeepDive.ts` | 9 | Browser-specific ad-blocker install flows |
| `coreAssessment.ts` | 8 | Password manager, 2FA, updates, backups, etc. |
| `passwordManagerDeepDive.ts` | 4 | PM type, master password, barriers |
| `twoFactorDeepDive.ts` | 4 | 2FA method, backup codes, barriers |
| `browserSecurity.ts` | 8 | Browser-specific security features |
| `mobileSecurity.ts` | 10 | Mobile-specific security questions |
| `questionBank.ts` | 1 | advanced_2fa (inline) |

### Key Engine Files

- `engine/schema.ts` — Question and AnswerOption TypeScript interfaces (THE schema)
- `data/questions/priorities.ts` — Named priority constants for all flows
- `state/store.ts` — Zustand store with ordering logic (probe ceiling, flow ordering)
- `engine/conditionEvaluation.ts` — Facts-based visibility evaluation

### Dead Files to Delete

- `schema/questions.schema.json` — JSON schema, never validated runtime questions
- `src/data/seed-content/seed-content-v1.json` — Old seed pack, never loaded
- `src/data/seed-content/facts-first-seed-pack.json` — Newer seed pack, never loaded
- `scripts/author-lint.ts` — Validates dead JSON files only
- References in `package.json`, `static.yml`, `dev-guide.instructions.md`
