# Visual Components - Quick Reference Card

## 🎨 Component Imports

```tsx
// Game Board
import { ImprovedGameBoard } from '@/components/ImprovedGameBoard'

// Unit Cards
import { UnitCard, UnitCardGrid, createUnitCardData } from '@/components/UnitCards'

// Visual Effects
import {
  VisualEffects,
  CombatEffect,
  CollectionEffect,
  VictoryEffect,
  DefeatEffect,
  BloodDecal,
  ImpactCrater,
  FootstepMark,
} from '@/components/VisualEffects'

// Theming
import {
  ThemeProvider,
  ThemeSelector,
  useTheme,
  ThemedContainer,
} from '@/components/ThemeCustomization'

// Animations
import {
  getUnitIdleAnimation,
  emoteAnimations,
  buttonPressAnimation,
  cardFlipAnimation,
  panelSlideAnimation,
  modalAnimation,
  tooltipAnimation,
} from '@/components/EnhancedAnimations'
```

---

## 🎮 ImprovedGameBoard Props

```tsx
<ImprovedGameBoard
  // Required
  board={string[][]}
  selectedUnit={Position | null}
  validMoves={Position[]}
  attackRange={Position[]}
  movementPath={Position[]}
  onCellClick={(row, col) => void}
  bossMonsters={BossMonster[]}
  playerUnits={Position[]}
  enemyUnits={Position[]}
  isPlayerTurn={boolean}

  // Optional - NEW FEATURES
  dangerZones={Position[]}          // Red overlay
  safeZones={Position[]}            // Green overlay
  weather={'clear' | 'sandstorm' | 'night' | 'dusk' | 'dawn'}
  timeOfDay={'day' | 'night' | 'dusk' | 'dawn'}
  showCoordinates={boolean}         // A-H, 1-8 labels
  enableTerrainEffects={boolean}    // Terrain animations
  showLastMove={boolean}            // Cyan highlight
  lastMove={Position[]}             // Last move positions
/>
```

---

## 🃏 UnitCard Props

```tsx
<UnitCard
  unit={UnitCardData}           // Created with createUnitCardData()
  size={'small' | 'medium' | 'large'}
  isFlipped={boolean}           // Control flip state
  onFlip={() => void}           // Flip callback
  showStats={boolean}           // Show stats on front
  interactive={boolean}         // Enable hover/click
  className={string}            // Additional classes
/>

// Quick create
const card = createUnitCardData(
  'TR',                         // Unit type
  theme.images.trader,          // Image URL
  { hp: 2, maxHp: 2 }          // Custom stats (optional)
)
```

---

## ✨ Visual Effects

### Basic Usage
```tsx
<VisualEffects
  effects={[
    { type: 'hit-spark', x: 100, y: 100 },
    { type: 'explosion', x: 200, y: 200, intensity: 1.5 },
  ]}
  width={800}
  height={800}
/>
```

### Effect Types
```
'sandstorm'        - Environmental particles
'gold-collect'     - Coins flying
'silk-collect'     - Shimmering sparkles
'footstep'         - Movement trails
'blood-splatter'   - Combat effect
'impact-crater'    - Heavy attack
'victory-firework' - Celebration
'defeat-ash'       - Loss effect
'hit-spark'        - Combat impact
'slash-trail'      - Directional attack
'explosion'        - Area damage
'heal-sparkle'     - Restoration
```

### Convenient Components
```tsx
// Combat
<CombatEffect type="hit" x={100} y={100} />
<CombatEffect type="slash" x={100} y={100} direction={{ x: 1, y: 0 }} />
<CombatEffect type="explosion" x={100} y={100} />

// Collection
<CollectionEffect type="gold" x={100} y={100} />
<CollectionEffect type="silk" x={100} y={100} />

// Game End
<VictoryEffect x={400} y={400} />
<DefeatEffect x={400} y={400} />

// Decals
<BloodDecal x={100} y={100} size={30} />
<ImpactCrater x={100} y={100} size={40} />
<FootstepMark x={100} y={100} rotation={45} />
```

