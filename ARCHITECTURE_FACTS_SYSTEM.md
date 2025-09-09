# Facts-Based Architecture: Answer → Facts → Logic System

## 🧠 **Core Concept**

The Cyber Fitness Advisor separates **volatile implementation details** (questions, UI, language) from **stable domain knowledge** (facts about user security profile). This creates a robust, evolvable architecture where business logic depends on stable facts, not changing questions.

## 🎯 **The Fundamental Separation**

### **Facts = Stable Domain Knowledge**
```javascript
// These NEVER change, regardless of how we ask or what language we use:
facts: { 
  "os": "windows", 
  "mobile": "iphone", 
  "ad-blocker": "not-yet",
  "tech-comfort": "intermediate",
  "2fa-capable": "app-based",
  "password-strategy": "reuses",
  "desktop-available": true,
  "smartphone-available": true
}
```

### **Questions = Volatile Implementation**
```javascript
// These can change completely - different wording, approaches, languages:
// Version 1: "Do you use Windows?"
// Version 2: "What operating system powers your main computer?"  
// Version 3: "Quel système d'exploitation utilisez-vous?" (French)
// Version 4: Auto-detection via user agent
// ALL map to the same fact: "os": "windows"
```

## 🏗️ **Architecture Layers**

### **Layer 1: User Interaction** (Volatile)
- Question presentation
- Answer collection  
- UI/UX experience
- Language/localization
- A/B testing variations

### **Layer 2: Answer → Facts Mapping** (Translation Layer)
```javascript
function extractFactsFromAnswer(questionId, answerValue) {
  const answerFactsMapping = {
    // OS Detection Flow
    "windows_confirmation": {
      "yes": { "os": "windows", "desktop-available": true },
      "no": { "os": "needs_prompting" }
    },
    
    "os_selection": {
      "windows": { "os": "windows", "desktop-available": true },
      "mac": { "os": "mac", "desktop-available": true },
      "linux": { "os": "linux", "desktop-available": true },
      "other": { "os": "other", "desktop-available": true },
      "none": { "desktop-available": false }
    },
    
    // Mobile Device Flow  
    "mobile_type": {
      "iphone": { 
        "mobile": "iphone", 
        "2fa_capable": "app-based",
        "smartphone-available": true,
        "sms-capable": true
      },
      "android": { 
        "mobile": "android", 
        "2fa_capable": "app-based",
        "smartphone-available": true,
        "sms-capable": true  
      },
      "other-smartphone": {
        "mobile": "other-smartphone",
        "2fa_capable": "app-based", 
        "smartphone-available": true,
        "sms-capable": true
      },
      "dumbphone": { 
        "mobile": "dumbphone", 
        "2fa_capable": "sms-only",
        "smartphone-available": false,
        "sms-capable": true
      },
      "none": {
        "mobile": "none",
        "smartphone-available": false,
        "sms-capable": false,
        "2fa_capable": "limited"
      }
    },
    
    // Security Profile Flow
    "tech_comfort": {
      "beginner": { "tech-comfort": "beginner", "complexity-preference": "simple" },
      "intermediate": { "tech-comfort": "intermediate", "complexity-preference": "moderate" },
      "advanced": { "tech-comfort": "advanced", "complexity-preference": "detailed" },
      "expert": { "tech-comfort": "expert", "complexity-preference": "comprehensive" }
    }
  };
  
  return answerFactsMapping[questionId]?.[answerValue] || {};
}
```

### **Layer 3: Facts Storage** (Stable State)
```javascript
// User profile facts accumulate over time
userProfile: {
  facts: {
    "os": "windows",
    "mobile": "iphone", 
    "desktop-available": true,
    "smartphone-available": true,
    "2fa_capable": "app-based",
    "tech-comfort": "intermediate",
    "complexity-preference": "moderate"
  },
  // Metadata about fact discovery
  factSources: {
    "os": { questionId: "windows_confirmation", timestamp: "2025-09-09T10:30:00Z" },
    "mobile": { questionId: "mobile_type", timestamp: "2025-09-09T10:31:00Z" }
  }
}
```

