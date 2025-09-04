import { useState } from 'react';
import { CheckCircle, Circle, Clock, Zap, Shield } from 'lucide-react';
import { SecureHelp } from './SecureHelp';
import { getRecommendedActions } from '../data/secureActions';

interface ActionRecommendationsProps {
  browserInfo: {
    browser: string;
    platform: string;
  };
  userProfile: {
    techComfort: 'beginner' | 'comfortable' | 'advanced';
    mainConcerns: string[];
  };
  onActionComplete?: (actionId: string) => void;
  onNavigateToSection?: (domainId: string) => void;
  className?: string;
}

export function ActionRecommendations({ 
  browserInfo, 
  userProfile, 
  onActionComplete,
  onNavigateToSection,
  className = "" 
}: ActionRecommendationsProps) {
  const [completedActions, setCompletedActions] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('cyber-fitness-completed-actions');
    return new Set(saved ? JSON.parse(saved) : []);
  });

  const [expandedAction, setExpandedAction] = useState<string | null>(null);

  const recommendedActions = getRecommendedActions(browserInfo, userProfile, 6);

  const toggleActionComplete = (actionId: string) => {
    const newCompleted = new Set(completedActions);
    
    if (newCompleted.has(actionId)) {
      newCompleted.delete(actionId);
    } else {
      newCompleted.add(actionId);
      onActionComplete?.(actionId);
    }
    
    setCompletedActions(newCompleted);
    localStorage.setItem('cyber-fitness-completed-actions', JSON.stringify([...newCompleted]));
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return <Zap className="w-4 h-4 text-green-600" />;
      case 'medium': return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'advanced': return <Shield className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          🎯 Recommended Actions for You
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Based on your {browserInfo.browser} browser on {browserInfo.platform} and your concerns about{' '}
          {userProfile.mainConcerns.join(', ')}. Check off actions as you complete them!
        </p>

        <div className="space-y-3">
          {recommendedActions.map((action) => {
            const isCompleted = completedActions.has(action.id);
            const isExpanded = expandedAction === action.id;
            
            return (
              <div key={action.id} className="border border-gray-200 rounded-lg">
                <div 
                  className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                    isCompleted ? 'bg-green-50 border-green-200' : ''
                  }`}
                  onClick={() => setExpandedAction(isExpanded ? null : action.id)}
                >
                  <div className="flex items-start gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleActionComplete(action.id);
                      }}
                      className="mt-0.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-400 hover:text-green-600" />
                      )}
                    </button>

                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-medium ${isCompleted ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                          {action.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getImpactColor(action.impact)}`}>
                            {action.impact} impact
                          </span>
                          {getDifficultyIcon(action.difficulty)}
                          <span className="text-xs text-gray-500">{action.timeEstimate}</span>
                        </div>
                      </div>
                      
                      <p className={`text-sm ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                        {action.description}
                      </p>

                      {!isCompleted && (
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-blue-600">
                            Click to see how to get started →
                          </p>
                          {action.id === 'ublock_origin' && onNavigateToSection && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onNavigateToSection('browsing');
                              }}
                              className="ml-2 px-3 py-1 text-xs bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
                            >
                              Take Action Now
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && !isCompleted && (
                  <div className="px-4 pb-4">
                    <SecureHelp
                      searchTerm={action.searchTerm}
                      description={`Here's how to ${action.title.toLowerCase()}: ${action.description}`}
                      howToFind={action.howToFind}
                      installSteps={action.installSteps}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Why No Direct Links?</p>
              <p>
                Secure applications should never automatically redirect you to external sites. 
                This prevents tracking, ensures you verify sources yourself, and builds good security habits.
                Always search for official sources and verify before downloading or installing anything.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
