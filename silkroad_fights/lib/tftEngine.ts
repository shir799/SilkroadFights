import { TFTUnit, TFTPlayer, TFTGameState, CombatAction } from './tftTypes'

// Constants
const MAX_BENCH_SIZE = 8
const SHOP_SIZE = 5
const REROLL_COST = 2
const XP_COST = 4
const SHOP_PREP_TIME = 30
const MAX_LEVEL = 9

// Level requirements
const LEVEL_XP_REQUIREMENTS = [0, 2, 6, 10, 18, 30, 46, 66, 90]
const LEVEL_BOARD_SIZE = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

// Unit pool
const UNIT_POOL: Omit<TFTUnit, 'id' | 'position'>[] = [
  { name: 'Trader', type: 'TRADER', cost: 1, hp: 500, maxHp: 500, damage: 40, attackSpeed: 1.0, range: 1, stars: 1, rarity: 'common', items: [] },
  { name: 'Hunter', type: 'HUNTER', cost: 2, hp: 650, maxHp: 650, damage: 55, attackSpeed: 1.2, range: 3, stars: 1, rarity: 'common', items: [] },
  { name: 'Thief', type: 'THIEF', cost: 2, hp: 550, maxHp: 550, damage: 60, attackSpeed: 1.3, range: 1, stars: 1, rarity: 'rare', items: [] },
  { name: 'King Thief', type: 'KINGTHIEF', cost: 3, hp: 750, maxHp: 750, damage: 75, attackSpeed: 1.1, range: 1, stars: 1, rarity: 'epic', items: [] },
]

// Initialize new game
export function initializeTFTGame(): TFTGameState {
  const player: TFTPlayer = {
    name: 'Player',
    health: 100,
    maxHealth: 100,
    gold: 5,
    level: 1,
    xp: 0,
    winStreak: 0,
    lossStreak: 0,
    bench: [],
    board: [],
    maxBoardSize: LEVEL_BOARD_SIZE[1]
  }

  const opponent: TFTPlayer = {
    ...player,
    name: 'Opponent',
    bench: [],
    board: []
  }

  return {
    round: 1,
    phase: 'shop',
    player,
    opponent,
    shopUnits: generateShop(1),
    combatLog: [],
    timer: SHOP_PREP_TIME,
    gameOver: false,
    winner: null
  }
}

// Generate shop
export function generateShop(playerLevel: number): TFTUnit[] {
  const shop: TFTUnit[] = []

  for (let i = 0; i < SHOP_SIZE; i++) {
    const unitTemplate = UNIT_POOL[Math.floor(Math.random() * UNIT_POOL.length)]
    shop.push({
      ...unitTemplate,
      id: `unit-${Date.now()}-${i}-${Math.random()}`,
      position: null
    })
  }

  return shop
}

// Buy unit
export function buyUnit(state: TFTGameState, unitId: string): TFTGameState {
  const unit = state.shopUnits.find(u => u.id === unitId)
  if (!unit) return state

  if (state.player.gold < unit.cost) return state
  if (state.player.bench.length >= MAX_BENCH_SIZE) return state

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold - unit.cost,
      bench: [...state.player.bench, { ...unit, position: null }]
    },
    shopUnits: state.shopUnits.filter(u => u.id !== unitId)
  }
}

// Sell unit
export function sellUnit(state: TFTGameState, unitId: string): TFTGameState {
  const unit = state.player.bench.find(u => u.id === unitId) ||
                state.player.board.find(u => u.id === unitId)
  if (!unit) return state

  const sellValue = Math.floor(unit.cost * unit.stars * 0.8)

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold + sellValue,
      bench: state.player.bench.filter(u => u.id !== unitId),
      board: state.player.board.filter(u => u.id !== unitId)
    }
  }
}

// Move unit to board
export function moveUnitToBoard(state: TFTGameState, unitId: string, position: { x: number, y: number }): TFTGameState {
  const unit = state.player.bench.find(u => u.id === unitId)
  if (!unit) return state

  if (state.player.board.length >= state.player.maxBoardSize) return state

  // Check if position is occupied
  if (state.player.board.some(u => u.position?.x === position.x && u.position?.y === position.y)) {
    return state
  }

  return {
    ...state,
    player: {
      ...state.player,
      bench: state.player.bench.filter(u => u.id !== unitId),
      board: [...state.player.board, { ...unit, position }]
    }
  }
}

// Move unit back to bench
export function moveUnitToBench(state: TFTGameState, unitId: string): TFTGameState {
  const unit = state.player.board.find(u => u.id === unitId)
  if (!unit) return state

  if (state.player.bench.length >= MAX_BENCH_SIZE) return state

  return {
    ...state,
    player: {
      ...state.player,
      board: state.player.board.filter(u => u.id !== unitId),
      bench: [...state.player.bench, { ...unit, position: null }]
    }
  }
}

// Reroll shop
export function rerollShop(state: TFTGameState): TFTGameState {
  if (state.player.gold < REROLL_COST) return state

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold - REROLL_COST
    },
    shopUnits: generateShop(state.player.level)
  }
}

// Buy XP
export function buyXP(state: TFTGameState): TFTGameState {
  if (state.player.gold < XP_COST) return state

  const newXp = state.player.xp + 4
  const currentLevel = state.player.level
  const nextLevelXp = LEVEL_XP_REQUIREMENTS[currentLevel] || 999

  let level = currentLevel
  let xp = newXp

  if (newXp >= nextLevelXp && level < MAX_LEVEL) {
    level++
    xp = 0
  }

  return {
    ...state,
    player: {
      ...state.player,
      gold: state.player.gold - XP_COST,
      xp,
      level,
      maxBoardSize: LEVEL_BOARD_SIZE[level]
    }
  }
}

