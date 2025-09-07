import type { QuestionBank, Question, Domain } from '../assessment/engine/schema';
import type { DeviceProfile } from '../assessment/engine/deviceScenarios';
import { loadDeviceSpecificQuestions } from '../assessment/data/deviceQuestionLoader';
import universalQuestionsData from '../assessment/data/questions.json';

/**
 * Creates a comprehensive question bank that includes:
 * 1. Universal/cross-platform questions (everyone gets these)
 * 2. Device-specific questions (filtered by user's device profile)
 * 3. Onboarding questions (preserved as answerable questions)
 */
export function createPersonalizedQuestionBank(deviceProfile: DeviceProfile): QuestionBank {
  // Start with universal questions (everyone gets these)
  const universalQuestions = universalQuestionsData as QuestionBank;
  
  // Get device-specific questions
  const deviceSpecificQuestions = loadDeviceSpecificQuestions(deviceProfile);
  
  // Combine domains, avoiding duplicates
  const allDomains = new Map<string, Domain>();
  
  // Add universal domains first
  universalQuestions.domains.forEach(domain => {
    allDomains.set(domain.id, domain);
  });
  
  // Add device-specific domains, merging if they exist
  deviceSpecificQuestions.domains.forEach(deviceDomain => {
    if (allDomains.has(deviceDomain.id)) {
      // Merge with existing domain
      const existingDomain = allDomains.get(deviceDomain.id)!;
      const mergedDomain = mergeDomains(existingDomain, deviceDomain);
      allDomains.set(deviceDomain.id, mergedDomain);
    } else {
      // Add new device-specific domain
      allDomains.set(deviceDomain.id, deviceDomain);
    }
  });
  
  // Add onboarding domain for device profile questions
  const onboardingDomain = createOnboardingDomain();
  allDomains.set(onboardingDomain.id, onboardingDomain);
  
  return {
    version: Math.max(universalQuestions.version, deviceSpecificQuestions.version),
    domains: Array.from(allDomains.values())
  };
}

/**
 * Merge two domains, combining their levels and questions
 */
function mergeDomains(universalDomain: Domain, deviceDomain: Domain): Domain {
  const levelMap = new Map<number, any>();
  
  // Add universal levels first
  universalDomain.levels.forEach(level => {
    levelMap.set(level.level, { ...level, questions: [...level.questions] });
  });
  
  // Add/merge device-specific levels
  deviceDomain.levels.forEach(deviceLevel => {
    if (levelMap.has(deviceLevel.level)) {
      // Merge questions into existing level
      const existingLevel = levelMap.get(deviceLevel.level)!;
      existingLevel.questions.push(...deviceLevel.questions);
    } else {
      // Add new level
      levelMap.set(deviceLevel.level, { ...deviceLevel, questions: [...deviceLevel.questions] });
    }
  });
  
  return {
    ...universalDomain,
    title: `${universalDomain.title}`, // Keep universal title, but could be enhanced
    levels: Array.from(levelMap.values()).sort((a, b) => a.level - b.level)
  };
}

/**
 * Create a domain for onboarding questions so users can review/change their profile
 */
function createOnboardingDomain(): Domain {
  const onboardingQuestions: Question[] = [];
  
  // Device profile questions
  onboardingQuestions.push({
    id: 'primary_desktop',
    type: 'ACTION',
    weight: 5,
    text: 'What is your primary desktop/laptop operating system?',
    explanation: 'This helps us show you relevant security questions',
    actionHint: 'Select your main computer OS',
    actionOptions: [
      { id: 'windows', text: 'Windows', points: 1, impact: 'Helps customize Windows security questions' },
      { id: 'mac', text: 'macOS', points: 1, impact: 'Helps customize macOS security questions' },
      { id: 'linux', text: 'Linux', points: 1, impact: 'Helps customize Linux security questions' },
      { id: 'chromeos', text: 'ChromeOS', points: 1, impact: 'Helps customize Chrome OS security questions' },
      { id: 'none', text: 'I don\'t have a desktop/laptop', points: 1, impact: 'Focuses on mobile-only security' }
    ]
  });

  onboardingQuestions.push({
    id: 'primary_mobile',
    type: 'ACTION', 
    weight: 5,
    text: 'What is your primary mobile device?',
    explanation: 'This helps us customize mobile security recommendations',
    actionHint: 'Select your main phone/tablet OS',
    actionOptions: [
      { id: 'iphone', text: 'iPhone (iOS)', points: 1, impact: 'Helps customize iOS security questions' },
      { id: 'android', text: 'Android', points: 1, impact: 'Helps customize Android security questions' },
      { id: 'both', text: 'I use both iPhone and Android', points: 1, impact: 'Shows both iOS and Android questions' },
      { id: 'none', text: 'I don\'t have a smartphone', points: 1, impact: 'Focuses on desktop-only security' }
    ]
  });

  onboardingQuestions.push({
    id: 'tech_comfort_level',
    type: 'ACTION',
    weight: 3,
    text: 'How would you describe your comfort with technology?',
    explanation: 'This helps us adjust the complexity of our recommendations',
    actionHint: 'Choose what best describes you',
    actionOptions: [
      { id: 'beginner', text: 'Beginner - I prefer simple solutions', points: 1, impact: 'Focuses on easy-to-implement security measures' },
      { id: 'intermediate', text: 'Intermediate - I can follow detailed instructions', points: 1, impact: 'Includes moderate complexity recommendations' },
      { id: 'advanced', text: 'Advanced - I enjoy configuring technical settings', points: 1, impact: 'Includes advanced security configurations' }
    ]
  });

  onboardingQuestions.push({
    id: 'security_concerns',
    type: 'ACTION',
    weight: 3, 
    text: 'What are your main security concerns?',
    explanation: 'This helps us prioritize recommendations for your situation',
    actionHint: 'Select your biggest worry',
    actionOptions: [
      { id: 'identity_theft', text: 'Identity theft and financial fraud', points: 1, impact: 'Prioritizes strong authentication and financial security' },
      { id: 'privacy', text: 'Online privacy and data collection', points: 1, impact: 'Focuses on privacy tools and data protection' },
      { id: 'malware', text: 'Viruses and malware', points: 1, impact: 'Emphasizes antivirus and safe browsing practices' },
      { id: 'social_media', text: 'Social media security and scams', points: 1, impact: 'Covers social media privacy and scam prevention' },
      { id: 'work_security', text: 'Work/business data protection', points: 1, impact: 'Includes business-focused security measures' },
      { id: 'general', text: 'General security - not sure what to worry about', points: 1, impact: 'Provides comprehensive security foundation' }
    ]
  });

  return {
    id: 'profile',
    title: 'Your Security Profile',
    levels: [
      {
        level: 0,
        questions: onboardingQuestions
      }
    ]
  };
}

