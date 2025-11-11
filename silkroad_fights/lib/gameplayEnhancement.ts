/**
 * SILKROAD FIGHTS - GAMEPLAY ENHANCEMENT SYSTEM
 *
 * Makes the game SÜCHTIG MACHEND (addictive)!
 *
 * Features:
 * - Streak System (win streaks, combo chains, perfect rounds)
 * - Daily Challenges (unique objectives with rewards)
 * - Achievement System (20+ achievements with progress tracking)
 * - Progression System (XP, levels, unlocks, upgrades)
 * - Risk/Reward Mechanics (gambling, high-risk shortcuts)
 * - Juice/Feel (screen shake, slow-mo, satisfying feedback)
 */

import { EventEmitter } from 'events';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PlayerProfile {
  playerId: string;
  username: string;
  level: number;
  xp: number;
  totalXp: number;
  prestigeLevel: number;
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  winStreak: number;
  bestWinStreak: number;
  totalKills: number;
  totalDamageDealt: number;
  totalSilkCollected: number;
  totalBossesDefeated: number;
  perfectRounds: number;
  achievements: AchievementProgress[];
  unlockedUnits: string[];
  unlockedAbilities: string[];
  unlockedCosmetics: string[];
  unitUpgrades: Map<string, number>; // unitType -> upgrade level
  currentTitle: string | null;
  equippedCosmetics: EquippedCosmetics;
  dailyChallenges: DailyChallenge[];
  stats: PlayerStats;
}

export interface PlayerStats {
  fastestWin: number; // in rounds
  longestGame: number; // in rounds
  mostKillsInGame: number;
  mostSilkInGame: number;
  highestCombo: number;
  criticalHitsLanded: number;
  abilitiesUsed: number;
  unitsLost: number;
  goldDelivered: number;
  trapsTriggered: number;
  bossesDefeatedSolo: number;
  gamesWithoutDamage: number;
}

export interface EquippedCosmetics {
  traderSkin?: string;
  thiefSkin?: string;
  hunterSkin?: string;
  victorySkin?: string;
  deathAnimation?: string;
  trailEffect?: string;
  victoryPose?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  tier: AchievementTier;
  icon: string;
  requirement: AchievementRequirement;
  rewards: AchievementReward;
  secret: boolean; // Hidden until unlocked
  points: number;
}

export type AchievementCategory =
  | 'COMBAT'
  | 'COLLECTION'
  | 'PROGRESSION'
  | 'MASTERY'
  | 'SPECIAL'
  | 'BOSS'
  | 'SPEED'
  | 'PERFECT';

export type AchievementTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'LEGENDARY';

export interface AchievementRequirement {
  type: 'COUNTER' | 'STREAK' | 'SPECIAL_CONDITION' | 'MILESTONE';
  target: number;
  condition?: (profile: PlayerProfile, gameState?: any) => boolean;
  counterKey?: keyof PlayerStats | keyof PlayerProfile;
}

export interface AchievementReward {
  xp: number;
  silk?: number;
  title?: string;
  cosmetic?: string;
  unit?: string;
  ability?: string;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  unlocked: boolean;
  unlockedAt?: number;
  notificationShown: boolean;
}

export interface DailyChallenge {
  id: string;
  date: string; // YYYY-MM-DD
  name: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXTREME';
  objective: ChallengeObjective;
  progress: number;
  completed: boolean;
  rewards: ChallengeReward;
  expiresAt: number; // timestamp
}

export interface ChallengeObjective {
  type: 'WIN_WITHOUT_LOSSES' | 'DEFEAT_BOSS_FAST' | 'COLLECT_SILK' | 'WIN_STREAK' | 'PERFECT_GAME' | 'USE_ABILITY' | 'KILL_COUNT';
  target: number;
  condition?: string;
}

export interface ChallengeReward {
  xp: number;
  silk: number;
  cosmetic?: string;
  title?: string;
}

export interface StreakBonus {
  type: 'WIN_STREAK' | 'KILL_COMBO' | 'PERFECT_ROUND';
  count: number;
  multiplier: number;
  bonusXP: number;
  bonusSilk: number;
}

export interface UnlockableContent {
  id: string;
  type: 'UNIT' | 'ABILITY' | 'COSMETIC' | 'TITLE';
  name: string;
  description: string;
  unlockRequirement: {
    level?: number;
    achievement?: string;
    prestige?: number;
  };
  cost?: number; // silk cost
}

export interface UpgradeSystem {
  unitType: string;
  level: number;
  maxLevel: number;
  upgrades: UnitUpgrade[];
}

export interface UnitUpgrade {
  level: number;
  stat: 'HP' | 'ATTACK' | 'DEFENSE' | 'SPEED' | 'RANGE';
  increase: number; // percentage or flat value
  cost: number; // silk cost
}

export interface JuiceEffect {
  type: 'SCREEN_SHAKE' | 'SLOW_MOTION' | 'FLASH' | 'PARTICLES' | 'SOUND';
  intensity: number;
  duration: number;
  trigger: string;
}

export interface GameplayEvent {
  type: GameplayEventType;
  timestamp: number;
  data: any;
}

export type GameplayEventType =
  | 'ACHIEVEMENT_UNLOCKED'
  | 'LEVEL_UP'
  | 'STREAK_MILESTONE'
  | 'CHALLENGE_COMPLETED'
  | 'PERFECT_ROUND'
  | 'BOSS_DEFEATED'
  | 'UNIT_UNLOCKED'
  | 'PRESTIGE_UP'
  | 'COMBO_MILESTONE'
  | 'CRITICAL_MOMENT';

// ============================================================================
// CONSTANTS & CONFIGURATION
// ============================================================================

