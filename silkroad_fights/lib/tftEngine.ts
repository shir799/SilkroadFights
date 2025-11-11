/**
 * SILKROAD FIGHTS - TFT AUTO-BATTLER ENGINE
 * Complete Teamfight Tactics-inspired system themed around Silkroad Online
 * Production-ready with full TypeScript types, event system, and deterministic simulation
 */

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export type UnitTier = 1 | 2 | 3 | 4 | 5;
export type UnitStars = 1 | 2 | 3;
export type GamePhase = 'preparation' | 'combat' | 'results' | 'game_over';
export type RoundType = 'pve' | 'pvp' | 'boss';
export type TargetingType = 'nearest' | 'lowest_hp' | 'highest_hp' | 'random' | 'backline';

export interface Position {
  x: number;
  y: number;
}

export interface UnitStats {
  hp: number;
  maxHp: number;
  attack: number;
  armor: number;
  magicResist: number;
  attackSpeed: number;
  range: number;
  mana: number;
  maxMana: number;
  critChance: number;
  critDamage: number;
  moveSpeed: number;
}

export interface UnitDefinition {
  id: string;
  name: string;
  tier: UnitTier;
  cost: number;
  traits: string[];
  baseStats: UnitStats;
  attackType: 'physical' | 'magic';
  targetingType: TargetingType;
  abilityName: string;
  abilityDescription: string;
  abilityDamage: number;
  abilityType: 'single' | 'aoe' | 'buff' | 'heal';
}

export interface GameUnit {
  instanceId: string;
  definitionId: string;
  stars: UnitStars;
  position: Position;
  stats: UnitStats;
  currentHp: number;
  currentMana: number;
  items: Item[];
  team: 'player' | 'enemy';
  isAlive: boolean;
  target: string | null;
  attackCooldown: number;
  abilityCooldown: number;
}

export interface Item {
  id: string;
  name: string;
  components: string[];
  effect: ItemEffect;
}

export interface ItemEffect {
  type: 'stat_bonus' | 'on_hit' | 'on_ability' | 'passive';
  stats?: Partial<UnitStats>;
  value?: number;
  description: string;
}

export interface TraitDefinition {
  id: string;
  name: string;
  description: string;
  thresholds: number[];
  effects: TraitEffect[];
}

export interface TraitEffect {
  threshold: number;
  description: string;
  statModifiers?: Partial<UnitStats>;
  specialEffect?: string;
  value?: number;
}

export interface ActiveTrait {
  traitId: string;
  activeThreshold: number;
  units: string[];
}

export interface Player {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  gold: number;
  level: number;
  xp: number;
  xpToNextLevel: number;
  winStreak: number;
  lossStreak: number;
  board: GameUnit[];
  bench: GameUnit[];
  shop: ShopSlot[];
  lockedShop: boolean;
  activeTraits: ActiveTrait[];
  items: Item[];
  roundsWon: number;
  roundsLost: number;
  placement: number;
}

export interface ShopSlot {
  unit: UnitDefinition | null;
  locked: boolean;
}

export interface GameState {
  phase: GamePhase;
  round: number;
  roundType: RoundType;
  players: Player[];
  currentPlayerId: string;
  unitPool: Map<string, number>;
  combatLog: CombatEvent[];
  seed: number;
  timestamp: number;
}

export interface CombatEvent {
  timestamp: number;
  type: 'damage' | 'heal' | 'ability' | 'death' | 'spawn';
  sourceId: string;
  targetId?: string;
  value?: number;
  description: string;
}

export interface RNGState {
  seed: number;
  state: number;
}

// ============================================================================
// UNIT DATABASE
// ============================================================================

