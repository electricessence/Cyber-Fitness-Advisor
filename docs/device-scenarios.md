# Device Scenario Specifications

This document defines the user flow scenarios based on device detection and user responses. Each scenario acts as a specification for how the assessment should adapt to different user profiles.

## Device Detection & Onboarding Questions

### Phone Detection Question
**Text:** "What type of mobile device do you primarily use?"
**Options:**
- 📱 iPhone
- 🤖 Android phone  
- 📞 Other smartphone (BlackBerry, etc.)
- 📟 Basic/flip phone (calls and texts only)
- ❌ I don't have a mobile device

### Desktop Detection Question  
**Text:** "What's your primary desktop/laptop computer?"
**Options:**
- 🪟 Windows PC (Windows 10, 11, or earlier)
- 🍎 Mac (MacBook, iMac, Mac Mini, etc.)
- 🐧 Linux (Ubuntu, Fedora, or other distribution)
- 📚 Chromebook (Chrome OS device)
- ❌ I don't use a desktop/laptop

---

## Scenario Specifications

## Scenario 1: Windows Desktop User with iPhone
**Detection:** Firefox on Windows
**Profile:** Desktop-primary user, likely tech-comfortable

### Onboarding Flow:
1. **Detect:** Windows + Firefox
2. **Ask:** "I detected you're using Windows. Is that correct?" → Yes
3. **Ask:** "What type of mobile device do you primarily use?" → iPhone
4. **Profile Created:** Windows + iOS user

### Question Domains Unlocked:
- **Windows Security** (High Priority)
  - Windows Update frequency and habits
  - Windows Defender status and scanning habits  
  - Windows Firewall configuration
  - BitLocker disk encryption status
- **iOS Security** (Medium Priority)
  - iPhone passcode and Face ID setup
  - iOS automatic updates
  - Find My iPhone configuration
- **Cross-Platform** (Always Included)
  - Password management strategy
  - Email security and 2FA usage
  - Browser security settings (Firefox-specific tips)

### Key Assessment Questions:
1. **"How often do you respond to Windows update notifications?"**
   - Immediately (10 pts) → No follow-up needed
   - Within a week (7 pts) → Monthly reminder about importance
   - When I remember (4 pts) → Bi-weekly check-in questions
   - I ignore them (0 pts) → Weekly urgent follow-ups + education

2. **"How often do you run a virus scan (Windows Defender or otherwise)?"**
   - Daily/Automatic (10 pts) → Excellent, no follow-up
   - Weekly (8 pts) → Good habit, quarterly check-in
   - Monthly (5 pts) → Encourage more frequent scanning
   - Rarely/Never (0 pts) → Urgent education + weekly follow-ups

### Personality Insights from Answers:
- **High scores:** Tech-savvy, security-conscious → Advanced tips and optimizations
- **Mixed scores:** Aware but inconsistent → Automation recommendations
- **Low scores:** Needs education → Basic security fundamentals with simple instructions

---

## Scenario 2: iPhone User (Mobile-First)
**Detection:** Safari on iOS
**Profile:** Mobile-primary user, possibly less desktop-oriented

### Onboarding Flow:
1. **Detect:** iOS + Safari
2. **Ask:** "I detected you're using an iPhone. Is that correct?" → Yes
3. **Ask:** "What's your primary desktop/laptop computer?" → Mac (assumed default)
4. **Profile Created:** iOS + Mac user (Apple ecosystem)

### Question Domains Unlocked:
- **iOS Security** (High Priority)
  - Screen lock and biometric security
  - App permissions and privacy settings
  - iOS update habits
  - iCloud security and Find My setup
- **Mac Security** (Medium Priority) 
  - macOS update frequency
  - FileVault disk encryption
  - Gatekeeper app security
- **Apple Ecosystem** (Special Domain)
  - iCloud Keychain vs. other password managers
  - AirDrop security settings
  - Apple ID two-factor authentication

### Key Assessment Questions:
1. **"Do you have a passcode set on your iPhone?"**
   - Yes + Face ID/Touch ID (10 pts) → Excellent security
   - Yes, passcode only (7 pts) → Suggest biometric upgrade
   - No (0 pts) → Urgent security education

2. **"How do you handle iOS update notifications?"**
   - Automatic updates enabled (10 pts) → Perfect
   - Install manually when notified (7 pts) → Good but suggest automation
   - Install occasionally (3 pts) → Education about security importance
   - Ignore/postpone (0 pts) → Critical security gap

---

## Scenario 3: Android User on Work Computer  
**Detection:** Chrome on Windows (common corporate setup)
**Profile:** Corporate user, mixed personal/work technology

### Onboarding Flow:
1. **Detect:** Windows + Chrome
2. **Ask:** "I detected you're using Windows. Is that correct?" → Yes
3. **Ask:** "Is this your personal computer or work computer?" → Work computer
4. **Ask:** "What type of mobile device do you primarily use?" → Android phone
5. **Profile Created:** Work Windows + Personal Android user

### Question Domains Unlocked:
- **Personal Android Security** (High Priority)
  - Screen lock security (PIN, pattern, biometric)
  - App installation sources (Play Store vs. sideloading)
  - Android update management
  - Google account security
- **Work/Personal Separation** (Special Domain)
  - Work profile separation
  - Personal data on work devices
  - Work email on personal devices
- **Cross-Platform** (Standard)
  - Personal vs. work password management
  - Personal email security (separate from work)

