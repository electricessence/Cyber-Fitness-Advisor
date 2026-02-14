/**
 * Ad-Blocker Deep-Dive Journey Definitions
 *
 * Tests the condition-gated ad-blocker flow that branches by
 * browser × device type after the user answers "no" or "partial"
 * to the core ad_blocker question.
 *
 * Flows tested:
 *  1. Firefox + desktop  → uBlock Origin install → SponsorBlock bonus
 *  2. Edge + desktop     → uBlock Origin install
 *  3. Chrome + desktop   → MV3 limitation, browser-switch options
 *  4. Safari + desktop   → content blocker path
 *  5. Mobile iOS         → Firefox Focus
 *  6. Mobile Android     → Firefox + uBlock Origin
 *  7. Chrome → browser switch follow-up
 *  8. Chrome PM warning  → gated by chrome + pm_type=browser
 */

import { expect } from 'vitest';
import { JourneyBuilder } from './journeyFramework';
import { useAssessmentStore } from '../features/assessment/state/store';
import { injectDevice } from './testHelpers';
import type { UserJourney } from './journeyFramework';

// ═══════════════════════════════════════════════════════════════════════
// Journey 1: Firefox Desktop — uBlock Origin + SponsorBlock
// ═══════════════════════════════════════════════════════════════════════

export const firefoxDesktopAdBlock: UserJourney = JourneyBuilder
  .create('Firefox Desktop — uBlock Origin + SponsorBlock')
  .description(
    'Firefox desktop user answers ad_blocker=no → sees adblock_firefox_desktop → ' +
    'installs uBlock Origin → SponsorBlock bonus question unlocks.'
  )

  .step('Detect Windows + Firefox desktop')
    .custom(() => injectDevice('windows', 'firefox'))
    .then()
  .step('Set browser fact for conditions')
    .custom(() => {
      const store = useAssessmentStore.getState();
      store.factsActions.injectFact('browser', 'firefox', { source: 'auto-detection' });
    })
    .then()
  .step('Answer ad_blocker = no')
    .answerQuestion('ad_blocker', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      // Firefox desktop ad-block question should appear
      expect(ids).toContain('adblock_firefox_desktop');
      // Other browser flows should NOT appear
      expect(ids).not.toContain('adblock_edge_desktop');
      expect(ids).not.toContain('adblock_chrome_desktop');
      expect(ids).not.toContain('adblock_safari_desktop');
    })
    .then()
  .step('Install uBlock Origin — "installed"')
    .answerQuestion('adblock_firefox_desktop', 'installed')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      // ublock_origin fact should be set
      expect(store.factsActions.getFact('ublock_origin')?.value).toBe(true);
      expect(store.factsActions.getFact('ad_blocker_installed')?.value).toBe(true);
      // SponsorBlock should now be visible
      const ids = store.getVisibleQuestionIds();
      expect(ids).toContain('sponsorblock_firefox');
    })
    .then()
  .step('Install SponsorBlock — "installed"')
    .answerQuestion('sponsorblock_firefox', 'installed')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('sponsorblock')?.value).toBe(true);
    })
    .then()

  .finalOutcome(
    'Firefox desktop user has uBlock Origin + SponsorBlock installed',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['adblock_firefox_desktop']?.value).toBe('installed');
      expect(store.answers['sponsorblock_firefox']?.value).toBe('installed');
      expect(store.overallScore).toBeGreaterThan(0);
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 2: Edge Desktop — uBlock Origin
// ═══════════════════════════════════════════════════════════════════════

export const edgeDesktopAdBlock: UserJourney = JourneyBuilder
  .create('Edge Desktop — uBlock Origin')
  .description(
    'Edge desktop user answers ad_blocker=no → sees adblock_edge_desktop → installs.'
  )

  .step('Detect Windows + Edge desktop')
    .custom(() => {
      injectDevice('windows', 'edge');
      useAssessmentStore.getState().factsActions.injectFact('browser', 'edge', { source: 'auto-detection' });
    })
    .then()
  .step('Answer ad_blocker = no')
    .answerQuestion('ad_blocker', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('adblock_edge_desktop');
      expect(ids).not.toContain('adblock_firefox_desktop');
      expect(ids).not.toContain('adblock_chrome_desktop');
    })
    .then()
  .step('Install uBlock Origin — "installed"')
    .answerQuestion('adblock_edge_desktop', 'installed')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('ublock_origin')?.value).toBe(true);
      expect(store.factsActions.getFact('ad_blocker_browser')?.value).toBe('edge');
    })
    .then()

  .finalOutcome(
    'Edge desktop user has uBlock Origin installed',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['adblock_edge_desktop']?.value).toBe('installed');
      // SponsorBlock should NOT be visible (only for Firefox)
      const ids = store.getVisibleQuestionIds();
      expect(ids).not.toContain('sponsorblock_firefox');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 3: Chrome Desktop — MV3 limitation, switch to Firefox
