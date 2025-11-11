# Quick Start Guide - Silkroad Auto Chess Cinematic System

## 🚀 Get Started in 5 Minutes

### Step 1: Test the Complete System

```tsx
// In your app/page.tsx or any component
import GameFlowExample from '@/components/GameFlowExample';

export default function Page() {
  return <GameFlowExample />;
}
```

**That's it!** Run your app and you'll see the complete cinematic experience with demo controls.

---

## 📦 What You Get

### 6 Production-Ready Components
1. **SilkroadIntro** - Epic 45-second cinematic intro
2. **TransitionEffects** - 6 scene transition types
3. **VictoryScreen** - Celebration with confetti & fireworks
4. **DefeatScreen** - Encouraging defeat screen
5. **MainMenu** - TFT-style animated menu
6. **LoadingScreen** - Enhanced loading with tips

---

## 🎯 Quick Integration

### Add Intro to Your App

```tsx
'use client';

import { useState } from 'react';
import SilkroadIntro from '@/components/SilkroadIntro';
import MainMenu from '@/components/MainMenu';

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  if (showIntro) {
    return <SilkroadIntro onComplete={() => setShowIntro(false)} />;
  }

  return <MainMenu onPlay={() => console.log('Start game!')} />;
}
```

### Add Victory Screen

```tsx
import VictoryScreen from '@/components/VictoryScreen';

<VictoryScreen
  isVisible={playerWon}
  playerRole="TRADER"
  stats={{ roundsPlayed: 10, goldCollected: 1500 }}
  rewards={{ gold: 500, experience: 1200 }}
  onPlayAgain={() => restartGame()}
  onMainMenu={() => goToMenu()}
/>
```

### Add Transitions

```tsx
import { TransitionEffects } from '@/components/TransitionEffects';

<TransitionEffects
  type="silk_curtain"
  isActive={isTransitioning}
  duration={1000}
  onComplete={() => setIsTransitioning(false)}
/>
```

---

## 📱 Component Props Cheat Sheet

### SilkroadIntro
```tsx
<SilkroadIntro
  onComplete={() => {}}  // Required: Called after 45s
  onSkip={() => {}}      // Optional: Called on ESC/click
/>
```

### TransitionEffects
```tsx
<TransitionEffects
  type="fade" | "wipe" | "dissolve" | "silk_curtain" | "sand_storm" | "phase_shift"
  isActive={boolean}
  duration={1000}        // milliseconds
  onComplete={() => {}}
/>
```

### VictoryScreen
```tsx
<VictoryScreen
  isVisible={boolean}
  playerRole="TRADER" | "THIEF"
  stats={{
    goldCollected: number,
    unitsDefeated: number,
    roundsPlayed: number,
    // ... more stats
  }}
  rewards={{
    gold: number,
    experience: number,
    unlocks?: string[]
  }}
  onPlayAgain={() => {}}
  onMainMenu={() => {}}
/>
```

### DefeatScreen
```tsx
<DefeatScreen
  isVisible={boolean}
  playerRole="TRADER" | "THIEF"
  stats={{ /* same as victory */ }}
  tips={string[]}        // Optional
  onTryAgain={() => {}}
  onMainMenu={() => {}}
/>
```

### MainMenu
```tsx
<MainMenu
  onPlay={() => {}}
  onProfile={() => {}}   // Optional
  onCollection={() => {}}  // Optional
  onSettings={() => {}}  // Optional
  playerData={{
    name: string,
    level: number,
    experience: number,
    rank: string
  }}
/>
```

### LoadingScreen
```tsx
<LoadingScreen
  progress={0-100}       // Optional: shows percentage
  message={string}       // Optional: loading message
  showTips={boolean}     // Optional: default true
/>
```

---

## 🎨 Customization

### Change Colors

Edit `/lib/theme.ts`:
```typescript
export const theme = {
  colors: {
    primary: '#YOUR_COLOR',
    gold: '#YOUR_COLOR',
    // ...
  }
}
```

### Skip Intro After First View

