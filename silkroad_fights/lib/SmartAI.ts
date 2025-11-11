/**
 * SMART AI WITH RUBBER-BANDING
 *
 * Enhanced AI system that:
 * - Adapts to player skill level
 * - Makes intentional mistakes at lower difficulties
 * - Provides teachable moments
 * - Uses rubber-banding to keep games close and exciting
 * - Demonstrates good tactics for players to learn from
 */

import {
  GameState,
  Unit,
  Position,
  makeSmartAiMove,
  AI_DIFFICULTY,
  findPath,
  makeNoobAiMove,
  makeNormalAiMove,
  makeSilkroadMasterAiMove
} from './newGameLogic';
import { dynamicDifficulty, DifficultyModifiers } from './GameBalance';

// ============================================================================
// AI PERSONALITY SYSTEM
// ============================================================================

export interface AIPersonality {
  name: string;
  description: string;
  mistakeChance: number; // 0-1, chance to make suboptimal moves
  aggressiveness: number; // 0-1, how aggressive
  greediness: number; // 0-1, how much they prioritize silk/gold
  teamwork: number; // 0-1, how well units coordinate
  adaptability: number; // 0-1, how quickly they adapt to player
  teachingMode: boolean; // Makes obvious setups for player to counter
}

export const AI_PERSONALITIES: Record<string, AIPersonality> = {
  NOOB: {
    name: 'Beginner Bot',
    description: 'Makes frequent mistakes, perfect for learning the game',
    mistakeChance: 0.6,
    aggressiveness: 0.3,
    greediness: 0.7,
    teamwork: 0.2,
    adaptability: 0.1,
    teachingMode: true
  },
  NORMAL: {
    name: 'Competent Opponent',
    description: 'Balanced AI that provides a fair challenge',
    mistakeChance: 0.3,
    aggressiveness: 0.5,
    greediness: 0.5,
    teamwork: 0.6,
    adaptability: 0.5,
    teachingMode: false
  },
  HARD: {
    name: 'Skilled Veteran',
    description: 'Challenges you but still fair, makes few mistakes',
    mistakeChance: 0.1,
    aggressiveness: 0.7,
    greediness: 0.4,
    teamwork: 0.8,
    adaptability: 0.7,
    teachingMode: false
  },
  MASTER: {
    name: 'Silkroad Master',
    description: 'Perfect play, no mercy, ultimate challenge',
    mistakeChance: 0.05,
    aggressiveness: 0.9,
    greediness: 0.3,
    teamwork: 0.95,
    adaptability: 0.9,
    teachingMode: false
  }
};

// ============================================================================
// RUBBER-BANDING SYSTEM
// ============================================================================

export class RubberBandingAI {
  private playerScore: number = 0;
  private aiScore: number = 0;
  private gamePhase: 'early' | 'mid' | 'late' = 'early';
  private performanceHistory: number[] = []; // Score differential history

  /**
   * Calculate how much the AI should adjust its difficulty
   */
  calculateRubberBanding(gameState: GameState): {
    shouldHelp: boolean;
    shouldChallenge: boolean;
    intensity: number; // 0-1
  } {
    // Update scores
    this.updateScores(gameState);

    // Calculate score differential
    const differential = this.playerScore - this.aiScore;
    this.performanceHistory.push(differential);

    // Keep only last 10 moves
    if (this.performanceHistory.length > 10) {
      this.performanceHistory.shift();
    }

    // Calculate trend
    const recentTrend = this.performanceHistory.slice(-5).reduce((sum, val) => sum + val, 0) / 5;

    // Determine game phase
    this.gamePhase = this.determineGamePhase(gameState);

    // Rubber-banding logic
    const shouldHelp = differential < -30; // Player is losing badly
    const shouldChallenge = differential > 30; // Player is dominating

    // Intensity increases in late game for dramatic finishes
    const baseIntensity = Math.abs(differential) / 100;
    const phaseMultiplier = this.gamePhase === 'late' ? 1.5 : this.gamePhase === 'mid' ? 1.2 : 1.0;
    const intensity = Math.min(1.0, baseIntensity * phaseMultiplier);

    return { shouldHelp, shouldChallenge, intensity };
  }

  /**
   * Update scores based on game state
   */
  private updateScores(gameState: GameState) {
    this.playerScore = gameState.isTraderPlayer
      ? gameState.silkCountTrader + gameState.goldDelivered * 10 + gameState.traderUnits.length * 5
      : gameState.silkCountThief + gameState.thiefUnits.length * 5;

    this.aiScore = gameState.isTraderPlayer
      ? gameState.silkCountThief + gameState.thiefUnits.length * 5
      : gameState.silkCountTrader + gameState.goldDelivered * 10 + gameState.traderUnits.length * 5;
  }

