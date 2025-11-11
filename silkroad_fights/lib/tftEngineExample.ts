/**
 * TFT ENGINE USAGE EXAMPLES
 * Demonstrates how to use the Silkroad Fights TFT Auto-Battler Engine
 */

import {
  TFTEngine,
  UNIT_DEFINITIONS,
  TRAIT_DEFINITIONS,
  ECONOMY_CONFIG,
  calculateIncome,
  getRoundType,
} from './tftEngine';

// ============================================================================
// EXAMPLE 1: Basic Game Setup
// ============================================================================

export function example1_BasicSetup() {
  console.log('=== Example 1: Basic Game Setup ===\n');

  // Create a new game with deterministic seed
  const game = new TFTEngine(42);
  const player = game.getCurrentPlayer();

  console.log('Game Started!');
  console.log(`Player: ${player.name}`);
  console.log(`HP: ${player.hp}/${player.maxHp}`);
  console.log(`Gold: ${player.gold}`);
  console.log(`Level: ${player.level} (Max ${player.level} units)`);
  console.log(`XP: ${player.xp}/${player.xpToNextLevel}\n`);

  // Show initial shop
  console.log('Initial Shop:');
  player.shop.forEach((slot, idx) => {
    if (slot.unit) {
      console.log(
        `  ${idx + 1}. ${slot.unit.name} (Tier ${slot.unit.tier}) - ${slot.unit.cost} gold`
      );
    }
  });
}

// ============================================================================
// EXAMPLE 2: Buying and Placing Units
// ============================================================================

export function example2_BuyingUnits() {
  console.log('\n=== Example 2: Buying and Placing Units ===\n');

  const game = new TFTEngine(123);
  const player = game.getCurrentPlayer();

  // Give player some gold for demo
  player.gold = 10;

  console.log(`Starting Gold: ${player.gold}`);

  // Buy first 3 units from shop
  for (let i = 0; i < 3; i++) {
    const shopSlot = player.shop[i];
    if (shopSlot.unit) {
      console.log(`Buying ${shopSlot.unit.name} for ${shopSlot.unit.cost} gold...`);
      const success = game.buyUnit(i);
      if (success) {
        console.log(`  ✓ Success! Gold remaining: ${player.gold}`);
      } else {
        console.log(`  ✗ Failed!`);
      }
    }
  }

  console.log(`\nBench (${player.bench.length} units):`);
  player.bench.forEach((unit) => {
    const def = UNIT_DEFINITIONS[unit.definitionId];
    console.log(`  - ${def.name} (${unit.stars}★, Tier ${def.tier})`);
  });

  // Place units on board
  console.log('\nPlacing units on board...');
  const positions = [
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 2, y: 3 },
  ];

  player.bench.slice(0, 3).forEach((unit, idx) => {
    const success = game.placeUnit(unit.instanceId, positions[idx]);
    if (success) {
      console.log(`  ✓ Placed ${UNIT_DEFINITIONS[unit.definitionId].name} at (${positions[idx].x}, ${positions[idx].y})`);
    }
  });

  console.log(`\nBoard: ${player.board.length} units`);
  console.log(`Active Traits: ${player.activeTraits.length}`);
  player.activeTraits.forEach((trait) => {
    const def = TRAIT_DEFINITIONS[trait.traitId];
    console.log(`  - ${def.name} (${trait.activeThreshold})`);
  });
}

// ============================================================================
// EXAMPLE 3: Combat Simulation
// ============================================================================

