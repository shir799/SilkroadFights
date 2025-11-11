/**
 * SILKROAD FIGHTS - ADVANCED GAME LOGIC ENGINE
 *
 * This module implements sophisticated AI, pathfinding, and player control validation
 * for the Silkroad Fights game. It features:
 *
 * 1. A* Pathfinding for auto-movement
 * 2. Smart AI with 3 difficulty levels (Noob, Normal, Silkroad Master)
 * 3. Role-based unit behaviors
 * 4. Strict player control validation
 * 5. Real-time game mechanics
 */

import { GameState, Unit, Position, BossMonster, Buff, Debuff, CombatResult } from './types';
import { BOARD_SIZE, formatUnit, checkVictoryConditions } from './gameLogic';

// ============================================================================
// CONSTANTS
// ============================================================================

export const AI_DIFFICULTY = {
  NOOB: 'noob',
  NORMAL: 'normal',
  SILKROAD_MASTER: 'silkroad'
} as const;

export const UNIT_ROLES = {
  TRADER: 'TR',
  HUNTER: 'H',
  THIEF: 'TH',
  KING_THIEF: 'KT'
} as const;

const PATHFINDING_MAX_ITERATIONS = 100;
const FLANKING_BONUS_DISTANCE = 2;
const COMBO_ATTACK_RANGE = 2;
const REGROUP_DISTANCE = 3;
const DEFENSIVE_FORMATION_DISTANCE = 2;

// ============================================================================
// PATHFINDING SYSTEM - A* Algorithm
// ============================================================================

interface PathNode {
  position: Position;
  gCost: number; // Distance from start
  hCost: number; // Estimated distance to goal
  fCost: number; // Total cost (g + h)
  parent: PathNode | null;
}

/**
 * A* Pathfinding Algorithm
 * Finds the optimal path from start to goal, avoiding obstacles
 */
export function findPath(
  gameState: GameState,
  start: Position,
  goal: Position,
  avoidEnemies: boolean = true
): Position[] {
  const openList: PathNode[] = [];
  const closedList: Set<string> = new Set();

  // Create start node
  const startNode: PathNode = {
    position: start,
    gCost: 0,
    hCost: manhattanDistance(start, goal),
    fCost: 0,
    parent: null
  };
  startNode.fCost = startNode.gCost + startNode.hCost;

  openList.push(startNode);
  let iterations = 0;

  while (openList.length > 0 && iterations < PATHFINDING_MAX_ITERATIONS) {
    iterations++;

    // Get node with lowest fCost
    openList.sort((a, b) => a.fCost - b.fCost);
    const currentNode = openList.shift()!;

    // Check if we reached the goal
    if (positionsEqual(currentNode.position, goal)) {
      return reconstructPath(currentNode);
    }

    closedList.add(positionKey(currentNode.position));

    // Check all neighbors
    const neighbors = getNeighbors(currentNode.position, gameState, avoidEnemies);

    for (const neighborPos of neighbors) {
      const neighborKey = positionKey(neighborPos);

      if (closedList.has(neighborKey)) continue;

      const gCost = currentNode.gCost + 1;
      const hCost = manhattanDistance(neighborPos, goal);
      const fCost = gCost + hCost;

      // Check if neighbor is already in open list
      const existingNode = openList.find(n => positionsEqual(n.position, neighborPos));

      if (existingNode) {
        // Update if we found a better path
        if (gCost < existingNode.gCost) {
          existingNode.gCost = gCost;
          existingNode.fCost = fCost;
          existingNode.parent = currentNode;
        }
      } else {
        // Add new node to open list
        openList.push({
          position: neighborPos,
          gCost,
          hCost,
          fCost,
          parent: currentNode
        });
      }
    }
  }

  // No path found
  return [];
}

function reconstructPath(node: PathNode): Position[] {
  const path: Position[] = [];
  let current: PathNode | null = node;

  while (current !== null) {
    path.unshift(current.position);
    current = current.parent;
  }

  // Remove the starting position
  return path.slice(1);
}

function getNeighbors(pos: Position, gameState: GameState, avoidEnemies: boolean): Position[] {
  const neighbors: Position[] = [];
  const directions = [
    { row: -1, col: 0 },  // Up
    { row: 1, col: 0 },   // Down
    { row: 0, col: -1 },  // Left
    { row: 0, col: 1 }    // Right
  ];

  for (const dir of directions) {
    const newPos = {
      row: pos.row + dir.row,
      col: pos.col + dir.col
    };

    // Check bounds
    if (newPos.row < 0 || newPos.row >= BOARD_SIZE ||
        newPos.col < 0 || newPos.col >= BOARD_SIZE) {
      continue;
    }

    // Check if cell is walkable
    if (isCellWalkable(gameState, newPos, avoidEnemies)) {
      neighbors.push(newPos);
    }
  }

  return neighbors;
}

