import { UniversalCard } from '../UniversalCard';
import { useAssessmentStore } from '../../features/assessment/state/store';

interface MainContentProps {
  currentDomain: string;
  currentLevel: number;
}

export function MainContent({ currentDomain, currentLevel }: MainContentProps) {
  const { 
    questionBank, 
    answers, 
    answerQuestion
  } = useAssessmentStore();

  // Get current questions based on selected domain and level
  const currentDomainObj = questionBank.domains.find(d => d.id === currentDomain);
  const currentLevelObj = currentDomainObj?.levels.find(l => l.level === currentLevel);
  
  // Filter out already answered questions
  const allQuestions = currentLevelObj?.questions || [];
  const unansweredQuestions = allQuestions.filter(question => !answers[question.id]);

  if (unansweredQuestions.length === 0 && allQuestions.length > 0) {
    return (
      <div className="lg:col-span-3">
        <div className="text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
          <p className="text-lg">🎉 All questions in this level completed!</p>
          <p className="text-sm mt-2">Select another level to continue your assessment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3">
      {currentDomainObj && currentLevelObj && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {currentDomainObj.title} - Level {currentLevel}
          </h2>
          <p className="text-gray-600">
            {currentLevel === 0 ? 'Start with these essential security basics!' :
             currentLevel === 1 ? 'Build on your foundation with these improvements!' :
             'Advanced security measures for comprehensive protection!'}
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        {unansweredQuestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No questions available for this level.</p>
          </div>
        ) : (
          unansweredQuestions.map((question) => (
            <div key={question.id} id={`question-${question.id}`}>
              <UniversalCard
                mode="question"
                id={question.id}
                title={question.text}
                category={currentDomainObj?.title || ''}
                priority={question.weight}
                isQuickWin={question.quickWin}
                timeEstimate={question.timeEstimate}
                impact={question.weight >= 8 ? 'high' : question.weight >= 5 ? 'medium' : 'low'}
                currentAnswer={answers[question.id]?.value as string}
                detailedGuidance={question.explanation}
                actionHint={question.actionHint}
                options={question.options || [
                  // Fallback for old-style questions - convert Y/N to options format
                  {
                    id: 'yes',
                    text: '✅ Yes',
                    displayText: 'Yes',
                    points: question.weight,
                    target: 'shields-up' as const,
                    impact: 'Good security practice!'
                  },
                  {
                    id: 'unsure',
                    text: '🤔 Not sure',
                    displayText: 'Check this setting',
                    points: Math.floor(question.weight * 0.3),
                    target: 'todo' as const,
                  },
                  {
                    id: 'no',
                    text: '❌ No',
                    displayText: 'No',
                    points: 0,
                    target: 'todo' as const,
                    advice: question.explanation
                  }
                ]}
                onAnswer={(answer) => answerQuestion(question.id, answer)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