  /**
   * Determine current game phase
   */
  private determineGamePhase(gameState: GameState): 'early' | 'mid' | 'late' {
    if (gameState.roundNumber < 5) return 'early';
    if (gameState.roundNumber < 15) return 'mid';
    return 'late';
  }

  /**
   * Apply rubber-banding adjustments to AI personality
   */
  applyRubberBanding(
    personality: AIPersonality,
    rubberBanding: { shouldHelp: boolean; shouldChallenge: boolean; intensity: number }
  ): AIPersonality {
    const adjusted = { ...personality };

    if (rubberBanding.shouldHelp) {
      // Make AI easier when player is losing
      adjusted.mistakeChance = Math.min(1.0, personality.mistakeChance * (1 + rubberBanding.intensity));
      adjusted.aggressiveness = Math.max(0, personality.aggressiveness * (1 - rubberBanding.intensity * 0.5));
      adjusted.teamwork = Math.max(0, personality.teamwork * (1 - rubberBanding.intensity * 0.3));
    } else if (rubberBanding.shouldChallenge) {
      // Make AI harder when player is dominating
      adjusted.mistakeChance = Math.max(0, personality.mistakeChance * (1 - rubberBanding.intensity * 0.5));
      adjusted.aggressiveness = Math.min(1.0, personality.aggressiveness * (1 + rubberBanding.intensity * 0.3));
      adjusted.teamwork = Math.min(1.0, personality.teamwork * (1 + rubberBanding.intensity * 0.2));
    }

    return adjusted;
  }
}

// ============================================================================
// TEACHING AI - Makes mistakes intentionally to create learning opportunities
// ============================================================================

export class TeachingAI {
  private teachingMoments: string[] = [];

  /**
   * Create a teaching moment by making an obvious mistake
   */
  createTeachingMoment(gameState: GameState, personality: AIPersonality): Position[] | null {
    if (!personality.teachingMode) return null;
    if (Math.random() > 0.3) return null; // Only 30% of moves

    const aiUnits = gameState.currentPlayer === 'TRADER' ? gameState.traderUnits : gameState.thiefUnits;
    const playerUnits = gameState.currentPlayer === 'TRADER' ? gameState.thiefUnits : gameState.traderUnits;

    if (aiUnits.length === 0 || playerUnits.length === 0) return null;

    // Teaching Moment 1: Leave unit exposed
    const exposableUnit = aiUnits.find(u => {
      const nearbyEnemies = playerUnits.filter(e => {
        const dist = Math.max(Math.abs(u.row - e.row), Math.abs(u.col - e.col));
        return dist <= 2;
      });
      return nearbyEnemies.length > 0;
    });

    if (exposableUnit && Math.random() < 0.5) {
      // Move unit away from allies, toward enemies (bad move)
      const nearestEnemy = playerUnits.reduce((nearest, current) => {
        const currentDist = Math.max(
          Math.abs(exposableUnit.row - current.row),
          Math.abs(exposableUnit.col - current.col)
        );
        const nearestDist = Math.max(
          Math.abs(exposableUnit.row - nearest.row),
          Math.abs(exposableUnit.col - nearest.col)
        );
        return currentDist < nearestDist ? current : nearest;
      });

      // Move closer to enemy (teaching moment: don't be aggressive when outnumbered)
      const directions = [
        { row: -1, col: 0 },
        { row: 1, col: 0 },
        { row: 0, col: -1 },
        { row: 0, col: 1 }
      ];

      for (const dir of directions) {
        const newPos = {
          row: exposableUnit.row + dir.row,
          col: exposableUnit.col + dir.col
        };

        if (isValidPosition(newPos) && isPositionEmpty(gameState, newPos)) {
          const distToEnemy = Math.max(
            Math.abs(newPos.row - nearestEnemy.row),
            Math.abs(newPos.col - nearestEnemy.col)
          );

          if (
            distToEnemy <
            Math.max(
              Math.abs(exposableUnit.row - nearestEnemy.row),
              Math.abs(exposableUnit.col - nearestEnemy.col)
            )
          ) {
            this.teachingMoments.push('Exposed unit to teach positioning');
            return [{ row: exposableUnit.row, col: exposableUnit.col }, newPos];
          }
        }
      }
    }

    // Teaching Moment 2: Ignore gold/silk collection
    if (Math.random() < 0.4) {
      // Just move randomly instead of collecting resources
      const randomUnit = aiUnits[Math.floor(Math.random() * aiUnits.length)];
      const possibleMoves = getPossibleMoves(gameState, randomUnit);

      if (possibleMoves.length > 0) {
        const randomMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        this.teachingMoments.push('Ignored resource collection to teach prioritization');
        return [{ row: randomUnit.row, col: randomUnit.col }, randomMove];
      }
    }

    return null;
  }

