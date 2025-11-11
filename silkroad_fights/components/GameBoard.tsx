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

// Define important board positions
const TRADER_DELIVERY_ZONES = [
  { row: 7, col: 2 }, // A3
  { row: 7, col: 5 }  // A6
];

const THIEF_GOLD_ZONES = [
  { row: 0, col: 2 }, // H3
  { row: 0, col: 5 }  // H6
];

const TRADER_START_POSITIONS = [
  { row: 7, col: 1 }, // Trader 1: A2
  { row: 7, col: 6 }, // Trader 2: A7
  { row: 6, col: 3 }  // Hunter: B4
];

const THIEF_START_POSITIONS = [
  { row: 0, col: 1 }, // Thief 1: H2
  { row: 0, col: 6 }, // Thief 2: H7
  { row: 1, col: 3 }  // Kingthief: G4
];

function isTraderDeliveryZone(row: number, col: number): boolean {
  return TRADER_DELIVERY_ZONES.some(zone => zone.row === row && zone.col === col);
}

function isThiefGoldZone(row: number, col: number): boolean {
  return THIEF_GOLD_ZONES.some(zone => zone.row === row && zone.col === col);
}

function isTraderStartPosition(row: number, col: number): boolean {
  return TRADER_START_POSITIONS.some(pos => pos.row === row && pos.col === col);
}

function isThiefStartPosition(row: number, col: number): boolean {
  return THIEF_START_POSITIONS.some(pos => pos.row === row && pos.col === col);
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
                background: getCellBackground(cell, boss, rowIndex, colIndex),
                border: '1px solid rgba(139, 69, 19, 0.5)',
                aspectRatio: '1 / 1',
              }}
              onClick={() => onCellClick(rowIndex, colIndex)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Zone indicators */}
                {isTraderDeliveryZone(rowIndex, colIndex) && (
                  <div className="absolute top-0.5 left-0.5 text-xs font-bold text-green-400 bg-black/50 px-1 rounded z-10">
                    ⭐ GOAL
                  </div>
                )}
                {isThiefGoldZone(rowIndex, colIndex) && (
                  <div className="absolute top-0.5 left-0.5 text-xs font-bold text-red-400 bg-black/50 px-1 rounded z-10">
                    💰 GOLD
                  </div>
                )}
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

function getCellBackground(cell: string, boss: BossMonster | undefined, rowIndex: number, colIndex: number): string {
  if (boss) {
    return 'linear-gradient(135deg, rgba(255, 165, 0, 0.4), rgba(255, 69, 0, 0.3))' // Orange gradient for boss cells
  }

  // Trader Delivery Zones - Green glow
  if (isTraderDeliveryZone(rowIndex, colIndex)) {
    return 'linear-gradient(135deg, rgba(0, 255, 127, 0.25), rgba(34, 139, 34, 0.2))';
  }

  // Thief Gold Zones - Red glow
  if (isThiefGoldZone(rowIndex, colIndex)) {
    return 'linear-gradient(135deg, rgba(220, 20, 60, 0.25), rgba(139, 0, 0, 0.2))';
  }

  // Trader Start Positions - Blue tint
  if (isTraderStartPosition(rowIndex, colIndex)) {
    return 'rgba(65, 105, 225, 0.15)';
  }

  // Thief Start Positions - Purple tint
  if (isThiefStartPosition(rowIndex, colIndex)) {
    return 'rgba(138, 43, 226, 0.15)';
  }

  // Gold cells
  if (cell.includes('Z')) return 'rgba(255, 215, 0, 0.3)';

  // Default
  return 'rgba(26, 15, 15, 0.4)';
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

