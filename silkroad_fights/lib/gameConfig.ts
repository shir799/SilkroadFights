/**
 * Game Configuration and Constants
 * Centralized configuration for Silkroad Fights
 */

import { GameConfig } from './newTypes';

// ============================================================================
// CORE GAME CONFIGURATION
// ============================================================================

export const GAME_CONFIG: GameConfig = {
  boardWidth: 10,
  boardHeight: 10,
  tickRate: 30, // 30 updates per second (33.33ms per tick)
  maxPlayers: 2,
};

// ============================================================================
// TIMING CONSTANTS (in milliseconds)
// ============================================================================

export const TIMING = {
  // Animation durations
  ATTACK_DURATION: 300,
  MOVE_DURATION: 200,
  DEATH_DURATION: 500,
  ABILITY_CAST_DURATION: 400,
  DAMAGE_FLASH_DURATION: 150,

  // Cooldowns
  BASIC_ATTACK_COOLDOWN: 1000,
  MOVEMENT_COOLDOWN: 300,
  ABILITY_COOLDOWN: 2000,

  // Game events
  SILK_SPAWN_INTERVAL: 30000, // 30 seconds
  BOSS_SPAWN_INTERVAL: 120000, // 2 minutes
  BUFF_TICK_INTERVAL: 1000, // 1 second

  // Player action rate limiting
  MAX_ACTIONS_PER_SECOND: 10,
  ACTION_THROTTLE_WINDOW: 1000,
};

// ============================================================================
// COMBAT PARAMETERS
// ============================================================================

export const COMBAT = {
  // Base damage values
  BASE_ATTACK_DAMAGE: 10,
  CRITICAL_HIT_MULTIPLIER: 1.5,
  CRITICAL_HIT_CHANCE: 0.15, // 15%

  // Range and movement
  DEFAULT_ATTACK_RANGE: 1, // adjacent cells
  RANGED_ATTACK_RANGE: 3,
  DEFAULT_MOVEMENT_SPEED: 2, // cells per second

  // Defense and damage reduction
  DEFENSE_DAMAGE_REDUCTION: 0.01, // 1% per defense point
  MAX_DAMAGE_REDUCTION: 0.75, // Maximum 75% damage reduction

  // Miss chance
  BASE_MISS_CHANCE: 0.05, // 5% base miss chance
};

// ============================================================================
// UNIT CONFIGURATIONS
// ============================================================================

export const UNIT_CONFIGS = {
  TRADER_WARRIOR: {
    maxHp: 100,
    attackDamage: 15,
    attackRange: 1,
    movementSpeed: 2,
    attackSpeed: 1, // 1 attack per second
    defense: 10,
  },
  TRADER_ARCHER: {
    maxHp: 70,
    attackDamage: 12,
    attackRange: 3,
    movementSpeed: 2.5,
    attackSpeed: 1.2,
    defense: 5,
  },
  TRADER_GUARD: {
    maxHp: 150,
    attackDamage: 10,
    attackRange: 1,
    movementSpeed: 1.5,
    attackSpeed: 0.8,
    defense: 20,
  },
  THIEF_SCOUT: {
    maxHp: 60,
    attackDamage: 8,
    attackRange: 1,
    movementSpeed: 3.5,
    attackSpeed: 1.5,
    defense: 3,
  },
  THIEF_BANDIT: {
    maxHp: 90,
    attackDamage: 18,
    attackRange: 1,
    movementSpeed: 2.2,
    attackSpeed: 1.1,
    defense: 7,
  },
  THIEF_ASSASSIN: {
    maxHp: 75,
    attackDamage: 22,
    attackRange: 1,
    movementSpeed: 3,
    attackSpeed: 0.9,
    defense: 5,
  },
};

// ============================================================================
// BOSS CONFIGURATIONS
// ============================================================================

export const BOSS_CONFIGS = {
  TigerGiry: {
    maxHp: 300,
    attackDamage: 25,
    attackRange: 1,
    movementSpeed: 1.8,
    attackSpeed: 0.8,
    defense: 15,
    movementPattern: 'random' as const,
    rewards: {
      silk: 50,
      buffs: ['tiger_strength'],
    },
  },
  SkeletoKing: {
    maxHp: 400,
    attackDamage: 20,
    attackRange: 2,
    movementSpeed: 1.2,
    attackSpeed: 0.6,
    defense: 25,
    movementPattern: 'stationary' as const,
    rewards: {
      silk: 75,
      buffs: ['skeleton_armor'],
    },
  },
  Murucha: {
    maxHp: 250,
    attackDamage: 30,
    attackRange: 1,
    movementSpeed: 2.5,
    attackSpeed: 1.2,
    defense: 10,
    movementPattern: 'area' as const,
    rewards: {
      silk: 60,
      buffs: ['murucha_speed'],
    },
  },
};

// ============================================================================
// ABILITY CONFIGURATIONS
// ============================================================================

export const ABILITY_CONFIGS = {
  DASH: {
    name: 'Dash',
    cooldown: 5000,
    duration: 200,
    cost: 10, // silk cost
    range: 3,
  },
  SHIELD_WALL: {
    name: 'Shield Wall',
    cooldown: 15000,
    duration: 5000,
    cost: 20,
    defenseBonus: 50,
  },
  POWER_STRIKE: {
    name: 'Power Strike',
    cooldown: 8000,
    duration: 300,
    cost: 15,
    damageMultiplier: 2.0,
  },
  SMOKE_BOMB: {
    name: 'Smoke Bomb',
    cooldown: 12000,
    duration: 3000,
    cost: 15,
    evasionBonus: 0.5, // 50% evasion
  },
  TRAP: {
    name: 'Trap',
    cooldown: 10000,
    duration: 20000,
    cost: 10,
    immobilizeDuration: 3000,
  },
  HEAL: {
    name: 'Heal',
    cooldown: 20000,
    duration: 0,
    cost: 25,
    healAmount: 50,
  },
};

