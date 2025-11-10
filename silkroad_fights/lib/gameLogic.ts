import { BossMonster, CombatResult, GameState, Unit, Position } from './types';

export const BOARD_SIZE = 8;
const SILK_SPAWN_INTERVAL = 3;
const BOSS_SPAWN_INTERVAL = 10;
const MAX_SILK_ON_BOARD = 3;

// New constants for game mechanics
// Board coordinates: Row 0 = H (top), Row 7 = A (bottom), Col 0 = 1 (left), Col 7 = 8 (right)
const TRADER_DELIVERY_ZONES: Position[] = [
  { row: 7, col: 0 }, // A1 - Trader 1 delivery zone
  { row: 7, col: 1 }  // B1 - Trader 2 delivery zone
];

const GOLD_SPAWN_POSITIONS: Position[] = [
  { row: 3, col: 6 }, // G4 in game notation (row 3 = 5th from bottom, col 6 = G)
  { row: 6, col: 6 }  // G7 in game notation (row 6 = 2nd from bottom, col 6 = G)
];

const STARTING_POSITIONS = {
  TRADER: [
    { row: 7, col: 0 }, // Trader 1: A1
    { row: 7, col: 1 }, // Trader 2: B1
    { row: 7, col: 2 }  // Hunter: C1
  ],
  THIEF: [
    { row: 0, col: 7 }, // Thief 1: H8
    { row: 5, col: 7 }, // Thief 2: H6 (adjusted)
    { row: 2, col: 7 }  // Kingthief: H3
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

  // Place initial gold at G4 and G7
  GOLD_SPAWN_POSITIONS.forEach(({ row, col }) => {
    board[row][col] = 'G';
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

  // Hunter moves 2 tiles per turn
  if (unit.includes('H')) maxDistance = 2;

  // Check for movement-enhancing abilities
  const currentPlayer = gameState.currentPlayer;
  const playerBuffs = gameState.buffs[currentPlayer];

  if (unit.includes('TR') && playerBuffs.some(buff => buff.type === 'rush')) {
    maxDistance = 2;
  }

  if (unit.includes('TH') && playerBuffs.some(buff => buff.type === 'shadowstep')) {
    maxDistance = 2;
  }

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

  // Check for traps - Traders can step on traps (will be damaged), Thieves can't step on their own traps
  const isTrap = gameState.traps.some(trap => trap.row === to.row && trap.col === to.col);
  if (isTrap && gameState.currentPlayer === 'THIEF') {
    // Thieves can't walk on their own traps
    return false;
  }
  // Traders CAN walk on traps (they will be damaged)

  // Check for friendly units
  if ((gameState.currentPlayer === 'TRADER' && (targetCell.includes('TR') || targetCell.includes('H'))) ||
      (gameState.currentPlayer === 'THIEF' && (targetCell.includes('TH') || targetCell.includes('KT')))) {
    return false;
  }

  // Hunter can only attack Thieves and Bosses (not empty cells or gold)
  if (unit.includes('H') && targetCell !== '' && !targetCell.includes('TH') && !targetCell.includes('KT') && !targetCell.includes('BM')) {
    // Allow moving to silk
    if (targetCell === 'SI') {
      return true;
    }
    // Allow moving to traps (will be damaged)
    if (targetCell === 'X') {
      return true;
    }
    // Don't allow moving to gold zones or other non-combat targets
    return false;
  }

  // Check for boss monsters - can be attacked by any unit
  if (gameState.bossMonsters.some(boss => boss.position.row === to.row && boss.position.col === to.col)) {
    return true; // Allow attacking bosses
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

  // Handle gold pickup (only Traders can pick up gold)
  if (targetCell === 'G' && movingUnit.includes('TR')) {
    const unit = findUnit(newGameState, from);
    if (unit && !unit.hasGold) {
      unit.hasGold = true;
    }
  }

  // Handle dropped gold pickup
  const droppedGoldIndex = newGameState.droppedGold.findIndex(g => g.row === to.row && g.col === to.col);
  if (droppedGoldIndex !== -1 && movingUnit.includes('TR')) {
    const unit = findUnit(newGameState, from);
    if (unit && !unit.hasGold) {
      unit.hasGold = true;
      newGameState.droppedGold.splice(droppedGoldIndex, 1);
    }
  }

  // Handle gold delivery (Traders delivering to delivery zones)
  if (movingUnit.includes('TR') && isDeliveryZone(to)) {
    const unit = findUnit(newGameState, from);
    if (unit?.hasGold) {
      unit.hasGold = false;
      newGameState.goldDelivered++;
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
        // Gold drops at defender's position
        newGameState.droppedGold.push({ row: to.row, col: to.col });
        defender.hasGold = false;
      }
      removeUnit(newGameState, to);
    }
    if (combatResult.attackerHp <= 0) {
      const attacker = findUnit(newGameState, from);
      if (attacker?.hasGold) {
        // Gold drops at attacker's position
        newGameState.droppedGold.push({ row: from.row, col: from.col });
        attacker.hasGold = false;
      }
      removeUnit(newGameState, from);
    }
  }

  // Hunter can reclaim dropped gold from defeated Thieves
  if (movingUnit.includes('H') && targetCell.includes('TH') && newGameState.combatResult?.winner === 'attacker') {
    const droppedGoldIndex = newGameState.droppedGold.findIndex(g => g.row === to.row && g.col === to.col);
    if (droppedGoldIndex !== -1) {
      // Gold is reclaimed - it will appear at the dropped location for Traders to pick up
      // Hunter doesn't carry it, just prevents Thieves from having it
    }
  }

  // Handle trap activation
  if (targetCell === 'X') {
    const movingUnitObj = findUnit(newGameState, from);
    if (movingUnitObj) {
      // Trap deals 1 damage
      movingUnitObj.hp -= 1;
      if (movingUnitObj.hp <= 0) {
        if (movingUnitObj.hasGold) {
          newGameState.droppedGold.push({ row: to.row, col: to.col });
        }
        removeUnit(newGameState, from);
        newGameState.board[from.row][from.col] = '';
        // Remove trap
        const trapIndex = newGameState.traps.findIndex(t => t.row === to.row && t.col === to.col);
        if (trapIndex !== -1) {
          newGameState.traps.splice(trapIndex, 1);
        }
        return newGameState; // Unit died on trap, end move
      }
    }
    // Remove trap after activation
    const trapIndex = newGameState.traps.findIndex(t => t.row === to.row && t.col === to.col);
    if (trapIndex !== -1) {
      newGameState.traps.splice(trapIndex, 1);
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
    // Get the updated unit to reflect any changes (like hasGold)
    const updatedUnit = findUnit(newGameState, from);
    if (updatedUnit) {
      newGameState.board[to.row][to.col] = formatUnit(updatedUnit);
      updateUnitPosition(newGameState, from, to);
    } else {
      newGameState.board[to.row][to.col] = movingUnit;
      updateUnitPosition(newGameState, from, to);
    }

    // Clear the origin cell, but preserve gold if it was there
    const wasGoldSpawnPoint = GOLD_SPAWN_POSITIONS.some(pos => pos.row === from.row && pos.col === from.col);
    if (wasGoldSpawnPoint && !targetCell.includes('G')) {
      newGameState.board[from.row][from.col] = 'G';
    } else {
      newGameState.board[from.row][from.col] = '';
    }

    // Handle dropped gold display
    for (const droppedGold of newGameState.droppedGold) {
      if (newGameState.board[droppedGold.row][droppedGold.col] === '') {
        newGameState.board[droppedGold.row][droppedGold.col] = 'G';
      }
    }
  }

  // Update buffs and debuffs durations
  updateBuffsAndDebuffs(newGameState);

  // Update game state
  newGameState.currentPlayer = newGameState.currentPlayer === 'TRADER' ? 'THIEF' : 'TRADER';
  newGameState.roundNumber++;

  // Handle boss spawning (only once per round interval)
  if (newGameState.roundNumber >= newGameState.nextBossSpawn && newGameState.bossMonsters.length === 0) {
    spawnBoss(newGameState);
    newGameState.nextBossSpawn = newGameState.roundNumber + BOSS_SPAWN_INTERVAL;
  }

  // Handle silk spawning
  if (newGameState.roundNumber >= newGameState.nextSilkSpawn) {
    const silkCount = countSilkOnBoard(newGameState.board);
    if (silkCount < MAX_SILK_ON_BOARD) {
      placeRandomSilk(newGameState.board, 1);
    }
    newGameState.nextSilkSpawn = newGameState.roundNumber + SILK_SPAWN_INTERVAL;
  }

  return newGameState;
}

function updateBuffsAndDebuffs(gameState: GameState) {
  // Update player buffs
  gameState.buffs.TRADER = gameState.buffs.TRADER
    .map(buff => ({ ...buff, duration: buff.duration - 1 }))
    .filter(buff => buff.duration > 0);

  gameState.buffs.THIEF = gameState.buffs.THIEF
    .map(buff => ({ ...buff, duration: buff.duration - 1 }))
    .filter(buff => buff.duration > 0);

  // Update unit buffs and debuffs
  const allUnits = [...gameState.traderUnits, ...gameState.thiefUnits];
  for (const unit of allUnits) {
    unit.buffs = unit.buffs
      .map(buff => ({ ...buff, duration: buff.duration - 1 }))
      .filter(buff => buff.duration > 0);

    unit.debuffs = unit.debuffs
      .map(debuff => ({ ...debuff, duration: debuff.duration - 1 }))
      .filter(debuff => debuff.duration > 0);

    // Apply poison DoT damage
    const poisonDebuff = unit.debuffs.find(d => d.type === 'poison');
    if (poisonDebuff) {
      unit.hp -= 1;
      if (unit.hp <= 0) {
        removeUnit(gameState, { row: unit.row, col: unit.col });
        gameState.board[unit.row][unit.col] = '';
      } else {
        gameState.board[unit.row][unit.col] = formatUnit(unit);
      }
    }
  }
}

export function useAbility(gameState: GameState, ability: string, targetPosition?: { row: number, col: number }): GameState {
  const newGameState = { ...gameState };
  const currentPlayer = newGameState.currentPlayer;
  const abilityCost = getAbilityCost(ability);

  // Check if player has enough silk
  const playerSilk = currentPlayer === 'TRADER' ? newGameState.silkCountTrader : newGameState.silkCountThief;
  if (playerSilk < abilityCost) {
    return gameState; // Not enough silk, return unchanged
  }

  switch (ability) {
    // Trader abilities
    case 'Rush':
      if (currentPlayer === 'TRADER') {
        newGameState.buffs.TRADER.push({ type: 'rush', duration: 1 });
      }
      break;

    case 'Trade':
      // Swap positions with another Trader
      if (currentPlayer === 'TRADER' && targetPosition && gameState.selectedUnit) {
        const trader1 = findUnit(newGameState, gameState.selectedUnit);
        const trader2 = findUnit(newGameState, targetPosition);
        if (trader1 && trader2 && trader1.type === 'TR' && trader2.type === 'TR') {
          // Swap positions
          const temp = { row: trader1.row, col: trader1.col };
          trader1.row = trader2.row;
          trader1.col = trader2.col;
          trader2.row = temp.row;
          trader2.col = temp.col;
          // Update board
          newGameState.board[trader1.row][trader1.col] = formatUnit(trader1);
          newGameState.board[trader2.row][trader2.col] = formatUnit(trader2);
        }
      }
      break;

    case 'Shield':
    case 'Shield Wall':
      if (currentPlayer === 'TRADER') {
        newGameState.buffs.TRADER.push({ type: 'damageReduction', duration: 1 });
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

    case 'Fortify':
      if (currentPlayer === 'TRADER') {
        newGameState.buffs.TRADER.push({ type: 'fortify', duration: 1 });
      }
      break;

    // Thief abilities
    case 'Shadowstep':
    case 'Shadow Step':
      if (currentPlayer === 'THIEF') {
        newGameState.buffs.THIEF.push({ type: 'shadowstep', duration: 1 });
      }
      break;

    case 'Steal':
    case 'Steal Silk':
      if (currentPlayer === 'THIEF' && targetPosition) {
        // Steal silk from adjacent Trader
        const distance = Math.abs(targetPosition.row - (gameState.selectedUnit?.row || 0)) +
                        Math.abs(targetPosition.col - (gameState.selectedUnit?.col || 0));
        if (distance === 1 && newGameState.silkCountTrader > 0) {
          newGameState.silkCountTrader--;
          newGameState.silkCountThief++;
        }
      }
      break;

    case 'Trap':
    case 'Set Trap':
    case 'Ambush':
      if (currentPlayer === 'THIEF' && targetPosition) {
        // Place trap on adjacent tile
        newGameState.traps.push({ row: targetPosition.row, col: targetPosition.col });
        newGameState.board[targetPosition.row][targetPosition.col] = 'X';
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

    case 'Rally':
      if (currentPlayer === 'THIEF') {
        newGameState.buffs.THIEF.push({ type: 'attackBoost', duration: 1 });
      }
      break;
  }

  // Deduct silk cost from the correct player
  if (currentPlayer === 'TRADER') {
    newGameState.silkCountTrader -= abilityCost;
  } else {
    newGameState.silkCountThief -= abilityCost;
  }

  newGameState.lastUsedAbility = ability;
  return newGameState;
}

function getAbilityCost(ability: string): number {
  switch (ability) {
    // Trader abilities
    case 'Rush':
      return 2;
    case 'Trade':
      return 3;
    case 'Shield':
    case 'Shield Wall':
      return 3;

    // Thief abilities
    case 'Shadowstep':
    case 'Shadow Step':
      return 2;
    case 'Steal':
    case 'Steal Silk':
      return 3;
    case 'Trap':
    case 'Set Trap':
    case 'Ambush':
      return 2;

    // Other abilities
    case 'Guard':
    case 'Track':
    case 'Fortify':
      return 1;
    case 'Disarm':
    case 'Rally':
      return 2;

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
  // Kingthief deals 2 damage to Traders, 1 to Hunters
  if (attacker.type === 'KT') {
    if (defender.type === 'TR') return 2;
    if (defender.type === 'H') return 1;
  }

  // All other units deal 1 damage
  return 1;
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

  const isTraderAI = gameState.currentPlayer === 'TRADER';

  if (isTraderAI) {
    // Trader AI: Focus on collecting gold and delivering it
    const traders = aiUnits.filter(u => u.type === 'TR');
    const tradersWithGold = traders.filter(u => u.hasGold);
    const tradersWithoutGold = traders.filter(u => !u.hasGold);

    // Priority 1: Traders with gold move to delivery zones
    for (const trader of tradersWithGold) {
      const validMoves = getValidMoves(gameState, { row: trader.row, col: trader.col });
      const deliveryMove = validMoves.find(move =>
        (move.row === 7 && (move.col === 0 || move.col === 1))
      );
      if (deliveryMove) {
        return moveUnit(gameState, { row: trader.row, col: trader.col }, deliveryMove);
      }

      // Move towards delivery zone
      const nearestDeliveryZone = { row: 7, col: 0 };
      const moveTowardsDelivery = validMoves.reduce((best, move) => {
        const currentDistance = Math.abs(move.row - nearestDeliveryZone.row) + Math.abs(move.col - nearestDeliveryZone.col);
        const bestDistance = Math.abs(best.row - nearestDeliveryZone.row) + Math.abs(best.col - nearestDeliveryZone.col);
        return currentDistance < bestDistance ? move : best;
      });
      if (validMoves.length > 0) {
        return moveUnit(gameState, { row: trader.row, col: trader.col }, moveTowardsDelivery);
      }
    }

    // Priority 2: Traders without gold move to gold locations
    for (const trader of tradersWithoutGold) {
      const validMoves = getValidMoves(gameState, { row: trader.row, col: trader.col });

      // Check for gold pickup
      const goldMove = validMoves.find(move => gameState.board[move.row][move.col] === 'G');
      if (goldMove) {
        return moveUnit(gameState, { row: trader.row, col: trader.col }, goldMove);
      }

      // Move towards nearest gold
      const goldPositions = [
        ...GOLD_SPAWN_POSITIONS,
        ...gameState.droppedGold
      ];
      if (goldPositions.length > 0) {
        const nearestGold = goldPositions.reduce((nearest, current) => {
          const currentDistance = Math.abs(current.row - trader.row) + Math.abs(current.col - trader.col);
          const nearestDistance = Math.abs(nearest.row - trader.row) + Math.abs(nearest.col - trader.col);
          return currentDistance < nearestDistance ? current : nearest;
        });

        const moveTowardsGold = validMoves.reduce((best, move) => {
          const currentDistance = Math.abs(move.row - nearestGold.row) + Math.abs(move.col - nearestGold.col);
          const bestDistance = Math.abs(best.row - nearestGold.row) + Math.abs(best.col - nearestGold.col);
          return currentDistance < bestDistance ? move : best;
        });
        if (validMoves.length > 0) {
          return moveUnit(gameState, { row: trader.row, col: trader.col }, moveTowardsGold);
        }
      }
    }

    // Priority 3: Collect Silk
    for (const unit of aiUnits) {
      const validMoves = getValidMoves(gameState, { row: unit.row, col: unit.col });
      const silkMove = validMoves.find(move => gameState.board[move.row][move.col] === 'SI');
      if (silkMove) {
        return moveUnit(gameState, { row: unit.row, col: unit.col }, silkMove);
      }
    }
  } else {
    // Thief AI: Prioritize collecting Silk and targeting Traders
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
  }

  // If no priority moves, make a random move
  return makeNoobAiMove(gameState, aiUnits);
}

function makeSilkroadAiMove(gameState: GameState, aiUnits: Unit[]): GameState {
  // Aggressively hunt Traders and coordinate attacks
  const tradersWithGold = gameState.traderUnits.filter(u => u.type === 'TR' && u.hasGold);
  const allTraders = gameState.traderUnits;

  for (const unit of aiUnits) {
    const validMoves = getValidMoves(gameState, { row: unit.row, col: unit.col });

    if (validMoves.length === 0) continue;

    // Priority 1: Attack Traders carrying Gold
    const attackGoldTrader = validMoves.find(move => {
      const targetCell = gameState.board[move.row][move.col];
      return targetCell.includes('TRG') || (targetCell.includes('TR') && targetCell.includes('G'));
    });
    if (attackGoldTrader) {
      return moveUnit(gameState, { row: unit.row, col: unit.col }, attackGoldTrader);
    }

    // Priority 2: Attack any Trader or Hunter
    const attackMove = validMoves.find(move => {
      const targetCell = gameState.board[move.row][move.col];
      return targetCell.includes('TR') || targetCell.includes('H');
    });
    if (attackMove) {
      return moveUnit(gameState, { row: unit.row, col: unit.col }, attackMove);
    }

    // Priority 3: Move towards Traders with Gold
    if (tradersWithGold.length > 0) {
      const nearestGoldTrader = tradersWithGold.reduce((nearest, current) => {
        const currentDistance = Math.abs(current.row - unit.row) + Math.abs(current.col - unit.col);
        const nearestDistance = Math.abs(nearest.row - unit.row) + Math.abs(nearest.col - unit.col);
        return currentDistance < nearestDistance ? current : nearest;
      });

      const moveTowardsGoldTrader = validMoves.reduce((best, move) => {
        const currentDistance = Math.abs(move.row - nearestGoldTrader.row) + Math.abs(move.col - nearestGoldTrader.col);
        const bestDistance = Math.abs(best.row - nearestGoldTrader.row) + Math.abs(best.col - nearestGoldTrader.col);
        return currentDistance < bestDistance ? move : best;
      });
      return moveUnit(gameState, { row: unit.row, col: unit.col }, moveTowardsGoldTrader);
    }

    // Priority 4: Move towards any Trader
    if (allTraders.length > 0) {
      const nearestTrader = allTraders.reduce((nearest, current) => {
        const currentDistance = Math.abs(current.row - unit.row) + Math.abs(current.col - unit.col);
        const nearestDistance = Math.abs(nearest.row - unit.row) + Math.abs(nearest.col - unit.col);
        return currentDistance < nearestDistance ? current : nearest;
      });

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
    const allUnits = [...newGameState.traderUnits, ...newGameState.thiefUnits];

    if (allUnits.length === 0) continue;

    // Find nearest unit
    const nearestUnit = allUnits.reduce((nearest, current) => {
      const currentDistance = Math.abs(current.row - boss.position.row) + Math.abs(current.col - boss.position.col);
      const nearestDistance = Math.abs(nearest.row - boss.position.row) + Math.abs(nearest.col - boss.position.col);
      return currentDistance < nearestDistance ? current : nearest;
    });

    const distanceToNearest = Math.abs(nearestUnit.row - boss.position.row) + Math.abs(nearestUnit.col - boss.position.col);

    // Boss-specific behavior
    switch (boss.type) {
      case 'TigerGiry':
        // AoE damage to all units in 3x3 area
        if (distanceToNearest <= boss.range) {
          const unitsInRange = allUnits.filter(unit =>
            Math.abs(unit.row - boss.position.row) <= 1 &&
            Math.abs(unit.col - boss.position.col) <= 1
          );

          for (const unit of unitsInRange) {
            unit.hp -= boss.damage;
            if (unit.hp <= 0) {
              removeUnit(newGameState, { row: unit.row, col: unit.col });
              newGameState.board[unit.row][unit.col] = '';
            } else {
              newGameState.board[unit.row][unit.col] = formatUnit(unit);
            }
          }
        } else {
          // Move towards nearest unit
          moveBossTowards(newGameState, boss, nearestUnit);
        }
        break;

      case 'SkeletoKing':
        // Spawn skeleton minions on adjacent tiles
        if (distanceToNearest <= 2) {
          spawnSkeletons(newGameState, boss);
        }
        break;

      case 'Murucha':
        // Poison cloud affecting units within 2 tiles (DoT)
        const unitsInPoisonRange = allUnits.filter(unit => {
          const distance = Math.abs(unit.row - boss.position.row) + Math.abs(unit.col - boss.position.col);
          return distance <= 2;
        });

        for (const unit of unitsInPoisonRange) {
          unit.debuffs.push({ type: 'poison', duration: 2 });
          unit.hp -= 1; // Initial poison damage
          if (unit.hp <= 0) {
            removeUnit(newGameState, { row: unit.row, col: unit.col });
            newGameState.board[unit.row][unit.col] = '';
          } else {
            newGameState.board[unit.row][unit.col] = formatUnit(unit);
          }
        }

        // Move towards nearest unit if not close
        if (distanceToNearest > 2) {
          moveBossTowards(newGameState, boss, nearestUnit);
        }
        break;
    }
  }

  return newGameState;
}

function moveBossTowards(gameState: GameState, boss: BossMonster, target: Unit) {
  const possibleMoves = [
    { row: boss.position.row - 1, col: boss.position.col }, // up
    { row: boss.position.row + 1, col: boss.position.col }, // down
    { row: boss.position.row, col: boss.position.col - 1 }, // left
    { row: boss.position.row, col: boss.position.col + 1 }  // right
  ];

  // Filter valid moves
  const validMoves = possibleMoves.filter(move =>
    move.row >= 0 && move.row < BOARD_SIZE &&
    move.col >= 0 && move.col < BOARD_SIZE &&
    gameState.board[move.row][move.col] === ''
  );

  if (validMoves.length === 0) return;

  // Choose move that gets closest to target
  const bestMove = validMoves.reduce((best, move) => {
    const moveDistance = Math.abs(move.row - target.row) + Math.abs(move.col - target.col);
    const bestDistance = Math.abs(best.row - target.row) + Math.abs(best.col - target.col);
    return moveDistance < bestDistance ? move : best;
  });

  // Move boss
  gameState.board[boss.position.row][boss.position.col] = '';
  boss.position = bestMove;
  gameState.board[bestMove.row][bestMove.col] = `BM${boss.type[0]}`;
}

function spawnSkeletons(gameState: GameState, boss: BossMonster) {
  const adjacentPositions = [
    { row: boss.position.row - 1, col: boss.position.col },
    { row: boss.position.row + 1, col: boss.position.col },
    { row: boss.position.row, col: boss.position.col - 1 },
    { row: boss.position.row, col: boss.position.col + 1 }
  ];

  for (const pos of adjacentPositions) {
    if (pos.row >= 0 && pos.row < BOARD_SIZE &&
        pos.col >= 0 && pos.col < BOARD_SIZE &&
        gameState.board[pos.row][pos.col] === '') {
      // Spawn skeleton (represented as SK)
      gameState.board[pos.row][pos.col] = 'SK';
      // Skeletons are temporary minions with 1 HP
    }
  }
}

export function checkVictoryConditions(gameState: GameState): string | null {
  // Traders win if they deliver 2 Gold pieces to their delivery zones
  if (gameState.goldDelivered >= 2) {
    return 'TRADER';
  }

  // Thieves win if both Trader units are eliminated
  const traderCount = gameState.traderUnits.filter(u => u.type === 'TR').length;
  if (traderCount === 0) {
    return 'THIEF';
  }

  // Thieves also win if only the Hunter remains
  const hunterCount = gameState.traderUnits.filter(u => u.type === 'H').length;
  if (gameState.traderUnits.length === hunterCount && hunterCount > 0) {
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

