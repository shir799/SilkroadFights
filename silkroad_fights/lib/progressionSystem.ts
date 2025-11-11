/**
 * SILKROAD FIGHTS - PROGRESSION SYSTEM
 * Complete player progression, unlocks, upgrades, and rewards
 */

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface PlayerProfile {
  id: string;
  username: string;
  avatar: string;
  level: number;
  currentXP: number;
  totalXP: number;
  title: string;
  createdAt: number;
  lastLogin: number;

  // Stats
  stats: PlayerStats;

  // Progression
  unlockedUnits: string[];
  unlockedAbilities: string[];
  unlockedModes: string[];
  upgrades: PlayerUpgrades;
  skillTree: SkillTreeProgress;

  // Currency
  silk: number;
  premiumSilk: number;

  // Achievements
  achievements: Achievement[];
  dailyStreak: number;

  // Prestige
  prestigeLevel: number;
  prestigePoints: number;
}

export interface PlayerStats {
  gamesPlayed: number;
  gamesWon: number;
  gamesLost: number;
  winRate: number;

  // Combat stats
  unitsKilled: number;
  unitsLost: number;
  bossesDefeated: number;
  goldDelivered: number;

  // Resource stats
  totalSilkEarned: number;
  totalSilkSpent: number;

  // Time stats
  totalPlaytimeSeconds: number;
  longestGameSeconds: number;

  // Best records
  highestWinStreak: number;
  mostUnitsInOneGame: number;
  fastestWin: number;
}

export interface PlayerUpgrades {
  trader: UnitUpgrades;
  thief: UnitUpgrades;
  hunter: UnitUpgrades;
  kingThief: UnitUpgrades;
}

export interface UnitUpgrades {
  healthLevel: number;        // +1 HP per level
  attackLevel: number;         // +1 attack per level
  speedLevel: number;          // +10% movement speed per level
  specialLevel: number;        // Unit-specific upgrade
  maxLevel: number;
}

export interface SkillTreeProgress {
  offense: SkillBranch;
  defense: SkillBranch;
  economy: SkillBranch;
  pointsAvailable: number;
  totalPointsSpent: number;
}

export interface SkillBranch {
  skills: Skill[];
  tierUnlocked: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  tier: number;
  cost: number;
  unlocked: boolean;
  maxRank: number;
  currentRank: number;
  prerequisite?: string;
  effect: SkillEffect;
}

export interface SkillEffect {
  type: 'passive' | 'active';
  stat: string;
  value: number;
  stackable: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  unlocked: boolean;
  unlockedAt?: number;
  progress: number;
  goal: number;
  reward: Reward;
  hidden: boolean;
}

export interface Reward {
  xp: number;
  silk: number;
  premiumSilk?: number;
  title?: string;
  cosmetic?: string;
  unlock?: string;
}

export interface LevelUnlock {
  level: number;
  rewards: Reward;
  description: string;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  avatar: string;
  level: number;
  score: number;
  title: string;
}

export interface DailyReward {
  day: number;
  silk: number;
  premiumSilk?: number;
  multiplier: number;
}

// ============================================================================
// XP & LEVELING SYSTEM
// ============================================================================

export class XPSystem {
  // XP curve formula: baseXP * (level ^ 1.5)
  private static readonly BASE_XP = 100;
  private static readonly EXPONENT = 1.5;
  private static readonly MAX_LEVEL = 100;

  /**
   * Get XP required for a specific level
   */
  static getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(this.BASE_XP * Math.pow(level, this.EXPONENT));
  }

  /**
   * Get total XP required to reach a level
   */
  static getTotalXPForLevel(level: number): number {
    let total = 0;
    for (let i = 2; i <= level; i++) {
      total += this.getXPForLevel(i);
    }
    return total;
  }

  /**
   * Get level from total XP
   */
  static getLevelFromXP(totalXP: number): number {
    let level = 1;
    let xpAccumulated = 0;

    while (level < this.MAX_LEVEL) {
      const nextLevelXP = this.getXPForLevel(level + 1);
      if (xpAccumulated + nextLevelXP > totalXP) break;
      xpAccumulated += nextLevelXP;
      level++;
    }

    return level;
  }

  /**
   * Get current XP progress within current level
   */
  static getCurrentLevelXP(totalXP: number): number {
    const level = this.getLevelFromXP(totalXP);
    const totalForLevel = this.getTotalXPForLevel(level);
    return totalXP - totalForLevel;
  }

  /**
   * Calculate XP reward based on game performance
   */
  static calculateGameXP(params: {
    won: boolean;
    duration: number;
    unitsKilled: number;
    goldDelivered: number;
    bossesDefeated: number;
    perfectVictory: boolean;
  }): number {
    let xp = 0;

    // Base XP
    xp += params.won ? 50 : 20;

    // Duration bonus (longer games = more XP, capped)
    const durationMinutes = Math.min(params.duration / 60, 30);
    xp += Math.floor(durationMinutes * 2);

    // Combat performance
    xp += params.unitsKilled * 5;
    xp += params.goldDelivered * 10;
    xp += params.bossesDefeated * 25;

    // Perfect victory bonus
    if (params.perfectVictory) {
      xp = Math.floor(xp * 1.5);
    }

    return xp;
  }

  /**
   * Generate XP table for reference
   */
  static generateXPTable(): { level: number; xpRequired: number; totalXP: number }[] {
    const table = [];
    for (let level = 1; level <= this.MAX_LEVEL; level++) {
      table.push({
        level,
        xpRequired: this.getXPForLevel(level),
        totalXP: this.getTotalXPForLevel(level),
      });
    }
    return table;
  }
}

