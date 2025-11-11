"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Trophy,
  Clock,
  Target,
  AlertTriangle,
  Skull,
  Crown,
  Star,
  TrendingUp,
  Award,
  Flame,
} from 'lucide-react'
import { theme } from '../lib/theme'
import { BossMonster } from '../lib/types'

interface VictoryCondition {
  description: string
  current: number
  target: number
  icon: React.ReactNode
  color: string
}

interface GameHUDProps {
  score: {
    player: number
    enemy: number
  }
  roundNumber: number
  turnNumber: number
  roundTime: number
  maxRoundTime?: number
  victoryConditions: VictoryCondition[]
  activeBosses: BossMonster[]
  playerFaction: string
  enemyFaction: string
  gameStatus: 'playing' | 'victory' | 'defeat'
  streakCount: number
}

const GameHUD: React.FC<GameHUDProps> = ({
  score,
  roundNumber,
  turnNumber,
  roundTime,
  maxRoundTime = 300,
  victoryConditions,
  activeBosses,
  playerFaction,
  enemyFaction,
  gameStatus,
  streakCount,
}) => {
  const [showBossAlert, setShowBossAlert] = useState(false)
  const [alertedBosses, setAlertedBosses] = useState<Set<string>>(new Set())
  const [timeWarning, setTimeWarning] = useState(false)

  // Boss alert system
  useEffect(() => {
    activeBosses.forEach((boss) => {
      const bossKey = `${boss.type}-${boss.position.row}-${boss.position.col}`
      if (!alertedBosses.has(bossKey)) {
        setShowBossAlert(true)
        setAlertedBosses((prev) => new Set([...prev, bossKey]))

        // Hide alert after 5 seconds
        setTimeout(() => setShowBossAlert(false), 5000)
      }
    })
  }, [activeBosses, alertedBosses])

  // Time warning (last 60 seconds)
  useEffect(() => {
    if (maxRoundTime - roundTime <= 60 && roundTime > 0) {
      setTimeWarning(true)
    } else {
      setTimeWarning(false)
    }
  }, [roundTime, maxRoundTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getTimeColor = () => {
    const remaining = maxRoundTime - roundTime
    if (remaining <= 30) return '#FF0000'
    if (remaining <= 60) return '#FFA500'
    return '#4CAF50'
  }

  return (
    <div className="relative w-full">
      {/* Top HUD Bar */}
      <div
        className="flex items-center justify-between px-6 py-3 rounded-lg mb-2"
        style={{
          background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.95), rgba(50, 30, 30, 0.9))',
          border: '2px solid #D4AF37',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.8), inset 0 2px 10px rgba(212, 175, 55, 0.1)',
        }}
      >
        {/* Left: Score Display */}
        <div className="flex items-center gap-6">
          {/* Player Score */}
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">{playerFaction}</div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.3), rgba(30, 60, 180, 0.3))',
                border: '2px solid #4169E1',
              }}>
                <Crown className="w-5 h-5 text-blue-400" />
                <motion.span
                  className="text-2xl font-bold text-white"
                  key={score.player}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  {score.player}
                </motion.span>
              </div>
            </div>

            <span className="text-2xl text-gray-500 font-bold">VS</span>

            {/* Enemy Score */}
            <div className="flex flex-col items-center">
              <div className="text-xs text-gray-400 mb-1">{enemyFaction}</div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg" style={{
                background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.3), rgba(180, 30, 0, 0.3))',
                border: '2px solid #FF4500',
              }}>
                <Skull className="w-5 h-5 text-red-400" />
                <motion.span
                  className="text-2xl font-bold text-white"
                  key={score.enemy}
                  initial={{ scale: 1.5 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring' }}
                >
                  {score.enemy}
                </motion.span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Center: Round & Turn Info */}
        <div className="flex flex-col items-center gap-1">
          <motion.div
            className="flex items-center gap-2 px-4 py-2 rounded-lg"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(139, 69, 19, 0.3))',
              border: '2px solid #D4AF37',
            }}
            animate={{
              boxShadow: [
                '0 0 10px rgba(212, 175, 55, 0.3)',
                '0 0 20px rgba(212, 175, 55, 0.5)',
                '0 0 10px rgba(212, 175, 55, 0.3)',
              ],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            <Award className="w-5 h-5 text-yellow-400" />
            <div className="text-center">
              <div className="text-xs text-yellow-400 font-semibold">EPOCH</div>
              <div className="text-xl font-bold text-white">{roundNumber}</div>
            </div>
          </motion.div>

          <div className="text-xs text-gray-400">
            Turn {turnNumber}
          </div>

          {/* Streak indicator */}
          {streakCount > 0 && (
            <motion.div
              className="flex items-center gap-1 px-2 py-1 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #FF4500, #FF8C00)',
                border: '1px solid #FFD700',
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring' }}
            >
              <Flame className="w-3 h-3 text-yellow-300" />
              <span className="text-xs font-bold text-white">{streakCount} Streak</span>
            </motion.div>
          )}
        </div>

        {/* Right: Timer */}
        <motion.div
          className="flex items-center gap-3 px-4 py-2 rounded-lg"
          style={{
            background: timeWarning
              ? 'linear-gradient(135deg, rgba(255, 0, 0, 0.3), rgba(139, 0, 0, 0.3))'
              : 'linear-gradient(135deg, rgba(76, 175, 80, 0.3), rgba(46, 125, 50, 0.3))',
            border: `2px solid ${getTimeColor()}`,
          }}
          animate={
            timeWarning
              ? {
                  scale: [1, 1.05, 1],
                  boxShadow: [
                    '0 0 10px rgba(255, 0, 0, 0.5)',
                    '0 0 20px rgba(255, 0, 0, 0.8)',
                    '0 0 10px rgba(255, 0, 0, 0.5)',
                  ],
                }
              : {}
          }
          transition={{ repeat: timeWarning ? Infinity : 0, duration: 1 }}
        >
          <Clock className="w-6 h-6" style={{ color: getTimeColor() }} />
          <div className="text-center">
            <div className="text-xs text-gray-400">Time</div>
            <motion.div
              className="text-xl font-bold"
              style={{ color: getTimeColor() }}
              key={roundTime}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {formatTime(maxRoundTime - roundTime)}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Victory Conditions Progress */}
      <div
        className="grid grid-cols-3 gap-3 px-4 py-3 rounded-lg mb-2"
        style={{
          background: 'rgba(26, 15, 15, 0.8)',
          border: '2px solid #D4AF37',
        }}
      >
        <div className="col-span-3 flex items-center gap-2 mb-2">
          <Target className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-bold text-yellow-400">Victory Conditions</span>
        </div>

        {victoryConditions.map((condition, index) => {
          const progress = (condition.current / condition.target) * 100
          const isComplete = condition.current >= condition.target

          return (
            <motion.div
              key={index}
              className="relative px-3 py-2 rounded-lg"
              style={{
                background: isComplete
                  ? `linear-gradient(135deg, ${condition.color}40, ${condition.color}20)`
                  : 'rgba(50, 30, 30, 0.5)',
                border: `2px solid ${isComplete ? condition.color : '#666'}`,
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div style={{ color: condition.color }}>{condition.icon}</div>
                <span className="text-xs text-white font-semibold">
                  {condition.description}
                </span>
                {isComplete && <Star className="w-4 h-4 text-yellow-400 ml-auto" />}
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full"
                  style={{ background: condition.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ type: 'spring', stiffness: 100 }}
                />
              </div>

              <div className="text-xs text-gray-400 mt-1 text-center">
                {condition.current} / {condition.target}
              </div>

              {/* Completion effect */}
              {isComplete && (
                <motion.div
                  className="absolute inset-0 rounded-lg"
                  style={{ background: condition.color }}
                  initial={{ opacity: 0.5 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 1 }}
                />
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Boss Alert System */}
      <AnimatePresence>
        {showBossAlert && activeBosses.length > 0 && (
          <motion.div
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              className="relative px-8 py-6 rounded-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 69, 0, 0.95), rgba(139, 0, 0, 0.95))',
                border: '4px solid #FFD700',
                boxShadow: '0 0 50px rgba(255, 69, 0, 0.8), 0 0 100px rgba(255, 69, 0, 0.5)',
              }}
              animate={{
                boxShadow: [
                  '0 0 50px rgba(255, 69, 0, 0.8)',
                  '0 0 80px rgba(255, 69, 0, 1)',
                  '0 0 50px rgba(255, 69, 0, 0.8)',
                ],
              }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              {/* Warning icon */}
              <motion.div
                className="absolute -top-8 left-1/2 transform -translate-x-1/2"
                animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 0.5 }}
              >
                <AlertTriangle className="w-12 h-12 text-yellow-400" />
              </motion.div>

              <div className="text-center">
                <motion.div
                  className="text-3xl font-black text-yellow-400 mb-2"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  ⚠️ BOSS ALERT ⚠️
                </motion.div>

                <div className="space-y-2">
                  {activeBosses.map((boss, index) => (
                    <motion.div
                      key={index}
                      className="flex items-center gap-3 px-4 py-2 bg-black bg-opacity-50 rounded-lg"
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.2 }}
                    >
                      <img
                        src={
                          boss.type === 'TigerGiry'
                            ? theme.images.tigergiry
                            : boss.type === 'SkeletoKing'
                            ? theme.images.skeletoking
                            : theme.images.murucha
                        }
                        alt={boss.type}
                        className="w-12 h-12 object-contain"
                      />
                      <div className="text-left">
                        <div className="text-xl font-bold text-white">{boss.type}</div>
                        <div className="text-sm text-red-400">
                          HP: {boss.hp}/{boss.maxHp}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  className="mt-4 text-sm text-yellow-200"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  Defeat the boss for valuable rewards!
                </motion.div>
              </div>

              {/* Animated borders */}
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-4 h-4 border-2 border-yellow-400"
                  style={{
                    [['top', 'top', 'bottom', 'bottom'][i]]: -2,
                    [['left', 'right', 'left', 'right'][i]]: -2,
                  }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ repeat: Infinity, duration: 1, delay: i * 0.25 }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Status Overlay */}
      <AnimatePresence>
        {gameStatus !== 'playing' && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              <motion.div
                className={`text-8xl font-black mb-4 ${
                  gameStatus === 'victory' ? 'text-yellow-400' : 'text-red-500'
                }`}
                style={{
                  textShadow:
                    gameStatus === 'victory'
                      ? '0 0 30px rgba(255, 215, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.5)'
                      : '0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.5)',
                }}
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{ repeat: Infinity, duration: 2 }}
              >
                {gameStatus === 'victory' ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
              </motion.div>

              <motion.div
                className="text-2xl text-white mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {gameStatus === 'victory'
                  ? `${playerFaction} has triumphed!`
                  : `${enemyFaction} has won...`}
              </motion.div>

              {/* Fireworks effect for victory */}
              {gameStatus === 'victory' &&
                [...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                    style={{
                      left: '50%',
                      top: '50%',
                    }}
                    animate={{
                      x: [0, (Math.random() - 0.5) * 400],
                      y: [0, (Math.random() - 0.5) * 400],
                      opacity: [1, 0],
                      scale: [1, 0],
                    }}
                    transition={{
                      duration: 2,
                      delay: i * 0.2,
                      repeat: Infinity,
                    }}
                  />
                ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default GameHUD
