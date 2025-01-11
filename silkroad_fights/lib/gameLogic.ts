import { BossMonster, CombatResult, GameState, Unit, Position } from './types';

export const BOARD_SIZE = 8;
const SILK_SPAWN_INTERVAL = 3;
const BOSS_SPAWN_INTERVAL = 10;
const MAX_SILK_ON_BOARD = 3;

// New constants for game mechanics
const TRADER_DELIVERY_ZONES: Position[] = [
  { row: 7, col: 2 }, // A3
  { row: 7, col: 5 }  // A6
];

const THIEF_GOLD_ZONES: Position[] = [
  { row: 0, col: 2 }, // H3
  { row: 0, col: 5 }  // H6
];

const STARTING_POSITIONS = {
  TRADER: [
    { row: 7, col: 1 }, // Trader 1: A2
    { row: 7, col: 6 }, // Trader 2: A7
    { row: 6, col: 3 }  // Hunter: B4
  ],
  THIEF: [
    { row: 0, col: 1 }, // Thief 1: H2
    { row: 0, col: 6 }, // Thief 2: H7
    { row: 1, col: 3 }  // Kingthief: G4
  ]
};

export function initializeGame(gameMode: string): GameState {
  const board = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(''));
  const isTraderPlayer = gameMode === 'human_vs_ai_thief';

  // Initialize units with new starting positions
  const traderUnits: Unit[] = [
    { 
      type: 'TR', 
      hp: 2, 
      maxHp: 2, 
      row: STARTING_POSITIONS.TRADER[0].row, 
      col: STARTING_POSITIONS.TRADER[0].col, 
      abilities: ['Rush', 'Shield Wall', 'Fortify'], 
      buffs: [], 
      debuffs: [], 
      hasGold: false 
    },
    { 
      type: 'TR', 
      hp: 2, 
      maxHp: 2, 
      row: STARTING_POSITIONS.TRADER[1].row, 
      col: STARTING_POSITIONS.TRADER[1].col, 
      abilities: ['Rush', 'Shield Wall', 'Fortify'], 
      buffs: [], 
      debuffs: [], 
      hasGold: false 
    },
    { 
      type: 'H', 
      hp: 3, 
      maxHp: 3, 
      row: STARTING_POSITIONS.TRADER[2].row, 
      col: STARTING_POSITIONS.TRADER[2].col, 
      abilities: ['Guard', 'Track'], 
      buffs: [], 
      debuffs: [], 
      hasGold: false 
    }
  ];

  const thiefUnits: Unit[] = [
    { 
      type: 'TH', 
      hp: 2, 
      maxHp: 2, 
      row: STARTING_POSITIONS.THIEF[0].row, 
      col: STARTING_POSITIONS.THIEF[0].col, 
      abilities: ['Ambush', 'Disarm', 'Shadowstep'], 
      buffs: [], 
      debuffs: [] 
    },
    { 
      type: 'TH', 
      hp: 2, 
      maxHp: 2, 
      row: STARTING_POSITIONS.THIEF[1].row, 
      col: STARTING_POSITIONS.THIEF[1].col, 
      abilities: ['Ambush', 'Disarm', 'Shadowstep'], 
      buffs: [], 
      debuffs: [] 
    },
    { 
      type: 'KT', 
      hp: 3, 
      maxHp: 3, 
      row: STARTING_POSITIONS.THIEF[2].row, 
      col: STARTING_POSITIONS.THIEF[2].col, 
      abilities: ['Rally'], 
      buffs: [], 
      debuffs: [] 
    }
  ];

  // Place units on the board
  traderUnits.forEach(unit => {
    board[unit.row][unit.col] = formatUnit(unit);
  });
  thiefUnits.forEach(unit => {
    board[unit.row][unit.col] = formatUnit(unit);
  });

  // Place initial gold
  THIEF_GOLD_ZONES.forEach(({ row, col }) => {
    board[row][col] = 'Z';
  });

  // Place initial silk (max 3)
  placeRandomSilk(board, 3);

  return {
    board,
    traderUnits,
    thiefUnits,
    bossMonsters: [],
    silkCountTrader: 0,
    silkCountThief: 0,
    goldDelivered: 0,
    roundNumber: 1,
    currentPlayer: 'TRADER',
    selectedUnit: null,
    lastUsedAbility: null,
    traderWins: 0,
    thiefWins: 0,
    nextSilkSpawn: SILK_SPAWN_INTERVAL,
    nextBossSpawn: BOSS_SPAWN_INTERVAL,
    combatResult: null,
    traps: [],
    buffs: { TRADER: [], THIEF: [] },
    droppedGold: [],
    isTraderPlayer
  };
}