// ============================================================================
// UNLOCK SYSTEM
// ============================================================================

export class UnlockSystem {
  private static readonly UNLOCKS: LevelUnlock[] = [
    {
      level: 1,
      description: "Welcome to Silkroad Fights! Basic units unlocked.",
      rewards: {
        xp: 0,
        silk: 100,
        unlock: "trader,thief",
      },
    },
    {
      level: 5,
      description: "Hunter unit unlocked! Track down enemies with precision.",
      rewards: {
        xp: 0,
        silk: 250,
        unlock: "hunter",
        title: "Silk Merchant",
      },
    },
    {
      level: 10,
      description: "King Thief unlocked! Command the shadows.",
      rewards: {
        xp: 0,
        silk: 500,
        unlock: "kingThief",
        title: "Shadow Walker",
      },
    },
    {
      level: 15,
      description: "Ability upgrades unlocked! Enhance your units.",
      rewards: {
        xp: 0,
        silk: 750,
        unlock: "abilityUpgrades",
        title: "Master Tactician",
      },
    },
    {
      level: 20,
      description: "Boss Rush mode unlocked! Face endless bosses.",
      rewards: {
        xp: 0,
        silk: 1000,
        unlock: "bossRushMode",
        title: "Boss Slayer",
      },
    },
    {
      level: 25,
      description: "Custom game modes unlocked! Create your own rules.",
      rewards: {
        xp: 0,
        silk: 1500,
        unlock: "customModes",
        title: "Game Master",
      },
    },
    {
      level: 30,
      description: "Advanced skill tree tier unlocked!",
      rewards: {
        xp: 0,
        silk: 2000,
        unlock: "skillTier3",
        title: "Silk Road Legend",
      },
    },
    {
      level: 40,
      description: "Elite cosmetics unlocked!",
      rewards: {
        xp: 0,
        silk: 3000,
        unlock: "eliteCosmetics",
        title: "Elite Merchant",
      },
    },
    {
      level: 50,
      description: "Prestige system unlocked! Start your legend anew.",
      rewards: {
        xp: 0,
        silk: 5000,
        premiumSilk: 100,
        unlock: "prestige",
        title: "Legendary Trader",
      },
    },
    {
      level: 75,
      description: "Ultimate skill tree tier unlocked!",
      rewards: {
        xp: 0,
        silk: 10000,
        premiumSilk: 250,
        unlock: "skillTier4",
        title: "Silk Road Master",
      },
    },
    {
      level: 100,
      description: "Maximum level reached! You are a true master of the Silk Road.",
      rewards: {
        xp: 0,
        silk: 25000,
        premiumSilk: 1000,
        title: "Silk Road Immortal",
      },
    },
  ];

  static getUnlocksForLevel(level: number): LevelUnlock[] {
    return this.UNLOCKS.filter(unlock => unlock.level === level);
  }

  static getAllUnlocks(): LevelUnlock[] {
    return [...this.UNLOCKS];
  }

  static isUnlocked(playerLevel: number, requiredLevel: number): boolean {
    return playerLevel >= requiredLevel;
  }

  static getNextUnlock(currentLevel: number): LevelUnlock | null {
    return this.UNLOCKS.find(unlock => unlock.level > currentLevel) || null;
  }
}

// ============================================================================
// UPGRADE SYSTEM
// ============================================================================

export class UpgradeSystem {
  private static readonly UPGRADE_COSTS = {
    health: (level: number) => 100 * Math.pow(1.5, level),
    attack: (level: number) => 150 * Math.pow(1.5, level),
    speed: (level: number) => 200 * Math.pow(1.5, level),
    special: (level: number) => 250 * Math.pow(1.5, level),
  };

  private static readonly MAX_UPGRADE_LEVEL = 20;

  /**
   * Get cost for next upgrade level
   */
  static getUpgradeCost(type: keyof typeof this.UPGRADE_COSTS, currentLevel: number): number {
    if (currentLevel >= this.MAX_UPGRADE_LEVEL) return Infinity;
    return Math.floor(this.UPGRADE_COSTS[type](currentLevel));
  }

  /**
   * Calculate unit stats with upgrades applied
   */
  static applyUpgrades(baseStats: any, upgrades: UnitUpgrades): any {
    return {
      ...baseStats,
      maxHp: baseStats.maxHp + upgrades.healthLevel,
      currentHp: baseStats.currentHp + upgrades.healthLevel,
      attackDamage: baseStats.attackDamage + upgrades.attackLevel,
      movementSpeed: baseStats.movementSpeed * (1 + (upgrades.speedLevel * 0.1)),
      // Special upgrades are unit-specific
    };
  }

