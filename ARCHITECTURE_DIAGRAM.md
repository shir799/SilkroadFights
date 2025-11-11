# Silkroad Fights - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         GAME ENGINE                              │
│                    (React + TypeScript)                          │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ├─────────────────┬─────────────────┐
                              ▼                 ▼                 ▼
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  Player Input    │  │   AI System      │  │  Game State      │
│                  │  │                  │  │                  │
│ • Click Handler  │  │ • Noob AI        │  │ • Board          │
│ • Validation     │  │ • Normal AI      │  │ • Units          │
│ • Move Request   │  │ • Master AI      │  │ • Silk/Gold      │
└──────────────────┘  └──────────────────┘  └──────────────────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
                               ▼
         ┌────────────────────────────────────────┐
         │        NEW GAME LOGIC LAYER             │
         │       (newGameLogic.ts)                 │
         └────────────────────────────────────────┘
                               │
         ├─────────────┬────────┴────────┬─────────────┐
         ▼             ▼                 ▼             ▼
┌────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│Pathfinding │ │Player Control│ │Unit Behaviors│ │AI Decision   │
│            │ │              │ │              │ │              │
│ • A* Algo  │ │• Validation  │ │• Trader      │ │• Combo Attack│
│ • Obstacles│ │• Ownership   │ │• Hunter      │ │• Flanking    │
│ • Replanning│ │• Move Check │ │• Thief       │ │• Timing      │
└────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

## Data Flow

### Player Move Flow
```
Player clicks cell
       │
       ▼
┌──────────────────────┐
│ canPlayerControlUnit │  ◄──── Ownership check
└──────────────────────┘
       │
       ▼ (Valid)
┌──────────────────────┐
│ isValidPlayerMove    │  ◄──── Move validation
└──────────────────────┘
       │
       ▼ (Valid)
┌──────────────────────┐
│ findPath             │  ◄──── Calculate path
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ moveUnit             │  ◄──── Execute move
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Update Game State    │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ Trigger AI Turn      │
└──────────────────────┘
```

### AI Turn Flow
```
AI Turn Triggered
       │
       ▼
┌──────────────────────┐
│ evaluateGameState    │  ◄──── Analyze situation
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ makeSmartAiMove      │  ◄──── Choose difficulty
│  ├─ Noob             │
│  ├─ Normal           │
│  └─ Silkroad Master  │
└──────────────────────┘
       │
       ├────────── Noob: Random move
       │
       ├────────── Normal:
       │             ├─ Attack gold carriers
       │             ├─ Collect silk
       │             └─ Basic tactics
       │
       └────────── Master:
                     ├─ Combo attacks
                     ├─ Flanking
                     ├─ Perfect timing
                     ├─ Positional play
                     └─ Area control
       │
       ▼
┌──────────────────────┐
│ executeUnitBehavior  │  ◄──── Role-based logic
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ findPath             │  ◄──── Calculate path
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ moveUnit             │  ◄──── Execute move
└──────────────────────┘
```

## Pathfinding Algorithm

```
START POSITION (S)
       │
       ▼
┌──────────────────────┐
│ Initialize Open List │
│ openList = [S]       │
└──────────────────────┘
       │
       ▼
┌──────────────────────┐
│ While openList has   │
│ nodes:               │
│                      │
│ 1. Get lowest fCost  │
│ 2. Check if goal     │
│ 3. Add to closed     │
│ 4. Check neighbors   │
│ 5. Calculate costs   │
│ 6. Update open list  │
└──────────────────────┘
       │
       ├────── Goal found? ───┐
       │                      │
       ▼ (Yes)                ▼ (No)
┌──────────────────┐  ┌──────────────────┐
│Reconstruct Path  │  │Return empty path │
│S → N1 → N2 → G   │  │(No path exists)  │
└──────────────────┘  └──────────────────┘
```

### Cost Calculation
```
fCost = gCost + hCost

gCost: Actual distance from start
       ├─ Start to N1: 1
       ├─ Start to N2: 2
       └─ Start to Goal: ?

hCost: Manhattan distance to goal
       └─ |x1 - x2| + |y1 - y2|

Example:
  Current: (3, 3)
  Goal: (7, 5)
  hCost = |3-7| + |3-5| = 4 + 2 = 6
```

## AI Decision Tree (Silkroad Master)

