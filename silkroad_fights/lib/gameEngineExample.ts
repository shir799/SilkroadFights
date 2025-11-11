/**
 * Example Usage of the Silkroad Fights Game Engine
 * This file demonstrates how to use the new real-time game architecture
 */

import { GameEngine } from './gameEngine';
import { PlayerAction, CombatEvent } from './newTypes';

// ============================================================================
// EXAMPLE 1: Basic Game Setup
// ============================================================================

export function example1_BasicSetup() {
  console.log('=== Example 1: Basic Game Setup ===');

  // Create a new game instance
  const game = new GameEngine('game-001');

  // Add two players with their roles
  const player1Id = 'player-alice';
  const player2Id = 'player-bob';

  game.addPlayer(player1Id, 'TRADER', 'Alice');
  game.addPlayer(player2Id, 'THIEF', 'Bob');

  console.log('✓ Game created with 2 players');
  console.log('  - Player 1 (Alice): TRADER');
  console.log('  - Player 2 (Bob): THIEF');

  return game;
}

// ============================================================================
// EXAMPLE 2: Spawning Units
// ============================================================================

export function example2_SpawningUnits() {
  console.log('\n=== Example 2: Spawning Units ===');

  const game = example1_BasicSetup();
  const player1Id = 'player-alice';
  const player2Id = 'player-bob';

  // Spawn units for each player
  const traderWarriorId = game.spawnUnit(player1Id, 'TRADER_WARRIOR', { row: 0, col: 0 });
  const traderArcherId = game.spawnUnit(player1Id, 'TRADER_ARCHER', { row: 0, col: 1 });
  const thiefScoutId = game.spawnUnit(player2Id, 'THIEF_SCOUT', { row: 9, col: 9 });
  const thiefBanditId = game.spawnUnit(player2Id, 'THIEF_BANDIT', { row: 9, col: 8 });

  console.log('✓ Units spawned:');
  console.log(`  - Trader Warrior: ${traderWarriorId}`);
  console.log(`  - Trader Archer: ${traderArcherId}`);
  console.log(`  - Thief Scout: ${thiefScoutId}`);
  console.log(`  - Thief Bandit: ${thiefBanditId}`);

  return { game, units: { traderWarriorId, traderArcherId, thiefScoutId, thiefBanditId } };
}

// ============================================================================
// EXAMPLE 3: Player Control Validation (CRITICAL FEATURE)
// ============================================================================

export function example3_PlayerControlValidation() {
  console.log('\n=== Example 3: Player Control Validation ===');

  const { game, units } = example2_SpawningUnits();
  const player1Id = 'player-alice'; // TRADER
  const player2Id = 'player-bob'; // THIEF

  // ✓ VALID: Player 1 controls their own TRADER unit
  const validAction1: PlayerAction = {
    type: 'MOVE_UNIT',
    playerId: player1Id,
    unitId: units.traderWarriorId,
    targetPosition: { row: 1, col: 0 },
    timestamp: Date.now(),
  };

  const result1 = game.processAction(validAction1);
  console.log('✓ Player 1 moving their own unit:', result1.valid ? 'ALLOWED' : 'DENIED');

  // ✗ INVALID: Player 1 tries to control Player 2's unit
  const invalidAction1: PlayerAction = {
    type: 'MOVE_UNIT',
    playerId: player1Id,
    unitId: units.thiefScoutId, // This belongs to player 2!
    targetPosition: { row: 8, col: 9 },
    timestamp: Date.now(),
  };

  const result2 = game.processAction(invalidAction1);
  console.log('✗ Player 1 trying to control Player 2\'s unit:', result2.valid ? 'ALLOWED' : 'DENIED');
  if (!result2.valid) {
    console.log(`  Error: ${result2.error}`);
  }

  // ✓ VALID: Player 2 controls their own THIEF unit
  const validAction2: PlayerAction = {
    type: 'MOVE_UNIT',
    playerId: player2Id,
    unitId: units.thiefScoutId,
    targetPosition: { row: 8, col: 9 },
    timestamp: Date.now(),
  };

  const result3 = game.processAction(validAction2);
  console.log('✓ Player 2 moving their own unit:', result3.valid ? 'ALLOWED' : 'DENIED');

  console.log('\n💡 Key Takeaway: Players can ONLY control their own units!');
}

// ============================================================================
// EXAMPLE 4: Event System
// ============================================================================

export function example4_EventSystem() {
  console.log('\n=== Example 4: Event System ===');

  const { game, units } = example2_SpawningUnits();
  const player1Id = 'player-alice';

  // Subscribe to combat events
  const unsubscribe = game.events.on((event: CombatEvent) => {
    switch (event.type) {
      case 'UNIT_MOVED':
        console.log(`📍 Unit moved from (${event.fromPosition.row},${event.fromPosition.col}) to (${event.toPosition.row},${event.toPosition.col})`);
        break;
      case 'ATTACK_HIT':
        console.log(`⚔️  Attack hit! Damage: ${event.damage}`);
        break;
      case 'ATTACK_MISSED':
        console.log(`❌ Attack missed!`);
        break;
      case 'DAMAGE_DEALT':
        console.log(`💥 Damage dealt: ${event.damage}, Remaining HP: ${event.remainingHp}`);
        break;
      case 'UNIT_DIED':
        console.log(`💀 Unit died!${event.droppedGold ? ' (dropped gold)' : ''}`);
        break;
    }
  });

  // Move a unit to trigger an event
  const moveAction: PlayerAction = {
    type: 'MOVE_UNIT',
    playerId: player1Id,
    unitId: units.traderWarriorId,
    targetPosition: { row: 1, col: 0 },
    timestamp: Date.now(),
  };

  game.processAction(moveAction);

  // Cleanup
  unsubscribe();

  console.log('\n💡 Events allow you to react to game changes in real-time!');
}

