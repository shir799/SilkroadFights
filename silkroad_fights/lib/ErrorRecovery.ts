/**
 * ERROR RECOVERY SYSTEM
 *
 * Helps players recover from mistakes with:
 * - Undo last move (once per game)
 * - Confirmation dialogs for critical actions
 * - Pause menu with hints
 * - Surrender option (no penalty)
 * - Quick rematch
 * - Save/Load game state
 */

import { GameState, Unit, Position } from './types';

// ============================================================================
// UNDO SYSTEM
// ============================================================================

export interface GameStateSnapshot {
  timestamp: number;
  roundNumber: number;
  state: GameState;
  action: string;
}

export class UndoManager {
  private history: GameStateSnapshot[] = [];
  private maxHistorySize: number = 10;
  private undoesUsed: number = 0;
  private maxUndosPerGame: number = 1;

  /**
   * Save current game state
   */
  saveState(gameState: GameState, action: string) {
    const snapshot: GameStateSnapshot = {
      timestamp: Date.now(),
      roundNumber: gameState.roundNumber,
      state: this.deepClone(gameState),
      action
    };

    this.history.push(snapshot);

    // Keep only last N states
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Undo last move
   */
  undo(): { success: boolean; state?: GameState; message: string } {
    if (this.undoesUsed >= this.maxUndosPerGame) {
      return {
        success: false,
        message: `You've already used your undo (${this.maxUndosPerGame} per game)`
      };
    }

    if (this.history.length < 2) {
      return {
        success: false,
        message: 'No moves to undo'
      };
    }

    // Remove current state
    this.history.pop();

    // Get previous state
    const previousState = this.history[this.history.length - 1];

    if (!previousState) {
      return {
        success: false,
        message: 'Cannot undo further'
      };
    }

    this.undoesUsed++;

    return {
      success: true,
      state: this.deepClone(previousState.state),
      message: `Undid: ${previousState.action} (${this.maxUndosPerGame - this.undoesUsed} undos remaining)`
    };
  }

  /**
   * Check if undo is available
   */
  canUndo(): { can: boolean; remaining: number; reason?: string } {
    const remaining = this.maxUndosPerGame - this.undoesUsed;

    if (remaining <= 0) {
      return {
        can: false,
        remaining: 0,
        reason: 'No undos remaining this game'
      };
    }

    if (this.history.length < 2) {
      return {
        can: false,
        remaining,
        reason: 'No moves to undo'
      };
    }

    return {
      can: true,
      remaining
    };
  }

  /**
   * Get last action for display
   */
  getLastAction(): string {
    if (this.history.length === 0) return 'None';
    return this.history[this.history.length - 1].action;
  }

  /**
   * Reset for new game
   */
  reset() {
    this.history = [];
    this.undoesUsed = 0;
  }

  /**
   * Deep clone game state
   */
  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Get history for debugging
   */
  getHistory(): GameStateSnapshot[] {
    return [...this.history];
  }
}

// ============================================================================
// CONFIRMATION DIALOGS
// ============================================================================

export interface ConfirmationDialog {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  showCheckbox?: boolean;
  checkboxLabel?: string;
}

export const CONFIRMATION_DIALOGS: Record<string, ConfirmationDialog> = {
  SURRENDER: {
    id: 'surrender',
    type: 'danger',
    title: 'Surrender Game?',
    message:
      'Are you sure you want to surrender? This will end the game immediately and count as a loss.',
    confirmText: 'Surrender',
    cancelText: 'Keep Fighting',
    showCheckbox: true,
    checkboxLabel: "Don't ask again this session"
  },
  SACRIFICE_UNIT: {
    id: 'sacrifice_unit',
    type: 'warning',
    title: 'Risky Move',
    message:
      'This move will likely result in your unit being killed. Are you sure you want to proceed?',
    confirmText: 'Yes, Make Move',
    cancelText: 'Cancel',
    showCheckbox: false
  },
  LEAVE_GAME: {
    id: 'leave_game',
    type: 'warning',
    title: 'Leave Game?',
    message: 'Leaving now will count as a surrender. Your progress will not be saved.',
    confirmText: 'Leave Game',
    cancelText: 'Stay',
    showCheckbox: false
  },
  USE_LAST_UNDO: {
    id: 'use_last_undo',
    type: 'warning',
    title: 'Use Last Undo?',
    message:
      'This is your last undo for this game. Are you sure you want to use it now?',
    confirmText: 'Undo Move',
    cancelText: 'Cancel',
    showCheckbox: false
  },
  ABILITY_NO_EFFECT: {
    id: 'ability_no_effect',
    type: 'info',
    title: 'Ability May Not Help',
    message:
      'This ability might not be useful in the current situation. Use anyway?',
    confirmText: 'Use Ability',
    cancelText: 'Cancel',
    showCheckbox: true,
    checkboxLabel: "Don't warn me about abilities"
  }
};

export class ConfirmationManager {
  private disabledConfirmations: Set<string> = new Set();

