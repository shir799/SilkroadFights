/**
 * IMPROVED GAME BOARD COMPONENT
 *
 * A beautiful, polished game board with:
 * - Grid coordinates (A-H, 1-8)
 * - Dynamic terrain types (desert, oasis, rocks)
 * - Weather effects (sandstorm, clear, night)
 * - Day/night cycle with ambient lighting
 * - Animated tiles (shimmering sand, rippling water)
 * - Path highlighting (movement trails)
 * - Danger zones (red overlay for threats)
 * - Safe zones (green overlay for secure areas)
 * - GPU-accelerated animations for 60 FPS
 * - Responsive design
 * - Accessibility features
 */

"use client"

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { theme } from '../lib/theme'
import { BossMonster, Position } from '../lib/types'
import { HealthBar } from './HealthBar'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type TerrainType = 'desert' | 'oasis' | 'rocks' | 'dunes' | 'ruins' | 'path'
export type WeatherType = 'clear' | 'sandstorm' | 'night' | 'dusk' | 'dawn'

export interface ImprovedGameBoardProps {
  board: string[][]
  selectedUnit: Position | null
  validMoves: Position[]
  attackRange: Position[]
  movementPath: Position[]
  dangerZones?: Position[]
  safeZones?: Position[]
  onCellClick: (row: number, col: number) => void
  bossMonsters: BossMonster[]
  playerUnits: Position[]
  enemyUnits: Position[]
  isPlayerTurn: boolean
  weather?: WeatherType
  timeOfDay?: 'day' | 'night' | 'dusk' | 'dawn'
  showCoordinates?: boolean
  enableTerrainEffects?: boolean
  showLastMove?: boolean
  lastMove?: Position[]
}

interface CellData {
  terrain: TerrainType
  elevation: number
}

// ============================================================================
// CONSTANTS
// ============================================================================

const GRID_LABELS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const ROW_NUMBERS = ['1', '2', '3', '4', '5', '6', '7', '8']

const TERRAIN_COLORS: Record<TerrainType, string> = {
  desert: 'rgba(237, 201, 175, 0.4)',
  oasis: 'rgba(100, 200, 255, 0.3)',
  rocks: 'rgba(139, 115, 85, 0.5)',
  dunes: 'rgba(244, 164, 96, 0.4)',
  ruins: 'rgba(120, 100, 80, 0.5)',
  path: 'rgba(210, 180, 140, 0.4)',
}

const WEATHER_EFFECTS = {
  clear: {
    overlay: 'rgba(255, 255, 255, 0)',
    particles: 0,
    blur: 0,
  },
  sandstorm: {
    overlay: 'rgba(237, 201, 175, 0.3)',
    particles: 50,
    blur: 2,
  },
  night: {
    overlay: 'rgba(0, 0, 50, 0.5)',
    particles: 0,
    blur: 0,
  },
  dusk: {
    overlay: 'rgba(255, 140, 0, 0.2)',
    particles: 0,
    blur: 0,
  },
  dawn: {
    overlay: 'rgba(255, 200, 150, 0.2)',
    particles: 0,
    blur: 0,
  },
}

// ============================================================================
// TERRAIN GENERATION
// ============================================================================

const generateTerrain = (row: number, col: number): CellData => {
  // Deterministic terrain generation based on position
  const seed = row * 8 + col
  const hash = Math.sin(seed * 12.9898) * 43758.5453
  const random = hash - Math.floor(hash)

  // Create interesting terrain patterns
  const isCorner = (row === 0 || row === 7) && (col === 0 || col === 7)
  const isEdge = row === 0 || row === 7 || col === 0 || col === 7
  const isCenter = row >= 3 && row <= 4 && col >= 3 && col <= 4

  let terrain: TerrainType = 'desert'
  let elevation = 0

  if (isCorner) {
    terrain = 'ruins'
    elevation = 1
  } else if (isCenter) {
    terrain = random > 0.5 ? 'oasis' : 'desert'
    elevation = -1
  } else if (isEdge) {
    terrain = random > 0.6 ? 'rocks' : 'desert'
    elevation = random > 0.6 ? 2 : 0
  } else {
    if (random > 0.7) terrain = 'dunes'
    else if (random > 0.85) terrain = 'rocks'
    else if (random > 0.95) terrain = 'oasis'
    else terrain = 'desert'

    elevation = terrain === 'dunes' ? 1 : terrain === 'oasis' ? -1 : 0
  }

  return { terrain, elevation }
}

