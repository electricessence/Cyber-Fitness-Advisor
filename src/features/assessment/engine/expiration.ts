/**
 * Answer Expiration System
 * 
 * Calculates when security answers become stale and need refreshing
 * to help users maintain good security habits over time.
 */

export interface ExpirationRule {
  expiresAt: Date | null;
  reason?: string;
}

/**
 * Calculate expiration for an answer based on question ID and response value
 */
export function calculateAnswerExpiration(
  questionId: string, 
  value: boolean | number | string,
  timestamp: Date = new Date()
): ExpirationRule {
  
  // Define expiration patterns for different question types
  const expirationRules: Record<string, (val: any) => ExpirationRule> = {
    
    // Antivirus/Security Scanning
    'virus_scan_recent': (val: string) => {
      switch (val) {
        case 'daily':
          return { expiresAt: addDays(timestamp, 7), reason: 'Daily scan due' };
        case 'weekly':
          return { expiresAt: addDays(timestamp, 7), reason: 'Weekly scan due' };
        case 'monthly':
          return { expiresAt: addDays(timestamp, 30), reason: 'Monthly scan due' };
        case 'quarterly':
          return { expiresAt: addDays(timestamp, 90), reason: 'Quarterly scan due' };
        case 'never':
          return { expiresAt: addDays(timestamp, 7), reason: 'Scan overdue - immediate action needed' };
        default:
          return { expiresAt: null };
      }
    },

    // Software Updates
    'software_updates': (val: string) => {
      switch (val) {
        case 'automatic':
          return { expiresAt: null }; // No expiration for automatic
        case 'weekly':
          return { expiresAt: addDays(timestamp, 7), reason: 'Check for updates' };
        case 'monthly':
          return { expiresAt: addDays(timestamp, 30), reason: 'Check for updates' };
        case 'rarely':
          return { expiresAt: addDays(timestamp, 14), reason: 'Updates overdue - check now' };
        default:
          return { expiresAt: addDays(timestamp, 30), reason: 'Check for updates' };
      }
    },

    // Browser/System Updates
    'browser_updates': (val: string) => {
      switch (val) {
        case 'automatic':
          return { expiresAt: null };
        case 'manual_prompt':
          return { expiresAt: addDays(timestamp, 14), reason: 'Check browser updates' };
        case 'manual_check':
          return { expiresAt: addDays(timestamp, 30), reason: 'Check browser updates' };
        default:
          return { expiresAt: addDays(timestamp, 30), reason: 'Check browser updates' };
      }
    },

    // Password-related
    'password_strength': (val: string) => {
      switch (val) {
        case 'weak':
          return { expiresAt: addDays(timestamp, 7), reason: 'Upgrade weak passwords' };
        case 'mixed':
          return { expiresAt: addDays(timestamp, 90), reason: 'Review password strength' };
        case 'strong':
        case 'unique':
          return { expiresAt: addDays(timestamp, 180), reason: 'Password strength review' };
        default:
          return { expiresAt: addDays(timestamp, 90), reason: 'Review passwords' };
      }
    },

    // Backup-related
    'data_backup': (val: string) => {
      switch (val) {
        case 'automatic_cloud':
        case 'automatic_local':
          return { expiresAt: addDays(timestamp, 30), reason: 'Verify backup is working' };
        case 'manual_regular':
          return { expiresAt: addDays(timestamp, 7), reason: 'Time for manual backup' };
        case 'manual_occasional':
          return { expiresAt: addDays(timestamp, 30), reason: 'Backup recommended' };
        case 'none':
          return { expiresAt: addDays(timestamp, 3), reason: 'Critical: Set up backup immediately' };
        default:
          return { expiresAt: addDays(timestamp, 14), reason: 'Check backup status' };
      }
    },

    // Two-Factor Authentication setup
    'two_factor_auth': (val: boolean | string) => {
      if (val === 'yes' || val === true) {
        return { expiresAt: addDays(timestamp, 180), reason: 'Review 2FA setup' };
      } else {
        return { expiresAt: addDays(timestamp, 7), reason: 'Set up 2FA for better security' };
      }
    },

    // Network Security
    'wifi_security': (val: string) => {
      switch (val) {
        case 'wpa3':
        case 'wpa2':
          return { expiresAt: addDays(timestamp, 180), reason: 'Review WiFi security' };
        case 'wep':
          return { expiresAt: addDays(timestamp, 7), reason: 'Upgrade insecure WiFi encryption' };
        case 'none':
          return { expiresAt: addDays(timestamp, 1), reason: 'Critical: Secure your WiFi immediately' };
        default:
          return { expiresAt: addDays(timestamp, 90), reason: 'Check WiFi security' };
      }
    },

    // Security awareness/training
    'phishing_awareness': (val: string) => {
      switch (val) {
        case 'high':
          return { expiresAt: addDays(timestamp, 180), reason: 'Refresh security awareness' };
        case 'medium':
          return { expiresAt: addDays(timestamp, 90), reason: 'Security awareness review' };
        case 'low':
          return { expiresAt: addDays(timestamp, 30), reason: 'Security training recommended' };
        default:
          return { expiresAt: addDays(timestamp, 90), reason: 'Review security awareness' };
      }
    }
  };

  const rule = expirationRules[questionId];
  if (rule) {
    return rule(value);
  }

  // Default expiration for unspecified questions
  // Security practices generally benefit from periodic review
  return { expiresAt: addDays(timestamp, 90), reason: 'Security practice review' };
}