---

## 🎨 Theming

### Setup
```tsx
// Wrap your app
<ThemeProvider defaultTheme="classic-desert">
  <App />
</ThemeProvider>
```

### Use in Components
```tsx
const { currentTheme, setTheme } = useTheme()

// Access colors
currentTheme.colors.primary
currentTheme.colors.text.primary
currentTheme.colors.health.good

// Change theme
setTheme('night-mode')
```

### Available Themes
```
'classic-desert'   - 🏜️ Traditional Silk Road
'night-mode'       - 🌙 Moonlit desert
'winter'           - ❄️ Snowy landscape
'cherry-blossom'   - 🌸 Japanese aesthetic
'ocean'            - 🌊 Deep sea
```

### Theme Selector UI
```tsx
<ThemeSelector onClose={() => console.log('closed')} />
```

---

## 🎭 Animations

### Unit Idle Animations
```tsx
<motion.div
  variants={getUnitIdleAnimation('TR')}  // 'TR', 'H', 'TH', 'KT', 'BM'
  animate="idle"
>
  <UnitSprite />
</motion.div>
```

### Emotes
```tsx
<motion.div
  variants={emoteAnimations.cheer.variants}
  initial="start"
  animate="animate"
>
  {emoteAnimations.cheer.icon}  // 🎉
</motion.div>
```

Available: `taunt`, `cheer`, `cry`, `angry`, `confused`, `determined`, `sleeping`, `love`

### UI Animations
```tsx
// Button
<motion.button
  variants={buttonPressAnimation}
  initial="idle"
  whileHover="hover"
  whileTap="tap"
>
  Click Me
</motion.button>

// Modal
<motion.div
  variants={modalAnimation}
  initial="hidden"
  animate="visible"
  exit="exit"
>
  Modal Content
</motion.div>

// Panel
<motion.div
  variants={panelSlideAnimation}
  initial="hidden"
  animate="visible"
>
  Side Panel
</motion.div>
```

---

## 🎯 Common Patterns

### Combat Hit Effect
```tsx
const handleHit = (x: number, y: number, damage: number, isCritical: boolean) => {
  setEffects([
    { type: isCritical ? 'explosion' : 'hit-spark', x, y },
    { type: 'blood-splatter', x, y },
  ])
}
```

### Gold Collection
```tsx
const handleGoldCollect = (x: number, y: number) => {
  setEffects([{ type: 'gold-collect', x, y }])
  playSound('gold-collect')
}
```

### Victory Celebration
```tsx
const playVictory = () => {
  const positions = Array.from({ length: 10 }, () => ({
    x: Math.random() * 800,
    y: Math.random() * 400,
  }))

  positions.forEach(({ x, y }, i) => {
    setTimeout(() => {
      setEffects((prev) => [...prev, { type: 'victory-firework', x, y }])
    }, i * 200)
  })
}
```

### Weather Change
```tsx
const handleRoundEnd = (roundNumber: number) => {
  if (roundNumber % 10 === 0) {
    setWeather('sandstorm')
  } else {
    setWeather('clear')
  }
}
```

### Danger Zone Display
```tsx
const dangerZones = useMemo(() => {
  const zones: Position[] = []
  enemyUnits.forEach((enemy) => {
    // Add positions in attack range
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        zones.push({ row: enemy.row + dr, col: enemy.col + dc })
      }
    }
  })
  return zones
}, [enemyUnits])
```

---

## ⚡ Performance Tips

