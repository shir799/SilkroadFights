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
// PROGRESSION SYSTEM
// ============================================================================

export {
  // Core Systems
  XPSystem,
  UnlockSystem,
  UpgradeSystem,
  SkillTreeSystem,
  RewardSystem,
  LeaderboardSystem,
  TitleSystem,
  AchievementSystem,
  PrestigeSystem,
  ProfileManager,

  // Types
  type PlayerProfile,
  type PlayerStats,
  type PlayerUpgrades,
  type UnitUpgrades,
  type SkillTreeProgress,
  type SkillBranch,
  type Skill,
  type SkillEffect,
  type Achievement,
  type Reward,
  type LevelUnlock,
  type LeaderboardEntry,
  type DailyReward,
} from './progressionSystem';

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

Progression System Example:
```typescript
import { ProfileManager, XPSystem, UpgradeSystem } from './lib';

// Initialize player profile
const profile = ProfileManager.createProfile('PlayerName', '👤');

// Calculate XP for a game
const xpEarned = XPSystem.calculateGameXP({
  won: true,
  duration: 600,
  unitsKilled: 10,
  goldDelivered: 5,
  bossesDefeated: 1,
  perfectVictory: false,
});

// Purchase upgrade
const cost = UpgradeSystem.getUpgradeCost('health', profile.upgrades.trader.healthLevel);
if (profile.silk >= cost) {
  profile.silk -= cost;
  profile.upgrades.trader.healthLevel++;
  ProfileManager.saveProfile(profile);
}
```

UI Components Example:
```typescript
import ProfileScreen from './components/ProfileScreen';
import UpgradeShop from './components/UpgradeShop';

<ProfileScreen
  profile={profile}
  onBack={() => navigate('/')}
/>

<UpgradeShop
  profile={profile}
  onUpgrade={handleUpgrade}
  onBack={() => navigate('/')}
/>
```
*/
