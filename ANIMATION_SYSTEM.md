# ⚔️ Silkroad Fights - Animation System Documentation

A comprehensive combat animation system built with Framer Motion for smooth, performant 60 FPS gameplay.

## 📁 Files Overview

### Core Files
- **`silkroad_fights/lib/animations.ts`** - Animation library with all variants, transitions, and utilities
- **`silkroad_fights/components/AnimatedUnit.tsx`** - Main animated unit component
- **`silkroad_fights/components/AnimatedUnitExample.tsx`** - Usage examples and integration guide

---

## 🎬 Animation Categories

### 1. Character Animations

#### Idle Animation
Subtle breathing effect to show character life
```typescript
import { idleAnimation } from '../lib/animations';

<motion.div variants={idleAnimation} animate="idle">
  {/* Character */}
</motion.div>
```
- **Duration:** 2.5s
- **Effect:** Gentle up/down bob with slight scale
- **Loops:** Infinite

#### Walk Animation
Smooth horizontal movement with natural bobbing
- **Duration:** 0.8s (0.4s per step)
- **Effect:** Horizontal movement with vertical bob
- **Use Case:** Moving 1-2 tiles

#### Run Animation
Faster movement with more pronounced motion
- **Duration:** 0.75s (0.25s per step)
- **Effect:** Fast horizontal with exaggerated bob
- **Use Case:** Moving 3+ tiles

#### Attack Animations

**Slash Attack** - Wide horizontal swing
```typescript
animationState="attacking-slash"
```
- **Duration:** 0.3s
- **Motion:** Rotation -15° to 45°, horizontal thrust
- **Best For:** Sword/blade attacks

**Stab Attack** - Forward thrust
```typescript
animationState="attacking-stab"
```
- **Duration:** 0.25s
- **Motion:** Quick forward lunge
- **Best For:** Spear/dagger attacks

**Special Attack** - Powerful overhead strike
```typescript
animationState="attacking-special"
```
- **Duration:** 0.5s
- **Motion:** Overhead arc with scale increase
- **Best For:** Heavy/critical strikes

#### Hit Reaction
Shake and flash red when taking damage
- **Duration:** 0.2s
- **Effect:** Rapid shake with red filter overlay
- **Triggers:** Automatically on HP decrease

#### Death Animation
Dramatic fall with fade out
- **Duration:** 1.2s
- **Effect:** Rotate -90°, fade opacity, scale down
- **Use Case:** Unit eliminated

#### Victory Pose
Triumphant celebration
- **Duration:** 0.8s (repeats 3x)
- **Effect:** Bounce up with scale increase
- **Use Case:** Win screen, silk collection

---

### 2. Combat Effects

#### Hit Sparks
Explosive particle effect on impact
```typescript
<HitSpark x={0} y={0} color="#FFA500" />
```
- **Duration:** 0.3s
- **Visual:** 8-ray starburst pattern
- **Auto-triggers:** On hit/attack

#### Weapon Trail
Motion blur effect during swings
- **Duration:** 0.4s
- **Visual:** SVG path animation
- **Implementation:** Automatic with attack animations

#### Shield Block
Protective flash effect
- **Duration:** 0.25s
- **Visual:** Scale pulse with glow
- **Use Case:** Defensive actions

#### Critical Hit
Massive impact with emphasis
```typescript
isCritical={true}
```
- **Duration:** 0.5s
- **Visual:** Lightning bolt ⚡ with scale bounce
- **Damage:** 1.5-2x display size

#### Blood Splatter
Stylized impact particles (not graphic)
- **Duration:** 0.6s
- **Visual:** Red dots spreading outward
- **Angles:** Customizable direction
- **Style:** Cartoon-like, game appropriate

---

### 3. UI Animations

#### Damage Numbers
Floating damage indicators
```typescript
<DamageNumber
  amount={damage}
  isCritical={false}
  x={0}
  y={0}
/>
```

