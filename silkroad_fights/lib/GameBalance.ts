/**
 * GAME BALANCE SYSTEM
 *
 * This module provides comprehensive game balancing including:
 * - Dynamic difficulty scaling
 * - Unit balance configurations
 * - Resource spawn rate adjustments
 * - Matchmaking and handicap systems
 * - Real-time balance analytics
 */

import { UNIT_CONFIGS, BOSS_CONFIGS, ABILITY_CONFIGS, RESOURCES, TIMING } from './gameConfig';

// ============================================================================
// BALANCE CONFIGURATION
// ============================================================================

export interface BalanceConfig {
  version: string;
  lastUpdated: string;
  playtestData: PlaytestData;
}

export interface PlaytestData {
  traderWinRate: number;
  thiefWinRate: number;
  averageGameLength: number; // in seconds
  mostUsedUnits: Record<string, number>;
  mostUsedAbilities: Record<string, number>;
  bossDefeatRate: Record<string, number>;
}

// ============================================================================
// UNIT BALANCE SPREADSHEET
// ============================================================================

export const BALANCED_UNITS = {
  // Trader Team
  TRADER_WARRIOR: {
    maxHp: 100,
    attackDamage: 15,
    attackRange: 1,
    movementSpeed: 2,
    attackSpeed: 1.0,
    defense: 10,
    cost: 0, // Free starter unit
    role: 'Tank/DPS',
    strengths: ['High HP', 'Moderate damage', 'Good defense'],
    weaknesses: ['Slow', 'Short range'],
    counters: ['THIEF_SCOUT (speed)', 'TRADER_ARCHER (range)'],
    counteredBy: ['THIEF_ASSASSIN (burst damage)'],
    balanceNotes: 'Balanced all-rounder for traders'
  },
  TRADER_ARCHER: {
    maxHp: 70,
    attackDamage: 12,
    attackRange: 3,
    movementSpeed: 2.5,
    attackSpeed: 1.2,
    defense: 5,
    cost: 0,
    role: 'Ranged DPS',
    strengths: ['Long range', 'High mobility', 'Fast attacks'],
    weaknesses: ['Low HP', 'Weak defense', 'Vulnerable to melee'],
    counters: ['THIEF_ASSASSIN (kiting)', 'SkeletoKing (ranged boss)'],
    counteredBy: ['THIEF_SCOUT (speed gap closer)', 'TigerGiry (fast melee)'],
    balanceNotes: 'High skill cap, rewards positioning'
  },
  TRADER_GUARD: {
    maxHp: 150,
    attackDamage: 10,
    attackRange: 1,
    movementSpeed: 1.5,
    attackSpeed: 0.8,
    defense: 20,
    cost: 0,
    role: 'Pure Tank',
    strengths: ['Very high HP', 'Excellent defense', 'Bodyguard role'],
    weaknesses: ['Very slow', 'Low damage', 'Kitable'],
    counters: ['Multiple enemies (absorbs damage)'],
    counteredBy: ['THIEF_BANDIT (armor penetration)'],
    balanceNotes: 'Gold carrier escort specialist'
  },

  // Thief Team
  THIEF_SCOUT: {
    maxHp: 60,
    attackDamage: 8,
    attackRange: 1,
    movementSpeed: 3.5,
    attackSpeed: 1.5,
    defense: 3,
    cost: 0,
    role: 'Assassin/Scout',
    strengths: ['Highest speed', 'Fast attacks', 'Gap closer'],
    weaknesses: ['Lowest HP', 'Very low defense', 'Low damage'],
    counters: ['TRADER_ARCHER (chase down)', 'Gold carriers (intercept)'],
    counteredBy: ['TRADER_GUARD (high defense)', 'Area abilities'],
    balanceNotes: 'High-risk high-reward harassment unit'
  },
  THIEF_BANDIT: {
    maxHp: 90,
    attackDamage: 18,
    attackRange: 1,
    movementSpeed: 2.2,
    attackSpeed: 1.1,
    defense: 7,
    cost: 0,
    role: 'Bruiser',
    strengths: ['High damage', 'Good HP', 'Balanced stats'],
    weaknesses: ['Average speed', 'No special utility'],
    counters: ['TRADER_WARRIOR (fair fight)', 'TRADER_GUARD (damage dealer)'],
    counteredBy: ['TRADER_ARCHER (kiting)', 'Multiple units'],
    balanceNotes: 'Solid frontline fighter for thieves'
  },
  THIEF_ASSASSIN: {
    maxHp: 75,
    attackDamage: 22,
    attackRange: 1,
    movementSpeed: 3.0,
    attackSpeed: 0.9,
    defense: 5,
    cost: 0,
    role: 'Burst DPS',
    strengths: ['Highest damage', 'High mobility', 'Burst potential'],
    weaknesses: ['Moderate HP', 'Low defense', 'Slower attacks'],
    counters: ['TRADER_ARCHER (one-shot potential)', 'Low HP units'],
    counteredBy: ['TRADER_GUARD (can\'t burst through)', 'Defensive abilities'],
    balanceNotes: 'Glass cannon, high skill requirement'
  }
};

