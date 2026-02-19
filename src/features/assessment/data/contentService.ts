// Content Access Layer - Makes content easily accessible for both app and tests
import type { Question, QuestionBank, AnswerOption } from '../engine/schema';
import unifiedQuestionBank from './questionBank';

/**
 * Content Access Layer for Questions
 * Provides standardized access to question content for both app and tests
 */
export class QuestionContentService {
  private static instance: QuestionContentService;
  private questionBank: QuestionBank;

  private constructor() {
    this.questionBank = unifiedQuestionBank;
  }

  static getInstance(): QuestionContentService {
    if (!QuestionContentService.instance) {
      QuestionContentService.instance = new QuestionContentService();
    }
    return QuestionContentService.instance;
  }

  /**
   * Get question by ID
   */
  getQuestionById(id: string): Question | undefined {
    return this.getAllQuestions().find(q => q.id === id);
  }

  /**
   * Get all questions
   */
  getAllQuestions(): Question[] {
    // Flatten all domains and their questions from all levels
    const allQuestions: Question[] = [];
    
    this.questionBank.domains.forEach(domain => {
      domain.levels.forEach(level => {
        level.questions.forEach(question => {
          allQuestions.push(question);
        });
      });
    });

    return allQuestions;
  }

  /**
   * Get questions by device filter (deprecated - use condition engine instead)
   */
  getQuestionsForDevice(_os?: string[], _browsers?: string[]): Question[] {
    // Device-specific filtering is now handled by the condition engine
    return this.getAllQuestions();
  }

  /**
   * Get question text content for testing
   */
  getQuestionText(id: string): string | null {
    const question = this.getQuestionById(id);
    return question ? question.text : null;
  }

  /**
   * Get question options for testing
   */
  getQuestionOptions(id: string): AnswerOption[] | null {
    const question = this.getQuestionById(id);
    return question && question.options ? question.options : null;
  }

  /**
   * Search questions by text content
   */
  searchQuestions(searchTerm: string): Question[] {
    const term = searchTerm.toLowerCase();
    return this.getAllQuestions().filter(question => 
      question.text.toLowerCase().includes(term) ||
      (question.options && question.options.some(option => option.text.toLowerCase().includes(term)))
    );
  }

  /**
   * Get all unique question IDs
   */
  getAllQuestionIds(): string[] {
    return this.getAllQuestions().map(q => q.id);
  }

  /**
   * Get domain information
   */
  getDomains() {
    return this.questionBank.domains;
  }

  /**
   * Get questions by domain
   */
  getQuestionsByDomain(domainId: string): Question[] {
    const domain = this.questionBank.domains.find(d => d.id === domainId);
    if (!domain) return [];
    
    const questions: Question[] = [];
    domain.levels.forEach(level => {
      questions.push(...level.questions);
    });
    
    return questions;
  }
}

// Export singleton instance for easy access
export const questionContentService = QuestionContentService.getInstance();

// Export convenient functions for common use cases
export const getQuestionById = (id: string) => questionContentService.getQuestionById(id);
export const getQuestionText = (id: string) => questionContentService.getQuestionText(id);
export const getQuestionOptions = (id: string) => questionContentService.getQuestionOptions(id);
export const getAllQuestionIds = () => questionContentService.getAllQuestionIds();
export const searchQuestions = (term: string) => questionContentService.searchQuestions(term);
