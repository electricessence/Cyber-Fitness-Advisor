/**
 * Persona-Based User Journeys
 *
 * Real-world user archetypes exercising realistic end-to-end paths
 * through the question bank.  Each persona validates that the app
 * asks the *right* questions, in the *right* order, for a recognisable
 * human being — not just a technical branch.
 *
 * Personas:
 *  1. "Grandma Dorothy"    — low-tech beginner, needs hand-holding
 *  2. "Tech Bro Marcus"    — advanced power user, maximum security
 *  3. "Farmer John"        — minimal tech, desktop-only, rarely updates
 *  4. "Working Mom Sarah"  — practical, busy, partial security adoption
 *  5. "Privacy Pat"        — privacy-first advocate, Firefox strict
 *  6. "Financial Frank"    — finance-focused, 2FA everywhere, breach-aware
 *  7. "Linux Dev Dana"     — developer, Linux + Firefox, advanced
 *  8. "College Student Alex" — Mac + Safari, Apple ecosystem, moderate
 *  9. "iPhone Emma"        — iOS mobile-first, Safari, Apple deep-dives
 * 10. "Android Amir"       — Android mobile-first, Chrome, Android deep-dives
 * 11. "Mobile-Only Maya"   — no desktop, failed detection → manual OS/browser
 * 12. "Firefox Beginner Fiona" — rejects detection, fallback browser select,
 *                              Firefox ad-block install, untested PM/2FA options
 * 13. "Chrome Carol"        — Chrome built-in PM, triggers chrome_password_warning
 *
 * OS × Browser diversity matrix:
 *   Windows: Edge (Dorothy, John) | Firefox (Marcus, Fiona*) | Chrome (Frank, Carol)
 *   Mac:     Chrome (Sarah) | Firefox (Pat) | Safari (Alex)
 *   Linux:   Firefox (Dana)
 *   Mobile-Only: Android (Maya via manual selection)
 *   * Fiona rejects Firefox detection, then picks Firefox via fallback
 */

import { expect } from 'vitest';
import { JourneyBuilder } from './journeyFramework';
import { useAssessmentStore } from '../features/assessment/state/store';
import { injectDevice, injectFailedDetection } from './testHelpers';
import type { UserJourney } from './journeyFramework';

// ═══════════════════════════════════════════════════════════════════════
// Persona 1 — "Grandma Dorothy"
// Low-tech Windows/Edge user.  Unsure about OS detection, triggers
// novice help flow.  No password manager, no 2FA.  Low score expected.
// ═══════════════════════════════════════════════════════════════════════

