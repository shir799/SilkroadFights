# AUTO-BATTLE SYSTEM ARCHITECTURE

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        GAME FLOW                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Shop Phase → Build Team → Combat Phase → Result → Shop Phase  │
│       ↓            ↓             ↓            ↓          ↓      │
│    Buy Units   Select Units   Watch Battle  Get Rewards  Repeat│
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                       BattleField.tsx                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                    Visual Layer (60 FPS)                   │  │
│  │  • Render units with lerp interpolation                   │  │
│  │  • Display projectiles and particles                      │  │
│  │  • Show damage numbers and health bars                    │  │
│  │  • Handle camera shake and effects                        │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  React State Manager                       │  │
│  │  • units: BattleUnit[]                                    │  │
│  │  • projectiles: Projectile[]                              │  │
│  │  • floatingTexts: FloatingText[]                          │  │
│  │  • particles: ParticleEffect[]                            │  │
│  └────────────────────────────────────────────────────────────┘  │
│                              ↕                                   │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │                  Game Loop (RAF)                           │  │
│  │  1. engine.update(deltaTime)                              │  │
│  │  2. processEvents()                                       │  │
│  │  3. updateRenderStates()                                  │  │
│  │  4. cleanupEffects()                                      │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
                              ↕
┌──────────────────────────────────────────────────────────────────┐
│                   autoBattleSystem.ts                            │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              AutoBattleEngine (Core Logic)                 │  │
│  │                                                            │  │
│  │  update(deltaTime) {                                      │  │
│  │    units.forEach(unit => {                                │  │
│  │      updateStatusEffects(unit, dt)                        │  │
│  │      updateUnitAI(unit, dt)         ← AI Decision Making │  │
│  │      updateCombat(unit, dt)         ← Attack Logic       │  │
│  │      updateAbility(unit, dt)        ← Ability Casting    │  │
│  │    })                                                     │  │
│  │    checkWinCondition()                                    │  │
│  │  }                                                        │  │
│  └────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────┘
```

## Data Flow

```
┌──────────────┐
│  User Input  │
│  (Start)     │
└──────┬───────┘
       │
       ↓
┌──────────────────────────────────────┐
│  createAutoBattle(teamA, teamB)      │
│  • Initialize units with stats       │
│  • Position units on battlefield     │
│  • Setup abilities and mana          │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Game Loop (every 16.67ms)           │
│  requestAnimationFrame()             │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Engine Update (10 FPS decisions)    │
│  • AI pathfinding                    │
│  • Combat calculations               │
│  • Ability triggers                  │
│  • Event generation                  │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Event Processing                    │
│  • damage → damage number + flash    │
│  • ability → projectile + particle   │
│  • death → death animation           │
│  • heal → heal sparkle               │
└──────┬───────────────────────────────┘
       │
       ↓
┌──────────────────────────────────────┐
│  Render (60 FPS)                     │
│  • Lerp unit positions               │
│  • Animate projectiles               │
│  • Update health/mana bars           │
│  • Display particles                 │
└──────┬───────────────────────────────┘
       │
       ↓
   ┌───┴────┐
   │Finished?│
   └───┬────┘
       │ No → Loop back
       │
       ↓ Yes
┌──────────────────────────────────────┐
│  onBattleEnd(winner)                 │
│  • Return to game                    │
│  • Award rewards                     │
└──────────────────────────────────────┘
```

## Combat Logic Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        UNIT DECISION TREE                       │
└─────────────────────────────────────────────────────────────────┘

   Is Alive?
      │
   ┌──┴──┐
   No    Yes
   │      │
  Exit   Has Stun?
         │
      ┌──┴──┐
      Yes   No
      │      │
     Skip   Has Target?
            │
         ┌──┴──┐
         No    Yes
         │      │
    Find Target  Target Alive?
         │       │
         └───┬───┴──┐
             │      No → Find New
             Yes     │
             │       │
        In Range? ←──┘
             │
          ┌──┴──┐
          No    Yes
          │      │
      Move Closer  Attack!
          │         │
          │    ┌────┴────┐
          │   Hit?     Dodge?
          │    │         │
          │  Damage    Miss
          │    │
          │  Apply Damage
          │    │
          │  Gain Mana (+10)
          │    │
          │  Target Gains Mana (+20)
          │    │
          │  Lifesteal?
          │    │
          │  ┌─┴─┐
          │  Yes  No
          │  │    │
          │ Heal  │
          │  └─┬──┘
          │    │
          │  Target Dead?
          │    │
          │  ┌─┴─┐
          │  Yes  No
          │  │    │
          │ Death Animation
          │       │
          └───────┴────→ Continue

      Mana >= 100?
          │
       ┌──┴──┐
       No    Yes
       │      │
      Skip  Cast Ability!
              │
         Find Targets
              │
         Apply Effects
              │
         Reset Mana
              │
         Continue
```

