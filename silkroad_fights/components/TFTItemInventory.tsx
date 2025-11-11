"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { Sword, Shield, Zap, Heart, Target, Sparkles, Plus } from 'lucide-react'
import { useState } from 'react'

interface Item {
  id: string
  name: string
  type: 'weapon' | 'armor' | 'accessory' | 'consumable'
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  description: string
  stats: {
    attack?: number
    defense?: number
    hp?: number
    speed?: number
  }
  imageUrl?: string
}

interface TFTItemInventoryProps {
  items: Item[]
  maxSlots?: number
  onItemClick?: (itemId: string) => void
  onItemUse?: (itemId: string) => void
  selectedItem?: string | null
  compact?: boolean
}

export default function TFTItemInventory({
  items,
  maxSlots = 10,
  onItemClick,
  onItemUse,
  selectedItem = null,
  compact = false
}: TFTItemInventoryProps) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const getItemIcon = (type: string) => {
    const icons = {
      weapon: Sword,
      armor: Shield,
      accessory: Sparkles,
      consumable: Heart
    }
    return icons[type as keyof typeof icons] || Sword
  }

  const getRarityConfig = (rarity: string) => {
    const configs = {
      common: {
        color: '#9CA3AF',
        gradient: 'from-gray-500 to-gray-700',
        border: 'border-gray-400',
        glow: 'rgba(156, 163, 175, 0.4)'
      },
      rare: {
        color: '#3B82F6',
        gradient: 'from-blue-500 to-blue-700',
        border: 'border-blue-400',
        glow: 'rgba(59, 130, 246, 0.5)'
      },
      epic: {
        color: '#A855F7',
        gradient: 'from-purple-500 to-purple-700',
        border: 'border-purple-400',
        glow: 'rgba(168, 85, 247, 0.6)'
      },
      legendary: {
        color: '#F59E0B',
        gradient: 'from-amber-500 to-amber-700',
        border: 'border-amber-400',
        glow: 'rgba(245, 158, 11, 0.7)'
      }
    }
    return configs[rarity as keyof typeof configs] || configs.common
  }

  // Fill empty slots
  const filledItems = [...items]
  while (filledItems.length < maxSlots) {
    filledItems.push(null as any)
  }

  if (compact) {
    return (
      <div className="flex gap-2 items-center">
        <span className="text-amber-300 text-sm font-semibold">Items:</span>
        <div className="flex gap-1">
          {items.slice(0, 6).map((item, index) => {
            if (!item) return null
            const Icon = getItemIcon(item.type)
            const config = getRarityConfig(item.rarity)

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, y: -2 }}
                className={`w-8 h-8 rounded-lg bg-gradient-to-br ${config.gradient} border-2 ${config.border} flex items-center justify-center cursor-pointer`}
                style={{ boxShadow: `0 2px 10px ${config.glow}` }}
                onClick={() => onItemClick?.(item.id)}
              >
                <Icon className="w-4 h-4 text-white" />
              </motion.div>
            )
          })}
          {items.length > 6 && (
            <div className="w-8 h-8 rounded-lg bg-amber-900/40 border-2 border-amber-600 flex items-center justify-center">
              <span className="text-amber-300 text-xs font-bold">+{items.length - 6}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className="w-full px-4 py-3"
      style={{
        background: 'linear-gradient(180deg, rgba(58, 30, 10, 0.9) 0%, rgba(38, 20, 7, 0.9) 100%)',
        borderTop: '2px solid #92400E',
        boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)'
      }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-amber-300 font-bold text-sm">ITEM INVENTORY</h3>
          </div>
          <span className="text-amber-400/70 text-xs">
            {items.length} / {maxSlots}
          </span>
        </div>

        <div className="grid grid-cols-10 gap-2">
          {filledItems.map((item, index) => {
            if (!item) {
              return (
                <div
                  key={`empty-${index}`}
                  className="relative aspect-square rounded-lg border-2 border-dashed border-amber-800/30 bg-amber-950/20 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 text-amber-800/40" />
                </div>
              )
            }

            const Icon = getItemIcon(item.type)
            const config = getRarityConfig(item.rarity)
            const isHovered = hoveredItem === item.id
            const isSelected = selectedItem === item.id

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.1, y: -3 }}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
                className="relative cursor-pointer group"
                onClick={() => onItemClick?.(item.id)}
                onDoubleClick={() => onItemUse?.(item.id)}
              >
                <div
                  className={`relative aspect-square rounded-lg bg-gradient-to-br ${config.gradient} border-3 ${config.border} overflow-hidden`}
                  style={{
                    boxShadow: isSelected
                      ? `0 0 25px ${config.color}, 0 4px 15px rgba(0,0,0,0.6)`
                      : `0 4px 12px ${config.glow}`,
                    borderWidth: isSelected ? '3px' : '2px'
                  }}
                >
                  {/* Item Image or Icon */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  )}

                  {/* Rarity Corner */}
                  <div
                    className="absolute top-0 right-0 w-0 h-0 border-t-[20px] border-r-[20px] border-t-transparent"
                    style={{ borderRightColor: config.color }}
                  />

                  {/* Shine Effect */}
                  {item.rarity === 'legendary' && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{
                        background: [
                          'linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)',
                          'linear-gradient(225deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}

                  {/* Selected Glow */}
                  {isSelected && (
                    <motion.div
                      className="absolute inset-0 pointer-events-none"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      style={{
                        background: `radial-gradient(circle at center, ${config.glow} 0%, transparent 70%)`
                      }}
                    />
                  )}

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-white/0 to-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* Tooltip */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute z-50 bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 px-4 py-3 rounded-lg border-2"
                      style={{
                        background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,10,5,0.95) 100%)',
                        borderColor: config.color,
                        boxShadow: `0 8px 25px ${config.glow}, 0 0 15px ${config.glow}`
                      }}
                    >
                      {/* Item Name */}
                      <div className="flex items-center gap-2 mb-2">
                        <Icon className="w-5 h-5" style={{ color: config.color }} />
                        <h4 className="text-white font-bold text-sm">{item.name}</h4>
                      </div>

                      {/* Rarity Badge */}
                      <div
                        className="inline-block px-2 py-0.5 rounded-full text-xs font-bold mb-2"
                        style={{
                          backgroundColor: config.color,
                          color: '#FFFFFF',
                          textShadow: '0 1px 2px rgba(0,0,0,0.8)'
                        }}
                      >
                        {item.rarity.toUpperCase()}
                      </div>

                      {/* Description */}
                      <p className="text-amber-200 text-xs mb-3 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Stats */}
                      <div className="space-y-1">
                        {item.stats.attack && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Sword className="w-3 h-3 text-red-400" />
                              <span className="text-gray-300">Attack</span>
                            </div>
                            <span className="text-white font-bold">+{item.stats.attack}</span>
                          </div>
                        )}
                        {item.stats.defense && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Shield className="w-3 h-3 text-blue-400" />
                              <span className="text-gray-300">Defense</span>
                            </div>
                            <span className="text-white font-bold">+{item.stats.defense}</span>
                          </div>
                        )}
                        {item.stats.hp && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Heart className="w-3 h-3 text-green-400" />
                              <span className="text-gray-300">HP</span>
                            </div>
                            <span className="text-white font-bold">+{item.stats.hp}</span>
                          </div>
                        )}
                        {item.stats.speed && (
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1">
                              <Zap className="w-3 h-3 text-yellow-400" />
                              <span className="text-gray-300">Speed</span>
                            </div>
                            <span className="text-white font-bold">+{item.stats.speed}</span>
                          </div>
                        )}
                      </div>

                      {/* Usage Hint */}
                      <div className="mt-3 pt-2 border-t border-amber-800/50">
                        <p className="text-amber-400/70 text-xs text-center">
                          Click to select • Double-click to use
                        </p>
                      </div>

                      {/* Arrow Pointer */}
                      <div
                        className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-r-[8px] border-t-[8px] border-l-transparent border-r-transparent"
                        style={{ borderTopColor: config.color }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
