/**
 * Advanced Decision Tree Question System
 * Handles complex branching logic for browser and password management choices
 */

export interface DecisionPath {
  id: string;
  title: string;
  description: string;
  maxPossiblePoints: number;
  difficultyLevel: 'easy' | 'moderate' | 'advanced' | 'expert';
  tradeoffs: {
    convenience: number; // 1-5 scale
    security: number;    // 1-5 scale  
    privacy: number;     // 1-5 scale
    learnCurve: number;  // 1-5 scale
  };
  followUpQuestions: string[]; // Question IDs that unlock after this path
}

const BROWSER_DECISION_PATHS: Record<string, DecisionPath> = {
  minimal_change: {
    id: 'minimal_change',
    title: 'Optimize Current Browser',
    description: 'Keep your familiar browser but make it significantly more secure',
    maxPossiblePoints: 85,
    difficultyLevel: 'easy',
    tradeoffs: {
      convenience: 5,
      security: 3,
      privacy: 2,
      learnCurve: 1
    },
    followUpQuestions: ['current_browser_lockdown', 'basic_password_setup']
  },
  
  moderate_change: {
    id: 'moderate_change', 
    title: 'Switch to Privacy-Friendly Browser',
    description: 'Move to Firefox or similar for better privacy with minimal disruption',
    maxPossiblePoints: 150,
    difficultyLevel: 'moderate',
    tradeoffs: {
      convenience: 4,
      security: 4,
      privacy: 4,
      learnCurve: 2
    },
    followUpQuestions: ['firefox_setup', 'cloud_password_manager']
  },
  
  significant_change: {
    id: 'significant_change',
    title: 'Privacy-First Browser Setup', 
    description: 'Use expert-recommended browsers like LibreWolf or Brave',
    maxPossiblePoints: 220,
    difficultyLevel: 'advanced',
    tradeoffs: {
      convenience: 3,
      security: 5,
      privacy: 5,
      learnCurve: 3
    },
    followUpQuestions: ['privacy_browser_selection', 'advanced_password_management']
  },
  
  maximum_security: {
    id: 'maximum_security',
    title: 'Expert Security Configuration',
    description: 'Maximum security setup with local-only tools and advanced practices',
    maxPossiblePoints: 300,
    difficultyLevel: 'expert',
    tradeoffs: {
      convenience: 2,
      security: 5, 
      privacy: 5,
      learnCurve: 5
    },
    followUpQuestions: ['expert_browser_hardening', 'local_password_management', 'advanced_opsec']
  }
};

/**
 * Generate follow-up questions based on user's chosen path
 */
function getFollowUpQuestions(
  chosenPath: string,
  currentBrowser: string,
  _userAnswers: Record<string, any>
): string[] {
  const path = BROWSER_DECISION_PATHS[chosenPath];
  if (!path) return [];
  
  // Base follow-up questions
  let questions = [...path.followUpQuestions];
  
  // Add browser-specific questions
  if (chosenPath === 'minimal_change') {
    questions.push(`${currentBrowser}_privacy_lockdown`);
    questions.push('browser_master_password');
  }
  
  if (chosenPath === 'moderate_change') {
    questions.push('firefox_migration_help');
    questions.push('sync_setup_secure');
  }
  
  if (chosenPath === 'significant_change') {
    questions.push('privacytools_browser_comparison');
    questions.push('local_vs_cloud_passwords');
  }
  
  return questions;
}

/**
 * Calculate dynamic point values based on path difficulty
 */
function calculatePathPoints(
  basePath: string,
  specificAction: string,
  _userWillingness: string
): number {
  const path = BROWSER_DECISION_PATHS[basePath];
  if (!path) return 0;
  
  // Base points from path difficulty
  const basePoints = {
    'minimal_change': 15,
    'moderate_change': 25,
    'significant_change': 35,
    'maximum_security': 50
  }[basePath] || 15;
  
  // Bonus for more challenging actions within path
  const actionMultiplier = {
    'basic_improvement': 1.0,
    'significant_improvement': 1.5,
    'expert_configuration': 2.0
  }[specificAction] || 1.0;
  
  return Math.round(basePoints * actionMultiplier);
}

/**
 * Educational content for different browser choices
 */
const BROWSER_EDUCATION = {
  chrome_limitations: {
    title: "Why Chrome Has Privacy Limitations",
    summary: "Google's business model relies on data collection for advertising",
    keyPoints: [
      "Chrome sends browsing data to Google by default",
      "Google's advertising business creates privacy conflicts",
      "Manifest V3 limits ad blocker effectiveness",
      "Privacy settings are complex and often reset"
    ],
    improvements: [
      "You can still improve Chrome's privacy significantly",
      "Settings changes and extensions help a lot", 
      "Just understand the fundamental limitations"
    ]
  },
  
  firefox_advantages: {
    title: "Why Firefox Is Privacy-Friendly",
    summary: "Mozilla is a non-profit focused on user rights and privacy",
    keyPoints: [
      "Mozilla doesn't have an advertising business model",
      "Firefox blocks trackers by default",
      "Strong commitment to user privacy in their mission",
      "Extensive privacy controls and transparency"
    ],
    migrations: [
      "Import bookmarks and passwords automatically",
      "Similar interface to Chrome - easy transition",
      "Container tabs for advanced privacy"
    ]
  },
  
  librewolf_details: {
    title: "LibreWolf: Maximum Privacy Firefox",
    summary: "Firefox with all privacy/security features pre-configured",
    keyPoints: [
      "No telemetry or data collection whatsoever",
      "Enhanced security settings out of the box",
      "Regular security updates from Firefox base",
      "Recommended by privacy experts and PrivacyTools.io"
    ],
    tradeoffs: [
      "No cloud sync (local-only by design)",
      "Some websites may break due to strict settings",
      "Requires manual management of bookmarks/passwords"
    ]
  }
};

/**
 * Password manager decision matrix
 */
const PASSWORD_MANAGER_MATRIX = {
  browser_integrated: {
    browsers: {
      chrome: {
        security: 2,
        privacy: 1, 
        convenience: 4,
        recommendation: "Better than nothing, but consider alternatives"
      },
      firefox: {
        security: 4,
        privacy: 4,
        convenience: 4,
        recommendation: "Good option if staying with Firefox"
      },
      edge: {
        security: 3,
        privacy: 2,
        convenience: 4,
        recommendation: "Decent but ties you to Microsoft ecosystem"
      }
    }
  },
  
  cloud_services: {
    bitwarden: {
      security: 5,
      privacy: 5,
      convenience: 5,
      cost: 'free_tier_available',
      recommendation: "Excellent all-around choice, open source"
    },
    onepassword: {
      security: 5,
      privacy: 4,
      convenience: 5,
      cost: 'premium_only',
      recommendation: "Premium option with excellent UX"
    }
  },
  
  local_solutions: {
    keepass: {
      security: 5,
      privacy: 5,
      convenience: 2,
      cost: 'free',
      recommendation: "Maximum security for technical users"
    }
  }
};

export {
  BROWSER_DECISION_PATHS,
  getFollowUpQuestions,
  calculatePathPoints,
  BROWSER_EDUCATION,
  PASSWORD_MANAGER_MATRIX
};