  /**
   * Get upgrade descriptions
   */
  static getUpgradeDescription(unitType: string, upgradeType: string, level: number): string {
    const descriptions: Record<string, Record<string, string>> = {
      trader: {
        health: `+${level} HP (Shield boost)`,
        attack: `+${level} Attack damage`,
        speed: `+${level * 10}% Movement speed`,
        special: `+${level * 5}% Gold capacity`,
      },
      thief: {
        health: `+${level} HP`,
        attack: `+${level} Attack damage`,
        speed: `+${level * 10}% Movement speed (Stealth)`,
        special: `+${level * 2}s Stealth duration, +${level * 5}% Critical chance`,
      },
      hunter: {
        health: `+${level} HP`,
        attack: `+${level} Attack damage`,
        speed: `+${level * 10}% Movement speed`,
        special: `+${level} Tracking range, +${level * 10}% Area damage`,
      },
      kingThief: {
        health: `+${level} HP (Boss tier)`,
        attack: `+${level} Attack damage`,
        speed: `+${level * 10}% Movement speed`,
        special: `+${level} Command range, +${level * 5}% Theft success`,
      },
    };

    return descriptions[unitType]?.[upgradeType] || `+${level} ${upgradeType}`;
  }

  /**
   * Total silk spent on upgrades
   */
  static calculateTotalUpgradeCost(upgrades: UnitUpgrades): number {
    let total = 0;
    const types: Array<keyof typeof this.UPGRADE_COSTS> = ['health', 'attack', 'speed', 'special'];

    types.forEach(type => {
      const level = upgrades[`${type}Level` as keyof UnitUpgrades] as number;
      for (let i = 0; i < level; i++) {
        total += this.getUpgradeCost(type, i);
      }
    });

    return total;
  }
}

// ============================================================================
// SKILL TREE SYSTEM
// ============================================================================

export class SkillTreeSystem {
  private static readonly SKILLS: Record<string, Skill[]> = {
    offense: [
      // Tier 1
      {
        id: 'off_1_1',
        name: 'Sharp Blades',
        description: 'All units gain +1 attack damage',
        tier: 1,
        cost: 1,
        unlocked: false,
        maxRank: 3,
        currentRank: 0,
        effect: { type: 'passive', stat: 'attackDamage', value: 1, stackable: true },
      },
      {
        id: 'off_1_2',
        name: 'Quick Strike',
        description: 'Units attack 10% faster',
        tier: 1,
        cost: 1,
        unlocked: false,
        maxRank: 3,
        currentRank: 0,
        effect: { type: 'passive', stat: 'attackSpeed', value: 0.1, stackable: true },
      },
      // Tier 2
      {
        id: 'off_2_1',
        name: 'Critical Strikes',
        description: '15% chance to deal double damage',
        tier: 2,
        cost: 2,
        unlocked: false,
        maxRank: 2,
        currentRank: 0,
        prerequisite: 'off_1_1',
        effect: { type: 'passive', stat: 'critChance', value: 0.15, stackable: false },
      },
      {
        id: 'off_2_2',
        name: 'Bloodlust',
        description: 'Heal 2 HP on unit kill',
        tier: 2,
        cost: 2,
        unlocked: false,
        maxRank: 1,
        currentRank: 0,
        prerequisite: 'off_1_2',
        effect: { type: 'passive', stat: 'healOnKill', value: 2, stackable: false },
      },
      // Tier 3
      {
        id: 'off_3_1',
        name: 'Devastating Blow',
        description: 'Ability: Deal 3x damage on next attack (Cooldown: 30s)',
        tier: 3,
        cost: 3,
        unlocked: false,
        maxRank: 1,
        currentRank: 0,
        prerequisite: 'off_2_1',
        effect: { type: 'active', stat: 'devastatingBlow', value: 3, stackable: false },
      },
    ],
    defense: [
      // Tier 1
      {
        id: 'def_1_1',
        name: 'Thick Armor',
        description: 'All units gain +1 HP',
        tier: 1,
        cost: 1,
        unlocked: false,
        maxRank: 5,
        currentRank: 0,
        effect: { type: 'passive', stat: 'maxHp', value: 1, stackable: true },
      },
      {
        id: 'def_1_2',
        name: 'Swift Feet',
        description: 'Units move 10% faster',
        tier: 1,
        cost: 1,
        unlocked: false,
        maxRank: 3,
        currentRank: 0,
        effect: { type: 'passive', stat: 'movementSpeed', value: 0.1, stackable: true },
      },
      // Tier 2
      {
        id: 'def_2_1',
        name: 'Iron Will',
        description: 'Reduce damage taken by 10%',
        tier: 2,
        cost: 2,
        unlocked: false,
        maxRank: 2,
        currentRank: 0,
        prerequisite: 'def_1_1',
        effect: { type: 'passive', stat: 'damageReduction', value: 0.1, stackable: true },
      },
      {
        id: 'def_2_2',
        name: 'Evasion',
        description: '10% chance to dodge attacks',
        tier: 2,
        cost: 2,
        unlocked: false,
        maxRank: 2,
        currentRank: 0,
        prerequisite: 'def_1_2',
        effect: { type: 'passive', stat: 'dodgeChance', value: 0.1, stackable: true },
      },
      // Tier 3
      {
        id: 'def_3_1',
        name: 'Fortify',
        description: 'Ability: Gain invulnerability for 3 seconds (Cooldown: 60s)',
        tier: 3,
        cost: 3,
        unlocked: false,
        maxRank: 1,
        currentRank: 0,
        prerequisite: 'def_2_1',
        effect: { type: 'active', stat: 'fortify', value: 3, stackable: false },
      },
    ],
    economy: [
      // Tier 1
      {
        id: 'eco_1_1',
        name: 'Starting Wealth',
        description: 'Start each game with +1 silk',
        tier: 1,
        cost: 1,
        unlocked: false,
        maxRank: 5,
        currentRank: 0,
        effect: { type: 'passive', stat: 'startingSilk', value: 1, stackable: true },
      },
      {
        id: 'eco_1_2',
        name: 'Silk Finder',
        description: 'Silk spawns 15% more frequently',
        tier: 1,
        cost: 1,
        unlocked: false,
        maxRank: 3,
        currentRank: 0,
        effect: { type: 'passive', stat: 'silkSpawnRate', value: 0.15, stackable: true },
      },
      // Tier 2
      {
        id: 'eco_2_1',
        name: 'Gold Rush',
        description: 'Traders carry +1 gold',
        tier: 2,
        cost: 2,
        unlocked: false,
        maxRank: 2,
        currentRank: 0,
        prerequisite: 'eco_1_1',
        effect: { type: 'passive', stat: 'goldCapacity', value: 1, stackable: true },
      },
      {
        id: 'eco_2_2',
        name: 'Thrifty',
        description: 'Units cost 10% less silk',
        tier: 2,
        cost: 2,
        unlocked: false,
        maxRank: 3,
        currentRank: 0,
        prerequisite: 'eco_1_2',
        effect: { type: 'passive', stat: 'unitCostReduction', value: 0.1, stackable: true },
      },
      // Tier 3
      {
        id: 'eco_3_1',
        name: 'Silk Storm',
        description: 'Ability: Instantly gain 5 silk (Cooldown: 90s)',
        tier: 3,
        cost: 3,
        unlocked: false,
        maxRank: 1,
        currentRank: 0,
        prerequisite: 'eco_2_1',
        effect: { type: 'active', stat: 'silkStorm', value: 5, stackable: false },
      },
    ],
  };

