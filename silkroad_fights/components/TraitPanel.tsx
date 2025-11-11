"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Shield, Zap, Crown, Target, Users, Sparkles } from 'lucide-react'
import { useState } from 'react'

interface Trait {
  name: string
  type: string
  currentCount: number
  thresholds: number[]
  activeThreshold: number
  description: string
  bonuses: string[]
  icon?: string
}

interface TraitPanelProps {
  traits: Trait[]
  compact?: boolean
}

export default function TraitPanel({ traits, compact = false }: TraitPanelProps) {
  const [hoveredTrait, setHoveredTrait] = useState<string | null>(null)

  const getTraitIcon = (type: string) => {
    const icons = {
      'Blade Mastery': Swords,
      'Desert Guardian': Shield,
      'Shadow Walker': Zap,
      'Silk Merchant': Crown,
      'Hunter': Target,
      'Caravan': Users,
      'Mystic': Sparkles
    }
    return icons[type as keyof typeof icons] || Swords
  }

  const getTraitColor = (isActive: boolean) => {
    return isActive
      ? 'from-amber-500 to-amber-700 border-amber-400'
      : 'from-gray-600 to-gray-800 border-gray-600'
  }

  const getTraitGlow = (isActive: boolean) => {
    return isActive ? 'rgba(251, 191, 36, 0.5)' : 'transparent'
  }

  const getProgressColor = (trait: Trait) => {
    if (trait.activeThreshold > 0) return '#F59E0B' // Amber for active
    const progress = trait.currentCount / trait.thresholds[0]
    if (progress >= 0.8) return '#10B981' // Green close to threshold
    if (progress >= 0.5) return '#3B82F6' // Blue moderate progress
    return '#6B7280' // Gray low progress
  }

  const sortedTraits = [...traits].sort((a, b) => {
    // Active traits first
    if (a.activeThreshold > 0 && b.activeThreshold === 0) return -1
    if (a.activeThreshold === 0 && b.activeThreshold > 0) return 1
    // Then by progress
    return b.currentCount - a.currentCount
  })

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        {sortedTraits.map((trait, index) => {
          const isActive = trait.activeThreshold > 0
          const Icon = getTraitIcon(trait.type)

          return (
            <motion.div
              key={trait.name}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              onMouseEnter={() => setHoveredTrait(trait.name)}
              onMouseLeave={() => setHoveredTrait(null)}
              className="relative"
            >
              <motion.div
                whileHover={{ scale: 1.1 }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r ${getTraitColor(isActive)} border-2 cursor-pointer`}
                style={{
                  boxShadow: isActive ? `0 0 20px ${getTraitGlow(isActive)}` : 'none'
                }}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className={`text-sm font-bold ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {trait.type}
                </span>
                <span className={`text-xs font-bold ${isActive ? 'text-amber-200' : 'text-gray-500'}`}>
                  ({trait.currentCount}/{trait.thresholds[trait.thresholds.length - 1]})
                </span>
              </motion.div>

              {/* Tooltip */}
              {hoveredTrait === trait.name && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-50 top-full mt-2 left-1/2 -translate-x-1/2 w-64 px-4 py-3 rounded-lg bg-black/95 border-2 border-amber-500"
                  style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.9)' }}
                >
                  <p className="text-white font-bold text-sm mb-1">{trait.type}</p>
                  <p className="text-amber-300 text-xs mb-2">{trait.description}</p>
                  <div className="space-y-1">
                    {trait.thresholds.map((threshold, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className={trait.activeThreshold >= threshold ? 'text-green-400' : 'text-gray-400'}>
                          ({threshold}) {trait.bonuses[i]}
                        </span>
                        {trait.activeThreshold >= threshold && (
                          <span className="text-green-400">✓</span>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    )
  }

  return (
    <div
      className="w-full px-4 py-3 space-y-3"
      style={{
        background: 'linear-gradient(180deg, rgba(44, 24, 8, 0.95) 0%, rgba(28, 15, 5, 0.95) 100%)',
        borderTop: '2px solid #92400E',
        borderBottom: '2px solid #92400E',
        boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <h3 className="text-amber-300 font-bold text-sm mb-3">ACTIVE TRAITS</h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          <AnimatePresence>
            {sortedTraits.map((trait, index) => {
              const isActive = trait.activeThreshold > 0
              const Icon = getTraitIcon(trait.type)
              const isHovered = hoveredTrait === trait.name

              return (
                <motion.div
                  key={trait.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onMouseEnter={() => setHoveredTrait(trait.name)}
                  onMouseLeave={() => setHoveredTrait(null)}
                  className="relative"
                >
                  <motion.div
                    whileHover={{ scale: 1.05, y: -2 }}
                    className={`relative p-3 rounded-lg bg-gradient-to-br ${getTraitColor(isActive)} border-2 cursor-pointer overflow-hidden`}
                    style={{
                      boxShadow: isActive
                        ? `0 4px 20px ${getTraitGlow(isActive)}, inset 0 1px 0 rgba(255,255,255,0.1)`
                        : '0 2px 8px rgba(0,0,0,0.3)'
                    }}
                  >
                    {/* Background Pattern */}
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.3) 0%, transparent 50%),
                                         radial-gradient(circle at 80% 50%, rgba(255,255,255,0.3) 0%, transparent 50%)`
                      }}
                    />

                    {/* Content */}
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-amber-300' : 'text-gray-400'}`} />
                        <span className={`font-bold text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
                          {trait.type}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-xs font-semibold ${isActive ? 'text-amber-200' : 'text-gray-500'}`}>
                            {trait.currentCount} / {trait.thresholds[trait.thresholds.length - 1]}
                          </span>
                          {isActive && (
                            <span className="text-xs font-bold text-green-400">ACTIVE</span>
                          )}
                        </div>
                        <div className="h-2 bg-black/40 rounded-full overflow-hidden">
                          {trait.thresholds.map((threshold, i) => (
                            <motion.div
                              key={i}
                              initial={{ width: 0 }}
                              animate={{
                                width: `${Math.min((trait.currentCount / threshold) * 100, 100) / trait.thresholds.length}%`
                              }}
                              transition={{ duration: 0.5, delay: i * 0.1 }}
                              className="h-full inline-block"
                              style={{
                                background: trait.activeThreshold >= threshold
                                  ? 'linear-gradient(90deg, #F59E0B 0%, #FCD34D 100%)'
                                  : 'linear-gradient(90deg, #6B7280 0%, #9CA3AF 100%)'
                              }}
                            />
                          ))}
                        </div>
                      </div>

                      {/* Thresholds */}
                      <div className="space-y-1">
                        {trait.thresholds.map((threshold, i) => (
                          <div
                            key={i}
                            className={`text-xs flex items-center justify-between ${
                              trait.activeThreshold >= threshold
                                ? 'text-green-400 font-semibold'
                                : 'text-gray-500'
                            }`}
                          >
                            <span>({threshold})</span>
                            {trait.activeThreshold >= threshold && (
                              <motion.span
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-green-400"
                              >
                                ✓
                              </motion.span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Active Glow */}
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        style={{
                          background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
                        }}
                      />
                    )}
                  </motion.div>

                  {/* Detailed Tooltip */}
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute z-50 top-full mt-2 left-0 w-72 px-4 py-3 rounded-lg bg-black/95 border-2 border-amber-500"
                      style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.9)' }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5 text-amber-400" />
                        <p className="text-white font-bold text-sm">{trait.type}</p>
                      </div>
                      <p className="text-amber-300 text-xs mb-3">{trait.description}</p>
                      <div className="space-y-2">
                        {trait.thresholds.map((threshold, i) => (
                          <div
                            key={i}
                            className={`p-2 rounded ${
                              trait.activeThreshold >= threshold ? 'bg-green-900/40' : 'bg-gray-900/40'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-bold ${
                                trait.activeThreshold >= threshold ? 'text-green-400' : 'text-gray-400'
                              }`}>
                                {threshold} Units
                              </span>
                              {trait.activeThreshold >= threshold && (
                                <span className="text-green-400 text-xs">ACTIVE</span>
                              )}
                            </div>
                            <p className={`text-xs ${
                              trait.activeThreshold >= threshold ? 'text-white' : 'text-gray-500'
                            }`}>
                              {trait.bonuses[i]}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
