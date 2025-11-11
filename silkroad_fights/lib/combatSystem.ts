/**
 * SILKROAD FIGHTS - REAL-TIME COMBAT SYSTEM
 *
 * A comprehensive real-time combat system featuring:
 * - Hitbox detection and collision system
 * - Damage calculation with critical hits
 * - Combo system for chained attacks
 * - Special abilities with cooldowns
 * - Status effects (Stun, Slow, Bleed, Shield, Speed boost)
 * - Combat events for animation triggers
 * - Multiplayer validation support
 */

import { Unit, Position, BossMonster, GameState } from './types';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface Hitbox {
  position: Position;
  radius: number;
  width: number;
  height: number;
  rotation: number;
}

export interface CombatEntity {
  id: string;
  position: Position;
  velocity: { x: number; y: number };
  hitbox: Hitbox;
  health: number;
  maxHealth: number;
  defense: number;
  attackPower: number;
  criticalChance: number;
  criticalMultiplier: number;
  statusEffects: StatusEffect[];
  activeAbilities: ActiveAbility[];
  comboCounter: number;
  lastAttackTime: number;
  team: 'TRADER' | 'THIEF' | 'BOSS';
  unitType: string;
}

export interface StatusEffect {
  type: StatusEffectType;
  duration: number;
  intensity: number;
  tickRate: number;
  lastTick: number;
  source: string;
  stackable: boolean;
  currentStacks: number;
  maxStacks: number;
}

export type StatusEffectType =
  | 'STUN'
  | 'SLOW'
  | 'BLEED'
  | 'SHIELD'
  | 'SPEED_BOOST'
  | 'POISON'
  | 'BURN'
  | 'FROZEN'
  | 'INVISIBLE'
  | 'INVULNERABLE'
  | 'ENRAGED'
  | 'WEAKENED';

export interface ActiveAbility {
  id: string;
  name: string;
  cooldownRemaining: number;
  isActive: boolean;
  duration: number;
  startTime: number;
}

export interface CombatAbility {
  id: string;
  name: string;
  cooldown: number;
  damage: number;
  range: number;
  areaOfEffect: number;
  castTime: number;
  energyCost: number;
  statusEffects: Partial<StatusEffect>[];
  animationTrigger: string;
  unitTypes: string[];
  description: string;
}

export interface DamageResult {
  totalDamage: number;
  isCritical: boolean;
  isBlocked: boolean;
  isDodged: boolean;
  damageType: 'PHYSICAL' | 'MAGICAL' | 'TRUE';
  comboMultiplier: number;
  statusEffectsApplied: StatusEffect[];
}

export interface CombatEvent {
  type: CombatEventType;
  timestamp: number;
  attacker: CombatEntity;
  target: CombatEntity | null;
  damage?: DamageResult;
  ability?: CombatAbility;
  position: Position;
  animationTrigger: string;
  soundEffect?: string;
}

export type CombatEventType =
  | 'ATTACK_START'
  | 'HIT'
  | 'CRITICAL_HIT'
  | 'BLOCK'
  | 'DODGE'
  | 'KILL'
  | 'ABILITY_CAST'
  | 'STATUS_APPLIED'
  | 'STATUS_EXPIRED'
  | 'COMBO_BREAK'
  | 'COMBO_MILESTONE';

export type CombatEventCallback = (event: CombatEvent) => void;

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

const COMBAT_CONFIG = {
  COMBO_TIMEOUT: 2000, // 2 seconds to maintain combo
  COMBO_MULTIPLIERS: [1.0, 1.15, 1.3, 1.5, 1.75, 2.0], // Combo damage multipliers
  MAX_COMBO: 5,
  BASE_CRITICAL_CHANCE: 0.15, // 15%
  BASE_CRITICAL_MULTIPLIER: 1.5,
  BASE_DODGE_CHANCE: 0.1, // 10%
  BASE_BLOCK_CHANCE: 0.05, // 5%
  HITBOX_PRECISION: 0.1, // Collision detection precision
  DAMAGE_VARIANCE: 0.1, // ±10% damage variance
  ATTACK_COOLDOWN: 500, // 500ms between attacks
  ANIMATION_FRAME_DURATION: 16.67, // 60 FPS
};

