import { describe, it, expect } from 'vitest'
import actionsData from './actions.json'
import questionsData from './questions.json'

describe('Assessment Data Structure', () => {
  describe('when validating data integrity', () => {
    it('should have valid actions structure', () => {
      expect(actionsData).toBeDefined()
      expect(actionsData.quickActions).toBeDefined()
      expect(Array.isArray(actionsData.quickActions)).toBe(true)
      expect(actionsData.quickActions.length).toBeGreaterThan(0)
      
      actionsData.quickActions.forEach((action: any) => {
        expect(action.id).toBeDefined()
        expect(typeof action.id).toBe('string')
        expect(action.title).toBeDefined()
        expect(typeof action.title).toBe('string')
      })
    })

    it('should have valid questions structure', () => {
      expect(questionsData).toBeDefined()
      expect(questionsData.domains).toBeDefined()
      expect(Array.isArray(questionsData.domains)).toBe(true)
      expect(questionsData.domains.length).toBeGreaterThan(0)
      
      questionsData.domains.forEach((domain: any) => {
        expect(domain.id).toBeDefined()
        expect(typeof domain.id).toBe('string')
        expect(domain.title).toBeDefined()
        expect(Array.isArray(domain.levels)).toBe(true)
        
        domain.levels.forEach((level: any) => {
          expect(typeof level.level).toBe('number')
          expect(Array.isArray(level.questions)).toBe(true)
          
          level.questions.forEach((question: any) => {
            expect(question.id).toBeDefined()
            expect(typeof question.id).toBe('string')
            expect(question.text).toBeDefined()
          })
        })
      })
    })

    it('should have separate action and question ID spaces', () => {
      const actionIds = actionsData.quickActions.map((a: any) => a.id)
      const questionIds = questionsData.domains
        .flatMap((d: any) => d.levels.flatMap((l: any) => l.questions))
        .map((q: any) => q.id)
      
      const overlap = actionIds.filter((id: string) => questionIds.includes(id))
      expect(overlap.length).toBe(0) // Should be no overlap
    })
  })
})
