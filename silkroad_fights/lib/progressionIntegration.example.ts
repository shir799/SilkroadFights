/**
 * PROGRESSION SYSTEM INTEGRATION EXAMPLE
 * This file demonstrates how to integrate the progression system into Silkroad Fights
 */

import {
  PlayerProfile,
  ProfileManager,
  XPSystem,
  UnlockSystem,
  UpgradeSystem,
  SkillTreeSystem,
  RewardSystem,
  AchievementSystem,
  PrestigeSystem,
  LeaderboardSystem,
} from './progressionSystem';

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize or load player profile
 */
export function initializePlayerProfile(username?: string): PlayerProfile {
  // Try to load existing profile
  let profile = ProfileManager.loadProfile();

  // Create new profile if none exists
  if (!profile) {
    const playerName = username || 'Player';
    const avatar = '👤'; // Default avatar
    profile = ProfileManager.createProfile(playerName, avatar);
    ProfileManager.saveProfile(profile);
    console.log('New player profile created:', profile.username);
  } else {
    // Update last login
    profile.lastLogin = Date.now();
    ProfileManager.saveProfile(profile);
    console.log('Player profile loaded:', profile.username);
  }

  return profile;
}

/**
 * Check daily login rewards
 */
export function checkDailyLogin(profile: PlayerProfile): {
  shouldShow: boolean;
  currentDay: number;
} {
  const now = Date.now();
  const lastLogin = profile.lastLogin;
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Check if it's been more than a day
  const daysSinceLastLogin = Math.floor((now - lastLogin) / oneDayMs);

  if (daysSinceLastLogin >= 1) {
    // Continue streak if less than 2 days
    if (daysSinceLastLogin === 1) {
      profile.dailyStreak = Math.min(profile.dailyStreak + 1, 7);
    } else {
      // Reset streak
      profile.dailyStreak = 1;
    }

    return {
      shouldShow: true,
      currentDay: profile.dailyStreak,
    };
  }

  return {
    shouldShow: false,
    currentDay: profile.dailyStreak,
  };
}

/**
 * Claim daily reward
 */
export function claimDailyReward(profile: PlayerProfile): void {
  const rewards = RewardSystem.getDailyRewards();
  const currentReward = rewards[profile.dailyStreak - 1];

  if (currentReward) {
    profile.silk += currentReward.silk;
    if (currentReward.premiumSilk) {
      profile.premiumSilk += currentReward.premiumSilk;
    }
    ProfileManager.saveProfile(profile);
  }
}

// ============================================================================
// GAME LOOP INTEGRATION
// ============================================================================

/**
 * Called at the start of each game to apply progression bonuses
 */
export function applyProgressionBonuses(
  profile: PlayerProfile,
  gameState: any
): void {
  // Apply skill tree bonuses
  const bonuses = SkillTreeSystem.calculateBonuses(profile.skillTree);

  // Starting silk bonus
  if (bonuses.startingSilk) {
    gameState.silkCountTrader += bonuses.startingSilk;
    gameState.silkCountThief += bonuses.startingSilk;
  }

  // Apply bonuses to units (example)
  // In your actual game, apply these when creating units
  gameState.progressionBonuses = bonuses;

  console.log('Progression bonuses applied:', bonuses);
}

/**
 * Create unit with upgrades applied
 */
export function createUnitWithUpgrades(
  unitType: 'trader' | 'thief' | 'hunter' | 'kingThief',
  baseStats: any,
  profile: PlayerProfile
): any {
  // Get upgrades for this unit type
  const upgrades = profile.upgrades[unitType];

  // Apply upgrades to stats
  const enhancedStats = UpgradeSystem.applyUpgrades(baseStats, upgrades);

  // Apply skill tree bonuses
  const bonuses = SkillTreeSystem.calculateBonuses(profile.skillTree);

  // Combine both
  return {
    ...enhancedStats,
    maxHp: enhancedStats.maxHp + (bonuses.maxHp || 0),
    currentHp: enhancedStats.currentHp + (bonuses.maxHp || 0),
    attackDamage: enhancedStats.attackDamage + (bonuses.attackDamage || 0),
    movementSpeed: enhancedStats.movementSpeed * (1 + (bonuses.movementSpeed || 0)),
    attackSpeed: enhancedStats.attackSpeed * (1 + (bonuses.attackSpeed || 0)),
  };
}

