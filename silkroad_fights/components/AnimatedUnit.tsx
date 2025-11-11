/**
 * ⚔️ ANIMATED UNIT COMPONENT ⚔️
 *
 * A comprehensive animated unit wrapper that brings game characters to life
 * Handles all combat animations, effects, and state transitions
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { Unit } from '../lib/types';
import {
  idleAnimation,
  walkAnimation,
  runAnimation,
  slashAttackAnimation,
  stabAttackAnimation,
  specialAttackAnimation,
  hitReactionAnimation,
  deathAnimation,
  victoryAnimation,
  hitSparkAnimation,
  weaponTrailAnimation,
  criticalHitAnimation,
  damageNumberAnimation,
  criticalDamageNumberAnimation,
  dustCloudAnimation,
  silkSparkleAnimation,
  goldShineAnimation,
  statusIconAnimation,
  getUnitAnimationVariant,
  calculateMovementDuration,
  ANIMATION_DELAYS,
  ANIMATION_DURATIONS,
} from '../lib/animations';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type AnimationState =
  | 'idle'
  | 'walking'
  | 'running'
  | 'attacking-slash'
  | 'attacking-stab'
  | 'attacking-special'
  | 'hit'
  | 'blocking'
  | 'dying'
  | 'dead'
  | 'victory';

export type EffectType =
  | 'hit-spark'
  | 'critical-hit'
  | 'dust-cloud'
  | 'silk-collect'
  | 'gold-shine';

interface AnimatedUnitProps {
  unit: Unit;
  imageUrl: string;
  animationState?: AnimationState;
  showEffects?: boolean;
  isSelected?: boolean;
  damageAmount?: number;
  isCritical?: boolean;
  showDustTrail?: boolean;
  collectingSilk?: boolean;
  nearGold?: boolean;
  className?: string;
  onAnimationComplete?: (state: AnimationState) => void;
}

interface DamagePopup {
  id: string;
  amount: number;
  isCritical: boolean;
  x: number;
  y: number;
}

interface EffectParticle {
  id: string;
  type: EffectType;
  x: number;
  y: number;
}

// ============================================================================
// ANIMATED UNIT COMPONENT
// ============================================================================

export const AnimatedUnit: React.FC<AnimatedUnitProps> = ({
  unit,
  imageUrl,
  animationState = 'idle',
  showEffects = true,
  isSelected = false,
  damageAmount,
  isCritical = false,
  showDustTrail = false,
  collectingSilk = false,
  nearGold = false,
  className = '',
  onAnimationComplete,
}) => {
  // Animation controls
  const controls = useAnimation();
  const [currentState, setCurrentState] = useState<AnimationState>('idle');

  // Effect state
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const [effects, setEffects] = useState<EffectParticle[]>([]);
  const [showHitFlash, setShowHitFlash] = useState(false);

  // Refs
  const lastHpRef = useRef(unit.hp);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get unit-specific animation settings
  const unitVariant = getUnitAnimationVariant(unit.type);

  // ============================================================================
  // ANIMATION STATE MANAGEMENT
  // ============================================================================

  useEffect(() => {
    if (animationState !== currentState) {
      setCurrentState(animationState);
      handleAnimationState(animationState);
    }
  }, [animationState]);

  // ============================================================================
  // DAMAGE DETECTION
  // ============================================================================

  useEffect(() => {
    if (unit.hp < lastHpRef.current) {
      const damage = lastHpRef.current - unit.hp;
      handleDamage(damage, isCritical);
    }
    lastHpRef.current = unit.hp;
  }, [unit.hp]);

  // ============================================================================
  // ANIMATION HANDLERS
  // ============================================================================

  const handleAnimationState = async (state: AnimationState) => {
    // Clear any existing animation timeout
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }

    switch (state) {
      case 'attacking-slash':
      case 'attacking-stab':
      case 'attacking-special':
        await playAttackAnimation(state);
        break;
      case 'hit':
        await playHitAnimation();
        break;
      case 'dying':
        await playDeathAnimation();
        break;
      case 'victory':
        await playVictoryAnimation();
        break;
      default:
        controls.start(state);
    }
  };

  const playAttackAnimation = async (attackType: AnimationState) => {
    // Show weapon trail effect
    if (showEffects) {
      addEffect('hit-spark', 20, 0);
    }

    await controls.start('attacking');

    // Return to idle after attack
    animationTimeoutRef.current = setTimeout(() => {
      setCurrentState('idle');
      controls.start('idle');
      onAnimationComplete?.('idle');
    }, ANIMATION_DURATIONS.ATTACK_SLASH * 1000);
  };

  const playHitAnimation = async () => {
    setShowHitFlash(true);

    if (showEffects) {
      addEffect('hit-spark', 0, 0);
    }

    await controls.start('hit');

    setTimeout(() => {
      setShowHitFlash(false);
      setCurrentState('idle');
      controls.start('idle');
      onAnimationComplete?.('idle');
    }, ANIMATION_DURATIONS.HIT_REACTION * 1000);
  };

  const playDeathAnimation = async () => {
    await controls.start('dead');
    onAnimationComplete?.('dead');
  };

  const playVictoryAnimation = async () => {
    await controls.start('victory');

    setTimeout(() => {
      setCurrentState('idle');
      controls.start('idle');
    }, ANIMATION_DURATIONS.VICTORY * 3000); // Play 3 times
  };

  // ============================================================================
  // DAMAGE HANDLING
  // ============================================================================

  const handleDamage = (damage: number, critical: boolean) => {
    const newPopup: DamagePopup = {
      id: `damage-${Date.now()}-${Math.random()}`,
      amount: damage,
      isCritical: critical,
      x: Math.random() * 20 - 10,
      y: 0,
    };

    setDamagePopups((prev) => [...prev, newPopup]);

    // Trigger hit animation
    setCurrentState('hit');
    handleAnimationState('hit');

    // Add hit effect
    if (showEffects) {
      if (critical) {
        addEffect('critical-hit', 0, 0);
      } else {
        addEffect('hit-spark', 0, 0);
      }
    }

    // Remove popup after animation
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== newPopup.id));
    }, ANIMATION_DURATIONS.DAMAGE_NUMBER * 1000);
  };

  // ============================================================================
  // EFFECT MANAGEMENT
  // ============================================================================

  const addEffect = (type: EffectType, x: number, y: number) => {
    const newEffect: EffectParticle = {
      id: `effect-${Date.now()}-${Math.random()}`,
      type,
      x,
      y,
    };

    setEffects((prev) => [...prev, newEffect]);

    // Remove effect after animation
    const duration = type === 'critical-hit' ? 500 : 300;
    setTimeout(() => {
      setEffects((prev) => prev.filter((e) => e.id !== newEffect.id));
    }, duration);
  };

  // ============================================================================
  // ANIMATION VARIANTS
  // ============================================================================

  const getAnimationVariant = () => {
    switch (currentState) {
      case 'attacking-slash':
        return slashAttackAnimation;
      case 'attacking-stab':
        return stabAttackAnimation;
      case 'attacking-special':
        return specialAttackAnimation;
      case 'hit':
        return hitReactionAnimation;
      case 'dying':
      case 'dead':
        return deathAnimation;
      case 'victory':
        return victoryAnimation;
      case 'walking':
        return walkAnimation;
      case 'running':
        return runAnimation;
      default:
        return idleAnimation;
    }
  };

  // ============================================================================
  // STATUS EFFECT ICONS
  // ============================================================================

  const renderStatusEffects = () => {
    if (!unit.buffs && !unit.debuffs) return null;

    const allEffects = [
      ...(unit.buffs || []).map(b => ({ ...b, isPositive: true })),
      ...(unit.debuffs || []).map(d => ({ ...d, isPositive: false })),
    ];

    return (
      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 flex gap-1">
        <AnimatePresence>
          {allEffects.map((effect, index) => (
            <motion.div
              key={`${effect.type}-${index}`}
              className={`text-xs px-1 rounded ${
                effect.isPositive ? 'bg-green-500' : 'bg-red-500'
              }`}
              variants={statusIconAnimation}
              initial="inactive"
              animate="pulsing"
              exit="inactive"
            >
              {effect.type}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    );
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className={`relative ${className}`}>
      {/* Main Unit */}
      <motion.div
        className="relative"
        variants={getAnimationVariant()}
        initial={currentState === 'dead' ? 'dead' : 'idle'}
        animate={controls}
        style={{
          scale: unitVariant.scale,
        }}
      >
        {/* Selected Glow */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-full bg-yellow-400 opacity-30 blur-sm"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        )}

        {/* Hit Flash */}
        {showHitFlash && (
          <motion.div
            className="absolute inset-0 bg-red-500 rounded mix-blend-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.7, 0] }}
            transition={{ duration: ANIMATION_DURATIONS.HIT_REACTION }}
          />
        )}

        {/* Unit Image */}
        <motion.img
          src={imageUrl}
          alt={unit.type}
          className="w-full h-full object-contain"
          style={{
            filter: showHitFlash ? 'brightness(1.5)' : 'brightness(1)',
          }}
        />

        {/* Shadow */}
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-12 h-2 bg-black rounded-full opacity-30 blur-sm"
          animate={{
            scaleX: currentState === 'dying' ? [1, 0.6] : 1,
            opacity: currentState === 'dying' ? [0.3, 0.1] : 0.3,
          }}
        />
      </motion.div>

      {/* Status Effects */}
      {renderStatusEffects()}

      {/* Damage Numbers */}
      <AnimatePresence>
        {damagePopups.map((popup) => (
          <motion.div
            key={popup.id}
            className={`absolute top-0 left-1/2 transform -translate-x-1/2 font-bold pointer-events-none z-50 ${
              popup.isCritical
                ? 'text-3xl text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]'
                : 'text-2xl text-red-500 drop-shadow-[0_0_4px_rgba(255,0,0,0.6)]'
            }`}
            style={{ x: popup.x }}
            variants={
              popup.isCritical
                ? criticalDamageNumberAnimation
                : damageNumberAnimation
            }
            initial="hidden"
            animate="visible"
            exit="hidden"
          >
            -{popup.amount}
            {popup.isCritical && (
              <span className="text-sm ml-1">CRIT!</span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hit Sparks */}
      <AnimatePresence>
        {effects.map((effect) => {
          if (effect.type === 'hit-spark') {
            return (
              <motion.div
                key={effect.id}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ x: effect.x, y: effect.y }}
              >
                <svg width="40" height="40" viewBox="0 0 40 40">
                  {Array.from({ length: 8 }).map((_, i) => {
                    const angle = (i / 8) * 360;
                    return (
                      <motion.line
                        key={i}
                        x1="20"
                        y1="20"
                        x2={20 + Math.cos(angle * Math.PI / 180) * 15}
                        y2={20 + Math.sin(angle * Math.PI / 180) * 15}
                        stroke="#FFA500"
                        strokeWidth="2"
                        variants={hitSparkAnimation}
                        initial="hidden"
                        animate="visible"
                      />
                    );
                  })}
                </svg>
              </motion.div>
            );
          }

          if (effect.type === 'critical-hit') {
            return (
              <motion.div
                key={effect.id}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ x: effect.x, y: effect.y }}
              >
                <motion.div
                  className="text-6xl"
                  variants={criticalHitAnimation}
                  initial="normal"
                  animate="critical"
                >
                  ⚡
                </motion.div>
              </motion.div>
            );
          }

          return null;
        })}
      </AnimatePresence>

      {/* Dust Trail */}
      {showDustTrail && (
        <AnimatePresence>
          {Array.from({ length: 3 }).map((_, i) => (
            <motion.div
              key={`dust-${i}`}
              className="absolute bottom-0 left-0 w-4 h-4 rounded-full bg-gray-400"
              variants={dustCloudAnimation}
              initial="hidden"
              animate="visible"
              style={{
                x: -i * 10,
              }}
            />
          ))}
        </AnimatePresence>
      )}

      {/* Silk Collection Effect */}
      {collectingSilk && (
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 pointer-events-none"
          variants={silkSparkleAnimation}
          initial="hidden"
          animate="collecting"
        >
          <div className="text-4xl">✨</div>
        </motion.div>
      )}

      {/* Gold Shine Effect */}
      {nearGold && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          variants={goldShineAnimation}
          initial="idle"
          animate="shining"
        >
          <div className="absolute inset-0 bg-gradient-radial from-yellow-300/20 to-transparent rounded-full" />
        </motion.div>
      )}

      {/* Immobilized Indicator */}
      {unit.isImmobilized && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2"
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="text-2xl">⛓️</div>
        </motion.div>
      )}

      {/* Low HP Warning */}
      {unit.hp <= unit.maxHp * 0.3 && unit.hp > 0 && (
        <motion.div
          className="absolute inset-0 border-2 border-red-500 rounded pointer-events-none"
          animate={{
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  );
};

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

/**
 * Simple damage number component for standalone use
 */
export const DamageNumber: React.FC<{
  amount: number;
  isCritical?: boolean;
  x?: number;
  y?: number;
  onComplete?: () => void;
}> = ({ amount, isCritical = false, x = 0, y = 0, onComplete }) => {
  return (
    <motion.div
      className={`absolute font-bold pointer-events-none z-50 ${
        isCritical
          ? 'text-3xl text-yellow-400 drop-shadow-[0_0_8px_rgba(255,215,0,0.8)]'
          : 'text-2xl text-red-500 drop-shadow-[0_0_4px_rgba(255,0,0,0.6)]'
      }`}
      style={{ x, y }}
      variants={isCritical ? criticalDamageNumberAnimation : damageNumberAnimation}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onAnimationComplete={onComplete}
    >
      -{amount}
    </motion.div>
  );
};

/**
 * Hit spark effect component
 */
export const HitSpark: React.FC<{
  x?: number;
  y?: number;
  color?: string;
}> = ({ x = 0, y = 0, color = '#FFA500' }) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ x, y }}
    >
      <svg width="40" height="40" viewBox="0 0 40 40">
        {Array.from({ length: 8 }).map((_, i) => {
          const angle = (i / 8) * 360;
          return (
            <motion.line
              key={i}
              x1="20"
              y1="20"
              x2={20 + Math.cos(angle * Math.PI / 180) * 15}
              y2={20 + Math.sin(angle * Math.PI / 180) * 15}
              stroke={color}
              strokeWidth="2"
              variants={hitSparkAnimation}
              initial="hidden"
              animate="visible"
            />
          );
        })}
      </svg>
    </motion.div>
  );
};

/**
 * Dust cloud effect component
 */
export const DustCloud: React.FC<{
  x?: number;
  y?: number;
}> = ({ x = 0, y = 0 }) => {
  return (
    <>
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-4 h-4 rounded-full bg-gray-400 opacity-50 pointer-events-none"
          style={{ x: x - i * 10, y }}
          variants={dustCloudAnimation}
          initial="hidden"
          animate="visible"
        />
      ))}
    </>
  );
};

export default AnimatedUnit;