  shouldShowConfirmation(dialogId: string): boolean {
    return !this.disabledConfirmations.has(dialogId);
  }

  disableConfirmation(dialogId: string) {
    this.disabledConfirmations.add(dialogId);
  }

  enableConfirmation(dialogId: string) {
    this.disabledConfirmations.delete(dialogId);
  }

  resetSession() {
    this.disabledConfirmations.clear();
  }
}

// ============================================================================
// DANGEROUS MOVE DETECTION
// ============================================================================

export class DangerousMoveDete {
  /**
   * Analyze if a move is dangerous
   */
  analyzeMoveRisk(
    gameState: GameState,
    unit: Unit,
    targetPosition: Position
  ): {
    isDangerous: boolean;
    riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    reasons: string[];
    recommendation: string;
  } {
    const risks: string[] = [];
    let riskScore = 0;

    // Check if moving into enemy range
    const enemyUnits = gameState.isTraderPlayer ? gameState.thiefUnits : gameState.traderUnits;

    const nearbyEnemies = enemyUnits.filter(enemy => {
      const distance = Math.max(
        Math.abs(targetPosition.row - enemy.row),
        Math.abs(targetPosition.col - enemy.col)
      );
      return distance <= 1;
    });

    if (nearbyEnemies.length > 0) {
      riskScore += nearbyEnemies.length * 20;
      risks.push(`${nearbyEnemies.length} enemy unit(s) can attack this position`);
    }

    // Check if unit is carrying gold
    if (unit.hasGold) {
      riskScore += 30;
      risks.push('This unit is carrying gold - extra risky!');
    }

    // Check if unit is low HP
    if (unit.hp < unit.maxHp * 0.3) {
      riskScore += 25;
      risks.push('Unit has low HP - one hit could kill');
    }

    // Check if moving away from allies
    const allyUnits = gameState.isTraderPlayer ? gameState.traderUnits : gameState.thiefUnits;
    const nearbyAllies = allyUnits.filter(ally => {
      if (ally === unit) return false;
      const distance = Math.max(
        Math.abs(targetPosition.row - ally.row),
        Math.abs(targetPosition.col - ally.col)
      );
      return distance <= 2;
    });

    if (nearbyAllies.length === 0 && allyUnits.length > 1) {
      riskScore += 15;
      risks.push('Moving away from team support');
    }

    // Check for traps
    if (gameState.traps.some(trap => trap.row === targetPosition.row && trap.col === targetPosition.col)) {
      riskScore += 40;
      risks.push('There is a trap at this position!');
    }

    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    if (riskScore >= 60) riskLevel = 'extreme';
    else if (riskScore >= 40) riskLevel = 'high';
    else if (riskScore >= 20) riskLevel = 'medium';
    else riskLevel = 'low';

    // Generate recommendation
    let recommendation = '';
    if (riskLevel === 'extreme') {
      recommendation = 'STRONGLY NOT RECOMMENDED - High chance of unit death';
    } else if (riskLevel === 'high') {
      recommendation = 'Risky move - Consider alternatives';
    } else if (riskLevel === 'medium') {
      recommendation = 'Some risk - Proceed with caution';
    } else {
      recommendation = 'Safe move';
    }

    return {
      isDangerous: riskScore >= 30,
      riskLevel,
      reasons: risks,
      recommendation
    };
  }