function isCellWalkable(gameState: GameState, pos: Position, avoidEnemies: boolean): boolean {
  const cell = gameState.board[pos.row][pos.col];

  // Empty cells and silk are always walkable
  if (cell === '' || cell === 'SI' || cell === 'Z') {
    return true;
  }

  // Check for traps
  if (gameState.traps.some(trap => positionsEqual(trap, pos))) {
    return false;
  }

  // Check for boss monsters
  if (gameState.bossMonsters.some(boss => positionsEqual(boss.position, pos))) {
    return false;
  }

  // Check for units
  if (avoidEnemies && (cell.includes('TR') || cell.includes('H') ||
                       cell.includes('TH') || cell.includes('KT'))) {
    return false;
  }

  return true;
}

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

function positionKey(pos: Position): string {
  return `${pos.row},${pos.col}`;
}

// ============================================================================
// PLAYER CONTROL VALIDATION
// ============================================================================

/**
 * Validates that a player can only select and control their own units
 * This is the STRICT validation layer that prevents cheating
 */
export function canPlayerControlUnit(
  gameState: GameState,
  unitPosition: Position,
  playerId: string
): boolean {
  const cell = gameState.board[unitPosition.row][unitPosition.col];

  // Determine which team the player controls
  const isTraderTeam = gameState.isTraderPlayer;

  // Check if cell contains a unit
  if (!cell || cell === '' || cell === 'SI' || cell === 'Z') {
    return false;
  }

  // Trader player can only control Traders and Hunters
  if (isTraderTeam) {
    return cell.includes('TR') || cell.includes('H');
  }

  // Thief player can only control Thieves and King Thieves
  return cell.includes('TH') || cell.includes('KT');
}

/**
 * Validates that a move is legal for the current player
 */
export function isValidPlayerMove(
  gameState: GameState,
  from: Position,
  to: Position
): { valid: boolean; reason?: string } {
  // Check if player controls the unit
  if (!canPlayerControlUnit(gameState, from, 'player')) {
    return { valid: false, reason: 'You cannot control this unit' };
  }

  // Check if it's the player's turn
  const isTraderTeam = gameState.isTraderPlayer;
  const isPlayerTurn = (isTraderTeam && gameState.currentPlayer === 'TRADER') ||
                       (!isTraderTeam && gameState.currentPlayer === 'THIEF');

  if (!isPlayerTurn) {
    return { valid: false, reason: 'Not your turn' };
  }

  // Check if unit is immobilized
  const unit = findUnitAtPosition(gameState, from);
  if (unit?.isImmobilized) {
    return { valid: false, reason: 'Unit is immobilized' };
  }

  // Check if destination is within movement range
  const maxDistance = getMovementRange(gameState, from);
  const distance = manhattanDistance(from, to);

  if (distance > maxDistance) {
    return { valid: false, reason: 'Out of movement range' };
  }

  // Check if destination is blocked by friendly unit
  const targetCell = gameState.board[to.row][to.col];
  if (isFriendlyUnit(gameState, targetCell)) {
    return { valid: false, reason: 'Blocked by friendly unit' };
  }

  return { valid: true };
}

function isFriendlyUnit(gameState: GameState, cellContent: string): boolean {
  if (!cellContent || cellContent === '' || cellContent === 'SI' || cellContent === 'Z') {
    return false;
  }

  const isTraderTeam = gameState.isTraderPlayer;
  const currentPlayerIsTrader = gameState.currentPlayer === 'TRADER';

  if (isTraderTeam && currentPlayerIsTrader) {
    return cellContent.includes('TR') || cellContent.includes('H');
  }

  if (!isTraderTeam && !currentPlayerIsTrader) {
    return cellContent.includes('TH') || cellContent.includes('KT');
  }

  return false;
}

function getMovementRange(gameState: GameState, pos: Position): number {
  const unit = findUnitAtPosition(gameState, pos);
  if (!unit) return 1;

  // Base movement is 1
  let range = 1;

  // Check for movement buffs
  if (unit.buffs.some(b => b.type === 'rush' || b.type === 'speed')) {
    range = 2;
  }

  return range;
}

// ============================================================================
// UNIT BEHAVIOR SYSTEM
// ============================================================================

interface UnitBehavior {
  priority: number;
  condition: (gameState: GameState, unit: Unit) => boolean;
  action: (gameState: GameState, unit: Unit) => Position | null;
}

/**
 * Trader Behavior: Defensive formation, protect gold carriers, deliver gold
 */
const TRADER_BEHAVIORS: UnitBehavior[] = [
  {
    priority: 10,
    condition: (gs, unit) => unit.hasGold === true,
    action: (gs, unit) => {
      // Find nearest delivery zone
      const deliveryZones = [
        { row: 7, col: 2 },
        { row: 7, col: 5 }
      ];

      const nearest = findNearestPosition(unit, deliveryZones);
      const path = findPath(gs, { row: unit.row, col: unit.col }, nearest, true);

      return path.length > 0 ? path[0] : null;
    }
  },
  {
    priority: 8,
    condition: (gs, unit) => !unit.hasGold && hasNearbyGold(gs, unit),
    action: (gs, unit) => {
      // Move to pick up gold
      const goldPositions = findGoldPositions(gs);
      const nearest = findNearestPosition(unit, goldPositions);
      const path = findPath(gs, { row: unit.row, col: unit.col }, nearest, true);

      return path.length > 0 ? path[0] : null;
    }
  },
  {
    priority: 6,
    condition: (gs, unit) => hasNearbyThreat(gs, unit, 3),
    action: (gs, unit) => {
      // Regroup with allies
      const allies = gs.traderUnits.filter(u => u !== unit);
      if (allies.length > 0) {
        const nearest = findNearestUnit(unit, allies);
        const path = findPath(gs, { row: unit.row, col: unit.col },
                             { row: nearest.row, col: nearest.col }, true);

        return path.length > 0 ? path[0] : null;
      }
      return null;
    }
  },
  {
    priority: 4,
    condition: (gs, unit) => hasSilkNearby(gs, unit, 4),
    action: (gs, unit) => {
      // Collect silk
      const silkPositions = findSilkPositions(gs);
      const nearest = findNearestPosition(unit, silkPositions);
      const path = findPath(gs, { row: unit.row, col: unit.col }, nearest, true);

      return path.length > 0 ? path[0] : null;
    }
  }
];

