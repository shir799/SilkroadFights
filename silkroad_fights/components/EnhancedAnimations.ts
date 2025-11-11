/**
 * ENHANCED ANIMATIONS
 *
 * Extended animation system with:
 * - Unit-specific idle animations (Trader rocks, Hunter scans, Thief crouches)
 * - Emotes (Taunt, Cheer, Cry, Angry, Confused, Determined)
 * - Environmental animations (Flags waving, Camels walking, Birds flying)
 * - UI micro-interactions (Button press, Card flip, Panel slide)
 * - Advanced easing curves
 * - GPU-optimized transforms
 * - Staggered animations
 * - Physics-based springs
 */

import { Variants, Transition } from 'framer-motion'

// ============================================================================
// ANIMATION CONSTANTS
// ============================================================================

export const ANIMATION_SPEED = {
  INSTANT: 0.1,
  FAST: 0.3,
  NORMAL: 0.5,
  SLOW: 0.8,
  VERY_SLOW: 1.2,
}

export const EASING = {
  EASE_IN_OUT: [0.42, 0, 0.58, 1],
  EASE_OUT: [0, 0, 0.58, 1],
  EASE_IN: [0.42, 0, 1, 1],
  BOUNCE: [0.68, -0.55, 0.265, 1.55],
  SPRING: { type: 'spring' as const, stiffness: 300, damping: 20 },
  SOFT_SPRING: { type: 'spring' as const, stiffness: 100, damping: 15 },
}

// ============================================================================
// UNIT-SPECIFIC IDLE ANIMATIONS
// ============================================================================

export const traderIdleAnimation: Variants = {
  idle: {
    y: [0, -3, 0],
    rotate: [0, -2, 0, 2, 0],
    transition: {
      y: {
        repeat: Infinity,
        duration: 2,
        ease: 'easeInOut',
      },
      rotate: {
        repeat: Infinity,
        duration: 4,
        ease: 'easeInOut',
      },
    },
  },
}

export const hunterIdleAnimation: Variants = {
  idle: {
    scale: [1, 1.02, 1],
    x: [0, 2, 0, -2, 0],
    transition: {
      scale: {
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      },
      x: {
        repeat: Infinity,
        duration: 5,
        ease: 'easeInOut',
      },
    },
  },
}

export const thiefIdleAnimation: Variants = {
  idle: {
    y: [0, -5, 0],
    scaleY: [1, 0.98, 1],
    transition: {
      y: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      },
      scaleY: {
        repeat: Infinity,
        duration: 1.5,
        ease: 'easeInOut',
      },
    },
  },
}

export const kingThiefIdleAnimation: Variants = {
  idle: {
    y: [0, -4, 0],
    rotate: [0, 5, 0, -5, 0],
    scale: [1, 1.05, 1],
    transition: {
      y: {
        repeat: Infinity,
        duration: 2.5,
        ease: 'easeInOut',
      },
      rotate: {
        repeat: Infinity,
        duration: 6,
        ease: 'easeInOut',
      },
      scale: {
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      },
    },
  },
}

export const bossIdleAnimation: Variants = {
  idle: {
    y: [0, -10, 0],
    scale: [1, 1.08, 1],
    rotate: [0, -3, 0, 3, 0],
    transition: {
      y: {
        repeat: Infinity,
        duration: 3,
        ease: 'easeInOut',
      },
      scale: {
        repeat: Infinity,
        duration: 4,
        ease: 'easeInOut',
      },
      rotate: {
        repeat: Infinity,
        duration: 8,
        ease: 'easeInOut',
      },
    },
  },
}

// ============================================================================
// EMOTE ANIMATIONS
// ============================================================================