```tsx
useEffect(() => {
  const seen = localStorage.getItem('silkroad_intro_seen');
  if (seen) setShowIntro(false);
}, []);

// Mark as seen
const handleIntroComplete = () => {
  localStorage.setItem('silkroad_intro_seen', 'true');
  setShowIntro(false);
};
```

---

## 🐛 Common Issues

### Issue: Intro doesn't show
**Fix:** Clear localStorage: `localStorage.removeItem('silkroad_intro_seen')`

### Issue: Animations are choppy
**Fix:** Reduce particle count in component files or use simpler transitions

### Issue: Components not found
**Fix:** Ensure all files are in `/components/` folder and imports are correct

### Issue: TypeScript errors
**Fix:** Run `npm install` to ensure all dependencies are installed

---

## 📚 Documentation Files

- **INTRO_INTEGRATION_GUIDE.md** - Complete integration guide
- **ASSET_REQUIREMENTS.md** - Asset specifications
- **CINEMATIC_INTRO_SUMMARY.md** - Full feature overview
- **QUICK_START_GUIDE.md** - This file

---

## 🎮 Demo Controls

The GameFlowExample includes demo controls in the bottom-right corner:
- Show Intro
- Go to Menu
- Start Game
- Test Victory
- Test Defeat
- Reset Intro

Use these to quickly test all components!

---

## ⚡ Performance Tips

### For Better Performance
1. Reduce particle count (change loop from 100 to 50)
2. Use 'fade' instead of complex transitions
3. Disable blur effects on low-end devices
4. Use WebP images instead of PNG

### Example: Reduce Particles
```tsx
// In SilkroadIntro.tsx, line ~39
for (let i = 0; i < 50; i++) {  // Changed from 100
  particles.push({...});
}
```

---

## 🎵 Adding Sound

Want to add sound? Here's how:

```tsx
// Create a hook
const useSound = (soundFile: string) => {
  const audio = new Audio(soundFile);
  return () => audio.play();
};

// Use in component
const playVictory = useSound('/audio/victory.mp3');

// In VictoryScreen
useEffect(() => {
  if (isVisible) playVictory();
}, [isVisible]);
```

---

## 📊 Component Statistics

| Component | Lines | Animations | Particles | Scenes |
|-----------|-------|------------|-----------|--------|
| SilkroadIntro | 650 | 50+ | 100+ | 5 |
| TransitionEffects | 340 | 20+ | 150+ | 6 |
| VictoryScreen | 380 | 30+ | 130+ | 1 |
| DefeatScreen | 300 | 20+ | 40+ | 1 |
| MainMenu | 380 | 25+ | 15+ | 1 |
| LoadingScreen | 350 | 15+ | 20+ | 1 |

---

## 🚢 Deployment Checklist

Before deploying to production:
- [ ] Test on multiple devices
- [ ] Optimize images (use ImageOptim, TinyPNG)
- [ ] Test skip functionality
- [ ] Verify localStorage works
- [ ] Test all transitions
- [ ] Check mobile responsiveness
- [ ] Test with slow 3G network
- [ ] Enable production mode for React
- [ ] Add error boundaries
- [ ] Test victory/defeat flows

---

## 🎯 Next Steps

1. **Test the GameFlowExample** - See everything in action
2. **Integrate one component at a time** - Start with MainMenu
3. **Customize colors and timing** - Make it your own
4. **Add sound effects** - Enhance the experience
5. **Deploy and share** - Show off your game!

---

## 💡 Pro Tips

1. **Use transitions between all state changes** for a polished feel
2. **Keep intro skippable** - respect player's time
3. **Show loading tips** - educate players while loading
4. **Celebrate victories** - make players feel accomplished
5. **Encourage on defeat** - keep players engaged

---

## 🎊 You're Ready!

Everything you need is in the `/components/` folder. Start with GameFlowExample, then integrate components one by one into your game.

**Need help?** Check the full guides:
- INTRO_INTEGRATION_GUIDE.md
- ASSET_REQUIREMENTS.md
- CINEMATIC_INTRO_SUMMARY.md

**Happy building!** 🏜️✨

---

**Quick Links:**
- Components: `/components/`
- Theme Config: `/lib/theme.ts`
- Example: `/components/GameFlowExample.tsx`

