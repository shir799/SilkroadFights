"use client"

import { motion } from 'framer-motion'
import { Heart, Shield, Swords, TrendingUp, TrendingDown, Users, Eye } from 'lucide-react'
import { useState } from 'react'

interface EnemyUnit {
  id: string
  type: string
  tier: number
  imageUrl?: string
}

interface EnemyPreviewProps {
  enemyName: string
  enemyHp: number
  maxHp: number
  enemyLevel: number
  winStreak: number
  lossStreak: number
  units: EnemyUnit[]
  boardPower: number
  onViewBoard?: () => void
  compact?: boolean
}

export default function EnemyPreview({
  enemyName,
  enemyHp,
  maxHp,
  enemyLevel,
  winStreak,
  lossStreak,
  units,
  boardPower,
  onViewBoard,
  compact = false
}: EnemyPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const hpPercentage = (enemyHp / maxHp) * 100
  const hpColor = hpPercentage > 60 ? '#10B981' : hpPercentage > 30 ? '#F59E0B' : '#EF4444'

  const getTierColor = (tier: number) => {
    const colors = {
      1: '#9CA3AF',
      2: '#22C55E',
      3: '#3B82F6',
      4: '#A855F7',
      5: '#F59E0B'
    }
    return colors[tier as keyof typeof colors] || colors[1]
  }

  if (compact) {
    return (
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="p-3 rounded-lg bg-gradient-to-br from-red-900/40 to-red-800/40 border-2 border-red-500/50 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-2 border-red-400 flex items-center justify-center text-white font-bold text-sm">
              {enemyName.charAt(0).toUpperCase()}
            </div>
            <div>
              <h4 className="text-white font-bold text-sm">{enemyName}</h4>
              <span className="text-red-300 text-xs">Level {enemyLevel}</span>
            </div>
          </div>
          <Eye className="w-4 h-4 text-red-300" />
        </div>

        <div className="h-2 bg-black/40 rounded-full overflow-hidden mb-2">
          <motion.div
            animate={{ width: `${hpPercentage}%` }}
            className="h-full"
            style={{ background: `linear-gradient(90deg, ${hpColor} 0%, ${hpColor}DD 100%)` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-red-200">
          <span>{enemyHp} HP</span>
          <span>{units.length} Units</span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      className="w-full max-w-sm"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="relative rounded-xl overflow-hidden border-3 border-red-500/50"
        style={{
          background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.9) 0%, rgba(153, 27, 27, 0.9) 100%)',
          boxShadow: '0 8px 30px rgba(239, 68, 68, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        {/* Header */}
        <div className="p-4 bg-gradient-to-r from-red-900/60 to-red-800/60 border-b-2 border-red-600/50">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-600 to-red-800 border-3 border-red-400 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-red-500/50">
                  {enemyName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-red-900 flex items-center justify-center text-white text-xs font-bold">
                  {enemyLevel}
                </div>
              </div>

              <div>
                <h3 className="text-white font-bold text-lg">{enemyName}</h3>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-red-300" />
                  <span className="text-red-200 text-sm">Level {enemyLevel}</span>
                </div>
              </div>
            </div>

            {onViewBoard && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={onViewBoard}
                className="p-2 rounded-lg bg-red-700/50 border border-red-500 hover:bg-red-600/50 transition-colors"
              >
                <Eye className="w-5 h-5 text-white" />
              </motion.button>
            )}
          </div>

          {/* HP Bar */}
          <div className="mb-2">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4" style={{ color: hpColor }} />
                <span className="text-white text-xs font-semibold">Health</span>
              </div>
              <motion.span
                key={enemyHp}
                initial={{ scale: 1.3, color: '#FFD700' }}
                animate={{ scale: 1, color: '#FFFFFF' }}
                className="text-white text-sm font-bold"
              >
                {enemyHp}/{maxHp}
              </motion.span>
            </div>
            <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-red-700/50">
              <motion.div
                animate={{ width: `${hpPercentage}%` }}
                transition={{ duration: 0.5 }}
                className="h-full relative"
                style={{
                  background: `linear-gradient(90deg, ${hpColor} 0%, ${hpColor}DD 100%)`,
                  boxShadow: `0 0 10px ${hpColor}88`
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
              </motion.div>
            </div>
          </div>

          {/* Streaks */}
          <div className="flex gap-2">
            {winStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-900/40 border border-green-500/50">
                <TrendingUp className="w-3 h-3 text-green-400" />
                <span className="text-green-300 text-xs font-bold">{winStreak}W</span>
              </div>
            )}
            {lossStreak > 0 && (
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-red-900/40 border border-red-500/50">
                <TrendingDown className="w-3 h-3 text-red-400" />
                <span className="text-red-300 text-xs font-bold">{lossStreak}L</span>
              </div>
            )}
          </div>
        </div>

        {/* Board Power */}
        <div className="px-4 py-3 bg-red-950/30 border-b-2 border-red-600/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-amber-400" />
              <span className="text-white font-semibold text-sm">Board Power</span>
            </div>
            <motion.span
              key={boardPower}
              initial={{ scale: 1.3, color: '#FFD700' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              className="text-2xl font-bold text-white"
            >
              {boardPower}
            </motion.span>
          </div>
        </div>

        {/* Units Preview */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-red-300" />
              <h4 className="text-white font-semibold text-sm">Enemy Units</h4>
            </div>
            <span className="text-red-300 text-xs">{units.length} total</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {units.map((unit, index) => (
              <motion.div
                key={unit.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className="relative aspect-square rounded-lg overflow-hidden border-2"
                style={{
                  borderColor: getTierColor(unit.tier),
                  boxShadow: `0 2px 10px ${getTierColor(unit.tier)}66`
                }}
              >
                {unit.imageUrl ? (
                  <img
                    src={unit.imageUrl}
                    alt={unit.type}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: getTierColor(unit.tier) }}
                  >
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                )}

                {/* Tier Badge */}
                <div
                  className="absolute top-0 left-0 w-3 h-3 rounded-br"
                  style={{ backgroundColor: getTierColor(unit.tier) }}
                />
              </motion.div>
            ))}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 10 - units.length) }).map((_, index) => (
              <div
                key={`empty-${index}`}
                className="aspect-square rounded-lg border-2 border-dashed border-red-800/30 bg-red-950/20"
              />
            ))}
          </div>
        </div>

        {/* Glow Effect */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{ opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 3, repeat: Infinity }}
          style={{
            background: 'radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.3) 0%, transparent 70%)'
          }}
        />
      </motion.div>

      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </motion.div>
  )
}
