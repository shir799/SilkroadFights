/**
 * ⚔️ SILKROAD FIGHTS - ANIMATION LIBRARY ⚔️
 *
 * A comprehensive combat animation system using Framer Motion
 * Optimized for 60 FPS performance with smooth, cancelable animations
 */

import { Variants, Transition } from 'framer-motion';

// ============================================================================
// ANIMATION TIMING CONSTANTS
// ============================================================================

export const ANIMATION_DURATIONS = {
  // Character animations
  IDLE_BREATH: 2.5,
  WALK_STEP: 0.4,
  RUN_STEP: 0.25,
  ATTACK_SLASH: 0.3,
  ATTACK_STAB: 0.25,
  ATTACK_SPECIAL: 0.5,
  HIT_REACTION: 0.2,
  DEATH: 1.2,
  VICTORY: 0.8,

  // Effects
  HIT_SPARK: 0.3,
  WEAPON_TRAIL: 0.4,
  SHIELD_BLOCK: 0.25,
  CRITICAL_HIT: 0.5,
  BLOOD_SPLATTER: 0.6,

  // UI
  DAMAGE_NUMBER: 1.5,
  HEALTH_BAR: 0.4,
  COOLDOWN: 0.3,
  STATUS_ICON: 0.5,

  // Environment
  DUST_CLOUD: 0.8,
  SHADOW: 0.3,
  SILK_SPARKLE: 1.0,
  GOLD_SHINE: 1.2,
} as const;

export const ANIMATION_DELAYS = {
  HIT_REACTION_DELAY: 0.1,
  DAMAGE_NUMBER_DELAY: 0.15,
  BLOOD_SPLATTER_DELAY: 0.08,
  VICTORY_DELAY: 0.3,
} as const;

// Easing functions for natural motion
export const EASINGS = {
  SMOOTH: [0.43, 0.13, 0.23, 0.96],
  BOUNCE: [0.68, -0.55, 0.265, 1.55],
  ELASTIC: [0.87, 0, 0.13, 1],
  ATTACK: [0.85, 0, 0.15, 1],
  HIT: [0.95, 0.05, 0.795, 0.035],
} as const;

// ============================================================================
// CHARACTER ANIMATIONS
// ============================================================================

/**
 * Idle breathing animation - subtle movement to show life
 */
