/**
 * GAME MODES SYSTEM
 *
 * Multiple game modes for variety and replayability:
 * - Classic (standard game)
 * - Quick Match (5 min games)
 * - Boss Rush (only boss fights)
 * - Puzzle Mode (specific scenarios)
 * - Challenge Mode (restrictions)
 * - Sandbox Mode (practice)
 */

import { GameState, Position } from './types';
import { UNIT_CONFIGS, BOSS_CONFIGS, RESOURCES, TIMING } from './gameConfig';

// ============================================================================
// GAME MODE TYPES
// ============================================================================

export interface GameMode {
  id: string;
  name: string;
  description: string;
  icon: string;
  difficulty: 'Easy' | 'Normal' | 'Hard' | 'Expert';
  duration: number; // estimated minutes
  objectives: string[];
  modifiers: GameModeModifiers;
  winConditions: WinCondition[];
  specialRules?: string[];
}

export interface GameModeModifiers {
  startingSilk: number;
  silkSpawnRate: number; // multiplier
  goldSpawnRate: number; // multiplier
  bossSpawnRate: number; // multiplier
  unitHPMultiplier: number;
  unitDamageMultiplier: number;
  movementSpeed: number; // multiplier
  abilityEnabled: boolean;
  maxRounds?: number;
  timeLimit?: number; // seconds
  fogOfWar: boolean;
  permadeath: boolean; // units don't respawn
}

export interface WinCondition {
  type:
    | 'gold_delivered'
    | 'bosses_defeated'
    | 'enemy_elimination'
    | 'silk_collected'
    | 'survival'
    | 'time_limit';
  target: number;
  description: string;
}

// ============================================================================
// GAME MODE DEFINITIONS
// ============================================================================

