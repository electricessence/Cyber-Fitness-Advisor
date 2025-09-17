import { Menu, X, Shield, FileDown, FileUp, Github } from 'lucide-react';

interface AppHeaderProps {
  answeredQuestions: number;
  totalQuestions: number;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  onResetClick: () => void;
  onExportData: () => void;
  onImportData: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function AppHeader({ 
  answeredQuestions,
  totalQuestions,
  mobileMenuOpen,
  setMobileMenuOpen,
  onResetClick,
  onExportData,
  onImportData
}: AppHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-2xl font-bold text-gray-900">
              Cyber Fitness Advisor
            </h1>
          </div>
          
          <div className="hidden sm:flex items-center gap-4">
            <div className="text-sm text-gray-600">
              {answeredQuestions}/{totalQuestions} questions answered
            </div>
            <button
              onClick={onExportData}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              title="Export your progress"
            >
              <FileDown className="w-4 h-4" />
              Export
            </button>
            <label className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">
              <FileUp className="w-4 h-4" />
              Import
              <input type="file" accept=".json" onChange={onImportData} className="hidden" />
            </label>
            <button
              onClick={onResetClick}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Reset
            </button>
            <a
              href="https://github.com/electricessence/Cyber-Fitness-Advisor"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
              title="View source code, report issues, or suggest improvements on GitHub"
            >
              <Github className="w-4 h-4" />
              GitHub
            </a>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="sm:hidden p-2 text-gray-600"
            aria-label={mobileMenuOpen ? "Close mobile menu" : "Open mobile menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </header>
  );
}