## Unit State Machine

```
┌──────────────────────────────────────────────────────────────┐
│                    UNIT STATE MACHINE                        │
└──────────────────────────────────────────────────────────────┘

         ┌─────────────┐
    ┌────│    IDLE     │←────┐
    │    └─────────────┘     │
    │           │            │
    │      Find Enemy        │
    │           │            │
    ↓           ↓            │
┌────────┐  ┌────────┐       │
│CASTING │  │MOVING  │       │
│ABILITY │  └────────┘       │
└────────┘       │           │
    │       In Range?        │
    │            │           │
    │            ↓           │
    │      ┌──────────┐      │
    └─────→│ATTACKING │──────┘
           └──────────┘
                │
           Take Damage
                │
                ↓
           ┌─────────┐
           │   HIT   │──→ Flash Animation
           └─────────┘
                │
           HP <= 0?
                │
                ↓
           ┌─────────┐
           │  DYING  │──→ Death Animation → Remove
           └─────────┘
```

## Mana System Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      MANA SYSTEM                             │
└──────────────────────────────────────────────────────────────┘

Start: mana = 0

      Attack Enemy
         │
         ↓
    mana += 10
         │
         ↓
   ┌─────────────┐
   │ mana >= 100?│
   └─────────────┘
         │
      ┌──┴──┐
      No    Yes
      │      │
   Continue  Cast Ability
             │
        mana = 0
             │
        Continue

      Take Damage
         │
         ↓
    mana += 20
         │
         ↓
   ┌─────────────┐
   │ mana >= 100?│
   └─────────────┘
         │
      ┌──┴──┐
      No    Yes
      │      │
   Continue  Cast Ability
             │
        mana = 0
             │
        Continue
```

## Ability Targeting System

```
┌──────────────────────────────────────────────────────────────┐
│                   ABILITY TARGETING                          │
└──────────────────────────────────────────────────────────────┘

Cast Ability
    │
    ↓
Ability Type?
    │
    ├─→ SINGLE TARGET
    │       │
    │       ↓
    │   Find Nearest Enemy
    │       │
    │       ↓
    │   Apply Damage
    │
    ├─→ AOE
    │       │
    │       ↓
    │   Find All in Radius
    │       │
    │       ↓
    │   Apply to Each
    │
    ├─→ LINE (Dragon Breath)
    │       │
    │       ↓
    │   Find Units in Line
    │       │
    │       ↓
    │   Apply to Each
    │
    ├─→ BOUNCE (Chain Lightning)
    │       │
    │       ↓
    │   Hit Primary Target
    │       │
    │       ↓
    │   Find Nearest to Hit
    │       │
    │       ↓
    │   Repeat N times
    │
    ├─→ ALLY (Heal/Buff)
    │       │
    │       ↓
    │   Find Lowest HP Ally
    │       │
    │       ↓
    │   Apply Effect
    │
    └─→ SELF
            │
            ↓
        Apply to Self
