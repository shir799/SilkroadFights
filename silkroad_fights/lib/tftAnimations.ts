/**
 * TFT-Style Animation Variants for Framer Motion
 * Professional game animations with 60 FPS performance
 */

import { Variants } from 'framer-motion'

// ============================================================================
// ENTRANCE ANIMATIONS
// ============================================================================

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
}

export const slideInFromTop: Variants = {
  initial: { y: -100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { y: -100, opacity: 0 }
}

export const slideInFromBottom: Variants = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { y: 100, opacity: 0 }
}

export const slideInFromLeft: Variants = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { x: -100, opacity: 0 }
}

export const slideInFromRight: Variants = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { x: 100, opacity: 0 }
}

export const scaleIn: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: { scale: 1, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit: { scale: 0, opacity: 0 }
}

export const rotateScaleIn: Variants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: { scale: 1, rotate: 0, opacity: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  exit: { scale: 0, rotate: 180, opacity: 0 }
}

// ============================================================================
// HOVER ANIMATIONS
// ============================================================================

export const hoverScale: Variants = {
  rest: { scale: 1 },
  hover: { scale: 1.05, transition: { duration: 0.2 } }
}

export const hoverLift: Variants = {
  rest: { y: 0 },
  hover: { y: -5, transition: { duration: 0.2 } }
}

export const hoverGlow: Variants = {
  rest: { boxShadow: '0 4px 15px rgba(0,0,0,0.3)' },
  hover: { boxShadow: '0 8px 30px rgba(255, 215, 0, 0.5)', transition: { duration: 0.3 } }
}

export const hoverRotate: Variants = {
  rest: { rotate: 0 },
  hover: { rotate: 5, transition: { duration: 0.2 } }
}

// ============================================================================
// CLICK ANIMATIONS
// ============================================================================

export const tapScale: Variants = {
  tap: { scale: 0.95, transition: { duration: 0.1 } }
}

export const tapShrink: Variants = {
  tap: { scale: 0.9, transition: { duration: 0.1 } }
}

// ============================================================================
// LOOP ANIMATIONS
// ============================================================================

export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
}

export const glow: Variants = {
  animate: {
    opacity: [0.5, 1, 0.5],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
}

export const float: Variants = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
  }
}

export const rotate360: Variants = {
  animate: {
    rotate: [0, 360],
    transition: { duration: 2, repeat: Infinity, ease: 'linear' }
  }
}

export const shimmer: Variants = {
  animate: {
    backgroundPosition: ['0% 0%', '100% 0%'],
    transition: { duration: 2, repeat: Infinity, ease: 'linear' }
  }
}

// ============================================================================
// COMBAT ANIMATIONS
// ============================================================================

export const attackSlash: Variants = {
  initial: { x: 0, rotate: 0 },
  animate: {
    x: [0, 30, 0],
    rotate: [0, 15, 0],
    transition: { duration: 0.5, ease: 'easeInOut' }
  }
}

export const takeDamage: Variants = {
  animate: {
    x: [-5, 5, -5, 5, 0],
    transition: { duration: 0.5 }
  }
}

export const death: Variants = {
  animate: {
    scale: [1, 1.2, 0],
    opacity: [1, 0.5, 0],
    rotate: [0, 180],
    transition: { duration: 0.8, ease: 'easeOut' }
  }
}

export const healEffect: Variants = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: [0, 1.5, 0],
    opacity: [0, 1, 0],
    transition: { duration: 1 }
  }
}

export const criticalHit: Variants = {
  animate: {
    scale: [1, 1.3, 1],
    rotate: [0, 10, -10, 0],
    transition: { duration: 0.3 }
  }
}

// ============================================================================
// UI ELEMENT ANIMATIONS
// ============================================================================

export const numberCountUp: Variants = {
  initial: { scale: 1.5, color: '#FFD700' },
  animate: { scale: 1, color: '#FFFFFF', transition: { duration: 0.3 } }
}

export const cardFlip: Variants = {
  initial: { rotateY: 90, opacity: 0 },
  animate: { rotateY: 0, opacity: 1, transition: { duration: 0.5 } },
  exit: { rotateY: -90, opacity: 0, transition: { duration: 0.5 } }
}