export function example3_Combat() {
  console.log('\n=== Example 3: Combat Simulation ===\n');

  const game = new TFTEngine(456);
  const player = game.getCurrentPlayer();

  // Setup: Give player gold and buy units
  player.gold = 20;

  // Buy and place 3 units
  for (let i = 0; i < 3; i++) {
    game.buyUnit(i);
  }

  const positions = [
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
  ];

  player.bench.forEach((unit, idx) => {
    if (idx < positions.length) {
      game.placeUnit(unit.instanceId, positions[idx]);
    }
  });

  console.log('Your Team:');
  player.board.forEach((unit) => {
    const def = UNIT_DEFINITIONS[unit.definitionId];
    console.log(`  - ${def.name} (${unit.currentHp}/${unit.stats.maxHp} HP, ${def.attackType})`);
  });

  const state = game.getState();
  console.log(`\nRound ${state.round}: ${state.roundType.toUpperCase()}`);
  console.log('Starting combat...\n');

  // Start combat
  game.startCombat();

  // Show results
  console.log('Combat Results:');
  console.log(`Player HP: ${player.hp}/${player.maxHp}`);
  console.log(`Win Streak: ${player.winStreak}`);
  console.log(`Loss Streak: ${player.lossStreak}`);

  console.log('\nSurviving Units:');
  player.board.forEach((unit) => {
    if (unit.isAlive) {
      const def = UNIT_DEFINITIONS[unit.definitionId];
      console.log(`  - ${def.name} (${unit.currentHp}/${unit.stats.maxHp} HP)`);
    }
  });
}

// ============================================================================
// EXAMPLE 4: Full Game Loop (5 Rounds)
// ============================================================================

export function example4_FullGameLoop() {
  console.log('\n=== Example 4: Full Game Loop (5 Rounds) ===\n');

  const game = new TFTEngine(789);

  for (let round = 1; round <= 5; round++) {
    const state = game.getState();
    const player = game.getCurrentPlayer();

    console.log(`\n${'='.repeat(60)}`);
    console.log(`ROUND ${state.round} - ${getRoundType(state.round).toUpperCase()}`);
    console.log(`${'='.repeat(60)}`);

    console.log(`HP: ${player.hp}/${player.maxHp} | Gold: ${player.gold} | Level: ${player.level}`);
    console.log(`XP: ${player.xp}/${player.xpToNextLevel} | Win Streak: ${player.winStreak}`);

    // Strategy: Buy units if we have gold
    if (player.gold >= 3 && player.bench.length < 9) {
      console.log('\n[Shop Phase]');
      let bought = 0;
      for (let i = 0; i < player.shop.length; i++) {
        const slot = player.shop[i];
        if (slot.unit && player.gold >= slot.unit.cost && player.bench.length < 9) {
          game.buyUnit(i);
          console.log(`  Bought: ${slot.unit.name} (${slot.unit.cost}g)`);
          bought++;
        }
      }
      if (bought === 0) {
        console.log('  No purchases made');
      }
    }

    // Place units on board (simple front-line strategy)
    while (player.bench.length > 0 && player.board.length < player.level) {
      const unit = player.bench[0];
      const pos = {
        x: 2 + player.board.length,
        y: 2,
      };
      game.placeUnit(unit.instanceId, pos);
    }

    console.log(`\n[Board] ${player.board.length} units deployed`);
    if (player.activeTraits.length > 0) {
      console.log('[Traits]');
      player.activeTraits.forEach((trait) => {
        const def = TRAIT_DEFINITIONS[trait.traitId];
        const effect = def.effects.find((e) => e.threshold === trait.activeThreshold);
        console.log(`  - ${def.name} (${trait.activeThreshold}): ${effect?.description}`);
      });
    }

    // Combat
    console.log('\n[Combat Phase]');
    game.startCombat();

    if (player.winStreak > 0) {
      console.log(`  ✓ VICTORY! Win Streak: ${player.winStreak}`);
    } else if (player.lossStreak > 0) {
      console.log(`  ✗ Defeat... Loss Streak: ${player.lossStreak}`);
    }

    // Next round
    if (state.round < 5) {
      game.nextRound();
      const income = calculateIncome(player);
      console.log(`\n[Income] +${income} gold`);
    }
  }

  const finalPlayer = game.getCurrentPlayer();
  console.log(`\n${'='.repeat(60)}`);
  console.log('GAME SUMMARY');
  console.log(`${'='.repeat(60)}`);
  console.log(`Final HP: ${finalPlayer.hp}/${finalPlayer.maxHp}`);
  console.log(`Final Gold: ${finalPlayer.gold}`);
  console.log(`Final Level: ${finalPlayer.level}`);
  console.log(`Rounds Won: ${finalPlayer.roundsWon}`);
  console.log(`Rounds Lost: ${finalPlayer.roundsLost}`);
}

