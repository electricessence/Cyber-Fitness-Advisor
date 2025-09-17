/**
 * Browser-Specific Journey Tests
 * 
 * Comprehensive testing for OS + Browser combinations
 * Tests Windows (Edge/Firefox/Chrome) and macOS (Chrome/Safari/Firefox)
 */

import { describe, it, beforeEach, expect } from 'vitest';
import { render } from '@testing-library/react';
import App from '../App';
import { useAssessmentStore } from '../features/assessment/state/store';
import { 
  BROWSER_SPECIFIC_JOURNEYS,
  WINDOWS_BROWSER_JOURNEYS,
  MACOS_BROWSER_JOURNEYS,
  windowsEdgeJourney,
  windowsFirefoxJourney,
  windowsChromeJourney,
  macChromeJourney,
  macSafariJourney,
  macFirefoxJourney
} from './browserJourneys';
import { JourneyTestRunner } from './journeyFramework';

describe('🌐 Browser-Specific User Journeys', () => {
  let journeyRunner: JourneyTestRunner;

  beforeEach(() => {
    // Create fresh journey runner for each test
    journeyRunner = new JourneyTestRunner();
    
    // Render the app once for the entire test suite
    render(<App />);
  });

  describe('🪟 Windows Browser Journeys', () => {
    it('🔷 Windows + Edge User Journey', async () => {
      await journeyRunner.executeJourney(windowsEdgeJourney);
      
      // Verify Edge-specific outcomes
      const store = useAssessmentStore.getState();
      expect(store.deviceProfile?.currentDevice?.browser).toBe('edge');
      expect(store.deviceProfile?.currentDevice?.os).toBe('windows');
      
      // Should have Microsoft ecosystem security questions answered
      const edgeAnswers = Object.keys(store.answers).filter(id =>
        id.includes('edge') || id.includes('smartscreen')
      );
      expect(edgeAnswers.length).toBeGreaterThan(0);
    });

    it('🦊 Windows + Firefox User Journey', async () => {
      await journeyRunner.executeJourney(windowsFirefoxJourney);
      
      // Verify Firefox privacy focus
      const store = useAssessmentStore.getState();
      expect(store.deviceProfile?.currentDevice?.browser).toBe('firefox');
      
      const privacyAnswers = Object.keys(store.answers).filter(id =>
        id.includes('firefox') || id.includes('tracking') || id.includes('ublock')
      );
      expect(privacyAnswers.length).toBeGreaterThan(0);
    });

    it('🟢 Windows + Chrome User Journey', async () => {
      await journeyRunner.executeJourney(windowsChromeJourney);
      
      // Verify Chrome Google integration
      const store = useAssessmentStore.getState();
      expect(store.deviceProfile?.currentDevice?.browser).toBe('chrome');
      
      const chromeAnswers = Object.keys(store.answers).filter(id =>
        id.includes('chrome') || id.includes('safe_browsing') || id.includes('sync')
      );
      expect(chromeAnswers.length).toBeGreaterThan(0);
    });
  });

  describe('🍎 macOS Browser Journeys', () => {
    it('🟢 macOS + Chrome User Journey', async () => {
      await journeyRunner.executeJourney(macChromeJourney);
      
      // Verify Mac + Chrome cross-platform setup
      const store = useAssessmentStore.getState();
      expect(store.deviceProfile?.currentDevice?.os).toBe('mac');
      expect(store.deviceProfile?.currentDevice?.browser).toBe('chrome');
      
      const answers = Object.keys(store.answers);
      const hasMacAnswers = answers.some(id => id.includes('mac') || id.includes('filevault'));
      const hasChromeAnswers = answers.some(id => id.includes('chrome'));
      expect(hasMacAnswers).toBe(true);
      expect(hasChromeAnswers).toBe(true);
    });

    it('🟦 macOS + Safari User Journey', async () => {
      await journeyRunner.executeJourney(macSafariJourney);
      
      // Verify Apple ecosystem integration
      const store = useAssessmentStore.getState();
      expect(store.deviceProfile?.currentDevice?.browser).toBe('safari');
      
      const appleAnswers = Object.keys(store.answers).filter(id =>
        id.includes('safari') || id.includes('icloud') || id.includes('apple') || id.includes('itp')
      );
      expect(appleAnswers.length).toBeGreaterThan(0);
    });

    it('🦊 macOS + Firefox User Journey', async () => {
      await journeyRunner.executeJourney(macFirefoxJourney);
      
      // Verify privacy-first approach over ecosystem integration
      const store = useAssessmentStore.getState();
      expect(store.deviceProfile?.currentDevice?.os).toBe('mac');
      expect(store.deviceProfile?.currentDevice?.browser).toBe('firefox');
      
      const privacyAnswers = Object.keys(store.answers).filter(id =>
        id.includes('privacy') || id.includes('tracking') || id.includes('firefox')
      );
      expect(privacyAnswers.length).toBeGreaterThan(0);
    });
  });

  describe('🔄 Cross-Platform Browser Comparison', () => {
    it('🦊 Firefox prioritizes privacy on both platforms', async () => {
      // Test Windows Firefox
      await journeyRunner.executeJourney(windowsFirefoxJourney);
      const windowsStore = useAssessmentStore.getState();
      
      // Test Mac Firefox (new runner creates fresh state)
      const macRunner = new JourneyTestRunner();
      render(<App />);
      await macRunner.executeJourney(macFirefoxJourney);
      const macStore = useAssessmentStore.getState();
      
      // Both should have privacy-focused answers
      const windowsPrivacy = Object.keys(windowsStore.answers).filter(id =>
        id.includes('tracking') || id.includes('privacy') || id.includes('firefox')
      );
      const macPrivacy = Object.keys(macStore.answers).filter(id =>
        id.includes('tracking') || id.includes('privacy') || id.includes('firefox')
      );
      
      expect(windowsPrivacy.length).toBeGreaterThan(0);
      expect(macPrivacy.length).toBeGreaterThan(0);
    });

    it('🟢 Chrome works consistently across platforms', async () => {
      // Test Windows Chrome
      await journeyRunner.executeJourney(windowsChromeJourney);
      const windowsStore = useAssessmentStore.getState();
      
      // Test Mac Chrome
      const macRunner = new JourneyTestRunner();
      render(<App />);
      await macRunner.executeJourney(macChromeJourney);
      const macStore = useAssessmentStore.getState();
      
      // Both should have Chrome-specific features
      expect(windowsStore.deviceProfile?.currentDevice?.browser).toBe('chrome');
      expect(macStore.deviceProfile?.currentDevice?.browser).toBe('chrome');
      
      const windowsChrome = Object.keys(windowsStore.answers).filter(id => id.includes('chrome'));
      const macChrome = Object.keys(macStore.answers).filter(id => id.includes('chrome'));
      
      expect(windowsChrome.length).toBeGreaterThan(0);
      expect(macChrome.length).toBeGreaterThan(0);
    });

    it('🏠 Native browsers integrate better with their OS', async () => {
      // Test Windows Edge (native)
      await journeyRunner.executeJourney(windowsEdgeJourney);
      const edgeStore = useAssessmentStore.getState();
      
      // Test Mac Safari (native)
      const safariRunner = new JourneyTestRunner();
      render(<App />);
      await safariRunner.executeJourney(macSafariJourney);
      const safariStore = useAssessmentStore.getState();
      
      // Edge should have Windows integration
      const edgeIntegration = Object.keys(edgeStore.answers).filter(id =>
        id.includes('edge') || id.includes('smartscreen') || id.includes('windows')
      );
      
      // Safari should have Apple ecosystem integration
      const safariIntegration = Object.keys(safariStore.answers).filter(id =>
        id.includes('safari') || id.includes('icloud') || id.includes('apple')
      );
      
      expect(edgeIntegration.length).toBeGreaterThan(0);
      expect(safariIntegration.length).toBeGreaterThan(0);
      
      // Native browser journeys should have higher scores due to integration
      expect(edgeStore.overallScore).toBeGreaterThan(10);
      expect(safariStore.overallScore).toBeGreaterThan(20);
    });
  });

  describe('🔐 Browser-Specific Security Features', () => {
    it('🔷 Edge SmartScreen and Windows Defender integration', async () => {
      await journeyRunner.executeJourney(windowsEdgeJourney);
      
      const store = useAssessmentStore.getState();
      const answers = store.answers;
      
      // Should have Microsoft security stack answers
      expect(answers).toHaveProperty('edge_smartscreen');
      expect(answers).toHaveProperty('edge_password_manager');
      expect(answers['edge_smartscreen']).toBe('yes');
    });

    it('🟦 Safari ITP and iCloud Keychain integration', async () => {
      await journeyRunner.executeJourney(macSafariJourney);
      
      const store = useAssessmentStore.getState();
      const answers = store.answers;
      
      // Should have Apple privacy and security features
      expect(answers).toHaveProperty('safari_itp');
      expect(answers).toHaveProperty('safari_icloud_keychain');
      expect(answers).toHaveProperty('apple_id_2fa');
      expect(answers['safari_itp']).toBe('yes');
    });

    it('🦊 Firefox Enhanced Tracking Protection on both platforms', async () => {
      // Test Windows Firefox
      await journeyRunner.executeJourney(windowsFirefoxJourney);
      const winAnswers = useAssessmentStore.getState().answers;
      
      // Test Mac Firefox
      const macRunner = new JourneyTestRunner();
      render(<App />);
      await macRunner.executeJourney(macFirefoxJourney);
      const macAnswers = useAssessmentStore.getState().answers;
      
      // Both should have strict tracking protection
      expect(winAnswers).toHaveProperty('firefox_tracking_protection');
      expect(macAnswers).toHaveProperty('firefox_tracking_protection');
      expect(winAnswers['firefox_tracking_protection']).toBe('strict');
      expect(macAnswers['firefox_tracking_protection']).toBe('strict');
    });
  });

  describe('📊 Journey Performance and Coverage', () => {
    it('⚡ All browser journeys complete successfully', async () => {
      // Execute all journeys sequentially to avoid state conflicts
      const journeyResults: string[] = [];
      
      for (const journey of BROWSER_SPECIFIC_JOURNEYS) {
        const runner = new JourneyTestRunner();
        render(<App />);
        
        try {
          await runner.executeJourney(journey);
          journeyResults.push(`✅ ${journey.name}`);
        } catch (error) {
          journeyResults.push(`❌ ${journey.name}: ${error}`);
          throw error; // Re-throw to fail the test
        }
      }
      
      // All journeys should succeed
      expect(journeyResults.length).toBe(6);
      console.log('Browser Journey Results:', journeyResults);
    });

    it('📋 Covers all requested browser combinations', () => {
      const journeyNames = BROWSER_SPECIFIC_JOURNEYS.map(j => j.name);
      
      // Windows coverage
      expect(journeyNames).toContain('Windows + Edge User Journey');
      expect(journeyNames).toContain('Windows + Firefox User Journey');
      expect(journeyNames).toContain('Windows + Chrome User Journey');
      
      // macOS coverage
      expect(journeyNames).toContain('macOS + Chrome User Journey');
      expect(journeyNames).toContain('macOS + Safari User Journey');
      expect(journeyNames).toContain('macOS + Firefox User Journey');
      
      // Total coverage
      expect(WINDOWS_BROWSER_JOURNEYS).toHaveLength(3);
      expect(MACOS_BROWSER_JOURNEYS).toHaveLength(3);
      expect(BROWSER_SPECIFIC_JOURNEYS).toHaveLength(6);
    });

    it('🎯 Provides comprehensive browser-specific question coverage', async () => {
      const allAnswers = new Set<string>();
      
      // Collect all questions asked across all browser journeys
      for (const journey of BROWSER_SPECIFIC_JOURNEYS) {
        const runner = new JourneyTestRunner();
        render(<App />);
        
        await runner.executeJourney(journey);
        
        const answers = Object.keys(useAssessmentStore.getState().answers);
        answers.forEach(answer => allAnswers.add(answer));
      }
      
      // Should cover browser detection questions
      expect(allAnswers.has('chrome_detection_confirm')).toBe(true);
      expect(allAnswers.has('firefox_detection_confirm')).toBe(true);
      expect(allAnswers.has('safari_detection_confirm')).toBe(true);
      expect(allAnswers.has('edge_detection_confirm')).toBe(true);
      
      // Should cover OS detection questions
      expect(allAnswers.has('windows_detection_confirm')).toBe(true);
      expect(allAnswers.has('mac_detection_confirm')).toBe(true);
      
      // Should cover browser-specific security features
      const browserSpecific = Array.from(allAnswers).filter(id =>
        id.includes('chrome_') || id.includes('firefox_') || 
        id.includes('safari_') || id.includes('edge_')
      );
      
      expect(browserSpecific.length).toBeGreaterThan(10);
      
      console.log(`Browser journeys cover ${allAnswers.size} unique questions`);
      console.log(`Browser-specific questions: ${browserSpecific.length}`);
    });
  });
});