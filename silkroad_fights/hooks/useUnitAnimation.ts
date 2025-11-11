/**
 * ⚔️ USE UNIT ANIMATION HOOK ⚔️
 *
 * Custom React hook for managing unit animations
 * Simplifies animation state management and provides helper functions
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AnimationState } from '../components/AnimatedUnit';
import { ANIMATION_DURATIONS } from '../lib/animations';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface AnimationQueueItem {
  state: AnimationState;
  duration: number;
  delay?: number;
}

interface UseUnitAnimationReturn {
  // Current animation state
  animationState: AnimationState;

  // Animation control functions
  playAnimation: (state: AnimationState, duration?: number) => Promise<void>;
  queueAnimation: (state: AnimationState, duration?: number, delay?: number) => void;
  clearQueue: () => void;
  stopAnimation: () => void;
  resetToIdle: () => void;

  // State checks
  isAnimating: boolean;
  canInterrupt: boolean;

  // Animation history
  lastAnimation: AnimationState | null;
  animationCount: number;
}

// ============================================================================
// HOOK
// ============================================================================

/**
 * Custom hook for managing unit animations
 *
 * @param initialState - Starting animation state (default: 'idle')
 * @param autoReturnToIdle - Automatically return to idle after animations (default: true)
 *
 * @example
 * ```tsx
 * const { animationState, playAnimation, queueAnimation } = useUnitAnimation();
 *
 * // Play a single animation
 * await playAnimation('attacking-slash');
 *
 * // Queue multiple animations
 * queueAnimation('attacking-slash');
 * queueAnimation('victory', 800, 200); // After 200ms delay
 * ```
 */
export const useUnitAnimation = (
  initialState: AnimationState = 'idle',
  autoReturnToIdle: boolean = true
): UseUnitAnimationReturn => {
  // ============================================================================
  // STATE
  // ============================================================================

  const [animationState, setAnimationState] = useState<AnimationState>(initialState);
  const [isAnimating, setIsAnimating] = useState(false);
  const [lastAnimation, setLastAnimation] = useState<AnimationState | null>(null);
  const [animationCount, setAnimationCount] = useState(0);

  // Refs for managing timeouts and queue
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const queueRef = useRef<AnimationQueueItem[]>([]);
  const isProcessingQueue = useRef(false);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      queueRef.current = [];
    };
  }, []);

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Get the default duration for an animation state
   */
  const getAnimationDuration = (state: AnimationState): number => {
    const durationMap: Record<AnimationState, number> = {
      'idle': ANIMATION_DURATIONS.IDLE_BREATH,
      'walking': ANIMATION_DURATIONS.WALK_STEP * 2,
      'running': ANIMATION_DURATIONS.RUN_STEP * 3,
      'attacking-slash': ANIMATION_DURATIONS.ATTACK_SLASH,
      'attacking-stab': ANIMATION_DURATIONS.ATTACK_STAB,
      'attacking-special': ANIMATION_DURATIONS.ATTACK_SPECIAL,
      'hit': ANIMATION_DURATIONS.HIT_REACTION,
      'blocking': ANIMATION_DURATIONS.SHIELD_BLOCK,
      'dying': ANIMATION_DURATIONS.DEATH,
      'dead': 0, // Permanent state
      'victory': ANIMATION_DURATIONS.VICTORY * 3, // Plays 3 times
    };

    return (durationMap[state] || 0.5) * 1000; // Convert to milliseconds
  };

  /**
   * Check if an animation can be interrupted
   */
  const canInterruptAnimation = (state: AnimationState): boolean => {
    const nonInterruptible: AnimationState[] = [
      'attacking-slash',
      'attacking-stab',
      'attacking-special',
      'hit',
      'dying',
    ];

    return !nonInterruptible.includes(state);
  };

  // ============================================================================
  // ANIMATION CONTROL
  // ============================================================================

  /**
   * Play an animation immediately
   */
  const playAnimation = useCallback(
    async (state: AnimationState, duration?: number): Promise<void> => {
      // Clear existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      // Don't interrupt non-interruptible animations unless forced
      if (isAnimating && !canInterruptAnimation(animationState)) {
        console.warn(`Cannot interrupt ${animationState} animation`);
        return;
      }

      // Set animation state
      setLastAnimation(animationState);
      setAnimationState(state);
      setIsAnimating(true);
      setAnimationCount((prev) => prev + 1);

      // Calculate duration
      const animDuration = duration ?? getAnimationDuration(state);

      // Return to idle after animation (if not 'dead' or 'idle')
      if (state !== 'dead' && state !== 'idle' && autoReturnToIdle) {
        return new Promise<void>((resolve) => {
          timeoutRef.current = setTimeout(() => {
            setAnimationState('idle');
            setIsAnimating(false);
            resolve();
          }, animDuration);
        });
      } else {
        setIsAnimating(false);
        return Promise.resolve();
      }
    },
    [animationState, isAnimating, autoReturnToIdle]
  );

  /**
   * Add an animation to the queue
   */
  const queueAnimation = useCallback(
    (state: AnimationState, duration?: number, delay: number = 0) => {
      queueRef.current.push({
        state,
        duration: duration ?? getAnimationDuration(state),
        delay,
      });

      // Start processing queue if not already processing
      if (!isProcessingQueue.current) {
        processQueue();
      }
    },
    []
  );

  /**
   * Process the animation queue
   */
  const processQueue = useCallback(async () => {
    if (queueRef.current.length === 0) {
      isProcessingQueue.current = false;
      return;
    }

    isProcessingQueue.current = true;
    const item = queueRef.current.shift()!;

    // Apply delay if specified
    if (item.delay && item.delay > 0) {
      await new Promise<void>((resolve) => {
        setTimeout(() => resolve(), item.delay);
      });
    }

    // Play animation
    await playAnimation(item.state, item.duration);

    // Process next item
    processQueue();
  }, [playAnimation]);

  /**
   * Clear the animation queue
   */
  const clearQueue = useCallback(() => {
    queueRef.current = [];
    isProcessingQueue.current = false;
  }, []);

  /**
   * Stop current animation and clear queue
   */
  const stopAnimation = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    clearQueue();
    setAnimationState('idle');
    setIsAnimating(false);
  }, [clearQueue]);

  /**
   * Reset to idle state
   */
  const resetToIdle = useCallback(() => {
    stopAnimation();
    setAnimationState('idle');
    setLastAnimation(null);
    setAnimationCount(0);
  }, [stopAnimation]);

  // ============================================================================
  // RETURN
  // ============================================================================

  return {
    animationState,
    playAnimation,
    queueAnimation,
    clearQueue,
    stopAnimation,
    resetToIdle,
    isAnimating,
    canInterrupt: canInterruptAnimation(animationState),
    lastAnimation,
    animationCount,
  };
};

