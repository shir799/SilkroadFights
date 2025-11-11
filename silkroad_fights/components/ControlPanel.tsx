"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../lib/theme'
import { Unit } from '../lib/types'
import { Sword, Shield, Zap, Eye, MapPin } from 'lucide-react'

interface ControlPanelProps {
  playerUnits: Unit[]
  selectedUnit: Unit | null
  onUnitSelect: (unit: Unit) => void
  silkCount: number
  goldCount: number
  abilities: Array<{
    name: string
    cost: number
    description: string
    cooldown?: number
    hotkey: string
  }>
  onAbilityUse: (abilityName: string) => void
  boardState: string[][]
  isPlayerTurn: boolean
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  playerUnits,
  selectedUnit,
  onUnitSelect,
  silkCount,
  goldCount,
  abilities,
  onAbilityUse,
  boardState,
  isPlayerTurn,
}) => {
  const [previousSilk, setPreviousSilk] = useState(silkCount)
  const [previousGold, setPreviousGold] = useState(goldCount)
  const [silkAnimation, setSilkAnimation] = useState(false)
  const [goldAnimation, setGoldAnimation] = useState(false)

  // Animate resource changes
  useEffect(() => {
    if (silkCount !== previousSilk) {
      setSilkAnimation(true)
      setPreviousSilk(silkCount)
      setTimeout(() => setSilkAnimation(false), 500)
    }
  }, [silkCount, previousSilk])

  useEffect(() => {
    if (goldCount !== previousGold) {
      setGoldAnimation(true)
      setPreviousGold(goldCount)
      setTimeout(() => setGoldAnimation(false), 500)
    }
  }, [goldCount, previousGold])

  // Keyboard hotkey handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlayerTurn) return

      // Unit selection hotkeys (1, 2, 3)
      const unitIndex = parseInt(e.key) - 1
      if (unitIndex >= 0 && unitIndex < playerUnits.length) {
        onUnitSelect(playerUnits[unitIndex])
        return
      }

      // Ability hotkeys (Q, W, E, R)
      const abilityHotkeys = ['q', 'w', 'e', 'r']
      const abilityIndex = abilityHotkeys.indexOf(e.key.toLowerCase())
      if (abilityIndex >= 0 && abilities[abilityIndex]) {
        const ability = abilities[abilityIndex]
        if (silkCount >= ability.cost && !ability.cooldown) {
          onAbilityUse(ability.name)
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [playerUnits, abilities, silkCount, isPlayerTurn, onUnitSelect, onAbilityUse])

  const getUnitIcon = (type: string) => {
    if (type.includes('TR')) return theme.images.trader
    if (type.includes('H') && !type.includes('TH')) return theme.images.hunter
    if (type.includes('KT')) return theme.images.kingThief
    if (type.includes('TH')) return theme.images.thief
    return ''
  }

  const getUnitStats = (unit: Unit) => {
    const attack = unit.type.includes('H') ? 3 : unit.type.includes('KT') ? 3 : 2
    const defense = unit.type.includes('TR') ? 1 : 2
    const movement = unit.type.includes('TH') ? 3 : 2
    return { attack, defense, movement }
  }

  return (
    <div className="flex flex-col h-full gap-3 p-4 bg-gradient-to-b from-gray-900 to-gray-800 border-l-4 border-yellow-600 rounded-lg shadow-2xl">
      {/* Resource Display */}
      <div className="grid grid-cols-2 gap-3">
        {/* Silk Counter */}
        <motion.div
          className="relative p-3 rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.8), rgba(101, 67, 33, 0.8))',
            border: '2px solid #D4AF37',
          }}
          animate={silkAnimation ? { scale: [1, 1.1, 1] } : {}}
        >
          <div className="flex items-center gap-2">
            <img src={theme.images.silk} alt="Silk" className="w-8 h-8 object-contain" />
            <div>
              <div className="text-xs text-yellow-400 font-semibold">Silk</div>
              <motion.div
                className="text-2xl font-bold text-white"
                key={silkCount}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {silkCount}
              </motion.div>
            </div>
          </div>
          {silkAnimation && (
            <motion.div
              className="absolute inset-0 bg-yellow-400"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.div>

        {/* Gold Counter */}
        <motion.div
          className="relative p-3 rounded-lg overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(218, 165, 32, 0.3))',
            border: '2px solid #FFD700',
          }}
          animate={goldAnimation ? { scale: [1, 1.1, 1] } : {}}
        >
          <div className="flex items-center gap-2">
            <img src={theme.images.gold} alt="Gold" className="w-8 h-8 object-contain" />
            <div>
              <div className="text-xs text-yellow-200 font-semibold">Gold</div>
              <motion.div
                className="text-2xl font-bold text-yellow-400"
                key={goldCount}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
              >
                {goldCount}
              </motion.div>
            </div>
          </div>
          {goldAnimation && (
            <motion.div
              className="absolute inset-0 bg-yellow-300"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.div>
      </div>

      {/* Unit Selection Panel */}
      <div
        className="flex-grow rounded-lg p-3"
        style={{
          background: 'rgba(26, 15, 15, 0.8)',
          border: '2px solid #D4AF37',
        }}
      >
        <h3 className="text-sm font-bold text-yellow-400 mb-2 flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Your Units
          {!isPlayerTurn && (
            <span className="text-xs text-gray-400 ml-auto">(Enemy Turn)</span>
          )}
        </h3>

        <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
          {playerUnits.map((unit, index) => {
            const isSelected = selectedUnit?.row === unit.row && selectedUnit?.col === unit.col
            const stats = getUnitStats(unit)
            const hotkey = (index + 1).toString()

            return (
              <motion.div
                key={`${unit.row}-${unit.col}`}
                className={`relative p-2 rounded-lg cursor-pointer transition-all ${
                  isSelected ? 'ring-2 ring-yellow-400' : ''
                } ${isPlayerTurn ? 'hover:bg-gray-700' : 'opacity-50 cursor-not-allowed'}`}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(139, 69, 19, 0.3))'
                    : 'rgba(139, 69, 19, 0.2)',
                  border: isSelected ? '2px solid #D4AF37' : '1px solid rgba(212, 175, 55, 0.3)',
                }}
                onClick={() => isPlayerTurn && onUnitSelect(unit)}
                whileHover={isPlayerTurn ? { scale: 1.02 } : {}}
                whileTap={isPlayerTurn ? { scale: 0.98 } : {}}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Hotkey indicator */}
                <div className="absolute top-1 right-1 w-5 h-5 bg-gray-800 border border-yellow-500 rounded flex items-center justify-center">
                  <span className="text-[10px] font-bold text-yellow-400">{hotkey}</span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Unit portrait */}
                  <div className="relative">
                    <img
                      src={getUnitIcon(unit.type)}
                      alt={unit.type}
                      className="w-12 h-12 object-contain rounded"
                      style={{
                        filter: isSelected
                          ? 'drop-shadow(0 0 8px rgba(212, 175, 55, 1))'
                          : 'drop-shadow(0 0 4px rgba(0, 0, 0, 0.5))',
                      }}
                    />
                    {isSelected && (
                      <motion.div
                        className="absolute inset-0 border-2 border-yellow-400 rounded"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 1 }}
                      />
                    )}
                  </div>

                  {/* Unit stats */}
                  <div className="flex-grow">
                    <div className="text-xs font-semibold text-white">
                      {unit.type.replace(/\d+/g, '')}
                    </div>

                    {/* HP Bar */}
                    <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden my-1">
                      <motion.div
                        className="h-full"
                        style={{
                          background:
                            unit.hp > unit.maxHp * 0.6
                              ? theme.colors.health.good
                              : unit.hp > unit.maxHp * 0.3
                              ? theme.colors.health.medium
                              : theme.colors.health.low,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                      />
                    </div>

                    {/* Stats icons */}
                    <div className="flex gap-2 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5" title="Attack">
                        <Sword className="w-3 h-3 text-red-400" />
                        {stats.attack}
                      </span>
                      <span className="flex items-center gap-0.5" title="Defense">
                        <Shield className="w-3 h-3 text-blue-400" />
                        {stats.defense}
                      </span>
                      <span className="flex items-center gap-0.5" title="Movement">
                        <Zap className="w-3 h-3 text-yellow-400" />
                        {stats.movement}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status effects */}
                {(unit.buffs.length > 0 || unit.debuffs.length > 0) && (
                  <div className="flex gap-1 mt-1">
                    {unit.buffs.map((buff, i) => (
                      <div
                        key={i}
                        className="px-1 py-0.5 bg-green-600 text-white text-[8px] rounded"
                        title={buff.type}
                      >
                        {buff.type.substring(0, 3)}
                      </div>
                    ))}
                    {unit.debuffs.map((debuff, i) => (
                      <div
                        key={i}
                        className="px-1 py-0.5 bg-red-600 text-white text-[8px] rounded"
                        title={debuff.type}
                      >
                        {debuff.type.substring(0, 3)}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {playerUnits.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-8">
            No units available
          </div>
        )}
      </div>

      {/* Mini-map */}
      <div
        className="rounded-lg p-2"
        style={{
          background: 'rgba(26, 15, 15, 0.8)',
          border: '2px solid #D4AF37',
        }}
      >
        <h3 className="text-xs font-bold text-yellow-400 mb-2 flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          Mini-map
        </h3>
        <div className="grid grid-cols-8 gap-[1px] bg-gray-900 p-1 rounded aspect-square">
          {boardState.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const isPlayerUnit = playerUnits.some(
                (u) => u.row === rowIndex && u.col === colIndex
              )
              const hasEnemy =
                cell.includes('TH') || cell.includes('KT') || cell.includes('TR') || cell.includes('H')
              const hasBoss = cell.includes('BM')
              const hasGold = cell.includes('Z')
              const hasSilk = cell.includes('SI')

              let bgColor = 'rgba(26, 15, 15, 0.6)'
              if (isPlayerUnit) bgColor = 'rgba(100, 200, 255, 0.8)'
              else if (hasBoss) bgColor = 'rgba(255, 69, 0, 0.8)'
              else if (hasEnemy) bgColor = 'rgba(255, 100, 100, 0.8)'
              else if (hasGold) bgColor = 'rgba(255, 215, 0, 0.6)'
              else if (hasSilk) bgColor = 'rgba(255, 255, 255, 0.6)'

              return (
                <motion.div
                  key={`${rowIndex}-${colIndex}`}
                  className="aspect-square rounded-[1px]"
                  style={{ background: bgColor }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: (rowIndex * 8 + colIndex) * 0.005 }}
                  whileHover={{ scale: 1.5, zIndex: 10 }}
                />
              )
            })
          )}
        </div>
      </div>

      {/* Hotkeys legend */}
      <div
        className="text-[10px] text-gray-400 p-2 rounded"
        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
      >
        <div className="flex justify-between">
          <span>Units: 1-3</span>
          <span>Abilities: Q,W,E,R</span>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(212, 175, 55, 0.5);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(212, 175, 55, 0.8);
        }
      `}</style>
    </div>
  )
}

export default ControlPanel