// Status effect templates
const STATUS_EFFECT_TEMPLATES: Record<StatusEffectType, Partial<StatusEffect>> = {
  STUN: {
    type: 'STUN',
    duration: 1500,
    intensity: 1,
    tickRate: 0,
    stackable: false,
    maxStacks: 1,
  },
  SLOW: {
    type: 'SLOW',
    duration: 3000,
    intensity: 0.5, // 50% speed reduction
    tickRate: 0,
    stackable: true,
    maxStacks: 3,
  },
  BLEED: {
    type: 'BLEED',
    duration: 5000,
    intensity: 5, // 5 damage per tick
    tickRate: 1000, // Every 1 second
    stackable: true,
    maxStacks: 5,
  },
  SHIELD: {
    type: 'SHIELD',
    duration: 4000,
    intensity: 50, // Absorbs 50 damage
    tickRate: 0,
    stackable: false,
    maxStacks: 1,
  },
  SPEED_BOOST: {
    type: 'SPEED_BOOST',
    duration: 3000,
    intensity: 1.5, // 150% speed
    tickRate: 0,
    stackable: false,
    maxStacks: 1,
  },
  POISON: {
    type: 'POISON',
    duration: 6000,
    intensity: 3,
    tickRate: 1000,
    stackable: true,
    maxStacks: 3,
  },
  BURN: {
    type: 'BURN',
    duration: 4000,
    intensity: 8,
    tickRate: 500,
    stackable: false,
    maxStacks: 1,
  },
  FROZEN: {
    type: 'FROZEN',
    duration: 2000,
    intensity: 1,
    tickRate: 0,
    stackable: false,
    maxStacks: 1,
  },
  INVISIBLE: {
    type: 'INVISIBLE',
    duration: 5000,
    intensity: 1,
    tickRate: 0,
    stackable: false,
    maxStacks: 1,
  },
  INVULNERABLE: {
    type: 'INVULNERABLE',
    duration: 2000,
    intensity: 1,
    tickRate: 0,
    stackable: false,
    maxStacks: 1,
  },
  ENRAGED: {
    type: 'ENRAGED',
    duration: 5000,
    intensity: 1.5, // 150% damage
    tickRate: 0,
    stackable: false,
    maxStacks: 1,
  },
  WEAKENED: {
    type: 'WEAKENED',
    duration: 4000,
    intensity: 0.7, // 70% damage
    tickRate: 0,
    stackable: true,
    maxStacks: 2,
  },
};

// ============================================================================
// ABILITY DEFINITIONS
// ============================================================================

