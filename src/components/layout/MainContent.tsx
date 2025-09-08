import { UniversalCard } from '../UniversalCard';
import { useAssessmentStore } from '../../features/assessment/state/store';
import { OnboardingBanner } from '../OnboardingBanner';

interface MainContentProps {
  currentDomain: string;
  currentLevel: number;
}

export function MainContent({ currentDomain, currentLevel }: MainContentProps) {
  const { 
    answers, 
    answerQuestion,
    getOrderedAvailableQuestions
  } = useAssessmentStore();

  // Get available questions with proper ordering (onboarding first)
  const availableQuestions = getOrderedAvailableQuestions?.() || [];
  
  // Debug logging
  console.log('MainContent Debug:', {
    currentDomain,
    currentLevel,
    availableQuestionsCount: availableQuestions.length,
    answersCount: Object.keys(answers).length,
    availableQuestionIds: availableQuestions.map(q => q.id)
  });

  if (availableQuestions.length === 0) {
    return (
      <div className="lg:col-span-3">
        <div className="text-center py-8 text-gray-600 bg-white rounded-lg shadow-md">
          <p className="text-lg">🎉 All available questions completed!</p>
          <p className="text-sm mt-2">Great progress! Keep exploring other areas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-3">
      <OnboardingBanner />
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Available Questions
        </h2>
        <p className="text-gray-600">
          Answer these questions to improve your cybersecurity posture and unlock advanced topics.
        </p>
      </div>
      
      <div className="space-y-6">
        {availableQuestions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No questions available right now.</p>
          </div>
        ) : (
          availableQuestions.map((question) => (
            <div key={question.id} id={`question-${question.id}`}>
              <UniversalCard
                mode="question"
                id={question.id}
                title={question.text}
                category="Assessment"
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
