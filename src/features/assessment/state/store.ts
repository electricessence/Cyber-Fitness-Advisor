import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionBank, Answer, Question } from '../engine/schema';
import type { DeviceProfile } from '../engine/deviceScenarios';
import type { TaskResponse, TaskReminder } from '../../tasks/taskManagement';
import { calculateOverallScore, getTopRecommendations, getNextLevelProgress, calculateQuestionPoints, calculateAnswerExpiration } from '../engine/scoring';
import { createSimpleQuestionBank } from '../../progress/simpleProgress';
import { ConditionEngine } from '../engine/conditions';
import questionsData from '../data/questions.json';

// Smart pre-population from onboarding data
function prePopulateFromOnboarding(existingAnswers: Record<string, Answer>): Record<string, Answer> {
  const onboardingAnswers = JSON.parse(localStorage.getItem('cyber-fitness-onboarding-answers') || '{}');
  const updatedAnswers = { ...existingAnswers };

  // Map password practices from onboarding to browser_passwords question
  if (onboardingAnswers.password_strength && !updatedAnswers.browser_passwords) {
    const passwordBehavior = onboardingAnswers.password_strength.value;
    // If they use all_unique or mostly_unique, they likely use browser passwords or password manager
    const usesBrowserPasswords = passwordBehavior === 'all_unique' || passwordBehavior === 'mostly_unique';
    
    updatedAnswers.browser_passwords = {
      questionId: 'browser_passwords',
      value: usesBrowserPasswords,
      timestamp: new Date(),
      pointsEarned: usesBrowserPasswords ? 10 : 0,
      questionText: 'Browser password manager usage (inferred from onboarding)'
    };
  }

  // Map password practices to password_reuse question (SCALE 1-5)
  if (onboardingAnswers.password_strength && !updatedAnswers.password_reuse) {
    const passwordBehavior = onboardingAnswers.password_strength.value;
    let reuseScore = 1; // Default to worst case
    
    switch(passwordBehavior) {
      case 'all_unique': reuseScore = 5; break; // Never reuse
      case 'mostly_unique': reuseScore = 4; break; // Rarely reuse  
      case 'some_same': reuseScore = 3; break; // Sometimes reuse
      case 'mostly_same': reuseScore = 2; break; // Often reuse
      default: reuseScore = 1; // Always reuse
    }
    
    updatedAnswers.password_reuse = {
      questionId: 'password_reuse',
      value: reuseScore,
      timestamp: new Date(),
      pointsEarned: reuseScore > 1 ? (reuseScore - 1) * 2.5 : 0, // Rough estimate
      questionText: 'Password reuse habits (inferred from onboarding)'
    };
  }

  // Map virus scan frequency to antivirus question
  if (onboardingAnswers.virus_scan_recent && !updatedAnswers.antivirus) {
    const scanFrequency = onboardingAnswers.virus_scan_recent.value;
    // If they scan weekly/monthly, they have some antivirus
    const hasAntivirus = ['weekly', 'monthly', 'this_week', 'this_month'].includes(scanFrequency);
    
    updatedAnswers.antivirus = {
      questionId: 'antivirus',
      value: hasAntivirus ? 'yes' : 'no',
      timestamp: new Date(),
      pointsEarned: hasAntivirus ? 7.5 : 0,
      questionText: 'Antivirus software usage (inferred from onboarding scan frequency)'
    };
  }

  // Map software update habits to windows_updates question
  if (onboardingAnswers.software_updates && !updatedAnswers.windows_updates) {
    const updateBehavior = onboardingAnswers.software_updates.value;
    const automaticUpdates = updateBehavior === 'automatic';
    
    updatedAnswers.windows_updates = {
      questionId: 'windows_updates',
      value: automaticUpdates ? 'yes' : 'no', 
      timestamp: new Date(),
      pointsEarned: automaticUpdates ? 15 : 0,
      questionText: 'Automatic updates (inferred from onboarding)'
    };
  }

  return updatedAnswers;
}

interface AssessmentState {
  // Data
  questionBank: QuestionBank;
  answers: Record<string, Answer>;
  deviceProfile: DeviceProfile | null;
  
  // Phase 2.2: Condition engine for contextual Q/A
  conditionEngine: ConditionEngine;
  
  // Task Management
  taskResponses: Record<string, TaskResponse>;
  taskReminders: TaskReminder[];
  