export function formatUnit(unit: Unit): string {
  return `${unit.type}${unit.hp}${unit.hasGold ? 'G' : ''}`;
}

export function getValidMoves(gameState: GameState, from: Position): Position[] {
  const validMoves: Position[] = [];
  const unit = gameState.board[from.row][from.col];
  
  // Check if unit is immobilized
  const unitObj = findUnit(gameState, from);
  if (unitObj?.isImmobilized) return [];

  // Get base movement range
  let maxDistance = 1; // Default movement of 1 tile
  
  // Check for movement-enhancing abilities
  if (unit.includes('TR') && hasActiveAbility(gameState, 'Rush')) maxDistance = 2;
  if (unit.includes('TH') && hasActiveAbility(gameState, 'Sprint')) maxDistance = 2;

  // Get valid moves within range
  for (let row = Math.max(0, from.row - maxDistance); row <= Math.min(BOARD_SIZE - 1, from.row + maxDistance); row++) {
    for (let col = Math.max(0, from.col - maxDistance); col <= Math.min(BOARD_SIZE - 1, from.col + maxDistance); col++) {
      if (row === from.row && col === from.col) continue;
      
      const distance = Math.abs(row - from.row) + Math.abs(col - from.col);
      if (distance <= maxDistance && isValidMove(gameState, from, { row, col })) {
        validMoves.push({ row, col });
      }
    }
  }

  return validMoves;
}

function isValidMove(gameState: GameState, from: Position, to: Position): boolean {
  const unit = gameState.board[from.row][from.col];
  const targetCell = gameState.board[to.row][to.col];

  // Check for traps
  if (gameState.traps.some(trap => trap.row === to.row && trap.col === to.col)) {
    return false;
  }

  // Check for friendly units
  if ((gameState.currentPlayer === 'TRADER' && (targetCell.includes('TR') || targetCell.includes('H'))) ||
      (gameState.currentPlayer === 'THIEF' && (targetCell.includes('TH') || targetCell.includes('KT')))) {
    return false;
  }

  // Check for boss monsters
  if (gameState.bossMonsters.some(boss => boss.position.row === to.row && boss.position.col === to.col)) {
    return false;
  }

  // Special case for Shadowstep ability
  if (hasActiveAbility(gameState, 'Shadowstep')) {
    return true;
  }

  return true;
}

