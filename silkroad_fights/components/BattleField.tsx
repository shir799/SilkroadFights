'use client';

/**
 * BATTLEFIELD COMPONENT
 * Visual auto-battle arena with smooth animations and effects
 *
 * Features:
 * - 60 FPS rendering with requestAnimationFrame
 * - Smooth unit movement with lerp interpolation
 * - Attack animations (melee, ranged, magic)
 * - Projectiles (arrows, fireballs, lightning)
 * - Hit effects (flash, shake, particles)
 * - Ability visual effects
 * - Floating damage numbers
 * - Health & Mana bars
 * - Status effect icons
 * - Camera follow and shake
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AutoBattleEngine,
  BattleUnit,
  BattleEvent,
  UnitClass,
  createAutoBattle,
} from '@/lib/autoBattleSystem';
import { Position } from '@/lib/types';

// ============================================================================
// TYPES
// ============================================================================

interface BattleFieldProps {
  teamA: UnitClass[];
  teamB: UnitClass[];
  onBattleEnd?: (winner: 'A' | 'B') => void;
  autoStart?: boolean;
}

interface Projectile {
  id: string;
  from: Position;
  to: Position;
  type: 'arrow' | 'fireball' | 'lightning' | 'magic';
  startTime: number;
  duration: number;
}

interface FloatingText {
  id: string;
  text: string;
  position: Position;
  color: string;
  startTime: number;
  isCritical: boolean;
}

interface ParticleEffect {
  id: string;
  type: string;
  position: Position;
  startTime: number;
}

interface UnitRenderState {
  id: string;
  displayPosition: Position; // Lerped position for smooth movement
  animationState: 'idle' | 'moving' | 'attacking' | 'casting' | 'hit' | 'dying';
  rotation: number;
  flashTime: number;
  shakeOffset: { x: number; y: number };
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CELL_SIZE = 60;
const BOARD_SIZE = 10;
const LERP_SPEED = 0.15;

const UNIT_COLORS: Record<string, string> = {
  // Tier 1
  BladeNovice: '#8B4513',
  BowNovice: '#228B22',
  ForceNovice: '#4169E1',
  // Tier 2
  Blader: '#B8860B',
  Bowman: '#32CD32',
  Wizard: '#6A5ACD',
  // Tier 3
  Warrior: '#CD853F',
  Bard: '#FFD700',
  Cleric: '#F0E68C',
  // Tier 4
  FireWizard: '#FF4500',
  IceWizard: '#00BFFF',
  LightningWizard: '#FFD700',
  // Tier 5
  TigerGirl: '#FF8C00',
  Phoenix: '#DC143C',
  Dragon: '#8B008B',
};

const UNIT_EMOJIS: Record<string, string> = {
  BladeNovice: '🗡️',
  BowNovice: '🏹',
  ForceNovice: '✨',
  Blader: '⚔️',
  Bowman: '🏹',
  Wizard: '🔮',
  Warrior: '🛡️',
  Bard: '🎵',
  Cleric: '✝️',
  FireWizard: '🔥',
  IceWizard: '❄️',
  LightningWizard: '⚡',
  TigerGirl: '🐯',
  Phoenix: '🦅',
  Dragon: '🐉',
};

// ============================================================================
// BATTLEFIELD COMPONENT
// ============================================================================

export default function BattleField({
  teamA,
  teamB,
  onBattleEnd,
  autoStart = true,
}: BattleFieldProps) {
  const [engine] = useState<AutoBattleEngine>(() => createAutoBattle(teamA, teamB));
  const [isRunning, setIsRunning] = useState(autoStart);
  const [isPaused, setIsPaused] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const [units, setUnits] = useState<BattleUnit[]>([]);
  const [unitRenderStates, setUnitRenderStates] = useState<Map<string, UnitRenderState>>(new Map());
  const [projectiles, setProjectiles] = useState<Projectile[]>([]);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [particles, setParticles] = useState<ParticleEffect[]>([]);
  const [cameraShake, setCameraShake] = useState({ x: 0, y: 0 });

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const eventProcessedRef = useRef<Set<number>>(new Set());

  // ============================================================================
  // GAME LOOP
  // ============================================================================

  const gameLoop = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;

    const deltaTime = (timestamp - lastTimeRef.current) * playbackSpeed;
    lastTimeRef.current = timestamp;

    if (!isPaused && isRunning) {
      // Update engine
      engine.update(deltaTime);

      // Get current state
      const state = engine.getState();
      setUnits([...state.units]);

      // Process new events
      const recentEvents = engine.getRecentEvents(50);
      recentEvents.forEach(event => {
        const eventId = event.timestamp;
        if (!eventProcessedRef.current.has(eventId)) {
          processEvent(event);
          eventProcessedRef.current.add(eventId);
        }
      });

      // Update render states (lerp positions)
      updateRenderStates(state.units, deltaTime);

      // Clean up old effects
      cleanupEffects(timestamp);

      // Check if finished
      if (engine.isFinished()) {
        setIsRunning(false);
        const winner = engine.getWinner();
        if (winner && onBattleEnd) {
          setTimeout(() => onBattleEnd(winner), 1000);
        }
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [engine, isPaused, isRunning, playbackSpeed, onBattleEnd]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(gameLoop);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameLoop]);

  // ============================================================================
  // EVENT PROCESSING
  // ============================================================================

  const processEvent = (event: BattleEvent) => {
    switch (event.type) {
      case 'damage':
        handleDamageEvent(event.data);
        break;
      case 'heal':
        handleHealEvent(event.data);
        break;
      case 'ability':
        handleAbilityEvent(event.data);
        break;
      case 'death':
        handleDeathEvent(event.data);
        break;
      case 'revive':
        handleReviveEvent(event.data);
        break;
    }
  };

  const handleDamageEvent = (data: any) => {
    const { sourceId, targetId, damage, isCritical, isDodged, position } = data;

    // Add floating text
    if (isDodged) {
      addFloatingText('DODGE!', position, '#FFD700', false);
    } else {
      addFloatingText(
        damage.toString(),
        position,
        isCritical ? '#FF0000' : '#FFA500',
        isCritical
      );
    }

    // Add hit effect
    if (!isDodged) {
      addParticle('hit_spark', position);
      flashUnit(targetId);

      if (isCritical) {
        shakeCamera(10);
        addParticle('critical_burst', position);
      } else {
        shakeCamera(3);
      }
    }
  };

  const handleHealEvent = (data: any) => {
    const { unitId, amount, position } = data;
    addFloatingText(`+${amount}`, position, '#00FF00', false);
    addParticle('heal_sparkle', position);
  };

  const handleAbilityEvent = (data: any) => {
    const { casterId, abilityName, position } = data;
    const caster = units.find(u => u.id === casterId);
    if (!caster) return;

    // Set animation state
    updateUnitAnimation(casterId, 'casting');

    // Add projectile or effect based on ability
    if (abilityName.includes('Arrow') || abilityName.includes('Shot')) {
      addProjectile(caster.position, position, 'arrow', 400);
    } else if (abilityName.includes('Fire') || abilityName.includes('Meteor')) {
      addProjectile(caster.position, position, 'fireball', 800);
      shakeCamera(15);
    } else if (abilityName.includes('Lightning')) {
      addProjectile(caster.position, position, 'lightning', 200);
    } else if (abilityName.includes('Magic') || abilityName.includes('Bolt')) {
      addProjectile(caster.position, position, 'magic', 500);
    }

    // Add particle effects
    addParticle(abilityName.toLowerCase().replace(' ', '_'), position);
    shakeCamera(8);
  };

  const handleDeathEvent = (data: any) => {
    const { unitId, position } = data;
    updateUnitAnimation(unitId, 'dying');
    addParticle('death_explosion', position);
    shakeCamera(5);
  };

  const handleReviveEvent = (data: any) => {
    const { unitId, position } = data;
    addParticle('revive_aura', position);
    shakeCamera(12);
  };

  // ============================================================================
  // RENDER STATE MANAGEMENT
  // ============================================================================

  const updateRenderStates = (currentUnits: BattleUnit[], deltaTime: number) => {
    setUnitRenderStates(prev => {
      const next = new Map(prev);

      currentUnits.forEach(unit => {
        const existing = next.get(unit.id);

        if (!existing) {
          // Initialize
          next.set(unit.id, {
            id: unit.id,
            displayPosition: { ...unit.position },
            animationState: 'idle',
            rotation: unit.rotation,
            flashTime: 0,
            shakeOffset: { x: 0, y: 0 },
          });
        } else {
          // Lerp position for smooth movement
          const lerpFactor = Math.min(LERP_SPEED * (deltaTime / 16), 1);
          existing.displayPosition.row += (unit.position.row - existing.displayPosition.row) * lerpFactor;
          existing.displayPosition.col += (unit.position.col - existing.displayPosition.col) * lerpFactor;
          existing.rotation = unit.rotation;

          // Decay flash and shake
          if (existing.flashTime > 0) {
            existing.flashTime = Math.max(0, existing.flashTime - deltaTime);
          }
          existing.shakeOffset.x *= 0.8;
          existing.shakeOffset.y *= 0.8;

          // Auto-return to idle
          if (existing.animationState !== 'idle' && existing.animationState !== 'dying') {
            // Simple timeout
            setTimeout(() => {
              const state = next.get(unit.id);
              if (state && state.animationState !== 'dying') {
                state.animationState = 'idle';
              }
            }, 500);
          }
        }
      });

      return next;
    });
  };

  const updateUnitAnimation = (unitId: string, animation: UnitRenderState['animationState']) => {
    setUnitRenderStates(prev => {
      const next = new Map(prev);
      const state = next.get(unitId);
      if (state) {
        state.animationState = animation;
      }
      return next;
    });
  };

  const flashUnit = (unitId: string) => {
    setUnitRenderStates(prev => {
      const next = new Map(prev);
      const state = next.get(unitId);
      if (state) {
        state.flashTime = 200;
        state.shakeOffset = {
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
        };
      }
      return next;
    });
  };

  // ============================================================================
  // EFFECTS MANAGEMENT
  // ============================================================================

  const addProjectile = (from: Position, to: Position, type: Projectile['type'], duration: number) => {
    setProjectiles(prev => [
      ...prev,
      {
        id: `projectile_${Date.now()}_${Math.random()}`,
        from: { ...from },
        to: { ...to },
        type,
        startTime: Date.now(),
        duration,
      },
    ]);
  };

  const addFloatingText = (text: string, position: Position, color: string, isCritical: boolean) => {
    setFloatingTexts(prev => [
      ...prev,
      {
        id: `text_${Date.now()}_${Math.random()}`,
        text,
        position: { ...position },
        color,
        startTime: Date.now(),
        isCritical,
      },
    ]);
  };

  const addParticle = (type: string, position: Position) => {
    setParticles(prev => [
      ...prev,
      {
        id: `particle_${Date.now()}_${Math.random()}`,
        type,
        position: { ...position },
        startTime: Date.now(),
      },
    ]);
  };

  const shakeCamera = (intensity: number) => {
    setCameraShake({
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity,
    });

    setTimeout(() => {
      setCameraShake({ x: 0, y: 0 });
    }, 200);
  };

  const cleanupEffects = (timestamp: number) => {
    const now = Date.now();

    // Remove old projectiles
    setProjectiles(prev => prev.filter(p => now - p.startTime < p.duration));

    // Remove old floating texts
    setFloatingTexts(prev => prev.filter(t => now - t.startTime < 1500));

    // Remove old particles
    setParticles(prev => prev.filter(p => now - p.startTime < 1000));
  };

  // ============================================================================
  // RENDERING
  // ============================================================================

  const renderUnit = (unit: BattleUnit) => {
    const renderState = unitRenderStates.get(unit.id);
    if (!renderState) return null;

    const { displayPosition, flashTime, shakeOffset, animationState } = renderState;

    const x = displayPosition.col * CELL_SIZE;
    const y = displayPosition.row * CELL_SIZE;

    const isFlashing = flashTime > 0;
    const isDying = unit.isDead || animationState === 'dying';

    return (
      <motion.div
        key={unit.id}
        className="absolute"
        style={{
          left: x + shakeOffset.x,
          top: y + shakeOffset.y,
          width: CELL_SIZE,
          height: CELL_SIZE,
          zIndex: Math.floor(displayPosition.row * 10),
        }}
        animate={{
          opacity: isDying ? 0 : 1,
          scale: isDying ? 0.5 : isFlashing ? 1.2 : 1,
          rotate: isDying ? 90 : 0,
        }}
        transition={{ duration: isDying ? 0.5 : 0.1 }}
      >
        {/* Unit Circle */}
        <div
          className="w-full h-full rounded-full flex items-center justify-center text-3xl relative"
          style={{
            backgroundColor: UNIT_COLORS[unit.class] || '#888',
            border: `3px solid ${unit.team === 'A' ? '#4169E1' : '#DC143C'}`,
            boxShadow: isFlashing ? '0 0 20px rgba(255,255,255,0.8)' : '0 4px 8px rgba(0,0,0,0.3)',
            filter: isFlashing ? 'brightness(1.5)' : 'brightness(1)',
          }}
        >
          {UNIT_EMOJIS[unit.class] || '❓'}

          {/* HP Bar */}
          <div className="absolute -top-8 left-0 w-full px-1">
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-green-500"
                initial={{ width: '100%' }}
                animate={{
                  width: `${(unit.currentHp / unit.maxHp) * 100}%`,
                  backgroundColor:
                    unit.currentHp / unit.maxHp > 0.5
                      ? '#22c55e'
                      : unit.currentHp / unit.maxHp > 0.25
                      ? '#f59e0b'
                      : '#ef4444',
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          {/* Mana Bar */}
          <div className="absolute -bottom-8 left-0 w-full px-1">
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-blue-500"
                animate={{
                  width: `${(unit.currentMana / unit.maxMana) * 100}%`,
                }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          {/* Status Effects */}
          {unit.statusEffects.length > 0 && (
            <div className="absolute -top-12 left-0 w-full flex justify-center gap-0.5">
              {unit.statusEffects.slice(0, 3).map((effect, i) => (
                <div
                  key={i}
                  className="w-4 h-4 rounded-full bg-purple-600 text-white text-xs flex items-center justify-center"
                  title={effect.type}
                >
                  {effect.type === 'stun' ? '💫' : effect.type === 'burn' ? '🔥' : '⚡'}
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  const renderProjectile = (projectile: Projectile) => {
    const now = Date.now();
    const elapsed = now - projectile.startTime;
    const progress = Math.min(elapsed / projectile.duration, 1);

    const x = projectile.from.col + (projectile.to.col - projectile.from.col) * progress;
    const y = projectile.from.row + (projectile.to.row - projectile.from.row) * progress;

    const icons: Record<Projectile['type'], string> = {
      arrow: '➤',
      fireball: '🔥',
      lightning: '⚡',
      magic: '✨',
    };

    return (
      <motion.div
        key={projectile.id}
        className="absolute text-2xl pointer-events-none"
        style={{
          left: x * CELL_SIZE,
          top: y * CELL_SIZE,
          zIndex: 100,
        }}
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
      >
        {icons[projectile.type]}
      </motion.div>
    );
  };

  const renderFloatingText = (text: FloatingText) => {
    return (
      <motion.div
        key={text.id}
        className="absolute pointer-events-none font-bold"
        style={{
          left: text.position.col * CELL_SIZE,
          top: text.position.row * CELL_SIZE,
          color: text.color,
          fontSize: text.isCritical ? '32px' : '24px',
          textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
          zIndex: 150,
        }}
        initial={{ y: 0, opacity: 0, scale: 0.5 }}
        animate={{ y: -50, opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 1.5, ease: 'easeOut' }}
      >
        {text.text}
      </motion.div>
    );
  };

  const renderParticle = (particle: ParticleEffect) => {
    const effects: Record<string, string> = {
      hit_spark: '💥',
      critical_burst: '⭐',
      heal_sparkle: '✨',
      death_explosion: '💀',
      revive_aura: '🌟',
    };

    return (
      <motion.div
        key={particle.id}
        className="absolute text-4xl pointer-events-none"
        style={{
          left: particle.position.col * CELL_SIZE,
          top: particle.position.row * CELL_SIZE,
          zIndex: 120,
        }}
        initial={{ scale: 0, opacity: 0, rotate: 0 }}
        animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0], rotate: 360 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {effects[particle.type] || '✨'}
      </motion.div>
    );
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Controls */}
      <div className="flex gap-2">
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isPaused ? '▶ Resume' : '⏸ Pause'}
        </button>

        <select
          value={playbackSpeed}
          onChange={e => setPlaybackSpeed(Number(e.target.value))}
          className="px-4 py-2 bg-gray-700 text-white rounded"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>

        {engine.isFinished() && (
          <div className="px-4 py-2 bg-green-600 text-white rounded font-bold">
            {engine.getWinner() === 'A' ? 'Team A' : 'Team B'} Wins! 🎉
          </div>
        )}
      </div>

      {/* Battlefield */}
      <motion.div
        className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-900 rounded-lg shadow-2xl overflow-hidden"
        style={{
          width: BOARD_SIZE * CELL_SIZE,
          height: BOARD_SIZE * CELL_SIZE,
        }}
        animate={{
          x: cameraShake.x,
          y: cameraShake.y,
        }}
        transition={{ duration: 0.1 }}
      >
        {/* Grid */}
        <svg className="absolute inset-0 pointer-events-none opacity-20">
          {Array.from({ length: BOARD_SIZE }).map((_, i) => (
            <React.Fragment key={i}>
              <line
                x1={i * CELL_SIZE}
                y1={0}
                x2={i * CELL_SIZE}
                y2={BOARD_SIZE * CELL_SIZE}
                stroke="white"
                strokeWidth="1"
              />
              <line
                x1={0}
                y1={i * CELL_SIZE}
                x2={BOARD_SIZE * CELL_SIZE}
                y2={i * CELL_SIZE}
                stroke="white"
                strokeWidth="1"
              />
            </React.Fragment>
          ))}
        </svg>

        {/* Units */}
        {units.map(renderUnit)}

        {/* Projectiles */}
        <AnimatePresence>{projectiles.map(renderProjectile)}</AnimatePresence>

        {/* Floating Texts */}
        <AnimatePresence>{floatingTexts.map(renderFloatingText)}</AnimatePresence>

        {/* Particles */}
        <AnimatePresence>{particles.map(renderParticle)}</AnimatePresence>
      </motion.div>

      {/* Team Info */}
      <div className="flex gap-8 w-full max-w-4xl">
        <div className="flex-1 bg-blue-900 p-4 rounded">
          <h3 className="text-xl font-bold text-white mb-2">Team A</h3>
          {units
            .filter(u => u.team === 'A')
            .map(u => (
              <div key={u.id} className="text-white text-sm">
                {UNIT_EMOJIS[u.class]} {u.class}: {u.currentHp}/{u.maxHp} HP
              </div>
            ))}
        </div>

        <div className="flex-1 bg-red-900 p-4 rounded">
          <h3 className="text-xl font-bold text-white mb-2">Team B</h3>
          {units
            .filter(u => u.team === 'B')
            .map(u => (
              <div key={u.id} className="text-white text-sm">
                {UNIT_EMOJIS[u.class]} {u.class}: {u.currentHp}/{u.maxHp} HP
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
