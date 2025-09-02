import { Search, Shield, AlertTriangle } from 'lucide-react';

interface SecureHelpProps {
  searchTerm: string;
  description: string;
  howToFind?: string[];
  installSteps?: string[];
  className?: string;
}

export function SecureHelp({ 
  searchTerm, 
  description, 
  howToFind = [], 
  installSteps = [],
  className = "" 
}: SecureHelpProps) {
  return (
    <div className={`bg-blue-50 rounded-lg p-4 border border-blue-200 ${className}`}>
      <div className="flex items-start gap-3">
        <Search className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="space-y-3">
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Find: {searchTerm}</h4>
            <p className="text-sm text-blue-800">{description}</p>
          </div>

          {howToFind.length > 0 && (
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">How to find it:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                {howToFind.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {installSteps.length > 0 && (
            <div>
              <p className="text-sm font-medium text-blue-900 mb-1">Typical installation:</p>
              <ul className="text-sm text-blue-800 space-y-1">
                {installSteps.map((step, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold">{index + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-amber-50 rounded p-3 border border-amber-200">
            <div className="flex items-start gap-2">
              <Shield className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-amber-800">
                <p className="font-medium mb-1">🔒 Security Note:</p>
                <p>
                  We don't provide direct links to avoid tracking and ensure you visit the genuine source. 
                  Always verify you're on the official site before downloading software.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExternalLinkWarning() {
  return (
    <div className="bg-red-50 rounded-lg p-3 border border-red-200">
      <div className="flex items-start gap-2">
        <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="text-xs text-red-800">
          <p className="font-medium">⚠️ External Link Warning</p>
          <p>Secure apps should never automatically redirect you to external sites. Always search for and verify official sources yourself.</p>
        </div>
      </div>
    </div>
  );
}