export function moveUnit(gameState: GameState, from: Position, to: Position): GameState {
  const newGameState = { ...gameState };
  const movingUnit = newGameState.board[from.row][from.col];
  const targetCell = newGameState.board[to.row][to.col];

  // Handle gold pickup
  if (targetCell === 'Z' && movingUnit.includes('TR')) {
    const unit = findUnit(newGameState, from);
    if (unit && !unit.hasGold) {
      unit.hasGold = true;
      newGameState.board[to.row][to.col] = formatUnit(unit);
    }
  }

  // Handle gold delivery
  if (movingUnit.includes('TR') && isDeliveryZone(to)) {
    const unit = findUnit(newGameState, from);
    if (unit?.hasGold) {
      unit.hasGold = false;
      newGameState.goldDelivered++;
      newGameState.board[to.row][to.col] = formatUnit(unit);
    }
  }

  // Handle combat
  if (isEnemyUnit(movingUnit, targetCell)) {
    const combatResult = resolveCombat(newGameState, from, to);
    newGameState.combatResult = combatResult;

    // Handle unit death and gold dropping
    if (combatResult.defenderHp <= 0) {
      const defender = findUnit(newGameState, to);
      if (defender?.hasGold) {
        newGameState.droppedGold.push({ row: to.row, col: to.col });
      }
      removeUnit(newGameState, to);
    }
    if (combatResult.attackerHp <= 0) {
      const attacker = findUnit(newGameState, from);
      if (attacker?.hasGold) {
        newGameState.droppedGold.push({ row: from.row, col: from.col });
      }
      removeUnit(newGameState, from);
    }
  }

  // Handle silk collection
  if (targetCell === 'SI') {
    if (gameState.currentPlayer === 'TRADER') {
      newGameState.silkCountTrader++;
    } else {
      newGameState.silkCountThief++;
    }
  }

  // Update board state
  if (!newGameState.combatResult || newGameState.combatResult.winner === 'attacker') {
    newGameState.board[to.row][to.col] = movingUnit;
    newGameState.board[from.row][from.col] = '';
    updateUnitPosition(newGameState, from, to);
  }

  // Handle boss spawning
  if (newGameState.roundNumber % BOSS_SPAWN_INTERVAL === 0) {
    spawnBoss(newGameState);
  }

  // Handle silk spawning
  if (newGameState.roundNumber >= newGameState.nextSilkSpawn) {
    const silkCount = countSilkOnBoard(newGameState.board);
    if (silkCount < MAX_SILK_ON_BOARD) {
      placeRandomSilk(newGameState.board, 1);
    }
    newGameState.nextSilkSpawn = newGameState.roundNumber + SILK_SPAWN_INTERVAL;
  }

  // Update game state
  newGameState.currentPlayer = newGameState.currentPlayer === 'TRADER' ? 'THIEF' : 'TRADER';
  newGameState.roundNumber++;

  return newGameState;
}

export function useAbility(gameState: GameState, ability: string, targetPosition?: { row: number, col: number }): GameState {
  const newGameState = { ...gameState };
  const currentPlayer = newGameState.currentPlayer;
  const unitArray = newGameState.traderUnits;

  switch (ability) {
    case 'Rush':
      if (currentPlayer === 'TRADER') {
        newGameState.buffs.TRADER.push({ type: 'rush', duration: 1 });
      }
      break;
    case 'Shield Wall':
      if (currentPlayer === 'TRADER') {
        newGameState.buffs.TRADER.push({ type: 'damageReduction', duration: 1 });
      }
      break;
    case 'Fortify':
      if (currentPlayer === 'TRADER') {
        newGameState.buffs.TRADER.push({ type: 'fortify', duration: 1 });
      }
      break;
    case 'Guard':
      if (currentPlayer === 'TRADER' && targetPosition) {
        const hunterUnit = newGameState.traderUnits.find(u => u.type === 'H');
        const targetTrader = newGameState.traderUnits.find(u => u.row === targetPosition.row && u.col === targetPosition.col);
        if (hunterUnit && targetTrader) {
          targetTrader.buffs.push({ type: 'guarded', duration: 1 });
        }
      }
      break;
    case 'Track':
      if (currentPlayer === 'TRADER' && targetPosition) {
        const targetUnit = newGameState.thiefUnits.find(u => u.row === targetPosition.row && u.col === targetPosition.col);
        if (targetUnit) {
          targetUnit.debuffs.push({ type: 'tracked', duration: 1 });
        }
      }
      break;
    case 'Ambush':
      if (currentPlayer === 'THIEF' && targetPosition) {
        newGameState.traps.push({ row: targetPosition.row, col: targetPosition.col });
      }
      break;
    case 'Disarm':
      if (currentPlayer === 'THIEF' && targetPosition) {
        const targetUnit = newGameState.traderUnits.find(u => u.row === targetPosition.row && u.col === targetPosition.col);
        if (targetUnit && targetUnit.hasGold) {
          targetUnit.hasGold = false;
          newGameState.droppedGold.push({ row: targetPosition.row, col: targetPosition.col });
        }
      }
      break;
    case 'Shadowstep':
      // Implement Shadow Step ability (handled in movement logic)
      break;
    case 'Rally':
      if (currentPlayer === 'THIEF') {
        newGameState.buffs.THIEF.push({ type: 'attackBoost', duration: 1 });
      }
      break;
  }

  // Use silk to activate ability
  newGameState.silkCountTrader -= getAbilityCost(ability);

  newGameState.lastUsedAbility = ability;
  return newGameState;
}