export const UNIT_DEFINITIONS: Record<string, UnitDefinition> = {
  // TIER 1 UNITS (1 GOLD)
  blade_novice: {
    id: 'blade_novice',
    name: 'Blade Novice',
    tier: 1,
    cost: 1,
    traits: ['blade_mastery', 'hunter'],
    baseStats: {
      hp: 500,
      maxHp: 500,
      attack: 50,
      armor: 20,
      magicResist: 20,
      attackSpeed: 0.7,
      range: 1,
      mana: 0,
      maxMana: 50,
      critChance: 0.2,
      critDamage: 1.5,
      moveSpeed: 1.0,
    },
    attackType: 'physical',
    targetingType: 'nearest',
    abilityName: 'Swift Strike',
    abilityDescription: 'Deal 150 physical damage to target',
    abilityDamage: 150,
    abilityType: 'single',
  },
  bow_novice: {
    id: 'bow_novice',
    name: 'Bow Novice',
    tier: 1,
    cost: 1,
    traits: ['bow_mastery', 'hunter'],
    baseStats: {
      hp: 400,
      maxHp: 400,
      attack: 45,
      armor: 15,
      magicResist: 15,
      attackSpeed: 0.8,
      range: 3,
      mana: 0,
      maxMana: 40,
      critChance: 0.25,
      critDamage: 1.6,
      moveSpeed: 1.0,
    },
    attackType: 'physical',
    targetingType: 'lowest_hp',
    abilityName: 'Piercing Arrow',
    abilityDescription: 'Shoot an arrow dealing 120 damage',
    abilityDamage: 120,
    abilityType: 'single',
  },
  force_novice: {
    id: 'force_novice',
    name: 'Force Novice',
    tier: 1,
    cost: 1,
    traits: ['force_mastery', 'trader'],
    baseStats: {
      hp: 450,
      maxHp: 450,
      attack: 40,
      armor: 15,
      magicResist: 25,
      attackSpeed: 1.0,
      range: 2,
      mana: 0,
      maxMana: 60,
      critChance: 0.15,
      critDamage: 1.5,
      moveSpeed: 0.9,
    },
    attackType: 'magic',
    targetingType: 'lowest_hp',
    abilityName: 'Force Bolt',
    abilityDescription: 'Launch a magic bolt dealing 180 magic damage',
    abilityDamage: 180,
    abilityType: 'single',
  },

  // TIER 2 UNITS (2 GOLD)
  blader: {
    id: 'blader',
    name: 'Blader',
    tier: 2,
    cost: 2,
    traits: ['blade_mastery', 'thief'],
    baseStats: {
      hp: 700,
      maxHp: 700,
      attack: 70,
      armor: 30,
      magicResist: 25,
      attackSpeed: 0.65,
      range: 1,
      mana: 0,
      maxMana: 60,
      critChance: 0.3,
      critDamage: 1.7,
      moveSpeed: 1.1,
    },
    attackType: 'physical',
    targetingType: 'nearest',
    abilityName: 'Blade Dance',
    abilityDescription: 'Spin dealing 220 physical damage to nearby enemies',
    abilityDamage: 220,
    abilityType: 'aoe',
  },
  bowman: {
    id: 'bowman',
    name: 'Bowman',
    tier: 2,
    cost: 2,
    traits: ['bow_mastery', 'hunter'],
    baseStats: {
      hp: 600,
      maxHp: 600,
      attack: 65,
      armor: 20,
      magicResist: 20,
      attackSpeed: 0.75,
      range: 4,
      mana: 0,
      maxMana: 50,
      critChance: 0.35,
      critDamage: 1.8,
      moveSpeed: 1.0,
    },
    attackType: 'physical',
    targetingType: 'lowest_hp',
    abilityName: 'Multi-Shot',
    abilityDescription: 'Fire arrows at 3 targets dealing 160 damage each',
    abilityDamage: 160,
    abilityType: 'aoe',
  },
  wizard: {
    id: 'wizard',
    name: 'Wizard',
    tier: 2,
    cost: 2,
    traits: ['force_mastery', 'trader'],
    baseStats: {
      hp: 650,
      maxHp: 650,
      attack: 55,
      armor: 20,
      magicResist: 35,
      attackSpeed: 1.1,
      range: 3,
      mana: 0,
      maxMana: 70,
      critChance: 0.2,
      critDamage: 1.6,
      moveSpeed: 0.9,
    },
    attackType: 'magic',
    targetingType: 'backline',
    abilityName: 'Arcane Blast',
    abilityDescription: 'Blast area dealing 280 magic damage',
    abilityDamage: 280,
    abilityType: 'aoe',
  },

  // TIER 3 UNITS (3 GOLD)
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    tier: 3,
    cost: 3,
    traits: ['blade_mastery', 'warrior'],
    baseStats: {
      hp: 1200,
      maxHp: 1200,
      attack: 60,
      armor: 60,
      magicResist: 40,
      attackSpeed: 0.8,
      range: 1,
      mana: 0,
      maxMana: 80,
      critChance: 0.15,
      critDamage: 1.5,
      moveSpeed: 0.9,
    },
    attackType: 'physical',
    targetingType: 'highest_hp',
    abilityName: 'Shield Bash',
    abilityDescription: 'Bash target stunning and dealing 250 damage',
    abilityDamage: 250,
    abilityType: 'single',
  },
  bard: {
    id: 'bard',
    name: 'Bard',
    tier: 3,
    cost: 3,
    traits: ['force_mastery', 'healer'],
    baseStats: {
      hp: 750,
      maxHp: 750,
      attack: 45,
      armor: 25,
      magicResist: 40,
      attackSpeed: 1.2,
      range: 2,
      mana: 0,
      maxMana: 60,
      critChance: 0.1,
      critDamage: 1.3,
      moveSpeed: 1.0,
    },
    attackType: 'magic',
    targetingType: 'lowest_hp',
    abilityName: 'Healing Song',
    abilityDescription: 'Heal allies for 300 HP',
    abilityDamage: 300,
    abilityType: 'heal',
  },
  cleric: {
    id: 'cleric',
    name: 'Cleric',
    tier: 3,
    cost: 3,
    traits: ['force_mastery', 'healer', 'trader'],
    baseStats: {
      hp: 800,
      maxHp: 800,
      attack: 40,
      armor: 30,
      magicResist: 50,
      attackSpeed: 1.3,
      range: 2,
      mana: 0,
      maxMana: 70,
      critChance: 0.1,
      critDamage: 1.2,
      moveSpeed: 0.95,
    },
    attackType: 'magic',
    targetingType: 'nearest',
    abilityName: 'Divine Light',
    abilityDescription: 'Heal strongest ally for 400 HP',
    abilityDamage: 400,
    abilityType: 'heal',
  },

  // TIER 4 UNITS (4 GOLD)
  fire_wizard: {
    id: 'fire_wizard',
    name: 'Fire Wizard',
    tier: 4,
    cost: 4,
    traits: ['force_mastery', 'trader'],
    baseStats: {
      hp: 900,
      maxHp: 900,
      attack: 90,
      armor: 25,
      magicResist: 45,
      attackSpeed: 1.2,
      range: 3,
      mana: 0,
      maxMana: 100,
      critChance: 0.25,
      critDamage: 2.0,
      moveSpeed: 0.9,
    },
    attackType: 'magic',
    targetingType: 'backline',
    abilityName: 'Meteor Strike',
    abilityDescription: 'Call down a meteor dealing 500 magic damage in area',
    abilityDamage: 500,
    abilityType: 'aoe',
  },
  ice_wizard: {
    id: 'ice_wizard',
    name: 'Ice Wizard',
    tier: 4,
    cost: 4,
    traits: ['force_mastery', 'trader'],
    baseStats: {
      hp: 850,
      maxHp: 850,
      attack: 75,
      armor: 30,
      magicResist: 50,
      attackSpeed: 1.4,
      range: 3,
      mana: 0,
      maxMana: 90,
      critChance: 0.2,
      critDamage: 1.7,
      moveSpeed: 0.85,
    },
    attackType: 'magic',
    targetingType: 'highest_hp',
    abilityName: 'Ice Prison',
    abilityDescription: 'Freeze enemies dealing 350 damage and stunning',
    abilityDamage: 350,
    abilityType: 'aoe',
  },
  lightning_wizard: {
    id: 'lightning_wizard',
    name: 'Lightning Wizard',
    tier: 4,
    cost: 4,
    traits: ['force_mastery', 'trader'],
    baseStats: {
      hp: 800,
      maxHp: 800,
      attack: 100,
      armor: 20,
      magicResist: 40,
      attackSpeed: 1.0,
      range: 4,
      mana: 0,
      maxMana: 80,
      critChance: 0.3,
      critDamage: 1.9,
      moveSpeed: 0.95,
    },
    attackType: 'magic',
    targetingType: 'random',
    abilityName: 'Chain Lightning',
    abilityDescription: 'Lightning chains to 5 enemies dealing 380 damage each',
    abilityDamage: 380,
    abilityType: 'aoe',
  },

  // TIER 5 UNITS (5 GOLD - LEGENDARY)
  tigergirl: {
    id: 'tigergirl',
    name: 'TigerGirl',
    tier: 5,
    cost: 5,
    traits: ['hunter', 'blade_mastery'],
    baseStats: {
      hp: 1800,
      maxHp: 1800,
      attack: 150,
      armor: 50,
      magicResist: 50,
      attackSpeed: 0.5,
      range: 1,
      mana: 0,
      maxMana: 120,
      critChance: 0.4,
      critDamage: 2.5,
      moveSpeed: 1.3,
    },
    attackType: 'physical',
    targetingType: 'backline',
    abilityName: 'Savage Pounce',
    abilityDescription: 'Leap to backline dealing 800 physical damage',
    abilityDamage: 800,
    abilityType: 'single',
  },
  phoenix: {
    id: 'phoenix',
    name: 'Phoenix',
    tier: 5,
    cost: 5,
    traits: ['force_mastery', 'healer'],
    baseStats: {
      hp: 1500,
      maxHp: 1500,
      attack: 120,
      armor: 40,
      magicResist: 70,
      attackSpeed: 1.0,
      range: 3,
      mana: 0,
      maxMana: 100,
      critChance: 0.25,
      critDamage: 2.0,
      moveSpeed: 1.1,
    },
    attackType: 'magic',
    targetingType: 'random',
    abilityName: 'Rebirth',
    abilityDescription: 'Revive with 50% HP and deal 600 AOE damage',
    abilityDamage: 600,
    abilityType: 'aoe',
  },
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    tier: 5,
    cost: 5,
    traits: ['force_mastery', 'warrior'],
    baseStats: {
      hp: 2500,
      maxHp: 2500,
      attack: 140,
      armor: 80,
      magicResist: 80,
      attackSpeed: 1.2,
      range: 2,
      mana: 0,
      maxMana: 150,
      critChance: 0.3,
      critDamage: 2.2,
      moveSpeed: 0.8,
    },
    attackType: 'magic',
    targetingType: 'nearest',
    abilityName: 'Dragon Breath',
    abilityDescription: 'Breathe fire dealing 1000 magic damage to all enemies',
    abilityDamage: 1000,
    abilityType: 'aoe',
  },
};

