# Visual Components Integration Guide

## 🚀 Quick Start

This guide will help you integrate the new visual components into your Silkroad Fights game.

---

## Step 1: Wrap Your App with ThemeProvider

First, wrap your entire application with the ThemeProvider to enable theming:

```tsx
// app/layout.tsx or your root component
import { ThemeProvider } from '@/components/ThemeCustomization'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider defaultTheme="classic-desert" defaultColorblindMode="none">
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

---

## Step 2: Replace GameBoard with ImprovedGameBoard

Update your game screen to use the enhanced game board:

```tsx
// Before
import GameBoard from '@/components/GameBoard'

// After
import { ImprovedGameBoard } from '@/components/ImprovedGameBoard'

// In your component
<ImprovedGameBoard
  board={gameState.board}
  selectedUnit={selectedUnit}
  validMoves={validMoves}
  attackRange={attackRange}
  movementPath={movementPath}
  dangerZones={dangerZones}        // NEW: Add danger zones
  safeZones={safeZones}            // NEW: Add safe zones
  onCellClick={handleCellClick}
  bossMonsters={bossMonsters}
  playerUnits={playerUnits}
  enemyUnits={enemyUnits}
  isPlayerTurn={isPlayerTurn}
  weather="clear"                  // NEW: Add weather
  timeOfDay="day"                  // NEW: Add time of day
  showCoordinates={true}           // NEW: Show A-H, 1-8 labels
  showLastMove={true}              // NEW: Highlight last move
  lastMove={lastMove}              // NEW: Pass last move data
/>
```

---

## Step 3: Add Visual Effects Layer

Add the visual effects system on top of your game board:

```tsx
import { VisualEffects } from '@/components/VisualEffects'
import { useState } from 'react'

function GameScreen() {
  const [effects, setEffects] = useState<EffectConfig[]>([])

  // Add effect when something happens
  const handleCombatHit = (x: number, y: number, isCritical: boolean) => {
    setEffects([
      ...effects,
      {
        type: isCritical ? 'explosion' : 'hit-spark',
        x,
        y,
        intensity: isCritical ? 1.5 : 1,
      },
    ])

    // Clear effects after duration
    setTimeout(() => {
      setEffects([])
    }, 2000)
  }

  const handleGoldCollect = (x: number, y: number) => {
    setEffects([...effects, { type: 'gold-collect', x, y }])
  }

  return (
    <div className="relative">
      <ImprovedGameBoard {...props} />

      {/* Visual effects overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <VisualEffects effects={effects} width={800} height={800} />
      </div>
    </div>
  )
}
```

---

## Step 4: Add Theme Selector to UI

Add the theme selector button to your game UI:

```tsx
import { ThemeSelector, useTheme } from '@/components/ThemeCustomization'

function GameHeader() {
  const { currentTheme } = useTheme()

  return (
    <header
      className="flex justify-between items-center p-4"
      style={{ background: currentTheme.colors.primary }}
    >
      <h1 style={{ color: currentTheme.colors.text.primary }}>
        Silkroad Fights
      </h1>

      {/* Theme selector button */}
      <ThemeSelector />
    </header>
  )
}
```

---

## Step 5: Create Unit Card Display

Add unit cards for unit selection or information display:

```tsx
import { UnitCard, createUnitCardData } from '@/components/UnitCards'
import { theme } from '@/lib/theme'

function UnitSelection() {
  const units = [
    createUnitCardData('TR', theme.images.trader, { hp: 2, maxHp: 2 }),
    createUnitCardData('H', theme.images.hunter, { hp: 3, maxHp: 3 }),
    createUnitCardData('TH', theme.images.thief, { hp: 3, maxHp: 3 }),
    createUnitCardData('KT', theme.images.kingThief, { hp: 3, maxHp: 3 }),
  ]

  return (
    <div className="grid grid-cols-4 gap-4 p-4">
      {units.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          size="small"
          interactive={true}
        />
      ))}
    </div>
  )
}
```

---

## Step 6: Use Enhanced Animations

Replace basic animations with enhanced variants:

```tsx
import {
  getUnitIdleAnimation,
  emoteAnimations,
  buttonPressAnimation,
} from '@/components/EnhancedAnimations'
import { motion } from 'framer-motion'

// Unit with idle animation
function Unit({ type, imageUrl }) {
  return (
    <motion.div
      variants={getUnitIdleAnimation(type)}
      animate="idle"
    >
      <img src={imageUrl} alt={type} />
    </motion.div>
  )
}

// Button with press animation
function ActionButton({ onClick, children }) {
  return (
    <motion.button
      variants={buttonPressAnimation}
      initial="idle"
      whileHover="hover"
      whileTap="tap"
      onClick={onClick}
    >
      {children}
    </motion.button>
  )
}

// Emote display
function EmoteDisplay({ emote }) {
  const emoteData = emoteAnimations[emote]

  return (
    <motion.div
      variants={emoteData.variants}
      initial="start"
      animate="animate"
      className="text-4xl"
    >
      {emoteData.icon}
    </motion.div>
  )
}
```

---

## Common Integration Patterns

### Pattern 1: Weather System

```tsx
const [weather, setWeather] = useState<WeatherType>('clear')
const [timeOfDay, setTimeOfDay] = useState<'day' | 'night' | 'dusk' | 'dawn'>('day')

// Change weather based on game events
useEffect(() => {
  if (roundNumber > 10) {
    setWeather('sandstorm')
  }
}, [roundNumber])

// Day/night cycle
useEffect(() => {
  const hour = Math.floor((roundNumber % 24) / 6)
  if (hour === 0) setTimeOfDay('dawn')
  else if (hour === 1 || hour === 2) setTimeOfDay('day')
  else if (hour === 3) setTimeOfDay('dusk')
  else setTimeOfDay('night')
}, [roundNumber])

