# Browser Privacy Questions for Windows Users

## 🎯 **Browser Detection & Privacy Assessment Flow**

### **Step 1: Privacy Concern Assessment**
**Universal question for all Windows users**

```json
{
  "id": "privacy_concern_level",
  "text": "How concerned are you about online privacy and data tracking?",
  "type": "SCALE",
  "weight": 15,
  "explanation": "Your privacy preferences help us recommend the right browser security settings and tools.",
  "conditions": {
    "browserInfo": { "platforms": ["windows"] }
  },
  "options": [
    {
      "id": "not_concerned",
      "text": "Not particularly concerned - convenience is more important",
      "points": 5,
      "target": "shields-up",
      "impact": "We'll focus on basic security without disrupting your workflow"
    },
    {
      "id": "somewhat_concerned", 
      "text": "Somewhat concerned - willing to make small changes",
      "points": 10,
      "target": "shields-up",
      "impact": "We can recommend privacy improvements within your current browser"
    },
    {
      "id": "very_concerned",
      "text": "Very concerned - privacy is a high priority",
      "points": 15,
      "target": "shields-up", 
      "impact": "We'll suggest comprehensive privacy tools and browser alternatives"
    },
    {
      "id": "maximum_privacy",
      "text": "Maximum privacy - willing to sacrifice convenience",
      "points": 15,
      "target": "shields-up",
      "impact": "We'll recommend the most secure browser and privacy configurations"
    }
  ]
}
```

### **Step 2: Browser-Specific Questions (Based on Detection)**

#### **For Chrome Users (High Privacy Concern)**
```json
{
  "id": "chrome_privacy_action",
  "text": "Improve your browsing privacy while using Chrome",
  "type": "ACTION",
  "weight": 25,
  "explanation": "Chrome collects significant data by default. These changes reduce tracking while maintaining functionality.",
  "conditions": {
    "browserInfo": { "browsers": ["chrome"], "platforms": ["windows"] },
    "requireAnswers": { 
      "privacy_concern_level": ["very_concerned", "maximum_privacy"] 
    }
  },
  "actionOptions": [
    {
      "id": "chrome_privacy_settings",
      "text": "I'll configure Chrome's privacy settings",
      "points": 15,
      "impact": "Reduces Google tracking within Chrome"
    },
    {
      "id": "chrome_extensions",
      "text": "I'll add privacy extensions (uBlock Origin, Privacy Badger)",
      "points": 20,
      "impact": "Blocks trackers and ads across all websites"
    },
    {
      "id": "consider_firefox",
      "text": "I'm open to trying Firefox for better privacy",
      "points": 25,
      "impact": "Firefox has stronger default privacy protections"
    },
    {
      "id": "switch_to_brave",
      "text": "I'll switch to Brave browser",
      "points": 25,
      "impact": "Brave blocks trackers by default and rewards privacy-conscious browsing"
    }
  ]
}
```

#### **For Edge Users (Moderate Privacy Concern)**
```json
{
  "id": "edge_privacy_action",
  "text": "Enhance Microsoft Edge's built-in privacy features",
  "type": "ACTION", 
  "weight": 20,
  "explanation": "Edge has good privacy features built-in, but they need to be configured properly.",
  "conditions": {
    "browserInfo": { "browsers": ["edge"], "platforms": ["windows"] },
    "requireAnswers": {
      "privacy_concern_level": ["somewhat_concerned", "very_concerned"]
    }
  },
  "actionOptions": [
    {
      "id": "edge_strict_tracking",
      "text": "I'll enable strict tracking prevention in Edge",
      "points": 20,
      "impact": "Blocks most trackers while maintaining site functionality"
    },
    {
      "id": "edge_smartscreen_plus",
      "text": "I'll configure SmartScreen and additional privacy settings",
      "points": 20,
      "impact": "Enhanced protection against malicious sites and tracking"
    },
    {
      "id": "edge_collections_disable",
      "text": "I'll disable data sharing with Microsoft",
      "points": 15,
      "impact": "Reduces Microsoft's data collection about your browsing"
    }
  ]
}
```

#### **For Firefox Users (Privacy-Conscious)**
```json
{
  "id": "firefox_privacy_optimization",
  "text": "Optimize Firefox's privacy and security settings",
  "type": "ACTION",
  "weight": 30,
  "explanation": "Firefox has excellent privacy features, but additional configuration makes it even better.",
  "conditions": {
    "browserInfo": { "browsers": ["firefox"], "platforms": ["windows"] }
  },
  "actionOptions": [
    {
      "id": "firefox_strict_mode",
      "text": "I'll enable strict privacy mode",
      "points": 25,
      "impact": "Maximum tracker blocking with Firefox's built-in tools"
    },
    {
      "id": "firefox_about_config",
      "text": "I'll configure advanced privacy settings (about:config)",
      "points": 30,
      "impact": "Expert-level privacy configuration for maximum protection"
    },
    {
      "id": "firefox_containers",
      "text": "I'll set up container tabs for different activities",
      "points": 20,
      "impact": "Isolates browsing contexts to prevent cross-site tracking"
    }
  ]
}
```

#### **Browser Switch Consideration (High Privacy Users Only)**
```json
{
  "id": "browser_switch_consideration",
  "text": "Would you consider switching browsers to improve your privacy?",
  "type": "ACTION",
  "weight": 20,
  "explanation": "Different browsers have different privacy philosophies. Some prioritize privacy by default.",
  "conditions": {
    "browserInfo": { "browsers": ["chrome", "edge"], "platforms": ["windows"] },
    "requireAnswers": {
      "privacy_concern_level": ["very_concerned", "maximum_privacy"]
    }
  },
  "actionOptions": [
    {
      "id": "try_firefox",
      "text": "I'll try Firefox as my main browser",
      "points": 20,
      "impact": "Mozilla prioritizes user privacy over data collection"
    },
    {
      "id": "try_brave",
      "text": "I'll try Brave browser",
      "points": 20,
      "impact": "Brave blocks ads and trackers by default, has built-in Tor"
    },
    {
      "id": "dual_browser",
      "text": "I'll use a privacy browser for sensitive activities",
      "points": 15,
      "impact": "Compartmentalizing activities reduces overall tracking"
    },
    {
      "id": "stick_current",
      "text": "I'll improve privacy in my current browser",
      "points": 10,
      "impact": "Privacy improvements within familiar environment"
    }
  ]
}
```

## 🎯 **Question Flow Logic**

### **Guaranteed Win Questions (Windows Users)**

1. **Privacy Concern Assessment** (15 pts)
   - Sets user's privacy preference level
   - Determines which follow-up questions appear

2. **Browser-Specific Privacy Actions** (20-30 pts)
   - Chrome users → Get privacy extension recommendations
   - Edge users → Configure built-in privacy features
   - Firefox users → Optimize advanced settings

3. **Browser Switch Consideration** (20 pts) 
   - Only for high-privacy-concern users using Chrome/Edge
   - Offers alternatives without pressure

### **Smart Targeting**
- **Low privacy concern** → Basic security settings only
- **Moderate concern** → Privacy tools within current browser
- **High concern** → Comprehensive privacy overhaul + browser alternatives
- **Maximum privacy** → Expert configurations + specialized browsers

### **Point Philosophy**
- **Working within current browser** → Lower points (easier)
- **Adding privacy tools** → Medium points (requires learning)
- **Switching browsers** → Higher points (significant behavior change)

This creates a **personalized privacy curriculum** based on the user's stated preferences and current browser choice! 🔒

Would you like me to add these browser-specific questions to the sample question bank?
