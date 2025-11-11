/**
 * COMBAT SYSTEM USAGE EXAMPLES
 *
 * This file demonstrates how to use the real-time combat system
 * with practical examples and combat sequences.
 */

import {
  CombatSystem,
  CombatEntity,
  CombatEvent,
  createCombatSystem,
  getAbilityForUnit,
  COMBAT_ABILITIES,
} from './combatSystem';
import { Unit, BossMonster, Position } from './types';

// ============================================================================
// EXAMPLE 1: BASIC COMBAT SETUP
// ============================================================================

export function exampleBasicCombatSetup() {
  console.log('=== EXAMPLE 1: Basic Combat Setup ===\n');

  // Create combat system instance
  const combat = createCombatSystem();

  // Create sample units
  const traderUnit: Unit = {
    type: 'TR',
    hp: 2,
    maxHp: 2,
    row: 3,
    col: 3,
    abilities: ['Rush', 'Shield Wall', 'Fortify'],
    buffs: [],
    debuffs: [],
    hasGold: true,
  };

  const thiefUnit: Unit = {
    type: 'TH',
    hp: 2,
    maxHp: 2,
    row: 4,
    col: 4,
    abilities: ['Ambush', 'Disarm', 'Shadowstep'],
    buffs: [],
    debuffs: [],
  };

  // Convert to combat entities
  const trader = combat.createEntityFromUnit(traderUnit, 'TRADER');
  const thief = combat.createEntityFromUnit(thiefUnit, 'THIEF');

  console.log('Trader Entity:', {
    id: trader.id,
    position: trader.position,
    health: `${trader.health}/${trader.maxHealth}`,
    attackPower: trader.attackPower,
    defense: trader.defense,
  });

  console.log('\nThief Entity:', {
    id: thief.id,
    position: thief.position,
    health: `${thief.health}/${thief.maxHealth}`,
    attackPower: thief.attackPower,
    defense: thief.defense,
  });

  return { combat, trader, thief };
}

// ============================================================================
// EXAMPLE 2: COMBAT EVENT LISTENERS
// ============================================================================

export function exampleCombatEventListeners() {
  console.log('\n=== EXAMPLE 2: Combat Event Listeners ===\n');

  const combat = createCombatSystem();

  // Register event listeners for animation triggers
  combat.on('ATTACK_START', (event: CombatEvent) => {
    console.log(`🗡️  ${event.attacker.unitType} starts attacking!`);
    console.log(`   Animation: ${event.animationTrigger}`);
    console.log(`   Sound: ${event.soundEffect}`);
  });

  combat.on('HIT', (event: CombatEvent) => {
    console.log(`💥 Hit! ${event.damage?.totalDamage} damage dealt`);
    console.log(`   Combo: x${event.damage?.comboMultiplier.toFixed(2)}`);
  });

  combat.on('CRITICAL_HIT', (event: CombatEvent) => {
    console.log(`⚡ CRITICAL HIT! ${event.damage?.totalDamage} damage!`);
    console.log(`   🎯 Critical strike lands!`);
  });

  combat.on('BLOCK', (event: CombatEvent) => {
    console.log(`🛡️  Attack blocked! Only ${event.damage?.totalDamage} damage taken`);
  });

  combat.on('DODGE', (event: CombatEvent) => {
    console.log(`💨 Attack dodged! No damage taken`);
  });

  combat.on('KILL', (event: CombatEvent) => {
    console.log(`💀 ${event.target?.unitType} has been defeated by ${event.attacker.unitType}!`);
  });

  combat.on('COMBO_MILESTONE', (event: CombatEvent) => {
    console.log(`🔥 COMBO x${event.attacker.comboCounter}! Damage boosted!`);
  });

  combat.on('STATUS_APPLIED', (event: CombatEvent) => {
    console.log(`✨ Status effect applied: ${event.animationTrigger}`);
  });

  console.log('Event listeners registered successfully!\n');

  return combat;
}

// ============================================================================
// EXAMPLE 3: COMBAT SEQUENCE - TRADER VS THIEF
// ============================================================================