export const COMBAT_ABILITIES: Record<string, CombatAbility> = {
  // TRADER ABILITIES
  RUSH: {
    id: 'RUSH',
    name: 'Rush',
    cooldown: 8000,
    damage: 15,
    range: 3,
    areaOfEffect: 0,
    castTime: 300,
    energyCost: 20,
    statusEffects: [{ type: 'SPEED_BOOST', duration: 2000, intensity: 1.8 }],
    animationTrigger: 'trader_rush',
    unitTypes: ['TR'],
    description: 'Charge forward with increased speed, dealing damage to enemies in path',
  },
  SHIELD_WALL: {
    id: 'SHIELD_WALL',
    name: 'Shield Wall',
    cooldown: 15000,
    damage: 0,
    range: 0,
    areaOfEffect: 2,
    castTime: 500,
    energyCost: 30,
    statusEffects: [
      { type: 'SHIELD', duration: 5000, intensity: 100 },
      { type: 'SLOW', duration: 5000, intensity: 0.5 }
    ],
    animationTrigger: 'trader_shield_wall',
    unitTypes: ['TR'],
    description: 'Create a protective barrier, reducing speed but blocking damage',
  },
  FORTIFY: {
    id: 'FORTIFY',
    name: 'Fortify',
    cooldown: 12000,
    damage: 0,
    range: 0,
    areaOfEffect: 1,
    castTime: 200,
    energyCost: 25,
    statusEffects: [{ type: 'INVULNERABLE', duration: 1500, intensity: 1 }],
    animationTrigger: 'trader_fortify',
    unitTypes: ['TR'],
    description: 'Become invulnerable for a brief moment',
  },

  // HUNTER ABILITIES
  GUARD: {
    id: 'GUARD',
    name: 'Guard',
    cooldown: 10000,
    damage: 0,
    range: 2,
    areaOfEffect: 1,
    castTime: 100,
    energyCost: 15,
    statusEffects: [{ type: 'SHIELD', duration: 4000, intensity: 75 }],
    animationTrigger: 'hunter_guard',
    unitTypes: ['H'],
    description: 'Protect nearby allies with a defensive aura',
  },
  TRACK: {
    id: 'TRACK',
    name: 'Track',
    cooldown: 20000,
    damage: 0,
    range: 5,
    areaOfEffect: 0,
    castTime: 800,
    energyCost: 35,
    statusEffects: [{ type: 'SLOW', duration: 6000, intensity: 0.3 }],
    animationTrigger: 'hunter_track',
    unitTypes: ['H'],
    description: 'Mark and slow an enemy, revealing their position',
  },
  SNIPE: {
    id: 'SNIPE',
    name: 'Snipe',
    cooldown: 6000,
    damage: 40,
    range: 6,
    areaOfEffect: 0,
    castTime: 1000,
    energyCost: 30,
    statusEffects: [],
    animationTrigger: 'hunter_snipe',
    unitTypes: ['H'],
    description: 'High-damage long-range attack with critical hit chance',
  },

  // THIEF ABILITIES
  AMBUSH: {
    id: 'AMBUSH',
    name: 'Ambush',
    cooldown: 10000,
    damage: 50,
    range: 1,
    areaOfEffect: 0,
    castTime: 100,
    energyCost: 25,
    statusEffects: [{ type: 'STUN', duration: 1000, intensity: 1 }],
    animationTrigger: 'thief_ambush',
    unitTypes: ['TH'],
    description: 'Surprise attack from stealth, stunning the target',
  },
  DISARM: {
    id: 'DISARM',
    name: 'Disarm',
    cooldown: 12000,
    damage: 10,
    range: 1,
    areaOfEffect: 0,
    castTime: 300,
    energyCost: 20,
    statusEffects: [{ type: 'WEAKENED', duration: 5000, intensity: 0.5 }],
    animationTrigger: 'thief_disarm',
    unitTypes: ['TH'],
    description: 'Weaken enemy attack power significantly',
  },
  SHADOWSTEP: {
    id: 'SHADOWSTEP',
    name: 'Shadowstep',
    cooldown: 8000,
    damage: 0,
    range: 4,
    areaOfEffect: 0,
    castTime: 0,
    energyCost: 30,
    statusEffects: [{ type: 'INVISIBLE', duration: 2000, intensity: 1 }],
    animationTrigger: 'thief_shadowstep',
    unitTypes: ['TH'],
    description: 'Teleport and become invisible briefly',
  },
  BACKSTAB: {
    id: 'BACKSTAB',
    name: 'Backstab',
    cooldown: 5000,
    damage: 60,
    range: 1,
    areaOfEffect: 0,
    castTime: 200,
    energyCost: 25,
    statusEffects: [{ type: 'BLEED', duration: 5000, intensity: 8 }],
    animationTrigger: 'thief_backstab',
    unitTypes: ['TH'],
    description: 'Devastating attack from behind, causing bleed',
  },

  // KINGTHIEF ABILITIES
  RALLY: {
    id: 'RALLY',
    name: 'Rally',
    cooldown: 18000,
    damage: 0,
    range: 0,
    areaOfEffect: 4,
    castTime: 500,
    energyCost: 40,
    statusEffects: [
      { type: 'ENRAGED', duration: 6000, intensity: 1.4 },
      { type: 'SPEED_BOOST', duration: 6000, intensity: 1.3 }
    ],
    animationTrigger: 'kingthief_rally',
    unitTypes: ['KT'],
    description: 'Inspire nearby allies, boosting damage and speed',
  },
  EXECUTE: {
    id: 'EXECUTE',
    name: 'Execute',
    cooldown: 15000,
    damage: 80,
    range: 1,
    areaOfEffect: 0,
    castTime: 600,
    energyCost: 50,
    statusEffects: [],
    animationTrigger: 'kingthief_execute',
    unitTypes: ['KT'],
    description: 'Massive damage, increased against low health targets',
  },

  // BOSS ABILITIES
  BOSS_ROAR: {
    id: 'BOSS_ROAR',
    name: 'Terrifying Roar',
    cooldown: 12000,
    damage: 20,
    range: 0,
    areaOfEffect: 3,
    castTime: 800,
    energyCost: 0,
    statusEffects: [
      { type: 'STUN', duration: 2000, intensity: 1 },
      { type: 'WEAKENED', duration: 5000, intensity: 0.6 }
    ],
    animationTrigger: 'boss_roar',
    unitTypes: ['TigerGiry', 'SkeletoKing', 'Murucha'],
    description: 'Area stun and weaken effect',
  },
  BOSS_SMASH: {
    id: 'BOSS_SMASH',
    name: 'Ground Smash',
    cooldown: 8000,
    damage: 60,
    range: 2,
    areaOfEffect: 2,
    castTime: 1000,
    energyCost: 0,
    statusEffects: [{ type: 'STUN', duration: 1500, intensity: 1 }],
    animationTrigger: 'boss_smash',
    unitTypes: ['TigerGiry', 'SkeletoKing', 'Murucha'],
    description: 'Powerful AoE attack with stun',
  },
  BOSS_RAGE: {
    id: 'BOSS_RAGE',
    name: 'Enrage',
    cooldown: 20000,
    damage: 0,
    range: 0,
    areaOfEffect: 0,
    castTime: 500,
    energyCost: 0,
    statusEffects: [
      { type: 'ENRAGED', duration: 10000, intensity: 2.0 },
      { type: 'SPEED_BOOST', duration: 10000, intensity: 1.5 }
    ],
    animationTrigger: 'boss_rage',
    unitTypes: ['TigerGiry', 'SkeletoKing', 'Murucha'],
    description: 'Self-buff increasing damage and speed dramatically',
  },
};

// ============================================================================
// COMBAT SYSTEM CLASS
// ============================================================================

export class CombatSystem {
  private entities: Map<string, CombatEntity> = new Map();
  private eventListeners: Map<CombatEventType, CombatEventCallback[]> = new Map();
  private deltaTime: number = 0;
  private lastUpdateTime: number = 0;
  private isRunning: boolean = false;

  constructor() {
    this.initializeEventListeners();
  }

  // Initialize event listener maps
  private initializeEventListeners(): void {
    const eventTypes: CombatEventType[] = [
      'ATTACK_START', 'HIT', 'CRITICAL_HIT', 'BLOCK', 'DODGE',
      'KILL', 'ABILITY_CAST', 'STATUS_APPLIED', 'STATUS_EXPIRED',
      'COMBO_BREAK', 'COMBO_MILESTONE'
    ];

    eventTypes.forEach(type => {
      this.eventListeners.set(type, []);
    });
  }

  // ============================================================================
  // ENTITY MANAGEMENT
  // ============================================================================

