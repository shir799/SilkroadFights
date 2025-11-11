"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

type GamePhase = 'preparation' | 'combat' | 'results'

interface Player {
  name: string
  health: number
  maxHealth: number
  units: number
  gold: number
  level: number
}

export default function GameFlowExample() {
  const [phase, setPhase] = useState<GamePhase>('preparation')
  const [round, setRound] = useState(1)
  const [timer, setTimer] = useState(30)
  const [player, setPlayer] = useState<Player>({
    name: 'Player',
    health: 100,
    maxHealth: 100,
    units: 3,
    gold: 5,
    level: 1
  })
  const [opponent, setOpponent] = useState<Player>({
    name: 'Opponent',
    health: 100,
    maxHealth: 100,
    units: 3,
    gold: 5,
    level: 1
  })
  const [combatLog, setCombatLog] = useState<string[]>([])
  const [roundResult, setRoundResult] = useState<'win' | 'loss' | 'draw' | null>(null)

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(t => t - 1)
      }, 1000)
      return () => clearInterval(interval)
    } else {
      if (phase === 'preparation') {
        startCombat()
      }
    }
  }, [timer, phase])

  const startCombat = () => {
    setPhase('combat')
    setTimer(0)
    setCombatLog([])
    simulateCombat()
  }

  const simulateCombat = () => {
    const log: string[] = []

    // Simulate 5 combat events
    setTimeout(() => {
      log.push('⚔️ Combat begins!')
      setCombatLog([...log])
    }, 500)

    setTimeout(() => {
      log.push('🗡️ Player unit attacks!')
      log.push('❤️ Opponent takes 15 damage')
      setCombatLog([...log])
    }, 1500)

    setTimeout(() => {
      log.push('🛡️ Opponent unit counterattacks!')
      log.push('💔 Player takes 12 damage')
      setCombatLog([...log])
    }, 2500)

    setTimeout(() => {
      log.push('💥 Player unit uses special ability!')
      log.push('🔥 Critical hit! 25 damage')
      setCombatLog([...log])
    }, 3500)

    setTimeout(() => {
      log.push('✅ Combat complete!')
      const result = Math.random() > 0.5 ? 'win' : 'loss'
      setRoundResult(result)

      if (result === 'win') {
        log.push('🎉 Victory! Opponent defeated')
        setOpponent(prev => ({ ...prev, health: Math.max(0, prev.health - 20) }))
        setPlayer(prev => ({ ...prev, gold: prev.gold + 3 }))
      } else {
        log.push('💀 Defeat! Player lost')
        setPlayer(prev => ({ ...prev, health: Math.max(0, prev.health - 20) }))
      }

      setCombatLog([...log])
      showResults()
    }, 4500)
  }

  const showResults = () => {
    setTimeout(() => {
      setPhase('results')
      setTimer(10)
    }, 1000)
  }

  const nextRound = () => {
    setPhase('preparation')
    setRound(round + 1)
    setTimer(30)
    setRoundResult(null)
    setCombatLog([])

    // Income and XP
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold + 5,
      level: round % 3 === 0 ? prev.level + 1 : prev.level
    }))
  }

  const renderPhaseIndicator = () => {
    const phases = ['preparation', 'combat', 'results']
    const currentIndex = phases.indexOf(phase)

    return (
      <div className="flex items-center justify-center gap-4 mb-6">
        {phases.map((p, i) => (
          <div key={p} className="flex items-center">
            <motion.div
              className={`px-6 py-3 rounded-lg font-bold text-lg ${
                i === currentIndex
                  ? 'bg-gradient-to-r from-blue-600 to-blue-800 text-white scale-110 shadow-2xl'
                  : i < currentIndex
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-700 text-gray-400'
              }`}
              animate={{
                scale: i === currentIndex ? [1, 1.05, 1] : 1,
              }}
              transition={{
                duration: 1,
                repeat: i === currentIndex ? Infinity : 0
              }}
            >
              {i + 1}. {p.toUpperCase()}
              {i === currentIndex && phase === 'preparation' && timer > 0 && (
                <span className="ml-2 text-yellow-400">({timer}s)</span>
              )}
            </motion.div>
            {i < phases.length - 1 && (
              <div className={`w-12 h-1 mx-2 ${i < currentIndex ? 'bg-green-600' : 'bg-gray-700'}`} />
            )}
          </div>
        ))}
      </div>
    )
  }

  const renderPlayerCard = (p: Player, isPlayer: boolean) => (
    <motion.div
      className={`bg-gradient-to-br ${
        isPlayer ? 'from-blue-900 to-blue-800' : 'from-red-900 to-red-800'
      } p-6 rounded-xl border-2 ${
        isPlayer ? 'border-blue-500' : 'border-red-500'
      } shadow-2xl`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-2xl font-bold text-white mb-1">{p.name}</h3>
          <div className="text-sm text-gray-300">Level {p.level}</div>
        </div>
        <div className="text-4xl">
          {isPlayer ? '👤' : '🤖'}
        </div>
      </div>

      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Health</span>
          <span className="font-bold">{p.health}/{p.maxHealth}</span>
        </div>
        <div className="w-full h-4 bg-gray-700 rounded-full overflow-hidden">
          <motion.div
            className={`h-full ${
              p.health > 60 ? 'bg-green-500' :
              p.health > 30 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${(p.health / p.maxHealth) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-black/30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-yellow-400">{p.gold}</div>
          <div className="text-xs text-gray-400">Gold</div>
        </div>
        <div className="bg-black/30 p-3 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-400">{p.units}</div>
          <div className="text-xs text-gray-400">Units</div>
        </div>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-bold text-white mb-2">🎮 GAME FLOW EXAMPLE</h1>
          <p className="text-gray-400">Complete game loop: Preparation → Combat → Results</p>
          <div className="mt-4 inline-block bg-amber-600 px-6 py-2 rounded-full">
            <span className="text-white font-bold text-xl">Round {round}</span>
          </div>
        </motion.div>

        {/* Phase Indicator */}
        {renderPhaseIndicator()}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left - Player */}
          <div>
            {renderPlayerCard(player, true)}
          </div>

          {/* Center - Phase Content */}
          <div className="lg:col-span-1">
            <AnimatePresence mode="wait">
              {phase === 'preparation' && (
                <motion.div
                  key="preparation"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gray-800 p-6 rounded-xl border-2 border-blue-500 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-blue-400 mb-4 flex items-center gap-2">
                    <span>🛒</span>
                    <span>PREPARATION PHASE</span>
                  </h2>

                  <div className="space-y-4">
                    <div className="bg-blue-900/30 p-4 rounded-lg border border-blue-500">
                      <h3 className="font-bold text-white mb-2">Actions Available:</h3>
                      <ul className="space-y-2 text-sm text-blue-200">
                        <li>✅ Buy units from shop</li>
                        <li>✅ Arrange units on board</li>
                        <li>✅ Upgrade abilities</li>
                        <li>✅ Reroll shop (costs 2g)</li>
                        <li>✅ Buy XP to level up</li>
                      </ul>
                    </div>

                    <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500">
                      <h3 className="font-bold text-yellow-400 mb-2">⏰ Time Remaining:</h3>
                      <div className="text-4xl font-bold text-center text-white">
                        {timer}s
                      </div>
                      <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-yellow-500"
                          animate={{ width: `${(timer / 30) * 100}%` }}
                        />
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={startCombat}
                      className="w-full py-4 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg shadow-xl text-lg"
                    >
                      ⚔️ START COMBAT
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {phase === 'combat' && (
                <motion.div
                  key="combat"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gray-800 p-6 rounded-xl border-2 border-red-500 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-red-400 mb-4 flex items-center gap-2">
                    <span>⚔️</span>
                    <span>COMBAT PHASE</span>
                  </h2>

                  <div className="space-y-4">
                    {/* Battle Animation */}
                    <div className="bg-red-900/30 p-6 rounded-lg border border-red-500 min-h-[200px] flex items-center justify-center">
                      <motion.div
                        className="text-6xl"
                        animate={{
                          scale: [1, 1.2, 1],
                          rotate: [0, 5, -5, 0]
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity
                        }}
                      >
                        ⚔️
                      </motion.div>
                    </div>

                    {/* Combat Log */}
                    <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 max-h-[250px] overflow-y-auto">
                      <h3 className="font-bold text-white mb-2">📜 Combat Log:</h3>
                      <div className="space-y-1 font-mono text-xs">
                        {combatLog.map((log, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-gray-300 bg-gray-800 p-2 rounded"
                          >
                            {log}
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="text-center text-yellow-400 font-bold animate-pulse">
                      BATTLE IN PROGRESS...
                    </div>
                  </div>
                </motion.div>
              )}

              {phase === 'results' && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-gray-800 p-6 rounded-xl border-2 border-green-500 shadow-2xl"
                >
                  <h2 className="text-2xl font-bold text-green-400 mb-4 flex items-center gap-2">
                    <span>📊</span>
                    <span>RESULTS PHASE</span>
                  </h2>

                  <div className="space-y-4">
                    {/* Result Banner */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`p-6 rounded-lg text-center ${
                        roundResult === 'win'
                          ? 'bg-gradient-to-r from-green-600 to-green-800'
                          : 'bg-gradient-to-r from-red-600 to-red-800'
                      }`}
                    >
                      <div className="text-6xl mb-2">
                        {roundResult === 'win' ? '🏆' : '💀'}
                      </div>
                      <div className="text-3xl font-bold text-white">
                        {roundResult === 'win' ? 'VICTORY!' : 'DEFEAT!'}
                      </div>
                    </motion.div>

                    {/* Rewards */}
                    <div className="bg-yellow-900/30 p-4 rounded-lg border border-yellow-500">
                      <h3 className="font-bold text-yellow-400 mb-3">🎁 Rewards:</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                          <span className="text-gray-300">Gold Earned:</span>
                          <span className="font-bold text-yellow-400">+5 💰</span>
                        </div>
                        <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                          <span className="text-gray-300">Round:</span>
                          <span className="font-bold text-white">{round} → {round + 1}</span>
                        </div>
                        {round % 3 === 0 && (
                          <div className="flex justify-between items-center bg-black/30 p-2 rounded">
                            <span className="text-gray-300">Level Up:</span>
                            <span className="font-bold text-green-400">+1 📈</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Next Round Countdown */}
                    <div className="text-center">
                      <div className="text-gray-400 mb-2">Next round in:</div>
                      <div className="text-4xl font-bold text-white">{timer}s</div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={nextRound}
                      className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold rounded-lg shadow-xl text-lg"
                    >
                      ▶️ NEXT ROUND
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right - Opponent */}
          <div>
            {renderPlayerCard(opponent, false)}
          </div>
        </div>

        {/* Info Panel */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 bg-blue-900/30 border border-blue-500 rounded-lg p-6"
        >
          <h3 className="font-bold text-blue-400 mb-3 text-lg">📚 Game Flow Explanation:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl mb-2">1️⃣</div>
              <h4 className="font-bold text-white mb-2">PREPARATION</h4>
              <p className="text-gray-400">
                30 seconds to buy units, arrange board, and prepare strategy. Shop refreshes each round.
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl mb-2">2️⃣</div>
              <h4 className="font-bold text-white mb-2">COMBAT</h4>
              <p className="text-gray-400">
                Units auto-battle based on positioning and stats. Watch combat log for details.
              </p>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="text-2xl mb-2">3️⃣</div>
              <h4 className="font-bold text-white mb-2">RESULTS</h4>
              <p className="text-gray-400">
                View outcome, collect rewards, and prepare for next round. First to 0 HP loses!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Feature Badges */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 flex flex-wrap justify-center gap-3"
        >
          {[
            { icon: '🎨', text: 'CSS Only Design' },
            { icon: '⚡', text: 'Smooth Transitions' },
            { icon: '🔄', text: 'Auto Combat' },
            { icon: '📊', text: 'Live Stats' },
            { icon: '🏆', text: 'Victory Conditions' },
            { icon: '💰', text: 'Economy System' }
          ].map((badge, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="bg-gradient-to-r from-purple-600 to-purple-800 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg"
            >
              <span className="mr-2">{badge.icon}</span>
              <span>{badge.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
