/**
 * TFT-Style Shop System for Silkroad Fights
 * Manages unit pool, shop refresh, buying/selling, and auto-combining
 */

export interface ShopUnit {
  id: string;
  type: UnitType;
  tier: number; // 1-5 stars
  cost: number;
  traits: string[];
  stars: number; // 1-3 (for unit upgrades)
  icon: string;
  stats: {
    hp: number;
    attack: number;
    defense: number;
    range: number;
  };
}

export interface OwnedUnit extends ShopUnit {
  instanceId: string;
  position: 'bench' | 'board' | null;
  items: Item[];
  experience: number;
}

export interface Item {
  id: string;
  name: string;
  icon: string;
  stats: Record<string, number>;
  components?: string[];
  isComplete: boolean;
}

export type UnitType =
  | 'TRADER_WARRIOR'
  | 'TRADER_ARCHER'
  | 'TRADER_GUARD'
  | 'TRADER_MERCHANT'
  | 'THIEF_SCOUT'
  | 'THIEF_BANDIT'
  | 'THIEF_ASSASSIN'
  | 'THIEF_ROGUE'
  | 'NEUTRAL_MONK'
  | 'NEUTRAL_MERCHANT';

export interface ShopState {
  level: number; // Player level (1-9)
  gold: number;
  experience: number;
  experienceToNextLevel: number;
  currentShop: (ShopUnit | null)[]; // 5 slots
  isLocked: boolean;
  refreshCost: number;
  ownedUnits: OwnedUnit[]; // Bench + Board
  unitPool: Map<UnitType, number>; // Global pool of available units
  rerollCount: number;
}

// ============================================================================
// UNIT DATABASE
// ============================================================================

