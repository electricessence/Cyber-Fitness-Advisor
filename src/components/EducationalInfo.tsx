import { useState } from 'react';
import { BookOpen, ChevronDown, ChevronUp, Shield, Zap, Clock, Lightbulb } from 'lucide-react';
import type { Question } from '../features/assessment/engine/schema';
import { getQuestionThreat, getQuestionTopics } from '../features/assessment/data/security-topics';

interface EducationalInfoProps {
  question: Question;
  userAnswer: boolean | number | string;
  isVisible?: boolean;
}

export function EducationalInfo({ question, userAnswer, isVisible = true }: EducationalInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  // Determine if this was a good or concerning answer
  const isGoodAnswer = question.type === 'YN' 
    ? userAnswer === true 
    : question.type === 'SCALE'
    ? (userAnswer as number) >= 4
    : question.type === 'ACTION' && typeof userAnswer === 'string'
    ? question.actionOptions?.find(opt => opt.id === userAnswer)?.points && 
      question.actionOptions.find(opt => opt.id === userAnswer)!.points > 0
    : false;

  const answerText = question.type === 'YN' 
    ? (userAnswer ? 'Yes' : 'No')
    : question.type === 'SCALE'
    ? `${userAnswer}/5`
    : question.type === 'ACTION' && typeof userAnswer === 'string'
    ? question.actionOptions?.find(opt => opt.id === userAnswer)?.text || userAnswer
    : String(userAnswer);

  // Get the threat this question addresses
  const primaryThreat = getQuestionThreat(question.relatedTopics);
  const relatedTopics = getQuestionTopics(question.relatedTopics);

  // Get educational response for action questions
  const selectedActionOption = question.type === 'ACTION' && typeof userAnswer === 'string' 
    ? question.actionOptions?.find(opt => opt.id === userAnswer)
    : null;

  // Create impact message
  const impactMessage = selectedActionOption?.impact ||
    primaryThreat || 
    question.explanation || 
    (isGoodAnswer ? 'Security practice in place' : 'Security opportunity');

  return (
    <div className={`mt-3 border rounded-lg overflow-hidden ${
      isGoodAnswer ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'
    }`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full flex items-center justify-between p-4 text-left hover:bg-opacity-80 transition-colors ${
          isGoodAnswer ? 'hover:bg-green-100' : 'hover:bg-orange-100'
        }`}
      >
        <div className="flex items-center gap-3">
          <BookOpen className={`w-5 h-5 ${
            isGoodAnswer ? 'text-green-600' : 'text-orange-600'
          }`} />
          <div>
            <h4 className={`font-medium ${
              isGoodAnswer ? 'text-green-900' : 'text-orange-900'
            }`}>
              {/* Show the primary threat/impact instead of generic praise */}
              {impactMessage}
            </h4>
            <p className={`text-sm ${
              isGoodAnswer ? 'text-green-700' : 'text-orange-700'
            }`}>
              Your answer: <span className="font-medium">{answerText}</span> 
              {!isExpanded && ' • Click to learn more'}
            </p>
          </div>
        </div>
        <div className={`${isGoodAnswer ? 'text-green-600' : 'text-orange-600'}`}>
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </div>
      </button>

      {isExpanded && (
        <div className={`border-t px-4 pb-4 ${
          isGoodAnswer ? 'border-green-200 bg-green-25' : 'border-orange-200 bg-orange-25'
        }`}>
          {/* Security Topic Details */}
          {relatedTopics.length > 0 && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-4 h-4 text-gray-600" />
                <h5 className="font-medium text-gray-900 text-sm">Security threat</h5>
              </div>
              <div className="ml-6 space-y-3">
                {relatedTopics.map(topic => (
                  <div key={topic.id} className="text-sm text-gray-700">
                    <p className="font-medium text-gray-900 mb-1">{topic.title}</p>
                    <p className="mb-2">{topic.description}</p>
                    <div className="text-xs text-gray-600">
                      <p><span className="font-medium">Impact:</span> {topic.impact}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action guidance */}
          {question.actionHint && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-2">
                <Lightbulb className="w-4 h-4 text-gray-600" />
                <h5 className="font-medium text-gray-900 text-sm">
                  {isGoodAnswer ? 'Keep it up' : 'How to improve'}
                </h5>
              </div>
              <p className="text-sm text-gray-700 ml-6">
                {question.actionHint}
              </p>
            </div>
          )}

          {/* Quick win indicator */}
          {question.quickWin && (
            <div className="mt-3">
              <div className="flex items-center gap-2 mb-1">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Quick Win!</span>
                {question.timeEstimate && (
                  <>
                    <Clock className="w-4 h-4 text-blue-600 ml-2" />
                    <span className="text-sm text-blue-700">{question.timeEstimate}</span>
                  </>
                )}
              </div>
              <p className="text-sm text-blue-700 ml-6">
                This is a high-impact security improvement that's easy to implement.
              </p>
            </div>
          )}

          {/* Motivational message based on answer */}
          <div className={`mt-3 p-3 rounded-lg text-sm ${
            isGoodAnswer 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-blue-100 text-blue-800 border border-blue-200'
          }`}>
            {isGoodAnswer ? (
              <p>
                🎉 <strong>You're doing great!</strong> This security practice puts you ahead of most people. 
                Keep up the good work!
              </p>
            ) : (
              <p>
                💪 <strong>Every improvement counts!</strong> Small changes in your security habits 
                can make a huge difference in protecting your digital life.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