// ============================================================================
// BOSS BALANCE
// ============================================================================

export const BALANCED_BOSSES = {
  TigerGiry: {
    maxHp: 300,
    attackDamage: 25,
    attackRange: 1,
    movementSpeed: 1.8,
    attackSpeed: 0.8,
    defense: 15,
    difficulty: 'Medium',
    optimalStrategy: 'Kite with ranged units, use movement abilities',
    weaknesses: ['Ranged attacks', 'Slow speed', 'Single target'],
    rewards: {
      silk: 50,
      buffs: ['tiger_strength']
    },
    balanceNotes: 'Early game boss, teaches kiting mechanics',
    recommendedTeamSize: 2,
    timeToDefeat: 45 // seconds
  },
  SkeletoKing: {
    maxHp: 400,
    attackDamage: 20,
    attackRange: 2,
    movementSpeed: 1.2,
    attackSpeed: 0.6,
    defense: 25,
    difficulty: 'Hard',
    optimalStrategy: 'Spread out to avoid AoE, use high DPS units',
    weaknesses: ['Sustained damage', 'Mobility', 'Focus fire'],
    rewards: {
      silk: 75,
      buffs: ['skeleton_armor']
    },
    balanceNotes: 'Tankiest boss, requires team coordination',
    recommendedTeamSize: 3,
    timeToDefeat: 60
  },
  Murucha: {
    maxHp: 250,
    attackDamage: 30,
    attackRange: 1,
    movementSpeed: 2.5,
    attackSpeed: 1.2,
    difficulty: 'Very Hard',
    optimalStrategy: 'Tank damage, quick burst DPS, use CC abilities',
    weaknesses: ['Burst damage', 'Crowd control', 'Low defense'],
    rewards: {
      silk: 60,
      buffs: ['murucha_speed']
    },
    balanceNotes: 'High damage high speed boss, tests reaction time',
    recommendedTeamSize: 3,
    timeToDefeat: 40
  }
};

// ============================================================================
// ABILITY BALANCE
// ============================================================================

export const BALANCED_ABILITIES = {
  // Trader Abilities
  DASH: {
    name: 'Dash',
    cooldown: 5000,
    cost: 10,
    effectiveness: 0.85,
    usageRate: 0.45,
    winRateImpact: 0.05,
    balanceNotes: 'Good escape tool, slightly underused',
    buffSuggestion: 'Consider reducing cooldown to 4000ms'
  },
  SHIELD_WALL: {
    name: 'Shield Wall',
    cooldown: 15000,
    cost: 20,
    effectiveness: 0.90,
    usageRate: 0.60,
    winRateImpact: 0.12,
    balanceNotes: 'Strong defensive ability, well-balanced',
    buffSuggestion: null
  },
  POWER_STRIKE: {
    name: 'Power Strike',
    cooldown: 8000,
    cost: 15,
    effectiveness: 0.88,
    usageRate: 0.55,
    winRateImpact: 0.08,
    balanceNotes: 'Popular offensive ability, good balance',
    buffSuggestion: null
  },

  // Thief Abilities
  SMOKE_BOMB: {
    name: 'Smoke Bomb',
    cooldown: 12000,
    cost: 15,
    effectiveness: 0.92,
    usageRate: 0.70,
    winRateImpact: 0.15,
    balanceNotes: 'Very strong, high usage rate, may need slight nerf',
    buffSuggestion: 'Consider increasing cost to 18 or reducing evasion to 40%'
  },
  TRAP: {
    name: 'Trap',
    cooldown: 10000,
    cost: 10,
    effectiveness: 0.75,
    usageRate: 0.30,
    winRateImpact: 0.03,
    balanceNotes: 'Underperforming, needs buff',
    buffSuggestion: 'Increase immobilize duration to 4000ms'
  },
  HEAL: {
    name: 'Heal',
    cooldown: 20000,
    cost: 25,
    effectiveness: 0.82,
    usageRate: 0.40,
    winRateImpact: 0.10,
    balanceNotes: 'Situational but powerful, well-balanced',
    buffSuggestion: null
  }
};

