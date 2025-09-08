/**
 * Unified Device Detection System
 * Consolidates all device detection logic into one place
 */

export interface DetectedDevice {
  type: 'desktop' | 'mobile' | 'tablet';
  os: 'windows' | 'mac' | 'linux' | 'ios' | 'android' | 'unknown';
  browser: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown';
}

export interface DeviceCapabilities {
  supportsWebAuthn: boolean;
  hasPasswordManager: boolean;
  canInstallApps: boolean;
  supportsBiometrics: boolean;
}

/**
 * Detect current device from user agent
 */
export function detectCurrentDevice(): DetectedDevice {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Detect OS
  let os: DetectedDevice['os'] = 'unknown';
  if (userAgent.includes('win')) os = 'windows';
  else if (userAgent.includes('mac') && !userAgent.includes('iphone') && !userAgent.includes('ipad')) os = 'mac';
  else if (userAgent.includes('linux') && !userAgent.includes('android')) os = 'linux';
  else if (userAgent.includes('android')) os = 'android';
  else if (userAgent.includes('iphone') || userAgent.includes('ipad')) os = 'ios';
  
  // Detect device type
  let type: DetectedDevice['type'] = 'desktop';
  if (userAgent.includes('mobile') || userAgent.includes('iphone')) type = 'mobile';
  else if (userAgent.includes('tablet') || userAgent.includes('ipad')) type = 'tablet';
  
  // Detect browser
  let browser: DetectedDevice['browser'] = 'unknown';
  if (userAgent.includes('chrome') && !userAgent.includes('edg')) browser = 'chrome';
  else if (userAgent.includes('firefox')) browser = 'firefox';
  else if (userAgent.includes('safari') && !userAgent.includes('chrome')) browser = 'safari';
  else if (userAgent.includes('edg')) browser = 'edge';
  
  return { type, os, browser };
}

/**
 * Get device capabilities for security recommendations
 */
export function getDeviceCapabilities(device: DetectedDevice): DeviceCapabilities {
  return {
    supportsWebAuthn: 
      (device.browser === 'chrome' || device.browser === 'firefox' || device.browser === 'edge') &&
      (device.os === 'windows' || device.os === 'mac' || device.os === 'android' || device.os === 'ios'),
    
    hasPasswordManager: 
      device.browser === 'chrome' || device.browser === 'safari' || device.browser === 'edge',
    
    canInstallApps: 
      device.os === 'windows' || device.os === 'mac' || device.os === 'linux' || 
      device.os === 'ios' || device.os === 'android',
    
    supportsBiometrics: 
      device.os === 'ios' || device.os === 'android' || 
      (device.os === 'windows' && device.type === 'desktop')
  };
}

/**
 * Generate human-readable device description
 */
export function getDeviceDescription(device: DetectedDevice): string {
  const osName = {
    windows: 'Windows',
    mac: 'macOS', 
    linux: 'Linux',
    ios: 'iOS',
    android: 'Android',
    unknown: 'Unknown OS'
  }[device.os];
  
  const browserName = {
    chrome: 'Chrome',
    firefox: 'Firefox', 
    safari: 'Safari',
    edge: 'Edge',
    unknown: 'Unknown Browser'
  }[device.browser];
  
  const deviceType = {
    desktop: device.os === 'mac' ? 'Mac' : device.os === 'windows' ? 'PC' : 'computer',
    mobile: 'phone',
    tablet: 'tablet'
  }[device.type];
  
  return `${osName} ${deviceType} using ${browserName}`;
}

/**
 * Generate OS and device type description (without browser)
 */
export function getOSDescription(device: DetectedDevice): string {
  const osName = {
    windows: 'Windows',
    mac: 'macOS', 
    linux: 'Linux',
    ios: 'iOS',
    android: 'Android',
    unknown: 'Unknown OS'
  }[device.os];
  
  const deviceType = {
    desktop: device.os === 'mac' ? 'Mac' : device.os === 'windows' ? 'PC' : 'computer',
    mobile: 'phone',
    tablet: 'tablet'
  }[device.type];
  
  return `${osName} ${deviceType}`;
}

/**
 * Check if device needs specific security recommendations
 */
export function getSecurityPriorities(device: DetectedDevice): {
  updates: 'critical' | 'important' | 'standard';
  antivirus: 'required' | 'recommended' | 'optional';
  firewall: 'critical' | 'important' | 'builtin';
  encryption: 'required' | 'recommended' | 'advanced';
} {
  const isWindows = device.os === 'windows';
  const isMobile = device.type === 'mobile';
  
  return {
    updates: isWindows ? 'critical' : 'important',
    antivirus: isWindows ? 'required' : isMobile ? 'optional' : 'recommended', 
    firewall: isWindows ? 'critical' : 'builtin',
    encryption: isWindows ? 'recommended' : device.os === 'mac' ? 'recommended' : 'advanced'
  };
}