/**
 * Check if a question is relevant to the user's device profile
 */
function isQuestionRelevantToUser(question: Question, deviceProfile: DeviceProfile): boolean {
  // Profile/onboarding questions are always relevant
  if (question.id.includes('primary_') || question.id.includes('tech_comfort') || question.id.includes('security_concerns')) {
    return true;
  }
  
  // Universal questions (no platform-specific keywords) are always relevant
  const platformKeywords = ['windows', 'mac', 'linux', 'ios', 'android', 'iphone'];
  const hasplatformKeyword = platformKeywords.some(keyword => 
    question.id.includes(keyword) || question.text.toLowerCase().includes(keyword)
  );
  
  if (!hasplatformKeyword) {
    return true; // Universal question
  }
  
  // Check device-specific relevance
  if ((question.id.includes('windows') || question.text.toLowerCase().includes('windows')) && 
      !deviceProfile.otherDevices.hasWindows) {
    return false;
  }
  
  if ((question.id.includes('mac') || question.text.toLowerCase().includes('mac')) && 
      !deviceProfile.otherDevices.hasMac) {
    return false;
  }
  
  if ((question.id.includes('linux') || question.text.toLowerCase().includes('linux')) && 
      !deviceProfile.otherDevices.hasLinux) {
    return false;
  }
  
  if ((question.id.includes('ios') || question.id.includes('iphone') || 
       question.text.toLowerCase().includes('iphone') || question.text.toLowerCase().includes('ios')) && 
      !deviceProfile.otherDevices.hasIPhone) {
    return false;
  }
  
  if ((question.id.includes('android') || question.text.toLowerCase().includes('android')) && 
      !deviceProfile.otherDevices.hasAndroid) {
    return false;
  }
  
  return true; // Question is relevant
}

/**
 * Get personalized progress information
 */
export interface PersonalizedProgress {
  answered: number;
  totalRelevant: number;
  percentage: number;
  deviceSpecific: {
    answered: number;
    total: number;
  };
  universal: {
    answered: number;
    total: number;
  };
}

export function getPersonalizedProgress(
  questionBank: QuestionBank,
  deviceProfile: DeviceProfile,
  answers: Record<string, any>,
  currentLevel: number = 0
): PersonalizedProgress {
  let answeredTotal = 0;
  let answeredDeviceSpecific = 0;
  let answeredUniversal = 0;
  let totalRelevant = 0;
  let totalDeviceSpecific = 0;
  let totalUniversal = 0;
  
  questionBank.domains.forEach(domain => {
    domain.levels.forEach(level => {
      if (level.level <= currentLevel) {
        level.questions.forEach(question => {
          if (isQuestionRelevantToUser(question, deviceProfile)) {
            totalRelevant++;
            
            const isDeviceSpecific = question.id.includes('windows') || question.id.includes('mac') || 
                question.id.includes('linux') || question.id.includes('ios') || 
                question.id.includes('android');
                
            if (isDeviceSpecific) {
              totalDeviceSpecific++;
            } else {
              totalUniversal++;
            }
            
            if (answers[question.id]) {
              answeredTotal++;
              
              if (isDeviceSpecific) {
                answeredDeviceSpecific++;
              } else {
                answeredUniversal++;
              }
            }
          }
        });
      }
    });
  });
  
  return {
    answered: answeredTotal,
    totalRelevant,
    percentage: totalRelevant > 0 ? Math.round((answeredTotal / totalRelevant) * 100) : 0,
    deviceSpecific: {
      answered: answeredDeviceSpecific,
      total: totalDeviceSpecific
    },
    universal: {
      answered: answeredUniversal,
      total: totalUniversal
    }
  };
}
