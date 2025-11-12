// TFT-specific types - completely separate from old game

export interface TFTUnit {
  id: string
  name: string
  type: 'TRADER' | 'HUNTER' | 'THIEF' | 'KINGTHIEF'
  cost: number
  hp: number
  maxHp: number
  damage: number
  attackSpeed: number
  range: number
  stars: number
  position: { x: number, y: number } | null
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  items: string[]
}

export interface TFTPlayer {
  name: string
  health: number
  maxHealth: number
  gold: number
  level: number
  xp: number
  winStreak: number
  lossStreak: number
  bench: TFTUnit[]
  board: TFTUnit[]
  maxBoardSize: number // Based on level
}

export interface TFTGameState {
  round: number
  phase: 'shop' | 'combat' | 'results'
  player: TFTPlayer
  opponent: TFTPlayer
  shopUnits: TFTUnit[]
  combatLog: string[]
  timer: number
  gameOver: boolean
  winner: 'player' | 'opponent' | null
}

export interface CombatAction {
  timestamp: number
  attacker: string
  defender: string
  damage: number
  type: 'attack' | 'ability' | 'death'
}
