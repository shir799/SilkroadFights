"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../lib/theme'
import GameBoard from './GameBoard'
import { DiceRoll } from './DiceRoll'
import { BossAnnouncement } from './BossAnnouncement'
import {
  type GameState,
  initializeGame,
  makeAiMove,
  moveUnit,
  getValidMoves,
  useAbility,
  updateGameState,
  type Unit
} from '../lib/gameLogic'
import { BossMonster } from '../lib/types'

interface TFTGameScreenProps {
  gameMode: string
  aiDifficulty: string
}

interface ShopUnit {
  id: string
  type: string
  cost: number
  hp: number
  damage: number
  rarity: 'common' | 'rare' | 'epic'
}

export default function TFTGameScreen({ gameMode, aiDifficulty }: TFTGameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(gameMode))
  const [selectedUnit, setSelectedUnit] = useState<{ row: number, col: number } | null>(null)
  const [validMoves, setValidMoves] = useState<{ row: number, col: number }[]>([])
  const [showDice, setShowDice] = useState(false)
  const [newBoss, setNewBoss] = useState<BossMonster | null>(null)
  const [shownBosses, setShownBosses] = useState<Set<string>>(new Set())
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<Unit | null>(null)
  const [gamePhase, setGamePhase] = useState<'preparation' | 'combat' | 'results'>('preparation')
  const [shopUnits, setShopUnits] = useState<ShopUnit[]>([])
  const [gold, setGold] = useState(10)
  const [level, setLevel] = useState(1)
  const [xp, setXp] = useState(0)
  const isTraderPlayer = gameMode === 'human_vs_ai_thief'

  // Initialize shop
  useEffect(() => {
    refreshShop()
  }, [])

  // AI moves
  useEffect(() => {
    if (!gameState || gamePhase !== 'combat') return

    const latestBoss = gameState.bossMonsters[gameState.bossMonsters.length - 1]
    if (latestBoss && !shownBosses.has(latestBoss.type)) {
      setNewBoss(latestBoss)
      setShownBosses(prev => new Set([...prev, latestBoss.type]))
    }

    if ((isTraderPlayer && gameState.currentPlayer === 'THIEF') ||
        (!isTraderPlayer && gameState.currentPlayer === 'TRADER')) {
      setTimeout(() => {
        if (gameState.traderUnits.length > 0 && gameState.thiefUnits.length > 0) {
          const newState = makeAiMove(gameState, aiDifficulty)
          setGameState(prevState => updateGameState(newState))
        }
        setSelectedUnit(null)
        setValidMoves([])
      }, 1000)
    }
  }, [gameState, isTraderPlayer, aiDifficulty, shownBosses, gamePhase])

  const refreshShop = () => {
    const rarities: ('common' | 'rare' | 'epic')[] = ['common', 'common', 'common', 'rare', 'epic']
    const unitTypes = ['TRADER', 'HUNTER', 'THIEF', 'KINGTHIEF']

    const newShop: ShopUnit[] = Array(5).fill(null).map((_, i) => {
      const rarity = rarities[Math.floor(Math.random() * rarities.length)]
      const type = unitTypes[Math.floor(Math.random() * unitTypes.length)]

      return {
        id: `unit-${Date.now()}-${i}`,
        type,
        cost: rarity === 'common' ? 1 : rarity === 'rare' ? 2 : 3,
        hp: type === 'HUNTER' || type === 'KINGTHIEF' ? 3 : 2,
        damage: type === 'HUNTER' || type === 'KINGTHIEF' ? 2 : 1,
        rarity
      }
    })

    setShopUnits(newShop)
  }

  const buyUnit = (unit: ShopUnit) => {
    if (gold >= unit.cost && bench.length < 8) {
      setGold(gold - unit.cost)
      setBench([...bench, { ...unit, stars: 1 }])
      setShopUnits(shopUnits.filter(u => u.id !== unit.id))
    }
  }

  const handleAbilityUse = (ability: string) => {
    if (!gameState) return
    const newState = useAbility(gameState, ability)
    if (newState !== gameState) {
      setGameState(prevState => updateGameState(newState))
    }
  }

  const handleCellClick = (row: number, col: number) => {
    if (!gameState || gamePhase !== 'combat') return

    if ((isTraderPlayer && gameState.currentPlayer !== 'TRADER') ||
        (!isTraderPlayer && gameState.currentPlayer !== 'THIEF')) {
      return
    }

    if (!selectedUnit) {
      const cell = gameState.board[row][col]
      if ((isTraderPlayer && (cell.includes('TR') || cell.includes('H'))) ||
          (!isTraderPlayer && (cell.includes('TH') || cell.includes('KT')))) {
        setSelectedUnit({ row, col })
        setValidMoves(getValidMoves(gameState, { row, col }))
        const unitDetails = gameState.traderUnits.find(u => u.row === row && u.col === col) ||
                            gameState.thiefUnits.find(u => u.row === row && u.col === col) ||
                            null
        setSelectedUnitDetails(unitDetails)
      }
      return
    }

    if (validMoves.some(move => move.row === row && move.col === col)) {
      const newState = moveUnit(gameState, selectedUnit, { row, col })
      if (newState.combatResult) {
        setShowDice(true)
      }
      setGameState(prevState => updateGameState(newState))
      setSelectedUnit(null)
      setValidMoves([])
      setSelectedUnitDetails(null)
    } else {
      setSelectedUnit(null)
      setValidMoves([])
      setSelectedUnitDetails(null)
    }
  }

  const startCombat = () => {
    setGamePhase('combat')
  }

  const endRound = () => {
    setGamePhase('results')
    setGold(gold + 5) // Income
    setXp(xp + 2) // XP gain

    if (xp + 2 >= level * 2) {
      setLevel(level + 1)
      setXp(0)
    }

    setTimeout(() => {
      setGamePhase('preparation')
      refreshShop()
    }, 3000)
  }

  const renderShopUnit = (unit: ShopUnit) => {
    const colors = {
      TRADER: 'from-amber-400 to-amber-600',
      HUNTER: 'from-blue-400 to-blue-600',
      THIEF: 'from-purple-400 to-purple-600',
      KINGTHIEF: 'from-red-400 to-red-600'
    }

    const rarityColors = {
      common: 'border-gray-400',
      rare: 'border-blue-400',
      epic: 'border-purple-500'
    }

    return (
      <motion.div
        key={unit.id}
        className={`relative p-2 rounded-lg border-2 ${rarityColors[unit.rarity]} bg-gray-800 cursor-pointer`}
        whileHover={{ scale: 1.05, y: -5 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => buyUnit(unit)}
      >
        {/* Unit Image or CSS Placeholder */}
        <div className={`w-16 h-16 mx-auto mb-2 rounded-lg bg-gradient-to-br ${colors[unit.type as keyof typeof colors]} flex items-center justify-center shadow-lg`}>
          <span className="text-white font-bold text-lg">
            {unit.type === 'TRADER' ? 'TR' :
             unit.type === 'HUNTER' ? 'H' :
             unit.type === 'THIEF' ? 'TH' : 'KT'}
          </span>
        </div>

        {/* Stats */}
        <div className="text-center text-xs text-white">
          <p className="font-bold">{unit.type}</p>
          <p className="text-gray-300">HP: {unit.hp} | DMG: {unit.damage}</p>
        </div>

        {/* Cost */}
        <div className="absolute top-1 right-1 bg-yellow-500 text-black font-bold text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
          <span>💰</span>
          <span>{unit.cost}</span>
        </div>

        {/* Rarity indicator */}
        <div className="absolute top-1 left-1 w-2 h-2 rounded-full" style={{
          background: unit.rarity === 'common' ? '#9CA3AF' :
                     unit.rarity === 'rare' ? '#3B82F6' : '#A855F7'
        }} />
      </motion.div>
    )
  }

  const abilities = isTraderPlayer
    ? [
        { name: 'Evasion', cost: 1, icon: '🛡️', description: 'Avoid one incoming attack' },
        { name: 'Sprint', cost: 2, icon: '⚡', description: 'Move 4 tiles this turn' },
        { name: 'Shield Bash', cost: 2, icon: '🪓', description: 'Reduce damage by 1' },
        { name: 'Track Prey', cost: 3, icon: '👁️', description: 'Reveal enemy positions' },
        { name: 'Guard', cost: 1, icon: '🛡️', description: 'Protect adjacent Trader' },
      ]
    : [
        { name: 'Shadow Step', cost: 2, icon: '🌑', description: 'Move through occupied spaces' },
        { name: 'Steal Silk', cost: 3, icon: '🎭', description: 'Steal from adjacent unit' },
        { name: 'Set Trap', cost: 2, icon: '🕸️', description: 'Place immobilizing trap' },
      ]

  return (
    <div className="h-screen w-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 text-white overflow-hidden">
      {/* Top Bar - TFT Style */}
      <div className="flex justify-between items-center p-2 bg-gradient-to-r from-amber-900 to-amber-700 border-b-2 border-amber-500">
        <div className="flex items-center gap-4">
          <div className="text-xl font-bold">SILKROAD FIGHTS</div>
          <div className="flex gap-2">
            <div className="px-3 py-1 bg-black/30 rounded-lg">
              <span className="text-yellow-400 font-bold">Lvl {level}</span>
            </div>
            <div className="px-3 py-1 bg-black/30 rounded-lg flex items-center gap-1">
              <span>💰</span>
              <span className="font-bold">{gold}</span>
            </div>
            <div className="px-3 py-1 bg-black/30 rounded-lg flex items-center gap-1">
              <span>💜</span>
              <span className="font-bold">{gameState.silkCountTrader}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1 bg-black/30 rounded-lg">
            Round {gameState.roundNumber}
          </div>
          <div className={`px-3 py-1 rounded-lg font-bold ${
            gamePhase === 'preparation' ? 'bg-blue-600' :
            gamePhase === 'combat' ? 'bg-red-600' : 'bg-green-600'
          }`}>
            {gamePhase.toUpperCase()}
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-grow flex gap-2 p-2 overflow-hidden">
        {/* Left Sidebar - Abilities */}
        <div className="w-48 flex flex-col gap-2">
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 border-2 border-amber-600">
            <h3 className="text-sm font-bold mb-2 text-amber-400">ABILITIES</h3>
            <div className="space-y-2">
              {abilities.map((ability) => (
                <motion.button
                  key={ability.name}
                  className="w-full p-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-800 text-white font-bold text-xs flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleAbilityUse(ability.name)}
                  disabled={
                    gamePhase !== 'combat' ||
                    (isTraderPlayer && gameState.silkCountTrader < ability.cost) ||
                    (!isTraderPlayer && gameState.silkCountThief < ability.cost)
                  }
                >
                  <span className="text-lg">{ability.icon}</span>
                  <div className="flex-grow text-left">
                    <div className="text-xs font-bold">{ability.name}</div>
                    <div className="text-[10px] text-purple-200">{ability.cost} Silk</div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Unit Details */}
          {selectedUnitDetails && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 border-2 border-blue-500"
            >
              <h3 className="text-sm font-bold mb-2 text-blue-400">SELECTED UNIT</h3>
              <div className="text-xs space-y-1">
                <p className="font-bold">{selectedUnitDetails.type}</p>
                <p>HP: {selectedUnitDetails.hp}/{selectedUnitDetails.maxHp}</p>
                <p>Position: ({selectedUnitDetails.row}, {selectedUnitDetails.col})</p>
              </div>
            </motion.div>
          )}
        </div>

        {/* Center - Game Board */}
        <div className="flex-grow flex flex-col gap-2">
          {/* Board */}
          <div className="flex-grow flex items-center justify-center">
            <div style={{ maxWidth: '600px', maxHeight: '600px', width: '100%' }}>
              <GameBoard
                board={gameState.board}
                selectedUnit={selectedUnit}
                validMoves={validMoves}
                onCellClick={handleCellClick}
                bossMonsters={gameState.bossMonsters}
              />
            </div>
          </div>

          {/* Shop - TFT Style */}
          {gamePhase === 'preparation' && (
            <motion.div
              initial={{ y: 100 }}
              animate={{ y: 0 }}
              className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg p-3 border-2 border-amber-600"
            >
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-amber-400">SHOP</h3>
                <motion.button
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-bold flex items-center gap-1"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={refreshShop}
                >
                  <span>🔄</span>
                  <span>Refresh (2g)</span>
                </motion.button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {shopUnits.map(unit => renderShopUnit(unit))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Sidebar - Game Info */}
        <div className="w-64 flex flex-col gap-2">
          {/* Victory Conditions */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 border-2 border-green-600">
            <h3 className="text-sm font-bold mb-2 text-green-400">VICTORY</h3>
            <div className="text-xs space-y-2">
              {isTraderPlayer ? (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center font-bold text-black">
                      {gameState.goldDelivered}/2
                    </div>
                    <span>Gold Delivered</span>
                  </div>
                  <p className="text-gray-400 text-[10px]">Deliver 2 Gold to win!</p>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center font-bold">
                      {2 - gameState.traderUnits.length}/2
                    </div>
                    <span>Traders Killed</span>
                  </div>
                  <p className="text-gray-400 text-[10px]">Kill all Traders to win!</p>
                </>
              )}
            </div>
          </div>

          {/* Boss Timer */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 border-2 border-orange-600">
            <h3 className="text-sm font-bold mb-2 text-orange-400">BOSS TIMER</h3>
            <div className="text-center">
              <div className="text-3xl font-bold">{10 - (gameState.roundNumber % 10)}</div>
              <div className="text-xs text-gray-400">rounds until boss</div>
              {gameState.bossMonsters.length > 0 && (
                <div className="mt-2 p-2 bg-red-900/50 rounded">
                  <p className="text-xs font-bold text-red-400">BOSS ACTIVE!</p>
                  <p className="text-[10px] text-red-300">{gameState.bossMonsters[0].type}</p>
                </div>
              )}
            </div>
          </div>

          {/* Phase Control */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 border-2 border-blue-600">
            <h3 className="text-sm font-bold mb-2 text-blue-400">CONTROLS</h3>
            {gamePhase === 'preparation' && (
              <motion.button
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-800 hover:from-green-700 hover:to-green-900 rounded-lg font-bold"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startCombat}
              >
                START COMBAT
              </motion.button>
            )}
            {gamePhase === 'combat' && (
              <div className="text-center text-sm text-yellow-400 font-bold animate-pulse">
                BATTLE IN PROGRESS
              </div>
            )}
            {gamePhase === 'results' && (
              <div className="text-center">
                <div className="text-lg font-bold text-green-400 mb-2">VICTORY!</div>
                <div className="text-xs text-gray-400">Preparing next round...</div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg p-3 border-2 border-purple-600">
            <h3 className="text-sm font-bold mb-2 text-purple-400">STATS</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span>Wins:</span>
                <span className="font-bold">{gameState.traderWins}</span>
              </div>
              <div className="flex justify-between">
                <span>Units:</span>
                <span className="font-bold">{isTraderPlayer ? gameState.traderUnits.length : gameState.thiefUnits.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Bosses:</span>
                <span className="font-bold">{shownBosses.size}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dice Roll Overlay */}
      {showDice && gameState.combatResult && (
        <DiceRoll
          attackRoll={gameState.combatResult.attackRoll}
          defenseRoll={gameState.combatResult.defenseRoll}
          attacker={gameState.combatResult.attacker}
          defender={gameState.combatResult.defender}
          attackerHp={gameState.combatResult.attackerHp}
          defenderHp={gameState.combatResult.defenderHp}
          onComplete={() => setShowDice(false)}
        />
      )}

      {/* Boss Announcement */}
      {newBoss && (
        <BossAnnouncement
          bossType={newBoss.type}
          onClose={() => setNewBoss(null)}
        />
      )}

      {/* Victory Screen */}
      {(gameState.traderWins === 2 || gameState.thiefWins === 2) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.5, y: 50 }}
            animate={{ scale: 1, y: 0 }}
            className="bg-gradient-to-b from-gray-800 to-gray-900 p-8 rounded-2xl border-4 border-amber-500 text-center max-w-md"
          >
            <h2 className="text-4xl font-bold mb-4 text-amber-400">
              {gameState.traderWins === 2 ? '🏆 TRADERS WIN! 🏆' : '🏆 THIEVES WIN! 🏆'}
            </h2>
            <p className="text-lg mb-6 text-gray-300">
              {gameState.traderWins === 2
                ? 'The Golden Traders have secured victory!'
                : 'The Shadow Thieves have claimed the Silkroad!'}
            </p>
            <motion.button
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 rounded-lg text-white font-bold text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => window.location.reload()}
            >
              PLAY AGAIN
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}
