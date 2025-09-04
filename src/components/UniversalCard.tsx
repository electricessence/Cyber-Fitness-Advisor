import { Zap, Clock, HelpCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import type { AnswerOption } from '../features/assessment/engine/schema';

interface UniversalCardProps {
  id: string;
  title: string;
  category: string;
  priority?: number;
  isQuickWin?: boolean;
  timeEstimate?: string;
  impact?: 'high' | 'medium' | 'low';
  currentAnswer?: string; // Now stores the option ID
  detailedGuidance?: string;
  actionHint?: string;
  options?: AnswerOption[]; // The answer options for this question/action - optional for backward compatibility
  onAnswer?: (optionId: string) => void;
  onClick?: () => void;
  mode: 'question' | 'completed' | 'preview';
  defaultLayout?: 'buttons' | 'radio' | 'dropdown';
  // For follow-up behavior
  onFollowUp?: (questionId: string, followUpData: any) => void;
}

export function UniversalCard({
  title,
  category: _category, // Keep for potential future use
  priority,
  isQuickWin,
  timeEstimate,
  impact,
  currentAnswer,
  detailedGuidance,
  actionHint,
  options,
  onAnswer,
  onClick,
  mode = 'question',
  defaultLayout = 'buttons'
}: UniversalCardProps) {

  // Get styling based on answer state
  const getCardStyling = () => {
    if (mode === 'question') {
      return {
        border: isQuickWin ? 'border-yellow-300' : 'border-gray-200',
        background: isQuickWin ? 'bg-yellow-50' : 'bg-white',
        hover: 'hover:shadow-md'
      };
    }
    
    if (mode === 'completed') {
      switch (currentAnswer) {
        case 'yes':
          return {
            border: 'border-green-200',
            background: 'bg-green-50',
            hover: ''
          };
        case 'no':
          return {
            border: 'border-red-200', 
            background: 'bg-red-50',
            hover: ''
          };
        case 'unsure':
          return {
            border: 'border-yellow-200',
            background: 'bg-yellow-50',
            hover: ''
          };
        default:
          return {
            border: 'border-gray-200',
            background: 'bg-white',
            hover: ''
          };
      }
    }

    return {
      border: 'border-gray-200',
      background: 'bg-white',
      hover: 'hover:shadow-md'
    };
  };

  const getImpactBadge = () => {
    if (!impact) return null;
    
    const colors = {
      high: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
      medium: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
      low: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
    };

    return (
      <div className={`px-2 py-1 rounded-full text-xs font-medium ${colors[impact]}`}>
        {impact.charAt(0).toUpperCase() + impact.slice(1)} Impact
      </div>
    );
  };

  const styling = getCardStyling();

  return (
    <div 
      className={`
        border rounded-lg p-4 transition-all duration-200 ${styling.border} ${styling.background} ${styling.hover}
        ${mode === 'question' ? 'cursor-pointer' : ''}
      `}
      onClick={mode === 'question' ? onClick : undefined}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {priority && (
            <div className="text-lg font-bold text-gray-400">#{priority}</div>
          )}
          
          {isQuickWin && (
            <div className="flex items-center gap-1 px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
              <Zap className="w-3 h-3" />
              Quick Win
            </div>
          )}
          
          {getImpactBadge()}
          
          {timeEstimate && (
            <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
              <Clock className="w-3 h-3" />
              {timeEstimate}
            </div>
          )}
        </div>

        {mode === 'completed' && currentAnswer && (
          <div className="flex items-center gap-2">
            {currentAnswer === 'yes' && <CheckCircle className="w-5 h-5 text-green-600" />}
            {currentAnswer === 'no' && <AlertTriangle className="w-5 h-5 text-red-600" />}
            {currentAnswer === 'unsure' && <HelpCircle className="w-5 h-5 text-yellow-600" />}
            <span className="text-xs text-gray-500 capitalize">{currentAnswer}</span>
          </div>
        )}
      </div>

      {/* Question/Title */}
      <h3 className="font-medium text-gray-800 mb-2">
        {title}
      </h3>

      {/* Detailed Guidance for Unsure answers */}
      {mode === 'completed' && currentAnswer === 'unsure' && detailedGuidance && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
          <div className="text-sm text-blue-800">
            <span className="font-medium">💡 How to check this:</span> {detailedGuidance}
          </div>
        </div>
      )}

      {/* Answer Buttons for Questions */}
      {mode === 'question' && onAnswer && options && (
        <div className="mt-3">
          {defaultLayout === 'buttons' ? (
            /* Button layout */
            <div className="space-y-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log('UniversalCard option clicked:', option.id);
                    if (onAnswer) {
                      onAnswer(option.id);
                    }
                  }}
                  className={`w-full py-3 px-4 rounded-lg text-left transition-all duration-200 flex items-center justify-between
                           ${currentAnswer === option.id
                             ? option.target === 'shields-up'
                               ? 'bg-green-500 text-white shadow-md'
                               : option.target === 'todo'
                               ? 'bg-blue-500 text-white shadow-md'
                               : option.target === 'needs-improvement'
                               ? 'bg-orange-500 text-white shadow-md'
                               : 'bg-gray-500 text-white shadow-md'
                             : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                           }`}
                >
                  <span>{option.text}</span>
                  {mode !== 'question' && option.points > 0 && (
                    <span className="text-sm opacity-75">+{option.points} pts</span>
                  )}
                </button>
              ))}
            </div>
          ) : defaultLayout === 'radio' ? (
            /* Radio button layout */
            <div className="space-y-2">
              {options.map((option) => (
                <label
                  key={option.id}
                  className="flex items-center space-x-3 cursor-pointer p-2 hover:bg-gray-50 rounded-lg"
                >
                  <input
                    type="radio"
                    name={`question-options`}
                    value={option.id}
                    checked={currentAnswer === option.id}
                    onChange={() => onAnswer(option.id)}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span className="flex-1">{option.text}</span>
                  {option.points > 0 && (
                    <span className="text-sm text-gray-500">+{option.points} pts</span>
                  )}
                </label>
              ))}
            </div>
          ) : (
            /* Dropdown layout */
            <select
              value={currentAnswer || ''}
              onChange={(e) => onAnswer(e.target.value)}
              className="w-full py-3 px-4 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an option...</option>
              {options.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.text} {option.points > 0 ? `(+${option.points} pts)` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Action Hint - moved to bottom after answer options */}
      {mode === 'question' && actionHint && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mt-3">
          <div className="text-sm text-blue-800">
            <span className="font-medium">💡 How to do this:</span> {actionHint}
          </div>
        </div>
      )}

      {/* Preview mode footer */}
      {mode === 'preview' && (
        <div className="mt-3 text-xs text-gray-500">
          Click to jump to this question →
        </div>
      )}
    </div>
  );
}