export const GAME_MODES: Record<string, GameMode> = {
  CLASSIC: {
    id: 'classic',
    name: 'Classic',
    description: 'The standard Silkroad Fights experience. Deliver gold, defeat bosses, and outsmart your opponent.',
    icon: '⚔️',
    difficulty: 'Normal',
    duration: 15,
    objectives: [
      'Deliver 3 gold to your base',
      'Defeat enemy units',
      'Collect silk for abilities',
      'Conquer boss monsters'
    ],
    modifiers: {
      startingSilk: 100,
      silkSpawnRate: 1.0,
      goldSpawnRate: 1.0,
      bossSpawnRate: 1.0,
      unitHPMultiplier: 1.0,
      unitDamageMultiplier: 1.0,
      movementSpeed: 1.0,
      abilityEnabled: true,
      fogOfWar: false,
      permadeath: false
    },
    winConditions: [
      {
        type: 'gold_delivered',
        target: 3,
        description: 'Deliver 3 gold pieces'
      }
    ]
  },

  QUICK_MATCH: {
    id: 'quick',
    name: 'Quick Match',
    description: 'Fast-paced 5 minute games with increased resources and action. Perfect for a quick battle!',
    icon: '⚡',
    difficulty: 'Easy',
    duration: 5,
    objectives: [
      'Deliver 2 gold in 5 minutes',
      'Fast-paced combat',
      'More resources available',
      'Quick decision making'
    ],
    modifiers: {
      startingSilk: 200,
      silkSpawnRate: 2.0,
      goldSpawnRate: 2.0,
      bossSpawnRate: 0.5,
      unitHPMultiplier: 1.0,
      unitDamageMultiplier: 1.2,
      movementSpeed: 1.5,
      abilityEnabled: true,
      timeLimit: 300, // 5 minutes
      fogOfWar: false,
      permadeath: false
    },
    winConditions: [
      {
        type: 'gold_delivered',
        target: 2,
        description: 'Deliver 2 gold pieces'
      },
      {
        type: 'time_limit',
        target: 300,
        description: 'Most gold delivered after 5 minutes wins'
      }
    ],
    specialRules: [
      'Game ends after 5 minutes',
      'Increased movement speed',
      'More frequent resource spawns',
      'Reduced boss spawns'
    ]
  },

  BOSS_RUSH: {
    id: 'boss_rush',
    name: 'Boss Rush',
    description: 'Face waves of powerful bosses! No gold delivery, just pure boss-slaying action.',
    icon: '👹',
    difficulty: 'Hard',
    duration: 10,
    objectives: [
      'Defeat 5 boss monsters',
      'Survive increasing difficulty',
      'Coordinate team attacks',
      'Manage limited resources'
    ],
    modifiers: {
      startingSilk: 150,
      silkSpawnRate: 1.5,
      goldSpawnRate: 0, // No gold!
      bossSpawnRate: 3.0,
      unitHPMultiplier: 1.2,
      unitDamageMultiplier: 1.0,
      movementSpeed: 1.0,
      abilityEnabled: true,
      fogOfWar: false,
      permadeath: false
    },
    winConditions: [
      {
        type: 'bosses_defeated',
        target: 5,
        description: 'Defeat 5 bosses first'
      }
    ],
    specialRules: [
      'No gold spawns or delivery',
      'Bosses spawn every 60 seconds',
      'Each boss stronger than last',
      'Silk drops from defeated bosses',
      'Both teams can attack same boss'
    ]
  },

  PUZZLE_MODE: {
    id: 'puzzle',
    name: 'Puzzle Mode',
    description: 'Solve tactical scenarios with limited moves. Think carefully to find the optimal solution!',
    icon: '🧩',
    difficulty: 'Normal',
    duration: 10,
    objectives: [
      'Complete scenario objectives',
      'Use limited moves efficiently',
      'Find optimal solutions',
      'Earn 3-star ratings'
    ],
    modifiers: {
      startingSilk: 50,
      silkSpawnRate: 0,
      goldSpawnRate: 0,
      bossSpawnRate: 0,
      unitHPMultiplier: 1.0,
      unitDamageMultiplier: 1.0,
      movementSpeed: 1.0,
      abilityEnabled: true,
      maxRounds: 10,
      fogOfWar: false,
      permadeath: true
    },
    winConditions: [
      {
        type: 'enemy_elimination',
        target: 1,
        description: 'Complete the puzzle scenario'
      }
    ],
    specialRules: [
      'Pre-set unit positions',
      'Limited number of moves',
      'No random spawns',
      'Rating based on moves used',
      '3 stars = optimal solution'
    ]
  },

  CHALLENGE_MODE: {
    id: 'challenge',
    name: 'Challenge Mode',
    description: 'Hardcore mode with restrictions! Permadeath, limited vision, and no abilities. For veterans only!',
    icon: '💀',
    difficulty: 'Expert',
    duration: 20,
    objectives: [
      'Win with harsh restrictions',
      'Survive permadeath',
      'Navigate fog of war',
      'Prove your mastery'
    ],
    modifiers: {
      startingSilk: 50,
      silkSpawnRate: 0.5,
      goldSpawnRate: 0.8,
      bossSpawnRate: 1.5,
      unitHPMultiplier: 0.8,
      unitDamageMultiplier: 1.0,
      movementSpeed: 0.8,
      abilityEnabled: false, // No abilities!
      fogOfWar: true,
      permadeath: true
    },
    winConditions: [
      {
        type: 'gold_delivered',
        target: 5,
        description: 'Deliver 5 gold pieces'
      }
    ],
    specialRules: [
      'No abilities available',
      'Fog of War - limited vision',
      'Permadeath - units don\'t respawn',
      'Reduced resources',
      'More aggressive bosses',
      'One mistake can cost the game'
    ]
  },

  SANDBOX: {
    id: 'sandbox',
    name: 'Sandbox Mode',
    description: 'Practice and experiment freely! Unlimited resources, no time limits, respawning units. Perfect for learning!',
    icon: '🏖️',
    difficulty: 'Easy',
    duration: 999,
    objectives: [
      'Practice mechanics',
      'Experiment with strategies',
      'Test unit matchups',
      'Learn abilities'
    ],
    modifiers: {
      startingSilk: 999,
      silkSpawnRate: 5.0,
      goldSpawnRate: 3.0,
      bossSpawnRate: 0, // Manual spawn
      unitHPMultiplier: 1.0,
      unitDamageMultiplier: 1.0,
      movementSpeed: 1.0,
      abilityEnabled: true,
      fogOfWar: false,
      permadeath: false
    },
    winConditions: [
      {
        type: 'gold_delivered',
        target: 999,
        description: 'No win condition - practice mode'
      }
    ],
    specialRules: [
      'Unlimited silk',
      'Fast respawns',
      'Manual boss spawning',
      'No AI opponent (optional)',
      'Undo moves',
      'Perfect for learning'
    ]
  },

  SURVIVAL: {
    id: 'survival',
    name: 'Survival Mode',
    description: 'Survive endless waves of increasingly difficult enemies and bosses. How long can you last?',
    icon: '⏳',
    difficulty: 'Hard',
    duration: 30,
    objectives: [
      'Survive as long as possible',
      'Face increasing difficulty',
      'Manage limited resources',
      'Set high score records'
    ],
    modifiers: {
      startingSilk: 100,
      silkSpawnRate: 1.0,
      goldSpawnRate: 1.5,
      bossSpawnRate: 2.0,
      unitHPMultiplier: 1.0,
      unitDamageMultiplier: 1.0,
      movementSpeed: 1.0,
      abilityEnabled: true,
      fogOfWar: false,
      permadeath: true
    },
    winConditions: [
      {
        type: 'survival',
        target: 9999,
        description: 'Survive as long as possible'
      }
    ],
    specialRules: [
      'Endless enemy waves',
      'Difficulty increases each wave',
      'Units permanently die',
      'Limited reinforcements',
      'Boss every 5 waves',
      'Compete for high scores'
    ]
  },

  KING_OF_THE_HILL: {
    id: 'king_of_hill',
    name: 'King of the Hill',
    description: 'Control the center zone to gain points. First to 100 points wins!',
    icon: '👑',
    difficulty: 'Normal',
    duration: 12,
    objectives: [
      'Control the center zone',
      'Earn 100 points',
      'Defend your position',
      'Push enemies out'
    ],
    modifiers: {
      startingSilk: 100,
      silkSpawnRate: 1.0,
      goldSpawnRate: 0,
      bossSpawnRate: 0.5,
      unitHPMultiplier: 1.0,
      unitDamageMultiplier: 1.0,
      movementSpeed: 1.0,
      abilityEnabled: true,
      fogOfWar: false,
      permadeath: false
    },
    winConditions: [
      {
        type: 'silk_collected',
        target: 100,
        description: 'Earn 100 control points'
      }
    ],
    specialRules: [
      'Center zone (4x4) marked on map',
      'Earn 1 point per second in zone',
      'More units = faster points',
      'Contested zone gives no points',
      'No gold delivery mechanics'
    ]
  }
};

