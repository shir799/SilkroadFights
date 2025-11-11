/**
 * UNIT CARDS COMPONENT
 *
 * Detailed unit information cards with:
 * - Character portraits and unit art
 * - Complete stats display (HP, ATK, DEF, SPD, RNG)
 * - Rich lore and backstory
 * - 3D card flip animations
 * - Rarity indicators (Common, Rare, Epic, Legendary)
 * - Ability showcase
 * - Smooth hover effects
 * - Responsive design
 * - GPU-accelerated for performance
 */

"use client"

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../lib/theme'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UnitRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'

export interface UnitCardData {
  id: string
  name: string
  type: string
  imageUrl: string
  rarity: UnitRarity
  stats: {
    hp: number
    maxHp: number
    attack: number
    defense: number
    speed: number
    range: number
  }
  abilities: Array<{
    name: string
    description: string
    cooldown?: number
    cost?: number
  }>
  lore: {
    title: string
    backstory: string
    quote?: string
    origin?: string
  }
  traits?: string[]
}

interface UnitCardProps {
  unit: UnitCardData
  isFlipped?: boolean
  onFlip?: () => void
  className?: string
  size?: 'small' | 'medium' | 'large'
  showStats?: boolean
  interactive?: boolean
}

// ============================================================================
// CONSTANTS
// ============================================================================

const RARITY_COLORS: Record<UnitRarity, { gradient: string; glow: string; border: string }> = {
  Common: {
    gradient: 'linear-gradient(135deg, #A0A0A0, #808080)',
    glow: 'rgba(160, 160, 160, 0.5)',
    border: '#A0A0A0',
  },
  Rare: {
    gradient: 'linear-gradient(135deg, #4169E1, #1E90FF)',
    glow: 'rgba(65, 105, 225, 0.6)',
    border: '#4169E1',
  },
  Epic: {
    gradient: 'linear-gradient(135deg, #9370DB, #8A2BE2)',
    glow: 'rgba(147, 112, 219, 0.7)',
    border: '#9370DB',
  },
  Legendary: {
    gradient: 'linear-gradient(135deg, #FFD700, #FFA500)',
    glow: 'rgba(255, 215, 0, 0.8)',
    border: '#FFD700',
  },
}

const SIZE_CONFIGS = {
  small: { width: 200, height: 280, fontSize: 'text-xs' },
  medium: { width: 280, height: 400, fontSize: 'text-sm' },
  large: { width: 360, height: 520, fontSize: 'text-base' },
}

