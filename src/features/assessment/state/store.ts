import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QuestionBank, Answer } from '../engine/schema';
import { calculateOverallScore, getTopRecommendations, getNextLevelProgress } from '../engine/scoring';
import questionsData from '../data/questions.json';

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
  answerQuestion: (questionId: string, value: boolean | number) => void;
  resetAssessment: () => void;
  getRecommendations: () => ReturnType<typeof getTopRecommendations>;
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
      
      answerQuestion: (questionId: string, value: boolean | number) => {
        const state = get();
        const previousScore = state.overallScore;
        
        const newAnswers = {
          ...state.answers,
          [questionId]: {
            questionId,
            value,
          },
        };
        
        const scoreResult = calculateOverallScore(state.questionBank, newAnswers);
        const nextLevelProgress = getNextLevelProgress(scoreResult.overallScore);
        
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
  if (Object.keys(store.answers).length > 0) {
    const scoreResult = calculateOverallScore(store.questionBank, store.answers);
    const nextLevelProgress = getNextLevelProgress(scoreResult.overallScore);
    
    useAssessmentStore.setState({
      overallScore: scoreResult.overallScore,
      domainScores: scoreResult.domainScores,
      currentLevel: scoreResult.level,
      quickWinsCompleted: scoreResult.quickWinsCompleted,
      totalQuickWins: scoreResult.totalQuickWins,
      nextLevelProgress,
    });
  }
};
