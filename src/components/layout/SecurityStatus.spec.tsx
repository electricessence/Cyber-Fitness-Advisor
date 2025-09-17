/**
 * Security Status Component Test
 * 
 * Test the simplified accordion-style security status component
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SecurityStatus } from './SecurityStatus';

// Mock the assessment store
const mockGetHistoricAnswers = vi.fn();
const mockRemoveAnswer = vi.fn();
const mockResetAssessment = vi.fn();

vi.mock('../../features/assessment/state/store', () => ({
  useAssessmentStore: () => ({
    getHistoricAnswers: mockGetHistoricAnswers,
    removeAnswer: mockRemoveAnswer,
    resetAssessment: mockResetAssessment,
  }),
}));

describe('SecurityStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show empty state when no answers exist', () => {
    mockGetHistoricAnswers.mockReturnValue([]);
    
    render(<SecurityStatus />);
    
    expect(screen.getByText('Security Status')).toBeInTheDocument();
    expect(screen.getByText('Answer questions to see them appear here')).toBeInTheDocument();
    expect(screen.getByText('📋')).toBeInTheDocument();
  });

  it('should categorize answers correctly', () => {
    const mockAnswers = [
      {
        questionId: 'password_manager',
        questionText: 'Do you use a password manager?',
        value: 'yes',
        pointsEarned: 10,
        timestamp: new Date(),
        domain: 'password',
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
        questionId: 'basic_auth',
        questionText: 'Do you use basic authentication?',
        value: 'sometimes',
        pointsEarned: 5,
        timestamp: new Date(),
        domain: 'auth',
        level: 1,
        question: { 
          id: 'basic_auth', 
          text: 'Do you use basic authentication?',
          options: [
            {
              id: 'sometimes',
              text: 'Sometimes',
              statement: 'Basic Authentication: Sometimes used',
              statusCategory: 'to-do'
            }
          ]
        }
      },
      {
        questionId: 'no_antivirus',
        questionText: 'Do you have antivirus software?',
        value: 'no',
        pointsEarned: 0,
        timestamp: new Date(),
        domain: 'protection',
        level: 1,
        question: { 
          id: 'no_antivirus', 
          text: 'Do you have antivirus software?',
          options: [
            {
              id: 'no',
              text: 'No',
              statement: 'Antivirus Software: Not installed',
              statusCategory: 'room-for-improvement'
            }
          ]
        }
      }
    ];
    
    mockGetHistoricAnswers.mockReturnValue(mockAnswers);
    
    render(<SecurityStatus />);
    
    // Should show all three sections with correct counts
    expect(screen.getByText('🛡️ Shields Up')).toBeInTheDocument();
    expect(screen.getByText('📋 To Do')).toBeInTheDocument();
    expect(screen.getByText('🎯 Room for Improvement')).toBeInTheDocument();
    
    // Should show answer count
    expect(screen.getByText('3 answers')).toBeInTheDocument();
    
    // Should categorize correctly using statements from answer options
    // Shields Up section is collapsed by default, so expand it first
    const shieldsUpButton = screen.getByText('🛡️ Shields Up').closest('button');
    fireEvent.click(shieldsUpButton!);
    
    expect(screen.getByText('Password Manager: Enabled')).toBeInTheDocument(); // Shields Up (now expanded)
    expect(screen.getByText('Basic Authentication: Sometimes used')).toBeInTheDocument(); // To Do (expanded by default)
    expect(screen.getByText('Antivirus Software: Not installed')).toBeInTheDocument(); // Room for Improvement (expanded by default)
  });

  it('should allow removing individual answers', () => {
    const mockAnswers = [
      {
        questionId: 'password_manager',
        questionText: 'Do you use a password manager?',
        value: 'yes',
        pointsEarned: 10,
        timestamp: new Date(),
        domain: 'password',
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
            },
            {
              id: 'no',
              text: '❌ No, I don\'t use one',
              statement: 'Password Manager: Disabled',
              statusCategory: 'room-for-improvement'
            }
          ]
        }
      }
    ];
    
    mockGetHistoricAnswers.mockReturnValue(mockAnswers);
    
    render(<SecurityStatus />);
    
    // Expand the Shields Up section to see the answer
    const shieldsUpButton = screen.getByText('🛡️ Shields Up').closest('button');
    fireEvent.click(shieldsUpButton!);
    
    const changeButton = screen.getByText('Change Answer');
    fireEvent.click(changeButton);
    
    expect(mockRemoveAnswer).toHaveBeenCalledWith('password_manager');
  });

  it('should show help button for room for improvement items', () => {
    const mockAnswers = [
      {
        questionId: 'no_antivirus',
        questionText: 'Do you have antivirus software?',
        value: 'no',
        pointsEarned: 0,
        timestamp: new Date(),
        domain: 'protection',
        level: 1,
        question: { id: 'no_antivirus', text: 'Do you have antivirus software?' }
      }
    ];
    
    mockGetHistoricAnswers.mockReturnValue(mockAnswers);
    
    render(<SecurityStatus />);
    
    // Should show help button for low-scoring answers
    expect(screen.getByText('How to Fix')).toBeInTheDocument();
  });

  it('should handle clear all workflow', () => {
    const mockAnswers = [
      {
        questionId: 'test',
        questionText: 'Test question',
        value: 'yes',
        pointsEarned: 5,
        timestamp: new Date(),
        domain: 'test',
        level: 1,
        question: { id: 'test', text: 'Test question' }
      }
    ];
    
    mockGetHistoricAnswers.mockReturnValue(mockAnswers);
    
    render(<SecurityStatus />);
    
    // Click clear all
    const clearButton = screen.getByText('Clear All Answers');
    fireEvent.click(clearButton);
    
    // Should show confirmation
    expect(screen.getByText('Reset entire assessment?')).toBeInTheDocument();
    expect(screen.getByText('Confirm Reset')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    
    // Click confirm
    const confirmButton = screen.getByText('Confirm Reset');
    fireEvent.click(confirmButton);
    
    expect(mockResetAssessment).toHaveBeenCalled();
  });

  it('should allow canceling clear all', () => {
    const mockAnswers = [
      {
        questionId: 'test',
        questionText: 'Test question',
        value: 'yes',
        pointsEarned: 5,
        timestamp: new Date(),
        domain: 'test',
        level: 1,
        question: { id: 'test', text: 'Test question' }
      }
    ];
    
    mockGetHistoricAnswers.mockReturnValue(mockAnswers);
    
    render(<SecurityStatus />);
    
    // Click clear all
    const clearButton = screen.getByText('Clear All Answers');
    fireEvent.click(clearButton);
    
    // Click cancel
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    
    // Should return to normal state
    expect(screen.getByText('Clear All Answers')).toBeInTheDocument();
    expect(mockResetAssessment).not.toHaveBeenCalled();
  });

  it('should toggle accordion sections', () => {
    const mockAnswers = [
      {
        questionId: 'password_manager',
        questionText: 'Do you use a password manager?',
        value: 'yes',
        pointsEarned: 10,
        timestamp: new Date(),
        domain: 'password',
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
      }
    ];
    
    mockGetHistoricAnswers.mockReturnValue(mockAnswers);
    
    render(<SecurityStatus />);
    
    // Find the shields up section header
    const shieldsUpButton = screen.getByRole('button', { name: /🛡️ Shields Up/ });
    
    // Initially collapsed by default, so content should not be visible
    expect(screen.queryByText('Password Manager: Enabled')).not.toBeInTheDocument();
    
    // Click to expand
    fireEvent.click(shieldsUpButton);
    
    // Content should now be visible
    expect(screen.getByText('Password Manager: Enabled')).toBeInTheDocument();
    
    // Click again to collapse
    fireEvent.click(shieldsUpButton);
    
    // Content should be hidden again
    expect(screen.queryByText('Password Manager: Enabled')).not.toBeInTheDocument();
  });
});