// ============================================================================
// PUZZLE SCENARIOS
// ============================================================================

export interface PuzzleScenario {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  maxMoves: number;
  optimalMoves: number;
  initialState: {
    playerUnits: Array<{ type: string; position: Position }>;
    enemyUnits: Array<{ type: string; position: Position; hp?: number }>;
    obstacles?: Position[];
    objectives: string;
  };
  hints: string[];
}

export const PUZZLE_SCENARIOS: PuzzleScenario[] = [
  {
    id: 'tutorial_1',
    name: 'First Steps',
    description: 'Learn basic movement and combat',
    difficulty: 'Easy',
    maxMoves: 3,
    optimalMoves: 2,
    initialState: {
      playerUnits: [{ type: 'TRADER_WARRIOR', position: { row: 0, col: 0 } }],
      enemyUnits: [{ type: 'THIEF_SCOUT', position: { row: 2, col: 2 }, hp: 30 }],
      objectives: 'Defeat the enemy Scout'
    },
    hints: ['Move adjacent to the enemy', 'Attack to defeat them', 'Scouts have low HP']
  },
  {
    id: 'kiting_practice',
    name: 'The Art of Kiting',
    description: 'Use range advantage to defeat a stronger melee enemy',
    difficulty: 'Medium',
    maxMoves: 8,
    optimalMoves: 6,
    initialState: {
      playerUnits: [{ type: 'TRADER_ARCHER', position: { row: 5, col: 5 } }],
      enemyUnits: [{ type: 'THIEF_BANDIT', position: { row: 2, col: 5 } }],
      objectives: 'Defeat the Bandit without taking damage'
    },
    hints: [
      'Use your 3-tile range',
      'Move away after each shot',
      'Keep 2-3 tiles distance',
      'Bandit only has 1 range'
    ]
  },
  {
    id: 'fork_dilemma',
    name: 'The Fork',
    description: 'Threaten multiple targets at once',
    difficulty: 'Medium',
    maxMoves: 5,
    optimalMoves: 3,
    initialState: {
      playerUnits: [
        { type: 'TRADER_WARRIOR', position: { row: 4, col: 4 } },
        { type: 'TRADER_ARCHER', position: { row: 4, col: 3 } }
      ],
      enemyUnits: [
        { type: 'THIEF_SCOUT', position: { row: 2, col: 3 }, hp: 40 },
        { type: 'THIEF_SCOUT', position: { row: 2, col: 5 }, hp: 40 }
      ],
      objectives: 'Defeat both Scouts'
    },
    hints: [
      'Position to threaten both enemies',
      'Force them to choose defense',
      'Coordinate your two units',
      'One attacks, one zones'
    ]
  },
  {
    id: 'sacrifice_play',
    name: 'Noble Sacrifice',
    description: 'Sometimes one must fall for the team to win',
    difficulty: 'Hard',
    maxMoves: 6,
    optimalMoves: 4,
    initialState: {
      playerUnits: [
        { type: 'TRADER_GUARD', position: { row: 6, col: 4 } },
        { type: 'TRADER_ARCHER', position: { row: 7, col: 4 } }
      ],
      enemyUnits: [
        { type: 'THIEF_ASSASSIN', position: { row: 2, col: 4 } },
        { type: 'THIEF_BANDIT', position: { row: 2, col: 3 } }
      ],
      objectives: 'Get Archer to row 0 safely'
    },
    hints: [
      'Guard must protect Archer',
      'Block enemies with your body',
      'Archer needs safe path',
      'Sacrifice Guard if necessary'
    ]
  }
];

