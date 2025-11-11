# Quick Start Guide - Silkroad Fights New Game Logic

## Get Started in 5 Minutes

### Step 1: Import the New Logic (30 seconds)

```typescript
// In your GameScreen.tsx or main game component
import {
  findPath,
  canPlayerControlUnit,
  isValidPlayerMove,
  makeSmartAiMove,
  executeUnitBehavior,
  AI_DIFFICULTY
} from './lib/newGameLogic';
```

### Step 2: Add AI Difficulty State (1 minute)

```typescript
// Add to your component state
const [aiDifficulty, setAiDifficulty] = useState(AI_DIFFICULTY.NORMAL);

// Add difficulty selector to UI
<select value={aiDifficulty} onChange={(e) => setAiDifficulty(e.target.value)}>
  <option value={AI_DIFFICULTY.NOOB}>Noob - Easy</option>
  <option value={AI_DIFFICULTY.NORMAL}>Normal - Medium</option>
  <option value={AI_DIFFICULTY.SILKROAD_MASTER}>Master - Hard</option>
</select>
```

### Step 3: Update Click Handler (2 minutes)

```typescript
const handleCellClick = (row: number, col: number) => {
  const position = { row, col };

  // STEP 1: Check if player can control this unit
  if (!selectedUnit && gameState.board[row][col]) {
    if (!canPlayerControlUnit(gameState, position, 'player')) {
      toast.error('You cannot control this unit!');
      return;
    }
    setSelectedUnit(position);
    return;
  }

  // STEP 2: Validate move
  if (selectedUnit) {
    const validation = isValidPlayerMove(gameState, selectedUnit, position);

    if (!validation.valid) {
      toast.error(validation.reason);
      return;
    }

    // STEP 3: Execute move
    const newState = moveUnit(gameState, selectedUnit, position);
    setGameState(newState);
    setSelectedUnit(null);

    // STEP 4: Trigger AI turn
    setTimeout(() => handleAiTurn(newState), 500);
  }
};
```

### Step 4: Update AI Turn Handler (1.5 minutes)

```typescript
const handleAiTurn = async (currentState: GameState) => {
  // Show AI is thinking
  setAiThinking(true);

  // Get AI move using new smart AI
  const aiMove = makeSmartAiMove(currentState, aiDifficulty);

  if (!aiMove) {
    // AI has no valid moves, pass turn
    setAiThinking(false);
    return;
  }

  const [from, to] = aiMove;

  // Animate movement (optional)
  await animateMove(from, to);

  // Execute AI move
  const newState = moveUnit(currentState, from, to);
  setGameState(newState);

  // Check victory
  const winner = checkVictoryConditions(newState);
  if (winner) {
    showVictoryScreen(winner);
  }

  setAiThinking(false);
};
```

### Step 5: Add Visual Feedback (30 seconds)

```typescript
// In your cell rendering
const getCellClassName = (row: number, col: number) => {
  const position = { row, col };
  const canControl = canPlayerControlUnit(gameState, position, 'player');

  return cn(
    'game-cell',
    canControl && 'controllable hover:scale-105',
    !canControl && 'opacity-70 cursor-not-allowed'
  );
};
```

## Complete Example Component

```typescript
import React, { useState } from 'react';
import {
  findPath,
  canPlayerControlUnit,
  isValidPlayerMove,
  makeSmartAiMove,
  AI_DIFFICULTY
} from './lib/newGameLogic';
import { GameState, Position } from './lib/types';
import { moveUnit, checkVictoryConditions } from './lib/gameLogic';
import { toast } from 'sonner';

export function GameScreen() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [selectedUnit, setSelectedUnit] = useState<Position | null>(null);
  const [aiDifficulty, setAiDifficulty] = useState(AI_DIFFICULTY.NORMAL);
  const [aiThinking, setAiThinking] = useState(false);

  const handleCellClick = (row: number, col: number) => {
    const position = { row, col };

    // Select unit
    if (!selectedUnit) {
      if (!canPlayerControlUnit(gameState, position, 'player')) {
        toast.error('You cannot control this unit!');
        return;
      }
      setSelectedUnit(position);
      return;
    }

    // Move unit
    const validation = isValidPlayerMove(gameState, selectedUnit, position);

    if (!validation.valid) {
      toast.error(validation.reason);
      setSelectedUnit(null);
      return;
    }

    // Execute move
    const newState = moveUnit(gameState, selectedUnit, position);
    setGameState(newState);
    setSelectedUnit(null);

    // AI turn
    setTimeout(() => handleAiTurn(newState), 500);
  };

  const handleAiTurn = async (currentState: GameState) => {
    setAiThinking(true);

    const aiMove = makeSmartAiMove(currentState, aiDifficulty);

    if (aiMove) {
      const [from, to] = aiMove;
      await new Promise(resolve => setTimeout(resolve, 300));

      const newState = moveUnit(currentState, from, to);
      setGameState(newState);

      const winner = checkVictoryConditions(newState);
      if (winner) {
        toast.success(`${winner} wins!`);
      }
    }

    setAiThinking(false);
  };

  return (
    <div className="game-container">
      {/* Difficulty Selector */}
      <div className="controls">
        <label>AI Difficulty:</label>
        <select
          value={aiDifficulty}
          onChange={(e) => setAiDifficulty(e.target.value)}
        >
          <option value={AI_DIFFICULTY.NOOB}>Noob</option>
          <option value={AI_DIFFICULTY.NORMAL}>Normal</option>
          <option value={AI_DIFFICULTY.SILKROAD_MASTER}>Master</option>
        </select>
      </div>

      {/* Game Board */}
      <div className="board">
        {gameState.board.map((row, rowIndex) =>
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={getCellClassName(rowIndex, colIndex)}
              onClick={() => handleCellClick(rowIndex, colIndex)}
            >
              {cell}
            </div>
          ))
        )}
      </div>

      {/* AI Status */}
      {aiThinking && (
        <div className="ai-status">
          AI is thinking...
        </div>
      )}
    </div>
  );
}
```

