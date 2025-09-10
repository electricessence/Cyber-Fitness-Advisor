# Visual Flow Documentation: Level 0 Onboarding

## Overview
This document details the complete visual flow for Level 0 onboarding, including app bootstrapping, privacy notice, and the sequential question progression.

## App Startup & Bootstrapping Sequence

### 1. App Initialization
```
User opens app → Store initializes → Check localStorage for existing data
```

#### If No Existing Data (New User):
- **Device Detection Runs** (background)
- **Facts Established**: `{ "detected_os": "windows", "detected_browser": "chrome", "device_type": "desktop" }`
- **Privacy Notice Triggered**: Highest priority question automatically shown
- **Onboarding Flag**: `{ "onboarding_active": true }`

#### If Existing Data (Returning User):
- **Facts Rebuilt** from localStorage
- **Check onboarding completion**: `onboarding_complete: true/false`
- **If incomplete**: Resume onboarding at last question
- **If complete**: Skip to assessment questions (Level 1+)

### 2. Detection Facts (Established at Startup)
These facts are **preserved throughout app lifecycle**, even during reset:

```typescript
// Established immediately on app load
const detectedFacts = {
  "detected_os": "windows|macos|linux|unknown",
  "detected_browser": "chrome|firefox|safari|edge|unknown", 
  "device_type": "desktop|mobile|tablet",
  "screen_size": "large|medium|small",
  "user_agent": "[full user agent string]",
  "detection_timestamp": new Date()
};

// These facts survive "Start Over" reset
// Only user-provided facts are cleared on reset
```

---

## Level 0 Onboarding Visual Flow

### Question 1: Privacy Notice (Priority: 10000)
**Visual Treatment**: Full-screen modal overlay
**Facts Required**: None (always shows first for new users)
**Conditional Logic**: `exclude: { "privacy_notice_accepted": true }`

#### **Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  🛡️  Cyber Fitness Advisor - Privacy First                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Welcome to your personal cybersecurity assessment!        │
│                                                             │
│  🔒 Your Privacy is Protected:                             │
│  • All data stays on YOUR device                           │
│  • No tracking, no analytics, no data collection           │
│  • Everything stored locally in your browser               │
│                                                             │
│  🎯 What This Tool Does:                                   │
│  • Assess your current digital security posture            │
│  • Provide personalized improvement recommendations         │
│  • Guide you through easy security improvements            │
│  • Track your progress over time                           │
│                                                             │
│  Ready to start your security journey?                     │
│                                                             │
│           [Start My Security Assessment]                    │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Answer Options**:
- `id: "accept"`, `text: "Start My Security Assessment"`, `facts: { "privacy_notice_accepted": true, "onboarding_started": true }`

**Post-Answer**: Modal closes, onboarding continues with Question 2

---

### Question 2: OS Confirmation (Priority: 9500)
**Visual Treatment**: Standard question card
**Facts Required**: `privacy_notice_accepted: true`
**Conditional Logic**: 
- `include: { "privacy_notice_accepted": true }`
- `exclude: { "os.confirmed": true }`

#### **Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 1 of 6: Device Setup                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🖥️ We detected you're using Windows. Is this correct?     │
│                                                             │
│  [✅ Yes, that's correct]  [❌ No, that's wrong]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Answer Options**:
- `id: "yes"`, `text: "✅ Yes, that's correct"`, `facts: { "os": "windows", "os.confirmed": true }`
- `id: "no"`, `text: "❌ No, that's wrong"`, `facts: { "os": "not-windows", "os.detection_failed": true }`

**Conditional Follow-up**: If "No" → OS Selection question appears

---

### Question 3: OS Selection (Priority: 9400) 
**Visual Treatment**: Standard question card
**Conditional Logic**: `include: { "os.detection_failed": true }`, `exclude: { "os.confirmed": true }`

