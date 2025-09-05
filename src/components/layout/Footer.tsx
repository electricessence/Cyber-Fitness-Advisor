import { Shield, Github } from 'lucide-react';
import { VersionBadge } from '../VersionBadge';

export function Footer() {
  return (
    <footer className="bg-white border-t mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-600">
          <p className="mb-2">
            🛡️ Cyber Fitness Advisor - Your personal cybersecurity coach
          </p>
          <p className="text-sm text-gray-500 mb-3">
            Start with quick wins, build momentum, stay secure. 
            No data leaves your browser.
          </p>
          
          {/* Version Badge */}
          <div className="mb-4">
            <VersionBadge />
          </div>
          
          {/* Security Policy Statement */}
          <div className="max-w-2xl mx-auto p-3 bg-blue-50 rounded-lg border border-blue-200 mb-4">
            <div className="flex items-start gap-2 text-left">
              <Shield className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-blue-800">
                <p className="font-medium mb-1">Privacy-First Design</p>
                <p>Your data never leaves your device. All processing happens locally in your browser. No tracking, no analytics, no data collection.</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center items-center gap-4 text-sm">
            <a 
              href="https://github.com/electricessence/Cyber-Fitness-Advisor" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <Github className="w-4 h-4" />
              View Source
            </a>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500">MIT License</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