export const idleAnimation: Variants = {
  idle: {
    y: [0, -3, 0],
    scale: [1, 1.02, 1],
    transition: {
      duration: ANIMATION_DURATIONS.IDLE_BREATH,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

/**
 * Walk animation - smooth horizontal movement with bob
 */
export const walkAnimation: Variants = {
  walking: {
    x: [0, 50],
    y: [0, -2, 0, -2, 0],
    transition: {
      x: {
        duration: ANIMATION_DURATIONS.WALK_STEP * 2,
        ease: "linear",
      },
      y: {
        duration: ANIMATION_DURATIONS.WALK_STEP,
        repeat: 2,
        ease: "easeInOut",
      },
    },
  },
};

/**
 * Run animation - faster movement with more pronounced bob
 */
export const runAnimation: Variants = {
  running: {
    x: [0, 100],
    y: [0, -4, 0, -4, 0, -4, 0],
    scaleX: [1, 1.05, 1, 1.05, 1],
    transition: {
      x: {
        duration: ANIMATION_DURATIONS.RUN_STEP * 3,
        ease: "linear",
      },
      y: {
        duration: ANIMATION_DURATIONS.RUN_STEP,
        repeat: 3,
        ease: "easeInOut",
      },
      scaleX: {
        duration: ANIMATION_DURATIONS.RUN_STEP,
        repeat: 2,
        ease: "easeInOut",
      },
    },
  },
};

/**
 * Slash attack - wide horizontal swing
 */
export const slashAttackAnimation: Variants = {
  idle: {
    rotate: 0,
    x: 0,
    scale: 1,
  },
  attacking: {
    rotate: [0, -15, 45, 0],
    x: [0, -5, 15, 0],
    scale: [1, 1.1, 1.15, 1],
    transition: {
      duration: ANIMATION_DURATIONS.ATTACK_SLASH,
      ease: EASINGS.ATTACK,
    },
  },
};

/**
 * Stab attack - forward thrust
 */
export const stabAttackAnimation: Variants = {
  idle: {
    x: 0,
    scaleX: 1,
  },
  attacking: {
    x: [0, 25, 0],
    scaleX: [1, 1.2, 1],
    transition: {
      duration: ANIMATION_DURATIONS.ATTACK_STAB,
      ease: EASINGS.ATTACK,
    },
  },
};

/**
 * Special attack - powerful overhead strike
 */
export const specialAttackAnimation: Variants = {
  idle: {
    rotate: 0,
    y: 0,
    scale: 1,
  },
  attacking: {
    rotate: [0, -30, -60, 0],
    y: [0, -20, -10, 0],
    scale: [1, 1.15, 1.25, 1],
    transition: {
      duration: ANIMATION_DURATIONS.ATTACK_SPECIAL,
      ease: EASINGS.ATTACK,
    },
  },
};

/**
 * Hit reaction - shake and flash red
 */
export const hitReactionAnimation: Variants = {
  normal: {
    x: 0,
    filter: "brightness(1) hue-rotate(0deg)",
  },
  hit: {
    x: [-3, 3, -3, 3, 0],
    filter: [
      "brightness(1.5) hue-rotate(0deg)",
      "brightness(1.8) hue-rotate(-30deg)",
      "brightness(1.5) hue-rotate(0deg)",
      "brightness(1) hue-rotate(0deg)",
    ],
    transition: {
      duration: ANIMATION_DURATIONS.HIT_REACTION,
      ease: EASINGS.HIT,
    },
  },
};

/**
 * Death animation - dramatic fall with fade
 */
export const deathAnimation: Variants = {
  alive: {
    rotate: 0,
    y: 0,
    opacity: 1,
    scale: 1,
  },
  dead: {
    rotate: -90,
    y: 20,
    opacity: 0,
    scale: 0.8,
    transition: {
      duration: ANIMATION_DURATIONS.DEATH,
      ease: [0.6, 0.05, 0.01, 0.9],
    },
  },
};

/**
 * Victory pose - triumphant celebration
 */
export const victoryAnimation: Variants = {
  idle: {
    rotate: 0,
    y: 0,
    scale: 1,
  },
  victory: {
    rotate: [0, -10, 10, 0],
    y: [0, -15, -10, 0],
    scale: [1, 1.15, 1.2, 1.1],
    transition: {
      duration: ANIMATION_DURATIONS.VICTORY,
      ease: EASINGS.BOUNCE,
      repeat: 3,
    },
  },
};

// ============================================================================
// COMBAT EFFECTS
// ============================================================================

/**
 * Hit spark particles - explosive impact effect
 */
export const hitSparkAnimation: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: {
    scale: [0, 1.5, 0],
    opacity: [0, 1, 0],
    rotate: [0, 180],
    transition: {
      duration: ANIMATION_DURATIONS.HIT_SPARK,
      ease: "easeOut",
    },
  },
};

/**
 * Weapon trail - motion blur effect
 */
export const weaponTrailAnimation: Variants = {
  idle: {
    pathLength: 0,
    opacity: 0,
  },
  swinging: {
    pathLength: [0, 1],
    opacity: [0, 0.8, 0],
    transition: {
      duration: ANIMATION_DURATIONS.WEAPON_TRAIL,
      ease: EASINGS.ATTACK,
    },
  },
};

/**
 * Shield block - protective flash
 */
export const shieldBlockAnimation: Variants = {
  idle: {
    scale: 1,
    opacity: 0,
  },
  blocking: {
    scale: [1, 1.3, 1],
    opacity: [0, 0.9, 0],
    transition: {
      duration: ANIMATION_DURATIONS.SHIELD_BLOCK,
      ease: "easeOut",
    },
  },
};

/**
 * Critical hit - massive impact with screen shake
 */
export const criticalHitAnimation: Variants = {
  normal: {
    scale: 1,
    rotate: 0,
  },
  critical: {
    scale: [1, 1.5, 1.3],
    rotate: [0, -10, 5, 0],
    transition: {
      duration: ANIMATION_DURATIONS.CRITICAL_HIT,
      ease: EASINGS.BOUNCE,
    },
  },
};

/**
 * Blood splatter - stylized impact particles
 */
export const bloodSplatterAnimation = (angle: number = 45): Variants => ({
  hidden: {
    scale: 0,
    opacity: 0,
    x: 0,
    y: 0,
  },
  visible: {
    scale: [0, 1.2, 0.8],
    opacity: [0, 0.8, 0],
    x: [0, Math.cos(angle * Math.PI / 180) * 30],
    y: [0, Math.sin(angle * Math.PI / 180) * 30],
    transition: {
      duration: ANIMATION_DURATIONS.BLOOD_SPLATTER,
      ease: "easeOut",
    },
  },
});

// ============================================================================
// UI ANIMATIONS
// ============================================================================

/**
 * Damage numbers - float up and fade
 */
export const damageNumberAnimation: Variants = {
  hidden: {
    y: 0,
    opacity: 0,
    scale: 0.5,
  },
  visible: {
    y: -60,
    opacity: [0, 1, 1, 0],
    scale: [0.5, 1.3, 1.2, 1],
    transition: {
      duration: ANIMATION_DURATIONS.DAMAGE_NUMBER,
      ease: "easeOut",
    },
  },
};

/**
 * Critical damage numbers - larger and more dramatic
 */
export const criticalDamageNumberAnimation: Variants = {
  hidden: {
    y: 0,
    opacity: 0,
    scale: 0.5,
    rotate: 0,
  },
  visible: {
    y: -80,
    opacity: [0, 1, 1, 0],
    scale: [0.5, 1.8, 1.6, 1.2],
    rotate: [0, -15, 10, 0],
    transition: {
      duration: ANIMATION_DURATIONS.DAMAGE_NUMBER * 1.2,
      ease: EASINGS.BOUNCE,
    },
  },
};

/**
 * Health bar smooth updates
 */
export const healthBarTransition: Transition = {
  duration: ANIMATION_DURATIONS.HEALTH_BAR,
  ease: "easeOut",
};

/**
 * Ability cooldown - circular progress
 */
export const cooldownAnimation: Variants = {
  ready: {
    pathLength: 1,
    opacity: 0,
  },
  cooling: {
    pathLength: 0,
    opacity: 0.7,
    transition: {
      pathLength: {
        duration: ANIMATION_DURATIONS.COOLDOWN,
        ease: "linear",
      },
    },
  },
};

/**
 * Status effect icons - pulse and glow
 */
export const statusIconAnimation: Variants = {
  inactive: {
    scale: 0,
    opacity: 0,
  },
  active: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: ANIMATION_DURATIONS.STATUS_ICON,
      ease: EASINGS.BOUNCE,
    },
  },
  pulsing: {
    scale: [1, 1.1, 1],
    opacity: [1, 0.8, 1],
    filter: [
      "drop-shadow(0 0 2px rgba(255,255,255,0.5))",
      "drop-shadow(0 0 8px rgba(255,255,255,0.8))",
      "drop-shadow(0 0 2px rgba(255,255,255,0.5))",
    ],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// ENVIRONMENT EFFECTS
// ============================================================================

/**
 * Dust clouds when moving
 */
export const dustCloudAnimation: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    x: 0,
  },
  visible: {
    scale: [0, 1.5, 2],
    opacity: [0, 0.6, 0],
    x: [-10, -20, -30],
    transition: {
      duration: ANIMATION_DURATIONS.DUST_CLOUD,
      ease: "easeOut",
    },
  },
};