/**
 * Check if player can create a unit (based on unlocks)
 */
export function canCreateUnit(
  unitType: string,
  profile: PlayerProfile
): boolean {
  return profile.unlockedUnits.includes(unitType);
}

/**
 * Get required level for unit
 */
export function getUnitUnlockLevel(unitType: string): number {
  const unlockLevels: Record<string, number> = {
    trader: 1,
    thief: 1,
    hunter: 5,
    kingThief: 10,
  };
  return unlockLevels[unitType] || 999;
}

// ============================================================================
// END GAME PROCESSING
// ============================================================================

export interface GameResult {
  won: boolean;
  duration: number; // seconds
  unitsKilled: number;
  unitsLost: number;
  goldDelivered: number;
  bossesDefeated: number;
  perfectVictory: boolean; // Won without losing any units
}

/**
 * Process game end and update profile
 */
export function processGameEnd(
  profile: PlayerProfile,
  gameResult: GameResult
): {
  profile: PlayerProfile;
  rewards: any;
  levelUps: number;
  newAchievements: any[];
} {
  const oldLevel = profile.level;

  // Update profile with game results
  const updatedProfile = ProfileManager.updateAfterGame(profile, gameResult);

  // Calculate level ups
  const levelUps = updatedProfile.level - oldLevel;

  // Check for new achievements
  const newAchievements = AchievementSystem.checkAchievementProgress(updatedProfile);

  // Calculate rewards
  const rewards = RewardSystem.calculateEndGameRewards({
    won: gameResult.won,
    duration: gameResult.duration,
    unitsKilled: gameResult.unitsKilled,
    goldDelivered: gameResult.goldDelivered,
    bossesDefeated: gameResult.bossesDefeated,
    perfectVictory: gameResult.perfectVictory,
    playerLevel: oldLevel,
  });

  // Apply achievement rewards
  newAchievements.forEach((achievement) => {
    rewards.xp += achievement.reward.xp || 0;
    rewards.silk += achievement.reward.silk || 0;
    if (achievement.reward.premiumSilk) {
      rewards.premiumSilk = (rewards.premiumSilk || 0) + achievement.reward.premiumSilk;
    }
  });

  // Save profile
  ProfileManager.saveProfile(updatedProfile);

  return {
    profile: updatedProfile,
    rewards,
    levelUps,
    newAchievements,
  };
}

/**
 * Check for unlocks after leveling up
 */
export function checkLevelUnlocks(
  oldLevel: number,
  newLevel: number
): any[] {
  const unlocks = [];

  for (let level = oldLevel + 1; level <= newLevel; level++) {
    const levelUnlocks = UnlockSystem.getUnlocksForLevel(level);
    unlocks.push(...levelUnlocks);
  }

  return unlocks;
}

// ============================================================================
// UPGRADE SYSTEM
// ============================================================================

/**
 * Purchase an upgrade
 */
export function purchaseUpgrade(
  profile: PlayerProfile,
  unitType: 'trader' | 'thief' | 'hunter' | 'kingThief',
  upgradeType: 'health' | 'attack' | 'speed' | 'special'
): { success: boolean; message: string } {
  const currentLevel = profile.upgrades[unitType][`${upgradeType}Level` as keyof typeof profile.upgrades[typeof unitType]];

  // Check max level
  if (currentLevel >= 20) {
    return {
      success: false,
      message: 'Upgrade is already at max level',
    };
  }

  // Get cost
  const cost = UpgradeSystem.getUpgradeCost(upgradeType, currentLevel);

  // Check if player can afford
  if (profile.silk < cost) {
    return {
      success: false,
      message: `Not enough silk. Need ${cost}, have ${profile.silk}`,
    };
  }

  // Apply upgrade
  profile.silk -= cost;
  profile.stats.totalSilkSpent += cost;
  (profile.upgrades[unitType][`${upgradeType}Level` as keyof typeof profile.upgrades[typeof unitType]] as number)++;

  // Save profile
  ProfileManager.saveProfile(profile);

  return {
    success: true,
    message: `Upgraded ${unitType} ${upgradeType} to level ${currentLevel + 1}`,
  };
}

