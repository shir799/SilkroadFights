/**
 * NEW Enhanced Types for Silkroad Fights
 * Real-time game architecture with strict player control
 */

// ============================================================================
// BASIC TYPES
// ============================================================================

export type PlayerId = string;
export type UnitId = string;
export type PlayerRole = 'TRADER' | 'THIEF';

export interface Position {
  row: number;
  col: number;
}

// ============================================================================
// ANIMATION STATES
// ============================================================================

export type AnimationState =
  | 'idle'
  | 'moving'
  | 'attacking'
  | 'taking_damage'
  | 'dying'
  | 'defending'
  | 'casting_ability';

export interface AnimationData {
  state: AnimationState;
  startTime: number;
  duration: number;
  targetPosition?: Position;
  targetUnitId?: UnitId;
}

// ============================================================================
// UNIT TYPES
// ============================================================================

export interface UnitStats {
  maxHp: number;
  currentHp: number;
  attackDamage: number;
  attackRange: number;
  movementSpeed: number; // cells per second
  attackSpeed: number; // attacks per second
  defense: number;
}

export interface Unit {
  id: UnitId;
  ownerId: PlayerId;
  role: PlayerRole;
  type: string;
  position: Position;
  stats: UnitStats;

  // Real-time state
  animation: AnimationData;
  lastAttackTime: number;
  lastMoveTime: number;
  targetUnitId: UnitId | null;

  // Status effects
  buffs: Buff[];
  debuffs: Debuff[];
  isImmobilized: boolean;
  isInvulnerable: boolean;

  // Special properties
  hasGold: boolean;
  abilities: string[];
}

export interface Buff {
  id: string;
  type: string;
  duration: number; // milliseconds
  appliedAt: number; // timestamp
  value: number;
}

export interface Debuff {
  id: string;
  type: string;
  duration: number; // milliseconds
  appliedAt: number; // timestamp
  value: number;
}

// ============================================================================
// BOSS MONSTER TYPES
// ============================================================================

export type BossType = 'TigerGiry' | 'SkeletoKing' | 'Murucha';

export interface BossMonster {
  id: UnitId;
  type: BossType;
  position: Position;
  stats: UnitStats;
  animation: AnimationData;
  movementPattern: 'random' | 'stationary' | 'area';
  rewards: {
    silk: number;
    buffs: string[];
  };
  targetUnitId: UnitId | null;
  lastAttackTime: number;
  lastMoveTime: number;
}

// ============================================================================
// PLAYER TYPES
// ============================================================================

export interface Player {
  id: PlayerId;
  role: PlayerRole;
  name: string;
  silkCount: number;
  wins: number;
  isConnected: boolean;
  lastActionTime: number;
}

export interface PlayerControl {
  playerId: PlayerId;
  allowedRole: PlayerRole;
}

// ============================================================================
// COMBAT EVENT TYPES
// ============================================================================

export type CombatEventType =
  | 'ATTACK_STARTED'
  | 'ATTACK_HIT'
  | 'ATTACK_MISSED'
  | 'DAMAGE_DEALT'
  | 'UNIT_DIED'
  | 'UNIT_MOVED'
  | 'ABILITY_USED'
  | 'BUFF_APPLIED'
  | 'DEBUFF_APPLIED'
  | 'GOLD_PICKED_UP'
  | 'GOLD_DROPPED'
  | 'SILK_COLLECTED'
  | 'BOSS_SPAWNED'
  | 'BOSS_DEFEATED';

export interface BaseCombatEvent {
  type: CombatEventType;
  timestamp: number;
  gameTime: number; // game time in milliseconds
}

export interface AttackEvent extends BaseCombatEvent {
  type: 'ATTACK_STARTED' | 'ATTACK_HIT' | 'ATTACK_MISSED';
  attackerId: UnitId;
  targetId: UnitId;
  damage?: number;
}

export interface DamageEvent extends BaseCombatEvent {
  type: 'DAMAGE_DEALT';
  sourceId: UnitId;
  targetId: UnitId;
  damage: number;
  remainingHp: number;
}

export interface UnitDeathEvent extends BaseCombatEvent {
  type: 'UNIT_DIED';
  unitId: UnitId;
  killerId: UnitId | null;
  droppedGold: boolean;
}

