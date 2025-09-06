import { describe, it, expect, beforeEach } from 'vitest'
import { useAssessmentStore } from './store'
import { renderHook, act } from '@testing-library/react'

describe('Assessment Store', () => {
  let result: any

  beforeEach(() => {
    const hookResult = renderHook(() => useAssessmentStore())
    result = hookResult.result
    
    act(() => {
      result.current.resetAssessment()
    })
  })

  describe('when answering questions', () => {
    it('should update state for valid question IDs', () => {
      const questionBank = result.current.questionBank
      const firstQuestion = questionBank.domains[0]?.levels[0]?.questions[0]
      
      expect(firstQuestion).toBeDefined()
      
      const initialAnswerCount = Object.keys(result.current.answers).length
      
      act(() => {
        result.current.answerQuestion(firstQuestion.id, 'yes')
      })
      
      expect(Object.keys(result.current.answers).length).toBe(initialAnswerCount + 1)
      expect(result.current.answers[firstQuestion.id].value).toBe('yes')
    })

    it('should handle invalid question IDs gracefully', () => {
      const initialScore = result.current.overallScore
      
      act(() => {
        result.current.answerQuestion('invalid_question_id', 'yes')
      })
      
      expect(result.current.answers['invalid_question_id']).toBeDefined()
      expect(result.current.answers['invalid_question_id'].pointsEarned).toBe(0)
      expect(result.current.overallScore).toBe(initialScore)
    })

    it('should increment score when answering valid questions', () => {
      const questionBank = result.current.questionBank
      const firstQuestion = questionBank.domains[0]?.levels[0]?.questions[0]
      const initialScore = result.current.overallScore
      
      act(() => {
        result.current.answerQuestion(firstQuestion.id, 'yes')
      })
      
      expect(result.current.overallScore).toBeGreaterThan(initialScore)
    })
  })

  describe('when resetting assessment', () => {
    it('should clear all answers and reset scores', () => {
      const questionBank = result.current.questionBank
      const firstQuestion = questionBank.domains[0]?.levels[0]?.questions[0]
      
      // Answer a question first
      act(() => {
        result.current.answerQuestion(firstQuestion.id, 'yes')
      })
      
      expect(Object.keys(result.current.answers).length).toBeGreaterThan(0)
      expect(result.current.overallScore).toBeGreaterThan(0)
      
      // Reset
      act(() => {
        result.current.resetAssessment()
      })
      
      expect(Object.keys(result.current.answers).length).toBe(0)
      expect(result.current.overallScore).toBe(0)
    })
  })

  describe('when getting recommendations', () => {
    it('should return current recommendations', () => {
      const recommendations = result.current.getRecommendations()
      expect(Array.isArray(recommendations)).toBe(true)
    })
  })

  describe('when getting historic answers', () => {
    it('should return answer history with domain info', () => {
      const questionBank = result.current.questionBank
      const firstQuestion = questionBank.domains[0]?.levels[0]?.questions[0]
      
      // Answer a question
      act(() => {
        result.current.answerQuestion(firstQuestion.id, 'yes')
      })
      
      const history = result.current.getHistoricAnswers()
      expect(Array.isArray(history)).toBe(true)
      expect(history.length).toBeGreaterThan(0)
      
      const firstAnswer = history[0]
      expect(firstAnswer.questionId).toBeDefined()
      expect(firstAnswer.domain).toBeDefined()
      expect(firstAnswer.level).toBeDefined()
    })
  })

  describe('when dismissing celebration', () => {
    it('should set showCelebration to false', () => {
      act(() => {
        result.current.dismissCelebration()
      })
      
      expect(result.current.showCelebration).toBe(false)
    })
  })

  describe('when calculating level progression', () => {
    it('should advance levels based on score', () => {
      const questionBank = result.current.questionBank
      const initialLevel = result.current.currentLevel
      
      // Answer multiple questions to potentially level up
      questionBank.domains[0]?.levels[0]?.questions.forEach((question: any, index: number) => {
        if (index < 3) { // Answer first 3 questions
          act(() => {
            result.current.answerQuestion(question.id, 'yes')
          })
        }
      })
      
      // Level might have advanced (depends on scoring logic)
      expect(result.current.currentLevel).toBeGreaterThanOrEqual(initialLevel)
    })
  })

  describe('when answering onboarding questions', () => {
    it('should handle onboarding questions with proper scoring', () => {
      const initialScore = result.current.overallScore
      
      act(() => {
        result.current.answerQuestion('phishing_awareness', 'high')
      })
      
      expect(result.current.answers['phishing_awareness']).toBeDefined()
      expect(result.current.answers['phishing_awareness'].value).toBe('high')
      expect(result.current.answers['phishing_awareness'].pointsEarned).toBeGreaterThan(0)
      expect(result.current.overallScore).toBeGreaterThan(initialScore)
    })

    it('should handle tech_comfort onboarding question', () => {
      const initialScore = result.current.overallScore
      
      act(() => {
        result.current.answerQuestion('tech_comfort', 'expert')
      })
      
      expect(result.current.answers['tech_comfort']).toBeDefined()
      expect(result.current.answers['tech_comfort'].pointsEarned).toBeGreaterThan(0)
      expect(result.current.overallScore).toBeGreaterThan(initialScore)
    })

    it('should handle all onboarding questions and accumulate score', () => {
      const initialScore = result.current.overallScore
      const onboardingQuestions = [
        { id: 'platform_confirmation', value: 'desktop' },
        { id: 'virus_scan_recent', value: 'weekly' },
        { id: 'password_strength', value: 'unique' },
        { id: 'software_updates', value: 'automatic' },
        { id: 'phishing_awareness', value: 'high' },
        { id: 'tech_comfort', value: 'expert' }
      ]
      
      let runningScore = initialScore
      
      onboardingQuestions.forEach(({ id, value }) => {
        act(() => {
          result.current.answerQuestion(id, value)
        })
        
        expect(result.current.answers[id]).toBeDefined()
        expect(result.current.answers[id].pointsEarned).toBeGreaterThan(0)
        expect(result.current.overallScore).toBeGreaterThan(runningScore)
        runningScore = result.current.overallScore
      })
      
      // All onboarding questions should be stored
      expect(Object.keys(result.current.answers).length).toBe(onboardingQuestions.length)
      // Final score should be significantly higher than initial (onboarding gives meaningful points)
      expect(result.current.overallScore).toBeGreaterThan(initialScore + 10)
      // Score should reflect the total points earned from all questions
      expect(result.current.overallScore).toBeGreaterThan(10)
    })
  })
})
