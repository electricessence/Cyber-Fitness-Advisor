/**
 * Shared test helpers for journey definitions.
 *
 * Centralises common setup patterns so individual journey files
 * don't duplicate boilerplate.
 */

import { useAssessmentStore } from '../features/assessment/state/store';

/**
 * Inject device-detection facts and DeviceProfile into the store.
 *
 * Used by journey definitions to simulate auto-detection before
 * the user answers any questions.
 */
export function injectDevice(
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
      // journey definitions parameterise the OS/browser dynamically.
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
