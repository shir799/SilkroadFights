# TFT-Style UI Integration Guide

## Overview

This guide covers the complete TFT-style interface system created for Silkroad Fights. All components follow professional game UI standards with 60 FPS animations, Silkroad aesthetics, and responsive design.

## Components Created

### 1. Core Layout Components

#### `/components/TFTGameScreen.tsx` - Main Game Screen
The primary container that orchestrates all TFT UI elements.

**Features:**
- Complete TFT layout structure
- Phase management (Planning, Combat, Boss)
- Responsive grid system
- Mock data for demonstration

**Usage:**
```tsx
import TFTGameScreen from '@/components/TFTGameScreen'

export default function Page() {
  return <TFTGameScreen />
}
```

---

### 2. HUD Components

#### `/components/TFTTopHUD.tsx` - Status Bar
Top bar displaying player stats, resources, and progression.

**Props:**
```typescript
interface TFTTopHUDProps {
  playerHp: number
  maxHp: number
  gold: number
  level: number
  xp: number
  xpNeeded: number
  roundNumber: number
  winStreak: number
  lossStreak: number
  timer?: number
  playerName?: string
}
```

**Features:**
- Animated HP bar with color gradients
- XP progress bar with level display
- Gold counter with count-up animation
- Win/Loss streak indicators
- Optional countdown timer
- Silkroad-themed golden accents

---

### 3. Battle Components

#### `/components/TFTBattleField.tsx` - Combat Arena
8x4 grid battlefield with unit positioning and combat visualization.

**Props:**
```typescript
interface TFTBattleFieldProps {
  units: Unit[]
  onCellClick?: (row: number, col: number) => void
  onUnitClick?: (unitId: string) => void
  selectedUnit?: string | null
  validMoves?: { row: number; col: number }[]
  combatActive?: boolean
  victoryState?: 'win' | 'loss' | null
}
```

**Features:**
- 8x4 grid with desert sand aesthetic
- Unit placement with drag-and-drop support
- HP bars on units
- Attack/death animations
- Valid move indicators
- Victory/Defeat overlays
- Enemy vs Player side divider

---

### 4. Shop & Economy Components

#### `/components/TFTShop.tsx` - Unit Shop
5-unit shop with refresh, lock, and XP purchase.

**Props:**
```typescript
interface TFTShopProps {
  units: ShopUnit[]
  gold: number
  onBuyUnit: (unitId: string) => void
  onRefresh: () => void
  onBuyXP: () => void
  refreshCost?: number
  xpCost?: number
  isLocked: boolean
  onToggleLock: () => void
  canAffordRefresh: boolean
  canAffordXP: boolean
}
```

**Features:**
- Tier-based unit cards with color coding
- Hover tooltips with trait information
- Gold cost badges
- Lock/Unlock functionality
- Refresh button (default 2g)
- Buy XP button (default 4g)
- Disabled states for insufficient gold

---

### 5. Unit Management Components

#### `/components/TFTBench.tsx` - Unit Bench
9-slot bench for storing units.

**Props:**
```typescript
interface TFTBenchProps {
  units: (BenchUnit | null)[]
  maxSlots?: number
  onUnitClick: (unitId: string, slotIndex: number) => void
  onSellUnit: (unitId: string, slotIndex: number) => void
  selectedSlot?: number | null
  draggingUnit?: string | null
}
```

**Features:**
- 9 draggable unit slots
- Tier badges and level indicators
- HP bars for each unit
- Sell button on hover
- Empty slot indicators
- Selection highlighting
- Tooltips with unit info

---

### 6. Game Information Components

#### `/components/TraitPanel.tsx` - Active Traits Display
Shows active synergies and trait bonuses.

**Props:**
```typescript
interface TraitPanelProps {
  traits: Trait[]
  compact?: boolean
}
```

**Features:**
- Grid layout for traits
- Active/Inactive state indicators
- Progress bars for each threshold
- Detailed tooltips with bonuses
- Color-coded by activation
- Compact mode for sidebars

#### `/components/PhaseIndicator.tsx` - Game Phase Display
Large centered indicator for phase transitions.

**Props:**
```typescript
interface PhaseIndicatorProps {
  phase: GamePhase // 'planning' | 'combat' | 'boss' | 'victory' | 'defeat'
  timeRemaining?: number
  onPhaseEnd?: () => void
  showTransition?: boolean
}
```

**Features:**
- Full-screen transition animations
- Persistent top-bar indicator
- Countdown timer
- Color-coded by phase
- Icon animations
- Auto-trigger phase end

