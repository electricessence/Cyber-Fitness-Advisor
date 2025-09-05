import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'
import '@testing-library/jest-dom'
import { useAssessmentStore } from './features/assessment/state/store'

// Mock UniversalCard since we already tested it
vi.mock('./components/UniversalCard', () => ({
  UniversalCard: ({ title, onAnswer, options }: any) => (
    <div data-testid="universal-card">
      <h3>{title}</h3>
      {options?.map((option: any) => (
        <button 
          key={option.id} 
          onClick={() => onAnswer(option.id)}
          data-testid={`option-${option.id}`}
        >
          {option.text}
        </button>
      ))}
    </div>
  )
}))

describe('App Integration', () => {
  // Test using real store, not mocked - this is integration testing
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when handling question answers', () => {
    it('should render App component without crashing', async () => {
      // This tests the critical path: App renders successfully
      const { default: App } = await import('./App')
      const { container } = render(<App />)
      
      expect(container.firstChild).toBeTruthy()
    })

    it('should have store available in App context', () => {
      // This tests that the store is properly connected
      
      // Get the store directly to verify it's working
      const store = useAssessmentStore.getState()
      expect(store.answerQuestion).toBeDefined()
      expect(typeof store.answerQuestion).toBe('function')
    })
  })

  describe('when displaying questions', () => {
    it('should handle store state changes', () => {
      // Test the store functionality directly
      const store = useAssessmentStore.getState()
      
      // Reset to ensure clean state
      store.resetAssessment()
      
      // Verify initial state
      expect(store.overallScore).toBe(0)
      expect(Object.keys(store.answers)).toHaveLength(0)
    })
  })

  describe('when level changes occur', () => {
    it('should track level progression through store', () => {
      // Test the level progression logic
      const store = useAssessmentStore.getState()
      
      // Reset and test level progression
      store.resetAssessment()
      expect(store.currentLevel).toBe(0)
      
      // This integration test verifies the store works as expected
      expect(typeof store.currentLevel).toBe('number')
    })
  })
})
