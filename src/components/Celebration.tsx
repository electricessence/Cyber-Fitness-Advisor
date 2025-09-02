import { useEffect } from 'react';
import { Sparkles, Zap, Trophy } from 'lucide-react';

interface CelebrationProps {
  show: boolean;
  scoreIncrease: number;
  level: number;
  onDismiss: () => void;
}

export function Celebration({ show, scoreIncrease, level, onDismiss }: CelebrationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onDismiss, 3000); // Auto-dismiss after 3 seconds
      return () => clearTimeout(timer);
    }
  }, [show, onDismiss]);

  if (!show) return null;

  const isLevelUp = level > 0 && scoreIncrease > 15;
  const isGoodProgress = scoreIncrease >= 5;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className="bg-white rounded-lg shadow-2xl p-6 text-center transform animate-bounce pointer-events-auto max-w-sm mx-4"
        onClick={onDismiss}
      >
        {isLevelUp ? (
          <>
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Level Up! 🎉
            </h3>
            <p className="text-gray-600">
              You've reached Level {level}!
            </p>
          </>
        ) : isGoodProgress ? (
          <>
            <Zap className="w-12 h-12 text-blue-500 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Great Progress! ⚡
            </h3>
            <p className="text-gray-600">
              +{Math.round(scoreIncrease)} points earned!
            </p>
          </>
        ) : (
          <>
            <Sparkles className="w-10 h-10 text-green-500 mx-auto mb-4" />
            <h3 className="text-md font-bold text-gray-800 mb-2">
              Nice work! ✨
            </h3>
            <p className="text-gray-600">
              Every step counts!
            </p>
          </>
        )}
        
        <div className="mt-4">
          <button 
            onClick={onDismiss}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Continue →
          </button>
        </div>
      </div>
    </div>
  );
}