/**
 * Get all available upgrades for a unit
 */
export function getAvailableUpgrades(
  profile: PlayerProfile,
  unitType: 'trader' | 'thief' | 'hunter' | 'kingThief'
): Array<{
  type: string;
  currentLevel: number;
  maxLevel: number;
  cost: number;
  canAfford: boolean;
  description: string;
}> {
  const upgrades = profile.upgrades[unitType];
  const types: Array<'health' | 'attack' | 'speed' | 'special'> = ['health', 'attack', 'speed', 'special'];

  return types.map((type) => {
    const currentLevel = upgrades[`${type}Level` as keyof typeof upgrades] as number;
    const cost = UpgradeSystem.getUpgradeCost(type, currentLevel);

    return {
      type,
      currentLevel,
      maxLevel: upgrades.maxLevel,
      cost,
      canAfford: profile.silk >= cost && currentLevel < upgrades.maxLevel,
      description: UpgradeSystem.getUpgradeDescription(unitType, type, currentLevel + 1),
    };
  });
}

// ============================================================================
// SKILL TREE SYSTEM
// ============================================================================

/**
 * Unlock a skill
 */
export function unlockSkill(
  profile: PlayerProfile,
  skillId: string
): { success: boolean; message: string } {
  const branch = skillId.startsWith('off') ? 'offense' :
                 skillId.startsWith('def') ? 'defense' : 'economy';
  const skill = profile.skillTree[branch].skills.find((s) => s.id === skillId);

  if (!skill) {
    return {
      success: false,
      message: 'Skill not found',
    };
  }

  // Check if can unlock
  if (!SkillTreeSystem.canUnlockSkill(skill, profile.skillTree)) {
    return {
      success: false,
      message: 'Cannot unlock skill (check prerequisites and skill points)',
    };
  }

  // Unlock skill
  profile.skillTree = SkillTreeSystem.unlockSkill(skillId, profile.skillTree);
  ProfileManager.saveProfile(profile);

  return {
    success: true,
    message: `Unlocked ${skill.name}!`,
  };
}

/**
 * Respec skill tree
 */
export function respecSkillTree(
  profile: PlayerProfile
): { success: boolean; message: string } {
  const cost = SkillTreeSystem.getRespecCost(profile.skillTree.totalPointsSpent);

  if (profile.silk < cost) {
    return {
      success: false,
      message: `Not enough silk. Need ${cost}, have ${profile.silk}`,
    };
  }

  profile.silk -= cost;
  profile.skillTree = SkillTreeSystem.respecSkills(profile.skillTree);
  ProfileManager.saveProfile(profile);

  return {
    success: true,
    message: 'Skill tree has been reset!',
  };
}

// ============================================================================
// PRESTIGE SYSTEM
// ============================================================================

/**
 * Check if player can prestige
 */
export function canPrestige(profile: PlayerProfile): boolean {
  return PrestigeSystem.canPrestige(profile.level);
}

/**
 * Perform prestige
 */
export function performPrestige(
  profile: PlayerProfile
): { success: boolean; message: string } {
  if (!PrestigeSystem.canPrestige(profile.level)) {
    return {
      success: false,
      message: 'Must reach level 50 to prestige',
    };
  }

  profile = PrestigeSystem.performPrestige(profile);
  ProfileManager.saveProfile(profile);

  // Update prestige achievement
  AchievementSystem.updateAchievementProgress(profile, 'prestige_1', 1);

  return {
    success: true,
    message: `Prestige complete! Now at Prestige ${profile.prestigeLevel}`,
  };
}

/**
 * Get prestige bonuses
 */
export function getPrestigeBonuses(profile: PlayerProfile): {
  xpMultiplier: number;
  silkMultiplier: number;
  startingSkillPoints: number;
} {
  return PrestigeSystem.getPrestigeBonuses(profile.prestigeLevel);
}

