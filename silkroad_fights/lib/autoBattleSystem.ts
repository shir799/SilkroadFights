/**
 * AUTO-BATTLE COMBAT SYSTEM
 * Fully automated combat with AI, abilities, and visual effects
 *
 * Features:
 * - Pathfinding AI (A* algorithm)
 * - Mana system (10 per attack, 20 per damage taken)
 * - Auto-ability casting at 100 mana
 * - Combat mechanics: Crits, Dodge, Armor, Lifesteal, AOE, DOT
 * - Silkroad-themed abilities for all tiers
 * - Smooth animations and visual effects
 */

import { Position } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type UnitTier = 1 | 2 | 3 | 4 | 5;
export type UnitClass =
  | 'BladeNovice' | 'BowNovice' | 'ForceNovice'
  | 'Blader' | 'Bowman' | 'Wizard'
  | 'Warrior' | 'Bard' | 'Cleric'
  | 'FireWizard' | 'IceWizard' | 'LightningWizard'
  | 'TigerGirl' | 'Phoenix' | 'Dragon';

export type DamageType = 'physical' | 'magical' | 'true';
export type TargetType = 'single' | 'aoe' | 'line' | 'bounce' | 'self' | 'ally';

export interface BattleUnit {
  id: string;
  class: UnitClass;
  tier: UnitTier;
  team: 'A' | 'B';

  // Position & Movement
  position: Position;
  targetPosition: Position | null;
  rotation: number; // For visual direction

  // Core Stats
  maxHp: number;
  currentHp: number;
  attackDamage: number;
  attackSpeed: number; // Attacks per second
  attackRange: number;
  movementSpeed: number; // Cells per second
  armor: number;
  magicResist: number;

  // Combat Stats
  critChance: number;
  critMultiplier: number;
  dodgeChance: number;
  lifesteal: number; // Percentage (0-1)

  // Mana System
  currentMana: number;
  maxMana: number;
  manaPerAttack: number;
  manaPerDamageTaken: number;

  // Ability
  ability: UnitAbility;
  lastAbilityTime: number;

  // Combat State
  currentTarget: string | null;
  lastAttackTime: number;
  isDead: boolean;

  // Status Effects
  statusEffects: StatusEffect[];

  // Special Properties
  hasFrontLine: boolean; // Tanks stay in front
  isRanged: boolean;

  // Phoenix special
  hasRevived?: boolean;
}

export interface UnitAbility {
  name: string;
  manaCost: number;
  cooldown: number;
  castTime: number;
  damage: number;
  damageType: DamageType;
  targetType: TargetType;
  range: number;
  aoeRadius: number;
  bounces: number; // For chain lightning

  // Special Effects
  heal: number;
  stun: number; // Duration in ms
  slow: number; // Percentage (0-1)
  burn: number; // Damage per second
  burnDuration: number;
  attackSpeedBuff: number; // Percentage
  buffDuration: number;
  armorBuff: number;
  revive: boolean;
  reviveHpPercent: number;
  taunt: boolean;

  // Visual
  animationName: string;
  particleEffect: string;
  soundEffect: string;
}

export interface StatusEffect {
  type: 'stun' | 'slow' | 'burn' | 'attackSpeedBuff' | 'armorBuff' | 'taunt';
  duration: number;
  value: number;
  source: string;
  startTime: number;
}

export interface DamageEvent {
  sourceId: string;
  targetId: string;
  damage: number;
  isCritical: boolean;
  isDodged: boolean;
  damageType: DamageType;
  position: Position;
  timestamp: number;
}

export interface AbilityEvent {
  casterId: string;
  abilityName: string;
  targetIds: string[];
  position: Position;
  timestamp: number;
}

export interface BattleEvent {
  type: 'damage' | 'heal' | 'ability' | 'death' | 'revive' | 'manaGain';
  timestamp: number;
  data: any;
}

export interface BattleState {
  units: BattleUnit[];
  events: BattleEvent[];
  startTime: number;
  currentTime: number;
  isFinished: boolean;
  winner: 'A' | 'B' | null;
}

// ============================================================================
// UNIT ABILITY DEFINITIONS (Silkroad Themed)
// ============================================================================

