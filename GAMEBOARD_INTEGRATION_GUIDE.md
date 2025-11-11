# 🎮 GameBoard Integration Guide

## How to Integrate AnimatedUnit into Your Existing GameBoard

This guide shows **exactly** how to add the animation system to your current `GameBoard.tsx` component.

---

## 📋 Step-by-Step Integration

### Step 1: Add Imports

At the top of `GameBoard.tsx`, add:

```typescript
// Add these imports
import { AnimatedUnit, AnimationState } from './AnimatedUnit';
import { useState } from 'react'; // If not already imported
```

### Step 2: Add Animation State Management

Inside your `GameBoard` component (or parent component), add state to track animations:

```typescript
const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedUnit,
  validMoves,
  onCellClick,
  bossMonsters
}) => {
  // Add this state to track animations for each cell
  const [unitAnimations, setUnitAnimations] = useState<
    Record<string, AnimationState>
  >({});

  // Helper function to update animation for a specific cell
  const setUnitAnimation = (
    row: number,
    col: number,
    state: AnimationState
  ) => {
    const key = `${row}-${col}`;
    setUnitAnimations(prev => ({
      ...prev,
      [key]: state
    }));
  };

  // Rest of your component...
```

### Step 3: Modify Cell Rendering

Find the `renderGamePiece` function (around line 72) and replace unit rendering with `AnimatedUnit`:

**BEFORE (Current Code):**
```typescript
if (cell.includes('TR') || cell.includes('H') || cell.includes('TH') || cell.includes('KT')) {
  let imageSrc = '';
  if (cell.includes('TR')) imageSrc = theme.images.trader;
  else if (cell.includes('H')) imageSrc = theme.images.hunter;
  else if (cell.includes('KT')) imageSrc = theme.images.kingThief;
  else if (cell.includes('TH')) imageSrc = theme.images.thief;

  if (imageSrc) {
    return (
      <img
        src={imageSrc}
        alt="Unit"
        className="w-full h-full object-contain"
      />
    );
  }
}
```

**AFTER (With Animations):**
```typescript
if (cell.includes('TR') || cell.includes('H') || cell.includes('TH') || cell.includes('KT')) {
  let imageSrc = '';
  let unitType = '';

  if (cell.includes('TR')) {
    imageSrc = theme.images.trader;
    unitType = 'TR';
  } else if (cell.includes('H')) {
    imageSrc = theme.images.hunter;
    unitType = 'H';
  } else if (cell.includes('KT')) {
    imageSrc = theme.images.kingThief;
    unitType = 'KT';
  } else if (cell.includes('TH')) {
    imageSrc = theme.images.thief;
    unitType = 'TH';
  }

  if (imageSrc) {
    const maxHp = unitType === 'H' || unitType === 'KT' || unitType === 'TH' ? 3 : 2;
    const [_, hpStr] = cell.split(/(\d+)/);
    const currentHp = parseInt(hpStr) || maxHp;

    return (
      <AnimatedUnit
        unit={{
          type: unitType,
          hp: currentHp,
          maxHp: maxHp,
          row: rowIndex,
          col: colIndex,
          abilities: [],
          buffs: [],
          debuffs: [],
        }}
        imageUrl={imageSrc}
        animationState={unitAnimations[`${rowIndex}-${colIndex}`] || 'idle'}
        isSelected={selectedUnit?.row === rowIndex && selectedUnit?.col === colIndex}
        showEffects={true}
        className="w-full h-full"
      />
    );
  }
}
```

### Step 4: Pass Animation Functions to Parent

If you need to trigger animations from outside GameBoard (e.g., during combat), add these props:

```typescript
interface GameBoardProps {
  board: string[][]
  selectedUnit: { row: number, col: number } | null
  validMoves: { row: number, col: number }[]
  onCellClick: (row: number, col: number) => void
  bossMonsters: BossMonster[]
  // Add these new props:
  unitAnimations?: Record<string, AnimationState>
  onAnimationComplete?: (row: number, col: number, state: AnimationState) => void
}
```

---

## 🎯 Triggering Animations from Game Logic

### Example: Attack Animation

When a unit attacks another unit, add this to your combat logic:

```typescript
// In your game logic file (gameLogic.ts or similar)
const handleCombat = (
  attackerPos: { row: number, col: number },
  defenderPos: { row: number, col: number },
  damage: number,
  isCritical: boolean = false
) => {
  // 1. Play attack animation on attacker
  setUnitAnimation(attackerPos.row, attackerPos.col, 'attacking-slash');

  // 2. After 150ms, show hit reaction on defender
  setTimeout(() => {
    setUnitAnimation(defenderPos.row, defenderPos.col, 'hit');

    // Update HP (this will automatically trigger damage popup)
    updateUnitHp(defenderPos, damage);
  }, 150);

  // 3. After 400ms total, check for death or return to idle
  setTimeout(() => {
    const defender = getUnitAt(defenderPos);

    if (defender.hp <= 0) {
      setUnitAnimation(defenderPos.row, defenderPos.col, 'dying');

      // Show victory on attacker after defender dies
      setTimeout(() => {
        setUnitAnimation(attackerPos.row, attackerPos.col, 'victory');
      }, 1200); // After death animation
    } else {
      setUnitAnimation(defenderPos.row, defenderPos.col, 'idle');
    }

    setUnitAnimation(attackerPos.row, attackerPos.col, 'idle');
  }, 400);
};
```

