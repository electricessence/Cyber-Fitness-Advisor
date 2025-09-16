# Security Status Component Specification

## Overview
A collapsible accordion-style "shopping cart" of answered questions in the right sidebar. Each answer gets tagged/categorized based on the user's commitment level and shows up in the appropriate bucket for easy review and reset.

## Core Requirements

### 1. Three Accordion Categories
- **🛡️ Shields Up** (Green) - "Good job!" answers that don't need revisiting
- **📋 To Do** (Yellow) - "Will do later/future" answers user is willing to revisit  
- **🎯 Room for Improvement** (Red) - "Won't do" answers that shouldn't be ignored

### 2. Answer Display Requirements
Each answer must include:
- **Statement**: Human-readable summary (e.g., "Desktop OS: Windows", "Primary Browser: Firefox")
- **Category**: Proper categorization based on answer value, not just points
- **Reset Protection**: Critical questions (privacy, confirmations) cannot be reset
- **Visual Indicator**: Icon and severity level appropriate to the answer

### 3. Data Model Extensions
Extend existing schemas to support Security Status:

```typescript
interface AnswerOption {
  // ... existing properties ...
  statement?: string;           // "Desktop OS: Windows" 
  statusCategory?: 'shields-up' | 'to-do' | 'room-for-improvement';
}

interface Question {
  // ... existing properties ...
  resettable?: boolean;         // false for privacy/detection questions
}
```

### 4. Answer Statement Generation
Each question type needs specific statement templates:
- **Detection Confirmations**: "Desktop OS: Windows", "Primary Browser: Chrome"
- **Security Tools**: "Password Manager: 1Password", "Ad-Blocker: uBlock Origin" 
- **Security Practices**: "Two-Factor Auth: Enabled", "Auto-Updates: Enabled"
- **Behavioral Answers**: "Email Attachments: Always scan", "Software Updates: Install immediately"

### 5. Answer Tagging Logic
Each question answer gets tagged based on **answer choice**, not just points:
- **Green Tag**: Secure/positive answers → Shields Up
- **Yellow Tag**: Partial/future commitment answers → To Do  
- **Red Tag**: Insecure/negative answers → Room for Improvement

### 6. Reset Protection Rules
Certain question types should **NOT** be resettable:
- **Privacy Acknowledgments**: Once confirmed, cannot be undone
- **Detection Confirmations**: OS/browser detection should not be re-asked
- **Onboarding Flow**: Core setup questions remain locked
- **System Information**: Factual data doesn't need reset option

### 7. Accordion Behavior
- **Collapsible sections**: Click to expand/collapse each category
- **Count badges**: Show number of items in each category
- **Default state**: Can start collapsed or expanded
- **Independent**: Each section toggles independently

## User Interface Design

### Accordion Layout
```
┌─ Security Status ──────────────┐
│                                │
│ ▼ 🛡️ Shields Up (3)            │
│   ✅ Has password manager      │
│      "Yes, I use one"          │
│      [Change Answer]           │
│                                │
│   ✅ Auto-updates enabled      │
│      "Already enabled"         │
│      [Change Answer]           │
│                                │
│ ▶ 📋 To Do (2)                 │
│                                │
│ ▼ 🎯 Room for Improvement (1)  │
│   🟡 No password manager       │
│      "Will do later"           │
│      [Set Reminder] [Change Answer] │
│                                │
│   🔴 No antivirus              │
│      "Don't want to install"   │
│      [How to Fix] [Change Answer] │
│                                │
│ [Clear All Answers]            │
└────────────────────────────────┘
```

### State Indicators & Actions
nt Specification
## Overview
A collapsible accordion-style "shopping cart" of answered questions in the right sidebar. Each answer gets tagged/categorized based on the user's commitment level and shows up in the appropriate bucket for easy review and reset.

## Core Requirements

### 1. Three Accordion Categories
- **🛡️ Shields Up** (Green) - "Good job!" answers that don't need revisiting
- **📋 To Do** (Yellow) - "Will do later/future" answers user is willing to revisit  
- **🎯 Room for Improvement** (Red) - "Won't do" answers that shouldn't be ignored