export const UNIT_DATABASE: Record<UnitType, Omit<ShopUnit, 'id' | 'stars'>> = {
  TRADER_WARRIOR: {
    type: 'TRADER_WARRIOR',
    tier: 1,
    cost: 1,
    traits: ['Trader', 'Warrior'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png',
    stats: { hp: 100, attack: 15, defense: 10, range: 1 },
  },
  TRADER_ARCHER: {
    type: 'TRADER_ARCHER',
    tier: 2,
    cost: 2,
    traits: ['Trader', 'Ranged'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hunter-GF8068loplMRGwOj09mx0j1un6rqYr.png',
    stats: { hp: 70, attack: 12, defense: 5, range: 3 },
  },
  TRADER_GUARD: {
    type: 'TRADER_GUARD',
    tier: 3,
    cost: 3,
    traits: ['Trader', 'Tank'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png',
    stats: { hp: 150, attack: 10, defense: 20, range: 1 },
  },
  TRADER_MERCHANT: {
    type: 'TRADER_MERCHANT',
    tier: 4,
    cost: 4,
    traits: ['Trader', 'Support'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png',
    stats: { hp: 80, attack: 8, defense: 8, range: 2 },
  },
  THIEF_SCOUT: {
    type: 'THIEF_SCOUT',
    tier: 1,
    cost: 1,
    traits: ['Thief', 'Assassin'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thief.png-hyVXxRC4m0a3B2MWEG2b2tlzpLkvCe.webp',
    stats: { hp: 60, attack: 8, defense: 3, range: 1 },
  },
  THIEF_BANDIT: {
    type: 'THIEF_BANDIT',
    tier: 2,
    cost: 2,
    traits: ['Thief', 'Warrior'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thief.png-hyVXxRC4m0a3B2MWEG2b2tlzpLkvCe.webp',
    stats: { hp: 90, attack: 18, defense: 7, range: 1 },
  },
  THIEF_ASSASSIN: {
    type: 'THIEF_ASSASSIN',
    tier: 3,
    cost: 3,
    traits: ['Thief', 'Assassin'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kingthief-ELevBdvYg2EBX9YEu4ESdlXEabyskF.png',
    stats: { hp: 75, attack: 22, defense: 5, range: 1 },
  },
  THIEF_ROGUE: {
    type: 'THIEF_ROGUE',
    tier: 4,
    cost: 4,
    traits: ['Thief', 'Utility'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kingthief-ELevBdvYg2EBX9YEu4ESdlXEabyskF.png',
    stats: { hp: 85, attack: 16, defense: 8, range: 2 },
  },
  NEUTRAL_MONK: {
    type: 'NEUTRAL_MONK',
    tier: 5,
    cost: 5,
    traits: ['Neutral', 'Tank', 'Support'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png',
    stats: { hp: 200, attack: 20, defense: 25, range: 1 },
  },
  NEUTRAL_MERCHANT: {
    type: 'NEUTRAL_MERCHANT',
    tier: 5,
    cost: 5,
    traits: ['Neutral', 'Support'],
    icon: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png',
    stats: { hp: 120, attack: 15, defense: 15, range: 2 },
  },
};

// ============================================================================
// SHOP ODDS BY LEVEL
// ============================================================================

export const SHOP_ODDS: Record<number, number[]> = {
  1: [100, 0, 0, 0, 0], // 100% tier 1
  2: [100, 0, 0, 0, 0],
  3: [75, 25, 0, 0, 0],
  4: [55, 30, 15, 0, 0],
  5: [45, 33, 20, 2, 0],
  6: [30, 40, 25, 5, 0],
  7: [19, 30, 35, 15, 1],
  8: [16, 20, 35, 25, 4],
  9: [10, 15, 33, 30, 12],
};

export const UNIT_POOL_SIZES: Record<number, number> = {
  1: 29, // 29 copies of each tier 1 unit
  2: 22,
  3: 18,
  4: 12,
  5: 10,
};

export const XP_PER_LEVEL = [0, 2, 6, 10, 20, 36, 48, 60, 80];
export const REFRESH_COST = 2;
export const BENCH_SIZE = 9;
export const SHOP_SIZE = 5;

// ============================================================================
// SHOP SYSTEM CLASS
// ============================================================================

export class ShopSystem {
  private state: ShopState;

  constructor(initialGold: number = 10) {
    this.state = {
      level: 1,
      gold: initialGold,
      experience: 0,
      experienceToNextLevel: XP_PER_LEVEL[1],
      currentShop: Array(SHOP_SIZE).fill(null),
      isLocked: false,
      refreshCost: REFRESH_COST,
      ownedUnits: [],
      unitPool: this.initializeUnitPool(),
      rerollCount: 0,
    };
  }

  // Initialize the global unit pool
  private initializeUnitPool(): Map<UnitType, number> {
    const pool = new Map<UnitType, number>();

    Object.entries(UNIT_DATABASE).forEach(([type, unit]) => {
      const poolSize = UNIT_POOL_SIZES[unit.tier];
      pool.set(type as UnitType, poolSize);
    });

    return pool;
  }

  // Get current state
  getState(): ShopState {
    return { ...this.state };
  }

  // ============================================================================
  // EXPERIENCE & LEVELING
  // ============================================================================

  addExperience(amount: number): boolean {
    this.state.experience += amount;

    let leveledUp = false;
    while (
      this.state.level < 9 &&
      this.state.experience >= this.state.experienceToNextLevel
    ) {
      this.state.level++;
      this.state.experienceToNextLevel = XP_PER_LEVEL[this.state.level] || 999;
      leveledUp = true;
    }

    return leveledUp;
  }

  buyExperience(): boolean {
    const cost = 4;
    if (this.state.gold < cost) return false;

    this.state.gold -= cost;
    return this.addExperience(4);
  }

  // ============================================================================
  // SHOP REFRESH
  // ============================================================================

  refreshShop(): boolean {
    if (this.state.isLocked) return false;
    if (this.state.gold < this.state.refreshCost) return false;

    this.state.gold -= this.state.refreshCost;
    this.state.rerollCount++;
    this.generateShop();
    return true;
  }

  private generateShop(): void {
    const newShop: (ShopUnit | null)[] = [];

    for (let i = 0; i < SHOP_SIZE; i++) {
      const unit = this.rollUnit();
      newShop.push(unit);
    }

    this.state.currentShop = newShop;
  }

  private rollUnit(): ShopUnit | null {
    const odds = SHOP_ODDS[this.state.level];
    const roll = Math.random() * 100;

    let cumulative = 0;
    let selectedTier = 1;

    for (let tier = 1; tier <= 5; tier++) {
      cumulative += odds[tier - 1];
      if (roll <= cumulative) {
        selectedTier = tier;
        break;
      }
    }

    // Get all units of selected tier that are still in pool
    const availableUnits = Object.entries(UNIT_DATABASE)
      .filter(([type, unit]) => {
        const remaining = this.state.unitPool.get(type as UnitType) || 0;
        return unit.tier === selectedTier && remaining > 0;
      })
      .map(([type]) => type as UnitType);

    if (availableUnits.length === 0) return null;

    // Random unit from available
    const selectedType = availableUnits[Math.floor(Math.random() * availableUnits.length)];
    const unitTemplate = UNIT_DATABASE[selectedType];

    return {
      id: `shop-${Date.now()}-${Math.random()}`,
      ...unitTemplate,
      stars: 1,
    };
  }

  // ============================================================================
  // LOCK/UNLOCK
  // ============================================================================

  toggleLock(): void {
    this.state.isLocked = !this.state.isLocked;
  }

  // ============================================================================
  // BUY/SELL UNITS
  // ============================================================================

  buyUnit(shopIndex: number): OwnedUnit | null {
    const unit = this.state.currentShop[shopIndex];
    if (!unit) return null;
    if (this.state.gold < unit.cost) return null;
    if (this.state.ownedUnits.length >= BENCH_SIZE) return null;

    // Deduct from pool
    const remaining = this.state.unitPool.get(unit.type) || 0;
    if (remaining <= 0) return null;
    this.state.unitPool.set(unit.type, remaining - 1);

    // Deduct gold
    this.state.gold -= unit.cost;

    // Create owned unit
    const ownedUnit: OwnedUnit = {
      ...unit,
      instanceId: `owned-${Date.now()}-${Math.random()}`,
      position: 'bench',
      items: [],
      experience: 0,
    };

    this.state.ownedUnits.push(ownedUnit);

    // Remove from shop
    this.state.currentShop[shopIndex] = null;

    // Check for auto-combine
    this.checkAutoCombine(ownedUnit);

    return ownedUnit;
  }

  sellUnit(instanceId: string): boolean {
    const index = this.state.ownedUnits.findIndex(u => u.instanceId === instanceId);
    if (index === -1) return false;

    const unit = this.state.ownedUnits[index];

    // Return to pool (for each star level, return that many copies)
    const returnCount = Math.pow(3, unit.stars - 1);
    const current = this.state.unitPool.get(unit.type) || 0;
    this.state.unitPool.set(unit.type, current + returnCount);

    // Refund gold
    const refund = unit.cost;
    this.state.gold += refund;

    // Remove unit
    this.state.ownedUnits.splice(index, 1);

    return true;
  }

  // ============================================================================
  // AUTO-COMBINING
  // ============================================================================

  private checkAutoCombine(newUnit: OwnedUnit): void {
    // Count units of same type and star level on bench
    const matchingUnits = this.state.ownedUnits.filter(
      u => u.type === newUnit.type && u.stars === newUnit.stars && u.position === 'bench'
    );

    if (matchingUnits.length >= 3) {
      this.combineUnits(matchingUnits.slice(0, 3));
    }
  }

  private combineUnits(units: OwnedUnit[]): void {
    if (units.length !== 3) return;
    if (units[0].stars >= 3) return; // Max stars

    const baseUnit = units[0];
    const newStars = baseUnit.stars + 1;

    // Remove the 3 units
    units.forEach(unit => {
      const index = this.state.ownedUnits.findIndex(u => u.instanceId === unit.instanceId);
      if (index !== -1) {
        this.state.ownedUnits.splice(index, 1);
      }
    });

    // Create upgraded unit
    const upgradedUnit: OwnedUnit = {
      ...baseUnit,
      stars: newStars,
      instanceId: `owned-${Date.now()}-${Math.random()}`,
      stats: {
        hp: baseUnit.stats.hp * 1.8,
        attack: baseUnit.stats.attack * 1.8,
        defense: baseUnit.stats.defense * 1.8,
        range: baseUnit.stats.range,
      },
      items: [], // Items transfer manually
    };

    this.state.ownedUnits.push(upgradedUnit);

    // Check for next level combine
    this.checkAutoCombine(upgradedUnit);
  }

  getCombineProgress(unitType: UnitType, stars: number): { current: number; needed: number } {
    const count = this.state.ownedUnits.filter(
      u => u.type === unitType && u.stars === stars && u.position === 'bench'
    ).length;

    return { current: count, needed: 3 };
  }

  // ============================================================================
  // UNIT MANAGEMENT
  // ============================================================================

  moveUnitToBench(instanceId: string): boolean {
    const unit = this.state.ownedUnits.find(u => u.instanceId === instanceId);
    if (!unit) return false;

    const benchCount = this.state.ownedUnits.filter(u => u.position === 'bench').length;
    if (benchCount >= BENCH_SIZE) return false;

    unit.position = 'bench';
    return true;
  }

  moveUnitToBoard(instanceId: string): boolean {
    const unit = this.state.ownedUnits.find(u => u.instanceId === instanceId);
    if (!unit) return false;

    // Check board size limits (implement based on your game rules)
    const boardCount = this.state.ownedUnits.filter(u => u.position === 'board').length;
    const maxBoardSize = this.state.level; // Typical TFT rule
    if (boardCount >= maxBoardSize) return false;

    unit.position = 'board';
    return true;
  }

  // ============================================================================
  // ITEM MANAGEMENT
  // ============================================================================

  addItemToUnit(instanceId: string, item: Item): boolean {
    const unit = this.state.ownedUnits.find(u => u.instanceId === instanceId);
    if (!unit) return false;
    if (unit.items.length >= 3) return false;

    unit.items.push(item);

    // Check for item combination
    this.checkItemCombination(unit);

    return true;
  }

  private checkItemCombination(unit: OwnedUnit): void {
    // Implement item combination logic
    // e.g., if unit has 2 BF Swords, combine into Deathblade
  }

  removeItemFromUnit(instanceId: string, itemId: string): Item | null {
    const unit = this.state.ownedUnits.find(u => u.instanceId === instanceId);
    if (!unit) return null;

    const itemIndex = unit.items.findIndex(i => i.id === itemId);
    if (itemIndex === -1) return null;

    const [item] = unit.items.splice(itemIndex, 1);
    return item;
  }

  // ============================================================================
  // UTILITY
  // ============================================================================

  addGold(amount: number): void {
    this.state.gold += amount;
  }

  getPoolRemaining(unitType: UnitType): number {
    return this.state.unitPool.get(unitType) || 0;
  }

  // Force regenerate shop (for testing or start of round)
  forceRefreshShop(): void {
    this.generateShop();
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function createShopSystem(initialGold: number = 10): ShopSystem {
  return new ShopSystem(initialGold);
}

export function getUnitsByTrait(trait: string): UnitType[] {
  return Object.entries(UNIT_DATABASE)
    .filter(([_, unit]) => unit.traits.includes(trait))
    .map(([type]) => type as UnitType);
}

export function calculateSellValue(unit: OwnedUnit): number {
  // Sell value equals cost for 1-star
  // Higher star units return full investment value
  return unit.cost * Math.pow(3, unit.stars - 1);
}
