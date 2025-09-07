import type { Question } from '../assessment/engine/schema';
import type { DeviceProfile } from '../assessment/engine/deviceScenarios';

export interface PrioritizedQuestion extends Question {
  priority: QuestionPriority;
  impactScore: number;
  difficultyScore: number; // 1-5, where 1 is easiest
  estimatedMinutes: number;
  category: 'todays_task' | 'high_impact_recommended' | 'recommended' | 'high_impact' | 'standard';
}

export interface QuestionPriority {
  level: 'critical' | 'high' | 'medium' | 'low';
  isRecommended: boolean;
  isHighImpact: boolean;
  isEasyWin: boolean; // Can be completed quickly with high impact
  urgencyScore: number; // 1-100
}

export interface TodaysTask {
  question: PrioritizedQuestion;
  reason: string;
  estimatedTime: string;
  nextTaskAvailableAfter?: Date;
}

/**
 * Calculate priority scoring for questions based on device profile and current state
 */
export function calculateQuestionPriority(
  question: Question,
  deviceProfile: DeviceProfile,
  _currentAnswers: Record<string, any>
): QuestionPriority {
  let urgencyScore = 0;
  let isRecommended = false;
  let isHighImpact = false;
  let isEasyWin = false;

  // Base scoring from question weight
  urgencyScore = question.weight * 2;

  // Device-specific urgency boosts
  if (question.id.includes('windows') && deviceProfile.otherDevices.hasWindows) {
    urgencyScore += 15;
  }
  if (question.id.includes('ios') && deviceProfile.otherDevices.hasIPhone) {
    urgencyScore += 15;
  }
  if (question.id.includes('android') && deviceProfile.otherDevices.hasAndroid) {
    urgencyScore += 15;
  }

  // High-impact questions (security fundamentals)
  const highImpactKeywords = [
    'password', 'update', 'antivirus', 'firewall', 'backup',
    'two_factor', 'biometric', 'lock', 'wifi', 'vpn'
  ];
  
  isHighImpact = highImpactKeywords.some(keyword => 
    question.id.includes(keyword) || question.text.toLowerCase().includes(keyword)
  );
  
  if (isHighImpact) {
    urgencyScore += 20;
  }

  // Recommended questions (based on common vulnerabilities)
  const recommendedPatterns = [
    'password_manager', 'automatic_updates', 'two_factor',
    'backup_strategy', 'wifi_security', 'browser_security'
  ];
  
  isRecommended = recommendedPatterns.some(pattern => question.id.includes(pattern));
  
  if (isRecommended) {
    urgencyScore += 25;
  }

  // Easy wins (quick to implement, high impact)
  const easyWinPatterns = [
    'lock_screen', 'automatic_updates', 'browser_passwords'
  ];
  
  isEasyWin = easyWinPatterns.some(pattern => question.id.includes(pattern)) && isHighImpact;
  
  if (isEasyWin) {
    urgencyScore += 30;
  }

  // Penalty for questions that might be irrelevant to user's setup
  if (question.id.includes('linux') && !deviceProfile.otherDevices.hasLinux) {
    urgencyScore -= 50;
  }
  if (question.id.includes('mac') && !deviceProfile.otherDevices.hasMac) {
    urgencyScore -= 50;
  }

  // Determine priority level
  let level: 'critical' | 'high' | 'medium' | 'low';
  if (urgencyScore >= 80) level = 'critical';
  else if (urgencyScore >= 60) level = 'high';
  else if (urgencyScore >= 40) level = 'medium';
  else level = 'low';

  return {
    level,
    isRecommended,
    isHighImpact,
    isEasyWin,
    urgencyScore: Math.min(100, Math.max(0, urgencyScore))
  };
}

/**
 * Convert regular questions to prioritized questions
 */
