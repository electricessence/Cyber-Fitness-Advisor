import { useState, useMemo } from 'react';
import { TodaysTaskCard } from '../TodaysTaskCard';
import { UniversalCard } from '../UniversalCard';
import { SecurityLevelDisplay } from '../SecurityLevelDisplay';
import { useAssessmentStore } from '../../features/assessment/state/store';
import { prioritizeQuestions, getTodaysTask, sortQuestionsByPriority } from '../../features/prioritization/questionPriority';
import { getPersonalizedProgress } from '../../features/progress/simpleProgress';
import { calculateSecurityProgression } from '../../features/progression/securityLevels';
import { ChevronDown, ChevronUp, Filter } from 'lucide-react';

interface PrioritizedMainContentProps {
  currentDomain: string;
  currentLevel: number;
}

export function PrioritizedMainContent({ currentDomain, currentLevel }: PrioritizedMainContentProps) {
  const { 
    questionBank, 
    answers, 
    answerQuestion,
    deviceProfile
  } = useAssessmentStore();

  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Get all questions from current domain/level
  const currentDomainObj = questionBank.domains.find(d => d.id === currentDomain);
  const currentLevelObj = currentDomainObj?.levels.find(l => l.level === currentLevel);
  const allQuestions = currentLevelObj?.questions || [];

  // Filter out answered questions (unless expired)
  const unansweredQuestions = allQuestions.filter(question => {
    const answer = answers[question.id];
    return !answer || (answer.isExpired === true);
  });

  // Prioritize questions using our new system
  const prioritizedQuestions = useMemo(() => {
    if (!deviceProfile || unansweredQuestions.length === 0) {
      return [];
    }
    return prioritizeQuestions(unansweredQuestions, deviceProfile, answers);
  }, [unansweredQuestions, deviceProfile, answers]);

  // Sort questions by priority
  const sortedQuestions = useMemo(() => {
    return sortQuestionsByPriority(prioritizedQuestions);
  }, [prioritizedQuestions]);

  // Get today's task
  const todaysTask = useMemo(() => {
    if (prioritizedQuestions.length === 0) return null;
    return getTodaysTask(prioritizedQuestions, answers);
  }, [prioritizedQuestions, answers]);

  // Filter questions by category
  const filteredQuestions = useMemo(() => {
    if (filterCategory === 'all') return sortedQuestions;
    return sortedQuestions.filter(q => q.category === filterCategory);
  }, [sortedQuestions, filterCategory]);

  // Questions to show (limited or all)
  const questionsToShow = showAllQuestions ? filteredQuestions : filteredQuestions.slice(0, 5);

  // Get personalized progress and security level
  const personalizedProgress = useMemo(() => {
    if (!deviceProfile) return null;
    return getPersonalizedProgress(questionBank, deviceProfile, answers, currentLevel);
  }, [questionBank, deviceProfile, answers, currentLevel]);

  const securityProgression = useMemo(() => {
    if (!personalizedProgress || !deviceProfile) return null;
    
    // Convert percentage to security score (0-100)
    const securityScore = personalizedProgress.percentage;
    
    // Get recent answers (last 10 or so)
    const recentAnswers = Object.values(answers)
      .filter(answer => answer.timestamp)
      .sort((a, b) => {
        const aTime = a.timestamp instanceof Date ? a.timestamp.getTime() : 0;
        const bTime = b.timestamp instanceof Date ? b.timestamp.getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 10);
    
    return calculateSecurityProgression(securityScore, recentAnswers, deviceProfile);
  }, [personalizedProgress, answers, deviceProfile]);

  const handleAnswer = (questionId: string, value: string) => {
    answerQuestion(questionId, value);
  };

  if (prioritizedQuestions.length === 0 && allQuestions.length > 0) {
    return (
      <div className="lg:col-span-3">
        <div className="text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
          <p className="text-lg">🎉 All questions in this level completed!</p>
          <p className="text-sm mt-2">Select another level to continue your assessment.</p>
        </div>
      </div>
    );
  }

  const categoryStats = {
    todays_task: sortedQuestions.filter(q => q.category === 'todays_task').length,
    high_impact_recommended: sortedQuestions.filter(q => q.category === 'high_impact_recommended').length,
    recommended: sortedQuestions.filter(q => q.category === 'recommended').length,
    high_impact: sortedQuestions.filter(q => q.category === 'high_impact').length,
    standard: sortedQuestions.filter(q => q.category === 'standard').length,
  };

  return (
    <div className="lg:col-span-3 space-y-6">
      {/* Today's Task - Special Treatment */}
      {todaysTask && (
        <TodaysTaskCard 
          todaysTask={todaysTask} 
          onComplete={handleAnswer}
        />
      )}

      {/* Domain/Level Header */}
      {currentDomainObj && currentLevelObj && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {currentDomainObj.title} - Level {currentLevel}
          </h2>
          <p className="text-gray-600 mb-4">
            {currentLevel === 0 ? 'Start with these essential security basics!' :
             currentLevel === 1 ? 'Build on your foundation with these improvements!' :
             'Advanced security measures for comprehensive protection!'}
          </p>
          
          {/* Security Level Progression */}
          {securityProgression && (
            <SecurityLevelDisplay progression={securityProgression} />
          )}
          
          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterCategory('all')}
              className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${
                filterCategory === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Filter className="w-4 h-4" />
              All ({sortedQuestions.length})
            </button>
            
            {categoryStats.high_impact_recommended > 0 && (
              <button
                onClick={() => setFilterCategory('high_impact_recommended')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterCategory === 'high_impact_recommended'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                🎯 Recommended ({categoryStats.high_impact_recommended})
              </button>
            )}
            
            {categoryStats.high_impact > 0 && (
              <button
                onClick={() => setFilterCategory('high_impact')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterCategory === 'high_impact'
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ⚡ High Impact ({categoryStats.high_impact})
              </button>
            )}
            
            {categoryStats.recommended > 0 && (
              <button
                onClick={() => setFilterCategory('recommended')}
                className={`px-3 py-1 rounded-full text-sm font-medium ${
                  filterCategory === 'recommended'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                👍 Good Ideas ({categoryStats.recommended})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Prioritized Questions */}
      {questionsToShow.map((question) => (
        <div key={question.id} className="relative">
          {/* Priority Badge */}
          <div className="absolute -top-2 -right-2 z-10">
            {question.category === 'high_impact_recommended' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                🎯 Recommended
              </span>
            )}
            {question.category === 'high_impact' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                ⚡ High Impact
              </span>
            )}
            {question.category === 'recommended' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                👍 Good Idea
              </span>
            )}
            {question.difficultyScore <= 2 && question.estimatedMinutes <= 5 && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 ml-1">
                ⚡ Quick Win
              </span>
            )}
          </div>
          
          <UniversalCard
            id={question.id}
            title={question.text}
            category={question.category}
            mode="question"
            priority={question.priority.urgencyScore}
            isQuickWin={question.priority.isEasyWin}
            timeEstimate={`${question.estimatedMinutes} min`}
            impact={question.priority.level === 'critical' ? 'high' : 
                   question.priority.level === 'high' ? 'high' :
                   question.priority.level === 'medium' ? 'medium' : 'low'}
            actionHint={question.actionHint}
            detailedGuidance={question.explanation}
            options={question.options}
            onAnswer={(value) => handleAnswer(question.id, value)}
          />
        </div>
      ))}

      {/* Show More/Less Button */}
      {filteredQuestions.length > 5 && (
        <div className="text-center">
          <button
            onClick={() => setShowAllQuestions(!showAllQuestions)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
          >
            {showAllQuestions ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {filteredQuestions.length - 5} More Questions
              </>
            )}
          </button>
        </div>
      )}

      {filteredQuestions.length === 0 && sortedQuestions.length > 0 && (
        <div className="text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
          <p className="text-lg">No questions match the selected filter.</p>
          <button
            onClick={() => setFilterCategory('all')}
            className="mt-2 text-blue-600 hover:text-blue-800 underline"
          >
            Show all questions
          </button>
        </div>
      )}
    </div>
  );
}