// ============================================================================
// TRAIT SYSTEM
// ============================================================================

export const TRAIT_DEFINITIONS: Record<string, TraitDefinition> = {
  blade_mastery: {
    id: 'blade_mastery',
    name: 'Blade Mastery',
    description: 'Blade users gain bonus attack damage',
    thresholds: [2, 4, 6],
    effects: [
      {
        threshold: 2,
        description: '+10% Attack Damage',
        statModifiers: { attack: 1.10 },
      },
      {
        threshold: 4,
        description: '+25% Attack Damage',
        statModifiers: { attack: 1.25 },
      },
      {
        threshold: 6,
        description: '+50% Attack Damage',
        statModifiers: { attack: 1.50 },
      },
    ],
  },
  bow_mastery: {
    id: 'bow_mastery',
    name: 'Bow Mastery',
    description: 'Bow users gain bonus range',
    thresholds: [2, 4],
    effects: [
      {
        threshold: 2,
        description: '+1 Attack Range',
        statModifiers: { range: 1 },
      },
      {
        threshold: 4,
        description: '+2 Attack Range',
        statModifiers: { range: 2 },
      },
    ],
  },
  force_mastery: {
    id: 'force_mastery',
    name: 'Force Mastery',
    description: 'Force users gain bonus magic power',
    thresholds: [2, 4, 6],
    effects: [
      {
        threshold: 2,
        description: '+15% Magic Power',
        value: 1.15,
      },
      {
        threshold: 4,
        description: '+30% Magic Power',
        value: 1.30,
      },
      {
        threshold: 6,
        description: '+60% Magic Power',
        value: 1.60,
      },
    ],
  },
  warrior: {
    id: 'warrior',
    name: 'Warrior',
    description: 'Warriors gain bonus armor',
    thresholds: [2, 4],
    effects: [
      {
        threshold: 2,
        description: '+20 Armor',
        statModifiers: { armor: 20 },
      },
      {
        threshold: 4,
        description: '+40 Armor',
        statModifiers: { armor: 40 },
      },
    ],
  },
  healer: {
    id: 'healer',
    name: 'Healer',
    description: 'Healers regenerate HP per second',
    thresholds: [2, 3],
    effects: [
      {
        threshold: 2,
        description: 'Heal 5 HP per second',
        specialEffect: 'heal_per_second',
        value: 5,
      },
      {
        threshold: 3,
        description: 'Heal 10 HP per second',
        specialEffect: 'heal_per_second',
        value: 10,
      },
    ],
  },
  trader: {
    id: 'trader',
    name: 'Trader',
    description: 'Traders generate bonus gold per round',
    thresholds: [2, 4],
    effects: [
      {
        threshold: 2,
        description: '+1 Gold per round',
        specialEffect: 'bonus_gold',
        value: 1,
      },
      {
        threshold: 4,
        description: '+3 Gold per round',
        specialEffect: 'bonus_gold',
        value: 3,
      },
    ],
  },
  hunter: {
    id: 'hunter',
    name: 'Hunter',
    description: 'Hunters deal bonus damage to bosses',
    thresholds: [2, 3, 4],
    effects: [
      {
        threshold: 2,
        description: '+20% Damage vs Bosses',
        specialEffect: 'boss_damage',
        value: 1.20,
      },
      {
        threshold: 3,
        description: '+40% Damage vs Bosses',
        specialEffect: 'boss_damage',
        value: 1.40,
      },
      {
        threshold: 4,
        description: '+70% Damage vs Bosses',
        specialEffect: 'boss_damage',
        value: 1.70,
      },
    ],
  },
  thief: {
    id: 'thief',
    name: 'Thief',
    description: 'Thieves steal gold on kill',
    thresholds: [2, 4],
    effects: [
      {
        threshold: 2,
        description: 'Steal 1 Gold on kill',
        specialEffect: 'steal_gold',
        value: 1,
      },
      {
        threshold: 4,
        description: 'Steal 3 Gold on kill',
        specialEffect: 'steal_gold',
        value: 3,
      },
    ],
  },
};

// ============================================================================
// ITEM SYSTEM
// ============================================================================

export const ITEM_COMPONENTS: Record<string, Item> = {
  sword: {
    id: 'sword',
    name: 'Sword',
    components: [],
    effect: {
      type: 'stat_bonus',
      stats: { attack: 15 },
      description: '+15 Attack Damage',
    },
  },
  bow: {
    id: 'bow',
    name: 'Bow',
    components: [],
    effect: {
      type: 'stat_bonus',
      stats: { attackSpeed: 0.1 },
      description: '+10% Attack Speed',
    },
  },
  staff: {
    id: 'staff',
    name: 'Staff',
    components: [],
    effect: {
      type: 'stat_bonus',
      stats: { maxMana: 15 },
      description: '+15 Max Mana',
    },
  },
  shield: {
    id: 'shield',
    name: 'Shield',
    components: [],
    effect: {
      type: 'stat_bonus',
      stats: { armor: 20 },
      description: '+20 Armor',
    },
  },
  boots: {
    id: 'boots',
    name: 'Boots',
    components: [],
    effect: {
      type: 'stat_bonus',
      stats: { moveSpeed: 0.2 },
      description: '+20% Move Speed',
    },
  },
};

export const COMBINED_ITEMS: Record<string, Item> = {
  giant_slayer: {
    id: 'giant_slayer',
    name: 'Giant Slayer',
    components: ['sword', 'sword'],
    effect: {
      type: 'passive',
      value: 0.5,
      description: '+50% Damage vs high HP enemies',
    },
  },
  rabadons: {
    id: 'rabadons',
    name: "Rabadon's Deathcap",
    components: ['staff', 'staff'],
    effect: {
      type: 'passive',
      value: 0.5,
      description: '+50% Ability Power',
    },
  },
  warmogs: {
    id: 'warmogs',
    name: "Warmog's Armor",
    components: ['shield', 'shield'],
    effect: {
      type: 'stat_bonus',
      stats: { hp: 1000, maxHp: 1000 },
      description: '+1000 Max HP',
    },
  },
  quicksilver: {
    id: 'quicksilver',
    name: 'Quicksilver',
    components: ['boots', 'boots'],
    effect: {
      type: 'passive',
      description: 'Immune to Crowd Control',
    },
  },
  infinity_edge: {
    id: 'infinity_edge',
    name: 'Infinity Edge',
    components: ['sword', 'bow'],
    effect: {
      type: 'stat_bonus',
      stats: { critChance: 0.25, critDamage: 0.5 },
      description: '+25% Crit Chance, +50% Crit Damage',
    },
  },
  ionic_spark: {
    id: 'ionic_spark',
    name: 'Ionic Spark',
    components: ['bow', 'staff'],
    effect: {
      type: 'on_hit',
      value: 150,
      description: 'Deal 150 magic damage on hit',
    },
  },
  sunfire_cape: {
    id: 'sunfire_cape',
    name: 'Sunfire Cape',
    components: ['shield', 'staff'],
    effect: {
      type: 'passive',
      value: 30,
      description: 'Deal 30 magic damage per second to nearby enemies',
    },
  },
  statikk_shiv: {
    id: 'statikk_shiv',
    name: 'Statikk Shiv',
    components: ['bow', 'staff'],
    effect: {
      type: 'on_hit',
      value: 200,
      description: 'Lightning chains to 4 enemies for 200 damage',
    },
  },
};