// ============================================================================
// EXAMPLE 5: Building a Synergy Comp (Force Mastery)
// ============================================================================

export function example5_SynergyBuilding() {
  console.log('\n=== Example 5: Building 6 Force Mastery ===\n');

  const game = new TFTEngine(999);
  const player = game.getCurrentPlayer();

  // Cheat for demo: give resources
  player.gold = 100;
  player.level = 8;
  player.xp = 80;

  // Target force units
  const targetUnits = [
    'force_novice',
    'wizard',
    'bard',
    'cleric',
    'fire_wizard',
    'ice_wizard',
  ];

  console.log('Target Composition: 6 Force Mastery');
  console.log('Looking for units: ' + targetUnits.map((id) => UNIT_DEFINITIONS[id].name).join(', '));
  console.log('\n');

  // Buy specific units (simulate finding them in shop)
  let unitsAdded = 0;
  for (const unitId of targetUnits) {
    const def = UNIT_DEFINITIONS[unitId];

    // Create unit manually for demo
    player.bench.push({
      instanceId: `${unitId}_demo_${unitsAdded}`,
      definitionId: unitId,
      stars: 1,
      position: { x: 0, y: 0 },
      stats: { ...def.baseStats },
      currentHp: def.baseStats.hp,
      currentMana: 0,
      items: [],
      team: 'player',
      isAlive: true,
      target: null,
      attackCooldown: 0,
      abilityCooldown: 0,
    });

    unitsAdded++;
  }

  // Place all units
  const positions = [
    { x: 1, y: 2 },
    { x: 2, y: 2 },
    { x: 3, y: 2 },
    { x: 1, y: 3 },
    { x: 2, y: 3 },
    { x: 3, y: 3 },
  ];

  for (let i = 0; i < Math.min(player.bench.length, positions.length); i++) {
    const unit = player.bench[i];
    game.placeUnit(unit.instanceId, positions[i]);
  }

  console.log('Board Composition:');
  player.board.forEach((unit, idx) => {
    const def = UNIT_DEFINITIONS[unit.definitionId];
    console.log(`  ${idx + 1}. ${def.name} - Traits: ${def.traits.join(', ')}`);
  });

  console.log('\n✨ Active Synergies:');
  player.activeTraits.forEach((trait) => {
    const def = TRAIT_DEFINITIONS[trait.traitId];
    const effect = def.effects.find((e) => e.threshold === trait.activeThreshold);
    console.log(`  ⚡ ${def.name} (${trait.units.length}/${trait.activeThreshold})`);
    console.log(`     Effect: ${effect?.description}`);
  });

  // Check for Force Mastery
  const forceMastery = player.activeTraits.find((t) => t.traitId === 'force_mastery');
  if (forceMastery && forceMastery.activeThreshold === 6) {
    console.log('\n🎯 SUCCESS! 6 Force Mastery Active!');
    console.log('   All magic damage increased by 60%!');
  }
}

// ============================================================================
// EXAMPLE 6: Economy Strategy (Interest Farming)
// ============================================================================

export function example6_EconomyStrategy() {
  console.log('\n=== Example 6: Economy Strategy (Interest) ===\n');

  const game = new TFTEngine(1111);
  const player = game.getCurrentPlayer();

  console.log('Strategy: Save to 50 gold for maximum interest\n');

  // Give starting gold
  player.gold = 10;

  for (let round = 1; round <= 10; round++) {
    const state = game.getState();

    console.log(`Round ${round}:`);
    console.log(`  Gold: ${player.gold}`);

    const interest = Math.min(Math.floor(player.gold / 10), ECONOMY_CONFIG.MAX_INTEREST);
    console.log(`  Interest: ${interest} (1g per 10g, max 5)`);

    const income = calculateIncome(player);
    console.log(`  Total Income: ${income}`);

    // Strategy: Only spend above 50
    if (player.gold > 50) {
      const excess = player.gold - 50;
      console.log(`  → Spending ${excess}g (keeping 50 for interest)`);
      player.gold = 50;
    } else {
      console.log(`  → Saving (below 50)`);
    }

    // Simulate round end
    game.nextRound();
    console.log(`  New Gold: ${player.gold}\n`);
  }

  console.log('Result: Maximized income through interest!');
  console.log(`Final Gold: ${player.gold}`);
}

