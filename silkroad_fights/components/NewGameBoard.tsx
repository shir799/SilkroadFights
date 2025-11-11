"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { theme } from '../lib/theme'
import { BossMonster, Position } from '../lib/types'

interface NewGameBoardProps {
  board: string[][]
  selectedUnit: Position | null
  validMoves: Position[]
  attackRange: Position[]
  movementPath: Position[]
  onCellClick: (row: number, col: number) => void
  bossMonsters: BossMonster[]
  playerUnits: Position[]
  enemyUnits: Position[]
  isPlayerTurn: boolean
}

const NewGameBoard: React.FC<NewGameBoardProps> = ({
  board,
  selectedUnit,
  validMoves,
  attackRange,
  movementPath,
  onCellClick,
  bossMonsters,
  playerUnits,
  enemyUnits,
  isPlayerTurn,
}) => {
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null)
  const [animatingCells, setAnimatingCells] = useState<Set<string>>(new Set())

  const getCellKey = (row: number, col: number) => `${row}-${col}`

  const isValidMove = (row: number, col: number) =>
    validMoves.some((move) => move.row === row && move.col === col)

  const isInAttackRange = (row: number, col: number) =>
    attackRange.some((pos) => pos.row === row && pos.col === col)

  const isInMovementPath = (row: number, col: number) =>
    movementPath.some((pos) => pos.row === row && pos.col === col)

  const isPlayerUnit = (row: number, col: number) =>
    playerUnits.some((pos) => pos.row === row && pos.col === col)

  const isEnemyUnit = (row: number, col: number) =>
    enemyUnits.some((pos) => pos.row === row && pos.col === col)

  const getBoss = (row: number, col: number) =>
    bossMonsters.find((b) => b.position.row === row && b.position.col === col)

  const getUnitHP = (cell: string) => {
    const match = cell.match(/\d+/)
    return match ? parseInt(match[0]) : null
  }

  const getMaxHP = (cell: string) => {
    if (cell.includes('H') || cell.includes('KT') || cell.includes('TH')) return 3
    return 2
  }

  const getCellBackground = (row: number, col: number, cell: string, boss: BossMonster | undefined) => {
    if (selectedUnit?.row === row && selectedUnit?.col === col) {
      return 'radial-gradient(circle, rgba(212, 175, 55, 0.4), rgba(212, 175, 55, 0.1))'
    }
    if (boss) {
      return 'radial-gradient(circle, rgba(255, 69, 0, 0.4), rgba(255, 165, 0, 0.2))'
    }
    if (isInAttackRange(row, col)) {
      return 'radial-gradient(circle, rgba(255, 0, 0, 0.3), rgba(255, 0, 0, 0.1))'
    }
    if (isValidMove(row, col)) {
      return 'radial-gradient(circle, rgba(76, 175, 80, 0.4), rgba(76, 175, 80, 0.1))'
    }
    if (isInMovementPath(row, col)) {
      return 'radial-gradient(circle, rgba(100, 200, 255, 0.3), rgba(100, 200, 255, 0.1))'
    }
    if (cell.includes('Z')) {
      return 'radial-gradient(circle, rgba(255, 215, 0, 0.4), rgba(255, 215, 0, 0.2))'
    }
    return 'rgba(26, 15, 15, 0.4)'
  }

  const renderUnitSprite = (cell: string, boss: BossMonster | undefined, row: number, col: number) => {
    const isPlayer = isPlayerUnit(row, col)
    const isEnemy = isEnemyUnit(row, col)
    const isSelected = selectedUnit?.row === row && selectedUnit?.col === col
    const isHovered = hoveredCell?.row === row && hoveredCell?.col === col

    // Boss sprites
    if (boss) {
      const bossImageSrc =
        boss.type === 'TigerGiry'
          ? theme.images.tigergiry
          : boss.type === 'SkeletoKing'
          ? theme.images.skeletoking
          : theme.images.murucha

      return (
        <motion.div
          className="w-full h-full relative flex items-center justify-center"
          initial={{ scale: 0, rotate: -180 }}
          animate={{
            scale: isHovered ? 1.15 : 1,
            rotate: 0,
            y: [0, -5, 0],
          }}
          transition={{
            scale: { type: 'spring', stiffness: 300 },
            y: { repeat: Infinity, duration: 2, ease: 'easeInOut' }
          }}
        >
          <img
            src={bossImageSrc}
            alt={boss.type}
            className="w-full h-full object-contain p-1"
            style={{ filter: 'drop-shadow(0 0 8px rgba(255, 69, 0, 0.8))' }}
          />
          {/* Boss aura effect */}
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: 'radial-gradient(circle, rgba(255, 69, 0, 0.3), transparent)',
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.5, 0.2, 0.5],
            }}
            transition={{ repeat: Infinity, duration: 2 }}
          />
        </motion.div>
      )
    }

    // Unit sprites
    let imageSrc = ''
    let unitName = ''

    if (cell.includes('TR')) {
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

    const glowColor = isPlayer
      ? 'rgba(100, 200, 255, 0.8)'
      : isEnemy
      ? 'rgba(255, 100, 100, 0.8)'
      : 'rgba(212, 175, 55, 0.5)'

    return (
      <motion.div
        className="w-full h-full relative flex items-center justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{
          scale: isSelected ? 1.2 : isHovered ? 1.1 : 1,
          opacity: 1,
          rotate: isSelected ? [0, -5, 5, 0] : 0,
        }}
        transition={{
          type: 'spring',
          stiffness: 300,
          rotate: { repeat: isSelected ? Infinity : 0, duration: 0.5 }
        }}
      >
        <img
          src={imageSrc}
          alt={unitName}
          className={`w-full h-full object-contain ${cell.includes('TH') ? 'p-2' : 'p-1.5'}`}
          style={{
            filter: `drop-shadow(0 0 ${isSelected ? '10px' : '4px'} ${glowColor})`,
            cursor: isPlayer && isPlayerTurn ? 'pointer' : isEnemy ? 'not-allowed' : 'default',
          }}
        />

        {/* Player unit indicator */}
        {isPlayer && (
          <motion.div
            className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            aria-label="Player controlled unit"
          />
        )}

        {/* Enemy unit indicator */}
        {isEnemy && (
          <div
            className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"
            aria-label="Enemy unit"
          />
        )}

        {/* Selection ring */}
        {isSelected && (
          <motion.div
            className="absolute inset-0 rounded-full border-2 border-yellow-400"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [1, 0.5, 1],
            }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        )}
      </motion.div>
    )
  }

  return (
    <div
      className="relative w-full h-full"
      role="grid"
      aria-label="Game board"
    >
      {/* Grid background with silk road pattern */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'repeating-linear-gradient(45deg, #D4AF37 0px, #D4AF37 1px, transparent 1px, transparent 20px)',
        }}
      />

      {/* Main game grid */}
      <div className="grid grid-cols-8 gap-0.5 p-2 rounded-lg aspect-square h-full relative z-10"
        style={{ background: 'rgba(26, 15, 15, 0.8)', border: '3px solid #D4AF37' }}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, colIndex) => {
            const boss = getBoss(rowIndex, colIndex)
            const hp = getUnitHP(cell)
            const maxHp = getMaxHP(cell)
            const cellKey = getCellKey(rowIndex, colIndex)
            const isSelected = selectedUnit?.row === rowIndex && selectedUnit?.col === colIndex

            return (
              <motion.div
                key={cellKey}
                role="gridcell"
                aria-label={`Cell ${rowIndex},${colIndex}${cell ? `: ${cell}` : ''}`}
                className="relative flex items-center justify-center cursor-pointer group"
                style={{
                  background: getCellBackground(rowIndex, colIndex, cell, boss),
                  border: '1px solid rgba(139, 69, 19, 0.5)',
                  aspectRatio: '1 / 1',
                }}
                onClick={() => onCellClick(rowIndex, colIndex)}
                onMouseEnter={() => setHoveredCell({ row: rowIndex, col: colIndex })}
                onMouseLeave={() => setHoveredCell(null)}
                whileHover={{ scale: 1.05, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (rowIndex * 8 + colIndex) * 0.01 }}
              >
                {/* Movement path indicator */}
                {isInMovementPath(rowIndex, colIndex) && (
                  <motion.div
                    className="absolute inset-0 border-2 border-blue-400 rounded"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}

                {/* Attack range indicator */}
                {isInAttackRange(rowIndex, colIndex) && (
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <div className="w-full h-full" style={{
                      background: 'radial-gradient(circle, rgba(255, 0, 0, 0.4), transparent)',
                    }} />
                  </motion.div>
                )}

                {/* Valid move highlight */}
                {isValidMove(rowIndex, colIndex) && (
                  <motion.div
                    className="absolute inset-1 border-2 border-green-400 rounded-full"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.5, 1, 0.5]
                    }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  />
                )}

                {/* Unit/Boss sprite */}
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  {renderUnitSprite(cell, boss, rowIndex, colIndex)}
                </div>

                {/* Health bar for units */}
                {hp && !boss && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 px-0.5 pb-0.5"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{
                          background: hp > maxHp * 0.6
                            ? theme.colors.health.good
                            : hp > maxHp * 0.3
                            ? theme.colors.health.medium
                            : theme.colors.health.low,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(hp / maxHp) * 100}%` }}
                        transition={{ type: 'spring', stiffness: 200 }}
                      />
                    </div>
                  </motion.div>
                )}

                {/* Boss health bar */}
                {boss && (
                  <motion.div
                    className="absolute -bottom-6 left-0 right-0 px-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="bg-gray-900 border-2 border-orange-500 rounded-full overflow-hidden p-0.5">
                      <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full"
                          style={{
                            background: 'linear-gradient(90deg, #ff4500, #ff8c00)',
                          }}
                          initial={{ width: 0 }}
                          animate={{
                            width: `${(boss.hp / boss.maxHp) * 100}%`,
                          }}
                          transition={{ type: 'spring', stiffness: 200 }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[8px] font-bold text-white drop-shadow-lg">
                            {boss.hp}/{boss.maxHp}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-center text-[8px] font-bold text-orange-400 mt-0.5">
                      {boss.type}
                    </div>
                  </motion.div>
                )}

                {/* Hover tooltip for more info */}
                {hoveredCell?.row === rowIndex && hoveredCell?.col === colIndex && cell && (
                  <motion.div
                    className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 border-2 border-yellow-500 rounded px-2 py-1 text-xs text-white whitespace-nowrap z-50 pointer-events-none"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{ minWidth: 'max-content' }}
                  >
                    {boss ? `${boss.type} (${boss.hp}/${boss.maxHp} HP)` : cell}
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full border-4 border-transparent border-t-yellow-500" />
                  </motion.div>
                )}
              </motion.div>
            )
          })
        )}
      </div>

      {/* Coordinate labels */}
      <div className="absolute top-0 left-0 right-0 flex justify-around px-2 text-xs text-yellow-500 font-bold">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((col) => (
          <div key={col} className="w-[12.5%] text-center" aria-hidden="true">
            {col}
          </div>
        ))}
      </div>
      <div className="absolute top-0 bottom-0 left-0 flex flex-col justify-around py-2 text-xs text-yellow-500 font-bold">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((row) => (
          <div key={row} className="h-[12.5%] flex items-center" aria-hidden="true">
            {row}
          </div>
        ))}
      </div>
    </div>
  )
}

export default NewGameBoard