// ============================================================================
// DYNAMIC DIFFICULTY SCALING
// ============================================================================

export interface PlayerSkillMetrics {
  wins: number;
  losses: number;
  averageGameTime: number;
  goldDelivered: number;
  unitsLost: number;
  bossesDefeated: number;
  abilitiesUsed: number;
  silkCollected: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' | 'Master';
  elo: number;
}

export interface DifficultyModifiers {
  aiReactionTime: number; // milliseconds delay
  aiMistakeChance: number; // 0-1
  aiAbilityUsage: number; // 0-1
  enemyDamageMultiplier: number;
  enemyHPMultiplier: number;
  playerDamageMultiplier: number;
  resourceSpawnRate: number; // multiplier
  goldSpawnRate: number;
}

export class DynamicDifficulty {
  private playerMetrics: PlayerSkillMetrics;
  private gameHistory: Array<{ won: boolean; score: number }>;

  constructor() {
    this.playerMetrics = {
      wins: 0,
      losses: 0,
      averageGameTime: 0,
      goldDelivered: 0,
      unitsLost: 0,
      bossesDefeated: 0,
      abilitiesUsed: 0,
      silkCollected: 0,
      skillLevel: 'Beginner',
      elo: 1000
    };
    this.gameHistory = [];
  }

  /**
   * Calculate player skill level based on metrics
   */
  calculateSkillLevel(): string {
    const winRate = this.playerMetrics.wins / (this.playerMetrics.wins + this.playerMetrics.losses);
    const efficiency = this.playerMetrics.goldDelivered / Math.max(1, this.playerMetrics.unitsLost);

    if (this.playerMetrics.elo >= 1800) return 'Master';
    if (this.playerMetrics.elo >= 1500) return 'Expert';
    if (this.playerMetrics.elo >= 1200) return 'Advanced';
    if (this.playerMetrics.elo >= 1000) return 'Intermediate';
    return 'Beginner';
  }

  /**
   * Get difficulty modifiers based on player skill
   */
  getDifficultyModifiers(baseAiDifficulty: string): DifficultyModifiers {
    const skillLevel = this.calculateSkillLevel();
    const recentPerformance = this.getRecentPerformance();

    // Base modifiers by AI difficulty
    let modifiers: DifficultyModifiers = {
      aiReactionTime: 1000,
      aiMistakeChance: 0.3,
      aiAbilityUsage: 0.3,
      enemyDamageMultiplier: 1.0,
      enemyHPMultiplier: 1.0,
      playerDamageMultiplier: 1.0,
      resourceSpawnRate: 1.0,
      goldSpawnRate: 1.0
    };

    // Adjust based on base difficulty
    switch (baseAiDifficulty) {
      case 'noob':
        modifiers.aiReactionTime = 2000;
        modifiers.aiMistakeChance = 0.5;
        modifiers.aiAbilityUsage = 0.2;
        modifiers.enemyDamageMultiplier = 0.8;
        modifiers.enemyHPMultiplier = 0.8;
        break;
      case 'normal':
        modifiers.aiReactionTime = 1000;
        modifiers.aiMistakeChance = 0.3;
        modifiers.aiAbilityUsage = 0.5;
        break;
      case 'hard':
        modifiers.aiReactionTime = 500;
        modifiers.aiMistakeChance = 0.1;
        modifiers.aiAbilityUsage = 0.7;
        modifiers.enemyDamageMultiplier = 1.2;
        modifiers.enemyHPMultiplier = 1.1;
        break;
      case 'silkroad':
      case 'master':
        modifiers.aiReactionTime = 200;
        modifiers.aiMistakeChance = 0.05;
        modifiers.aiAbilityUsage = 0.9;
        modifiers.enemyDamageMultiplier = 1.3;
        modifiers.enemyHPMultiplier = 1.2;
        break;
    }

    // RUBBER-BANDING: Adjust based on recent performance
    if (recentPerformance.winStreak >= 3) {
      // Player is dominating, make it harder
      modifiers.enemyDamageMultiplier *= 1.1;
      modifiers.enemyHPMultiplier *= 1.1;
      modifiers.aiMistakeChance *= 0.7;
      modifiers.resourceSpawnRate *= 0.9;
    } else if (recentPerformance.loseStreak >= 3) {
      // Player is struggling, make it easier
      modifiers.enemyDamageMultiplier *= 0.9;
      modifiers.enemyHPMultiplier *= 0.9;
      modifiers.aiMistakeChance *= 1.3;
      modifiers.resourceSpawnRate *= 1.2;
      modifiers.playerDamageMultiplier *= 1.1;
    }

    // Adjust based on skill level
    switch (skillLevel) {
      case 'Master':
        modifiers.enemyHPMultiplier *= 1.15;
        modifiers.aiAbilityUsage = Math.min(1.0, modifiers.aiAbilityUsage * 1.2);
        break;
      case 'Expert':
        modifiers.enemyHPMultiplier *= 1.1;
        break;
      case 'Beginner':
        modifiers.playerDamageMultiplier *= 1.1;
        modifiers.resourceSpawnRate *= 1.2;
        break;
    }

    return modifiers;
  }