export const UNIT_ABILITIES: Record<UnitClass, UnitAbility> = {
  // TIER 1
  BladeNovice: {
    name: 'Slash',
    manaCost: 100,
    cooldown: 0,
    castTime: 300,
    damage: 150,
    damageType: 'physical',
    targetType: 'single',
    range: 1.5,
    aoeRadius: 0,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'slash_attack',
    particleEffect: 'slash_trail',
    soundEffect: 'blade_slash',
  },

  BowNovice: {
    name: 'Arrow Shot',
    manaCost: 100,
    cooldown: 0,
    castTime: 400,
    damage: 120,
    damageType: 'physical',
    targetType: 'single',
    range: 4,
    aoeRadius: 0,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'arrow_shot',
    particleEffect: 'arrow_projectile',
    soundEffect: 'bow_shoot',
  },

  ForceNovice: {
    name: 'Magic Bolt',
    manaCost: 100,
    cooldown: 0,
    castTime: 500,
    damage: 100,
    damageType: 'magical',
    targetType: 'single',
    range: 3,
    aoeRadius: 0,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'magic_bolt',
    particleEffect: 'magic_missile',
    soundEffect: 'magic_cast',
  },

  // TIER 2
  Blader: {
    name: 'Whirlwind',
    manaCost: 100,
    cooldown: 0,
    castTime: 600,
    damage: 200,
    damageType: 'physical',
    targetType: 'aoe',
    range: 2,
    aoeRadius: 2,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'whirlwind_spin',
    particleEffect: 'whirlwind_blades',
    soundEffect: 'whirlwind',
  },

  Bowman: {
    name: 'Multi-Shot',
    manaCost: 100,
    cooldown: 0,
    castTime: 700,
    damage: 150,
    damageType: 'physical',
    targetType: 'aoe',
    range: 5,
    aoeRadius: 3,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'multi_shot',
    particleEffect: 'arrow_rain',
    soundEffect: 'multi_arrow',
  },

  Wizard: {
    name: 'Fireball',
    manaCost: 100,
    cooldown: 0,
    castTime: 800,
    damage: 250,
    damageType: 'magical',
    targetType: 'aoe',
    range: 4,
    aoeRadius: 2.5,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'fireball_cast',
    particleEffect: 'fireball_explosion',
    soundEffect: 'fireball',
  },

  // TIER 3
  Warrior: {
    name: 'Taunt',
    manaCost: 100,
    cooldown: 0,
    castTime: 400,
    damage: 0,
    damageType: 'physical',
    targetType: 'aoe',
    range: 3,
    aoeRadius: 3,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 50,
    revive: false,
    reviveHpPercent: 0,
    taunt: true,
    animationName: 'warrior_taunt',
    particleEffect: 'taunt_aura',
    soundEffect: 'war_cry',
  },

  Bard: {
    name: 'Inspiring Song',
    manaCost: 100,
    cooldown: 0,
    castTime: 500,
    damage: 0,
    damageType: 'physical',
    targetType: 'ally',
    range: 5,
    aoeRadius: 5,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0.3,
    buffDuration: 5000,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'bard_song',
    particleEffect: 'music_notes',
    soundEffect: 'bard_song',
  },

  Cleric: {
    name: 'Holy Light',
    manaCost: 100,
    cooldown: 0,
    castTime: 600,
    damage: 0,
    damageType: 'magical',
    targetType: 'ally',
    range: 6,
    aoeRadius: 0,
    bounces: 0,
    heal: 300,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'holy_light',
    particleEffect: 'divine_beam',
    soundEffect: 'holy_heal',
  },

  // TIER 4
  FireWizard: {
    name: 'Meteor',
    manaCost: 100,
    cooldown: 0,
    castTime: 1200,
    damage: 500,
    damageType: 'magical',
    targetType: 'aoe',
    range: 6,
    aoeRadius: 3,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 50,
    burnDuration: 3000,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'meteor_fall',
    particleEffect: 'meteor_impact',
    soundEffect: 'meteor_crash',
  },

  IceWizard: {
    name: 'Blizzard',
    manaCost: 100,
    cooldown: 0,
    castTime: 1000,
    damage: 300,
    damageType: 'magical',
    targetType: 'aoe',
    range: 5,
    aoeRadius: 4,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0.5,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 4000,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'blizzard_cast',
    particleEffect: 'ice_storm',
    soundEffect: 'blizzard',
  },

  LightningWizard: {
    name: 'Chain Lightning',
    manaCost: 100,
    cooldown: 0,
    castTime: 800,
    damage: 400,
    damageType: 'magical',
    targetType: 'bounce',
    range: 5,
    aoeRadius: 0,
    bounces: 3,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'chain_lightning',
    particleEffect: 'lightning_arc',
    soundEffect: 'thunder',
  },

  // TIER 5
  TigerGirl: {
    name: 'Roar',
    manaCost: 100,
    cooldown: 0,
    castTime: 700,
    damage: 800,
    damageType: 'physical',
    targetType: 'aoe',
    range: 4,
    aoeRadius: 4,
    bounces: 0,
    heal: 0,
    stun: 2000,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'tiger_roar',
    particleEffect: 'roar_shockwave',
    soundEffect: 'tiger_roar',
  },

  Phoenix: {
    name: 'Rebirth',
    manaCost: 100,
    cooldown: 0,
    castTime: 0,
    damage: 0,
    damageType: 'magical',
    targetType: 'self',
    range: 0,
    aoeRadius: 0,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 0,
    burnDuration: 0,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: true,
    reviveHpPercent: 0.5,
    taunt: false,
    animationName: 'phoenix_rebirth',
    particleEffect: 'fire_resurrection',
    soundEffect: 'phoenix_cry',
  },

  Dragon: {
    name: 'Dragon Breath',
    manaCost: 100,
    cooldown: 0,
    castTime: 1000,
    damage: 1200,
    damageType: 'magical',
    targetType: 'line',
    range: 6,
    aoeRadius: 1.5,
    bounces: 0,
    heal: 0,
    stun: 0,
    slow: 0,
    burn: 100,
    burnDuration: 5000,
    attackSpeedBuff: 0,
    buffDuration: 0,
    armorBuff: 0,
    revive: false,
    reviveHpPercent: 0,
    taunt: false,
    animationName: 'dragon_breath',
    particleEffect: 'fire_beam',
    soundEffect: 'dragon_roar',
  },
};