export const PROGRESSION_CONFIG = {
  XP_PER_LEVEL: 1000,
  LEVEL_SCALING: 1.15, // XP required increases by 15% per level
  MAX_LEVEL: 100,
  PRESTIGE_LEVEL: 50, // Can prestige at level 50+

  // XP Rewards
  XP_WIN: 100,
  XP_LOSS: 25,
  XP_KILL: 10,
  XP_BOSS_KILL: 50,
  XP_SILK_COLLECTED: 5,
  XP_PERFECT_ROUND: 75,
  XP_DAILY_CHALLENGE: 200,

  // Streak Bonuses
  WIN_STREAK_BONUS: [0, 10, 25, 50, 100, 200], // 0, 1, 2, 3, 4, 5+ wins
  COMBO_THRESHOLDS: [3, 5, 10, 15, 20],

  // Prestige
  PRESTIGE_XP_BONUS: 0.1, // 10% per prestige level
  PRESTIGE_SILK_BONUS: 0.05, // 5% per prestige level
};

export const JUICE_CONFIG = {
  SCREEN_SHAKE: {
    CRITICAL_HIT: { intensity: 0.5, duration: 200 },
    BOSS_HIT: { intensity: 0.8, duration: 300 },
    DEATH: { intensity: 0.3, duration: 150 },
    VICTORY: { intensity: 1.0, duration: 500 },
  },
  SLOW_MOTION: {
    CRITICAL_HIT: { scale: 0.3, duration: 300 },
    BOSS_DEATH: { scale: 0.2, duration: 800 },
    PERFECT_ROUND: { scale: 0.5, duration: 400 },
    LAST_HIT: { scale: 0.4, duration: 500 },
  },
  PARTICLE_EFFECTS: {
    LEVEL_UP: 'confetti',
    ACHIEVEMENT: 'sparkles',
    STREAK_MILESTONE: 'fire',
    PERFECT_ROUND: 'stars',
  },
};

// ============================================================================
// ACHIEVEMENTS DEFINITIONS
// ============================================================================