// ═══════════════════════════════════════════════════════════════════════

export const chromeDesktopAdBlock: UserJourney = JourneyBuilder
  .create('Chrome Desktop — MV3 Limitation → Firefox Switch')
  .description(
    'Chrome desktop user answers ad_blocker=no → sees Chrome-specific honest ' +
    'conversation → chooses to try Firefox → browser switch follow-up appears.'
  )

  .step('Detect Windows + Chrome desktop')
    .custom(() => {
      injectDevice('windows', 'chrome');
      useAssessmentStore.getState().factsActions.injectFact('browser', 'chrome', { source: 'auto-detection' });
    })
    .then()
  .step('Answer ad_blocker = no')
    .answerQuestion('ad_blocker', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('adblock_chrome_desktop');
      expect(ids).not.toContain('adblock_firefox_desktop');
      expect(ids).not.toContain('adblock_edge_desktop');
      expect(ids).not.toContain('adblock_safari_desktop');
    })
    .then()
  .step('Choose "I\'ll try Firefox" — switch_firefox')
    .answerQuestion('adblock_chrome_desktop', 'switch_firefox')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('considering_browser_switch')?.value).toBe('firefox');
      // Browser switch follow-up should unlock
      const ids = store.getVisibleQuestionIds();
      expect(ids).toContain('browser_switch_progress');
    })
    .then()
  .step('Browser switch follow-up — "trying"')
    .answerQuestion('browser_switch_progress', 'trying')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('browser_switch_in_progress')?.value).toBe(true);
    })
    .then()

  .finalOutcome(
    'Chrome user is transitioning to Firefox, browser switch flow exercised',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['adblock_chrome_desktop']?.value).toBe('switch_firefox');
      expect(store.answers['browser_switch_progress']?.value).toBe('trying');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 4: Chrome + Chrome PM → password warning
// ═══════════════════════════════════════════════════════════════════════

export const chromePmWarning: UserJourney = JourneyBuilder
  .create('Chrome Password Manager Warning')
  .description(
    'Chrome user who uses the built-in password manager (pm_type=browser) ' +
    'sees the Chrome password warning question.'
  )

  .step('Detect Windows + Chrome desktop')
    .custom(() => {
      injectDevice('windows', 'chrome');
      useAssessmentStore.getState().factsActions.injectFact('browser', 'chrome', { source: 'auto-detection' });
    })
    .then()
  .step('Set pm_type = browser (user uses Chrome built-in PM)')
    .custom(() => {
      useAssessmentStore.getState().factsActions.injectFact('pm_type', 'browser', { source: 'answer' });
    })
    .then()
  .step('Verify chrome_password_warning is visible')
    .custom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('chrome_password_warning');
    })
    .then()
  .step('Answer chrome_password_warning — will research')
    .answerQuestion('chrome_password_warning', 'will_research')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('chrome_pm_aware')?.value).toBe(true);
      expect(store.factsActions.getFact('considering_pm_switch')?.value).toBe(true);
    })
    .then()

  .finalOutcome(
    'Chrome PM user is informed and researching options',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['chrome_password_warning']?.value).toBe('will_research');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 5: Safari Desktop — content blocker
// ═══════════════════════════════════════════════════════════════════════

export const safariDesktopAdBlock: UserJourney = JourneyBuilder
  .create('Safari Desktop — Content Blocker')
  .description(
    'Safari desktop user answers ad_blocker=no → sees Safari-specific content ' +
    'blocker question with option to try Firefox instead.'
  )

  .step('Detect Mac + Safari desktop')
    .custom(() => {
      injectDevice('mac', 'safari');
      useAssessmentStore.getState().factsActions.injectFact('browser', 'safari', { source: 'auto-detection' });
    })
    .then()
  .step('Answer ad_blocker = partial')
    .answerQuestion('ad_blocker', 'some_sites')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('adblock_safari_desktop');
      expect(ids).not.toContain('adblock_firefox_desktop');
      expect(ids).not.toContain('adblock_chrome_desktop');
    })
    .then()
  .step('Install content blocker from App Store')
    .answerQuestion('adblock_safari_desktop', 'installed')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('safari_content_blocker')?.value).toBe(true);
      expect(store.factsActions.getFact('ad_blocker_installed')?.value).toBe(true);
    })
    .then()

  .finalOutcome(
    'Safari desktop user has content blocker installed',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['adblock_safari_desktop']?.value).toBe('installed');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 6: Mobile iOS — Firefox Focus
// ═══════════════════════════════════════════════════════════════════════