## Testing Your Integration

### Test 1: Player Control Validation
```typescript
// Try clicking enemy units - should show error
// Try clicking own units - should select them
```

### Test 2: AI Difficulty
```typescript
// Noob AI - Should make random moves
// Normal AI - Should attack gold carriers
// Master AI - Should use combos and flanking
```

### Test 3: Pathfinding
```typescript
// Select a unit
// Click far away destination
// Unit should find path around obstacles
```

## Optional Enhancements

### Add Auto-Pathfinding Button
```typescript
const handleAutoPath = () => {
  if (!selectedUnit) return;

  const unit = findUnitAtPosition(gameState, selectedUnit);
  if (!unit || !unit.hasGold) return;

  // Find path to delivery zone
  const deliveryZone = { row: 7, col: 2 };
  const path = findPath(gameState, selectedUnit, deliveryZone, true);

  // Show path
  setHighlightedPath(path);
};

<button onClick={handleAutoPath}>
  Auto-Path to Delivery
</button>
```

### Add AI Debug Mode
```typescript
const [debugMode, setDebugMode] = useState(false);

const handleAiTurn = async (currentState: GameState) => {
  if (debugMode) {
    console.group('AI Decision');
    console.log('Difficulty:', aiDifficulty);
    console.log('Current State:', currentState);
  }

  const aiMove = makeSmartAiMove(currentState, aiDifficulty);

  if (debugMode) {
    console.log('AI Move:', aiMove);
    console.groupEnd();
  }

  // ... rest of code
};
```

### Add Move Preview
```typescript
const [movePreview, setMovePreview] = useState<Position | null>(null);

const handleCellHover = (row: number, col: number) => {
  if (!selectedUnit) return;

  const validation = isValidPlayerMove(gameState, selectedUnit, { row, col });

  if (validation.valid) {
    setMovePreview({ row, col });
  } else {
    setMovePreview(null);
  }
};

// In cell rendering
<div
  onMouseEnter={() => handleCellHover(row, col)}
  className={movePreview?.row === row && movePreview?.col === col
    ? 'preview-highlight'
    : ''
  }
>
```

## Troubleshooting

### Issue: "Cannot read property 'row' of undefined"
**Fix:** Ensure Position objects always have row and col properties
```typescript
const position: Position = { row: 0, col: 0 }; // Not { x: 0, y: 0 }
```

### Issue: AI takes too long to move
**Fix:** Add timeout to AI decision
```typescript
const aiMove = await Promise.race([
  makeSmartAiMove(currentState, aiDifficulty),
  new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))
]).catch(() => makeNoobAiMove(currentState)); // Fallback
```

### Issue: Player can still click during AI turn
**Fix:** Disable clicks during AI turn
```typescript
const handleCellClick = (row: number, col: number) => {
  if (aiThinking) return; // Add this check
  // ... rest of code
};
```

## Performance Tips

### Tip 1: Debounce Pathfinding
```typescript
import { useMemo } from 'react';

const validMoves = useMemo(() => {
  if (!selectedUnit) return [];
  return getValidMoves(gameState, selectedUnit);
}, [selectedUnit, gameState]);
```

### Tip 2: Cache AI Results
```typescript
const aiCache = new Map<string, Position[] | null>();

const getCachedAiMove = (gameState: GameState, difficulty: string) => {
  const key = JSON.stringify({ gameState, difficulty });

  if (aiCache.has(key)) {
    return aiCache.get(key);
  }

  const move = makeSmartAiMove(gameState, difficulty);
  aiCache.set(key, move);

  return move;
};
```

### Tip 3: Optimize Re-renders
```typescript
import { memo } from 'react';

const GameCell = memo(({ cell, onClick, canControl }) => {
  return (
    <div onClick={onClick} className={canControl ? 'controllable' : ''}>
      {cell}
    </div>
  );
});
```

## Next Steps

1. ✅ Import new game logic
2. ✅ Update click handlers
3. ✅ Test player control validation
4. ✅ Test AI at different difficulties
5. ✅ Add visual feedback
6. ⬜ Play test and balance
7. ⬜ Add more features (see IMPLEMENTATION_SUMMARY.md)

## Documentation Reference

- **Full Documentation:** `/silkroad_fights/lib/newGameLogic.README.md`
- **Quick Reference:** `/silkroad_fights/lib/QUICK_REFERENCE.md`
- **Architecture:** `/ARCHITECTURE_DIAGRAM.md`
- **Summary:** `/IMPLEMENTATION_SUMMARY.md`

## Support

If you encounter issues:
1. Check the TROUBLESHOOTING section in QUICK_REFERENCE.md
2. Enable debug mode to see AI decisions
3. Review the example scenarios in newGameLogic.README.md
4. Check type definitions in types.ts

---

**Total Integration Time:** ~5 minutes
**Complexity:** Low
**Breaking Changes:** None (additive only)
**Testing:** Optional but recommended

Good luck and have fun!