export const ACHIEVEMENTS: Achievement[] = [
  // COMBAT ACHIEVEMENTS
  {
    id: 'FIRST_BLOOD',
    name: 'First Blood',
    description: 'Eliminate your first enemy unit',
    category: 'COMBAT',
    tier: 'BRONZE',
    icon: '⚔️',
    requirement: { type: 'COUNTER', target: 1, counterKey: 'totalKills' },
    rewards: { xp: 50, title: 'First Blood' },
    secret: false,
    points: 10,
  },
  {
    id: 'KILLING_SPREE',
    name: 'Killing Spree',
    description: 'Eliminate 100 enemy units',
    category: 'COMBAT',
    tier: 'SILVER',
    icon: '⚔️',
    requirement: { type: 'COUNTER', target: 100, counterKey: 'totalKills' },
    rewards: { xp: 200, silk: 50 },
    secret: false,
    points: 25,
  },
  {
    id: 'UNSTOPPABLE',
    name: 'Unstoppable',
    description: 'Eliminate 500 enemy units',
    category: 'COMBAT',
    tier: 'GOLD',
    icon: '⚔️',
    requirement: { type: 'COUNTER', target: 500, counterKey: 'totalKills' },
    rewards: { xp: 500, silk: 100, cosmetic: 'golden_sword_trail' },
    secret: false,
    points: 50,
  },

  // PERFECT PLAY ACHIEVEMENTS
  {
    id: 'UNTOUCHABLE',
    name: 'Untouchable',
    description: 'Win a game without taking any damage',
    category: 'PERFECT',
    tier: 'GOLD',
    icon: '🛡️',
    requirement: {
      type: 'SPECIAL_CONDITION',
      target: 1,
      condition: (profile) => profile.stats.gamesWithoutDamage >= 1
    },
    rewards: { xp: 300, title: 'The Untouchable', cosmetic: 'shield_aura' },
    secret: false,
    points: 75,
  },
  {
    id: 'PERFECT_10',
    name: 'Perfect Ten',
    description: 'Achieve 10 perfect rounds',
    category: 'PERFECT',
    tier: 'SILVER',
    icon: '⭐',
    requirement: { type: 'COUNTER', target: 10, counterKey: 'perfectRounds' },
    rewards: { xp: 250, silk: 75 },
    secret: false,
    points: 40,
  },

  // SPEED ACHIEVEMENTS
  {
    id: 'SPEED_RUNNER',
    name: 'Speed Runner',
    description: 'Win a game in under 5 rounds',
    category: 'SPEED',
    tier: 'GOLD',
    icon: '⚡',
    requirement: {
      type: 'SPECIAL_CONDITION',
      target: 1,
      condition: (profile) => profile.stats.fastestWin <= 5 && profile.stats.fastestWin > 0
    },
    rewards: { xp: 400, title: 'Lightning Fast', cosmetic: 'speed_trail' },
    secret: false,
    points: 80,
  },
  {
    id: 'BLITZ',
    name: 'Blitz',
    description: 'Win a game in under 3 rounds',
    category: 'SPEED',
    tier: 'PLATINUM',
    icon: '⚡',
    requirement: {
      type: 'SPECIAL_CONDITION',
      target: 1,
      condition: (profile) => profile.stats.fastestWin <= 3 && profile.stats.fastestWin > 0
    },
    rewards: { xp: 800, silk: 200, title: 'Blitz Master', ability: 'time_warp' },
    secret: false,
    points: 150,
  },

  // BOSS ACHIEVEMENTS
  {
    id: 'BOSS_SLAYER',
    name: 'Boss Slayer',
    description: 'Defeat 10 bosses',
    category: 'BOSS',
    tier: 'SILVER',
    icon: '👹',
    requirement: { type: 'COUNTER', target: 10, counterKey: 'totalBossesDefeated' },
    rewards: { xp: 300, silk: 100 },
    secret: false,
    points: 50,
  },
  {
    id: 'BOSS_HUNTER',
    name: 'Boss Hunter',
    description: 'Defeat 50 bosses',
    category: 'BOSS',
    tier: 'GOLD',
    icon: '👹',
    requirement: { type: 'COUNTER', target: 50, counterKey: 'totalBossesDefeated' },
    rewards: { xp: 800, silk: 250, title: 'Boss Hunter' },
    secret: false,
    points: 100,
  },
  {
    id: 'BOSS_SPEEDRUN',
    name: 'Quick Kill',
    description: 'Defeat a boss in under 10 rounds',
    category: 'BOSS',
    tier: 'PLATINUM',
    icon: '👹',
    requirement: { type: 'SPECIAL_CONDITION', target: 1 },
    rewards: { xp: 500, silk: 150, cosmetic: 'boss_slayer_cape' },
    secret: false,
    points: 120,
  },

  // COLLECTION ACHIEVEMENTS
  {
    id: 'SILK_COLLECTOR',
    name: 'Silk Collector',
    description: 'Collect 50 silk total',
    category: 'COLLECTION',
    tier: 'BRONZE',
    icon: '🧵',
    requirement: { type: 'COUNTER', target: 50, counterKey: 'totalSilkCollected' },
    rewards: { xp: 100 },
    secret: false,
    points: 20,
  },
  {
    id: 'SILK_MASTER',
    name: 'Silk Master',
    description: 'Collect 500 silk total',
    category: 'COLLECTION',
    tier: 'GOLD',
    icon: '🧵',
    requirement: { type: 'COUNTER', target: 500, counterKey: 'totalSilkCollected' },
    rewards: { xp: 500, silk: 100, title: 'Silk Master' },
    secret: false,
    points: 75,
  },
  {
    id: 'SILK_HOARDER',
    name: 'Silk Hoarder',
    description: 'Collect 15 silk in a single game',
    category: 'COLLECTION',
    tier: 'SILVER',
    icon: '🧵',
    requirement: {
      type: 'SPECIAL_CONDITION',
      target: 1,
      condition: (profile) => profile.stats.mostSilkInGame >= 15
    },
    rewards: { xp: 200, silk: 50 },
    secret: false,
    points: 40,
  },

  // STREAK ACHIEVEMENTS
  {
    id: 'WIN_STREAK_3',
    name: 'Triple Threat',
    description: 'Win 3 games in a row',
    category: 'PROGRESSION',
    tier: 'BRONZE',
    icon: '🔥',
    requirement: { type: 'STREAK', target: 3, counterKey: 'bestWinStreak' },
    rewards: { xp: 150, silk: 25 },
    secret: false,
    points: 30,
  },
  {
    id: 'WIN_STREAK_5',
    name: 'Pentakill',
    description: 'Win 5 games in a row',
    category: 'PROGRESSION',
    tier: 'SILVER',
    icon: '🔥',
    requirement: { type: 'STREAK', target: 5, counterKey: 'bestWinStreak' },
    rewards: { xp: 300, silk: 75, title: 'On Fire' },
    secret: false,
    points: 60,
  },
  {
    id: 'WIN_STREAK_10',
    name: 'Legendary',
    description: 'Win 10 games in a row',
    category: 'PROGRESSION',
    tier: 'LEGENDARY',
    icon: '🔥',
    requirement: { type: 'STREAK', target: 10, counterKey: 'bestWinStreak' },
    rewards: { xp: 1000, silk: 300, title: 'Legendary', cosmetic: 'legendary_aura' },
    secret: false,
    points: 200,
  },

  // MASTERY ACHIEVEMENTS
  {
    id: 'VETERAN',
    name: 'Veteran',
    description: 'Play 100 games',
    category: 'MASTERY',
    tier: 'SILVER',
    icon: '🎖️',
    requirement: { type: 'COUNTER', target: 100, counterKey: 'totalGamesPlayed' },
    rewards: { xp: 400, silk: 100 },
    secret: false,
    points: 50,
  },
  {
    id: 'MASTER',
    name: 'Master',
    description: 'Reach level 50',
    category: 'MASTERY',
    tier: 'GOLD',
    icon: '🏆',
    requirement: { type: 'MILESTONE', target: 50, counterKey: 'level' },
    rewards: { xp: 1000, silk: 250, title: 'Master' },
    secret: false,
    points: 100,
  },
  {
    id: 'PRESTIGE',
    name: 'Ascended',
    description: 'Prestige for the first time',
    category: 'MASTERY',
    tier: 'PLATINUM',
    icon: '✨',
    requirement: { type: 'MILESTONE', target: 1, counterKey: 'prestigeLevel' },
    rewards: { xp: 2000, silk: 500, title: 'Ascended One', cosmetic: 'prestige_crown' },
    secret: false,
    points: 250,
  },

  // SPECIAL/SECRET ACHIEVEMENTS
  {
    id: 'COMBO_MASTER',
    name: 'Combo Master',
    description: 'Achieve a 20-hit combo',
    category: 'SPECIAL',
    tier: 'PLATINUM',
    icon: '💥',
    requirement: {
      type: 'SPECIAL_CONDITION',
      target: 1,
      condition: (profile) => profile.stats.highestCombo >= 20
    },
    rewards: { xp: 600, silk: 150, title: 'Combo Master', cosmetic: 'combo_effect' },
    secret: false,
    points: 120,
  },
  {
    id: 'CRITICAL_MASTER',
    name: 'Critical Master',
    description: 'Land 100 critical hits',
    category: 'SPECIAL',
    tier: 'GOLD',
    icon: '💢',
    requirement: { type: 'COUNTER', target: 100, counterKey: 'criticalHitsLanded' },
    rewards: { xp: 400, silk: 100, title: 'Critical Strike' },
    secret: false,
    points: 75,
  },
  {
    id: 'SURVIVOR',
    name: 'Survivor',
    description: 'Win without losing a single unit',
    category: 'SPECIAL',
    tier: 'GOLD',
    icon: '🛡️',
    requirement: { type: 'SPECIAL_CONDITION', target: 1 },
    rewards: { xp: 350, silk: 100, title: 'The Survivor' },
    secret: false,
    points: 80,
  },
];

