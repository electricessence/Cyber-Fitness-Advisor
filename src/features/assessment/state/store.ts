import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionBank, Answer, Question } from '../engine/schema';
import { calculateOverallScore, getTopRecommendations, getNextLevelProgress, calculateQuestionPoints } from '../engine/scoring';
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

  return updatedAnswers;
}

interface AssessmentState {
  // Data
  questionBank: QuestionBank;
  answers: Record<string, Answer>;
  
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
  resetAssessment: () => void;
  getRecommendations: () => ReturnType<typeof getTopRecommendations>;
  getHistoricAnswers: () => Array<Answer & { domain: string; level: number; question: Question | null }>;
  dismissCelebration: () => void;
}

const initialState = {
  questionBank: questionsData as QuestionBank,
  answers: {},
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
        
        const newAnswers = {
          ...state.answers,
          [questionId]: {
            questionId,
            value,
            timestamp: new Date(),
            pointsEarned,
            questionText: question?.text
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
      
      resetAssessment: () => {
        set({
          ...initialState,
          questionBank: get().questionBank, // Keep the question bank
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
