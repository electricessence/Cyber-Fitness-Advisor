# 🛡️ Cyber Fitness Advisor

**Your personal cybersecurity coach that makes security simple, engaging, and rewarding.**

[![Deploy to GitHub Pages](https://github.com/electricessence/Cyber-Fitness-Advisor/actions/workflows/static.yml/badge.svg)](https://github.com/electricessence/Cyber-Fitness-Advisor/actions/workflows/static.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Live Demo

**[Try Cyber Fitness Advisor →](https://electricessence.github.io/Cyber-Fitness-Advisor/)**

## What Makes This Different

🎯 **Quick Wins First** - Start with 2-minute fixes that give immediate security boosts and score jumps  
⚡ **Instant Gratification** - Watch your score climb in real-time as you answer questions  
🎮 **Gamified Progress** - Levels, badges, and progress bars make security improvements addictive  
🏠 **100% Private** - Everything runs in your browser, no data ever leaves your device  
📱 **Works Everywhere** - Responsive design, works on phones, tablets, and desktops  

## Stack Choice Justification

I chose **TypeScript SPA (Vite + React + Zustand)** over Blazor WebAssembly for these key reasons:

✅ **Perfect GitHub Pages Fit** - Static files deploy seamlessly with zero configuration  
✅ **Lightning Fast** - ~150KB bundle vs Blazor's 2MB+ .NET runtime  
✅ **Universal Compatibility** - Works on any device without WebAssembly requirements  
✅ **Rich Ecosystem** - Lightweight charting, accessibility, and animation libraries  
✅ **Developer Experience** - Hot module replacement and excellent TypeScript tooling  
✅ **Lighthouse 90+** - Optimized for performance and accessibility out of the box  

## 🎯 Core Philosophy: Easy Wins First

Unlike traditional security assessments that overwhelm users with complex requirements, Cyber Fitness Advisor follows a **"quick wins first"** approach:

- **2-minute fixes** get **25% score bonuses** to create instant momentum
- **Progressive difficulty** - you won't see "set up enterprise VLAN isolation" until you've mastered password basics
- **High impact, low effort** actions are prioritized in recommendations
- **Celebration animations** reward progress and maintain motivation

## 🎮 Features

### Quick Wins Engine
- Identifies 2-5 minute security improvements that give maximum score boosts
- Real-time score bar with satisfying animations
- Progress celebrations that keep you motivated

### Smart Assessment Flow  
- **6 Security Domains**: Quick Wins, Account Security, Device Security, Safe Browsing, Data Protection, Network Security
- **Progressive Levels**: Start simple, unlock advanced questions as you improve
- **Context-Aware Questions**: Time estimates and actionable hints for every question

### Gamification That Works
- **Level progression** from "Getting Started" to "Cyber Ninja"
- **Achievement badges** for milestone completions
- **Impact-based scoring** prioritizes actions that matter most

### Privacy-First Design
- **Zero backend** - runs entirely in your browser
- **Local storage only** - your data never leaves your device
- **Export/Import** your progress as JSON files
- **No tracking** or analytics of any kind

## 🚀 Quick Start

### Try It Now
Visit **[electricessence.github.io/Cyber-Fitness-Advisor](https://electricessence.github.io/Cyber-Fitness-Advisor/)**

### Run Locally
```bash
# Clone the repository
git clone https://github.com/electricessence/Cyber-Fitness-Advisor.git
cd Cyber-Fitness-Advisor

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

### Deploy to GitHub Pages
1. Fork this repository
2. Go to Settings → Pages
3. Source: Deploy from branch
4. Branch: `gh-pages`
5. Push to `main` branch - GitHub Actions will automatically build and deploy

## 🏗️ Architecture

```
src/
├── features/assessment/
│   ├── engine/          # Pure scoring functions
│   │   ├── schema.ts    # TypeScript interfaces
│   │   └── scoring.ts   # Scoring algorithms
│   ├── data/
│   │   └── questions.json  # Question bank
│   └── state/
│       └── store.ts     # Zustand state management
├── components/
│   ├── ScoreBar.tsx     # Animated progress display
│   ├── QuestionCard.tsx # Individual question UI
│   ├── Recommendations.tsx # Smart next steps
│   └── Celebration.tsx  # Progress animations
└── App.tsx              # Main application shell
```

### Scoring Engine Design
- **Normalization**: Y/N → {0,1}, Scale 1-5 → {0,1} range
- **Weight System**: Questions weighted 1-10 by security impact
- **Quick Win Bonus**: 25% score multiplier for high-impact, easy actions
- **Progressive Thresholds**: Early levels require fewer points for faster initial progression

### State Management
- **Zustand** for lightweight, type-safe state management
- **Persistent storage** with automatic rehydration
- **Computed properties** for real-time score calculations
- **Local-only data** with export/import capabilities

## 🔧 Adding Questions

Questions follow a simple JSON schema:

```json
{
  "id": "unique_id",
  "type": "YN" | "SCALE", 
  "weight": 1-10,
  "quickWin": true,
  "timeEstimate": "2 minutes",
  "text": "Do you use a password manager?",
  "explanation": "Why this matters...",
  "actionHint": "How to do this..."
}
```

See [`docs/QUESTION_AUTHORING.md`](docs/QUESTION_AUTHORING.md) for detailed guidelines.

## 📈 Roadmap

### v0.1 (MVP) ✅
- [x] Core assessment engine with quick wins prioritization
- [x] Real-time scoring with animations
- [x] 6 security domains with progressive levels
- [x] Export/import functionality
- [x] GitHub Pages deployment

### v0.2 (Enhanced Experience)
- [ ] Expanded badge system with 15+ achievements
- [ ] Client-side PDF report generation
- [ ] "What changed since last time" progress tracking
- [ ] Shareable progress certificates

### v0.3 (Advanced Features)  
- [ ] PWA capabilities for offline use
- [ ] Themeable question packs (Family, Small Business, Enterprise)
- [ ] Import question banks from security frameworks
- [ ] Advanced radar chart visualizations

## 🤝 Contributing

We welcome contributions! See our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
```bash
pnpm install          # Install dependencies
pnpm dev             # Start dev server
pnpm build           # Build for production  
pnpm preview         # Preview production build
pnpm lint            # Run linting
```

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with modern web technologies:
- **Vite** - Lightning-fast development
- **React 18** - Component-based UI
- **TypeScript** - Type-safe development  
- **Tailwind CSS** - Utility-first styling
- **Zustand** - Lightweight state management
- **Lucide React** - Beautiful icons

---

**Made with 💙 for a more secure internet**

*"The best security is security that people actually use. Make it easy, make it rewarding, make it stick."*
