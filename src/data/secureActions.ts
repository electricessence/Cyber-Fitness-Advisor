export interface SecureAction {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'medium' | 'advanced';
  timeEstimate: string;
  category: 'software' | 'settings' | 'behavior' | 'hardware';
  
  // Instead of external links, provide search guidance
  searchTerm: string;
  howToFind: string[];
  installSteps?: string[];
  
  // Conditions for when to recommend this action
  recommendWhen: {
    browsers?: string[];
    platforms?: string[];
    techComfort?: ('beginner' | 'comfortable' | 'advanced')[];
    concerns?: string[];
  };
}

export const SECURE_ACTIONS: SecureAction[] = [
  {
    id: 'ublock_origin',
    title: 'Install uBlock Origin Ad Blocker',
    description: 'Blocks malicious ads, trackers, and malware. One of the highest-impact security tools available.',
    impact: 'high',
    difficulty: 'easy',
    timeEstimate: '2 minutes',
    category: 'software',
    searchTerm: 'uBlock Origin browser extension',
    howToFind: [
      'Search "uBlock Origin" in your browser\'s extension/add-on store',
      'Look for the one by Raymond Hill (original developer)',
      'Verify it has millions of users and high ratings'
    ],
    installSteps: [
      'Open your browser\'s extension store (Chrome Web Store, Firefox Add-ons, etc.)',
      'Search for "uBlock Origin"',
      'Click "Add to Browser" or "Install"',
      'Look for the red shield icon in your toolbar'
    ],
    recommendWhen: {
      browsers: ['chrome', 'firefox', 'edge', 'safari'],
      techComfort: ['beginner', 'comfortable', 'advanced'],
      concerns: ['malware', 'privacy', 'browsing']
    }
  },
  
  {
    id: 'password_manager',
    title: 'Set Up a Password Manager',
    description: 'Generate and store unique passwords for all accounts. Prevents password reuse attacks.',
    impact: 'high',
    difficulty: 'easy',
    timeEstimate: '10 minutes',
    category: 'software',
    searchTerm: 'Bitwarden password manager',
    howToFind: [
      'Search "Bitwarden" (free, open-source option)',
      'Or "1Password" / "Dashlane" (paid options)',
      'Download from official website or app store'
    ],
    installSteps: [
      'Choose a reputable password manager',
      'Create an account with a strong master password',
      'Install browser extension and mobile app',
      'Import existing passwords or add them gradually'
    ],
    recommendWhen: {
      techComfort: ['beginner', 'comfortable', 'advanced'],
      concerns: ['passwords', 'accounts', 'data_breach']
    }
  },

  {
    id: 'two_factor_auth',
    title: 'Enable Two-Factor Authentication',
    description: 'Adds a second layer of security to your most important accounts.',
    impact: 'high',
    difficulty: 'medium',
    timeEstimate: '5 minutes per account',
    category: 'settings',
    searchTerm: 'how to enable two factor authentication',
    howToFind: [
      'Go to account security settings on each important service',
      'Look for "Two-Factor Authentication", "2FA", or "Multi-Factor Authentication"',
      'Choose app-based authentication over SMS when possible'
    ],
    installSteps: [
      'Download an authenticator app (Google Authenticator, Authy, etc.)',
      'Go to your account security settings',
      'Find and enable "Two-Factor Authentication"',
      'Scan the QR code with your authenticator app',
      'Save backup codes in a safe place'
    ],
    recommendWhen: {
      techComfort: ['comfortable', 'advanced'],
      concerns: ['accounts', 'email', 'banking', 'data_breach']
    }
  },

  {
    id: 'browser_security_settings',
    title: 'Configure Browser Security Settings',
    description: 'Tighten browser privacy and security settings to block trackers and malicious content.',
    impact: 'medium',
    difficulty: 'easy',
    timeEstimate: '5 minutes',
    category: 'settings',
    searchTerm: 'browser privacy security settings',
    howToFind: [
      'Look for "Settings" or "Preferences" in your browser menu',
      'Find "Privacy and Security" or similar section',
      'Review tracking, cookies, and security options'
    ],
    installSteps: [
      'Open browser settings/preferences',
      'Navigate to Privacy & Security section',
      'Enable "Do Not Track" requests',
      'Set cookies to block third-party trackers',
      'Consider enabling "Safe Browsing" features'
    ],
    recommendWhen: {
      browsers: ['chrome', 'firefox', 'edge', 'safari'],
      techComfort: ['beginner', 'comfortable', 'advanced'],
      concerns: ['privacy', 'browsing', 'tracking']
    }
  },

  {
    id: 'automatic_updates',
    title: 'Enable Automatic Updates',
    description: 'Keep your operating system and software automatically updated with security patches.',
    impact: 'high',
    difficulty: 'easy',
    timeEstimate: '3 minutes',
    category: 'settings',
    searchTerm: 'enable automatic updates',
    howToFind: [
      'Windows: Search "Windows Update" in Start menu',
      'Mac: Apple menu > System Preferences > Software Update',
      'Enable automatic downloads and installation of security updates'
    ],
    installSteps: [
      'Open system update settings',
      'Enable automatic download and installation',
      'Set to install security updates immediately',
      'Schedule regular restart times if needed'
    ],
    recommendWhen: {
      platforms: ['windows', 'mac', 'linux'],
      techComfort: ['beginner', 'comfortable', 'advanced'],
      concerns: ['malware', 'system_security']
    }
  },

  {
    id: 'secure_dns',
    title: 'Use Secure DNS',
    description: 'Switch to a privacy-focused DNS provider to block malicious sites and improve privacy.',
    impact: 'medium',
    difficulty: 'medium',
    timeEstimate: '5 minutes',
    category: 'settings',
    searchTerm: 'Cloudflare DNS 1.1.1.1 setup',
    howToFind: [
      'Search "how to change DNS settings" for your device',
      'Popular secure options: Cloudflare (1.1.1.1), Quad9 (9.9.9.9)',
      'Look in network settings or router configuration'
    ],
    installSteps: [
      'Open network/internet settings',
      'Find DNS settings (may be under advanced)',
      'Change DNS servers to 1.1.1.1 and 1.0.0.1 (Cloudflare)',
      'Or use 9.9.9.9 and 149.112.112.112 (Quad9)',
      'Save settings and restart browser to test'
    ],
    recommendWhen: {
      techComfort: ['comfortable', 'advanced'],
      concerns: ['privacy', 'malware', 'browsing']
    }
  }
];