```
                    ┌─────────────────┐
                    │   START TURN    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Evaluate State  │
                    │  • Units        │
                    │  • HP           │
                    │  • Gold         │
                    │  • Position     │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         [Score > 20]   [Score -20~20]  [Score < -20]
         Winning         Even Match       Losing
              │              │              │
              ▼              ▼              ▼
         Aggressive     Balanced        Defensive
         Tactics        Tactics         Tactics
              │              │              │
              └──────────────┼──────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Check Tactics   │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐      ┌──────────┐       ┌──────────┐
    │ Combo?  │      │ Flank?   │       │Critical? │
    │ 2+ units│      │Position  │       │Gold near │
    │ nearby  │      │behind    │       │delivery  │
    └────┬────┘      └────┬─────┘       └────┬─────┘
         │                │                   │
    ┌────▼────┐      ┌────▼────┐        ┌────▼────┐
    │ YES     │      │ YES     │        │ YES     │
    │ Execute │      │ Execute │        │ Execute │
    │ Combo   │      │ Flank   │        │Intercept│
    └─────────┘      └─────────┘        └─────────┘
         │                │                   │
         └────────────────┼───────────────────┘
                          │
                          ▼
                 ┌─────────────────┐
                 │  Move Selected  │
                 │  Execute Action │
                 └─────────────────┘
```

## Unit Behavior Hierarchy

```
                    ┌─────────────────┐
                    │   UNIT TYPE?    │
                    └────────┬────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
    ┌─────────┐         ┌─────────┐        ┌─────────┐
    │ TRADER  │         │ HUNTER  │        │  THIEF  │
    └────┬────┘         └────┬────┘        └────┬────┘
         │                   │                   │
    ┌────▼────────────┐ ┌────▼────────────┐ ┌────▼────────────┐
    │ Has Gold?       │ │ Gold carrier    │ │ Can steal gold? │
    │ ├─Yes→ Deliver  │ │ nearby?         │ │ ├─Yes→ Attack   │
    │ └─No → Pick up  │ │ ├─Yes→ Guard    │ │ └─No → Flank    │
    │                 │ │ └─No → Hunt     │ │                 │
    │ Threatened?     │ │                 │ │ Low HP?         │
    │ └─Yes→ Regroup  │ │ Enemy nearby?   │ │ └─Yes→ Retreat  │
    │                 │ │ └─Yes→ Attack   │ │                 │
    │ Silk nearby?    │ │                 │ │ Silk nearby?    │
    │ └─Yes→ Collect  │ │ Patrol          │ │ └─Yes→ Collect  │
    └─────────────────┘ └─────────────────┘ └─────────────────┘
```

## Player Control Validation

```
Player clicks unit
       │
       ▼
┌──────────────────────────┐
│ Is this player's turn?   │
└──────────┬───────────────┘
           │
      ┌────┴────┐
      │         │
     Yes       No ──► Show error: "Not your turn"
      │
      ▼
┌──────────────────────────┐
│ Check unit ownership:    │
│                          │
│ If Trader player:        │
│   Can control TR and H   │
│                          │
│ If Thief player:         │
│   Can control TH and KT  │
└──────────┬───────────────┘
           │
      ┌────┴────┐
      │         │
   Valid    Invalid ──► Show error: "Cannot control this unit"
      │
      ▼
┌──────────────────────────┐
│ Visual Feedback:         │
│ • Green border           │
│ • Pointer cursor         │
│ • Hover effect           │
│ • Show valid moves       │
└──────────────────────────┘
```

## Game Loop

```
┌────────────────────────────────────────────────────────────┐
│                      GAME LOOP                              │
└────────────────────────────────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ Initialize Game │
                    │ • Spawn units   │
                    │ • Place gold    │
                    │ • Spawn silk    │
                    └────────┬────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │  PLAYER TURN (Trader) │
                 └───────────┬───────────┘
                             │
                        ┌────▼────┐
                        │ Select  │
                        │  Unit   │
                        └────┬────┘
                             │
                        ┌────▼────┐
                        │  Move   │
                        │  Unit   │
                        └────┬────┘
                             │
                        ┌────▼────┐
                        │ Combat? │
                        │ ├─Yes   │
                        │ └─No    │
                        └────┬────┘
                             │
                        ┌────▼────┐
                        │ Collect │
                        │Resources│
                        └────┬────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │   AI TURN (Thief)     │
                 └───────────┬───────────┘
                             │
                        ┌────▼────────┐
                        │ Evaluate    │
                        │ Game State  │
                        └────┬────────┘
                             │
                        ┌────▼────────┐
                        │ Choose Best │
                        │    Move     │
                        └────┬────────┘
                             │
                        ┌────▼────────┐
                        │  Execute    │
                        │   Move      │
                        └────┬────────┘
                             │
                             ▼
                 ┌───────────────────────┐
                 │  Update Game State    │
                 │  • Check victory      │
                 │  • Spawn silk (3 rnd) │
                 │  • Spawn boss (10 rnd)│
                 │  • Update buffs       │
                 └───────────┬───────────┘
                             │
                        ┌────▼────────┐
                        │  Victory?   │
                        └────┬────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
                  Yes                 No
                   │                   │
                   ▼                   │
            ┌──────────────┐           │
            │ Show Winner  │           │
            │ Game Over    │           │
            └──────────────┘           │
                                       │
                                       └──► Loop back to Player Turn
```