  /**
   * Suggest safer alternatives
   */
  suggestSaferMoves(
    gameState: GameState,
    unit: Unit
  ): Array<{ position: Position; reason: string }> {
    const suggestions: Array<{ position: Position; reason: string }> = [];
    const directions = [
      { row: -1, col: 0, name: 'North' },
      { row: 1, col: 0, name: 'South' },
      { row: 0, col: -1, name: 'West' },
      { row: 0, col: 1, name: 'East' }
    ];

    for (const dir of directions) {
      const pos = {
        row: unit.row + dir.row,
        col: unit.col + dir.col
      };

      // Check if position is valid
      if (pos.row < 0 || pos.row >= 10 || pos.col < 0 || pos.col >= 10) {
        continue;
      }

      const risk = this.analyzeMoveRisk(gameState, unit, pos);

      if (risk.riskLevel === 'low' || risk.riskLevel === 'medium') {
        suggestions.push({
          position: pos,
          reason: `${dir.name}: ${risk.recommendation}`
        });
      }
    }

    return suggestions.slice(0, 3); // Top 3 suggestions
  }
}

// ============================================================================
// PAUSE MENU
// ============================================================================

export interface PauseMenuOption {
  id: string;
  label: string;
  icon: string;
  action: 'resume' | 'undo' | 'restart' | 'surrender' | 'help' | 'options';
  enabled: boolean;
  description?: string;
}

export class PauseMenuManager {
  private isPaused: boolean = false;
  private pauseStartTime: number = 0;

  pause(): void {
    this.isPaused = true;
    this.pauseStartTime = Date.now();
  }

  resume(): number {
    this.isPaused = false;
    const pauseDuration = Date.now() - this.pauseStartTime;
    return pauseDuration;
  }

  getMenuOptions(undoManager: UndoManager): PauseMenuOption[] {
    const undoStatus = undoManager.canUndo();

    return [
      {
        id: 'resume',
        label: 'Resume Game',
        icon: '▶️',
        action: 'resume',
        enabled: true,
        description: 'Continue playing'
      },
      {
        id: 'undo',
        label: 'Undo Last Move',
        icon: '↩️',
        action: 'undo',
        enabled: undoStatus.can,
        description: undoStatus.can
          ? `${undoStatus.remaining} undo(s) remaining`
          : undoStatus.reason
      },
      {
        id: 'help',
        label: 'Strategy Guide',
        icon: '📖',
        action: 'help',
        enabled: true,
        description: 'View tips and strategies'
      },
      {
        id: 'restart',
        label: 'Restart Game',
        icon: '🔄',
        action: 'restart',
        enabled: true,
        description: 'Start a new game'
      },
      {
        id: 'options',
        label: 'Options',
        icon: '⚙️',
        action: 'options',
        enabled: true,
        description: 'Adjust settings'
      },
      {
        id: 'surrender',
        label: 'Surrender',
        icon: '🏳️',
        action: 'surrender',
        enabled: true,
        description: 'Give up (no penalty)'
      }
    ];
  }

  isPausedState(): boolean {
    return this.isPaused;
  }
}

// ============================================================================
// AUTO-SAVE SYSTEM
// ============================================================================

export interface SavedGame {
  id: string;
  timestamp: number;
  gameState: GameState;
  gameMode: string;
  playerRole: 'TRADER' | 'THIEF';
  elapsedTime: number;
}

export class AutoSaveManager {
  private readonly STORAGE_KEY = 'silkroad_fights_autosave';
  private readonly MAX_SAVES = 3;
  private autoSaveInterval: number = 60000; // 60 seconds

  /**
   * Save game to localStorage
   */
  saveGame(
    gameState: GameState,
    gameMode: string,
    elapsedTime: number
  ): { success: boolean; message: string } {
    try {
      const save: SavedGame = {
        id: `save_${Date.now()}`,
        timestamp: Date.now(),
        gameState: this.deepClone(gameState),
        gameMode,
        playerRole: gameState.isTraderPlayer ? 'TRADER' : 'THIEF',
        elapsedTime
      };

      const saves = this.getAllSaves();
      saves.push(save);

      // Keep only last N saves
      if (saves.length > this.MAX_SAVES) {
        saves.shift();
      }

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saves));

