import { useState } from 'react';
import { Zap, Clock, HelpCircle } from 'lucide-react';
import type { Question } from '../features/assessment/engine/schema';

interface QuestionCardProps {
  question: Question;
  answer?: boolean | number;
  onAnswer: (value: boolean | number) => void;
  domainTitle: string;
}

export function QuestionCard({ question, answer, onAnswer, domainTitle }: QuestionCardProps) {
  const [showHelp, setShowHelp] = useState(false);
  
  const handleYNAnswer = (value: boolean) => {
    onAnswer(value);
  };

  const handleScaleAnswer = (value: number) => {
    onAnswer(value);
  };

  const isAnswered = answer !== undefined;
  const isPositiveAnswer = question.type === 'YN' 
    ? answer === true 
    : typeof answer === 'number' && answer >= 4;

  return (
    <div className={`
      bg-white rounded-lg shadow-md p-5 border-l-4 transition-all duration-200 hover:shadow-lg
      ${question.quickWin ? 'border-l-yellow-400 bg-gradient-to-r from-yellow-50 to-white' : 'border-l-gray-300'}
      ${isAnswered ? (isPositiveAnswer ? 'ring-2 ring-green-200' : 'ring-2 ring-orange-200') : ''}
    `}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {question.quickWin && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
              <Zap className="w-3 h-3" />
              Quick Win
            </div>
          )}
          {question.timeEstimate && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              <Clock className="w-3 h-3" />
              {question.timeEstimate}
            </div>
          )}
          <div className="text-xs text-gray-500 font-medium">
            {domainTitle}
          </div>
        </div>
        
        <div className="text-xs font-medium text-gray-600">
          +{question.weight}{question.quickWin ? '×1.25' : ''} pts
        </div>
      </div>

      {/* Question */}
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-800 mb-2">
          {question.text}
        </h3>
        
        {question.explanation && (
          <div className="flex items-start gap-2">
            <HelpCircle 
              className="w-4 h-4 text-gray-400 mt-0.5 cursor-pointer" 
              onClick={() => setShowHelp(!showHelp)}
            />
            {showHelp && (
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                {question.explanation}
                {question.actionHint && (
                  <span className="block mt-2 text-blue-600 font-medium">
                    💡 {question.actionHint}
                  </span>
                )}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Answer Options */}
      {question.type === 'YN' ? (
        <div className="flex gap-3">
          <button
            onClick={() => handleYNAnswer(true)}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${answer === true 
                ? 'bg-green-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-700'
              }
            `}
          >
            ✅ Yes
          </button>
          <button
            onClick={() => handleYNAnswer(false)}
            className={`
              flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200
              ${answer === false 
                ? 'bg-red-500 text-white shadow-md' 
                : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-700'
              }
            `}
          >
            ❌ No
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600 mb-2">
            <span>Not at all</span>
            <span>Completely</span>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => handleScaleAnswer(value)}
                className={`
                  flex-1 py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200
                  ${answer === value
                    ? 'bg-blue-500 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-blue-100 hover:text-blue-700'
                  }
                `}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Positive feedback for answered questions */}
      {isAnswered && isPositiveAnswer && (
        <div className="mt-3 p-2 bg-green-50 text-green-700 rounded-md text-sm">
          <span className="font-medium">Great! </span>
          {question.quickWin ? 'This quick win gives you an instant security boost! 🚀' 
            : 'You\'re building good security habits! 👍'}
        </div>
      )}

      {/* Encouragement for negative answers */}
      {isAnswered && !isPositiveAnswer && question.actionHint && (
        <div className="mt-3 p-2 bg-blue-50 text-blue-700 rounded-md text-sm">
          <span className="font-medium">💡 Quick tip: </span>
          {question.actionHint}
        </div>
      )}
    </div>
  );
}
