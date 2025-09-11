// Availability utility for unified question bank
// Handles device filtering, prerequisites, and phase ordering

import type { Question } from '../engine/schema';

export interface DeviceInfo {
  os: string;
  browser: string;
}

export interface AvailabilityContext {
  answers: Record<string, unknown>;
  deviceInfo?: DeviceInfo;
}

/**
 * Check if question passes device filter requirements
 */
export function passesDeviceFilter(question: Question, deviceInfo?: DeviceInfo): boolean {
  if (!question.deviceFilter || !deviceInfo) return true;
  
  // Handle deviceFilter as string (legacy) or object
  if (typeof question.deviceFilter === 'string') {
    // Simple string match for backward compatibility
    return question.deviceFilter.includes(deviceInfo.os) || question.deviceFilter.includes(deviceInfo.browser);
  }
  
  // Handle deviceFilter as object with os/browser properties
  const filter = question.deviceFilter as any;
  const { os, browser } = filter;
  
  if (os && !os.includes(deviceInfo.os)) return false;
  if (browser && !browser.includes(deviceInfo.browser)) return false;
  
  return true;
}

/**
 * Check if question prerequisites are satisfied
 */
export function passesPrerequisites(question: Question, answers: Record<string, unknown>): boolean {
  if (!question.prerequisites) return true;
  
  // Handle legacy format as string array
  if (Array.isArray(question.prerequisites)) {
    return question.prerequisites.every((questionId: string) => questionId in answers);
  }
  
  // Handle new format with answered/anyAnswered
  const { answered, anyAnswered } = question.prerequisites;
  
  // All required questions must be answered (any value)
  if (answered) {
    for (const questionId of answered) {
      if (!(questionId in answers)) return false;
    }
  }
  
  // At least one of these must be answered
  if (anyAnswered) {
    const hasAny = anyAnswered.some((questionId: string) => questionId in answers);
    if (!hasAny) return false;
  }
  
  return true;
}

/**
 * Check if question should be visible based on runtime function
 */
export function passesRuntimeVisible(question: Question, context: AvailabilityContext): boolean {
  if (!question.runtimeVisibleFn) return true;
  
  try {
    return question.runtimeVisibleFn({
      answers: context.answers,
      deviceProfile: context.deviceInfo
    });
  } catch (error) {
    console.warn(`Runtime visibility check failed for question ${question.id}:`, error);
    return false; // Fail safe - hide question if check errors
  }
}

/**
 * Get all available questions in proper order (onboarding first, then by phase)
 */
export function getAvailableQuestions(
  allQuestions: Question[],
  context: AvailabilityContext,
  answeredQuestionIds: string[] = []
): Question[] {
  return allQuestions
    .filter(question => {
      // Skip if already answered (unless expired - handled elsewhere)
      if (answeredQuestionIds.includes(question.id)) return false;
      
      // Must pass device filter
      if (!passesDeviceFilter(question, context.deviceInfo)) return false;
      
      // Must pass prerequisites
      if (!passesPrerequisites(question, context.answers)) return false;
      
      // Must pass runtime visibility check
      if (!passesRuntimeVisible(question, context)) return false;
      
      return true;
    })
    .sort((a, b) => {
      // Phase ordering: onboarding first, then others
      const aPhase = a.phase || 'core';
      const bPhase = b.phase || 'core';
      
      if (aPhase === 'onboarding' && bPhase !== 'onboarding') return -1;
      if (bPhase === 'onboarding' && aPhase !== 'onboarding') return 1;
      
      // Within same phase, order by phaseOrder
      const aOrder = a.phaseOrder ?? 9999;
      const bOrder = b.phaseOrder ?? 9999;
      
      if (aOrder !== bOrder) return aOrder - bOrder;
      
      // Fallback to ID for consistent ordering
      return a.id.localeCompare(b.id);
    });
}

/**
 * Get count of pending onboarding questions
 */
export function getPendingOnboardingCount(
  allQuestions: Question[],
  context: AvailabilityContext,
  answeredQuestionIds: string[] = []
): number {
  return allQuestions
    .filter(q => q.phase === 'onboarding')
    .filter(q => !answeredQuestionIds.includes(q.id))
    .filter(q => passesDeviceFilter(q, context.deviceInfo))
    .filter(q => passesPrerequisites(q, context.answers))
    .filter(q => passesRuntimeVisible(q, context))
    .length;
}

/**
 * Check if onboarding is complete
 */
export function isOnboardingComplete(
  allQuestions: Question[],
  context: AvailabilityContext,
  answeredQuestionIds: string[] = []
): boolean {
  return getPendingOnboardingCount(allQuestions, context, answeredQuestionIds) === 0;
}
