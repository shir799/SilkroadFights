/**
 * ⚔️ SILKROAD FIGHTS - ANIMATION SYSTEM EXPORTS ⚔️
 *
 * Central export file for all animation-related modules
 * Import everything you need from this single location
 */

// ============================================================================
// ANIMATIONS LIBRARY
// ============================================================================

export {
  // Animation variants - Character
  idleAnimation,
  walkAnimation,
  runAnimation,
  slashAttackAnimation,
  stabAttackAnimation,
  specialAttackAnimation,
  hitReactionAnimation,
  deathAnimation,
  victoryAnimation,

  // Animation variants - Combat Effects
  hitSparkAnimation,
  weaponTrailAnimation,
  shieldBlockAnimation,
  criticalHitAnimation,
  bloodSplatterAnimation,

  // Animation variants - UI
  damageNumberAnimation,
  criticalDamageNumberAnimation,
  healthBarTransition,
  cooldownAnimation,
  statusIconAnimation,

  // Animation variants - Environment
  dustCloudAnimation,
  shadowAnimation,
  silkSparkleAnimation,
  goldShineAnimation,

  // Combo and special effects
  comboAnimation,
  screenShakeAnimation,

  // Utilities
  generateParticleAnimation,
  createStaggerAnimation,
  getUnitAnimationVariant,
  calculateMovementDuration,
  shouldUseReducedMotion,
  getOptimizedTransition,

  // Constants
  ANIMATION_DURATIONS,
  ANIMATION_DELAYS,
  EASINGS,
  SPRING_CONFIGS,
} from './animations';

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/*
Basic Import Example:
```typescript
import {
  idleAnimation,
  slashAttackAnimation,
  ANIMATION_DURATIONS,
} from './lib';

// Use in Framer Motion component
<motion.div variants={idleAnimation} animate="idle">
  Character
</motion.div>
```

Component Import Example:
```typescript
import { AnimatedUnit } from './components/AnimatedUnit';
import { useUnitAnimation } from './hooks/useUnitAnimation';

const GameUnit = () => {
  const { animationState, playAnimation } = useUnitAnimation();

  return (
    <AnimatedUnit
      unit={unitData}
      imageUrl={unitImage}
      animationState={animationState}
      showEffects={true}
    />
  );
};
```
*/