### Example: Movement Animation

When a unit moves:

```typescript
const handleMove = (
  fromPos: { row: number, col: number },
  toPos: { row: number, col: number }
) => {
  const distance = Math.abs(toPos.row - fromPos.row) + Math.abs(toPos.col - fromPos.col);
  const animState = distance > 2 ? 'running' : 'walking';

  // Play movement animation
  setUnitAnimation(fromPos.row, fromPos.col, animState);

  // Calculate movement duration
  const duration = distance * 0.3 * 1000; // 300ms per tile

  // After movement completes, return to idle
  setTimeout(() => {
    setUnitAnimation(toPos.row, toPos.col, 'idle');
  }, duration);
};
```

### Example: Silk Collection

When collecting silk:

```typescript
const handleSilkCollection = (
  unitPos: { row: number, col: number }
) => {
  // Play victory animation
  setUnitAnimation(unitPos.row, unitPos.col, 'victory');

  // Also show collection sparkle (handled by AnimatedUnit internally)
  // Just need to set the unit state

  // Return to idle after celebration
  setTimeout(() => {
    setUnitAnimation(unitPos.row, unitPos.col, 'idle');
  }, 2400); // Victory plays 3 times (0.8s × 3)
};
```

---

## 🎮 Complete Integration Example

Here's a complete example showing how your modified GameBoard might look:

```typescript
import React, { useState, memo } from 'react';
import { theme } from '../lib/theme';
import { HealthBar } from './HealthBar';
import { motion } from 'framer-motion';
import { BossMonster } from '../lib/types';
import { AnimatedUnit, AnimationState } from './AnimatedUnit';

interface GameBoardProps {
  board: string[][];
  selectedUnit: { row: number, col: number } | null;
  validMoves: { row: number, col: number }[];
  onCellClick: (row: number, col: number) => void;
  bossMonsters: BossMonster[];
}

const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedUnit,
  validMoves,
  onCellClick,
  bossMonsters
}) => {
  // Animation state management
  const [unitAnimations, setUnitAnimations] = useState<
    Record<string, AnimationState>
  >({});

  const setUnitAnimation = (
    row: number,
    col: number,
    state: AnimationState
  ) => {
    const key = `${row}-${col}`;
    setUnitAnimations(prev => ({
      ...prev,
      [key]: state
    }));
  };

  return (
    <div className="grid grid-cols-8 gap-0.5 p-1 rounded-lg aspect-square"
         style={{ background: 'rgba(26, 15, 15, 0.6)' }}>
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => {
          const isValidMove = validMoves.some(
            move => move.row === rowIndex && move.col === colIndex
          );
          const boss = bossMonsters.find(
            b => b.position.row === rowIndex && b.position.col === colIndex
          );

          return (
            <GameCell
              key={`${rowIndex}-${colIndex}`}
              cell={cell}
              rowIndex={rowIndex}
              colIndex={colIndex}
              isValidMove={isValidMove}
              boss={boss}
              selectedUnit={selectedUnit}
              animationState={unitAnimations[`${rowIndex}-${colIndex}`]}
              onClick={() => onCellClick(rowIndex, colIndex)}
            />
          );
        })
      )}
    </div>
  );
};

// Memoized cell component
const GameCell = memo(({
  cell,
  rowIndex,
  colIndex,
  isValidMove,
  boss,
  selectedUnit,
  animationState,
  onClick
}: {
  cell: string;
  rowIndex: number;
  colIndex: number;
  isValidMove: boolean;
  boss: BossMonster | undefined;
  selectedUnit: { row: number, col: number } | null;
  animationState?: AnimationState;
  onClick: () => void;
}) => {
  const maxHp = cell.includes('H') || cell.includes('KT') || cell.includes('TH') ? 3 : 2;
  const [unitType, currentHp] = cell.split(/(\d+)/);
  const displayHp = parseInt(currentHp) || maxHp;

  return (
    <motion.div
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
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {renderGamePiece(
          cell,
          boss,
          rowIndex,
          colIndex,
          selectedUnit,
          animationState
        )}
      </div>

      {/* Health bar for units */}
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
  );
});

function getCellBackground(cell: string, boss: BossMonster | undefined): string {
  if (boss) return 'rgba(255, 165, 0, 0.3)';
  if (cell.includes('Z')) return 'rgba(255, 215, 0, 0.3)';
  return 'rgba(26, 15, 15, 0.4)';
}

function renderGamePiece(
  cell: string,
  boss: BossMonster | undefined,
  rowIndex: number,
  colIndex: number,
  selectedUnit: { row: number, col: number } | null,
  animationState?: AnimationState
) {
  // Render boss
  if (boss) {
    const bossImageSrc = boss.type === 'TigerGiry' ? theme.images.tigergiry :
                        boss.type === 'SkeletoKing' ? theme.images.skeletoking :
                        theme.images.murucha;
    return (
      <AnimatedUnit
        unit={{
          type: boss.type,
          hp: boss.hp,
          maxHp: boss.maxHp,
          row: rowIndex,
          col: colIndex,
          abilities: [],
          buffs: [],
          debuffs: [],
        }}
        imageUrl={bossImageSrc}
        animationState={animationState || 'idle'}
        showEffects={true}
        className="w-full h-full"
      />
    );
  }

  // Render player units with animation
  if (cell.includes('TR') || cell.includes('H') || cell.includes('TH') || cell.includes('KT')) {
    let imageSrc = '';
    let unitType = '';

    if (cell.includes('TR')) {
      imageSrc = theme.images.trader;
      unitType = 'TR';
    } else if (cell.includes('H')) {
      imageSrc = theme.images.hunter;
      unitType = 'H';
    } else if (cell.includes('KT')) {
      imageSrc = theme.images.kingThief;
      unitType = 'KT';
    } else if (cell.includes('TH')) {
      imageSrc = theme.images.thief;
      unitType = 'TH';
    }

    if (imageSrc) {
      const maxHp = unitType === 'H' || unitType === 'KT' || unitType === 'TH' ? 3 : 2;
      const [_, hpStr] = cell.split(/(\d+)/);
      const currentHp = parseInt(hpStr) || maxHp;

      return (
        <AnimatedUnit
          unit={{
            type: unitType,
            hp: currentHp,
            maxHp: maxHp,
            row: rowIndex,
            col: colIndex,
            abilities: [],
            buffs: [],
            debuffs: [],
          }}
          imageUrl={imageSrc}
          animationState={animationState || 'idle'}
          isSelected={selectedUnit?.row === rowIndex && selectedUnit?.col === colIndex}
          showEffects={true}
          className="w-full h-full"
        />
      );
    }
  }

  // Render static game pieces (silk, traps, gold)
  const commonImageClasses = "w-full h-full object-contain p-1.5";

  if (cell.includes('SI')) {
    return <img src={theme.images.silk} alt="Silk" className={commonImageClasses} />;
  }

  if (cell.includes('X')) {
    return <img src={theme.images.trap} alt="Trap" className={`${commonImageClasses} opacity-75`} />;
  }

  if (cell.includes('Z')) {
    return <img src={theme.images.gold} alt="Goal" className={commonImageClasses} />;
  }

  return null;
}

export default GameBoard;
```