function getAbilityCost(ability: string): number {
  switch (ability) {
    case 'Rush':
    case 'Ambush':
    case 'Fortify':
      return 1;
    case 'Shield Wall':
    case 'Disarm':
      return 2;
    case 'Track':
      return 3;
    case 'Shadowstep':
      return 3;
    case 'Rally':
      return 2;
    case 'Guard':
      return 1;
    default:
      return 0;
  }
}

function isEmptyCell(board: string[][], row: number, col: number): boolean {
  return board[row][col] === '';
}

function getEmptyCells(board: string[][]): { row: number, col: number }[] {
  const emptyCells: { row: number, col: number }[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (board[row][col] === '') {
        emptyCells.push({ row, col });
      }
    }
  }
  return emptyCells;
}

export function placeRandomSilk(board: string[][], n: number) {
  const emptyCells = getEmptyCells(board);
  if (emptyCells.length === 0) return;

  for (let i = 0; i < Math.min(n, emptyCells.length); i++) {
    const randomIndex = Math.floor(Math.random() * emptyCells.length);
    const { row, col } = emptyCells[randomIndex];
    board[row][col] = 'SI';
    emptyCells.splice(randomIndex, 1);
  }
}

function resolveCombat(gameState: GameState, attackerPos: Position, defenderPos: Position): CombatResult {
  const attackerUnit = findUnit(gameState, attackerPos)!;
  const defenderUnit = findUnit(gameState, defenderPos)!;

  let attackerWins = 0;
  let defenderWins = 0;
  const rolls = { attacker: [], defender: [] };

  for (let i = 0; i < 3; i++) {
    const attackRoll = rollDice() + getCombatModifier(gameState, attackerUnit);
    const defenseRoll = rollDice() + getCombatModifier(gameState, defenderUnit);
    
    rolls.attacker.push(attackRoll);
    rolls.defender.push(defenseRoll);

    if (attackRoll > defenseRoll) {
      attackerWins++;
    } else {
      defenderWins++;
    }
  }

  const winner = attackerWins > defenderWins ? 'attacker' : 'defender';
  const damage = getDamage(attackerUnit, defenderUnit);

  if (winner === 'attacker') {
    defenderUnit.hp -= damage;
  } else {
    attackerUnit.hp -= damage;
  }

  return {
    winner,
    attackRoll: rolls.attacker,
    defenseRoll: rolls.defender,
    attacker: attackerUnit.type,
    defender: defenderUnit.type,
    attackerHp: attackerUnit.hp,
    defenderHp: defenderUnit.hp
  };
}

function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function getCombatModifier(gameState: GameState, unit: Unit): number {
  let modifier = 0;

  // Apply buffs
  const playerBuffs = gameState.buffs[unit.type === 'TR' || unit.type === 'H' ? 'TRADER' : 'THIEF'];
  for (const buff of playerBuffs) {
    if (buff.type === 'damageReduction') modifier += 1;
    if (buff.type === 'attackBoost') modifier += 1;
  }

  // Apply debuffs
  for (const debuff of unit.debuffs) {
    if (debuff.type === 'tracked') modifier -= 1;
  }

  return modifier;
}

function getDamage(attacker: Unit, defender: Unit): number {
  return 1; // Hunter always deals 1 damage
}

function parseUnit(unitString: string): Unit {
  const type = unitString.slice(0, 2);
  const hp = parseInt(unitString.slice(2));
  return { 
    type, 
    hp, 
    maxHp: type === 'H' ? 3 : type === 'KT' ? 3 : 2, 
    row: -1, 
    col: -1, 
    abilities: [], 
    buffs: [], 
    debuffs: [],
    hasGold: unitString.includes('G'),
    isImmobilized: false
  };
}

