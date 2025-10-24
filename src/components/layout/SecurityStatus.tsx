import { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAssessmentStore } from '../../features/assessment/state/store';
import type { Answer, Question } from '../../features/assessment/engine/schema';

interface CategorizedAnswer extends Answer {
  domain: string;
  level: number;
  question: Question | null;
  category: 'shields-up' | 'to-do' | 'room-for-improvement';
  visualIndicator: { icon: string; severity: string };
  statement: string;          // Human-readable statement
  isResettable: boolean;      // Whether this answer can be reset
}

export function SecurityStatus() {
  const { answers, getHistoricAnswers, removeAnswer, resetAssessment } = useAssessmentStore();
  
  const [expandedSections, setExpandedSections] = useState({
    'shields-up': false,  // Collapsed by default
    'to-do': true,
    'room-for-improvement': true,
  });
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  // Categorize answers based on answer option properties
  const categorizedAnswers = useMemo(() => {
    const historicAnswers = getHistoricAnswers();
    
    const categorized = historicAnswers.map((answer): CategorizedAnswer => {
      const question = answer.question;
      
      // Find the specific answer option that was chosen
      const answerOption = question?.options?.find(opt => opt.id === answer.value);
      
      // Get statement from answer option or create fallback
      const statement = answerOption?.statement || 
        (question ? `${question.text}: ${answer.value}` : `${answer.questionId}: ${answer.value}`);
      
      // Get category from answer option or fallback to points-based logic
      let category: 'shields-up' | 'to-do' | 'room-for-improvement';
      if (answerOption?.statusCategory) {
        category = answerOption.statusCategory;
      } else {
        // Fallback to points-based categorization
        const points = answer.pointsEarned || 0;
        if (points >= 8) {
          category = 'shields-up';
        } else if (points >= 3) {
          category = 'to-do';
        } else {
          category = 'room-for-improvement';
        }
      }
      
      // Determine if this answer can be reset (simple rule: if only one option, can't reset)
      const isResettable = Boolean(question?.options && question.options.length > 1);
      
      // Set visual indicator based on category
      let visualIndicator: { icon: string; severity: string };
      switch (category) {
        case 'shields-up':
          visualIndicator = { icon: '✅', severity: 'check' };
          break;
        case 'to-do':
          visualIndicator = { icon: '🟡', severity: 'plan' };
          break;
        case 'room-for-improvement':
          visualIndicator = { icon: '🔴', severity: 'warn' };
          break;
      }
      
      return {
        ...answer,
        category,
        visualIndicator,
        statement,
        isResettable
      };
    });

    return {
      'shields-up': categorized.filter(a => a.category === 'shields-up'),
      'to-do': categorized.filter(a => a.category === 'to-do'),
      'room-for-improvement': categorized.filter(a => a.category === 'room-for-improvement')
    };
  }, [answers, getHistoricAnswers]); // Re-calculate when answers change

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleRemoveAnswer = (questionId: string) => {
    removeAnswer(questionId);
  };

  const handleClearAll = () => {
    if (showConfirmClear) {
      resetAssessment();
      setShowConfirmClear(false);
    } else {
      setShowConfirmClear(true);
    }
  };

  const totalAnswers = Object.values(categorizedAnswers).flat().length;

  if (totalAnswers === 0) {
    return (
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Security Status</h3>
          <div className="text-center text-gray-500 py-8">
            <div className="text-4xl mb-2">📋</div>
            <p>Answer questions to see them appear here</p>
            <p className="text-sm mt-1">Your responses will be organized by priority</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:col-span-2">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-gray-800">Security Status</h3>
          <span className="text-sm text-gray-600">{totalAnswers} answers</span>
        </div>

        {/* Shields Up Section */}
        <AccordionSection
          title="🛡️ Shields Up"
          count={categorizedAnswers['shields-up'].length}
          isExpanded={expandedSections['shields-up']}
          onToggle={() => toggleSection('shields-up')}
          color="green"
        >
          {categorizedAnswers['shields-up'].map((answer) => (
            <AnswerItem 
              key={answer.questionId} 
              answer={answer} 
              onRemove={handleRemoveAnswer}
              showHelp={false}
            />
          ))}
        </AccordionSection>

        {/* To Do Section */}
        <AccordionSection
          title="📋 To Do"
          count={categorizedAnswers['to-do'].length}
          isExpanded={expandedSections['to-do']}
          onToggle={() => toggleSection('to-do')}
          color="yellow"
        >
          {categorizedAnswers['to-do'].map((answer) => (
            <AnswerItem 
              key={answer.questionId} 
              answer={answer} 
              onRemove={handleRemoveAnswer}
              showHelp={false}
            />
          ))}
        </AccordionSection>

        {/* Room for Improvement Section */}
        <AccordionSection
          title="🎯 Room for Improvement"
          count={categorizedAnswers['room-for-improvement'].length}
          isExpanded={expandedSections['room-for-improvement']}
          onToggle={() => toggleSection('room-for-improvement')}
          color="red"
        >
          {categorizedAnswers['room-for-improvement'].map((answer) => (
            <AnswerItem 
              key={answer.questionId} 
              answer={answer} 
              onRemove={handleRemoveAnswer}
              showHelp={true}
            />
          ))}
        </AccordionSection>

        {/* Clear All Button */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          {showConfirmClear ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">Reset entire assessment?</span>
              <button
                onClick={handleClearAll}
                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
              >
                Confirm Reset
              </button>
              <button
                onClick={() => setShowConfirmClear(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded hover:bg-gray-200 transition-colors"
            >
              Clear All Answers
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface AccordionSectionProps {
  title: string;
  count: number;
  isExpanded: boolean;
  onToggle: () => void;
  color: 'green' | 'yellow' | 'red';
  children: React.ReactNode;
}

function AccordionSection({ title, count, isExpanded, onToggle, color, children }: AccordionSectionProps) {
  const colorClasses = {
    green: 'border-green-200 bg-green-50',
    yellow: 'border-yellow-200 bg-yellow-50', 
    red: 'border-red-200 bg-red-50'
  };

  return (
    <div className={`border rounded-lg mb-4 ${colorClasses[color]}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-lg">{title}</span>
          {count > 0 && (
            <span className="bg-white/70 text-gray-700 text-sm px-2 py-1 rounded-full">
              {count}
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronDown className="w-5 h-5 text-gray-500" />
        ) : (
          <ChevronRight className="w-5 h-5 text-gray-500" />
        )}
      </button>
      
      {isExpanded && count > 0 && (
        <div className="px-4 pb-4">
          <div className="space-y-2">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

interface AnswerItemProps {
  answer: CategorizedAnswer;
  onRemove: (questionId: string) => void;
  showHelp: boolean;
}

function AnswerItem({ answer, onRemove, showHelp }: AnswerItemProps) {
  const handleRemove = () => {
    onRemove(answer.questionId);
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded border">
      <span className="text-lg">{answer.visualIndicator.icon}</span>
      
      <div className="flex-1 min-w-0">
        <div className="font-medium text-gray-800 mb-2">
          {answer.statement}
        </div>
        
        <div className="flex items-center gap-2">
          {answer.isResettable ? (
            <button
              onClick={handleRemove}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded hover:bg-gray-200 transition-colors"
            >
              Change Answer
            </button>
          ) : (
            <span className="text-xs text-gray-500 px-2 py-1">
              Cannot reset
            </span>
          )}
          
          {showHelp && answer.category === 'room-for-improvement' && (
            <button className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors">
              How to Fix
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
