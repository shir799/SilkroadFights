import React from 'react'
import { theme } from '../lib/theme'
import { HealthBar } from './HealthBar'
import { motion } from 'framer-motion';
import { BossMonster } from '../lib/types';

interface GameBoardProps {
  board: string[][]
  selectedUnit: { row: number, col: number } | null
  validMoves: { row: number, col: number }[]
  onCellClick: (row: number, col: number) => void
  bossMonsters: BossMonster[]
}

const GameBoard: React.FC<GameBoardProps> = ({ board, selectedUnit, validMoves, onCellClick, bossMonsters }) => {
  return (
    <div className="grid grid-cols-8 gap-0.5 p-1 rounded-lg aspect-square" style={{ background: 'rgba(26, 15, 15, 0.6)' }}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isValidMove = validMoves.some(move => move.row === rowIndex && move.col === colIndex)
          const maxHp = cell.includes('H') || cell.includes('KT') || cell.includes('TH') ? 3 : 2
          const [unitType, currentHp] = cell.split(/(\d+)/)
          const displayHp = parseInt(currentHp) || maxHp

          const boss = bossMonsters.find(b => b.position.row === rowIndex && b.position.col === colIndex);
          
          return (
            <motion.div
              key={`${rowIndex}-${colIndex}`}
              className={`
                relative flex items-center justify-center
                ${isValidMove ? 'ring-1 ring-green-400' : ''}
                hover:opacity-90 transition-opacity
              `}
              style={{
                background: getCellBackground(cell, boss),
                border: '1px solid rgba(139, 69, 19, 0.5)',
                aspectRatio: '1 / 1',
              }}
              onClick={() => onCellClick(rowIndex, colIndex)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {renderGamePiece(cell, boss)}
              </div>
              {(currentHp || (boss && !cell.includes('BM'))) && (
                <div className="absolute bottom-0 left-0 right-0 px-0.5">
                  <HealthBar 
                    currentHp={boss ? boss.hp : displayHp} 
                    maxHp={boss ? boss.maxHp : maxHp}
                    showPercentage
                  />
                </div>
              )}
            </motion.div>
          )
        })
      )}
    </div>
  )
}

function getCellBackground(cell: string, boss: BossMonster | undefined): string {
  if (boss) {
    return 'rgba(255, 165, 0, 0.3)' // Orange tint for boss cells
  }
  if (cell.includes('Z')) return 'rgba(255, 215, 0, 0.3)'
  return 'rgba(26, 15, 15, 0.4)'
}

function renderGamePiece(cell: string, boss: BossMonster | undefined) {
  const commonImageClasses = "w-full h-full object-contain p-1.5"; // Increased padding for better sizing

  // Render boss
  if (boss) {
    const bossImageSrc = boss.type === 'TigerGiry' ? theme.images.tigergiry :
                        boss.type === 'SkeletoKing' ? theme.images.skeletoking :
                        theme.images.murucha;
    return (
      <img 
        src={bossImageSrc}
        alt={boss.type}
        className={commonImageClasses}
      />
    );
  }

  // Render units
  if (cell.includes('TR') || cell.includes('H') || cell.includes('TH') || cell.includes('KT')) {
    let imageSrc = '';
    if (cell.includes('TR')) imageSrc = theme.images.trader;
    else if (cell.includes('H')) imageSrc = theme.images.hunter;
    else if (cell.includes('KT')) imageSrc = theme.images.kingThief;
    else if (cell.includes('TH')) {
      imageSrc = theme.images.thief;
      return (
        <div className="w-full h-full relative flex items-center justify-center">
          <img 
            src={imageSrc}
            alt="Thief"
            className="w-[85%] h-[85%] object-contain" // Slightly smaller for the new thief image
            style={{ filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.5))' }} // Add shadow for better visibility
          />
        </div>
      );
    }

    if (imageSrc) {
      return (
        <img 
          src={imageSrc}
          alt={cell.includes('TR') ? "Trader" : 
              cell.includes('H') ? "Hunter" : 
              cell.includes('KT') ? "King Thief" : "Thief"}
          className={commonImageClasses}
        />
      );
    }
  }

  // Render other game pieces
  if (cell.includes('SI')) {
    return (
      <img 
        src={theme.images.silk}
        alt="Silk"
        className={commonImageClasses}
      />
    );
  }

  if (cell.includes('X')) {
    return (
      <img 
        src={theme.images.trap}
        alt="Trap"
        className={`${commonImageClasses} opacity-75`}
      />
    );
  }

  if (cell.includes('Z')) {
    return (
      <img 
        src={theme.images.gold}
        alt="Goal"
        className={commonImageClasses}
      />
    );
  }

  return null;
}

export default GameBoard;

