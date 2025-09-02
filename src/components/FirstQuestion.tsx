import { useState } from 'react';
import { Shield, ChevronRight, Sparkles } from 'lucide-react';

interface ConfidenceQuestion {
  question: string;
  options: {
    id: string;
    text: string;
    description: string;
    icon: string;
    focusArea: string;
  }[];
}

interface FirstQuestionProps {
  onAnswer: (answer: { focusArea: string; confidence: string }) => void;
}

const CONFIDENCE_QUESTION: ConfidenceQuestion = {
  question: "What would make you feel more confident online?",
  options: [
    {
      id: "secure_accounts",
      text: "Knowing my accounts are protected",
      description: "Feel confident that your email, banking, and social accounts are secure",
      icon: "🔐",
      focusArea: "authentication"
    },
    {
      id: "safe_browsing", 
      text: "Browsing without worrying about threats",
      description: "Surf the web freely, knowing you're protected from malicious sites and scams",
      icon: "🛡️",
      focusArea: "browsing"
    },
    {
      id: "privacy_control",
      text: "Controlling who sees my personal info",
      description: "Take charge of your digital privacy and limit unwanted tracking",
      icon: "🔒",
      focusArea: "privacy"
    },
    {
      id: "understanding_security",
      text: "Understanding what actually keeps me safe",
      description: "Learn the 'why' behind security advice so you can make informed decisions",
      icon: "🎓",
      focusArea: "education"
    }
  ]
};

export function FirstQuestion({ onAnswer }: FirstQuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleOptionSelect = (optionId: string) => {
    setSelectedOption(optionId);
  };

  const handleContinue = () => {
    if (!selectedOption) return;
    
    const selected = CONFIDENCE_QUESTION.options.find(opt => opt.id === selectedOption);
    if (selected) {
      setShowConfirmation(true);
      setTimeout(() => {
        onAnswer({
          focusArea: selected.focusArea,
          confidence: selected.id
        });
      }, 1000);
    }
  };

  if (showConfirmation) {
    const selected = CONFIDENCE_QUESTION.options.find(opt => opt.id === selectedOption);
    return (
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
          <Sparkles className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-green-800 mb-2">Perfect choice!</h3>
          <p className="text-green-700">
            We'll focus on <strong>{selected?.text.toLowerCase()}</strong>
          </p>
          <p className="text-sm text-green-600 mt-2">
            Starting your personalized security journey...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Shield className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          {CONFIDENCE_QUESTION.question}
        </h3>
        <p className="text-gray-600 text-sm">
          This helps us personalize your experience and show you the most relevant security improvements first.
        </p>
      </div>

      <div className="space-y-3">
        {CONFIDENCE_QUESTION.options.map((option) => (
          <button
            key={option.id}
            onClick={() => handleOptionSelect(option.id)}
            className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${
              selectedOption === option.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{option.icon}</span>
              <div className="flex-1">
                <h4 className="font-medium text-gray-900 mb-1">
                  {option.text}
                </h4>
                <p className="text-sm text-gray-600">
                  {option.description}
                </p>
              </div>
              {selectedOption === option.id && (
                <ChevronRight className="w-5 h-5 text-blue-600 mt-0.5" />
              )}
            </div>
          </button>
        ))}
      </div>

      {selectedOption && (
        <div className="pt-4">
          <button
            onClick={handleContinue}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            Start My Security Journey
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="text-center">
        <p className="text-xs text-gray-500">
          💡 Don't worry - you can explore all areas as you progress!
        </p>
      </div>
    </div>
  );
}
