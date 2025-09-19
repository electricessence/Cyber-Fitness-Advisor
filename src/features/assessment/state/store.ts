import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionBank, Answer, Question } from '../engine/schema';
import type { DeviceProfile } from '../engine/deviceScenarios';
import type { TaskResponse, TaskReminder } from '../../tasks/taskManagement';
import { calculateOverallScore, getTopRecommendations, getNextLevelProgress, calculateQuestionPoints, calculateAnswerExpiration } from '../engine/scoring';
import { ConditionEngine } from '../engine/conditions';
import { createFactsStoreSlice, type FactsStoreState } from '../facts/integration';
import type { Fact } from '../facts/types';
import unifiedQuestionBank from '../data/questionBank';
import { detectCurrentDevice } from '../../device/deviceDetection';
import { BadgeEngine, type BadgeEvaluationContext, type BadgeUnlockEvent, type StreakData } from '../../badges/badgeEngine';
import type { Badge, BadgeProgress } from '../../badges/badgeDefinitions';
import { ACHIEVEMENT_BADGES } from '../../badges/badgeDefinitions';
import { getVisibleQuestionIds } from '../engine/conditionEvaluation';
import type { Registry } from '../../../utils/Registry';
import { createZustandRegistry } from '../../../utils/Registry';

// Smart pre-population from onboarding data
function prePopulateFromOnboarding(existingAnswers: Record<string, Answer>): Record<string, Answer> {
  const onboardingAnswers = JSON.parse(localStorage.getItem('cfa:v2:onboarding-answers') || '{}');
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

interface AssessmentState extends FactsStoreState {
  // Data
  questionBank: QuestionBank;
  answers: Record<string, Answer>;
  deviceProfile: DeviceProfile | null;
  
  // Phase 2.2: Condition engine for contextual Q/A
  conditionEngine: ConditionEngine;
  
  // Registry pattern (simplified store integration)
  factsData: Record<string, any>;
  facts: Registry<any>;
  
  // Registry methods (simplified alternatives to complex facts system)
  setFact: (key: string, value: any) => void;
  getFact: (key: string) => any;
  hasFact: (key: string) => boolean;
  
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
  
  // Badge system state
  badgeEngine: BadgeEngine;
  badgeProgress: BadgeProgress[];
  recentBadgeUnlocks: BadgeUnlockEvent[];
  streakData: StreakData;
  sessionStartTime: Date | null;
  
  // Actions
  answerQuestion: (questionId: string, value: boolean | number | string | 'yes' | 'no' | 'unsure') => void;
  handleTaskResponse: (questionId: string, taskResponse: TaskResponse) => void;
  setDeviceProfile: (profile: DeviceProfile) => void;
  resetAssessment: () => void;
  removeAnswer: (questionId: string) => void;
  getAvailableQuestions: () => Question[];
  getRecommendations: () => ReturnType<typeof getTopRecommendations>;
  getHistoricAnswers: () => Array<Answer & { domain: string; level: number; question: Question | null }>;
  dismissCelebration: () => void;
  
  // Phase 2.2: Derived selectors for contextual Q/A
  getVisibleQuestionIds: () => string[];
  getUnlockedSuiteIds: () => string[];
  getEffectivePatches: () => Record<string, Partial<Question>>;

  // Unified model derived (feature-flagged)
  getOrderedAvailableQuestions?: () => Question[];
  getOnboardingPendingCount?: () => number;
  isOnboardingComplete?: () => boolean;
  
  // Task Management
  getTodaysTasks: () => Question[];
  getRoomForImprovementTasks: () => Question[];
  
  // Expiration management
  getExpiredAnswers: () => Answer[];
  updateExpiredAnswers: () => void;
  getExpiringAnswers: (daysAhead?: number) => Answer[];
  
  // Badge system actions
  getBadgeProgress: () => BadgeProgress[];
  getEarnedBadges: () => Badge[];
  getNextRecommendedBadges: () => Badge[];
  updateBadgeProgress: () => void;
  clearRecentBadgeUnlocks: () => void;
  updateStreakData: () => void;
}

// Helper to create the initial condition engine
function createInitialConditionEngine(): ConditionEngine {
  const questionBank = unifiedQuestionBank;
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
  questionBank: unifiedQuestionBank,
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
  
  // Badge system state
  badgeEngine: new BadgeEngine(),
  badgeProgress: [] as BadgeProgress[],
  recentBadgeUnlocks: [] as BadgeUnlockEvent[],
  streakData: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: undefined,
    streakHistory: []
  } as StreakData,
  sessionStartTime: null as Date | null,
  
  // Registry pattern (simplified store integration)
  factsData: {} as Record<string, any>,
  facts: null as any, // Will be initialized in store creator
};