### Key Assessment Questions:
1. **"What type of screen lock do you use on your Android phone?"**
   - Fingerprint/Face unlock (10 pts) → Excellent
   - PIN or password (8 pts) → Good security
   - Pattern lock (6 pts) → Moderate security, suggest upgrade
   - Swipe or none (0 pts) → Critical security gap

2. **"Do you install apps from sources other than Google Play Store?"**
   - Never, only Play Store (10 pts) → Excellent security practice
   - Rarely, only trusted sources (7 pts) → Good awareness
   - Sometimes from other sources (3 pts) → Education about risks
   - Yes, I sideload apps regularly (0 pts) → Security education needed

---

## Scenario 4: Linux Enthusiast
**Detection:** Firefox on Linux
**Profile:** Technical user, privacy-conscious, non-mainstream choices

### Onboarding Flow:
1. **Detect:** Linux + Firefox
2. **Ask:** "I detected you're using Linux. Is that correct?" → Yes  
3. **Ask:** "Which Linux distribution?" → Ubuntu/Arch/Fedora/Other
4. **Ask:** "What type of mobile device do you primarily use?" → Could be anything
5. **Profile Created:** Linux + [Mobile choice] user

### Question Domains Unlocked:
- **Linux Security** (High Priority)
  - System update management (apt/yum/pacman)
  - Firewall configuration (ufw/iptables)
  - Package source security
  - Disk encryption (LUKS)
- **Privacy-Focused** (Special Domain)
  - VPN usage and configuration
  - DNS security (DoH, custom DNS)
  - Browser privacy settings
  - Encrypted communication tools
- **Advanced Security** (Technical Level)
  - SSH key management
  - GPG key usage
  - Network security tools

### Key Assessment Questions:
1. **"How do you handle system updates on your Linux system?"**
   - Automatic security updates (10 pts) → Excellent
   - Manual updates weekly (8 pts) → Good practice
   - Update when I remember (5 pts) → Encourage consistency  
   - Rarely update (2 pts) → Education about security importance

2. **"Do you use a firewall on your Linux system?"**
   - Yes, configured and active (10 pts) → Excellent
   - Default firewall enabled (7 pts) → Good baseline
   - Not sure/default settings (3 pts) → Education opportunity
   - No firewall (0 pts) → Security gap

---

## Scenario 5: Basic User (Older Adult Profile)
**Detection:** Edge on Windows (common default setup)
**Profile:** Less technical, needs simple instructions

### Onboarding Flow:
1. **Detect:** Windows + Edge
2. **Ask:** "I detected you're using Windows. Is that correct?" → Yes
3. **Ask:** "What type of mobile device do you primarily use?" → Basic phone or iPhone (simplified interface)
4. **Ask:** "How comfortable are you with computer settings?" → Not very comfortable
5. **Profile Created:** Basic Windows user, needs simple guidance

### Question Domains Unlocked:
- **Windows Basics** (Simplified)
  - Essential Windows security (Windows Defender)
  - Simple update management
  - Basic password practices
- **Email Security** (High Priority for this demographic)
  - Recognizing phishing emails
  - Safe email practices
  - Account security basics
- **Simplified Mobile** (If applicable)
  - Basic phone security
  - Simple passcode setup

### Key Assessment Questions:
1. **"Do you see Windows security notifications pop up on your screen?"**
   - Yes, and I follow them (8 pts) → Good awareness
   - Yes, but I'm not sure what to do (5 pts) → Provide simple guidance
   - I dismiss them (2 pts) → Education about importance
   - I don't notice them (0 pts) → Help with recognition

2. **"How do you handle email from people you don't know?"**
   - I delete without opening (10 pts) → Excellent instinct
   - I'm careful about links and attachments (8 pts) → Good awareness
   - I sometimes open them (3 pts) → Phishing education needed
   - I usually open everything (0 pts) → Critical education needed

---

## Cross-Scenario Conditional Logic

### Follow-up Question Triggers:
- **Low Security Scores** → Weekly check-ins with educational content
- **Mixed Security Practices** → Monthly reminders to improve specific areas
- **High Security Scores** → Quarterly advanced security tips

### Expiration Schedules by User Type:
- **Technical Users** (Linux, high scores) → Longer intervals, advanced tips
- **Basic Users** (low comfort, basic devices) → Shorter intervals, simple reminders
- **Corporate Users** → Work-appropriate security guidance
- **Privacy-Conscious** → Advanced privacy and security recommendations

### Device-Specific Follow-ups:
- **iPhone + Mac Users** → Apple ecosystem security optimization
- **Android + Windows Users** → Cross-platform security coordination  
- **Work/Personal Mix** → Separation and security boundary guidance
- **Single Device Users** → Focused, deep security for their primary device

---

## Implementation Notes

### Question Prioritization:
1. **Critical Security Gaps** → Immediate follow-up (weekly)
2. **Basic Security Hygiene** → Regular reminders (bi-weekly to monthly)
3. **Advanced Security** → Educational opportunities (monthly to quarterly)
4. **Convenience vs. Security** → Balanced recommendations

### Personality-Based Adaptations:
- **Risk-Averse Users** → Emphasize threats and consequences
- **Convenience-Focused Users** → Emphasize easy, automated solutions
- **Tech Enthusiasts** → Provide advanced options and technical details
- **Privacy-Concerned Users** → Focus on data protection and privacy tools

### Success Metrics by Scenario:
- **Completion Rate** → % of relevant questions answered
- **Security Score Improvement** → Points gained over time
- **Behavior Change** → Actions taken based on recommendations
- **Engagement** → Return visits and follow-up completions