/**
 * Hunter Behavior: Track thieves, bodyguard traders, aggressive pursuit
 */
const HUNTER_BEHAVIORS: UnitBehavior[] = [
  {
    priority: 10,
    condition: (gs, unit) => hasGoldCarrierNearby(gs, unit, 3),
    action: (gs, unit) => {
      // Stay close to gold carriers
      const goldCarriers = gs.traderUnits.filter(u => u.hasGold);
      if (goldCarriers.length > 0) {
        const nearest = findNearestUnit(unit, goldCarriers);
        const distance = manhattanDistance(
          { row: unit.row, col: unit.col },
          { row: nearest.row, col: nearest.col }
        );

        if (distance > 1) {
          const path = findPath(gs, { row: unit.row, col: unit.col },
                               { row: nearest.row, col: nearest.col }, true);
          return path.length > 0 ? path[0] : null;
        }
      }
      return null;
    }
  },
  {
    priority: 8,
    condition: (gs, unit) => canAttackEnemy(gs, unit),
    action: (gs, unit) => {
      // Attack nearby thieves
      const target = findNearestEnemy(gs, unit, gs.thiefUnits);
      if (target) {
        const distance = manhattanDistance(
          { row: unit.row, col: unit.col },
          { row: target.row, col: target.col }
        );

        if (distance === 1) {
          // Adjacent, attack
          return { row: target.row, col: target.col };
        } else {
          // Move closer
          const path = findPath(gs, { row: unit.row, col: unit.col },
                               { row: target.row, col: target.col }, false);
          return path.length > 0 ? path[0] : null;
        }
      }
      return null;
    }
  },
  {
    priority: 5,
    condition: (gs, unit) => true,
    action: (gs, unit) => {
      // Patrol and hunt thieves
      const enemies = gs.thiefUnits;
      if (enemies.length > 0) {
        const target = findNearestUnit(unit, enemies);
        const path = findPath(gs, { row: unit.row, col: unit.col },
                             { row: target.row, col: target.col }, false);
        return path.length > 0 ? path[0] : null;
      }
      return null;
    }
  }
];

/**
 * Thief Behavior: Ambush, hit-and-run, steal gold
 */
const THIEF_BEHAVIORS: UnitBehavior[] = [
  {
    priority: 10,
    condition: (gs, unit) => canStealGold(gs, unit),
    action: (gs, unit) => {
      // Attack gold carriers
      const goldCarriers = gs.traderUnits.filter(u => u.hasGold);
      if (goldCarriers.length > 0) {
        const target = findNearestUnit(unit, goldCarriers);
        const distance = manhattanDistance(
          { row: unit.row, col: unit.col },
          { row: target.row, col: target.col }
        );

        if (distance === 1) {
          return { row: target.row, col: target.col };
        } else {
          const path = findPath(gs, { row: unit.row, col: unit.col },
                               { row: target.row, col: target.col }, false);
          return path.length > 0 ? path[0] : null;
        }
      }
      return null;
    }
  },
  {
    priority: 8,
    condition: (gs, unit) => canFlankEnemy(gs, unit),
    action: (gs, unit) => {
      // Flanking maneuver
      const target = findNearestEnemy(gs, unit, gs.traderUnits);
      if (target) {
        const flankPosition = findFlankPosition(gs, unit, target);
        if (flankPosition) {
          const path = findPath(gs, { row: unit.row, col: unit.col },
                               flankPosition, false);
          return path.length > 0 ? path[0] : null;
        }
      }
      return null;
    }
  },
  {
    priority: 6,
    condition: (gs, unit) => unit.hp < unit.maxHp / 2,
    action: (gs, unit) => {
      // Hit and run - retreat if low HP
      const safestPosition = findSafestPosition(gs, unit);
      if (safestPosition) {
        const path = findPath(gs, { row: unit.row, col: unit.col },
                             safestPosition, true);
        return path.length > 0 ? path[0] : null;
      }
      return null;
    }
  },
  {
    priority: 4,
    condition: (gs, unit) => hasSilkNearby(gs, unit, 4),
    action: (gs, unit) => {
      // Collect silk for abilities
      const silkPositions = findSilkPositions(gs);
      const nearest = findNearestPosition(unit, silkPositions);
      const path = findPath(gs, { row: unit.row, col: unit.col }, nearest, true);

      return path.length > 0 ? path[0] : null;
    }
  }
];