// ============================================================================
// CELL COMPONENT
// ============================================================================

interface GameCellProps {
  cell: string
  row: number
  col: number
  terrainData: CellData
  isValidMove: boolean
  isInAttackRange: boolean
  isInMovementPath: boolean
  isInDangerZone: boolean
  isInSafeZone: boolean
  isSelected: boolean
  isLastMove: boolean
  boss: BossMonster | undefined
  isPlayerUnit: boolean
  isEnemyUnit: boolean
  weather: WeatherType
  timeOfDay: string
  onClick: () => void
  onHover: () => void
  onLeave: () => void
}

const GameCell = React.memo<GameCellProps>(({
  cell,
  row,
  col,
  terrainData,
  isValidMove,
  isInAttackRange,
  isInMovementPath,
  isInDangerZone,
  isInSafeZone,
  isSelected,
  isLastMove,
  boss,
  isPlayerUnit,
  isEnemyUnit,
  weather,
  timeOfDay,
  onClick,
  onHover,
  onLeave,
}) => {
  const [shimmerPhase, setShimmerPhase] = useState(Math.random() * 10)

  useEffect(() => {
    const interval = setInterval(() => {
      setShimmerPhase((prev) => (prev + 0.1) % 10)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  // Calculate cell background with terrain and overlays
  const getCellStyle = useCallback(() => {
    const baseColor = TERRAIN_COLORS[terrainData.terrain]
    const layers = [baseColor]

    // Time of day overlay
    if (timeOfDay === 'night') {
      layers.push('rgba(0, 0, 50, 0.4)')
    } else if (timeOfDay === 'dusk') {
      layers.push('rgba(255, 100, 0, 0.15)')
    } else if (timeOfDay === 'dawn') {
      layers.push('rgba(255, 200, 150, 0.15)')
    }

    // Game state overlays
    if (isSelected) {
      layers.push('rgba(255, 215, 0, 0.4)')
    }
    if (isValidMove) {
      layers.push('rgba(76, 175, 80, 0.3)')
    }
    if (isInAttackRange) {
      layers.push('rgba(255, 0, 0, 0.25)')
    }
    if (isInDangerZone) {
      layers.push('rgba(255, 0, 0, 0.2)')
    }
    if (isInSafeZone) {
      layers.push('rgba(0, 255, 0, 0.15)')
    }
    if (boss) {
      layers.push('rgba(255, 69, 0, 0.3)')
    }

    return {
      background: layers.join(', '),
      transform: `translateZ(${terrainData.elevation * 2}px)`,
    }
  }, [terrainData, timeOfDay, isSelected, isValidMove, isInAttackRange, isInDangerZone, isInSafeZone, boss])

  // Render unit sprite
  const renderUnitSprite = useCallback(() => {
    if (!cell || cell === ' ') return null

    let imageSrc = ''
    let unitName = ''

    // Boss sprites
    if (boss) {
      imageSrc = boss.type === 'TigerGiry' ? theme.images.tigergiry :
                  boss.type === 'SkeletoKing' ? theme.images.skeletoking :
                  theme.images.murucha
      unitName = boss.type
    }
    // Unit sprites
    else if (cell.includes('TR')) {
      imageSrc = theme.images.trader
      unitName = 'Trader'
    } else if (cell.includes('H') && !cell.includes('TH')) {
      imageSrc = theme.images.hunter
      unitName = 'Hunter'
    } else if (cell.includes('KT')) {
      imageSrc = theme.images.kingThief
      unitName = 'King Thief'
    } else if (cell.includes('TH')) {
      imageSrc = theme.images.thief
      unitName = 'Thief'
    } else if (cell.includes('SI')) {
      imageSrc = theme.images.silk
      unitName = 'Silk'
    } else if (cell.includes('X')) {
      imageSrc = theme.images.trap
      unitName = 'Trap'
    } else if (cell.includes('Z')) {
      imageSrc = theme.images.gold
      unitName = 'Gold'
    }

    if (!imageSrc) return null

    const glowColor = isPlayerUnit ? 'rgba(100, 200, 255, 0.8)' :
                      isEnemyUnit ? 'rgba(255, 100, 100, 0.8)' :
                      'rgba(212, 175, 55, 0.5)'

    return (
      <motion.div
        className="w-full h-full relative flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isSelected ? 1.15 : 1,
          opacity: 1,
          y: boss ? [0, -8, 0] : [0, -3, 0],
        }}
        transition={{
          scale: { type: 'spring', stiffness: 300 },
          y: { repeat: Infinity, duration: boss ? 2 : 3, ease: 'easeInOut' },
        }}
      >
        <img
          src={imageSrc}
          alt={unitName}
          className="w-full h-full object-contain p-1.5"
          style={{
            filter: `drop-shadow(0 0 ${isSelected ? '10px' : '4px'} ${glowColor})`,
            imageRendering: 'crisp-edges',
          }}
        />
        {/* Team indicator */}
        {isPlayerUnit && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          />
        )}
        {isEnemyUnit && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
        )}
      </motion.div>
    )
  }, [cell, boss, isPlayerUnit, isEnemyUnit, isSelected])

  // Get HP data
  const getUnitHP = () => {
    if (boss) return { current: boss.hp, max: boss.maxHp }
    const match = cell.match(/\d+/)
    if (!match) return null
    const current = parseInt(match[0])
    const max = cell.includes('H') || cell.includes('KT') || cell.includes('TH') ? 3 : 2
    return { current, max }
  }

  const hpData = getUnitHP()

  return (
    <motion.div
      className="relative flex items-center justify-center cursor-pointer group"
      style={{
        ...getCellStyle(),
        border: '1px solid rgba(139, 69, 19, 0.3)',
        aspectRatio: '1 / 1',
        willChange: 'transform, opacity',
      }}
      onClick={onClick}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      whileHover={{ scale: 1.05, zIndex: 10 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: (row * 8 + col) * 0.008, type: 'spring', stiffness: 200 }}
    >
      {/* Terrain animations */}
      {terrainData.terrain === 'desert' && (
        <motion.div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + Math.sin(shimmerPhase) * 20}% ${50 + Math.cos(shimmerPhase) * 20}%, rgba(255, 215, 0, 0.3), transparent)`,
          }}
        />
      )}
      {terrainData.terrain === 'oasis' && (
        <motion.div
          className="absolute inset-0 opacity-30 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle at 30% 30%, rgba(100, 200, 255, 0.4), transparent)',
              'radial-gradient(circle at 70% 70%, rgba(100, 200, 255, 0.4), transparent)',
              'radial-gradient(circle at 30% 30%, rgba(100, 200, 255, 0.4), transparent)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Movement path indicator */}
      {isInMovementPath && (
        <motion.div
          className="absolute inset-1 border-2 border-blue-400 rounded pointer-events-none"
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
      )}

      {/* Last move highlight */}
      {isLastMove && (
        <motion.div
          className="absolute inset-0 border-2 border-cyan-400 pointer-events-none"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 2 }}
        />
      )}

      {/* Valid move indicator */}
      {isValidMove && (
        <motion.div
          className="absolute inset-2 border-2 border-green-400 rounded-full pointer-events-none"
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1 }}
        />
      )}

      {/* Attack range indicator */}
      {isInAttackRange && (
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(circle, rgba(255, 0, 0, 0.3), transparent)',
              'radial-gradient(circle, rgba(255, 0, 0, 0.5), transparent)',
              'radial-gradient(circle, rgba(255, 0, 0, 0.3), transparent)',
            ],
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* Danger zone overlay */}
      {isInDangerZone && (
        <motion.div
          className="absolute inset-0 border border-red-500 pointer-events-none"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="absolute inset-0 bg-red-500 opacity-10" />
        </motion.div>
      )}

      {/* Safe zone overlay */}
      {isInSafeZone && (
        <motion.div
          className="absolute inset-0 border border-green-500 pointer-events-none"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <div className="absolute inset-0 bg-green-500 opacity-10" />
        </motion.div>
      )}

      {/* Unit sprite */}
      <div className="relative w-full h-full flex flex-col items-center justify-center z-10">
        {renderUnitSprite()}
      </div>

      {/* Health bar */}
      {hpData && (
        <div className="absolute bottom-0 left-0 right-0 px-0.5 pb-0.5 z-20">
          <HealthBar
            currentHp={hpData.current}
            maxHp={hpData.max}
            showPercentage={boss !== undefined}
          />
        </div>
      )}

      {/* Coordinate label on hover */}
      <div className="absolute bottom-0 right-0 text-[8px] font-bold text-yellow-600 opacity-0 group-hover:opacity-70 transition-opacity p-0.5 pointer-events-none">
        {GRID_LABELS[col]}{ROW_NUMBERS[row]}
      </div>
    </motion.div>
  )
})

GameCell.displayName = 'GameCell'

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const ImprovedGameBoard: React.FC<ImprovedGameBoardProps> = ({
  board,
  selectedUnit,
  validMoves,
  attackRange,
  movementPath,
  dangerZones = [],
  safeZones = [],
  onCellClick,
  bossMonsters,
  playerUnits,
  enemyUnits,
  isPlayerTurn,
  weather = 'clear',
  timeOfDay = 'day',
  showCoordinates = true,
  enableTerrainEffects = true,
  showLastMove = true,
  lastMove = [],
}) => {
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null)
  const [sandstormParticles, setSandstormParticles] = useState<Array<{ id: number; x: number; y: number }>>([])

  // Generate terrain data (memoized)
  const terrainMap = useMemo(() => {
    const map: CellData[][] = []
    for (let row = 0; row < 8; row++) {
      map[row] = []
      for (let col = 0; col < 8; col++) {
        map[row][col] = generateTerrain(row, col)
      }
    }
    return map
  }, [])

  // Sandstorm particle effect
  useEffect(() => {
    if (weather !== 'sandstorm') {
      setSandstormParticles([])
      return
    }

    const particles = Array.from({ length: WEATHER_EFFECTS.sandstorm.particles }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
    }))
    setSandstormParticles(particles)

    const interval = setInterval(() => {
      setSandstormParticles((prev) =>
        prev.map((p) => ({
          ...p,
          x: (p.x + 0.5) % 100,
          y: (p.y + 0.3) % 100,
        }))
      )
    }, 50)

    return () => clearInterval(interval)
  }, [weather])

  // Lookup maps for performance
  const validMovesSet = useMemo(() => {
    return new Set(validMoves.map((m) => `${m.row}-${m.col}`))
  }, [validMoves])

  const attackRangeSet = useMemo(() => {
    return new Set(attackRange.map((a) => `${a.row}-${a.col}`))
  }, [attackRange])

  const movementPathSet = useMemo(() => {
    return new Set(movementPath.map((m) => `${m.row}-${m.col}`))
  }, [movementPath])

  const dangerZonesSet = useMemo(() => {
    return new Set(dangerZones.map((d) => `${d.row}-${d.col}`))
  }, [dangerZones])

  const safeZonesSet = useMemo(() => {
    return new Set(safeZones.map((s) => `${s.row}-${s.col}`))
  }, [safeZones])

  const lastMoveSet = useMemo(() => {
    return new Set(lastMove.map((m) => `${m.row}-${m.col}`))
  }, [lastMove])

  const bossMap = useMemo(() => {
    const map = new Map<string, BossMonster>()
    bossMonsters.forEach((boss) => {
      map.set(`${boss.position.row}-${boss.position.col}`, boss)
    })
    return map
  }, [bossMonsters])

  const playerUnitsSet = useMemo(() => {
    return new Set(playerUnits.map((u) => `${u.row}-${u.col}`))
  }, [playerUnits])

  const enemyUnitsSet = useMemo(() => {
    return new Set(enemyUnits.map((e) => `${e.row}-${e.col}`))
  }, [enemyUnits])

  const weatherEffect = WEATHER_EFFECTS[weather]

  return (
    <div className="relative w-full h-full select-none" style={{ perspective: '1000px' }}>
      {/* Weather overlay */}
      <motion.div
        className="absolute inset-0 pointer-events-none z-30"
        style={{
          background: weatherEffect.overlay,
          backdropFilter: `blur(${weatherEffect.blur}px)`,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Sandstorm particles */}
      {weather === 'sandstorm' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          {sandstormParticles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute w-1 h-1 bg-yellow-600 rounded-full opacity-40"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
              }}
            />
          ))}
        </div>
      )}

      {/* Coordinate labels */}
      {showCoordinates && (
        <>
          {/* Column labels (A-H) */}
          <div className="absolute -top-6 left-0 right-0 flex justify-around px-3 z-40">
            {GRID_LABELS.map((label, idx) => (
              <motion.div
                key={label}
                className="flex-1 text-center text-sm font-bold text-yellow-500"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {label}
              </motion.div>
            ))}
          </div>

          {/* Row labels (1-8) */}
          <div className="absolute -left-6 top-0 bottom-0 flex flex-col justify-around py-3 z-40">
            {ROW_NUMBERS.map((num, idx) => (
              <motion.div
                key={num}
                className="flex-1 flex items-center text-sm font-bold text-yellow-500"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {num}
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* Main game grid */}
      <div
        className="grid grid-cols-8 gap-0.5 p-2 rounded-lg aspect-square h-full relative"
        style={{
          background: 'rgba(26, 15, 15, 0.85)',
          border: '3px solid #D4AF37',
          boxShadow: '0 0 30px rgba(212, 175, 55, 0.3), inset 0 0 20px rgba(0, 0, 0, 0.5)',
          transformStyle: 'preserve-3d',
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const key = `${rowIndex}-${colIndex}`
            const terrainData = terrainMap[rowIndex][colIndex]
            const boss = bossMap.get(key)

            return (
              <GameCell
                key={key}
                cell={cell}
                row={rowIndex}
                col={colIndex}
                terrainData={terrainData}
                isValidMove={validMovesSet.has(key)}
                isInAttackRange={attackRangeSet.has(key)}
                isInMovementPath={movementPathSet.has(key)}
                isInDangerZone={dangerZonesSet.has(key)}
                isInSafeZone={safeZonesSet.has(key)}
                isSelected={selectedUnit?.row === rowIndex && selectedUnit?.col === colIndex}
                isLastMove={lastMoveSet.has(key)}
                boss={boss}
                isPlayerUnit={playerUnitsSet.has(key)}
                isEnemyUnit={enemyUnitsSet.has(key)}
                weather={weather}
                timeOfDay={timeOfDay}
                onClick={() => onCellClick(rowIndex, colIndex)}
                onHover={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                onLeave={() => setHoveredCell(null)}
              />
            )
          })
        )}
      </div>

      {/* Turn indicator */}
      <motion.div
        className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 px-4 py-1 rounded-full text-sm font-bold"
        style={{
          background: isPlayerTurn
            ? 'linear-gradient(90deg, #4CAF50, #66BB6A)'
            : 'linear-gradient(90deg, #F44336, #EF5350)',
          color: 'white',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
        }}
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        {isPlayerTurn ? 'Your Turn' : 'Enemy Turn'}
      </motion.div>

      {/* Weather indicator */}
      <motion.div
        className="absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold text-white z-40"
        style={{
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(10px)',
        }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
      >
        {weather === 'sandstorm' && '🌪️ Sandstorm'}
        {weather === 'clear' && '☀️ Clear'}
        {weather === 'night' && '🌙 Night'}
        {weather === 'dusk' && '🌅 Dusk'}
        {weather === 'dawn' && '🌄 Dawn'}
      </motion.div>
    </div>
  )
}

export default ImprovedGameBoard
