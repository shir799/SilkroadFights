"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ShopUnit {
  id: string
  type: 'TRADER' | 'HUNTER' | 'THIEF' | 'KINGTHIEF'
  cost: number
  hp: number
  maxHp: number
  damage: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  abilities: string[]
  level: number
}

interface BenchUnit extends ShopUnit {
  stars: number
}

export default function ShopDemo() {
  const [gold, setGold] = useState(10)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const [shopUnits, setShopUnits] = useState<ShopUnit[]>(generateShop(1))
  const [bench, setBench] = useState<BenchUnit[]>([])
  const [rerollCost] = useState(2)
  const [message, setMessage] = useState('')

  function generateShop(playerLevel: number): ShopUnit[] {
    const unitTypes: ('TRADER' | 'HUNTER' | 'THIEF' | 'KINGTHIEF')[] = ['TRADER', 'HUNTER', 'THIEF', 'KINGTHIEF']
    const rarities: ('common' | 'rare' | 'epic' | 'legendary')[] = [
      'common', 'common', 'common',
      'rare', 'rare',
      'epic',
      'legendary'
    ]

    return Array(5).fill(null).map((_, i) => {
      const type = unitTypes[Math.floor(Math.random() * unitTypes.length)]
      const rarity = rarities[Math.floor(Math.random() * (3 + playerLevel))] || 'common'

      const baseCost = rarity === 'common' ? 1 : rarity === 'rare' ? 2 : rarity === 'epic' ? 3 : 4
      const baseHp = type === 'HUNTER' || type === 'KINGTHIEF' ? 3 : 2
      const baseDamage = type === 'HUNTER' || type === 'KINGTHIEF' ? 2 : 1

      const abilities = getAbilities(type, rarity)

      return {
        id: `unit-${Date.now()}-${i}`,
        type,
        cost: baseCost,
        hp: baseHp,
        maxHp: baseHp,
        damage: baseDamage,
        rarity,
        abilities,
        level: 1
      }
    })
  }

  function getAbilities(type: string, rarity: string): string[] {
    const abilities: Record<string, string[]> = {
      TRADER: ['Gold Carry', 'Trade', 'Sprint'],
      HUNTER: ['Track', 'Shield Bash', 'Guard'],
      THIEF: ['Shadow Step', 'Steal', 'Trap'],
      KINGTHIEF: ['Execute', 'Ambush', 'Poison']
    }

    const baseAbilities = abilities[type] || []

    if (rarity === 'epic' || rarity === 'legendary') {
      return [...baseAbilities, 'Enhanced Stats']
    }

    return baseAbilities.slice(0, rarity === 'rare' ? 2 : 1)
  }

  const buyUnit = (unit: ShopUnit) => {
    if (gold < unit.cost) {
      showMessage('❌ Not enough gold!', 'error')
      return
    }

    if (bench.length >= 8) {
      showMessage('❌ Bench is full!', 'error')
      return
    }

    setGold(gold - unit.cost)
    setBench([...bench, { ...unit, stars: 1 }])
    setShopUnits(shopUnits.filter(u => u.id !== unit.id))
    showMessage(`✅ Bought ${unit.type}!`, 'success')
  }

  const sellUnit = (unit: BenchUnit) => {
    const sellValue = Math.floor(unit.cost * unit.stars * 0.8)
    setGold(gold + sellValue)
    setBench(bench.filter(u => u.id !== unit.id))
    showMessage(`💰 Sold ${unit.type} for ${sellValue}g`, 'success')
  }

  const rerollShop = () => {
    if (gold < rerollCost) {
      showMessage('❌ Not enough gold to reroll!', 'error')
      return
    }

    setGold(gold - rerollCost)
    setShopUnits(generateShop(level))
    showMessage('🔄 Shop refreshed!', 'success')
  }

  const buyXp = () => {
    if (gold < 4) {
      showMessage('❌ Need 4 gold to buy XP!', 'error')
      return
    }

    setGold(gold - 4)
    const newXp = xp + 4

    if (newXp >= level * 2) {
      setLevel(level + 1)
      setXp(0)
      showMessage(`🎉 Level UP! Now level ${level + 1}`, 'success')
      setShopUnits(generateShop(level + 1))
    } else {
      setXp(newXp)
      showMessage(`📈 +4 XP (${newXp}/${level * 2})`, 'success')
    }
  }

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg)
    setTimeout(() => setMessage(''), 2000)
  }

  const getUnitColor = (type: string) => {
    switch (type) {
      case 'TRADER': return 'from-amber-400 to-amber-600'
      case 'HUNTER': return 'from-blue-400 to-blue-600'
      case 'THIEF': return 'from-purple-400 to-purple-600'
      case 'KINGTHIEF': return 'from-red-400 to-red-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'border-gray-400 shadow-gray-400/50'
      case 'rare': return 'border-blue-400 shadow-blue-400/50'
      case 'epic': return 'border-purple-500 shadow-purple-500/50'
      case 'legendary': return 'border-yellow-500 shadow-yellow-500/50'
      default: return 'border-gray-400'
    }
  }

  const renderUnit = (unit: ShopUnit | BenchUnit, isBench: boolean = false) => {
    const isLocked = !isBench && gold < unit.cost

    return (
      <motion.div
        key={unit.id}
        className={`relative p-3 rounded-lg border-2 ${getRarityColor(unit.rarity)} bg-gray-800 cursor-pointer shadow-lg`}
        whileHover={{ scale: isLocked ? 1 : 1.05, y: isLocked ? 0 : -5 }}
        whileTap={{ scale: isLocked ? 1 : 0.95 }}
        onClick={() => isBench ? sellUnit(unit as BenchUnit) : buyUnit(unit)}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isLocked ? 0.5 : 1, scale: 1 }}
      >
        {/* Stars (for bench units) */}
        {isBench && 'stars' in unit && (
          <div className="absolute top-1 left-1 flex gap-0.5">
            {Array((unit as BenchUnit).stars).fill(0).map((_, i) => (
              <span key={i} className="text-yellow-400 text-xs">⭐</span>
            ))}
          </div>
        )}

        {/* Unit Visual - CSS Placeholder */}
        <div className={`w-20 h-20 mx-auto mb-2 rounded-lg bg-gradient-to-br ${getUnitColor(unit.type)} flex items-center justify-center shadow-xl relative overflow-hidden`}>
          {/* Animated background effect */}
          <motion.div
            className="absolute inset-0 bg-white/20"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.1, 0.3]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Unit Label */}
          <span className="text-white font-bold text-xl z-10 drop-shadow-lg">
            {unit.type === 'TRADER' ? '🏪' :
             unit.type === 'HUNTER' ? '🏹' :
             unit.type === 'THIEF' ? '🗡️' : '👑'}
          </span>
        </div>

        {/* Unit Name */}
        <div className="text-center mb-2">
          <p className="font-bold text-white text-sm">{unit.type}</p>
          <p className="text-xs text-gray-400 capitalize">{unit.rarity}</p>
        </div>

        {/* Stats */}
        <div className="flex justify-around text-xs mb-2">
          <div className="text-center">
            <div className="text-red-400 font-bold">{unit.hp}</div>
            <div className="text-gray-400">HP</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">{unit.damage}</div>
            <div className="text-gray-400">DMG</div>
          </div>
        </div>

        {/* Abilities */}
        <div className="space-y-1 mb-2">
          {unit.abilities.map((ability, i) => (
            <div key={i} className="text-[10px] text-purple-300 bg-purple-900/30 px-2 py-0.5 rounded">
              {ability}
            </div>
          ))}
        </div>

        {/* Cost/Sell Value */}
        <div className="absolute bottom-2 right-2 bg-yellow-500 text-black font-bold text-xs px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <span>💰</span>
          <span>{isBench ? Math.floor(unit.cost * ('stars' in unit ? (unit as BenchUnit).stars : 1) * 0.8) : unit.cost}</span>
        </div>

        {/* Locked Overlay */}
        {isLocked && (
          <div className="absolute inset-0 bg-black/60 rounded-lg flex items-center justify-center">
            <span className="text-4xl">🔒</span>
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-4"
        >
          <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg p-4 border-2 border-amber-400 shadow-2xl">
            <h1 className="text-3xl font-bold text-white mb-2 text-center">🏪 SHOP DEMO</h1>
            <p className="text-amber-100 text-sm text-center">TFT-style shop system with CSS placeholders</p>
          </div>
        </motion.div>

        {/* Resources Bar */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gray-800 rounded-lg p-4 mb-4 border border-gray-700 shadow-xl"
        >
          <div className="flex justify-between items-center">
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-yellow-400 text-3xl font-bold">{gold}</div>
                <div className="text-gray-400 text-xs">GOLD</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 text-3xl font-bold">{level}</div>
                <div className="text-gray-400 text-xs">LEVEL</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 text-lg font-bold">{xp}/{level * 2}</div>
                <div className="text-gray-400 text-xs">XP</div>
                <div className="w-32 h-2 bg-gray-700 rounded-full mt-1">
                  <div
                    className="h-full bg-gradient-to-r from-green-400 to-green-600 rounded-full transition-all duration-300"
                    style={{ width: `${(xp / (level * 2)) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={buyXp}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg shadow-lg"
                disabled={gold < 4}
              >
                📈 Buy XP (4g)
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={rerollShop}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg"
                disabled={gold < rerollCost}
              >
                🔄 Reroll ({rerollCost}g)
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Message Toast */}
        <AnimatePresence>
          {message && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg font-bold shadow-2xl z-50 ${
                message.includes('❌') ? 'bg-red-600' : 'bg-green-600'
              } text-white`}
            >
              {message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shop */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800 rounded-lg p-4 mb-4 border border-amber-600 shadow-xl"
        >
          <h2 className="text-xl font-bold text-amber-400 mb-3 flex items-center gap-2">
            <span>🏪</span>
            <span>SHOP</span>
            <span className="text-sm text-gray-400">(Click to buy)</span>
          </h2>
          <div className="grid grid-cols-5 gap-3">
            {shopUnits.map(unit => renderUnit(unit, false))}
          </div>
        </motion.div>

        {/* Bench */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 rounded-lg p-4 border border-purple-600 shadow-xl"
        >
          <h2 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
            <span>🎒</span>
            <span>BENCH</span>
            <span className="text-sm text-gray-400">({bench.length}/8)</span>
            <span className="text-xs text-gray-500">(Click to sell)</span>
          </h2>
          <div className="grid grid-cols-8 gap-2 min-h-[200px]">
            {bench.map(unit => renderUnit(unit, true))}
            {Array(8 - bench.length).fill(0).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="aspect-square border-2 border-dashed border-gray-700 rounded-lg flex items-center justify-center bg-gray-900/50"
              >
                <span className="text-gray-600 text-2xl">➕</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-900/30 border border-blue-500 rounded-lg p-4 mt-4"
        >
          <h3 className="font-bold text-blue-400 mb-2">📋 How to use:</h3>
          <ul className="text-sm text-blue-200 space-y-1">
            <li>✅ Click units in shop to buy them (costs gold)</li>
            <li>✅ Click units on bench to sell them (get gold back)</li>
            <li>✅ Use "Reroll" to refresh the shop</li>
            <li>✅ Use "Buy XP" to level up faster</li>
            <li>✅ Higher level = better units in shop</li>
            <li>✅ All units use CSS placeholders - no images needed!</li>
            <li>✅ Rarity shown by border color and glow</li>
          </ul>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="grid grid-cols-3 gap-4 mt-4"
        >
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl mb-2">🎨</div>
            <h3 className="font-bold text-white mb-1">CSS Placeholders</h3>
            <p className="text-xs text-gray-400">Beautiful units without any image assets</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl mb-2">⚡</div>
            <h3 className="font-bold text-white mb-1">Instant Loading</h3>
            <p className="text-xs text-gray-400">No waiting for images to download</p>
          </div>
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-lg border border-gray-700">
            <div className="text-2xl mb-2">✨</div>
            <h3 className="font-bold text-white mb-1">Smooth Animations</h3>
            <p className="text-xs text-gray-400">Framer Motion powered interactions</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