// Simulate combat (simplified auto-battler)
export function simulateCombat(state: TFTGameState): { winner: 'player' | 'opponent', log: string[], playerUnitsAlive: number, opponentUnitsAlive: number } {
  const log: string[] = []

  // Clone units for simulation
  let playerUnits = state.player.board.map(u => ({ ...u }))
  let opponentUnits = state.opponent.board.map(u => ({ ...u }))

  log.push('⚔️ Combat begins!')

  let round = 0
  const maxRounds = 50 // Prevent infinite loops

  while (playerUnits.length > 0 && opponentUnits.length > 0 && round < maxRounds) {
    round++

    // Each unit attacks once per round
    for (const unit of playerUnits) {
      if (opponentUnits.length === 0) break

      // Find closest enemy
      const target = opponentUnits[0]
      const damage = unit.damage
      target.hp -= damage

      log.push(`🗡️ ${unit.name} attacks ${target.name} for ${damage} damage!`)

      if (target.hp <= 0) {
        log.push(`💀 ${target.name} was defeated!`)
        opponentUnits = opponentUnits.filter(u => u.id !== target.id)
      }
    }

    // Opponent units attack
    for (const unit of opponentUnits) {
      if (playerUnits.length === 0) break

      const target = playerUnits[0]
      const damage = unit.damage
      target.hp -= damage

      log.push(`🗡️ ${unit.name} attacks ${target.name} for ${damage} damage!`)

      if (target.hp <= 0) {
        log.push(`💀 ${target.name} was defeated!`)
        playerUnits = playerUnits.filter(u => u.id !== target.id)
      }
    }
  }

  const winner = playerUnits.length > opponentUnits.length ? 'player' : 'opponent'
  log.push(`${winner === 'player' ? '🏆 Victory!' : '💀 Defeat!'}`)

  return {
    winner,
    log,
    playerUnitsAlive: playerUnits.length,
    opponentUnitsAlive: opponentUnits.length
  }
}

// Calculate damage to player based on units alive
function calculateDamage(opponentUnitsAlive: number, round: number): number {
  return opponentUnitsAlive + Math.floor(round / 5)
}

// End round and prepare for next
export function endRound(state: TFTGameState, combatResult: { winner: 'player' | 'opponent', playerUnitsAlive: number, opponentUnitsAlive: number }): TFTGameState {
  const { winner, playerUnitsAlive, opponentUnitsAlive } = combatResult

  // Calculate damage
  let playerHealth = state.player.health
  let opponentHealth = state.opponent.health

  if (winner === 'opponent') {
    const damage = calculateDamage(opponentUnitsAlive, state.round)
    playerHealth -= damage
  } else {
    const damage = calculateDamage(playerUnitsAlive, state.round)
    opponentHealth -= damage
  }

  // Update streaks
  let winStreak = state.player.winStreak
  let lossStreak = state.player.lossStreak

  if (winner === 'player') {
    winStreak++
    lossStreak = 0
  } else {
    lossStreak++
    winStreak = 0
  }

  // Calculate gold income: base (5) + interest (1 per 10 gold, max 5) + streak bonus
  const baseGold = 5
  const interest = Math.min(Math.floor(state.player.gold / 10), 5)
  const streakBonus = Math.min(winStreak, 3)
  const totalGold = baseGold + interest + streakBonus

  // Check game over
  const gameOver = playerHealth <= 0 || opponentHealth <= 0
  const gameWinner = playerHealth <= 0 ? 'opponent' : opponentHealth <= 0 ? 'player' : null

  // Reset board units HP for next round
  const playerBoard = state.player.board.map(u => ({ ...u, hp: u.maxHp }))
  const opponentBoard = state.opponent.board.map(u => ({ ...u, hp: u.maxHp }))

  // Generate opponent board for next round (AI)
  const newOpponentBoard = generateOpponentBoard(state.round + 1, state.opponent.level)

  return {
    ...state,
    round: state.round + 1,
    phase: gameOver ? 'results' : 'shop',
    player: {
      ...state.player,
      health: Math.max(0, playerHealth),
      gold: state.player.gold + totalGold,
      winStreak,
      lossStreak,
      board: playerBoard
    },
    opponent: {
      ...state.opponent,
      health: Math.max(0, opponentHealth),
      board: newOpponentBoard
    },
    shopUnits: generateShop(state.player.level),
    timer: SHOP_PREP_TIME,
    gameOver,
    winner: gameWinner
  }
}

// Generate AI opponent board
function generateOpponentBoard(round: number, level: number): TFTUnit[] {
  const boardSize = Math.min(Math.floor(round / 2) + 2, 7)
  const board: TFTUnit[] = []

  for (let i = 0; i < boardSize; i++) {
    const unitTemplate = UNIT_POOL[Math.floor(Math.random() * UNIT_POOL.length)]
    board.push({
      ...unitTemplate,
      id: `opponent-${Date.now()}-${i}`,
      position: { x: i % 4, y: 3 }
    })
  }

  return board
}

// Start combat phase
export function startCombat(state: TFTGameState): TFTGameState {
  return {
    ...state,
    phase: 'combat',
    timer: 0
  }
}