const UNIT_LORE_DATABASE: Record<string, Partial<UnitCardData>> = {
  TR: {
    name: 'Silk Trader',
    rarity: 'Common',
    stats: { hp: 2, maxHp: 2, attack: 1, defense: 1, speed: 1, range: 1 },
    abilities: [
      { name: 'Merchant\'s Fortune', description: 'Collect silk to earn gold', cost: 0 },
      { name: 'Safe Journey', description: 'Move towards goal with caution', cost: 0 },
    ],
    lore: {
      title: 'The Humble Merchant',
      backstory: 'Along the ancient Silk Road, traders risked their lives to transport precious goods between East and West. These brave merchants built fortunes and connected civilizations.',
      quote: '"The road is long, but the reward is great."',
      origin: 'Silk Road Caravans, 200 BCE - 1400 CE',
    },
    traits: ['Merchant', 'Cautious', 'Resourceful'],
  },
  H: {
    name: 'Silk Hunter',
    rarity: 'Rare',
    stats: { hp: 3, maxHp: 3, attack: 2, defense: 2, speed: 1, range: 1 },
    abilities: [
      { name: 'Guardian Strike', description: 'Attacks deal bonus damage to thieves', cost: 0 },
      { name: 'Protective Stance', description: 'Defend nearby traders', cost: 0 },
    ],
    lore: {
      title: 'The Caravan Guard',
      backstory: 'Elite warriors hired to protect valuable cargo from bandits. These skilled fighters were the difference between fortune and ruin on the dangerous trade routes.',
      quote: '"While I stand, no thief shall pass."',
      origin: 'Mercenary Guilds of Ancient Persia',
    },
    traits: ['Warrior', 'Loyal', 'Vigilant'],
  },
  TH: {
    name: 'Desert Thief',
    rarity: 'Common',
    stats: { hp: 3, maxHp: 3, attack: 1, defense: 1, speed: 2, range: 1 },
    abilities: [
      { name: 'Quick Strike', description: 'Fast attacks with high evasion', cost: 0 },
      { name: 'Shadow Step', description: 'Move 2 spaces per turn', cost: 0 },
    ],
    lore: {
      title: 'The Swift Shadow',
      backstory: 'Born in the harsh deserts, these outlaws mastered the art of hit-and-run tactics. They strike from the shadows and vanish like the desert wind.',
      quote: '"The desert provides for those quick enough to take."',
      origin: 'Desert Nomad Tribes',
    },
    traits: ['Agile', 'Cunning', 'Opportunist'],
  },
  KT: {
    name: 'King of Thieves',
    rarity: 'Legendary',
    stats: { hp: 3, maxHp: 3, attack: 3, defense: 2, speed: 2, range: 1 },
    abilities: [
      { name: 'Legendary Plunder', description: 'Steal silk from defeated enemies', cost: 0 },
      { name: 'Royal Command', description: 'Lead all thieves with superior tactics', cost: 0 },
      { name: 'Death Mark', description: 'Mark a target for bonus damage', cooldown: 3, cost: 1 },
    ],
    lore: {
      title: 'The Desert\'s Crown',
      backstory: 'Legend tells of a master thief who united all bandit clans under one banner. His cunning and charisma made him both feared and respected across the Silk Road.',
      quote: '"I take what I please, and none can stop me."',
      origin: 'The Unified Bandit Kingdoms, circa 850 CE',
    },
    traits: ['Legendary', 'Leader', 'Master Thief', 'Tactical Genius'],
  },
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

const CardFront: React.FC<{
  unit: UnitCardData
  rarity: typeof RARITY_COLORS[UnitRarity]
  size: typeof SIZE_CONFIGS[keyof typeof SIZE_CONFIGS]
}> = ({ unit, rarity, size }) => {
  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.95), rgba(50, 30, 20, 0.95))',
        border: `3px solid ${rarity.border}`,
        boxShadow: `0 0 20px ${rarity.glow}, inset 0 0 20px rgba(0, 0, 0, 0.5)`,
      }}
    >
      {/* Card header with rarity gradient */}
      <div
        className="h-12 flex items-center justify-between px-4"
        style={{
          background: rarity.gradient,
        }}
      >
        <h3 className="font-bold text-white text-lg truncate">{unit.name}</h3>
        <div className="text-xs font-bold text-white bg-black bg-opacity-30 px-2 py-1 rounded">
          {unit.rarity}
        </div>
      </div>

      {/* Unit portrait */}
      <div className="relative h-48 bg-gradient-to-b from-transparent to-black overflow-hidden">
        <motion.img
          src={unit.imageUrl}
          alt={unit.name}
          className="w-full h-full object-contain p-4"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(212, 175, 55, 0.5))',
          }}
          animate={{
            y: [0, -5, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 3,
            ease: 'easeInOut',
          }}
        />
        {/* Rarity glow effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${rarity.glow}, transparent)`,
          }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
          }}
        />
      </div>

      {/* Stats display */}
      <div className="px-4 py-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          <StatBox label="HP" value={`${unit.stats.hp}/${unit.stats.maxHp}`} color="#4CAF50" />
          <StatBox label="ATK" value={unit.stats.attack} color="#F44336" />
          <StatBox label="DEF" value={unit.stats.defense} color="#2196F3" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <StatBox label="SPD" value={unit.stats.speed} color="#FFC107" />
          <StatBox label="RNG" value={unit.stats.range} color="#9C27B0" />
        </div>
      </div>

      {/* Abilities preview */}
      <div className="px-4 pb-3 space-y-1">
        <h4 className="text-xs font-bold text-yellow-500 mb-2">Abilities</h4>
        {unit.abilities.slice(0, 2).map((ability, idx) => (
          <div key={idx} className="text-xs text-gray-300 bg-black bg-opacity-30 rounded px-2 py-1">
            <span className="font-bold text-yellow-400">{ability.name}:</span> {ability.description.slice(0, 40)}
            {ability.description.length > 40 && '...'}
          </div>
        ))}
      </div>

      {/* Flip hint */}
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 italic">
        Click to view lore
      </div>
    </div>
  )
}

