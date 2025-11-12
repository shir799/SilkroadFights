"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  initializeTFTGame,
  buyUnit,
  sellUnit,
  moveUnitToBoard,
  moveUnitToBench,
  rerollShop,
  buyXP,
  simulateCombat,
  endRound,
  startCombat
} from '../../lib/tftEngine'
import { TFTGameState, TFTUnit } from '../../lib/tftTypes'

export default function TFTGame() {
  const [gameState, setGameState] = useState<TFTGameState>(initializeTFTGame())
  const [selectedUnit, setSelectedUnit] = useState<TFTUnit | null>(null)
  const [combatLog, setCombatLog] = useState<string[]>([])
  const [showCombat, setShowCombat] = useState(false)

  // Timer countdown
  useEffect(() => {
    if (gameState.phase === 'shop' && gameState.timer > 0) {
      const interval = setInterval(() => {
        setGameState(prev => ({ ...prev, timer: prev.timer - 1 }))
      }, 1000)
      return () => clearInterval(interval)
    } else if (gameState.phase === 'shop' && gameState.timer === 0) {
      handleStartCombat()
    }
  }, [gameState.phase, gameState.timer])

  const handleBuyUnit = (unitId: string) => {
    setGameState(buyUnit(gameState, unitId))
  }

  const handleSellUnit = (unitId: string) => {
    setGameState(sellUnit(gameState, unitId))
    setSelectedUnit(null)
  }

  const handleReroll = () => {
    setGameState(rerollShop(gameState))
  }

  const handleBuyXP = () => {
    setGameState(buyXP(gameState))
  }

  const handleBoardClick = (x: number, y: number) => {
    if (!selectedUnit || gameState.phase !== 'shop') return

    // Check if unit is from bench
    if (gameState.player.bench.find(u => u.id === selectedUnit.id)) {
      setGameState(moveUnitToBoard(gameState, selectedUnit.id, { x, y }))
      setSelectedUnit(null)
    }
  }

  const handleUnitClick = (unit: TFTUnit) => {
    if (gameState.phase !== 'shop') return
    setSelectedUnit(unit.id === selectedUnit?.id ? null : unit)
  }

  const handleMoveToBench = (unitId: string) => {
    setGameState(moveUnitToBench(gameState, unitId))
    setSelectedUnit(null)
  }

  const handleStartCombat = () => {
    setGameState(startCombat(gameState))
    setShowCombat(true)

    // Simulate combat
    setTimeout(() => {
      const result = simulateCombat(gameState)
      setCombatLog(result.log)

      setTimeout(() => {
        const newState = endRound(gameState, result)
        setGameState(newState)
        setShowCombat(false)
      }, result.log.length * 500 + 2000)
    }, 1000)
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
      case 'common': return 'border-gray-400'
      case 'rare': return 'border-blue-400'
      case 'epic': return 'border-purple-500'
      case 'legendary': return 'border-yellow-500'
      default: return 'border-gray-400'
    }
  }

  const renderUnit = (unit: TFTUnit, context: 'shop' | 'bench' | 'board') => {
    const isSelected = selectedUnit?.id === unit.id
    const canAfford = context === 'shop' && gameState.player.gold >= unit.cost
    const isLocked = context === 'shop' && !canAfford

    return (
      <motion.div
        key={unit.id}
        className={`relative p-2 rounded-lg border-2 ${getRarityColor(unit.rarity)} ${
          isSelected ? 'ring-2 ring-yellow-400' : ''
        } ${isLocked ? 'opacity-50' : 'opacity-100'} cursor-pointer`}
        style={{ background: '#1a1a2e' }}
        whileHover={{ scale: isLocked ? 1 : 1.05 }}
        whileTap={{ scale: isLocked ? 1 : 0.95 }}
        onClick={() => {
          if (context === 'shop') handleBuyUnit(unit.id)
          else handleUnitClick(unit)
        }}
      >
        {/* Stars */}
        <div className="absolute top-1 left-1 flex gap-0.5">
          {Array(unit.stars).fill(0).map((_, i) => (
            <span key={i} className="text-yellow-400 text-xs">⭐</span>
          ))}
        </div>

        {/* Unit Visual */}
        <div className={`w-16 h-16 mx-auto mb-2 rounded-lg bg-gradient-to-br ${getUnitColor(unit.type)} flex items-center justify-center shadow-xl`}>
          <span className="text-white font-bold text-2xl">
            {unit.type === 'TRADER' ? '🏪' :
             unit.type === 'HUNTER' ? '🏹' :
             unit.type === 'THIEF' ? '🗡️' : '👑'}
          </span>
        </div>

        {/* Stats */}
        <div className="text-center text-white">
          <p className="font-bold text-sm">{unit.name}</p>
          <div className="flex justify-around text-xs mt-1">
            <span className="text-red-400">❤️{unit.hp}</span>
            <span className="text-orange-400">⚔️{unit.damage}</span>
          </div>
        </div>

        {/* Cost */}
        {context === 'shop' && (
          <div className="absolute bottom-1 right-1 bg-yellow-500 text-black font-bold text-xs px-2 py-0.5 rounded-full">
            💰{unit.cost}
          </div>
        )}

        {/* Sell button for bench/board */}
        {(context === 'bench' || context === 'board') && isSelected && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full font-bold text-xs"
            onClick={(e) => {
              e.stopPropagation()
              handleSellUnit(unit.id)
            }}
          >
            ✕
          </motion.button>
        )}

        {/* Move to bench button */}
        {context === 'board' && isSelected && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-white rounded text-xs font-bold"
            onClick={(e) => {
              e.stopPropagation()
              handleMoveToBench(unit.id)
            }}
          >
            → Bench
          </motion.button>
        )}
      </motion.div>
    )
  }

  const renderBoard = () => {
    const BOARD_WIDTH = 7
    const BOARD_HEIGHT = 4

    return (
      <div className="relative">
        <div className="grid gap-2" style={{ gridTemplateColumns: `repeat(${BOARD_WIDTH}, 1fr)` }}>
          {Array(BOARD_HEIGHT * BOARD_WIDTH).fill(0).map((_, i) => {
            const x = i % BOARD_WIDTH
            const y = Math.floor(i / BOARD_WIDTH)
            const unit = gameState.player.board.find(u => u.position?.x === x && u.position?.y === y)
            const opponentUnit = gameState.opponent.board.find(u => u.position?.x === x && u.position?.y === (3 - y))

            const isPlayerSide = y >= 2
            const canPlace = isPlayerSide && gameState.phase === 'shop' && selectedUnit && gameState.player.bench.find(u => u.id === selectedUnit.id)

            return (
              <motion.div
                key={`${x}-${y}`}
                className={`aspect-square border-2 rounded-lg ${
                  isPlayerSide ? 'border-green-600/30 bg-green-900/10' : 'border-red-600/30 bg-red-900/10'
                } ${canPlace ? 'hover:bg-green-600/30 cursor-pointer' : ''} flex items-center justify-center relative`}
                onClick={() => canPlace && handleBoardClick(x, y)}
                whileHover={canPlace ? { scale: 1.05 } : {}}
              >
                {unit && renderUnit(unit, 'board')}
                {opponentUnit && !isPlayerSide && (
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center opacity-70">
                    <span className="text-white text-xl">👹</span>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Top Bar */}
        <div className="mb-4 bg-gray-800 rounded-lg p-4 border-2 border-amber-600">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-6">
              <a href="/demos" className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg">
                ← Demos
              </a>
              <div>
                <h1 className="text-2xl font-bold text-white">⚔️ TFT AUTO-BATTLER</h1>
                <p className="text-sm text-gray-400">Round {gameState.round} - {gameState.phase.toUpperCase()}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="text-center">
                <div className="text-yellow-400 text-2xl font-bold">{gameState.player.gold}💰</div>
                <div className="text-xs text-gray-400">Gold</div>
              </div>
              <div className="text-center">
                <div className="text-blue-400 text-2xl font-bold">Lvl {gameState.player.level}</div>
                <div className="text-xs text-gray-400">{gameState.player.xp}/{gameState.player.level * 2} XP</div>
              </div>
              <div className="text-center">
                <div className="text-green-400 text-2xl font-bold">{gameState.player.health}❤️</div>
                <div className="text-xs text-gray-400">Health</div>
              </div>
            </div>
          </div>

          {/* Health bars */}
          <div className="mt-3 grid grid-cols-2 gap-4">
            <div>
              <div className="flex justify-between text-xs text-white mb-1">
                <span>You</span>
                <span>{gameState.player.health}/100</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-600 transition-all duration-500"
                  style={{ width: `${(gameState.player.health / 100) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-white mb-1">
                <span>Opponent</span>
                <span>{gameState.opponent.health}/100</span>
              </div>
              <div className="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-500"
                  style={{ width: `${(gameState.opponent.health / 100) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-12 gap-4">
          {/* Left Side - Shop & Controls */}
          <div className="col-span-3 space-y-4">
            {gameState.phase === 'shop' && (
              <>
                {/* Timer */}
                <div className="bg-gray-800 p-4 rounded-lg border-2 border-blue-500 text-center">
                  <div className="text-4xl font-bold text-white mb-1">{gameState.timer}s</div>
                  <div className="text-sm text-gray-400">Time remaining</div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleStartCombat}
                    className="mt-3 w-full py-2 bg-gradient-to-r from-green-600 to-green-800 text-white font-bold rounded-lg"
                  >
                    ⚔️ FIGHT NOW
                  </motion.button>
                </div>

                {/* Controls */}
                <div className="bg-gray-800 p-4 rounded-lg border-2 border-purple-500">
                  <h3 className="text-white font-bold mb-3">Actions</h3>
                  <div className="space-y-2">
                    <button
                      onClick={handleReroll}
                      disabled={gameState.player.gold < 2}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold rounded-lg"
                    >
                      🔄 Reroll (2g)
                    </button>
                    <button
                      onClick={handleBuyXP}
                      disabled={gameState.player.gold < 4}
                      className="w-full py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold rounded-lg"
                    >
                      📈 Buy XP (4g)
                    </button>
                  </div>
                </div>

                {/* Shop */}
                <div className="bg-gray-800 p-4 rounded-lg border-2 border-amber-600">
                  <h3 className="text-amber-400 font-bold mb-3">🏪 SHOP</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {gameState.shopUnits.map(unit => renderUnit(unit, 'shop'))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Center - Board */}
          <div className="col-span-6">
            <div className="bg-gray-800 p-4 rounded-lg border-2 border-green-500">
              <h3 className="text-white font-bold mb-3 text-center">
                {gameState.phase === 'shop' ? '🎯 ARRANGE YOUR ARMY' : '⚔️ BATTLE!'}
              </h3>
              {renderBoard()}
            </div>
          </div>

          {/* Right Side - Bench */}
          <div className="col-span-3">
            <div className="bg-gray-800 p-4 rounded-lg border-2 border-purple-500">
              <h3 className="text-purple-400 font-bold mb-3">🎒 BENCH ({gameState.player.bench.length}/8)</h3>
              <div className="grid grid-cols-2 gap-2">
                {gameState.player.bench.map(unit => renderUnit(unit, 'bench'))}
                {Array(8 - gameState.player.bench.length).fill(0).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center bg-gray-900/50">
                    <span className="text-gray-600 text-2xl">➕</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Combat Overlay */}
      <AnimatePresence>
        {showCombat && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.8, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gray-800 p-8 rounded-2xl border-4 border-red-500 max-w-2xl w-full mx-4"
            >
              <h2 className="text-4xl font-bold text-center text-white mb-6">⚔️ COMBAT!</h2>

              <div className="bg-gray-900 p-4 rounded-lg max-h-96 overflow-y-auto mb-6">
                {combatLog.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.3 }}
                    className="text-gray-300 py-1 font-mono text-sm"
                  >
                    {log}
                  </motion.div>
                ))}
              </div>

              <div className="text-center text-gray-400">
                <div className="animate-pulse">Processing battle results...</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over */}
      {gameState.gameOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 p-12 rounded-3xl border-4 border-amber-500 text-center"
          >
            <h1 className="text-6xl font-bold mb-4">
              {gameState.winner === 'player' ? '🏆 VICTORY! 🏆' : '💀 DEFEAT 💀'}
            </h1>
            <p className="text-2xl text-gray-300 mb-8">
              Survived {gameState.round} rounds!
            </p>
            <button
              onClick={() => setGameState(initializeTFTGame())}
              className="px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-bold text-xl rounded-lg hover:scale-105 transition-transform"
            >
              ▶️ PLAY AGAIN
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