/**
 * King Thief Behavior: Command thieves, buff allies, strategic positioning
 */
const KING_THIEF_BEHAVIORS: UnitBehavior[] = [
  {
    priority: 10,
    condition: (gs, unit) => needsToBuffAllies(gs, unit),
    action: (gs, unit) => {
      // Stay in position to buff allies
      // King Thief provides aura buffs
      return null; // Stay in place
    }
  },
  {
    priority: 8,
    condition: (gs, unit) => canCoordinateAttack(gs, unit),
    action: (gs, unit) => {
      // Position for combo attack
      const target = findBestTarget(gs, unit);
      if (target) {
        const comboPosition = findComboPosition(gs, unit, target);
        if (comboPosition) {
          const path = findPath(gs, { row: unit.row, col: unit.col },
                               comboPosition, false);
          return path.length > 0 ? path[0] : null;
        }
      }
      return null;
    }
  },
  {
    priority: 5,
    condition: (gs, unit) => true,
    action: (gs, unit) => {
      // Support thieves by staying in formation
      const allies = gs.thiefUnits.filter(u => u !== unit);
      if (allies.length > 0) {
        const center = calculateFormationCenter(allies);
        const path = findPath(gs, { row: unit.row, col: unit.col }, center, true);
        return path.length > 0 ? path[0] : null;
      }
      return null;
    }
  }
];

/**
 * Execute unit behavior based on role
 */
export function executeUnitBehavior(
  gameState: GameState,
  unit: Unit
): Position | null {
  let behaviors: UnitBehavior[] = [];

  switch (unit.type) {
    case UNIT_ROLES.TRADER:
      behaviors = TRADER_BEHAVIORS;
      break;
    case UNIT_ROLES.HUNTER:
      behaviors = HUNTER_BEHAVIORS;
      break;
    case UNIT_ROLES.THIEF:
      behaviors = THIEF_BEHAVIORS;
      break;
    case UNIT_ROLES.KING_THIEF:
      behaviors = KING_THIEF_BEHAVIORS;
      break;
  }

  // Sort by priority and execute first valid behavior
  behaviors.sort((a, b) => b.priority - a.priority);

  for (const behavior of behaviors) {
    if (behavior.condition(gameState, unit)) {
      const action = behavior.action(gameState, unit);
      if (action) {
        return action;
      }
    }
  }

  return null;
}

// ============================================================================
// SMART AI SYSTEM - 3 DIFFICULTY LEVELS
// ============================================================================

/**
 * NOOB AI: Random attacks, poor positioning, no strategy
 */
export function makeNoobAiMove(gameState: GameState): Position[] | null {
  const aiUnits = gameState.currentPlayer === 'TRADER'
    ? gameState.traderUnits
    : gameState.thiefUnits;

  if (aiUnits.length === 0) return null;

  // Pick random unit
  const randomUnit = aiUnits[Math.floor(Math.random() * aiUnits.length)];

  // Get all possible moves
  const possibleMoves = getAllPossibleMoves(gameState, randomUnit);

  if (possibleMoves.length === 0) return null;

  // Pick random move
  const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];

  return [
    { row: randomUnit.row, col: randomUnit.col },
    randomMove
  ];
}

/**
 * NORMAL AI: Basic tactics, focus silk carriers, use abilities
 */
export function makeNormalAiMove(gameState: GameState): Position[] | null {
  const aiUnits = gameState.currentPlayer === 'TRADER'
    ? gameState.traderUnits
    : gameState.thiefUnits;

  if (aiUnits.length === 0) return null;

  // Priority 1: Attack gold carriers
  for (const unit of aiUnits) {
    const goldCarrierMove = findGoldCarrierAttack(gameState, unit);
    if (goldCarrierMove) {
      return [{ row: unit.row, col: unit.col }, goldCarrierMove];
    }
  }

  // Priority 2: Collect silk
  for (const unit of aiUnits) {
    const silkMove = findSilkCollection(gameState, unit);
    if (silkMove) {
      return [{ row: unit.row, col: unit.col }, silkMove];
    }
  }

  // Priority 3: Attack any enemy
  for (const unit of aiUnits) {
    const attackMove = findAttackMove(gameState, unit);
    if (attackMove) {
      return [{ row: unit.row, col: unit.col }, attackMove];
    }
  }

  // Priority 4: Use unit behavior
  for (const unit of aiUnits) {
    const behaviorMove = executeUnitBehavior(gameState, unit);
    if (behaviorMove) {
      return [{ row: unit.row, col: unit.col }, behaviorMove];
    }
  }

  // Fallback to random
  return makeNoobAiMove(gameState);
}

/**
 * SILKROAD MASTER AI: Advanced tactics, flanking, combos, perfect timing
 */