// ============================================================================
// DAILY CHALLENGES POOL
// ============================================================================

export const CHALLENGE_TEMPLATES = [
  // Easy Challenges
  { difficulty: 'EASY', name: 'Daily Grind', description: 'Win 3 games', objective: { type: 'WIN_STREAK', target: 3 }, rewards: { xp: 100, silk: 25 } },
  { difficulty: 'EASY', name: 'Silk Seeker', description: 'Collect 10 silk', objective: { type: 'COLLECT_SILK', target: 10 }, rewards: { xp: 80, silk: 20 } },
  { difficulty: 'EASY', name: 'Executioner', description: 'Eliminate 20 units', objective: { type: 'KILL_COUNT', target: 20 }, rewards: { xp: 120, silk: 30 } },

  // Medium Challenges
  { difficulty: 'MEDIUM', name: 'Flawless Victory', description: 'Win without losing a unit', objective: { type: 'WIN_WITHOUT_LOSSES', target: 1 }, rewards: { xp: 200, silk: 50 } },
  { difficulty: 'MEDIUM', name: 'Ability Master', description: 'Use 15 abilities', objective: { type: 'USE_ABILITY', target: 15 }, rewards: { xp: 180, silk: 45 } },
  { difficulty: 'MEDIUM', name: 'Silk Fortune', description: 'Collect 20 silk in one game', objective: { type: 'COLLECT_SILK', target: 20 }, rewards: { xp: 220, silk: 60 } },

  // Hard Challenges
  { difficulty: 'HARD', name: 'Boss Rush', description: 'Defeat a boss in under 10 rounds', objective: { type: 'DEFEAT_BOSS_FAST', target: 10 }, rewards: { xp: 350, silk: 100 } },
  { difficulty: 'HARD', name: 'Win Streak', description: 'Win 5 games in a row', objective: { type: 'WIN_STREAK', target: 5 }, rewards: { xp: 400, silk: 120, title: 'Daily Champion' } },
  { difficulty: 'HARD', name: 'Perfect Game', description: 'Win a perfect game (no damage)', objective: { type: 'PERFECT_GAME', target: 1 }, rewards: { xp: 500, silk: 150 } },

  // Extreme Challenges
  { difficulty: 'EXTREME', name: 'Legendary', description: 'Win 10 games in a row', objective: { type: 'WIN_STREAK', target: 10 }, rewards: { xp: 1000, silk: 300, title: 'Elite' } },
  { difficulty: 'EXTREME', name: 'Massacre', description: 'Eliminate 50 units in one day', objective: { type: 'KILL_COUNT', target: 50 }, rewards: { xp: 800, silk: 250 } },
];

// ============================================================================
// UNLOCKABLE CONTENT
// ============================================================================

export const UNLOCKABLES: UnlockableContent[] = [
  // Units
  { id: 'ELITE_TRADER', type: 'UNIT', name: 'Elite Trader', description: 'Advanced trader unit with improved stats', unlockRequirement: { level: 10 }, cost: 500 },
  { id: 'SHADOW_THIEF', type: 'UNIT', name: 'Shadow Thief', description: 'Stealth thief with bonus critical damage', unlockRequirement: { level: 15 }, cost: 750 },
  { id: 'MASTER_HUNTER', type: 'UNIT', name: 'Master Hunter', description: 'Expert hunter with increased range', unlockRequirement: { level: 20 }, cost: 1000 },

  // Abilities
  { id: 'TELEPORT', type: 'ABILITY', name: 'Teleport', description: 'Instantly move to any position', unlockRequirement: { level: 25 }, cost: 1500 },
  { id: 'RAGE', type: 'ABILITY', name: 'Berserker Rage', description: 'Double damage for 10 seconds', unlockRequirement: { level: 30 }, cost: 2000 },
  { id: 'RESURRECTION', type: 'ABILITY', name: 'Resurrection', description: 'Revive a fallen unit once per game', unlockRequirement: { prestige: 1 }, cost: 5000 },

  // Cosmetics
  { id: 'GOLDEN_SKIN', type: 'COSMETIC', name: 'Golden Skin', description: 'Shiny gold unit skin', unlockRequirement: { achievement: 'SILK_MASTER' } },
  { id: 'FIRE_TRAIL', type: 'COSMETIC', name: 'Fire Trail', description: 'Leave a trail of fire', unlockRequirement: { achievement: 'WIN_STREAK_5' } },
  { id: 'VICTORY_DANCE', type: 'COSMETIC', name: 'Victory Dance', description: 'Special victory animation', unlockRequirement: { level: 50 } },

  // Titles
  { id: 'THE_CONQUEROR', type: 'TITLE', name: 'The Conqueror', description: 'Win 100 games', unlockRequirement: { level: 40 } },
];

// ============================================================================
// UPGRADE SYSTEM
// ============================================================================