  createEntityFromUnit(unit: Unit, team: 'TRADER' | 'THIEF'): CombatEntity {
    const entity: CombatEntity = {
      id: `${unit.type}_${unit.row}_${unit.col}_${Date.now()}`,
      position: { row: unit.row, col: unit.col },
      velocity: { x: 0, y: 0 },
      hitbox: this.createHitbox(unit),
      health: unit.hp,
      maxHealth: unit.maxHp,
      defense: this.getBaseDefense(unit.type),
      attackPower: this.getBaseAttackPower(unit.type),
      criticalChance: COMBAT_CONFIG.BASE_CRITICAL_CHANCE,
      criticalMultiplier: COMBAT_CONFIG.BASE_CRITICAL_MULTIPLIER,
      statusEffects: [],
      activeAbilities: [],
      comboCounter: 0,
      lastAttackTime: 0,
      team,
      unitType: unit.type,
    };

    this.entities.set(entity.id, entity);
    return entity;
  }

  createEntityFromBoss(boss: BossMonster): CombatEntity {
    const entity: CombatEntity = {
      id: `BOSS_${boss.type}_${Date.now()}`,
      position: boss.position,
      velocity: { x: 0, y: 0 },
      hitbox: this.createBossHitbox(boss),
      health: boss.hp,
      maxHealth: boss.maxHp,
      defense: 20,
      attackPower: boss.damage * 10,
      criticalChance: 0.25,
      criticalMultiplier: 2.0,
      statusEffects: [],
      activeAbilities: [],
      comboCounter: 0,
      lastAttackTime: 0,
      team: 'BOSS',
      unitType: boss.type,
    };

    this.entities.set(entity.id, entity);
    return entity;
  }

  removeEntity(entityId: string): void {
    this.entities.delete(entityId);
  }

  getEntity(entityId: string): CombatEntity | undefined {
    return this.entities.get(entityId);
  }

  getAllEntities(): CombatEntity[] {
    return Array.from(this.entities.values());
  }

  // ============================================================================
  // HITBOX & COLLISION DETECTION
  // ============================================================================

  private createHitbox(unit: Unit): Hitbox {
    const sizeMap: Record<string, { width: number; height: number; radius: number }> = {
      TR: { width: 0.8, height: 0.8, radius: 0.5 },
      H: { width: 0.7, height: 0.7, radius: 0.45 },
      TH: { width: 0.6, height: 0.6, radius: 0.4 },
      KT: { width: 0.9, height: 0.9, radius: 0.55 },
    };

    const size = sizeMap[unit.type] || { width: 0.8, height: 0.8, radius: 0.5 };

    return {
      position: { row: unit.row, col: unit.col },
      radius: size.radius,
      width: size.width,
      height: size.height,
      rotation: 0,
    };
  }

  private createBossHitbox(boss: BossMonster): Hitbox {
    return {
      position: boss.position,
      radius: 1.5,
      width: 2,
      height: 2,
      rotation: 0,
    };
  }

  checkCollision(entity1: CombatEntity, entity2: CombatEntity): boolean {
    // Circle-based collision detection
    const dx = entity2.position.col - entity1.position.col;
    const dy = entity2.position.row - entity1.position.row;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const combinedRadius = entity1.hitbox.radius + entity2.hitbox.radius;

    return distance < combinedRadius;
  }

  checkPointInHitbox(point: Position, hitbox: Hitbox): boolean {
    const dx = point.col - hitbox.position.col;
    const dy = point.row - hitbox.position.row;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return distance <= hitbox.radius;
  }

  getEntitiesInRange(origin: Position, range: number, team?: 'TRADER' | 'THIEF' | 'BOSS'): CombatEntity[] {
    return this.getAllEntities().filter(entity => {
      if (team && entity.team !== team) return false;

      const dx = entity.position.col - origin.col;
      const dy = entity.position.row - origin.row;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= range;
    });
  }

  getEntitiesInArea(center: Position, radius: number, excludeTeam?: 'TRADER' | 'THIEF' | 'BOSS'): CombatEntity[] {
    return this.getAllEntities().filter(entity => {
      if (excludeTeam && entity.team === excludeTeam) return false;

      const dx = entity.position.col - center.col;
      const dy = entity.position.row - center.row;
      const distance = Math.sqrt(dx * dx + dy * dy);

      return distance <= radius;
    });
  }

  // ============================================================================
  // DAMAGE CALCULATION
  // ============================================================================