export function makeSilkroadMasterAiMove(gameState: GameState): Position[] | null {
  const aiUnits = gameState.currentPlayer === 'TRADER'
    ? gameState.traderUnits
    : gameState.thiefUnits;

  if (aiUnits.length === 0) return null;

  // Evaluate game state
  const evaluation = evaluateGameState(gameState);

  // Priority 1: Execute combo attacks
  const comboMove = findComboAttackMove(gameState, aiUnits);
  if (comboMove) {
    return comboMove;
  }

  // Priority 2: Strategic ability usage
  const abilityMove = findStrategicAbilityMove(gameState, aiUnits);
  if (abilityMove) {
    return abilityMove;
  }

  // Priority 3: Flanking maneuvers
  const flankMove = findFlankingMove(gameState, aiUnits);
  if (flankMove) {
    return flankMove;
  }

  // Priority 4: Perfect timing attacks on gold carriers
  for (const unit of aiUnits) {
    const criticalMove = findCriticalGoldAttack(gameState, unit);
    if (criticalMove) {
      return [{ row: unit.row, col: unit.col }, criticalMove];
    }
  }

  // Priority 5: Positional advantage
  const positionalMove = findBestPositionalMove(gameState, aiUnits);
  if (positionalMove) {
    return positionalMove;
  }

  // Priority 6: Control key areas
  const controlMove = findAreaControlMove(gameState, aiUnits);
  if (controlMove) {
    return controlMove;
  }

  // Fallback to normal AI
  return makeNormalAiMove(gameState);
}

/**
 * Main AI entry point
 */
export function makeSmartAiMove(
  gameState: GameState,
  difficulty: string
): Position[] | null {
  switch (difficulty) {
    case AI_DIFFICULTY.NOOB:
      return makeNoobAiMove(gameState);
    case AI_DIFFICULTY.NORMAL:
      return makeNormalAiMove(gameState);
    case AI_DIFFICULTY.SILKROAD_MASTER:
      return makeSilkroadMasterAiMove(gameState);
    default:
      return makeNormalAiMove(gameState);
  }
}

// ============================================================================
// AI TACTICAL FUNCTIONS
// ============================================================================

function findComboAttackMove(gameState: GameState, units: Unit[]): Position[] | null {
  // Find targets that can be attacked by multiple units
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  for (const enemy of enemies) {
    const attackers = units.filter(unit => {
      const distance = manhattanDistance(
        { row: unit.row, col: unit.col },
        { row: enemy.row, col: enemy.col }
      );
      return distance <= COMBO_ATTACK_RANGE;
    });

    if (attackers.length >= 2) {
      // Execute combo attack with first unit
      const attacker = attackers[0];
      const path = findPath(
        gameState,
        { row: attacker.row, col: attacker.col },
        { row: enemy.row, col: enemy.col },
        false
      );

      if (path.length > 0) {
        return [{ row: attacker.row, col: attacker.col }, path[0]];
      }
    }
  }

  return null;
}

function findFlankingMove(gameState: GameState, units: Unit[]): Position[] | null {
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  if (enemies.length === 0) return null;

  for (const unit of units) {
    for (const enemy of enemies) {
      const flankPos = findFlankPosition(gameState, unit, enemy);
      if (flankPos) {
        const distance = manhattanDistance(
          { row: unit.row, col: unit.col },
          flankPos
        );

        if (distance <= 2) {
          const path = findPath(
            gameState,
            { row: unit.row, col: unit.col },
            flankPos,
            false
          );

          if (path.length > 0) {
            return [{ row: unit.row, col: unit.col }, path[0]];
          }
        }
      }
    }
  }

  return null;
}

function findFlankPosition(
  gameState: GameState,
  unit: Unit,
  target: Unit
): Position | null {
  // Find position behind target
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ];

  for (const dir of directions) {
    const flankPos = {
      row: target.row + dir.row,
      col: target.col + dir.col
    };

    if (isPositionValid(flankPos) && isCellWalkable(gameState, flankPos, false)) {
      return flankPos;
    }
  }

  return null;
}

function findBestPositionalMove(gameState: GameState, units: Unit[]): Position[] | null {
  let bestScore = -Infinity;
  let bestMove: Position[] | null = null;

  for (const unit of units) {
    const possibleMoves = getAllPossibleMoves(gameState, unit);

    for (const move of possibleMoves) {
      const score = evaluatePosition(gameState, unit, move);

      if (score > bestScore) {
        bestScore = score;
        bestMove = [{ row: unit.row, col: unit.col }, move];
      }
    }
  }

  return bestMove;
}

function evaluatePosition(gameState: GameState, unit: Unit, position: Position): number {
  let score = 0;

  // Distance to enemies
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  for (const enemy of enemies) {
    const distance = manhattanDistance(position, { row: enemy.row, col: enemy.col });
    score -= distance; // Closer is better

    if (enemy.hasGold) {
      score -= distance * 2; // Much closer to gold carriers
    }
  }

  // Distance to silk
  const silkPositions = findSilkPositions(gameState);
  for (const silk of silkPositions) {
    const distance = manhattanDistance(position, silk);
    score -= distance * 0.5;
  }

  // Safety score (distance from multiple enemies)
  const nearbyEnemies = enemies.filter(e => {
    const dist = manhattanDistance(position, { row: e.row, col: e.col });
    return dist <= 2;
  });

  if (nearbyEnemies.length > 1) {
    score -= 10; // Dangerous position
  }

  return score;
}

