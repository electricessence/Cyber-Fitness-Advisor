# Scenario Flow Examples

This document shows practical examples of how users would experience the device-scenario-based assessment.

## Example 1: Windows Desktop User with iPhone

### Initial Detection & Onboarding
```
🔍 DETECTED: Windows 10, Firefox browser
📱 ASKED: "What type of mobile device do you primarily use?"
👤 USER SELECTS: "📱 iPhone"
✅ PROFILE CREATED: Windows + iOS user
```

### Question Flow
```
DOMAIN: Windows Security (High Priority)

❓ Q1: "How often do you respond to Windows update notifications?"
👤 USER SELECTS: "When I remember to check"
📊 POINTS: 4 points
⏱️  EXPIRATION: 14 days (bi-weekly check-in)
🎯 UNLOCKS: Windows automation suggestion question

❓ Q2: "How often do you run a virus scan?"
👤 USER SELECTS: "About once a month"  
📊 POINTS: 5 points
⏱️  EXPIRATION: 30 days (monthly encouragement)
🎯 UNLOCKS: Scanner automation help question

DOMAIN: iOS Security (Medium Priority)

❓ Q3: "What type of screen lock do you use on your iPhone?"
👤 USER SELECTS: "Face ID with passcode"
📊 POINTS: 10 points
⏱️  EXPIRATION: 90 days (quarterly checkup)
🎯 NO FOLLOW-UP: Excellent security
```

### Follow-Up Questions (Appear Later)
```
⏰ AFTER 14 DAYS (triggered by Q1 answer):

❓ FOLLOW-UP: "Would you like to enable automatic Windows updates?"
💡 CONTEXT: "Since you sometimes forget to update, automation would improve your security"
👤 OPTIONS:
   - "Yes, enable automatic updates" (5 pts)
   - "I prefer to stay in control" (2 pts)

⏰ AFTER 30 DAYS (triggered by Q2 answer):

❓ FOLLOW-UP: "Have you run a virus scan this month?"
💡 CONTEXT: "Let's make sure your monthly scanning habit is working"
👤 OPTIONS:
   - "Yes, I scanned this month" (5 pts)
   - "No, I forgot again" (1 pt) → Triggers automation suggestion
```

---

## Example 2: iPhone User (Mobile-First, Apple Ecosystem)

### Initial Detection & Onboarding
```
🔍 DETECTED: iOS 17, Safari browser
📱 CONFIRMED: "I detected you're using an iPhone. Is that correct?" → "Yes"
💻 ASKED: "What's your primary desktop/laptop computer?"
👤 USER SELECTS: "🍎 Mac (MacBook, iMac, etc.)"
✅ PROFILE CREATED: iOS + Mac user (Apple ecosystem)
```

### Question Flow
```
DOMAIN: iOS Security (High Priority)

❓ Q1: "Do you have a passcode set on your iPhone?"
👤 USER SELECTS: "Yes + Face ID"
📊 POINTS: 10 points
⏱️  EXPIRATION: 90 days
🎯 UNLOCKS: Advanced iOS privacy questions

❓ Q2: "How do you handle iOS update notifications?"
👤 USER SELECTS: "Install manually when notified"
📊 POINTS: 7 points
⏱️  EXPIRATION: 30 days
🎯 UNLOCKS: Automation suggestion

DOMAIN: Apple Ecosystem (Special for iOS+Mac users)

❓ Q3: "Do you use iCloud Keychain for passwords?"
👤 USER SELECTS: "Yes, across all my Apple devices"
📊 POINTS: 10 points
⏱️  EXPIRATION: 60 days
🎯 UNLOCKS: Advanced password security tips
```

---

## Example 3: Basic User (Older Adult on Windows)

### Initial Detection & Onboarding
```
🔍 DETECTED: Windows 10, Microsoft Edge (default browser)
📱 ASKED: "What type of mobile device do you primarily use?"
👤 USER SELECTS: "📟 Basic/flip phone (calls and texts only)"
🎯 ASKED: "How comfortable are you with computer settings?"
👤 USER SELECTS: "🌱 Not very comfortable - I prefer simple instructions"
✅ PROFILE CREATED: Basic Windows user, needs simple guidance
```