// Smart recommendation engine
export function getRecommendedActions(
  browserInfo: {
    browser: string;
    platform: string;
  },
  userProfile: {
    techComfort: 'beginner' | 'comfortable' | 'advanced';
    mainConcerns: string[];
  },
  limit: number = 3
): SecureAction[] {
  return SECURE_ACTIONS
    .filter(action => {
      // Check if action matches user's context
      const { recommendWhen } = action;
      
      // Check browser compatibility
      if (recommendWhen.browsers && !recommendWhen.browsers.includes(browserInfo.browser)) {
        return false;
      }
      
      // Check platform compatibility  
      if (recommendWhen.platforms && !recommendWhen.platforms.includes(browserInfo.platform)) {
        return false;
      }
      
      // Check tech comfort level
      if (recommendWhen.techComfort && !recommendWhen.techComfort.includes(userProfile.techComfort)) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Prioritize by impact, then by difficulty (easier first), then by concern match
      const impactScore = { high: 3, medium: 2, low: 1 };
      const difficultyScore = { easy: 3, medium: 2, advanced: 1 };
      
      // Check if action addresses user's concerns
      const aConcernMatch = a.recommendWhen.concerns?.some(concern => 
        userProfile.mainConcerns.includes(concern)
      ) ? 1 : 0;
      
      const bConcernMatch = b.recommendWhen.concerns?.some(concern => 
        userProfile.mainConcerns.includes(concern)
      ) ? 1 : 0;
      
      // Sort by: concern match, impact, difficulty (easier first)
      if (aConcernMatch !== bConcernMatch) return bConcernMatch - aConcernMatch;
      if (impactScore[a.impact] !== impactScore[b.impact]) return impactScore[b.impact] - impactScore[a.impact];
      return difficultyScore[b.difficulty] - difficultyScore[a.difficulty];
    })
    .slice(0, limit);
}