```tsx
// 1. Limit active effects
const MAX_EFFECTS = 50
setEffects((prev) => prev.slice(-MAX_EFFECTS))

// 2. Throttle effect spawning
import { throttle } from 'lodash'
const addEffect = throttle((effect) => { ... }, 100)

// 3. Clear old effects
useEffect(() => {
  const interval = setInterval(() => {
    setEffects((prev) => prev.filter((e) =>
      Date.now() - e.timestamp < 5000
    ))
  }, 1000)
  return () => clearInterval(interval)
}, [])

// 4. Mobile detection
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const intensity = isMobile ? 0.5 : 1

// 5. Use React.memo
const GameCell = React.memo(({ ... }) => { ... })
```

---

## 🐛 Debug Helpers

```tsx
// Log active effects
useEffect(() => {
  console.log('Active effects:', effects.length)
}, [effects])

// Monitor FPS
useEffect(() => {
  let frames = 0
  const interval = setInterval(() => {
    console.log('FPS:', frames)
    frames = 0
  }, 1000)
  const animate = () => {
    frames++
    requestAnimationFrame(animate)
  }
  animate()
  return () => clearInterval(interval)
}, [])

// Theme debug
const { currentTheme } = useTheme()
console.log('Current theme:', currentTheme.name, currentTheme.colors)
```

---

## 📱 Responsive Design

```tsx
// Mobile-friendly card size
const cardSize = isMobile ? 'small' : 'medium'

// Adjust effect intensity
const intensity = isMobile ? 0.5 : 1

// Disable heavy effects on mobile
const showParticles = !isMobile

// Responsive grid
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
  {units.map((unit) => (
    <UnitCard unit={unit} size={cardSize} />
  ))}
</div>
```

---

## 🎮 Keyboard Shortcuts (Suggested)

```tsx
useEffect(() => {
  const handleKey = (e: KeyboardEvent) => {
    switch (e.key) {
      case '1': setTheme('classic-desert'); break
      case '2': setTheme('night-mode'); break
      case '3': setTheme('winter'); break
      case '4': setTheme('cherry-blossom'); break
      case '5': setTheme('ocean'); break
      case 'w': setWeather('sandstorm'); break
      case 'c': setWeather('clear'); break
      case 'n': setWeather('night'); break
    }
  }
  window.addEventListener('keydown', handleKey)
  return () => window.removeEventListener('keydown', handleKey)
}, [])
```

---

## 🎨 Color Reference

```tsx
// Theme-aware styling
const { currentTheme } = useTheme()

<div style={{
  color: currentTheme.colors.text.primary,
  background: currentTheme.colors.primary,
  borderColor: currentTheme.colors.accent,
}}>
  Content
</div>

// Health colors
const healthColor = hp > maxHp * 0.6
  ? currentTheme.colors.health.good
  : hp > maxHp * 0.3
  ? currentTheme.colors.health.medium
  : currentTheme.colors.health.low

// Team colors
const teamColor = isPlayer
  ? currentTheme.colors.teams.player
  : currentTheme.colors.teams.enemy
```

---

## 📊 Type Reference

```tsx
// Position
type Position = { row: number; col: number }

// Weather
type WeatherType = 'clear' | 'sandstorm' | 'night' | 'dusk' | 'dawn'

// Theme
type ThemeName = 'classic-desert' | 'night-mode' | 'winter' | 'cherry-blossom' | 'ocean'

// Effect
type EffectType = 'sandstorm' | 'gold-collect' | 'silk-collect' | ...

// Rarity
type UnitRarity = 'Common' | 'Rare' | 'Epic' | 'Legendary'
```

---

## 🔗 File Paths

```
Components:
/components/ImprovedGameBoard.tsx
/components/UnitCards.tsx
/components/VisualEffects.tsx
/components/ThemeCustomization.tsx
/components/EnhancedAnimations.ts

Documentation:
/VISUAL_UPGRADE_SUMMARY.md
/VISUAL_INTEGRATION_GUIDE.md
/VISUAL_QUICK_REFERENCE.md (this file)
```

---

**Print this out and keep it handy! 📋**

*Visual Agent - Quick Reference v1.0*