export const UNIT_UPGRADES: Record<string, UpgradeSystem> = {
  TR: {
    unitType: 'TR',
    level: 0,
    maxLevel: 10,
    upgrades: [
      { level: 1, stat: 'HP', increase: 10, cost: 100 },
      { level: 2, stat: 'ATTACK', increase: 5, cost: 150 },
      { level: 3, stat: 'DEFENSE', increase: 5, cost: 200 },
      { level: 4, stat: 'HP', increase: 15, cost: 300 },
      { level: 5, stat: 'ATTACK', increase: 10, cost: 400 },
      { level: 6, stat: 'DEFENSE', increase: 10, cost: 500 },
      { level: 7, stat: 'HP', increase: 20, cost: 750 },
      { level: 8, stat: 'ATTACK', increase: 15, cost: 1000 },
      { level: 9, stat: 'SPEED', increase: 5, cost: 1500 },
      { level: 10, stat: 'HP', increase: 30, cost: 2000 },
    ],
  },
  TH: {
    unitType: 'TH',
    level: 0,
    maxLevel: 10,
    upgrades: [
      { level: 1, stat: 'ATTACK', increase: 8, cost: 100 },
      { level: 2, stat: 'SPEED', increase: 5, cost: 150 },
      { level: 3, stat: 'ATTACK', increase: 12, cost: 200 },
      { level: 4, stat: 'HP', increase: 10, cost: 300 },
      { level: 5, stat: 'ATTACK', increase: 15, cost: 400 },
      { level: 6, stat: 'SPEED', increase: 10, cost: 500 },
      { level: 7, stat: 'ATTACK', increase: 20, cost: 750 },
      { level: 8, stat: 'HP', increase: 15, cost: 1000 },
      { level: 9, stat: 'ATTACK', increase: 25, cost: 1500 },
      { level: 10, stat: 'SPEED', increase: 15, cost: 2000 },
    ],
  },
  H: {
    unitType: 'H',
    level: 0,
    maxLevel: 10,
    upgrades: [
      { level: 1, stat: 'RANGE', increase: 1, cost: 100 },
      { level: 2, stat: 'ATTACK', increase: 8, cost: 150 },
      { level: 3, stat: 'DEFENSE', increase: 8, cost: 200 },
      { level: 4, stat: 'RANGE', increase: 1, cost: 300 },
      { level: 5, stat: 'ATTACK', increase: 12, cost: 400 },
      { level: 6, stat: 'HP', increase: 15, cost: 500 },
      { level: 7, stat: 'RANGE', increase: 2, cost: 750 },
      { level: 8, stat: 'ATTACK', increase: 18, cost: 1000 },
      { level: 9, stat: 'DEFENSE', increase: 15, cost: 1500 },
      { level: 10, stat: 'ATTACK', increase: 25, cost: 2000 },
    ],
  },
};

// ============================================================================
// GAMEPLAY ENHANCEMENT ENGINE
// ============================================================================

export class GameplayEnhancementEngine extends EventEmitter {
  private profiles: Map<string, PlayerProfile> = new Map();
  private currentGameSession: GameSession | null = null;

  constructor() {
    super();
  }

  // ==========================================================================
  // PLAYER PROFILE MANAGEMENT
  // ==========================================================================

  createProfile(playerId: string, username: string): PlayerProfile {
    const profile: PlayerProfile = {
      playerId,
      username,
      level: 1,
      xp: 0,
      totalXp: 0,
      prestigeLevel: 0,
      totalGamesPlayed: 0,
      totalWins: 0,
      totalLosses: 0,
      winStreak: 0,
      bestWinStreak: 0,
      totalKills: 0,
      totalDamageDealt: 0,
      totalSilkCollected: 0,
      totalBossesDefeated: 0,
      perfectRounds: 0,
      achievements: ACHIEVEMENTS.map(a => ({
        achievementId: a.id,
        progress: 0,
        unlocked: false,
        notificationShown: false,
      })),
      unlockedUnits: ['TR', 'TH', 'H'], // Starting units
      unlockedAbilities: [],
      unlockedCosmetics: [],
      unitUpgrades: new Map(),
      currentTitle: null,
      equippedCosmetics: {},
      dailyChallenges: this.generateDailyChallenges(),
      stats: {
        fastestWin: 0,
        longestGame: 0,
        mostKillsInGame: 0,
        mostSilkInGame: 0,
        highestCombo: 0,
        criticalHitsLanded: 0,
        abilitiesUsed: 0,
        unitsLost: 0,
        goldDelivered: 0,
        trapsTriggered: 0,
        bossesDefeatedSolo: 0,
        gamesWithoutDamage: 0,
      },
    };

    this.profiles.set(playerId, profile);
    return profile;
  }

  getProfile(playerId: string): PlayerProfile | undefined {
    return this.profiles.get(playerId);
  }

  // ==========================================================================
  // XP & LEVEL PROGRESSION
  // ==========================================================================

  addXP(playerId: string, amount: number, source: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    // Apply prestige bonus
    const prestigeBonus = profile.prestigeLevel * PROGRESSION_CONFIG.PRESTIGE_XP_BONUS;
    const bonusAmount = Math.floor(amount * (1 + prestigeBonus));

    profile.xp += bonusAmount;
    profile.totalXp += bonusAmount;

    // Check for level up
    while (profile.xp >= this.getXPRequiredForLevel(profile.level)) {
      profile.xp -= this.getXPRequiredForLevel(profile.level);
      profile.level++;

      this.emit('LEVEL_UP', {
        playerId,
        level: profile.level,
        rewards: this.getLevelUpRewards(profile.level),
      });

      // Trigger juice effect
      this.triggerJuiceEffect({
        type: 'PARTICLES',
        intensity: 1.0,
        duration: 2000,
        trigger: 'LEVEL_UP',
      });

      // Check for new unlocks
      this.checkUnlocks(profile);

      // Max level reached
      if (profile.level >= PROGRESSION_CONFIG.MAX_LEVEL) {
        profile.xp = 0;
        break;
      }
    }
  }

  getXPRequiredForLevel(level: number): number {
    return Math.floor(
      PROGRESSION_CONFIG.XP_PER_LEVEL *
      Math.pow(PROGRESSION_CONFIG.LEVEL_SCALING, level - 1)
    );
  }