  static getSkillTree(): Record<string, Skill[]> {
    return JSON.parse(JSON.stringify(this.SKILLS));
  }

  static canUnlockSkill(skill: Skill, progress: SkillTreeProgress): boolean {
    // Check if player has enough points
    if (progress.pointsAvailable < skill.cost) return false;

    // Check if already maxed
    if (skill.currentRank >= skill.maxRank) return false;

    // Check prerequisite
    if (skill.prerequisite) {
      const branch = skill.id.startsWith('off') ? 'offense' :
                     skill.id.startsWith('def') ? 'defense' : 'economy';
      const prereqSkill = progress[branch].skills.find(s => s.id === skill.prerequisite);
      if (!prereqSkill || prereqSkill.currentRank === 0) return false;
    }

    return true;
  }

  static unlockSkill(skillId: string, progress: SkillTreeProgress): SkillTreeProgress {
    const newProgress = JSON.parse(JSON.stringify(progress));
    const branch = skillId.startsWith('off') ? 'offense' :
                   skillId.startsWith('def') ? 'defense' : 'economy';

    const skill = newProgress[branch].skills.find(s => s.id === skillId);
    if (!skill) return progress;

    if (this.canUnlockSkill(skill, progress)) {
      skill.currentRank++;
      if (skill.currentRank === 1) skill.unlocked = true;
      newProgress.pointsAvailable -= skill.cost;
      newProgress.totalPointsSpent += skill.cost;
    }

    return newProgress;
  }

  static getRespecCost(totalPointsSpent: number): number {
    return totalPointsSpent * 50; // 50 silk per point spent
  }

  static respecSkills(progress: SkillTreeProgress): SkillTreeProgress {
    const newProgress: SkillTreeProgress = {
      offense: { skills: this.getSkillTree().offense, tierUnlocked: 1 },
      defense: { skills: this.getSkillTree().defense, tierUnlocked: 1 },
      economy: { skills: this.getSkillTree().economy, tierUnlocked: 1 },
      pointsAvailable: progress.totalPointsSpent,
      totalPointsSpent: 0,
    };
    return newProgress;
  }

  /**
   * Calculate total bonuses from skill tree
   */
  static calculateBonuses(progress: SkillTreeProgress): Record<string, number> {
    const bonuses: Record<string, number> = {};

    const allBranches = [progress.offense, progress.defense, progress.economy];
    allBranches.forEach(branch => {
      branch.skills.forEach(skill => {
        if (skill.currentRank > 0) {
          const key = skill.effect.stat;
          const value = skill.effect.value * skill.currentRank;

          if (skill.effect.stackable) {
            bonuses[key] = (bonuses[key] || 0) + value;
          } else {
            bonuses[key] = value;
          }
        }
      });
    });

    return bonuses;
  }
}

// ============================================================================
// REWARD SYSTEM
// ============================================================================

export class RewardSystem {
  /**
   * Calculate end-game rewards
   */
  static calculateEndGameRewards(params: {
    won: boolean;
    duration: number;
    unitsKilled: number;
    goldDelivered: number;
    bossesDefeated: number;
    perfectVictory: boolean;
    playerLevel: number;
  }): Reward {
    let silk = 0;
    const xp = XPSystem.calculateGameXP(params);

    // Base silk reward
    silk += params.won ? 50 : 20;

    // Performance bonuses
    silk += params.unitsKilled * 3;
    silk += params.goldDelivered * 5;
    silk += params.bossesDefeated * 15;

    // Perfect victory bonus
    if (params.perfectVictory) {
      silk = Math.floor(silk * 1.5);
    }

    // Level bonus (higher levels get slightly more)
    silk = Math.floor(silk * (1 + params.playerLevel * 0.01));

    return {
      xp,
      silk,
    };
  }

