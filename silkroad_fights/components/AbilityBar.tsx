"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield,
  Zap,
  Eye,
  Users,
  Wind,
  Droplet,
  Flame,
  Sparkles,
  Sword,
  Target,
} from 'lucide-react'

interface Ability {
  id: string
  name: string
  description: string
  cost: number
  cooldown: number
  currentCooldown: number
  hotkey: string
  icon: React.ReactNode
  type: 'offensive' | 'defensive' | 'utility' | 'movement'
  isActive: boolean
}

interface AbilityBarProps {
  abilities: Array<{
    name: string
    description: string
    cost: number
    cooldown?: number
    hotkey: string
  }>
  onAbilityUse: (abilityName: string) => void
  silkCount: number
  cooldowns: Record<string, number>
  activeAbilities: string[]
  isPlayerTurn: boolean
}

const AbilityBar: React.FC<AbilityBarProps> = ({
  abilities,
  onAbilityUse,
  silkCount,
  cooldowns,
  activeAbilities,
  isPlayerTurn,
}) => {
  const [hoveredAbility, setHoveredAbility] = useState<string | null>(null)
  const [pressedKey, setPressedKey] = useState<string | null>(null)

  // Map ability names to icons
  const getAbilityIcon = (name: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      Evasion: <Wind className="w-6 h-6" />,
      Sprint: <Zap className="w-6 h-6" />,
      'Shield Bash': <Shield className="w-6 h-6" />,
      'Track Prey': <Eye className="w-6 h-6" />,
      Guard: <Users className="w-6 h-6" />,
      'Shadow Step': <Sparkles className="w-6 h-6" />,
      'Steal Silk': <Droplet className="w-6 h-6" />,
      'Set Trap': <Target className="w-6 h-6" />,
      Attack: <Sword className="w-6 h-6" />,
      Heal: <Flame className="w-6 h-6" />,
    }
    return iconMap[name] || <Zap className="w-6 h-6" />
  }

  // Determine ability type based on name
  const getAbilityType = (name: string): 'offensive' | 'defensive' | 'utility' | 'movement' => {
    if (name.includes('Attack') || name.includes('Bash') || name.includes('Steal'))
      return 'offensive'
    if (name.includes('Shield') || name.includes('Guard') || name.includes('Evasion'))
      return 'defensive'
    if (name.includes('Sprint') || name.includes('Shadow Step')) return 'movement'
    return 'utility'
  }

  // Get ability color based on type
  const getAbilityColor = (type: string) => {
    const colors = {
      offensive: { main: '#FF4500', glow: 'rgba(255, 69, 0, 0.6)' },
      defensive: { main: '#4169E1', glow: 'rgba(65, 105, 225, 0.6)' },
      utility: { main: '#9370DB', glow: 'rgba(147, 112, 219, 0.6)' },
      movement: { main: '#32CD32', glow: 'rgba(50, 205, 50, 0.6)' },
    }
    return colors[type as keyof typeof colors] || colors.utility
  }

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlayerTurn) return

      const ability = abilities.find(
        (a) => a.hotkey.toLowerCase() === e.key.toLowerCase()
      )
      if (ability) {
        setPressedKey(ability.hotkey)
        const currentCooldown = cooldowns[ability.name] || 0
        if (silkCount >= ability.cost && currentCooldown === 0) {
          onAbilityUse(ability.name)
        }
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      setPressedKey(null)
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [abilities, silkCount, cooldowns, isPlayerTurn, onAbilityUse])

  const renderAbilityButton = (ability: (typeof abilities)[0], index: number) => {
    const currentCooldown = cooldowns[ability.name] || 0
    const maxCooldown = ability.cooldown || 0
    const isOnCooldown = currentCooldown > 0
    const canAfford = silkCount >= ability.cost
    const isDisabled = isOnCooldown || !canAfford || !isPlayerTurn
    const isActive = activeAbilities.includes(ability.name)
    const isHovered = hoveredAbility === ability.name
    const isPressed = pressedKey === ability.hotkey
    const abilityType = getAbilityType(ability.name)
    const colors = getAbilityColor(abilityType)

    const cooldownPercentage = maxCooldown > 0 ? (currentCooldown / maxCooldown) * 100 : 0

    return (
      <motion.div
        key={ability.name}
        className="relative"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        onMouseEnter={() => setHoveredAbility(ability.name)}
        onMouseLeave={() => setHoveredAbility(null)}
      >
        {/* Ability button */}
        <motion.button
          className={`relative w-16 h-16 rounded-full flex items-center justify-center overflow-hidden ${
            isDisabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          style={{
            background: isActive
              ? `radial-gradient(circle, ${colors.main}, ${colors.main}CC)`
              : 'linear-gradient(135deg, rgba(26, 15, 15, 0.9), rgba(50, 30, 30, 0.9))',
            border: `3px solid ${isActive ? colors.main : '#D4AF37'}`,
            boxShadow: isActive
              ? `0 0 20px ${colors.glow}, 0 0 40px ${colors.glow}`
              : isHovered && !isDisabled
              ? `0 0 15px ${colors.glow}`
              : '0 4px 6px rgba(0, 0, 0, 0.5)',
          }}
          onClick={() => !isDisabled && onAbilityUse(ability.name)}
          whileHover={!isDisabled ? { scale: 1.1 } : {}}
          whileTap={!isDisabled ? { scale: 0.95 } : {}}
          animate={
            isPressed && !isDisabled
              ? { scale: 0.9 }
              : isActive
              ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    `0 0 20px ${colors.glow}`,
                    `0 0 30px ${colors.glow}`,
                    `0 0 20px ${colors.glow}`,
                  ],
                }
              : {}
          }
          transition={isActive ? { repeat: Infinity, duration: 1.5 } : {}}
          disabled={isDisabled}
          aria-label={`${ability.name} - ${ability.description}`}
        >
          {/* Icon */}
          <div
            className="relative z-10"
            style={{
              color: isActive ? '#FFFFFF' : isDisabled ? '#666666' : '#D4AF37',
              filter: isActive ? `drop-shadow(0 0 8px ${colors.main})` : 'none',
            }}
          >
            {getAbilityIcon(ability.name)}
          </div>

          {/* Circular cooldown overlay */}
          {isOnCooldown && (
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="rgba(0, 0, 0, 0.7)"
                strokeWidth="10"
              />
              <motion.circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="#FF4500"
                strokeWidth="10"
                strokeDasharray={`${2 * Math.PI * 45}`}
                initial={{ strokeDashoffset: 0 }}
                animate={{
                  strokeDashoffset: (cooldownPercentage / 100) * 2 * Math.PI * 45,
                }}
                transition={{ duration: 0.3 }}
              />
            </svg>
          )}

          {/* Cooldown timer text */}
          {isOnCooldown && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center z-20"
              initial={{ scale: 1.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <span className="text-xl font-bold text-white drop-shadow-lg">
                {currentCooldown}
              </span>
            </motion.div>
          )}

          {/* Active pulse effect */}
          {isActive && (
            <motion.div
              className="absolute inset-0 rounded-full"
              style={{ background: colors.glow }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.5, 0, 0.5],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
          )}

          {/* Insufficient silk indicator */}
          {!canAfford && !isOnCooldown && (
            <div className="absolute inset-0 bg-red-900 bg-opacity-60 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-white">LOW SILK</span>
            </div>
          )}
        </motion.button>

        {/* Hotkey indicator */}
        <motion.div
          className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold"
          style={{
            background: isPressed
              ? 'linear-gradient(135deg, #FFD700, #FFA500)'
              : 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #D4AF37',
            color: isPressed ? '#000000' : '#D4AF37',
          }}
          animate={isPressed ? { scale: [1, 1.2, 1] } : {}}
        >
          {ability.hotkey}
        </motion.div>

        {/* Silk cost indicator */}
        <motion.div
          className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
          style={{
            background: canAfford
              ? 'linear-gradient(135deg, #8B4513, #654321)'
              : 'linear-gradient(135deg, #8B0000, #DC143C)',
            border: '2px solid #D4AF37',
            color: '#FFFFFF',
          }}
        >
          {ability.cost}
        </motion.div>

        {/* Hover tooltip */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-4 px-4 py-3 rounded-lg whitespace-nowrap z-50 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.95), rgba(26, 15, 15, 0.95))',
                border: `2px solid ${colors.main}`,
                boxShadow: `0 0 20px ${colors.glow}`,
                minWidth: '200px',
              }}
              initial={{ opacity: 0, y: 10, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.8 }}
              transition={{ duration: 0.2 }}
            >
              {/* Ability name with type indicator */}
              <div className="flex items-center gap-2 mb-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: colors.main }}
                />
                <span className="font-bold text-white text-sm">{ability.name}</span>
                <span
                  className="text-xs px-2 py-0.5 rounded"
                  style={{
                    background: colors.glow,
                    color: '#FFFFFF',
                  }}
                >
                  {abilityType}
                </span>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-300 mb-2">{ability.description}</p>

              {/* Stats */}
              <div className="flex gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <img src="/silk-icon.png" alt="Silk" className="w-3 h-3" />
                  <span className={canAfford ? 'text-green-400' : 'text-red-400'}>
                    Cost: {ability.cost}
                  </span>
                </div>
                {ability.cooldown && (
                  <div className="flex items-center gap-1">
                    <span className="text-blue-400">CD: {ability.cooldown}s</span>
                  </div>
                )}
              </div>

              {/* Tooltip arrow */}
              <div
                className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent"
                style={{ borderTopColor: colors.main }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  return (
    <div className="relative">
      {/* Ability bar container */}
      <div
        className="flex items-center justify-center gap-4 px-6 py-4 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.95), rgba(50, 30, 30, 0.9))',
          border: '3px solid #D4AF37',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.8), inset 0 2px 10px rgba(212, 175, 55, 0.2)',
        }}
      >
        {abilities.map((ability, index) => renderAbilityButton(ability, index))}
      </div>

      {/* Silk reminder */}
      {abilities.some((a) => silkCount < a.cost) && (
        <motion.div
          className="absolute -top-8 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap"
          style={{
            background: 'linear-gradient(135deg, #8B4513, #654321)',
            border: '2px solid #D4AF37',
            color: '#FFD700',
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          Collect more Silk to unlock abilities!
        </motion.div>
      )}

      {/* Turn indicator */}
      {!isPlayerTurn && (
        <motion.div
          className="absolute inset-0 rounded-2xl flex items-center justify-center"
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <span className="text-white font-bold text-lg">Enemy Turn</span>
        </motion.div>
      )}

      {/* Accessibility screen reader text */}
      <div className="sr-only" role="status" aria-live="polite">
        {abilities.map((ability) => {
          const currentCooldown = cooldowns[ability.name] || 0
          const canAfford = silkCount >= ability.cost
          return (
            <span key={ability.name}>
              {ability.name}: {currentCooldown > 0 ? `Cooldown ${currentCooldown}s` : canAfford ? 'Ready' : 'Need more silk'}
            </span>
          )
        })}
      </div>
    </div>
  )
}

export default AbilityBar
