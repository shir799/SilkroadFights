import React from 'react'
import { theme } from '../lib/theme'
import { HealthBar } from './HealthBar'
import { motion } from 'framer-motion';
import { BossMonster } from '../lib/types';
import { StarIcon, CoinIcon } from './Icons';

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
                {/* Zone indicators - top right corner */}
                {isTraderDeliveryZone(rowIndex, colIndex) && (
                  <motion.div
                    className="absolute top-0.5 right-0.5 z-10"
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 5, -5, 0]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <StarIcon className="w-4 h-4" color="#00FF7F" filled={true} />
                  </motion.div>
                )}
                {isThiefGoldZone(rowIndex, colIndex) && (
                  <motion.div
                    className="absolute top-0.5 right-0.5 z-10"
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <CoinIcon className="w-5 h-5" color="#FFD700" />
                  </motion.div>
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
    return 'linear-gradient(135deg, rgba(255, 69, 0, 0.6), rgba(139, 0, 0, 0.4))' // Stronger orange/red gradient for boss cells
  }

  // Trader Delivery Zones - Stronger green glow
  if (isTraderDeliveryZone(rowIndex, colIndex)) {
    return 'linear-gradient(135deg, rgba(0, 255, 127, 0.35), rgba(34, 139, 34, 0.25))';
  }

  // Thief Gold Zones - Stronger red glow
  if (isThiefGoldZone(rowIndex, colIndex)) {
    return 'linear-gradient(135deg, rgba(220, 20, 60, 0.35), rgba(139, 0, 0, 0.25))';
  }

  // Trader Start Positions - Blue tint
  if (isTraderStartPosition(rowIndex, colIndex)) {
    return 'rgba(65, 105, 225, 0.12)';
  }

  // Thief Start Positions - Purple tint
  if (isThiefStartPosition(rowIndex, colIndex)) {
    return 'rgba(138, 43, 226, 0.12)';
  }

  // Gold cells - brighter
  if (cell.includes('Z')) return 'rgba(255, 215, 0, 0.35)';

  // Silk cells - purple tint
  if (cell.includes('SI')) return 'rgba(138, 43, 226, 0.2)';

  // Default - darker for better contrast
  return 'rgba(20, 10, 10, 0.5)';
}

function renderGamePiece(cell: string, boss: BossMonster | undefined) {
  const commonImageClasses = "w-full h-full object-contain p-1"; // Reduced padding for better visibility

  // Enhanced shadow for all units
  const unitShadow = 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 3px rgba(255,255,255,0.5))';
  const bossShadow = 'drop-shadow(0 0 10px rgba(255,69,0,0.9)) drop-shadow(0 0 5px rgba(255,165,0,0.7))';

  // Render boss with enhanced glow
  if (boss) {
    const bossImageSrc = boss.type === 'TigerGiry' ? theme.images.tigergiry :
                        boss.type === 'SkeletoKing' ? theme.images.skeletoking :
                        theme.images.murucha;
    return (
      <motion.img
        src={bossImageSrc}
        alt={boss.type}
        className={commonImageClasses}
        style={{ filter: bossShadow }}
        animate={{
          filter: [
            bossShadow,
            'drop-shadow(0 0 15px rgba(255,69,0,1)) drop-shadow(0 0 8px rgba(255,165,0,0.9))',
            bossShadow
          ]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    );
  }

  // Render units with color-coded glows
  if (cell.includes('TR') || cell.includes('H') || cell.includes('TH') || cell.includes('KT')) {
    let imageSrc = '';
    let glowColor = '';
    let unitName = '';

    if (cell.includes('TR')) {
      imageSrc = theme.images.trader;
      glowColor = 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 4px rgba(65,105,225,0.8))'; // Blue glow for traders
      unitName = "Trader";
    } else if (cell.includes('H')) {
      imageSrc = theme.images.hunter;
      glowColor = 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 4px rgba(34,139,34,0.8))'; // Green glow for hunter
      unitName = "Hunter";
    } else if (cell.includes('KT')) {
      imageSrc = theme.images.kingThief;
      glowColor = 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 4px rgba(138,43,226,0.8))'; // Purple glow for kingthief
      unitName = "King Thief";
    } else if (cell.includes('TH')) {
      imageSrc = theme.images.thief;
      glowColor = 'drop-shadow(0 0 6px rgba(0,0,0,0.9)) drop-shadow(0 0 4px rgba(220,20,60,0.8))'; // Red glow for thieves
      unitName = "Thief";
      return (
        <div className="w-full h-full relative flex items-center justify-center">
          <img
            src={imageSrc}
            alt={unitName}
            className="w-[90%] h-[90%] object-contain"
            style={{ filter: glowColor }}
          />
        </div>
      );
    }

    if (imageSrc) {
      return (
        <img
          src={imageSrc}
          alt={unitName}
          className={commonImageClasses}
          style={{ filter: glowColor }}
        />
      );
    }
  }

  // Render other game pieces with enhanced visibility
  if (cell.includes('SI')) {
    return (
      <motion.img
        src={theme.images.silk}
        alt="Silk"
        className={commonImageClasses}
        style={{ filter: 'drop-shadow(0 0 6px rgba(138,43,226,0.8)) brightness(1.2)' }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 2, -2, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    );
  }

  if (cell.includes('X')) {
    return (
      <motion.img
        src={theme.images.trap}
        alt="Trap"
        className={commonImageClasses}
        style={{ filter: 'drop-shadow(0 0 4px rgba(255,0,0,0.7))' }}
        animate={{
          opacity: [0.6, 0.9, 0.6]
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    );
  }

  if (cell.includes('Z')) {
    return (
      <motion.img
        src={theme.images.gold}
        alt="Gold"
        className={commonImageClasses}
        style={{ filter: 'drop-shadow(0 0 8px rgba(255,215,0,0.9)) brightness(1.3)' }}
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    );
  }

  return null;
}

export default GameBoard;

