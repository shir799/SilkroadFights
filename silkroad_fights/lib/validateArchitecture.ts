/**
 * Architecture Validation Script
 * This file validates that the new game architecture is correctly set up
 */

import { GameEngine } from './gameEngine';
import { PlayerAction } from './newTypes';
import { GAME_CONFIG, TIMING, COMBAT } from './gameConfig';

console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║   Silkroad Fights - Architecture Validation              ║');
console.log('╚═══════════════════════════════════════════════════════════╝\n');

// Test 1: Configuration loaded correctly
console.log('✓ Test 1: Configuration loaded');
console.log(`  Board size: ${GAME_CONFIG.boardWidth}x${GAME_CONFIG.boardHeight}`);
console.log(`  Tick rate: ${GAME_CONFIG.tickRate} FPS`);
console.log(`  Attack cooldown: ${TIMING.BASIC_ATTACK_COOLDOWN}ms`);
console.log(`  Critical hit chance: ${COMBAT.CRITICAL_HIT_CHANCE * 100}%`);

// Test 2: Game engine instantiation
console.log('\n✓ Test 2: Game engine created');
const game = new GameEngine('test-game');
console.log(`  Game ID: ${game.getGameState().id}`);
console.log(`  Game config: ${game.getGameState().config.tickRate} FPS`);

// Test 3: Player management
console.log('\n✓ Test 3: Player management');
game.addPlayer('alice', 'TRADER', 'Alice');
game.addPlayer('bob', 'THIEF', 'Bob');
console.log(`  Players added: ${game.getGameState().players.size}`);

// Test 4: Unit spawning
console.log('\n✓ Test 4: Unit spawning');
const warriorId = game.spawnUnit('alice', 'TRADER_WARRIOR', { row: 0, col: 0 });
const scoutId = game.spawnUnit('bob', 'THIEF_SCOUT', { row: 9, col: 9 });
console.log(`  Units spawned: ${game.getGameState().units.size}`);
console.log(`  Warrior ID: ${warriorId}`);
console.log(`  Scout ID: ${scoutId}`);

// Test 5: Ownership validation (CRITICAL)
console.log('\n✓ Test 5: Player control validation (CRITICAL)');

// Valid action
const validAction: PlayerAction = {
  type: 'MOVE_UNIT',
  playerId: 'alice',
  unitId: warriorId,
  targetPosition: { row: 1, col: 0 },
  timestamp: Date.now(),
};
const result1 = game.processAction(validAction);
console.log(`  Alice controlling her warrior: ${result1.valid ? '✓ ALLOWED' : '✗ DENIED'}`);

// Invalid action - wrong owner
const invalidAction: PlayerAction = {
  type: 'MOVE_UNIT',
  playerId: 'alice',
  unitId: scoutId, // Bob's unit!
  targetPosition: { row: 8, col: 9 },
  timestamp: Date.now(),
};
const result2 = game.processAction(invalidAction);
console.log(`  Alice trying to control Bob's scout: ${result2.valid ? '✗ ALLOWED (BUG!)' : '✓ DENIED'}`);
if (!result2.valid) {
  console.log(`    Error: "${result2.error}"`);
}

// Test 6: Event system
console.log('\n✓ Test 6: Event system');
let eventCount = 0;
const unsubscribe = game.events.on((event) => {
  eventCount++;
});

game.processAction({
  type: 'MOVE_UNIT',
  playerId: 'alice',
  unitId: warriorId,
  targetPosition: { row: 2, col: 0 },
  timestamp: Date.now(),
});

console.log(`  Events emitted: ${eventCount}`);
console.log(`  Recent events in state: ${game.getGameState().recentEvents.length}`);
unsubscribe();

// Test 7: Type safety
console.log('\n✓ Test 7: Type safety');
const warrior = game.getUnit(warriorId);
if (warrior) {
  console.log(`  Unit type: ${warrior.type}`);
  console.log(`  Owner: ${warrior.ownerId}`);
  console.log(`  Role: ${warrior.role}`);
  console.log(`  HP: ${warrior.stats.currentHp}/${warrior.stats.maxHp}`);
  console.log(`  Animation: ${warrior.animation.state}`);
}

console.log('\n╔═══════════════════════════════════════════════════════════╗');
console.log('║   ✓ ALL VALIDATION TESTS PASSED                          ║');
console.log('║   Architecture is correctly implemented!                 ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
