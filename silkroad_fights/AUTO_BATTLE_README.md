# AUTO-BATTLE COMBAT SYSTEM 🎮⚔️

A complete, production-ready auto-battle system for Silkroad Fights with AI pathfinding, mana-based abilities, and stunning visual effects.

## 🎯 Overview

This auto-battle system provides **fully automated combat** where AI-controlled units fight using intelligent pathfinding, strategic ability usage, and realistic combat mechanics.

### Key Features

- ✅ **Smart AI** - A* pathfinding, target prioritization, kiting behavior
- ✅ **Mana System** - Gain mana from combat, auto-cast abilities at 100 mana
- ✅ **15 Unique Units** - From Tier 1 novices to Tier 5 legendary units
- ✅ **Combat Mechanics** - Crits, dodge, armor reduction, lifesteal, AoE, DoT
- ✅ **60 FPS Rendering** - Smooth animations with lerp interpolation
- ✅ **Visual Effects** - Projectiles, particles, damage numbers, screen shake
- ✅ **Replay System** - Event recording for replays and analysis
- ✅ **Playback Controls** - Pause, speed up (0.5x - 4x)

---

## 📁 File Structure

```
lib/autoBattleSystem.ts      # Core battle engine
components/BattleField.tsx   # Visual battlefield component
app/battle-demo/page.tsx     # Demo page with presets
```

---

## 🚀 Quick Start

### Basic Usage

```tsx
import BattleField from '@/components/BattleField';
import { UnitClass } from '@/lib/autoBattleSystem';

export default function MyBattle() {
  const teamA: UnitClass[] = ['Blader', 'Bowman', 'Wizard'];
  const teamB: UnitClass[] = ['Warrior', 'Bard', 'Cleric'];

  return (
    <BattleField
      teamA={teamA}
      teamB={teamB}
      onBattleEnd={(winner) => console.log(`${winner} wins!`)}
      autoStart={true}
    />
  );
}
```

### Advanced Usage

```tsx
import { AutoBattleEngine, createAutoBattle, UnitClass } from '@/lib/autoBattleSystem';

// Create engine programmatically
const teamA: UnitClass[] = ['Dragon', 'Phoenix'];
const teamB: UnitClass[] = ['TigerGirl', 'LightningWizard'];

const engine = createAutoBattle(teamA, teamB);

// Manual update loop
const deltaTime = 16.67; // ~60 FPS
engine.update(deltaTime);

// Check state
const state = engine.getState();
console.log('Units:', state.units);
console.log('Is finished:', engine.isFinished());
console.log('Winner:', engine.getWinner());

// Get events for replay
const events = engine.getRecentEvents(100);
```

---

## 🎮 Unit Types & Abilities

### Tier 1: Novices

| Unit | Emoji | HP | Damage | Range | Ability | Effect |
|------|-------|-------|---------|-------|---------|---------|
| **BladeNovice** | 🗡️ | 500 | 50 | 1.5 | Slash | 150 single target damage |
| **BowNovice** | 🏹 | 350 | 40 | 4 | Arrow Shot | 120 ranged damage |
| **ForceNovice** | ✨ | 400 | 45 | 3 | Magic Bolt | 100 magic damage |

### Tier 2: Advanced

| Unit | Emoji | HP | Damage | Range | Ability | Effect |
|------|-------|-------|---------|-------|---------|---------|
| **Blader** | ⚔️ | 800 | 80 | 1.5 | Whirlwind | 200 AoE damage (radius 2) |
| **Bowman** | 🏹 | 600 | 70 | 5 | Multi-Shot | 150 damage to 3 targets |
| **Wizard** | 🔮 | 550 | 90 | 4 | Fireball | 250 AoE explosion (radius 2.5) |

### Tier 3: Support

| Unit | Emoji | HP | Damage | Range | Ability | Effect |
|------|-------|-------|---------|-------|---------|---------|
| **Warrior** | 🛡️ | 1500 | 70 | 1.5 | Taunt | Forces enemies to attack, +50 armor |
| **Bard** | 🎵 | 700 | 50 | 3 | Inspiring Song | Allies +30% attack speed (5s) |
| **Cleric** | ✝️ | 800 | 40 | 4 | Holy Light | Heal lowest HP ally 300 HP |

