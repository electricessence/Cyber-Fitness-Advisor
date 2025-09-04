import { useState } from 'react';
import { useAssessmentStore } from '../features/assessment/state/store';
import { History, TrendingUp, Award, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import { EducationalInfo } from './EducationalInfo';

export function AnswerHistory() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedAnswers, setExpandedAnswers] = useState<Set<string>>(new Set());
  const getHistoricAnswers = useAssessmentStore(state => state.getHistoricAnswers);
  
  const historicAnswers = getHistoricAnswers();
  
  if (historicAnswers.length === 0) {
    return null;
  }

  const totalPointsEarned = historicAnswers.reduce((sum, answer) => sum + (answer.pointsEarned || 0), 0);

  const toggleAnswerExpansion = (questionId: string) => {
    const newExpanded = new Set(expandedAnswers);
    if (newExpanded.has(questionId)) {
      newExpanded.delete(questionId);
    } else {
      newExpanded.add(questionId);
    }
    setExpandedAnswers(newExpanded);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-blue-600" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Answer History</h3>
            <p className="text-sm text-gray-500">
              {historicAnswers.length} answers • {Math.round(totalPointsEarned)} total points
            </p>
          </div>
        </div>
        <div className="text-2xl text-gray-400">
          {isOpen ? '−' : '+'}
        </div>
      </button>
      
      {isOpen && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {historicAnswers.map((answer) => {
              const isExpanded = expandedAnswers.has(answer.questionId);
              return (
                <div key={answer.questionId} className="bg-gray-50 rounded-lg overflow-hidden">
                  {/* Main answer display */}
                  <div className="flex items-start gap-3 p-3">
                    <div className="flex-shrink-0">
                      {answer.pointsEarned && answer.pointsEarned > 0 ? (
                        <Award className="w-5 h-5 text-green-600" />
                      ) : (
                        <TrendingUp className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    
                    <div className="flex-grow min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {answer.questionText || answer.questionId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {answer.domain} • Level {answer.level}
                          </p>
                        </div>
                        
                        <div className="text-right flex-shrink-0">
                          {answer.pointsEarned !== undefined && (
                            <p className={`text-sm font-medium ${
                              answer.pointsEarned > 0 ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              +{Math.round(answer.pointsEarned)} pts
                            </p>
                          )}
                          {answer.timestamp && (
                            <div className="flex items-center gap-1 text-xs text-gray-400">
                              <Clock className="w-3 h-3" />
                              {new Date(answer.timestamp).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-1 flex items-center justify-between">
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Answer:</span>{' '}
                          {typeof answer.value === 'boolean' 
                            ? (answer.value ? 'Yes' : 'No')
                            : `${answer.value}/5`
                          }
                        </p>
                        
                        {answer.question && (answer.question.explanation || answer.question.actionHint) && (
                          <button
                            onClick={() => toggleAnswerExpansion(answer.questionId)}
                            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800"
                          >
                            {isExpanded ? (
                              <>
                                <span>Hide details</span>
                                <ChevronUp className="w-3 h-3" />
                              </>
                            ) : (
                              <>
                                <span>Learn more</span>
                                <ChevronDown className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Educational content */}
                  {isExpanded && answer.question && (
                    <div className="border-t border-gray-200">
                      <EducationalInfo 
                        question={answer.question} 
                        userAnswer={answer.value}
                        isVisible={true}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-100">
            <div className="bg-blue-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-1">
                💡 Improvement Opportunities
              </h4>
              <p className="text-xs text-blue-700">
                Questions with lower points show areas where small changes can boost your security score significantly!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