  getLevelUpRewards(level: number): { silk: number; unlocks: string[] } {
    const rewards = {
      silk: level * 10,
      unlocks: [] as string[],
    };

    // Check for unlocks at this level
    UNLOCKABLES.forEach(unlock => {
      if (unlock.unlockRequirement.level === level) {
        rewards.unlocks.push(unlock.name);
      }
    });

    return rewards;
  }

  // ==========================================================================
  // PRESTIGE SYSTEM
  // ==========================================================================

  canPrestige(playerId: string): boolean {
    const profile = this.profiles.get(playerId);
    if (!profile) return false;
    return profile.level >= PROGRESSION_CONFIG.PRESTIGE_LEVEL;
  }

  prestige(playerId: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile || !this.canPrestige(playerId)) return;

    profile.prestigeLevel++;
    profile.level = 1;
    profile.xp = 0;

    // Keep unlocks and achievements, but reset stats
    profile.totalGamesPlayed = 0;
    profile.totalWins = 0;
    profile.totalLosses = 0;
    profile.winStreak = 0;

    this.emit('PRESTIGE_UP', {
      playerId,
      prestigeLevel: profile.prestigeLevel,
    });

    // Trigger epic juice effect
    this.triggerJuiceEffect({
      type: 'SLOW_MOTION',
      intensity: 0.5,
      duration: 1000,
      trigger: 'PRESTIGE',
    });