export const mobileIosAdBlock: UserJourney = JourneyBuilder
  .create('Mobile iOS — Firefox Focus')
  .description(
    'iOS user who answered ad_blocker=no + has iPhone → sees Firefox Focus suggestion.'
  )

  .step('Detect Mac + Safari (desktop) but has iPhone')
    .custom(() => {
      injectDevice('mac', 'safari');
      const store = useAssessmentStore.getState();
      store.factsActions.injectFact('browser', 'safari', { source: 'auto-detection' });
    })
    .then()
  .step('Set mobile_context = iphone (asserts mobile_os=ios)')
    .answerQuestion('mobile_context', 'iphone')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('mobile_os')?.value).toBe('ios');
    })
    .then()
  .step('Answer ad_blocker = no')
    .answerQuestion('ad_blocker', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('adblock_mobile_ios');
    })
    .then()
  .step('Install Firefox Focus')
    .answerQuestion('adblock_mobile_ios', 'installed')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('firefox_focus')?.value).toBe(true);
      expect(store.factsActions.getFact('mobile_ad_blocker')?.value).toBe(true);
    })
    .then()

  .finalOutcome(
    'iOS user has Firefox Focus installed as Safari content blocker',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['adblock_mobile_ios']?.value).toBe('installed');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 7: Mobile Android — Firefox + uBlock Origin
// ═══════════════════════════════════════════════════════════════════════

export const mobileAndroidAdBlock: UserJourney = JourneyBuilder
  .create('Mobile Android — Firefox + uBlock Origin')
  .description(
    'Android user who answered ad_blocker=no → sees Android-specific Firefox + uBO path.'
  )

  .step('Detect Windows + Chrome (desktop) but has Android phone')
    .custom(() => {
      injectDevice('windows', 'chrome');
      const store = useAssessmentStore.getState();
      store.factsActions.injectFact('browser', 'chrome', { source: 'auto-detection' });
    })
    .then()
  .step('Set mobile_context = android (asserts mobile_os=android)')
    .answerQuestion('mobile_context', 'android')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('mobile_os')?.value).toBe('android');
    })
    .then()
  .step('Answer ad_blocker = no')
    .answerQuestion('ad_blocker', 'no')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      expect(ids).toContain('adblock_mobile_android');
    })
    .then()
  .step('Install Firefox + uBlock Origin on Android')
    .answerQuestion('adblock_mobile_android', 'installed')
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.factsActions.getFact('mobile_firefox')?.value).toBe(true);
      expect(store.factsActions.getFact('mobile_ublock')?.value).toBe(true);
      expect(store.factsActions.getFact('mobile_ad_blocker')?.value).toBe(true);
    })
    .then()

  .finalOutcome(
    'Android user has Firefox + uBlock Origin on mobile',
    () => {
      const store = useAssessmentStore.getState();
      expect(store.answers['adblock_mobile_android']?.value).toBe('installed');
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Journey 8: Firefox "already have it" — no deep-dive triggered
// ═══════════════════════════════════════════════════════════════════════

export const adBlockerAlreadyInstalled: UserJourney = JourneyBuilder
  .create('Ad Blocker Already Installed — No Deep-Dive')
  .description(
    'User who answers ad_blocker=yes should NOT see any deep-dive questions.'
  )

  .step('Detect Windows + Firefox desktop')
    .custom(() => {
      injectDevice('windows', 'firefox');
      useAssessmentStore.getState().factsActions.injectFact('browser', 'firefox', { source: 'auto-detection' });
    })
    .then()
  .step('Answer ad_blocker = yes')
    .answerQuestion('ad_blocker', 'yes')
    .expectCustom(() => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      // NONE of the deep-dive questions should appear
      expect(ids).not.toContain('adblock_firefox_desktop');
      expect(ids).not.toContain('adblock_edge_desktop');
      expect(ids).not.toContain('adblock_chrome_desktop');
      expect(ids).not.toContain('adblock_safari_desktop');
      expect(ids).not.toContain('adblock_mobile_ios');
      expect(ids).not.toContain('adblock_mobile_android');
    })
    .then()

  .finalOutcome(
    'User who already has an ad blocker sees no deep-dive questions',
    () => {
      const ids = useAssessmentStore.getState().getVisibleQuestionIds();
      const adBlockDeepDives = ids.filter((id: string) => id.startsWith('adblock_'));
      expect(adBlockDeepDives).toHaveLength(0);
    }
  )
  .build();

// ═══════════════════════════════════════════════════════════════════════
// Exports
// ═══════════════════════════════════════════════════════════════════════

export const AD_BLOCK_JOURNEYS = [
  firefoxDesktopAdBlock,
  edgeDesktopAdBlock,
  chromeDesktopAdBlock,
  chromePmWarning,
  safariDesktopAdBlock,
  mobileIosAdBlock,
  mobileAndroidAdBlock,
  adBlockerAlreadyInstalled,
] as const;