// ============================================================================
// ECONOMY SYSTEM
// ============================================================================

export const ECONOMY_CONFIG = {
  BASE_INCOME: 5,
  INTEREST_RATE: 0.1, // 1 gold per 10 gold
  MAX_INTEREST: 5,
  MAX_WIN_STREAK_BONUS: 3,
  MAX_LOSS_STREAK_BONUS: 3,
  REFRESH_COST: 2,
  XP_PURCHASE_COST: 4,
  XP_PURCHASE_AMOUNT: 4,
  STARTING_GOLD: 0,
  STARTING_HP: 100,
};

export function calculateIncome(player: Player): number {
  const baseIncome = ECONOMY_CONFIG.BASE_INCOME;
  const interest = Math.min(
    Math.floor(player.gold * ECONOMY_CONFIG.INTEREST_RATE),
    ECONOMY_CONFIG.MAX_INTEREST
  );
  const winStreakBonus = Math.min(player.winStreak, ECONOMY_CONFIG.MAX_WIN_STREAK_BONUS);
  const lossStreakBonus = Math.min(player.lossStreak, ECONOMY_CONFIG.MAX_LOSS_STREAK_BONUS);

  // Trait bonuses (Trader trait)
  let traitBonus = 0;
  for (const trait of player.activeTraits) {
    if (trait.traitId === 'trader') {
      const effect = TRAIT_DEFINITIONS.trader.effects.find(
        e => e.threshold === trait.activeThreshold
      );
      if (effect && effect.value) {
        traitBonus += effect.value;
      }
    }
  }

  return baseIncome + interest + winStreakBonus + lossStreakBonus + traitBonus;
}

export function getUnitSellValue(stars: UnitStars, tier: UnitTier): number {
  const baseCost = tier;
  const starMultiplier = stars === 1 ? 1 : stars === 2 ? 3 : 9;
  return baseCost * starMultiplier;
}

// ============================================================================
// LEVELING SYSTEM
// ============================================================================

export const LEVEL_THRESHOLDS = [
  { level: 1, xpRequired: 0, maxUnits: 1 },
  { level: 2, xpRequired: 2, maxUnits: 2 },
  { level: 3, xpRequired: 6, maxUnits: 3 },
  { level: 4, xpRequired: 10, maxUnits: 4 },
  { level: 5, xpRequired: 20, maxUnits: 5 },
  { level: 6, xpRequired: 36, maxUnits: 6 },
  { level: 7, xpRequired: 56, maxUnits: 7 },
  { level: 8, xpRequired: 80, maxUnits: 8 },
  { level: 9, xpRequired: 100, maxUnits: 9 },
];

export const XP_PER_ROUND = 2;

export function getMaxUnits(level: number): number {
  const config = LEVEL_THRESHOLDS.find(l => l.level === level);
  return config ? config.maxUnits : 1;
}

export function getXpToNextLevel(currentXp: number): number {
  for (const threshold of LEVEL_THRESHOLDS) {
    if (currentXp < threshold.xpRequired) {
      return threshold.xpRequired - currentXp;
    }
  }
  return 0; // Max level reached
}

export function getCurrentLevel(xp: number): number {
  let level = 1;
  for (const threshold of LEVEL_THRESHOLDS) {
    if (xp >= threshold.xpRequired) {
      level = threshold.level;
    } else {
      break;
    }
  }
  return level;
}

// ============================================================================
// SHOP SYSTEM
// ============================================================================

const SHOP_ODDS: Record<number, Record<UnitTier, number>> = {
  1: { 1: 1.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 0.00 },
  2: { 1: 1.00, 2: 0.00, 3: 0.00, 4: 0.00, 5: 0.00 },
  3: { 1: 0.75, 2: 0.25, 3: 0.00, 4: 0.00, 5: 0.00 },
  4: { 1: 0.55, 2: 0.30, 3: 0.15, 4: 0.00, 5: 0.00 },
  5: { 1: 0.45, 2: 0.33, 3: 0.20, 4: 0.02, 5: 0.00 },
  6: { 1: 0.30, 2: 0.40, 3: 0.25, 4: 0.04, 5: 0.01 },
  7: { 1: 0.19, 2: 0.35, 3: 0.35, 4: 0.10, 5: 0.01 },
  8: { 1: 0.16, 2: 0.20, 3: 0.35, 4: 0.25, 5: 0.04 },
  9: { 1: 0.10, 2: 0.15, 3: 0.33, 4: 0.30, 5: 0.12 },
};

const UNIT_POOL_SIZES: Record<UnitTier, number> = {
  1: 29, // 29 copies of each tier 1 unit
  2: 22, // 22 copies of each tier 2 unit
  3: 18, // 18 copies of each tier 3 unit
  4: 12, // 12 copies of each tier 4 unit
  5: 10, // 10 copies of each tier 5 unit
};

const SHOP_SIZE = 5;

// ============================================================================
// DETERMINISTIC RNG
// ============================================================================

export class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed;
  }

  next(): number {
    // Linear Congruential Generator (LCG)
    this.state = (this.state * 1664525 + 1013904223) % 4294967296;
    return this.state / 4294967296;
  }

  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  choice<T>(array: T[]): T {
    return array[this.nextInt(0, array.length - 1)];
  }

  shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
}

// ============================================================================
// SHOP MECHANICS
// ============================================================================

export class ShopSystem {
  private unitPool: Map<string, number>;
  private rng: SeededRandom;

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
    this.unitPool = this.initializeUnitPool();
  }

  private initializeUnitPool(): Map<string, number> {
    const pool = new Map<string, number>();
    for (const [unitId, definition] of Object.entries(UNIT_DEFINITIONS)) {
      const poolSize = UNIT_POOL_SIZES[definition.tier];
      pool.set(unitId, poolSize);
    }
    return pool;
  }

  rollShop(playerLevel: number): ShopSlot[] {
    const shop: ShopSlot[] = [];
    const odds = SHOP_ODDS[playerLevel] || SHOP_ODDS[1];

    for (let i = 0; i < SHOP_SIZE; i++) {
      const tier = this.selectTier(odds);
      const unit = this.selectUnitOfTier(tier);
      shop.push({
        unit,
        locked: false,
      });
    }

    return shop;
  }

  private selectTier(odds: Record<UnitTier, number>): UnitTier {
    const roll = this.rng.next();
    let cumulative = 0;

    for (const tier of [1, 2, 3, 4, 5] as UnitTier[]) {
      cumulative += odds[tier];
      if (roll <= cumulative) {
        return tier;
      }
    }

    return 1; // Fallback
  }

  private selectUnitOfTier(tier: UnitTier): UnitDefinition | null {
    const availableUnits = Object.values(UNIT_DEFINITIONS).filter(
      unit => unit.tier === tier && (this.unitPool.get(unit.id) || 0) > 0
    );

    if (availableUnits.length === 0) {
      return null;
    }

    return this.rng.choice(availableUnits);
  }

  purchaseUnit(unitId: string): boolean {
    const remaining = this.unitPool.get(unitId) || 0;
    if (remaining > 0) {
      this.unitPool.set(unitId, remaining - 1);
      return true;
    }
    return false;
  }

  returnUnit(unitId: string): void {
    const current = this.unitPool.get(unitId) || 0;
    this.unitPool.set(unitId, current + 1);
  }

  getPoolState(): Map<string, number> {
    return new Map(this.unitPool);
  }
}

