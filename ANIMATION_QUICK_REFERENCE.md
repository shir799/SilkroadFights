# ⚔️ Animation System - Quick Reference

## 🚀 Quick Start

```tsx
import { AnimatedUnit } from './components/AnimatedUnit';
import { useUnitAnimation } from './hooks/useUnitAnimation';

// In your component
const { animationState, playAnimation } = useUnitAnimation();

<AnimatedUnit
  unit={unitData}
  imageUrl={unitImage}
  animationState={animationState}
  showEffects={true}
/>

// Trigger animation
await playAnimation('attacking-slash');
```

---

## 🎬 Animation States

| State | Code | Duration | Use For |
|-------|------|----------|---------|
| Idle | `'idle'` | 2.5s | Default/resting |
| Walk | `'walking'` | 0.8s | 1-2 tile move |
| Run | `'running'` | 0.75s | 3+ tile move |
| Slash | `'attacking-slash'` | 0.3s | Sword attacks |
| Stab | `'attacking-stab'` | 0.25s | Spear/dagger |
| Special | `'attacking-special'` | 0.5s | Power moves |
| Hit | `'hit'` | 0.2s | Taking damage |
| Block | `'blocking'` | 0.25s | Defending |
| Dying | `'dying'` | 1.2s | Death sequence |
| Dead | `'dead'` | - | Defeated |
| Victory | `'victory'` | 2.4s | Celebration |

---

## 🎯 AnimatedUnit Props

```tsx
<AnimatedUnit
  unit={unitData}              // Required: Unit data
  imageUrl="path/to/image"     // Required: Sprite image
  animationState="idle"        // Current animation
  showEffects={true}           // Enable effects
  isSelected={false}           // Selection glow
  damageAmount={5}             // Show damage popup
  isCritical={false}           // Critical hit style
  showDustTrail={false}        // Movement dust
  collectingSilk={false}       // Silk sparkle
  nearGold={false}             // Gold glow
  onAnimationComplete={fn}     // Callback
/>
```

---

## 🎮 Common Patterns

### Attack Sequence
```tsx
const handleAttack = async () => {
  await playAnimation('attacking-slash');
  // Hit logic here
  setTimeout(() => defenderAnim.playAnimation('hit'), 150);
};
```

### Movement
```tsx
const handleMove = (distance: number) => {
  const state = distance > 2 ? 'running' : 'walking';
  playAnimation(state);
};
```

### Damage
```tsx
// Just update HP - animation auto-triggers!
setUnit(prev => ({ ...prev, hp: prev.hp - damage }));
```

### Death
```tsx
if (unit.hp <= 0) {
  await playAnimation('dying');
  await playAnimation('dead');
}
```

---

## 🎪 Effects

| Effect | Prop | Visual |
|--------|------|--------|
| Hit Sparks | Auto on hit | ⭐ Starburst |
| Critical | `isCritical={true}` | ⚡ Lightning |
| Dust Trail | `showDustTrail={true}` | 💨 Clouds |
| Silk Collect | `collectingSilk={true}` | ✨ Sparkle |
| Gold Glow | `nearGold={true}` | 💛 Shine |
| Buff | `unit.buffs=[...]` | 🟢 Green icon |
| Debuff | `unit.debuffs=[...]` | 🔴 Red icon |
| Immobilized | `unit.isImmobilized` | ⛓️ Chains |
| Low HP | HP < 30% | 🔴 Red border |

---

## 🪝 Hooks

### Basic Usage
```tsx
const { animationState, playAnimation } = useUnitAnimation();

// Play animation
await playAnimation('attacking-slash');

// Queue multiple
queueAnimation('attacking-slash');
queueAnimation('victory', 800, 200); // +200ms delay
```

### Combat Sequence
```tsx
const { attackerState, defenderState, playCombatSequence } =
  useCombatAnimation();

await playCombatSequence('slash', false, false);
//                        ^type   ^dies  ^crit
```

### Advanced Sequence
```tsx
const { playSequence } = useAnimationSequence();

await playSequence([
  { unitId: 'u1', animation: 'attacking-slash' },
  { unitId: 'u2', animation: 'hit', delay: 150 },
  { unitId: 'u1', animation: 'victory', delay: 300 },
], unitAnimationMap);
```