```

## Damage Calculation Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                  DAMAGE CALCULATION                          │
└──────────────────────────────────────────────────────────────┘

Base Damage
    │
    ↓
Critical Hit?
    │
 ┌──┴──┐
 No    Yes → damage *= critMultiplier (1.5x-2.5x)
 │      │
 └──┬───┘
    │
    ↓
Dodge Check
    │
 ┌──┴──┐
 Yes   No
 │      │
 0     Continue
 │      │
 │      ↓
 │   Physical or Magical?
 │      │
 │   ┌──┴──────────┐
 │   Physical     Magical
 │   │            │
 │   ↓            ↓
 │  Armor      Magic Resist
 │   │            │
 │   ↓            ↓
 │  reduction = armor/(armor+100)
 │   │
 │   ↓
 │  damage *= (1 - reduction)
 │   │
 └───┴──→ Final Damage
           │
           ↓
      Apply to Target
           │
      ┌────┴────┐
      │         │
      ↓         ↓
  Lifesteal?  Mana Gain
      │         │
     Heal    Attacker +10
              Target +20
```

## Event System

```
┌──────────────────────────────────────────────────────────────┐
│                     EVENT SYSTEM                             │
└──────────────────────────────────────────────────────────────┘

Combat Action
    │
    ↓
Generate Event
    │
    ├─→ type: 'damage'
    │     data: { sourceId, targetId, damage, isCritical... }
    │
    ├─→ type: 'heal'
    │     data: { unitId, amount, position }
    │
    ├─→ type: 'ability'
    │     data: { casterId, abilityName, targetIds }
    │
    ├─→ type: 'death'
    │     data: { unitId, killerId, position }
    │
    ├─→ type: 'revive'
    │     data: { unitId, hp, position }
    │
    └─→ type: 'manaGain'
          data: { unitId, amount }
    │
    ↓
Add to Event Queue
    │
    ↓
BattleField Processes
    │
    ├─→ Spawn Projectile
    ├─→ Add Particle Effect
    ├─→ Show Damage Number
    ├─→ Update Health Bar
    ├─→ Camera Shake
    └─→ Play Animation
```

## Performance Optimization

```
┌──────────────────────────────────────────────────────────────┐
│                  OPTIMIZATION STRATEGY                       │
└──────────────────────────────────────────────────────────────┘

Decision Making: 10 FPS (100ms tick)
    │
    ├─→ AI Pathfinding
    ├─→ Target Selection
    ├─→ Attack Calculations
    └─→ Ability Triggers

Rendering: 60 FPS (16.67ms frame)
    │
    ├─→ Lerp Interpolation
    ├─→ CSS Transforms (GPU)
    ├─→ Framer Motion Animations
    └─→ React State Updates

Cleanup: Per Frame
    │
    ├─→ Remove old events (>100)
    ├─→ Remove old particles (>1s)
    ├─→ Remove old projectiles
    └─→ Remove old damage numbers

Memory Management:
    │
    ├─→ Event queue: Max 100 events
    ├─→ Projectiles: Auto-cleanup on arrival
    ├─→ Particles: 1 second lifetime
    └─→ Render states: Reused per unit
```

## File Dependencies

```
autoBattleSystem.ts
    │
    ├─→ Exports: AutoBattleEngine, UnitClass, BattleUnit, etc.
    │
    └─→ Imports: types.ts (Position)

BattleField.tsx
    │
    ├─→ Imports: autoBattleSystem.ts
    ├─→ Imports: framer-motion
    ├─→ Imports: React hooks
    │
    └─→ Exports: BattleField component

battle-demo/page.tsx
    │
    ├─→ Imports: BattleField.tsx
    ├─→ Imports: autoBattleSystem.ts (types)
    │
    └─→ Exports: Demo page

Your Game
    │
    └─→ Imports: BattleField.tsx
        └─→ Uses: Auto-battle system
```

## Scalability

The system is designed to scale:

**Current:**
- 10 units per team (20 total)
- 60 FPS rendering
- 100ms decision tick

**Can Handle:**
- 50+ units per team
- Still 60 FPS rendering
- Adjustable tick rate

**Optimizations Available:**
- Spatial hashing for collision
- Quad-tree for pathfinding
- Object pooling for particles
- Web Workers for AI calculations
- Canvas rendering for more units

---

**The architecture is modular, maintainable, and production-ready!** 🚀