// ============================================================================
// TRAIT CALCULATOR
// ============================================================================

export class TraitCalculator {
  calculateActiveTraits(units: GameUnit[]): ActiveTrait[] {
    const traitCounts = new Map<string, string[]>();

    // Count trait occurrences
    for (const unit of units) {
      if (!unit.isAlive) continue;

      const definition = UNIT_DEFINITIONS[unit.definitionId];
      if (!definition) continue;

      for (const traitId of definition.traits) {
        if (!traitCounts.has(traitId)) {
          traitCounts.set(traitId, []);
        }
        traitCounts.get(traitId)!.push(unit.instanceId);
      }
    }

    // Determine active thresholds
    const activeTraits: ActiveTrait[] = [];

    for (const [traitId, unitIds] of Array.from(traitCounts.entries())) {
      const traitDef = TRAIT_DEFINITIONS[traitId];
      if (!traitDef) continue;

      let activeThreshold = 0;
      for (const threshold of traitDef.thresholds) {
        if (unitIds.length >= threshold) {
          activeThreshold = threshold;
        }
      }

      if (activeThreshold > 0) {
        activeTraits.push({
          traitId,
          activeThreshold,
          units: unitIds,
        });
      }
    }

    return activeTraits;
  }

  applyTraitEffects(unit: GameUnit, activeTraits: ActiveTrait[]): UnitStats {
    const modifiedStats = { ...unit.stats };
    const definition = UNIT_DEFINITIONS[unit.definitionId];

    for (const activeTrait of activeTraits) {
      if (!definition.traits.includes(activeTrait.traitId)) continue;

      const traitDef = TRAIT_DEFINITIONS[activeTrait.traitId];
      const effect = traitDef.effects.find(
        e => e.threshold === activeTrait.activeThreshold
      );

      if (!effect) continue;

      if (effect.statModifiers) {
        for (const [stat, value] of Object.entries(effect.statModifiers)) {
          const key = stat as keyof UnitStats;
          if (typeof value === 'number') {
            // Check if it's a multiplier (blade_mastery) or additive (warrior)
            if (value > 10) {
              // Additive (e.g., +20 armor)
              (modifiedStats[key] as number) += value;
            } else {
              // Multiplicative (e.g., 1.10 = +10%)
              (modifiedStats[key] as number) *= value;
            }
          }
        }
      }
    }

    return modifiedStats;
  }
}

// ============================================================================
// UPGRADE SYSTEM
// ============================================================================

export class UpgradeSystem {
  checkForUpgrades(units: GameUnit[]): GameUnit[] {
    const unitsByDefinition = new Map<string, GameUnit[]>();

    // Group units by definition and stars
    for (const unit of units) {
      const key = `${unit.definitionId}_${unit.stars}`;
      if (!unitsByDefinition.has(key)) {
        unitsByDefinition.set(key, []);
      }
      unitsByDefinition.get(key)!.push(unit);
    }

    const upgradedUnits: GameUnit[] = [];
    const unitsToRemove = new Set<string>();

    // Check for 3-of-a-kind upgrades
    for (const [key, group] of Array.from(unitsByDefinition.entries())) {
      if (group.length >= 3) {
        const [definitionId, starsStr] = key.split('_');
        const currentStars = parseInt(starsStr) as UnitStars;

        if (currentStars < 3) {
          // Perform upgrade
          const newStars = (currentStars + 1) as UnitStars;
          const newUnit = this.upgradeUnit(group[0], newStars);
          upgradedUnits.push(newUnit);

          // Mark first 3 units for removal
          for (let i = 0; i < 3; i++) {
            unitsToRemove.add(group[i].instanceId);
          }
        }
      }
    }

    // Return remaining units plus upgraded units
    const remainingUnits = units.filter(u => !unitsToRemove.has(u.instanceId));
    return [...remainingUnits, ...upgradedUnits];
  }

  private upgradeUnit(baseUnit: GameUnit, newStars: UnitStars): GameUnit {
    const definition = UNIT_DEFINITIONS[baseUnit.definitionId];
    const multiplier = newStars === 2 ? 2 : 4;

    return {
      ...baseUnit,
      instanceId: `${baseUnit.definitionId}_${newStars}_${Date.now()}`,
      stars: newStars,
      stats: {
        ...baseUnit.stats,
        hp: definition.baseStats.hp * multiplier,
        maxHp: definition.baseStats.maxHp * multiplier,
        attack: definition.baseStats.attack * multiplier,
      },
      currentHp: definition.baseStats.hp * multiplier,
    };
  }
}

// ============================================================================
// COMBAT SYSTEM
// ============================================================================

export class CombatSimulator {
  private rng: SeededRandom;
  private traitCalc: TraitCalculator;
  private events: CombatEvent[];
  private timeElapsed: number;

  constructor(seed: number) {
    this.rng = new SeededRandom(seed);
    this.traitCalc = new TraitCalculator();
    this.events = [];
    this.timeElapsed = 0;
  }

  simulate(playerUnits: GameUnit[], enemyUnits: GameUnit[]): {
    winner: 'player' | 'enemy' | 'draw';
    events: CombatEvent[];
    remainingUnits: GameUnit[];
  } {
    this.events = [];
    this.timeElapsed = 0;

    // Create combat instances
    const playerTeam = playerUnits.map(u => ({ ...u, team: 'player' as const }));
    const enemyTeam = enemyUnits.map(u => ({ ...u, team: 'enemy' as const }));
    let allUnits = [...playerTeam, ...enemyTeam];

    // Apply trait effects
    const playerTraits = this.traitCalc.calculateActiveTraits(playerTeam);
    const enemyTraits = this.traitCalc.calculateActiveTraits(enemyTeam);

    for (const unit of allUnits) {
      const traits = unit.team === 'player' ? playerTraits : enemyTraits;
      unit.stats = this.traitCalc.applyTraitEffects(unit, traits);
    }

    // Combat loop (max 60 seconds)
    const MAX_COMBAT_TIME = 60000;
    const TICK_RATE = 100; // 100ms per tick

    while (this.timeElapsed < MAX_COMBAT_TIME) {
      this.timeElapsed += TICK_RATE;

      // Process each unit
      for (const unit of allUnits) {
        if (!unit.isAlive) continue;

        // Update cooldowns
        unit.attackCooldown = Math.max(0, unit.attackCooldown - TICK_RATE);
        unit.abilityCooldown = Math.max(0, unit.abilityCooldown - TICK_RATE);

        // Find target
        const targets = allUnits.filter(u => u.isAlive && u.team !== unit.team);
        if (targets.length === 0) continue;

        const target = this.selectTarget(unit, targets);
        if (!target) continue;

        unit.target = target.instanceId;

        // Check if in range
        const distance = this.getDistance(unit.position, target.position);
        if (distance <= unit.stats.range) {
          // Attack
          if (unit.attackCooldown <= 0) {
            this.performAttack(unit, target);
            unit.attackCooldown = 1000 / unit.stats.attackSpeed;
          }

          // Use ability
          if (unit.currentMana >= unit.stats.maxMana && unit.abilityCooldown <= 0) {
            this.useAbility(unit, targets);
            unit.currentMana = 0;
            unit.abilityCooldown = 2000; // 2 second cooldown
          }
        } else {
          // Move towards target
          this.moveTowards(unit, target);
        }

        // Mana generation on attack
        if (unit.attackCooldown > 0) {
          unit.currentMana = Math.min(unit.stats.maxMana, unit.currentMana + 10);
        }
      }

      // Apply passive effects (healer trait, sunfire cape, etc.)
      this.applyPassiveEffects(allUnits, playerTraits, enemyTraits);

      // Remove dead units
      allUnits = allUnits.filter(u => u.isAlive);

      // Check win condition
      const playersAlive = allUnits.some(u => u.team === 'player' && u.isAlive);
      const enemiesAlive = allUnits.some(u => u.team === 'enemy' && u.isAlive);

      if (!playersAlive || !enemiesAlive) {
        break;
      }
    }

    // Determine winner
    const playerAlive = allUnits.some(u => u.team === 'player' && u.isAlive);
    const enemyAlive = allUnits.some(u => u.team === 'enemy' && u.isAlive);

    let winner: 'player' | 'enemy' | 'draw';
    if (playerAlive && !enemyAlive) {
      winner = 'player';
    } else if (enemyAlive && !playerAlive) {
      winner = 'enemy';
    } else {
      winner = 'draw';
    }

    return {
      winner,
      events: this.events,
      remainingUnits: allUnits.filter(u => u.isAlive),
    };
  }