---

## ⚡ Performance Tips

```tsx
// ✅ Good - GPU accelerated
animate={{ x: 100, scale: 1.2 }}

// ❌ Bad - Layout reflow
animate={{ width: 100, left: 50 }}

// ✅ Good - Conditional rendering
{showEffects && <HitSpark />}

// ✅ Good - Cleanup
useEffect(() => {
  const timeout = setTimeout(...);
  return () => clearTimeout(timeout);
}, []);

// ✅ Good - Reduced motion
import { shouldUseReducedMotion } from './lib/animations';
const duration = shouldUseReducedMotion() ? 0 : 0.5;
```

---

## 🎨 Customization

### Change Speed
```tsx
// In animations.ts
ATTACK_SLASH: 0.3  →  0.2  // Faster
HIT_REACTION: 0.2  →  0.3  // Slower
```

### Change Colors
```tsx
// Damage numbers
text-red-500  →  text-orange-500
text-yellow-400  →  text-purple-400

// Hit sparks
<HitSpark color="#FFA500" />  →  color="#FF0000"
```

### Particle Count
```tsx
// More particles
{Array.from({ length: 8 })}  →  { length: 12 }
```

---

## 🐛 Common Issues

### Animation Not Starting
```tsx
// ❌ Wrong
<AnimatedUnit animationState="idle" />

// ✅ Correct
const [state, setState] = useState('idle');
<AnimatedUnit animationState={state} />
```

### Damage Number Not Showing
```tsx
// Ensure HP changes
console.log('HP:', oldHp, '→', newHp);

// Enable effects
showEffects={true}

// Check z-index
className="z-50"
```

### Memory Leak
```tsx
// Always cleanup timeouts
useEffect(() => {
  const t = setTimeout(...);
  return () => clearTimeout(t);
}, []);
```

---

## 📊 Timing Chart

```
Attack (0.3s):  [=========>]
                     ↓ 150ms delay
Hit (0.2s):          [=====>]
                          ↓ 200ms delay
Idle:                     [=====...]
```

---

## 🔗 File Locations

- **Animations:** `silkroad_fights/lib/animations.ts`
- **Component:** `silkroad_fights/components/AnimatedUnit.tsx`
- **Hook:** `silkroad_fights/hooks/useUnitAnimation.ts`
- **Examples:** `silkroad_fights/components/AnimatedUnitExample.tsx`
- **Full Docs:** `ANIMATION_SYSTEM.md`

---

## 💡 Pro Tips

1. **Auto damage detection** - Just update HP, popups appear automatically
2. **Chainable animations** - Use `queueAnimation` for sequences
3. **Combat helper** - `useCombatAnimation` handles attacker + defender
4. **Performance mode** - System auto-detects reduced motion preference
5. **Mobile optimized** - Fewer particles on mobile devices
6. **Type safety** - Full TypeScript support with autocomplete
7. **Cancelable** - Most animations can be interrupted
8. **Callback support** - Know when animations complete

---

## 📝 Example: Complete Combat

```tsx
const GameBoard = () => {
  const attacker = useUnitAnimation();
  const defender = useUnitAnimation();

  const handleCombat = async () => {
    // 1. Attacker attacks
    await attacker.playAnimation('attacking-slash');

    // 2. Defender takes hit (damage auto-shows)
    setDefenderHp(prev => prev - 1);
    await defender.playAnimation('hit');

    // 3. Check death
    if (defenderHp <= 0) {
      await defender.playAnimation('dying');
      await defender.playAnimation('dead');
      // Victory!
      await attacker.playAnimation('victory');
    } else {
      // Return to idle
      attacker.resetToIdle();
      defender.resetToIdle();
    }
  };

  return (
    <div>
      <AnimatedUnit
        unit={attackerUnit}
        imageUrl={attackerImg}
        animationState={attacker.animationState}
        showEffects={true}
      />
      <AnimatedUnit
        unit={defenderUnit}
        imageUrl={defenderImg}
        animationState={defender.animationState}
        showEffects={true}
      />
      <button onClick={handleCombat}>Fight!</button>
    </div>
  );
};
```

---

**🎉 That's it! You're ready to create awesome combat animations!**

For full documentation, see `ANIMATION_SYSTEM.md`