function spawnBoss(gameState: GameState): void {
  // Only spawn if no boss exists
  if (gameState.bossMonsters.length > 0) return;

  const availableBosses = Object.keys(BOSS_TEMPLATES) as (keyof typeof BOSS_TEMPLATES)[];
  const bossType = availableBosses[Math.floor(Math.random() * availableBosses.length)];
  const bossTemplate = BOSS_TEMPLATES[bossType];

  // Find empty cells
  const emptyCells = getEmptyCells(gameState.board);
  if (emptyCells.length === 0) return;

  // Select random empty cell
  const spawnPosition = emptyCells[Math.floor(Math.random() * emptyCells.length)];

  // Create new boss
  const newBoss: BossMonster = {
    ...bossTemplate,
    position: spawnPosition
  };

  // Place boss on board
  gameState.board[spawnPosition.row][spawnPosition.col] = `BM${bossType[0]}`;
  gameState.bossMonsters.push(newBoss);
}

function updateUnitPosition(gameState: GameState, from: Position, to: Position) {
  const unitArray = gameState.currentPlayer === 'TRADER' ? gameState.traderUnits : gameState.thiefUnits;
  const unitIndex = unitArray.findIndex(u => u.row === from.row && u.col === from.col);
  if (unitIndex !== -1) {
    unitArray[unitIndex].row = to.row;
    unitArray[unitIndex].col = to.col;
  }
}

function removeUnit(gameState: GameState, position: Position) {
  const unitArray = gameState.currentPlayer === 'TRADER' ? gameState.traderUnits : gameState.thiefUnits;
  const unitIndex = unitArray.findIndex(u => u.row === position.row && u.col === position.col);
  if (unitIndex !== -1) {
    const removedUnit = unitArray.splice(unitIndex, 1)[0];
    if (removedUnit.hasGold) {
      gameState.droppedGold.push({ row: position.row, col: position.col });
    }
  }
}

export function makeAiMove(gameState: GameState, difficulty: string): GameState {
  let newGameState = { ...gameState };
  const aiUnits = newGameState.currentPlayer === 'TRADER' ? newGameState.traderUnits : newGameState.thiefUnits;

  if (aiUnits.length === 0) {
    return {
      ...newGameState,
      currentPlayer: newGameState.currentPlayer === 'TRADER' ? 'THIEF' : 'TRADER',
      roundNumber: newGameState.roundNumber + 1
    };
  }

  switch (difficulty) {
    case 'noob':
      return makeNoobAiMove(newGameState, aiUnits);
    case 'normal':
      return makeNormalAiMove(newGameState, aiUnits);
    case 'silkroad':
      return makeSilkroadAiMove(newGameState, aiUnits);
    default:
      return makeNormalAiMove(newGameState, aiUnits);
  }
}

function makeNoobAiMove(gameState: GameState, aiUnits: Unit[]): GameState {
  if (aiUnits.length === 0) {
    return {
      ...gameState,
      currentPlayer: gameState.currentPlayer === 'TRADER' ? 'THIEF' : 'TRADER',
      roundNumber: gameState.roundNumber + 1
    };
  }

  const randomUnit = aiUnits[Math.floor(Math.random() * aiUnits.length)];
  const validMoves = getValidMoves(gameState, { row: randomUnit.row, col: randomUnit.col });

  if (validMoves.length > 0) {
    const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
    return moveUnit(gameState, { row: randomUnit.row, col: randomUnit.col }, randomMove);
  }

  // If no valid moves, pass the turn
  return {
    ...gameState,
    currentPlayer: gameState.currentPlayer === 'TRADER' ? 'THIEF' : 'TRADER',
    roundNumber: gameState.roundNumber + 1
  };
}