#### `/components/EnemyPreview.tsx` - Opponent Information
Preview panel showing enemy stats and board.

**Props:**
```typescript
interface EnemyPreviewProps {
  enemyName: string
  enemyHp: number
  maxHp: number
  enemyLevel: number
  winStreak: number
  lossStreak: number
  units: EnemyUnit[]
  boardPower: number
  onViewBoard?: () => void
  compact?: boolean
}
```

**Features:**
- Enemy HP bar
- Board power display
- Unit preview grid
- Win/Loss streaks
- View board button
- Compact mode

#### `/components/TFTItemInventory.tsx` - Item Management
10-slot item inventory with rarity system.

**Props:**
```typescript
interface TFTItemInventoryProps {
  items: Item[]
  maxSlots?: number
  onItemClick?: (itemId: string) => void
  onItemUse?: (itemId: string) => void
  selectedItem?: string | null
  compact?: boolean
}
```

**Features:**
- 10 item slots
- 4 rarity tiers (Common, Rare, Epic, Legendary)
- Detailed tooltips with stats
- Legendary shimmer effects
- Click to select, double-click to use
- Compact mode for HUD

---

## Theme & Styling

### `/lib/tftTheme.ts` - Theme Configuration
Complete Silkroad-themed color palette and design tokens.

**Structure:**
```typescript
export const tftTheme = {
  colors: {
    primary: { amber, gold, bronze, darkBrown, lightBrown },
    background: { dark, medium, light, overlay },
    player: { ally, enemy, neutral },
    tier: { 1-5 with colors and names },
    status: { health, positive, negative, warning, info },
    ui: { border, hover, selected, disabled }
  },
  gradients: {
    background: { main, panel, header },
    button: { primary, secondary, success, danger, info },
    tier: { 1-5 },
    glow: { gold, blue, red, purple }
  },
  shadows: { small, medium, large, glow, inset },
  borders: { width, radius },
  typography: { fontFamily, textShadow },
  spacing: { unit, scale },
  zIndex: { layers },
  transitions: { fast, normal, slow, easing },
  breakpoints: { mobile, tablet, laptop, desktop, wide }
}
```

**Helper Functions:**
- `getTierColor(tier: number)` - Get color for unit tier
- `getHealthColor(percentage: number)` - Get HP bar color
- `getRarityGlow(rarity: string)` - Get item rarity glow

---

### `/lib/tftAnimations.ts` - Animation Variants
Comprehensive Framer Motion animation library.

**Categories:**

1. **Entrance Animations**
   - fadeIn, slideInFromTop/Bottom/Left/Right
   - scaleIn, rotateScaleIn

2. **Hover Animations**
   - hoverScale, hoverLift, hoverGlow, hoverRotate

3. **Click Animations**
   - tapScale, tapShrink

4. **Loop Animations**
   - pulse, glow, float, rotate360, shimmer

5. **Combat Animations**
   - attackSlash, takeDamage, death, healEffect, criticalHit

6. **UI Animations**
   - numberCountUp, cardFlip, notification, modalOverlay, modalContent

7. **Progress Animations**
   - progressFill, healthBarDecrease

8. **Special Effects**
   - sparkle, explosion, ripple

**Utility Functions:**
```typescript
createStaggerAnimation(staggerDelay, childAnimation)
withDelay(animation, delay)
combineAnimations(...animations)
```

---

## Integration Steps

### Step 1: Basic Setup

Replace your existing game screen:

```tsx
// In your main page or app component
import TFTGameScreen from '@/components/TFTGameScreen'

export default function GamePage() {
  return <TFTGameScreen />
}
```

### Step 2: Connect to Game State

Update `TFTGameScreen.tsx` to use your actual game logic:

```tsx
import { useGameState } from '@/hooks/useGameState' // Your game state hook

export default function TFTGameScreen() {
  const {
    playerStats,
    shopUnits,
    benchUnits,
    fieldUnits,
    traits,
    items,
    enemyData,
    handleBuyUnit,
    handleRefresh,
    // ... other game functions
  } = useGameState()

  return (
    // ... component JSX using real data
  )
}
```

### Step 3: Customize Theme

Modify `/lib/tftTheme.ts` to match your branding:

```typescript
export const tftTheme = {
  colors: {
    primary: {
      amber: '#YOUR_COLOR',
      // ... customize colors
    }
  }
}
```

### Step 4: Add Custom Animations

