"use client"

import { motion } from 'framer-motion'
import { RefreshCw, Lock, LockOpen, TrendingUp, Star, Coins } from 'lucide-react'
import { useState } from 'react'

interface ShopUnit {
  id: string
  type: string
  name: string
  cost: number
  tier: number
  imageUrl?: string
  traits: string[]
}

interface TFTShopProps {
  units: ShopUnit[]
  gold: number
  onBuyUnit: (unitId: string) => void
  onRefresh: () => void
  onBuyXP: () => void
  refreshCost?: number
  xpCost?: number
  isLocked: boolean
  onToggleLock: () => void
  canAffordRefresh: boolean
  canAffordXP: boolean
}

export default function TFTShop({
  units,
  gold,
  onBuyUnit,
  onRefresh,
  onBuyXP,
  refreshCost = 2,
  xpCost = 4,
  isLocked,
  onToggleLock,
  canAffordRefresh,
  canAffordXP
}: TFTShopProps) {
  const [hoveredUnit, setHoveredUnit] = useState<string | null>(null)

  const getTierColor = (tier: number) => {
    const colors = {
      1: 'from-gray-500 to-gray-700 border-gray-400',
      2: 'from-green-500 to-green-700 border-green-400',
      3: 'from-blue-500 to-blue-700 border-blue-400',
      4: 'from-purple-500 to-purple-700 border-purple-400',
      5: 'from-amber-500 to-amber-700 border-amber-400'
    }
    return colors[tier as keyof typeof colors] || colors[1]
  }

  const getTierGlow = (tier: number) => {
    const glows = {
      1: 'rgba(156, 163, 175, 0.4)',
      2: 'rgba(34, 197, 94, 0.4)',
      3: 'rgba(59, 130, 246, 0.4)',
      4: 'rgba(168, 85, 247, 0.4)',
      5: 'rgba(251, 191, 36, 0.6)'
    }
    return glows[tier as keyof typeof glows] || glows[1]
  }

  return (
    <div
      className="w-full px-4 py-3"
      style={{
        background: 'linear-gradient(180deg, rgba(44, 24, 8, 0.95) 0%, rgba(28, 15, 5, 0.95) 100%)',
        borderTop: '2px solid #D97706',
        borderBottom: '2px solid #D97706',
        boxShadow: '0 -4px 20px rgba(217, 119, 6, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-3">

        {/* Shop Units */}
        <div className="grid grid-cols-5 gap-3">
          {units.map((unit, index) => {
            const canAfford = gold >= unit.cost
            const isHovered = hoveredUnit === unit.id

            return (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, y: 20, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: canAfford ? 1.05 : 1, y: canAfford ? -5 : 0 }}
                onMouseEnter={() => setHoveredUnit(unit.id)}
                onMouseLeave={() => setHoveredUnit(null)}
                className="relative cursor-pointer"
                onClick={() => canAfford && onBuyUnit(unit.id)}
              >
                <div
                  className={`relative aspect-square rounded-xl border-3 overflow-hidden bg-gradient-to-br ${getTierColor(unit.tier)}`}
                  style={{
                    boxShadow: isHovered
                      ? `0 0 30px ${getTierGlow(unit.tier)}, 0 8px 20px rgba(0,0,0,0.6)`
                      : `0 4px 15px ${getTierGlow(unit.tier)}`,
                    opacity: canAfford ? 1 : 0.5,
                    filter: canAfford ? 'none' : 'grayscale(50%)'
                  }}
                >
                  {/* Unit Image */}
                  {unit.imageUrl ? (
                    <img
                      src={unit.imageUrl}
                      alt={unit.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Star className="w-12 h-12 text-white" />
                    </div>
                  )}

                  {/* Tier Stars */}
                  <div className="absolute top-1 left-1 flex gap-0.5">
                    {Array.from({ length: unit.tier }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Cost Badge */}
                  <div className="absolute top-1 right-1 flex items-center gap-1 px-2 py-1 rounded-full bg-black/80 border border-amber-500">
                    <Coins className="w-3 h-3 text-amber-400" />
                    <span className="text-white font-bold text-xs">{unit.cost}</span>
                  </div>

                  {/* Unit Name */}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-gradient-to-t from-black/90 to-transparent">
                    <p className="text-white text-xs font-bold text-center truncate">{unit.name}</p>
                  </div>

                  {/* Hover Overlay */}
                  {isHovered && canAfford && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-green-500/30 to-transparent flex items-center justify-center"
                    >
                      <div className="text-white font-bold text-sm bg-black/60 px-3 py-1 rounded-full">
                        Click to Buy
                      </div>
                    </motion.div>
                  )}

                  {/* Cannot Afford Overlay */}
                  {!canAfford && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Lock className="w-8 h-8 text-red-400" />
                    </div>
                  )}

                  {/* Glow Effect on Hover */}
                  {isHovered && canAfford && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{
                        background: `radial-gradient(circle at center, ${getTierGlow(unit.tier)} 0%, transparent 70%)`
                      }}
                    />
                  )}
                </div>

                {/* Traits Tooltip */}
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 px-3 py-2 rounded-lg bg-black/95 border border-amber-500"
                    style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.8)' }}
                  >
                    <p className="text-white font-bold text-sm mb-1">{unit.name}</p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {unit.traits.map(trait => (
                        <span
                          key={trait}
                          className="text-xs px-2 py-0.5 rounded-full bg-amber-600 text-white"
                        >
                          {trait}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-amber-400 text-xs">
                      <Coins className="w-3 h-3" />
                      <span>Cost: {unit.cost} gold</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Shop Controls */}
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <motion.button
            whileHover={{ scale: canAffordRefresh ? 1.05 : 1 }}
            whileTap={{ scale: canAffordRefresh ? 0.95 : 1 }}
            onClick={onRefresh}
            disabled={!canAffordRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 transition-all ${
              canAffordRefresh
                ? 'bg-gradient-to-r from-blue-600 to-blue-800 border-blue-400 text-white hover:shadow-lg hover:shadow-blue-500/50'
                : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${canAffordRefresh ? 'animate-pulse' : ''}`} />
            <span className="text-sm">Refresh</span>
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              <span className="text-xs">{refreshCost}</span>
            </div>
          </motion.button>

          {/* Lock Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleLock}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 transition-all ${
              isLocked
                ? 'bg-gradient-to-r from-amber-600 to-amber-800 border-amber-400 text-white'
                : 'bg-gradient-to-r from-gray-600 to-gray-800 border-gray-400 text-white'
            }`}
            style={{
              boxShadow: isLocked ? '0 0 20px rgba(251, 191, 36, 0.5)' : 'none'
            }}
          >
            {isLocked ? (
              <Lock className="w-4 h-4" />
            ) : (
              <LockOpen className="w-4 h-4" />
            )}
            <span className="text-sm">{isLocked ? 'Locked' : 'Lock Shop'}</span>
          </motion.button>

          {/* Buy XP Button */}
          <motion.button
            whileHover={{ scale: canAffordXP ? 1.05 : 1 }}
            whileTap={{ scale: canAffordXP ? 0.95 : 1 }}
            onClick={onBuyXP}
            disabled={!canAffordXP}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 transition-all ${
              canAffordXP
                ? 'bg-gradient-to-r from-purple-600 to-purple-800 border-purple-400 text-white hover:shadow-lg hover:shadow-purple-500/50'
                : 'bg-gray-700 border-gray-600 text-gray-400 cursor-not-allowed opacity-50'
            }`}
          >
            <TrendingUp className={`w-4 h-4 ${canAffordXP ? 'animate-pulse' : ''}`} />
            <span className="text-sm">Buy XP</span>
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              <span className="text-xs">{xpCost}</span>
            </div>
          </motion.button>

          {/* Gold Display */}
          <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-900/40 to-amber-700/40 border-2 border-amber-500">
            <Coins className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-bold text-white">{gold}</span>
            <span className="text-sm text-amber-300">Gold</span>
          </div>
        </div>
      </div>
    </div>
  )
}
