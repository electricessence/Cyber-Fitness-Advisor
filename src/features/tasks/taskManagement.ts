/**
 * Task Management System for ACTION Questions
 * Handles user responses: Complete, Remind Later, Never/Skip
 */

export type TaskStatus = 'pending' | 'completed' | 'dismissed' | 'snoozed';

export interface TaskResponse {
  questionId: string;
  status: TaskStatus;
  selectedAction?: string; // Which action they chose to complete
  snoozeUntil?: Date; // When to remind again
  timestamp: Date;
  pointsEarned?: number;
}

export interface TaskReminder {
  questionId: string;
  reminderDate: Date;
  reminderCount: number; // How many times we've reminded
  lastSnoozed: Date;
}

/**
 * Calculate when to remind the user again based on their snooze pattern
 */
export function calculateSnoozeDate(reminderCount: number): Date {
  const now = new Date();
  const daysToAdd = Math.min(7 * Math.pow(2, reminderCount), 30); // 7, 14, 28, then cap at 30 days
  
  const snoozeDate = new Date(now);
  snoozeDate.setDate(now.getDate() + daysToAdd);
  return snoozeDate;
}

/**
 * Check if a snoozed task should reappear
 */
export function shouldShowSnoozedTask(taskResponse: TaskResponse): boolean {
  if (taskResponse.status !== 'snoozed' || !taskResponse.snoozeUntil) {
    return false;
  }
  
  return new Date() >= taskResponse.snoozeUntil;
}

/**
 * Get tasks that should appear in "Room for Improvement" section
 */
export function getRoomForImprovementTasks(
  allQuestions: any[],
  taskResponses: Record<string, TaskResponse>
): any[] {
  return allQuestions.filter(question => {
    if (question.type !== 'ACTION') return false;
    
    const response = taskResponses[question.id];
    if (!response) return true; // Not answered yet
    
    return response.status === 'dismissed' || response.status === 'snoozed';
  });
}

/**
 * Handle user's response to an ACTION question
 */
export function handleTaskResponse(
  questionId: string,
  responseType: 'complete' | 'later' | 'never',
  selectedAction?: string,
  existingReminders: TaskReminder[] = []
): TaskResponse {
  const now = new Date();
  
  switch (responseType) {
    case 'complete':
      return {
        questionId,
        status: 'completed',
        selectedAction,
        timestamp: now,
        pointsEarned: selectedAction ? calculateActionPoints(selectedAction) : 0
      };
      
    case 'later':
      const existingReminder = existingReminders.find(r => r.questionId === questionId);
      const reminderCount = existingReminder ? existingReminder.reminderCount + 1 : 0;
      
      return {
        questionId,
        status: 'snoozed',
        snoozeUntil: calculateSnoozeDate(reminderCount),
        timestamp: now
      };
      
    case 'never':
      return {
        questionId,
        status: 'dismissed',
        timestamp: now,
        pointsEarned: 0 // No points, but no penalty either
      };
      
    default:
      throw new Error(`Invalid response type: ${responseType}`);
  }
}

/**
 * Calculate points for a specific action
 */
function calculateActionPoints(_actionId: string): number {
  // Default points for task completion
  return 10;
}

/**
 * Get tasks that should be shown today (new + snoozed tasks that are due)
 */
export function getTodaysTasks(
  allQuestions: any[],
  taskResponses: Record<string, TaskResponse>
): any[] {
  return allQuestions.filter(question => {
    if (question.type !== 'ACTION') return false;
    
    const response = taskResponses[question.id];
    
    // New task (never answered)
    if (!response) return true;
    
    // Snoozed task that's due
    if (response.status === 'snoozed' && shouldShowSnoozedTask(response)) {
      return true;
    }
    
    return false;
  });
}

/**
 * Update reminder tracking when a task is snoozed
 */
export function updateTaskReminder(
  questionId: string,
  existingReminders: TaskReminder[]
): TaskReminder[] {
  const existingIndex = existingReminders.findIndex(r => r.questionId === questionId);
  const now = new Date();
  
  if (existingIndex >= 0) {
    // Update existing reminder
    const updated = [...existingReminders];
    updated[existingIndex] = {
      ...updated[existingIndex],
      reminderCount: updated[existingIndex].reminderCount + 1,
      lastSnoozed: now,
      reminderDate: calculateSnoozeDate(updated[existingIndex].reminderCount + 1)
    };
    return updated;
  } else {
    // Create new reminder
    return [
      ...existingReminders,
      {
        questionId,
        reminderCount: 0,
        lastSnoozed: now,
        reminderDate: calculateSnoozeDate(0)
      }
    ];
  }
}