// ============================================================================
// ADVANCED HOOK - UNIT COMBAT ANIMATION
// ============================================================================

interface UseCombatAnimationOptions {
  attackDelay?: number;
  hitDelay?: number;
  returnToIdleDelay?: number;
}

interface UseCombatAnimationReturn {
  attackerState: AnimationState;
  defenderState: AnimationState;
  playCombatSequence: (
    attackType: 'slash' | 'stab' | 'special',
    defenderDies?: boolean,
    isCritical?: boolean
  ) => Promise<void>;
  resetCombat: () => void;
}

/**
 * Hook for managing combat animation sequences between two units
 *
 * @example
 * ```tsx
 * const { attackerState, defenderState, playCombatSequence } =
 *   useCombatAnimation();
 *
 * // Play attack sequence
 * await playCombatSequence('slash', false, false);
 * ```
 */
export const useCombatAnimation = (
  options: UseCombatAnimationOptions = {}
): UseCombatAnimationReturn => {
  const {
    attackDelay = 0,
    hitDelay = 150,
    returnToIdleDelay = 400,
  } = options;

  const attacker = useUnitAnimation('idle', false);
  const defender = useUnitAnimation('idle', false);

  /**
   * Play a complete combat animation sequence
   */
  const playCombatSequence = useCallback(
    async (
      attackType: 'slash' | 'stab' | 'special' = 'slash',
      defenderDies: boolean = false,
      isCritical: boolean = false
    ): Promise<void> => {
      const attackStateMap = {
        slash: 'attacking-slash' as AnimationState,
        stab: 'attacking-stab' as AnimationState,
        special: 'attacking-special' as AnimationState,
      };

      // 1. Attacker attacks
      if (attackDelay > 0) {
        await new Promise<void>((resolve) => setTimeout(resolve, attackDelay));
      }
      await attacker.playAnimation(attackStateMap[attackType]);

      // 2. Defender gets hit
      await new Promise<void>((resolve) => setTimeout(resolve, hitDelay));
      await defender.playAnimation('hit');

      // 3. Check for death or return to idle
      await new Promise<void>((resolve) => setTimeout(resolve, returnToIdleDelay));

      if (defenderDies) {
        await defender.playAnimation('dying');
        await defender.playAnimation('dead');
      } else {
        defender.resetToIdle();
      }

      // 4. Attacker returns to idle
      attacker.resetToIdle();
    },
    [attacker, defender, attackDelay, hitDelay, returnToIdleDelay]
  );

  /**
   * Reset both units to idle
   */
  const resetCombat = useCallback(() => {
    attacker.resetToIdle();
    defender.resetToIdle();
  }, [attacker, defender]);

  return {
    attackerState: attacker.animationState,
    defenderState: defender.animationState,
    playCombatSequence,
    resetCombat,
  };
};

// ============================================================================
// UTILITY HOOK - ANIMATION SEQUENCE BUILDER
// ============================================================================

type SequenceStep = {
  unitId: string;
  animation: AnimationState;
  duration?: number;
  delay?: number;
};

/**
 * Hook for building complex animation sequences
 *
 * @example
 * ```tsx
 * const { playSequence } = useAnimationSequence();
 *
 * await playSequence([
 *   { unitId: 'unit1', animation: 'attacking-slash' },
 *   { unitId: 'unit2', animation: 'hit', delay: 150 },
 *   { unitId: 'unit1', animation: 'victory', delay: 300 },
 * ]);
 * ```
 */
export const useAnimationSequence = () => {
  const [isPlaying, setIsPlaying] = useState(false);

  const playSequence = useCallback(
    async (
      steps: SequenceStep[],
      unitAnimationMap: Map<string, ReturnType<typeof useUnitAnimation>>
    ): Promise<void> => {
      if (isPlaying) {
        console.warn('Sequence already playing');
        return;
      }

      setIsPlaying(true);

      for (const step of steps) {
        const unitAnimation = unitAnimationMap.get(step.unitId);

        if (!unitAnimation) {
          console.warn(`Unit ${step.unitId} not found in animation map`);
          continue;
        }

        // Apply delay
        if (step.delay && step.delay > 0) {
          await new Promise<void>((resolve) => {
            setTimeout(resolve, step.delay);
          });
        }

        // Play animation
        await unitAnimation.playAnimation(step.animation, step.duration);
      }

      setIsPlaying(false);
    },
    [isPlaying]
  );

  return {
    playSequence,
    isPlaying,
  };
};

export default useUnitAnimation;