const CardBack: React.FC<{
  unit: UnitCardData
  rarity: typeof RARITY_COLORS[UnitRarity]
  size: typeof SIZE_CONFIGS[keyof typeof SIZE_CONFIGS]
}> = ({ unit, rarity, size }) => {
  return (
    <div
      className="absolute inset-0 rounded-xl overflow-hidden transform rotateY-180"
      style={{
        background: 'linear-gradient(135deg, rgba(20, 10, 10, 0.95), rgba(40, 25, 15, 0.95))',
        border: `3px solid ${rarity.border}`,
        boxShadow: `0 0 20px ${rarity.glow}, inset 0 0 20px rgba(0, 0, 0, 0.5)`,
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Lore header */}
      <div
        className="h-12 flex items-center justify-center px-4"
        style={{
          background: rarity.gradient,
        }}
      >
        <h3 className="font-bold text-white text-lg">{unit.lore.title}</h3>
      </div>

      {/* Lore content */}
      <div className="p-4 space-y-3 h-[calc(100%-3rem)] overflow-y-auto">
        {/* Backstory */}
        <div>
          <h4 className="text-sm font-bold text-yellow-500 mb-2">Backstory</h4>
          <p className="text-xs text-gray-300 leading-relaxed">{unit.lore.backstory}</p>
        </div>

        {/* Quote */}
        {unit.lore.quote && (
          <div className="border-l-4 border-yellow-500 pl-3 py-2 bg-black bg-opacity-30">
            <p className="text-xs italic text-yellow-300">"{unit.lore.quote}"</p>
          </div>
        )}

        {/* Origin */}
        {unit.lore.origin && (
          <div>
            <h4 className="text-xs font-bold text-yellow-500 mb-1">Origin</h4>
            <p className="text-xs text-gray-400">{unit.lore.origin}</p>
          </div>
        )}

        {/* Traits */}
        {unit.traits && unit.traits.length > 0 && (
          <div>
            <h4 className="text-xs font-bold text-yellow-500 mb-2">Traits</h4>
            <div className="flex flex-wrap gap-1">
              {unit.traits.map((trait, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-1 rounded-full bg-yellow-600 bg-opacity-30 text-yellow-200 border border-yellow-600"
                >
                  {trait}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* All abilities */}
        <div>
          <h4 className="text-xs font-bold text-yellow-500 mb-2">Complete Ability List</h4>
          <div className="space-y-2">
            {unit.abilities.map((ability, idx) => (
              <div key={idx} className="bg-black bg-opacity-40 rounded p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-yellow-400">{ability.name}</span>
                  <div className="flex gap-2 text-[10px]">
                    {ability.cooldown !== undefined && (
                      <span className="text-blue-300">CD: {ability.cooldown}</span>
                    )}
                    {ability.cost !== undefined && (
                      <span className="text-green-300">Cost: {ability.cost}</span>
                    )}
                  </div>
                </div>
                <p className="text-[11px] text-gray-300">{ability.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flip hint */}
      <div className="absolute bottom-2 right-2 text-[10px] text-gray-400 italic">
        Click to view stats
      </div>
    </div>
  )
}

const StatBox: React.FC<{ label: string; value: string | number; color: string }> = ({
  label,
  value,
  color,
}) => {
  return (
    <div
      className="text-center py-1 rounded"
      style={{
        background: 'rgba(0, 0, 0, 0.4)',
        border: `1px solid ${color}`,
      }}
    >
      <div className="text-[10px] text-gray-400">{label}</div>
      <div className="text-sm font-bold" style={{ color }}>
        {value}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  isFlipped: controlledFlipped,
  onFlip,
  className = '',
  size = 'medium',
  showStats = true,
  interactive = true,
}) => {
  const [internalFlipped, setInternalFlipped] = useState(false)

  const isFlipped = controlledFlipped !== undefined ? controlledFlipped : internalFlipped

  const handleFlip = useCallback(() => {
    if (!interactive) return
    if (onFlip) {
      onFlip()
    } else {
      setInternalFlipped((prev) => !prev)
    }
  }, [interactive, onFlip])

  const sizeConfig = SIZE_CONFIGS[size]
  const rarityConfig = RARITY_COLORS[unit.rarity]

  return (
    <motion.div
      className={`relative ${className}`}
      style={{
        width: sizeConfig.width,
        height: sizeConfig.height,
        perspective: '1000px',
        cursor: interactive ? 'pointer' : 'default',
      }}
      onClick={handleFlip}
      whileHover={interactive ? { scale: 1.05, y: -5 } : {}}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      {/* 3D flip container */}
      <motion.div
        className="relative w-full h-full"
        style={{
          transformStyle: 'preserve-3d',
        }}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{
          duration: 0.6,
          type: 'spring',
          stiffness: 100,
        }}
      >
        {/* Front side */}
        <CardFront unit={unit} rarity={rarityConfig} size={sizeConfig} />

        {/* Back side */}
        <div style={{ transform: 'rotateY(180deg)' }}>
          <CardBack unit={unit} rarity={rarityConfig} size={sizeConfig} />
        </div>
      </motion.div>

      {/* Hover glow effect */}
      {interactive && (
        <motion.div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            boxShadow: `0 0 30px ${rarityConfig.glow}`,
            opacity: 0,
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
    </motion.div>
  )
}

// ============================================================================
// UNIT CARD GRID
// ============================================================================

interface UnitCardGridProps {
  units: UnitCardData[]
  columns?: number
  size?: 'small' | 'medium' | 'large'
  onCardClick?: (unit: UnitCardData) => void
}

export const UnitCardGrid: React.FC<UnitCardGridProps> = ({
  units,
  columns = 3,
  size = 'medium',
  onCardClick,
}) => {
  return (
    <div
      className="grid gap-6 p-6"
      style={{
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
      }}
    >
      {units.map((unit, idx) => (
        <motion.div
          key={unit.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          onClick={() => onCardClick?.(unit)}
        >
          <UnitCard unit={unit} size={size} />
        </motion.div>
      ))}
    </div>
  )
}

// ============================================================================
// HELPER FUNCTION - Create card data from unit type
// ============================================================================

export const createUnitCardData = (
  unitType: string,
  imageUrl: string,
  customStats?: Partial<UnitCardData['stats']>
): UnitCardData => {
  const baseData = UNIT_LORE_DATABASE[unitType] || {
    name: unitType,
    rarity: 'Common' as UnitRarity,
    stats: { hp: 2, maxHp: 2, attack: 1, defense: 1, speed: 1, range: 1 },
    abilities: [],
    lore: {
      title: 'Unknown Unit',
      backstory: 'No information available.',
    },
    traits: [],
  }

  return {
    id: `${unitType}-${Date.now()}`,
    name: baseData.name || unitType,
    type: unitType,
    imageUrl,
    rarity: baseData.rarity || 'Common',
    stats: { ...baseData.stats, ...customStats } as UnitCardData['stats'],
    abilities: baseData.abilities || [],
    lore: baseData.lore || { title: 'Unknown', backstory: 'No lore available.' },
    traits: baseData.traits,
  }
}

// Export boss data as well
export const BOSS_CARD_DATA: Record<string, Partial<UnitCardData>> = {
  TigerGiry: {
    name: 'Tiger Giry',
    rarity: 'Legendary',
    stats: { hp: 10, maxHp: 10, attack: 4, defense: 3, speed: 2, range: 2 },
    abilities: [
      { name: 'Savage Pounce', description: 'Leap to distant targets and deal massive damage', cooldown: 2 },
      { name: 'Roar of Terror', description: 'Immobilize all units within 2 spaces', cooldown: 3 },
      { name: 'Predator Instinct', description: 'Hunt down wounded units with increased speed', cost: 0 },
    ],
    lore: {
      title: 'The Desert Predator',
      backstory: 'An ancient guardian spirit that manifests as a massive tiger. It protects sacred oases and punishes those who disturb the desert\'s balance.',
      quote: '"The sands remember all who dare to trespass."',
      origin: 'Ancient Desert Mythology',
    },
    traits: ['Boss', 'Legendary', 'Predator', 'Guardian Spirit'],
  },
  SkeletoKing: {
    name: 'Skeleto King',
    rarity: 'Epic',
    stats: { hp: 8, maxHp: 8, attack: 3, defense: 4, speed: 1, range: 1 },
    abilities: [
      { name: 'Undead Legion', description: 'Summon skeleton warriors to fight', cooldown: 4 },
      { name: 'Bone Shield', description: 'Absorb incoming damage with a shield of bones', cooldown: 2 },
      { name: 'Death\'s Embrace', description: 'Drain life from nearby units', cooldown: 3 },
    ],
    lore: {
      title: 'The Immortal Ruler',
      backstory: 'Once a powerful king who sought immortality, he now wanders the Silk Road as an undead overlord, commanding legions of skeletal warriors.',
      quote: '"Death is but the beginning of my reign."',
      origin: 'The Cursed Dynasty, 600 CE',
    },
    traits: ['Boss', 'Epic', 'Undead', 'Necromancer'],
  },
  Murucha: {
    name: 'Murucha',
    rarity: 'Legendary',
    stats: { hp: 12, maxHp: 12, attack: 3, defense: 5, speed: 1, range: 3 },
    abilities: [
      { name: 'Sand Manipulation', description: 'Control the desert sands to trap enemies', cooldown: 2 },
      { name: 'Sandstorm Shield', description: 'Create a protective barrier of swirling sand', cooldown: 3 },
      { name: 'Desert\'s Wrath', description: 'Unleash devastating area damage', cooldown: 4 },
    ],
    lore: {
      title: 'The Sand Elemental',
      backstory: 'A primordial being born from the desert itself. Murucha is the physical manifestation of the desert\'s will, testing those brave enough to cross its vast expanse.',
      quote: '"I am the desert, and the desert is eternal."',
      origin: 'Primordial Desert Spirits',
    },
    traits: ['Boss', 'Legendary', 'Elemental', 'Ancient One'],
  },
}

export default UnitCard