/**
 * Shadow effects - dynamic based on position
 */
export const shadowAnimation: Variants = {
  normal: {
    scaleX: 1,
    opacity: 0.3,
  },
  jumping: {
    scaleX: [1, 0.6, 1],
    opacity: [0.3, 0.1, 0.3],
    transition: {
      duration: ANIMATION_DURATIONS.SHADOW,
      ease: "easeInOut",
    },
  },
};

/**
 * Silk collection sparkle - magical gather effect
 */
export const silkSparkleAnimation: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
    rotate: 0,
  },
  collecting: {
    scale: [0, 1.5, 0.5],
    opacity: [0, 1, 0],
    rotate: [0, 360],
    y: [0, -20, -40],
    transition: {
      duration: ANIMATION_DURATIONS.SILK_SPARKLE,
      ease: "easeOut",
    },
  },
};

/**
 * Gold shine effect - treasure glow
 */
export const goldShineAnimation: Variants = {
  idle: {
    scale: 1,
    filter: "brightness(1) drop-shadow(0 0 4px rgba(255,215,0,0.5))",
  },
  shining: {
    scale: [1, 1.15, 1],
    rotate: [0, 5, -5, 0],
    filter: [
      "brightness(1) drop-shadow(0 0 4px rgba(255,215,0,0.5))",
      "brightness(1.5) drop-shadow(0 0 12px rgba(255,215,0,0.9))",
      "brightness(1.3) drop-shadow(0 0 8px rgba(255,215,0,0.7))",
      "brightness(1) drop-shadow(0 0 4px rgba(255,215,0,0.5))",
    ],
    transition: {
      duration: ANIMATION_DURATIONS.GOLD_SHINE,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// ============================================================================
// PARTICLE SYSTEM HELPERS
// ============================================================================

/**
 * Generate random particle animations for effects
 */
export const generateParticleAnimation = (
  count: number,
  spreadRadius: number = 50,
  duration: number = 0.8
) => {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * 360;
    const distance = spreadRadius * (0.5 + Math.random() * 0.5);
    return {
      x: Math.cos(angle * Math.PI / 180) * distance,
      y: Math.sin(angle * Math.PI / 180) * distance,
      opacity: [0, 1, 0],
      scale: [0, 1, 0],
      rotate: Math.random() * 360,
      transition: {
        duration: duration * (0.8 + Math.random() * 0.4),
        ease: "easeOut",
      },
    };
  });
};

// ============================================================================
// SCREEN SHAKE UTILITY
// ============================================================================

/**
 * Screen shake for impactful moments
 */
export const screenShakeAnimation = (intensity: 'light' | 'medium' | 'heavy' = 'medium'): Variants => {
  const intensityMap = {
    light: 3,
    medium: 6,
    heavy: 10,
  };

  const shake = intensityMap[intensity];

  return {
    normal: { x: 0, y: 0 },
    shaking: {
      x: [0, -shake, shake, -shake, shake, 0],
      y: [0, shake, -shake, shake, -shake, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
  };
};

// ============================================================================
// COMBO ANIMATIONS
// ============================================================================

/**
 * Combo counter - grows with each hit
 */
export const comboAnimation: Variants = {
  hidden: {
    scale: 0,
    opacity: 0,
  },
  visible: (combo: number) => ({
    scale: 1 + (combo * 0.1),
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: EASINGS.BOUNCE,
    },
  }),
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Create a stagger animation for multiple elements
 */
export const createStaggerAnimation = (
  staggerDelay: number = 0.1,
  baseAnimation: Variants = {}
) => ({
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  },
  item: baseAnimation,
});

/**
 * Spring configuration presets
 */
export const SPRING_CONFIGS = {
  gentle: { type: "spring" as const, stiffness: 120, damping: 14 },
  bouncy: { type: "spring" as const, stiffness: 300, damping: 10 },
  stiff: { type: "spring" as const, stiffness: 400, damping: 30 },
  slow: { type: "spring" as const, stiffness: 80, damping: 20 },
};

/**
 * Get animation variant based on unit type
 */
export const getUnitAnimationVariant = (unitType: string) => {
  const variants: Record<string, any> = {
    TR: { scale: 1.0, speed: 1.0 },    // Trader - normal
    H: { scale: 1.05, speed: 1.2 },    // Hunter - slightly faster
    TH: { scale: 0.95, speed: 1.3 },   // Thief - faster, smaller
    KT: { scale: 1.1, speed: 0.9 },    // King Thief - larger, slower
  };

  return variants[unitType] || { scale: 1.0, speed: 1.0 };
};

/**
 * Calculate animation duration based on distance
 */
export const calculateMovementDuration = (
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  baseSpeed: number = 1.0
): number => {
  const distance = Math.sqrt(
    Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2)
  );
  return (distance * 0.05) / baseSpeed;
};

/**
 * Performance optimization: Reduce animations on low-end devices
 */
export const shouldUseReducedMotion = () => {
  if (typeof window !== 'undefined') {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return false;
};

/**
 * Get optimized transition based on performance
 */
export const getOptimizedTransition = (transition: Transition): Transition => {
  if (shouldUseReducedMotion()) {
    return { ...transition, duration: 0 };
  }
  return transition;
};