## Combo Attack Visualization

```
BEFORE COMBO:
    1   2   3   4   5
  ┌───┬───┬───┬───┬───┐
1 │   │   │   │   │   │
  ├───┼───┼───┼───┼───┤
2 │   │TH1│   │   │   │  TH1 (Thief 1)
  ├───┼───┼───┼───┼───┤  TH2 (Thief 2)
3 │   │   │ H │   │   │  H (Hunter - Target)
  ├───┼───┼───┼───┼───┤  KT (King Thief)
4 │   │   │   │TH2│   │
  ├───┼───┼───┼───┼───┤
5 │   │ KT│   │   │   │
  └───┴───┴───┴───┴───┘

AI ANALYSIS:
- Hunter at (3,3)
- TH1 at (2,2) - Distance 2
- TH2 at (4,4) - Distance 2
- Both can reach Hunter in 1 move
- COMBO OPPORTUNITY DETECTED!

AFTER COMBO:
    1   2   3   4   5
  ┌───┬───┬───┬───┬───┐
1 │   │   │   │   │   │
  ├───┼───┼───┼───┼───┤
2 │   │   │TH1│   │   │  TH1 moves (2,2)→(2,3)
  ├───┼───┼───┼───┼───┤  Adjacent to Hunter!
3 │   │   │ H │TH2│   │  TH2 moves (4,4)→(3,4)
  ├───┼───┼───┼───┼───┤  Adjacent to Hunter!
4 │   │   │   │   │   │
  ├───┼───┼───┼───┼───┤  Result: Hunter surrounded
5 │   │ KT│   │   │   │  +2 attack bonus from combo!
  └───┴───┴───┴───┴───┘
```

## Flanking Maneuver

```
BEFORE FLANK:
    ┌─────────┐
    │   TR    │  ← Trader (facing down)
    └─────────┘
         │
         ▼ (facing direction)

    [Empty space]

    ┌─────────┐
    │   TH    │  ← Thief (far away)
    └─────────┘

FLANKING POSITION:
         ↑ (weak side)
    ┌─────────┐
    │   TR    │  ← Trader
    └─────────┘
         │
         ▼ (facing direction)

AI MOVE: Thief moves to position above Trader

AFTER FLANK:
    ┌─────────┐
    │   TH    │  ← Thief (flanking!)
    └─────────┘
         │
         ▼ (attack from behind)
    ┌─────────┐
    │   TR    │  ← Trader (vulnerable)
    └─────────┘

ADVANTAGE:
- Attack from unexpected angle
- Trader cannot effectively defend
- +1 attack bonus
- Higher chance to steal gold
```

## File Structure

```
SilkroadFights/
│
├── silkroad_fights/
│   └── lib/
│       ├── types.ts                 (Existing types)
│       ├── gameLogic.ts             (Existing logic)
│       ├── newGameLogic.ts          ★ NEW (42KB, 1534 lines)
│       ├── newGameLogic.README.md   ★ NEW (15KB)
│       └── QUICK_REFERENCE.md       ★ NEW (17KB)
│
└── IMPLEMENTATION_SUMMARY.md        ★ NEW (16KB)
```

## Integration Points

```
┌──────────────────────────────────────────────────────────┐
│               EXISTING GAME CODE                          │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  GameScreen.tsx                                          │
│  ├── handleCellClick()  ──┐                             │
│  ├── handleAiTurn()    ────┼──► Integration Points      │
│  └── renderBoard()     ────┘                            │
│                                                           │
└──────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────┐
│               NEW GAME LOGIC LAYER                        │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  newGameLogic.ts                                         │
│  ├── canPlayerControlUnit()  ◄─── Player validation     │
│  ├── isValidPlayerMove()     ◄─── Move validation       │
│  ├── makeSmartAiMove()       ◄─── AI turn               │
│  └── findPath()              ◄─── Pathfinding           │
│                                                           │
└──────────────────────────────────────────────────────────┘
```

## Summary

This architecture provides:

✅ **Clear separation of concerns**
   - Player logic separate from AI logic
   - Validation layer prevents cheating
   - Pathfinding independent of game state

✅ **Scalable AI system**
   - Easy to add new difficulty levels
   - Modular behavior system
   - Unit-specific tactics

✅ **Maintainable code**
   - Well-documented
   - Type-safe
   - Testable

✅ **Performance optimized**
   - Efficient pathfinding
   - Fast AI decisions
   - Minimal memory footprint

---

**Total Implementation:**
- 4 files created
- 90KB total documentation
- 1,534 lines of code
- 50+ functions
- 3 AI difficulty levels
- Complete integration guide
