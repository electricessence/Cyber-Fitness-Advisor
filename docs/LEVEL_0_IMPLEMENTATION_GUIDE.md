# Level 0 Onboarding: Implementation Guide

## Overview
This guide provides the specific technical implementation needed to perfect the Level 0 onboarding flow as documented in `VISUAL_FLOW_ONBOARDING.md` and `USER_JOURNEYS.md`.

## Phase 1: Bootstrap & Device Detection

### 1. App Startup Sequence
**File**: `src/features/assessment/state/store.ts`

```typescript
// Add to store initialization
const initializeStore = () => {
  // Step 1: Device Detection (immediate)
  const detectedFacts = detectDeviceCapabilities();
  
  // Step 2: Load existing state
  const storedState = loadFromLocalStorage();
  
  // Step 3: Merge facts (detected + user-provided)
  const allFacts = {
    ...detectedFacts, // Always preserve detection
    ...rebuildFactsFromAnswers(storedState.answers || {})
  };
  
  set({
    facts: allFacts,
    answers: storedState.answers || {},
    level: storedState.level || 0,
    // ... other state
  });
};

// Device detection function
const detectDeviceCapabilities = () => {
  const userAgent = navigator.userAgent;
  const platform = navigator.platform;
  
  return {
    detected_os: detectOS(userAgent, platform),
    detected_browser: detectBrowser(userAgent),
    device_type: detectDeviceType(userAgent),
    screen_size: detectScreenSize(),
    user_agent: userAgent,
    detection_timestamp: new Date().toISOString()
  };
};
```

### 2. Facts Preservation During Reset
```typescript
const resetAssessment = () => {
  const currentFacts = get().facts;
  
  // Preserve only detection facts
  const preservedFacts = {
    detected_os: currentFacts.detected_os,
    detected_browser: currentFacts.detected_browser,
    device_type: currentFacts.device_type,
    screen_size: currentFacts.screen_size,
    user_agent: currentFacts.user_agent,
    detection_timestamp: currentFacts.detection_timestamp
  };
  
  set({
    facts: preservedFacts,
    answers: {},
    level: 0,
    onboarding_complete: false,
    privacy_notice_accepted: false
  });
  
  localStorage.removeItem('cyber-fitness-state');
};
```

## Phase 2: Privacy Notice Modal

### 1. Privacy Notice Component
**File**: `src/components/PrivacyNoticeModal.tsx`

```typescript
interface PrivacyNoticeModalProps {
  isOpen: boolean;
  onAccept: () => void;
}

export function PrivacyNoticeModal({ isOpen, onAccept }: PrivacyNoticeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-8">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🛡️</div>
            <h1 className="text-2xl font-bold text-gray-900">
              Cyber Fitness Advisor - Privacy First
            </h1>
          </div>
          
          <div className="space-y-6 text-gray-700 mb-8">
            <div>
              <h2 className="font-semibold text-lg text-gray-900 mb-2">
                🔒 Privacy First:
              </h2>
              <ul className="space-y-1 ml-4">
                <li>• All data stays on YOUR device</li>
                <li>• No tracking, no analytics, no data collection</li>
                <li>• Everything stored locally in your browser</li>
              </ul>
            </div>
            
            <div>
              <h2 className="font-semibold text-lg text-gray-900 mb-2">
                🎯 What This Tool Does:
              </h2>
              <ul className="space-y-1 ml-4">
                <li>• Assess your current digital security posture</li>
                <li>• Provide personalized improvement recommendations</li>
                <li>• Guide you through easy security improvements</li>
                <li>• Track your progress over time</li>
              </ul>
            </div>
          </div>
          
          <div className="text-center">
            <button
              onClick={onAccept}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg text-lg transition-colors"
            >
              Start My Security Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 2. Privacy Notice Integration
**File**: `src/components/AssessmentFlow.tsx`

```typescript
export function AssessmentFlow() {
  const { facts, answerQuestion } = useAssessmentStore();
  const [showPrivacyNotice, setShowPrivacyNotice] = useState(
    !facts.privacy_notice_accepted
  );

  const handlePrivacyAccept = () => {
    answerQuestion('privacy_notice', 'accept');
    setShowPrivacyNotice(false);
  };

  return (
    <>
      <PrivacyNoticeModal 
        isOpen={showPrivacyNotice}
        onAccept={handlePrivacyAccept}
      />
      
      {!showPrivacyNotice && (
        <div className="assessment-content">
          {/* Rest of assessment flow */}
        </div>
      )}
    </>
  );
}
```

## Phase 3: Question Priority & Conditional Logic

### 1. Priority-Based Question Ordering
**File**: `src/features/assessment/state/store.ts`

```typescript
const getVisibleQuestionIds = (facts: Facts, questions: Question[]): string[] => {
  return questions
    .filter(question => {
      // Check include conditions
      if (question.conditions?.include) {
        const includesMet = Object.entries(question.conditions.include).every(
          ([factKey, expectedValue]) => facts[factKey] === expectedValue
        );
        if (!includesMet) return false;
      }
      
      // Check exclude conditions
      if (question.conditions?.exclude) {
        const excludesMet = Object.entries(question.conditions.exclude).some(
          ([factKey, expectedValue]) => facts[factKey] === expectedValue
        );
        if (excludesMet) return false;
      }
      
      return true;
    })
    .sort((a, b) => (b.priority || 0) - (a.priority || 0)) // Highest priority first
    .map(q => q.id);
};
```

### 2. Updated Question Schema
**File**: `src/features/assessment/data/onboardingQuestions.ts`

```typescript
export const onboardingQuestions: Question[] = [
  {
    id: "privacy_notice",
    text: "", // Content handled by modal component
    type: "single-choice",
    category: "onboarding",
    priority: 10000, // Always first
    conditions: {
      exclude: { "privacy_notice_accepted": true }
    },
    options: [
      {
        id: "accept",
        text: "Start My Security Assessment",
        facts: { 
          "privacy_notice_accepted": true,
          "onboarding_started": true 
        }
      }
    ]
  },
  
  {
    id: "os_confirmation",
    text: "🖥️ We detected you're using {detected_os}. Is this correct?",
    type: "single-choice", 
    category: "onboarding",
    priority: 9500,
    conditions: {
      include: { "privacy_notice_accepted": true },
      exclude: { "os.confirmed": true }
    },
    options: [
      {
        id: "yes",
        text: "✅ Yes, that's correct",
        facts: { 
          "os": "{detected_os}", // Dynamic from facts
          "os.confirmed": true 
        }
      },
      {
        id: "no", 
        text: "❌ No, that's wrong",
        facts: { 
          "os": "not-{detected_os}",
          "os.detection_failed": true 
        }
      }
    ]
  },
  
  {
    id: "os_selection",
    text: "🖥️ Which operating system do you use?",
    type: "single-choice",
    category: "onboarding", 
    priority: 9400,
    conditions: {
      include: { "os.detection_failed": true },
      exclude: { "os.confirmed": true }
    },
    options: [
      { id: "windows", text: "🪟 Windows", facts: { "os": "windows", "os.confirmed": true } },
      { id: "macos", text: "🍎 macOS", facts: { "os": "macos", "os.confirmed": true } },
      { id: "linux", text: "🐧 Linux", facts: { "os": "linux", "os.confirmed": true } },
      { id: "other", text: "❓ Other", facts: { "os": "other", "os.confirmed": true } }
    ]
  },
  
  // Continue with remaining onboarding questions...
];
```

## Phase 4: Progress Indicators

### 1. Onboarding Progress Component
**File**: `src/components/OnboardingProgress.tsx`

```typescript
interface OnboardingProgressProps {
  currentStep: number;
  totalSteps: number;
  stepName: string;
}

