"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Skull, Shield, Zap, Flame, Sparkles, Heart, Swords } from 'lucide-react'

interface DamageEvent {
  id: string
  damage: number
  position: { x: number; y: number }
  type: 'damage' | 'heal' | 'critical' | 'miss' | 'block'
  timestamp: number
}

interface HitEffect {
  id: string
  position: { x: number; y: number }
  type: 'slash' | 'impact' | 'magic' | 'critical'
  timestamp: number
}

interface StatusEffect {
  type: 'poison' | 'burn' | 'stun' | 'shield' | 'buff' | 'debuff'
  duration: number
  icon: React.ReactNode
  color: string
}

interface ComboEvent {
  count: number
  timestamp: number
}

interface CombatOverlayProps {
  damageEvents: Array<{
    damage: number
    position: { row: number; col: number }
    type: 'damage' | 'heal' | 'critical' | 'miss' | 'block'
  }>
  hitEffects: Array<{
    position: { row: number; col: number }
    type: 'slash' | 'impact' | 'magic' | 'critical'
  }>
  statusEffects: StatusEffect[]
  combo: number
  boardRef?: React.RefObject<HTMLDivElement>
}

const CombatOverlay: React.FC<CombatOverlayProps> = ({
  damageEvents,
  hitEffects,
  statusEffects,
  combo,
  boardRef,
}) => {
  const [activeDamageEvents, setActiveDamageEvents] = useState<DamageEvent[]>([])
  const [activeHitEffects, setActiveHitEffects] = useState<HitEffect[]>([])
  const [currentCombo, setCurrentCombo] = useState<ComboEvent | null>(null)

  // Convert board position to screen position
  const getBoardPosition = (row: number, col: number) => {
    if (!boardRef?.current) {
      // Fallback calculation if no ref
      const cellSize = 80 // Approximate cell size
      return {
        x: col * cellSize + cellSize / 2,
        y: row * cellSize + cellSize / 2,
      }
    }

    const boardRect = boardRef.current.getBoundingClientRect()
    const cellSize = boardRect.width / 8
    return {
      x: col * cellSize + cellSize / 2,
      y: row * cellSize + cellSize / 2,
    }
  }

  // Handle new damage events
  useEffect(() => {
    if (damageEvents.length > 0) {
      const newEvents = damageEvents.map((event) => ({
        id: `damage-${Date.now()}-${Math.random()}`,
        damage: event.damage,
        position: getBoardPosition(event.position.row, event.position.col),
        type: event.type,
        timestamp: Date.now(),
      }))

      setActiveDamageEvents((prev) => [...prev, ...newEvents])

      // Remove events after animation
      setTimeout(() => {
        setActiveDamageEvents((prev) =>
          prev.filter((e) => !newEvents.find((ne) => ne.id === e.id))
        )
      }, 2000)
    }
  }, [damageEvents])

  // Handle hit effects
  useEffect(() => {
    if (hitEffects.length > 0) {
      const newEffects = hitEffects.map((effect) => ({
        id: `hit-${Date.now()}-${Math.random()}`,
        position: getBoardPosition(effect.position.row, effect.position.col),
        type: effect.type,
        timestamp: Date.now(),
      }))

      setActiveHitEffects((prev) => [...prev, ...newEffects])

      setTimeout(() => {
        setActiveHitEffects((prev) =>
          prev.filter((e) => !newEffects.find((ne) => ne.id === e.id))
        )
      }, 1000)
    }
  }, [hitEffects])

  // Handle combo counter
  useEffect(() => {
    if (combo > 1) {
      setCurrentCombo({ count: combo, timestamp: Date.now() })
    } else {
      setCurrentCombo(null)
    }
  }, [combo])

  const getDamageColor = (type: string) => {
    switch (type) {
      case 'critical':
        return '#FF4500'
      case 'damage':
        return '#FF0000'
      case 'heal':
        return '#00FF00'
      case 'block':
        return '#4169E1'
      case 'miss':
        return '#888888'
      default:
        return '#FFFFFF'
    }
  }

  const getDamageIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <Skull className="w-4 h-4" />
      case 'damage':
        return <Swords className="w-4 h-4" />
      case 'heal':
        return <Heart className="w-4 h-4" />
      case 'block':
        return <Shield className="w-4 h-4" />
      case 'miss':
        return null
      default:
        return null
    }
  }

  const getHitEffectParticles = (type: string) => {
    const particleCount = type === 'critical' ? 20 : 12
    const particles = []

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const distance = type === 'critical' ? 60 : 40
      const color =
        type === 'critical'
          ? '#FF4500'
          : type === 'magic'
          ? '#9370DB'
          : type === 'slash'
          ? '#FF6347'
          : '#FFA500'

      particles.push(
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{ background: color }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
          animate={{
            x: Math.cos(angle) * distance,
            y: Math.sin(angle) * distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />
      )
    }

    return particles
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
      {/* Damage Numbers */}
      <AnimatePresence>
        {activeDamageEvents.map((event) => (
          <motion.div
            key={event.id}
            className="absolute flex items-center gap-1"
            style={{
              left: event.position.x,
              top: event.position.y,
              color: getDamageColor(event.type),
            }}
            initial={{ opacity: 0, scale: 0.5, y: 0 }}
            animate={{
              opacity: [0, 1, 1, 0],
              scale: event.type === 'critical' ? [0.5, 1.5, 1.3, 1] : [0.5, 1.2, 1],
              y: event.type === 'heal' ? [0, -80] : [0, -60],
              x: event.type === 'miss' ? [0, 20, -20, 0] : 0,
            }}
            exit={{ opacity: 0, scale: 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <span
              className={`font-bold ${
                event.type === 'critical' ? 'text-3xl' : 'text-2xl'
              }`}
              style={{
                textShadow: `0 0 10px ${getDamageColor(event.type)}, 0 0 20px ${getDamageColor(
                  event.type
                )}`,
                WebkitTextStroke: '1px black',
              }}
            >
              {event.type === 'miss' ? 'MISS' : event.type === 'block' ? 'BLOCKED' : event.damage}
            </span>
            {getDamageIcon(event.type)}

            {/* Critical star burst */}
            {event.type === 'critical' && (
              <motion.div
                className="absolute"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, ease: 'linear' }}
              >
                <Sparkles className="w-6 h-6 text-yellow-400" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Hit Effects */}
      <AnimatePresence>
        {activeHitEffects.map((effect) => (
          <motion.div
            key={effect.id}
            className="absolute"
            style={{
              left: effect.position.x,
              top: effect.position.y,
            }}
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 2 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {/* Impact circle */}
            <motion.div
              className="absolute inset-0 rounded-full border-4"
              style={{
                width: effect.type === 'critical' ? 100 : 60,
                height: effect.type === 'critical' ? 100 : 60,
                marginLeft: effect.type === 'critical' ? -50 : -30,
                marginTop: effect.type === 'critical' ? -50 : -30,
                borderColor:
                  effect.type === 'critical'
                    ? '#FF4500'
                    : effect.type === 'magic'
                    ? '#9370DB'
                    : '#FFA500',
              }}
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
            />

            {/* Particles */}
            {getHitEffectParticles(effect.type)}

            {/* Flash effect */}
            <motion.div
              className="absolute rounded-full"
              style={{
                width: 80,
                height: 80,
                marginLeft: -40,
                marginTop: -40,
                background:
                  effect.type === 'critical'
                    ? 'radial-gradient(circle, rgba(255, 69, 0, 0.8), transparent)'
                    : 'radial-gradient(circle, rgba(255, 165, 0, 0.6), transparent)',
              }}
              initial={{ opacity: 1, scale: 0 }}
              animate={{ opacity: 0, scale: 2 }}
              transition={{ duration: 0.4 }}
            />

            {/* Slash line for slash type */}
            {effect.type === 'slash' && (
              <motion.div
                className="absolute w-20 h-1 bg-white"
                style={{ marginLeft: -40, marginTop: 0 }}
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: 1, opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Status Effect Icons */}
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <AnimatePresence>
          {statusEffects.map((effect, index) => (
            <motion.div
              key={`${effect.type}-${index}`}
              className="flex items-center gap-2 px-3 py-2 rounded-lg backdrop-blur-sm"
              style={{
                background: `linear-gradient(135deg, ${effect.color}40, ${effect.color}20)`,
                border: `2px solid ${effect.color}`,
              }}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: index * 0.1 }}
            >
              <div style={{ color: effect.color }}>{effect.icon}</div>
              <div className="text-white text-sm font-bold">
                {effect.type.toUpperCase()}
              </div>
              {effect.duration > 0 && (
                <div className="text-xs text-gray-300 ml-2">{effect.duration}s</div>
              )}
              <motion.div
                className="absolute bottom-0 left-0 h-1 rounded-full"
                style={{ background: effect.color }}
                initial={{ width: '100%' }}
                animate={{ width: '0%' }}
                transition={{ duration: effect.duration }}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Combo Counter */}
      <AnimatePresence>
        {currentCombo && currentCombo.count > 1 && (
          <motion.div
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
            initial={{ opacity: 0, scale: 0, y: 50 }}
            animate={{
              opacity: 1,
              scale: [1, 1.3, 1],
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.5, y: -50 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col items-center">
              {/* Combo number */}
              <motion.div
                className="text-8xl font-black"
                style={{
                  background: 'linear-gradient(180deg, #FFD700, #FFA500)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 30px rgba(255, 215, 0, 0.8)',
                  filter: 'drop-shadow(0 0 20px rgba(255, 165, 0, 1))',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.5,
                }}
              >
                {currentCombo.count}
              </motion.div>

              {/* Combo text */}
              <motion.div
                className="text-3xl font-bold text-yellow-400 mt-2"
                style={{
                  textShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                }}
                animate={{
                  opacity: [1, 0.7, 1],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.8,
                }}
              >
                COMBO!
              </motion.div>

              {/* Streak effects */}
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-20 bg-gradient-to-b from-yellow-400 to-transparent"
                  style={{
                    left: `${20 + i * 15}%`,
                    top: '50%',
                  }}
                  initial={{ opacity: 0, scaleY: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    scaleY: [0, 1, 0],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.1,
                    repeat: Infinity,
                  }}
                />
              ))}

              {/* Multiplier indicator */}
              {currentCombo.count >= 5 && (
                <motion.div
                  className="mt-4 px-4 py-2 bg-red-600 rounded-full text-white font-bold text-xl"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 0, 0, 0.8)',
                  }}
                  animate={{
                    scale: [1, 1.1, 1],
                    boxShadow: [
                      '0 0 20px rgba(255, 0, 0, 0.8)',
                      '0 0 40px rgba(255, 0, 0, 1)',
                      '0 0 20px rgba(255, 0, 0, 0.8)',
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                  }}
                >
                  {currentCombo.count >= 10 ? 'MEGA!' : 'SUPER!'}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Screen shake effect container */}
      <motion.div
        className="absolute inset-0"
        animate={
          activeHitEffects.some((e) => e.type === 'critical')
            ? {
                x: [0, -5, 5, -5, 5, 0],
                y: [0, -5, 5, -5, 5, 0],
              }
            : {}
        }
        transition={{ duration: 0.3 }}
      />
    </div>
  )
}

export default CombatOverlay