### Question Flow (Simplified Language)
```
DOMAIN: Windows Basics (Simplified)

❓ Q1: "Do you see Windows security notifications pop up on your screen?"
💡 EXPLANATION: "These are messages that help keep your computer safe"
👤 USER SELECTS: "Yes, but I'm not sure what to do"
📊 POINTS: 5 points
⏱️  EXPIRATION: 14 days (more frequent check-ins)
🎯 UNLOCKS: Simple step-by-step guidance

❓ Q2: "How do you handle email from people you don't know?"
💡 EXPLANATION: "Unknown emails can sometimes be dangerous"
👤 USER SELECTS: "I sometimes open them"
📊 POINTS: 3 points
⏱️  EXPIRATION: 7 days (urgent education needed)
🎯 UNLOCKS: Phishing education with simple examples
```

### Follow-Up Questions (Simplified)
```
⏰ AFTER 7 DAYS (triggered by low email security):

❓ FOLLOW-UP: "Have you received any suspicious emails this week?"
💡 CONTEXT: "Let's practice recognizing dangerous emails together"
👤 SHOWN: Examples of safe vs. dangerous emails
🎯 EDUCATIONAL: Interactive examples with simple explanations
```

---

## Personality-Based Adaptations

### High-Tech User (Linux + Android)
```
PROFILE: Technical user, privacy-conscious
LANGUAGE: Technical terms, advanced options
QUESTIONS: SSH keys, GPG, custom DNS, VPN configurations
FOLLOW-UPS: Quarterly advanced security tips
TONE: "Configure your firewall rules" vs. "Turn on your firewall"
```

### Corporate User (Work Windows + Personal iPhone)
```  
PROFILE: Work/personal separation concerns
LANGUAGE: Professional, compliance-aware
QUESTIONS: Work profile separation, personal data policies
FOLLOW-UPS: Monthly work/personal boundary checks
TONE: "Company policy" and "personal data protection"
```

### Convenience-Focused User (High automation preferences)
```
PROFILE: Wants security but minimal effort
LANGUAGE: Emphasizes "automatic" and "easy"
QUESTIONS: Focus on one-click solutions
FOLLOW-UPS: Automation check-ins, "set and forget" solutions
TONE: "Enable automatic updates" vs. "Manage updates manually"
```

---

## Conditional Logic Examples

### Multi-Device Question Unlocking
```
IF user has Windows AND iPhone:
  ✅ Show Windows security questions
  ✅ Show iOS security questions  
  ✅ Show cross-platform password management
  ❌ Hide Mac-specific questions
  ❌ Hide Android-specific questions

IF user has Mac AND Android:
  ✅ Show macOS security questions
  ✅ Show Android security questions
  ✅ Show cross-platform sync issues
  ❌ Hide Windows-specific questions
  ❌ Hide iOS-specific questions
```

### Answer-Based Follow-Up Triggers
```
RULE: Windows Update Frequency
  "Immediately" → No follow-up needed
  "Within a week" → Monthly reminder (30 days)
  "When I remember" → Bi-weekly check (14 days)
  "I ignore them" → Weekly education (7 days)

RULE: Password Management
  "Dedicated manager" → Quarterly advanced tips (90 days)
  "Browser passwords" → Monthly cross-device tips (30 days)
  "Reuse passwords" → Weekly security education (7 days)

RULE: Technical Comfort Level
  "Very comfortable" → Advanced technical instructions
  "Somewhat comfortable" → Step-by-step guides with screenshots
  "Not comfortable" → Simple language, basic concepts only
```

### Expiration and Re-engagement
```
GOOD SECURITY PRACTICES:
- Longer expiration periods (60-90 days)
- "Check-in" type questions
- Advanced optimization tips

POOR SECURITY PRACTICES:
- Shorter expiration periods (7-14 days)
- Educational follow-ups
- Simple improvement suggestions
- More frequent engagement
```