  // Computed state
  overallScore: number;
  domainScores: Record<string, number>;
  currentLevel: number;
  quickWinsCompleted: number;
  totalQuickWins: number;
  nextLevelProgress: {
    currentLevel: number;
    nextLevel: number | null;
    pointsNeeded: number;
    progress: number;
  };
  
  // Cached recommendations
  recommendations: ReturnType<typeof getTopRecommendations>;
  
  // UI state
  showCelebration: boolean;
  lastScoreIncrease: number;
  earnedBadges: string[];
  
  // Actions
  answerQuestion: (questionId: string, value: boolean | number | string | 'yes' | 'no' | 'unsure') => void;
  handleTaskResponse: (questionId: string, taskResponse: TaskResponse) => void;
  setDeviceProfile: (profile: DeviceProfile) => void;
  resetAssessment: () => void;
  getAvailableQuestions: () => Question[];
  getRecommendations: () => ReturnType<typeof getTopRecommendations>;
  getHistoricAnswers: () => Array<Answer & { domain: string; level: number; question: Question | null }>;
  dismissCelebration: () => void;
  
  // Phase 2.2: Derived selectors for contextual Q/A
  getVisibleQuestionIds: () => string[];
  getUnlockedSuiteIds: () => string[];
  getEffectivePatches: () => Record<string, Partial<Question>>;
  
  // Task Management
  getTodaysTasks: () => Question[];
  getRoomForImprovementTasks: () => Question[];
  
  // Expiration management
  getExpiredAnswers: () => Answer[];
  updateExpiredAnswers: () => void;
  getExpiringAnswers: (daysAhead?: number) => Answer[];
}

// Helper to create the initial condition engine
function createInitialConditionEngine(): ConditionEngine {
  const questionBank = questionsData as QuestionBank;
  const allQuestions: Question[] = [];
  
  // Collect all questions from domains
  for (const domain of questionBank.domains) {
    for (const level of domain.levels) {
      allQuestions.push(...level.questions);
    }
  }
  
  // Collect questions from suites and add them to the engine
  const conditionSuites = (questionBank.suites || []).map(suite => {
    // Add suite questions to the main questions list
    allQuestions.push(...suite.questions);
    
    return {
      id: suite.id,
      title: suite.title,
      description: suite.description,
      gates: suite.gates,
      questionIds: suite.questions.map(q => q.id),
      priority: 0
    };
  });
  
  return new ConditionEngine(allQuestions, conditionSuites);
}

