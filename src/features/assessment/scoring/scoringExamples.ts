/**
 * Security Score Calculator - Demonstration of the point system
 * Shows how different user profiles achieve different security levels
 */

// Sample user answers to demonstrate scoring
const userProfiles = {
  beginner: {
    // Foundation Level (65/100 points)
    password_manager_yn: false, // 0 points
    email_2fa_yn: true, // 20 points  
    password_reuse_scale: "few_different", // 5 points
    software_updates_action: "will_enable_auto", // 20 points
    phishing_awareness_scale: "somewhat_aware", // 8 points
    
    // Skip device security questions
    totalPoints: 53,
    securityLevel: "Getting Started",
    message: "Building basic security awareness - great start!"
  },
  
  intermediate: {
    // Foundation Level (85/100 points)
    password_manager_yn: true, // 25 points
    email_2fa_yn: true, // 20 points
    password_reuse_scale: "mostly_unique", // 15 points  
    software_updates_action: "auto_enabled", // 20 points
    phishing_awareness_scale: "moderately_confident", // 15 points
    
    // Device Security (55/105 points)
    antivirus_protection: true, // 25 points
    device_encryption: "will_encrypt", // 35 points  
    screen_lock_timeout: "medium_timeout", // 10 points
    browser_security_review: "basic_improvements", // 20 points
    
    totalPoints: 140, 
    securityLevel: "Security Aware",
    message: "Solid foundation with good device protection"
  },
  
  advanced: {
    // Foundation Level (100/100 points)
    password_manager_yn: true, // 25 points
    email_2fa_yn: true, // 20 points
    password_reuse_scale: "all_unique", // 20 points
    software_updates_action: "auto_enabled", // 20 points  
    phishing_awareness_scale: "very_confident", // 20 points
    
    // Device Security (105/105 points)
    antivirus_protection: true, // 25 points
    device_encryption: "already_encrypted", // 35 points
    screen_lock_timeout: "quick_timeout", // 15 points
    browser_security_review: "already_secured", // 30 points
    
    // Network & Privacy (110/110 points)
    home_wifi_security: true, // 25 points
    public_wifi_caution: "vpn_protected", // 20 points
    data_backup_setup: "encrypted_automated", // 40 points
    social_media_privacy: "already_private", // 25 points
    
    totalPoints: 315,
    securityLevel: "Well Protected", 
    message: "Comprehensive security practices across all areas"
  },
  
  expert: {
    // All previous + expert practices
    totalPoints: 850,
    securityLevel: "Security Expert",
    message: "You're in the top 5% of security-conscious users!"
  }
};

// Security level thresholds
const securityLevels = [
  { min: 0, max: 199, level: "Getting Started", color: "#gray-500" },
  { min: 200, max: 399, level: "Security Aware", color: "#blue-500" }, 
  { min: 400, max: 599, level: "Well Protected", color: "#green-500" },
  { min: 600, max: 799, level: "Security Savvy", color: "#purple-500" },
  { min: 800, max: 1000, level: "Security Expert", color: "#gold-500" }
];

// Point distribution analysis
const pointAnalysis = {
  foundationSecurity: {
    category: "Security Foundations", 
    maxPoints: 110,
    questions: 5,
    avgPointsPerQuestion: 22,
    description: "Essential security practices everyone should have"
  },
  deviceProtection: {
    category: "Device Protection",
    maxPoints: 105, 
    questions: 4,
    avgPointsPerQuestion: 26,
    description: "Platform-specific security configurations"
  },
  networkPrivacy: {
    category: "Network & Privacy",
    maxPoints: 110,
    questions: 4, 
    avgPointsPerQuestion: 27,
    description: "Communication and data protection"
  },
  advancedSecurity: {
    category: "Advanced Security",
    maxPoints: 675, // Remaining points for expert features
    description: "Professional-grade security measures"
  }
};

// Gamification elements
const achievements = {
  quickWinStreak: "Complete 5 quick wins in a row",
  passwordPro: "Max out all password-related questions",
  deviceDefender: "Complete all device security measures", 
  privacyGuardian: "Achieve maximum privacy protection",
  securityMentor: "Reach Security Expert level"
};

// User journey progression
const progressionPath = [
  {
    stage: "Onboarding",
    points: "0-50", 
    focus: "Device detection + 3-5 foundation questions",
    timeEstimate: "5 minutes"
  },
  {
    stage: "Quick Wins",
    points: "50-150",
    focus: "High-impact, easy actions first", 
    timeEstimate: "15-30 minutes"
  },
  {
    stage: "Building Protection",
    points: "150-400",
    focus: "Device-specific security measures",
    timeEstimate: "1-2 hours over time"
  },
  {
    stage: "Comprehensive Security", 
    points: "400-600",
    focus: "Network, privacy, and data protection",
    timeEstimate: "2-4 hours over time"
  },
  {
    stage: "Expert Practices",
    points: "600-1000", 
    focus: "Advanced security for serious users",
    timeEstimate: "Ongoing learning and implementation"
  }
];

export {
  userProfiles,
  securityLevels, 
  pointAnalysis,
  achievements,
  progressionPath
};