export function exampleCombatSequence() {
  console.log('\n=== EXAMPLE 3: Combat Sequence - Trader vs Thief ===\n');

  const combat = exampleCombatEventListeners();

  // Create units
  const traderUnit: Unit = {
    type: 'TR',
    hp: 2,
    maxHp: 2,
    row: 3,
    col: 3,
    abilities: ['Rush', 'Shield Wall'],
    buffs: [],
    debuffs: [],
    hasGold: true,
  };

  const thiefUnit: Unit = {
    type: 'TH',
    hp: 2,
    maxHp: 2,
    row: 3,
    col: 4,
    abilities: ['Ambush', 'Backstab'],
    buffs: [],
    debuffs: [],
  };

  const trader = combat.createEntityFromUnit(traderUnit, 'TRADER');
  const thief = combat.createEntityFromUnit(thiefUnit, 'THIEF');

  console.log('Initial State:');
  console.log(`Trader: ${trader.health}/${trader.maxHealth} HP at (${trader.position.row}, ${trader.position.col})`);
  console.log(`Thief: ${thief.health}/${thief.maxHealth} HP at (${thief.position.row}, ${thief.position.col})`);
  console.log();

  // Round 1: Trader uses Shield Wall
  console.log('--- Round 1 ---');
  combat.useAbility(trader, 'SHIELD_WALL');
  console.log(`Trader shields up! Status effects: ${trader.statusEffects.map(e => e.type).join(', ')}`);
  console.log();

  // Round 2: Thief attempts Backstab
  console.log('--- Round 2 ---');
  combat.useAbility(thief, 'BACKSTAB', trader.position);
  console.log(`Trader HP: ${trader.health}/${trader.maxHealth}`);
  console.log();

  // Round 3: Trader counterattacks
  console.log('--- Round 3 ---');
  const result1 = combat.performAttack(trader, thief);
  if (result1) {
    console.log(`Thief HP: ${thief.health}/${thief.maxHealth}`);
  }
  console.log();

  // Round 4: Thief attacks again (combo building)
  console.log('--- Round 4 ---');
  setTimeout(() => {
    const result2 = combat.performAttack(thief, trader);
    if (result2) {
      console.log(`Trader HP: ${trader.health}/${trader.maxHealth}`);
      console.log(`Thief combo: x${thief.comboCounter}`);
    }
  }, 600);

  return { combat, trader, thief };
}

// ============================================================================
// EXAMPLE 4: ABILITY SHOWCASE
// ============================================================================

export function exampleAbilityShowcase() {
  console.log('\n=== EXAMPLE 4: Ability Showcase ===\n');

  const combat = createCombatSystem();

  // Trader abilities
  console.log('TRADER ABILITIES:');
  const traderAbilities = getAbilityForUnit('TR');
  traderAbilities.forEach(ability => {
    console.log(`\n${ability.name} (Cooldown: ${ability.cooldown}ms)`);
    console.log(`  ${ability.description}`);
    console.log(`  Damage: ${ability.damage} | Range: ${ability.range} | AoE: ${ability.areaOfEffect}`);
    console.log(`  Status Effects: ${ability.statusEffects.map(e => e.type).join(', ') || 'None'}`);
  });

  // Hunter abilities
  console.log('\n\nHUNTER ABILITIES:');
  const hunterAbilities = getAbilityForUnit('H');
  hunterAbilities.forEach(ability => {
    console.log(`\n${ability.name} (Cooldown: ${ability.cooldown}ms)`);
    console.log(`  ${ability.description}`);
    console.log(`  Damage: ${ability.damage} | Range: ${ability.range} | AoE: ${ability.areaOfEffect}`);
    console.log(`  Status Effects: ${ability.statusEffects.map(e => e.type).join(', ') || 'None'}`);
  });

  // Thief abilities
  console.log('\n\nTHIEF ABILITIES:');
  const thiefAbilities = getAbilityForUnit('TH');
  thiefAbilities.forEach(ability => {
    console.log(`\n${ability.name} (Cooldown: ${ability.cooldown}ms)`);
    console.log(`  ${ability.description}`);
    console.log(`  Damage: ${ability.damage} | Range: ${ability.range} | AoE: ${ability.areaOfEffect}`);
    console.log(`  Status Effects: ${ability.statusEffects.map(e => e.type).join(', ') || 'None'}`);
  });

  // Kingthief abilities
  console.log('\n\nKINGTHIEF ABILITIES:');
  const kingthiefAbilities = getAbilityForUnit('KT');
  kingthiefAbilities.forEach(ability => {
    console.log(`\n${ability.name} (Cooldown: ${ability.cooldown}ms)`);
    console.log(`  ${ability.description}`);
    console.log(`  Damage: ${ability.damage} | Range: ${ability.range} | AoE: ${ability.areaOfEffect}`);
    console.log(`  Status Effects: ${ability.statusEffects.map(e => e.type).join(', ') || 'None'}`);
  });

  // Boss abilities
  console.log('\n\nBOSS ABILITIES:');
  const bossAbilities = [
    COMBAT_ABILITIES.BOSS_ROAR,
    COMBAT_ABILITIES.BOSS_SMASH,
    COMBAT_ABILITIES.BOSS_RAGE,
  ];
  bossAbilities.forEach(ability => {
    console.log(`\n${ability.name} (Cooldown: ${ability.cooldown}ms)`);
    console.log(`  ${ability.description}`);
    console.log(`  Damage: ${ability.damage} | Range: ${ability.range} | AoE: ${ability.areaOfEffect}`);
    console.log(`  Status Effects: ${ability.statusEffects.map(e => e.type).join(', ') || 'None'}`);
  });
}

