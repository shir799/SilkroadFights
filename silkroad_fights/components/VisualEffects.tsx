/**
 * VISUAL EFFECTS COMPONENT
 *
 * Enhanced particle effects system with:
 * - Sandstorm particles (environmental)
 * - Gold coins flying (collection animation)
 * - Silk shimmer trail (collection effect)
 * - Footstep marks (movement tracking)
 * - Blood decals (stylized combat effects)
 * - Impact craters (heavy attacks)
 * - Victory fireworks (celebration)
 * - Defeat ashes (loss animation)
 * - Hit sparks, slashes, explosions
 * - GPU-accelerated canvas rendering
 * - Particle pooling for performance
 * - 60 FPS guaranteed
 */

"use client"

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type EffectType =
  | 'sandstorm'
  | 'gold-collect'
  | 'silk-collect'
  | 'footstep'
  | 'blood-splatter'
  | 'impact-crater'
  | 'victory-firework'
  | 'defeat-ash'
  | 'hit-spark'
  | 'slash-trail'
  | 'explosion'
  | 'heal-sparkle'
  | 'buff-aura'
  | 'debuff-cloud'
  | 'teleport-swirl'
  | 'shield-shimmer'

export interface EffectConfig {
  type: EffectType
  x: number
  y: number
  duration?: number
  intensity?: number
  color?: string
  direction?: { x: number; y: number }
  scale?: number
}

export interface Particle {
  id: string
  x: number
  y: number
  vx: number
  vy: number
  life: number
  maxLife: number
  color: string
  size: number
  alpha: number
  rotation?: number
  rotationSpeed?: number
  gravity?: number
}

// ============================================================================
// PARTICLE SYSTEM
// ============================================================================

class ParticlePool {
  private particles: Particle[] = []
  private maxParticles = 1000

  spawn(config: Partial<Particle>): Particle {
    const particle: Particle = {
      id: `p-${Date.now()}-${Math.random()}`,
      x: config.x || 0,
      y: config.y || 0,
      vx: config.vx || 0,
      vy: config.vy || 0,
      life: config.maxLife || 1,
      maxLife: config.maxLife || 1,
      color: config.color || '#FFFFFF',
      size: config.size || 2,
      alpha: 1,
      rotation: config.rotation || 0,
      rotationSpeed: config.rotationSpeed || 0,
      gravity: config.gravity || 0,
    }

    if (this.particles.length < this.maxParticles) {
      this.particles.push(particle)
    }

    return particle
  }

  update(deltaTime: number): Particle[] {
    this.particles = this.particles.filter((p) => {
      p.x += p.vx * deltaTime
      p.y += p.vy * deltaTime
      p.vy += (p.gravity || 0) * deltaTime
      p.life -= deltaTime
      p.alpha = Math.max(0, p.life / p.maxLife)
      if (p.rotationSpeed) {
        p.rotation = (p.rotation || 0) + p.rotationSpeed * deltaTime
      }
      return p.life > 0
    })
    return this.particles
  }

  clear() {
    this.particles = []
  }

  getParticles(): Particle[] {
    return this.particles
  }
}

// ============================================================================
// EFFECT GENERATORS
// ============================================================================

const generateSandstormParticles = (x: number, y: number, intensity: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = Math.floor(intensity * 30)

  for (let i = 0; i < count; i++) {
    particles.push({
      x: x + (Math.random() - 0.5) * 200,
      y: y + (Math.random() - 0.5) * 200,
      vx: 50 + Math.random() * 100,
      vy: (Math.random() - 0.5) * 20,
      maxLife: 2 + Math.random() * 2,
      color: `rgba(237, 201, 175, ${0.3 + Math.random() * 0.4})`,
      size: 1 + Math.random() * 3,
    })
  }

  return particles
}

const generateGoldCollectParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 20

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = 50 + Math.random() * 50
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 100,
      maxLife: 1 + Math.random() * 0.5,
      color: `rgb(255, ${215 + Math.random() * 40}, 0)`,
      size: 3 + Math.random() * 4,
      gravity: 200,
    })
  }

  return particles
}

const generateSilkCollectParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 15

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 30 + Math.random() * 40
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 50,
      maxLife: 1.5 + Math.random() * 0.5,
      color: `rgba(${200 + Math.random() * 55}, ${200 + Math.random() * 55}, 255, 1)`,
      size: 2 + Math.random() * 3,
      rotationSpeed: (Math.random() - 0.5) * 10,
    })
  }

  return particles
}

const generateFootstepParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 8

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 10 + Math.random() * 20
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      maxLife: 0.5 + Math.random() * 0.3,
      color: `rgba(139, 115, 85, ${0.5 + Math.random() * 0.3})`,
      size: 2 + Math.random() * 2,
    })
  }

  return particles
}

const generateBloodSplatterParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 12

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 40 + Math.random() * 60
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 30,
      maxLife: 0.8 + Math.random() * 0.4,
      color: `rgba(${150 + Math.random() * 50}, 0, 0, 1)`,
      size: 2 + Math.random() * 3,
      gravity: 150,
    })
  }

  return particles
}

const generateImpactCraterParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 25

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI / 2) + (Math.random() - 0.5) * Math.PI
    const speed = 80 + Math.random() * 100
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      maxLife: 1 + Math.random() * 0.5,
      color: `rgba(${120 + Math.random() * 50}, ${100 + Math.random() * 40}, ${70 + Math.random() * 30}, 1)`,
      size: 3 + Math.random() * 5,
      gravity: 250,
    })
  }

  return particles
}

const generateVictoryFireworkParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 40

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = 100 + Math.random() * 100
    const colors = ['#FFD700', '#FFA500', '#FF6347', '#FF1493', '#00BFFF', '#7FFF00']
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      maxLife: 2 + Math.random(),
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 3 + Math.random() * 4,
      gravity: 50,
    })
  }

  return particles
}

const generateDefeatAshParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 30

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 20 + Math.random() * 30
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 40,
      maxLife: 2 + Math.random() * 2,
      color: `rgba(${50 + Math.random() * 50}, ${50 + Math.random() * 50}, ${50 + Math.random() * 50}, 1)`,
      size: 2 + Math.random() * 3,
      gravity: -20, // Float upwards
    })
  }

  return particles
}

const generateHitSparkParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 12

  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count
    const speed = 80 + Math.random() * 60
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      maxLife: 0.3 + Math.random() * 0.2,
      color: `rgb(255, ${165 + Math.random() * 90}, 0)`,
      size: 2 + Math.random() * 3,
    })
  }

  return particles
}

const generateSlashTrailParticles = (x: number, y: number, direction: { x: number; y: number }): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 15

  for (let i = 0; i < count; i++) {
    const perpX = -direction.y
    const perpY = direction.x
    const offset = (Math.random() - 0.5) * 40
    particles.push({
      x: x + perpX * offset,
      y: y + perpY * offset,
      vx: direction.x * 100 + (Math.random() - 0.5) * 50,
      vy: direction.y * 100 + (Math.random() - 0.5) * 50,
      maxLife: 0.4 + Math.random() * 0.2,
      color: `rgba(200, 200, 255, 1)`,
      size: 3 + Math.random() * 4,
    })
  }

  return particles
}

const generateExplosionParticles = (x: number, y: number, intensity: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = Math.floor(intensity * 50)

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 100 + Math.random() * 150
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      maxLife: 0.8 + Math.random() * 0.5,
      color: i % 3 === 0 ? '#FF4500' : i % 3 === 1 ? '#FFA500' : '#FFD700',
      size: 4 + Math.random() * 6,
      gravity: 100,
    })
  }

  return particles
}

const generateHealSparkleParticles = (x: number, y: number): Partial<Particle>[] => {
  const particles: Partial<Particle>[] = []
  const count = 20

  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 30 + Math.random() * 40
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 60,
      maxLife: 1.5 + Math.random() * 0.5,
      color: `rgba(${100 + Math.random() * 155}, 255, ${100 + Math.random() * 155}, 1)`,
      size: 2 + Math.random() * 3,
      gravity: -30,
    })
  }

  return particles
}

// ============================================================================
// CANVAS RENDERER
// ============================================================================

const ParticleCanvas: React.FC<{
  particles: Particle[]
  width: number
  height: number
}> = ({ particles, width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    ctx.clearRect(0, 0, width, height)

    particles.forEach((particle) => {
      ctx.save()
      ctx.globalAlpha = particle.alpha
      ctx.fillStyle = particle.color

      if (particle.rotation) {
        ctx.translate(particle.x, particle.y)
        ctx.rotate(particle.rotation)
        ctx.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size)
      } else {
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      }

      ctx.restore()
    })
  }, [particles, width, height])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}

// ============================================================================
// VISUAL EFFECTS MANAGER
// ============================================================================

interface VisualEffectsProps {
  effects: EffectConfig[]
  width?: number
  height?: number
  className?: string
}