function findAreaControlMove(gameState: GameState, units: Unit[]): Position[] | null {
  // Control center of board or key choke points
  const keyPositions = [
    { row: 3, col: 3 },
    { row: 3, col: 4 },
    { row: 4, col: 3 },
    { row: 4, col: 4 }
  ];

  for (const unit of units) {
    for (const keyPos of keyPositions) {
      if (isCellWalkable(gameState, keyPos, false)) {
        const distance = manhattanDistance(
          { row: unit.row, col: unit.col },
          keyPos
        );

        if (distance <= 2) {
          const path = findPath(
            gameState,
            { row: unit.row, col: unit.col },
            keyPos,
            false
          );

          if (path.length > 0) {
            return [{ row: unit.row, col: unit.col }, path[0]];
          }
        }
      }
    }
  }

  return null;
}

function findStrategicAbilityMove(gameState: GameState, units: Unit[]): Position[] | null {
  // TODO: Implement ability system integration
  // This would check if using an ability would be beneficial
  return null;
}

function findCriticalGoldAttack(gameState: GameState, unit: Unit): Position | null {
  const goldCarriers = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits.filter(u => u.hasGold)
    : gameState.traderUnits.filter(u => u.hasGold);

  if (goldCarriers.length === 0) return null;

  // Find gold carrier closest to delivery zone
  const deliveryZones = gameState.currentPlayer === 'TRADER'
    ? [{ row: 0, col: 2 }, { row: 0, col: 5 }]
    : [{ row: 7, col: 2 }, { row: 7, col: 5 }];

  let mostCritical: Unit | null = null;
  let minDistance = Infinity;

  for (const carrier of goldCarriers) {
    for (const zone of deliveryZones) {
      const distance = manhattanDistance(
        { row: carrier.row, col: carrier.col },
        zone
      );

      if (distance < minDistance) {
        minDistance = distance;
        mostCritical = carrier;
      }
    }
  }

  if (mostCritical) {
    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      { row: mostCritical.row, col: mostCritical.col }
    );

    if (distance <= 2) {
      return { row: mostCritical.row, col: mostCritical.col };
    }
  }

  return null;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function findUnitAtPosition(gameState: GameState, pos: Position): Unit | undefined {
  return [...gameState.traderUnits, ...gameState.thiefUnits].find(
    u => u.row === pos.row && u.col === pos.col
  );
}

function getAllPossibleMoves(gameState: GameState, unit: Unit): Position[] {
  const moves: Position[] = [];
  const maxDistance = getMovementRange(gameState, { row: unit.row, col: unit.col });

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const distance = manhattanDistance(
        { row: unit.row, col: unit.col },
        { row, col }
      );

      if (distance <= maxDistance && distance > 0) {
        const targetCell = gameState.board[row][col];
        if (targetCell === '' || targetCell === 'SI' || targetCell === 'Z' ||
            isEnemyUnit(gameState, targetCell)) {
          moves.push({ row, col });
        }
      }
    }
  }

  return moves;
}

function isEnemyUnit(gameState: GameState, cellContent: string): boolean {
  if (!cellContent || cellContent === '' || cellContent === 'SI' || cellContent === 'Z') {
    return false;
  }

  const currentPlayerIsTrader = gameState.currentPlayer === 'TRADER';

  if (currentPlayerIsTrader) {
    return cellContent.includes('TH') || cellContent.includes('KT');
  }

  return cellContent.includes('TR') || cellContent.includes('H');
}

function findGoldCarrierAttack(gameState: GameState, unit: Unit): Position | null {
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  const goldCarriers = enemies.filter(e => e.hasGold);

  if (goldCarriers.length === 0) return null;

  const nearest = findNearestUnit(unit, goldCarriers);
  const distance = manhattanDistance(
    { row: unit.row, col: unit.col },
    { row: nearest.row, col: nearest.col }
  );

  if (distance === 1) {
    return { row: nearest.row, col: nearest.col };
  } else if (distance <= 2) {
    const path = findPath(
      gameState,
      { row: unit.row, col: unit.col },
      { row: nearest.row, col: nearest.col },
      false
    );
    return path.length > 0 ? path[0] : null;
  }

  return null;
}

function findSilkCollection(gameState: GameState, unit: Unit): Position | null {
  const silkPositions = findSilkPositions(gameState);

  if (silkPositions.length === 0) return null;

  const nearest = findNearestPosition(unit, silkPositions);
  const distance = manhattanDistance(
    { row: unit.row, col: unit.col },
    nearest
  );

  if (distance === 1) {
    return nearest;
  } else if (distance <= 3) {
    const path = findPath(
      gameState,
      { row: unit.row, col: unit.col },
      nearest,
      true
    );
    return path.length > 0 ? path[0] : null;
  }

  return null;
}

function findAttackMove(gameState: GameState, unit: Unit): Position | null {
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  if (enemies.length === 0) return null;

  const nearest = findNearestUnit(unit, enemies);
  const distance = manhattanDistance(
    { row: unit.row, col: unit.col },
    { row: nearest.row, col: nearest.col }
  );

  if (distance === 1) {
    return { row: nearest.row, col: nearest.col };
  } else if (distance <= 2) {
    const path = findPath(
      gameState,
      { row: unit.row, col: unit.col },
      { row: nearest.row, col: nearest.col },
      false
    );
    return path.length > 0 ? path[0] : null;
  }

  return null;
}