export const emoteAnimations = {
  taunt: {
    variants: {
      start: { scale: 1, rotate: 0, y: 0 },
      animate: {
        scale: [1, 1.2, 0.9, 1.1, 1],
        rotate: [0, -10, 10, -5, 0],
        y: [0, -10, 0],
        transition: {
          duration: 1.5,
          times: [0, 0.3, 0.6, 0.8, 1],
        },
      },
    } as Variants,
    icon: '😏',
  },
  cheer: {
    variants: {
      start: { scale: 1, y: 0, rotate: 0 },
      animate: {
        scale: [1, 1.3, 1.2, 1.3, 1],
        y: [0, -15, -10, -15, 0],
        rotate: [0, 15, -15, 0],
        transition: {
          duration: 1.2,
          times: [0, 0.3, 0.5, 0.7, 1],
        },
      },
    } as Variants,
    icon: '🎉',
  },
  cry: {
    variants: {
      start: { scale: 1, y: 0, opacity: 1 },
      animate: {
        scale: [1, 0.9, 0.95, 0.9, 1],
        y: [0, 5, 3, 5, 0],
        opacity: [1, 0.8, 0.9, 0.8, 1],
        transition: {
          duration: 2,
          times: [0, 0.25, 0.5, 0.75, 1],
        },
      },
    } as Variants,
    icon: '😢',
  },
  angry: {
    variants: {
      start: { scale: 1, x: 0, rotate: 0 },
      animate: {
        scale: [1, 1.15, 1.1, 1.15, 1],
        x: [0, -5, 5, -3, 3, 0],
        rotate: [0, -5, 5, -3, 3, 0],
        transition: {
          duration: 1,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        },
      },
    } as Variants,
    icon: '😠',
  },
  confused: {
    variants: {
      start: { scale: 1, rotate: 0 },
      animate: {
        scale: [1, 1.05, 1, 1.05, 1],
        rotate: [0, 15, -15, 15, -15, 0],
        transition: {
          duration: 2,
          times: [0, 0.2, 0.4, 0.6, 0.8, 1],
        },
      },
    } as Variants,
    icon: '❓',
  },
  determined: {
    variants: {
      start: { scale: 1, y: 0 },
      animate: {
        scale: [1, 1.2, 1.1, 1.2, 1],
        y: [0, -8, -5, -8, 0],
        transition: {
          duration: 1.5,
        },
      },
    } as Variants,
    icon: '💪',
  },
  sleeping: {
    variants: {
      start: { scale: 1, rotate: 0, opacity: 1 },
      animate: {
        scale: [1, 0.95, 1],
        rotate: [0, -5, 0],
        opacity: [1, 0.7, 1],
        transition: {
          duration: 3,
          repeat: Infinity,
        },
      },
    } as Variants,
    icon: '💤',
  },
  love: {
    variants: {
      start: { scale: 1, y: 0 },
      animate: {
        scale: [1, 1.15, 1.1, 1.15, 1],
        y: [0, -5, -3, -5, 0],
        transition: {
          duration: 1.5,
        },
      },
    } as Variants,
    icon: '❤️',
  },
}

// ============================================================================
// ENVIRONMENTAL ANIMATIONS
// ============================================================================

export const flagWaveAnimation: Variants = {
  wave: {
    rotate: [0, 5, 0, -5, 0],
    scaleX: [1, 1.05, 1, 0.95, 1],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'easeInOut',
    },
  },
}

export const camelWalkAnimation: Variants = {
  walk: {
    x: ['0%', '100%'],
    y: [0, -5, 0, -5, 0],
    transition: {
      x: {
        duration: 20,
        ease: 'linear',
        repeat: Infinity,
      },
      y: {
        duration: 2,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  },
}

export const birdFlyAnimation: Variants = {
  fly: {
    x: ['100%', '-20%'],
    y: [
      0,
      -20,
      -10,
      -30,
      -15,
      -25,
      0,
    ],
    transition: {
      x: {
        duration: 15,
        ease: 'linear',
        repeat: Infinity,
      },
      y: {
        duration: 3,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    },
  },
}

export const cloudDriftAnimation: Variants = {
  drift: {
    x: ['0%', '120%'],
    transition: {
      duration: 60,
      ease: 'linear',
      repeat: Infinity,
    },
  },
}

export const grassSway: Variants = {
  sway: {
    rotate: [0, 3, 0, -3, 0],
    transition: {
      repeat: Infinity,
      duration: 4,
      ease: 'easeInOut',
    },
  },
}

// ============================================================================
// UI MICRO-INTERACTIONS
// ============================================================================

export const buttonPressAnimation: Variants = {
  idle: {
    scale: 1,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.05,
    boxShadow: '0 6px 8px rgba(0, 0, 0, 0.15)',
    transition: {
      duration: 0.2,
    },
  },
  tap: {
    scale: 0.95,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    transition: {
      duration: 0.1,
    },
  },
}

export const cardFlipAnimation = {
  initial: { rotateY: 0 },
  flipped: { rotateY: 180 },
  transition: {
    duration: 0.6,
    ease: [0.23, 1, 0.32, 1],
  },
}

export const panelSlideAnimation: Variants = {
  hidden: {
    x: '100%',
    opacity: 0,
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    x: '100%',
    opacity: 0,
    transition: {
      duration: 0.3,
    },
  },
}

export const modalAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.8,
    y: 50,
    transition: {
      duration: 0.2,
    },
  },
}

export const tooltipAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 10,
    scale: 0.9,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
    },
  },
}

export const fadeInAnimation: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
}

export const scaleInAnimation: Variants = {
  hidden: {
    opacity: 0,
    scale: 0,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 500,
      damping: 30,
    },
  },
}

export const slideUpAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
    },
  },
}

export const notificationAnimation: Variants = {
  hidden: {
    opacity: 0,
    y: -50,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: {
      duration: 0.3,
    },
  },
}

// ============================================================================
// STAGGERED ANIMATIONS
// ============================================================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export const staggerItem: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
    },
  },
}

// ============================================================================
// COMBAT ANIMATIONS (Enhanced)
// ============================================================================

export const enhancedAttackAnimation: Variants = {
  idle: {
    scale: 1,
    x: 0,
    rotate: 0,
  },
  windup: {
    scale: 0.9,
    x: -10,
    rotate: -15,
    transition: {
      duration: 0.2,
    },
  },
  strike: {
    scale: 1.2,
    x: 20,
    rotate: 15,
    transition: {
      duration: 0.15,
      ease: 'easeOut',
    },
  },
  recover: {
    scale: 1,
    x: 0,
    rotate: 0,
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    },
  },
}

