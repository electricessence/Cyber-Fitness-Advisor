/**
 * Condition-Gated Journey Definitions
 * 
 * Tests the condition evaluation system that survived the Phase 1/2 cleanup.
 * These journeys verify that the single remaining condition path
 * (evaluateQuestionConditions) correctly gates deep-dive questions
 * based on user facts established by earlier answers.
 */

import { expect } from 'vitest';
import { JourneyBuilder } from './journeyFramework';
import { useAssessmentStore } from '../features/assessment/state/store';
import type { UserJourney } from './journeyFramework';

// ═══════════════════════════════════════════════════════════════════════
// Journey 1: Password Manager Deep-Dive — "Yes" Branch
// User says they use a password manager → unlocks pm_type, pm_master_password
// ═══════════════════════════════════════════════════════════════════════

export const passwordManagerYesBranch: UserJourney = JourneyBuilder
  .create('Password Manager Deep-Dive (Yes Branch)')
  .description(
    'User who uses a password manager should see follow-up questions ' +
    'about manager type and master password strength'
  )
  .step('Answer password_manager = yes')
    .answerQuestion('password_manager', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('pm_type');
      expect(ids).toContain('pm_master_password');
      // Should NOT see the "no" branch questions
      expect(ids).not.toContain('pm_current_method');
      expect(ids).not.toContain('pm_barrier');
    })
    .then()
  .step('Answer pm_type = cloud')
    .answerQuestion('pm_type', 'cloud')
    .expectStoreState({
      hasAnswers: ['password_manager', 'pm_type']
    })
    .then()
  .step('Answer pm_master_password = passphrase (strong)')
    .answerQuestion('pm_master_password', 'passphrase')
    .expectStoreState({
      hasAnswers: ['password_manager', 'pm_type', 'pm_master_password'],
      scoreRange: { min: 1, max: 100 }
    })
    .then()
  .finalOutcome(
    'All password manager deep-dive questions answered, good security score earned',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['password_manager']?.value).toBe('yes');
      expect(store.answers['pm_type']?.value).toBe('cloud');
      expect(store.answers['pm_master_password']?.value).toBe('passphrase');
      // pm_current_method and pm_barrier should never have appeared
      expect(store.answers['pm_current_method']).toBeUndefined();
      expect(store.answers['pm_barrier']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 2: Password Manager Deep-Dive — "No" Branch
// User says they DON'T use a PM → unlocks pm_current_method, pm_barrier
// ═══════════════════════════════════════════════════════════════════════

export const passwordManagerNoBranch: UserJourney = JourneyBuilder
  .create('Password Manager Deep-Dive (No Branch)')
  .description(
    'User who does NOT use a password manager should see follow-up questions ' +
    'about current methods and barriers to adoption'
  )
  .step('Answer password_manager = no')
    .answerQuestion('password_manager', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('pm_current_method');
      expect(ids).toContain('pm_barrier');
      // Should NOT see the "yes" branch questions
      expect(ids).not.toContain('pm_type');
      expect(ids).not.toContain('pm_master_password');
    })
    .then()
  .step('Answer pm_current_method = reuse')
    .answerQuestion('pm_current_method', 'reuse')
    .expectStoreState({
      hasAnswers: ['password_manager', 'pm_current_method']
    })
    .then()
  .step('Answer pm_barrier = trust')
    .answerQuestion('pm_barrier', 'trust')
    .expectStoreState({
      hasAnswers: ['password_manager', 'pm_current_method', 'pm_barrier']
    })
    .then()
  .finalOutcome(
    'No-branch questions appeared and were answered; yes-branch never appeared',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['password_manager']?.value).toBe('no');
      expect(store.answers['pm_current_method']?.value).toBe('reuse');
      expect(store.answers['pm_barrier']?.value).toBe('trust');
      expect(store.answers['pm_type']).toBeUndefined();
      expect(store.answers['pm_master_password']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 3: Two-Factor Deep-Dive — "Yes" Branch
// User says they use 2FA → unlocks tfa_method, tfa_backup_codes
// ═══════════════════════════════════════════════════════════════════════

export const twoFactorYesBranch: UserJourney = JourneyBuilder
  .create('Two-Factor Deep-Dive (Yes Branch)')
  .description(
    'User who uses 2FA should see questions about their method and backup codes'
  )
  .step('Answer two_factor_auth = yes')
    .answerQuestion('two_factor_auth', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('tfa_method');
      expect(ids).toContain('tfa_backup_codes');
      // Should NOT see the no/partial-specific branches
      expect(ids).not.toContain('tfa_priority_accounts');
      expect(ids).not.toContain('tfa_barrier');
    })
    .then()
  .step('Answer tfa_method = authenticator_app')
    .answerQuestion('tfa_method', 'authenticator_app')
    .expectStoreState({
      hasAnswers: ['two_factor_auth', 'tfa_method']
    })
    .then()
  .step('Answer tfa_backup_codes = yes_secure')
    .answerQuestion('tfa_backup_codes', 'yes_secure')
    .expectStoreState({
      hasAnswers: ['two_factor_auth', 'tfa_method', 'tfa_backup_codes'],
      scoreRange: { min: 1, max: 100 }
    })
    .then()
  .finalOutcome(
    'Yes-branch 2FA questions answered with strong security practices',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['two_factor_auth']?.value).toBe('yes');
      expect(store.answers['tfa_method']?.value).toBe('authenticator_app');
      expect(store.answers['tfa_backup_codes']?.value).toBe('yes_secure');
      expect(store.answers['tfa_priority_accounts']).toBeUndefined();
      expect(store.answers['tfa_barrier']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 4: Two-Factor Deep-Dive — "No" Branch
// User says NO to 2FA → unlocks tfa_priority_accounts, tfa_barrier
// ═══════════════════════════════════════════════════════════════════════

export const twoFactorNoBranch: UserJourney = JourneyBuilder
  .create('Two-Factor Deep-Dive (No Branch)')
  .description(
    'User who does NOT use 2FA should see remediation questions about priority accounts and barriers'
  )
  .step('Answer two_factor_auth = no')
    .answerQuestion('two_factor_auth', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('tfa_priority_accounts');
      expect(ids).toContain('tfa_barrier');
      // Should NOT see the yes-branch questions
      expect(ids).not.toContain('tfa_method');
      expect(ids).not.toContain('tfa_backup_codes');
    })
    .then()
  .step('Answer tfa_priority_accounts = email')
    .answerQuestion('tfa_priority_accounts', 'email')
    .expectStoreState({
      hasAnswers: ['two_factor_auth', 'tfa_priority_accounts']
    })
    .then()
  .step('Answer tfa_barrier = procrastination')
    .answerQuestion('tfa_barrier', 'no_reason')
    .expectStoreState({
      hasAnswers: ['two_factor_auth', 'tfa_priority_accounts', 'tfa_barrier']
    })
    .then()
  .finalOutcome(
    'No-branch 2FA remediation questions appeared; yes-branch never appeared',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['two_factor_auth']?.value).toBe('no');
      expect(store.answers['tfa_priority_accounts']?.value).toBe('email');
      expect(store.answers['tfa_barrier']?.value).toBe('no_reason');
      expect(store.answers['tfa_method']).toBeUndefined();
      expect(store.answers['tfa_backup_codes']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 5: Two-Factor "Partial" Branch
// User says "partial" → should see BOTH the yes-branch AND no-branch
// because tfa_method includes ['yes','partial'] and tfa_priority includes ['partial','no']
// ═══════════════════════════════════════════════════════════════════════

export const twoFactorPartialBranch: UserJourney = JourneyBuilder
  .create('Two-Factor Deep-Dive (Partial Branch)')
  .description(
    'User who partially uses 2FA should see ALL follow-up questions — both ' +
    'the method/backup branch AND the priority/barrier branch'
  )
  .step('Answer two_factor_auth = partial')
    .answerQuestion('two_factor_auth', 'partial')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      // "partial" matches both ['yes','partial'] and ['partial','no'] conditions
      expect(ids).toContain('tfa_method');
      expect(ids).toContain('tfa_backup_codes');
      expect(ids).toContain('tfa_priority_accounts');
      expect(ids).toContain('tfa_barrier');
    })
    .then()
  .finalOutcome(
    'Partial 2FA unlocks all four deep-dive questions simultaneously',
    () => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      const tfaQuestions = ids.filter((id: string) => id.startsWith('tfa_'));
      expect(tfaQuestions.length).toBeGreaterThanOrEqual(4);
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 6: Advanced 2FA Gate — Multi-Condition AND Logic
// advanced_2fa requires BOTH password_manager='yes' AND updates='automatic'
// ═══════════════════════════════════════════════════════════════════════

export const advancedTwoFactorGate: UserJourney = JourneyBuilder
  .create('Advanced 2FA Multi-Condition Gate')
  .description(
    'Tests AND logic: advanced_2fa only appears when BOTH password_manager=yes AND updates=automatic. ' +
    'Verifying the condition system handles multi-key include correctly.'
  )
  .step('Initially advanced_2fa is hidden (no facts)')
    .custom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).not.toContain('advanced_2fa');
    })
    .expectCustom(() => {
      // Confirmed hidden
    })
    .then()
  .step('Answer password_manager = yes (one condition met)')
    .answerQuestion('password_manager', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).not.toContain('advanced_2fa');
    })
    .then()
  .step('Answer software_updates = automatic (both conditions now met)')
    .answerQuestion('software_updates', 'automatic')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('advanced_2fa');
    })
    .then()
  .step('Answer advanced_2fa = yes')
    .answerQuestion('advanced_2fa', 'yes')
    .expectStoreState({
      hasAnswers: ['password_manager', 'software_updates', 'advanced_2fa'],
      scoreRange: { min: 1, max: 100 }
    })
    .then()
  .finalOutcome(
    'Multi-condition AND gate correctly delayed advanced_2fa until both facts established',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['advanced_2fa']?.value).toBe('yes');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 7: Full Security-Conscious User