  private selectTarget(unit: GameUnit, targets: GameUnit[]): GameUnit | null {
    const definition = UNIT_DEFINITIONS[unit.definitionId];
    if (!definition) return targets[0];

    switch (definition.targetingType) {
      case 'nearest':
        return targets.reduce((closest, target) => {
          const distClosest = this.getDistance(unit.position, closest.position);
          const distTarget = this.getDistance(unit.position, target.position);
          return distTarget < distClosest ? target : closest;
        });

      case 'lowest_hp':
        return targets.reduce((lowest, target) =>
          target.currentHp < lowest.currentHp ? target : lowest
        );

      case 'highest_hp':
        return targets.reduce((highest, target) =>
          target.currentHp > highest.currentHp ? target : highest
        );

      case 'backline':
        return targets.reduce((farthest, target) => {
          const distFarthest = this.getDistance(unit.position, farthest.position);
          const distTarget = this.getDistance(unit.position, target.position);
          return distTarget > distFarthest ? target : farthest;
        });

      case 'random':
        return this.rng.choice(targets);

      default:
        return targets[0];
    }
  }

  private getDistance(pos1: Position, pos2: Position): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private moveTowards(unit: GameUnit, target: GameUnit): void {
    const dx = target.position.x - unit.position.x;
    const dy = target.position.y - unit.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 0) {
      const moveAmount = unit.stats.moveSpeed * 0.1;
      unit.position.x += (dx / distance) * moveAmount;
      unit.position.y += (dy / distance) * moveAmount;
    }
  }

  private performAttack(attacker: GameUnit, defender: GameUnit): void {
    const definition = UNIT_DEFINITIONS[attacker.definitionId];
    let damage = attacker.stats.attack;

    // Crit calculation
    if (this.rng.next() < attacker.stats.critChance) {
      damage *= attacker.stats.critDamage;
    }

    // Apply armor/magic resist
    if (definition.attackType === 'physical') {
      const damageReduction = defender.stats.armor / (100 + defender.stats.armor);
      damage *= 1 - damageReduction;
    } else {
      const damageReduction = defender.stats.magicResist / (100 + defender.stats.magicResist);
      damage *= 1 - damageReduction;
    }

    // Apply items (Giant Slayer)
    for (const item of attacker.items) {
      if (item.id === 'giant_slayer' && defender.currentHp > defender.stats.maxHp * 0.7) {
        damage *= 1.5;
      }
    }

    // Deal damage
    defender.currentHp = Math.max(0, defender.currentHp - damage);

    this.events.push({
      timestamp: this.timeElapsed,
      type: 'damage',
      sourceId: attacker.instanceId,
      targetId: defender.instanceId,
      value: damage,
      description: `${definition.name} attacks for ${damage.toFixed(0)} damage`,
    });

    // Check death
    if (defender.currentHp <= 0) {
      defender.isAlive = false;
      this.events.push({
        timestamp: this.timeElapsed,
        type: 'death',
        sourceId: defender.instanceId,
        description: `${UNIT_DEFINITIONS[defender.definitionId].name} has been defeated`,
      });
    }
  }

  private useAbility(caster: GameUnit, targets: GameUnit[]): void {
    const definition = UNIT_DEFINITIONS[caster.definitionId];
    let damage = definition.abilityDamage;

    // Apply ability power (Rabadon's)
    for (const item of caster.items) {
      if (item.id === 'rabadons' && definition.attackType === 'magic') {
        damage *= 1.5;
      }
    }

    // Apply force mastery
    // (This would be calculated from active traits)

    switch (definition.abilityType) {
      case 'single':
        if (targets.length > 0) {
          const target = this.selectTarget(caster, targets);
          if (target) {
            target.currentHp = Math.max(0, target.currentHp - damage);
            this.events.push({
              timestamp: this.timeElapsed,
              type: 'ability',
              sourceId: caster.instanceId,
              targetId: target.instanceId,
              value: damage,
              description: `${definition.name} uses ${definition.abilityName}`,
            });

            if (target.currentHp <= 0) {
              target.isAlive = false;
              this.events.push({
                timestamp: this.timeElapsed,
                type: 'death',
                sourceId: target.instanceId,
                description: `${UNIT_DEFINITIONS[target.definitionId].name} defeated by ability`,
              });
            }
          }
        }
        break;

      case 'aoe':
        for (const target of targets) {
          target.currentHp = Math.max(0, target.currentHp - damage);
          if (target.currentHp <= 0) {
            target.isAlive = false;
            this.events.push({
              timestamp: this.timeElapsed,
              type: 'death',
              sourceId: target.instanceId,
              description: `${UNIT_DEFINITIONS[target.definitionId].name} defeated by AOE`,
            });
          }
        }
        this.events.push({
          timestamp: this.timeElapsed,
          type: 'ability',
          sourceId: caster.instanceId,
          value: damage,
          description: `${definition.name} uses ${definition.abilityName} (AOE)`,
        });
        break;

      case 'heal':
        // Find allies to heal
        const allies = targets.filter(u => u.team === caster.team && u.isAlive);
        for (const ally of allies) {
          const healAmount = damage;
          ally.currentHp = Math.min(ally.stats.maxHp, ally.currentHp + healAmount);
          this.events.push({
            timestamp: this.timeElapsed,
            type: 'heal',
            sourceId: caster.instanceId,
            targetId: ally.instanceId,
            value: healAmount,
            description: `${definition.name} heals for ${healAmount.toFixed(0)}`,
          });
        }
        break;
    }
  }

  private applyPassiveEffects(
    units: GameUnit[],
    playerTraits: ActiveTrait[],
    enemyTraits: ActiveTrait[]
  ): void {
    for (const unit of units) {
      if (!unit.isAlive) continue;

      const traits = unit.team === 'player' ? playerTraits : enemyTraits;

      // Healer trait - regenerate HP
      for (const trait of traits) {
        if (trait.traitId === 'healer') {
          const traitDef = TRAIT_DEFINITIONS.healer;
          const effect = traitDef.effects.find(e => e.threshold === trait.activeThreshold);
          if (effect && effect.value) {
            const healAmount = effect.value * 0.1; // 0.1 seconds per tick
            unit.currentHp = Math.min(unit.stats.maxHp, unit.currentHp + healAmount);
          }
        }
      }

      // Sunfire Cape
      for (const item of unit.items) {
        if (item.id === 'sunfire_cape') {
          const enemies = units.filter(u => u.team !== unit.team && u.isAlive);
          for (const enemy of enemies) {
            const distance = this.getDistance(unit.position, enemy.position);
            if (distance <= 2) {
              const damage = 3; // 30 damage per second / 10 ticks
              enemy.currentHp = Math.max(0, enemy.currentHp - damage);
              if (enemy.currentHp <= 0) {
                enemy.isAlive = false;
              }
            }
          }
        }
      }
    }
  }
}