// ============================================================================
// EXAMPLE 5: STATUS EFFECTS DEMONSTRATION
// ============================================================================

export function exampleStatusEffects() {
  console.log('\n=== EXAMPLE 5: Status Effects Demonstration ===\n');

  const combat = exampleCombatEventListeners();

  const hunterUnit: Unit = {
    type: 'H',
    hp: 3,
    maxHp: 3,
    row: 2,
    col: 2,
    abilities: ['Guard', 'Track', 'Snipe'],
    buffs: [],
    debuffs: [],
  };

  const thiefUnit: Unit = {
    type: 'TH',
    hp: 2,
    maxHp: 2,
    row: 2,
    col: 3,
    abilities: ['Ambush', 'Backstab'],
    buffs: [],
    debuffs: [],
  };

  const hunter = combat.createEntityFromUnit(hunterUnit, 'TRADER');
  const thief = combat.createEntityFromUnit(thiefUnit, 'THIEF');

  console.log('Initial State:');
  console.log(`Hunter: ${hunter.health}/${hunter.maxHealth} HP`);
  console.log(`Thief: ${thief.health}/${thief.maxHealth} HP\n`);

  // Apply various status effects
  console.log('--- Applying Status Effects ---\n');

  // Hunter uses Guard (Shield)
  console.log('Hunter uses Guard (applies SHIELD):');
  combat.useAbility(hunter, 'GUARD');
  console.log(`Active effects: ${hunter.statusEffects.map(e => `${e.type} (${e.duration}ms)`).join(', ')}\n`);

  // Thief uses Ambush (Stun)
  console.log('Thief uses Ambush (applies STUN):');
  combat.useAbility(thief, 'AMBUSH', hunter.position);
  console.log(`Hunter effects: ${hunter.statusEffects.map(e => `${e.type} (${e.duration}ms)`).join(', ')}\n`);

  // Thief uses Backstab (Bleed)
  console.log('Thief uses Backstab (applies BLEED):');
  combat.useAbility(thief, 'BACKSTAB', hunter.position);
  console.log(`Hunter effects: ${hunter.statusEffects.map(e => `${e.type} (${e.duration}ms)`).join(', ')}`);
  console.log(`Hunter HP: ${hunter.health}/${hunter.maxHealth}\n`);

  // Simulate time passage and effect ticks
  console.log('--- Simulating 1 second of combat ---\n');
  combat.update(1000);

  console.log(`Hunter HP after bleed ticks: ${hunter.health}/${hunter.maxHealth}`);
  console.log(`Remaining effects: ${hunter.statusEffects.map(e => `${e.type} (${e.duration}ms)`).join(', ')}\n`);

  return { combat, hunter, thief };
}

// ============================================================================
// EXAMPLE 6: BOSS FIGHT
// ============================================================================

