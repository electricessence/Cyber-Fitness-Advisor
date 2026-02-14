/**
 * Condition-Gated Deep-Dive Journey Tests
 * 
 * Validates that the single remaining condition evaluation path
 * (evaluateQuestionConditions) correctly gates questions based on user facts.
 * 
 * Covers:
 *  - Password manager YES/NO branching (include condition on single fact)
 *  - Two-factor YES/NO/PARTIAL branching (include condition with array OR)
 *  - Advanced 2FA multi-condition AND gate (include with multiple facts)
 *  - Full "golden path" end-to-end through all deep-dive branches
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { act } from '@testing-library/react';
import App from '../App';
import { JourneyTestRunner } from '../testing/journeyFramework';
import {
  passwordManagerYesBranch,
  passwordManagerNoBranch,
  twoFactorYesBranch,
  twoFactorNoBranch,
  twoFactorPartialBranch,
  advancedTwoFactorGate,
  securityConsciousFullPath,
  CONDITION_JOURNEYS,
} from '../testing/conditionJourneys';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('🔀 Condition-Gated Deep-Dive Journeys', () => {
  let runner: JourneyTestRunner;

  beforeAll(() => {
    // Render the app once for the entire test suite
    act(() => {
      useAssessmentStore.getState().resetAssessment();
    });
    render(<App />);
    runner = new JourneyTestRunner();
  });

  // ── Password Manager Branching ──────────────────────────────────────

  describe('🔑 Password Manager Deep-Dive', () => {
    it('YES branch: pm_type + pm_master_password appear, no-branch hidden', async () => {
      await runner.executeJourney(passwordManagerYesBranch);
    }, 15000);

    it('NO branch: pm_current_method + pm_barrier appear, yes-branch hidden', async () => {
      await runner.executeJourney(passwordManagerNoBranch);
    }, 15000);
  });

  // ── Two-Factor Authentication Branching ─────────────────────────────

  describe('🔐 Two-Factor Authentication Deep-Dive', () => {
    it('YES branch: tfa_method + tfa_backup_codes appear', async () => {
      await runner.executeJourney(twoFactorYesBranch);
    }, 15000);

    it('NO branch: tfa_priority_accounts + tfa_barrier appear', async () => {
      await runner.executeJourney(twoFactorNoBranch);
    }, 15000);

    it('PARTIAL branch: ALL four tfa_ questions appear simultaneously', async () => {
      await runner.executeJourney(twoFactorPartialBranch);
    }, 15000);
  });

  // ── Multi-Condition AND Gate ────────────────────────────────────────

  describe('⚡ Multi-Condition Gates', () => {
    it('advanced_2fa requires BOTH password_manager=yes AND updates=automatic', async () => {
      await runner.executeJourney(advancedTwoFactorGate);
    }, 15000);
  });

  // ── End-to-End Golden Path ──────────────────────────────────────────

  describe('🌟 End-to-End', () => {
    it('security-conscious user completes all deep-dive branches + advanced gate', async () => {
      await runner.executeJourney(securityConsciousFullPath);
    }, 30000);
  });

  // ── Meta: All Journeys Complete ─────────────────────────────────────

  describe('📊 Journey Coverage', () => {
    it('all condition journeys complete without errors', async () => {
      for (const journey of CONDITION_JOURNEYS) {
        await runner.executeJourney(journey);
      }
      expect(CONDITION_JOURNEYS).toHaveLength(7);
    }, 60000);
  });
});