export const notification: Variants = {
  initial: { y: -100, opacity: 0, scale: 0.8 },
  animate: {
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 20 }
  },
  exit: {
    y: -100,
    opacity: 0,
    scale: 0.8,
    transition: { duration: 0.3 }
  }
}

export const modalOverlay: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.3 } }
}

export const modalContent: Variants = {
  initial: { scale: 0.8, opacity: 0, y: 50 },
  animate: {
    scale: 1,
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 300, damping: 25 }
  },
  exit: {
    scale: 0.8,
    opacity: 0,
    y: 50,
    transition: { duration: 0.2 }
  }
}

// ============================================================================
// PROGRESS BAR ANIMATIONS
// ============================================================================

export const progressFill: Variants = {
  initial: { width: '0%' },
  animate: (width: number) => ({
    width: `${width}%`,
    transition: { duration: 0.5, ease: 'easeOut' }
  })
}

export const healthBarDecrease: Variants = {
  animate: (width: number) => ({
    width: `${width}%`,
    transition: { duration: 0.3, ease: 'easeInOut' }
  })
}

// ============================================================================
// PHASE TRANSITION ANIMATIONS
// ============================================================================

export const phaseTransition: Variants = {
  initial: { scale: 0, rotate: -180, opacity: 0 },
  animate: {
    scale: 1,
    rotate: 0,
    opacity: 1,
    transition: { duration: 0.5, ease: 'easeOut' }
  },
  exit: {
    scale: 0,
    rotate: 180,
    opacity: 0,
    transition: { duration: 0.5, ease: 'easeIn' }
  }
}

export const phaseIcon: Variants = {
  animate: {
    scale: [1, 1.2, 1],
    rotate: [0, 5, -5, 0],
    transition: { duration: 1, repeat: 1 }
  }
}

// ============================================================================
// STAGGER ANIMATIONS
// ============================================================================

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}

// ============================================================================
// SPECIAL EFFECTS
// ============================================================================

export const sparkle: Variants = {
  initial: { scale: 0, rotate: 0 },
  animate: {
    scale: [0, 1, 0],
    rotate: [0, 180, 360],
    transition: { duration: 1, ease: 'easeOut' }
  }
}

export const explosion: Variants = {
  animate: {
    scale: [0, 2, 0],
    opacity: [0, 1, 0],
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

export const ripple: Variants = {
  animate: {
    scale: [1, 1.5, 2],
    opacity: [0.5, 0.3, 0],
    transition: { duration: 1, ease: 'easeOut', repeat: Infinity }
  }
}

// ============================================================================
// LAYOUT ANIMATIONS
// ============================================================================

export const layoutSlide: Variants = {
  layout: { duration: 0.3, ease: 'easeInOut' }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

// Create a staggered list animation
export const createStaggerAnimation = (staggerDelay = 0.1, childAnimation = staggerItem) => ({
  container: {
    animate: {
      transition: {
        staggerChildren: staggerDelay
      }
    }
  },
  item: childAnimation
})

// Create a custom delay animation
export const withDelay = (animation: Variants, delay: number): Variants => {
  return {
    ...animation,
    animate: {
      ...animation.animate,
      transition: {
        ...(animation.animate as any).transition,
        delay
      }
    }
  }
}

// Combine multiple animations
export const combineAnimations = (...animations: Variants[]): Variants => {
  return animations.reduce((combined, current) => ({
    ...combined,
    ...current,
    animate: {
      ...(combined.animate || {}),
      ...(current.animate || {})
    }
  }), {})
}

export default {
  fadeIn,
  slideInFromTop,
  slideInFromBottom,
  slideInFromLeft,
  slideInFromRight,
  scaleIn,
  rotateScaleIn,
  hoverScale,
  hoverLift,
  hoverGlow,
  hoverRotate,
  tapScale,
  tapShrink,
  pulse,
  glow,
  float,
  rotate360,
  shimmer,
  attackSlash,
  takeDamage,
  death,
  healEffect,
  criticalHit,
  numberCountUp,
  cardFlip,
  notification,
  modalOverlay,
  modalContent,
  progressFill,
  healthBarDecrease,
  phaseTransition,
  phaseIcon,
  staggerContainer,
  staggerItem,
  sparkle,
  explosion,
  ripple,
  layoutSlide
}
