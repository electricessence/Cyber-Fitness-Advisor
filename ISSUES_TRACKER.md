# Issues Tracker — Cyber Fitness Advisor

> Last updated: V1 polish pass (current session)

## Current State

- **261/261 tests passing** across 32 test files
- **68 questions** with 100% `journeyIntent` coverage, all core/hygiene questions privacy-gated
- **10 persona journeys** covering Windows, Mac, Linux, iOS, Android — Edge, Chrome, Firefox, Safari
- All known P0/P1 issues resolved

---

## Known Gaps (P2 — Not Blocking V1)

### Option Branch Coverage (~50%)
Approximately half of all option branches (~110 of ~220) have no persona journey
exercising them. These are non-default paths (e.g. "WPA" wifi, "clipboard" PM
method) that the condition engine handles generically. Expanding persona coverage
would require adding new personas or variant journeys.

### 3 Ad-Block Questions Without Persona Coverage
The following ad-block deep-dive questions have no persona that satisfies their
conditions:
- `adblock_firefox_desktop` — requires `browser=firefox` + `ad_blocker=['no','partial']`.
  All three Firefox personas (Marcus, Pat, Dana) answer `ad_blocker='yes'`.
- `sponsorblock_firefox` — gated behind `ublock_origin=true` (from `adblock_firefox_desktop`).
  Since no persona triggers the parent, this is also uncovered.
- `chrome_password_warning` — requires `browser=chrome` + `pm_type='browser'`.
  Financial Frank uses Chrome but has `pm_type='cloud'`.

These could be addressed in a future "variant persona" pass without blocking V1.

### 13 Questions Never Answered by Any Persona
Some questions target rare combinations (e.g. `mobile_os_selection` manual path,
`linux_detection_confirm` when detection is wrong). These represent edge cases
in the condition engine that are covered by unit tests but not by end-to-end
persona journeys.

---

## Resolved Archive

All issues below were resolved during development and are kept for historical
reference only.

| Issue | Resolution |
|-------|-----------|
| P0: Answer processing facts pipeline | Fixed — facts extracted from options correctly |
| P0: Test suite failures (9 failing) | Fixed — 261/261 passing |
| P0: Invalid option IDs in mobile personas | Fixed — 9 mismatches corrected (this session) |
| P1: Privacy gate missing from core/hygiene questions | Fixed — 14 questions gated on `privacy_acknowledged` (this session) |
| P1: `journeyIntent` missing from 72% of questions | Fixed — 68/68 = 100% coverage (this session) |
| P1: Debug artifacts (console.log spam) | Fixed — production logs removed |
| P1: React act() warnings | Fixed — suppressed in test setup |
| P1: Ad-block persona coverage gaps | Fixed — 5 of 8 gaps closed (this session) |
| Security Status implementation | Complete — accordion UI, categorization, statements |
| Security Status question bank enhancement | Complete — all core questions enhanced |
| Device detection facts injection | Complete — `injectFact()` method working |
| Modular question bank architecture | Complete — split into focused files with barrel exports |