### **Layer 4: Fact-Based Business Logic** (Stable)
```javascript
// Questions use facts, not raw answers
{
  id: "authenticator_app_setup",
  text: "Do you use an authenticator app for 2FA?",
  gates: [{ 
    all: [{ fact: "2fa_capable", when: "contains", value: "app-based" }]
  }],
  // This question only shows for smartphone users
}

{
  id: "sms_security_warning", 
  text: "SMS codes are less secure than app-based authentication.",
  gates: [{ 
    all: [{ fact: "2fa_capable", when: "equals", value: "sms-only" }]
  }],
  // This educational content only shows for dumbphone users
}

{
  id: "windows_defender_status",
  text: "Is Windows Defender enabled on your computer?",
  gates: [{ 
    all: [{ fact: "os", when: "equals", value: "windows" }]
  }],
  // OS-specific question based on established fact
}
```

## 🚀 **Architectural Benefits**

### **1. Evolutionary Resilience**
- ✅ **Question content can evolve** without breaking business logic
- ✅ **Multiple discovery paths** for same facts (confirmation → selection → auto-detection)
- ✅ **A/B testing questions** without changing core assessment logic
- ✅ **Localization trivial** - translate questions, facts remain stable

### **2. Multiple Paths to Truth**
```javascript
// Different approaches can establish the same facts:

// Path A: Direct confirmation
"windows_confirmation" → "yes" → fact: "os":"windows"

// Path B: Selection after denial  
"windows_confirmation" → "no" → "os_selection" → "windows" → fact: "os":"windows"

// Path C: Future auto-detection
"browser_user_agent" → detected → fact: "os":"windows"

// Downstream logic doesn't care HOW the fact was established
```

### **3. Clean Separation of Concerns**
- **UI Layer**: How we present questions (can change rapidly)
- **Translation Layer**: How answers map to facts (configurable)
- **Business Logic**: What questions to show based on facts (stable)
- **Domain Knowledge**: What facts matter for security advice (foundational)

### **4. Robust Question Flow Logic**
```javascript
// Complex conditional flows based on fact combinations
{
  id: "cross_device_password_manager",
  gates: [{ 
    all: [
      { fact: "desktop-available", when: "equals", value: true },
      { fact: "smartphone-available", when: "equals", value: true }
    ]
  }],
  // Only show for users with BOTH desktop and smartphone
}

{
  id: "offline_backup_strategy",
  gates: [{ 
    all: [
      { fact: "smartphone-available", when: "equals", value: false }
    ]
  }],
  // Different backup advice for users without smartphones
}
```

## 🔄 **Implementation Flow**

### **1. User Answers Question**
```javascript
// User selects "iPhone" for mobile device question
userAnswer = { questionId: "mobile_type", value: "iphone" }
```

### **2. Extract Facts from Answer**
```javascript
// Translation layer converts answer to domain facts
extractedFacts = {
  "mobile": "iphone",
  "2fa_capable": "app-based", 
  "smartphone-available": true,
  "sms-capable": true
}
```

### **3. Update User Profile**
```javascript
// Facts accumulate in stable profile
userProfile.facts = { 
  ...userProfile.facts, 
  ...extractedFacts 
}
```

### **4. Re-evaluate Available Questions**
```javascript
// Condition engine uses facts to determine next questions
availableQuestions = questionBank.questions.filter(question => 
  evaluateGatesAgainstFacts(question.gates, userProfile.facts)
)
```

## 🎯 **Domain Fact Categories**

### **Device Facts**
```javascript
facts: {
  "os": "windows|mac|linux|other",
  "mobile": "iphone|android|other-smartphone|dumbphone|none", 
  "desktop-available": boolean,
  "smartphone-available": boolean,
  "tablet-available": boolean
}
```

### **Capability Facts**
```javascript
facts: {
  "2fa_capable": "app-based|sms-only|limited|none",
  "sms-capable": boolean,
  "browser-available": boolean,
  "app-install-capable": boolean
}
```