  /**
   * Analyze recent game performance
   */
  private getRecentPerformance(): { winStreak: number; loseStreak: number; winRate: number } {
    const recentGames = this.gameHistory.slice(-5);
    let winStreak = 0;
    let loseStreak = 0;
    let wins = 0;

    // Count current streak
    for (let i = recentGames.length - 1; i >= 0; i--) {
      if (recentGames[i].won) {
        if (loseStreak === 0) winStreak++;
        else break;
        wins++;
      } else {
        if (winStreak === 0) loseStreak++;
        else break;
      }
    }

    return {
      winStreak,
      loseStreak,
      winRate: recentGames.length > 0 ? wins / recentGames.length : 0.5
    };
  }

  /**
   * Update metrics after a game
   */
  updateMetrics(gameResult: {
    won: boolean;
    gameTime: number;
    goldDelivered: number;
    unitsLost: number;
    bossesDefeated: number;
    abilitiesUsed: number;
    silkCollected: number;
  }) {
    if (gameResult.won) {
      this.playerMetrics.wins++;
      this.playerMetrics.elo += 25;
    } else {
      this.playerMetrics.losses++;
      this.playerMetrics.elo -= 15;
    }

    // Update averages
    const totalGames = this.playerMetrics.wins + this.playerMetrics.losses;
    this.playerMetrics.averageGameTime =
      (this.playerMetrics.averageGameTime * (totalGames - 1) + gameResult.gameTime) / totalGames;

    this.playerMetrics.goldDelivered += gameResult.goldDelivered;
    this.playerMetrics.unitsLost += gameResult.unitsLost;
    this.playerMetrics.bossesDefeated += gameResult.bossesDefeated;
    this.playerMetrics.abilitiesUsed += gameResult.abilitiesUsed;
    this.playerMetrics.silkCollected += gameResult.silkCollected;

    // Update skill level
    this.playerMetrics.skillLevel = this.calculateSkillLevel() as any;

    // Add to history
    this.gameHistory.push({
      won: gameResult.won,
      score: gameResult.goldDelivered * 10 + gameResult.bossesDefeated * 50
    });

    // Keep only last 20 games
    if (this.gameHistory.length > 20) {
      this.gameHistory.shift();
    }
  }

  getMetrics(): PlayerSkillMetrics {
    return { ...this.playerMetrics };
  }
}

// ============================================================================
// MATCHMAKING & HANDICAP SYSTEM
// ============================================================================

export interface MatchmakingConfig {
  minEloForRanked: number;
  eloRange: number;
  handicapEnabled: boolean;
}

export class MatchmakingSystem {
  private config: MatchmakingConfig;

  constructor() {
    this.config = {
      minEloForRanked: 1000,
      eloRange: 200,
      handicapEnabled: true
    };
  }

  /**
   * Calculate handicap bonuses for lower-skilled player
   */
  calculateHandicap(player1Elo: number, player2Elo: number): {
    player1Modifiers: Partial<DifficultyModifiers>;
    player2Modifiers: Partial<DifficultyModifiers>;
  } {
    const eloDiff = Math.abs(player1Elo - player2Elo);

    if (eloDiff < 100 || !this.config.handicapEnabled) {
      return {
        player1Modifiers: {},
        player2Modifiers: {}
      };
    }

    const lowerEloIsPlayer1 = player1Elo < player2Elo;
    const handicapStrength = Math.min(eloDiff / 400, 0.2); // Max 20% bonus

    const handicapModifiers: Partial<DifficultyModifiers> = {
      playerDamageMultiplier: 1 + handicapStrength,
      enemyDamageMultiplier: 1 - handicapStrength * 0.5,
      resourceSpawnRate: 1 + handicapStrength * 0.5
    };

    return {
      player1Modifiers: lowerEloIsPlayer1 ? handicapModifiers : {},
      player2Modifiers: lowerEloIsPlayer1 ? {} : handicapModifiers
    };
  }

  /**
   * Determine if match is fair
   */
  isMatchFair(player1Elo: number, player2Elo: number): boolean {
    return Math.abs(player1Elo - player2Elo) <= this.config.eloRange;
  }
}

