/**
 * Browser-Specific User Journeys
 * 
 * Comprehensive testing for different OS + Browser combinations
 * Covers the most common user environments with device-specific flows
 */

import { JourneyBuilder } from './journeyFramework';
import { useAssessmentStore } from '../features/assessment/state/store';
import { expect } from 'vitest';

/**
 * WINDOWS + EDGE JOURNEY
 * Tests Microsoft's native browser on Windows with Edge-specific security features
 */
export const windowsEdgeJourney = JourneyBuilder
  .create('Windows + Edge User Journey')
  .description('Windows user with Microsoft Edge browser completes security assessment with browser-specific recommendations')
  
  .step('Simulate Windows + Edge detection')
    .custom(() => {
      const store = useAssessmentStore.getState();
      // Inject detection facts that would normally happen at app startup
      store.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
      store.factsActions.injectFact('browser_detected', 'edge', { source: 'auto-detection' });
      store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
      store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
      
      // Create and set device profile
      const deviceProfile = {
        currentDevice: {
          type: 'desktop' as const,
          os: 'windows' as const,
          browser: 'edge' as const
        },
        otherDevices: {
          hasWindows: true,
          hasMac: false,
          hasLinux: false,
          hasIPhone: false,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'windows' as const,
        primaryMobile: undefined
      };
      store.setDeviceProfile(deviceProfile);
    })
    .then()
  
  .step('User acknowledges privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  
  .step('User confirms Windows detection')
    .answerQuestion('windows_detection_confirm', 'yes')
    .expectStoreState({ 
      answersCount: 2,
      hasAnswers: ['privacy_notice', 'windows_detection_confirm']
    })
    .then()
  
  .step('User confirms Edge browser detection')
    .answerQuestion('edge_detection_confirm', 'yes')
    .expectStoreState({ answersCount: 3 })
    .expectCustom(() => {
      const store = useAssessmentStore.getState();
      expect(store.deviceProfile?.currentDevice?.os).toBe('windows');
      expect(store.deviceProfile?.currentDevice?.browser).toBe('edge');
    })
    .then()
  
  .step('User enables Edge SmartScreen protection')
    .answerQuestion('edge_smartscreen', 'yes')
    .expectStoreState({ answersCount: 4 })
    .then()
  
  .step('User uses Edge password manager')
    .answerQuestion('edge_password_manager', 'yes')
    .expectStoreState({ answersCount: 5 })
    .then()
  
  .finalOutcome(
    'Windows + Edge user has Microsoft-ecosystem security setup',
    () => {
      const store = useAssessmentStore.getState();
      // Basic score validation - device detection doesn't generate high scores
      expect(store.overallScore).toBeGreaterThanOrEqual(0);
      expect(store.deviceProfile?.currentDevice?.os).toBe('windows');
      expect(store.deviceProfile?.currentDevice?.browser).toBe('edge');
      
      // Should have completed the device detection flow
      expect(store.answers['privacy_notice']).toBeDefined();
      expect(store.answers['windows_detection_confirm']).toBeDefined();
      expect(store.answers['edge_detection_confirm']).toBeDefined();
    }
  )
  .build();

/**
 * WINDOWS + FIREFOX JOURNEY
 * Tests privacy-focused browser on Windows with Firefox-specific security features
 */
export const windowsFirefoxJourney = JourneyBuilder
  .create('Windows + Firefox User Journey')
  .description('Windows user with Firefox browser focused on privacy and security features')
  
  .step('Simulate Windows + Firefox detection')
    .custom(() => {
      const store = useAssessmentStore.getState();
      // Inject detection facts that would normally happen at app startup
      store.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
      store.factsActions.injectFact('browser_detected', 'firefox', { source: 'auto-detection' });
      store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
      store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
      
      // Create and set device profile
      const deviceProfile = {
        currentDevice: {
          type: 'desktop' as const,
          os: 'windows' as const,
          browser: 'firefox' as const
        },
        otherDevices: {
          hasWindows: true,
          hasMac: false,
          hasLinux: false,
          hasIPhone: false,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'windows' as const,
        primaryMobile: undefined
      };
      store.setDeviceProfile(deviceProfile);
    })
    .then()
  
  .step('User acknowledges privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  
  .step('User confirms Windows detection')
    .answerQuestion('windows_detection_confirm', 'yes')
    .expectStoreState({ answersCount: 2 })
    .then()
  
  .step('User confirms Firefox browser detection')
    .answerQuestion('firefox_detection_confirm', 'yes')
    .expectStoreState({ 
      answersCount: 3,
      hasAnswers: ['privacy_notice', 'windows_detection_confirm', 'firefox_detection_confirm']
    })
    .then()
  
  .step('User configures Firefox tracking protection')
    .answerQuestion('firefox_tracking_protection', 'strict')
    .expectStoreState({ answersCount: 4 })
    .then()
  
  .step('User sets up Firefox privacy configuration')
    .answerQuestion('firefox_privacy_config', 'optimized')
    .expectStoreState({ answersCount: 5 })
    .then()
  
  .finalOutcome(
    'Windows + Firefox user has privacy-focused security setup',
    () => {
      const store = useAssessmentStore.getState();
      // Basic score validation - device detection doesn't generate high scores
      expect(store.overallScore).toBeGreaterThanOrEqual(0);
      expect(store.deviceProfile?.currentDevice?.browser).toBe('firefox');
      expect(store.deviceProfile?.currentDevice?.os).toBe('windows');
      
      // Should have completed the device detection flow
      expect(store.answers['privacy_notice']).toBeDefined();
      expect(store.answers['windows_detection_confirm']).toBeDefined();
      expect(store.answers['firefox_detection_confirm']).toBeDefined();
    }
  )
  .build();

/**
 * WINDOWS + CHROME JOURNEY
 * Tests Google's browser on Windows with Chrome-specific security features
 */
export const windowsChromeJourney = JourneyBuilder
  .create('Windows + Chrome User Journey')
  .description('Windows user with Google Chrome browser using Google ecosystem security')
  
  .step('Simulate Windows + Chrome detection')
    .custom(() => {
      const store = useAssessmentStore.getState();
      // Inject detection facts that would normally happen at app startup
      store.factsActions.injectFact('os_detected', 'windows', { source: 'auto-detection' });
      store.factsActions.injectFact('browser_detected', 'chrome', { source: 'auto-detection' });
      store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
      store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
      
      // Create and set device profile
      const deviceProfile = {
        currentDevice: {
          type: 'desktop' as const,
          os: 'windows' as const,
          browser: 'chrome' as const
        },
        otherDevices: {
          hasWindows: true,
          hasMac: false,
          hasLinux: false,
          hasIPhone: false,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'windows' as const,
        primaryMobile: undefined
      };
      store.setDeviceProfile(deviceProfile);
    })
    .then()
  
  .step('User acknowledges privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  
  .step('User confirms Windows detection')
    .answerQuestion('windows_detection_confirm', 'yes')
    .expectStoreState({ answersCount: 2 })
    .then()
  
  .step('User confirms Chrome browser detection')
    .answerQuestion('chrome_detection_confirm', 'yes')
    .expectStoreState({ answersCount: 3 })
    .then()
  
  .step('User configures Chrome privacy hardening')
    .answerQuestion('chrome_privacy_hardening', 'comprehensive')
    .expectStoreState({ answersCount: 4 })
    .then()
  
  .finalOutcome(
    'Windows + Chrome user has Google ecosystem security setup',
    () => {
      const store = useAssessmentStore.getState();
      // Basic score validation - device detection doesn't generate high scores
      expect(store.overallScore).toBeGreaterThanOrEqual(0);
      expect(store.deviceProfile?.currentDevice?.browser).toBe('chrome');
      expect(store.deviceProfile?.currentDevice?.os).toBe('windows');
      
      // Should have completed the device detection flow
      expect(store.answers['privacy_notice']).toBeDefined();
      expect(store.answers['windows_detection_confirm']).toBeDefined();
      expect(store.answers['chrome_detection_confirm']).toBeDefined();
    }
  )
  .build();

/**
 * MACOS + CHROME JOURNEY
 * Tests Chrome on macOS with cross-platform security considerations
 */
export const macChromeJourney = JourneyBuilder
  .create('macOS + Chrome User Journey')
  .description('Mac user with Chrome browser balancing Apple and Google security features')
  
  .step('Simulate macOS + Chrome detection')
    .custom(() => {
      const store = useAssessmentStore.getState();
      // Inject detection facts that would normally happen at app startup
      store.factsActions.injectFact('os_detected', 'mac', { source: 'auto-detection' });
      store.factsActions.injectFact('browser_detected', 'chrome', { source: 'auto-detection' });
      store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
      store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
      
      // Create and set device profile
      const deviceProfile = {
        currentDevice: {
          type: 'desktop' as const,
          os: 'mac' as const,
          browser: 'chrome' as const
        },
        otherDevices: {
          hasWindows: false,
          hasMac: true,
          hasLinux: false,
          hasIPhone: false,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'mac' as const,
        primaryMobile: undefined
      };
      store.setDeviceProfile(deviceProfile);
    })
    .then()
  
  .step('User acknowledges privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  
  .step('User confirms macOS detection')
    .answerQuestion('mac_detection_confirm', 'yes')
    .expectStoreState({ 
      answersCount: 2,
      hasAnswers: ['privacy_notice', 'mac_detection_confirm']
    })
    .then()
  
  .step('User confirms Chrome browser detection')
    .answerQuestion('chrome_detection_confirm', 'yes')
    .expectStoreState({ answersCount: 3 })
    .then()
  
  .step('User configures Chrome privacy hardening')
    .answerQuestion('chrome_privacy_hardening', 'comprehensive')
    .expectStoreState({ answersCount: 4 })
    .then()
  
  .finalOutcome(
    'Mac + Chrome user has cross-platform security setup',
    () => {
      const store = useAssessmentStore.getState();
      // Basic score validation - device detection doesn't generate high scores
      expect(store.overallScore).toBeGreaterThanOrEqual(0);
      expect(store.deviceProfile?.currentDevice?.os).toBe('mac');
      expect(store.deviceProfile?.currentDevice?.browser).toBe('chrome');
      
      // Should have completed the device detection flow
      expect(store.answers['privacy_notice']).toBeDefined();
      expect(store.answers['mac_detection_confirm']).toBeDefined();
      expect(store.answers['chrome_detection_confirm']).toBeDefined();
    }
  )
  .build();

/**
 * MACOS + SAFARI JOURNEY
 * Tests Apple's native browser on macOS with Apple ecosystem integration
 */
export const macSafariJourney = JourneyBuilder
  .create('macOS + Safari User Journey')
  .description('Mac user with Safari browser using full Apple ecosystem security')
  
  .step('Simulate macOS + Safari detection')
    .custom(() => {
      const store = useAssessmentStore.getState();
      // Inject detection facts that would normally happen at app startup
      store.factsActions.injectFact('os_detected', 'mac', { source: 'auto-detection' });
      store.factsActions.injectFact('browser_detected', 'safari', { source: 'auto-detection' });
      store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
      store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
      
      // Create and set device profile
      const deviceProfile = {
        currentDevice: {
          type: 'desktop' as const,
          os: 'mac' as const,
          browser: 'safari' as const
        },
        otherDevices: {
          hasWindows: false,
          hasMac: true,
          hasLinux: false,
          hasIPhone: false,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'mac' as const,
        primaryMobile: undefined
      };
      store.setDeviceProfile(deviceProfile);
    })
    .then()
  
  .step('User acknowledges privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  
  .step('User confirms macOS detection')
    .answerQuestion('mac_detection_confirm', 'yes')
    .expectStoreState({ answersCount: 2 })
    .then()
  
  .step('User confirms Safari browser detection')
    .answerQuestion('safari_detection_confirm', 'yes')
    .expectStoreState({ 
      answersCount: 3,
      hasAnswers: ['privacy_notice', 'mac_detection_confirm', 'safari_detection_confirm']
    })
    .then()
  
  .step('User enables Safari Intelligent Tracking Prevention')
    .answerQuestion('safari_itp', 'yes')
    .expectStoreState({ answersCount: 4 })
    .then()
  
  .step('User uses iCloud Keychain for passwords')
    .answerQuestion('safari_icloud_keychain', 'yes')
    .expectStoreState({ answersCount: 5 })
    .then()
  
  .step('User enables Apple ID 2FA')
    .answerQuestion('apple_id_2fa', 'yes')
    .expectStoreState({ answersCount: 6 })
    .then()
  
  .finalOutcome(
    'Mac + Safari user has integrated Apple ecosystem security',
    () => {
      const store = useAssessmentStore.getState();
      // Basic score validation - device detection doesn't generate high scores
      expect(store.overallScore).toBeGreaterThanOrEqual(0);
      expect(store.deviceProfile?.currentDevice?.browser).toBe('safari');
      expect(store.deviceProfile?.currentDevice?.os).toBe('mac');
      
      // Should have completed the device detection flow
      expect(store.answers['privacy_notice']).toBeDefined();
      expect(store.answers['mac_detection_confirm']).toBeDefined();
      expect(store.answers['safari_detection_confirm']).toBeDefined();
    }
  )
  .build();

/**
 * MACOS + FIREFOX JOURNEY
 * Tests privacy-focused browser on macOS with enhanced privacy features
 */
export const macFirefoxJourney = JourneyBuilder
  .create('macOS + Firefox User Journey')
  .description('Mac user with Firefox browser prioritizing privacy over ecosystem integration')
  
  .step('Simulate macOS + Firefox detection')
    .custom(() => {
      const store = useAssessmentStore.getState();
      // Inject detection facts that would normally happen at app startup
      store.factsActions.injectFact('os_detected', 'mac', { source: 'auto-detection' });
      store.factsActions.injectFact('browser_detected', 'firefox', { source: 'auto-detection' });
      store.factsActions.injectFact('device_type', 'desktop', { source: 'auto-detection' });
      store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
      
      // Create and set device profile
      const deviceProfile = {
        currentDevice: {
          type: 'desktop' as const,
          os: 'mac' as const,
          browser: 'firefox' as const
        },
        otherDevices: {
          hasWindows: false,
          hasMac: true,
          hasLinux: false,
          hasIPhone: false,
          hasAndroid: false,
          hasIPad: false
        },
        primaryDesktop: 'mac' as const,
        primaryMobile: undefined
      };
      store.setDeviceProfile(deviceProfile);
    })
    .then()
  
  .step('User acknowledges privacy notice')
    .answerQuestion('privacy_notice', 'understood')
    .expectStoreState({ answersCount: 1 })
    .then()
  
  .step('User confirms macOS detection')
    .answerQuestion('mac_detection_confirm', 'yes')
    .expectStoreState({ answersCount: 2 })
    .then()
  
  .step('User confirms Firefox browser detection')
    .answerQuestion('firefox_detection_confirm', 'yes')
    .expectStoreState({ answersCount: 3 })
    .then()
  
  .step('User configures Firefox tracking protection')
    .answerQuestion('firefox_tracking_protection', 'strict')
    .expectStoreState({ answersCount: 4 })
    .then()
  
  .step('User sets up Firefox privacy configuration')
    .answerQuestion('firefox_privacy_config', 'optimized')
    .expectStoreState({ answersCount: 5 })
    .then()
  
  .finalOutcome(
    'Mac + Firefox user has privacy-first security setup',
    () => {
      const store = useAssessmentStore.getState();
      // Basic score validation - device detection doesn't generate high scores
      expect(store.overallScore).toBeGreaterThanOrEqual(0);
      expect(store.deviceProfile?.currentDevice?.os).toBe('mac');
      expect(store.deviceProfile?.currentDevice?.browser).toBe('firefox');
      
      // Should have completed the device detection flow
      expect(store.answers['privacy_notice']).toBeDefined();
      expect(store.answers['mac_detection_confirm']).toBeDefined();
      expect(store.answers['firefox_detection_confirm']).toBeDefined();
    }
  )
  .build();

// Export all browser-specific journeys
export const BROWSER_SPECIFIC_JOURNEYS = [
  windowsEdgeJourney,
  windowsFirefoxJourney,
  windowsChromeJourney,
  macChromeJourney,
  macSafariJourney,
  macFirefoxJourney
] as const;

// Export by platform for easy organization
export const WINDOWS_BROWSER_JOURNEYS = [
  windowsEdgeJourney,
  windowsFirefoxJourney,
  windowsChromeJourney
] as const;

export const MACOS_BROWSER_JOURNEYS = [
  macChromeJourney,
  macSafariJourney,
  macFirefoxJourney
] as const;