export function prioritizeQuestions(
  questions: Question[],
  deviceProfile: DeviceProfile,
  currentAnswers: Record<string, any>
): PrioritizedQuestion[] {
  return questions.map(question => {
    const priority = calculateQuestionPriority(question, deviceProfile, currentAnswers);
    
    // Calculate difficulty score (1 = very easy, 5 = complex)
    let difficultyScore = 1;
    if (question.text.includes('configure') || question.text.includes('install')) {
      difficultyScore += 1;
    }
    if (question.text.includes('advanced') || question.text.includes('technical')) {
      difficultyScore += 2;
    }
    
    // Estimate time to complete
    let estimatedMinutes = 2; // Default for quick yes/no
    if (question.type === 'ACTION') {
      estimatedMinutes = difficultyScore * 5; // 5-25 minutes based on difficulty
    }
    
    // Calculate impact score
    const impactScore = priority.urgencyScore + (priority.isEasyWin ? 20 : 0);
    
    // Determine category
    let category: PrioritizedQuestion['category'];
    if (priority.isEasyWin && priority.isHighImpact && priority.isRecommended) {
      category = 'todays_task';
    } else if (priority.isHighImpact && priority.isRecommended) {
      category = 'high_impact_recommended';
    } else if (priority.isRecommended) {
      category = 'recommended';
    } else if (priority.isHighImpact) {
      category = 'high_impact';
    } else {
      category = 'standard';
    }

    return {
      ...question,
      priority,
      impactScore,
      difficultyScore,
      estimatedMinutes,
      category
    };
  });
}

/**
 * Get today's recommended task - the single most impactful, easy thing to do right now
 */
export function getTodaysTask(
  prioritizedQuestions: PrioritizedQuestion[],
  currentAnswers: Record<string, any>,
  _lastTaskCompletedAt?: Date
): TodaysTask | null {
  // Filter out already answered questions
  const unanswered = prioritizedQuestions.filter(q => !currentAnswers[q.id] || currentAnswers[q.id].isExpired);
  
  // Look for today's task candidates
  const todaysTaskCandidates = unanswered.filter(q => q.category === 'todays_task');
  
  // If no specific today's task, find the best easy win
  const candidates = todaysTaskCandidates.length > 0 
    ? todaysTaskCandidates 
    : unanswered.filter(q => 
        q.priority.isEasyWin && 
        q.difficultyScore <= 2 && 
        q.estimatedMinutes <= 10
      );
  
  if (candidates.length === 0) {
    return null;
  }
  
  // Sort by impact score descending, then by difficulty ascending (easier first)
  candidates.sort((a, b) => {
    if (b.impactScore !== a.impactScore) {
      return b.impactScore - a.impactScore;
    }
    return a.difficultyScore - b.difficultyScore;
  });
  
  const selectedTask = candidates[0];
  
  // Generate contextual reason
  let reason = "This is a quick security win that makes a big difference!";
  if (selectedTask.id.includes('password')) {
    reason = "Strong passwords are your first line of defense - let's get this sorted!";
  } else if (selectedTask.id.includes('update')) {
    reason = "Keeping things updated prevents most security issues automatically.";
  } else if (selectedTask.id.includes('lock')) {
    reason = "A locked screen is basic but critical protection for your data.";
  } else if (selectedTask.id.includes('backup')) {
    reason = "Backups save you from disasters - worth setting up today!";
  }
  
  return {
    question: selectedTask,
    reason,
    estimatedTime: `${selectedTask.estimatedMinutes} min`,
    nextTaskAvailableAfter: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
  };
}

/**
 * Sort all questions by the new prioritization system
 */
export function sortQuestionsByPriority(prioritizedQuestions: PrioritizedQuestion[]): PrioritizedQuestion[] {
  return prioritizedQuestions.sort((a, b) => {
    // First sort by category priority
    const categoryOrder = {
      'todays_task': 0,
      'high_impact_recommended': 1,
      'recommended': 2,
      'high_impact': 3,
      'standard': 4
    };
    
    const categoryDiff = categoryOrder[a.category] - categoryOrder[b.category];
    if (categoryDiff !== 0) {
      return categoryDiff;
    }
    
    // Within same category, sort by urgency score descending
    if (b.priority.urgencyScore !== a.priority.urgencyScore) {
      return b.priority.urgencyScore - a.priority.urgencyScore;
    }
    
    // Finally by difficulty (easier first)
    return a.difficultyScore - b.difficultyScore;
  });
}