function makeNormalAiMove(gameState: GameState, aiUnits: Unit[]): GameState {
  if (aiUnits.length === 0) {
    return {
      ...gameState,
      currentPlayer: gameState.currentPlayer === 'TRADER' ? 'THIEF' : 'TRADER',
      roundNumber: gameState.roundNumber + 1
    };
  }

  // Prioritize collecting Silk and targeting Traders
  for (const unit of aiUnits) {
    const validMoves = getValidMoves(gameState, { row: unit.row, col: unit.col });
    
    // Check for Silk collection
    const silkMove = validMoves.find(move => gameState.board[move.row][move.col] === 'SI');
    if (silkMove) {
      return moveUnit(gameState, { row: unit.row, col: unit.col }, silkMove);
    }

    // Check for attacking Traders
    const attackMove = validMoves.find(move => {
      const targetCell = gameState.board[move.row][move.col];
      return targetCell.includes('TR') || targetCell.includes('H');
    });
    if (attackMove) {
      return moveUnit(gameState, { row: unit.row, col: unit.col }, attackMove);
    }
  }

  // If no priority moves, make a random move
  return makeNoobAiMove(gameState, aiUnits);
}

function makeSilkroadAiMove(gameState: GameState, aiUnits: Unit[]): GameState {
  // Aggressively hunt Traders and coordinate attacks
  const traderPositions = gameState.traderUnits.map(u => ({ row: u.row, col: u.col }));

  for (const unit of aiUnits) {
    const validMoves = getValidMoves(gameState, { row: unit.row, col: unit.col });

    // Check for attacking Traders, prioritizing those carrying Gold
    const attackMove = validMoves.find(move => {
      const targetCell = gameState.board[move.row][move.col];
      return targetCell.includes('TR') || targetCell.includes('H');
    });
    if (attackMove) {
      return moveUnit(gameState, { row: unit.row, col: unit.col }, attackMove);
    }

    // Move towards the nearest Trader
    if (traderPositions.length > 0) {
      const nearestTrader = findNearestTrader(unit, traderPositions);
      const moveTowardsTrader = validMoves.reduce((best, move) => {
        const currentDistance = Math.abs(move.row - nearestTrader.row) + Math.abs(move.col - nearestTrader.col);
        const bestDistance = Math.abs(best.row - nearestTrader.row) + Math.abs(best.col - nearestTrader.col);
        return currentDistance < bestDistance ? move : best;
      });
      return moveUnit(gameState, { row: unit.row, col: unit.col }, moveTowardsTrader);
    }
  }

  // If no priority moves, make a normal move
  return makeNormalAiMove(gameState, aiUnits);
}

function findNearestTrader(unit: Unit, traderPositions: { row: number, col: number }[]): { row: number, col: number } {
  return traderPositions.reduce((nearest, current) => {
    const currentDistance = Math.abs(current.row - unit.row) + Math.abs(current.col - unit.col);
    const nearestDistance = Math.abs(nearest.row - unit.row) + Math.abs(nearest.col - unit.col);
    return currentDistance < nearestDistance ? current : nearest;
  });
}

export function handleBossTurn(gameState: GameState): GameState {
  const newGameState = { ...gameState };

  for (const boss of newGameState.bossMonsters) {
    // Find nearby units
    const nearbyUnits = [...newGameState.traderUnits, ...newGameState.thiefUnits].filter(unit => 
      Math.abs(unit.row - boss.position.row) <= boss.range && 
      Math.abs(unit.col - boss.position.col) <= boss.range
    );

    if (nearbyUnits.length > 0) {
      // Attack a random nearby unit
      const targetUnit = nearbyUnits[Math.floor(Math.random() * nearbyUnits.length)];
      targetUnit.hp -= boss.damage;

      if (targetUnit.hp <= 0) {
        removeUnit(newGameState, { row: targetUnit.row, col: targetUnit.col });
        newGameState.board[targetUnit.row][targetUnit.col] = '';
      } else {
        newGameState.board[targetUnit.row][targetUnit.col] = formatUnit(targetUnit);
      }
    } else {
      // Move randomly if no units are nearby
      const validMoves = getValidMoves(newGameState, boss.position);
      if (validMoves.length > 0) {
        const newPosition = validMoves[Math.floor(Math.random() * validMoves.length)];
        newGameState.board[boss.position.row][boss.position.col] = '';
        boss.position = newPosition;
        newGameState.board[newPosition.row][newPosition.col] = `BM${boss.type[0]}`;
      }
    }
  }

  return newGameState;
}