// ============================================================================
// ROUND SYSTEM
// ============================================================================

export interface BossDefinition {
  name: string;
  hp: number;
  attack: number;
  armor: number;
  abilities: string[];
  itemRewards: number;
  goldReward: number;
}

export const BOSS_ROUNDS: Record<number, BossDefinition> = {
  10: {
    name: 'TigerGiry',
    hp: 5000,
    attack: 100,
    armor: 50,
    abilities: ['Savage Roar'],
    itemRewards: 1,
    goldReward: 5,
  },
  20: {
    name: 'Isyutaru',
    hp: 12000,
    attack: 150,
    armor: 70,
    abilities: ['Thunder Strike'],
    itemRewards: 2,
    goldReward: 8,
  },
  30: {
    name: 'Uruchi',
    hp: 25000,
    attack: 200,
    armor: 100,
    abilities: ['Dragon Breath'],
    itemRewards: 3,
    goldReward: 12,
  },
};

export function getRoundType(roundNumber: number): RoundType {
  if (BOSS_ROUNDS[roundNumber]) {
    return 'boss';
  }
  return roundNumber <= 3 ? 'pve' : 'pvp';
}

export function calculateDamageToPlayer(
  enemyUnitsAlive: number,
  round: number,
  unitTiers: UnitTier[]
): number {
  // Base damage + tier damage
  let damage = enemyUnitsAlive;
  for (const tier of unitTiers) {
    damage += tier;
  }
  // Scale with round
  damage += Math.floor(round / 5);
  return damage;
}

// ============================================================================
// GAME ENGINE
// ============================================================================

export class TFTEngine {
  private state: GameState;
  private shopSystem: ShopSystem;
  private upgradeSystem: UpgradeSystem;
  private traitCalc: TraitCalculator;

  constructor(seed: number = Date.now()) {
    this.shopSystem = new ShopSystem(seed);
    this.upgradeSystem = new UpgradeSystem();
    this.traitCalc = new TraitCalculator();

    // Initialize game state
    this.state = {
      phase: 'preparation',
      round: 1,
      roundType: 'pve',
      players: [this.createPlayer('player1', 'Player')],
      currentPlayerId: 'player1',
      unitPool: this.shopSystem.getPoolState(),
      combatLog: [],
      seed,
      timestamp: Date.now(),
    };

    // Initial shop roll
    this.rollShop(this.state.players[0]);
  }

  private createPlayer(id: string, name: string): Player {
    return {
      id,
      name,
      hp: ECONOMY_CONFIG.STARTING_HP,
      maxHp: ECONOMY_CONFIG.STARTING_HP,
      gold: ECONOMY_CONFIG.STARTING_GOLD,
      level: 1,
      xp: 0,
      xpToNextLevel: LEVEL_THRESHOLDS[1].xpRequired,
      winStreak: 0,
      lossStreak: 0,
      board: [],
      bench: [],
      shop: [],
      lockedShop: false,
      activeTraits: [],
      items: [],
      roundsWon: 0,
      roundsLost: 0,
      placement: 0,
    };
  }

  // ====== PUBLIC API ======

  getState(): GameState {
    return JSON.parse(JSON.stringify(this.state)); // Deep clone
  }

  getCurrentPlayer(): Player {
    return this.state.players.find(p => p.id === this.state.currentPlayerId)!;
  }

  // Shop Actions
  buyUnit(shopIndex: number): boolean {
    const player = this.getCurrentPlayer();
    const shopSlot = player.shop[shopIndex];

    if (!shopSlot || !shopSlot.unit) {
      return false;
    }

    if (player.gold < shopSlot.unit.cost) {
      return false;
    }

    if (player.bench.length >= 9) {
      return false; // Bench full
    }

    // Purchase unit
    if (this.shopSystem.purchaseUnit(shopSlot.unit.id)) {
      player.gold -= shopSlot.unit.cost;

      // Create game unit
      const newUnit = this.createGameUnit(shopSlot.unit, player);
      player.bench.push(newUnit);

      // Check for upgrades
      player.bench = this.upgradeSystem.checkForUpgrades(player.bench);
      player.board = this.upgradeSystem.checkForUpgrades(player.board);

      // Clear shop slot
      shopSlot.unit = null;

      return true;
    }

    return false;
  }

  sellUnit(unitInstanceId: string): boolean {
    const player = this.getCurrentPlayer();

    // Find unit on board or bench
    let unit = player.board.find(u => u.instanceId === unitInstanceId);
    let fromBoard = true;

    if (!unit) {
      unit = player.bench.find(u => u.instanceId === unitInstanceId);
      fromBoard = false;
    }

    if (!unit) return false;

    // Calculate sell value
    const definition = UNIT_DEFINITIONS[unit.definitionId];
    const sellValue = getUnitSellValue(unit.stars, definition.tier);
    player.gold += sellValue;

    // Return unit to pool
    this.shopSystem.returnUnit(unit.definitionId);

    // Remove from board/bench
    if (fromBoard) {
      player.board = player.board.filter(u => u.instanceId !== unitInstanceId);
    } else {
      player.bench = player.bench.filter(u => u.instanceId !== unitInstanceId);
    }

    return true;
  }

  refreshShop(): boolean {
    const player = this.getCurrentPlayer();

    if (player.gold < ECONOMY_CONFIG.REFRESH_COST) {
      return false;
    }

    player.gold -= ECONOMY_CONFIG.REFRESH_COST;
    this.rollShop(player);

    return true;
  }

  lockShop(): void {
    const player = this.getCurrentPlayer();
    player.lockedShop = !player.lockedShop;
  }

  buyXP(): boolean {
    const player = this.getCurrentPlayer();

    if (player.gold < ECONOMY_CONFIG.XP_PURCHASE_COST) {
      return false;
    }

    player.gold -= ECONOMY_CONFIG.XP_PURCHASE_COST;
    this.addXP(player, ECONOMY_CONFIG.XP_PURCHASE_AMOUNT);

    return true;
  }

  // Board Management
  placeUnit(unitInstanceId: string, position: Position): boolean {
    const player = this.getCurrentPlayer();

    // Find unit on bench
    const unit = player.bench.find(u => u.instanceId === unitInstanceId);
    if (!unit) return false;

    // Check if board position is valid
    if (player.board.length >= getMaxUnits(player.level)) {
      return false;
    }

    // Check if position is occupied
    if (player.board.some(u => u.position.x === position.x && u.position.y === position.y)) {
      return false;
    }

    // Move to board
    unit.position = position;
    player.bench = player.bench.filter(u => u.instanceId !== unitInstanceId);
    player.board.push(unit);

    // Update traits
    this.updateTraits(player);

    return true;
  }