export const grandmaDorothy: UserJourney = JourneyBuilder
  .create('Grandma Dorothy — Low-Tech Beginner')
  .description(
    'Elderly user who is unsure about technology. Triggers the novice help ' +
    'path, answers poorly on security questions, and receives remediation guidance.'
  )

  // — Onboarding —
  .step('Detect Windows + Edge')
    .custom(() => injectDevice('windows', 'edge'))
    .then()
  .step('Acknowledge privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  .step('Unsure about Windows detection → sets tech_comfort=novice')
    .answerQuestion('windows_detection_confirm', 'unsure')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('tech_comfort')?.value).toBe('novice');
    })
    .then()
  .step('Novice help: select Windows')
    .answerQuestion('os_novice_help', 'windows')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('os')?.value).toBe('windows');
      expect(store.factsActions.getFact('os_confirmed')?.value).toBe(true);
    })
    .then()
  .step('Confirm Edge browser')
    .answerQuestion('edge_detection_confirm', 'yes')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('browser')?.value).toBe('edge');
    })
    .then()
  .step('Tech comfort: beginner')
    .answerQuestion('tech_comfort', 'beginner')
    .then()
  .step('No mobile device')
    .answerQuestion('mobile_context', 'neither')
    .then()
  .step('General concern')
    .answerQuestion('usage_context', 'general')
    .then()

  // — Core Assessment (poor answers) —
  .step('No password manager')
    .answerQuestion('password_manager', 'no')
    .expectCustom(() => {
      // Should unlock PM remediation branch
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('pm_current_method');
      expect(ids).toContain('pm_barrier');
      expect(ids).not.toContain('pm_type');
    })
    .then()
  .step('PM method: reuses passwords')
    .answerQuestion('pm_current_method', 'reuse')
    .then()
  .step('PM barrier: overwhelmed')
    .answerQuestion('pm_barrier', 'overwhelmed')
    .then()
  .step('No two-factor auth')
    .answerQuestion('two_factor_auth', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('tfa_priority_accounts');
      expect(ids).toContain('tfa_barrier');
      expect(ids).not.toContain('tfa_method');
    })
    .then()
  .step('TFA priority: email')
    .answerQuestion('tfa_priority_accounts', 'email')
    .then()
  .step('TFA barrier: confusing')
    .answerQuestion('tfa_barrier', 'confusing')
    .then()
  .step('Rarely updates software')
    .answerQuestion('software_updates', 'rarely')
    .then()

  // — Security Hygiene (poor) —
  .step('Screen lock: no')
    .answerQuestion('screen_lock', 'no')
    .then()
  .step('Password reuse: often')
    .answerQuestion('password_reuse_habits', 'often')
    .then()
  .step('Phishing: clicks link')
    .answerQuestion('phishing_awareness', 'click_link')
    .then()

  // — Browser-specific (Edge) —
  .step('Edge SmartScreen: unsure')
    .answerQuestion('edge_smartscreen', 'unsure')
    .then()

  .finalOutcome(
    'Grandma Dorothy has a low score with remediation-focused deep-dives answered',
    () => {
      const store = useAssessmentStore.getState();
      // Low score — poor practices across the board
      expect(store.overallScore).toBeLessThan(25);
      // Remediation branches were reached
      expect(store.answers['pm_current_method']?.value).toBe('reuse');
      expect(store.answers['pm_barrier']?.value).toBe('overwhelmed');
      expect(store.answers['tfa_priority_accounts']?.value).toBe('email');
      expect(store.answers['tfa_barrier']?.value).toBe('confusing');
      // "Yes" branches were never surfaced
      expect(store.answers['pm_type']).toBeUndefined();
      expect(store.answers['pm_master_password']).toBeUndefined();
      // advanced_2fa should NOT have been unlocked
      const ids = store.getVisibleQuestionIds();
      expect(ids).not.toContain('advanced_2fa');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 2 — "Tech Bro Marcus"
// Advanced user, Windows/Firefox, full password manager, hardware 2FA,
// automatic updates → unlocks advanced_2fa gate.  High score expected.
// ═══════════════════════════════════════════════════════════════════════

export const techBroMarcus: UserJourney = JourneyBuilder
  .create('Tech Bro Marcus — Advanced Power User')
  .description(
    'Security-savvy user who has everything locked down: local password manager ' +
    'with strong passphrase, hardware 2FA keys, auto updates, strict Firefox. ' +
    'Should unlock the advanced_2fa multi-condition gate.'
  )

  // — Onboarding —
  .step('Detect Windows + Firefox')
    .custom(() => injectDevice('windows', 'firefox'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Windows')
    .answerQuestion('windows_detection_confirm', 'yes')
    .then()
  .step('Confirm Firefox')
    .answerQuestion('firefox_detection_confirm', 'yes')
    .then()
  .step('Tech comfort: advanced')
    .answerQuestion('tech_comfort', 'advanced')
    .then()
  .step('Mobile: iOS')
    .answerQuestion('mobile_context', 'ios')
    .then()
  .step('Priority: privacy')
    .answerQuestion('usage_context', 'personal_data')
    .then()

  // — Core Assessment (excellent answers) —
  .step('Uses password manager')
    .answerQuestion('password_manager', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('pm_type');
      expect(ids).toContain('pm_master_password');
      expect(ids).not.toContain('pm_current_method');
    })
    .then()
  .step('PM type: local (offline)')
    .answerQuestion('pm_type', 'local')
    .then()
  .step('PM master password: strong passphrase')
    .answerQuestion('pm_master_password', 'passphrase')
    .then()
  .step('Uses 2FA')
    .answerQuestion('two_factor_auth', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('tfa_method');
      expect(ids).toContain('tfa_backup_codes');
      expect(ids).not.toContain('tfa_priority_accounts');
    })
    .then()
  .step('TFA method: hardware key')
    .answerQuestion('tfa_method', 'hardware_key')
    .then()
  .step('TFA backup codes: securely stored')
    .answerQuestion('tfa_backup_codes', 'yes_secure')
    .then()
  .step('Automatic software updates → should unlock advanced_2fa')
    .answerQuestion('software_updates', 'automatic')
    .expectCustom(() => {
      // Both conditions met: password_manager=yes AND updates=automatic
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('advanced_2fa');
    })
    .then()
  .step('Advanced 2FA: yes (hardware keys)')
    .answerQuestion('advanced_2fa', 'yes')
    .then()

  // — Security Hygiene (excellent) —
  .step('Screen lock: short auto-lock')
    .answerQuestion('screen_lock', 'yes_short')
    .then()
  .step('Password reuse: never')
    .answerQuestion('password_reuse_habits', 'never')
    .then()
  .step('Phishing: ignores, goes direct')
    .answerQuestion('phishing_awareness', 'ignore_go_direct')
    .then()
  .step('Breach check: regularly')
    .answerQuestion('breach_check', 'yes_regularly')
    .then()
  .step('Account recovery: multiple methods')
    .answerQuestion('account_recovery', 'yes_multiple')
    .then()
  .step('Ad blocker: yes')
    .answerQuestion('ad_blocker', 'yes')
    .then()

  // — Remaining core questions —
  .step('Virus scan: this week')
    .answerQuestion('virus_scan_recent', 'this_week')
    .then()
  .step('Backup: daily')
    .answerQuestion('backup_frequency', 'daily')
    .then()
  .step('WiFi: WPA3')
    .answerQuestion('wifi_security', 'wpa3')
    .then()
  .step('Email: never opens unknown attachments')
    .answerQuestion('email_attachments', 'never_open')
    .then()
  .step('Extensions: very selective')
    .answerQuestion('browser_extensions', 'very_selective')
    .then()

  // — Browser-specific (Firefox) —
  .step('Firefox tracking protection: strict')
    .answerQuestion('firefox_tracking_protection', 'strict')
    .then()
  .step('Firefox privacy config: optimized')
    .answerQuestion('firefox_privacy_config', 'optimized')
    .then()

  .finalOutcome(
    'Tech Bro Marcus achieves high score, all yes-branches hit, advanced_2fa unlocked',
    () => {
      const store = useAssessmentStore.getState();
      // High score — everything locked down
      expect(store.overallScore).toBeGreaterThan(70);
      // Yes-branch deep-dives answered
      expect(store.answers['pm_type']?.value).toBe('local');
      expect(store.answers['pm_master_password']?.value).toBe('passphrase');
      expect(store.answers['tfa_method']?.value).toBe('hardware_key');
      expect(store.answers['tfa_backup_codes']?.value).toBe('yes_secure');
      // Advanced gate reached
      expect(store.answers['advanced_2fa']?.value).toBe('yes');
      // No-branches never surfaced
      expect(store.answers['pm_current_method']).toBeUndefined();
      expect(store.answers['pm_barrier']).toBeUndefined();
      expect(store.answers['tfa_priority_accounts']).toBeUndefined();
      expect(store.answers['tfa_barrier']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 3 — "Farmer John"
// Minimal tech, desktop-only Windows/Edge.  Rarely updates, never backs
// up, doesn't know WiFi type.  No mobile.  Low score expected.
// ═══════════════════════════════════════════════════════════════════════

export const farmerJohn: UserJourney = JourneyBuilder
  .create('Farmer John — Minimal Tech Desktop User')
  .description(
    'Rural user with a single Windows desktop, no mobile phone, unknown WiFi ' +
    'security, rare updates, no backups.  Represents the "just uses it for ' +
    'email" population.'
  )

  // — Onboarding —
  .step('Detect Windows + Edge')
    .custom(() => injectDevice('windows', 'edge'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Windows')
    .answerQuestion('windows_detection_confirm', 'yes')
    .then()
  .step('Confirm Edge')
    .answerQuestion('edge_detection_confirm', 'yes')
    .then()
  .step('Tech comfort: beginner')
    .answerQuestion('tech_comfort', 'beginner')
    .then()
  .step('No mobile')
    .answerQuestion('mobile_context', 'neither')
    .then()
  .step('General concern')
    .answerQuestion('usage_context', 'general')
    .then()

  // — Core Assessment (poor/minimal) —
  .step('No password manager')
    .answerQuestion('password_manager', 'no')
    .then()
  .step('PM method: written down')
    .answerQuestion('pm_current_method', 'written')
    .then()
  .step('PM barrier: complicated')
    .answerQuestion('pm_barrier', 'complicated')
    .then()
  .step('No 2FA')
    .answerQuestion('two_factor_auth', 'no')
    .then()
  .step('TFA priority: unsure')
    .answerQuestion('tfa_priority_accounts', 'unsure')
    .then()
  .step('TFA barrier: confusing')
    .answerQuestion('tfa_barrier', 'confusing')
    .then()
  .step('Rarely updates')
    .answerQuestion('software_updates', 'rarely')
    .then()
  .step('Virus scan: rarely')
    .answerQuestion('virus_scan_recent', 'rarely')
    .then()
  .step('Never backs up')
    .answerQuestion('backup_frequency', 'never')
    .then()
  .step('WiFi: unknown')
    .answerQuestion('wifi_security', 'unknown')
    .then()
  .step('Email: sometimes opens')
    .answerQuestion('email_attachments', 'sometimes_open')
    .then()
  .step('Extensions: no extensions')
    .answerQuestion('browser_extensions', 'no_extensions')
    .then()

  // — Security Hygiene —
  .step('Screen lock: no')
    .answerQuestion('screen_lock', 'no')
    .then()
  .step('Password reuse: often')
    .answerQuestion('password_reuse_habits', 'often')
    .then()
  .step('Phishing: clicks link')
    .answerQuestion('phishing_awareness', 'click_link')
    .then()
  .step('Breach check: never')
    .answerQuestion('breach_check', 'no')
    .then()
  .step('Account recovery: none')
    .answerQuestion('account_recovery', 'no')
    .then()
  .step('No ad blocker')
    .answerQuestion('ad_blocker', 'no')
    .then()

  // — Ad-Block Deep Dive (Edge desktop, no ad blocker → qualifies) —
  .step('Ad blocker Edge: skipped')
    .answerQuestion('adblock_edge_desktop', 'skipped')
    .then()

  // — Browser-specific (Edge) —
  .step('Edge SmartScreen: no')
    .answerQuestion('edge_smartscreen', 'no')
    .then()
  .step('Edge password manager: none')
    .answerQuestion('edge_password_manager', 'none')
    .then()

  .finalOutcome(
    'Farmer John has very low score — nearly every answer is the worst option',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.overallScore).toBeLessThan(20);
      // Key facts: no PM, no 2FA, rare updates → advanced_2fa never unlocked
      expect(store.answers['advanced_2fa']).toBeUndefined();
      // Wrote down passwords — not reuse
      expect(store.answers['pm_current_method']?.value).toBe('written');
      // All security hygiene at worst levels
      expect(store.answers['screen_lock']?.value).toBe('no');
      expect(store.answers['password_reuse_habits']?.value).toBe('often');
      expect(store.answers['phishing_awareness']?.value).toBe('click_link');
      // Ad-block deep dive — offered but skipped
      expect(store.answers['adblock_edge_desktop']?.value).toBe('skipped');
      // Edge browser-specific — SmartScreen off, no PM
      expect(store.answers['edge_smartscreen']?.value).toBe('no');
      expect(store.answers['edge_password_manager']?.value).toBe('none');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 4 — "Working Mom Sarah"
// Practical, time-constrained. Mac + Chrome. Partial 2FA, no PM (too
// busy to set up).  Moderate tech comfort, family-safety focused.
// Partial-2FA is the most interesting gate — she sees BOTH branches.
// ═══════════════════════════════════════════════════════════════════════

export const workingMomSarah: UserJourney = JourneyBuilder
  .create('Working Mom Sarah — Practical & Time-Constrained')
  .description(
    'Busy parent with moderate tech skills. Uses Chrome on Mac, has partial ' +
    '2FA setup, no dedicated password manager (procrastination barrier). ' +
    'Her "partial" 2FA answer should unlock ALL four TFA deep-dive questions.'
  )

  // — Onboarding —
  .step('Detect Mac + Chrome')
    .custom(() => injectDevice('mac', 'chrome'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Mac')
    .answerQuestion('mac_detection_confirm', 'yes')
    .then()
  .step('Confirm Chrome')
    .answerQuestion('chrome_detection_confirm', 'yes')
    .then()
  .step('Tech comfort: comfortable')
    .answerQuestion('tech_comfort', 'comfortable')
    .then()
  .step('Has iPhone')
    .answerQuestion('mobile_context', 'ios')
    .then()
  .step('Priority: family safety')
    .answerQuestion('usage_context', 'family_safety')
    .then()

  // — Core Assessment (mixed) —
  .step('No password manager')
    .answerQuestion('password_manager', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('pm_current_method');
      expect(ids).toContain('pm_barrier');
    })
    .then()
  .step('PM method: browser save')
    .answerQuestion('pm_current_method', 'browser_save')
    .then()
  .step('PM barrier: procrastination')
    .answerQuestion('pm_barrier', 'procrastination')
    .then()
  .step('Partial 2FA — unlocks ALL four deep-dive questions')
    .answerQuestion('two_factor_auth', 'partial')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      // "partial" matches BOTH yes-branch and no-branch conditions
      expect(ids).toContain('tfa_method');
      expect(ids).toContain('tfa_backup_codes');
      expect(ids).toContain('tfa_priority_accounts');
      expect(ids).toContain('tfa_barrier');
    })
    .then()
  .step('TFA method: SMS (easiest)')
    .answerQuestion('tfa_method', 'sms')
    .then()
  .step('TFA backup codes: somewhere (not sure)')
    .answerQuestion('tfa_backup_codes', 'somewhere')
    .then()
  .step('TFA priority: banking')
    .answerQuestion('tfa_priority_accounts', 'banking')
    .then()
  .step('TFA barrier: inconvenient')
    .answerQuestion('tfa_barrier', 'inconvenient')
    .then()
  .step('Manual updates')
    .answerQuestion('software_updates', 'manual')
    .then()

  // — Security Hygiene (moderate) —
  .step('Screen lock: long timeout')
    .answerQuestion('screen_lock', 'yes_long')
    .then()
  .step('Password reuse: rarely')
    .answerQuestion('password_reuse_habits', 'rarely')
    .then()
  .step('Phishing: checks carefully')
    .answerQuestion('phishing_awareness', 'check_carefully')
    .then()

  // — Browser-specific (Chrome) —
  .step('Chrome privacy: basic')
    .answerQuestion('chrome_privacy_hardening', 'basic')
    .then()

  .finalOutcome(
    'Working Mom Sarah has moderate score; partial-2FA unlocked all four TFA branches',
    () => {
      const store = useAssessmentStore.getState();
      // Moderate score — mix of good and bad practices
      expect(store.overallScore).toBeGreaterThan(15);
      expect(store.overallScore).toBeLessThan(65);
      // Partial 2FA should have opened BOTH branches
      expect(store.answers['tfa_method']?.value).toBe('sms');
      expect(store.answers['tfa_backup_codes']?.value).toBe('somewhere');
      expect(store.answers['tfa_priority_accounts']?.value).toBe('banking');
      expect(store.answers['tfa_barrier']?.value).toBe('inconvenient');
      // PM remediation branch
      expect(store.answers['pm_current_method']?.value).toBe('browser_save');
      expect(store.answers['pm_barrier']?.value).toBe('procrastination');
      // advanced_2fa should NOT unlock (password_manager=no)
      expect(store.answers['advanced_2fa']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 5 — "Privacy Pat"
// Privacy-first advocate. Mac + Firefox strict. Uses local PM, hardware
// 2FA.  Focus on privacy rather than convenience.
// ═══════════════════════════════════════════════════════════════════════

export const privacyPat: UserJourney = JourneyBuilder
  .create('Privacy Pat — Privacy-First Advocate')
  .description(
    'Privacy-focussed user on Mac + Firefox with strict tracking protection. ' +
    'Uses local password manager and hardware 2FA.  Validates that the ' +
    'privacy-specific question path produces high scores.'
  )

  // — Onboarding —
  .step('Detect Mac + Firefox')
    .custom(() => injectDevice('mac', 'firefox'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Mac')
    .answerQuestion('mac_detection_confirm', 'yes')
    .then()
  .step('Confirm Firefox')
    .answerQuestion('firefox_detection_confirm', 'yes')
    .then()
  .step('Tech comfort: advanced')
    .answerQuestion('tech_comfort', 'advanced')
    .then()
  .step('Mobile: no mobile')
    .answerQuestion('mobile_context', 'neither')
    .then()
  .step('Priority: personal data')
    .answerQuestion('usage_context', 'personal_data')
    .then()

  // — Core Assessment (privacy-optimized) —
  .step('Uses password manager')
    .answerQuestion('password_manager', 'yes')
    .then()
  .step('PM type: local')
    .answerQuestion('pm_type', 'local')
    .then()
  .step('PM master: passphrase')
    .answerQuestion('pm_master_password', 'passphrase')
    .then()
  .step('Uses 2FA')
    .answerQuestion('two_factor_auth', 'yes')
    .then()
  .step('TFA method: authenticator app')
    .answerQuestion('tfa_method', 'authenticator_app')
    .then()
  .step('TFA backup: securely stored')
    .answerQuestion('tfa_backup_codes', 'yes_secure')
    .then()
  .step('Auto updates')
    .answerQuestion('software_updates', 'automatic')
    .expectCustom(() => {
      // Should unlock advanced_2fa
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('advanced_2fa');
    })
    .then()
  .step('Advanced 2FA: no (prefers authenticator over hardware)')
    .answerQuestion('advanced_2fa', 'no')
    .then()
  .step('Email: scan first')
    .answerQuestion('email_attachments', 'scan_first')
    .then()
  .step('Extensions: very selective')
    .answerQuestion('browser_extensions', 'very_selective')
    .then()

  // — Security Hygiene (strong) —
  .step('Screen lock: short')
    .answerQuestion('screen_lock', 'yes_short')
    .then()
  .step('Password reuse: never')
    .answerQuestion('password_reuse_habits', 'never')
    .then()
  .step('Phishing: ignores, goes direct')
    .answerQuestion('phishing_awareness', 'ignore_go_direct')
    .then()
  .step('Breach check: regularly')
    .answerQuestion('breach_check', 'yes_regularly')
    .then()
  .step('Ad blocker: yes')
    .answerQuestion('ad_blocker', 'yes')
    .then()

  // — Browser-specific (Firefox) —
  .step('Firefox tracking: strict')
    .answerQuestion('firefox_tracking_protection', 'strict')
    .then()
  .step('Firefox privacy: optimized')
    .answerQuestion('firefox_privacy_config', 'optimized')
    .then()

  .finalOutcome(
    'Privacy Pat has high score driven by strict privacy settings and strong security',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.overallScore).toBeGreaterThan(60);
      // Firefox privacy at max
      expect(store.answers['firefox_tracking_protection']?.value).toBe('strict');
      expect(store.answers['firefox_privacy_config']?.value).toBe('optimized');
      // Strong PM
      expect(store.answers['pm_type']?.value).toBe('local');
      // Advanced gate was reached (even though answered "no")
      expect(store.answers['advanced_2fa']?.value).toBe('no');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 6 — "Financial Frank"
// Finance-focused, Windows/Chrome.  Meticulous about banking security:
// PM=yes (cloud), 2FA everywhere, breach monitoring.  Financial concern
// shapes priorities.
// ═══════════════════════════════════════════════════════════════════════

export const financialFrank: UserJourney = JourneyBuilder
  .create('Financial Frank — Finance-Focused Security')
  .description(
    'User whose primary concern is protecting financial accounts. Cloud PM, ' +
    'SMS-based 2FA (bank requirement), regular breach monitoring. Validates ' +
    'the financial-concern path.'
  )

  // — Onboarding —
  .step('Detect Windows + Chrome')
    .custom(() => injectDevice('windows', 'chrome'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Windows')
    .answerQuestion('windows_detection_confirm', 'yes')
    .then()
  .step('Confirm Chrome')
    .answerQuestion('chrome_detection_confirm', 'yes')
    .then()
  .step('Tech comfort: comfortable')
    .answerQuestion('tech_comfort', 'comfortable')
    .then()
  .step('Has Android phone')
    .answerQuestion('mobile_context', 'android')
    .then()
  .step('Priority: financial')
    .answerQuestion('usage_context', 'financial')
    .then()

  // — Core Assessment (finance-solid) —
  .step('Uses password manager')
    .answerQuestion('password_manager', 'yes')
    .then()
  .step('PM type: cloud')
    .answerQuestion('pm_type', 'cloud')
    .then()
  .step('PM master: complex (not passphrase)')
    .answerQuestion('pm_master_password', 'complex')
    .then()
  .step('Uses 2FA')
    .answerQuestion('two_factor_auth', 'yes')
    .then()
  .step('TFA method: mixed (bank uses SMS, others use app)')
    .answerQuestion('tfa_method', 'mixed')
    .then()
  .step('TFA backup: digital copy')
    .answerQuestion('tfa_backup_codes', 'yes_digital')
    .then()
  .step('Manual updates (waits for stability)')
    .answerQuestion('software_updates', 'manual')
    .then()
  .step('Virus scan: this month')
    .answerQuestion('virus_scan_recent', 'this_month')
    .then()
  .step('Backup: weekly')
    .answerQuestion('backup_frequency', 'weekly')
    .then()
  .step('WiFi: WPA2')
    .answerQuestion('wifi_security', 'wpa2')
    .then()
  .step('Email: scan first')
    .answerQuestion('email_attachments', 'scan_first')
    .then()
  .step('Extensions: research first')
    .answerQuestion('browser_extensions', 'research_first')
    .then()

  // — Security Hygiene (strong on finance-relevant) —
  .step('Screen lock: short')
    .answerQuestion('screen_lock', 'yes_short')
    .then()
  .step('Password reuse: never')
    .answerQuestion('password_reuse_habits', 'never')
    .then()
  .step('Phishing: checks carefully')
    .answerQuestion('phishing_awareness', 'check_carefully')
    .then()
  .step('Breach check: regularly')
    .answerQuestion('breach_check', 'yes_regularly')
    .then()
  .step('Account recovery: multiple methods')
    .answerQuestion('account_recovery', 'yes_multiple')
    .then()
  .step('Ad blocker: some sites')
    .answerQuestion('ad_blocker', 'some_sites')
    .then()

  // — Browser-specific (Chrome) —
  .step('Chrome privacy: basic')
    .answerQuestion('chrome_privacy_hardening', 'basic')
    .then()

  // — Ad-Block Deep Dive (Chrome desktop + partial ad blocker → qualifies) —
  .step('Ad blocker Chrome: install lite')
    .answerQuestion('adblock_chrome_desktop', 'install_lite')
    .then()
  .step('Ad blocker Android: just Firefox')
    .answerQuestion('adblock_mobile_android', 'just_firefox')
    .then()

  .finalOutcome(
    'Financial Frank achieves solid score with strong finance-relevant security',
    () => {
      const store = useAssessmentStore.getState();
      // Good but not perfect score — manual updates + WPA2 + basic Chrome cost points
      expect(store.overallScore).toBeGreaterThan(50);
      // Cloud PM with complex password
      expect(store.answers['pm_type']?.value).toBe('cloud');
      expect(store.answers['pm_master_password']?.value).toBe('complex');
      // Mixed 2FA with digital backups
      expect(store.answers['tfa_method']?.value).toBe('mixed');
      // Breach monitoring — critical for finance focus
      expect(store.answers['breach_check']?.value).toBe('yes_regularly');
      // advanced_2fa NOT unlocked (updates=manual, not automatic)
      expect(store.answers['advanced_2fa']).toBeUndefined();
      // Ad-block deep dive — Chrome lite + Android Firefox installed
      expect(store.answers['adblock_chrome_desktop']?.value).toBe('install_lite');
      expect(store.answers['adblock_mobile_android']?.value).toBe('just_firefox');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 7 — "Linux Dev Dana"
// Developer archetype. Linux + Firefox. Advanced, local PM, hardware
// 2FA, auto updates → unlocks advanced_2fa. Exercises the Linux
// detection flow that no other persona covers.
// ═══════════════════════════════════════════════════════════════════════

export const linuxDevDana: UserJourney = JourneyBuilder
  .create('Linux Dev Dana — Developer on Linux')
  .description(
    'Developer who uses Linux + Firefox for privacy and control. Local PM, ' +
    'authenticator-based 2FA, auto updates. Validates the Linux detection ' +
    'path and Firefox privacy flow from a developer\'s perspective.'
  )

  // — Onboarding —
  .step('Detect Linux + Firefox')
    .custom(() => injectDevice('linux', 'firefox'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Linux')
    .answerQuestion('linux_detection_confirm', 'yes')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('os')?.value).toBe('linux');
      expect(store.factsActions.getFact('os_confirmed')?.value).toBe(true);
    })
    .then()
  .step('Confirm Firefox')
    .answerQuestion('firefox_detection_confirm', 'yes')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('browser')?.value).toBe('firefox');
    })
    .then()
  .step('Tech comfort: advanced')
    .answerQuestion('tech_comfort', 'advanced')
    .then()
  .step('Has Android phone')
    .answerQuestion('mobile_context', 'android')
    .then()
  .step('Priority: personal data')
    .answerQuestion('usage_context', 'personal_data')
    .then()

  // — Core Assessment (strong, developer-level) —
  .step('Uses password manager')
    .answerQuestion('password_manager', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('pm_type');
      expect(ids).toContain('pm_master_password');
      expect(ids).not.toContain('pm_current_method');
    })
    .then()
  .step('PM type: local (offline — dev prefers self-hosted)')
    .answerQuestion('pm_type', 'local')
    .then()
  .step('PM master password: strong passphrase')
    .answerQuestion('pm_master_password', 'passphrase')
    .then()
  .step('Uses 2FA')
    .answerQuestion('two_factor_auth', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('tfa_method');
      expect(ids).toContain('tfa_backup_codes');
      expect(ids).not.toContain('tfa_priority_accounts');
    })
    .then()
  .step('TFA method: authenticator app')
    .answerQuestion('tfa_method', 'authenticator_app')
    .then()
  .step('TFA backup codes: securely stored')
    .answerQuestion('tfa_backup_codes', 'yes_secure')
    .then()
  .step('Automatic updates → should unlock advanced_2fa')
    .answerQuestion('software_updates', 'automatic')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('advanced_2fa');
    })
    .then()
  .step('Advanced 2FA: yes')
    .answerQuestion('advanced_2fa', 'yes')
    .then()

  // — Security Hygiene (developer-strong) —
  .step('Screen lock: short auto-lock')
    .answerQuestion('screen_lock', 'yes_short')
    .then()
  .step('Password reuse: never')
    .answerQuestion('password_reuse_habits', 'never')
    .then()
  .step('Phishing: ignores, goes direct')
    .answerQuestion('phishing_awareness', 'ignore_go_direct')
    .then()
  .step('Breach check: regularly')
    .answerQuestion('breach_check', 'yes_regularly')
    .then()
  .step('Account recovery: multiple methods')
    .answerQuestion('account_recovery', 'yes_multiple')
    .then()
  .step('Ad blocker: yes')
    .answerQuestion('ad_blocker', 'yes')
    .then()

  // — Remaining core —
  .step('Virus scan: this week')
    .answerQuestion('virus_scan_recent', 'this_week')
    .then()
  .step('Backup: daily')
    .answerQuestion('backup_frequency', 'daily')
    .then()
  .step('WiFi: WPA3')
    .answerQuestion('wifi_security', 'wpa3')
    .then()
  .step('Email: never opens unknown')
    .answerQuestion('email_attachments', 'never_open')
    .then()
  .step('Extensions: very selective')
    .answerQuestion('browser_extensions', 'very_selective')
    .then()

  // — Browser-specific (Firefox) —
  .step('Firefox tracking protection: strict')
    .answerQuestion('firefox_tracking_protection', 'strict')
    .then()
  .step('Firefox privacy config: optimized')
    .answerQuestion('firefox_privacy_config', 'optimized')
    .then()

  .finalOutcome(
    'Linux Dev Dana achieves high score via Linux + Firefox with full advanced_2fa unlock',
    () => {
      const store = useAssessmentStore.getState();
      // High score — everything locked down
      expect(store.overallScore).toBeGreaterThan(65);
      // Linux detection confirmed
      expect(store.factsActions.getFact('os')?.value).toBe('linux');
      expect(store.factsActions.getFact('browser')?.value).toBe('firefox');
      // Yes-branch deep-dives answered
      expect(store.answers['pm_type']?.value).toBe('local');
      expect(store.answers['pm_master_password']?.value).toBe('passphrase');
      expect(store.answers['tfa_method']?.value).toBe('authenticator_app');
      expect(store.answers['tfa_backup_codes']?.value).toBe('yes_secure');
      // Advanced gate reached
      expect(store.answers['advanced_2fa']?.value).toBe('yes');
      // Firefox privacy at max
      expect(store.answers['firefox_tracking_protection']?.value).toBe('strict');
      expect(store.answers['firefox_privacy_config']?.value).toBe('optimized');
      // No remediation branches surfaced
      expect(store.answers['pm_current_method']).toBeUndefined();
      expect(store.answers['pm_barrier']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 8 — "College Student Alex"
// Mac + Safari Apple-ecosystem user.  Moderate tech comfort, relies on
// iCloud Keychain, partial 2FA.  Exercises the Safari detection flow
// and all three Safari-specific questions (ITP, iCloud Keychain,
// Apple ID 2FA) that no other persona covers.
// ═══════════════════════════════════════════════════════════════════════

export const collegeStudentAlex: UserJourney = JourneyBuilder
  .create('College Student Alex — Mac + Safari Apple Ecosystem')
  .description(
    'College student on a MacBook with Safari. Relies on iCloud Keychain ' +
    'and Apple ecosystem security but has gaps in broader security habits. ' +
    'Validates Safari detection flow and Safari-specific questions: ITP, ' +
    'iCloud Keychain, and Apple ID 2FA.'
  )

  // — Onboarding —
  .step('Detect Mac + Safari')
    .custom(() => injectDevice('mac', 'safari'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Mac')
    .answerQuestion('mac_detection_confirm', 'yes')
    .then()
  .step('Confirm Safari')
    .answerQuestion('safari_detection_confirm', 'yes')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('browser')?.value).toBe('safari');
    })
    .then()
  .step('Tech comfort: comfortable')
    .answerQuestion('tech_comfort', 'comfortable')
    .then()
  .step('Has iPhone')
    .answerQuestion('mobile_context', 'ios')
    .then()
  .step('Priority: general')
    .answerQuestion('usage_context', 'general')
    .then()

  // — Core Assessment (mixed — relies on Apple ecosystem) —
  .step('No dedicated password manager (uses iCloud Keychain via Safari)')
    .answerQuestion('password_manager', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('pm_current_method');
      expect(ids).toContain('pm_barrier');
      expect(ids).not.toContain('pm_type');
    })
    .then()
  .step('PM method: browser save (iCloud Keychain via Safari)')
    .answerQuestion('pm_current_method', 'browser_save')
    .then()
  .step('PM barrier: procrastination (hasn\'t gotten around to it)')
    .answerQuestion('pm_barrier', 'procrastination')
    .then()
  .step('Partial 2FA — has it on some accounts')
    .answerQuestion('two_factor_auth', 'partial')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      // "partial" unlocks both yes and no branches
      expect(ids).toContain('tfa_method');
      expect(ids).toContain('tfa_backup_codes');
      expect(ids).toContain('tfa_priority_accounts');
      expect(ids).toContain('tfa_barrier');
    })
    .then()
  .step('TFA method: SMS')
    .answerQuestion('tfa_method', 'sms')
    .then()
  .step('TFA backup codes: no')
    .answerQuestion('tfa_backup_codes', 'no')
    .then()
  .step('TFA priority: email')
    .answerQuestion('tfa_priority_accounts', 'email')
    .then()
  .step('TFA barrier: no particular reason')
    .answerQuestion('tfa_barrier', 'no_reason')
    .then()
  .step('Automatic updates (macOS does this well)')
    .answerQuestion('software_updates', 'automatic')
    .then()

  // — Security Hygiene (student-typical: some good, some careless) —
  .step('Screen lock: long timeout')
    .answerQuestion('screen_lock', 'yes_long')
    .then()
  .step('Password reuse: rarely')
    .answerQuestion('password_reuse_habits', 'rarely')
    .then()
  .step('Phishing: checks carefully')
    .answerQuestion('phishing_awareness', 'check_carefully')
    .then()
  .step('Breach check: once')
    .answerQuestion('breach_check', 'yes_once')
    .then()
  .step('Account recovery: basic setup')
    .answerQuestion('account_recovery', 'yes_basic')
    .then()
  .step('Ad blocker: some sites')
    .answerQuestion('ad_blocker', 'some_sites')
    .then()

  // — Safari-specific questions (KEY: this is the only persona to exercise these) —
  .step('Safari ITP: default settings')
    .answerQuestion('safari_itp', 'default')
    .then()
  .step('iCloud Keychain: yes (Apple ecosystem integration)')
    .answerQuestion('safari_icloud_keychain', 'yes')
    .then()
  .step('Apple ID 2FA: yes')
    .answerQuestion('apple_id_2fa', 'yes')
    .then()

  // — Ad-Block Deep Dive (Safari desktop + partial ad blocker → qualifies) —
  .step('Ad blocker Safari: try Firefox instead')
    .answerQuestion('adblock_safari_desktop', 'try_firefox')
    .then()
  .step('Browser switch progress: trying alongside Safari')
    .answerQuestion('browser_switch_progress', 'trying')
    .then()
  .step('Ad blocker iOS: installed Firefox Focus')
    .answerQuestion('adblock_mobile_ios', 'installed')
    .then()

  .finalOutcome(
    'College Student Alex has moderate score with full Safari-specific question coverage',
    () => {
      const store = useAssessmentStore.getState();
      // Score boosted significantly by Safari-specific questions
      // (ITP 12pts + iCloud Keychain 15pts + Apple ID 2FA 20pts = 47 bonus)
      // Despite gaps in hygiene, Apple ecosystem lifts score above 100
      expect(store.overallScore).toBeGreaterThan(25);
      // Safari-specific questions all answered (unique to this persona)
      expect(store.answers['safari_itp']?.value).toBe('default');
      expect(store.answers['safari_icloud_keychain']?.value).toBe('yes');
      expect(store.answers['apple_id_2fa']?.value).toBe('yes');
      // Mac + Safari confirmed
      expect(store.factsActions.getFact('os')?.value).toBe('mac');
      expect(store.factsActions.getFact('browser')?.value).toBe('safari');
      // Partial 2FA opened both branches
      expect(store.answers['tfa_method']?.value).toBe('sms');
      expect(store.answers['tfa_priority_accounts']?.value).toBe('email');
      // PM remediation branch (no dedicated PM)
      expect(store.answers['pm_current_method']?.value).toBe('browser_save');
      // advanced_2fa NOT unlocked (password_manager=no)
      expect(store.answers['advanced_2fa']).toBeUndefined();
      // Ad-block deep dive — Safari user considers Firefox + iOS ad blocking
      expect(store.answers['adblock_safari_desktop']?.value).toBe('try_firefox');
      expect(store.answers['browser_switch_progress']?.value).toBe('trying');
      expect(store.answers['adblock_mobile_ios']?.value).toBe('installed');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 9 — "iPhone Emma"
// iOS mobile-first user.  Arrives from an iPhone with Safari.
// Tests the new iOS detection confirm flow, mobile security questions,
// and iOS-specific deep-dives (Find My, iCloud, App Store).
// ═══════════════════════════════════════════════════════════════════════

export const iphoneEmma: UserJourney = JourneyBuilder
  .create('iPhone Emma — iOS Mobile User')
  .description(
    'College-age iPhone user who visits from her phone. Tests iOS auto-detection ' +
    'confirm flow, mobile security questions, and iOS-specific deep-dives. ' +
    'Good security habits but gaps in some areas.'
  )

  // — Onboarding (Mobile) —
  .step('Detect iOS + Safari (mobile device)')
    .custom(() => injectDevice('ios', 'safari', 'mobile'))
    .then()
  .step('Acknowledge privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  .step('Confirm iOS detection')
    .answerQuestion('ios_detection_confirm', 'yes')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('os')?.value).toBe('ios');
      expect(store.factsActions.getFact('os_confirmed')?.value).toBe(true);
      expect(store.factsActions.getFact('has_mobile')?.value).toBe(true);
      expect(store.factsActions.getFact('mobile_os')?.value).toBe('ios');
    })
    .then()
  .step('Confirm Safari browser')
    .answerQuestion('safari_detection_confirm', 'yes')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('browser')?.value).toBe('safari');
    })
    .then()
  .step('Tech comfort: comfortable')
    .answerQuestion('tech_comfort', 'comfortable')
    .then()
  // mobile_context should be skipped (mobile_os already set by ios_detection_confirm)
  .step('Usage concern: general')
    .answerQuestion('usage_context', 'general')
    .then()

  // — Core Assessment —
  .step('No dedicated password manager (uses iCloud Keychain)')
    .answerQuestion('password_manager', 'no')
    .then()
  .step('PM method: browser save (iCloud Keychain)')
    .answerQuestion('pm_current_method', 'browser_save')
    .then()
  .step('PM barrier: procrastination')
    .answerQuestion('pm_barrier', 'procrastination')
    .then()
  .step('Uses 2FA on some accounts')
    .answerQuestion('two_factor_auth', 'partial')
    .then()
  .step('2FA method: SMS')
    .answerQuestion('tfa_method', 'sms')
    .then()
  .step('2FA backup codes: no')
    .answerQuestion('tfa_backup_codes', 'no')
    .then()
  .step('2FA priority: email')
    .answerQuestion('tfa_priority_accounts', 'email')
    .then()
  .step('2FA barrier: inconvenient')
    .answerQuestion('tfa_barrier', 'inconvenient')
    .then()
  .step('Automatic updates')
    .answerQuestion('software_updates', 'automatic')
    .then()

  // — Security Hygiene —
  .step('Screen lock: short auto-lock')
    .answerQuestion('screen_lock', 'yes_short')
    .then()
  .step('Password reuse: rarely')
    .answerQuestion('password_reuse_habits', 'rarely')
    .then()
  .step('Phishing: checks carefully')
    .answerQuestion('phishing_awareness', 'check_carefully')
    .then()
  .step('Breach check: never checked')
    .answerQuestion('breach_check', 'no')
    .then()
  .step('Account recovery: basic setup')
    .answerQuestion('account_recovery', 'yes_basic')
    .then()
  .step('Ad blocker: no')
    .answerQuestion('ad_blocker', 'no')
    .then()
  .step('Virus scan: this month')
    .answerQuestion('virus_scan_recent', 'this_month')
    .then()
  .step('Backup: weekly')
    .answerQuestion('backup_frequency', 'weekly')
    .then()
  .step('WiFi: WPA2')
    .answerQuestion('wifi_security', 'wpa2')
    .then()
  .step('Email: scan first')
    .answerQuestion('email_attachments', 'scan_first')
    .then()
  .step('Extensions: no extensions')
    .answerQuestion('browser_extensions', 'no_extensions')
    .then()

  // — Safari-specific (via browser confirm) —
  .step('Safari ITP: default')
    .answerQuestion('safari_itp', 'default')
    .then()
  .step('iCloud Keychain: yes')
    .answerQuestion('safari_icloud_keychain', 'yes')
    .then()
  .step('Apple ID 2FA: yes')
    .answerQuestion('apple_id_2fa', 'yes')
    .then()

  // — iOS ad-block (no ad blocker on iOS) —
  .step('iOS ad-block: skip for later')
    .answerQuestion('adblock_mobile_ios', 'skipped')
    .then()

  // — Mobile Security (shared) —
  .step('Mobile screen lock: biometric')
    .answerQuestion('mobile_screen_lock', 'biometric')
    .then()
  .step('Mobile OS updates: automatic')
    .answerQuestion('mobile_os_updates', 'automatic')
    .then()
  .step('Mobile app permissions: review carefully')
    .answerQuestion('mobile_app_permissions', 'review')
    .then()
  .step('Mobile public WiFi: careful')
    .answerQuestion('mobile_public_wifi', 'careful')
    .then()

  // — iOS-specific deep-dives —
  .step('Find My iPhone: yes')
    .answerQuestion('ios_find_my', 'yes')
    .then()
  .step('iCloud Backup: standard')
    .answerQuestion('ios_icloud_backup', 'yes')
    .then()

  .finalOutcome(
    'iPhone Emma completes full iOS mobile flow with good score',
    () => {
      const store = useAssessmentStore.getState();
      // iOS detected and confirmed
      expect(store.factsActions.getFact('os')?.value).toBe('ios');
      expect(store.factsActions.getFact('mobile_os')?.value).toBe('ios');
      // Mobile security questions answered
      expect(store.answers['mobile_screen_lock']?.value).toBe('biometric');
      expect(store.answers['mobile_os_updates']?.value).toBe('automatic');
      expect(store.answers['mobile_app_permissions']?.value).toBe('review');
      expect(store.answers['mobile_public_wifi']?.value).toBe('careful');
      // iOS-specific questions answered
      expect(store.answers['ios_find_my']?.value).toBe('yes');
      expect(store.answers['ios_icloud_backup']?.value).toBe('yes');
      // Safari questions also answered (browser detection)
      expect(store.answers['safari_itp']?.value).toBe('default');
      expect(store.answers['apple_id_2fa']?.value).toBe('yes');
      // Score is reasonable
      expect(store.overallScore).toBeGreaterThan(30);
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 10 — "Android Amir"
// Android power user.  Arrives from an Android device with Chrome.
// Tests Android detection confirm, mobile security, and Android-specific
// deep-dives (Find My Device, Play Protect, sideloading).
// ═══════════════════════════════════════════════════════════════════════

export const androidAmir: UserJourney = JourneyBuilder
  .create('Android Amir — Android Mobile User')
  .description(
    'Tech-comfortable Android user. Tests Android auto-detection confirm flow, ' +
    'mobile security questions, and Android-specific deep-dives. Good habits ' +
    'with some sideloading risk.'
  )

  // — Onboarding (Mobile) —
  .step('Detect Android + Chrome (mobile device)')
    .custom(() => injectDevice('android', 'chrome', 'mobile'))
    .then()
  .step('Acknowledge privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  .step('Confirm Android detection')
    .answerQuestion('android_detection_confirm', 'yes')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('os')?.value).toBe('android');
      expect(store.factsActions.getFact('os_confirmed')?.value).toBe(true);
      expect(store.factsActions.getFact('has_mobile')?.value).toBe(true);
      expect(store.factsActions.getFact('mobile_os')?.value).toBe('android');
    })
    .then()
  .step('Confirm Chrome browser')
    .answerQuestion('chrome_detection_confirm', 'yes')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('browser')?.value).toBe('chrome');
    })
    .then()
  .step('Tech comfort: advanced')
    .answerQuestion('tech_comfort', 'advanced')
    .then()
  // mobile_context should be skipped (mobile_os already set by android_detection_confirm)
  .step('Usage concern: personal data')
    .answerQuestion('usage_context', 'personal_data')
    .then()

  // — Core Assessment —
  .step('Uses password manager')
    .answerQuestion('password_manager', 'yes')
    .then()
  .step('PM type: cloud')
    .answerQuestion('pm_type', 'cloud')
    .then()
  .step('PM master password: strong passphrase')
    .answerQuestion('pm_master_password', 'passphrase')
    .then()
  .step('Uses 2FA')
    .answerQuestion('two_factor_auth', 'yes')
    .then()
  .step('2FA method: authenticator app')
    .answerQuestion('tfa_method', 'authenticator_app')
    .then()
  .step('2FA backup codes: secure')
    .answerQuestion('tfa_backup_codes', 'yes_secure')
    .then()
  .step('Automatic updates → should unlock advanced_2fa')
    .answerQuestion('software_updates', 'automatic')
    .then()
  .step('Advanced 2FA: no (prefers authenticator)')
    .answerQuestion('advanced_2fa', 'no')
    .then()

  // — Security Hygiene —
  .step('Screen lock: short auto-lock')
    .answerQuestion('screen_lock', 'yes_short')
    .then()
  .step('Password reuse: never')
    .answerQuestion('password_reuse_habits', 'never')
    .then()
  .step('Phishing: ignores, goes direct')
    .answerQuestion('phishing_awareness', 'ignore_go_direct')
    .then()
  .step('Breach check: regularly')
    .answerQuestion('breach_check', 'yes_regularly')
    .then()
  .step('Account recovery: multiple methods')
    .answerQuestion('account_recovery', 'yes_multiple')
    .then()
  .step('Ad blocker: yes')
    .answerQuestion('ad_blocker', 'yes')
    .then()
  .step('Virus scan: this week')
    .answerQuestion('virus_scan_recent', 'this_week')
    .then()
  .step('Backup: daily')
    .answerQuestion('backup_frequency', 'daily')
    .then()
  .step('WiFi: WPA3')
    .answerQuestion('wifi_security', 'wpa3')
    .then()
  .step('Email: never opens unknown')
    .answerQuestion('email_attachments', 'never_open')
    .then()
  .step('Extensions: very selective')
    .answerQuestion('browser_extensions', 'very_selective')
    .then()

  // — Chrome-specific (via browser confirm) —
  .step('Chrome privacy: comprehensive')
    .answerQuestion('chrome_privacy_hardening', 'comprehensive')
    .then()

  // — Mobile Security (shared) —
  .step('Mobile screen lock: biometric')
    .answerQuestion('mobile_screen_lock', 'biometric')
    .then()
  .step('Mobile OS updates: automatic')
    .answerQuestion('mobile_os_updates', 'automatic')
    .then()
  .step('Mobile app permissions: review carefully')
    .answerQuestion('mobile_app_permissions', 'review')
    .then()
  .step('Mobile public WiFi: VPN')
    .answerQuestion('mobile_public_wifi', 'vpn')
    .then()

  // — Android-specific deep-dives —
  .step('Find My Device: yes')
    .answerQuestion('android_find_my', 'yes')
    .then()
  .step('Play Protect: yes')
    .answerQuestion('android_play_protect', 'yes')
    .then()
  .step('Sideloading: trusted sources only (F-Droid)')
    .answerQuestion('android_unknown_sources', 'trusted')
    .then()

  .finalOutcome(
    'Android Amir completes full Android mobile flow with high score',
    () => {
      const store = useAssessmentStore.getState();
      // Android detected and confirmed
      expect(store.factsActions.getFact('os')?.value).toBe('android');
      expect(store.factsActions.getFact('mobile_os')?.value).toBe('android');
      // Mobile security questions answered
      expect(store.answers['mobile_screen_lock']?.value).toBe('biometric');
      expect(store.answers['mobile_os_updates']?.value).toBe('automatic');
      expect(store.answers['mobile_app_permissions']?.value).toBe('review');
      expect(store.answers['mobile_public_wifi']?.value).toBe('vpn');
      // Android-specific questions answered
      expect(store.answers['android_find_my']?.value).toBe('yes');
      expect(store.answers['android_play_protect']?.value).toBe('yes');
      expect(store.answers['android_unknown_sources']?.value).toBe('trusted');
      // Chrome privacy answered
      expect(store.answers['chrome_privacy_hardening']?.value).toBe('comprehensive');
      // High score (power user with PM + 2FA + hygiene + mobile)
      expect(store.overallScore).toBeGreaterThan(60);
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 11 — "Mobile-Only Maya"
// Mobile-only user with no desktop.  Device detection fails, so she
// goes through the manual os_selection → mobile_only → mobile_os_selection
// path that no other persona exercises.  Poor mobile security habits
// cover the "bad path" branches that Emma and Amir (both power users)
// never touch.
// ═══════════════════════════════════════════════════════════════════════

export const mobileOnlyMaya: UserJourney = JourneyBuilder
  .create('Mobile-Only Maya — Android-Only, Failed Detection, Poor Mobile Habits')
  .description(
    'A user with only a phone and no desktop.  Device detection fails, so she ' +
    'manually selects mobile_only → Android → Chrome.  Tests the os_selection, ' +
    'mobile_os_selection, and browser_selection fallback paths that no other ' +
    'persona reaches.  Poor habits exercise the worst-case mobile options.'
  )

  // — Onboarding (failed detection → manual selection) —
  .step('Failed device detection')
    .custom(() => injectFailedDetection())
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('OS selection: mobile only')
    .answerQuestion('os_selection', 'mobile_only')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('os')?.value).toBe('mobile_only');
      expect(store.factsActions.getFact('os_confirmed')?.value).toBe(true);
    })
    .then()
  .step('Mobile OS selection: Android')
    .answerQuestion('mobile_os_selection', 'android')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('mobile_os')?.value).toBe('android');
      expect(store.factsActions.getFact('has_mobile')?.value).toBe(true);
    })
    .then()
  .step('Browser selection: Chrome')
    .answerQuestion('browser_selection', 'chrome')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('browser')?.value).toBe('chrome');
      expect(store.factsActions.getFact('browser_confirmed')?.value).toBe(true);
    })
    .then()
  .step('Tech comfort: beginner')
    .answerQuestion('tech_comfort', 'beginner')
    .then()
  .step('Priority: work security')
    .answerQuestion('usage_context', 'work_security')
    .then()

  // — Core Assessment (poor security) —
  .step('No password manager')
    .answerQuestion('password_manager', 'no')
    .then()
  .step('PM method: memory only')
    .answerQuestion('pm_current_method', 'memory')
    .then()
  .step('PM barrier: cost')
    .answerQuestion('pm_barrier', 'cost')
    .then()
  .step('No 2FA')
    .answerQuestion('two_factor_auth', 'no')
    .then()
  .step('TFA priority: social media')
    .answerQuestion('tfa_priority_accounts', 'social')
    .then()
  .step('TFA barrier: lockout fear')
    .answerQuestion('tfa_barrier', 'lockout_fear')
    .then()
  .step('Software updates: rarely')
    .answerQuestion('software_updates', 'rarely')
    .then()
  .step('Virus scan: rarely or never')
    .answerQuestion('virus_scan_recent', 'rarely')
    .then()
  .step('Backup: never')
    .answerQuestion('backup_frequency', 'never')
    .then()
  .step('WiFi: open network')
    .answerQuestion('wifi_security', 'open')
    .then()
  .step('Email: always opens attachments')
    .answerQuestion('email_attachments', 'always_open')
    .then()
  .step('Extensions: installs freely')
    .answerQuestion('browser_extensions', 'install_freely')
    .then()

  // — Security Hygiene (poor across the board) —
  .step('Screen lock: disabled')
    .answerQuestion('screen_lock', 'no')
    .then()
  .step('Password reuse: often')
    .answerQuestion('password_reuse_habits', 'often')
    .then()
  .step('Phishing: clicks link')
    .answerQuestion('phishing_awareness', 'click_link')
    .then()
  .step('Breach check: never')
    .answerQuestion('breach_check', 'no')
    .then()
  .step('Account recovery: none')
    .answerQuestion('account_recovery', 'no')
    .then()
  .step('Ad blocker: no')
    .answerQuestion('ad_blocker', 'no')
    .then()

  // — Mobile Security (poor habits — key coverage gap) —
  .step('Mobile screen lock: none')
    .answerQuestion('mobile_screen_lock', 'none')
    .then()
  .step('Mobile updates: delay')
    .answerQuestion('mobile_os_updates', 'delay')
    .then()
  .step('App permissions: always allow')
    .answerQuestion('mobile_app_permissions', 'always_allow')
    .then()
  .step('Public WiFi: use freely')
    .answerQuestion('mobile_public_wifi', 'use_freely')
    .then()

  // — Android-specific (poor habits) —
  .step('Find My Device: no')
    .answerQuestion('android_find_my', 'no')
    .then()
  .step('Play Protect: unsure')
    .answerQuestion('android_play_protect', 'unsure')
    .then()
  .step('Sideloading: frequent')
    .answerQuestion('android_unknown_sources', 'frequent')
    .then()

  .finalOutcome(
    'Mobile-Only Maya has very low score — worst mobile options across the board',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.overallScore).toBeLessThan(20);
      // Manual detection path worked
      expect(store.factsActions.getFact('os')?.value).toBe('mobile_only');
      expect(store.factsActions.getFact('mobile_os')?.value).toBe('android');
      expect(store.factsActions.getFact('browser')?.value).toBe('chrome');
      // os_selection, mobile_os_selection, browser_selection all answered
      expect(store.answers['os_selection']?.value).toBe('mobile_only');
      expect(store.answers['mobile_os_selection']?.value).toBe('android');
      expect(store.answers['browser_selection']?.value).toBe('chrome');
      // All mobile worst-case options
      expect(store.answers['mobile_screen_lock']?.value).toBe('none');
      expect(store.answers['mobile_os_updates']?.value).toBe('delay');
      expect(store.answers['mobile_app_permissions']?.value).toBe('always_allow');
      expect(store.answers['mobile_public_wifi']?.value).toBe('use_freely');
      expect(store.answers['android_find_my']?.value).toBe('no');
      expect(store.answers['android_play_protect']?.value).toBe('unsure');
      expect(store.answers['android_unknown_sources']?.value).toBe('frequent');
      // PM/2FA remediation paths
      expect(store.answers['pm_current_method']?.value).toBe('memory');
      expect(store.answers['pm_barrier']?.value).toBe('cost');
      expect(store.answers['tfa_priority_accounts']?.value).toBe('social');
      expect(store.answers['tfa_barrier']?.value).toBe('lockout_fear');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 12 — "Firefox Beginner Fiona"