function findSilkPositions(gameState: GameState): Position[] {
  const positions: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (gameState.board[row][col] === 'SI') {
        positions.push({ row, col });
      }
    }
  }

  return positions;
}

function findGoldPositions(gameState: GameState): Position[] {
  const positions: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (gameState.board[row][col] === 'Z') {
        positions.push({ row, col });
      }
    }
  }

  return positions;
}

function findNearestPosition(unit: Unit, positions: Position[]): Position {
  return positions.reduce((nearest, current) => {
    const currentDist = manhattanDistance(
      { row: unit.row, col: unit.col },
      current
    );
    const nearestDist = manhattanDistance(
      { row: unit.row, col: unit.col },
      nearest
    );
    return currentDist < nearestDist ? current : nearest;
  });
}

function findNearestUnit(unit: Unit, units: Unit[]): Unit {
  return units.reduce((nearest, current) => {
    const currentDist = manhattanDistance(
      { row: unit.row, col: unit.col },
      { row: current.row, col: current.col }
    );
    const nearestDist = manhattanDistance(
      { row: unit.row, col: unit.col },
      { row: nearest.row, col: nearest.col }
    );
    return currentDist < nearestDist ? current : nearest;
  });
}

function findNearestEnemy(gameState: GameState, unit: Unit, enemies: Unit[]): Unit | null {
  if (enemies.length === 0) return null;
  return findNearestUnit(unit, enemies);
}

function hasNearbyThreat(gameState: GameState, unit: Unit, range: number): boolean {
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  return enemies.some(enemy => {
    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      { row: enemy.row, col: enemy.col }
    );
    return distance <= range;
  });
}

function hasNearbyGold(gameState: GameState, unit: Unit): boolean {
  const goldPositions = findGoldPositions(gameState);

  return goldPositions.some(pos => {
    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      pos
    );
    return distance <= 3;
  });
}

function hasSilkNearby(gameState: GameState, unit: Unit, range: number): boolean {
  const silkPositions = findSilkPositions(gameState);

  return silkPositions.some(pos => {
    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      pos
    );
    return distance <= range;
  });
}

function hasGoldCarrierNearby(gameState: GameState, unit: Unit, range: number): boolean {
  const allies = gameState.currentPlayer === 'TRADER'
    ? gameState.traderUnits
    : gameState.thiefUnits;

  return allies.some(ally => {
    if (!ally.hasGold) return false;

    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      { row: ally.row, col: ally.col }
    );
    return distance <= range;
  });
}

function canAttackEnemy(gameState: GameState, unit: Unit): boolean {
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  return enemies.some(enemy => {
    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      { row: enemy.row, col: enemy.col }
    );
    return distance <= 2;
  });
}

function canStealGold(gameState: GameState, unit: Unit): boolean {
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits.filter(u => u.hasGold)
    : gameState.traderUnits.filter(u => u.hasGold);

  return enemies.some(enemy => {
    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      { row: enemy.row, col: enemy.col }
    );
    return distance <= 2;
  });
}

function canFlankEnemy(gameState: GameState, unit: Unit): boolean {
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  return enemies.some(enemy => {
    const flankPos = findFlankPosition(gameState, unit, enemy);
    if (!flankPos) return false;

    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      flankPos
    );
    return distance <= 2;
  });
}

function needsToBuffAllies(gameState: GameState, unit: Unit): boolean {
  const allies = gameState.currentPlayer === 'TRADER'
    ? gameState.traderUnits
    : gameState.thiefUnits;

  // King Thief should buff when allies are nearby
  const nearbyAllies = allies.filter(ally => {
    if (ally === unit) return false;

    const distance = manhattanDistance(
      { row: unit.row, col: unit.col },
      { row: ally.row, col: ally.col }
    );
    return distance <= 2;
  });

  return nearbyAllies.length >= 1;
}

function canCoordinateAttack(gameState: GameState, unit: Unit): boolean {
  const allies = gameState.currentPlayer === 'TRADER'
    ? gameState.traderUnits
    : gameState.thiefUnits;

  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  // Check if allies can coordinate an attack
  return enemies.some(enemy => {
    const nearbyAllies = allies.filter(ally => {
      const distance = manhattanDistance(
        { row: ally.row, col: ally.col },
        { row: enemy.row, col: enemy.col }
      );
      return distance <= 2;
    });

    return nearbyAllies.length >= 2;
  });
}

function findBestTarget(gameState: GameState, unit: Unit): Unit | null {
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  if (enemies.length === 0) return null;

  // Prioritize gold carriers, then low HP units
  const goldCarriers = enemies.filter(e => e.hasGold);
  if (goldCarriers.length > 0) {
    return findNearestUnit(unit, goldCarriers);
  }

  const lowHpEnemies = enemies.filter(e => e.hp <= e.maxHp / 2);
  if (lowHpEnemies.length > 0) {
    return findNearestUnit(unit, lowHpEnemies);
  }

  return findNearestUnit(unit, enemies);
}

