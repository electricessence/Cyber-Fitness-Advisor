// Quick manual test for Security Status implementation
import { render, screen } from '@testing-library/react';
import { expect, test, vi } from 'vitest';
import { SecurityStatus } from '../components/layout/SecurityStatus';

// Mock the store with our updated question data
const mockAnswers = [
  {
    questionId: 'privacy_notice',
    value: 'understood',
    pointsEarned: 0,
    timestamp: new Date(),
    domain: 'onboarding',
    level: 0,
    question: {
      id: 'privacy_notice',
      text: 'Your data stays on your device.',
      phase: 'onboarding',
      resettable: false,
      options: [
        {
          id: 'understood',
          text: '✅ I understand',
          statement: 'Privacy: Acknowledged ✓',
          statusCategory: 'shields-up'
        }
      ]
    }
  },
  {
    questionId: 'password_manager',
    value: 'yes',
    pointsEarned: 10,
    timestamp: new Date(),
    domain: 'security',
    level: 1,
    question: {
      id: 'password_manager',
      text: 'Do you use a password manager?',
      options: [
        {
          id: 'yes',
          text: '✅ Yes, I use a password manager',
          statement: 'Password Manager: Enabled',
          statusCategory: 'shields-up'
        }
      ]
    }
  },
  {
    questionId: 'two_factor_auth',
    value: 'no',
    pointsEarned: 0,
    timestamp: new Date(),
    domain: 'security',
    level: 1,
    question: {
      id: 'two_factor_auth',
      text: 'Do you use two-factor authentication?',
      options: [
        {
          id: 'no',
          text: '❌ No, I don\'t use 2FA',
          statement: 'Two-Factor Auth: Not using',
          statusCategory: 'room-for-improvement'
        }
      ]
    }
  }
];

// Mock the store
vi.mock('../features/assessment/state/store', () => ({
  useAssessmentStore: vi.fn(() => ({
    getHistoricAnswers: () => mockAnswers,
    removeAnswer: vi.fn(),
    resetAssessment: vi.fn()
  }))
}));

test('Security Status shows proper statements and categorization', () => {
  render(<SecurityStatus />);
  
  // Should show proper statements from answer options
  expect(screen.getByText('Privacy: Acknowledged ✓')).toBeInTheDocument();
  expect(screen.getByText('Password Manager: Enabled')).toBeInTheDocument();
  expect(screen.getByText('Two-Factor Auth: Not using')).toBeInTheDocument();
  
  // Should categorize correctly
  expect(screen.getByText('🛡️ Shields Up').parentElement?.textContent).toContain('2'); // Privacy + Password Manager
  expect(screen.getByText('🎯 Room for Improvement').parentElement?.textContent).toContain('1'); // 2FA
  
  // Should show reset protection
  expect(screen.getByText('Cannot reset')).toBeInTheDocument(); // Privacy question
  expect(screen.getAllByText('Change Answer')).toHaveLength(2); // Only Password Manager and 2FA can be reset
});