// Rejects browser detection → exercises browser_selection_fallback.
// Uses Firefox with no ad blocker → unlocks adblock_firefox_desktop
// and sponsorblock_firefox (the last 2 unreachable ad-block questions).
// Firefox "standard" and "default" options cover untested branches.
// PM type "browser" (Firefox built-in) is a new option no other
// persona exercises.
// ═══════════════════════════════════════════════════════════════════════

export const firefoxBeginnerFiona: UserJourney = JourneyBuilder
  .create('Firefox Beginner Fiona — Detection Rejection, Firefox Ad-Block Install')
  .description(
    'Windows + Firefox user who rejects browser detection, triggering the ' +
    'browser_selection_fallback path.  Uses Firefox built-in PM, partial 2FA ' +
    'with email codes, and no ad blocker — unlocking the full Firefox ad-block ' +
    'installation flow (adblock_firefox_desktop + sponsorblock_firefox) that ' +
    'no other persona reaches.'
  )

  // — Onboarding (detection rejected → fallback browser selection) —
  .step('Detect Windows + Firefox')
    .custom(() => injectDevice('windows', 'firefox'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Windows')
    .answerQuestion('windows_detection_confirm', 'yes')
    .then()
  .step('Reject Firefox detection → triggers fallback')
    .answerQuestion('firefox_detection_confirm', 'no')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      // browser_confirmed should be false, triggering fallback
      expect(store.factsActions.getFact('browser_confirmed')?.value).toBe(false);
    })
    .then()
  .step('Browser selection fallback: pick Firefox anyway')
    .answerQuestion('browser_selection_fallback', 'firefox')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('browser')?.value).toBe('firefox');
      expect(store.factsActions.getFact('browser_confirmed')?.value).toBe(true);
    })
    .then()
  .step('Tech comfort: comfortable')
    .answerQuestion('tech_comfort', 'comfortable')
    .then()
  .step('Has other mobile device')
    .answerQuestion('mobile_context', 'other')
    .then()
  .step('Priority: work security')
    .answerQuestion('usage_context', 'work_security')
    .then()

  // — Core Assessment (mixed — uses Firefox built-in PM) —
  .step('Uses password manager')
    .answerQuestion('password_manager', 'yes')
    .then()
  .step('PM type: browser built-in (Firefox)')
    .answerQuestion('pm_type', 'browser')
    .then()
  .step('PM master password: unsure')
    .answerQuestion('pm_master_password', 'unsure')
    .then()
  .step('Partial 2FA')
    .answerQuestion('two_factor_auth', 'partial')
    .then()
  .step('TFA method: email')
    .answerQuestion('tfa_method', 'email')
    .then()
  .step('TFA backup codes: somewhere')
    .answerQuestion('tfa_backup_codes', 'somewhere')
    .then()
  .step('TFA priority: work accounts')
    .answerQuestion('tfa_priority_accounts', 'work')
    .then()
  .step('TFA barrier: not available')
    .answerQuestion('tfa_barrier', 'not_available')
    .then()
  .step('Software updates: manual')
    .answerQuestion('software_updates', 'manual')
    .then()
  .step('Virus scan: this month')
    .answerQuestion('virus_scan_recent', 'this_month')
    .then()
  .step('Backup: monthly')
    .answerQuestion('backup_frequency', 'monthly')
    .then()
  .step('WiFi: WPA')
    .answerQuestion('wifi_security', 'wpa')
    .then()
  .step('Email: scan first')
    .answerQuestion('email_attachments', 'scan_first')
    .then()
  .step('Extensions: research first')
    .answerQuestion('browser_extensions', 'research_first')
    .then()

  // — Security Hygiene (middling) —
  .step('Screen lock: long timeout')
    .answerQuestion('screen_lock', 'yes_long')
    .then()
  .step('Password reuse: rarely')
    .answerQuestion('password_reuse_habits', 'rarely')
    .then()
  .step('Phishing: checks carefully')
    .answerQuestion('phishing_awareness', 'check_carefully')
    .then()
  .step('Breach check: once')
    .answerQuestion('breach_check', 'yes_once')
    .then()
  .step('Account recovery: basic')
    .answerQuestion('account_recovery', 'yes_basic')
    .then()
  .step('Ad blocker: no')
    .answerQuestion('ad_blocker', 'no')
    .then()

  // — Ad-Block Deep Dive (Firefox desktop + no ad blocker → QUALIFIES!) —
  .step('Ad blocker Firefox: installed uBlock Origin')
    .answerQuestion('adblock_firefox_desktop', 'installed')
    .then()
  .step('SponsorBlock: skipped')
    .answerQuestion('sponsorblock_firefox', 'skipped')
    .then()

  // — Browser-specific (Firefox) — uses weaker options than power users —
  .step('Firefox tracking: standard')
    .answerQuestion('firefox_tracking_protection', 'standard')
    .then()
  .step('Firefox privacy: default settings')
    .answerQuestion('firefox_privacy_config', 'default')
    .then()

  .finalOutcome(
    'Fiona has moderate score — Firefox ad-block installed, but gaps in PM, 2FA, and hygiene',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.overallScore).toBeGreaterThan(30);
      // Detection rejection → fallback → Firefox confirmed
      expect(store.answers['firefox_detection_confirm']?.value).toBe('no');
      expect(store.answers['browser_selection_fallback']?.value).toBe('firefox');
      expect(store.factsActions.getFact('browser')?.value).toBe('firefox');
      // Firefox ad-block flow completed (previously unreachable!)
      expect(store.answers['adblock_firefox_desktop']?.value).toBe('installed');
      expect(store.answers['sponsorblock_firefox']?.value).toBe('skipped');
      // PM type browser (new option in this persona)
      expect(store.answers['pm_type']?.value).toBe('browser');
      expect(store.answers['pm_master_password']?.value).toBe('unsure');
      // Email 2FA method (new option)
      expect(store.answers['tfa_method']?.value).toBe('email');
      expect(store.answers['tfa_priority_accounts']?.value).toBe('work');
      expect(store.answers['tfa_barrier']?.value).toBe('not_available');
      // Firefox browser-specific — standard and default (new options)
      expect(store.answers['firefox_tracking_protection']?.value).toBe('standard');
      expect(store.answers['firefox_privacy_config']?.value).toBe('default');
      // advanced_2fa NOT unlocked (updates=manual)
      expect(store.answers['advanced_2fa']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Persona 13 — "Chrome Carol"
// The last-mile persona: a Chrome user who relies on Chrome's built-in
// password manager, triggering chrome_password_warning — the only
// question that zero other personas reach.  Also hits untested options:
//   pm_master_password → reused  (critical risk branch)
//   chrome_privacy_hardening → default
//   chrome_password_warning → enable_encryption
// ═══════════════════════════════════════════════════════════════════════

export const chromeCarol: UserJourney = JourneyBuilder
  .create('Chrome Carol — Chrome Built-In PM, Triggers chrome_password_warning')
  .description(
    'Windows + Chrome user who uses Chrome\'s built-in password manager with a ' +
    'reused master password.  This is the only persona that hits the ' +
    'chrome_password_warning question (requires browser=chrome + pm_type=browser). ' +
    'Also covers chrome_privacy_hardening → default and pm_master_password → reused.'
  )

  // — Onboarding (standard Chrome detection) —
  .step('Detect Windows + Chrome')
    .custom(() => injectDevice('windows', 'chrome'))
    .then()
  .step('Privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .then()
  .step('Confirm Windows')
    .answerQuestion('windows_detection_confirm', 'yes')
    .then()
  .step('Confirm Chrome')
    .answerQuestion('chrome_detection_confirm', 'yes')
    .then()
  .step('Tech comfort: comfortable')
    .answerQuestion('tech_comfort', 'comfortable')
    .then()
  .step('Mobile: no mobile')
    .answerQuestion('mobile_context', 'neither')
    .then()
  .step('Priority: general')
    .answerQuestion('usage_context', 'general')
    .then()

  // — Core Assessment (PM → browser built-in, reused master) —
  .step('Uses password manager')
    .answerQuestion('password_manager', 'yes')
    .then()
  .step('PM type: browser built-in (Chrome)')
    .answerQuestion('pm_type', 'browser')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('pm_type')?.value).toBe('browser');
    })
    .then()
  .step('PM master password: reused (critical risk)')
    .answerQuestion('pm_master_password', 'reused')
    .then()
  .step('Partial 2FA')
    .answerQuestion('two_factor_auth', 'partial')
    .then()
  .step('TFA method: SMS')
    .answerQuestion('tfa_method', 'sms')
    .then()
  .step('TFA backup codes: no')
    .answerQuestion('tfa_backup_codes', 'no')
    .then()
  .step('TFA priority: banking')
    .answerQuestion('tfa_priority_accounts', 'banking')
    .then()
  .step('TFA barrier: confusing')
    .answerQuestion('tfa_barrier', 'confusing')
    .then()
  .step('Software updates: manual')
    .answerQuestion('software_updates', 'manual')
    .then()
  .step('Virus scan: this month')
    .answerQuestion('virus_scan_recent', 'this_month')
    .then()
  .step('Backup: weekly')
    .answerQuestion('backup_frequency', 'weekly')
    .then()
  .step('WiFi: WPA2')
    .answerQuestion('wifi_security', 'wpa2')
    .then()
  .step('Email: scan first')
    .answerQuestion('email_attachments', 'scan_first')
    .then()
  .step('Extensions: research first')
    .answerQuestion('browser_extensions', 'research_first')
    .then()

  // — Security Hygiene —
  .step('Screen lock: short')
    .answerQuestion('screen_lock', 'yes_short')
    .then()
  .step('Password reuse: often')
    .answerQuestion('password_reuse_habits', 'often')
    .then()
  .step('Phishing: checks carefully')
    .answerQuestion('phishing_awareness', 'check_carefully')
    .then()
  .step('Breach check: once')
    .answerQuestion('breach_check', 'yes_once')
    .then()
  .step('Account recovery: basic')
    .answerQuestion('account_recovery', 'yes_basic')
    .then()
  .step('Ad blocker: some sites')
    .answerQuestion('ad_blocker', 'some_sites')
    .then()

  // — Chrome browser-specific —
  .step('Chrome privacy hardening: default (untested option)')
    .answerQuestion('chrome_privacy_hardening', 'default')
    .then()

  // — THE KEY QUESTION: chrome_password_warning (last uncovered question!) —
  .step('Chrome password warning: will check encryption')
    .answerQuestion('chrome_password_warning', 'enable_encryption')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      // This is the question that was previously unreachable!
      expect(store.answers['chrome_password_warning']?.value).toBe('enable_encryption');
      expect(store.factsActions.getFact('chrome_pm_aware')?.value).toBe(true);
      expect(store.factsActions.getFact('chrome_ode_checking')?.value).toBe(true);
    })
    .then()

  .finalOutcome(
    'Carol has moderate score — chrome_password_warning finally answered, PM reuse flagged',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.overallScore).toBeGreaterThan(25);
      // Chrome built-in PM → chrome_password_warning triggered (THE milestone!)
      expect(store.answers['pm_type']?.value).toBe('browser');
      expect(store.answers['chrome_password_warning']?.value).toBe('enable_encryption');
      // Reused master password (new untested option)
      expect(store.answers['pm_master_password']?.value).toBe('reused');
      // Chrome privacy default (new untested option)
      expect(store.answers['chrome_privacy_hardening']?.value).toBe('default');
      // 68/68 questions now reachable!
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════

export const PERSONA_JOURNEYS = [
  grandmaDorothy,
  techBroMarcus,
  farmerJohn,
  workingMomSarah,
  privacyPat,
  financialFrank,
  linuxDevDana,
  collegeStudentAlex,
  iphoneEmma,
  androidAmir,
  mobileOnlyMaya,
  firefoxBeginnerFiona,
  chromeCarol,
] as const;