function findComboPosition(
  gameState: GameState,
  unit: Unit,
  target: Unit
): Position | null {
  // Find position that allows combo attack
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 },
    { row: -1, col: -1 },
    { row: -1, col: 1 },
    { row: 1, col: -1 },
    { row: 1, col: 1 }
  ];

  for (const dir of directions) {
    const pos = {
      row: target.row + dir.row,
      col: target.col + dir.col
    };

    if (isPositionValid(pos) && isCellWalkable(gameState, pos, false)) {
      return pos;
    }
  }

  return null;
}

function calculateFormationCenter(units: Unit[]): Position {
  if (units.length === 0) {
    return { row: 4, col: 4 }; // Default center
  }

  const sumRow = units.reduce((sum, u) => sum + u.row, 0);
  const sumCol = units.reduce((sum, u) => sum + u.col, 0);

  return {
    row: Math.round(sumRow / units.length),
    col: Math.round(sumCol / units.length)
  };
}

function findSafestPosition(gameState: GameState, unit: Unit): Position | null {
  const possibleMoves = getAllPossibleMoves(gameState, unit);

  if (possibleMoves.length === 0) return null;

  // Find position furthest from enemies
  const enemies = gameState.currentPlayer === 'TRADER'
    ? gameState.thiefUnits
    : gameState.traderUnits;

  let safest: Position | null = null;
  let maxMinDistance = -1;

  for (const pos of possibleMoves) {
    let minDistance = Infinity;

    for (const enemy of enemies) {
      const distance = manhattanDistance(
        pos,
        { row: enemy.row, col: enemy.col }
      );
      minDistance = Math.min(minDistance, distance);
    }

    if (minDistance > maxMinDistance) {
      maxMinDistance = minDistance;
      safest = pos;
    }
  }

  return safest;
}

function isPositionValid(pos: Position): boolean {
  return pos.row >= 0 && pos.row < BOARD_SIZE &&
         pos.col >= 0 && pos.col < BOARD_SIZE;
}

function evaluateGameState(gameState: GameState): {
  score: number;
  advantage: 'trader' | 'thief' | 'neutral';
} {
  let score = 0;

  // Unit count advantage
  score += gameState.traderUnits.length * 10;
  score -= gameState.thiefUnits.length * 10;

  // HP advantage
  const traderHp = gameState.traderUnits.reduce((sum, u) => sum + u.hp, 0);
  const thiefHp = gameState.thiefUnits.reduce((sum, u) => sum + u.hp, 0);
  score += traderHp - thiefHp;

  // Gold advantage
  const traderGold = gameState.traderUnits.filter(u => u.hasGold).length;
  const thiefGold = gameState.thiefUnits.filter(u => u.hasGold).length;
  score += (traderGold - thiefGold) * 20;

  // Silk advantage
  score += (gameState.silkCountTrader - gameState.silkCountThief) * 5;

  // Gold delivered
  score += gameState.goldDelivered * 50;

  let advantage: 'trader' | 'thief' | 'neutral' = 'neutral';
  if (score > 20) advantage = 'trader';
  if (score < -20) advantage = 'thief';

  return { score, advantage };
}

// ============================================================================
// GAME SCENARIO EXAMPLE
// ============================================================================

/**
 * Example game scenario demonstrating the AI system:
 *
 * SCENARIO: Gold Rush Defense
 *
 * Setup:
 * - Trader 1 picks up gold at position (0, 2)
 * - Trader 2 provides escort
 * - Hunter patrols for threats
 * - Thief 1 and 2 coordinate flanking attack
 * - King Thief buffs team and commands from center
 *
 * Turn 1 (Trader Team - Normal AI):
 * - Trader 1: Moves toward gold zone, picks up gold
 * - Trader 2: Moves to defensive position near Trader 1
 * - Hunter: Moves to intercept approaching thieves
 *
 * Turn 2 (Thief Team - Silkroad Master AI):
 * - Thief 1: Executes flanking maneuver to position behind Hunter
 * - Thief 2: Moves to cut off Trader 1's path to delivery zone
 * - King Thief: Positions in center, uses Rally ability to buff team
 *
 * Turn 3 (Trader Team - Normal AI):
 * - Trader 1: Attempts to break through to delivery zone
 * - Trader 2: Engages Thief 2 in combat to protect Trader 1
 * - Hunter: Turns to attack Thief 1 (flanking threat)
 *
 * Turn 4 (Thief Team - Silkroad Master AI):
 * - Thief 1: Combo attack on Hunter with Thief 2 nearby (bonus)
 * - Thief 2: Disarm ability on Trader 1, forces gold drop
 * - King Thief: Moves to secure dropped gold
 *
 * Result:
 * - Master AI successfully uses coordination and timing
 * - Normal AI reacts but lacks strategic depth
 * - Player would see clear visual feedback of AI decision-making
 */

export const EXAMPLE_SCENARIO = {
  name: 'Gold Rush Defense',
  description: 'Demonstrates AI decision-making at different difficulty levels',
  initialState: 'Trader 1 has gold, attempting delivery',
  aiDifficulty: AI_DIFFICULTY.SILKROAD_MASTER,
  expectedOutcome: 'Thieves coordinate to steal gold using advanced tactics'
};