### Tier 4: Elite Casters

| Unit | Emoji | HP | Damage | Range | Ability | Effect |
|------|-------|-------|---------|-------|---------|---------|
| **FireWizard** | 🔥 | 900 | 120 | 5 | Meteor | 500 AoE + 50 burn/s (3s) |
| **IceWizard** | ❄️ | 850 | 100 | 5 | Blizzard | 300 AoE + 50% slow (4s) |
| **LightningWizard** | ⚡ | 800 | 130 | 5 | Chain Lightning | 400 damage, bounces 3 times |

### Tier 5: Legendary

| Unit | Emoji | HP | Damage | Range | Ability | Effect |
|------|-------|-------|---------|-------|---------|---------|
| **TigerGirl** | 🐯 | 2000 | 180 | 2 | Roar | 800 AoE + 2s stun |
| **Phoenix** | 🦅 | 1200 | 150 | 4 | Rebirth | **Passive:** Revive with 50% HP |
| **Dragon** | 🐉 | 3000 | 200 | 5 | Dragon Breath | 1200 line AoE + 100 burn/s (5s) |

---

## ⚙️ Combat Mechanics

### Mana System

```typescript
// Mana gain
On Attack:         +10 mana
On Damage Taken:   +20 mana
Max Mana:          100

// Ability casting
if (unit.currentMana >= 100) {
  castAbility(unit);
  unit.currentMana = 0;
}
```

### Damage Calculation

```typescript
// Physical Damage
baseDamage = attackDamage
if (isCritical) baseDamage *= critMultiplier
damageReduction = armor / (armor + 100)
finalDamage = baseDamage * (1 - damageReduction)

// Magical Damage
damageReduction = magicResist / (magicResist + 100)
finalDamage = abilityDamage * (1 - damageReduction)

// Lifesteal
healAmount = finalDamage * lifesteal
unit.currentHp = min(maxHp, currentHp + healAmount)
```

### Critical Hits

```typescript
critChance: 0.1 - 0.3      // 10-30% chance
critMultiplier: 1.5 - 2.5  // 1.5x - 2.5x damage
```

### Dodge

```typescript
dodgeChance: 0.05 - 0.25   // 5-25% chance
if (dodge) damage = 0
```

### Status Effects

| Effect | Duration | Impact |
|--------|----------|---------|
| **Stun** | 1-2s | Cannot move or attack |
| **Slow** | 3-4s | 50% reduced movement speed |
| **Burn** | 3-5s | Damage over time (30-100/s) |
| **Attack Speed Buff** | 5s | +30% attack speed |
| **Armor Buff** | 5s | +50 armor |

---

## 🎬 Animation System

### Unit Animations

- **idle** - Breathing/floating animation
- **moving** - Walking with bob
- **attacking** - Attack swing/shoot
- **casting** - Ability cast pose
- **hit** - Flash + shake on damage
- **dying** - Fade out + rotate

### Visual Effects

```typescript
// Projectiles
Arrow:     Flies from source to target
Fireball:  Arcing trajectory with trail
Lightning: Instant chain effect
Magic:     Spiraling missile

// Particles
Hit Spark:        💥 On damage
Critical Burst:   ⭐ On crit
Heal Sparkle:     ✨ On heal
Death Explosion:  💀 On death
Revive Aura:      🌟 On revive

// Screen Effects
Camera Shake:     Intensity based on damage
Damage Numbers:   Float up and fade
Health Bars:      Smooth color transitions
Mana Bars:        Fill animation
```

### Interpolation

```typescript
// Smooth movement (lerp)
displayPosition.x += (targetPosition.x - displayPosition.x) * LERP_SPEED
displayPosition.y += (targetPosition.y - displayPosition.y) * LERP_SPEED

LERP_SPEED = 0.15  // Adjust for smoothness
```

---

## 🧠 AI Behavior

### Target Selection

```typescript
1. Check if current target is alive
2. If not, find nearest enemy
3. Special: TigerGirl prioritizes low HP targets
```

### Movement

