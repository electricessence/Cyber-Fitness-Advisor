/**
 * Persona-Based Journey Tests
 *
 * Validates that real-world user archetypes can complete meaningful
 * end-to-end paths through the question bank.  Each persona exercises
 * a distinct combination of:
 *   - tech comfort level (beginner → advanced)
 *   - OS / browser detection flow
 *   - core assessment answers (good → poor)
 *   - condition-gated deep-dive branches
 *   - security hygiene habits
 *   - usage concern (privacy / financial / family / general)
 *
 * If a journey fails, it means our question bank doesn't properly
 * support that user archetype — a V1-blocking gap.
 */

import { describe, it, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { act } from '@testing-library/react';
import App from '../App';
import { JourneyTestRunner } from '../testing/journeyFramework';
import {
  grandmaDorothy,
  techBroMarcus,
  farmerJohn,
  workingMomSarah,
  privacyPat,
  financialFrank,
  PERSONA_JOURNEYS,
} from '../testing/personaJourneys';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('👤 Persona-Based User Journeys', () => {
  let runner: JourneyTestRunner;

  beforeAll(() => {
    act(() => {
      useAssessmentStore.getState().resetAssessment();
    });
    render(<App />);
    runner = new JourneyTestRunner();
  });

  // ── Low-Tech / Beginner Personas ────────────────────────────────────

  describe('🧓 Low-Tech Beginners', () => {
    it('Grandma Dorothy — novice help flow, all remediation branches, low score', async () => {
      await runner.executeJourney(grandmaDorothy);
    }, 30000);

    it('Farmer John — desktop-only, worst answers across the board', async () => {
      await runner.executeJourney(farmerJohn);
    }, 30000);
  });

  // ── Moderate / Practical Personas ───────────────────────────────────

  describe('👩‍💼 Practical Middle-Ground', () => {
    it('Working Mom Sarah — partial 2FA unlocks all four TFA deep-dives', async () => {
      await runner.executeJourney(workingMomSarah);
    }, 30000);

    it('Financial Frank — finance-focused, strong on banking security', async () => {
      await runner.executeJourney(financialFrank);
    }, 30000);
  });

  // ── Advanced / Power-User Personas ──────────────────────────────────

  describe('🔒 Power Users', () => {
    it('Tech Bro Marcus — max security, unlocks advanced_2fa gate', async () => {
      await runner.executeJourney(techBroMarcus);
    }, 30000);

    it('Privacy Pat — Firefox strict, privacy-first, high score', async () => {
      await runner.executeJourney(privacyPat);
    }, 30000);
  });

  // ── Coverage & Completeness ─────────────────────────────────────────

  describe('📊 Persona Coverage', () => {
    it('All persona journeys complete successfully', async () => {
      for (const journey of PERSONA_JOURNEYS) {
        await runner.executeJourney(journey);
      }
    }, 120000);
  });
});