  moveUnit(unitInstanceId: string, newPosition: Position): boolean {
    const player = this.getCurrentPlayer();
    const unit = player.board.find(u => u.instanceId === unitInstanceId);

    if (!unit) return false;

    // Check if position is occupied
    if (player.board.some(u => u.position.x === newPosition.x && u.position.y === newPosition.y)) {
      return false;
    }

    unit.position = newPosition;
    return true;
  }

  returnToBench(unitInstanceId: string): boolean {
    const player = this.getCurrentPlayer();
    const unit = player.board.find(u => u.instanceId === unitInstanceId);

    if (!unit) return false;

    if (player.bench.length >= 9) {
      return false;
    }

    player.board = player.board.filter(u => u.instanceId !== unitInstanceId);
    player.bench.push(unit);

    this.updateTraits(player);

    return true;
  }

  // Round Progression
  startCombat(): void {
    const player = this.getCurrentPlayer();
    this.state.phase = 'combat';

    const simulator = new CombatSimulator(this.state.seed + this.state.round);

    // Determine opponent
    const roundType = getRoundType(this.state.round);
    let enemyUnits: GameUnit[] = [];

    if (roundType === 'boss') {
      enemyUnits = this.createBossUnits();
    } else if (roundType === 'pve') {
      enemyUnits = this.createPvEUnits();
    } else {
      // PvP - for single player, create AI opponent
      enemyUnits = this.createAIOpponent();
    }

    // Run combat
    const result = simulator.simulate(player.board, enemyUnits);

    // Process results
    this.processCombatResult(player, result, enemyUnits);

    this.state.phase = 'results';
  }

  nextRound(): void {
    const player = this.getCurrentPlayer();

    // Reset shop if not locked
    if (!player.lockedShop) {
      this.rollShop(player);
    }

    // Add income
    const income = calculateIncome(player);
    player.gold += income;

    // Add XP
    this.addXP(player, XP_PER_ROUND);

    // Next round
    this.state.round++;
    this.state.roundType = getRoundType(this.state.round);
    this.state.phase = 'preparation';

    // Check game over
    if (player.hp <= 0) {
      this.state.phase = 'game_over';
    }
  }

  // ====== PRIVATE METHODS ======

  private createGameUnit(definition: UnitDefinition, player: Player): GameUnit {
    return {
      instanceId: `${definition.id}_${Date.now()}_${Math.random()}`,
      definitionId: definition.id,
      stars: 1,
      position: { x: 0, y: 0 },
      stats: { ...definition.baseStats },
      currentHp: definition.baseStats.hp,
      currentMana: 0,
      items: [],
      team: 'player',
      isAlive: true,
      target: null,
      attackCooldown: 0,
      abilityCooldown: 0,
    };
  }

  private rollShop(player: Player): void {
    player.shop = this.shopSystem.rollShop(player.level);
  }

  private addXP(player: Player, amount: number): void {
    player.xp += amount;
    const newLevel = getCurrentLevel(player.xp);

    if (newLevel > player.level) {
      player.level = newLevel;
    }

    player.xpToNextLevel = getXpToNextLevel(player.xp);
  }

  private updateTraits(player: Player): void {
    player.activeTraits = this.traitCalc.calculateActiveTraits(player.board);
  }

  private createBossUnits(): GameUnit[] {
    const boss = BOSS_ROUNDS[this.state.round];
    if (!boss) return [];

    // Create a boss unit (using dragon as template)
    const dragonDef = UNIT_DEFINITIONS.dragon;
    return [{
      instanceId: `boss_${this.state.round}`,
      definitionId: 'dragon',
      stars: 3,
      position: { x: 4, y: 4 },
      stats: {
        ...dragonDef.baseStats,
        hp: boss.hp,
        maxHp: boss.hp,
        attack: boss.attack,
        armor: boss.armor,
      },
      currentHp: boss.hp,
      currentMana: 0,
      items: [],
      team: 'enemy',
      isAlive: true,
      target: null,
      attackCooldown: 0,
      abilityCooldown: 0,
    }];
  }

  private createPvEUnits(): GameUnit[] {
    // Simple PvE units based on round
    const unitCount = Math.min(this.state.round, 4);
    const units: GameUnit[] = [];

    for (let i = 0; i < unitCount; i++) {
      const def = UNIT_DEFINITIONS.blade_novice;
      units.push({
        instanceId: `pve_${i}`,
        definitionId: 'blade_novice',
        stars: 1,
        position: { x: 4 + i, y: 4 },
        stats: { ...def.baseStats },
        currentHp: def.baseStats.hp,
        currentMana: 0,
        items: [],
        team: 'enemy',
        isAlive: true,
        target: null,
        attackCooldown: 0,
        abilityCooldown: 0,
      });
    }

    return units;
  }

  private createAIOpponent(): GameUnit[] {
    // Create AI opponent based on current round
    const unitCount = Math.min(Math.floor(this.state.round / 2), 8);
    const units: GameUnit[] = [];

    const availableUnits = Object.values(UNIT_DEFINITIONS).filter(
      u => u.tier <= Math.min(Math.floor(this.state.round / 5) + 1, 5)
    );

    const rng = new SeededRandom(this.state.seed + this.state.round + 999);

    for (let i = 0; i < unitCount; i++) {
      const def = rng.choice(availableUnits);
      units.push({
        instanceId: `ai_${i}`,
        definitionId: def.id,
        stars: 1,
        position: { x: 5 + (i % 4), y: 5 + Math.floor(i / 4) },
        stats: { ...def.baseStats },
        currentHp: def.baseStats.hp,
        currentMana: 0,
        items: [],
        team: 'enemy',
        isAlive: true,
        target: null,
        attackCooldown: 0,
        abilityCooldown: 0,
      });
    }

    return units;
  }

  private processCombatResult(
    player: Player,
    result: { winner: 'player' | 'enemy' | 'draw'; remainingUnits: GameUnit[] },
    enemyUnits: GameUnit[]
  ): void {
    this.state.combatLog = [];

    if (result.winner === 'player') {
      player.winStreak++;
      player.lossStreak = 0;
      player.roundsWon++;

      // Boss rewards
      const boss = BOSS_ROUNDS[this.state.round];
      if (boss) {
        player.gold += boss.goldReward;
        // Add items (simplified - just add components)
        const components = Object.values(ITEM_COMPONENTS);
        for (let i = 0; i < boss.itemRewards; i++) {
          player.items.push(components[i % components.length]);
        }
      }
    } else {
      player.lossStreak++;
      player.winStreak = 0;
      player.roundsLost++;

      // Take damage
      const aliveEnemies = enemyUnits.filter(u => u.isAlive);
      const tiers = aliveEnemies.map(u => UNIT_DEFINITIONS[u.definitionId].tier);
      const damage = calculateDamageToPlayer(aliveEnemies.length, this.state.round, tiers);
      player.hp = Math.max(0, player.hp - damage);
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export default TFTEngine;

// Convenience alias
export { TFTEngine as SilkroadFightsEngine };

// Export shop odds and pool sizes for external use
export { SHOP_ODDS, UNIT_POOL_SIZES, SHOP_SIZE };
