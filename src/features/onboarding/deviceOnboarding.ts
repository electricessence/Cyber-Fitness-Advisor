import type { DeviceProfile } from '../assessment/engine/deviceScenarios';
import { detectCurrentDevice, getDeviceAssumptions } from '../assessment/engine/deviceScenarios';

export interface DeviceOnboardingQuestion {
  id: string;
  text: string;
  context: string;
  type: 'confirmation' | 'selection' | 'multi-select';
  options: {
    value: string;
    text: string;
    description?: string;
  }[];
  skipIf?: (profile: Partial<DeviceProfile>) => boolean;
}

/**
 * Device-focused onboarding questions (no points, just device profiling)
 */
export const DEVICE_ONBOARDING_QUESTIONS: DeviceOnboardingQuestion[] = [
  {
    id: 'current_device_confirmation',
    text: 'I detected you\'re using a {{deviceType}} device running {{os}}. Is that correct?',
    context: 'This helps us show you relevant security advice for your specific device.',
    type: 'confirmation',
    options: [
      { value: 'yes', text: '✅ Yes, that\'s correct' },
      { value: 'no', text: '❌ No, let me specify' }
    ]
  },
  {
    id: 'primary_desktop',
    text: 'What\'s your primary desktop/laptop computer?',
    context: 'Desktop computers have different security considerations than mobile devices.',
    type: 'selection',
    options: [
      { value: 'windows', text: '🪟 Windows PC', description: 'Windows 10, 11, or earlier' },
      { value: 'mac', text: '🍎 Mac (macOS)', description: 'MacBook, iMac, Mac Mini, etc.' },
      { value: 'linux', text: '🐧 Linux', description: 'Ubuntu, Fedora, or other Linux distribution' },
      { value: 'chromebook', text: '📚 Chromebook', description: 'Chrome OS device' },
      { value: 'none', text: '📱 Mobile only', description: 'I don\'t use a desktop/laptop' }
    ],
    skipIf: (profile) => profile.currentDevice?.type !== 'mobile'
  },
  {
    id: 'primary_mobile',
    text: 'What type of mobile device do you primarily use?',
    context: 'Mobile devices have unique security features and vulnerabilities.',
    type: 'selection',
    options: [
      { value: 'iphone', text: '📱 iPhone', description: 'Any iPhone model' },
      { value: 'android', text: '🤖 Android phone', description: 'Samsung, Google Pixel, etc.' },
      { value: 'other_smartphone', text: '� Other smartphone', description: 'BlackBerry, Windows Phone, etc.' },
      { value: 'basic_phone', text: '� Basic/flip phone', description: 'Calls and texts only' },
      { value: 'no_mobile', text: '❌ I don\'t have a mobile device', description: 'No phone or mobile device' }
    ],
    skipIf: (profile) => profile.currentDevice?.type === 'mobile'
  },
  {
    id: 'other_devices',
    text: 'Which other devices do you regularly use? (Select all that apply)',
    context: 'We\'ll include security advice for all your devices.',
    type: 'multi-select',
    options: [
      { value: 'work_windows', text: '💼 Work Windows PC', description: 'Company or work computer' },
      { value: 'work_mac', text: '💼 Work Mac', description: 'Company MacBook/iMac' },
      { value: 'family_shared', text: '👨‍👩‍👧‍👦 Family shared computer', description: 'Used by multiple family members' },
      { value: 'gaming_pc', text: '🎮 Gaming PC', description: 'Dedicated gaming computer' },
      { value: 'smart_tv', text: '📺 Smart TV', description: 'Internet-connected TV' },
      { value: 'none', text: '➖ None of the above' }
    ]
  },
  {
    id: 'tech_comfort',
    text: 'How comfortable are you with technology settings?',
    context: 'This helps us give you appropriately detailed instructions.',
    type: 'selection',
    options: [
      { value: 'expert', text: '🧠 Very comfortable', description: 'I can handle technical instructions' },
      { value: 'intermediate', text: '⚡ Somewhat comfortable', description: 'I can follow detailed step-by-step guides' },
      { value: 'beginner', text: '🌱 Not very comfortable', description: 'I prefer simple, visual instructions' },
      { value: 'cautious', text: '⚠️ Cautious', description: 'I want to understand before I change anything' }
    ]
  }
];

/**
 * Process device onboarding answers to create device profile
 */
export function processDeviceOnboarding(answers: Record<string, string | string[]>): DeviceProfile {
  const currentDevice = detectCurrentDevice();
  const assumptions = getDeviceAssumptions(currentDevice);
  
  // Start with detected device and assumptions
  const profile: DeviceProfile = {
    currentDevice,
    otherDevices: {
      hasWindows: false,
      hasMac: false,
      hasLinux: false,
      hasIPhone: false,
      hasAndroid: false,
      hasIPad: false,
      ...assumptions
    }
  };
  
  // Process primary desktop answer
  if (answers.primary_desktop) {
    switch (answers.primary_desktop) {
      case 'windows':
        profile.otherDevices.hasWindows = true;
        profile.primaryDesktop = 'windows';
        break;
      case 'mac':
        profile.otherDevices.hasMac = true;
        profile.primaryDesktop = 'mac';
        break;
      case 'linux':
        profile.otherDevices.hasLinux = true;
        profile.primaryDesktop = 'linux';
        break;
      case 'none':
        profile.primaryDesktop = 'none';
        break;
    }
  }
  
  // Process primary mobile answer
  if (answers.primary_mobile) {
    switch (answers.primary_mobile) {
      case 'iphone':
        profile.otherDevices.hasIPhone = true;
        profile.primaryMobile = 'ios';
        break;
      case 'android':
        profile.otherDevices.hasAndroid = true;
        profile.primaryMobile = 'android';
        break;
      case 'ipad':
        profile.otherDevices.hasIPad = true;
        profile.primaryMobile = 'ios';
        break;
      case 'android_tablet':
        profile.otherDevices.hasAndroid = true;
        profile.primaryMobile = 'android';
        break;
      case 'none':
        profile.primaryMobile = 'none';
        break;
    }
  }
  
  // Process other devices (multi-select)
  if (answers.other_devices && Array.isArray(answers.other_devices)) {
    for (const device of answers.other_devices) {
      switch (device) {
        case 'work_windows':
          profile.otherDevices.hasWindows = true;
          break;
        case 'work_mac':
          profile.otherDevices.hasMac = true;
          break;
        // Add more as needed
      }
    }
  }
  
  return profile;
}

/**
 * Generate personalized welcome message based on device profile
 */
export function generateWelcomeMessage(profile: DeviceProfile): string {
  const deviceCount = Object.values(profile.otherDevices).filter(Boolean).length;
  const currentDeviceText = `${profile.currentDevice.os} ${profile.currentDevice.type}`;
  
  if (deviceCount === 0) {
    return `Great! I'll focus on securing your ${currentDeviceText}.`;
  } else if (deviceCount === 1) {
    return `Perfect! I'll help secure your ${currentDeviceText} and your other device.`;
  } else {
    return `Excellent! I'll help secure your ${currentDeviceText} and your ${deviceCount} other devices.`;
  }
}