export function exampleBossFight() {
  console.log('\n=== EXAMPLE 6: Boss Fight - Tiger Giry ===\n');

  const combat = exampleCombatEventListeners();

  // Create boss
  const tigerGiry: BossMonster = {
    type: 'TigerGiry',
    hp: 5,
    maxHp: 5,
    position: { row: 4, col: 4 },
    damage: 3,
    range: 2,
    movementPattern: 'random',
    rewards: {
      silk: 2,
      buffs: ['speed'],
    },
  };

  // Create party of heroes
  const hunter: Unit = {
    type: 'H',
    hp: 3,
    maxHp: 3,
    row: 3,
    col: 3,
    abilities: ['Guard', 'Snipe'],
    buffs: [],
    debuffs: [],
  };

  const trader: Unit = {
    type: 'TR',
    hp: 2,
    maxHp: 2,
    row: 3,
    col: 5,
    abilities: ['Rush', 'Shield Wall'],
    buffs: [],
    debuffs: [],
  };

  const boss = combat.createEntityFromBoss(tigerGiry);
  const hunterEntity = combat.createEntityFromUnit(hunter, 'TRADER');
  const traderEntity = combat.createEntityFromUnit(trader, 'TRADER');

  console.log('Boss Fight Begins!');
  console.log(`Tiger Giry: ${boss.health}/${boss.maxHealth} HP`);
  console.log(`Hunter: ${hunterEntity.health}/${hunterEntity.maxHealth} HP`);
  console.log(`Trader: ${traderEntity.health}/${traderEntity.maxHealth} HP\n`);

  // Turn 1: Boss uses Roar
  console.log('--- Turn 1: Boss Roar ---');
  combat.useAbility(boss, 'BOSS_ROAR');
  console.log(`Heroes are stunned and weakened!\n`);

  // Turn 2: Hunter activates Guard
  console.log('--- Turn 2: Hunter Guards ---');
  combat.useAbility(hunterEntity, 'GUARD');
  console.log(`Hunter shields up!\n`);

  // Turn 3: Boss uses Ground Smash
  console.log('--- Turn 3: Boss Ground Smash ---');
  combat.useAbility(boss, 'BOSS_SMASH', { row: 3, col: 4 });
  console.log(`Hunter HP: ${hunterEntity.health}/${hunterEntity.maxHealth}`);
  console.log(`Trader HP: ${traderEntity.health}/${traderEntity.maxHealth}\n`);

  // Turn 4: Hunter uses Snipe
  console.log('--- Turn 4: Hunter Snipes ---');
  combat.useAbility(hunterEntity, 'SNIPE', boss.position);
  console.log(`Boss HP: ${boss.health}/${boss.maxHealth}\n`);

  // Turn 5: Trader uses Rush
  console.log('--- Turn 5: Trader Rushes ---');
  combat.useAbility(traderEntity, 'RUSH', boss.position);
  console.log(`Boss HP: ${boss.health}/${boss.maxHealth}\n`);

  // Turn 6: Boss enrages
  console.log('--- Turn 6: Boss Enrages! ---');
  combat.useAbility(boss, 'BOSS_RAGE');
  console.log(`Boss is ENRAGED! Damage increased!\n`);

  console.log('Final Status:');
  console.log(`Boss HP: ${boss.health}/${boss.maxHealth}`);
  console.log(`Hunter HP: ${hunterEntity.health}/${hunterEntity.maxHealth}`);
  console.log(`Trader HP: ${traderEntity.health}/${traderEntity.maxHealth}`);

  return { combat, boss, hunterEntity, traderEntity };
}

// ============================================================================
// EXAMPLE 7: COMBO SYSTEM
// ============================================================================