<ImprovedGameBoard
  weather={weather}
  timeOfDay={timeOfDay}
  {...otherProps}
/>
```

### Pattern 2: Combat Effect Chain

```tsx
const playCombatSequence = async (attacker, defender, damage, isCritical) => {
  // 1. Attack animation
  setUnitAnimation(attacker.id, 'attacking-slash')

  // 2. Hit spark
  await delay(300)
  addEffect({ type: 'hit-spark', x: defender.x, y: defender.y })

  // 3. Damage number
  setDamagePopup({ amount: damage, x: defender.x, y: defender.y, isCritical })

  // 4. Blood effect
  if (damage > 0) {
    addEffect({ type: 'blood-splatter', x: defender.x, y: defender.y })
  }

  // 5. Critical explosion
  if (isCritical) {
    addEffect({ type: 'explosion', x: defender.x, y: defender.y, intensity: 1.5 })
  }

  // 6. Return to idle
  await delay(500)
  setUnitAnimation(attacker.id, 'idle')
  setUnitAnimation(defender.id, 'idle')
}
```

### Pattern 3: Victory Celebration

```tsx
const playVictorySequence = async (winningTeam) => {
  // 1. Victory animation for all units
  winningTeam.forEach((unit) => {
    setUnitAnimation(unit.id, 'victory')
  })

  // 2. Fireworks at random positions
  for (let i = 0; i < 10; i++) {
    await delay(200)
    const x = Math.random() * 800
    const y = Math.random() * 400
    addEffect({ type: 'victory-firework', x, y })
  }

  // 3. Gold rain
  await delay(1000)
  for (let i = 0; i < 20; i++) {
    const x = Math.random() * 800
    addEffect({ type: 'gold-collect', x, y: 0 })
  }
}
```

### Pattern 4: Danger Zone Calculation

```tsx
const calculateDangerZones = (enemyUnits, bossMonsters) => {
  const dangerZones: Position[] = []

  // Add zones around enemy units
  enemyUnits.forEach((enemy) => {
    const range = getAttackRange(enemy)
    for (let dr = -range; dr <= range; dr++) {
      for (let dc = -range; dc <= range; dc++) {
        if (Math.abs(dr) + Math.abs(dc) <= range) {
          dangerZones.push({
            row: enemy.row + dr,
            col: enemy.col + dc,
          })
        }
      }
    }
  })

  // Add zones around bosses
  bossMonsters.forEach((boss) => {
    const range = boss.range
    for (let dr = -range; dr <= range; dr++) {
      for (let dc = -range; dc <= range; dc++) {
        if (Math.abs(dr) + Math.abs(dc) <= range) {
          dangerZones.push({
            row: boss.position.row + dr,
            col: boss.position.col + dc,
          })
        }
      }
    }
  })

  return dangerZones
}

<ImprovedGameBoard dangerZones={dangerZones} {...otherProps} />
```

---

## Performance Optimization Tips

### 1. Limit Active Effects

```tsx
const MAX_ACTIVE_EFFECTS = 50

const addEffect = (effect: EffectConfig) => {
  setEffects((prev) => {
    const updated = [...prev, effect]
    // Keep only the most recent effects
    return updated.slice(-MAX_ACTIVE_EFFECTS)
  })
}
```

### 2. Throttle Effect Spawning

```tsx
import { throttle } from 'lodash'

const addEffectThrottled = throttle(addEffect, 100) // Max 10 effects per second
```

### 3. Clear Old Effects

```tsx
useEffect(() => {
  const interval = setInterval(() => {
    setEffects((prev) => {
      const now = Date.now()
      return prev.filter((effect) => now - effect.timestamp < 5000)
    })
  }, 1000)

  return () => clearInterval(interval)
}, [])
```

### 4. Reduce Particles on Mobile

```tsx
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
const particleIntensity = isMobile ? 0.5 : 1

<VisualEffects
  effects={effects.map((e) => ({
    ...e,
    intensity: (e.intensity || 1) * particleIntensity,
  }))}
/>
```

---

## Testing Checklist

- [ ] Theme changes apply correctly
- [ ] Theme preferences persist after reload
- [ ] All colorblind modes work
- [ ] Game board renders at 60 FPS
- [ ] Particle effects don't cause lag
- [ ] Unit cards flip smoothly
- [ ] Animations don't overlap awkwardly
- [ ] Weather effects are visible but not distracting
- [ ] Danger zones are clearly visible
- [ ] Mobile devices run smoothly
- [ ] Memory usage stays reasonable
- [ ] Effects clean up properly
- [ ] No console errors or warnings

---

## Troubleshooting

### Issue: Animations are choppy

**Solution:** Check if you're using too many effects simultaneously. Limit to 50 active particles.

### Issue: Theme doesn't change

**Solution:** Make sure your app is wrapped in `<ThemeProvider>`. Check console for errors.

### Issue: Effects don't appear

**Solution:** Verify the VisualEffects component is positioned correctly with `absolute` or `fixed` positioning.

### Issue: Memory leak over time

**Solution:** Ensure effects are being cleaned up. Add cleanup in useEffect hooks.

### Issue: Unit cards don't flip

**Solution:** Check that `interactive` prop is set to `true` on the UnitCard component.

---

## Next Steps

1. **Test thoroughly** - Play through multiple rounds to ensure stability
2. **Gather feedback** - Show to players and collect their impressions
3. **Optimize** - Profile with React DevTools and Chrome Performance tab
4. **Customize** - Adjust colors, timing, and effects to match your vision
5. **Extend** - Add more themes, effects, and animations as needed

---

**Need help? Check the full documentation in VISUAL_UPGRADE_SUMMARY.md**

---

*Happy coding! Make it GESCHEIT! 🎨*
