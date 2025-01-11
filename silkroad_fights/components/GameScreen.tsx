"use client"

import { useState, useEffect } from 'react'
import { theme } from '../lib/theme'
import GameBoard from './GameBoard'
import { DiceRoll } from './DiceRoll'
import { BossAnnouncement } from './BossAnnouncement'
import UnitDetails from './UnitDetails'
import { 
  type GameState, 
  initializeGame, 
  makeAiMove, 
  moveUnit, 
  getValidMoves, 
  useAbility,
  attackBoss,
  updateGameState,
  type Unit
} from '../lib/gameLogic'
import { BossMonster } from '../lib/types'

interface GameScreenProps {
  gameMode: string
  aiDifficulty: string
  isMuted: boolean
  setIsMuted: (muted: boolean) => void
  volume: number
  setVolume: (volume: number) => void
}

export default function GameScreen({ gameMode, aiDifficulty, isMuted, setIsMuted, volume, setVolume }: GameScreenProps) {
  const [gameState, setGameState] = useState<GameState>(() => initializeGame(gameMode));
  const [selectedUnit, setSelectedUnit] = useState<{ row: number, col: number } | null>(null);
  const [validMoves, setValidMoves] = useState<{ row: number, col: number }[]>([]);
  const [showDice, setShowDice] = useState(false);
  const [newBoss, setNewBoss] = useState<BossMonster | null>(null);
  const [defeatedBoss, setDefeatedBoss] = useState<BossMonster | null>(null);
  const [shownBosses, setShownBosses] = useState<Set<string>>(new Set());
  const [selectedUnitDetails, setSelectedUnitDetails] = useState<Unit | null>(null);
  const isTraderPlayer = gameMode === 'human_vs_ai_thief';

  useEffect(() => {
    if (!gameState) return;

    const latestBoss = gameState.bossMonsters[gameState.bossMonsters.length - 1];
    if (latestBoss && !shownBosses.has(latestBoss.type)) {
      setNewBoss(latestBoss);
      setShownBosses(prev => new Set([...prev, latestBoss.type]));
    }

    if ((isTraderPlayer && gameState.currentPlayer === 'THIEF') ||
        (!isTraderPlayer && gameState.currentPlayer === 'TRADER')) {
      setTimeout(() => {
        if (gameState.traderUnits.length > 0 && gameState.thiefUnits.length > 0) {
          const newState = makeAiMove(gameState, aiDifficulty);
          setGameState(prevState => updateGameState(newState));
        } else {
          // Handle game over or reset
          console.log("Game over: One side has no units left");
          // You might want to trigger a game over state or reset the game here
        }
        setSelectedUnit(null);
        setValidMoves([]);
      }, 1000);
    }
  }, [gameState, isTraderPlayer, aiDifficulty, shownBosses]);

  const handleCellClick = (row: number, col: number) => {
    if (!gameState) return;
    
    if ((isTraderPlayer && gameState.currentPlayer !== 'TRADER') ||
        (!isTraderPlayer && gameState.currentPlayer !== 'THIEF')) {
      return;
    }

    if (!selectedUnit) {
      const cell = gameState.board[row][col];
      if ((isTraderPlayer && (cell.includes('TR') || cell.includes('H'))) ||
          (!isTraderPlayer && (cell.includes('TH') || cell.includes('KT')))) {
        setSelectedUnit({ row, col });
        setValidMoves(getValidMoves(gameState, { row, col }));
        const unitDetails = gameState.traderUnits.find(u => u.row === row && u.col === col) ||
                            gameState.thiefUnits.find(u => u.row === row && u.col === col) ||
                            null;
        setSelectedUnitDetails(unitDetails);
      }
      return;
    }

    if (validMoves.some(move => move.row === row && move.col === col)) {
      const newState = moveUnit(gameState, selectedUnit, { row, col });
      if (newState.combatResult) {
        setShowDice(true);
      }
      setGameState(prevState => updateGameState(newState));
      setSelectedUnit(null);
      setValidMoves([]);
      setSelectedUnitDetails(null);
    } else {
      setSelectedUnit(null);
      setValidMoves([]);
      setSelectedUnitDetails(null);
    }
  };

  const handleAbilityUse = (ability: string) => {
    if (!gameState) return;
    const newState = useAbility(gameState, ability);
    if (newState !== gameState) {
      setGameState(prevState => updateGameState(newState));
    }
  };

  const abilities = isTraderPlayer
    ? [
        { name: 'Evasion', cost: 1, description: 'Avoid one incoming attack' },
        { name: 'Sprint', cost: 2, description: 'Increase movement range to 4 tiles for one turn' },
        { name: 'Shield Bash', cost: 2, description: 'Reduce incoming damage by 1' },
        { name: 'Track Prey', cost: 3, description: 'Reveal enemy positions' },
        { name: 'Guard', cost: 1, description: 'Protect an adjacent Trader' },
      ]
    : [
        { name: 'Shadow Step', cost: 2, description: 'Move through occupied spaces' },
        { name: 'Steal Silk', cost: 3, description: 'Steal resources from adjacent unit' },
        { name: 'Set Trap', cost: 2, description: 'Place an immobilizing trap' },
      ];

  return (
    <div className="h-screen w-full p-2 relative overflow-hidden flex flex-col">
      <div className="relative z-10 flex-grow flex flex-col">
        <div className="flex justify-center items-center mb-2">
          {/* <img src={theme.images.logo} alt="Silkroad Fights" className="h-12" /> */}
          <h2 className="text-xl font-bold text-white">
            {isTraderPlayer ? 'Player (Trader) VS CPU (Thief)' : 'Player (Thief) VS CPU (Trader)'}
          </h2>
        </div>

        <div className="mb-2 p-2 rounded-lg text-xs" style={{ 
          background: 'linear-gradient(180deg, #FFA500 0%, #8B4513 100%)',
          border: '2px solid #D4AF37'
        }}>
          <div className="grid grid-cols-2 gap-1 text-white">
            <div>
              <p>Faction: {isTraderPlayer ? 'Silk Traders' : 'Shadow Thieves'}</p>
              <p>Epoch: {gameState.roundNumber}</p>
            </div>
            <div>
              <p>Trader: {gameState.silkCountTrader} Silk, {gameState.goldDelivered} Gold</p>
              <p>Thief: {gameState.silkCountThief} Silk</p>
            </div>
          </div>
        </div>

        <div className="flex-grow flex gap-2">
          <div className="flex-grow" style={{ maxWidth: 'calc(100vh - 180px)', maxHeight: 'calc(100vh - 180px)' }}>
            <GameBoard 
              board={gameState.board}
              selectedUnit={selectedUnit}
              validMoves={validMoves}
              onCellClick={handleCellClick}
              bossMonsters={gameState.bossMonsters}
            />
          </div>
          
          <div className="w-40 space-y-2 text-xs">
            <div className="p-2 rounded-lg" style={{ 
              background: 'rgba(139, 69, 19, 0.3)',
              border: '2px solid #D4AF37'
            }}>
              <h3 className="text-sm font-bold mb-1 text-white">
                {isTraderPlayer ? 'Silk Trader' : 'Shadow Thief'} Abilities
              </h3>
              <div className="space-y-1">
                {abilities.map((ability) => (
                  <button
                    key={ability.name}
                    className="w-full p-1 text-white font-bold rounded text-xs"
                    style={{ background: theme.gradients.button }}
                    onClick={() => handleAbilityUse(ability.name)}
                    disabled={
                      (isTraderPlayer && gameState.silkCountTrader < ability.cost) ||
                      (!isTraderPlayer && gameState.silkCountThief < ability.cost) ||
                      gameState.lastUsedAbility === ability.name
                    }
                  >
                    {ability.name} ({ability.cost} Silk)
                  </button>
                ))}
              </div>
            </div>
            {gameState.lastUsedAbility && (
              <div className="p-1 rounded-lg bg-green-800 text-white text-xs">
                Last used: {gameState.lastUsedAbility}
              </div>
            )}
            {selectedUnitDetails && (
              <UnitDetails unit={selectedUnitDetails} />
            )}
          </div>
        </div>

        {showDice && gameState.combatResult && (
          <DiceRoll
            attackRoll={gameState.combatResult.attackRoll}
            defenseRoll={gameState.combatResult.defenseRoll}
            attacker={gameState.combatResult.attacker}
            defender={gameState.combatResult.defender}
            attackerHp={gameState.combatResult.attackerHp}
            defenderHp={gameState.combatResult.defenderHp}
            onComplete={() => setShowDice(false)}
          />
        )}

        {newBoss && (
          <BossAnnouncement
            bossType={newBoss.type}
            onClose={() => setNewBoss(null)}
          />
        )}

        {(gameState.traderWins === 2 || gameState.thiefWins === 2) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg text-center">
              <h2 className="text-2xl font-bold mb-2">
                {gameState.traderWins === 2 ? 'Traders Win!' : 'Thieves Win!'}
              </h2>
              <p className="mb-2">
                {gameState.traderWins === 2
                  ? 'The Silk Traders have won 2 rounds!'
                  : 'The Shadow Thieves have won 2 rounds!'}
              </p>
              <button
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => window.location.reload()}
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

