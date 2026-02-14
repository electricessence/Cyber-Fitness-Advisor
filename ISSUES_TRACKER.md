# Issues Tracker — Cyber Fitness Advisor

> Last updated: V1 polish pass (session 3)

## Current State

- **263+ tests passing** across 32 test files
- **68 questions** with 100% `journeyIntent` coverage, all core/hygiene questions privacy-gated
- **13 persona journeys** covering Windows, Mac, Linux, iOS, Android, mobile-only — Edge, Chrome, Firefox, Safari
- **68/68 questions answered** (100%) — every question is reached by at least one persona
- All known P0/P1 issues resolved

---

## Known Gaps (P2 — Not Blocking V1)

### Option Branch Coverage (~65%)
Many option branches now have persona coverage, but roughly a third of all
option branches (~80 of ~230) still have no persona exercising them. These are
less-common paths (e.g. `safari_itp: 'disabled'`, `ios_app_sources: 'testflight'`,
detection rejection for Mac/Linux/iOS/Android, etc.) that the condition engine
handles generically. Expanding coverage further would require variant personas
or dedicated edge-case journeys.

---

## Resolved Archive

All issues below were resolved during development and are kept for historical
reference only.

| Issue | Resolution |
|-------|-----------|
| P0: Answer processing facts pipeline | Fixed — facts extracted from options correctly |
| P0: Test suite failures (9 failing) | Fixed — 261/261 passing |
| P0: Invalid option IDs in mobile personas | Fixed — 9 mismatches corrected |
| P0: Phantom option IDs in Maya/Fiona | Fixed — 5 invalid IDs corrected (screen_lock, virus_scan, password_reuse, phishing) |
| P1: Privacy gate missing from core/hygiene questions | Fixed — 14 questions gated on `privacy_acknowledged` |
| P1: `journeyIntent` missing from 72% of questions | Fixed — 68/68 = 100% coverage |
| P1: Debug artifacts (console.log spam) | Fixed — production logs removed |
| P1: React act() warnings | Fixed — suppressed in test setup |
| P1: Ad-block persona coverage gaps | Fixed — all 3 gaps closed (adblock_firefox_desktop, sponsorblock_firefox, chrome_password_warning) |
| P1: 8 questions never answered | Fixed — all 68 now covered by 13 personas (os_selection, mobile_os_selection, browser_selection, browser_selection_fallback via Maya/Fiona/Carol) |
| Security Status implementation | Complete — accordion UI, categorization, statements |
| Security Status question bank enhancement | Complete — all core questions enhanced |
| Device detection facts injection | Complete — `injectFact()` method working |
| Modular question bank architecture | Complete — split into focused files with barrel exports |
