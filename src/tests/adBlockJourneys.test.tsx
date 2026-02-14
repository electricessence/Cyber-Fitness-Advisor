/**
 * Ad-Blocker Deep-Dive Journey Tests
 *
 * Validates that the browser × device-specific ad-blocker flow
 * presents the right questions based on the user's browser and device.
 *
 * Flow summary:
 *   ad_blocker = no/partial
 *     ├─ Firefox desktop  → uBlock Origin → SponsorBlock bonus
 *     ├─ Edge desktop     → uBlock Origin
 *     ├─ Chrome desktop   → MV3 honest conversation → browser switch
 *     ├─ Safari desktop   → content blockers
 *     ├─ iOS (iPhone)     → Firefox Focus
 *     └─ Android          → Firefox mobile + uBlock Origin
 *
 *   ad_blocker = yes      → NO deep-dive questions
 *   Chrome + pm_type=browser → Chrome PM warning
 */

import { describe, it, beforeAll } from 'vitest';
import { render } from '@testing-library/react';
import { act } from '@testing-library/react';
import App from '../App';
import { JourneyTestRunner } from '../testing/journeyFramework';
import {
  firefoxDesktopAdBlock,
  edgeDesktopAdBlock,
  chromeDesktopAdBlock,
  chromePmWarning,
  safariDesktopAdBlock,
  mobileIosAdBlock,
  mobileAndroidAdBlock,
  adBlockerAlreadyInstalled,
  AD_BLOCK_JOURNEYS,
} from '../testing/adBlockJourneys';
import { useAssessmentStore } from '../features/assessment/state/store';

describe('🛡️ Ad-Blocker Deep-Dive Journeys', () => {
  let runner: JourneyTestRunner;

  beforeAll(() => {
    act(() => {
      useAssessmentStore.getState().resetAssessment();
    });
    render(<App />);
    runner = new JourneyTestRunner();
  });

  // ── Desktop Browser Flows ──────────────────────────────────────────

  describe('🖥️ Desktop Flows', () => {
    it('Firefox desktop → uBlock Origin + SponsorBlock bonus', async () => {
      await runner.executeJourney(firefoxDesktopAdBlock);
    }, 30000);

    it('Edge desktop → uBlock Origin install', async () => {
      await runner.executeJourney(edgeDesktopAdBlock);
    }, 30000);

    it('Chrome desktop → MV3 limitation → Firefox switch → follow-up', async () => {
      await runner.executeJourney(chromeDesktopAdBlock);
    }, 30000);

    it('Safari desktop → content blocker from App Store', async () => {
      await runner.executeJourney(safariDesktopAdBlock);
    }, 30000);
  });

  // ── Mobile Flows ──────────────────────────────────────────────────

  describe('📱 Mobile Flows', () => {
    it('iOS (iPhone) → Firefox Focus', async () => {
      await runner.executeJourney(mobileIosAdBlock);
    }, 30000);

    it('Android → Firefox + uBlock Origin', async () => {
      await runner.executeJourney(mobileAndroidAdBlock);
    }, 30000);
  });

  // ── Edge Cases ────────────────────────────────────────────────────

  describe('🔒 Edge Cases', () => {
    it('Chrome + browser PM → Chrome password manager warning', async () => {
      await runner.executeJourney(chromePmWarning);
    }, 30000);

    it('ad_blocker=yes → NO deep-dive questions appear', async () => {
      await runner.executeJourney(adBlockerAlreadyInstalled);
    }, 30000);
  });

  // ── Coverage ──────────────────────────────────────────────────────

  describe('📊 Ad-Block Coverage', () => {
    it('All 8 ad-block journeys complete successfully', async () => {
      for (const journey of AD_BLOCK_JOURNEYS) {
        await runner.executeJourney(journey);
      }
    }, 120000);
  });
});
