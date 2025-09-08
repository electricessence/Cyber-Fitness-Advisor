// Unified Question Bank (Onboarding + Assessment)
// Phase 1: Introduces onboarding questions into same structure as assessment
// NOTE: Not yet wired into store selection logic; used for upcoming refactor.

import type { Question, QuestionBank } from '../engine/schema';
import legacyQuestions from './questions.json';
import type { Domain, Level, Suite } from '../engine/schema';

// Map legacy onboarding confirmation/selection questions into unified Question objects.
// These are non-scoring (nonScoring: true) and live in a synthetic domain 'onboarding'.
// We'll keep them separated logically until integration replaces legacy onboarding flow.

const onboardingQuestions: Question[] = [
  {
    id: 'windows_confirmation',
    text: 'Are you using a Windows computer?',
    weight: 0,
    phase: 'onboarding',
    phaseOrder: 1,
    nonScoring: true,
    deviceFilter: { os: ['windows'] },
    options: [
      { id: 'yes', text: 'Yes, Windows', points: 0, target: 'hidden' },
      { id: 'no', text: 'No', points: 0, target: 'hidden' }
    ]
  },
  {
    id: 'mac_confirmation',
    text: 'Are you using a Mac computer?',
    weight: 0,
    phase: 'onboarding',
    phaseOrder: 2,
    nonScoring: true,
    deviceFilter: { os: ['mac'] },
    options: [
      { id: 'yes', text: 'Yes, macOS', points: 0, target: 'hidden' },
      { id: 'no', text: 'No', points: 0, target: 'hidden' }
    ]
  },
  {
    id: 'linux_confirmation',
    text: 'Are you using a Linux computer?',
    weight: 0,
    phase: 'onboarding',
    phaseOrder: 3,
    nonScoring: true,
    deviceFilter: { os: ['linux'] },
    options: [
      { id: 'yes', text: 'Yes, Linux', points: 0, target: 'hidden' },
      { id: 'no', text: 'No', points: 0, target: 'hidden' }
    ]
  },
  {
    id: 'os_selection',
    text: 'What operating system are you using?',
    weight: 0,
    phase: 'onboarding',
    phaseOrder: 4,
    nonScoring: true,
    // Appears if no OS confirmed; runtime predicate for initial phase
    runtimeVisibleFn: ({ answers }) => {
      const denied = ['windows_confirmation','mac_confirmation','linux_confirmation']
        .some(id => answers[id] === 'no');
      const confirmed = ['windows_confirmation','mac_confirmation','linux_confirmation']
        .some(id => answers[id] === 'yes');
      return !confirmed && denied; // only if user denied detected OS
    },
    options: [
      { id: 'windows', text: 'Windows', points: 0, target: 'hidden' },
      { id: 'mac', text: 'macOS', points: 0, target: 'hidden' },
      { id: 'linux', text: 'Linux', points: 0, target: 'hidden' },
      { id: 'mobile', text: 'Mobile (iOS/Android)', points: 0, target: 'hidden' }
    ]
  },
  {
    id: 'chrome_confirmation',
    text: 'Are you primarily using Google Chrome?',
    weight: 0,
    phase: 'onboarding',
    phaseOrder: 5,
    nonScoring: true,
    deviceFilter: { browser: ['chrome'] },
    prerequisites: { anyAnswered: ['windows_confirmation','mac_confirmation','linux_confirmation','os_selection'] },
    options: [
      { id: 'yes', text: 'Yes, Chrome', points: 0, target: 'hidden' },
      { id: 'no', text: 'No', points: 0, target: 'hidden' }
    ]
  },
  {
    id: 'firefox_confirmation',
    text: 'Are you primarily using Mozilla Firefox?',
    weight: 0,
    phase: 'onboarding',
    phaseOrder: 6,
    nonScoring: true,
    deviceFilter: { browser: ['firefox'] },
    prerequisites: { anyAnswered: ['windows_confirmation','mac_confirmation','linux_confirmation','os_selection'] },
    options: [
      { id: 'yes', text: 'Yes, Firefox', points: 0, target: 'hidden' },
      { id: 'no', text: 'No', points: 0, target: 'hidden' }
    ]
  },
  {
    id: 'browser_selection',
    text: 'What web browser do you use most often?',
    weight: 0,
    phase: 'onboarding',
    phaseOrder: 7,
    nonScoring: true,
    prerequisites: { answered: ['chrome_confirmation','firefox_confirmation'] },
    runtimeVisibleFn: ({ answers }) => {
      const deniedChrome = answers.chrome_confirmation === 'no';
      const deniedFirefox = answers.firefox_confirmation === 'no';
      return deniedChrome || deniedFirefox; // show only if user denied detected browser
    },
    options: [
      { id: 'chrome', text: 'Chrome', points: 0, target: 'hidden' },
      { id: 'firefox', text: 'Firefox', points: 0, target: 'hidden' },
      { id: 'safari', text: 'Safari', points: 0, target: 'hidden' },
      { id: 'edge', text: 'Edge', points: 0, target: 'hidden' }
    ]
  }
];

// Build synthetic onboarding domain so legacy scoring ignores them automatically (weight 0 + nonScoring)
// We'll append existing legacy domains after.
const legacySuites: Suite[] = ((legacyQuestions as any).suites || []).map((s: any): Suite => ({
  id: s.id,
  title: s.title,
  description: s.description,
  gates: (s.gates || []).map((g: any) => ({
    all: (g.all || []).map((c: any) => ({
      questionId: c.questionId,
      when: c.when as any,
      value: c.value
    }))
  })),
  questions: s.questions.map((q: any): Question => ({ ...q, type: q.type as any }))
}));

const unifiedQuestionBank: QuestionBank = {
  version: (legacyQuestions as any).version ? (legacyQuestions as any).version + 1 : 2,
  domains: [
    {
      id: 'onboarding_phase',
      title: 'Onboarding',
      levels: [
        { level: 0, questions: onboardingQuestions }
      ]
    },
    // Normalize legacy question domains to satisfy strict typing (coerce question.type to union)
    ...(legacyQuestions.domains as any[]).map((d): Domain => ({
      id: d.id,
      title: d.title,
      levels: d.levels.map((lvl: any): Level => ({
        level: lvl.level,
        questions: lvl.questions.map((q: any): Question => ({
          ...q,
          type: q.type as any // Keep original; assume valid per existing JSON
        }))
      }))
    }))
  ],
  suites: legacySuites
};

export { onboardingQuestions };
export default unifiedQuestionBank;
