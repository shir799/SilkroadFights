/**
 * Silkroad Fights - Real-time Game Engine
 * Core game loop, event system, and state management
 */

import {
  GameState,
  Unit,
  UnitId,
  PlayerId,
  PlayerRole,
  Position,
  PlayerAction,
  CombatEvent,
  ValidationResult,
  ActionValidationContext,
  BossMonster,
  Player,
  PlayerControl,
  AttackEvent,
  DamageEvent,
  UnitDeathEvent,
  UnitMovedEvent,
  AnimationState,
} from './newTypes';

import {
  GAME_CONFIG,
  TIMING,
  COMBAT,
  RESOURCES,
  EVENT_CONFIG,
  VALIDATION,
  getUnitConfig,
  getBossConfig,
  calculateDamageAfterDefense,
  rollCriticalHit,
  rollMiss,
  calculateDistance,
  isInRange,
  isValidPosition,
} from './gameConfig';

// ============================================================================
// EVENT EMITTER
// ============================================================================

type EventListener<T> = (event: T) => void;

class EventEmitter<T> {
  private listeners: EventListener<T>[] = [];

  on(listener: EventListener<T>): () => void {
    this.listeners.push(listener);
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  emit(event: T): void {
    this.listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    });
  }

  clear(): void {
    this.listeners = [];
  }
}

// ============================================================================
// GAME ENGINE CLASS
// ============================================================================

export class GameEngine {
  private gameState: GameState;
  private isRunning: boolean = false;
  private lastTickTime: number = 0;
  private tickInterval: number;
  private animationFrameId: number | null = null;

  // Event emitters
  public events = new EventEmitter<CombatEvent>();
  public stateChanged = new EventEmitter<GameState>();

  // Player action rate limiting
  private playerActionCounts: Map<PlayerId, { count: number; windowStart: number }> = new Map();

  constructor(gameId: string = 'game-1') {
    this.tickInterval = 1000 / GAME_CONFIG.tickRate;
    this.gameState = this.createInitialGameState(gameId);
  }

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  private createInitialGameState(gameId: string): GameState {
    return {
      id: gameId,
      config: GAME_CONFIG,
      startTime: Date.now(),
      currentTime: 0,
      isPaused: false,
      board: this.createEmptyBoard(),
      units: new Map(),
      bossMonsters: new Map(),
      players: new Map(),
      playerControls: new Map(),
      droppedGold: [],
      traps: [],
      roundNumber: 1,
      nextSilkSpawn: TIMING.SILK_SPAWN_INTERVAL,
      nextBossSpawn: TIMING.BOSS_SPAWN_INTERVAL,
      goldDelivered: 0,
      recentEvents: [],
      maxEventHistory: EVENT_CONFIG.MAX_EVENT_HISTORY,
    };
  }

  private createEmptyBoard(): string[][] {
    const board: string[][] = [];
    for (let i = 0; i < GAME_CONFIG.boardHeight; i++) {
      board[i] = new Array(GAME_CONFIG.boardWidth).fill('.');
    }
    return board;
  }

  // ==========================================================================
  // PLAYER MANAGEMENT
  // ==========================================================================

  /**
   * Add a player to the game with strict role assignment
   */
  addPlayer(playerId: PlayerId, role: PlayerRole, name: string): void {
    if (this.gameState.players.size >= GAME_CONFIG.maxPlayers) {
      throw new Error('Game is full');
    }

    // Check if role is already taken
    for (const player of this.gameState.players.values()) {
      if (player.role === role) {
        throw new Error(`Role ${role} is already taken`);
      }
    }

    const player: Player = {
      id: playerId,
      role,
      name,
      silkCount: RESOURCES.STARTING_SILK,
      wins: 0,
      isConnected: true,
      lastActionTime: 0,
    };

    const control: PlayerControl = {
      playerId,
      allowedRole: role,
    };

    this.gameState.players.set(playerId, player);
    this.gameState.playerControls.set(playerId, control);
  }

  /**
   * Remove a player from the game
   */
  removePlayer(playerId: PlayerId): void {
    this.gameState.players.delete(playerId);
    this.gameState.playerControls.delete(playerId);
  }