/**
 * Check if an answer has expired
 */
export function isAnswerExpired(answer: { expiresAt?: Date }): boolean {
  if (!answer.expiresAt) return false;
  return new Date() > answer.expiresAt;
}

/**
 * Get answers that expire soon (within specified days)
 */
export function getExpiringAnswers(
  answers: Record<string, { expiresAt?: Date; questionText?: string; expirationReason?: string }>,
  withinDays: number = 7
): Array<{ questionId: string; expiresAt: Date; reason?: string; daysUntilExpiry: number }> {
  const now = new Date();
  const threshold = addDays(now, withinDays);
  
  return Object.entries(answers)
    .filter(([_, answer]) => answer.expiresAt && answer.expiresAt <= threshold)
    .map(([questionId, answer]) => ({
      questionId,
      expiresAt: answer.expiresAt!,
      reason: answer.expirationReason,
      daysUntilExpiry: Math.ceil((answer.expiresAt!.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }))
    .sort((a, b) => a.expiresAt.getTime() - b.expiresAt.getTime());
}

/**
 * Get expired answers that need immediate attention
 */
export function getExpiredAnswers(
  answers: Record<string, { expiresAt?: Date; questionText?: string; expirationReason?: string }>
): Array<{ questionId: string; expiredDays: number; reason?: string }> {
  const now = new Date();
  
  return Object.entries(answers)
    .filter(([_, answer]) => answer.expiresAt && isAnswerExpired(answer))
    .map(([questionId, answer]) => ({
      questionId,
      expiredDays: Math.ceil((now.getTime() - answer.expiresAt!.getTime()) / (1000 * 60 * 60 * 24)),
      reason: answer.expirationReason
    }))
    .sort((a, b) => b.expiredDays - a.expiredDays); // Most overdue first
}

/**
 * Utility function to add days to a date
 */
function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Format expiration date for user display
 */
export function formatExpirationDate(date: Date): string {
  const now = new Date();
  const diffDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return `Expired ${Math.abs(diffDays)} days ago`;
  } else if (diffDays === 0) {
    return 'Expires today';
  } else if (diffDays === 1) {
    return 'Expires tomorrow';
  } else if (diffDays <= 7) {
    return `Expires in ${diffDays} days`;
  } else {
    return date.toLocaleDateString();
  }
}
