# Silkroad Fights - Real-Time Combat System Documentation

## Overview

The Real-Time Combat System is a comprehensive framework for handling dynamic, skill-based combat in Silkroad Fights. It features hitbox detection, collision systems, damage calculation with critical hits, combo mechanics, special abilities with cooldowns, and various status effects.

## Table of Contents

1. [Core Features](#core-features)
2. [Combat Mechanics](#combat-mechanics)
3. [Abilities System](#abilities-system)
4. [Status Effects](#status-effects)
5. [Combat Events](#combat-events)
6. [Integration Guide](#integration-guide)
7. [Balance & Design Philosophy](#balance--design-philosophy)

---

## Core Features

### ✨ Hitbox Detection
- **Circle-based collision detection** for accurate hit registration
- **Configurable hitbox sizes** per unit type
- **Range checking** for abilities and attacks
- **Area-of-effect (AoE)** calculations for splash damage

### ⚔️ Real-Time Combat
- **60 FPS update loop** for smooth combat
- **Attack cooldown system** (500ms between attacks)
- **Cast time** for abilities
- **Velocity-based movement** with collision

### 🎯 Critical Hit System
- **Base 15% critical chance**
- **1.5x damage multiplier** on crits
- **Backstab bonus** for positioning-based damage
- **Special ability crits** with unique modifiers

### 🔥 Combo System
- **5-tier combo chain** (1.0x → 2.0x damage multiplier)
- **2-second combo timeout** (maintain aggression)
- **Combo milestone events** for visual feedback
- **Combo break mechanics** on dodge/miss

---

## Combat Mechanics

### Damage Calculation Formula

```
Base Damage = Ability Damage + Attacker Power
Critical Damage = Base Damage × Critical Multiplier (if crit)
Combo Damage = Critical Damage × Combo Multiplier
Modified Damage = Combo Damage × Status Effect Modifiers
Variance Damage = Modified Damage × (1 ± 10%)
Final Damage = Variance Damage × Defense Reduction
```

### Defense Formula

```
Defense Reduction = Defense / (Defense + 100)
Final Damage = Damage × (1 - Defense Reduction)
```

**Example:**
- Attacker: 30 power, 2.0x combo multiplier, 1.5x enraged
- Ability: 50 base damage
- Defender: 20 defense

```
Base = 50 + 30 = 80
Combo = 80 × 2.0 = 160
Enraged = 160 × 1.5 = 240
Defense = 20 / (20 + 100) = 0.167
Final = 240 × (1 - 0.167) = ~200 damage
```

### Unit Stats

| Unit Type | HP | Attack Power | Defense | Crit Chance | Crit Multiplier |
|-----------|-------|--------------|---------|-------------|-----------------|
| Trader (TR) | 2 | 20 | 15 | 15% | 1.5x |
| Hunter (H) | 3 | 25 | 20 | 15% | 1.5x |
| Thief (TH) | 2 | 30 | 8 | 15% | 1.5x |
| Kingthief (KT) | 3 | 35 | 12 | 15% | 1.5x |
| Boss | 5 | varies | 20 | 25% | 2.0x |

### Combo Multipliers

| Combo Hit | Multiplier | Description |
|-----------|------------|-------------|
| 1st hit | 1.0x | Base damage |
| 2nd hit | 1.15x | +15% damage |
| 3rd hit | 1.3x | +30% damage ⭐ Milestone |
| 4th hit | 1.5x | +50% damage |
| 5th hit+ | 2.0x | +100% damage ⭐ Max Combo |

---

## Abilities System

### Trader Abilities

#### 1. Rush
- **Cooldown:** 8s
- **Damage:** 15
- **Range:** 3
- **Effect:** Speed boost (180% speed for 2s)
- **Use Case:** Gap closer, escape, mobility
- **Animation Trigger:** `trader_rush`

#### 2. Shield Wall
- **Cooldown:** 15s
- **Damage:** 0
- **Range:** Self + nearby (2 radius)
- **Effect:** +100 shield, -50% speed for 5s
- **Use Case:** Tanking, protecting allies
- **Animation Trigger:** `trader_shield_wall`

#### 3. Fortify
- **Cooldown:** 12s
- **Damage:** 0
- **Range:** Self
- **Effect:** Invulnerable for 1.5s
- **Use Case:** Dodge burst damage, survive execute
- **Animation Trigger:** `trader_fortify`

### Hunter Abilities

#### 1. Guard
- **Cooldown:** 10s
- **Damage:** 0
- **Range:** 2
- **Effect:** +75 shield to target ally for 4s
- **Use Case:** Protect vulnerable units
- **Animation Trigger:** `hunter_guard`

#### 2. Track
- **Cooldown:** 20s
- **Damage:** 0
- **Range:** 5
- **Effect:** Slow enemy (70% speed) for 6s, reveal position
- **Use Case:** Chase, prevent escape, setup
- **Animation Trigger:** `hunter_track`

#### 3. Snipe
- **Cooldown:** 6s
- **Damage:** 40
- **Range:** 6
- **Effect:** Long-range high-damage shot
- **Use Case:** Poke, finish low HP targets
- **Animation Trigger:** `hunter_snipe`

### Thief Abilities

#### 1. Ambush
- **Cooldown:** 10s
- **Damage:** 50
- **Range:** 1
- **Effect:** Stun for 1s
- **Use Case:** Initiation, lockdown, burst
- **Animation Trigger:** `thief_ambush`

#### 2. Disarm
- **Cooldown:** 12s
- **Damage:** 10
- **Range:** 1
- **Effect:** Weaken (50% damage) for 5s
- **Use Case:** Reduce enemy threat
- **Animation Trigger:** `thief_disarm`

#### 3. Shadowstep
- **Cooldown:** 8s
- **Damage:** 0
- **Range:** 4
- **Effect:** Teleport + invisible for 2s
- **Use Case:** Escape, reposition, surprise
- **Animation Trigger:** `thief_shadowstep`

#### 4. Backstab
- **Cooldown:** 5s
- **Damage:** 60
- **Range:** 1
- **Effect:** Bleed (8 damage/s for 5s)
- **Use Case:** High burst damage, DoT
- **Animation Trigger:** `thief_backstab`

### Kingthief Abilities

#### 1. Rally
- **Cooldown:** 18s
- **Damage:** 0
- **Range:** AoE 4 radius
- **Effect:** Enrage (+40% damage) + Speed (+30%) for 6s
- **Use Case:** Team buff, push advantage
- **Animation Trigger:** `kingthief_rally`

#### 2. Execute
- **Cooldown:** 15s
- **Damage:** 80 (bonus vs low HP)
- **Range:** 1
- **Effect:** Massive single-target damage
- **Use Case:** Finish enemies, burst
- **Animation Trigger:** `kingthief_execute`

### Boss Abilities

#### 1. Terrifying Roar
- **Cooldown:** 12s
- **Damage:** 20
- **Range:** AoE 3 radius
- **Effect:** Stun 2s + Weaken (60% damage) for 5s
- **Use Case:** Area control, disable heroes
- **Animation Trigger:** `boss_roar`

#### 2. Ground Smash
- **Cooldown:** 8s
- **Damage:** 60
- **Range:** 2
- **Effect:** AoE damage + Stun 1.5s
- **Use Case:** Heavy AoE burst
- **Animation Trigger:** `boss_smash`

#### 3. Enrage
- **Cooldown:** 20s
- **Damage:** 0
- **Range:** Self
- **Effect:** +100% damage, +50% speed for 10s
- **Use Case:** Boss phase transition, berserk
- **Animation Trigger:** `boss_rage`

---

## Status Effects

### 🛡️ Defensive Effects

#### Shield
- **Duration:** 4s
- **Intensity:** Absorbs 50-100 damage
- **Stackable:** No
- **Effect:** Blocks damage before HP loss
- **Visual:** Blue aura/barrier

#### Invulnerable
- **Duration:** 1.5-2s
- **Intensity:** 100% damage immunity
- **Stackable:** No
- **Effect:** Cannot take any damage
- **Visual:** Golden glow

#### Invisible
- **Duration:** 2-5s
- **Intensity:** Cannot be targeted
- **Stackable:** No
- **Effect:** Untargetable by enemies
- **Visual:** Translucent/faded

### ⚡ Offensive Effects

#### Enraged
- **Duration:** 5-10s
- **Intensity:** 140-200% damage
- **Stackable:** No
- **Effect:** Increased damage output
- **Visual:** Red aura, angry particles

#### Speed Boost
- **Duration:** 2-3s
- **Intensity:** 130-180% speed
- **Stackable:** No
- **Effect:** Increased movement speed
- **Visual:** Speed trails

### 🩸 Damage Over Time (DoT)

#### Bleed
- **Duration:** 5s
- **Intensity:** 5-8 damage per tick
- **Tick Rate:** 1s
- **Stackable:** Yes (max 5 stacks)
- **Visual:** Blood drip particles

#### Poison
- **Duration:** 6s
- **Intensity:** 3 damage per tick
- **Tick Rate:** 1s
- **Stackable:** Yes (max 3 stacks)
- **Visual:** Green poison cloud

#### Burn
- **Duration:** 4s
- **Intensity:** 8 damage per tick
- **Tick Rate:** 0.5s
- **Stackable:** No
- **Visual:** Fire particles

### 🔒 Crowd Control

#### Stun
- **Duration:** 1-2s
- **Intensity:** Cannot move/attack
- **Stackable:** No
- **Effect:** Complete lockdown
- **Visual:** Stars above head

#### Frozen
- **Duration:** 2s
- **Intensity:** Cannot move/attack
- **Stackable:** No
- **Effect:** Complete immobilization
- **Visual:** Ice block

#### Slow
- **Duration:** 3-6s
- **Intensity:** 30-50% speed reduction
- **Stackable:** Yes (max 3 stacks)
- **Effect:** Reduced movement speed
- **Visual:** Ice/mud at feet

#### Weakened
- **Duration:** 4-5s
- **Intensity:** 50-70% damage output
- **Stackable:** Yes (max 2 stacks)
- **Effect:** Reduced damage dealt
- **Visual:** Purple debuff icon

---

## Combat Events

### Event Types & Animation Triggers

| Event Type | Triggered When | Animation | Sound Effect | Use Case |
|------------|----------------|-----------|--------------|----------|
| `ATTACK_START` | Attack begins | `attack_start` | `attack_swing` | Wind-up animation |
| `HIT` | Normal hit lands | `hit` | `hit` | Impact effect |
| `CRITICAL_HIT` | Critical strike | `critical_hit` | `critical_hit` | Special crit animation |
| `BLOCK` | Attack blocked | `block` | `block` | Shield bash effect |
| `DODGE` | Attack dodged | `dodge` | `dodge` | Evade animation |
| `KILL` | Unit dies | `death` | `death` | Death animation |
| `ABILITY_CAST` | Ability used | Varies | `ability_*` | Skill animation |
| `STATUS_APPLIED` | Effect applied | `status_*` | `status_*` | Effect visual |
| `STATUS_EXPIRED` | Effect ends | `status_*_expire` | - | Effect fadeout |
| `COMBO_BREAK` | Combo lost | `combo_break` | - | Combo lost visual |
| `COMBO_MILESTONE` | 3+ combo hits | `combo_X` | `combo_milestone_X` | Combo counter display |

### Event Listener Example

```typescript
import { combatSystem, CombatEvent } from './combatSystem';

// Register animation triggers
combatSystem.on('CRITICAL_HIT', (event: CombatEvent) => {
  // Play critical hit animation
  playAnimation(event.attacker.id, event.animationTrigger);

  // Play sound effect
  playSound(event.soundEffect);

  // Show damage numbers
  showDamageNumber(event.target.position, event.damage.totalDamage, 'critical');

  // Screen shake
  shakeScreen(5);
});

combatSystem.on('COMBO_MILESTONE', (event: CombatEvent) => {
  // Display combo counter
  showComboUI(event.attacker.comboCounter);

  // Play combo sound
  playSound(event.soundEffect);
});

combatSystem.on('KILL', (event: CombatEvent) => {
  // Play death animation
  playAnimation(event.target.id, 'death');

  // Remove entity from game
  removeEntity(event.target.id);

  // Award rewards
  awardKillReward(event.attacker.id);
});
```

---

## Integration Guide

### 1. Initialize Combat System

```typescript
import { createCombatSystem } from './lib/combatSystem';

const combat = createCombatSystem();
```

### 2. Create Combat Entities

```typescript
// Convert game units to combat entities
const traderEntity = combat.createEntityFromUnit(traderUnit, 'TRADER');
const thiefEntity = combat.createEntityFromUnit(thiefUnit, 'THIEF');
const bossEntity = combat.createEntityFromBoss(bossMonster);
```

### 3. Register Event Listeners

```typescript
combat.on('HIT', (event) => {
  // Handle hit animations
});

combat.on('ABILITY_CAST', (event) => {
  // Play ability effects
});
```

### 4. Game Loop Integration

```typescript
let lastTime = Date.now();

function gameLoop() {
  const now = Date.now();
  const deltaTime = now - lastTime;
  lastTime = now;

  // Update combat system
  combat.update(deltaTime);

  requestAnimationFrame(gameLoop);
}

gameLoop();
```

### 5. Handle Player Actions

```typescript
// Attack
if (playerClicksEnemy) {
  combat.performAttack(playerEntity, enemyEntity);
}

// Use ability
if (playerPressesAbilityKey) {
  const canUse = combat.canUseAbility(playerEntity, 'RUSH');
  if (canUse) {
    combat.useAbility(playerEntity, 'RUSH', targetPosition);
  }
}
```

### 6. Multiplayer Validation

```typescript
// Validate actions before processing
const validation = combat.validateCombatAction(
  entityId,
  'attack',
  targetId
);

if (validation.valid) {
  // Process action
} else {
  console.error('Invalid action:', validation.reason);
}

// Sync combat state
const stateHash = combat.getCombatStateHash();
sendToServer({ stateHash });
```

---

## Balance & Design Philosophy

### Combat Flow

1. **Positioning Matters:** Abilities have range requirements, backstab bonuses
2. **Risk vs Reward:** High damage abilities have longer cooldowns
3. **Counter-play:** Shields counter burst, DoTs counter shields
4. **Team Synergy:** Rally buffs allies, Guard protects traders
5. **Skill Expression:** Combo system rewards consistent hits

### Balance Principles

#### Trader (Tank/Support)
- **Strengths:** High defense, shields, can carry gold
- **Weaknesses:** Low damage, slow
- **Role:** Frontline, gold transport, absorb damage

#### Hunter (Ranged DPS/Support)
- **Strengths:** Long range, protect allies, high HP
- **Weaknesses:** Low mobility
- **Role:** Backline damage, support traders

#### Thief (Assassin/DPS)
- **Strengths:** High damage, mobility, stealth
- **Weaknesses:** Low HP, low defense
- **Role:** Burst damage, pick-offs, harassment

#### Kingthief (Leader/Buffer)
- **Strengths:** Team buffs, high damage
- **Weaknesses:** Long cooldowns, high value target
- **Role:** Enable team, execute low HP targets

#### Boss (Raid Boss)
- **Strengths:** High HP, AoE abilities, CC
- **Weaknesses:** Predictable patterns, slow
- **Role:** PvE threat, reward source

### Damage Balance

| Ability | Damage | DPS | Cooldown Efficiency |
|---------|--------|-----|---------------------|
| Rush | 15 | 1.875 | Low |
| Snipe | 40 | 6.67 | High |
| Ambush | 50 | 5.0 | High |
| Backstab | 60 + DoT | ~16 | Very High |
| Execute | 80 | 5.33 | Very High |
| Boss Smash | 60 (AoE) | 7.5 | Very High |

### Counter Relationships

```
Burst Damage → Countered by → Shield/Invulnerable
Shield → Countered by → DoT Effects (Bleed, Poison)
DoT Effects → Countered by → Quick Healing/Kill
Mobility → Countered by → Track, Stun, Slow
Stealth → Countered by → AoE Abilities
```

---

## Example Combat Sequence

### Scenario: Thief Ambushes Trader

```
Turn 1: Thief uses Shadowstep (invisible, teleport close)
  - Thief: 2 HP, invisible, position: (3, 4)
  - Trader: 2 HP, unaware, position: (3, 5)

Turn 2: Thief uses Ambush from stealth (bonus damage)
  - Damage: 50 × 1.5 (backstab) × 1.5 (crit) = 112 damage
  - Trader: Stunned, critically wounded
  - Event: CRITICAL_HIT, STATUS_APPLIED (stun)

Turn 3: Trader uses Fortify (during stun recovery)
  - Trader: Invulnerable for 1.5s
  - Positioning: Starts retreating

Turn 4: Thief uses Backstab
  - Damage blocked by invulnerable
  - Event: BLOCK

Turn 5: Trader uses Shield Wall (invuln expired)
  - Trader: +100 shield, slowed
  - Calls for Hunter backup

Turn 6: Hunter arrives, uses Guard on Trader
  - Trader: +75 shield (total 175)
  - Thief: Must disengage or risk 2v1

Result: Trader survives ambush, gold delivery continues
```

---

## Performance Considerations

### Optimization Tips

1. **Entity Limit:** Keep combat entities < 50 for 60 FPS
2. **Event Listeners:** Unregister unused listeners
3. **Collision Checks:** Use spatial partitioning for large battles
4. **Update Frequency:** Run combat updates at 60 Hz, game logic at 30 Hz
5. **Animation Pooling:** Reuse particle effects, don't create new ones

### Memory Management

```typescript
// Clean up dead entities
if (entity.health <= 0) {
  combat.removeEntity(entity.id);
}

// Clear old event listeners
combat.off('HIT', oldHandler);
```

---

## Troubleshooting

### Common Issues

**Q: Attacks not registering?**
- Check hitbox collision: `combat.checkCollision(attacker, target)`
- Verify attack cooldown: `now - entity.lastAttackTime > 500`
- Check status effects: Stun/Frozen prevents attacks

**Q: Abilities on permanent cooldown?**
- Ensure `combat.update(deltaTime)` is called every frame
- Check ability was properly added to entity: `entity.activeAbilities`

**Q: Combo not building?**
- Verify attacks are landing (not dodged)
- Check combo timeout: 2 seconds between hits
- Ensure `incrementCombo()` is called on successful hit

**Q: Status effects not expiring?**
- Call `combat.update(deltaTime)` regularly
- Check effect duration: `effect.duration > 0`

---

## API Reference

See `combatSystem.ts` for full TypeScript definitions and inline documentation.

### Key Methods

- `createEntityFromUnit(unit, team)` - Convert Unit to CombatEntity
- `performAttack(attacker, target)` - Execute basic attack
- `useAbility(entity, abilityId, target)` - Cast ability
- `applyStatusEffect(entity, effect)` - Apply status effect
- `update(deltaTime)` - Update combat state (call every frame)
- `on(eventType, callback)` - Register event listener
- `validateCombatAction(entityId, action, target, abilityId)` - Validate action (multiplayer)

---

## Credits

Developed for **Silkroad Fights** - A real-time tactical combat game inspired by Silkroad Online.

**Combat System Version:** 1.0.0
**Last Updated:** 2025-11-11