  /**
   * Get daily login rewards
   */
  static getDailyRewards(): DailyReward[] {
    return [
      { day: 1, silk: 50, multiplier: 1 },
      { day: 2, silk: 75, multiplier: 1 },
      { day: 3, silk: 100, multiplier: 1 },
      { day: 4, silk: 150, multiplier: 1 },
      { day: 5, silk: 200, multiplier: 1 },
      { day: 6, silk: 300, multiplier: 1 },
      { day: 7, silk: 500, premiumSilk: 10, multiplier: 2 },
    ];
  }

  /**
   * Generate loot box rewards
   */
  static generateLootBox(tier: 'common' | 'rare' | 'epic' | 'legendary'): Reward {
    const rewards: Record<typeof tier, Reward> = {
      common: {
        xp: 100,
        silk: Math.floor(Math.random() * 100) + 50,
      },
      rare: {
        xp: 250,
        silk: Math.floor(Math.random() * 300) + 150,
      },
      epic: {
        xp: 500,
        silk: Math.floor(Math.random() * 600) + 300,
        premiumSilk: Math.floor(Math.random() * 10) + 5,
      },
      legendary: {
        xp: 1000,
        silk: Math.floor(Math.random() * 1500) + 500,
        premiumSilk: Math.floor(Math.random() * 50) + 25,
      },
    };

    return rewards[tier];
  }

  /**
   * First-time bonuses
   */
  static getFirstTimeBonuses(): Record<string, Reward> {
    return {
      firstWin: {
        xp: 500,
        silk: 200,
        title: 'First Blood',
      },
      firstBossKill: {
        xp: 300,
        silk: 150,
      },
      first10Wins: {
        xp: 1000,
        silk: 500,
        title: 'Veteran',
      },
      first50Wins: {
        xp: 5000,
        silk: 2000,
        title: 'Champion',
      },
      first100Wins: {
        xp: 10000,
        silk: 5000,
        premiumSilk: 100,
        title: 'Master of the Silk Road',
      },
    };
  }

  /**
   * Referral rewards
   */
  static getReferralReward(): Reward {
    return {
      xp: 500,
      silk: 250,
      premiumSilk: 25,
    };
  }
}

// ============================================================================
// LEADERBOARD SYSTEM
// ============================================================================

export class LeaderboardSystem {
  /**
   * Calculate player score for leaderboards
   */
  static calculatePlayerScore(profile: PlayerProfile): number {
    const stats = profile.stats;

    // Weighted score calculation
    let score = 0;

    // Win rate is most important (0-100 points)
    score += stats.winRate * 100;

    // Total wins (diminishing returns)
    score += Math.min(stats.gamesWon, 1000) / 10;

    // Combat performance
    score += (stats.unitsKilled - stats.unitsLost) * 0.1;
    score += stats.bossesDefeated * 5;

    // Level bonus
    score += profile.level * 2;

    // Prestige multiplier
    score *= (1 + profile.prestigeLevel * 0.5);

    return Math.floor(score);
  }

  /**
   * Get leaderboard categories
   */
  static getCategories(): string[] {
    return [
      'Overall',
      'Weekly',
      'Monthly',
      'Friends',
      'Most Wins',
      'Best Win Rate',
      'Boss Slayers',
      'Prestige Leaders',
    ];
  }
}

// ============================================================================
// TITLE SYSTEM
// ============================================================================

export class TitleSystem {
  private static readonly TITLES: Record<string, { requirement: string; description: string }> = {
    'Silk Merchant': { requirement: 'Reach level 5', description: 'A budding trader on the Silk Road' },
    'Shadow Walker': { requirement: 'Reach level 10', description: 'Master of stealth and deception' },
    'Master Tactician': { requirement: 'Reach level 15', description: 'Strategic genius' },
    'Boss Slayer': { requirement: 'Reach level 20', description: 'Feared by bosses everywhere' },
    'Game Master': { requirement: 'Reach level 25', description: 'Creator of custom challenges' },
    'Silk Road Legend': { requirement: 'Reach level 30', description: 'Your name echoes through history' },
    'Elite Merchant': { requirement: 'Reach level 40', description: 'Wealth beyond measure' },
    'Legendary Trader': { requirement: 'Reach level 50', description: 'A living legend' },
    'Silk Road Master': { requirement: 'Reach level 75', description: 'Unmatched skill and wisdom' },
    'Silk Road Immortal': { requirement: 'Reach level 100', description: 'You have transcended mortality' },

    // Achievement titles
    'First Blood': { requirement: 'Win your first game', description: 'The first of many victories' },
    'Veteran': { requirement: 'Win 10 games', description: 'Battle-hardened warrior' },
    'Champion': { requirement: 'Win 50 games', description: 'A force to be reckoned with' },
    'Master of the Silk Road': { requirement: 'Win 100 games', description: 'Undisputed master' },

    // Special titles
    'The Unstoppable': { requirement: '10 win streak', description: 'Nothing can stop you' },
    'Boss Hunter': { requirement: 'Defeat 100 bosses', description: 'Bosses tremble at your approach' },
    'Speed Demon': { requirement: 'Win in under 5 minutes', description: 'Lightning fast victory' },
    'Prestige I': { requirement: 'Prestige once', description: 'Begin your legend anew' },
    'Prestige X': { requirement: 'Prestige 10 times', description: 'A true immortal' },
  };