export interface UnitMovedEvent extends BaseCombatEvent {
  type: 'UNIT_MOVED';
  unitId: UnitId;
  fromPosition: Position;
  toPosition: Position;
}

export interface AbilityUsedEvent extends BaseCombatEvent {
  type: 'ABILITY_USED';
  casterId: UnitId;
  abilityName: string;
  targetId?: UnitId;
  targetPosition?: Position;
}

export interface BuffAppliedEvent extends BaseCombatEvent {
  type: 'BUFF_APPLIED';
  targetId: UnitId;
  buff: Buff;
}

export interface DebuffAppliedEvent extends BaseCombatEvent {
  type: 'DEBUFF_APPLIED';
  targetId: UnitId;
  debuff: Debuff;
}

export interface GoldEvent extends BaseCombatEvent {
  type: 'GOLD_PICKED_UP' | 'GOLD_DROPPED';
  unitId: UnitId;
  position: Position;
}

export interface SilkEvent extends BaseCombatEvent {
  type: 'SILK_COLLECTED';
  unitId: UnitId;
  playerId: PlayerId;
  amount: number;
}

export interface BossSpawnedEvent extends BaseCombatEvent {
  type: 'BOSS_SPAWNED';
  bossId: UnitId;
  bossType: BossType;
  position: Position;
}

export interface BossDefeatedEvent extends BaseCombatEvent {
  type: 'BOSS_DEFEATED';
  bossId: UnitId;
  killerId: UnitId;
  rewards: {
    silk: number;
    buffs: string[];
  };
}

export type CombatEvent =
  | AttackEvent
  | DamageEvent
  | UnitDeathEvent
  | UnitMovedEvent
  | AbilityUsedEvent
  | BuffAppliedEvent
  | DebuffAppliedEvent
  | GoldEvent
  | SilkEvent
  | BossSpawnedEvent
  | BossDefeatedEvent;

// ============================================================================
// GAME STATE TYPES
// ============================================================================

export interface GameConfig {
  boardWidth: number;
  boardHeight: number;
  tickRate: number; // updates per second
  maxPlayers: number;
}

export interface GameState {
  // Game metadata
  id: string;
  config: GameConfig;
  startTime: number;
  currentTime: number;
  isPaused: boolean;

  // Board state
  board: string[][];

  // Entities
  units: Map<UnitId, Unit>;
  bossMonsters: Map<UnitId, BossMonster>;

  // Players
  players: Map<PlayerId, Player>;
  playerControls: Map<PlayerId, PlayerControl>;

  // Resources
  droppedGold: Position[];
  traps: Position[];

  // Game progression
  roundNumber: number;
  nextSilkSpawn: number;
  nextBossSpawn: number;
  goldDelivered: number;

  // Event history (last N events for replay/debugging)
  recentEvents: CombatEvent[];
  maxEventHistory: number;
}

// ============================================================================
// ACTION TYPES (Player Commands)
// ============================================================================

export type ActionType =
  | 'MOVE_UNIT'
  | 'ATTACK_UNIT'
  | 'USE_ABILITY'
  | 'PICK_UP_GOLD'
  | 'DROP_GOLD';

export interface BaseAction {
  type: ActionType;
  playerId: PlayerId;
  unitId: UnitId;
  timestamp: number;
}

export interface MoveUnitAction extends BaseAction {
  type: 'MOVE_UNIT';
  targetPosition: Position;
}

export interface AttackUnitAction extends BaseAction {
  type: 'ATTACK_UNIT';
  targetUnitId: UnitId;
}

export interface UseAbilityAction extends BaseAction {
  type: 'USE_ABILITY';
  abilityName: string;
  targetUnitId?: UnitId;
  targetPosition?: Position;
}

export interface PickUpGoldAction extends BaseAction {
  type: 'PICK_UP_GOLD';
}

export interface DropGoldAction extends BaseAction {
  type: 'DROP_GOLD';
}

export type PlayerAction =
  | MoveUnitAction
  | AttackUnitAction
  | UseAbilityAction
  | PickUpGoldAction
  | DropGoldAction;

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export interface ActionValidationContext {
  action: PlayerAction;
  gameState: GameState;
  currentTime: number;
}