export function OnboardingProgress({ currentStep, totalSteps, stepName }: OnboardingProgressProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
        <span>Step {currentStep} of {totalSteps}: {stepName}</span>
        <span>{Math.round((currentStep / totalSteps) * 100)}% complete</span>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

## Phase 5: Testing & Validation

### 1. Onboarding Flow Tests
**File**: `tests/onboarding.integration.test.ts`

```typescript
describe('Level 0 Onboarding Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    // Mock device detection
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Windows Chrome');
  });
  
  test('Privacy notice appears first for new users', () => {
    render(<App />);
    expect(screen.getByText('Privacy First')).toBeInTheDocument();
    expect(screen.getByText('Start My Security Assessment')).toBeInTheDocument();
  });
  
  test('Complete onboarding flow', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    // Step 1: Privacy notice
    await user.click(screen.getByText('Start My Security Assessment'));
    
    // Step 2: OS confirmation
    expect(screen.getByText(/We detected you're using Windows/)).toBeInTheDocument();
    await user.click(screen.getByText('✅ Yes, that\'s correct'));
    
    // Step 3: Browser confirmation
    expect(screen.getByText(/We detected you're using Chrome/)).toBeInTheDocument();
    await user.click(screen.getByText('✅ Yes, that\'s correct'));
    
    // Continue through all onboarding steps...
    
    // Final: Completion
    expect(screen.getByText('🎉 Onboarding Complete!')).toBeInTheDocument();
  });
  
  test('Detection facts preserved through reset', () => {
    // ... test reset behavior
  });
});
```

## Implementation Checklist

### Phase 1: Core Infrastructure ✅
- [ ] Device detection on app startup
- [ ] Facts preservation through resets
- [ ] localStorage state management
- [ ] Store initialization with fact rebuilding

### Phase 2: Privacy Notice ✅
- [ ] Full-screen modal component
- [ ] Privacy-first messaging
- [ ] Single action acceptance
- [ ] Integration with question flow

### Phase 3: Onboarding Questions ✅
- [ ] Priority-based ordering (10000, 9500, 9400, etc.)
- [ ] Conditional logic using facts
- [ ] Progress indicators
- [ ] Visual question cards

### Phase 4: Testing & Polish ✅
- [ ] Integration tests for complete flow
- [ ] Reset behavior validation
- [ ] Mobile responsive design
- [ ] Accessibility compliance

## Next Steps
Once Level 0 is perfected, move to Level 1 implementation with:
1. Browser security task questions
2. Interactive task completion flow
3. Visual guides and celebrations
4. Reminder scheduling system

This foundation ensures users have a smooth, privacy-respecting onboarding experience before tackling their security improvements.
