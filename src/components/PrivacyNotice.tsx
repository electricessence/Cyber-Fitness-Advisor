import { useState } from 'react';
import { Shield, X, Eye, Github, Wifi } from 'lucide-react';

interface PrivacyNoticeProps {
  onDismiss: () => void;
  isMinimized?: boolean;
  inline?: boolean; // New prop for inline positioning
}

export function PrivacyNotice({ onDismiss, isMinimized = false, inline = false }: PrivacyNoticeProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(!isMinimized);

  if (!isExpanded && isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[60]">
        <button
          onClick={() => setIsExpanded(true)}
          className="bg-green-600 text-white p-3 rounded-full shadow-lg hover:bg-green-700 transition-colors"
          title="Privacy & Trust Info"
        >
          <Shield className="w-5 h-5" />
        </button>
      </div>
    );
  }

  // Inline banner style (below ScoreBar)
  if (inline) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border-2 border-green-200 overflow-hidden animate-slide-down">
        {/* Compact Header */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div className="flex-shrink-0">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-green-800 text-sm">
                🔒 Your Privacy is Protected
              </h3>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-xs text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="text-green-600">✓</span>
                  <span className="hidden sm:inline">Runs 100% locally</span>
                  <span className="sm:hidden">100% local</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-600">✓</span>
                  <span className="hidden sm:inline">No tracking</span>
                  <span className="sm:hidden">No tracking</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="text-green-600">✓</span>
                  <span className="hidden sm:inline">Data stays on your device</span>
                  <span className="sm:hidden">Data local</span>
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="flex-shrink-0 p-2 hover:bg-green-100 rounded text-green-600 transition-colors ml-2"
            title="Dismiss"
            aria-label="Dismiss privacy notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Original fixed positioning style
  return (
    <div className="fixed top-4 right-4 max-w-sm z-[60] animate-slide-in">
      <div className="bg-white rounded-lg shadow-lg border border-green-200 overflow-hidden">
        {/* Header */}
        <div className="bg-green-50 px-4 py-3 border-b border-green-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-800 text-sm">
                🔒 Your Privacy is Protected
              </h3>
            </div>
            <div className="flex gap-1">
              {!isMinimized && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="p-1 hover:bg-green-100 rounded text-green-600"
                  title="Minimize"
                  aria-label="Minimize privacy notice"
                >
                  <Eye className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onDismiss}
                className="p-1 hover:bg-green-100 rounded text-green-600"
                title="Dismiss"
                aria-label="Dismiss privacy notice"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div className="text-sm text-gray-700 space-y-2">
            <p className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>No servers - runs 100% in your browser</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>No data collection or tracking</span>
            </p>
            <p className="flex items-start gap-2">
              <span className="text-green-600 mt-0.5">✓</span>
              <span>All answers stay on your device</span>
            </p>
          </div>

          {!showDetails ? (
            <button
              onClick={() => setShowDetails(true)}
              className="text-blue-600 text-sm font-medium hover:text-blue-700 transition-colors"
            >
              How can I verify this? →
            </button>
          ) : (
            <div className="space-y-3 text-sm">
              <div className="bg-gray-50 rounded p-3 space-y-2">
                <h4 className="font-medium text-gray-800 text-xs uppercase tracking-wide">
                  🔍 Verify Yourself:
                </h4>
                
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-start gap-2">
                    <Wifi className="w-3 h-3 mt-0.5 text-blue-500" />
                    <span>Open browser dev tools (F12) → Network tab → See zero external requests</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Shield className="w-3 h-3 mt-0.5 text-green-500" />
                    <span>Disconnect your internet → App still works completely</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <Github className="w-3 h-3 mt-0.5 text-purple-500" />
                    <span>All source code is open on GitHub for inspection</span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded p-3 border border-amber-200">
                <h4 className="font-medium text-amber-800 text-xs uppercase tracking-wide mb-1">
                  ⚠️ Security Lesson:
                </h4>
                <p className="text-xs text-amber-700">
                  <strong>Always be skeptical</strong> of any app asking for security information. 
                  Even this one! The difference is you can verify these claims yourself.
                </p>
              </div>

              <button
                onClick={() => setShowDetails(false)}
                className="text-gray-500 text-xs hover:text-gray-700"
              >
                ← Hide details
              </button>
            </div>
          )}

          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              💡 <strong>Pro tip:</strong> Any security tool collecting sensitive data should earn your trust through transparency and verifiability.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
