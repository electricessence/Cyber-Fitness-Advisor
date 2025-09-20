import { TrendingUp, Clock, Zap } from 'lucide-react';

interface Recommendation {
  question: {
    id: string;
    text: string;
    quickWin?: boolean;
    timeEstimate?: string;
    actionHint?: string;
    weight: number;
  };
  domain: string;
  potentialPoints: number;
  impact: 'high' | 'medium' | 'low';
}

interface RecommendationsProps {
  recommendations: Recommendation[];
  onQuestionClick?: (questionId: string) => void;
}

const IMPACT_COLORS = {
  high: 'from-red-500 to-red-600',
  medium: 'from-orange-500 to-orange-600', 
  low: 'from-yellow-500 to-yellow-600',
};

const IMPACT_LABELS = {
  high: 'High Impact',
  medium: 'Good Impact',
  low: 'Small Impact',
};

export function Recommendations({ recommendations, onQuestionClick }: RecommendationsProps) {
  if (recommendations.length === 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
        <div className="text-green-600 text-lg font-medium mb-2">
          🎉 Outstanding security posture!
        </div>
        <p className="text-green-700">
          You've implemented all the high-impact security measures we recommend. Your digital security is in excellent shape!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold text-gray-800">
          Your Next Security Wins
        </h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        These actions will give you the biggest security improvements for your time investment.
      </p>

      <div className="space-y-4">
        {recommendations.map((rec, index) => (
          <div
            key={rec.question.id}
            className={`
              border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md
              ${rec.question.quickWin ? 'border-yellow-300 bg-yellow-50' : 'border-gray-200'}
            `}
            onClick={() => onQuestionClick?.(rec.question.id)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-gray-400">
                  #{index + 1}
                </div>
                
                {rec.question.quickWin && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium">
                    <Zap className="w-3 h-3" />
                    Quick Win
                  </div>
                )}
                
                <div className={`
                  px-2 py-1 rounded-full text-xs font-medium text-white
                  bg-gradient-to-r ${IMPACT_COLORS[rec.impact]}
                `}>
                  {IMPACT_LABELS[rec.impact]}
                </div>
                
                {rec.question.timeEstimate && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                    <Clock className="w-3 h-3" />
                    {rec.question.timeEstimate}
                  </div>
                )}
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-green-600">
                  +{Math.round(rec.potentialPoints)}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>

            <h3 className="font-medium text-gray-800 mb-2">
              {rec.question.text}
            </h3>
            
            <div className="text-sm text-gray-600 mb-3">
              <span className="font-medium">{rec.domain}</span>
            </div>

            {rec.question.actionHint && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-3">
                <div className="text-sm text-blue-800">
                  <span className="font-medium">💡 Quick guide: </span>
                  {rec.question.actionHint}
                </div>
              </div>
            )}

            <div className="mt-3 text-xs text-gray-500">
              Click anywhere to answer this question →
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <span className="font-medium">⚡ Strategy: </span>
          Start with <span className="font-medium">Quick Wins</span> to build momentum, then tackle the bigger improvements. 
          Each completed action makes the next one easier!
        </div>
      </div>
    </div>
  );
}