// ============================================================================
// BUFF/DEBUFF CONFIGURATIONS
// ============================================================================

export const BUFF_CONFIGS = {
  tiger_strength: {
    duration: 30000,
    damageBonus: 10,
  },
  skeleton_armor: {
    duration: 30000,
    defenseBonus: 15,
  },
  murucha_speed: {
    duration: 30000,
    speedBonus: 1.5,
  },
  speed_boost: {
    duration: 10000,
    speedBonus: 2.0,
  },
  damage_boost: {
    duration: 10000,
    damageBonus: 15,
  },
  invulnerability: {
    duration: 2000,
    invulnerable: true,
  },
};

export const DEBUFF_CONFIGS = {
  slow: {
    duration: 5000,
    speedReduction: 0.5,
  },
  weakened: {
    duration: 8000,
    damageReduction: 0.3,
  },
  immobilized: {
    duration: 3000,
    cannotMove: true,
  },
  stunned: {
    duration: 2000,
    cannotAct: true,
  },
  poisoned: {
    duration: 10000,
    damagePerTick: 5,
    tickInterval: 1000,
  },
};

// ============================================================================
// RESOURCE CONFIGURATIONS
// ============================================================================

export const RESOURCES = {
  SILK_VALUE: 10,
  GOLD_VALUE: 5,
  GOLD_DROP_CHANCE: 0.3, // 30% chance to drop gold on death
  STARTING_SILK: 100,
  SILK_WIN_THRESHOLD: 1000,
  GOLD_DELIVERY_VALUE: 50, // Silk earned per gold delivered
};

// ============================================================================
// EVENT SYSTEM CONFIGURATION
// ============================================================================

export const EVENT_CONFIG = {
  MAX_EVENT_HISTORY: 100, // Keep last 100 events
  EVENT_REPLAY_BUFFER_SIZE: 1000,
  BROADCAST_BATCH_SIZE: 10, // Send events in batches of 10
};

// ============================================================================
// VALIDATION RULES
// ============================================================================

export const VALIDATION = {
  // Action rate limiting
  MAX_ACTIONS_PER_SECOND: 10,
  ACTION_WINDOW_MS: 1000,

  // Position validation
  MIN_BOARD_ROW: 0,
  MIN_BOARD_COL: 0,
  MAX_BOARD_ROW: GAME_CONFIG.boardHeight - 1,
  MAX_BOARD_COL: GAME_CONFIG.boardWidth - 1,

  // Ownership validation
  STRICT_OWNERSHIP_CHECK: true,
  ALLOW_CROSS_ROLE_ACTIONS: false,
};

// ============================================================================
// DEBUG AND DEVELOPMENT
// ============================================================================

export const DEBUG = {
  ENABLE_VERBOSE_LOGGING: false,
  LOG_ALL_EVENTS: false,
  LOG_VALIDATION_FAILURES: true,
  SHOW_PERFORMANCE_METRICS: false,
  ENABLE_CHEATS: false,
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get unit configuration by type
 */
export function getUnitConfig(unitType: string) {
  const config = UNIT_CONFIGS[unitType as keyof typeof UNIT_CONFIGS];
  if (!config) {
    throw new Error(`Unknown unit type: ${unitType}`);
  }
  return config;
}

/**
 * Get boss configuration by type
 */
export function getBossConfig(bossType: 'TigerGiry' | 'SkeletoKing' | 'Murucha') {
  const config = BOSS_CONFIGS[bossType];
  if (!config) {
    throw new Error(`Unknown boss type: ${bossType}`);
  }
  return config;
}

/**
 * Get ability configuration by name
 */
export function getAbilityConfig(abilityName: string) {
  const config = ABILITY_CONFIGS[abilityName as keyof typeof ABILITY_CONFIGS];
  if (!config) {
    throw new Error(`Unknown ability: ${abilityName}`);
  }
  return config;
}

/**
 * Calculate damage after defense
 */
export function calculateDamageAfterDefense(baseDamage: number, defense: number): number {
  const reduction = Math.min(
    defense * COMBAT.DEFENSE_DAMAGE_REDUCTION,
    COMBAT.MAX_DAMAGE_REDUCTION
  );
  return Math.max(1, Math.floor(baseDamage * (1 - reduction)));
}

/**
 * Check if attack is a critical hit
 */
export function rollCriticalHit(): boolean {
  return Math.random() < COMBAT.CRITICAL_HIT_CHANCE;
}

/**
 * Check if attack misses
 */
export function rollMiss(): boolean {
  return Math.random() < COMBAT.BASE_MISS_CHANCE;
}

/**
 * Calculate distance between two positions
 */
export function calculateDistance(pos1: { row: number; col: number }, pos2: { row: number; col: number }): number {
  return Math.max(Math.abs(pos1.row - pos2.row), Math.abs(pos1.col - pos2.col));
}

/**
 * Check if position is in range
 */
export function isInRange(pos1: { row: number; col: number }, pos2: { row: number; col: number }, range: number): boolean {
  return calculateDistance(pos1, pos2) <= range;
}

/**
 * Validate position is on board
 */
export function isValidPosition(row: number, col: number): boolean {
  return (
    row >= VALIDATION.MIN_BOARD_ROW &&
    row <= VALIDATION.MAX_BOARD_ROW &&
    col >= VALIDATION.MIN_BOARD_COL &&
    col <= VALIDATION.MAX_BOARD_COL
  );
}
