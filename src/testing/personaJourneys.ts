/**
 * Persona-Based User Journeys
 *
 * Real-world user archetypes exercising realistic end-to-end paths
 * through the question bank.  Each persona validates that the app
 * asks the *right* questions, in the *right* order, for a recognisable
 * human being — not just a technical branch.
 *
 * Personas:
 *  1. "Grandma Dorothy"  — low-tech beginner, needs hand-holding
 *  2. "Tech Bro Marcus"  — advanced power user, maximum security
 *  3. "Farmer John"      — minimal tech, desktop-only, rarely updates
 *  4. "Working Mom Sarah" — practical, busy, partial security adoption
 *  5. "Privacy Pat"       — privacy-first advocate, Firefox strict
 *  6. "Financial Frank"   — finance-focused, 2FA everywhere, breach-aware
 */

import { expect } from 'vitest';
import { JourneyBuilder } from './journeyFramework';
import { useAssessmentStore } from '../features/assessment/state/store';
import type { UserJourney } from './journeyFramework';

// ═══════════════════════════════════════════════════════════════════════
// Helper: inject detection facts the same way browserJourneys.ts does
// ═══════════════════════════════════════════════════════════════════════

function injectDevice(
  os: string,
  browser: string,
  type: 'desktop' | 'mobile' = 'desktop',
) {
  const store = useAssessmentStore.getState();
  store.factsActions.injectFact('os_detected', os, { source: 'auto-detection' });
  store.factsActions.injectFact('browser_detected', browser, { source: 'auto-detection' });
  store.factsActions.injectFact('device_type', type, { source: 'auto-detection' });
  store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });

  store.setDeviceProfile({
    currentDevice: {
      type,
      // Test-only: cast needed because DeviceProfile accepts string literals but
      // persona journeys parameterise the OS/browser dynamically.
      os: os as 'windows' | 'mac' | 'linux',
      browser: browser as 'chrome' | 'firefox' | 'edge' | 'safari',
    },
    otherDevices: {
      hasWindows: os === 'windows',
      hasMac: os === 'mac',
      hasLinux: os === 'linux',
      hasIPhone: false,
      hasAndroid: false,
      hasIPad: false,
    },
    primaryDesktop: os as 'windows' | 'mac' | 'linux',
    primaryMobile: undefined,
  });
}

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
    .answerQuestion('mobile_context', 'no_mobile')
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
  .step('Mobile: iPhone')
    .answerQuestion('mobile_context', 'iphone')
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
    .answerQuestion('mobile_context', 'no_mobile')
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
    .answerQuestion('mobile_context', 'iphone')
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
    .answerQuestion('mobile_context', 'no_mobile')
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
] as const;