  static getAllTitles(): typeof this.TITLES {
    return { ...this.TITLES };
  }

  static getTitleDescription(title: string): string {
    return this.TITLES[title]?.description || 'Unknown title';
  }
}

// ============================================================================
// ACHIEVEMENT SYSTEM
// ============================================================================

export class AchievementSystem {
  private static readonly ACHIEVEMENTS: Achievement[] = [
    {
      id: 'first_win',
      name: 'First Victory',
      description: 'Win your first game',
      unlocked: false,
      progress: 0,
      goal: 1,
      reward: { xp: 500, silk: 200, title: 'First Blood' },
      hidden: false,
    },
    {
      id: 'win_10',
      name: 'Veteran Warrior',
      description: 'Win 10 games',
      unlocked: false,
      progress: 0,
      goal: 10,
      reward: { xp: 1000, silk: 500, title: 'Veteran' },
      hidden: false,
    },
    {
      id: 'win_50',
      name: 'Champion',
      description: 'Win 50 games',
      unlocked: false,
      progress: 0,
      goal: 50,
      reward: { xp: 5000, silk: 2000, title: 'Champion' },
      hidden: false,
    },
    {
      id: 'win_100',
      name: 'Master',
      description: 'Win 100 games',
      unlocked: false,
      progress: 0,
      goal: 100,
      reward: { xp: 10000, silk: 5000, premiumSilk: 100, title: 'Master of the Silk Road' },
      hidden: false,
    },
    {
      id: 'boss_killer_10',
      name: 'Boss Hunter',
      description: 'Defeat 10 boss monsters',
      unlocked: false,
      progress: 0,
      goal: 10,
      reward: { xp: 750, silk: 300 },
      hidden: false,
    },
    {
      id: 'boss_killer_100',
      name: 'Boss Slayer',
      description: 'Defeat 100 boss monsters',
      unlocked: false,
      progress: 0,
      goal: 100,
      reward: { xp: 5000, silk: 2000, title: 'Boss Hunter' },
      hidden: false,
    },
    {
      id: 'speed_run',
      name: 'Speed Demon',
      description: 'Win a game in under 5 minutes',
      unlocked: false,
      progress: 0,
      goal: 1,
      reward: { xp: 1000, silk: 500, title: 'Speed Demon' },
      hidden: false,
    },
    {
      id: 'win_streak_5',
      name: 'Hot Streak',
      description: 'Win 5 games in a row',
      unlocked: false,
      progress: 0,
      goal: 5,
      reward: { xp: 1500, silk: 750 },
      hidden: false,
    },
    {
      id: 'win_streak_10',
      name: 'Unstoppable',
      description: 'Win 10 games in a row',
      unlocked: false,
      progress: 0,
      goal: 10,
      reward: { xp: 5000, silk: 2500, premiumSilk: 50, title: 'The Unstoppable' },
      hidden: false,
    },
    {
      id: 'perfect_game',
      name: 'Flawless Victory',
      description: 'Win without losing any units',
      unlocked: false,
      progress: 0,
      goal: 1,
      reward: { xp: 1000, silk: 500 },
      hidden: false,
    },
    {
      id: 'silk_collector',
      name: 'Silk Collector',
      description: 'Collect 10,000 silk',
      unlocked: false,
      progress: 0,
      goal: 10000,
      reward: { xp: 2000, silk: 1000 },
      hidden: false,
    },
    {
      id: 'max_level',
      name: 'Maximum Power',
      description: 'Reach level 100',
      unlocked: false,
      progress: 0,
      goal: 100,
      reward: { xp: 0, silk: 10000, premiumSilk: 500 },
      hidden: false,
    },
    {
      id: 'prestige_1',
      name: 'Rebirth',
      description: 'Prestige for the first time',
      unlocked: false,
      progress: 0,
      goal: 1,
      reward: { xp: 0, silk: 5000, premiumSilk: 200, title: 'Prestige I' },
      hidden: false,
    },
    {
      id: 'secret_master',
      name: '???',
      description: 'Unlock all skill tree abilities',
      unlocked: false,
      progress: 0,
      goal: 1,
      reward: { xp: 10000, silk: 5000, premiumSilk: 500 },
      hidden: true,
    },
  ];

  static getAllAchievements(): Achievement[] {
    return JSON.parse(JSON.stringify(this.ACHIEVEMENTS));
  }

  static checkAchievementProgress(profile: PlayerProfile): Achievement[] {
    const unlocked: Achievement[] = [];

    profile.achievements.forEach(achievement => {
      if (!achievement.unlocked && achievement.progress >= achievement.goal) {
        achievement.unlocked = true;
        achievement.unlockedAt = Date.now();
        unlocked.push(achievement);
      }
    });

    return unlocked;
  }

  static updateAchievementProgress(
    profile: PlayerProfile,
    achievementId: string,
    progress: number
  ): void {
    const achievement = profile.achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.unlocked) {
      achievement.progress = Math.min(progress, achievement.goal);
    }
  }
}

// ============================================================================
// PRESTIGE SYSTEM
// ============================================================================