  // ==========================================================================
  // UNIT MANAGEMENT
  // ==========================================================================

  /**
   * Spawn a unit for a player (with ownership validation)
   */
  spawnUnit(playerId: PlayerId, unitType: string, position: Position): UnitId {
    const player = this.gameState.players.get(playerId);
    if (!player) {
      throw new Error('Player not found');
    }

    const config = getUnitConfig(unitType);
    const unitId = `unit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const unit: Unit = {
      id: unitId,
      ownerId: playerId,
      role: player.role,
      type: unitType,
      position: { ...position },
      stats: {
        maxHp: config.maxHp,
        currentHp: config.maxHp,
        attackDamage: config.attackDamage,
        attackRange: config.attackRange,
        movementSpeed: config.movementSpeed,
        attackSpeed: config.attackSpeed,
        defense: config.defense,
      },
      animation: {
        state: 'idle',
        startTime: this.gameState.currentTime,
        duration: 0,
      },
      lastAttackTime: 0,
      lastMoveTime: 0,
      targetUnitId: null,
      buffs: [],
      debuffs: [],
      isImmobilized: false,
      isInvulnerable: false,
      hasGold: false,
      abilities: [],
    };

    this.gameState.units.set(unitId, unit);
    this.updateBoardCell(position, unitId);

    return unitId;
  }

  /**
   * Remove a unit from the game
   */
  removeUnit(unitId: UnitId): void {
    const unit = this.gameState.units.get(unitId);
    if (unit) {
      this.updateBoardCell(unit.position, '.');
      this.gameState.units.delete(unitId);
    }
  }

  // ==========================================================================
  // GAME LOOP
  // ==========================================================================

  /**
   * Start the real-time game loop
   */
  start(): void {
    if (this.isRunning) {
      console.warn('Game is already running');
      return;
    }

    this.isRunning = true;
    this.lastTickTime = performance.now();
    this.gameLoop();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Pause/unpause the game
   */
  pause(): void {
    this.gameState.isPaused = true;
  }

  unpause(): void {
    this.gameState.isPaused = false;
    this.lastTickTime = performance.now();
  }

  /**
   * Main game loop - runs at configured tick rate
   */
  private gameLoop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTickTime;

    if (deltaTime >= this.tickInterval && !this.gameState.isPaused) {
      this.tick(deltaTime);
      this.lastTickTime = currentTime;
    }

    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  };

  /**
   * Single game tick - updates all game systems
   */
  private tick(deltaTime: number): void {
    this.gameState.currentTime += deltaTime;

    // Update all game systems
    this.updateAnimations(deltaTime);
    this.updateBuffsAndDebuffs(deltaTime);
    this.updateBossAI(deltaTime);
    this.updateAutoAttacks(deltaTime);
    this.checkGameEvents();
    this.cleanupOldEvents();

    // Emit state change
    this.stateChanged.emit(this.gameState);
  }

  // ==========================================================================
  // PLAYER ACTIONS - WITH STRICT VALIDATION
  // ==========================================================================

  /**
   * Process a player action with strict ownership and validation
   */
  processAction(action: PlayerAction): ValidationResult {
    // Validate action
    const validation = this.validateAction(action);
    if (!validation.valid) {
      return validation;
    }

    // Rate limiting check
    if (!this.checkRateLimit(action.playerId)) {
      return {
        valid: false,
        error: 'Too many actions. Please slow down.',
      };
    }

    // Process the action based on type
    switch (action.type) {
      case 'MOVE_UNIT':
        return this.processMoveAction(action);
      case 'ATTACK_UNIT':
        return this.processAttackAction(action);
      case 'USE_ABILITY':
        return this.processAbilityAction(action);
      case 'PICK_UP_GOLD':
        return this.processPickUpGoldAction(action);
      case 'DROP_GOLD':
        return this.processDropGoldAction(action);
      default:
        return { valid: false, error: 'Unknown action type' };
    }
  }

  /**
   * CRITICAL: Validate that player owns the unit they're trying to control
   */
  private validateAction(action: PlayerAction): ValidationResult {
    const context: ActionValidationContext = {
      action,
      gameState: this.gameState,
      currentTime: this.gameState.currentTime,
    };

    // 1. Check player exists
    const player = this.gameState.players.get(action.playerId);
    if (!player) {
      return { valid: false, error: 'Player not found' };
    }

    // 2. Check unit exists
    const unit = this.gameState.units.get(action.unitId);
    if (!unit) {
      return { valid: false, error: 'Unit not found' };
    }

    // 3. CRITICAL: Check ownership
    if (unit.ownerId !== action.playerId) {
      return {
        valid: false,
        error: 'You can only control your own units!',
      };
    }

    // 4. CRITICAL: Check role matches
    const control = this.gameState.playerControls.get(action.playerId);
    if (!control || unit.role !== control.allowedRole) {
      return {
        valid: false,
        error: 'You cannot control units of a different role!',
      };
    }

    // 5. Check unit is not immobilized (for movement actions)
    if (action.type === 'MOVE_UNIT' && unit.isImmobilized) {
      return { valid: false, error: 'Unit is immobilized' };
    }

    // 6. Check unit is not currently animating (for most actions)
    if (this.isUnitAnimating(unit) && action.type !== 'ATTACK_UNIT') {
      return { valid: false, error: 'Unit is busy' };
    }

    return { valid: true };
  }

  /**
   * Rate limiting for player actions
   */
  private checkRateLimit(playerId: PlayerId): boolean {
    const now = Date.now();
    const record = this.playerActionCounts.get(playerId);

    if (!record || now - record.windowStart >= VALIDATION.ACTION_WINDOW_MS) {
      // Start new window
      this.playerActionCounts.set(playerId, { count: 1, windowStart: now });
      return true;
    }

    if (record.count >= VALIDATION.MAX_ACTIONS_PER_SECOND) {
      return false;
    }

    record.count++;
    return true;
  }

  // ==========================================================================
  // ACTION PROCESSORS
  // ==========================================================================

  private processMoveAction(action: PlayerAction & { type: 'MOVE_UNIT' }): ValidationResult {
    const unit = this.gameState.units.get(action.unitId)!;
    const target = action.targetPosition;

    // Validate target position
    if (!isValidPosition(target.row, target.col)) {
      return { valid: false, error: 'Invalid target position' };
    }

    // Check if position is occupied
    const cellContent = this.gameState.board[target.row][target.col];
    if (cellContent !== '.' && cellContent !== 'GOLD') {
      return { valid: false, error: 'Position is occupied' };
    }

    // Check distance (can only move to adjacent cells)
    const distance = calculateDistance(unit.position, target);
    if (distance > 1) {
      return { valid: false, error: 'Can only move to adjacent cells' };
    }

    // Check cooldown
    const timeSinceLastMove = this.gameState.currentTime - unit.lastMoveTime;
    if (timeSinceLastMove < TIMING.MOVEMENT_COOLDOWN) {
      return { valid: false, error: 'Movement is on cooldown' };
    }

    // Execute move
    const oldPosition = { ...unit.position };
    this.updateBoardCell(oldPosition, '.');
    unit.position = { ...target };
    this.updateBoardCell(target, unit.id);

    // Update animation
    unit.animation = {
      state: 'moving',
      startTime: this.gameState.currentTime,
      duration: TIMING.MOVE_DURATION,
      targetPosition: target,
    };
    unit.lastMoveTime = this.gameState.currentTime;

    // Emit event
    const event: UnitMovedEvent = {
      type: 'UNIT_MOVED',
      timestamp: Date.now(),
      gameTime: this.gameState.currentTime,
      unitId: unit.id,
      fromPosition: oldPosition,
      toPosition: target,
    };
    this.emitEvent(event);

    return { valid: true };
  }

  private processAttackAction(action: PlayerAction & { type: 'ATTACK_UNIT' }): ValidationResult {
    const attacker = this.gameState.units.get(action.unitId)!;
    const target = this.gameState.units.get(action.targetUnitId);

    if (!target) {
      return { valid: false, error: 'Target unit not found' };
    }

    // Cannot attack own units
    if (target.ownerId === action.playerId) {
      return { valid: false, error: 'Cannot attack your own units' };
    }

    // Check range
    if (!isInRange(attacker.position, target.position, attacker.stats.attackRange)) {
      return { valid: false, error: 'Target is out of range' };
    }

    // Check cooldown
    const attackCooldown = 1000 / attacker.stats.attackSpeed;
    const timeSinceLastAttack = this.gameState.currentTime - attacker.lastAttackTime;
    if (timeSinceLastAttack < attackCooldown) {
      return { valid: false, error: 'Attack is on cooldown' };
    }

    // Execute attack
    this.executeAttack(attacker, target);

    return { valid: true };
  }

  private processAbilityAction(action: PlayerAction & { type: 'USE_ABILITY' }): ValidationResult {
    // Placeholder for ability system
    return { valid: false, error: 'Ability system not yet implemented' };
  }

  private processPickUpGoldAction(action: PlayerAction & { type: 'PICK_UP_GOLD' }): ValidationResult {
    const unit = this.gameState.units.get(action.unitId)!;

    // Check if there's gold at this position
    const hasGold = this.gameState.droppedGold.some(
      pos => pos.row === unit.position.row && pos.col === unit.position.col
    );

    if (!hasGold) {
      return { valid: false, error: 'No gold at this position' };
    }

    if (unit.hasGold) {
      return { valid: false, error: 'Unit is already carrying gold' };
    }

    // Pick up gold
    unit.hasGold = true;
    this.gameState.droppedGold = this.gameState.droppedGold.filter(
      pos => !(pos.row === unit.position.row && pos.col === unit.position.col)
    );

    return { valid: true };
  }

  private processDropGoldAction(action: PlayerAction & { type: 'DROP_GOLD' }): ValidationResult {
    const unit = this.gameState.units.get(action.unitId)!;

    if (!unit.hasGold) {
      return { valid: false, error: 'Unit is not carrying gold' };
    }

    // Drop gold
    unit.hasGold = false;
    this.gameState.droppedGold.push({ ...unit.position });

    return { valid: true };
  }

  // ==========================================================================
  // COMBAT SYSTEM
  // ==========================================================================

  private executeAttack(attacker: Unit, defender: Unit): void {
    attacker.lastAttackTime = this.gameState.currentTime;
    attacker.animation = {
      state: 'attacking',
      startTime: this.gameState.currentTime,
      duration: TIMING.ATTACK_DURATION,
      targetUnitId: defender.id,
    };

    // Roll for miss
    if (rollMiss()) {
      const missEvent: AttackEvent = {
        type: 'ATTACK_MISSED',
        timestamp: Date.now(),
        gameTime: this.gameState.currentTime,
        attackerId: attacker.id,
        targetId: defender.id,
      };
      this.emitEvent(missEvent);
      return;
    }

    // Calculate damage
    let damage = attacker.stats.attackDamage;

    // Critical hit
    if (rollCriticalHit()) {
      damage = Math.floor(damage * COMBAT.CRITICAL_HIT_MULTIPLIER);
    }

    // Apply defense
    damage = calculateDamageAfterDefense(damage, defender.stats.defense);

    // Emit attack hit event
    const hitEvent: AttackEvent = {
      type: 'ATTACK_HIT',
      timestamp: Date.now(),
      gameTime: this.gameState.currentTime,
      attackerId: attacker.id,
      targetId: defender.id,
      damage,
    };
    this.emitEvent(hitEvent);

    // Apply damage
    this.applyDamage(defender, damage, attacker.id);
  }

  private applyDamage(unit: Unit, damage: number, sourceId: UnitId): void {
    if (unit.isInvulnerable) {
      return;
    }

    unit.stats.currentHp = Math.max(0, unit.stats.currentHp - damage);

    // Animation
    unit.animation = {
      state: 'taking_damage',
      startTime: this.gameState.currentTime,
      duration: TIMING.DAMAGE_FLASH_DURATION,
    };

    // Emit damage event
    const damageEvent: DamageEvent = {
      type: 'DAMAGE_DEALT',
      timestamp: Date.now(),
      gameTime: this.gameState.currentTime,
      sourceId,
      targetId: unit.id,
      damage,
      remainingHp: unit.stats.currentHp,
    };
    this.emitEvent(damageEvent);

    // Check for death
    if (unit.stats.currentHp <= 0) {
      this.handleUnitDeath(unit, sourceId);
    }
  }

  private handleUnitDeath(unit: Unit, killerId: UnitId | null): void {
    // Animation
    unit.animation = {
      state: 'dying',
      startTime: this.gameState.currentTime,
      duration: TIMING.DEATH_DURATION,
    };

    // Drop gold if carrying
    const droppedGold = unit.hasGold;
    if (droppedGold) {
      this.gameState.droppedGold.push({ ...unit.position });
    }

    // Emit death event
    const deathEvent: UnitDeathEvent = {
      type: 'UNIT_DIED',
      timestamp: Date.now(),
      gameTime: this.gameState.currentTime,
      unitId: unit.id,
      killerId,
      droppedGold,
    };
    this.emitEvent(deathEvent);

    // Schedule removal after animation
    setTimeout(() => {
      this.removeUnit(unit.id);
    }, TIMING.DEATH_DURATION);
  }

  // ==========================================================================
  // GAME SYSTEMS UPDATE
  // ==========================================================================

  private updateAnimations(deltaTime: number): void {
    for (const unit of this.gameState.units.values()) {
      const elapsed = this.gameState.currentTime - unit.animation.startTime;
      if (elapsed >= unit.animation.duration) {
        // Animation finished, return to idle
        unit.animation = {
          state: 'idle',
          startTime: this.gameState.currentTime,
          duration: 0,
        };
      }
    }
  }

  private updateBuffsAndDebuffs(deltaTime: number): void {
    for (const unit of this.gameState.units.values()) {
      const currentTime = this.gameState.currentTime;

      // Remove expired buffs
      unit.buffs = unit.buffs.filter(buff => {
        const elapsed = currentTime - buff.appliedAt;
        return elapsed < buff.duration;
      });

      // Remove expired debuffs
      unit.debuffs = unit.debuffs.filter(debuff => {
        const elapsed = currentTime - debuff.appliedAt;
        return elapsed < debuff.duration;
      });

      // Update immobilized status
      unit.isImmobilized = unit.debuffs.some(d => d.type === 'immobilized');
    }
  }

  private updateBossAI(deltaTime: number): void {
    // Placeholder for boss AI
    // Bosses will automatically attack nearby units
  }

  private updateAutoAttacks(deltaTime: number): void {
    // Placeholder for auto-attack system
    // Units with targets will automatically attack when in range
  }

  private checkGameEvents(): void {
    // Check for silk spawns, boss spawns, win conditions, etc.
  }

  private cleanupOldEvents(): void {
    if (this.gameState.recentEvents.length > this.gameState.maxEventHistory) {
      this.gameState.recentEvents = this.gameState.recentEvents.slice(-this.gameState.maxEventHistory);
    }
  }

  // ==========================================================================
  // HELPER METHODS
  // ==========================================================================

  private isUnitAnimating(unit: Unit): boolean {
    return unit.animation.state !== 'idle';
  }

  private updateBoardCell(position: Position, value: string): void {
    if (isValidPosition(position.row, position.col)) {
      this.gameState.board[position.row][position.col] = value;
    }
  }

  private emitEvent(event: CombatEvent): void {
    this.gameState.recentEvents.push(event);
    this.events.emit(event);
  }

  // ==========================================================================
  // PUBLIC GETTERS
  // ==========================================================================

  getGameState(): Readonly<GameState> {
    return this.gameState;
  }

  getUnit(unitId: UnitId): Unit | undefined {
    return this.gameState.units.get(unitId);
  }

  getPlayer(playerId: PlayerId): Player | undefined {
    return this.gameState.players.get(playerId);
  }

  getPlayerUnits(playerId: PlayerId): Unit[] {
    return Array.from(this.gameState.units.values()).filter(
      unit => unit.ownerId === playerId
    );
  }

  isPlayerAllowedToControlUnit(playerId: PlayerId, unitId: UnitId): boolean {
    const unit = this.gameState.units.get(unitId);
    const control = this.gameState.playerControls.get(playerId);

    if (!unit || !control) {
      return false;
    }

    return unit.ownerId === playerId && unit.role === control.allowedRole;
  }
}
