/**
 * Accessibility Enhancement Component - Task F: Performance & Accessibility
 * Provides keyboard navigation and screen reader support
 */

import { useEffect, useCallback, useRef } from 'react';

interface AccessibilityEnhancementProps {
  children: React.ReactNode;
  skipLinkTarget?: string;
  className?: string;
}

export function AccessibilityEnhancement({ 
  children, 
  skipLinkTarget = "main-content",
  className = "" 
}: AccessibilityEnhancementProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Skip to main content (Alt + S or Alt + M)
    if ((event.altKey && (event.key === 's' || event.key === 'S')) || 
        (event.altKey && (event.key === 'm' || event.key === 'M'))) {
      event.preventDefault();
      const target = document.getElementById(skipLinkTarget);
      if (target) {
        target.focus();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    }

    // Enhanced tab navigation (Ctrl + Tab for reverse)
    if (event.key === 'Tab' && event.ctrlKey) {
      event.preventDefault();
      const focusableElements = containerRef.current?.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const currentIndex = Array.from(focusableElements).indexOf(document.activeElement as Element);
        const nextIndex = event.shiftKey 
          ? (currentIndex - 1 + focusableElements.length) % focusableElements.length
          : (currentIndex + 1) % focusableElements.length;
        
        (focusableElements[nextIndex] as HTMLElement).focus();
      }
    }
  }, [skipLinkTarget]);

  // Focus management for dynamic content
  const manageFocus = useCallback((element: Element) => {
    // Announce dynamic content changes to screen readers
    element.setAttribute('aria-live', 'polite');
    element.setAttribute('aria-atomic', 'true');
    
    // Focus management for new content
    const firstFocusable = element.querySelector(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
    ) as HTMLElement;
    
    if (firstFocusable) {
      firstFocusable.focus();
    }
  }, []);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    
    // Observe dynamic content changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              manageFocus(node as Element);
            }
          });
        }
      });
    });

    if (containerRef.current) {
      observer.observe(containerRef.current, {
        childList: true,
        subtree: true
      });
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      observer.disconnect();
    };
  }, [handleKeyDown, manageFocus]);

  return (
    <div ref={containerRef} className={className}>
      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 z-50 bg-blue-600 text-white p-2 rounded">
        <a href={`#${skipLinkTarget}`} className="underline">
          Skip to main content (Alt + S)
        </a>
      </div>

      {/* Accessibility announcements region */}
      <div 
        id="accessibility-announcements"
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      />

      {children}
    </div>
  );
}

/**
 * Accessibility utilities for components
 */
export const useAccessibility = () => {
  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.getElementById('accessibility-announcements');
    if (announcement) {
      announcement.setAttribute('aria-live', priority);
      announcement.textContent = message;
      
      // Clear after announcing
      setTimeout(() => {
        announcement.textContent = '';
      }, 1000);
    }
  }, []);

  const setFocusTrap = useCallback((container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, []);

  return {
    announceToScreenReader,
    setFocusTrap
  };
};
