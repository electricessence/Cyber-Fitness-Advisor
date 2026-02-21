# Content Flow Tree (Implemented)

This document is a **readable map of the implemented content**: what the app can ask, in what order, and what branches exist.

Scope:
- **Source of truth** is the question bank in `src/features/assessment/data/questions/`.
- This is **not** a wish list. If it isn’t represented by a question `id` + conditions, it’s not in this tree.
- The engine is **facts-first**: answers assert facts; **priorities + gates** decide what appears next.

## Vocabulary (so the flow is readable)

Questions annotate intent with `journeyIntent` (see `src/features/assessment/engine/schema.ts`). In the tree below:

- **onboarding**: trust + setup (privacy notice, OS/browser confirmation)
- **probe**: “Can I help you here?” quick assessment question
- **action-guided**: the “do this now” micro-mission (still implemented as questions)
- **insight**: short educational branch (no immediate action required)
- **checklist**: structured check, usually higher effort

## The spine (the default journey)

The app’s “choose your own adventure” still needs a *coherent spine*.
In practice, the spine is the set of highest-value flows whose priorities are intentionally ordered (see `src/features/assessment/data/questions/priorities.ts`).

### 0) Privacy first (must happen)

1. **privacy_notice** (priority 10000)
   - Visible when `privacy_acknowledged` is not set.
   - Sets: `privacy_acknowledged: true`.

### 1) First win: ad protection (fastest action)

2. **ad_blocker** (priority 98)
   - Probe that determines whether we can help immediately.
   - Branches:
     - If user is already protected → done (may unlock bonus follow-ups later).
     - If user is unprotected/partial → an action-guided deep-dive becomes eligible (after browser confirmation).

### 2) Establish browser (needed for browser-specific actions)

3. Browser confirmation (priority 97)
   - One of:
     - **chrome_detection_confirm** / **firefox_detection_confirm** / **edge_detection_confirm** / **safari_detection_confirm**
     - Or selection fallback: **browser_selection**, **browser_selection_fallback**
   - Sets: `browser` + `browser_confirmed`.

### 3) Ad protection deep-dive (browser-specific “do this now”)

4. Desktop deep-dive (priority 94)
   - Shows only when `ad_blocker` is `no|partial` and device is desktop.
   - One of:
     - **adblock_firefox_desktop**
     - **adblock_edge_desktop**
     - **adblock_chrome_desktop** (includes the “Manifest V3” reality + options)
     - **adblock_safari_desktop** (Safari content-blocker model)

5. Optional bonus (priority 93)
   - Example:
     - **sponsorblock_firefox** (only when `ublock_origin: true` and `browser: firefox`)
   - These are *nice-to-have* branches and should never block progress.

### 4) Second win: password safety

6. **password_manager** (priority 90)
   - Branches:
     - If `password_manager: yes` → deepen quality (type + master password strength)
     - If `password_manager: no` → diagnose current method + barrier

7. Password manager deep dive (priorities 89–86)
   - If uses a PM:
     - **pm_type**
     - **pm_master_password**
   - If does not use a PM:
     - **pm_current_method**
     - **pm_barrier**

### 5) Third win: account security (2FA)

8. **two_factor_auth** (priority 85)
   - Branches:
     - If `two_factor: yes|partial` → method + backup codes
     - If `two_factor: no|partial` → pick first account + barrier

9. 2FA deep dive (priorities 84–81)
   - If has any 2FA:
     - **tfa_method**
     - **tfa_backup_codes**
   - If missing/partial:
     - **tfa_priority_accounts**
     - **tfa_barrier**

### 6) Device OS confirmation (deferred by design)

10. OS confirmation + selection (priority 80–79)
    - Examples:
      - **windows_detection_confirm**, **mac_detection_confirm**, **linux_detection_confirm**
      - **os_selection** for detection fallback
      - **os_novice_help** if the user indicates they’re unsure

This is intentionally deferred until after the “first three wins.” It keeps early momentum focused on high-impact actions that don’t require lots of profile data.

### 7) “About you” personalization (earned)

11. **tech_comfort** (priority 78)
12. **usage_context** (priority 77)

These aren’t interrogations — they tune recommendations after the app has already proven it can help.

### 8) Daily habits (lightweight maintenance wins)

13. **software_updates** (priority 75)
14. **phishing_awareness** (priority 72)
15. **screen_lock** (priority 70)

### 9) Everything else (deeper assessment)

Lower-priority probes/checklists (virus scanning, backups, WiFi security, browser-specific security settings, etc.) come after the above.

## Branch map (Mermaid)

```mermaid
flowchart TD
  A[privacy_notice\n(privacy_acknowledged=true)] --> B[ad_blocker\n(probe)]
  B -->|yes| C[browser confirmation\n(if needed)]
  B -->|partial/no| C
  C --> D{ad_blocker partial/no\nand desktop?}
  D -->|yes| E[adblock_*_desktop\n(action-guided)]
  D -->|no| F[password_manager\n(probe)]
  E --> F

  F -->|yes| G[pm_type → pm_master_password]
  F -->|no| H[pm_current_method → pm_barrier]
  G --> I[two_factor_auth]
  H --> I

  I -->|yes/partial| J[tfa_method → tfa_backup_codes]
  I -->|no/partial| K[tfa_priority_accounts → tfa_barrier]
  J --> L[OS confirm/selection]
  K --> L
  L --> M[tech_comfort → usage_context]
  M --> N[Daily habits\nupdates → phishing → screen_lock]
```

## Quick “does this read right?” checks

Use these as short mental walkthroughs while reading the question copy.

### Scenario A: Returning, already strong
- Privacy acknowledged already → skip privacy notice.
- Ad blocker = yes → no deep-dive needed; continues to password manager / 2FA.
- Outcome: user feels rewarded, not re-onboarded.

### Scenario B: Chrome user, no ad blocker
- Sees ad blocker probe very early.
- Browser confirmation happens before the deep-dive.
- Chrome deep-dive is honest: options include uBO Lite *or* switching to Firefox/Edge.
- Outcome: user gets a clear action path without fear-based language.

### Scenario C: Desktop user who also has a phone
- Mobile context is asked later (priority 45), after early wins.
- Mobile security questions are gated behind `has_mobile: true`.
- Outcome: desktop journey isn’t slowed down by mobile profiling.

## Where to look in code

- Priorities (the ordering policy): `src/features/assessment/data/questions/priorities.ts`
- Onboarding (privacy, OS/browser confirm, personalization seeds): `src/features/assessment/data/questions/onboarding.ts`
- Core flows:
  - Ad-blocker probe: `src/features/assessment/data/questions/securityHygiene.ts`
  - Ad-block deep dives: `src/features/assessment/data/questions/adBlockDeepDive.ts`
  - Password manager probe: `src/features/assessment/data/questions/coreAssessment.ts`
  - Password manager deep dive: `src/features/assessment/data/questions/passwordManagerDeepDive.ts`
  - 2FA probe: `src/features/assessment/data/questions/coreAssessment.ts`
  - 2FA deep dive: `src/features/assessment/data/questions/twoFactorDeepDive.ts`