export function exampleComboSystem() {
  console.log('\n=== EXAMPLE 7: Combo System ===\n');

  const combat = exampleCombatEventListeners();

  const thiefUnit: Unit = {
    type: 'TH',
    hp: 2,
    maxHp: 2,
    row: 3,
    col: 3,
    abilities: ['Backstab'],
    buffs: [],
    debuffs: [],
  };

  const traderUnit: Unit = {
    type: 'TR',
    hp: 2,
    maxHp: 2,
    row: 3,
    col: 4,
    abilities: [],
    buffs: [],
    debuffs: [],
  };

  const thief = combat.createEntityFromUnit(thiefUnit, 'THIEF');
  const trader = combat.createEntityFromUnit(traderUnit, 'TRADER');

  console.log('Thief building combo on Trader:\n');

  // Attack 1
  console.log('Attack 1:');
  setTimeout(() => {
    const result1 = combat.performAttack(thief, trader);
    console.log(`  Combo: x${thief.comboCounter} | Damage: ${result1?.totalDamage}`);
  }, 0);

  // Attack 2
  console.log('Attack 2 (600ms later):');
  setTimeout(() => {
    const result2 = combat.performAttack(thief, trader);
    console.log(`  Combo: x${thief.comboCounter} | Damage: ${result2?.totalDamage}`);
  }, 600);

  // Attack 3
  console.log('Attack 3 (1200ms later):');
  setTimeout(() => {
    const result3 = combat.performAttack(thief, trader);
    console.log(`  Combo: x${thief.comboCounter} | Damage: ${result3?.totalDamage}`);
  }, 1200);

  // Attack 4
  console.log('Attack 4 (1800ms later):');
  setTimeout(() => {
    const result4 = combat.performAttack(thief, trader);
    console.log(`  Combo: x${thief.comboCounter} | Damage: ${result4?.totalDamage}`);
  }, 1800);

  // Wait too long - combo breaks
  console.log('Attack 5 (4000ms later - combo breaks):');
  setTimeout(() => {
    const result5 = combat.performAttack(thief, trader);
    console.log(`  Combo: x${thief.comboCounter} | Damage: ${result5?.totalDamage}\n`);
  }, 4000);

  return { combat, thief, trader };
}

// ============================================================================
// EXAMPLE 8: MULTIPLAYER VALIDATION
// ============================================================================

export function exampleMultiplayerValidation() {
  console.log('\n=== EXAMPLE 8: Multiplayer Validation ===\n');

  const combat = createCombatSystem();

  const thiefUnit: Unit = {
    type: 'TH',
    hp: 2,
    maxHp: 2,
    row: 3,
    col: 3,
    abilities: ['Ambush'],
    buffs: [],
    debuffs: [],
  };

  const traderUnit: Unit = {
    type: 'TR',
    hp: 2,
    maxHp: 2,
    row: 5,
    col: 5,
    abilities: [],
    buffs: [],
    debuffs: [],
  };

  const thief = combat.createEntityFromUnit(thiefUnit, 'THIEF');
  const trader = combat.createEntityFromUnit(traderUnit, 'TRADER');

  console.log('Validating combat actions:\n');

  // Valid attack
  const validation1 = combat.validateCombatAction(thief.id, 'attack', trader.id);
  console.log('1. Attack enemy in range:', validation1);

  // Invalid - out of range
  const validation2 = combat.validateCombatAction(thief.id, 'attack', trader.id);
  console.log('2. Attack enemy out of range:', validation2);

  // Valid ability use
  const validation3 = combat.validateCombatAction(thief.id, 'ability', undefined, 'AMBUSH');
  console.log('3. Use Ambush ability:', validation3);

  // Invalid - on cooldown
  combat.useAbility(thief, 'AMBUSH', trader.position);
  const validation4 = combat.validateCombatAction(thief.id, 'ability', undefined, 'AMBUSH');
  console.log('4. Use Ambush again (on cooldown):', validation4);

  // Combat state hash for synchronization
  const stateHash = combat.getCombatStateHash();
  console.log('\nCombat state hash (for sync):', stateHash.substring(0, 50) + '...');

  return { combat, thief, trader };
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║  SILKROAD FIGHTS - COMBAT SYSTEM EXAMPLES     ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  exampleBasicCombatSetup();
  exampleAbilityShowcase();
  exampleStatusEffects();
  exampleBossFight();
  exampleComboSystem();
  exampleMultiplayerValidation();

  console.log('\n╔════════════════════════════════════════════════╗');
  console.log('║  All examples completed!                       ║');
  console.log('╚════════════════════════════════════════════════╝\n');
}