### **Profile Facts**
```javascript
facts: {
  "tech-comfort": "beginner|intermediate|advanced|expert",
  "complexity-preference": "simple|moderate|detailed|comprehensive",
  "security-priority": "convenience|balanced|security-first",
  "risk-tolerance": "low|medium|high"
}
```

### **Current State Facts**
```javascript
facts: {
  "password-strategy": "reuses|some-unique|mostly-unique|all-unique",
  "ad-blocker": "not-yet|basic|advanced",
  "antivirus": "none|basic|premium", 
  "backup-frequency": "never|rarely|monthly|weekly|daily"
}
```

## 📚 **Usage Examples**

### **Onboarding Flow Design**
```javascript
// Step 1: OS Detection
Question: "We've detected you're using Windows. Is that correct?"
Answer: "No" → Facts: { "os": "needs_prompting" }

// Step 2: OS Selection (conditionally shown)
Gates: [{ fact: "os", when: "equals", value: "needs_prompting" }]
Question: "What desktop operating system do you primarily use?"  
Answer: "macOS" → Facts: { "os": "mac", "desktop-available": true }

// Step 3: Mobile Device (always shown)
Question: "What type of mobile device do you use?"
Answer: "iPhone" → Facts: { "mobile": "iphone", "2fa_capable": "app-based", "smartphone-available": true }

// Step 4: Tech Comfort (always shown)
Question: "What's your comfort level with technology?"
Answer: "Intermediate" → Facts: { "tech-comfort": "intermediate", "complexity-preference": "moderate" }
```

### **Assessment Question Targeting**
```javascript
// macOS + iPhone user gets Apple ecosystem questions
{
  id: "icloud_keychain",
  gates: [{ 
    all: [
      { fact: "os", when: "equals", value: "mac" },
      { fact: "mobile", when: "equals", value: "iphone" }
    ]
  }]
}

// Cross-platform password manager for mixed ecosystems  
{
  id: "cross_platform_password_manager",
  gates: [{ 
    any: [
      { all: [
        { fact: "os", when: "equals", value: "windows" },
        { fact: "mobile", when: "equals", value: "iphone" }
      ]},
      { all: [
        { fact: "os", when: "equals", value: "mac" },
        { fact: "mobile", when: "equals", value: "android" }
      ]}
    ]
  }]
}
```

## 🔮 **Future Evolution**

### **Machine Learning Integration**
```javascript
// Facts can be inferred from behavior patterns
inferredFacts = mlModel.predict({
  answerLatency: 2.3, // seconds to answer questions
  questionSkipRate: 0.1, // percentage of questions skipped  
  securityToolUsage: ["browser-password-manager", "ad-blocker"]
})
// → { "actual-tech-comfort": "advanced" } // vs stated "intermediate"
```

### **Dynamic Fact Discovery**
```javascript
// Browser APIs could establish facts automatically
autoDetectedFacts = {
  "os": navigator.platform,
  "browser": navigator.userAgent,
  "screen-size": window.screen.width,
  "touch-capable": 'ontouchstart' in window
}
```

### **Fact Validation & Consistency**
```javascript
// Detect inconsistent facts and resolve
if (facts["smartphone-available"] === false && facts["2fa_capable"] === "app-based") {
  // Flag inconsistency for resolution
  factValidation.flagInconsistency("mobile-capability-mismatch");
}
```

---

## 🏆 **Conclusion**

The Facts-Based Architecture creates a **stable foundation** for cybersecurity assessment that can evolve over time. By separating volatile implementation details (questions, UI) from stable domain knowledge (security-relevant facts), we achieve:

- **Evolutionary resilience** - questions can change without breaking logic
- **Multiple discovery paths** - same facts from different approaches  
- **Robust conditional logic** - complex flows based on fact combinations
- **Internationalization ready** - translate questions, keep facts stable
- **A/B testing enabled** - experiment with question approaches safely

This architecture transforms the assessment from a rigid question-answer system into a **flexible, fact-driven intelligence system** that adapts to users while maintaining logical consistency.