  calculateDamage(
    attacker: CombatEntity,
    target: CombatEntity,
    baseDamage: number,
    damageType: 'PHYSICAL' | 'MAGICAL' | 'TRUE' = 'PHYSICAL'
  ): DamageResult {
    // Check for invulnerability
    if (this.hasStatusEffect(target, 'INVULNERABLE')) {
      return {
        totalDamage: 0,
        isCritical: false,
        isBlocked: true,
        isDodged: false,
        damageType,
        comboMultiplier: 1,
        statusEffectsApplied: [],
      };
    }

    // Check for dodge
    const dodgeChance = this.calculateDodgeChance(target);
    if (Math.random() < dodgeChance) {
      this.resetCombo(attacker);
      return {
        totalDamage: 0,
        isCritical: false,
        isBlocked: false,
        isDodged: true,
        damageType,
        comboMultiplier: 1,
        statusEffectsApplied: [],
      };
    }

    // Calculate critical hit
    const critChance = this.calculateCriticalChance(attacker);
    const isCritical = Math.random() < critChance;
    let damage = baseDamage + attacker.attackPower;

    if (isCritical) {
      damage *= attacker.criticalMultiplier;
    }

    // Apply combo multiplier
    const comboMultiplier = this.getComboMultiplier(attacker);
    damage *= comboMultiplier;

    // Apply status effect modifiers
    damage *= this.getDamageModifier(attacker);

    // Apply damage variance
    const variance = 1 + (Math.random() - 0.5) * 2 * COMBAT_CONFIG.DAMAGE_VARIANCE;
    damage *= variance;

    // Apply defense (only for physical damage)
    if (damageType === 'PHYSICAL') {
      const defenseReduction = target.defense / (target.defense + 100);
      damage *= (1 - defenseReduction);
    }

    // Check for shield
    const shield = this.getShieldAmount(target);
    let isBlocked = false;
    if (shield > 0) {
      const damageAfterShield = Math.max(0, damage - shield);
      this.damageShield(target, damage);
      damage = damageAfterShield;
      isBlocked = shield >= damage;
    }

    // Check for block chance
    if (!isBlocked) {
      const blockChance = this.calculateBlockChance(target);
      if (Math.random() < blockChance) {
        damage *= 0.5; // 50% damage reduction on block
        isBlocked = true;
      }
    }

    // Round damage
    damage = Math.round(damage);

    // Increment combo on hit
    this.incrementCombo(attacker);

    return {
      totalDamage: damage,
      isCritical,
      isBlocked,
      isDodged: false,
      damageType,
      comboMultiplier,
      statusEffectsApplied: [],
    };
  }

  // ============================================================================
  // COMBO SYSTEM
  // ============================================================================

  incrementCombo(entity: CombatEntity): void {
    const now = Date.now();

    // Reset combo if too much time has passed
    if (now - entity.lastAttackTime > COMBAT_CONFIG.COMBO_TIMEOUT) {
      entity.comboCounter = 0;
    }

    entity.comboCounter = Math.min(entity.comboCounter + 1, COMBAT_CONFIG.MAX_COMBO);
    entity.lastAttackTime = now;

    // Trigger combo milestone event
    if (entity.comboCounter >= 3) {
      this.emitEvent({
        type: 'COMBO_MILESTONE',
        timestamp: now,
        attacker: entity,
        target: null,
        position: entity.position,
        animationTrigger: `combo_${entity.comboCounter}`,
        soundEffect: `combo_milestone_${entity.comboCounter}`,
      });
    }
  }

  resetCombo(entity: CombatEntity): void {
    if (entity.comboCounter > 0) {
      this.emitEvent({
        type: 'COMBO_BREAK',
        timestamp: Date.now(),
        attacker: entity,
        target: null,
        position: entity.position,
        animationTrigger: 'combo_break',
      });
    }
    entity.comboCounter = 0;
  }

  getComboMultiplier(entity: CombatEntity): number {
    if (entity.comboCounter === 0) return 1.0;
    return COMBAT_CONFIG.COMBO_MULTIPLIERS[Math.min(entity.comboCounter - 1, COMBAT_CONFIG.COMBO_MULTIPLIERS.length - 1)];
  }

  // ============================================================================
  // COMBAT CALCULATIONS
  // ============================================================================

  private calculateCriticalChance(entity: CombatEntity): number {
    let critChance = entity.criticalChance;

    // Bonus crit chance for backstab
    const backstabBonus = 0.5; // 50% bonus from behind

    return Math.min(critChance, 1.0); // Cap at 100%
  }

  private calculateDodgeChance(entity: CombatEntity): number {
    let dodgeChance = COMBAT_CONFIG.BASE_DODGE_CHANCE;

    // Dodge disabled when stunned or frozen
    if (this.hasStatusEffect(entity, 'STUN') || this.hasStatusEffect(entity, 'FROZEN')) {
      return 0;
    }

    // Bonus dodge from speed boost
    if (this.hasStatusEffect(entity, 'SPEED_BOOST')) {
      dodgeChance += 0.15;
    }

    return Math.min(dodgeChance, 0.75); // Cap at 75%
  }

  private calculateBlockChance(entity: CombatEntity): number {
    let blockChance = COMBAT_CONFIG.BASE_BLOCK_CHANCE;

    // Increased block chance with shield
    if (this.hasStatusEffect(entity, 'SHIELD')) {
      blockChance += 0.25;
    }

    return Math.min(blockChance, 0.5); // Cap at 50%
  }

  private getDamageModifier(entity: CombatEntity): number {
    let modifier = 1.0;

    if (this.hasStatusEffect(entity, 'ENRAGED')) {
      const effect = this.getStatusEffect(entity, 'ENRAGED');
      modifier *= effect?.intensity || 1.0;
    }

    if (this.hasStatusEffect(entity, 'WEAKENED')) {
      const effect = this.getStatusEffect(entity, 'WEAKENED');
      modifier *= effect?.intensity || 1.0;
    }

    return modifier;
  }

  private getBaseDefense(unitType: string): number {
    const defenseMap: Record<string, number> = {
      TR: 15,
      H: 20,
      TH: 8,
      KT: 12,
    };
    return defenseMap[unitType] || 10;
  }