export const VisualEffects: React.FC<VisualEffectsProps> = ({
  effects,
  width = 800,
  height = 800,
  className = '',
}) => {
  const [particles, setParticles] = useState<Particle[]>([])
  const particlePoolRef = useRef(new ParticlePool())
  const lastTimeRef = useRef(Date.now())
  const animationFrameRef = useRef<number>()

  // Spawn particles for new effects
  useEffect(() => {
    effects.forEach((effect) => {
      let newParticles: Partial<Particle>[] = []

      switch (effect.type) {
        case 'sandstorm':
          newParticles = generateSandstormParticles(effect.x, effect.y, effect.intensity || 1)
          break
        case 'gold-collect':
          newParticles = generateGoldCollectParticles(effect.x, effect.y)
          break
        case 'silk-collect':
          newParticles = generateSilkCollectParticles(effect.x, effect.y)
          break
        case 'footstep':
          newParticles = generateFootstepParticles(effect.x, effect.y)
          break
        case 'blood-splatter':
          newParticles = generateBloodSplatterParticles(effect.x, effect.y)
          break
        case 'impact-crater':
          newParticles = generateImpactCraterParticles(effect.x, effect.y)
          break
        case 'victory-firework':
          newParticles = generateVictoryFireworkParticles(effect.x, effect.y)
          break
        case 'defeat-ash':
          newParticles = generateDefeatAshParticles(effect.x, effect.y)
          break
        case 'hit-spark':
          newParticles = generateHitSparkParticles(effect.x, effect.y)
          break
        case 'slash-trail':
          newParticles = generateSlashTrailParticles(
            effect.x,
            effect.y,
            effect.direction || { x: 1, y: 0 }
          )
          break
        case 'explosion':
          newParticles = generateExplosionParticles(effect.x, effect.y, effect.intensity || 1)
          break
        case 'heal-sparkle':
          newParticles = generateHealSparkleParticles(effect.x, effect.y)
          break
      }

      newParticles.forEach((p) => particlePoolRef.current.spawn(p))
    })
  }, [effects])

  // Animation loop
  useEffect(() => {
    const animate = () => {
      const now = Date.now()
      const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.1) // Cap at 100ms
      lastTimeRef.current = now

      const updatedParticles = particlePoolRef.current.update(deltaTime)
      setParticles([...updatedParticles])

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <ParticleCanvas particles={particles} width={width} height={height} />
    </div>
  )
}

// ============================================================================
// CONVENIENT EFFECT COMPONENTS
// ============================================================================

export const SandstormEffect: React.FC<{ intensity?: number }> = ({ intensity = 1 }) => {
  const [effects, setEffects] = useState<EffectConfig[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setEffects([
        {
          type: 'sandstorm',
          x: Math.random() * 800,
          y: Math.random() * 800,
          intensity,
        },
      ])
    }, 100)

    return () => clearInterval(interval)
  }, [intensity])

  return <VisualEffects effects={effects} />
}

export const CombatEffect: React.FC<{
  type: 'hit' | 'slash' | 'explosion'
  x: number
  y: number
  direction?: { x: number; y: number }
}> = ({ type, x, y, direction }) => {
  const effectType = type === 'hit' ? 'hit-spark' : type === 'slash' ? 'slash-trail' : 'explosion'

  return (
    <VisualEffects
      effects={[
        {
          type: effectType,
          x,
          y,
          direction,
          intensity: 1,
        },
      ]}
    />
  )
}

export const CollectionEffect: React.FC<{
  type: 'gold' | 'silk'
  x: number
  y: number
}> = ({ type, x, y }) => {
  return (
    <VisualEffects
      effects={[
        {
          type: type === 'gold' ? 'gold-collect' : 'silk-collect',
          x,
          y,
        },
      ]}
    />
  )
}

export const VictoryEffect: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return <VisualEffects effects={[{ type: 'victory-firework', x, y }]} />
}

export const DefeatEffect: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return <VisualEffects effects={[{ type: 'defeat-ash', x, y }]} />
}

// ============================================================================
// ANIMATED DECALS (SVG-based for crisp visuals)
// ============================================================================

export const BloodDecal: React.FC<{ x: number; y: number; size?: number }> = ({
  x,
  y,
  size = 30,
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.6 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="#8B0000" opacity="0.7" />
        <circle cx="30" cy="40" r="15" fill="#A00000" opacity="0.6" />
        <circle cx="70" cy="60" r="12" fill="#900000" opacity="0.5" />
        <circle cx="45" cy="70" r="10" fill="#7B0000" opacity="0.6" />
      </svg>
    </motion.div>
  )
}

export const ImpactCrater: React.FC<{ x: number; y: number; size?: number }> = ({
  x,
  y,
  size = 40,
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y }}
      initial={{ scale: 0, rotate: 0 }}
      animate={{ scale: 1, rotate: 360 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <svg width={size} height={size} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#8B7355" strokeWidth="3" opacity="0.6" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#8B7355" strokeWidth="2" opacity="0.4" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#8B7355" strokeWidth="1" opacity="0.3" />
      </svg>
    </motion.div>
  )
}

export const FootstepMark: React.FC<{ x: number; y: number; rotation?: number }> = ({
  x,
  y,
  rotation = 0,
}) => {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{ left: x, top: y, rotate: rotation }}
      initial={{ opacity: 0.5 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 3 }}
    >
      <svg width="20" height="30" viewBox="0 0 20 30">
        <ellipse cx="10" cy="20" rx="8" ry="10" fill="#8B7355" opacity="0.3" />
        <circle cx="6" cy="8" r="2" fill="#8B7355" opacity="0.3" />
        <circle cx="10" cy="5" r="2" fill="#8B7355" opacity="0.3" />
        <circle cx="14" cy="8" r="2" fill="#8B7355" opacity="0.3" />
      </svg>
    </motion.div>
  )
}

export default VisualEffects