### 2. Answer Display Requirements
Each answer must include:
- **Statement**: Human-readable summary (e.g., "Desktop OS: Windows", "Primary Browser: Firefox")
- **Category**: Proper categorization based on answer value, not just points
- **Reset Protection**: Critical questions (privacy, confirmations) cannot be reset
- **Visual Indicator**: Icon and severity level appropriate to the answer

### 3. Answer Statement Generation
Each question type needs specific statement templates:
- **Detection Confirmations**: "Desktop OS: Windows", "Primary Browser: Chrome"
- **Security Tools**: "Password Manager: 1Password", "Ad-Blocker: uBlock Origin" 
- **Security Practices**: "Two-Factor Auth: Enabled", "Auto-Updates: Enabled"
- **Behavioral Answers**: "Email Attachments: Always scan", "Software Updates: Install immediately"

### 4. Answer Tagging Logic
Each question answer gets tagged based on **answer choice**, not just points:
- **Green Tag**: Secure/positive answers → Shields Up
- **Yellow Tag**: Partial/future commitment answers → To Do  
- **Red Tag**: Insecure/negative answers → Room for Improvement

### 5. Reset Protection Rules
Certain question types should **NOT** be resettable:
- **Privacy Acknowledgments**: Once confirmed, cannot be undone
- **Detection Confirmations**: OS/browser detection should not be re-asked
- **Onboarding Flow**: Core setup questions remain locked
- **System Information**: Factual data doesn't need reset option

### 6. Accordion Behavior
- **Collapsible sections**: Click to expand/collapse each category
- **Count badges**: Show number of items in each category
- **Default state**: Can start collapsed or expanded
- **Independent**: Each section toggles independently

## User Interface Design

### Accordion Layout
```
┌─ Security Status ──────────────┐
│                                │
│ ▼ 🛡️ Shields Up (3)            │
│   ✅ Has password manager      │
│      "Yes, I use one"          │
│      [Change Answer]           │
│                                │
│   ✅ Auto-updates enabled      │
│      "Already enabled"         │
│      [Change Answer]           │
│                                │
│ ▶ 📋 To Do (2)                 │
│                                │
│ ▼ 🎯 Room for Improvement (1)  │
│   🟡 No password manager       │
│      "Will do later"           │
│      [Set Reminder] [Change Answer] │
│                                │
│   🔴 No antivirus              │
│      "Don't want to install"   │
│      [How to Fix] [Change Answer] │
│                                │
│ [Clear All Answers]            │
└────────────────────────────────┘
```

### State Indicators & Actions

#### Green (Shields Up) - [check] severity
- **✅ Green checkmark** - "Complete/Done" - strong confirmation, no more action needed
- **Simple action**: [Change Answer] only
- **User confidence**: They're doing well, just option to modify

#### Yellow (To Do) - [plan] severity  
- **🟡 Yellow circle** - "More action needed" - planned for future
- **Reminder actions**: [Set Reminder] [Change Answer]
- **User intent**: Will do later, needs gentle nudging

#### Red (Room for Improvement) - [warn] severity
- **🔴 Red circle** - "More action needed" - concerning state
- **Help actions**: [How to Fix] [Change Answer]
- **User resistance**: Won't do it, needs education/motivation

## Functional Behavior

### 1. Answer Categorization Logic
```typescript
interface SecurityStatusAnswer {
  questionId: string;
  statement: string;      // From AnswerOption.statement property
  category: 'shields-up' | 'to-do' | 'room-for-improvement';
  isResettable: boolean;  // From Question.resettable or Question.phase
  visualIndicator: { icon: string; severity: string };
  originalAnswer: Answer;
}

const categorizeAnswer = (question: Question, answer: Answer): SecurityStatusAnswer => {
  // Get statement directly from answer option data
  const answerOption = question.options.find(opt => opt.id === answer.value);
  const statement = answerOption?.statement || `${question.text}: ${answer.value}`;
  
  // Get category from answer option or fallback to points-based logic
  const category = answerOption?.statusCategory || 
    (answer.pointsEarned >= 8 ? 'shields-up' : 
     answer.pointsEarned >= 3 ? 'to-do' : 'room-for-improvement');
  
  // Reset protection based on question properties
  const isResettable = question.resettable !== false && 
    !['privacy', 'onboarding'].includes(question.phase || '');
  
  return {
    questionId: question.id,
    statement,
    category,
    isResettable,
    visualIndicator: getVisualIndicator(category),
    originalAnswer: answer
  };
}
```

