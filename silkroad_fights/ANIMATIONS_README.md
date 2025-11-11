# ⚔️ Silkroad Fights - Combat Animation System

## 🎬 Professional Combat Animations with Framer Motion

A complete, production-ready animation system featuring 24+ unique animations, combat effects, and seamless game integration.

---

## 🚀 Quick Start

```tsx
import { AnimatedUnit } from './components/AnimatedUnit';
import { useUnitAnimation } from './hooks/useUnitAnimation';

function MyGame() {
  const { animationState, playAnimation } = useUnitAnimation();

  return (
    <AnimatedUnit
      unit={unitData}
      imageUrl={unitImage}
      animationState={animationState}
      showEffects={true}
    />
  );
}
```

---

## 📁 Files

### Core System
- **`lib/animations.ts`** (15 KB) - Animation library with 24+ variants
- **`components/AnimatedUnit.tsx`** (19 KB) - Main animated component
- **`hooks/useUnitAnimation.ts`** (13 KB) - React hooks for animation control
- **`lib/index.ts`** (2 KB) - Central export file

### Examples & Documentation
- **`components/AnimatedUnitExample.tsx`** (13 KB) - Live examples
- **`ANIMATION_SYSTEM.md`** (19 KB) - Complete documentation
- **`ANIMATION_QUICK_REFERENCE.md`** (7 KB) - Cheat sheet
- **`ANIMATION_SUMMARY.md`** (15 KB) - Overview
- **`GAMEBOARD_INTEGRATION_GUIDE.md`** (15 KB) - Integration guide

---

## 🎯 Features

### Character Animations
- ✅ Idle breathing
- ✅ Walk & Run
- ✅ Attack variants (slash, stab, special)
- ✅ Hit reactions
- ✅ Death sequences
- ✅ Victory celebrations

### Combat Effects
- ✅ Hit sparks (particles)
- ✅ Weapon trails
- ✅ Critical hits (lightning)
- ✅ Shield blocks
- ✅ Blood effects

### UI Elements
- ✅ Floating damage numbers
- ✅ Critical damage (larger)
- ✅ Smooth health bars
- ✅ Status effect icons
- ✅ Cooldown indicators

### Environment
- ✅ Dust trails
- ✅ Dynamic shadows
- ✅ Silk sparkles
- ✅ Gold glow
- ✅ Low HP warnings

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [ANIMATION_SYSTEM.md](../ANIMATION_SYSTEM.md) | Complete API reference and guide |
| [ANIMATION_QUICK_REFERENCE.md](../ANIMATION_QUICK_REFERENCE.md) | One-page cheat sheet |
| [ANIMATION_SUMMARY.md](../ANIMATION_SUMMARY.md) | Overview and statistics |
| [GAMEBOARD_INTEGRATION_GUIDE.md](../GAMEBOARD_INTEGRATION_GUIDE.md) | Step-by-step integration |

---

## 🎮 Usage Examples

### Basic Animation
```tsx
const { animationState, playAnimation } = useUnitAnimation();

// Play attack
await playAnimation('attacking-slash');
```

### Combat Sequence
```tsx
const { attackerState, defenderState, playCombatSequence } =
  useCombatAnimation();

// Full combat animation
await playCombatSequence('slash', false, false);
```

### Damage Numbers
```tsx
// Just update HP - popups appear automatically!
setUnit(prev => ({ ...prev, hp: prev.hp - damage }));
```

---

## ⚡ Performance

- **Target:** 60 FPS
- **GPU Accelerated:** Yes
- **Mobile Optimized:** Yes
- **Memory Safe:** Auto-cleanup
- **Reduced Motion:** Supported

---

## 🎨 Customization

### Change Timing
Edit `lib/animations.ts`:
```typescript
ANIMATION_DURATIONS.ATTACK_SLASH = 0.2; // Faster
```

### Change Colors
Edit `components/AnimatedUnit.tsx`:
```tsx
text-red-500 → text-orange-500
```

### Add Custom Animation
```typescript
export const myAnimation: Variants = {
  idle: { scale: 1 },
  active: { scale: 1.2 }
};
```

---

## 🔗 Dependencies

- ✅ Framer Motion (already installed)
- ✅ React (already installed)
- ✅ TypeScript (already installed)

**No additional installation needed!**

---

## 📊 Statistics

| Metric | Value |
|--------|-------|
| Total Code | 1,815 lines |
| Animations | 24+ variants |
| Components | 5 |
| Hooks | 3 |
| Functions | 10+ |
| Documentation | 4 guides |

---

## 🎓 Learning Path

1. **Beginners:** Start with [ANIMATION_QUICK_REFERENCE.md](../ANIMATION_QUICK_REFERENCE.md)
2. **Integration:** Follow [GAMEBOARD_INTEGRATION_GUIDE.md](../GAMEBOARD_INTEGRATION_GUIDE.md)
3. **Deep Dive:** Read [ANIMATION_SYSTEM.md](../ANIMATION_SYSTEM.md)
4. **Examples:** Run `components/AnimatedUnitExample.tsx`

---

## ✨ Highlights

### 1. Auto Damage Detection
No need to manually trigger damage popups - they appear automatically when HP changes!

### 2. Chainable Animations
Queue multiple animations for complex sequences:
```tsx
queueAnimation('attacking-slash');
queueAnimation('victory', 800, 200);
```

### 3. Combat Helper
Easy two-unit combat sequences:
```tsx
await playCombatSequence('slash', false, false);
```

### 4. Performance Mode
Automatically detects and respects user's reduced motion preference.

### 5. Type Safe
Full TypeScript support with autocomplete everywhere.

---

## 🎉 Ready to Use!

All files are created and ready to integrate into your game. No additional setup required!

**Start animating:**
1. Import `AnimatedUnit`
2. Replace static images
3. Add animation triggers
4. Enjoy awesome combat!

---

## 📝 License

Part of the Silkroad Fights game project.

---

**Made with ⚔️ by the Animation Agent**

*Let's make your game come alive!*
