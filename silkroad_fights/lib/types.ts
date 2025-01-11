export interface Position {
  row: number;
  col: number;
}

export interface BossMonster {
  type: 'TigerGiry' | 'SkeletoKing' | 'Murucha';
  hp: number;
  maxHp: number;
  position: Position;
  damage: number;
  range: number;
  movementPattern: 'random' | 'stationary' | 'area';
  rewards: {
    silk: number;
    buffs: string[];
  };
}

export interface Unit {
  type: string;
  hp: number;
  maxHp: number;
  row: number;
  col: number;
  hasGold?: boolean;
  abilities: string[];
  buffs: Buff[];
  debuffs: Debuff[];
  isImmobilized?: boolean;
}

export interface Ability {
  name: string;
  cost: number;
  type: 'buff' | 'debuff' | 'movement' | 'combat';
  duration: number;
  effect: string;
}

export interface Buff {
  type: string;
  duration: number;
}

export interface Debuff {
  type: string;
  duration: number;
}

export interface GameState {
  board: string[][];
  traderUnits: Unit[];
  thiefUnits: Unit[];
  bossMonsters: BossMonster[];
  silkCountTrader: number;
  silkCountThief: number;
  goldDelivered: number;
  roundNumber: number;
  currentPlayer: 'TRADER' | 'THIEF';
  selectedUnit: Position | null;
  lastUsedAbility: string | null;
  traderWins: number;
  thiefWins: number;
  nextSilkSpawn: number;
  nextBossSpawn: number;
  combatResult: CombatResult | null;
  traps: Position[];
  buffs: {
    TRADER: Buff[];
    THIEF: Buff[];
  };
  droppedGold: Position[];
  isTraderPlayer: boolean;
}

export interface CombatResult {
  winner: 'attacker' | 'defender';
  attackRoll: number[];
  defenseRoll: number[];
  attacker: string;
  defender: string;
  attackerHp: number;
  defenderHp: number;
}