  private getBaseAttackPower(unitType: string): number {
    const attackMap: Record<string, number> = {
      TR: 20,
      H: 25,
      TH: 30,
      KT: 35,
    };
    return attackMap[unitType] || 20;
  }

  // ============================================================================
  // ABILITY SYSTEM
  // ============================================================================

  canUseAbility(entity: CombatEntity, abilityId: string): boolean {
    // Check if entity can use this ability
    const ability = COMBAT_ABILITIES[abilityId];
    if (!ability) return false;

    // Check unit type
    if (!ability.unitTypes.includes(entity.unitType)) return false;

    // Check if stunned or frozen
    if (this.hasStatusEffect(entity, 'STUN') || this.hasStatusEffect(entity, 'FROZEN')) {
      return false;
    }

    // Check cooldown
    const activeAbility = entity.activeAbilities.find(a => a.id === abilityId);
    if (activeAbility && activeAbility.cooldownRemaining > 0) {
      return false;
    }

    return true;
  }

  useAbility(
    entity: CombatEntity,
    abilityId: string,
    target: Position | null = null
  ): boolean {
    if (!this.canUseAbility(entity, abilityId)) return false;

    const ability = COMBAT_ABILITIES[abilityId];
    const now = Date.now();

    // Emit ability cast event
    this.emitEvent({
      type: 'ABILITY_CAST',
      timestamp: now,
      attacker: entity,
      target: null,
      ability,
      position: target || entity.position,
      animationTrigger: ability.animationTrigger,
      soundEffect: `ability_${abilityId.toLowerCase()}`,
    });

    // Add cooldown
    const existingAbility = entity.activeAbilities.find(a => a.id === abilityId);
    if (existingAbility) {
      existingAbility.cooldownRemaining = ability.cooldown;
      existingAbility.startTime = now;
    } else {
      entity.activeAbilities.push({
        id: abilityId,
        name: ability.name,
        cooldownRemaining: ability.cooldown,
        isActive: true,
        duration: ability.castTime,
        startTime: now,
      });
    }

    // Apply damage to targets in range/area
    const targetPosition = target || entity.position;
    let targets: CombatEntity[] = [];

    if (ability.areaOfEffect > 0) {
      targets = this.getEntitiesInArea(targetPosition, ability.areaOfEffect, entity.team);
    } else if (ability.range > 0) {
      targets = this.getEntitiesInRange(targetPosition, ability.range);
      targets = targets.filter(t => t.team !== entity.team);
      if (targets.length > 0) {
        targets = [targets[0]]; // Single target
      }
    } else {
      targets = [entity]; // Self-cast
    }

    // Apply damage and effects
    targets.forEach(t => {
      if (ability.damage > 0 && t.team !== entity.team) {
        const damageResult = this.calculateDamage(entity, t, ability.damage);
        this.applyDamage(t, damageResult.totalDamage);

        // Emit hit event
        this.emitEvent({
          type: damageResult.isCritical ? 'CRITICAL_HIT' : 'HIT',
          timestamp: now,
          attacker: entity,
          target: t,
          damage: damageResult,
          position: t.position,
          animationTrigger: damageResult.isCritical ? 'critical_hit' : 'hit',
          soundEffect: damageResult.isCritical ? 'critical_hit' : 'hit',
        });

        // Check for kill
        if (t.health <= 0) {
          this.emitEvent({
            type: 'KILL',
            timestamp: now,
            attacker: entity,
            target: t,
            position: t.position,
            animationTrigger: 'death',
            soundEffect: 'death',
          });
        }
      }

      // Apply status effects
      ability.statusEffects.forEach(effectTemplate => {
        this.applyStatusEffect(t, {
          ...STATUS_EFFECT_TEMPLATES[effectTemplate.type!],
          ...effectTemplate,
          source: entity.id,
          lastTick: now,
          currentStacks: 1,
        } as StatusEffect);
      });
    });

    return true;
  }

  // ============================================================================
  // STATUS EFFECT SYSTEM
  // ============================================================================

  applyStatusEffect(entity: CombatEntity, effect: StatusEffect): void {
    const existingEffect = entity.statusEffects.find(e => e.type === effect.type);

    if (existingEffect) {
      if (effect.stackable) {
        existingEffect.currentStacks = Math.min(
          existingEffect.currentStacks + 1,
          effect.maxStacks
        );
        existingEffect.duration = Math.max(existingEffect.duration, effect.duration);
      } else {
        // Refresh duration
        existingEffect.duration = effect.duration;
      }
    } else {
      entity.statusEffects.push(effect);

      // Emit status applied event
      this.emitEvent({
        type: 'STATUS_APPLIED',
        timestamp: Date.now(),
        attacker: entity,
        target: entity,
        position: entity.position,
        animationTrigger: `status_${effect.type.toLowerCase()}`,
        soundEffect: `status_${effect.type.toLowerCase()}`,
      });
    }
  }

  removeStatusEffect(entity: CombatEntity, effectType: StatusEffectType): void {
    const index = entity.statusEffects.findIndex(e => e.type === effectType);
    if (index !== -1) {
      entity.statusEffects.splice(index, 1);

      // Emit status expired event
      this.emitEvent({
        type: 'STATUS_EXPIRED',
        timestamp: Date.now(),
        attacker: entity,
        target: entity,
        position: entity.position,
        animationTrigger: `status_${effectType.toLowerCase()}_expire`,
      });
    }
  }

