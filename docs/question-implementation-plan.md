# Question Bank Implementation Plan

## 🏗️ **Implementation Strategy**

### **Phase 1: Core Foundation (MVP)**
**Target: 200 points available**

```json
{
  "domains": [
    {
      "id": "foundation",
      "title": "Security Foundations", 
      "levels": [
        {
          "level": 0,
          "questions": [
            // Password Management (80 pts)
            {
              "id": "password_manager",
              "text": "Do you use a password manager to store your passwords?",
              "type": "YN",
              "weight": 25,
              "quickWin": true,
              "explanation": "Password managers generate and store unique passwords, eliminating the risk of password reuse.",
              "actionHint": "Popular options: Bitwarden, 1Password, LastPass",
              "timeEstimate": "10 minutes"
            },
            {
              "id": "email_2fa", 
              "text": "Have you enabled two-factor authentication on your email account?",
              "type": "YN",
              "weight": 20,
              "quickWin": true,
              "explanation": "Email is often the recovery method for other accounts - securing it is critical.",
              "actionHint": "Check your email provider's security settings"
            },
            // Software Updates (60 pts)
            {
              "id": "os_auto_updates",
              "text": "Set up automatic security updates for your operating system",
              "type": "ACTION", 
              "weight": 20,
              "quickWin": true,
              "actionOptions": [
                {
                  "id": "enabled_auto",
                  "text": "Already have auto-updates enabled",
                  "points": 20,
                  "impact": "Your system automatically receives critical security patches"
                },
                {
                  "id": "will_enable", 
                  "text": "I'll enable auto-updates now",
                  "points": 20,
                  "impact": "Future security vulnerabilities will be patched automatically"
                },
                {
                  "id": "manual_updates",
                  "text": "I prefer to install updates manually", 
                  "points": 10,
                  "impact": "Manual updates work but require consistent attention"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

### **Phase 2: Device-Specific Expansion**
**Target: +250 points (450 total)**

Add platform-specific questions based on device detection:

#### **Windows Users**
- Windows Defender configuration
- BitLocker encryption 
- Windows Update settings
- Browser security on Edge/Chrome

#### **Mac Users** 
- FileVault encryption
- Gatekeeper settings
- Safari security features
- System Integrity Protection

#### **Mobile Users**
- Screen lock configuration
- App permission review
- Location sharing audit
- Secure app installation practices

### **Phase 3: Network & Privacy**
**Target: +400 points (850 total)**

Advanced security practices:
- Network security configuration
- Privacy settings optimization
- Communication security
- Data backup and recovery

### **Phase 4: Expert Level**
**Target: +150 points (1000 total)**

Professional-grade security:
- Hardware security keys
- Network monitoring
- Advanced threat detection
- Security audit practices

---

## 📝 **Question Design Patterns**

### **YN (Yes/No) Questions**
```typescript
{
  "id": "unique_identifier",
  "text": "Clear, actionable question?",
  "type": "YN", 
  "weight": 25, // Points for "yes" answer
  "quickWin": true, // Optional: High-impact, easy action
  "explanation": "Why this matters for security",
  "actionHint": "How to implement this", 
  "timeEstimate": "5 minutes",
  "conditions": {
    "browserInfo": { "platforms": ["windows", "mac"] }
  }
}
```

### **SCALE Questions** 
```typescript
{
  "id": "password_uniqueness",
  "text": "How often do you use unique passwords for different accounts?",
  "type": "SCALE",
  "weight": 20, // Max points (for score 5)
  "explanation": "Password reuse amplifies breach impact",
  "options": [
    { "id": "1", "text": "Always reuse the same password", "points": 0 },
    { "id": "2", "text": "Use 2-3 different passwords", "points": 5 },
    { "id": "3", "text": "Mix of unique and reused passwords", "points": 10 },
    { "id": "4", "text": "Mostly unique passwords", "points": 15 },
    { "id": "5", "text": "Always use unique passwords", "points": 20 }
  ]
}
```

### **ACTION Questions**
```typescript
{
  "id": "setup_2fa_social",
  "text": "Set up two-factor authentication on your social media accounts",
  "type": "ACTION",
  "weight": 25,
  "explanation": "Social media accounts contain personal info and connections",
  "timeEstimate": "15 minutes",
  "actionOptions": [
    {
      "id": "already_setup",
      "text": "Already have 2FA on all social accounts", 
      "points": 25,
      "impact": "Your social media accounts have strong protection"
    },
    {
      "id": "will_setup",
      "text": "I'll set up 2FA on my main social accounts",
      "points": 25, 
      "impact": "Significantly reduces account takeover risk"
    },
    {
      "id": "partial_setup",
      "text": "I'll set it up on my most important accounts",
      "points": 15,
      "impact": "Partial protection is better than none"
    },
    {
      "id": "sms_only",
      "text": "I'll use SMS-based 2FA for now",
      "points": 10,
      "impact": "SMS 2FA is better than none, but app-based is more secure"
    }
  ]
}
```

---

## 🎯 **Scoring Strategy**

### **Point Value Guidelines**
- **10-15 points**: Small improvements, quick wins
- **20-25 points**: Standard security practices
- **30-35 points**: High-impact protections
- **40+ points**: Expert/advanced measures

### **Device-Specific Scaling**
```typescript
// Example: Encryption question
{
  "conditions": {
    "browserInfo": { "platforms": ["windows"] }
  },
  "actionOptions": [
    {
      "text": "BitLocker is enabled",
      "points": 35 // Higher value - more technical
    }
  ]
}

// vs Mobile version
{
  "conditions": { 
    "browserInfo": { "platforms": ["mobile"] }
  },
  "actionOptions": [
    {
      "text": "Device encryption is enabled", 
      "points": 25 // Lower value - easier to enable
    }
  ]
}
```

### **Progressive Disclosure Logic**
```typescript
// Level 0: Show only if user hasn't scored basic points
"conditions": {
  "requireAnswers": {
    "password_manager": ["false"] // Show if they don't use password manager
  }
}

// Level 1: Show only after foundational security
"conditions": {
  "userProfile": { 
    "minScore": 150 // Require basic security foundation
  }
}
```

---

## 🔄 **Question Lifecycle**

### **New User Journey**
1. **Device Detection** → Platform-specific question filtering
2. **Onboarding Integration** → Pre-populate from onboarding answers  
3. **Quick Wins First** → Show high-impact, easy actions
4. **Progressive Unlock** → Advanced questions appear as score increases
5. **Maintenance Mode** → Periodic re-assessment of time-sensitive questions

### **Returning User Experience**
- **Score Dashboard** → Current level and recent improvements
- **Today's Tasks** → New questions + reminder-scheduled actions
- **Room for Improvement** → Previously dismissed tasks
- **Achievement Tracking** → Badges and milestone celebrations

This creates a **personalized curriculum** that adapts to each user's device, skill level, and security maturity! 📚🛡️