      return {
        success: true,
        message: 'Game saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to save game'
      };
    }
  }

  /**
   * Load most recent save
   */
  loadGame(): { success: boolean; save?: SavedGame; message: string } {
    try {
      const saves = this.getAllSaves();

      if (saves.length === 0) {
        return {
          success: false,
          message: 'No saved games found'
        };
      }

      const latestSave = saves[saves.length - 1];

      return {
        success: true,
        save: latestSave,
        message: 'Game loaded successfully'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Failed to load game'
      };
    }
  }

  /**
   * Get all saves
   */
  getAllSaves(): SavedGame[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      return JSON.parse(data);
    } catch {
      return [];
    }
  }

  /**
   * Delete a save
   */
  deleteSave(saveId: string): void {
    const saves = this.getAllSaves().filter(s => s.id !== saveId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(saves));
  }

  /**
   * Clear all saves
   */
  clearAllSaves(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  private deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

// ============================================================================
// QUICK REMATCH
// ============================================================================

export interface RematchOptions {
  sameSettings: boolean;
  swapSides: boolean;
  adjustDifficulty: boolean;
}

export class RematchManager {
  private lastGameSettings: {
    gameMode: string;
    aiDifficulty: string;
    playerRole: 'TRADER' | 'THIEF';
  } | null = null;

  saveSettings(gameMode: string, aiDifficulty: string, playerRole: 'TRADER' | 'THIEF') {
    this.lastGameSettings = {
      gameMode,
      aiDifficulty,
      playerRole
    };
  }

  getRematchSettings(
    options: RematchOptions
  ): { gameMode: string; aiDifficulty: string; playerRole: 'TRADER' | 'THIEF' } | null {
    if (!this.lastGameSettings) return null;

    const settings = { ...this.lastGameSettings };

    if (options.swapSides) {
      settings.playerRole = settings.playerRole === 'TRADER' ? 'THIEF' : 'TRADER';
    }

    if (options.adjustDifficulty) {
      // Increment difficulty
      const difficulties = ['noob', 'normal', 'hard', 'silkroad'];
      const currentIndex = difficulties.indexOf(settings.aiDifficulty);
      if (currentIndex < difficulties.length - 1) {
        settings.aiDifficulty = difficulties[currentIndex + 1];
      }
    }

    return settings;
  }

  hasLastGame(): boolean {
    return this.lastGameSettings !== null;
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCES
// ============================================================================

export const undoManager = new UndoManager();
export const confirmationManager = new ConfirmationManager();
export const dangerDetector = new DangerousMoveDete();
export const pauseMenu = new PauseMenuManager();
export const autoSave = new AutoSaveManager();
export const rematchManager = new RematchManager();

// ============================================================================
// INTEGRATED ERROR RECOVERY CONTROLLER
// ============================================================================

export class ErrorRecoveryController {
  undo = undoManager;
  confirmation = confirmationManager;
  danger = dangerDetector;
  pause = pauseMenu;
  autoSave = autoSave;
  rematch = rematchManager;

  /**
   * Handle a move with full error recovery support
   */
  handleMove(
    gameState: GameState,
    unit: Unit,
    targetPosition: Position,
    skipConfirmations: boolean = false
  ): {
    proceed: boolean;
    needsConfirmation: boolean;
    confirmationDialog?: ConfirmationDialog;
    warnings: string[];
  } {
    const warnings: string[] = [];

    // Analyze risk
    const risk = this.danger.analyzeMoveRisk(gameState, unit, targetPosition);

    if (risk.isDangerous && !skipConfirmations) {
      return {
        proceed: false,
        needsConfirmation: true,
        confirmationDialog: CONFIRMATION_DIALOGS.SACRIFICE_UNIT,
        warnings: risk.reasons
      };
    }

    if (risk.riskLevel !== 'low') {
      warnings.push(...risk.reasons);
    }

    return {
      proceed: true,
      needsConfirmation: false,
      warnings
    };
  }

  /**
   * Initialize error recovery for a new game
   */
  initializeGame(gameState: GameState, gameMode: string) {
    this.undo.reset();
    this.undo.saveState(gameState, 'Game Start');
    this.rematch.saveSettings(
      gameMode,
      'normal',
      gameState.isTraderPlayer ? 'TRADER' : 'THIEF'
    );
  }

  /**
   * Get comprehensive status
   */
  getStatus() {
    return {
      undoAvailable: this.undo.canUndo(),
      lastAction: this.undo.getLastAction(),
      isPaused: this.pause.isPausedState(),
      hasSavedGame: this.autoSave.getAllSaves().length > 0,
      canRematch: this.rematch.hasLastGame()
    };
  }
}

export const errorRecovery = new ErrorRecoveryController();