  hasStatusEffect(entity: CombatEntity, effectType: StatusEffectType): boolean {
    return entity.statusEffects.some(e => e.type === effectType);
  }

  getStatusEffect(entity: CombatEntity, effectType: StatusEffectType): StatusEffect | undefined {
    return entity.statusEffects.find(e => e.type === effectType);
  }

  private getShieldAmount(entity: CombatEntity): number {
    const shieldEffect = this.getStatusEffect(entity, 'SHIELD');
    return shieldEffect ? shieldEffect.intensity : 0;
  }

  private damageShield(entity: CombatEntity, damage: number): void {
    const shieldEffect = this.getStatusEffect(entity, 'SHIELD');
    if (shieldEffect) {
      shieldEffect.intensity -= damage;
      if (shieldEffect.intensity <= 0) {
        this.removeStatusEffect(entity, 'SHIELD');
      }
    }
  }

  // ============================================================================
  // ATTACK SYSTEM
  // ============================================================================

  performAttack(attacker: CombatEntity, target: CombatEntity): DamageResult | null {
    const now = Date.now();

    // Check attack cooldown
    if (now - attacker.lastAttackTime < COMBAT_CONFIG.ATTACK_COOLDOWN) {
      return null;
    }

    // Check if can attack (not stunned)
    if (this.hasStatusEffect(attacker, 'STUN') || this.hasStatusEffect(attacker, 'FROZEN')) {
      return null;
    }

    // Check range
    const distance = this.getDistance(attacker.position, target.position);
    const attackRange = 1.5; // Base attack range

    if (distance > attackRange) {
      return null;
    }

    // Emit attack start event
    this.emitEvent({
      type: 'ATTACK_START',
      timestamp: now,
      attacker,
      target,
      position: attacker.position,
      animationTrigger: 'attack_start',
      soundEffect: 'attack_swing',
    });

    // Calculate damage
    const damageResult = this.calculateDamage(attacker, target, 0);

    // Apply damage
    this.applyDamage(target, damageResult.totalDamage);

    // Emit appropriate event
    if (damageResult.isDodged) {
      this.emitEvent({
        type: 'DODGE',
        timestamp: now,
        attacker,
        target,
        damage: damageResult,
        position: target.position,
        animationTrigger: 'dodge',
        soundEffect: 'dodge',
      });
    } else if (damageResult.isBlocked) {
      this.emitEvent({
        type: 'BLOCK',
        timestamp: now,
        attacker,
        target,
        damage: damageResult,
        position: target.position,
        animationTrigger: 'block',
        soundEffect: 'block',
      });
    } else if (damageResult.isCritical) {
      this.emitEvent({
        type: 'CRITICAL_HIT',
        timestamp: now,
        attacker,
        target,
        damage: damageResult,
        position: target.position,
        animationTrigger: 'critical_hit',
        soundEffect: 'critical_hit',
      });
    } else {
      this.emitEvent({
        type: 'HIT',
        timestamp: now,
        attacker,
        target,
        damage: damageResult,
        position: target.position,
        animationTrigger: 'hit',
        soundEffect: 'hit',
      });
    }

    // Check for kill
    if (target.health <= 0) {
      this.emitEvent({
        type: 'KILL',
        timestamp: now,
        attacker,
        target,
        position: target.position,
        animationTrigger: 'death',
        soundEffect: 'death',
      });
    }

    attacker.lastAttackTime = now;
    return damageResult;
  }

  applyDamage(entity: CombatEntity, damage: number): void {
    entity.health = Math.max(0, entity.health - damage);
  }

  heal(entity: CombatEntity, amount: number): void {
    entity.health = Math.min(entity.maxHealth, entity.health + amount);
  }

  // ============================================================================
  // UPDATE LOOP
  // ============================================================================

  update(deltaTime: number): void {
    this.deltaTime = deltaTime;
    const now = Date.now();

    this.getAllEntities().forEach(entity => {
      // Update status effects
      this.updateStatusEffects(entity, deltaTime);

      // Update ability cooldowns
      this.updateAbilityCooldowns(entity, deltaTime);

      // Update combo timeout
      if (now - entity.lastAttackTime > COMBAT_CONFIG.COMBO_TIMEOUT && entity.comboCounter > 0) {
        this.resetCombo(entity);
      }

      // Update position based on velocity
      entity.position.row += entity.velocity.y * deltaTime / 1000;
      entity.position.col += entity.velocity.x * deltaTime / 1000;
      entity.hitbox.position = entity.position;
    });
  }

  private updateStatusEffects(entity: CombatEntity, deltaTime: number): void {
    const now = Date.now();
    const effectsToRemove: StatusEffectType[] = [];

    entity.statusEffects.forEach(effect => {
      // Decrease duration
      effect.duration -= deltaTime;

      // Handle tick-based effects
      if (effect.tickRate > 0 && now - effect.lastTick >= effect.tickRate) {
        effect.lastTick = now;

        // Apply tick damage for DoT effects
        if (effect.type === 'BLEED' || effect.type === 'POISON' || effect.type === 'BURN') {
          const tickDamage = effect.intensity * effect.currentStacks;
          this.applyDamage(entity, tickDamage);
        }
      }

      // Remove expired effects
      if (effect.duration <= 0) {
        effectsToRemove.push(effect.type);
      }
    });

    // Remove expired effects
    effectsToRemove.forEach(type => this.removeStatusEffect(entity, type));
  }