export class PrestigeSystem {
  private static readonly PRESTIGE_LEVEL_REQUIREMENT = 50;
  private static readonly PRESTIGE_BONUSES = {
    xpBoost: 0.1,           // 10% per prestige level
    silkBoost: 0.1,         // 10% per prestige level
    startingSkillPoints: 2, // Per prestige level
  };

  static canPrestige(playerLevel: number): boolean {
    return playerLevel >= this.PRESTIGE_LEVEL_REQUIREMENT;
  }

  static getPrestigeBonuses(prestigeLevel: number): {
    xpMultiplier: number;
    silkMultiplier: number;
    startingSkillPoints: number;
  } {
    return {
      xpMultiplier: 1 + (prestigeLevel * this.PRESTIGE_BONUSES.xpBoost),
      silkMultiplier: 1 + (prestigeLevel * this.PRESTIGE_BONUSES.silkBoost),
      startingSkillPoints: prestigeLevel * this.PRESTIGE_BONUSES.startingSkillPoints,
    };
  }

  static performPrestige(profile: PlayerProfile): PlayerProfile {
    const newProfile = { ...profile };

    // Increment prestige
    newProfile.prestigeLevel++;
    newProfile.prestigePoints += profile.level;

    // Reset level and XP
    newProfile.level = 1;
    newProfile.currentXP = 0;
    newProfile.totalXP = 0;

    // Keep: titles, achievements, cosmetics, prestige bonuses
    // Reset: skill points (but gain bonus points), upgrades (partial refund)

    // Refund 50% of upgrade costs
    const totalUpgradeCost =
      UpgradeSystem.calculateTotalUpgradeCost(newProfile.upgrades.trader) +
      UpgradeSystem.calculateTotalUpgradeCost(newProfile.upgrades.thief) +
      UpgradeSystem.calculateTotalUpgradeCost(newProfile.upgrades.hunter) +
      UpgradeSystem.calculateTotalUpgradeCost(newProfile.upgrades.kingThief);

    newProfile.silk += Math.floor(totalUpgradeCost * 0.5);

    // Reset upgrades
    newProfile.upgrades = {
      trader: { healthLevel: 0, attackLevel: 0, speedLevel: 0, specialLevel: 0, maxLevel: 20 },
      thief: { healthLevel: 0, attackLevel: 0, speedLevel: 0, specialLevel: 0, maxLevel: 20 },
      hunter: { healthLevel: 0, attackLevel: 0, speedLevel: 0, specialLevel: 0, maxLevel: 20 },
      kingThief: { healthLevel: 0, attackLevel: 0, speedLevel: 0, specialLevel: 0, maxLevel: 20 },
    };

    // Reset skill tree with bonus points
    const bonuses = this.getPrestigeBonuses(newProfile.prestigeLevel);
    newProfile.skillTree = {
      offense: { skills: SkillTreeSystem.getSkillTree().offense, tierUnlocked: 1 },
      defense: { skills: SkillTreeSystem.getSkillTree().defense, tierUnlocked: 1 },
      economy: { skills: SkillTreeSystem.getSkillTree().economy, tierUnlocked: 1 },
      pointsAvailable: bonuses.startingSkillPoints,
      totalPointsSpent: 0,
    };

    return newProfile;
  }
}

// ============================================================================
// PROFILE MANAGER
// ============================================================================

