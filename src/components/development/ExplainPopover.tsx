import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';

interface ExplainProps {
  title: string;
  semantics?: {
    version: string;
    rules?: string[];
    behavior?: string;
    implementation?: string;
  };
  debug?: {
    componentState?: Record<string, any>;
    conditionalLogic?: string[];
    dataFlow?: string[];
  };
  content?: {
    questionId?: string;
    gateConditions?: string[];
    effects?: string[];
    scoring?: string;
  };
  children: React.ReactNode;
  className?: string;
}

export const ExplainPopover: React.FC<ExplainProps> = ({
  title,
  semantics,
  debug,
  content,
  children,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const updatePosition = () => {
    if (triggerRef.current && popoverRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight
      };

      let top = triggerRect.bottom + 8;
      let left = triggerRect.left;

      // Adjust if popover goes off right edge
      if (left + popoverRect.width > viewport.width) {
        left = viewport.width - popoverRect.width - 16;
      }

      // Adjust if popover goes off bottom edge
      if (top + popoverRect.height > viewport.height) {
        top = triggerRect.top - popoverRect.height - 8;
      }

      setPosition({ top, left });
    }
  };

  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('scroll', updatePosition);
      window.addEventListener('resize', updatePosition);
      return () => {
        window.removeEventListener('scroll', updatePosition);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [isOpen]);

  const formatJSON = (obj: any) => {
    return JSON.stringify(obj, null, 2);
  };

  return (
    <>
      <div
        ref={triggerRef}
        className={`relative inline-flex items-center gap-1 cursor-help ${className}`}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
        <HelpCircle className="w-3 h-3 text-gray-400 hover:text-blue-500 transition-colors" />
      </div>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Popover */}
          <div
            ref={popoverRef}
            className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg max-w-md w-96"
            style={{
              top: `${position.top}px`,
              left: `${position.left}px`
            }}
          >
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-3 border-b pb-2">
                {title}
              </h3>

              <div className="space-y-3 text-xs">
                {semantics && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Semantic Rules (v{semantics.version})</h4>
                    {semantics.behavior && (
                      <div className="mb-2">
                        <span className="font-medium">Behavior:</span> {semantics.behavior}
                      </div>
                    )}
                    {semantics.rules && semantics.rules.length > 0 && (
                      <ul className="list-disc list-inside space-y-1 text-gray-600">
                        {semantics.rules.map((rule, index) => (
                          <li key={index}>{rule}</li>
                        ))}
                      </ul>
                    )}
                    {semantics.implementation && (
                      <div className="mt-2 bg-gray-50 p-2 rounded">
                        <span className="font-medium">Implementation:</span> {semantics.implementation}
                      </div>
                    )}
                  </div>
                )}

                {content && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Content Details</h4>
                    {content.questionId && (
                      <div className="mb-1">
                        <span className="font-medium">Question ID:</span>{' '}
                        <code className="bg-gray-100 px-1 py-0.5 rounded">{content.questionId}</code>
                      </div>
                    )}
                    {content.gateConditions && content.gateConditions.length > 0 && (
                      <div className="mb-1">
                        <span className="font-medium">Gate Conditions:</span>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {content.gateConditions.map((condition, index) => (
                            <li key={index} className="font-mono text-xs">{condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {content.effects && content.effects.length > 0 && (
                      <div className="mb-1">
                        <span className="font-medium">Effects:</span>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {content.effects.map((effect, index) => (
                            <li key={index} className="font-mono text-xs">{effect}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {content.scoring && (
                      <div className="mb-1">
                        <span className="font-medium">Scoring:</span> {content.scoring}
                      </div>
                    )}
                  </div>
                )}

                {debug && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-1">Debug Information</h4>
                    {debug.componentState && (
                      <details className="mb-2">
                        <summary className="cursor-pointer font-medium">Component State</summary>
                        <pre className="bg-gray-50 p-2 rounded mt-1 overflow-x-auto text-xs">
                          {formatJSON(debug.componentState)}
                        </pre>
                      </details>
                    )}
                    {debug.conditionalLogic && debug.conditionalLogic.length > 0 && (
                      <div className="mb-2">
                        <span className="font-medium">Conditional Logic:</span>
                        <ul className="list-disc list-inside ml-2 mt-1">
                          {debug.conditionalLogic.map((logic, index) => (
                            <li key={index} className="font-mono text-xs">{logic}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {debug.dataFlow && debug.dataFlow.length > 0 && (
                      <div className="mb-2">
                        <span className="font-medium">Data Flow:</span>
                        <ol className="list-decimal list-inside ml-2 mt-1">
                          {debug.dataFlow.map((step, index) => (
                            <li key={index} className="font-mono text-xs">{step}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-2 text-xs text-gray-600 rounded-b-lg">
              Machine-readable details for development and debugging
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default ExplainPopover;
