/**
 * Performance Optimization Hooks - Task F: Performance & Accessibility
 * React.memo wrappers and useMemo hooks for expensive components
 */

import { useMemo } from 'react';
import type { Question, Answer } from '../features/assessment/engine/schema';

/**
 * Memoized question filtering to prevent unnecessary recalculations
 */
export const useMemoizedQuestionFiltering = (
  questions: Question[],
  answers: Record<string, Answer>,
  visibleQuestionIds: string[]
) => {
  return useMemo(() => {
    const answered = new Set(Object.keys(answers));
    const visibleSet = new Set(visibleQuestionIds);
    
    return {
      availableQuestions: questions.filter(q => 
        visibleSet.has(q.id) && !answered.has(q.id)
      ),
      answeredQuestions: questions.filter(q => 
        answered.has(q.id)
      ),
      visibleQuestions: questions.filter(q => 
        visibleSet.has(q.id)
      )
    };
  }, [questions, answers, visibleQuestionIds]);
};

/**
 * Memoized score calculations to prevent expensive recalculations  
 */
export const useMemoizedScoreCalculations = (
  answers: Record<string, Answer>,
  questionBank: any,
  level: number
) => {
  return useMemo(() => {
    const answeredCount = Object.keys(answers).length;
    const scoreIncrease = answeredCount > 0 ? 5 : 0; // Simplified calculation
    
    return {
      answeredCount,
      scoreIncrease,
      hasAnswers: answeredCount > 0,
      progressPercentage: Math.round((answeredCount / 37) * 100) // Simplified
    };
  }, [answers, questionBank, level]);
};

/**
 * Memoized device profile calculations
 */
export const useMemoizedDeviceProfile = (deviceInfo: any) => {
  return useMemo(() => {
    if (!deviceInfo) return null;
    
    return {
      isDesktop: deviceInfo.type === 'desktop',
      isMobile: deviceInfo.type === 'mobile',
      isWindows: deviceInfo.os === 'windows',
      isMac: deviceInfo.os === 'mac',
      isAndroid: deviceInfo.os === 'android',
      isIOS: deviceInfo.os === 'ios',
      browserType: deviceInfo.browser || 'unknown'
    };
  }, [deviceInfo]);
};

/**
 * Memoized accessibility focus management
 */
export const useAccessibilityFocus = (isVisible: boolean, elementRef: React.RefObject<HTMLElement>) => {
  return useMemo(() => {
    if (!isVisible || !elementRef.current) return null;
    
    return {
      focusElement: () => {
        elementRef.current?.focus();
      },
      setAriaLive: (polite: boolean = true) => {
        if (elementRef.current) {
          elementRef.current.setAttribute('aria-live', polite ? 'polite' : 'assertive');
        }
      }
    };
  }, [isVisible, elementRef]);
};
