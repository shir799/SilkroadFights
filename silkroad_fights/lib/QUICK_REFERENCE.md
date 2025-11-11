# Quick Reference Guide - New Game Logic

## Table of Contents
- [AI Difficulty Levels](#ai-difficulty-levels)
- [Pathfinding](#pathfinding)
- [Player Control](#player-control)
- [Unit Behaviors](#unit-behaviors)
- [Code Examples](#code-examples)

## AI Difficulty Levels

### Noob AI
```typescript
import { makeNoobAiMove, AI_DIFFICULTY } from './lib/newGameLogic';

const aiMove = makeNoobAiMove(gameState);
// Returns: [fromPosition, toPosition] or null
```

**Characteristics:**
- Random unit selection
- Random move choice
- No strategy
- Easy to beat

**Use Case:** Tutorial mode, beginners

### Normal AI
```typescript
import { makeNormalAiMove } from './lib/newGameLogic';

const aiMove = makeNormalAiMove(gameState);
```

**Characteristics:**
- Prioritizes gold carriers
- Collects silk
- Basic threat awareness
- Predictable patterns

**Use Case:** Casual play, intermediate players

### Silkroad Master AI
```typescript
import { makeSilkroadMasterAiMove } from './lib/newGameLogic';

const aiMove = makeSilkroadMasterAiMove(gameState);
```

**Characteristics:**
- Advanced tactics (flanking, combos)
- Perfect timing
- Strategic positioning
- Adapts to game state

**Use Case:** Competitive play, expert players

## Pathfinding

### Basic Usage

```typescript
import { findPath } from './lib/newGameLogic';

const start = { row: 0, col: 0 };
const goal = { row: 7, col: 7 };
const avoidEnemies = true;

const path = findPath(gameState, start, goal, avoidEnemies);

// path = [
//   { row: 0, col: 1 },
//   { row: 0, col: 2 },
//   { row: 1, col: 2 },
//   ...
// ]

// First move
const nextMove = path[0];
```

### Auto-Pathfinding for Traders

```typescript
function autoPathToDelivery(trader: Unit) {
  const deliveryZones = [
    { row: 7, col: 2 },
    { row: 7, col: 5 }
  ];

  // Find nearest delivery zone
  const goal = findNearestPosition(trader, deliveryZones);

  // Calculate path
  const path = findPath(
    gameState,
    { row: trader.row, col: trader.col },
    goal,
    true // Avoid enemies
  );

  // Execute path step by step
  for (const step of path) {
    moveUnit(gameState, { row: trader.row, col: trader.col }, step);
  }
}
```

## Player Control

### Validation

```typescript
import { canPlayerControlUnit, isValidPlayerMove } from './lib/newGameLogic';

// Check if player can select unit
const canSelect = canPlayerControlUnit(gameState, unitPosition, 'player');

if (!canSelect) {
  showError('You cannot control this unit!');
  return;
}

// Check if move is valid
const validation = isValidPlayerMove(gameState, fromPosition, toPosition);

if (!validation.valid) {
  showError(validation.reason);
  // Possible reasons:
  // - "You cannot control this unit"
  // - "Not your turn"
  // - "Unit is immobilized"
  // - "Out of movement range"
  // - "Blocked by friendly unit"
  return;
}
```

### UI Integration

```typescript
// In your GameBoard component
const handleCellClick = (row: number, col: number) => {
  const position = { row, col };

  // Visual feedback for controllable units
  const canControl = canPlayerControlUnit(gameState, position, 'player');

  if (canControl) {
    // Highlight unit
    setSelectedUnit(position);

    // Show valid moves
    const validMoves = getValidMoves(gameState, position);
    setHighlightedMoves(validMoves);
  } else {
    // Show lock icon or error
    showLockedUnitIndicator(position);
  }
};
```

### CSS Styling

```typescript
const getCellClassName = (row: number, col: number) => {
  const position = { row, col };
  const canControl = canPlayerControlUnit(gameState, position, 'player');

  return cn(
    'game-cell',
    canControl ? 'controllable' : 'locked',
    selectedUnit?.row === row && selectedUnit?.col === col ? 'selected' : ''
  );
};
```

```css
.game-cell.controllable {
  border: 2px solid #4CAF50;
  cursor: pointer;
  transition: transform 0.2s;
}

.game-cell.controllable:hover {
  transform: scale(1.05);
  box-shadow: 0 0 10px rgba(76, 175, 80, 0.5);
}

.game-cell.locked {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale(30%);
}

.game-cell.selected {
  border: 3px solid #FFD700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.7);
}
```

## Unit Behaviors

### Execute Behavior

```typescript
import { executeUnitBehavior } from './lib/newGameLogic';

// Get next move for a unit based on its role
const nextMove = executeUnitBehavior(gameState, unit);

if (nextMove) {
  moveUnit(gameState, { row: unit.row, col: unit.col }, nextMove);
}
```

### Trader Behavior Priorities

```typescript
// Priority 10: Deliver gold if carrying
if (unit.hasGold) {
  return pathToDeliveryZone();
}

// Priority 8: Pick up gold if nearby
if (hasNearbyGold(gameState, unit)) {
  return pathToGold();
}

// Priority 6: Regroup if threatened
if (hasNearbyThreat(gameState, unit, 3)) {
  return pathToAllies();
}

// Priority 4: Collect silk
if (hasSilkNearby(gameState, unit, 4)) {
  return pathToSilk();
}
```

### Hunter Behavior Priorities

```typescript
// Priority 10: Protect gold carriers
if (hasGoldCarrierNearby(gameState, unit, 3)) {
  return stayCloseToCarrier();
}

// Priority 8: Attack nearby enemies
if (canAttackEnemy(gameState, unit)) {
  return attackEnemy();
}

// Priority 5: Hunt thieves
return huntThieves();
```

### Thief Behavior Priorities

```typescript
// Priority 10: Steal gold
if (canStealGold(gameState, unit)) {
  return attackGoldCarrier();
}

// Priority 8: Flanking maneuver
if (canFlankEnemy(gameState, unit)) {
  return executeFlank();
}

// Priority 6: Hit-and-run (if low HP)
if (unit.hp < unit.maxHp / 2) {
  return retreat();
}

// Priority 4: Collect silk
return collectSilk();
```

### King Thief Behavior Priorities

```typescript
// Priority 10: Buff allies
if (needsToBuffAllies(gameState, unit)) {
  return stayInPosition(); // Provide aura
}

// Priority 8: Coordinate attack
if (canCoordinateAttack(gameState, unit)) {
  return positionForCombo();
}

// Priority 5: Support formation
return maintainFormation();
```

## Code Examples

### Example 1: Full AI Turn Implementation

```typescript
import { makeSmartAiMove, AI_DIFFICULTY } from './lib/newGameLogic';

async function handleAiTurn(gameState: GameState, difficulty: string) {
  // Show AI thinking indicator
  setAiThinking(true);

  // Add delay for better UX
  await new Promise(resolve => setTimeout(resolve, 500));

  // Get AI move
  const aiMove = makeSmartAiMove(gameState, difficulty);

  if (!aiMove) {
    // AI has no valid moves
    console.log('AI passes turn');
    passTurn();
    setAiThinking(false);
    return;
  }

  const [from, to] = aiMove;

  // Animate movement
  await animateUnitMovement(from, to);

  // Execute move
  const newGameState = moveUnit(gameState, from, to);
  setGameState(newGameState);

  // Check victory conditions
  const winner = checkVictoryConditions(newGameState);
  if (winner) {
    showVictoryScreen(winner);
  }

  setAiThinking(false);
}
```

### Example 2: Player Move with Validation

```typescript
import { isValidPlayerMove } from './lib/newGameLogic';

function handlePlayerMove(from: Position, to: Position) {
  // Validate move
  const validation = isValidPlayerMove(gameState, from, to);

  if (!validation.valid) {
    // Show error notification
    toast.error(validation.reason, {
      position: 'top-center',
      duration: 2000
    });
    return;
  }

  // Show move preview
  showMovePreview(from, to);

  // Confirm move
  confirmMove()
    .then(() => {
      // Execute move
      const newGameState = moveUnit(gameState, from, to);
      setGameState(newGameState);

      // Trigger AI turn
      handleAiTurn(newGameState, currentDifficulty);
    })
    .catch(() => {
      // Move cancelled
      clearSelection();
    });
}
```

### Example 3: Auto-Pathfinding with Visualization

```typescript
import { findPath } from './lib/newGameLogic';

function showAutoPath(unit: Unit, goal: Position) {
  // Calculate path
  const path = findPath(
    gameState,
    { row: unit.row, col: unit.col },
    goal,
    true
  );

  if (path.length === 0) {
    toast.error('No path available!');
    return;
  }

  // Visualize path
  setHighlightedPath(path);

  // Show path distance
  toast.info(`Distance: ${path.length} moves`);

  // Auto-execute option
  if (autoMoveEnabled) {
    executePathAnimated(unit, path);
  }
}

async function executePathAnimated(unit: Unit, path: Position[]) {
  for (const step of path) {
    await new Promise(resolve => setTimeout(resolve, 300));

    const newGameState = moveUnit(
      gameState,
      { row: unit.row, col: unit.col },
      step
    );

    setGameState(newGameState);

    // Check for interruptions (combat, etc.)
    if (newGameState.combatResult) {
      break; // Stop path execution
    }
  }
}
```

### Example 4: Game State Evaluation

```typescript
function evaluateGameState(gameState: GameState) {
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

  // Determine advantage
  let advantage: 'trader' | 'thief' | 'neutral' = 'neutral';
  if (score > 20) advantage = 'trader';
  if (score < -20) advantage = 'thief';

  return { score, advantage };
}

// Use in UI
function GameStatusBar() {
  const evaluation = evaluateGameState(gameState);

  return (
    <div className="status-bar">
      <div className="score">Score: {evaluation.score}</div>
      <div className={`advantage ${evaluation.advantage}`}>
        {evaluation.advantage === 'trader' && '🛡️ Traders Leading'}
        {evaluation.advantage === 'thief' && '🗡️ Thieves Leading'}
        {evaluation.advantage === 'neutral' && '⚖️ Even Match'}
      </div>
    </div>
  );
}
```

### Example 5: Difficulty Selector

```typescript
import { AI_DIFFICULTY } from './lib/newGameLogic';

function DifficultySelector() {
  const [difficulty, setDifficulty] = useState(AI_DIFFICULTY.NORMAL);

  return (
    <div className="difficulty-selector">
      <h3>Select AI Difficulty</h3>

      <button
        onClick={() => setDifficulty(AI_DIFFICULTY.NOOB)}
        className={difficulty === AI_DIFFICULTY.NOOB ? 'active' : ''}
      >
        🟢 Noob
        <span className="description">Random moves, no strategy</span>
      </button>

      <button
        onClick={() => setDifficulty(AI_DIFFICULTY.NORMAL)}
        className={difficulty === AI_DIFFICULTY.NORMAL ? 'active' : ''}
      >
        🟡 Normal
        <span className="description">Basic tactics, balanced</span>
      </button>

      <button
        onClick={() => setDifficulty(AI_DIFFICULTY.SILKROAD_MASTER)}
        className={difficulty === AI_DIFFICULTY.SILKROAD_MASTER ? 'active' : ''}
      >
        🔴 Silkroad Master
        <span className="description">Advanced AI, very challenging</span>
      </button>
    </div>
  );
}
```

## Performance Tips

### 1. Cache Pathfinding Results

```typescript
const pathCache = new Map<string, Position[]>();

function getCachedPath(start: Position, goal: Position) {
  const key = `${start.row},${start.col}-${goal.row},${goal.col}`;

  if (pathCache.has(key)) {
    return pathCache.get(key)!;
  }

  const path = findPath(gameState, start, goal, true);
  pathCache.set(key, path);

  return path;
}

// Clear cache when game state changes
function onGameStateChange() {
  pathCache.clear();
}
```

### 2. Limit AI Thinking Time

```typescript
const AI_TIMEOUT = 2000; // 2 seconds

async function makeAiMoveWithTimeout() {
  try {
    const aiMove = await Promise.race([
      makeSmartAiMove(gameState, difficulty),
      new Promise((_, reject) =>
        setTimeout(() => reject('timeout'), AI_TIMEOUT)
      )
    ]);

    return aiMove;
  } catch (error) {
    // Fallback to simpler AI if timeout
    return makeNoobAiMove(gameState);
  }
}
```

### 3. Optimize Board Scanning

```typescript
// Instead of scanning entire board multiple times
// Scan once and cache results

interface BoardCache {
  silkPositions: Position[];
  goldPositions: Position[];
  traderPositions: Position[];
  thiefPositions: Position[];
}

function scanBoard(gameState: GameState): BoardCache {
  const cache: BoardCache = {
    silkPositions: [],
    goldPositions: [],
    traderPositions: [],
    thiefPositions: []
  };

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = gameState.board[row][col];
      const pos = { row, col };

      if (cell === 'SI') cache.silkPositions.push(pos);
      if (cell === 'Z') cache.goldPositions.push(pos);
      if (cell.includes('TR') || cell.includes('H')) {
        cache.traderPositions.push(pos);
      }
      if (cell.includes('TH') || cell.includes('KT')) {
        cache.thiefPositions.push(pos);
      }
    }
  }

  return cache;
}
```

## Debugging

### Enable AI Debug Mode

```typescript
const DEBUG_AI = true;

function makeSmartAiMoveDebug(gameState: GameState, difficulty: string) {
  console.group('AI Decision Making');

  // Log game state
  console.log('Current Turn:', gameState.currentPlayer);
  console.log('Difficulty:', difficulty);

  // Evaluate state
  const evaluation = evaluateGameState(gameState);
  console.log('State Evaluation:', evaluation);

  // Get AI move
  const aiMove = makeSmartAiMove(gameState, difficulty);

  if (aiMove) {
    const [from, to] = aiMove;
    console.log('AI Move:', { from, to });

    const unit = findUnitAtPosition(gameState, from);
    console.log('Unit:', unit?.type, unit?.hp);
  } else {
    console.log('No valid moves');
  }

  console.groupEnd();

  return aiMove;
}
```

### Visualize Pathfinding

```typescript
function visualizePathfinding(start: Position, goal: Position) {
  console.log('Pathfinding:', start, '→', goal);

  // Intercept pathfinding algorithm to visualize
  const path = findPath(gameState, start, goal, true);

  // Draw path on board
  const pathSet = new Set(path.map(p => `${p.row},${p.col}`));

  for (let row = 0; row < BOARD_SIZE; row++) {
    let rowStr = '';
    for (let col = 0; col < BOARD_SIZE; col++) {
      const key = `${row},${col}`;

      if (row === start.row && col === start.col) {
        rowStr += 'S '; // Start
      } else if (row === goal.row && col === goal.col) {
        rowStr += 'G '; // Goal
      } else if (pathSet.has(key)) {
        rowStr += '• '; // Path
      } else {
        rowStr += '. ';
      }
    }
    console.log(rowStr);
  }

  console.log(`Path length: ${path.length} moves`);
}
```

## Troubleshooting

### Issue: AI not making moves

**Solution:**
```typescript
// Check if AI has valid units
if (aiUnits.length === 0) {
  console.error('AI has no units!');
  return null;
}

// Check if units have valid moves
const validMoves = aiUnits.map(unit =>
  getAllPossibleMoves(gameState, unit)
);

console.log('Valid moves per unit:', validMoves);
```

### Issue: Player can control enemy units

**Solution:**
```typescript
// Ensure validation is called
const canControl = canPlayerControlUnit(gameState, position, 'player');

if (!canControl) {
  console.error('Player cannot control this unit!');
  return; // Block interaction
}

// Double-check team assignment
console.log('Player team:', gameState.isTraderPlayer ? 'TRADER' : 'THIEF');
console.log('Unit type:', unitType);
```

### Issue: Pathfinding returns empty path

**Solution:**
```typescript
const path = findPath(gameState, start, goal, avoidEnemies);

if (path.length === 0) {
  console.warn('No path found!');

  // Check if goal is reachable
  const goalCell = gameState.board[goal.row][goal.col];
  console.log('Goal cell:', goalCell);

  // Try without avoiding enemies
  const alternativePath = findPath(gameState, start, goal, false);
  console.log('Alternative path:', alternativePath);
}
```

## Summary

This quick reference covers:
- ✅ AI difficulty levels and usage
- ✅ Pathfinding implementation
- ✅ Player control validation
- ✅ Unit behavior priorities
- ✅ Code examples and integration
- ✅ Performance optimization
- ✅ Debugging and troubleshooting

For detailed documentation, see `newGameLogic.README.md`.