### Statement Examples  
Each answer option should have a `statement` property:

```typescript
// Example: Windows detection question
{
  id: 'windows_detection_confirm',
  text: 'Is this correct?',
  options: [
    { 
      id: 'yes',
      text: '✅ Yes, I use Windows',
      statement: 'Desktop OS: Windows',           // ← This goes to Security Status
      statusCategory: 'shields-up',
      facts: { "os": "windows", "os_confirmed": true }
    },
    { 
      id: 'no',
      text: '❌ No, that\'s wrong',
      statement: 'Desktop OS: Unconfirmed',       // ← This goes to Security Status  
      statusCategory: 'room-for-improvement',
      facts: { "os_confirmed": false }
    }
  ]
}

// Example: Password manager question
{
  id: 'password_manager',
  text: 'Do you use a password manager?',
  options: [
    { 
      id: 'yes_1password',
      text: 'Yes, 1Password',
      statement: 'Password Manager: 1Password',    // ← Direct data, no generation
      statusCategory: 'shields-up'
    },
    { 
      id: 'yes_builtin',
      text: 'Yes, built into my browser',
      statement: 'Password Manager: Built-in browser',
      statusCategory: 'to-do'
    },
    { 
      id: 'no',
      text: 'No, I don\'t use one',
      statement: 'Password Manager: None',
      statusCategory: 'room-for-improvement'
    }
  ]
}
```

### getVisualIndicator Implementation
```typescript
const getVisualIndicator = (category: string) => {
  switch (category) {
    case 'shields-up': return { icon: '✅', severity: 'check' };
    case 'to-do': return { icon: '🟡', severity: 'plan' };
    case 'room-for-improvement': return { icon: '🔴', severity: 'warn' };
  }
}
```

### 2. Reset Action
1. User clicks [Change Answer] next to any question
2. Answer is removed from store via `removeAnswer(questionId)`
3. Question disappears from accordion
4. Question becomes available in assessment again
5. Scores and badges recalculate automatically

### 3. Accordion State
- **Default**: All sections expanded on first load
- **Persistence**: Remember collapsed/expanded state in localStorage
- **Independent**: Each section toggles independently
- **Count badges**: Show live count of items in each category

## Data Flow

### Store Integration
```typescript
// Use existing store methods:
- answers: Record<string, Answer>
- getHistoricAnswers() // Get formatted answer data
- answerQuestion(questionId, value) // For re-answering
- resetAssessment() // For clear all

// New method needed:
- removeAnswer(questionId: string) // Remove single answer
```

### Component State
```typescript
interface SecurityStatusState {
  expandedSections: {
    'shields-up': boolean;
    'to-do': boolean; 
    'room-for-improvement': boolean;
  };
  showConfirmClear: boolean;
}
```

## Implementation

### Single Component Structure
```typescript
// SecurityStatus.tsx
export function SecurityStatus() {
  // Get categorized answers
  const categorizedAnswers = useMemo(() => {
    const historic = getHistoricAnswers();
    return {
      'shields-up': historic.filter(a => categorizeAnswer(a, a.question) === 'shields-up'),
      'to-do': historic.filter(a => categorizeAnswer(a, a.question) === 'to-do'),
      'room-for-improvement': historic.filter(a => categorizeAnswer(a, a.question) === 'room-for-improvement')
    };
  }, [answers]);

  // Render accordion sections
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3>Security Status</h3>
      
      <AccordionSection 
        title="🛡️ Shields Up" 
        items={categorizedAnswers['shields-up']}
        color="green"
      />
      <AccordionSection 
        title="📋 To Do" 
        items={categorizedAnswers['to-do']}
        color="yellow"
      />
      <AccordionSection 
        title="🎯 Room for Improvement" 
        items={categorizedAnswers['room-for-improvement']}
        color="red"
      />
      
      <button onClick={handleClearAll}>Clear All Answers</button>
    </div>
  );
}
```