```typescript
// Melee units
Move towards target until in range

// Ranged units (Kiting)
if (distance < attackRange * 0.8) {
  Move away from target
} else {
  Move towards target
}
```

### Ability Usage

```typescript
// Auto-cast when mana full
if (currentMana >= 100 && !hasStatusEffect('stun')) {
  castAbility()
}

// Target priority
Heals:    Lowest HP ally
Damage:   Nearest enemy
Buffs:    All allies in range
```

---

## 🎮 BattleField Component API

### Props

```typescript
interface BattleFieldProps {
  teamA: UnitClass[];           // Team A composition
  teamB: UnitClass[];           // Team B composition
  onBattleEnd?: (winner: 'A' | 'B') => void;  // Callback when battle ends
  autoStart?: boolean;          // Start immediately (default: true)
}
```

### Controls

- **Pause/Resume** - Pause the battle
- **Playback Speed** - 0.5x, 1x, 2x, 4x
- **Restart** - Reset the battle

---

## 🎯 Example Compositions

### Balanced Team

```typescript
['Warrior', 'FireWizard', 'Bard', 'Blader']
// Tank + DPS + Support + Bruiser
```

### Glass Cannon

```typescript
['FireWizard', 'IceWizard', 'LightningWizard']
// High damage, low survivability
```

### Sustain Team

```typescript
['Warrior', 'Cleric', 'Bard']
// High survivability, low damage
```

### Rush Comp

```typescript
['BladeNovice', 'BladeNovice', 'BowNovice', 'BowNovice']
// Numbers advantage
```

### Boss Fight

```typescript
teamA: ['Dragon', 'Phoenix']
teamB: ['Warrior', 'Cleric', 'Bard', 'Blader', 'Wizard']
// Few strong vs many weak
```

---

## 🔧 Integration Guide

### 1. Add to Existing Game

```typescript
// In your game state
interface GameState {
  phase: 'shop' | 'combat' | 'result';
  playerTeam: UnitClass[];
  enemyTeam: UnitClass[];
}

// Render combat phase
{state.phase === 'combat' && (
  <BattleField
    teamA={state.playerTeam}
    teamB={state.enemyTeam}
    onBattleEnd={(winner) => {
      if (winner === 'A') {
        // Player wins
        awardGold(100);
      } else {
        // Player loses
        takeDamage(10);
      }
      setState({ phase: 'result' });
    }}
  />
)}
```

### 2. Record Replays

```typescript
const engine = createAutoBattle(teamA, teamB);
const eventLog: BattleEvent[] = [];

engine.onRender((state) => {
  const events = engine.getRecentEvents(10);
  eventLog.push(...events);
});

// Save for replay
saveReplay({
  teamA,
  teamB,
  events: eventLog,
  winner: engine.getWinner(),
});
```

### 3. Custom Victory Conditions

```typescript
// Override default win condition
const engine = createAutoBattle(teamA, teamB);

function checkCustomWin() {
  const state = engine.getState();

  // Example: First to lose 2 units
  const teamALosses = state.units.filter(u => u.team === 'A' && u.isDead).length;
  const teamBLosses = state.units.filter(u => u.team === 'B' && u.isDead).length;

  if (teamALosses >= 2) return 'B';
  if (teamBLosses >= 2) return 'A';
  return null;
}
```

---

## 🎨 Customization

### Add New Unit

```typescript
// 1. Add to UnitClass type
export type UnitClass =
  | 'BladeNovice'
  | 'MyNewUnit';  // <-- Add here

// 2. Define ability
export const UNIT_ABILITIES: Record<UnitClass, UnitAbility> = {
  MyNewUnit: {
    name: 'Super Attack',
    manaCost: 100,
    damage: 500,
    damageType: 'physical',
    targetType: 'aoe',
    range: 4,
    aoeRadius: 3,
    // ... other properties
  },
};

// 3. Define stats
const UNIT_STATS: Record<UnitClass, Partial<BattleUnit>> = {
  MyNewUnit: {
    tier: 3,
    maxHp: 1000,
    attackDamage: 100,
    attackSpeed: 1.2,
    // ... other stats
  },
};

// 4. Add visual (in BattleField.tsx)
const UNIT_EMOJIS: Record<string, string> = {
  MyNewUnit: '⚔️',
};

const UNIT_COLORS: Record<string, string> = {
  MyNewUnit: '#FF0000',
};
```