---

## 🎯 Testing Your Integration

### 1. Basic Test - Idle Animation
Units should breathe (subtle bob) when idle.

### 2. Selection Test
Click a unit - it should show a glowing highlight.

### 3. Combat Test
Trigger a combat:
- Attacker should play slash animation
- Defender should shake and flash red
- Damage number should float up
- Both return to idle

### 4. Movement Test
Move a unit:
- Should play walk (short) or run (long) animation
- Dust trail optional

### 5. Death Test
Reduce unit HP to 0:
- Should play death animation
- Should fade out and rotate

---

## 🐛 Troubleshooting

### Units Not Animating
**Problem:** Units stay static
**Solution:** Check that `animationState` is being passed and is changing

```typescript
// Add debug logging
console.log('Animation state:', unitAnimations[`${row}-${col}`]);
```

### Performance Issues
**Problem:** Game lags with animations
**Solution:** Reduce particle effects on mobile

```typescript
import { shouldUseReducedMotion } from './lib/animations';

const showEffects = !shouldUseReducedMotion();
```

### Z-Index Issues
**Problem:** Damage numbers hidden behind other elements
**Solution:** Ensure proper z-index

```tsx
<AnimatedUnit className="relative z-10" />
```

---

## 📚 Additional Resources

- Full API: `ANIMATION_SYSTEM.md`
- Quick Reference: `ANIMATION_QUICK_REFERENCE.md`
- Examples: `components/AnimatedUnitExample.tsx`
- Hook Usage: `hooks/useUnitAnimation.ts`

---

## ✅ Integration Checklist

- [ ] Import AnimatedUnit and AnimationState
- [ ] Add unitAnimations state to GameBoard
- [ ] Create setUnitAnimation helper function
- [ ] Replace static images with AnimatedUnit
- [ ] Pass animationState prop
- [ ] Test idle animation works
- [ ] Implement attack animation in combat logic
- [ ] Implement movement animation
- [ ] Test damage popups appear
- [ ] Test death animation
- [ ] Test victory animation
- [ ] Optimize for mobile if needed

---

**🎉 That's it! Your game now has awesome animations!**

Players will love the smooth, responsive combat system!