export class ProfileManager {
  /**
   * Create new player profile
   */
  static createProfile(username: string, avatar: string = 'default'): PlayerProfile {
    return {
      id: this.generateId(),
      username,
      avatar,
      level: 1,
      currentXP: 0,
      totalXP: 0,
      title: 'Novice Trader',
      createdAt: Date.now(),
      lastLogin: Date.now(),

      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        gamesLost: 0,
        winRate: 0,
        unitsKilled: 0,
        unitsLost: 0,
        bossesDefeated: 0,
        goldDelivered: 0,
        totalSilkEarned: 0,
        totalSilkSpent: 0,
        totalPlaytimeSeconds: 0,
        longestGameSeconds: 0,
        highestWinStreak: 0,
        mostUnitsInOneGame: 0,
        fastestWin: Infinity,
      },

      unlockedUnits: ['trader', 'thief'],
      unlockedAbilities: [],
      unlockedModes: ['standard'],

      upgrades: {
        trader: { healthLevel: 0, attackLevel: 0, speedLevel: 0, specialLevel: 0, maxLevel: 20 },
        thief: { healthLevel: 0, attackLevel: 0, speedLevel: 0, specialLevel: 0, maxLevel: 20 },
        hunter: { healthLevel: 0, attackLevel: 0, speedLevel: 0, specialLevel: 0, maxLevel: 20 },
        kingThief: { healthLevel: 0, attackLevel: 0, speedLevel: 0, specialLevel: 0, maxLevel: 20 },
      },

      skillTree: {
        offense: { skills: SkillTreeSystem.getSkillTree().offense, tierUnlocked: 1 },
        defense: { skills: SkillTreeSystem.getSkillTree().defense, tierUnlocked: 1 },
        economy: { skills: SkillTreeSystem.getSkillTree().economy, tierUnlocked: 1 },
        pointsAvailable: 0,
        totalPointsSpent: 0,
      },

      silk: 100,
      premiumSilk: 0,

      achievements: AchievementSystem.getAllAchievements(),
      dailyStreak: 0,

      prestigeLevel: 0,
      prestigePoints: 0,
    };
  }

  /**
   * Update profile after game
   */
  static updateAfterGame(
    profile: PlayerProfile,
    gameResult: {
      won: boolean;
      duration: number;
      unitsKilled: number;
      unitsLost: number;
      goldDelivered: number;
      bossesDefeated: number;
      perfectVictory: boolean;
    }
  ): PlayerProfile {
    const updated = { ...profile };

    // Update stats
    updated.stats.gamesPlayed++;
    if (gameResult.won) {
      updated.stats.gamesWon++;
    } else {
      updated.stats.gamesLost++;
    }
    updated.stats.winRate = updated.stats.gamesWon / updated.stats.gamesPlayed;
    updated.stats.unitsKilled += gameResult.unitsKilled;
    updated.stats.unitsLost += gameResult.unitsLost;
    updated.stats.bossesDefeated += gameResult.bossesDefeated;
    updated.stats.goldDelivered += gameResult.goldDelivered;
    updated.stats.totalPlaytimeSeconds += gameResult.duration;
    updated.stats.longestGameSeconds = Math.max(updated.stats.longestGameSeconds, gameResult.duration);

    if (gameResult.won && gameResult.duration < updated.stats.fastestWin) {
      updated.stats.fastestWin = gameResult.duration;
    }

    // Calculate rewards
    const rewards = RewardSystem.calculateEndGameRewards({
      won: gameResult.won,
      duration: gameResult.duration,
      unitsKilled: gameResult.unitsKilled,
      goldDelivered: gameResult.goldDelivered,
      bossesDefeated: gameResult.bossesDefeated,
      perfectVictory: gameResult.perfectVictory,
      playerLevel: profile.level,
    });

    // Apply prestige bonuses
    const prestigeBonuses = PrestigeSystem.getPrestigeBonuses(updated.prestigeLevel);
    rewards.xp = Math.floor(rewards.xp * prestigeBonuses.xpMultiplier);
    rewards.silk = Math.floor(rewards.silk * prestigeBonuses.silkMultiplier);

    // Add rewards
    updated.totalXP += rewards.xp;
    updated.silk += rewards.silk;
    updated.stats.totalSilkEarned += rewards.silk;

    // Update level
    const newLevel = XPSystem.getLevelFromXP(updated.totalXP);
    if (newLevel > updated.level) {
      // Level up!
      const levelUps = newLevel - updated.level;
      updated.level = newLevel;

      // Grant skill points (1 per level)
      updated.skillTree.pointsAvailable += levelUps;

      // Check for unlocks
      for (let i = updated.level - levelUps + 1; i <= newLevel; i++) {
        const unlocks = UnlockSystem.getUnlocksForLevel(i);
        unlocks.forEach(unlock => {
          if (unlock.rewards.unlock) {
            const unlockedItems = unlock.rewards.unlock.split(',');
            unlockedItems.forEach(item => {
              if (['trader', 'thief', 'hunter', 'kingThief'].includes(item)) {
                if (!updated.unlockedUnits.includes(item)) {
                  updated.unlockedUnits.push(item);
                }
              } else {
                if (!updated.unlockedModes.includes(item)) {
                  updated.unlockedModes.push(item);
                }
              }
            });
          }
          if (unlock.rewards.title && !updated.title) {
            updated.title = unlock.rewards.title;
          }
          if (unlock.rewards.silk) {
            updated.silk += unlock.rewards.silk;
          }
        });
      }
    }

    updated.currentXP = XPSystem.getCurrentLevelXP(updated.totalXP);

    // Update achievements
    AchievementSystem.updateAchievementProgress(updated, 'win_10', updated.stats.gamesWon);
    AchievementSystem.updateAchievementProgress(updated, 'win_50', updated.stats.gamesWon);
    AchievementSystem.updateAchievementProgress(updated, 'win_100', updated.stats.gamesWon);
    AchievementSystem.updateAchievementProgress(updated, 'boss_killer_10', updated.stats.bossesDefeated);
    AchievementSystem.updateAchievementProgress(updated, 'boss_killer_100', updated.stats.bossesDefeated);
    AchievementSystem.updateAchievementProgress(updated, 'silk_collector', updated.stats.totalSilkEarned);
    AchievementSystem.updateAchievementProgress(updated, 'max_level', updated.level);

    if (gameResult.won && gameResult.duration < 300) {
      AchievementSystem.updateAchievementProgress(updated, 'speed_run', 1);
    }

    if (gameResult.perfectVictory) {
      AchievementSystem.updateAchievementProgress(updated, 'perfect_game', 1);
    }

    return updated;
  }

  private static generateId(): string {
    return `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save profile to localStorage
   */
  static saveProfile(profile: PlayerProfile): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('silkroad_profile', JSON.stringify(profile));
    }
  }

  /**
   * Load profile from localStorage
   */
  static loadProfile(): PlayerProfile | null {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('silkroad_profile');
      if (saved) {
        return JSON.parse(saved);
      }
    }
    return null;
  }
}

// ============================================================================
// EXPORT ALL
// ============================================================================

export default {
  XPSystem,
  UnlockSystem,
  UpgradeSystem,
  SkillTreeSystem,
  RewardSystem,
  LeaderboardSystem,
  TitleSystem,
  AchievementSystem,
  PrestigeSystem,
  ProfileManager,
};
