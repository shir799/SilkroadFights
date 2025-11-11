"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import GameBoard from '../../components/GameBoard'
import { DiceRoll } from '../../components/DiceRoll'
import { BossAnnouncement } from '../../components/BossAnnouncement'
import { HealthBar } from '../../components/HealthBar'
import {
  type GameState,
  initializeGame,
  moveUnit,
  getValidMoves,
  updateGameState,
  type Unit
} from '../../lib/gameLogic'
import { BossMonster } from '../../lib/types'

export default function BattleDemo() {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame('human_vs_ai_thief'))
  const [selectedUnit, setSelectedUnit] = useState<{ row: number, col: number } | null>(null)
  const [validMoves, setValidMoves] = useState<{ row: number, col: number }[]>([])
  const [showDice, setShowDice] = useState(false)
  const [combatLog, setCombatLog] = useState<string[]>([])
  const [newBoss, setNewBoss] = useState<BossMonster | null>(null)
  const [shownBosses, setShownBosses] = useState<Set<string>>(new Set())

  // Add to combat log
  const addLog = (message: string) => {
    setCombatLog(prev => [...prev.slice(-4), message])
  }

  // Check for new boss
  useEffect(() => {
    if (!gameState) return

    const latestBoss = gameState.bossMonsters[gameState.bossMonsters.length - 1]
    if (latestBoss && !shownBosses.has(latestBoss.type)) {
      setNewBoss(latestBoss)
      setShownBosses(prev => new Set([...prev, latestBoss.type]))
      addLog(`⚠️ Boss ${latestBoss.type} has spawned!`)
    }
  }, [gameState, shownBosses])

  const handleCellClick = (row: number, col: number) => {
    if (!gameState) return

    if (!selectedUnit) {
      const cell = gameState.board[row][col]
      if (cell.includes('TR') || cell.includes('H') || cell.includes('TH') || cell.includes('KT')) {
        setSelectedUnit({ row, col })
        setValidMoves(getValidMoves(gameState, { row, col }))
        addLog(`📍 Selected unit at (${row}, ${col})`)
      }
      return
    }

    if (validMoves.some(move => move.row === row && move.col === col)) {
      const oldPos = selectedUnit
      const newState = moveUnit(gameState, selectedUnit, { row, col })

      addLog(`🎯 Unit moved from (${oldPos.row}, ${oldPos.col}) to (${row}, ${col})`)

      if (newState.combatResult) {
        setShowDice(true)
        addLog(`⚔️ Combat: ${newState.combatResult.attacker} vs ${newState.combatResult.defender}`)
      }

      setGameState(prevState => updateGameState(newState))
      setSelectedUnit(null)
      setValidMoves([])
    } else {
      setSelectedUnit(null)
      setValidMoves([])
    }
  }

  const spawnTestBoss = () => {
    const bossTypes: ('TigerGiry' | 'SkeletoKing' | 'Murucha')[] = ['TigerGiry', 'SkeletoKing', 'Murucha']
    const randomBoss = bossTypes[Math.floor(Math.random() * bossTypes.length)]

    const emptyTiles: { row: number, col: number }[] = []
    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if (gameState.board[row][col] === '') {
          emptyTiles.push({ row, col })
        }
      }
    }

    if (emptyTiles.length > 0) {
      const position = emptyTiles[Math.floor(Math.random() * emptyTiles.length)]

      const boss: BossMonster = {
        type: randomBoss,
        hp: 12,
        maxHp: 12,
        position,
        damage: 3,
        range: 2,
        movementPattern: 'random',
        rewards: {
          silk: 5,
          buffs: ['attack_boost']
        }
      }

      setGameState(prev => ({
        ...prev,
        bossMonsters: [...prev.bossMonsters, boss]
      }))

      addLog(`👹 Test boss ${randomBoss} spawned at (${position.row}, ${position.col})`)
    }
  }

  const triggerTestCombat = () => {
    setShowDice(true)
    const mockResult = {
      winner: 'attacker' as const,
      attackRoll: [4, 5, 3],
      defenseRoll: [2, 4, 1],
      attacker: 'TRADER',
      defender: 'THIEF',
      attackerHp: 2,
      defenderHp: 0
    }
    setGameState(prev => ({ ...prev, combatResult: mockResult }))
    addLog('⚔️ Test combat triggered!')
  }

  const resetDemo = () => {
    setGameState(initializeGame('human_vs_ai_thief'))
    setSelectedUnit(null)
    setValidMoves([])
    setCombatLog([])
    setShownBosses(new Set())
    addLog('🔄 Demo reset!')
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-900 via-purple-900 to-gray-900 p-4">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="max-w-7xl mx-auto mb-4"
      >
        <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-lg p-4 border-2 border-amber-400 shadow-2xl">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">⚔️ BATTLE DEMO</h1>
              <p className="text-amber-100 text-sm">Test combat system, bosses, and CSS placeholders</p>
            </div>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={spawnTestBoss}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg shadow-lg"
              >
                👹 Spawn Boss
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerTestCombat}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg shadow-lg"
              >
                🎲 Test Combat
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={resetDemo}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg"
              >
                🔄 Reset
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel - Stats & Info */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {/* Game Stats */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-blue-500 shadow-xl">
            <h2 className="text-xl font-bold text-blue-400 mb-3 flex items-center gap-2">
              <span>📊</span>
              <span>GAME STATS</span>
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span className="text-gray-300">Round:</span>
                <span className="font-bold text-white text-lg">{gameState.roundNumber}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span className="text-gray-300">Current Player:</span>
                <span className={`font-bold ${gameState.currentPlayer === 'TRADER' ? 'text-amber-400' : 'text-purple-400'}`}>
                  {gameState.currentPlayer}
                </span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span className="text-gray-300">Trader Units:</span>
                <span className="font-bold text-amber-400">{gameState.traderUnits.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span className="text-gray-300">Thief Units:</span>
                <span className="font-bold text-purple-400">{gameState.thiefUnits.length}</span>
              </div>
              <div className="flex justify-between items-center p-2 bg-gray-700/50 rounded">
                <span className="text-gray-300">Bosses Active:</span>
                <span className="font-bold text-red-400">{gameState.bossMonsters.length}</span>
              </div>
            </div>
          </div>

          {/* Resources */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-purple-500 shadow-xl">
            <h2 className="text-xl font-bold text-purple-400 mb-3 flex items-center gap-2">
              <span>💎</span>
              <span>RESOURCES</span>
            </h2>
            <div className="space-y-3">
              <div className="bg-gradient-to-r from-purple-900 to-purple-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-purple-200">Trader Silk</span>
                  <span className="text-2xl font-bold text-purple-300">{gameState.silkCountTrader}</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-300"
                    style={{ width: `${(gameState.silkCountTrader / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div className="bg-gradient-to-r from-amber-900 to-amber-800 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-amber-200">Thief Silk</span>
                  <span className="text-2xl font-bold text-amber-300">{gameState.silkCountThief}</span>
                </div>
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 transition-all duration-300"
                    style={{ width: `${(gameState.silkCountThief / 10) * 100}%` }}
                  />
                </div>
              </div>
              <div className="bg-gradient-to-r from-yellow-900 to-yellow-800 p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-yellow-200">Gold Delivered</span>
                  <span className="text-2xl font-bold text-yellow-300">{gameState.goldDelivered}/2</span>
                </div>
              </div>
            </div>
          </div>

          {/* Combat Log */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-green-500 shadow-xl">
            <h2 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
              <span>📜</span>
              <span>COMBAT LOG</span>
            </h2>
            <div className="space-y-1 font-mono text-xs">
              {combatLog.length === 0 ? (
                <p className="text-gray-500 italic">No events yet...</p>
              ) : (
                combatLog.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="p-2 bg-gray-700/50 rounded text-gray-200"
                  >
                    {log}
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </motion.div>

        {/* Center - Game Board */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-4 border-2 border-amber-500 shadow-xl">
            <h2 className="text-xl font-bold text-amber-400 mb-3 text-center flex items-center justify-center gap-2">
              <span>🎮</span>
              <span>BATTLE ARENA</span>
              <span>🎮</span>
            </h2>
            <div className="max-w-2xl mx-auto">
              <GameBoard
                board={gameState.board}
                selectedUnit={selectedUnit}
                validMoves={validMoves}
                onCellClick={handleCellClick}
                bossMonsters={gameState.bossMonsters}
              />
            </div>

            {/* Instructions */}
            <div className="mt-4 p-3 bg-blue-900/30 border border-blue-500 rounded-lg">
              <h3 className="font-bold text-blue-400 mb-2">📋 Instructions:</h3>
              <ul className="text-sm text-blue-200 space-y-1">
                <li>✅ Click any unit to select it</li>
                <li>✅ Green highlights show valid moves</li>
                <li>✅ Click destination to move</li>
                <li>✅ Combat triggers automatically when units meet</li>
                <li>✅ Use buttons above to spawn bosses or test features</li>
              </ul>
            </div>

            {/* Selected Unit Details */}
            {selectedUnit && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-3 bg-purple-900/30 border border-purple-500 rounded-lg"
              >
                <h3 className="font-bold text-purple-400 mb-2">🎯 Selected Unit:</h3>
                <div className="text-sm text-purple-200">
                  <p>Position: ({selectedUnit.row}, {selectedUnit.col})</p>
                  <p>Valid moves: {validMoves.length}</p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Dice Roll Overlay */}
      <AnimatePresence>
        {showDice && gameState.combatResult && (
          <DiceRoll
            attackRoll={gameState.combatResult.attackRoll}
            defenseRoll={gameState.combatResult.defenseRoll}
            attacker={gameState.combatResult.attacker}
            defender={gameState.combatResult.defender}
            attackerHp={gameState.combatResult.attackerHp}
            defenderHp={gameState.combatResult.defenderHp}
            onComplete={() => {
              setShowDice(false)
              addLog(`✅ Combat complete! Winner: ${gameState.combatResult?.winner}`)
            }}
          />
        )}
      </AnimatePresence>

      {/* Boss Announcement */}
      <AnimatePresence>
        {newBoss && (
          <BossAnnouncement
            bossType={newBoss.type}
            onClose={() => setNewBoss(null)}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="max-w-7xl mx-auto mt-4"
      >
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 text-center">
          <p className="text-gray-400 text-sm">
            🎮 This is a live demo of the combat system. All features are working with CSS placeholders!
          </p>
          <p className="text-gray-500 text-xs mt-1">
            No assets required - everything renders with pure CSS! ✨
          </p>
        </div>
      </motion.div>
    </div>
  )
}