// ============================================================================
// GAME MODE UTILITIES
// ============================================================================

export class GameModeManager {
  private currentMode: GameMode;

  constructor(modeId: string = 'classic') {
    this.currentMode = GAME_MODES[modeId] || GAME_MODES.CLASSIC;
  }

  getCurrentMode(): GameMode {
    return { ...this.currentMode };
  }

  setMode(modeId: string) {
    if (GAME_MODES[modeId]) {
      this.currentMode = GAME_MODES[modeId];
    }
  }

  applyModifiers(baseValue: number, modifierType: keyof GameModeModifiers): number {
    const modifier = this.currentMode.modifiers[modifierType];
    if (typeof modifier === 'number') {
      return baseValue * modifier;
    }
    return baseValue;
  }

  isAbilityEnabled(): boolean {
    return this.currentMode.modifiers.abilityEnabled;
  }

  isFogOfWarEnabled(): boolean {
    return this.currentMode.modifiers.fogOfWar;
  }

  isPermadeath(): boolean {
    return this.currentMode.modifiers.permadeath;
  }

  checkWinConditions(gameState: any): { won: boolean; team?: string; condition?: string } {
    for (const condition of this.currentMode.winConditions) {
      switch (condition.type) {
        case 'gold_delivered':
          if (gameState.goldDelivered >= condition.target) {
            return { won: true, team: 'trader', condition: condition.description };
          }
          break;

        case 'bosses_defeated':
          // Would need to track boss defeats
          break;

        case 'enemy_elimination':
          if (gameState.thiefUnits.length === 0) {
            return { won: true, team: 'trader', condition: 'Enemy elimination' };
          }
          if (gameState.traderUnits.length === 0) {
            return { won: true, team: 'thief', condition: 'Enemy elimination' };
          }
          break;

        case 'time_limit':
          // Would need to track game time
          break;
      }
    }

    return { won: false };
  }

  getStartingSilk(): number {
    return this.currentMode.modifiers.startingSilk;
  }

  getAllModes(): GameMode[] {
    return Object.values(GAME_MODES);
  }

  getPuzzleScenarios(): PuzzleScenario[] {
    return PUZZLE_SCENARIOS;
  }
}

// ============================================================================
// MODE UNLOCKS & PROGRESSION
// ============================================================================

export interface PlayerProgression {
  unlockedModes: Set<string>;
  completedPuzzles: Set<string>;
  highScores: Record<string, number>;
  achievements: Set<string>;
}

export const MODE_UNLOCK_REQUIREMENTS: Record<string, { condition: string; description: string }> = {
  CLASSIC: { condition: 'always', description: 'Available from start' },
  QUICK_MATCH: { condition: 'always', description: 'Available from start' },
  BOSS_RUSH: { condition: 'win_classic_3', description: 'Win 3 Classic games' },
  PUZZLE_MODE: { condition: 'win_classic_1', description: 'Win 1 Classic game' },
  CHALLENGE_MODE: { condition: 'win_hard_5', description: 'Win 5 games on Hard difficulty' },
  SANDBOX: { condition: 'always', description: 'Available from start' },
  SURVIVAL: { condition: 'defeat_all_bosses', description: 'Defeat all 3 boss types' },
  KING_OF_THE_HILL: { condition: 'win_classic_5', description: 'Win 5 Classic games' }
};

export const gameModeManager = new GameModeManager();