Create game-specific animations:

```typescript
import { Variants } from 'framer-motion'

export const customAnimation: Variants = {
  initial: { /* ... */ },
  animate: { /* ... */ },
  exit: { /* ... */ }
}
```

---

## Responsive Design

All components support responsive breakpoints:

```typescript
// Mobile (375px+)
- Vertical stack layout
- Single column grids
- Compact components

// Tablet (768px+)
- 2-column layouts
- Reduced spacing
- Compact enemy preview

// Desktop (1280px+)
- Full 3-column layout
- All features visible
- Maximum spacing

// Wide (1920px+)
- Optimized for large screens
- Maximum detail
```

---

## Performance Optimization

### 60 FPS Guidelines

1. **Use transform/opacity for animations**
   ```tsx
   // Good
   animate={{ scale: 1.1, opacity: 0.8 }}

   // Avoid
   animate={{ width: '110%', backgroundColor: 'red' }}
   ```

2. **Lazy load heavy components**
   ```tsx
   const EnemyPreview = lazy(() => import('./EnemyPreview'))
   ```

3. **Memoize expensive calculations**
   ```tsx
   const sortedUnits = useMemo(() =>
     units.sort((a, b) => b.tier - a.tier),
     [units]
   )
   ```

4. **Use layoutId for smooth transitions**
   ```tsx
   <motion.div layoutId={unit.id}>
   ```

---

## Customization Examples

### Custom Shop Layout

```tsx
// 3-unit shop instead of 5
<TFTShop
  units={shopUnits.slice(0, 3)}
  // ... other props
/>
```

### Custom Trait Icons

```tsx
const customTraitIcons = {
  'Blade Mastery': CustomSwordIcon,
  // ... add your icons
}
```

### Custom Phase Types

```tsx
type GamePhase = 'planning' | 'combat' | 'boss' | 'custom_phase'

// Update PhaseIndicator component to handle new phase
```

---

## Common Patterns

### Connecting to Backend

```tsx
useEffect(() => {
  const unsubscribe = gameSocket.on('state_update', (newState) => {
    setGameState(newState)
  })
  return unsubscribe
}, [])
```

### Handling Unit Drag & Drop

```tsx
const [draggedUnit, setDraggedUnit] = useState<string | null>(null)

<motion.div
  drag
  onDragStart={() => setDraggedUnit(unit.id)}
  onDragEnd={() => setDraggedUnit(null)}
/>
```

### Phase Transitions

```tsx
const handlePhaseTransition = async (newPhase: GamePhase) => {
  setIsTransitioning(true)
  await delay(2000) // Show transition
  setPhase(newPhase)
  setIsTransitioning(false)
}
```

---

## Accessibility

All components include:
- Keyboard navigation support
- ARIA labels
- Focus indicators
- Screen reader compatibility
- Color contrast compliance

---

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

---

## Troubleshooting

### Units not appearing
Check that `units` array has proper `position` props:
```typescript
{ row: 0, col: 0, id: '...', /* ... */ }
```

### Animations stuttering
Reduce simultaneous animations or use `will-change: transform`:
```css
.animated-element {
  will-change: transform, opacity;
}
```

### Theme not applying
Ensure theme is imported:
```typescript
import { tftTheme } from '@/lib/tftTheme'
```

---

## Next Steps

1. **Replace mock data** with real game state
2. **Implement game logic** for all handlers
3. **Add sound effects** to animations
4. **Create tutorial** using PhaseIndicator
5. **Add leaderboard** component
6. **Implement matchmaking** UI

---

## Component File Locations

```
/components/
├── TFTGameScreen.tsx       # Main layout
├── TFTTopHUD.tsx           # Top status bar
├── TFTBattleField.tsx      # Combat arena
├── TFTShop.tsx             # Unit shop
├── TFTBench.tsx            # Unit bench
├── TraitPanel.tsx          # Synergies
├── PhaseIndicator.tsx      # Game phases
├── EnemyPreview.tsx        # Opponent info
└── TFTItemInventory.tsx    # Items

/lib/
├── tftTheme.ts             # Theme config
└── tftAnimations.ts        # Animations
```

---

## Credits

Built with:
- React 18
- Next.js 14
- TypeScript 5
- Framer Motion (latest)
- TailwindCSS 3.4
- Lucide React Icons

Inspired by Teamfight Tactics and Silkroad Online aesthetics.

---

For questions or issues, refer to the component prop interfaces or check the demo in `TFTGameScreen.tsx`.