export const enhancedBlockAnimation: Variants = {
  idle: { scale: 1, opacity: 0 },
  blocking: {
    scale: [1, 1.2, 1],
    opacity: [0, 0.8, 0],
    transition: {
      duration: 0.5,
    },
  },
}

export const enhancedDodgeAnimation: Variants = {
  idle: { x: 0, y: 0, opacity: 1 },
  dodge: {
    x: [0, -30, -20, 0],
    y: [0, -10, -5, 0],
    opacity: [1, 0.5, 0.7, 1],
    transition: {
      duration: 0.5,
      times: [0, 0.3, 0.6, 1],
    },
  },
}

export const criticalHitFlash: Variants = {
  idle: { scale: 1, filter: 'brightness(1)' },
  critical: {
    scale: [1, 1.3, 1.2, 1.3, 1],
    filter: [
      'brightness(1)',
      'brightness(2) saturate(2)',
      'brightness(1.5) saturate(1.5)',
      'brightness(2) saturate(2)',
      'brightness(1)',
    ],
    transition: {
      duration: 0.6,
      times: [0, 0.2, 0.4, 0.6, 1],
    },
  },
}

// ============================================================================
// SPECIAL EFFECT ANIMATIONS
// ============================================================================

export const teleportAnimation: Variants = {
  start: {
    opacity: 1,
    scale: 1,
  },
  disappear: {
    opacity: 0,
    scale: 0,
    rotate: 360,
    transition: {
      duration: 0.4,
    },
  },
  appear: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    transition: {
      duration: 0.4,
      delay: 0.2,
    },
  },
}

export const shieldActivation: Variants = {
  inactive: {
    scale: 0,
    opacity: 0,
  },
  active: {
    scale: [0, 1.2, 1],
    opacity: [0, 0.8, 0.6],
    transition: {
      duration: 0.5,
      times: [0, 0.5, 1],
    },
  },
  sustained: {
    scale: [1, 1.05, 1],
    opacity: [0.6, 0.7, 0.6],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
}

export const buffAuraAnimation: Variants = {
  inactive: {
    scale: 0,
    opacity: 0,
  },
  active: {
    scale: [0.8, 1.2, 1],
    opacity: [0, 0.6, 0.4],
    rotate: [0, 180, 360],
    transition: {
      duration: 1,
      repeat: Infinity,
    },
  },
}

export const debuffCloudAnimation: Variants = {
  inactive: {
    scale: 0,
    opacity: 0,
    y: 0,
  },
  active: {
    scale: [0.8, 1.1, 1],
    opacity: [0, 0.5, 0.3],
    y: [0, -10, 0],
    transition: {
      duration: 2,
      repeat: Infinity,
    },
  },
}

// ============================================================================
// LOADING ANIMATIONS
// ============================================================================

export const spinnerAnimation: Variants = {
  rotate: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const pulseAnimation: Variants = {
  pulse: {
    scale: [1, 1.1, 1],
    opacity: [0.6, 1, 0.6],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
}

export const bounceAnimation: Variants = {
  bounce: {
    y: [0, -15, 0],
    transition: {
      duration: 0.6,
      repeat: Infinity,
      ease: 'easeOut',
    },
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export const getUnitIdleAnimation = (unitType: string): Variants => {
  switch (unitType) {
    case 'TR':
      return traderIdleAnimation
    case 'H':
      return hunterIdleAnimation
    case 'TH':
      return thiefIdleAnimation
    case 'KT':
      return kingThiefIdleAnimation
    case 'BM':
    case 'BOSS':
      return bossIdleAnimation
    default:
      return traderIdleAnimation
  }
}

export const staggerAnimation = (index: number, baseDelay: number = 0.05): Transition => {
  return {
    delay: index * baseDelay,
    type: 'spring',
    stiffness: 300,
    damping: 25,
  }
}

export const createWaveAnimation = (
  amplitude: number,
  frequency: number,
  duration: number
): Variants => {
  return {
    wave: {
      y: [0, -amplitude, 0, amplitude, 0],
      transition: {
        duration,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  ANIMATION_SPEED,
  EASING,
  traderIdleAnimation,
  hunterIdleAnimation,
  thiefIdleAnimation,
  kingThiefIdleAnimation,
  bossIdleAnimation,
  emoteAnimations,
  flagWaveAnimation,
  camelWalkAnimation,
  birdFlyAnimation,
  cloudDriftAnimation,
  grassSway,
  buttonPressAnimation,
  cardFlipAnimation,
  panelSlideAnimation,
  modalAnimation,
  tooltipAnimation,
  fadeInAnimation,
  scaleInAnimation,
  slideUpAnimation,
  notificationAnimation,
  staggerContainer,
  staggerItem,
  enhancedAttackAnimation,
  enhancedBlockAnimation,
  enhancedDodgeAnimation,
  criticalHitFlash,
  teleportAnimation,
  shieldActivation,
  buffAuraAnimation,
  debuffCloudAnimation,
  spinnerAnimation,
  pulseAnimation,
  bounceAnimation,
  getUnitIdleAnimation,
  staggerAnimation,
  createWaveAnimation,
}