## Functional Behavior

### 2. Clear All Action
1. User clicks "Clear All Answers" button
2. Confirmation dialog: "Reset all answers? This will clear your entire assessment."
3. If confirmed, all resettable answers removed and assessment state updates
4. Protected answers (privacy, confirmations) remain intact

### 3. Individual Reset Action  
1. User clicks [Change Answer] next to any question
2. Check if question is resettable (non-protected)
3. Answer removed from store via `removeAnswer(questionId)`
4. Question disappears from Security Status
5. Question becomes available in main assessment again
6. Scores and progress automatically recalculate

### 4. Real-time Updates
- Component automatically reflects new answers as they're submitted
- Category counts update dynamically
- Accordion sections expand/collapse state preserved
- Visual indicators update based on current answer set

## Technical Implementation

### Component Architecture
```typescript
// SecurityStatus.tsx - Main accordion component
export function SecurityStatus() {
  const { answers, questions } = useAssessmentStore();
  const categorizedAnswers = useCategorizedAnswers(answers, questions);
  
  return (
    <div className="security-status-panel">
      <SecurityStatusHeader totalCount={Object.keys(answers).length} />
      
      <AccordionSection 
        title="🛡️ Shields Up" 
        items={categorizedAnswers['shields-up']}
        severity="check"
        defaultExpanded={true}
      />
      
      <AccordionSection 
        title="📋 To Do" 
        items={categorizedAnswers['to-do']}
        severity="plan"
        defaultExpanded={true}
      />
      
      <AccordionSection 
        title="🎯 Room for Improvement" 
        items={categorizedAnswers['room-for-improvement']}
        severity="warn"  
        defaultExpanded={true}
      />
      
      <ClearAllButton onClear={handleClearAll} />
    </div>
  );
}
```

### Data Processing Hook
```typescript
// Custom hook for answer categorization
function useCategorizedAnswers(answers: Record<string, Answer>, questions: Question[]) {
  return useMemo(() => {
    const categorized = {
      'shields-up': [],
      'to-do': [],
      'room-for-improvement': []
    };
    
    Object.entries(answers).forEach(([questionId, answer]) => {
      const question = questions.find(q => q.id === questionId);
      if (!question) return;
      
      const answerOption = question.options.find(opt => opt.id === answer.value);
      const statusAnswer = {
        questionId,
        statement: answerOption?.statement || `${question.text}: ${answer.value}`,
        category: answerOption?.statusCategory || categorizeByPoints(answer.pointsEarned),
        isResettable: getResetProtection(question),
        visualIndicator: getVisualIndicator(answerOption?.statusCategory),
        originalAnswer: answer
      };
      
      categorized[statusAnswer.category].push(statusAnswer);
    });
    
    return categorized;
  }, [answers, questions]);
}
```

## Success Criteria
1. ✅ Questions appear in correct accordion sections based on answer data
2. ✅ Each answer shows human-readable statement from AnswerOption.statement
3. ✅ Categories determined by AnswerOption.statusCategory, not just points
4. ✅ Reset protection works for privacy/confirmation questions
5. ✅ Visual indicators match answer severity appropriately
6. ✅ Real-time updates as new questions are answered
7. ✅ Clear all functionality with proper confirmation
8. ✅ Accordion behavior with expand/collapse and count badges

---

*Implementation Status: COMPLETED*  
- Schema extended with statement/statusCategory properties  
- Component updated with data-driven categorization logic
- Question data updated with required properties for key questions
- Manual testing confirms proper functionality