// ============================================================================
// UNIT STAT TEMPLATES
// ============================================================================

const UNIT_STATS: Record<UnitClass, Partial<BattleUnit>> = {
  // TIER 1 - Basic units
  BladeNovice: {
    tier: 1,
    maxHp: 500,
    attackDamage: 50,
    attackSpeed: 1.0,
    attackRange: 1.5,
    movementSpeed: 2.5,
    armor: 10,
    magicResist: 5,
    critChance: 0.1,
    critMultiplier: 1.5,
    dodgeChance: 0.05,
    lifesteal: 0,
    hasFrontLine: true,
    isRanged: false,
  },

  BowNovice: {
    tier: 1,
    maxHp: 350,
    attackDamage: 40,
    attackSpeed: 1.2,
    attackRange: 4,
    movementSpeed: 2.8,
    armor: 5,
    magicResist: 5,
    critChance: 0.15,
    critMultiplier: 1.8,
    dodgeChance: 0.1,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  ForceNovice: {
    tier: 1,
    maxHp: 400,
    attackDamage: 45,
    attackSpeed: 0.8,
    attackRange: 3,
    movementSpeed: 2.3,
    armor: 5,
    magicResist: 15,
    critChance: 0.12,
    critMultiplier: 1.6,
    dodgeChance: 0.05,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  // TIER 2 - Advanced units
  Blader: {
    tier: 2,
    maxHp: 800,
    attackDamage: 80,
    attackSpeed: 1.1,
    attackRange: 1.5,
    movementSpeed: 2.7,
    armor: 20,
    magicResist: 10,
    critChance: 0.15,
    critMultiplier: 1.7,
    dodgeChance: 0.08,
    lifesteal: 0.1,
    hasFrontLine: true,
    isRanged: false,
  },

  Bowman: {
    tier: 2,
    maxHp: 600,
    attackDamage: 70,
    attackSpeed: 1.4,
    attackRange: 5,
    movementSpeed: 3.0,
    armor: 10,
    magicResist: 10,
    critChance: 0.20,
    critMultiplier: 2.0,
    dodgeChance: 0.12,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  Wizard: {
    tier: 2,
    maxHp: 550,
    attackDamage: 90,
    attackSpeed: 0.9,
    attackRange: 4,
    movementSpeed: 2.4,
    armor: 8,
    magicResist: 25,
    critChance: 0.18,
    critMultiplier: 1.8,
    dodgeChance: 0.06,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  // TIER 3 - Support units
  Warrior: {
    tier: 3,
    maxHp: 1500,
    attackDamage: 70,
    attackSpeed: 0.9,
    attackRange: 1.5,
    movementSpeed: 2.2,
    armor: 40,
    magicResist: 20,
    critChance: 0.10,
    critMultiplier: 1.5,
    dodgeChance: 0.05,
    lifesteal: 0.15,
    hasFrontLine: true,
    isRanged: false,
  },

  Bard: {
    tier: 3,
    maxHp: 700,
    attackDamage: 50,
    attackSpeed: 1.0,
    attackRange: 3,
    movementSpeed: 2.6,
    armor: 12,
    magicResist: 18,
    critChance: 0.08,
    critMultiplier: 1.4,
    dodgeChance: 0.1,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  Cleric: {
    tier: 3,
    maxHp: 800,
    attackDamage: 40,
    attackSpeed: 0.8,
    attackRange: 4,
    movementSpeed: 2.5,
    armor: 15,
    magicResist: 30,
    critChance: 0.05,
    critMultiplier: 1.3,
    dodgeChance: 0.08,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  // TIER 4 - Elite casters
  FireWizard: {
    tier: 4,
    maxHp: 900,
    attackDamage: 120,
    attackSpeed: 0.7,
    attackRange: 5,
    movementSpeed: 2.3,
    armor: 12,
    magicResist: 35,
    critChance: 0.22,
    critMultiplier: 2.0,
    dodgeChance: 0.07,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  IceWizard: {
    tier: 4,
    maxHp: 850,
    attackDamage: 100,
    attackSpeed: 0.8,
    attackRange: 5,
    movementSpeed: 2.4,
    armor: 15,
    magicResist: 40,
    critChance: 0.15,
    critMultiplier: 1.8,
    dodgeChance: 0.1,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  LightningWizard: {
    tier: 4,
    maxHp: 800,
    attackDamage: 130,
    attackSpeed: 1.0,
    attackRange: 5,
    movementSpeed: 2.8,
    armor: 10,
    magicResist: 38,
    critChance: 0.25,
    critMultiplier: 2.2,
    dodgeChance: 0.15,
    lifesteal: 0,
    hasFrontLine: false,
    isRanged: true,
  },

  // TIER 5 - Legendary units
  TigerGirl: {
    tier: 5,
    maxHp: 2000,
    attackDamage: 180,
    attackSpeed: 1.3,
    attackRange: 2,
    movementSpeed: 3.5,
    armor: 35,
    magicResist: 30,
    critChance: 0.30,
    critMultiplier: 2.5,
    dodgeChance: 0.20,
    lifesteal: 0.2,
    hasFrontLine: true,
    isRanged: false,
  },

  Phoenix: {
    tier: 5,
    maxHp: 1200,
    attackDamage: 150,
    attackSpeed: 1.1,
    attackRange: 4,
    movementSpeed: 3.2,
    armor: 20,
    magicResist: 50,
    critChance: 0.18,
    critMultiplier: 2.0,
    dodgeChance: 0.25,
    lifesteal: 0.15,
    hasFrontLine: false,
    isRanged: true,
  },

  Dragon: {
    tier: 5,
    maxHp: 3000,
    attackDamage: 200,
    attackSpeed: 0.8,
    attackRange: 5,
    movementSpeed: 2.5,
    armor: 50,
    magicResist: 60,
    critChance: 0.20,
    critMultiplier: 2.3,
    dodgeChance: 0.1,
    lifesteal: 0.25,
    hasFrontLine: true,
    isRanged: true,
  },
};

// ============================================================================
// AUTO-BATTLE ENGINE
// ============================================================================

export class AutoBattleEngine {
  private state: BattleState;
  private tickRate: number = 100; // 10 FPS for decision making
  private renderCallbacks: ((state: BattleState) => void)[] = [];

  constructor() {
    this.state = {
      units: [],
      events: [],
      startTime: Date.now(),
      currentTime: Date.now(),
      isFinished: false,
      winner: null,
    };
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  initializeBattle(teamA: UnitClass[], teamB: UnitClass[]): void {
    const units: BattleUnit[] = [];

    // Create Team A units
    teamA.forEach((unitClass, index) => {
      units.push(this.createUnit(unitClass, 'A', index, teamA.length));
    });

    // Create Team B units
    teamB.forEach((unitClass, index) => {
      units.push(this.createUnit(unitClass, 'B', index, teamB.length));
    });

    this.state.units = units;
    this.state.startTime = Date.now();
    this.state.currentTime = Date.now();
    this.state.isFinished = false;
    this.state.winner = null;
    this.state.events = [];
  }

  private createUnit(
    unitClass: UnitClass,
    team: 'A' | 'B',
    index: number,
    totalUnits: number
  ): BattleUnit {
    const template = UNIT_STATS[unitClass];
    const ability = UNIT_ABILITIES[unitClass];

    // Position units in formation
    const startRow = team === 'A' ? 2 : 7;
    const spacing = totalUnits > 3 ? 2 : 3;
    const startCol = 5 - Math.floor((totalUnits - 1) * spacing / 2);

    // Front line units go forward
    const rowOffset = template.hasFrontLine ? (team === 'A' ? 1 : -1) : 0;

    return {
      id: `${team}_${unitClass}_${index}`,
      class: unitClass,
      tier: template.tier!,
      team,

      position: {
        row: startRow + rowOffset,
        col: startCol + (index * spacing),
      },
      targetPosition: null,
      rotation: team === 'A' ? 90 : 270, // Face opponent

      maxHp: template.maxHp!,
      currentHp: template.maxHp!,
      attackDamage: template.attackDamage!,
      attackSpeed: template.attackSpeed!,
      attackRange: template.attackRange!,
      movementSpeed: template.movementSpeed!,
      armor: template.armor!,
      magicResist: template.magicResist!,

      critChance: template.critChance!,
      critMultiplier: template.critMultiplier!,
      dodgeChance: template.dodgeChance!,
      lifesteal: template.lifesteal!,

      currentMana: 0,
      maxMana: 100,
      manaPerAttack: 10,
      manaPerDamageTaken: 20,

      ability,
      lastAbilityTime: 0,

      currentTarget: null,
      lastAttackTime: 0,
      isDead: false,

      statusEffects: [],

      hasFrontLine: template.hasFrontLine!,
      isRanged: template.isRanged!,
    };
  }

  // ============================================================================
  // MAIN UPDATE LOOP
  // ============================================================================

  update(deltaTime: number): void {
    if (this.state.isFinished) return;

    this.state.currentTime += deltaTime;

    // Update all units
    this.state.units.forEach(unit => {
      if (unit.isDead) return;

      // Update status effects
      this.updateStatusEffects(unit, deltaTime);

      // AI Decision making
      this.updateUnitAI(unit, deltaTime);

      // Check if can attack
      this.updateCombat(unit, deltaTime);

      // Check if can cast ability
      this.updateAbility(unit, deltaTime);
    });

    // Remove old events (keep last 100)
    if (this.state.events.length > 100) {
      this.state.events = this.state.events.slice(-100);
    }

    // Check win condition
    this.checkWinCondition();

    // Notify render callbacks
    this.renderCallbacks.forEach(callback => callback(this.state));
  }

  // ============================================================================
  // AI SYSTEM
  // ============================================================================

  private updateUnitAI(unit: BattleUnit, deltaTime: number): void {
    // Find target if don't have one
    if (!unit.currentTarget || this.getUnitById(unit.currentTarget)?.isDead) {
      unit.currentTarget = this.findNearestEnemy(unit);
    }

    if (!unit.currentTarget) return;

    const target = this.getUnitById(unit.currentTarget);
    if (!target) return;

    const distance = this.getDistance(unit.position, target.position);

    // If in attack range, stop moving
    if (distance <= unit.attackRange) {
      unit.targetPosition = null;

      // Face target
      unit.rotation = this.getAngle(unit.position, target.position);
    } else {
      // Move towards target (simple pathfinding)
      const moveTarget = this.getKitingPosition(unit, target);
      unit.targetPosition = moveTarget;

      // Move unit
      this.moveUnit(unit, deltaTime);
    }
  }

  private findNearestEnemy(unit: BattleUnit): string | null {
    const enemies = this.state.units.filter(
      u => u.team !== unit.team && !u.isDead
    );

    if (enemies.length === 0) return null;

    // Prioritize low HP enemies for assassins
    if (unit.class === 'TigerGirl') {
      enemies.sort((a, b) => a.currentHp - b.currentHp);
      return enemies[0].id;
    }

    // Find nearest
    let nearest = enemies[0];
    let minDistance = this.getDistance(unit.position, nearest.position);

    for (const enemy of enemies) {
      const distance = this.getDistance(unit.position, enemy.position);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = enemy;
      }
    }

    return nearest.id;
  }

  private getKitingPosition(unit: BattleUnit, target: BattleUnit): Position {
    // Ranged units kite backward
    if (unit.isRanged && this.getDistance(unit.position, target.position) < unit.attackRange * 0.8) {
      const angle = this.getAngle(target.position, unit.position);
      return {
        row: unit.position.row + Math.sin(angle) * 0.5,
        col: unit.position.col + Math.cos(angle) * 0.5,
      };
    }

    // Move toward target
    const angle = this.getAngle(unit.position, target.position);
    return {
      row: unit.position.row + Math.sin(angle) * 0.3,
      col: unit.position.col + Math.cos(angle) * 0.3,
    };
  }

  private moveUnit(unit: BattleUnit, deltaTime: number): void {
    if (!unit.targetPosition) return;

    // Check for stun
    if (this.hasStatusEffect(unit, 'stun')) return;

    const speed = unit.movementSpeed * this.getSpeedModifier(unit);
    const dx = unit.targetPosition.col - unit.position.col;
    const dy = unit.targetPosition.row - unit.position.row;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.1) {
      unit.targetPosition = null;
      return;
    }

    const moveDistance = (speed * deltaTime) / 1000;
    const ratio = Math.min(moveDistance / distance, 1);

    unit.position.row += dy * ratio;
    unit.position.col += dx * ratio;

    // Keep in bounds
    unit.position.row = Math.max(0, Math.min(9, unit.position.row));
    unit.position.col = Math.max(0, Math.min(9, unit.position.col));
  }

  // ============================================================================
  // COMBAT SYSTEM
  // ============================================================================

  private updateCombat(unit: BattleUnit, deltaTime: number): void {
    if (!unit.currentTarget) return;

    const target = this.getUnitById(unit.currentTarget);
    if (!target || target.isDead) return;

    // Check if can attack
    const timeSinceLastAttack = this.state.currentTime - unit.lastAttackTime;
    const attackCooldown = 1000 / unit.attackSpeed;

    if (timeSinceLastAttack < attackCooldown) return;

    const distance = this.getDistance(unit.position, target.position);
    if (distance > unit.attackRange) return;

    // Check for stun
    if (this.hasStatusEffect(unit, 'stun')) return;

    // Perform attack
    this.performAttack(unit, target);
    unit.lastAttackTime = this.state.currentTime;
  }

  private performAttack(attacker: BattleUnit, target: BattleUnit): void {
    // Calculate damage
    let damage = attacker.attackDamage;

    // Attack speed buff
    const attackSpeedBuff = this.getStatusEffectValue(attacker, 'attackSpeedBuff');

    // Critical hit
    const isCritical = Math.random() < attacker.critChance;
    if (isCritical) {
      damage *= attacker.critMultiplier;
    }

    // Dodge check
    const isDodged = Math.random() < target.dodgeChance;
    if (isDodged) {
      this.addEvent({
        type: 'damage',
        timestamp: this.state.currentTime,
        data: {
          sourceId: attacker.id,
          targetId: target.id,
          damage: 0,
          isCritical: false,
          isDodged: true,
          damageType: 'physical',
          position: target.position,
        },
      });
      return;
    }

    // Apply armor
    const effectiveArmor = target.armor + this.getStatusEffectValue(target, 'armorBuff');
    const damageReduction = effectiveArmor / (effectiveArmor + 100);
    damage *= (1 - damageReduction);

    // Apply damage
    const finalDamage = Math.max(1, Math.floor(damage));
    target.currentHp = Math.max(0, target.currentHp - finalDamage);

    // Lifesteal
    if (attacker.lifesteal > 0) {
      const healAmount = Math.floor(finalDamage * attacker.lifesteal);
      attacker.currentHp = Math.min(attacker.maxHp, attacker.currentHp + healAmount);
      this.addEvent({
        type: 'heal',
        timestamp: this.state.currentTime,
        data: {
          unitId: attacker.id,
          amount: healAmount,
          position: attacker.position,
        },
      });
    }

    // Gain mana
    attacker.currentMana = Math.min(attacker.maxMana, attacker.currentMana + attacker.manaPerAttack);
    target.currentMana = Math.min(target.maxMana, target.currentMana + target.manaPerDamageTaken);

    this.addEvent({
      type: 'manaGain',
      timestamp: this.state.currentTime,
      data: {
        unitId: attacker.id,
        amount: attacker.manaPerAttack,
      },
    });

    this.addEvent({
      type: 'manaGain',
      timestamp: this.state.currentTime,
      data: {
        unitId: target.id,
        amount: target.manaPerDamageTaken,
      },
    });

    // Add damage event
    this.addEvent({
      type: 'damage',
      timestamp: this.state.currentTime,
      data: {
        sourceId: attacker.id,
        targetId: target.id,
        damage: finalDamage,
        isCritical,
        isDodged: false,
        damageType: 'physical',
        position: target.position,
      },
    });

    // Check for death
    if (target.currentHp <= 0) {
      this.handleUnitDeath(target, attacker);
    }
  }

  // ============================================================================
  // ABILITY SYSTEM
  // ============================================================================

  private updateAbility(unit: BattleUnit, deltaTime: number): void {
    // Special: Phoenix passive - revive on death
    if (unit.class === 'Phoenix' && unit.isDead && !unit.hasRevived) {
      if (unit.currentMana >= 100) {
        this.reviveUnit(unit);
        return;
      }
    }

    if (unit.currentMana < 100) return;

    // Check cooldown
    const timeSinceLastAbility = this.state.currentTime - unit.lastAbilityTime;
    if (timeSinceLastAbility < unit.ability.cooldown) return;

    // Check for stun
    if (this.hasStatusEffect(unit, 'stun')) return;

    // Cast ability
    this.castAbility(unit);
  }

  private castAbility(caster: BattleUnit): void {
    const ability = caster.ability;

    // Consume mana
    caster.currentMana = 0;
    caster.lastAbilityTime = this.state.currentTime;

    // Find targets
    const targets = this.findAbilityTargets(caster, ability);

    if (targets.length === 0 && ability.targetType !== 'self') return;

    // Apply ability effects
    targets.forEach(target => {
      // Damage
      if (ability.damage > 0 && target.team !== caster.team) {
        let damage = ability.damage;

        // Apply resistance
        if (ability.damageType === 'magical') {
          const reduction = target.magicResist / (target.magicResist + 100);
          damage *= (1 - reduction);
        } else if (ability.damageType === 'physical') {
          const reduction = target.armor / (target.armor + 100);
          damage *= (1 - reduction);
        }

        const finalDamage = Math.max(1, Math.floor(damage));
        target.currentHp = Math.max(0, target.currentHp - finalDamage);

        // Gain mana from taking damage
        target.currentMana = Math.min(target.maxMana, target.currentMana + target.manaPerDamageTaken);

        this.addEvent({
          type: 'damage',
          timestamp: this.state.currentTime,
          data: {
            sourceId: caster.id,
            targetId: target.id,
            damage: finalDamage,
            isCritical: false,
            isDodged: false,
            damageType: ability.damageType,
            position: target.position,
          },
        });

        // Check for death
        if (target.currentHp <= 0) {
          this.handleUnitDeath(target, caster);
        }
      }

      // Heal
      if (ability.heal > 0 && target.team === caster.team) {
        const healAmount = ability.heal;
        target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);

        this.addEvent({
          type: 'heal',
          timestamp: this.state.currentTime,
          data: {
            unitId: target.id,
            amount: healAmount,
            position: target.position,
          },
        });
      }

      // Status effects
      if (ability.stun > 0) {
        this.applyStatusEffect(target, {
          type: 'stun',
          duration: ability.stun,
          value: 1,
          source: caster.id,
          startTime: this.state.currentTime,
        });
      }

      if (ability.slow > 0) {
        this.applyStatusEffect(target, {
          type: 'slow',
          duration: ability.buffDuration,
          value: ability.slow,
          source: caster.id,
          startTime: this.state.currentTime,
        });
      }

      if (ability.burn > 0) {
        this.applyStatusEffect(target, {
          type: 'burn',
          duration: ability.burnDuration,
          value: ability.burn,
          source: caster.id,
          startTime: this.state.currentTime,
        });
      }

      if (ability.attackSpeedBuff > 0) {
        this.applyStatusEffect(target, {
          type: 'attackSpeedBuff',
          duration: ability.buffDuration,
          value: ability.attackSpeedBuff,
          source: caster.id,
          startTime: this.state.currentTime,
        });
      }

      if (ability.armorBuff > 0) {
        this.applyStatusEffect(caster, {
          type: 'armorBuff',
          duration: ability.buffDuration || 5000,
          value: ability.armorBuff,
          source: caster.id,
          startTime: this.state.currentTime,
        });
      }

      if (ability.taunt) {
        // Force enemies to target this unit
        const enemies = this.state.units.filter(
          u => u.team !== caster.team && !u.isDead && this.getDistance(u.position, caster.position) <= ability.range
        );
        enemies.forEach(enemy => {
          enemy.currentTarget = caster.id;
        });
      }
    });

    // Add ability event
    this.addEvent({
      type: 'ability',
      timestamp: this.state.currentTime,
      data: {
        casterId: caster.id,
        abilityName: ability.name,
        targetIds: targets.map(t => t.id),
        position: targets[0]?.position || caster.position,
      },
    });
  }

  private findAbilityTargets(caster: BattleUnit, ability: UnitAbility): BattleUnit[] {
    const { targetType, range, aoeRadius } = ability;

    if (targetType === 'self') {
      return [caster];
    }

    // Find primary target
    let primaryTarget: BattleUnit | null = null;

    if (targetType === 'ally') {
      // Find lowest HP ally for heals
      const allies = this.state.units
        .filter(u => u.team === caster.team && !u.isDead && u.id !== caster.id)
        .filter(u => this.getDistance(u.position, caster.position) <= range)
        .sort((a, b) => a.currentHp - b.currentHp);

      if (allies.length === 0) return [];

      // For Bard, target all allies in range
      if (caster.class === 'Bard') {
        return allies;
      }

      primaryTarget = allies[0];
      return [primaryTarget];
    }

    // Find enemy target
    const enemies = this.state.units.filter(
      u => u.team !== caster.team && !u.isDead
    );

    if (enemies.length === 0) return [];

    // Find nearest or prioritize target
    const enemiesInRange = enemies.filter(
      e => this.getDistance(e.position, caster.position) <= range
    );

    if (enemiesInRange.length === 0) {
      // Target nearest even if out of range (will move closer)
      primaryTarget = enemies.reduce((nearest, enemy) => {
        const dist = this.getDistance(caster.position, enemy.position);
        const nearestDist = this.getDistance(caster.position, nearest.position);
        return dist < nearestDist ? enemy : nearest;
      });
    } else {
      primaryTarget = enemiesInRange[0];
    }

    if (!primaryTarget) return [];

    // Single target
    if (targetType === 'single') {
      return [primaryTarget];
    }

    // AOE
    if (targetType === 'aoe') {
      return enemies.filter(
        e => this.getDistance(e.position, primaryTarget!.position) <= aoeRadius
      );
    }

    // Line (Dragon Breath)
    if (targetType === 'line') {
      const angle = this.getAngle(caster.position, primaryTarget.position);
      return enemies.filter(e => {
        const targetAngle = this.getAngle(caster.position, e.position);
        const angleDiff = Math.abs(angle - targetAngle);
        const distance = this.getDistance(caster.position, e.position);
        return angleDiff < 0.3 && distance <= range;
      });
    }

    // Bounce (Chain Lightning)
    if (targetType === 'bounce') {
      const targets = [primaryTarget];
      let current = primaryTarget;

      for (let i = 0; i < ability.bounces; i++) {
        const candidates = enemies.filter(
          e => !targets.includes(e) && this.getDistance(current.position, e.position) <= 3
        );

        if (candidates.length === 0) break;

        // Find nearest
        const next = candidates.reduce((nearest, enemy) => {
          const dist = this.getDistance(current.position, enemy.position);
          const nearestDist = this.getDistance(current.position, nearest.position);
          return dist < nearestDist ? enemy : nearest;
        });

        targets.push(next);
        current = next;
      }

      return targets;
    }

    return [];
  }

  // ============================================================================
  // STATUS EFFECTS
  // ============================================================================

  private updateStatusEffects(unit: BattleUnit, deltaTime: number): void {
    const now = this.state.currentTime;

    // Process burn damage
    unit.statusEffects
      .filter(e => e.type === 'burn')
      .forEach(effect => {
        // Apply burn damage every second
        const elapsed = now - effect.startTime;
        const ticks = Math.floor(elapsed / 1000);
        const lastTick = Math.floor((elapsed - deltaTime) / 1000);

        if (ticks > lastTick) {
          const damage = effect.value;
          unit.currentHp = Math.max(0, unit.currentHp - damage);

          this.addEvent({
            type: 'damage',
            timestamp: now,
            data: {
              sourceId: effect.source,
              targetId: unit.id,
              damage,
              isCritical: false,
              isDodged: false,
              damageType: 'magical',
              position: unit.position,
            },
          });

          if (unit.currentHp <= 0) {
            this.handleUnitDeath(unit, this.getUnitById(effect.source) || unit);
          }
        }
      });

    // Remove expired effects
    unit.statusEffects = unit.statusEffects.filter(
      effect => now - effect.startTime < effect.duration
    );
  }

  private applyStatusEffect(unit: BattleUnit, effect: StatusEffect): void {
    // Check if already has this effect from same source
    const existing = unit.statusEffects.findIndex(
      e => e.type === effect.type && e.source === effect.source
    );

    if (existing >= 0) {
      // Refresh duration
      unit.statusEffects[existing] = effect;
    } else {
      unit.statusEffects.push(effect);
    }
  }

  private hasStatusEffect(unit: BattleUnit, type: StatusEffect['type']): boolean {
    const now = this.state.currentTime;
    return unit.statusEffects.some(
      e => e.type === type && now - e.startTime < e.duration
    );
  }

  private getStatusEffectValue(unit: BattleUnit, type: StatusEffect['type']): number {
    const now = this.state.currentTime;
    const effect = unit.statusEffects.find(
      e => e.type === type && now - e.startTime < e.duration
    );
    return effect ? effect.value : 0;
  }

  private getSpeedModifier(unit: BattleUnit): number {
    let modifier = 1.0;

    const slowValue = this.getStatusEffectValue(unit, 'slow');
    if (slowValue > 0) {
      modifier *= (1 - slowValue);
    }

    return modifier;
  }

  // ============================================================================
  // DEATH & REVIVAL
  // ============================================================================

  private handleUnitDeath(unit: BattleUnit, killer: BattleUnit): void {
    unit.isDead = true;
    unit.currentTarget = null;

    this.addEvent({
      type: 'death',
      timestamp: this.state.currentTime,
      data: {
        unitId: unit.id,
        killerId: killer.id,
        position: unit.position,
      },
    });
  }

  private reviveUnit(unit: BattleUnit): void {
    const reviveHp = Math.floor(unit.maxHp * unit.ability.reviveHpPercent);
    unit.currentHp = reviveHp;
    unit.currentMana = 0;
    unit.isDead = false;
    unit.hasRevived = true;

    this.addEvent({
      type: 'revive',
      timestamp: this.state.currentTime,
      data: {
        unitId: unit.id,
        hp: reviveHp,
        position: unit.position,
      },
    });
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.col - pos1.col;
    const dy = pos2.row - pos1.row;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private getAngle(from: Position, to: Position): number {
    return Math.atan2(to.row - from.row, to.col - from.col);
  }

  private getUnitById(id: string): BattleUnit | undefined {
    return this.state.units.find(u => u.id === id);
  }

  private addEvent(event: BattleEvent): void {
    this.state.events.push(event);
  }

  private checkWinCondition(): void {
    const teamAAlive = this.state.units.some(u => u.team === 'A' && !u.isDead);
    const teamBAlive = this.state.units.some(u => u.team === 'B' && !u.isDead);

    if (!teamAAlive) {
      this.state.isFinished = true;
      this.state.winner = 'B';
    } else if (!teamBAlive) {
      this.state.isFinished = true;
      this.state.winner = 'A';
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  getState(): BattleState {
    return this.state;
  }

  isFinished(): boolean {
    return this.state.isFinished;
  }

  getWinner(): 'A' | 'B' | null {
    return this.state.winner;
  }

  onRender(callback: (state: BattleState) => void): void {
    this.renderCallbacks.push(callback);
  }

  getRecentEvents(count: number = 10): BattleEvent[] {
    return this.state.events.slice(-count);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createAutoBattle(teamA: UnitClass[], teamB: UnitClass[]): AutoBattleEngine {
  const engine = new AutoBattleEngine();
  engine.initializeBattle(teamA, teamB);
  return engine;
}

export function getUnitAbility(unitClass: UnitClass): UnitAbility {
  return UNIT_ABILITIES[unitClass];
}

export function getUnitStats(unitClass: UnitClass): Partial<BattleUnit> {
  return UNIT_STATS[unitClass];
}