export const useAssessmentStore = create<AssessmentState>()(
  persist(
    (set, get) => {
      // Create facts system slice  
      const factsSlice = createFactsStoreSlice();
      
      // Override injectFact to properly update Zustand state
      const enhancedFactsActions = {
        ...factsSlice.factsActions,
        injectFact: (factId: string, value: any, metadata: { source?: string; confidence?: number } = {}) => {
          // Update only Zustand state, not facts slice internal state
          const currentState = get();
          
          const fact: Fact = {
            id: factId,
            name: factId.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            category: factId.includes('device') || factId.includes('os') || factId.includes('browser') ? 'device' : 'behavior',
            value,
            establishedAt: new Date(),
            establishedBy: { questionId: 'device-detection', answerValue: value },
            confidence: metadata.confidence || 0.95,
            metadata: { source: metadata.source || 'auto-detection', ...metadata }
          };
          
          const newFactsProfile = {
            ...currentState.factsProfile,
            facts: {
              ...currentState.factsProfile.facts,
              [factId]: fact
            },
            lastUpdated: new Date()
          };
          
          set({
            factsProfile: newFactsProfile
          });
        },
        
        // Override getFacts to read from Zustand state  
        getFacts: () => {
          const currentState = get();
          return Object.values(currentState.factsProfile.facts);
        },
        
        // Override getFact to read from Zustand state
        getFact: (factId: string) => {
          const currentState = get();
          return currentState.factsProfile.facts[factId] || null;
        },
        
        // Override hasFactValue to read from Zustand state  
        hasFactValue: (factId: string, value: any) => {
          const currentState = get();
          const fact = currentState.factsProfile.facts[factId];
          return fact ? fact.value === value : false;
        }
      };
      
      const createRegistries = () => {
        const state = get();
        return {
          facts: createZustandRegistry(
            () => state.factsData || {},
            (data) => set({ factsData: data })
          )
        };
      };

      return {
        ...initialState,
        factsProfile: factsSlice.factsProfile, // Initialize from facts slice
        factsEngine: factsSlice.factsEngine, // Include facts engine
        factsActions: enhancedFactsActions, // Use enhanced version that reads from Zustand
        
        // Initialize empty Registry (will be recreated on first use)
        facts: null as any,
        
        // Registry methods (simplified alternatives to complex facts system)
        setFact: (key: string, value: any) => {
          const state = get();
          if (!state.facts) {
            const registries = createRegistries();
            set(registries);
          }
          const currentState = get(); // Get fresh state after potential update
          currentState.facts.set(key, value);
        },
        
        getFact: (key: string) => {
          const state = get();
          if (!state.facts) {
            const registries = createRegistries();
            set(registries);
          }
          const currentState = get(); // Get fresh state after potential update
          return currentState.facts.get(key);
        },
        
        hasFact: (key: string) => {
          const state = get();
          if (!state.facts) {
            const registries = createRegistries();
            set(registries);
          }
          const currentState = get(); // Get fresh state after potential update
          return currentState.facts.has(key);
        },
        
        answerQuestion: (questionId: string, value: boolean | number | string | 'yes' | 'no' | 'unsure') => {
          const state = get();
          
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
        
        const pointsEarned = question ? calculateQuestionPoints(question, value) : 0;
        
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

        // Process answer to extract facts directly from answer option
        const allQs: Question[] = [];
        state.questionBank.domains.forEach(domain => {
          domain.levels.forEach(level => {
            level.questions.forEach(q => allQs.push(q));
          });
        });
        
        const targetQuestion = allQs.find((q: Question) => q.id === questionId);
        if (targetQuestion) {
          const selectedOption = targetQuestion.options.find((option: any) => 
            option.id === newAnswers[questionId].value || option.text === newAnswers[questionId].value
          );
          if (selectedOption && selectedOption.facts) {
            // Use enhanced factsActions to inject facts
            for (const [factId, factValue] of Object.entries(selectedOption.facts)) {
              enhancedFactsActions.injectFact(factId, factValue, { 
                source: `answer:${questionId}`,
                confidence: 1.0 
              });
            }
          }
        }
        
        const scoreResult = calculateOverallScore(state.questionBank, newAnswers);
        const nextLevelProgress = getNextLevelProgress(scoreResult.overallScore);
        
        const scoreIncrease = scoreResult.overallScore - state.overallScore;
        const shouldCelebrate = scoreIncrease > 5 || 
          (nextLevelProgress.currentLevel > state.currentLevel && nextLevelProgress.currentLevel <= 2); // Celebrate early levels
        
        // Check for new badges (simplified for MVP)
        const newBadges = [...state.earnedBadges];
        
        // Count quick wins completed (questions with quickWin tag that are answered)
        const quickWinsCompleted = Object.keys(newAnswers).filter(questionId => {
          const question = allQs.find((q: Question) => q.id === questionId);
          return question && question.tags?.includes('quickWin');
        }).length;
        
        if (quickWinsCompleted >= 3 && !newBadges.includes('quick-starter')) {
          newBadges.push('quick-starter');
        }
        if (scoreResult.overallScore >= 50 && !newBadges.includes('halfway-hero')) {
          newBadges.push('halfway-hero');
        }
        
        // Recalculate recommendations
        const newRecommendations = getTopRecommendations(state.questionBank, newAnswers);
        
        set((prev) => ({
          ...prev, // Preserve existing state
          answers: newAnswers,
          overallScore: scoreResult.overallScore,
          domainScores: Object.entries(scoreResult.domainScores).reduce((acc: Record<string, number>, [domain, scores]) => {
            acc[domain] = scores.score;
            return acc;
          }, {}),
          currentLevel: nextLevelProgress.currentLevel,
          quickWinsCompleted: 0, // Simplified for now
          totalQuickWins: Object.values(state.questionBank.domains)
            .flatMap(d => d.levels.flatMap(l => l.questions))
            .filter(q => q.priority >= 8000).length, // Quick wins have priority 8000+
          nextLevelProgress,
          recommendations: newRecommendations,
          showCelebration: shouldCelebrate,
          lastScoreIncrease: scoreIncrease,
          earnedBadges: newBadges,
        }));
        
        // Update badge progress after answering a question
        get().updateBadgeProgress();
      },
      
      setDeviceProfile: (profile: DeviceProfile) => {
        // Don't replace the question bank - the unified question bank already contains
        // all questions including device-specific ones. The condition engine will
        // handle filtering based on device profile.
        set({ 
          deviceProfile: profile
        });
      },
      
      resetAssessment: () => {
        // Clear persisted data from localStorage (both old and new formats)
        localStorage.removeItem('cyber-fitness-assessment');
        localStorage.removeItem('cyber-fitness-onboarding-answers'); 
        localStorage.removeItem('cfa:v2:answers');
        localStorage.removeItem('cfa:v2:onboarding-answers');
        localStorage.removeItem('cfa:v2:contentVersion');
        localStorage.removeItem('cfa:v2:onboardingVersion');
        localStorage.removeItem('cfa:v2:privacy-dismissed');
        
        // Create a fresh facts slice to ensure clean state
        const freshFactsSlice = createFactsStoreSlice();
        
        // Create fresh enhanced facts actions for the reset state
        const freshEnhancedFactsActions = {
          ...freshFactsSlice.factsActions,
          injectFact: (factId: string, value: any, metadata: { source?: string; confidence?: number } = {}) => {
            // Update only Zustand state, not facts slice internal state
            const currentState = get();
            
            const fact: Fact = {
              id: factId,
              name: factId.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              category: factId.includes('device') || factId.includes('os') || factId.includes('browser') ? 'device' : 'behavior',
              value,
              establishedAt: new Date(),
              establishedBy: { questionId: 'device-detection', answerValue: value },
              confidence: metadata.confidence || 0.95,
              metadata: { source: metadata.source || 'auto-detection', ...metadata }
            };
            
            set({
              factsProfile: {
                ...currentState.factsProfile,
                facts: {
                  ...currentState.factsProfile.facts,
                  [factId]: fact
                },
                lastUpdated: new Date()
              }
            });
          },
          
          // Override getFact to read from Zustand state
          getFact: (factId: string) => {
            const currentState = get();
            return currentState.factsProfile.facts[factId] || null;
          },
          
          // Override hasFactValue to read from Zustand state  
          hasFactValue: (factId: string, value: any) => {
            const currentState = get();
            const fact = currentState.factsProfile.facts[factId];
            return fact ? fact.value === value : false;
          }
        };
        
        // Reset in-memory state with fresh facts
        set({
          ...initialState,
          questionBank: get().questionBank, // Keep the question bank
          ...freshFactsSlice, // Fresh facts system
          factsActions: freshEnhancedFactsActions // Use fresh enhanced actions
        });
      },
      
      removeAnswer: (questionId: string) => {
        const state = get();
        const { [questionId]: removedAnswer, ...remainingAnswers } = state.answers;
        
        if (removedAnswer) {
          // Update answers
          set({ answers: remainingAnswers });
          
          // Recalculate scores using existing scoring function
          const scoreResult = calculateOverallScore(state.questionBank, remainingAnswers);
          const nextLevelProgress = getNextLevelProgress(scoreResult.overallScore);
          
          // Convert domain scores to simple number format
          const simpleDomainScores = Object.entries(scoreResult.domainScores).reduce((acc, [domain, data]) => {
            acc[domain] = data.score;
            return acc;
          }, {} as Record<string, number>);
          
          set({
            overallScore: scoreResult.overallScore,
            domainScores: simpleDomainScores,
            currentLevel: nextLevelProgress.currentLevel,
            quickWinsCompleted: scoreResult.quickWinsCompleted,
            totalQuickWins: scoreResult.totalQuickWins,
            nextLevelProgress,
          });
          
          // Update badge progress after removing answer
          state.updateBadgeProgress();
        }
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
        const availableQuestions = allQuestions.filter(question => {
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
        
        return availableQuestions;
      },

      // Unified model ordering (phase aware)
      getOrderedAvailableQuestions: () => {
        const raw = get().getAvailableQuestions();
        return [...raw].sort((a, b) => {
          const ao = (a as any).phaseOrder ?? 9999;
          const bo = (b as any).phaseOrder ?? 9999;
          if (ao !== bo) return ao - bo;
          return a.id.localeCompare(b.id);
        });
      },

      getOnboardingPendingCount: () => {
        const state = get();
        const answered = Object.keys(state.answers);
        const onboarding = state.questionBank.domains.find(d => d.id === 'onboarding_phase');
        if (!onboarding) return 0;
        const all = onboarding.levels.flatMap(l => l.questions);
        return all.filter(q => !answered.includes(q.id)).length;
      },

      isOnboardingComplete: () => {
        return (get().getOnboardingPendingCount?.() || 0) === 0;
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
        const allQuestions: Question[] = [];
        
        // Collect all questions from all domains and levels
        state.questionBank.domains.forEach(domain => {
          domain.levels.forEach(level => {
            level.questions.forEach(question => {
              allQuestions.push(question);
            });
          });
        });
        
        // Add suite questions (only from unlocked suites)
        const unlockedSuiteIds = state.getUnlockedSuiteIds();
        state.questionBank.suites?.forEach(suite => {
          if (unlockedSuiteIds.includes(suite.id)) {
            suite.questions.forEach(question => {
              allQuestions.push(question);
            });
          }
        });
        
        // Use extracted condition evaluation function for testability
        return getVisibleQuestionIds(allQuestions, state.factsProfile.facts);
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
      
      // Badge system actions
      getBadgeProgress: () => {
        const state = get();
        return state.badgeProgress;
      },
      
      getEarnedBadges: () => {
        const state = get();
        return ACHIEVEMENT_BADGES.filter((badge: Badge) => 
          state.earnedBadges.includes(badge.id)
        );
      },
      
      getNextRecommendedBadges: () => {
        const state = get();
        const defaultDeviceProfile: DeviceProfile = {
          currentDevice: detectCurrentDevice(),
          otherDevices: {
            hasWindows: false,
            hasMac: false,
            hasLinux: false,
            hasIPhone: false,
            hasAndroid: false,
            hasIPad: false
          }
        };
        
        const context: BadgeEvaluationContext = {
          answers: state.answers,
          currentScore: state.overallScore,
          currentLevel: state.currentLevel,
          deviceProfile: state.deviceProfile || defaultDeviceProfile,
          quickWinsCompleted: state.quickWinsCompleted,
          streakData: state.streakData,
          sessionStartTime: state.sessionStartTime || undefined,
          earnedBadges: state.earnedBadges
        };
        return state.badgeEngine.getNextRecommendedBadges(context);
      },
      
      updateBadgeProgress: () => {
        const state = get();
        const defaultDeviceProfile: DeviceProfile = {
          currentDevice: detectCurrentDevice(),
          otherDevices: {
            hasWindows: false,
            hasMac: false,
            hasLinux: false,
            hasIPhone: false,
            hasAndroid: false,
            hasIPad: false
          }
        };
        
        const context: BadgeEvaluationContext = {
          answers: state.answers,
          currentScore: state.overallScore,
          currentLevel: state.currentLevel,
          deviceProfile: state.deviceProfile || defaultDeviceProfile,
          quickWinsCompleted: state.quickWinsCompleted,
          streakData: state.streakData,
          sessionStartTime: state.sessionStartTime || undefined,
          earnedBadges: state.earnedBadges
        };
        
        const result = state.badgeEngine.evaluateAllBadges(context);
        
        // Update earned badges if new ones were unlocked
        const newEarnedBadges = [...state.earnedBadges];
        let hasNewBadges = false;
        
        for (const unlock of result.newlyUnlocked) {
          if (!newEarnedBadges.includes(unlock.badge.id)) {
            newEarnedBadges.push(unlock.badge.id);
            hasNewBadges = true;
          }
        }
        
        set({
          badgeProgress: result.allProgress,
          recentBadgeUnlocks: [...state.recentBadgeUnlocks, ...result.newlyUnlocked],
          earnedBadges: newEarnedBadges,
          showCelebration: hasNewBadges || state.showCelebration
        });
      },
      
      clearRecentBadgeUnlocks: () => {
        set({ recentBadgeUnlocks: [] });
      },
      
      updateStreakData: () => {
        const state = get();
        const today = new Date();
        const todayStr = today.toDateString();
        
        // Check if user was active today
        const hasActivityToday = Object.values(state.answers).some(answer => {
          if (!answer.timestamp) return false;
          const answerDate = answer.timestamp instanceof Date ? answer.timestamp : new Date(answer.timestamp);
          return answerDate.toDateString() === todayStr;
        });
        
        if (hasActivityToday && (!state.streakData.lastActivityDate || 
            state.streakData.lastActivityDate.toDateString() !== todayStr)) {
          
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          
          const wasActiveYesterday = state.streakData.lastActivityDate?.toDateString() === yesterday.toDateString();
          
          const newStreakData: StreakData = {
            currentStreak: wasActiveYesterday ? state.streakData.currentStreak + 1 : 1,
            longestStreak: Math.max(
              state.streakData.longestStreak, 
              wasActiveYesterday ? state.streakData.currentStreak + 1 : 1
            ),
            lastActivityDate: today,
            streakHistory: [...state.streakData.streakHistory, today]
          };
          
          set({ streakData: newStreakData });
        }
      },
    };
  },
    {
      name: 'cfa:v2:answers',
      // Only persist answers and earned badges, recompute scores on load
      partialize: (state) => ({ 
        answers: state.answers,
        earnedBadges: state.earnedBadges,
        factsData: state.factsData  // Persist Registry data
      }),
    }
  )
);

// Recompute scores when store loads (in case questions/scoring changed)
export const initializeStore = () => {
  const store = useAssessmentStore.getState();
  
  // Initialize device detection facts - these are stable environmental facts
  // Initialize device detection  
  const device = detectCurrentDevice();
  
  // MIGRATION: Use simplified Registry methods alongside complex facts system
  // This demonstrates the new simple approach while maintaining backwards compatibility
  store.setFact('os_detected', device.os);
  store.setFact('browser_detected', device.browser);
  store.setFact('device_type', device.type);
  store.setFact('device_detection_completed', true);
  
  // Legacy complex approach (keeping for backwards compatibility during migration)
  store.factsActions.injectFact('os_detected', device.os, { source: 'auto-detection' });
  store.factsActions.injectFact('browser_detected', device.browser, { source: 'auto-detection' });
  store.factsActions.injectFact('device_type', device.type, { source: 'auto-detection' });
  
  // Set a general flag that any detection has happened
  store.factsActions.injectFact('device_detection_completed', true, { source: 'auto-detection' });
  
  // Facts and questions are now initialized
  
  
  // Pre-populate answers from onboarding (always run this, not just when we have existing answers)
  const prePopulatedAnswers = prePopulateFromOnboarding(store.answers);
  
  // Rebuild facts from persisted answers + device detection
  store.factsActions.importLegacyData(prePopulatedAnswers);
  
  // Set device profile for backwards compatibility - always set this
  const deviceProfile = {
    currentDevice: device,
    otherDevices: {
      hasWindows: device.os === 'windows',
      hasMac: device.os === 'mac', 
      hasLinux: device.os === 'linux',
      hasIPhone: device.os === 'ios',
      hasAndroid: device.os === 'android',
      hasIPad: device.type === 'tablet'
    }
  };

  // If we have any answers (existing or pre-populated), recalculate scores
  if (Object.keys(prePopulatedAnswers).length > 0) {
    const scoreResult = calculateOverallScore(store.questionBank, prePopulatedAnswers);
    const nextLevelProgress = getNextLevelProgress(scoreResult.overallScore);
    
    // Calculate quickWins count - simplified for initialization
    const quickWinsCompleted = 0;
    const totalQuickWins = Object.values(store.questionBank.domains)
      .flatMap(d => d.levels.flatMap(l => l.questions))
      .filter(q => q.priority >= 8000).length; // Quick wins have priority 8000+
    
    // Convert domain scores to the expected format
    const domainScoresSimplified: Record<string, number> = {};
    Object.entries(scoreResult.domainScores).forEach(([domain, scores]) => {
      domainScoresSimplified[domain] = scores.score;
    });
    
    // Apply state updates directly
    useAssessmentStore.setState({
      answers: prePopulatedAnswers,
      overallScore: scoreResult.overallScore,
      domainScores: domainScoresSimplified,
      currentLevel: nextLevelProgress.currentLevel,
      quickWinsCompleted,
      totalQuickWins,
      nextLevelProgress,
      deviceProfile,
      sessionStartTime: new Date(), // Track session start for speed badges
    });
    
    // Initialize badge progress and streak data
    const updatedStore = useAssessmentStore.getState();
    updatedStore.updateBadgeProgress();
    updatedStore.updateStreakData();
  } else {
    // Even if no answers, initialize device profile and session start time
    useAssessmentStore.setState({
      deviceProfile,
      sessionStartTime: new Date()
    });
  }
};
