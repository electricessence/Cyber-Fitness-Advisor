import { useState, useEffect } from 'react';
import { Chrome, Globe, Shield, Clock, Zap } from 'lucide-react';
import actionsData from '../features/assessment/data/actions.json';

interface SmartQuestionProps {
  onAnswer: (answer: boolean, actionId?: string) => void;
  browserInfo: BrowserInfo;
}

interface BrowserInfo {
  name: string;
  version: string;
  os: string;
  mobile: boolean;
}

const getBrowserIcon = (browserName: string) => {
  switch (browserName.toLowerCase()) {
    case 'chrome':
    case 'chromium':
    case 'edge':
      return Chrome;
    default: 
      return Globe;
  }
};

export function SmartQuestion({ onAnswer, browserInfo }: SmartQuestionProps) {
  const [recommendedAction, setRecommendedAction] = useState<any>(null);

  useEffect(() => {
    // Smart action selection based on browser
    const browserKey = browserInfo.name.toLowerCase();
    const recommendations = actionsData.smartRecommendations.browserSpecific[browserKey as keyof typeof actionsData.smartRecommendations.browserSpecific] || 
                          actionsData.smartRecommendations.browserSpecific.chrome;
    
    // Get the first high-impact, low-effort action
    const topActionId = recommendations[0];
    const action = actionsData.quickActions.find(a => a.id === topActionId);
    setRecommendedAction(action);
  }, [browserInfo]);

  if (!recommendedAction) return null;

  const BrowserIcon = getBrowserIcon(browserInfo.name);

  return (
    <div className="space-y-6">
      {/* Browser Detection Display */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h3 className="flex items-center gap-2 font-medium text-blue-800 mb-3">
          <BrowserIcon className="w-5 h-5" />
          What we can see from your browser:
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-blue-700">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Browser: {browserInfo.name} {browserInfo.version}
          </div>
          <div className="flex items-center gap-2 text-blue-700">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Platform: {browserInfo.os}
          </div>
          <div className="flex items-center gap-2 text-blue-700">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Device: {browserInfo.mobile ? 'Mobile' : 'Desktop'}
          </div>
          <div className="flex items-center gap-2 text-blue-700">
            <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
            Language: {navigator.language}
          </div>
        </div>
        <p className="text-xs text-blue-600 mt-3">
          💡 This is all public info your browser shares with every website you visit
        </p>
      </div>

      {/* Smart Recommendation */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Perfect! Here's your #1 quick security win:
            </h3>
            
            <div className="bg-green-50 rounded-lg p-4 mb-4">
              <h4 className="font-medium text-green-800 mb-2">
                {recommendedAction.title}
              </h4>
              <p className="text-green-700 text-sm mb-3">
                {recommendedAction.description}
              </p>
              
              <div className="flex flex-wrap gap-2 mb-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-200 text-green-800 text-xs rounded-full">
                  <Zap className="w-3 h-3" />
                  High Impact
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                  <Clock className="w-3 h-3" />
                  {recommendedAction.timeEstimate}
                </span>
              </div>
              
              <ul className="text-xs text-green-700 space-y-1">
                {recommendedAction.benefits.slice(0, 2).map((benefit: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-1">
                    <span className="text-green-500 mt-0.5">✓</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            {/* The Question */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">
                Do you already have {recommendedAction.title.toLowerCase()}?
              </h4>
              
              <div className="flex gap-3">
                <button
                  onClick={() => onAnswer(true, recommendedAction.id)}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  ✓ Yes, I have this
                </button>
                <button
                  onClick={() => onAnswer(false, recommendedAction.id)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  → No, help me set it up
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