// ============================================================================
// EXAMPLE 7: 3-Star Upgrade System
// ============================================================================

export function example7_ThreeStarUpgrade() {
  console.log('\n=== Example 7: 3-Star Upgrade System ===\n');

  const game = new TFTEngine(2222);
  const player = game.getCurrentPlayer();

  player.gold = 50;

  const targetUnit = UNIT_DEFINITIONS.blade_novice;
  console.log(`Goal: Create 3-Star ${targetUnit.name}\n`);

  console.log('Step 1: Buy 3 copies → 2-Star');
  for (let i = 0; i < 3; i++) {
    player.bench.push({
      instanceId: `blade_novice_${i}`,
      definitionId: 'blade_novice',
      stars: 1,
      position: { x: 0, y: 0 },
      stats: { ...targetUnit.baseStats },
      currentHp: targetUnit.baseStats.hp,
      currentMana: 0,
      items: [],
      team: 'player',
      isAlive: true,
      target: null,
      attackCooldown: 0,
      abilityCooldown: 0,
    });
  }

  // Trigger upgrade check
  const upgradeSystem = new (require('./tftEngine').UpgradeSystem)();
  player.bench = upgradeSystem.checkForUpgrades(player.bench);

  console.log(`  Bench: ${player.bench.length} unit(s)`);
  if (player.bench[0].stars === 2) {
    console.log(`  ✓ Upgraded to 2-Star!`);
    console.log(`    HP: ${player.bench[0].stats.maxHp} (2x base)`);
    console.log(`    ATK: ${player.bench[0].stats.attack} (2x base)`);
  }

  console.log('\nStep 2: Buy 6 more copies → 3× 2-Star');
  for (let i = 3; i < 9; i++) {
    player.bench.push({
      instanceId: `blade_novice_${i}`,
      definitionId: 'blade_novice',
      stars: 1,
      position: { x: 0, y: 0 },
      stats: { ...targetUnit.baseStats },
      currentHp: targetUnit.baseStats.hp,
      currentMana: 0,
      items: [],
      team: 'player',
      isAlive: true,
      target: null,
      attackCooldown: 0,
      abilityCooldown: 0,
    });
  }

  player.bench = upgradeSystem.checkForUpgrades(player.bench);
  console.log(`  Bench: ${player.bench.length} unit(s)`);

  console.log('\nStep 3: Auto-combine 3× 2-Star → 3-Star');
  player.bench = upgradeSystem.checkForUpgrades(player.bench);

  if (player.bench.length === 1 && player.bench[0].stars === 3) {
    console.log(`  ✓ Upgraded to 3-Star!`);
    console.log(`    HP: ${player.bench[0].stats.maxHp} (4x base)`);
    console.log(`    ATK: ${player.bench[0].stats.attack} (4x base)`);
    console.log(`\n  🌟 ${targetUnit.name} is now MAXIMUM POWER! 🌟`);
  }

  console.log(`\nTotal Cost: 9 gold (9× ${targetUnit.cost}g)`);
  console.log(`Sell Value: 9 gold (returns full investment)`);
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  example1_BasicSetup();
  example2_BuyingUnits();
  example3_Combat();
  example4_FullGameLoop();
  example5_SynergyBuilding();
  example6_EconomyStrategy();
  example7_ThreeStarUpgrade();

  console.log('\n\n' + '='.repeat(60));
  console.log('All examples completed!');
  console.log('='.repeat(60));
}

// Uncomment to run when executed directly
// runAllExamples();