    this.triggerJuiceEffect({
      type: 'PARTICLES',
      intensity: 2.0,
      duration: 3000,
      trigger: 'PRESTIGE',
    });
  }

  // ==========================================================================
  // ACHIEVEMENT SYSTEM
  // ==========================================================================

  checkAchievements(playerId: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    ACHIEVEMENTS.forEach(achievement => {
      const progress = profile.achievements.find(a => a.achievementId === achievement.id);
      if (!progress || progress.unlocked) return;

      let currentValue = 0;

      switch (achievement.requirement.type) {
        case 'COUNTER':
          if (achievement.requirement.counterKey) {
            const key = achievement.requirement.counterKey;
            currentValue = (profile[key as keyof PlayerProfile] as number) ||
                          (profile.stats[key as keyof PlayerStats] as number) || 0;
          }
          break;

        case 'STREAK':
          if (achievement.requirement.counterKey) {
            currentValue = profile[achievement.requirement.counterKey as keyof PlayerProfile] as number || 0;
          }
          break;

        case 'SPECIAL_CONDITION':
          if (achievement.requirement.condition && achievement.requirement.condition(profile)) {
            currentValue = achievement.requirement.target;
          }
          break;

        case 'MILESTONE':
          if (achievement.requirement.counterKey) {
            currentValue = profile[achievement.requirement.counterKey as keyof PlayerProfile] as number || 0;
          }
          break;
      }

      progress.progress = currentValue;

      // Check if unlocked
      if (currentValue >= achievement.requirement.target) {
        this.unlockAchievement(playerId, achievement.id);
      }
    });
  }

  unlockAchievement(playerId: string, achievementId: string): void {
    const profile = this.profiles.get(playerId);
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);

    if (!profile || !achievement) return;

    const progress = profile.achievements.find(a => a.achievementId === achievementId);
    if (!progress || progress.unlocked) return;

    progress.unlocked = true;
    progress.unlockedAt = Date.now();

    // Apply rewards
    this.addXP(playerId, achievement.rewards.xp, `achievement:${achievementId}`);

    if (achievement.rewards.silk) {
      // Add silk (implement in your game state)
    }

    if (achievement.rewards.title) {
      profile.currentTitle = achievement.rewards.title;
    }

    if (achievement.rewards.cosmetic) {
      profile.unlockedCosmetics.push(achievement.rewards.cosmetic);
    }

    if (achievement.rewards.unit) {
      profile.unlockedUnits.push(achievement.rewards.unit);
    }

    if (achievement.rewards.ability) {
      profile.unlockedAbilities.push(achievement.rewards.ability);
    }

    // Emit event
    this.emit('ACHIEVEMENT_UNLOCKED', {
      playerId,
      achievement,
      timestamp: Date.now(),
    });

    // Trigger juice effect
    this.triggerJuiceEffect({
      type: 'PARTICLES',
      intensity: 1.5,
      duration: 2000,
      trigger: 'ACHIEVEMENT',
    });
  }

  // ==========================================================================
  // DAILY CHALLENGES
  // ==========================================================================

  generateDailyChallenges(): DailyChallenge[] {
    const today = new Date().toISOString().split('T')[0];
    const challenges: DailyChallenge[] = [];

    // Generate 3 challenges: 1 easy, 1 medium, 1 hard
    const difficulties: ('EASY' | 'MEDIUM' | 'HARD')[] = ['EASY', 'MEDIUM', 'HARD'];

    difficulties.forEach((diff, index) => {
      const templates = CHALLENGE_TEMPLATES.filter(t => t.difficulty === diff);
      const template = templates[Math.floor(Math.random() * templates.length)];

      challenges.push({
        id: `daily_${today}_${index}`,
        date: today,
        name: template.name,
        description: template.description,
        difficulty: template.difficulty,
        objective: template.objective as ChallengeObjective,
        progress: 0,
        completed: false,
        rewards: template.rewards as ChallengeReward,
        expiresAt: new Date(new Date().setHours(23, 59, 59, 999)).getTime(),
      });
    });

    return challenges;
  }

  updateChallengeProgress(playerId: string, type: string, amount: number = 1): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.dailyChallenges.forEach(challenge => {
      if (challenge.completed) return;

      if (challenge.objective.type === type) {
        challenge.progress += amount;

        if (challenge.progress >= challenge.objective.target) {
          this.completeChallenge(playerId, challenge.id);
        }
      }
    });
  }

  completeChallenge(playerId: string, challengeId: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    const challenge = profile.dailyChallenges.find(c => c.id === challengeId);
    if (!challenge || challenge.completed) return;

    challenge.completed = true;

    // Apply rewards
    this.addXP(playerId, challenge.rewards.xp, `challenge:${challengeId}`);

    // Emit event
    this.emit('CHALLENGE_COMPLETED', {
      playerId,
      challenge,
      timestamp: Date.now(),
    });

    // Trigger juice effect
    this.triggerJuiceEffect({
      type: 'PARTICLES',
      intensity: 1.2,
      duration: 1500,
      trigger: 'CHALLENGE_COMPLETED',
    });
  }

  refreshDailyChallenges(playerId: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    const today = new Date().toISOString().split('T')[0];
    const currentDate = profile.dailyChallenges[0]?.date;

    if (currentDate !== today) {
      profile.dailyChallenges = this.generateDailyChallenges();
    }
  }

  // ==========================================================================
  // STREAK SYSTEM
  // ==========================================================================

  recordWin(playerId: string, gameData: GameData): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.totalWins++;
    profile.winStreak++;
    profile.totalGamesPlayed++;

    if (profile.winStreak > profile.bestWinStreak) {
      profile.bestWinStreak = profile.winStreak;
    }

    // Win streak bonuses
    const streakBonus = this.calculateStreakBonus(profile.winStreak);
    if (streakBonus) {
      this.emit('STREAK_MILESTONE', {
        playerId,
        streak: streakBonus,
        timestamp: Date.now(),
      });

      this.addXP(playerId, streakBonus.bonusXP, 'win_streak');
    }

    // Base win XP
    this.addXP(playerId, PROGRESSION_CONFIG.XP_WIN, 'game_win');

    // Update stats
    if (gameData.roundNumber < profile.stats.fastestWin || profile.stats.fastestWin === 0) {
      profile.stats.fastestWin = gameData.roundNumber;
    }

    if (gameData.kills > profile.stats.mostKillsInGame) {
      profile.stats.mostKillsInGame = gameData.kills;
    }

    if (gameData.silkCollected > profile.stats.mostSilkInGame) {
      profile.stats.mostSilkInGame = gameData.silkCollected;
    }

    if (gameData.damageTaken === 0) {
      profile.stats.gamesWithoutDamage++;
    }

    // Update daily challenges
    this.updateChallengeProgress(playerId, 'WIN_STREAK', 1);

    // Check achievements
    this.checkAchievements(playerId);
  }

  recordLoss(playerId: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.totalLosses++;
    profile.winStreak = 0; // Reset streak
    profile.totalGamesPlayed++;

    // Still get some XP for participation
    this.addXP(playerId, PROGRESSION_CONFIG.XP_LOSS, 'game_loss');
  }

  calculateStreakBonus(streak: number): StreakBonus | null {
    if (streak < 3) return null;

    const index = Math.min(streak, PROGRESSION_CONFIG.WIN_STREAK_BONUS.length - 1);
    const bonusXP = PROGRESSION_CONFIG.WIN_STREAK_BONUS[index];

    return {
      type: 'WIN_STREAK',
      count: streak,
      multiplier: 1 + (streak * 0.1),
      bonusXP,
      bonusSilk: Math.floor(bonusXP / 2),
    };
  }

  // ==========================================================================
  // COMBAT TRACKING
  // ==========================================================================

  recordKill(playerId: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.totalKills++;
    this.addXP(playerId, PROGRESSION_CONFIG.XP_KILL, 'kill');
    this.updateChallengeProgress(playerId, 'KILL_COUNT', 1);
    this.checkAchievements(playerId);
  }

  recordBossKill(playerId: string, roundsToDefeat: number): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.totalBossesDefeated++;
    this.addXP(playerId, PROGRESSION_CONFIG.XP_BOSS_KILL, 'boss_kill');

    // Check for speed achievement
    if (roundsToDefeat <= 10) {
      this.updateChallengeProgress(playerId, 'DEFEAT_BOSS_FAST', 1);
    }

    this.checkAchievements(playerId);

    // Epic juice effect for boss kill
    this.triggerJuiceEffect({
      type: 'SLOW_MOTION',
      intensity: 0.2,
      duration: 800,
      trigger: 'BOSS_DEATH',
    });

    this.triggerJuiceEffect({
      type: 'SCREEN_SHAKE',
      intensity: 0.8,
      duration: 300,
      trigger: 'BOSS_DEATH',
    });
  }

  recordCriticalHit(playerId: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.stats.criticalHitsLanded++;
    this.checkAchievements(playerId);

    // Juice effect
    this.triggerJuiceEffect({
      type: 'SLOW_MOTION',
      intensity: 0.3,
      duration: 300,
      trigger: 'CRITICAL_HIT',
    });

    this.triggerJuiceEffect({
      type: 'SCREEN_SHAKE',
      intensity: 0.5,
      duration: 200,
      trigger: 'CRITICAL_HIT',
    });
  }

  recordCombo(playerId: string, comboCount: number): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    if (comboCount > profile.stats.highestCombo) {
      profile.stats.highestCombo = comboCount;
      this.checkAchievements(playerId);
    }

    // Combo milestones
    if (PROGRESSION_CONFIG.COMBO_THRESHOLDS.includes(comboCount)) {
      this.emit('COMBO_MILESTONE', {
        playerId,
        combo: comboCount,
        timestamp: Date.now(),
      });
    }
  }

  recordSilkCollected(playerId: string, amount: number): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.totalSilkCollected += amount;
    this.addXP(playerId, PROGRESSION_CONFIG.XP_SILK_COLLECTED * amount, 'silk_collected');
    this.updateChallengeProgress(playerId, 'COLLECT_SILK', amount);
    this.checkAchievements(playerId);
  }

  recordPerfectRound(playerId: string): void {
    const profile = this.profiles.get(playerId);
    if (!profile) return;

    profile.perfectRounds++;
    this.addXP(playerId, PROGRESSION_CONFIG.XP_PERFECT_ROUND, 'perfect_round');

    this.emit('PERFECT_ROUND', {
      playerId,
      timestamp: Date.now(),
    });

    // Epic juice effect
    this.triggerJuiceEffect({
      type: 'SLOW_MOTION',
      intensity: 0.5,
      duration: 400,
      trigger: 'PERFECT_ROUND',
    });

    this.triggerJuiceEffect({
      type: 'PARTICLES',
      intensity: 1.5,
      duration: 2000,
      trigger: 'PERFECT_ROUND',
    });

    this.checkAchievements(playerId);
  }

  // ==========================================================================
  // UPGRADE SYSTEM
  // ==========================================================================

  upgradeUnit(playerId: string, unitType: string, silkCost: number): boolean {
    const profile = this.profiles.get(playerId);
    if (!profile) return false;

    const currentLevel = profile.unitUpgrades.get(unitType) || 0;
    const upgradeSystem = UNIT_UPGRADES[unitType];

    if (!upgradeSystem || currentLevel >= upgradeSystem.maxLevel) {
      return false;
    }

    const nextUpgrade = upgradeSystem.upgrades[currentLevel];
    if (!nextUpgrade) return false;

    // Check if player has enough silk (implement in your game logic)
    // For now, assume they do

    profile.unitUpgrades.set(unitType, currentLevel + 1);

    this.emit('UNIT_UPGRADED', {
      playerId,
      unitType,
      level: currentLevel + 1,
      upgrade: nextUpgrade,
    });

    return true;
  }

  getUnitStats(playerId: string, unitType: string, baseStats: any): any {
    const profile = this.profiles.get(playerId);
    if (!profile) return baseStats;

    const upgradeLevel = profile.unitUpgrades.get(unitType) || 0;
    const upgradeSystem = UNIT_UPGRADES[unitType];

    if (!upgradeSystem) return baseStats;

    const stats = { ...baseStats };

    // Apply all upgrades up to current level
    for (let i = 0; i < upgradeLevel; i++) {
      const upgrade = upgradeSystem.upgrades[i];
      if (!upgrade) continue;

      switch (upgrade.stat) {
        case 'HP':
          stats.maxHp += upgrade.increase;
          stats.hp += upgrade.increase;
          break;
        case 'ATTACK':
          stats.attackDamage += upgrade.increase;
          break;
        case 'DEFENSE':
          stats.defense += upgrade.increase;
          break;
        case 'SPEED':
          stats.movementSpeed += upgrade.increase;
          break;
        case 'RANGE':
          stats.attackRange += upgrade.increase;
          break;
      }
    }

    return stats;
  }

  // ==========================================================================
  // UNLOCKS
  // ==========================================================================

  checkUnlocks(profile: PlayerProfile): void {
    UNLOCKABLES.forEach(unlock => {
      const req = unlock.unlockRequirement;

      let canUnlock = false;

      if (req.level && profile.level >= req.level) {
        canUnlock = true;
      }

      if (req.prestige && profile.prestigeLevel >= req.prestige) {
        canUnlock = true;
      }

      if (req.achievement) {
        const achievement = profile.achievements.find(a => a.achievementId === req.achievement);
        if (achievement?.unlocked) {
          canUnlock = true;
        }
      }

      if (canUnlock) {
        // Check if not already unlocked
        let alreadyUnlocked = false;

        switch (unlock.type) {
          case 'UNIT':
            alreadyUnlocked = profile.unlockedUnits.includes(unlock.id);
            if (!alreadyUnlocked) profile.unlockedUnits.push(unlock.id);
            break;
          case 'ABILITY':
            alreadyUnlocked = profile.unlockedAbilities.includes(unlock.id);
            if (!alreadyUnlocked) profile.unlockedAbilities.push(unlock.id);
            break;
          case 'COSMETIC':
            alreadyUnlocked = profile.unlockedCosmetics.includes(unlock.id);
            if (!alreadyUnlocked) profile.unlockedCosmetics.push(unlock.id);
            break;
        }

        if (!alreadyUnlocked) {
          this.emit('UNIT_UNLOCKED', {
            playerId: profile.playerId,
            unlock,
            timestamp: Date.now(),
          });
        }
      }
    });
  }

  // ==========================================================================
  // JUICE & FEEL
  // ==========================================================================

  triggerJuiceEffect(effect: JuiceEffect): void {
    this.emit('JUICE_EFFECT', effect);
  }

  // ==========================================================================
  // RISK/REWARD MECHANICS
  // ==========================================================================

  gambleSilk(playerId: string, amount: number): { won: boolean; reward: number } {
    const chance = 0.5; // 50/50 chance
    const won = Math.random() < chance;

    const result = {
      won,
      reward: won ? amount * 2 : 0,
    };

    this.emit('GAMBLE_RESULT', {
      playerId,
      amount,
      result,
      timestamp: Date.now(),
    });

    return result;
  }
}

// ============================================================================
// GAME SESSION TRACKING
// ============================================================================

interface GameSession {
  playerId: string;
  startTime: number;
  kills: number;
  damageTaken: number;
  silkCollected: number;
  abilitiesUsed: number;
  combos: number[];
  bossesDefeated: number;
}

interface GameData {
  roundNumber: number;
  kills: number;
  damageTaken: number;
  silkCollected: number;
  unitsLost: number;
}

// Export singleton instance
export const gameplayEngine = new GameplayEnhancementEngine();