  getTeachingMoments(): string[] {
    return [...this.teachingMoments];
  }

  clearTeachingMoments() {
    this.teachingMoments = [];
  }
}

// ============================================================================
// ADAPTIVE AI - Learns from player behavior
// ============================================================================

export class AdaptiveAI {
  private playerPatterns: {
    favorsAggression: number; // -1 to 1
    usesAbilities: number; // 0 to 1
    protectsUnits: number; // 0 to 1
    collectsResources: number; // 0 to 1
  };

  constructor() {
    this.playerPatterns = {
      favorsAggression: 0,
      usesAbilities: 0.5,
      protectsUnits: 0.5,
      collectsResources: 0.5
    };
  }

  /**
   * Learn from player's actions
   */
  learnFromPlayer(gameState: GameState, lastGameState: GameState | null) {
    if (!lastGameState) return;

    // Analyze player's move
    const playerUnits = gameState.isTraderPlayer ? gameState.traderUnits : gameState.thiefUnits;
    const lastPlayerUnits = gameState.isTraderPlayer
      ? lastGameState.traderUnits
      : lastGameState.thiefUnits;

    // Did player attack?
    if (playerUnits.length < lastPlayerUnits.length) {
      this.playerPatterns.favorsAggression += 0.1;
    }

    // Did player use ability?
    if (gameState.lastUsedAbility !== lastGameState.lastUsedAbility) {
      this.playerPatterns.usesAbilities += 0.1;
    }

    // Did player collect silk?
    const playerSilk = gameState.isTraderPlayer ? gameState.silkCountTrader : gameState.silkCountThief;
    const lastPlayerSilk = gameState.isTraderPlayer
      ? lastGameState.silkCountTrader
      : lastGameState.silkCountThief;

    if (playerSilk > lastPlayerSilk) {
      this.playerPatterns.collectsResources += 0.1;
    }

    // Clamp values
    this.playerPatterns.favorsAggression = Math.max(
      -1,
      Math.min(1, this.playerPatterns.favorsAggression)
    );
    this.playerPatterns.usesAbilities = Math.max(0, Math.min(1, this.playerPatterns.usesAbilities));
    this.playerPatterns.protectsUnits = Math.max(0, Math.min(1, this.playerPatterns.protectsUnits));
    this.playerPatterns.collectsResources = Math.max(
      0,
      Math.min(1, this.playerPatterns.collectsResources)
    );
  }

  /**
   * Adjust AI strategy based on learned patterns
   */
  getAdaptiveStrategy(): {
    counterAggression: boolean;
    matchAbilityUsage: boolean;
    prioritizeResources: boolean;
  } {
    return {
      counterAggression: this.playerPatterns.favorsAggression > 0.3,
      matchAbilityUsage: this.playerPatterns.usesAbilities > 0.6,
      prioritizeResources: this.playerPatterns.collectsResources > 0.6
    };
  }
}

// ============================================================================
// MAIN SMART AI CONTROLLER
// ============================================================================

export class SmartAIController {
  private rubberBanding: RubberBandingAI;
  private teaching: TeachingAI;
  private adaptive: AdaptiveAI;
  private lastGameState: GameState | null = null;

  constructor() {
    this.rubberBanding = new RubberBandingAI();
    this.teaching = new TeachingAI();
    this.adaptive = new AdaptiveAI();
  }