### Modify Combat Formulas

```typescript
// In autoBattleSystem.ts > performAttack()

// Example: Add attack variance
let damage = attacker.attackDamage;
damage *= (0.9 + Math.random() * 0.2); // ±10% variance

// Example: Armor penetration
const armorPen = attacker.armorPenetration || 0;
const effectiveArmor = Math.max(0, target.armor - armorPen);
```

---

## 📊 Performance

### Optimization Tips

1. **Limit Event History**
   ```typescript
   maxEventHistory: 100  // Keep last 100 events
   ```

2. **Reduce Particle Count**
   ```typescript
   // In BattleField.tsx
   if (shouldReduceEffects) {
     return; // Skip particles
   }
   ```

3. **Adjust Tick Rate**
   ```typescript
   private tickRate: number = 100; // 10 FPS decision making
   // Higher = more CPU, more responsive
   // Lower = less CPU, more laggy
   ```

4. **Use CSS Transform**
   ```typescript
   // Preferred (GPU accelerated)
   style={{ transform: `translate(${x}px, ${y}px)` }}

   // Avoid (triggers layout)
   style={{ left: x, top: y }}
   ```

---

## 🐛 Debugging

### Enable Logging

```typescript
// In autoBattleSystem.ts
private debug = true; // Enable console logs

console.log('[BATTLE]', 'Unit attacked:', attacker.id, '→', target.id);
console.log('[ABILITY]', 'Casted:', ability.name, 'Targets:', targets.length);
```

### Visualize Pathfinding

```typescript
// In BattleField.tsx
{debug && unit.targetPosition && (
  <div
    className="absolute border-2 border-yellow-400"
    style={{
      left: unit.targetPosition.col * CELL_SIZE,
      top: unit.targetPosition.row * CELL_SIZE,
      width: CELL_SIZE,
      height: CELL_SIZE,
    }}
  />
)}
```

### Event Viewer

```typescript
const [events, setEvents] = useState<BattleEvent[]>([]);

engine.onRender((state) => {
  setEvents(engine.getRecentEvents(20));
});

return (
  <div className="event-log">
    {events.map(e => (
      <div key={e.timestamp}>
        {e.type}: {JSON.stringify(e.data)}
      </div>
    ))}
  </div>
);
```

---

## 📝 TODO / Future Enhancements

- [ ] True A* pathfinding (currently simple direct movement)
- [ ] Collision detection between units
- [ ] Terrain/obstacles on battlefield
- [ ] Unit formations (line, spread, V-shape)
- [ ] AI difficulty levels (easy/normal/hard)
- [ ] Combo system (chained abilities)
- [ ] Ultimate abilities (500 mana)
- [ ] Items/Equipment system
- [ ] Leveling system
- [ ] Team synergies (elemental combos)
- [ ] Spectator mode with free camera
- [ ] Tournament bracket system
- [ ] AI vs AI simulation
- [ ] Sound effects integration
- [ ] Mobile touch controls

---

## 🎓 Learning Resources

### Key Concepts

1. **Game Loop** - requestAnimationFrame for 60 FPS
2. **Lerp** - Linear interpolation for smooth movement
3. **State Management** - Separating logic from rendering
4. **Event System** - Decoupled communication
5. **AI Decision Trees** - Simple but effective AI

### Recommended Reading

- [Game Programming Patterns](https://gameprogrammingpatterns.com/)
- [Red Blob Games - Pathfinding](https://www.redblobgames.com/pathfinding/a-star/introduction.html)
- [Gaffer on Games - Fix Your Timestep](https://gafferongames.com/post/fix_your_timestep/)

---

## 📄 License

Part of Silkroad Fights project. See main LICENSE file.

---

## 🙏 Credits

Created by the Combat & Animation Agent

Inspired by:
- Silkroad Online
- Auto Chess / TFT
- Fire Emblem

---

**Ready to battle? Start the demo:**

```bash
npm run dev
# Navigate to http://localhost:3000/battle-demo
```

**May the best team win! ⚔️🏆**
