import { useAssessmentStore } from '../../features/assessment/state/store';

interface AppSidebarProps {
  currentDomain: string;
  currentLevel: number;
  mobileMenuOpen: boolean;
  setCurrentDomain: (domain: string) => void;
  setCurrentLevel: (level: number) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export function AppSidebar({
  currentDomain,
  currentLevel,
  mobileMenuOpen,
  setCurrentDomain,
  setCurrentLevel,
  setMobileMenuOpen
}: AppSidebarProps) {
  const { questionBank, answers, domainScores } = useAssessmentStore();

  return (
    <div className={`lg:col-span-1 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
      <div className="bg-white rounded-lg shadow-md p-4 sticky top-24">
        <h3 className="font-bold text-gray-800 mb-4">Assessment Sections</h3>
        
        {questionBank.domains.map((domain) => (
          <div key={domain.id} className="mb-4">
            <h4 className="font-medium text-gray-700 mb-2">
              {domain.title}
              {domainScores[domain.id] !== undefined && domainScores[domain.id] > 0 && (
                <span className="ml-2 text-sm text-blue-600 font-bold">
                  {Math.round(domainScores[domain.id])}%
                </span>
              )}
            </h4>
            
            {domain.levels.map((level) => {
              const isActive = currentDomain === domain.id && currentLevel === level.level;
              const levelAnswered = level.questions.every(q => answers[q.id]);
              
              return (
                <button
                  key={`${domain.id}-${level.level}`}
                  onClick={() => {
                    setCurrentDomain(domain.id);
                    setCurrentLevel(level.level);
                    setMobileMenuOpen(false);
                  }}
                  className={`
                    w-full text-left px-3 py-2 rounded-md text-sm mb-1 transition-colors
                    ${isActive 
                      ? 'bg-blue-100 text-blue-800 font-medium' 
                      : levelAnswered 
                        ? 'text-green-600 hover:bg-green-50'
                        : 'text-gray-600 hover:bg-gray-50'
                    }
                  `}
                >
                  Level {level.level} {levelAnswered && '✓'}
                  <div className="text-xs text-gray-500">
                    {level.questions.length} questions
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
