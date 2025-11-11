"use client"

import { motion } from 'framer-motion'
import { Heart, Coins, Trophy, Zap, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TFTTopHUDProps {
  playerHp: number
  maxHp: number
  gold: number
  level: number
  xp: number
  xpNeeded: number
  roundNumber: number
  winStreak: number
  lossStreak: number
  timer?: number
  playerName?: string
}

export default function TFTTopHUD({
  playerHp,
  maxHp,
  gold,
  level,
  xp,
  xpNeeded,
  roundNumber,
  winStreak,
  lossStreak,
  timer,
  playerName = "Player"
}: TFTTopHUDProps) {
  const [displayGold, setDisplayGold] = useState(gold)
  const [displayXp, setDisplayXp] = useState(xp)

  const hpPercentage = (playerHp / maxHp) * 100
  const xpPercentage = (xp / xpNeeded) * 100

  const hpColor = hpPercentage > 60 ? '#10B981' : hpPercentage > 30 ? '#F59E0B' : '#EF4444'

  // Animate number changes
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayGold(prev => {
        if (prev < gold) return Math.min(prev + 1, gold)
        if (prev > gold) return Math.max(prev - 1, gold)
        return prev
      })
    }, 30)
    return () => clearInterval(interval)
  }, [gold])

  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayXp(prev => {
        if (prev < xp) return Math.min(prev + 1, xp)
        if (prev > xp) return Math.max(prev - 1, xp)
        return prev
      })
    }, 20)
    return () => clearInterval(interval)
  }, [xp])

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full px-6 py-4"
      style={{
        background: 'linear-gradient(180deg, rgba(139, 69, 19, 0.95) 0%, rgba(101, 52, 14, 0.95) 100%)',
        borderBottom: '3px solid #FFD700',
        boxShadow: '0 4px 20px rgba(255, 215, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
    >
      <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6 items-center">

        {/* LEFT SECTION - Player Info */}
        <div className="flex items-center gap-4">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden border-4 border-amber-500 shadow-lg shadow-amber-500/50">
              <div
                className="w-full h-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-bold text-xl"
              >
                {playerName.charAt(0).toUpperCase()}
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-700 border-2 border-amber-900 flex items-center justify-center text-white text-xs font-bold shadow-lg">
              {level}
            </div>
          </motion.div>

          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" style={{ color: hpColor }} />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-white font-bold text-sm">{playerName}</span>
                  <motion.span
                    key={playerHp}
                    initial={{ scale: 1.5, color: '#FFD700' }}
                    animate={{ scale: 1, color: '#FFFFFF' }}
                    className="text-white font-bold text-sm"
                  >
                    {playerHp}/{maxHp} HP
                  </motion.span>
                </div>
                <div className="h-3 bg-black/40 rounded-full overflow-hidden border border-amber-700/50">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${hpPercentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="h-full rounded-full relative"
                    style={{
                      background: `linear-gradient(90deg, ${hpColor} 0%, ${hpColor}DD 100%)`,
                      boxShadow: `0 0 10px ${hpColor}88`
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-400" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-blue-300 text-xs font-semibold">Level {level}</span>
                  <span className="text-blue-200 text-xs">{displayXp}/{xpNeeded} XP</span>
                </div>
                <div className="h-2 bg-black/40 rounded-full overflow-hidden border border-blue-700/50">
                  <motion.div
                    animate={{ width: `${xpPercentage}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full relative"
                    style={{ boxShadow: '0 0 10px rgba(59, 130, 246, 0.6)' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CENTER SECTION - Round & Timer */}
        <div className="flex flex-col items-center justify-center">
          <motion.div
            key={roundNumber}
            initial={{ scale: 1.3, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-amber-300 text-sm font-semibold mb-1">Stage</div>
            <div className="text-white text-4xl font-bold tracking-wider drop-shadow-lg"
                 style={{ textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 2px 4px rgba(0,0,0,0.8)' }}>
              {roundNumber}
            </div>
          </motion.div>

          {timer !== undefined && (
            <motion.div
              animate={{ scale: timer <= 5 ? [1, 1.1, 1] : 1 }}
              transition={{ repeat: timer <= 5 ? Infinity : 0, duration: 0.5 }}
              className="flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-black/40 border border-amber-600/50"
            >
              <Clock className={`w-4 h-4 ${timer <= 5 ? 'text-red-400' : 'text-amber-300'}`} />
              <span className={`font-bold text-lg ${timer <= 5 ? 'text-red-400' : 'text-amber-300'}`}>
                {timer}s
              </span>
            </motion.div>
          )}
        </div>

        {/* RIGHT SECTION - Resources & Streaks */}
        <div className="flex flex-col gap-3">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center justify-end gap-3 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-900/40 to-amber-700/40 border-2 border-amber-500/50"
            style={{ boxShadow: '0 4px 15px rgba(255, 215, 0, 0.2)' }}
          >
            <Coins className="w-6 h-6 text-amber-400" />
            <motion.div
              key={displayGold}
              initial={{ scale: 1.2, color: '#FFD700' }}
              animate={{ scale: 1, color: '#FFFFFF' }}
              className="text-3xl font-bold text-white"
              style={{ textShadow: '0 2px 8px rgba(255, 215, 0, 0.6)' }}
            >
              {displayGold}
            </motion.div>
          </motion.div>

          <div className="flex items-center justify-end gap-2">
            {winStreak > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-900/40 border border-green-500/50"
              >
                <Trophy className="w-4 h-4 text-green-400" />
                <span className="text-green-300 font-bold text-sm">
                  {winStreak} Win{winStreak > 1 ? 's' : ''}
                </span>
              </motion.div>
            )}

            {lossStreak > 0 && (
              <motion.div
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-900/40 border border-red-500/50"
              >
                <span className="text-red-300 font-bold text-sm">
                  {lossStreak} Loss{lossStreak > 1 ? 'es' : ''}
                </span>
              </motion.div>
            )}
          </div>
        </div>
      </div>

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
