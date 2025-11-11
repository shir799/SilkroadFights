"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Shield, Zap, Skull } from 'lucide-react'
import { useState } from 'react'

interface Unit {
  id: string
  type: string
  position: { row: number; col: number }
  hp: number
  maxHp: number
  isEnemy: boolean
  imageUrl?: string
  level?: number
  isAttacking?: boolean
  isDying?: boolean
}

interface TFTBattleFieldProps {
  units: Unit[]
  onCellClick?: (row: number, col: number) => void
  onUnitClick?: (unitId: string) => void
  selectedUnit?: string | null
  validMoves?: { row: number; col: number }[]
  combatActive?: boolean
  victoryState?: 'win' | 'loss' | null
}

export default function TFTBattleField({
  units,
  onCellClick,
  onUnitClick,
  selectedUnit,
  validMoves = [],
  combatActive = false,
  victoryState = null
}: TFTBattleFieldProps) {
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const rows = 4
  const cols = 8

  const getUnitAtPosition = (row: number, col: number) => {
    return units.find(u => u.position.row === row && u.position.col === col)
  }

  const isValidMove = (row: number, col: number) => {
    return validMoves.some(m => m.row === row && m.col === col)
  }

  const getUnitColor = (unit: Unit) => {
    return unit.isEnemy ? 'from-red-600 to-red-800' : 'from-blue-600 to-blue-800'
  }

  const getUnitBorderColor = (unit: Unit) => {
    return unit.isEnemy ? '#EF4444' : '#3B82F6'
  }

  return (
    <div className="relative w-full h-full flex items-center justify-center p-4">
      {/* Combat Background Effect */}
      {combatActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-gradient-to-r from-red-900/20 via-orange-900/20 to-red-900/20 pointer-events-none rounded-2xl"
        />
      )}

      {/* Victory/Defeat Overlay */}
      <AnimatePresence>
        {victoryState && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-2xl"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className={`text-center px-12 py-8 rounded-2xl ${
                victoryState === 'win'
                  ? 'bg-gradient-to-br from-green-600 to-emerald-700'
                  : 'bg-gradient-to-br from-red-600 to-rose-700'
              } border-4 ${
                victoryState === 'win' ? 'border-green-300' : 'border-red-300'
              }`}
              style={{ boxShadow: `0 0 50px ${victoryState === 'win' ? '#10B981' : '#EF4444'}` }}
            >
              {victoryState === 'win' ? (
                <Shield className="w-24 h-24 text-white mx-auto mb-4" />
              ) : (
                <Skull className="w-24 h-24 text-white mx-auto mb-4" />
              )}
              <h2 className="text-5xl font-bold text-white mb-2">
                {victoryState === 'win' ? 'VICTORY!' : 'DEFEAT'}
              </h2>
              <p className="text-xl text-white/90">
                {victoryState === 'win' ? 'Your forces have triumphed!' : 'Your forces have fallen...'}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Battle Grid */}
      <div
        className="relative w-full max-w-5xl aspect-[2/1] rounded-2xl overflow-hidden border-4 border-amber-600/50"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(139, 69, 19, 0.4) 0%, rgba(101, 52, 14, 0.6) 100%)',
          boxShadow: 'inset 0 0 100px rgba(0, 0, 0, 0.5), 0 0 50px rgba(255, 215, 0, 0.2)'
        }}
      >
        {/* Desert Sand Texture Overlay */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4"/%3E%3C/svg%3E")',
          }}
        />

        {/* Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-4">
          {Array.from({ length: rows * cols }).map((_, idx) => {
            const row = Math.floor(idx / cols)
            const col = idx % cols
            const unit = getUnitAtPosition(row, col)
            const isValid = isValidMove(row, col)
            const isHovered = hoveredCell?.row === row && hoveredCell?.col === col
            const isSelected = unit?.id === selectedUnit

            return (
              <motion.div
                key={`${row}-${col}`}
                className="relative border border-amber-800/30 cursor-pointer transition-all"
                whileHover={{ scale: 1.05, zIndex: 10 }}
                onClick={() => onCellClick?.(row, col)}
                onMouseEnter={() => setHoveredCell({ row, col })}
                onMouseLeave={() => setHoveredCell(null)}
                style={{
                  background: isValid
                    ? 'radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%)'
                    : isHovered
                    ? 'radial-gradient(circle, rgba(251, 191, 36, 0.2) 0%, transparent 70%)'
                    : 'transparent'
                }}
              >
                {/* Valid Move Indicator */}
                {isValid && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="w-3 h-3 rounded-full bg-green-400"
                      style={{ boxShadow: '0 0 20px rgba(34, 197, 94, 0.8)' }}
                    />
                  </motion.div>
                )}

                {/* Unit */}
                <AnimatePresence>
                  {unit && (
                    <motion.div
                      key={unit.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{
                        scale: isSelected ? 1.15 : 1,
                        rotate: 0,
                        y: unit.isAttacking ? [0, -10, 0] : 0
                      }}
                      exit={{ scale: 0, rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="absolute inset-1 cursor-pointer group"
                      onClick={(e) => {
                        e.stopPropagation()
                        onUnitClick?.(unit.id)
                      }}
                    >
                      <div
                        className={`relative w-full h-full rounded-lg bg-gradient-to-br ${getUnitColor(unit)} border-2 overflow-hidden`}
                        style={{
                          borderColor: isSelected ? '#FFD700' : getUnitBorderColor(unit),
                          boxShadow: isSelected
                            ? '0 0 30px #FFD700, 0 0 10px #FFD700'
                            : `0 4px 15px ${unit.isEnemy ? '#EF444466' : '#3B82F666'}`
                        }}
                      >
                        {/* Unit Image */}
                        {unit.imageUrl ? (
                          <img
                            src={unit.imageUrl}
                            alt={unit.type}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Swords className="w-8 h-8 text-white" />
                          </div>
                        )}

                        {/* Level Badge */}
                        {unit.level && unit.level > 1 && (
                          <div className="absolute top-0 right-0 w-6 h-6 bg-purple-600 border-2 border-white rounded-bl-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{unit.level}</span>
                          </div>
                        )}

                        {/* HP Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/60">
                          <motion.div
                            initial={{ width: '100%' }}
                            animate={{ width: `${(unit.hp / unit.maxHp) * 100}%` }}
                            transition={{ duration: 0.3 }}
                            className="h-full"
                            style={{
                              background: unit.hp / unit.maxHp > 0.5
                                ? 'linear-gradient(90deg, #10B981 0%, #34D399 100%)'
                                : unit.hp / unit.maxHp > 0.25
                                ? 'linear-gradient(90deg, #F59E0B 0%, #FBBF24 100%)'
                                : 'linear-gradient(90deg, #EF4444 0%, #F87171 100%)'
                            }}
                          />
                        </div>

                        {/* Attack Animation */}
                        {unit.isAttacking && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                            transition={{ duration: 0.5 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Zap className="w-12 h-12 text-yellow-400" />
                          </motion.div>
                        )}

                        {/* Dying Animation */}
                        {unit.isDying && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="absolute inset-0 bg-black/80 flex items-center justify-center"
                          >
                            <Skull className="w-10 h-10 text-red-500" />
                          </motion.div>
                        )}

                        {/* Hover Glow */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Grid Coordinates (for debugging) */}
                {/* <div className="absolute top-0 left-0 text-xs text-white/30 p-1">{row},{col}</div> */}
              </motion.div>
            )
          })}
        </div>

        {/* Center Divider */}
        <div className="absolute inset-y-0 left-1/2 w-1 -translate-x-1/2 pointer-events-none">
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-full h-full bg-gradient-to-b from-transparent via-amber-500 to-transparent"
            style={{ boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)' }}
          />
        </div>

        {/* Combat Active Indicator */}
        {combatActive && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-4 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full bg-gradient-to-r from-red-600 to-orange-600 border-2 border-yellow-400"
            style={{ boxShadow: '0 0 30px rgba(239, 68, 68, 0.8)' }}
          >
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-white animate-pulse" />
              <span className="text-white font-bold text-sm">COMBAT ACTIVE</span>
              <Swords className="w-5 h-5 text-white animate-pulse" />
            </div>
          </motion.div>
        )}

        {/* Side Labels */}
        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-blue-900/80 border border-blue-500">
          <span className="text-blue-200 font-bold text-xs">YOUR SIDE</span>
        </div>
        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-red-900/80 border border-red-500">
          <span className="text-red-200 font-bold text-xs">ENEMY SIDE</span>
        </div>
      </div>
    </div>
  )
}