  private updateAbilityCooldowns(entity: CombatEntity, deltaTime: number): void {
    entity.activeAbilities.forEach(ability => {
      if (ability.cooldownRemaining > 0) {
        ability.cooldownRemaining = Math.max(0, ability.cooldownRemaining - deltaTime);
      }
    });
  }

  // ============================================================================
  // EVENT SYSTEM
  // ============================================================================

  on(eventType: CombatEventType, callback: CombatEventCallback): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.push(callback);
    }
  }

  off(eventType: CombatEventType, callback: CombatEventCallback): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitEvent(event: CombatEvent): void {
    const listeners = this.eventListeners.get(event.type);
    if (listeners) {
      listeners.forEach(callback => callback(event));
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos2.col - pos1.col;
    const dy = pos2.row - pos1.row;
    return Math.sqrt(dx * dx + dy * dy);
  }

  getSpeedModifier(entity: CombatEntity): number {
    let modifier = 1.0;

    if (this.hasStatusEffect(entity, 'STUN') || this.hasStatusEffect(entity, 'FROZEN')) {
      return 0;
    }

    if (this.hasStatusEffect(entity, 'SLOW')) {
      const effect = this.getStatusEffect(entity, 'SLOW');
      modifier *= effect?.intensity || 1.0;
    }

    if (this.hasStatusEffect(entity, 'SPEED_BOOST')) {
      const effect = this.getStatusEffect(entity, 'SPEED_BOOST');
      modifier *= effect?.intensity || 1.0;
    }

    return modifier;
  }

  // ============================================================================
  // VALIDATION & SECURITY (for multiplayer)
  // ============================================================================

  validateCombatAction(
    entityId: string,
    action: 'attack' | 'ability',
    target?: string,
    abilityId?: string
  ): { valid: boolean; reason?: string } {
    const entity = this.getEntity(entityId);
    if (!entity) {
      return { valid: false, reason: 'Entity not found' };
    }

    // Validate entity is alive
    if (entity.health <= 0) {
      return { valid: false, reason: 'Entity is dead' };
    }

    // Validate not stunned/frozen
    if (this.hasStatusEffect(entity, 'STUN') || this.hasStatusEffect(entity, 'FROZEN')) {
      return { valid: false, reason: 'Entity is incapacitated' };
    }

    if (action === 'attack') {
      // Validate attack cooldown
      const now = Date.now();
      if (now - entity.lastAttackTime < COMBAT_CONFIG.ATTACK_COOLDOWN) {
        return { valid: false, reason: 'Attack on cooldown' };
      }

      if (target) {
        const targetEntity = this.getEntity(target);
        if (!targetEntity) {
          return { valid: false, reason: 'Target not found' };
        }

        // Validate range
        const distance = this.getDistance(entity.position, targetEntity.position);
        if (distance > 1.5) {
          return { valid: false, reason: 'Target out of range' };
        }
      }
    }

    if (action === 'ability' && abilityId) {
      // Validate ability
      if (!this.canUseAbility(entity, abilityId)) {
        return { valid: false, reason: 'Cannot use ability' };
      }
    }

    return { valid: true };
  }

  // Generate combat state hash for validation
  getCombatStateHash(): string {
    const state = {
      entities: Array.from(this.entities.values()).map(e => ({
        id: e.id,
        health: e.health,
        position: e.position,
        statusEffects: e.statusEffects.length,
        comboCounter: e.comboCounter,
      })),
      timestamp: Date.now(),
    };

    return JSON.stringify(state);
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createCombatSystem(): CombatSystem {
  return new CombatSystem();
}

export function getAbilityDescription(abilityId: string): string {
  const ability = COMBAT_ABILITIES[abilityId];
  return ability ? ability.description : 'Unknown ability';
}

export function getAbilityForUnit(unitType: string): CombatAbility[] {
  return Object.values(COMBAT_ABILITIES).filter(ability =>
    ability.unitTypes.includes(unitType)
  );
}

export function getStatusEffectDescription(effectType: StatusEffectType): string {
  const descriptions: Record<StatusEffectType, string> = {
    STUN: 'Cannot move or attack',
    SLOW: 'Movement speed reduced',
    BLEED: 'Taking damage over time',
    SHIELD: 'Absorbs incoming damage',
    SPEED_BOOST: 'Movement speed increased',
    POISON: 'Taking poison damage over time',
    BURN: 'Taking fire damage over time',
    FROZEN: 'Completely immobilized',
    INVISIBLE: 'Cannot be targeted',
    INVULNERABLE: 'Immune to all damage',
    ENRAGED: 'Increased damage output',
    WEAKENED: 'Reduced damage output',
  };

  return descriptions[effectType] || 'Unknown effect';
}

// Export singleton instance
export const combatSystem = createCombatSystem();