**Normal Damage:**
- Font size: 2xl
- Color: Red (#EF4444)
- Float distance: -60px
- Duration: 1.5s

**Critical Damage:**
- Font size: 3xl
- Color: Yellow (#FBBF24)
- Float distance: -80px
- Duration: 1.8s
- Adds "CRIT!" label
- Rotation wobble effect

#### Health Bar
Smooth bar transitions
```typescript
import { healthBarTransition } from '../lib/animations';

<motion.div
  transition={healthBarTransition}
  style={{ width: `${(hp / maxHp) * 100}%` }}
/>
```
- **Duration:** 0.4s
- **Easing:** Ease-out
- **Color Transitions:** Green → Yellow → Red

#### Ability Cooldown
Circular progress indicator
```typescript
variants={cooldownAnimation}
```
- **Visual:** SVG circle path
- **Direction:** Clockwise depletion
- **Use Case:** Ability buttons

#### Status Effect Icons
Buff/debuff indicators with pulse
```typescript
unit.buffs = [{ type: 'Attack+', duration: 3 }]
```
- **Appearance:** Bounce-in animation
- **Active State:** Gentle pulse with glow
- **Colors:**
  - Buffs: Green (#10B981)
  - Debuffs: Red (#EF4444)

---

### 4. Environment Effects

#### Dust Clouds
Ground particles when moving
```typescript
showDustTrail={true}
```
- **Count:** 3 clouds
- **Duration:** 0.8s
- **Motion:** Trail behind unit
- **Color:** Gray with opacity

#### Dynamic Shadow
Realistic shadow under units
- **Base opacity:** 0.3
- **Scales:** With jumping/falling
- **Always present:** Under all units

#### Silk Sparkle
Magical collection effect
```typescript
collectingSilk={true}
```
- **Duration:** 1.0s
- **Visual:** Sparkle ✨ rising and spinning
- **Triggers:** When collecting silk items

#### Gold Shine
Treasure glow animation
```typescript
nearGold={true}
```
- **Duration:** 1.2s (infinite loop)
- **Visual:** Radial glow pulse
- **Color:** Gold (#FFD700)
- **Effect:** Brightness + drop shadow

---

## 🎯 AnimatedUnit Component API

### Props

```typescript
interface AnimatedUnitProps {
  unit: Unit;                           // Game unit data
  imageUrl: string;                     // Unit sprite image
  animationState?: AnimationState;      // Current animation
  showEffects?: boolean;                // Enable/disable effects
  isSelected?: boolean;                 // Selection highlight
  damageAmount?: number;                // Trigger damage popup
  isCritical?: boolean;                 // Critical hit styling
  showDustTrail?: boolean;              // Movement dust
  collectingSilk?: boolean;             // Silk collection
  nearGold?: boolean;                   // Gold proximity glow
  className?: string;                   // Additional CSS
  onAnimationComplete?: (state) => void; // Callback
}
```

### Animation States

```typescript
type AnimationState =
  | 'idle'                // Default resting state
  | 'walking'             // Slow movement
  | 'running'             // Fast movement
  | 'attacking-slash'     // Horizontal swing
  | 'attacking-stab'      // Forward thrust
  | 'attacking-special'   // Special move
  | 'hit'                 // Taking damage
  | 'blocking'            // Defensive stance
  | 'dying'               // Death sequence
  | 'dead'                // Deceased state
  | 'victory';            // Celebration
```

---

## 🚀 Performance Optimizations

### 60 FPS Target
All animations are optimized for smooth 60 FPS gameplay:

1. **GPU Acceleration**
   - Transforms use `translateX/Y/Z`, `scale`, `rotate`
   - No layout-triggering properties (width/height)
   - Hardware-accelerated CSS filters

2. **Animation Cancellation**
   - All animations can be interrupted mid-play
   - Smooth transitions between states
   - No animation queue buildup

3. **Reduced Motion Support**
   ```typescript
   import { shouldUseReducedMotion } from '../lib/animations';

   if (shouldUseReducedMotion()) {
     // Disable or simplify animations
   }
   ```

4. **Memory Management**
   - Automatic cleanup of effect particles
   - Timeout management prevents leaks
   - AnimatePresence for mount/unmount

### Performance Best Practices

```typescript
// ✅ GOOD - GPU accelerated
<motion.div
  animate={{ x: 100, scale: 1.2 }}
/>

// ❌ BAD - Triggers layout reflow
<motion.div
  animate={{ width: 100, left: 50 }}
/>

// ✅ GOOD - Use will-change sparingly
<motion.div
  style={{ willChange: 'transform' }}
  animate={{ x: 100 }}
/>

// ✅ GOOD - Cleanup effects
useEffect(() => {
  return () => {
    // Cleanup code
  };
}, []);
```

---

## 📖 Integration Guide

### Step 1: Basic Setup

```typescript
import { AnimatedUnit } from './components/AnimatedUnit';
import { AnimationState } from './components/AnimatedUnit';

const [animationState, setAnimationState] =
  useState<AnimationState>('idle');
```

### Step 2: Replace Static Images

**Before:**
```typescript
<img src={unitImage} alt="Unit" />
```

**After:**
```typescript
<AnimatedUnit
  unit={unitData}
  imageUrl={unitImage}
  animationState={animationState}
  showEffects={true}
/>
```

### Step 3: Trigger Animations

**On Attack:**
```typescript
const handleAttack = (attacker, defender) => {
  // 1. Play attack animation
  setUnitAnimation(attacker.id, 'attacking-slash');

  // 2. After delay, show hit reaction
  setTimeout(() => {
    setUnitAnimation(defender.id, 'hit');
  }, 150);

  // 3. Return to idle
  setTimeout(() => {
    setUnitAnimation(attacker.id, 'idle');
    setUnitAnimation(defender.id, 'idle');
  }, 500);
};
```

**On Movement:**
```typescript
const handleMove = (unit, distance) => {
  const state = distance > 2 ? 'running' : 'walking';
  setUnitAnimation(unit.id, state);

  // Return to idle when movement completes
  const duration = calculateMovementDuration(
    unit.x, unit.y,
    targetX, targetY
  );

  setTimeout(() => {
    setUnitAnimation(unit.id, 'idle');
  }, duration * 1000);
};
```

**On Victory:**
```typescript
const handleVictory = (winnerId) => {
  setUnitAnimation(winnerId, 'victory');
};
```

### Step 4: Handle Damage

```typescript
// Damage is auto-detected by HP changes
const [unit, setUnit] = useState({
  hp: 3,
  maxHp: 3,
  // ... other props
});

// When damage occurs, just update HP
setUnit(prev => ({
  ...prev,
  hp: prev.hp - damage
}));

// AnimatedUnit will automatically:
// 1. Show damage number
// 2. Play hit animation
// 3. Flash red
// 4. Show hit sparks
```

### Step 5: Status Effects

```typescript
// Add buffs/debuffs to unit
setUnit(prev => ({
  ...prev,
  buffs: [{ type: 'Attack+', duration: 3 }],
  debuffs: [{ type: 'Slow', duration: 2 }],
  isImmobilized: true,
}));

// Icons appear automatically above unit
```

---

## 🎨 Customization

### Timing Constants

Adjust animation speeds in `animations.ts`:

```typescript
export const ANIMATION_DURATIONS = {
  ATTACK_SLASH: 0.3,  // Make faster: 0.2
  HIT_REACTION: 0.2,  // Make slower: 0.3
  // ... etc
};
```

### Easing Functions

Choose from presets or create custom:

```typescript
export const EASINGS = {
  SMOOTH: [0.43, 0.13, 0.23, 0.96],
  BOUNCE: [0.68, -0.55, 0.265, 1.55],
  ATTACK: [0.85, 0, 0.15, 1],
  // Add custom: [x1, y1, x2, y2]
};
```

### Colors

Customize effect colors:

```typescript
// In AnimatedUnit.tsx
const damageColor = isCritical
  ? 'text-yellow-400'    // Change critical color
  : 'text-red-500';      // Change normal color

// Hit spark color
<HitSpark color="#FFA500" /> // Orange
<HitSpark color="#FF0000" /> // Red
```

### Particle Counts

Adjust effect intensity:

```typescript
// More hit sparks
{Array.from({ length: 12 }).map(...)} // Default: 8

// More dust clouds
{Array.from({ length: 5 }).map(...)} // Default: 3
```

---

## 🔧 Utility Functions

### Calculate Movement Duration

```typescript
import { calculateMovementDuration } from '../lib/animations';

const duration = calculateMovementDuration(
  startX, startY,
  endX, endY,
  unitSpeed // 1.0 = normal, 1.5 = fast
);
```

### Unit-Specific Variants

```typescript
import { getUnitAnimationVariant } from '../lib/animations';

const variant = getUnitAnimationVariant('TH');
// Returns: { scale: 0.95, speed: 1.3 }
```

### Screen Shake

```typescript
import { screenShakeAnimation } from '../lib/animations';

<motion.div
  variants={screenShakeAnimation('heavy')}
  animate="shaking"
>
  {/* Game board */}
</motion.div>
```

### Particle Generation

```typescript
import { generateParticleAnimation } from '../lib/animations';

const particles = generateParticleAnimation(
  count: 10,          // Number of particles
  spreadRadius: 50,   // Spread distance
  duration: 0.8       // Animation duration
);
```

---

## 🎮 Game Board Integration

### Complete Example

```typescript
// GameBoard.tsx
import { AnimatedUnit, AnimationState } from './AnimatedUnit';
import { useState } from 'react';

const GameBoard: React.FC = () => {
  // Track animation state for each unit
  const [animations, setAnimations] = useState<
    Record<string, AnimationState>
  >({});

  // Helper to update unit animation
  const setUnitAnimation = (
    row: number,
    col: number,
    state: AnimationState
  ) => {
    setAnimations(prev => ({
      ...prev,
      [`${row}-${col}`]: state
    }));
  };

  // Render cell
  const renderCell = (cell: string, row: number, col: number) => {
    if (!hasUnit(cell)) return null;

    return (
      <AnimatedUnit
        unit={getUnitData(cell, row, col)}
        imageUrl={getUnitImage(cell)}
        animationState={animations[`${row}-${col}`] || 'idle'}
        isSelected={isSelectedCell(row, col)}
        showEffects={true}
        onAnimationComplete={(state) => {
          if (state === 'idle') {
            // Animation finished, update game state
          }
        }}
      />
    );
  };

  // Handle combat
  const handleCombat = (attacker, defender, damage) => {
    // 1. Attack animation
    setUnitAnimation(
      attacker.row,
      attacker.col,
      'attacking-slash'
    );

    // 2. Hit reaction
    setTimeout(() => {
      setUnitAnimation(
        defender.row,
        defender.col,
        'hit'
      );

      // Update HP (triggers damage popup)
      updateUnitHp(defender, damage);
    }, 150);

    // 3. Check for death
    setTimeout(() => {
      if (defender.hp <= 0) {
        setUnitAnimation(
          defender.row,
          defender.col,
          'dying'
        );
      } else {
        setUnitAnimation(
          defender.row,
          defender.col,
          'idle'
        );
      }

      setUnitAnimation(
        attacker.row,
        attacker.col,
        'idle'
      );
    }, 400);
  };

  return (
    <div className="grid grid-cols-8 gap-1">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => (
          <div key={`${rowIndex}-${colIndex}`}>
            {renderCell(cell, rowIndex, colIndex)}
          </div>
        ))
      )}
    </div>
  );
};
```

---

## 🐛 Troubleshooting

### Animations Not Playing

**Issue:** Animations don't start
```typescript
// ❌ Wrong
<AnimatedUnit animationState="idle" />

// ✅ Correct - use state
const [state, setState] = useState('idle');
<AnimatedUnit animationState={state} />
```

### Performance Issues

**Issue:** Frame drops during animations
```typescript
// Check DevTools Performance tab
// Common causes:
// 1. Too many units animating at once
// 2. Complex filters on mobile
// 3. Not using GPU acceleration

// Solutions:
// 1. Stagger animations
// 2. Reduce particle counts on mobile
// 3. Use transform instead of position
```

### Memory Leaks

**Issue:** Memory usage increases over time
```typescript
// ✅ Always cleanup timeouts
useEffect(() => {
  const timeout = setTimeout(...);
  return () => clearTimeout(timeout);
}, []);

// ✅ Use AnimatePresence for mount/unmount
<AnimatePresence>
  {show && <AnimatedUnit ... />}
</AnimatePresence>
```

### Damage Numbers Not Showing

**Issue:** Damage popups don't appear
```typescript
// Ensure HP is actually changing
console.log('Old HP:', oldHp, 'New HP:', newHp);

// Check if showEffects is true
<AnimatedUnit showEffects={true} />

// Verify z-index is high enough
className="z-50" // On damage numbers
```

---

## 📊 Animation Timing Reference

| Animation | Duration | Delay | Repeats | Cancelable |
|-----------|----------|-------|---------|------------|
| Idle | 2.5s | - | ∞ | Yes |
| Walk | 0.8s | - | 1 | Yes |
| Run | 0.75s | - | 1 | Yes |
| Slash Attack | 0.3s | - | 1 | No |
| Stab Attack | 0.25s | - | 1 | No |
| Special Attack | 0.5s | - | 1 | No |
| Hit Reaction | 0.2s | 0.1s | 1 | No |
| Death | 1.2s | - | 1 | No |
| Victory | 0.8s | 0.3s | 3 | Yes |
| Hit Spark | 0.3s | - | 1 | No |
| Weapon Trail | 0.4s | - | 1 | No |
| Critical Hit | 0.5s | - | 1 | No |
| Damage Number | 1.5s | 0.15s | 1 | No |
| Dust Cloud | 0.8s | - | 1 | Yes |
| Silk Sparkle | 1.0s | - | 1 | No |
| Gold Shine | 1.2s | - | ∞ | Yes |

---

## 🎓 Best Practices

### 1. Animation Sequencing
```typescript
// ✅ Good - Clear sequence
const sequence = async () => {
  await controls.start('attacking');
  await controls.start('idle');
};

// ❌ Bad - Timing conflicts
controls.start('attacking');
controls.start('idle'); // Starts immediately!
```

### 2. State Management
```typescript
// ✅ Good - Single source of truth
const [state, setState] = useState<AnimationState>('idle');

// ❌ Bad - Multiple state variables
const [isAttacking, setIsAttacking] = useState(false);
const [isHit, setIsHit] = useState(false);
const [isDead, setIsDead] = useState(false);
```

### 3. Performance
```typescript
// ✅ Good - Conditionally render effects
{showEffects && <HitSpark />}

// ✅ Good - Use useMemo for expensive calculations
const particleAnimations = useMemo(
  () => generateParticleAnimation(10, 50, 0.8),
  [particleCount]
);

// ❌ Bad - Always rendering all effects
<HitSpark />
<DustCloud />
<BloodSplatter />
```

### 4. Accessibility
```typescript
// ✅ Good - Respect user preferences
import { shouldUseReducedMotion } from '../lib/animations';

const transition = shouldUseReducedMotion()
  ? { duration: 0 }
  : { duration: 0.5 };
```

---

## 📦 Export Summary

### From `animations.ts`:
- Animation variants for all character states
- Combat effect animations
- UI element animations
- Environment effect animations
- Utility functions
- Timing constants
- Easing presets

### From `AnimatedUnit.tsx`:
- `AnimatedUnit` - Main component
- `DamageNumber` - Standalone damage popup
- `HitSpark` - Standalone hit effect
- `DustCloud` - Standalone dust effect
- `AnimationState` - Type definition

### From `AnimatedUnitExample.tsx`:
- Usage examples
- Integration patterns
- Demo components

---

## 🚀 Quick Start Checklist

- [x] Import `AnimatedUnit` component
- [x] Replace static unit images with `<AnimatedUnit>`
- [x] Add animation state management
- [x] Trigger animations on game events
- [x] Test damage popups with HP changes
- [x] Verify 60 FPS performance
- [x] Test on mobile devices
- [x] Add status effect support
- [x] Implement victory animations
- [x] Test reduced motion support

---

## 📝 Notes

- All animations use Framer Motion 11+ features
- Tested on Chrome, Firefox, Safari, Edge
- Mobile-optimized with reduced particles
- Accessibility-friendly with reduced motion support
- Memory-leak free with proper cleanup
- TypeScript-first with full type safety

---

## 🎉 Enjoy Your Awesome Animations!

Your game now has professional-grade combat animations. Players will love the smooth, responsive feel of every action!

**Happy Coding! ⚔️**