  /**
   * Make an AI move with all enhancements
   */
  makeEnhancedMove(gameState: GameState, difficulty: string): Position[] | null {
    // Learn from player
    if (this.lastGameState) {
      this.adaptive.learnFromPlayer(gameState, this.lastGameState);
    }

    // Get base personality
    let personality = this.getPersonalityFromDifficulty(difficulty);

    // Apply rubber-banding
    const rubberBandingState = this.rubberBanding.calculateRubberBanding(gameState);
    personality = this.rubberBanding.applyRubberBanding(personality, rubberBandingState);

    // Apply dynamic difficulty modifiers
    const modifiers = dynamicDifficulty.getDifficultyModifiers(difficulty);

    // Teaching mode: Create learning opportunities
    if (personality.teachingMode && Math.random() < personality.mistakeChance) {
      const teachingMove = this.teaching.createTeachingMoment(gameState, personality);
      if (teachingMove) {
        this.lastGameState = gameState;
        return teachingMove;
      }
    }

    // Intentional mistakes based on personality
    if (Math.random() < personality.mistakeChance) {
      const move = this.makeSuboptimalMove(gameState, personality);
      if (move) {
        this.lastGameState = gameState;
        return move;
      }
    }

    // Use base AI with difficulty
    let move: Position[] | null = null;

    if (personality.mistakeChance > 0.4) {
      move = makeNoobAiMove(gameState);
    } else if (personality.mistakeChance > 0.15) {
      move = makeNormalAiMove(gameState);
    } else {
      move = makeSilkroadMasterAiMove(gameState);
    }

    this.lastGameState = gameState;
    return move;
  }

  /**
   * Make an intentionally suboptimal move
   */
  private makeSuboptimalMove(gameState: GameState, personality: AIPersonality): Position[] | null {
    const aiUnits = gameState.currentPlayer === 'TRADER' ? gameState.traderUnits : gameState.thiefUnits;

    if (aiUnits.length === 0) return null;

    // Pick a random unit
    const unit = aiUnits[Math.floor(Math.random() * aiUnits.length)];
    const moves = getPossibleMoves(gameState, unit);

    if (moves.length === 0) return null;

    // Pick a suboptimal move (not the best, not the worst)
    const middleIndex = Math.floor(moves.length / 2);
    const move = moves[middleIndex];

    return [{ row: unit.row, col: unit.col }, move];
  }

  /**
   * Get personality from difficulty string
   */
  private getPersonalityFromDifficulty(difficulty: string): AIPersonality {
    switch (difficulty.toLowerCase()) {
      case 'noob':
      case 'beginner':
        return AI_PERSONALITIES.NOOB;
      case 'normal':
        return AI_PERSONALITIES.NORMAL;
      case 'hard':
        return AI_PERSONALITIES.HARD;
      case 'silkroad':
      case 'master':
        return AI_PERSONALITIES.MASTER;
      default:
        return AI_PERSONALITIES.NORMAL;
    }
  }

  /**
   * Get current AI status for debugging/display
   */
  getStatus(): {
    personality: AIPersonality;
    rubberBanding: { shouldHelp: boolean; shouldChallenge: boolean; intensity: number };
    adaptiveStrategy: ReturnType<AdaptiveAI['getAdaptiveStrategy']>;
    teachingMoments: string[];
  } {
    return {
      personality: AI_PERSONALITIES.NORMAL,
      rubberBanding: { shouldHelp: false, shouldChallenge: false, intensity: 0 },
      adaptiveStrategy: this.adaptive.getAdaptiveStrategy(),
      teachingMoments: this.teaching.getTeachingMoments()
    };
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function isValidPosition(pos: Position): boolean {
  return pos.row >= 0 && pos.row < 10 && pos.col >= 0 && pos.col < 10;
}

function isPositionEmpty(gameState: GameState, pos: Position): boolean {
  const cell = gameState.board[pos.row][pos.col];
  return cell === '' || cell === 'SI' || cell === 'Z';
}

function getPossibleMoves(gameState: GameState, unit: Unit): Position[] {
  const moves: Position[] = [];
  const directions = [
    { row: -1, col: 0 },
    { row: 1, col: 0 },
    { row: 0, col: -1 },
    { row: 0, col: 1 }
  ];

  for (const dir of directions) {
    const newPos = {
      row: unit.row + dir.row,
      col: unit.col + dir.col
    };

    if (isValidPosition(newPos) && (isPositionEmpty(gameState, newPos) || isEnemyAt(gameState, newPos))) {
      moves.push(newPos);
    }
  }

  return moves;
}

function isEnemyAt(gameState: GameState, pos: Position): boolean {
  const cell = gameState.board[pos.row][pos.col];
  if (!cell || cell === '' || cell === 'SI' || cell === 'Z') return false;

  const currentPlayerIsTrader = gameState.currentPlayer === 'TRADER';

  if (currentPlayerIsTrader) {
    return cell.includes('TH') || cell.includes('KT');
  }

  return cell.includes('TR') || cell.includes('H');
}

// ============================================================================
// EXPORT SINGLETON
// ============================================================================

export const smartAI = new SmartAIController();
