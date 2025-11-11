"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, X, Star } from 'lucide-react'

interface BenchUnit {
  id: string
  type: string
  name: string
  tier: number
  imageUrl?: string
  level?: number
  hp: number
  maxHp: number
}

interface TFTBenchProps {
  units: (BenchUnit | null)[]
  maxSlots?: number
  onUnitClick: (unitId: string, slotIndex: number) => void
  onSellUnit: (unitId: string, slotIndex: number) => void
  selectedSlot?: number | null
  draggingUnit?: string | null
}

export default function TFTBench({
  units,
  maxSlots = 9,
  onUnitClick,
  onSellUnit,
  selectedSlot = null,
  draggingUnit = null
}: TFTBenchProps) {
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
      1: 'rgba(156, 163, 175, 0.3)',
      2: 'rgba(34, 197, 94, 0.3)',
      3: 'rgba(59, 130, 246, 0.3)',
      4: 'rgba(168, 85, 247, 0.3)',
      5: 'rgba(251, 191, 36, 0.5)'
    }
    return glows[tier as keyof typeof glows] || glows[1]
  }

  // Fill empty slots
  const filledUnits = [...units]
  while (filledUnits.length < maxSlots) {
    filledUnits.push(null)
  }

  return (
    <div
      className="w-full px-4 py-3"
      style={{
        background: 'linear-gradient(180deg, rgba(58, 30, 10, 0.9) 0%, rgba(38, 20, 7, 0.9) 100%)',
        borderTop: '2px solid #92400E',
        boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5), 0 -2px 10px rgba(146, 64, 14, 0.2)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-amber-300 font-bold text-sm">BENCH</h3>
          <span className="text-amber-400/70 text-xs">
            {units.filter(u => u !== null).length} / {maxSlots}
          </span>
        </div>

        <div className="grid grid-cols-9 gap-2">
          {filledUnits.map((unit, index) => {
            const isSelected = selectedSlot === index
            const isEmpty = unit === null

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: isEmpty ? 1 : 1.05, y: isEmpty ? 0 : -3 }}
                className="relative aspect-square cursor-pointer group"
                onClick={() => unit && onUnitClick(unit.id, index)}
              >
                {isEmpty ? (
                  // Empty Slot
                  <motion.div
                    animate={{
                      borderColor: draggingUnit ? ['#92400E', '#F59E0B', '#92400E'] : '#92400E'
                    }}
                    transition={{ duration: 1, repeat: draggingUnit ? Infinity : 0 }}
                    className="w-full h-full rounded-lg border-2 border-dashed bg-gradient-to-br from-amber-950/30 to-amber-900/30 flex items-center justify-center"
                    style={{
                      boxShadow: draggingUnit ? '0 0 20px rgba(245, 158, 11, 0.3)' : 'none'
                    }}
                  >
                    <Plus className="w-6 h-6 text-amber-800/50" />
                  </motion.div>
                ) : (
                  // Unit Slot
                  <AnimatePresence>
                    <motion.div
                      key={unit.id}
                      layoutId={unit.id}
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      exit={{ scale: 0, rotate: 180, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="relative w-full h-full"
                    >
                      <div
                        className={`relative w-full h-full rounded-lg border-3 overflow-hidden bg-gradient-to-br ${getTierColor(unit.tier)}`}
                        style={{
                          boxShadow: isSelected
                            ? '0 0 25px #FFD700, 0 4px 15px rgba(0,0,0,0.6)'
                            : `0 4px 12px ${getTierGlow(unit.tier)}`,
                          borderColor: isSelected ? '#FFD700' : undefined
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
                            <Star className="w-8 h-8 text-white" />
                          </div>
                        )}

                        {/* Level Badge */}
                        {unit.level && unit.level > 1 && (
                          <div className="absolute top-0 right-0 w-5 h-5 bg-purple-600 border-2 border-white rounded-bl-lg flex items-center justify-center">
                            <span className="text-white text-xs font-bold">{unit.level}</span>
                          </div>
                        )}

                        {/* Tier Stars */}
                        <div className="absolute top-1 left-1 flex gap-0.5">
                          {Array.from({ length: unit.tier }).map((_, i) => (
                            <Star key={i} className="w-2 h-2 fill-amber-400 text-amber-400" />
                          ))}
                        </div>

                        {/* HP Bar */}
                        <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/60">
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

                        {/* Selected Glow */}
                        {isSelected && (
                          <motion.div
                            className="absolute inset-0 pointer-events-none"
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            style={{
                              background: 'radial-gradient(circle at center, rgba(255, 215, 0, 0.4) 0%, transparent 70%)'
                            }}
                          />
                        )}

                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      </div>

                      {/* Sell Button (appears on hover) */}
                      <motion.button
                        initial={{ opacity: 0, scale: 0 }}
                        whileHover={{ scale: 1.1 }}
                        animate={{ opacity: 0 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSellUnit(unit.id, index)
                        }}
                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 border-2 border-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                        style={{ boxShadow: '0 2px 8px rgba(220, 38, 38, 0.6)' }}
                      >
                        <X className="w-3 h-3 text-white" />
                      </motion.button>

                      {/* Unit Name Tooltip (appears on hover) */}
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-black/95 border border-amber-500 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20"
                        style={{ boxShadow: '0 4px 15px rgba(0,0,0,0.8)' }}
                      >
                        <p className="text-white text-xs font-bold">{unit.name}</p>
                        <p className="text-amber-400 text-xs">
                          {unit.hp}/{unit.maxHp} HP
                        </p>
                      </motion.div>
                    </motion.div>
                  </AnimatePresence>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* Bench Info */}
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-amber-400/70">
          <span>Click to select • Drag to move • Hover & click X to sell</span>
        </div>
      </div>
    </div>
  )
}