// Combines password manager YES + 2FA YES + software updates → advanced_2fa unlocked
// End-to-end "golden path" through the entire condition system
// ═══════════════════════════════════════════════════════════════════════

export const securityConsciousFullPath: UserJourney = JourneyBuilder
  .create('Security-Conscious User — Full Path')
  .description(
    'End-to-end journey: user answers core questions with strong security practices, ' +
    'unlocking all deep-dive branches AND the multi-condition advanced_2fa gate'
  )
  .step('Acknowledge privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  .step('Answer password_manager = yes')
    .answerQuestion('password_manager', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('pm_type');
      expect(ids).toContain('pm_master_password');
    })
    .then()
  .step('Answer pm_type = local (offline manager)')
    .answerQuestion('pm_type', 'local')
    .expectStoreState({ hasAnswers: ['privacy_notice', 'password_manager', 'pm_type'] })
    .then()
  .step('Answer pm_master_password = passphrase')
    .answerQuestion('pm_master_password', 'passphrase')
    .expectStoreState({ hasAnswers: ['privacy_notice', 'password_manager', 'pm_type', 'pm_master_password'] })
    .then()
  .step('Answer two_factor_auth = yes')
    .answerQuestion('two_factor_auth', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('tfa_method');
      expect(ids).toContain('tfa_backup_codes');
    })
    .then()
  .step('Answer tfa_method = hardware_key')
    .answerQuestion('tfa_method', 'hardware_key')
    .expectStoreState({ hasAnswers: ['privacy_notice', 'password_manager', 'pm_type', 'pm_master_password', 'two_factor_auth', 'tfa_method'] })
    .then()
  .step('Answer tfa_backup_codes = yes_secure')
    .answerQuestion('tfa_backup_codes', 'yes_secure')
    .then()
  .step('Answer software_updates = automatic — should unlock advanced_2fa')
    .answerQuestion('software_updates', 'automatic')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('advanced_2fa');
    })
    .then()
  .step('Answer advanced_2fa = yes (hardware keys)')
    .answerQuestion('advanced_2fa', 'yes')
    .expectStoreState({
      scoreRange: { min: 1, max: 100 }
    })
    .then()
  .finalOutcome(
    'Security-conscious user completed all deep-dive branches + advanced gate with maximum points',
    () => {
      const store = useAssessmentStore.getState();
      // All deep-dive answers present
      expect(store.answers['pm_type']?.value).toBe('local');
      expect(store.answers['pm_master_password']?.value).toBe('passphrase');
      expect(store.answers['tfa_method']?.value).toBe('hardware_key');
      expect(store.answers['tfa_backup_codes']?.value).toBe('yes_secure');
      expect(store.answers['advanced_2fa']?.value).toBe('yes');
      // No "remediation" branch questions answered
      expect(store.answers['pm_current_method']).toBeUndefined();
      expect(store.answers['pm_barrier']).toBeUndefined();
      expect(store.answers['tfa_priority_accounts']).toBeUndefined();
      expect(store.answers['tfa_barrier']).toBeUndefined();
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════

export const CONDITION_JOURNEYS = [
  passwordManagerYesBranch,
  passwordManagerNoBranch,
  twoFactorYesBranch,
  twoFactorNoBranch,
  twoFactorPartialBranch,
  advancedTwoFactorGate,
  securityConsciousFullPath,
];