// ============================================================================
// EXAMPLE 5: Real-time Game Loop
// ============================================================================

export function example5_RealTimeGameLoop() {
  console.log('\n=== Example 5: Real-time Game Loop ===');

  const game = example1_BasicSetup();

  // Subscribe to state changes
  let tickCount = 0;
  const unsubscribe = game.stateChanged.on((state) => {
    tickCount++;
    if (tickCount % 30 === 0) { // Log every 30 ticks (1 second at 30 fps)
      console.log(`⏱️  Game time: ${Math.floor(state.currentTime / 1000)}s, Tick: ${tickCount}`);
    }
  });

  // Start the game loop
  game.start();
  console.log('✓ Game loop started (30 ticks per second)');

  // Run for 3 seconds then stop
  setTimeout(() => {
    game.stop();
    unsubscribe();
    console.log('✓ Game loop stopped');
    console.log(`  Total ticks: ${tickCount}`);
    console.log('\n💡 The game runs in real-time, not turn-based!');
  }, 3000);
}

// ============================================================================
// EXAMPLE 6: Combat System
// ============================================================================

export function example6_CombatSystem() {
  console.log('\n=== Example 6: Combat System ===');

  const { game, units } = example2_SpawningUnits();
  const player1Id = 'player-alice';
  const player2Id = 'player-bob';

  // Move units close to each other
  game.processAction({
    type: 'MOVE_UNIT',
    playerId: player1Id,
    unitId: units.traderWarriorId,
    targetPosition: { row: 4, col: 4 },
    timestamp: Date.now(),
  });

  game.processAction({
    type: 'MOVE_UNIT',
    playerId: player2Id,
    unitId: units.thiefScoutId,
    targetPosition: { row: 5, col: 4 },
    timestamp: Date.now(),
  });

  console.log('✓ Units positioned for combat');

  // Subscribe to combat events
  game.events.on((event: CombatEvent) => {
    if (event.type === 'ATTACK_HIT') {
      console.log(`⚔️  Attack! Damage: ${event.damage}`);
    } else if (event.type === 'DAMAGE_DEALT') {
      console.log(`💥 HP: ${event.remainingHp}`);
    }
  });

  // Wait for movement cooldown, then attack
  setTimeout(() => {
    const attackAction: PlayerAction = {
      type: 'ATTACK_UNIT',
      playerId: player1Id,
      unitId: units.traderWarriorId,
      targetUnitId: units.thiefScoutId,
      timestamp: Date.now(),
    };

    const result = game.processAction(attackAction);
    console.log('Attack result:', result.valid ? 'SUCCESS' : result.error);

    // Try to attack too soon (cooldown)
    setTimeout(() => {
      const result2 = game.processAction(attackAction);
      console.log('Second attack (too soon):', result2.valid ? 'SUCCESS' : result2.error);
    }, 100);

  }, 500);
}

// ============================================================================
// EXAMPLE 7: Complete Game Session
// ============================================================================

export function example7_CompleteGameSession() {
  console.log('\n=== Example 7: Complete Game Session ===');

  const game = new GameEngine('complete-game');

  // Setup players
  const aliceId = 'alice';
  const bobId = 'bob';

  game.addPlayer(aliceId, 'TRADER', 'Alice the Trader');
  game.addPlayer(bobId, 'THIEF', 'Bob the Bandit');

  // Spawn units
  const aliceWarrior = game.spawnUnit(aliceId, 'TRADER_WARRIOR', { row: 0, col: 0 });
  const bobBandit = game.spawnUnit(bobId, 'THIEF_BANDIT', { row: 9, col: 9 });

  console.log('✓ Game session created');
  console.log('  Players:', Array.from(game.getGameState().players.values()).map(p => p.name));
  console.log('  Units:', game.getGameState().units.size);

  // Event logging
  game.events.on((event) => {
    console.log(`[Event] ${event.type} at ${event.gameTime}ms`);
  });

  // Start game loop
  game.start();

  // Simulate gameplay
  setTimeout(() => {
    // Alice moves
    game.processAction({
      type: 'MOVE_UNIT',
      playerId: aliceId,
      unitId: aliceWarrior,
      targetPosition: { row: 1, col: 0 },
      timestamp: Date.now(),
    });
  }, 1000);

  setTimeout(() => {
    // Bob moves
    game.processAction({
      type: 'MOVE_UNIT',
      playerId: bobId,
      unitId: bobBandit,
      targetPosition: { row: 8, col: 9 },
      timestamp: Date.now(),
    });
  }, 2000);

  // Cleanup after 5 seconds
  setTimeout(() => {
    game.stop();
    console.log('\n✓ Game session ended');
    console.log('  Final game time:', Math.floor(game.getGameState().currentTime / 1000), 'seconds');
    console.log('  Total events:', game.getGameState().recentEvents.length);
  }, 5000);
}

// ============================================================================
// RUN ALL EXAMPLES
// ============================================================================

export function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║   Silkroad Fights - Game Engine Examples                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Synchronous examples
  example1_BasicSetup();
  example2_SpawningUnits();
  example3_PlayerControlValidation();
  example4_EventSystem();

  // Asynchronous examples (commented out to avoid conflicts)
  // Uncomment one at a time to test:

  // example5_RealTimeGameLoop();
  // example6_CombatSystem();
  // example7_CompleteGameSession();

  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   Examples Complete!                                      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
}

// Uncomment to run:
// runAllExamples();