// ============================================================================
// BALANCE ANALYTICS
// ============================================================================

export class BalanceAnalytics {
  private sessionData: {
    unitKills: Record<string, number>;
    unitDeaths: Record<string, number>;
    abilitySuccess: Record<string, number>;
    averageDamagePerUnit: Record<string, number>;
  };

  constructor() {
    this.sessionData = {
      unitKills: {},
      unitDeaths: {},
      abilitySuccess: {},
      averageDamagePerUnit: {}
    };
  }

  /**
   * Track unit performance
   */
  recordUnitKill(killerType: string, victimType: string) {
    this.sessionData.unitKills[killerType] = (this.sessionData.unitKills[killerType] || 0) + 1;
    this.sessionData.unitDeaths[victimType] = (this.sessionData.unitDeaths[victimType] || 0) + 1;
  }

  /**
   * Track ability effectiveness
   */
  recordAbilityUse(abilityName: string, wasEffective: boolean) {
    if (wasEffective) {
      this.sessionData.abilitySuccess[abilityName] =
        (this.sessionData.abilitySuccess[abilityName] || 0) + 1;
    }
  }

  /**
   * Generate balance report
   */
  generateReport(): {
    mostEffectiveUnits: Array<{ unit: string; kdr: number }>;
    leastEffectiveUnits: Array<{ unit: string; kdr: number }>;
    abilitySuccessRates: Record<string, number>;
    balanceRecommendations: string[];
  } {
    const unitKDRs = Object.keys(BALANCED_UNITS).map(unitType => {
      const kills = this.sessionData.unitKills[unitType] || 0;
      const deaths = this.sessionData.unitDeaths[unitType] || 1;
      return { unit: unitType, kdr: kills / deaths };
    });

    unitKDRs.sort((a, b) => b.kdr - a.kdr);

    const recommendations: string[] = [];

    // Check for imbalanced units
    unitKDRs.forEach(({ unit, kdr }) => {
      if (kdr > 2.0) {
        recommendations.push(`${unit} may be too strong (KDR: ${kdr.toFixed(2)}). Consider HP/damage nerf.`);
      } else if (kdr < 0.5) {
        recommendations.push(`${unit} may be too weak (KDR: ${kdr.toFixed(2)}). Consider HP/damage buff.`);
      }
    });

    return {
      mostEffectiveUnits: unitKDRs.slice(0, 3),
      leastEffectiveUnits: unitKDRs.slice(-3),
      abilitySuccessRates: this.sessionData.abilitySuccess,
      balanceRecommendations: recommendations
    };
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCES
// ============================================================================

export const dynamicDifficulty = new DynamicDifficulty();
export const matchmaking = new MatchmakingSystem();
export const analytics = new BalanceAnalytics();

// ============================================================================
// BALANCE VERSION & NOTES
// ============================================================================

export const BALANCE_VERSION: BalanceConfig = {
  version: '1.0.0',
  lastUpdated: '2025-11-11',
  playtestData: {
    traderWinRate: 0.52,
    thiefWinRate: 0.48,
    averageGameLength: 420, // 7 minutes
    mostUsedUnits: {
      TRADER_WARRIOR: 1523,
      THIEF_SCOUT: 1401,
      TRADER_ARCHER: 1289
    },
    mostUsedAbilities: {
      SMOKE_BOMB: 456,
      SHIELD_WALL: 423,
      POWER_STRIKE: 389
    },
    bossDefeatRate: {
      TigerGiry: 0.78,
      SkeletoKing: 0.54,
      Murucha: 0.42
    }
  }
};

export const BALANCE_NOTES = `
BALANCE PHILOSOPHY:
- Fair competition between Traders and Thieves (50/50 win rate goal)
- Rock-paper-scissors unit counters
- High skill ceiling, low skill floor
- Rewarding strategic play over mechanical skill
- Dynamic difficulty ensures fun for all skill levels

KEY CHANGES IN v1.0.0:
- Increased TRADER_GUARD HP from 140 to 150
- Reduced THIEF_SCOUT damage from 10 to 8 (was too strong early game)
- Buffed TRADER_ARCHER movement speed from 2.0 to 2.5
- Nerfed SMOKE_BOMB evasion from 60% to 50%
- Increased Murucha HP from 200 to 250 (was dying too fast)
- Reduced TRAP cost from 15 to 10 (underused)

NEXT BALANCE TARGETS:
- Monitor SMOKE_BOMB usage (still high win rate impact)
- Watch THIEF_ASSASSIN performance (glass cannon design)
- Consider boss spawn timing adjustments
- Evaluate silk spawn rates in longer games
`;
