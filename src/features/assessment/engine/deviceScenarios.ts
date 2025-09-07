export interface DeviceProfile {
  currentDevice: {
    type: 'desktop' | 'mobile' | 'tablet';
    os: 'windows' | 'mac' | 'linux' | 'ios' | 'android' | 'unknown';
    browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
  };
  otherDevices: {
    hasWindows: boolean;
    hasMac: boolean;
    hasLinux: boolean;
    hasIPhone: boolean;
    hasAndroid: boolean;
    hasIPad: boolean;
  };
  primaryDesktop?: 'windows' | 'mac' | 'linux' | 'none';
  primaryMobile?: 'ios' | 'android' | 'none';
}

export interface DeviceScenario {
  id: string;
  name: string;
  description: string;
  appliesToDevices: string[]; // OS identifiers
  questionDomains: string[]; // Which question domains to include
}

/**
 * Detect current device information from user agent
 */
export function detectCurrentDevice(): DeviceProfile['currentDevice'] {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detect OS
  let os: DeviceProfile['currentDevice']['os'] = 'unknown';
  if (userAgent.includes('windows') || userAgent.includes('win32') || userAgent.includes('win64')) {
    os = 'windows';
  } else if (userAgent.includes('macintosh') || userAgent.includes('mac os')) {
    os = 'mac';
  } else if (userAgent.includes('linux') && !userAgent.includes('android')) {
    os = 'linux';
  } else if (userAgent.includes('iphone') || userAgent.includes('ipad')) {
    os = 'ios';
  } else if (userAgent.includes('android')) {
    os = 'android';
  }
  
  // Detect device type
  let type: DeviceProfile['currentDevice']['type'] = 'desktop';
  if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
    type = 'mobile';
  } else if (userAgent.includes('ipad') || userAgent.includes('tablet')) {
    type = 'tablet';
  }
  
  // Detect browser
  let browser: DeviceProfile['currentDevice']['browser'] = 'unknown';
  if (userAgent.includes('chrome') && !userAgent.includes('edg') && !userAgent.includes('opr')) {
    browser = 'chrome';
  } else if (userAgent.includes('firefox')) {
    browser = 'firefox';
  } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    browser = 'safari';
  } else if (userAgent.includes('edg')) {
    browser = 'edge';
  }
  
  return { type, os, browser };
}

/**
 * Get device-specific scenarios that apply to a user's device profile
 */
export function getApplicableScenarios(profile: DeviceProfile): DeviceScenario[] {
  const scenarios: DeviceScenario[] = [];
  
  // Windows Desktop Scenario
  if (profile.currentDevice.os === 'windows' || profile.otherDevices.hasWindows) {
    scenarios.push({
      id: 'windows_desktop',
      name: 'Windows Desktop/Laptop Security',
      description: 'Windows-specific security settings and protections',
      appliesToDevices: ['windows'],
      questionDomains: ['windows_updates', 'windows_defender', 'windows_firewall', 'windows_user_account', 'bitlocker']
    });
  }
  
  // Mac Desktop Scenario
  if (profile.currentDevice.os === 'mac' || profile.otherDevices.hasMac) {
    scenarios.push({
      id: 'mac_desktop',
      name: 'Mac Desktop/Laptop Security',
      description: 'macOS-specific security settings and protections',
      appliesToDevices: ['mac'],
      questionDomains: ['macos_updates', 'macos_firewall', 'macos_gatekeeper', 'filevault', 'xprotect']
    });
  }
  
  // iPhone/iPad Scenario
  if (profile.currentDevice.os === 'ios' || profile.otherDevices.hasIPhone || profile.otherDevices.hasIPad) {
    scenarios.push({
      id: 'ios_mobile',
      name: 'iPhone/iPad Security',
      description: 'iOS-specific security settings and app protections',
      appliesToDevices: ['ios'],
      questionDomains: ['ios_updates', 'ios_passcode', 'ios_face_touch_id', 'ios_app_permissions', 'ios_find_my']
    });
  }
  
  // Android Scenario
  if (profile.currentDevice.os === 'android' || profile.otherDevices.hasAndroid) {
    scenarios.push({
      id: 'android_mobile',
      name: 'Android Phone/Tablet Security',
      description: 'Android-specific security settings and app protections',
      appliesToDevices: ['android'],
      questionDomains: ['android_updates', 'android_screen_lock', 'android_google_play', 'android_app_permissions', 'android_find_device']
    });
  }
  
  // Universal Cross-Platform Scenarios (always apply)
  scenarios.push({
    id: 'email_security',
    name: 'Email & Account Security',
    description: 'Email security, 2FA, and account protection (all platforms)',
    appliesToDevices: ['all'],
    questionDomains: ['email_security', 'two_factor_auth', 'password_managers', 'account_recovery']
  });
  
  scenarios.push({
    id: 'web_browsing',
    name: 'Web Browsing Security', 
    description: 'Browser security settings and safe browsing practices',
    appliesToDevices: ['all'],
    questionDomains: ['browser_security', 'privacy_settings', 'ad_blockers', 'secure_dns']
  });
  
  return scenarios;
}

/**
 * Get default other device assumptions based on current device
 */
export function getDeviceAssumptions(currentDevice: DeviceProfile['currentDevice']): Partial<DeviceProfile['otherDevices']> {
  const assumptions: Partial<DeviceProfile['otherDevices']> = {};
  
  // If on iPhone/iPad, assume they likely have a Mac desktop
  if (currentDevice.os === 'ios') {
    assumptions.hasMac = true;
  }
  
  // If on Android, no strong desktop assumption
  if (currentDevice.os === 'android') {
    // No strong assumptions - could be Windows, Mac, or Linux
  }
  
  // If on Mac, assume they might have iPhone
  if (currentDevice.os === 'mac') {
    assumptions.hasIPhone = true;
  }
  
  // If on Windows, no strong mobile assumption
  if (currentDevice.os === 'windows') {
    // Could have iPhone or Android
  }
  
  return assumptions;
}