const initialState = {
  questionBank: questionsData as QuestionBank,
  answers: {},
  deviceProfile: null as DeviceProfile | null,
  conditionEngine: createInitialConditionEngine(),
  taskResponses: {},
  taskReminders: [],
  overallScore: 0,
  domainScores: {},
  currentLevel: 0,
  quickWinsCompleted: 0,
  totalQuickWins: 0,
  nextLevelProgress: {
    currentLevel: 0,
    nextLevel: 1,
    pointsNeeded: 15,
    progress: 0
  },
  recommendations: [] as ReturnType<typeof getTopRecommendations>,
  showCelebration: false,
  lastScoreIncrease: 0,
  earnedBadges: [],
};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      answerQuestion: (questionId: string, value: boolean | number | string | 'yes' | 'no' | 'unsure') => {
        console.log('Store answerQuestion called with:', questionId, value);
        const state = get();
        const previousScore = state.overallScore;
        const previousLevel = state.currentLevel;
        console.log('Previous state:', { 
          score: previousScore, 
          level: previousLevel, 
          answersCount: Object.keys(state.answers).length 
        });
        
        // Find the question to get its details
        let question = state.questionBank.domains
          .flatMap(d => d.levels.flatMap(l => l.questions))
          .find(q => q.id === questionId);
        
        // If not found in question bank, check if it's an onboarding question
        if (!question) {
          const onboardingQuestions: Record<string, any> = {
            // DEBUG: Test expiration question
            'debug_expiration_test': {
              id: 'debug_expiration_test',
              text: 'DEBUG: Test expiration system',
              weight: 1
            },
            'platform_confirmation': {
              id: 'platform_confirmation',
              text: 'Platform confirmation',
              weight: 5
            },
            'virus_scan_recent': {
              id: 'virus_scan_recent', 
              text: 'Recent virus scan frequency',
              weight: 15
            },
            'password_strength': {
              id: 'password_strength',
              text: 'Password uniqueness across accounts', 
              weight: 20
            },
            'software_updates': {
              id: 'software_updates',
              text: 'Software update habits',
              weight: 15
            },
            'phishing_awareness': {
              id: 'phishing_awareness',
              text: 'Phishing awareness level',
              weight: 20
            },
            'tech_comfort': {
              id: 'tech_comfort',
              text: 'Technology comfort level',
              weight: 10
            }
          };

          question = onboardingQuestions[questionId];
        }
        
        console.log('Found question:', question?.id, question?.text?.substring(0, 50));
        
        const pointsEarned = question ? calculateQuestionPoints(question, value) : 0;
        console.log('Points earned:', pointsEarned);
        
        // Calculate expiration for time-sensitive answers
        const expirationData = calculateAnswerExpiration(questionId, value);
        
        const newAnswers = {
          ...state.answers,
          [questionId]: {
            questionId,
            value,
            timestamp: new Date(),
            pointsEarned,
            questionText: question?.text,
            ...expirationData,
            isExpired: false // Initially not expired
          } as Answer,
        };
        
        const scoreResult = calculateOverallScore(state.questionBank, newAnswers);
        const nextLevelProgress = getNextLevelProgress(scoreResult.overallScore);
        
        console.log('New calculated state:', {
          newScore: scoreResult.overallScore,
          newLevel: scoreResult.level,
          newAnswersCount: Object.keys(newAnswers).length
        });
        
        const scoreIncrease = scoreResult.overallScore - previousScore;
        const shouldCelebrate = scoreIncrease > 5 || 
          (scoreResult.level > state.currentLevel && scoreResult.level <= 2); // Celebrate early levels
        
        // Check for new badges (simplified for MVP)
        const newBadges = [...state.earnedBadges];
        if (scoreResult.quickWinsCompleted >= 3 && !newBadges.includes('quick-starter')) {
          newBadges.push('quick-starter');
        }
        if (scoreResult.overallScore >= 50 && !newBadges.includes('halfway-hero')) {
          newBadges.push('halfway-hero');
        }
        
        // Recalculate recommendations
        const newRecommendations = getTopRecommendations(state.questionBank, newAnswers);
        
        console.log('About to update store with:', {
          answersCount: Object.keys(newAnswers).length,
          overallScore: scoreResult.overallScore,
          currentLevel: scoreResult.level
        });
        
        set({
          answers: newAnswers,
          overallScore: scoreResult.overallScore,
          domainScores: scoreResult.domainScores,
          currentLevel: scoreResult.level,
          quickWinsCompleted: scoreResult.quickWinsCompleted,
          totalQuickWins: scoreResult.totalQuickWins,
          nextLevelProgress,
          recommendations: newRecommendations,
          showCelebration: shouldCelebrate,
          lastScoreIncrease: scoreIncrease,
          earnedBadges: newBadges,
        });
        
        console.log('Store updated! New state should be available to components.');
      },
      
      setDeviceProfile: (profile: DeviceProfile) => {
        console.log('Setting device profile:', profile);
        
        // Create comprehensive question bank with universal + device-specific + onboarding questions
        const personalizedQuestionBank = createSimpleQuestionBank(profile);
        console.log('Created personalized question bank:', personalizedQuestionBank);
        
        set({ 
          deviceProfile: profile,
          questionBank: personalizedQuestionBank
        });
      },
      
      resetAssessment: () => {
        // Clear persisted data from localStorage
        localStorage.removeItem('cyber-fitness-assessment');
        localStorage.removeItem('cyber-fitness-onboarding-answers');
        
        // Reset in-memory state
        set({
          ...initialState,
          questionBank: get().questionBank, // Keep the question bank
        });
      },
      
      getAvailableQuestions: () => {
        const state = get();
        const visibleQuestionIds = state.getVisibleQuestionIds();
        const allQuestions: Question[] = [];
        
        // Collect all questions from all domains and levels
        state.questionBank.domains.forEach(domain => {
          domain.levels.forEach(level => {
            level.questions.forEach(question => {
              allQuestions.push(question);
            });
          });
        });
        
        // Add suite questions
        state.questionBank.suites?.forEach(suite => {
          suite.questions.forEach(question => {
            allQuestions.push(question);
          });
        });
        
        // Filter to only visible questions that aren't already answered
        return allQuestions.filter(question => {
          // Must be visible according to condition engine
          if (!visibleQuestionIds.includes(question.id)) {
            return false;
          }
          
          // Check if question is already answered and not expired
          const existingAnswer = state.answers[question.id];
          if (existingAnswer && !existingAnswer.isExpired) {
            return false; // Already answered and not expired
          }
          
          return true; // Question is available
        });
      },
      
      getRecommendations: () => {
        return get().recommendations;
      },
      
      getHistoricAnswers: () => {
        const state = get();
        return Object.values(state.answers).map(answer => {
          // Find which domain and level this question belongs to
          let domain = '';
          let level = 0;
          let question = null;
          
          for (const d of state.questionBank.domains) {
            for (let l = 0; l < d.levels.length; l++) {
              const q = d.levels[l].questions.find(q => q.id === answer.questionId);
              if (q) {
                domain = d.title;
                level = l + 1;
                question = q;
                break;
              }
            }
            if (domain) break;
          }
          
          return {
            ...answer,
            domain,
            level,
            question
          };
        }).sort((a, b) => {
          // Sort by timestamp if available, otherwise by question ID
          if (a.timestamp && b.timestamp) {
            return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
          }
          return a.questionId.localeCompare(b.questionId);
        });
      },
      
      dismissCelebration: () => {
        set({ showCelebration: false });
      },
      
      // Expiration management functions
      getExpiredAnswers: () => {
        const state = get();
        const now = new Date();
        return Object.values(state.answers).filter(answer => 
          answer.expiresAt && answer.expiresAt < now
        );
      },
      
      updateExpiredAnswers: () => {
        const state = get();
        const now = new Date();
        const updatedAnswers = { ...state.answers };
        let hasChanges = false;
        
        Object.keys(updatedAnswers).forEach(questionId => {
          const answer = updatedAnswers[questionId];
          if (answer.expiresAt) {
            const wasExpired = answer.isExpired;
            const isNowExpired = answer.expiresAt < now;
            
            if (wasExpired !== isNowExpired) {
              updatedAnswers[questionId] = { ...answer, isExpired: isNowExpired };
              hasChanges = true;
            }
          }
        });
        
        if (hasChanges) {
          set({ answers: updatedAnswers });
        }
      },
      
      getExpiringAnswers: (daysAhead: number = 7) => {
        const state = get();
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);
        
        return Object.values(state.answers).filter(answer => 
          answer.expiresAt && 
          answer.expiresAt <= futureDate && 
          answer.expiresAt > new Date()
        );
      },

      // Task Management Methods
      handleTaskResponse: (questionId: string, taskResponse: TaskResponse) => {
        const state = get();
        
        // Update task responses
        const newTaskResponses = {
          ...state.taskResponses,
          [questionId]: taskResponse
        };

        // Update task reminders if snoozed
        let newTaskReminders = state.taskReminders;
        if (taskResponse.status === 'snoozed') {
          const existingReminderIndex = newTaskReminders.findIndex(r => r.questionId === questionId);
          const now = new Date();
          
          if (existingReminderIndex >= 0) {
            newTaskReminders = [...newTaskReminders];
            newTaskReminders[existingReminderIndex] = {
              ...newTaskReminders[existingReminderIndex],
              reminderCount: newTaskReminders[existingReminderIndex].reminderCount + 1,
              lastSnoozed: now,
              reminderDate: taskResponse.snoozeUntil!
            };
          } else {
            newTaskReminders = [
              ...newTaskReminders,
              {
                questionId,
                reminderCount: 0,
                lastSnoozed: now,
                reminderDate: taskResponse.snoozeUntil!
              }
            ];
          }
        }

        // If task was completed, convert to Answer format for scoring
        let newAnswers = state.answers;
        if (taskResponse.status === 'completed' && taskResponse.selectedAction) {
          newAnswers = {
            ...state.answers,
            [questionId]: {
              questionId,
              value: taskResponse.selectedAction,
              timestamp: taskResponse.timestamp,
              pointsEarned: taskResponse.pointsEarned || 0,
              questionText: `Task completed: ${taskResponse.selectedAction}`
            }
          };
        }

        // Recalculate scores if task was completed
        let scoreUpdate = {};
        if (taskResponse.status === 'completed') {
          const scoreResult = calculateOverallScore(state.questionBank, newAnswers);
          const nextLevelProgress = getNextLevelProgress(scoreResult.overallScore);
          
          scoreUpdate = {
            overallScore: scoreResult.overallScore,
            domainScores: scoreResult.domainScores,
            currentLevel: scoreResult.level,
            quickWinsCompleted: scoreResult.quickWinsCompleted,
            totalQuickWins: scoreResult.totalQuickWins,
            nextLevelProgress
          };
        }

        set({
          taskResponses: newTaskResponses,
          taskReminders: newTaskReminders,
          answers: newAnswers,
          ...scoreUpdate
        });
      },

      getTodaysTasks: () => {
        const state = get();
        const allQuestions: Question[] = [];
        
        // Collect all ACTION questions
        state.questionBank.domains.forEach(domain => {
          domain.levels.forEach(level => {
            level.questions.forEach(question => {
              if (question.type === 'ACTION') {
                allQuestions.push(question);
              }
            });
          });
        });

        // Filter to get today's tasks (new + due snoozed tasks)
        return allQuestions.filter(question => {
          const taskResponse = state.taskResponses[question.id];
          
          // New task (never answered)
          if (!taskResponse) return true;
          
          // Completed or dismissed tasks don't appear in today's list
          if (taskResponse.status === 'completed' || taskResponse.status === 'dismissed') {
            return false;
          }
          
          // Snoozed task that's due
          if (taskResponse.status === 'snoozed' && taskResponse.snoozeUntil) {
            return new Date() >= taskResponse.snoozeUntil;
          }
          
          return false;
        });
      },

      getRoomForImprovementTasks: () => {
        const state = get();
        const allQuestions: Question[] = [];
        
        // Collect all ACTION questions
        state.questionBank.domains.forEach(domain => {
          domain.levels.forEach(level => {
            level.questions.forEach(question => {
              if (question.type === 'ACTION') {
                allQuestions.push(question);
              }
            });
          });
        });

        // Return dismissed and snoozed tasks
        return allQuestions.filter(question => {
          const taskResponse = state.taskResponses[question.id];
          return taskResponse && (
            taskResponse.status === 'dismissed' || 
            taskResponse.status === 'snoozed'
          );
        });
      },
      
      // Phase 2.2: Condition engine selectors
      getVisibleQuestionIds: () => {
        const state = get();
        const context = {
          answers: Object.fromEntries(
            Object.entries(state.answers).map(([id, answer]) => [id, answer.value])
          ),
          deviceProfile: state.deviceProfile,
          metadata: {}
        };
        const result = state.conditionEngine.evaluate(context);
        return result.visibleQuestionIds;
      },
      
      getUnlockedSuiteIds: () => {
        const state = get();
        const context = {
          answers: Object.fromEntries(
            Object.entries(state.answers).map(([id, answer]) => [id, answer.value])
          ),
          deviceProfile: state.deviceProfile,
          metadata: {}
        };
        const result = state.conditionEngine.evaluate(context);
        return result.unlockedSuites.map(suite => suite.id);
      },
      
      getEffectivePatches: () => {
        const state = get();
        const context = {
          answers: state.answers,
          deviceProfile: state.deviceProfile,
          metadata: {}
        };
        const result = state.conditionEngine.evaluate(context);
        return result.questionPatches;
      },
    }),
    {
      name: 'cyber-fitness-assessment',
      // Only persist answers and earned badges, recompute scores on load
      partialize: (state) => ({ 
        answers: state.answers,
        earnedBadges: state.earnedBadges 
      }),
    }
  )
);

// Recompute scores when store loads (in case questions/scoring changed)
export const initializeStore = () => {
  const store = useAssessmentStore.getState();
  
  // Pre-populate answers from onboarding (always run this, not just when we have existing answers)
  const prePopulatedAnswers = prePopulateFromOnboarding(store.answers);
  
  // If we have any answers (existing or pre-populated), recalculate scores
  if (Object.keys(prePopulatedAnswers).length > 0) {
    const scoreResult = calculateOverallScore(store.questionBank, prePopulatedAnswers);
    const nextLevelProgress = getNextLevelProgress(scoreResult.overallScore);
    
    useAssessmentStore.setState({
      answers: prePopulatedAnswers,
      overallScore: scoreResult.overallScore,
      domainScores: scoreResult.domainScores,
      currentLevel: scoreResult.level,
      quickWinsCompleted: scoreResult.quickWinsCompleted,
      totalQuickWins: scoreResult.totalQuickWins,
      nextLevelProgress,
    });
  }
};