// ============================================================================
// LEADERBOARD SYSTEM
// ============================================================================

/**
 * Submit score to leaderboard (would connect to backend)
 */
export async function submitToLeaderboard(
  profile: PlayerProfile
): Promise<void> {
  const score = LeaderboardSystem.calculatePlayerScore(profile);

  // In a real implementation, this would submit to a backend
  console.log('Submitting to leaderboard:', {
    playerId: profile.id,
    username: profile.username,
    score,
    level: profile.level,
  });

  // Example backend call:
  // await fetch('/api/leaderboard', {
  //   method: 'POST',
  //   body: JSON.stringify({ playerId: profile.id, score, ... }),
  // });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get next unlock for player
 */
export function getNextUnlock(profile: PlayerProfile): string {
  const nextUnlock = UnlockSystem.getNextUnlock(profile.level);

  if (!nextUnlock) {
    return 'All content unlocked!';
  }

  return `Level ${nextUnlock.level}: ${nextUnlock.description}`;
}

/**
 * Get XP progress to next level
 */
export function getXPProgress(profile: PlayerProfile): {
  current: number;
  required: number;
  percentage: number;
} {
  const required = XPSystem.getXPForLevel(profile.level + 1);
  const current = profile.currentXP;
  const percentage = (current / required) * 100;

  return { current, required, percentage };
}

/**
 * Format playtime
 */
export function formatPlaytime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

/**
 * Get player rank title
 */
export function getPlayerRankTitle(profile: PlayerProfile): string {
  const score = LeaderboardSystem.calculatePlayerScore(profile);

  if (score >= 5000) return 'Grandmaster';
  if (score >= 3000) return 'Master';
  if (score >= 2000) return 'Diamond';
  if (score >= 1500) return 'Platinum';
  if (score >= 1000) return 'Gold';
  if (score >= 500) return 'Silver';
  return 'Bronze';
}

// ============================================================================
// EXAMPLE USAGE IN GAME COMPONENT
// ============================================================================

/**
 * Example React component integration
 */
export function exampleReactIntegration() {
  return `
import React, { useState, useEffect } from 'react';
import {
  initializePlayerProfile,
  processGameEnd,
  applyProgressionBonuses,
} from '@/lib/progressionIntegration.example';

export function GameComponent() {
  const [profile, setProfile] = useState(null);
  const [gameState, setGameState] = useState(null);

  useEffect(() => {
    // Initialize profile on component mount
    const loadedProfile = initializePlayerProfile();
    setProfile(loadedProfile);
  }, []);

  const startGame = () => {
    // Create new game state
    const newGameState = createGameState();

    // Apply progression bonuses
    applyProgressionBonuses(profile, newGameState);

    setGameState(newGameState);
  };

  const endGame = (gameResult) => {
    // Process game end
    const result = processGameEnd(profile, gameResult);

    // Update profile
    setProfile(result.profile);

    // Show reward screen
    showRewardScreen({
      rewards: result.rewards,
      levelUps: result.levelUps,
      achievements: result.newAchievements,
    });
  };

  return (
    <div>
      {profile && (
        <div>
          <h2>{profile.username}</h2>
          <p>Level {profile.level}</p>
          <p>Silk: {profile.silk}</p>
        </div>
      )}
      <button onClick={startGame}>Start Game</button>
    </div>
  );
}
  `;
}

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  // Initialization
  initializePlayerProfile,
  checkDailyLogin,
  claimDailyReward,

  // Game Loop
  applyProgressionBonuses,
  createUnitWithUpgrades,
  canCreateUnit,
  getUnitUnlockLevel,

  // End Game
  processGameEnd,
  checkLevelUnlocks,

  // Upgrades
  purchaseUpgrade,
  getAvailableUpgrades,

  // Skills
  unlockSkill,
  respecSkillTree,

  // Prestige
  canPrestige,
  performPrestige,
  getPrestigeBonuses,

  // Leaderboard
  submitToLeaderboard,

  // Utilities
  getNextUnlock,
  getXPProgress,
  formatPlaytime,
  getPlayerRankTitle,
};