export function checkVictoryConditions(gameState: GameState): string | null {
  if (gameState.goldDelivered === 2) {
    return 'TRADER';
  }
  if (gameState.traderUnits.filter(u => u.type === 'TR').length === 0) {
    return 'THIEF';
  }
  return null;
}

export function attackBoss(gameState: GameState, from: Position, boss: BossMonster): GameState {
  const newGameState = { ...gameState };
  const attackingUnit = findUnit(newGameState, from)!;

  const attackRoll = rollDice() + getCombatModifier(newGameState, attackingUnit);
  const defenseRoll = rollDice();

  if (attackRoll > defenseRoll) {
    boss.hp -= 1;
    if (boss.hp <= 0) {
      // Boss defeated
      newGameState.bossMonsters = newGameState.bossMonsters.filter(b => b !== boss);
      newGameState.board[boss.position.row][boss.position.col] = '';
      
      // Distribute rewards
      if (newGameState.currentPlayer === 'TRADER') {
        newGameState.silkCountTrader += boss.rewards.silk;
      } else {
        newGameState.silkCountThief += boss.rewards.silk;
      }
      
      // Apply buffs
      boss.rewards.buffs.forEach(buff => {
        newGameState.buffs[newGameState.currentPlayer].push({ type: buff, duration: 3 });
      });
    }
  } else {
    // Boss successfully defends
    attackingUnit.hp -= boss.damage;
    if (attackingUnit.hp <= 0) {
      removeUnit(newGameState, from);
      newGameState.board[from.row][from.col] = '';
    } else {
      newGameState.board[from.row][from.col] = formatUnit(attackingUnit);
    }
  }

  newGameState.combatResult = {
    winner: attackRoll > defenseRoll ? 'attacker' : 'defender',
    attackRoll: [attackRoll],
    defenseRoll: [defenseRoll],
    attacker: attackingUnit.type,
    defender: boss.type,
    attackerHp: attackingUnit.hp,
    defenderHp: boss.hp
  };

  return newGameState;
}

export function updateGameState(gameState: GameState): GameState {
  let newGameState = { ...gameState };

  // Handle boss turns
  newGameState = handleBossTurn(newGameState);

  // Check for victory conditions
  const victor = checkVictoryConditions(newGameState);
  if (victor) {
    if (victor === 'TRADER') {
      newGameState.traderWins++;
    } else {
      newGameState.thiefWins++;
    }
  }

  return newGameState;
}

const BOSS_TEMPLATES: Record<string, Omit<BossMonster, 'position'>> = {
  TigerGiry: {
    type: 'TigerGiry',
    hp: 5,
    maxHp: 5,
    damage: 3,
    range: 1,
    movementPattern: 'random',
    rewards: {
      silk: 2,
      buffs: ['speed']
    }
  },
  SkeletoKing: {
    type: 'SkeletoKing',
    hp: 5,
    maxHp: 5,
    damage: 3,
    range: 1,
    movementPattern: 'stationary',
    rewards: {
      silk: 0,
      buffs: ['combatRoll']
    }
  },
  Murucha: {
    type: 'Murucha',
    hp: 5,
    maxHp: 5,
    damage: 3,
    range: 1,
    movementPattern: 'area',
    rewards: {
      silk: 0,
      buffs: ['heal']
    }
  }
};

function findUnit(gameState: GameState, position: Position): Unit | undefined {
  return [...gameState.traderUnits, ...gameState.thiefUnits]
    .find(unit => unit.row === position.row && unit.col === position.col);
}

function isDeliveryZone(position: Position): boolean {
  return TRADER_DELIVERY_ZONES.some(zone => 
    zone.row === position.row && zone.col === position.col
  );
}

function hasActiveAbility(gameState: GameState, ability: string): boolean {
  return gameState.lastUsedAbility === ability;
}

function isEnemyUnit(attacker: string, defender: string): boolean {
  return (attacker.includes('TR') || attacker.includes('H')) && (defender.includes('TH') || defender.includes('KT')) ||
         (attacker.includes('TH') || attacker.includes('KT')) && (defender.includes('TR') || defender.includes('H'));
}

function countSilkOnBoard(board: string[][]): number {
  return board.flat().filter(cell => cell === 'SI').length;
}