#### **Visual Design** (Only shows if OS detection was wrong):
```
┌─────────────────────────────────────────────────────────────┐
│  Step 1b: Manual OS Selection                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🖥️ Which operating system do you use?                     │
│                                                             │
│  [🪟 Windows]  [🍎 macOS]  [🐧 Linux]  [❓ Other]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Answer Options**:
- `id: "windows"`, `facts: { "os": "windows", "os.confirmed": true }`
- `id: "macos"`, `facts: { "os": "macos", "os.confirmed": true }`
- etc.

---

### Question 4: Browser Confirmation (Priority: 9300)
**Facts Required**: `os.confirmed: true`
**Conditional Logic**: 
- `include: { "os.confirmed": true }`
- `exclude: { "browser.confirmed": true }`

#### **Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 2 of 6: Browser Setup                                │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🌐 We detected you're using Chrome. Is this correct?      │
│                                                             │
│  [✅ Yes, that's correct]  [❌ No, that's wrong]           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Question 5: Tech Comfort Level (Priority: 9200)
**Facts Required**: `browser.confirmed: true`
**Conditional Logic**: 
- `include: { "browser.confirmed": true }`
- `exclude: { "tech_comfort_assessed": true }`

#### **Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 3 of 6: Your Tech Experience                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 How comfortable are you with technology?               │
│                                                             │
│  [🚀 Very comfortable - I like advanced options]           │
│  [👍 Somewhat comfortable - I can follow instructions]     │
│  [🤔 Not very comfortable - I prefer simple solutions]     │
│  [😅 Keep it simple - I just want it to work]             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Answer Options**:
- `id: "advanced"`, `facts: { "tech_comfort": "advanced", "tech_comfort_assessed": true }`
- `id: "intermediate"`, `facts: { "tech_comfort": "intermediate", "tech_comfort_assessed": true }`
- `id: "beginner"`, `facts: { "tech_comfort": "beginner", "tech_comfort_assessed": true }`
- `id: "simple"`, `facts: { "tech_comfort": "simple", "tech_comfort_assessed": true }`

---

### Question 6: Mobile Device Context (Priority: 9100)
**Facts Required**: `tech_comfort_assessed: true` AND `device_type: "desktop"`
**Conditional Logic**: 
- `include: { "tech_comfort_assessed": true, "device_type": "desktop" }`
- `exclude: { "mobile_context_assessed": true }`

#### **Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 4 of 6: Mobile Devices                               │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📱 Do you also use a smartphone or tablet for important   │
│      activities like email, banking, or work?              │
│                                                             │
│  [📱 Yes - iPhone (iOS)]                                   │
│  [📱 Yes - Android phone]                                  │
│  [📱 Yes - Both iPhone and Android]                        │
│  [📱 Yes - iPad/tablet only]                               │
│  [❌ No - Just this computer]                              │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

### Question 7: Usage Context (Priority: 9000)
**Facts Required**: `mobile_context_assessed: true`
**Final onboarding question**

#### **Visual Design**:
```
┌─────────────────────────────────────────────────────────────┐
│  Step 5 of 6: How You Use Your Devices                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 What do you primarily use your devices for?            │
│      (Select all that apply)                               │
│                                                             │
│  ☐ Work/Business                                           │
│  ☐ Personal/Family                                         │
│  ☐ Banking/Finance                                         │
│  ☐ Social Media                                            │
│  ☐ Shopping                                                │
│  ☐ Entertainment                                           │
│                                                             │
│  [Continue to Security Assessment]                          │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Answer Options**: Multi-select that sets usage context facts and `onboarding_complete: true`

---

## Onboarding Completion & Transition

### Final Onboarding State
After Question 7 completion:
```typescript
const onboardingCompleteFacts = {
  // Detection facts (preserved from startup)
  "detected_os": "windows",
  "detected_browser": "chrome", 
  "device_type": "desktop",
  
  // User-confirmed facts
  "privacy_notice_accepted": true,
  "os": "windows",
  "os.confirmed": true,
  "browser.confirmed": true,
  "tech_comfort": "intermediate",
  "tech_comfort_assessed": true,
  "has_mobile": true,
  "mobile_os": "ios",
  "mobile_context_assessed": true,
  "usage_context": ["work", "personal", "banking"],
  
  // Completion flags
  "onboarding_complete": true,
  "onboarding_completed_at": new Date(),
  "level_0_complete": true,
  "ready_for_level_1": true
};
```

### Visual Transition to Level 1
```
┌─────────────────────────────────────────────────────────────┐
│  🎉 Onboarding Complete!                                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Great! We now understand your setup:                      │
│  • Windows computer with Chrome browser                     │
│  • Intermediate tech comfort level                         │
│  • iPhone for mobile activities                            │
│  • Uses devices for work, personal, and banking            │
│                                                             │
│  Ready to start improving your digital security?           │
│                                                             │
│           [Start Security Assessment]                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Reset/Start Over Behavior

### What Gets Reset:
- All **user-provided** facts (answers, preferences, completions)
- Onboarding completion status
- Assessment answers
- Task states

### What Gets Preserved:
- **Detection facts** (OS, browser, device type)
- **Detection timestamp**
- App version/schema version

### Visual Confirmation:
```
┌─────────────────────────────────────────────────────────────┐
│  🔄 Start Over Confirmation                                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  This will reset your answers and progress, but keep       │
│  your device detection (Windows, Chrome, etc.)             │
│                                                             │
│  Are you sure you want to start over?                      │
│                                                             │
│     [Cancel]           [Yes, Start Over]                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

This ensures users don't have to re-confirm obvious detection facts, but get a fresh start on their security assessment journey.
