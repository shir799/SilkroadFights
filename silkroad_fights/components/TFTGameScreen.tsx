"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TFTTopHUD from './TFTTopHUD'
import TFTBattleField from './TFTBattleField'
import TFTShop from './TFTShop'
import TFTBench from './TFTBench'
import TraitPanel from './TraitPanel'
import PhaseIndicator, { type GamePhase } from './PhaseIndicator'
import EnemyPreview from './EnemyPreview'
import TFTItemInventory from './TFTItemInventory'

// Mock data types (replace with actual game state)
interface GameState {
  playerHp: number
  maxHp: number
  gold: number
  level: number
  xp: number
  xpNeeded: number
  roundNumber: number
  winStreak: number
  lossStreak: number
  phase: GamePhase
  timer?: number
}

export default function TFTGameScreen() {
  // Game State
  const [gameState, setGameState] = useState<GameState>({
    playerHp: 100,
    maxHp: 100,
    gold: 50,
    level: 5,
    xp: 8,
    xpNeeded: 10,
    roundNumber: 1,
    winStreak: 2,
    lossStreak: 0,
    phase: 'planning',
    timer: 30
  })

  const [shopLocked, setShopLocked] = useState(false)
  const [selectedBenchSlot, setSelectedBenchSlot] = useState<number | null>(null)
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  // Mock Shop Units
  const [shopUnits] = useState([
    {
      id: 'shop-1',
      type: 'Warrior',
      name: 'Desert Warrior',
      cost: 3,
      tier: 2,
      traits: ['Blade Mastery', 'Desert Guardian'],
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png'
    },
    {
      id: 'shop-2',
      type: 'Assassin',
      name: 'Shadow Thief',
      cost: 4,
      tier: 3,
      traits: ['Shadow Walker', 'Assassin'],
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thief.png-hyVXxRC4m0a3B2MWEG2b2tlzpLkvCe.webp'
    },
    {
      id: 'shop-3',
      type: 'Hunter',
      name: 'Silk Hunter',
      cost: 2,
      tier: 1,
      traits: ['Hunter', 'Caravan'],
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hunter-GF8068loplMRGwOj09mx0j1un6rqYr.png'
    },
    {
      id: 'shop-4',
      type: 'Merchant',
      name: 'Silk Merchant',
      cost: 5,
      tier: 4,
      traits: ['Silk Merchant', 'Mystic'],
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png'
    },
    {
      id: 'shop-5',
      type: 'Guard',
      name: 'Caravan Guard',
      cost: 3,
      tier: 2,
      traits: ['Desert Guardian', 'Caravan'],
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png'
    }
  ])

  // Mock Bench Units
  const [benchUnits] = useState([
    {
      id: 'bench-1',
      type: 'Warrior',
      name: 'Desert Warrior',
      tier: 2,
      level: 1,
      hp: 100,
      maxHp: 100,
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png'
    },
    {
      id: 'bench-2',
      type: 'Hunter',
      name: 'Silk Hunter',
      tier: 1,
      level: 2,
      hp: 80,
      maxHp: 100,
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hunter-GF8068loplMRGwOj09mx0j1un6rqYr.png'
    },
    null,
    null,
    null,
    null,
    null,
    null,
    null
  ])

  // Mock Field Units
  const [fieldUnits] = useState([
    {
      id: 'field-1',
      type: 'Warrior',
      position: { row: 0, col: 2 },
      hp: 100,
      maxHp: 100,
      isEnemy: false,
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png',
      level: 2
    },
    {
      id: 'field-2',
      type: 'Hunter',
      position: { row: 0, col: 4 },
      hp: 80,
      maxHp: 100,
      isEnemy: false,
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hunter-GF8068loplMRGwOj09mx0j1un6rqYr.png',
      level: 1
    },
    {
      id: 'enemy-1',
      type: 'Thief',
      position: { row: 3, col: 3 },
      hp: 90,
      maxHp: 100,
      isEnemy: true,
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thief.png-hyVXxRC4m0a3B2MWEG2b2tlzpLkvCe.webp',
      level: 1
    },
    {
      id: 'enemy-2',
      type: 'Thief',
      position: { row: 3, col: 5 },
      hp: 70,
      maxHp: 100,
      isEnemy: true,
      imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thief.png-hyVXxRC4m0a3B2MWEG2b2tlzpLkvCe.webp',
      level: 2
    }
  ])

  // Mock Traits
  const [traits] = useState([
    {
      name: 'blade-mastery',
      type: 'Blade Mastery',
      currentCount: 4,
      thresholds: [2, 4, 6],
      activeThreshold: 4,
      description: 'Your warriors strike with deadly precision',
      bonuses: ['+10% Attack', '+20% Attack', '+40% Attack']
    },
    {
      name: 'desert-guardian',
      type: 'Desert Guardian',
      currentCount: 2,
      thresholds: [2, 4],
      activeThreshold: 2,
      description: 'Guards gain bonus defense in desert terrain',
      bonuses: ['+15 Defense', '+30 Defense']
    },
    {
      name: 'shadow-walker',
      type: 'Shadow Walker',
      currentCount: 1,
      thresholds: [2, 4],
      activeThreshold: 0,
      description: 'Assassins move through shadows',
      bonuses: ['+20% Evasion', '+40% Evasion']
    }
  ])

  // Mock Items
  const [items] = useState([
    {
      id: 'item-1',
      name: 'Damascus Blade',
      type: 'weapon' as const,
      rarity: 'epic' as const,
      description: 'A legendary blade forged in ancient fires',
      stats: { attack: 25, speed: 5 }
    },
    {
      id: 'item-2',
      name: 'Desert Shield',
      type: 'armor' as const,
      rarity: 'rare' as const,
      description: 'Protection from the harshest desert storms',
      stats: { defense: 30, hp: 50 }
    },
    {
      id: 'item-3',
      name: 'Silk Amulet',
      type: 'accessory' as const,
      rarity: 'legendary' as const,
      description: 'Grants mystical protection to its bearer',
      stats: { hp: 100, defense: 15, speed: 10 }
    },
    {
      id: 'item-4',
      name: 'Health Potion',
      type: 'consumable' as const,
      rarity: 'common' as const,
      description: 'Restores health immediately',
      stats: { hp: 50 }
    }
  ])

  // Mock Enemy Data
  const enemyData = {
    enemyName: 'Shadow Lord',
    enemyHp: 85,
    maxHp: 100,
    enemyLevel: 6,
    winStreak: 3,
    lossStreak: 0,
    boardPower: 2450,
    units: [
      {
        id: 'e1',
        type: 'Assassin',
        tier: 4,
        imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thief.png-hyVXxRC4m0a3B2MWEG2b2tlzpLkvCe.webp'
      },
      {
        id: 'e2',
        type: 'Warrior',
        tier: 3,
        imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png'
      },
      {
        id: 'e3',
        type: 'Assassin',
        tier: 4,
        imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thief.png-hyVXxRC4m0a3B2MWEG2b2tlzpLkvCe.webp'
      },
      {
        id: 'e4',
        type: 'Hunter',
        tier: 2,
        imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hunter-GF8068loplMRGwOj09mx0j1un6rqYr.png'
      },
      {
        id: 'e5',
        type: 'Warrior',
        tier: 3,
        imageUrl: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png'
      }
    ]
  }

  // Timer countdown
  useEffect(() => {
    if (gameState.timer !== undefined && gameState.timer > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({
          ...prev,
          timer: prev.timer! > 0 ? prev.timer! - 1 : 0
        }))
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [gameState.timer])

  // Handlers
  const handleBuyUnit = (unitId: string) => {
    console.log('Buy unit:', unitId)
    // Implement buy logic
  }

  const handleRefresh = () => {
    if (gameState.gold >= 2) {
      console.log('Refresh shop')
      setGameState(prev => ({ ...prev, gold: prev.gold - 2 }))
      // Implement refresh logic
    }
  }

  const handleBuyXP = () => {
    if (gameState.gold >= 4) {
      console.log('Buy XP')
      setGameState(prev => ({
        ...prev,
        gold: prev.gold - 4,
        xp: prev.xp + 4
      }))
    }
  }

  const handlePhaseEnd = () => {
    console.log('Phase ended')
    // Cycle through phases
    const phases: GamePhase[] = ['planning', 'combat', 'planning']
    const currentIndex = phases.indexOf(gameState.phase)
    const nextPhase = phases[(currentIndex + 1) % phases.length]

    setGameState(prev => ({
      ...prev,
      phase: nextPhase,
      timer: nextPhase === 'planning' ? 30 : undefined
    }))
  }

  return (
    <div
      className="h-screen w-full overflow-hidden flex flex-col"
      style={{
        background: 'radial-gradient(ellipse at top, rgba(139, 69, 19, 0.3) 0%, rgba(10, 5, 2, 1) 100%)',
      }}
    >
      {/* Background Texture */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.5"/%3E%3C/svg%3E")',
        }}
      />

      {/* Phase Indicator Overlay */}
      <PhaseIndicator
        phase={gameState.phase}
        timeRemaining={gameState.timer}
        onPhaseEnd={handlePhaseEnd}
      />

      {/* Top HUD */}
      <TFTTopHUD
        playerHp={gameState.playerHp}
        maxHp={gameState.maxHp}
        gold={gameState.gold}
        level={gameState.level}
        xp={gameState.xp}
        xpNeeded={gameState.xpNeeded}
        roundNumber={gameState.roundNumber}
        winStreak={gameState.winStreak}
        lossStreak={gameState.lossStreak}
        timer={gameState.timer}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">

        {/* Left Sidebar - Traits & Items */}
        <div className="w-80 flex flex-col gap-4 overflow-y-auto">
          <div className="rounded-xl overflow-hidden">
            <TraitPanel traits={traits} compact />
          </div>

          <div className="rounded-xl overflow-hidden">
            <TFTItemInventory
              items={items}
              maxSlots={10}
              onItemClick={(id) => setSelectedItem(id)}
              selectedItem={selectedItem}
              compact
            />
          </div>

          <div className="rounded-xl overflow-hidden">
            <EnemyPreview {...enemyData} compact />
          </div>
        </div>

        {/* Center - Battle Field */}
        <div className="flex-1 flex items-center justify-center">
          <TFTBattleField
            units={fieldUnits}
            combatActive={gameState.phase === 'combat'}
            onCellClick={(row, col) => console.log('Cell clicked:', row, col)}
            onUnitClick={(unitId) => console.log('Unit clicked:', unitId)}
          />
        </div>

        {/* Right Sidebar - Enemy Preview */}
        <div className="w-80">
          <EnemyPreview {...enemyData} />
        </div>
      </div>

      {/* Shop */}
      <TFTShop
        units={shopUnits}
        gold={gameState.gold}
        onBuyUnit={handleBuyUnit}
        onRefresh={handleRefresh}
        onBuyXP={handleBuyXP}
        isLocked={shopLocked}
        onToggleLock={() => setShopLocked(!shopLocked)}
        canAffordRefresh={gameState.gold >= 2}
        canAffordXP={gameState.gold >= 4}
      />

      {/* Bench */}
      <TFTBench
        units={benchUnits}
        onUnitClick={(unitId, slotIndex) => {
          console.log('Bench unit clicked:', unitId, slotIndex)
          setSelectedBenchSlot(slotIndex)
        }}
        onSellUnit={(unitId, slotIndex) => {
          console.log('Sell unit:', unitId, slotIndex)
          // Implement sell logic
        }}
        selectedSlot={selectedBenchSlot}
      />
    </div>
  )
}
