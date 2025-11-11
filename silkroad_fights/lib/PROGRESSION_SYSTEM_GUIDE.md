# Silkroad Fights - Progression System Guide

## Table of Contents
1. [Overview](#overview)
2. [XP & Leveling System](#xp--leveling-system)
3. [Unlock Tree](#unlock-tree)
4. [Upgrade System](#upgrade-system)
5. [Skill Tree](#skill-tree)
6. [Reward System](#reward-system)
7. [Economy Balancing](#economy-balancing)
8. [Integration Guide](#integration-guide)

---

## Overview

The Silkroad Fights Progression System provides a comprehensive player advancement framework with multiple interconnected systems:

- **Player Profiles**: Persistent player data with stats, achievements, and customization
- **Leveling System**: XP-based progression from Level 1 to 100
- **Unlocks**: New units, abilities, and game modes unlock as you level up
- **Upgrades**: Permanent unit enhancements purchasable with silk
- **Skill Tree**: 3 branches (Offense, Defense, Economy) with passive and active abilities
- **Rewards**: End-game rewards, daily bonuses, achievements, and loot boxes
- **Leaderboards**: Competitive rankings across multiple categories
- **Prestige**: Level 50+ players can prestige for permanent bonuses

### Design Philosophy
- **No Pay-to-Win**: All progression through gameplay
- **Clear Goals**: Always something to work towards
- **Meaningful Choices**: Upgrades and skills impact gameplay
- **Long-term Engagement**: 100 levels + prestige system
- **Balanced Economy**: Silk is earned and spent at appropriate rates

---

## XP & Leveling System

### XP Formula
```
XP Required = BASE_XP × (level ^ 1.5)
BASE_XP = 100
```

### Complete XP Table (Levels 1-50)

| Level | XP Required | Total XP | Cumulative |
|-------|-------------|----------|------------|
| 1     | 0           | 0        | 0          |
| 2     | 141         | 141      | 141        |
| 3     | 244         | 244      | 385        |
| 4     | 356         | 356      | 741        |
| 5     | 476         | 476      | 1,217      |
| 10    | 1,000       | 1,000    | 4,512      |
| 15    | 1,837       | 1,837    | 12,625     |
| 20    | 2,828       | 2,828    | 25,713     |
| 25    | 3,952       | 3,952    | 44,194     |
| 30    | 5,196       | 5,196    | 68,406     |
| 35    | 6,547       | 6,547    | 98,607     |
| 40    | 8,000       | 8,000    | 135,000    |
| 45    | 9,545       | 9,545    | 177,823    |
| 50    | 11,180      | 11,180   | 227,194    |
| 75    | 20,533      | 20,533   | 648,412    |
| 100   | 31,623      | 31,623   | 1,313,332  |

### XP Gain Formula
```typescript
baseXP = won ? 50 : 20
durationBonus = min(duration_minutes, 30) × 2
combatBonus = (unitsKilled × 5) + (goldDelivered × 10) + (bossesDefeated × 25)
perfectBonus = perfectVictory ? 1.5× : 1×
prestigeMultiplier = 1 + (prestigeLevel × 0.1)

totalXP = (baseXP + durationBonus + combatBonus) × perfectBonus × prestigeMultiplier
```

### Example XP Calculations

**Quick Victory (5 min, 3 kills, 1 gold)**
- Base: 50 (win)
- Duration: 5 × 2 = 10
- Combat: (3×5) + (1×10) = 25
- Total: 85 XP

**Epic Battle (20 min, 10 kills, 3 gold, 1 boss)**
- Base: 50
- Duration: 20 × 2 = 40
- Combat: (10×5) + (3×10) + (1×25) = 105
- Total: 195 XP

**Perfect Victory (15 min, 8 kills, 2 gold, 1 boss, no losses)**
- Base: 50
- Duration: 15 × 2 = 30
- Combat: (8×5) + (2×10) + (1×25) = 85
- Perfect: ×1.5
- Total: (165) × 1.5 = 247 XP

---

## Unlock Tree

### Complete Unlock Progression

| Level | Unlock | Description | Silk Reward |
|-------|--------|-------------|-------------|
| 1     | Basic Units | Trader & Thief | 100 |
| 5     | Hunter Unit | Ranged tracking unit | 250 |
| 10    | King Thief | Elite thief commander | 500 |
| 15    | Ability Upgrades | Enhanced unit abilities | 750 |
| 20    | Boss Rush Mode | Endless boss challenges | 1,000 |
| 25    | Custom Modes | Create your own rules | 1,500 |
| 30    | Skill Tier 3 | Advanced skills | 2,000 |
| 40    | Elite Cosmetics | Exclusive visual upgrades | 3,000 |
| 50    | Prestige System | Reset with bonuses | 5,000 |
| 75    | Skill Tier 4 | Ultimate abilities | 10,000 |
| 100   | Max Level | Complete mastery | 25,000 |

### Title Progression

| Level/Achievement | Title | Description |
|------------------|-------|-------------|
| 1                | Novice Trader | Starting title |
| 5                | Silk Merchant | Early game trader |
| 10               | Shadow Walker | Stealth master |
| 15               | Master Tactician | Strategic genius |
| 20               | Boss Slayer | Boss hunter |
| 25               | Game Master | Custom mode creator |
| 30               | Silk Road Legend | Historical figure |
| 40               | Elite Merchant | Wealthy trader |
| 50               | Legendary Trader | Living legend |
| 75               | Silk Road Master | Ultimate skill |
| 100              | Silk Road Immortal | Transcendent being |

---

## Upgrade System

### Upgrade Cost Formula
```
Health Cost: 100 × (1.5 ^ level)
Attack Cost: 150 × (1.5 ^ level)
Speed Cost: 200 × (1.5 ^ level)
Special Cost: 250 × (1.5 ^ level)
```

### Cost Table (First 10 Levels)

| Level | Health | Attack | Speed | Special |
|-------|--------|--------|-------|---------|
| 0→1   | 100    | 150    | 200   | 250     |
| 1→2   | 150    | 225    | 300   | 375     |
| 2→3   | 225    | 337    | 450   | 562     |
| 3→4   | 337    | 506    | 675   | 843     |
| 4→5   | 506    | 759    | 1,012 | 1,265   |
| 5→6   | 759    | 1,139  | 1,518 | 1,898   |
| 6→7   | 1,139  | 1,708  | 2,277 | 2,847   |
| 7→8   | 1,708  | 2,562  | 3,416 | 4,270   |
| 8→9   | 2,562  | 3,843  | 5,124 | 6,405   |
| 9→10  | 3,843  | 5,765  | 7,686 | 9,608   |

**Total to Max (Level 20)**: ~500,000 silk per unit type

### Upgrade Effects

#### Trader Upgrades
- **Health**: +1 HP per level, shield boost
- **Attack**: +1 damage per level
- **Speed**: +10% movement speed per level
- **Special**: +5% gold capacity per level

#### Thief Upgrades
- **Health**: +1 HP per level
- **Attack**: +1 damage per level
- **Speed**: +10% movement speed (stealth enhanced)
- **Special**: +2s stealth duration, +5% critical chance per level

#### Hunter Upgrades
- **Health**: +1 HP per level
- **Attack**: +1 damage per level
- **Speed**: +10% movement speed per level
- **Special**: +1 tracking range, +10% area damage per level

#### King Thief Upgrades
- **Health**: +1 HP per level (boss tier)
- **Attack**: +1 damage per level
- **Speed**: +10% movement speed per level
- **Special**: +1 command range, +5% theft success per level

---

## Skill Tree

### Branch Overview

#### Offense Branch (⚔️)
Focus: Damage output, combat effectiveness

**Tier 1**
- Sharp Blades (3 ranks): +1 attack damage per rank
- Quick Strike (3 ranks): +10% attack speed per rank

**Tier 2**
- Critical Strikes (2 ranks): 15% crit chance (30% at max)
- Bloodlust (1 rank): Heal 2 HP on kill

**Tier 3**
- Devastating Blow (1 rank): Active - 3× damage next attack (30s CD)

#### Defense Branch (🛡️)
Focus: Survivability, durability

**Tier 1**
- Thick Armor (5 ranks): +1 HP per rank
- Swift Feet (3 ranks): +10% movement speed per rank

**Tier 2**
- Iron Will (2 ranks): -10% damage taken per rank
- Evasion (2 ranks): +10% dodge chance per rank

**Tier 3**
- Fortify (1 rank): Active - Invulnerable for 3s (60s CD)

#### Economy Branch (💰)
Focus: Resource generation, efficiency

**Tier 1**
- Starting Wealth (5 ranks): +1 starting silk per rank
- Silk Finder (3 ranks): +15% silk spawn rate per rank

**Tier 2**
- Gold Rush (2 ranks): +1 gold capacity per rank
- Thrifty (3 ranks): -10% unit cost per rank

**Tier 3**
- Silk Storm (1 rank): Active - Gain 5 silk instantly (90s CD)

### Skill Point Economy
- **Gain**: 1 point per level
- **Total Available**: 99 points at level 100
- **Respec Cost**: 50 silk per point spent
- **Prestige Bonus**: +2 starting points per prestige level

### Optimal Builds

**Aggressive Build** (Early Game)
- Sharp Blades Rank 3
- Quick Strike Rank 3
- Critical Strikes Rank 2
- Total: 8 points, unlocks at Level 8

**Defensive Build** (Survival)
- Thick Armor Rank 5
- Swift Feet Rank 3
- Iron Will Rank 2
- Total: 10 points, unlocks at Level 10

**Economic Build** (Long Game)
- Starting Wealth Rank 5
- Silk Finder Rank 3
- Gold Rush Rank 2
- Total: 10 points, unlocks at Level 10

---

## Reward System

### End-Game Rewards Formula
```typescript
baseSilk = won ? 50 : 20
performanceBonus = (unitsKilled × 3) + (goldDelivered × 5) + (bossesDefeated × 15)
perfectBonus = perfectVictory ? 1.5× : 1×
levelBonus = 1 + (playerLevel × 0.01)
prestigeBonus = 1 + (prestigeLevel × 0.1)

totalSilk = baseSilk × performanceBonus × perfectBonus × levelBonus × prestigeBonus
```

### Daily Login Rewards

| Day | Silk | Premium | Multiplier |
|-----|------|---------|------------|
| 1   | 50   | 0       | 1×         |
| 2   | 75   | 0       | 1×         |
| 3   | 100  | 0       | 1×         |
| 4   | 150  | 0       | 1×         |
| 5   | 200  | 0       | 1×         |
| 6   | 300  | 0       | 1×         |
| 7   | 500  | 10      | 2×         |

**Weekly Total**: 1,375 silk + 10 premium

### Loot Box Rewards

| Tier | XP | Silk | Premium | Drop Rate |
|------|-----|------|---------|-----------|
| Common | 100 | 50-150 | 0 | 70% |
| Rare | 250 | 150-450 | 0 | 20% |
| Epic | 500 | 300-900 | 5-15 | 8% |
| Legendary | 1,000 | 500-2,000 | 25-75 | 2% |

### Achievement Rewards

**First-Time Bonuses**
- First Win: 500 XP, 200 silk, "First Blood" title
- First Boss Kill: 300 XP, 150 silk
- 10 Wins: 1,000 XP, 500 silk, "Veteran" title
- 50 Wins: 5,000 XP, 2,000 silk, "Champion" title
- 100 Wins: 10,000 XP, 5,000 silk, 100 premium, "Master" title

**Milestone Achievements**
- 10 Bosses: 750 XP, 300 silk
- 100 Bosses: 5,000 XP, 2,000 silk, "Boss Hunter" title
- 5 Win Streak: 1,500 XP, 750 silk
- 10 Win Streak: 5,000 XP, 2,500 silk, 50 premium, "Unstoppable" title

---

## Economy Balancing

### Silk Sources (Per Hour of Play)

**Active Gameplay**
- Winning games (avg 15 min): ~200 silk/game = 800 silk/hour
- Boss kills: ~150 silk/hour
- Daily quests: ~500 silk/day

**Daily Total**: ~1,500-2,000 silk/hour of play

### Silk Sinks

**Upgrades**
- Single unit to max: ~500,000 silk
- All units to max: ~2,000,000 silk

**Skill Respec**
- Early game (20 points): 1,000 silk
- Mid game (50 points): 2,500 silk
- Late game (90 points): 4,500 silk

**Time Investment**
- 10 hours → Level 15-20
- 50 hours → Level 40-50
- 200 hours → Level 100
- 500 hours → Max everything

### Balance Goals
- Players should unlock Hunter by 3-5 hours
- First prestige available at 40-60 hours
- Max level achievable in 150-250 hours
- Full completion (all upgrades) in 500+ hours

### Silk Earn Rate by Level

| Level Range | Silk per Hour | Notes |
|-------------|---------------|-------|
| 1-10        | 800           | Base rate |
| 11-25       | 1,000         | +25% bonus |
| 26-50       | 1,200         | +50% bonus |
| 51-75       | 1,500         | +87.5% bonus |
| 76-100      | 2,000         | +150% bonus |

---

## Integration Guide

### Setup

1. **Install the Progression System**
```typescript
import {
  ProfileManager,
  XPSystem,
  UnlockSystem,
  UpgradeSystem,
  SkillTreeSystem,
  RewardSystem,
  AchievementSystem,
  PrestigeSystem,
} from '@/lib/progressionSystem';
```

2. **Initialize Player Profile**
```typescript
// On first login
const profile = ProfileManager.createProfile('PlayerName', '👤');
ProfileManager.saveProfile(profile);

// On subsequent logins
const profile = ProfileManager.loadProfile();
```

### Game Loop Integration

**After Each Game:**
```typescript
// 1. Calculate game results
const gameResult = {
  won: true,
  duration: 900, // seconds
  unitsKilled: 10,
  unitsLost: 3,
  goldDelivered: 5,
  bossesDefeated: 1,
  perfectVictory: false,
};

// 2. Update profile
const updatedProfile = ProfileManager.updateAfterGame(profile, gameResult);

// 3. Check for level ups
const oldLevel = profile.level;
const newLevel = updatedProfile.level;
const levelUps = newLevel - oldLevel;

// 4. Check for new unlocks
if (levelUps > 0) {
  const unlocks = UnlockSystem.getUnlocksForLevel(newLevel);
  // Display unlock notifications
}

// 5. Check for achievements
const newAchievements = AchievementSystem.checkAchievementProgress(updatedProfile);
// Display achievement notifications

// 6. Save updated profile
ProfileManager.saveProfile(updatedProfile);

// 7. Show reward screen
showRewardScreen({
  rewards: calculateRewards(gameResult),
  levelUps,
  newLevel,
  unlockedAchievements: newAchievements,
});
```

### Applying Upgrades

```typescript
// In unit creation
function createUnit(type: string, profile: PlayerProfile) {
  const baseStats = getBaseStats(type);
  const upgrades = profile.upgrades[type];
  const finalStats = UpgradeSystem.applyUpgrades(baseStats, upgrades);

  return {
    type,
    stats: finalStats,
    // ... other properties
  };
}
```

### Applying Skill Bonuses

```typescript
// Calculate all active bonuses
const bonuses = SkillTreeSystem.calculateBonuses(profile.skillTree);

// Apply to game state
gameState.bonuses = {
  startingSilk: bonuses.startingSilk || 0,
  attackDamage: bonuses.attackDamage || 0,
  maxHp: bonuses.maxHp || 0,
  // ... etc
};
```

### UI Integration

**Profile Screen:**
```typescript
import ProfileScreen from '@/components/ProfileScreen';

<ProfileScreen
  profile={profile}
  onBack={() => navigate('/')}
  onEditProfile={() => navigate('/edit')}
/>
```

**Upgrade Shop:**
```typescript
import UpgradeShop from '@/components/UpgradeShop';

const handleUpgrade = (unitType: string, upgradeType: string) => {
  const cost = UpgradeSystem.getUpgradeCost(upgradeType, currentLevel);
  if (profile.silk >= cost) {
    profile.silk -= cost;
    profile.upgrades[unitType][`${upgradeType}Level`]++;
    ProfileManager.saveProfile(profile);
  }
};

<UpgradeShop
  profile={profile}
  onUpgrade={handleUpgrade}
  onBack={() => navigate('/')}
/>
```

**Skill Tree:**
```typescript
import SkillTree from '@/components/SkillTree';

const handleUnlockSkill = (skillId: string) => {
  const newProgress = SkillTreeSystem.unlockSkill(skillId, profile.skillTree);
  profile.skillTree = newProgress;
  ProfileManager.saveProfile(profile);
};

const handleRespec = () => {
  const cost = SkillTreeSystem.getRespecCost(profile.skillTree.totalPointsSpent);
  if (profile.silk >= cost) {
    profile.silk -= cost;
    profile.skillTree = SkillTreeSystem.respecSkills(profile.skillTree);
    ProfileManager.saveProfile(profile);
  }
};

<SkillTree
  profile={profile}
  onUnlockSkill={handleUnlockSkill}
  onRespec={handleRespec}
  onBack={() => navigate('/')}
/>
```

### Backend Integration (Optional)

For multiplayer/cloud saves:

```typescript
// Save to backend
async function syncProfile(profile: PlayerProfile) {
  await fetch('/api/profiles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
}

// Load from backend
async function loadProfileFromServer(userId: string) {
  const response = await fetch(`/api/profiles/${userId}`);
  return response.json();
}

// Leaderboard submission
async function submitScore(profile: PlayerProfile) {
  const score = LeaderboardSystem.calculatePlayerScore(profile);
  await fetch('/api/leaderboard', {
    method: 'POST',
    body: JSON.stringify({
      playerId: profile.id,
      username: profile.username,
      score,
      level: profile.level,
    }),
  });
}
```

---

## Testing & Balancing

### Test Scenarios

1. **New Player Experience**
   - Create new profile
   - Play 5 games
   - Verify XP gain, level up, first unlock at Level 5

2. **Upgrade Progression**
   - Grant 10,000 silk
   - Purchase various upgrades
   - Verify costs scale correctly

3. **Skill Tree**
   - Grant 20 skill points
   - Unlock skills in each branch
   - Verify prerequisites work
   - Test respec functionality

4. **Prestige**
   - Set player to Level 50
   - Trigger prestige
   - Verify bonuses apply correctly

### Balance Tweaks

If progression feels too slow:
- Increase BASE_XP (currently 100)
- Increase silk earn rates
- Decrease upgrade costs

If progression feels too fast:
- Increase XP curve exponent (currently 1.5)
- Decrease silk rewards
- Increase upgrade costs

---

## Future Enhancements

### Planned Features
- [ ] Cosmetic skins for units
- [ ] Pet system
- [ ] Guild/Clan system
- [ ] Weekly tournaments
- [ ] Battle pass system
- [ ] Cross-platform progression
- [ ] Cloud saves
- [ ] Social features (friends, chat)

### Balance Monitoring
- Track average time to Level 50
- Monitor silk economy (earn vs spend)
- Analyze skill tree choices
- Review upgrade purchase patterns
- Adjust based on player feedback

---

## API Reference

### Key Classes

**XPSystem**
- `getXPForLevel(level)`: Get XP needed for level
- `getLevelFromXP(totalXP)`: Calculate level from total XP
- `calculateGameXP(params)`: Calculate XP earned from game

**UnlockSystem**
- `getUnlocksForLevel(level)`: Get unlocks at specific level
- `isUnlocked(playerLevel, requiredLevel)`: Check if unlocked

**UpgradeSystem**
- `getUpgradeCost(type, currentLevel)`: Get cost for next level
- `applyUpgrades(baseStats, upgrades)`: Apply upgrades to stats

**SkillTreeSystem**
- `canUnlockSkill(skill, progress)`: Check if skill can be unlocked
- `unlockSkill(skillId, progress)`: Unlock a skill
- `calculateBonuses(progress)`: Get all active bonuses

**RewardSystem**
- `calculateEndGameRewards(params)`: Calculate game rewards
- `getDailyRewards()`: Get daily login rewards
- `generateLootBox(tier)`: Generate loot box contents

**ProfileManager**
- `createProfile(username, avatar)`: Create new profile
- `updateAfterGame(profile, results)`: Update after game
- `saveProfile(profile)`: Save to localStorage
- `loadProfile()`: Load from localStorage

---

## Conclusion

The Silkroad Fights Progression System provides a complete, balanced, and engaging player advancement framework. With 100 levels, multiple unlock paths, deep upgrade systems, and prestige mechanics, players will have hundreds of hours of meaningful progression.

The system is designed to be:
- **Fair**: No pay-to-win mechanics
- **Balanced**: Appropriate earn/spend rates
- **Engaging**: Always something to work towards
- **Flexible**: Easy to tune and extend
- **Complete**: All features fully implemented

For questions or support, refer to the inline code documentation or reach out to the development team.

**Happy Trading on the Silk Road!** 🎮✨
