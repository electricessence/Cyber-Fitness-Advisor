import React, { useState, useEffect } from 'react';
import { RegistryPatternDemo } from '../RegistryPatternDemo';

export const AuthoringDiagnostics: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'diagnostics' | 'registry'>('diagnostics');

  // Keyboard toggle (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        setIsOpen(!isOpen);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded opacity-75">
        Press Ctrl+Shift+D for diagnostics
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold">Development Tools</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'diagnostics' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Diagnostics
              </button>
              <button
                onClick={() => setActiveTab('registry')}
                className={`px-3 py-1 text-sm rounded ${
                  activeTab === 'registry' 
                    ? 'bg-white shadow text-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Registry Demo
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto max-h-[60vh]">
          {activeTab === 'diagnostics' ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded">
                <h3 className="font-semibold text-gray-700 mb-2">Content Diagnostics</h3>
                <div className="text-sm text-gray-600">
                  <div className="text-green-600">All systems operational</div>
                  <p className="mt-2">Diagnostic tools for content validation will be implemented here.</p>
                </div>
              </div>
            </div>
          ) : (
            <RegistryPatternDemo />
          )}
        </div>

        <div className="bg-gray-50 px-4 py-3 text-xs text-gray-600">
          <p>Development panel with content diagnostics and Registry pattern demo.</p>
          <p>Press Ctrl+Shift+D to toggle this panel.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthoringDiagnostics;