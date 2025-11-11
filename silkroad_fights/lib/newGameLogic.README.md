# Silkroad Fights - Advanced Game Logic Documentation

## Overview

This document explains the implementation of the new game logic system with smart AI, pathfinding, and player control validation.

## Architecture

### 1. Pathfinding System (A* Algorithm)

The pathfinding system uses the A* algorithm to find optimal paths for units to move across the board.

#### How it Works:

```typescript
const path = findPath(gameState, startPosition, goalPosition, avoidEnemies);
```

- **Cost Calculation**: `fCost = gCost + hCost`
  - `gCost`: Actual distance traveled from start
  - `hCost`: Estimated distance to goal (Manhattan distance)
  - `fCost`: Total estimated cost

- **Algorithm Steps**:
  1. Start with initial position
  2. Explore neighboring cells
  3. Calculate costs for each neighbor
  4. Choose path with lowest fCost
  5. Repeat until goal reached or no path found

- **Obstacle Avoidance**:
  - Avoids friendly units
  - Avoids traps
  - Avoids boss monsters
  - Optionally avoids enemies (for defensive movement)

#### Example Usage:

```typescript
// Trader auto-pathing to delivery zone
const deliveryZone = { row: 7, col: 2 };
const traderPosition = { row: 3, col: 4 };
const path = findPath(gameState, traderPosition, deliveryZone, true);

// First element of path is next move
const nextMove = path[0]; // { row: 3, col: 3 }
```

### 2. Player Control Validation

Strict validation ensures players can ONLY control their own units.

#### Validation Layers:

**Layer 1: Unit Ownership Check**
```typescript
function canPlayerControlUnit(gameState, unitPosition, playerId) {
  const isTraderTeam = gameState.isTraderPlayer;
  const cell = gameState.board[unitPosition.row][unitPosition.col];

  // Trader player: Can only control TR and H
  // Thief player: Can only control TH and KT

  if (isTraderTeam) {
    return cell.includes('TR') || cell.includes('H');
  }
  return cell.includes('TH') || cell.includes('KT');
}
```

**Layer 2: Move Validation**
```typescript
function isValidPlayerMove(gameState, from, to) {
  // Check 1: Player owns the unit
  if (!canPlayerControlUnit(gameState, from, 'player')) {
    return { valid: false, reason: 'You cannot control this unit' };
  }

  // Check 2: It's player's turn
  // Check 3: Unit not immobilized
  // Check 4: Move within range
  // Check 5: Destination not blocked

  return { valid: true };
}
```

**Layer 3: Visual Feedback**
- Controllable units: Highlighted border
- Enemy units: Locked, no interaction
- Valid moves: Green indicator
- Invalid moves: Red indicator

#### Implementation in UI:

```typescript
// In GameBoard component
const handleCellClick = (row: number, col: number) => {
  const position = { row, col };

  // Check if player can control this unit
  if (!canPlayerControlUnit(gameState, position, playerId)) {
    showError('You cannot control enemy units!');
    return;
  }

  // Proceed with selection/movement
  selectUnit(position);
};
```

### 3. Smart AI System (3 Difficulty Levels)

#### NOOB AI
- **Strategy**: Random
- **Behavior**: No planning, random unit selection, random moves
- **Tactics**: None

```typescript
function makeNoobAiMove(gameState) {
  const randomUnit = pickRandom(aiUnits);
  const randomMove = pickRandom(possibleMoves);
  return [unitPosition, randomMove];
}
```

**Characteristics**:
- 0% strategic thinking
- Does not prioritize targets
- Does not use abilities effectively
- Perfect for beginners

#### NORMAL AI
- **Strategy**: Basic tactics
- **Behavior**: Prioritized decision-making
- **Tactics**: Focus silk carriers, basic positioning

```typescript
function makeNormalAiMove(gameState) {
  // Priority 1: Attack gold carriers
  // Priority 2: Collect silk
  // Priority 3: Attack any enemy
  // Priority 4: Use unit behavior
  // Priority 5: Random move
}
```

**Characteristics**:
- Focuses on high-value targets (gold carriers)
- Collects resources (silk)
- Basic threat awareness
- Suitable for intermediate players

#### SILKROAD MASTER AI
- **Strategy**: Advanced tactics
- **Behavior**: Strategic planning, coordination
- **Tactics**: Flanking, combos, perfect timing

```typescript
function makeSilkroadMasterAiMove(gameState) {
  // Priority 1: Combo attacks (2+ units)
  // Priority 2: Strategic ability usage
  // Priority 3: Flanking maneuvers
  // Priority 4: Critical gold attacks
  // Priority 5: Positional advantage
  // Priority 6: Area control
}
```

**Advanced Features**:

1. **Combo Attacks**:
   - Coordinates multiple units
   - Attacks from multiple angles
   - Maximizes damage output

2. **Flanking**:
   - Positions units behind enemies
   - Surrounds high-value targets
   - Cuts off escape routes

3. **Perfect Timing**:
   - Attacks gold carriers near delivery
   - Uses abilities at optimal moments
   - Denies opponent scoring opportunities

4. **Positional Play**:
   - Controls center of board
   - Blocks key choke points
   - Maintains formation

5. **Threat Assessment**:
   - Evaluates game state continuously
   - Adapts strategy based on advantage
   - Calculates risk/reward

**Characteristics**:
- Near-perfect play
- Uses all available tools
- Anticipates player moves
- Challenging for expert players

### 4. Unit Behavior System

Each unit type has specific behaviors based on their role.

#### Trader Behavior

**Priority System**:
1. **Deliver Gold** (Priority 10) - If carrying gold, path to delivery zone
2. **Pick Up Gold** (Priority 8) - If gold nearby and not carrying
3. **Regroup** (Priority 6) - If threatened, move toward allies
4. **Collect Silk** (Priority 4) - If silk nearby

```typescript
// Example: Trader with gold
const traderWithGold = { type: 'TR', hasGold: true, row: 3, col: 4 };
const behavior = executeUnitBehavior(gameState, traderWithGold);
// Result: Moves toward delivery zone at (7, 2)
```

**Defensive Formation**:
- Traders stay close to each other
- Form protective circle when threatened
- Gold carriers in center

#### Hunter Behavior

**Priority System**:
1. **Bodyguard** (Priority 10) - Stay close to gold carriers
2. **Attack Enemies** (Priority 8) - Engage nearby thieves
3. **Hunt** (Priority 5) - Patrol and track thieves

```typescript
// Example: Hunter protecting gold carrier
const hunter = { type: 'H', row: 3, col: 3 };
const goldCarrier = { type: 'TR', hasGold: true, row: 3, col: 4 };
const behavior = executeUnitBehavior(gameState, hunter);
// Result: Stays adjacent to gold carrier
```

**Aggressive Tactics**:
- Pursues thieves relentlessly
- Uses Track ability
- Intercepts threats

#### Thief Behavior

**Priority System**:
1. **Steal Gold** (Priority 10) - Attack gold carriers
2. **Flanking** (Priority 8) - Position behind enemies
3. **Hit-and-Run** (Priority 6) - Retreat if low HP
4. **Collect Silk** (Priority 4) - Gather resources

```typescript
// Example: Thief executing hit-and-run
const thief = { type: 'TH', hp: 1, maxHp: 2, row: 4, col: 4 };
const behavior = executeUnitBehavior(gameState, thief);
// Result: Retreats to safe position away from enemies
```

**Ambush Tactics**:
- Waits in hiding
- Uses Shadowstep ability
- Strikes from unexpected angles

#### King Thief Behavior

**Priority System**:
1. **Buff Allies** (Priority 10) - Stay in range to buff
2. **Coordinate Attack** (Priority 8) - Position for combos
3. **Formation** (Priority 5) - Maintain strategic position

```typescript
// Example: King Thief commanding
const kingThief = { type: 'KT', row: 4, col: 4 };
const behavior = executeUnitBehavior(gameState, kingThief);
// Result: Positions to buff all nearby thieves with Rally
```

**Command Abilities**:
- Provides aura buffs
- Coordinates team attacks
- Strategic positioning

### 5. Game Mechanics

#### Real-Time Silk Collection

```typescript
// Silk spawns every 3 rounds
if (roundNumber % 3 === 0) {
  spawnSilk(gameState);
}

// Maximum 3 silk on board at once
const silkCount = countSilkOnBoard(gameState.board);
if (silkCount < MAX_SILK_ON_BOARD) {
  placeRandomSilk(gameState.board, 1);
}
```

#### Dynamic Boss Spawning

```typescript
// Boss spawns every 10 rounds
if (roundNumber % 10 === 0 && bossMonsters.length === 0) {
  spawnBoss(gameState);
}

// Boss types: TigerGiry, SkeletoKing, Murucha
// Each has unique rewards and movement patterns
```

#### Victory Conditions

```typescript
function checkVictoryConditions(gameState) {
  // Trader Victory: Deliver 2 gold
  if (gameState.goldDelivered === 2) {
    return 'TRADER';
  }

  // Thief Victory: Eliminate all traders
  if (gameState.traderUnits.filter(u => u.type === 'TR').length === 0) {
    return 'THIEF';
  }

  return null; // Game continues
}
```

#### Scoring System

```typescript
function evaluateGameState(gameState) {
  let score = 0;

  // Unit count: +10 per unit
  score += traderUnits.length * 10;
  score -= thiefUnits.length * 10;

  // HP total: +1 per HP
  score += traderHp - thiefHp;

  // Gold carriers: +20 per carrier
  score += (traderGold - thiefGold) * 20;

  // Silk: +5 per silk
  score += (silkCountTrader - silkCountThief) * 5;

  // Gold delivered: +50 per delivery
  score += goldDelivered * 50;

  return { score, advantage };
}
```

## Integration Guide

### Step 1: Import New Game Logic

```typescript
import {
  findPath,
  canPlayerControlUnit,
  isValidPlayerMove,
  makeSmartAiMove,
  executeUnitBehavior,
  AI_DIFFICULTY
} from './lib/newGameLogic';
```

### Step 2: Update Game State Management

```typescript
// In your game component
const [gameState, setGameState] = useState<GameState>(initialState);
const [aiDifficulty, setAiDifficulty] = useState(AI_DIFFICULTY.NORMAL);

// Handle player move
const handlePlayerMove = (from: Position, to: Position) => {
  // Validate move
  const validation = isValidPlayerMove(gameState, from, to);

  if (!validation.valid) {
    showError(validation.reason);
    return;
  }

  // Execute move
  const newState = moveUnit(gameState, from, to);
  setGameState(newState);

  // Trigger AI turn
  setTimeout(() => handleAiTurn(), 500);
};
```

### Step 3: Implement AI Turn

```typescript
const handleAiTurn = () => {
  // Get AI move
  const aiMove = makeSmartAiMove(gameState, aiDifficulty);

  if (!aiMove) {
    // AI has no moves, pass turn
    passTurn();
    return;
  }

  const [from, to] = aiMove;

  // Execute AI move
  const newState = moveUnit(gameState, from, to);
  setGameState(newState);
};
```

### Step 4: Add Auto-Pathfinding for Traders

```typescript
const handleAutoPath = (traderId: string) => {
  const trader = gameState.traderUnits.find(u => u.id === traderId);

  if (!trader) return;

  // Find path to delivery zone
  const deliveryZone = { row: 7, col: 2 };
  const path = findPath(
    gameState,
    { row: trader.row, col: trader.col },
    deliveryZone,
    true
  );

  // Visualize path
  setHighlightedPath(path);

  // Auto-execute movement
  if (autoMove) {
    executePath(trader, path);
  }
};
```

### Step 5: Update UI with Control Validation

```typescript
// In GameBoard component
const getCellStyle = (row: number, col: number) => {
  const position = { row, col };
  const canControl = canPlayerControlUnit(gameState, position, 'player');

  return {
    border: canControl ? '2px solid #4CAF50' : '1px solid #333',
    cursor: canControl ? 'pointer' : 'not-allowed',
    opacity: canControl ? 1 : 0.7
  };
};
```

## Example Game Scenario

### Scenario: "The Gold Rush"

**Setup**:
- Trader 1 at (6, 1) - No gold
- Trader 2 at (6, 6) - No gold
- Hunter at (5, 3) - Patrolling
- Thief 1 at (1, 1) - Aggressive
- Thief 2 at (1, 6) - Aggressive
- King Thief at (2, 3) - Command position
- Gold at (0, 2) and (0, 5)

**Turn 1 - Trader Team (Player)**:
```
Player Action: Move Trader 1 to pick up gold
- From: (6, 1)
- To: (0, 2)
- Path: Uses A* pathfinding to avoid thieves
- Result: Trader 1 picks up gold
```

**Turn 2 - Thief Team (Silkroad Master AI)**:
```
AI Analysis:
- Detects Trader 1 has gold
- Evaluates threat level: HIGH
- Calculates intercept path

AI Decision: King Thief uses Rally, Thief 2 flanks

Thief 2 Action:
- From: (1, 6)
- To: (1, 4)
- Reasoning: Cut off escape route
- Tactic: Flanking maneuver
```

**Turn 3 - Trader Team (Player)**:
```
Player Action: Hunter protects Trader 1
- From: (5, 3)
- To: (2, 2)
- Reasoning: Bodyguard behavior
- Result: Hunter adjacent to gold carrier
```

**Turn 4 - Thief Team (Silkroad Master AI)**:
```
AI Analysis:
- Trader 1 is 3 moves from delivery
- Hunter is protecting
- Combo attack opportunity detected

AI Decision: Coordinate attack with Thief 1 + Thief 2

Thief 1 Action:
- From: (1, 1)
- To: (1, 2)
- Thief 2 moves to (1, 3)
- Result: Both adjacent to Hunter
- Tactic: Combo attack - +2 attack bonus
```

**Outcome**:
- Master AI successfully uses coordination
- Player must react to multi-angle threat
- Demonstrates advanced tactical thinking

## Performance Considerations

### Pathfinding Optimization

```typescript
// Use max iterations to prevent infinite loops
const PATHFINDING_MAX_ITERATIONS = 100;

// Cache pathfinding results
const pathCache = new Map<string, Position[]>();

function findPathCached(gameState, start, goal) {
  const key = `${start.row},${start.col}-${goal.row},${goal.col}`;

  if (pathCache.has(key)) {
    return pathCache.get(key);
  }

  const path = findPath(gameState, start, goal);
  pathCache.set(key, path);

  return path;
}
```

### AI Decision Time

```typescript
// Limit AI thinking time
const AI_DECISION_TIMEOUT = 1000; // 1 second max

async function makeSmartAiMoveWithTimeout(gameState, difficulty) {
  return Promise.race([
    makeSmartAiMove(gameState, difficulty),
    new Promise((_, reject) =>
      setTimeout(() => reject('AI timeout'), AI_DECISION_TIMEOUT)
    )
  ]);
}
```

## Testing

### Unit Tests

```typescript
describe('Pathfinding', () => {
  test('finds shortest path', () => {
    const path = findPath(gameState, { row: 0, col: 0 }, { row: 7, col: 7 });
    expect(path.length).toBe(14); // Manhattan distance
  });

  test('avoids obstacles', () => {
    // Place obstacle at (3, 3)
    gameState.board[3][3] = 'BM';

    const path = findPath(gameState, { row: 2, col: 3 }, { row: 4, col: 3 });

    // Path should go around obstacle
    expect(path).not.toContainEqual({ row: 3, col: 3 });
  });
});

describe('Player Control', () => {
  test('trader player cannot control thief units', () => {
    gameState.isTraderPlayer = true;
    const thiefPosition = { row: 0, col: 1 };

    expect(canPlayerControlUnit(gameState, thiefPosition, 'player')).toBe(false);
  });

  test('move validation rejects out-of-range moves', () => {
    const from = { row: 3, col: 3 };
    const to = { row: 6, col: 6 }; // Too far

    const result = isValidPlayerMove(gameState, from, to);

    expect(result.valid).toBe(false);
    expect(result.reason).toBe('Out of movement range');
  });
});
```

## Conclusion

The new game logic system provides:

1. **Intelligent AI** with 3 distinct difficulty levels
2. **Smart pathfinding** using A* algorithm
3. **Strict player control** validation
4. **Role-based behaviors** for each unit type
5. **Advanced tactics** including flanking, combos, and coordination

This creates a challenging, fair, and engaging gameplay experience that scales from beginners to experts.
