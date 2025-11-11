/**
 * CONTEXTUAL HINT SYSTEM
 *
 * Provides intelligent, context-aware hints to help players improve their gameplay.
 * Features:
 * - Detects when player is struggling
 * - Shows helpful hints based on game state
 * - Smart timing to avoid spam
 * - Hint history to avoid repetition
 * - Progressive disclosure (easier hints first)
 */

"use client"

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameState, Unit, BossMonster } from '../lib/types';
import { Lightbulb, X, AlertCircle, Target, Shield, Zap } from 'lucide-react';

// ============================================================================
// HINT TYPES
// ============================================================================

export interface Hint {
  id: string;
  type: 'info' | 'warning' | 'tip' | 'strategy';
  priority: number; // 1-10, higher = more important
  title: string;
  message: string;
  icon?: React.ReactNode;
  duration?: number; // milliseconds, undefined = manual dismiss
  showOnce?: boolean; // Only show once per session
}

interface HintTrigger {
  id: string;
  condition: (gameState: GameState, history: GameHistory) => boolean;
  hint: Hint;
  cooldown: number; // milliseconds between same hint
  lastShown?: number;
}

interface GameHistory {
  turnsWithoutProgress: number;
  unitsLostRecently: number;
  goldLostRecently: number;
  abilitiesUsedCount: number;
  bossesEncountered: number;
  lowHpUnits: number;
  surroundedUnits: number;
  idleUnits: number;
}

// ============================================================================
// HINT DEFINITIONS
// ============================================================================

const HINT_TRIGGERS: HintTrigger[] = [
  // Basic Gameplay Hints
  {
    id: 'welcome',
    condition: (gs, history) => gs.roundNumber === 1,
    hint: {
      id: 'welcome',
      type: 'info',
      priority: 10,
      title: 'Welcome to Silkroad Fights!',
      message: 'Click on your units to select them, then click a highlighted tile to move. Collect silk and deliver gold to win!',
      icon: <Lightbulb className="w-5 h-5" />,
      duration: 8000,
      showOnce: true
    },
    cooldown: Infinity
  },

  // Struggling Detection
  {
    id: 'units_dying',
    condition: (gs, history) => history.unitsLostRecently >= 2,
    hint: {
      id: 'units_dying',
      type: 'warning',
      priority: 8,
      title: 'Units Under Attack!',
      message: 'You\'re losing units! Try to keep your units together for protection, and use defensive abilities.',
      icon: <AlertCircle className="w-5 h-5" />,
      duration: 6000
    },
    cooldown: 30000
  },
  {
    id: 'no_progress',
    condition: (gs, history) => history.turnsWithoutProgress >= 5,
    hint: {
      id: 'no_progress',
      type: 'tip',
      priority: 7,
      title: 'Make Progress!',
      message: 'Try collecting silk or delivering gold. Don\'t just wait - be proactive!',
      icon: <Target className="w-5 h-5" />,
      duration: 5000
    },
    cooldown: 40000
  },

  // Ability Hints
  {
    id: 'use_abilities',
    condition: (gs, history) => gs.roundNumber >= 3 && history.abilitiesUsedCount === 0,
    hint: {
      id: 'use_abilities',
      type: 'tip',
      priority: 6,
      title: 'Try Using Abilities!',
      message: 'You have powerful abilities available. Spend your silk to activate them - they can turn the tide of battle!',
      icon: <Zap className="w-5 h-5" />,
      duration: 6000,
      showOnce: true
    },
    cooldown: 60000
  },
  {
    id: 'low_hp_units',
    condition: (gs, history) => history.lowHpUnits >= 2,
    hint: {
      id: 'low_hp_units',
      type: 'warning',
      priority: 9,
      title: 'Units at Low HP!',
      message: 'Several of your units are badly wounded. Consider retreating them or using healing abilities.',
      icon: <Shield className="w-5 h-5" />,
      duration: 5000
    },
    cooldown: 25000
  },

  // Strategic Hints
  {
    id: 'protect_gold_carrier',
    condition: (gs, history) => {
      const playerUnits = gs.isTraderPlayer ? gs.traderUnits : gs.thiefUnits;
      const goldCarrier = playerUnits.find(u => u.hasGold);
      if (!goldCarrier) return false;

      // Check if gold carrier is alone
      const nearbyAllies = playerUnits.filter(u => {
        if (u === goldCarrier) return false;
        const dist = Math.max(Math.abs(u.row - goldCarrier.row), Math.abs(u.col - goldCarrier.col));
        return dist <= 2;
      });

      return nearbyAllies.length === 0;
    },
    hint: {
      id: 'protect_gold_carrier',
      type: 'strategy',
      priority: 9,
      title: 'Protect Your Gold!',
      message: 'Your gold carrier is alone! Keep escort units nearby to protect them from enemy attacks.',
      icon: <Shield className="w-5 h-5" />,
      duration: 6000
    },
    cooldown: 35000
  },
  {
    id: 'flank_enemy',
    condition: (gs, history) => gs.roundNumber >= 5 && history.unitsLostRecently >= 1,
    hint: {
      id: 'flank_enemy',
      type: 'strategy',
      priority: 7,
      title: 'Try Flanking!',
      message: 'Instead of attacking head-on, try to position units on multiple sides of the enemy for bonus damage.',
      icon: <Target className="w-5 h-5" />,
      duration: 6000,
      showOnce: true
    },
    cooldown: 50000
  },

  // Boss Fight Hints
  {
    id: 'boss_approaching',
    condition: (gs, history) => gs.bossMonsters.length > history.bossesEncountered,
    hint: {
      id: 'boss_approaching',
      type: 'warning',
      priority: 10,
      title: 'Boss Monster Appeared!',
      message: 'A powerful boss has entered the battlefield! Coordinate with your team to take it down for big rewards.',
      icon: <AlertCircle className="w-5 h-5" />,
      duration: 7000
    },
    cooldown: Infinity
  },
  {
    id: 'boss_tiger_kite',
    condition: (gs, history) => gs.bossMonsters.some(b => b.type === 'TigerGiry'),
    hint: {
      id: 'boss_tiger_kite',
      type: 'strategy',
      priority: 8,
      title: 'TigerGiry Weakness',
      message: 'TigerGiry is weak to ranged attacks! Use archer units and keep your distance while dealing damage.',
      icon: <Target className="w-5 h-5" />,
      duration: 6000,
      showOnce: true
    },
    cooldown: Infinity
  },
  {
    id: 'boss_skeleto_spread',
    condition: (gs, history) => gs.bossMonsters.some(b => b.type === 'SkeletoKing'),
    hint: {
      id: 'boss_skeleto_spread',
      type: 'strategy',
      priority: 8,
      title: 'SkeletoKing Strategy',
      message: 'SkeletoKing has high defense and area attacks. Spread out your units and focus fire to bring it down.',
      icon: <Target className="w-5 h-5" />,
      duration: 6000,
      showOnce: true
    },
    cooldown: Infinity
  },
  {
    id: 'boss_murucha_burst',
    condition: (gs, history) => gs.bossMonsters.some(b => b.type === 'Murucha'),
    hint: {
      id: 'boss_murucha_burst',
      type: 'strategy',
      priority: 8,
      title: 'Murucha Tactics',
      message: 'Murucha is fast and deadly! Use your tankiest unit to absorb damage while others deal burst damage.',
      icon: <Target className="w-5 h-5" />,
      duration: 6000,
      showOnce: true
    },
    cooldown: Infinity
  },

  // Resource Hints
  {
    id: 'collect_silk',
    condition: (gs, history) => {
      const playerSilk = gs.isTraderPlayer ? gs.silkCountTrader : gs.silkCountThief;
      return playerSilk < 10 && gs.roundNumber >= 3;
    },
    hint: {
      id: 'collect_silk',
      type: 'tip',
      priority: 6,
      title: 'Collect Silk!',
      message: 'You\'re running low on silk. Move units over silk (SI) tiles to collect resources for abilities.',
      icon: <Lightbulb className="w-5 h-5" />,
      duration: 5000
    },
    cooldown: 30000
  },
  {
    id: 'gold_available',
    condition: (gs, history) => {
      const goldOnBoard = gs.board.flat().filter(cell => cell === 'Z').length;
      const playerUnits = gs.isTraderPlayer ? gs.traderUnits : gs.thiefUnits;
      const hasGold = playerUnits.some(u => u.hasGold);
      return goldOnBoard > 0 && !hasGold && gs.roundNumber >= 2;
    },
    hint: {
      id: 'gold_available',
      type: 'tip',
      priority: 7,
      title: 'Gold Available!',
      message: 'There\'s gold on the map! Pick it up and deliver it to your base to score points.',
      icon: <Target className="w-5 h-5" />,
      duration: 5000
    },
    cooldown: 40000
  },

  // Advanced Tactics
  {
    id: 'unit_counters',
    condition: (gs, history) => gs.roundNumber >= 8 && history.unitsLostRecently >= 2,
    hint: {
      id: 'unit_counters',
      type: 'strategy',
      priority: 7,
      title: 'Use Unit Counters!',
      message: 'Remember: Hunters counter Thieves, Scouts counter Archers, and Guards counter Assassins. Choose your battles wisely!',
      icon: <Target className="w-5 h-5" />,
      duration: 7000,
      showOnce: true
    },
    cooldown: 60000
  },
  {
    id: 'surrounded_unit',
    condition: (gs, history) => history.surroundedUnits >= 1,
    hint: {
      id: 'surrounded_unit',
      type: 'warning',
      priority: 9,
      title: 'Unit Surrounded!',
      message: 'One of your units is surrounded by enemies! Use movement abilities to escape or focus fire to break through.',
      icon: <AlertCircle className="w-5 h-5" />,
      duration: 5000
    },
    cooldown: 30000
  }
];

// ============================================================================
// HINT SYSTEM COMPONENT
// ============================================================================

interface HintSystemProps {
  gameState: GameState;
  isTraderPlayer: boolean;
}

export default function HintSystem({ gameState, isTraderPlayer }: HintSystemProps) {
  const [activeHints, setActiveHints] = useState<Hint[]>([]);
  const [shownHints, setShownHints] = useState<Set<string>>(new Set());
  const [gameHistory, setGameHistory] = useState<GameHistory>({
    turnsWithoutProgress: 0,
    unitsLostRecently: 0,
    goldLostRecently: 0,
    abilitiesUsedCount: 0,
    bossesEncountered: 0,
    lowHpUnits: 0,
    surroundedUnits: 0,
    idleUnits: 0
  });

  const [lastGameState, setLastGameState] = useState<GameState | null>(null);

  // Update game history when game state changes
  useEffect(() => {
    if (!lastGameState) {
      setLastGameState(gameState);
      return;
    }

    const newHistory = { ...gameHistory };

    // Track units lost
    const playerUnits = isTraderPlayer ? gameState.traderUnits : gameState.thiefUnits;
    const lastPlayerUnits = isTraderPlayer ? lastGameState.traderUnits : lastGameState.thiefUnits;

    if (playerUnits.length < lastPlayerUnits.length) {
      newHistory.unitsLostRecently = (newHistory.unitsLostRecently || 0) + 1;
      setTimeout(() => {
        setGameHistory(prev => ({ ...prev, unitsLostRecently: Math.max(0, prev.unitsLostRecently - 1) }));
      }, 30000); // Decay after 30 seconds
    }

    // Track abilities used
    if (gameState.lastUsedAbility && gameState.lastUsedAbility !== lastGameState.lastUsedAbility) {
      newHistory.abilitiesUsedCount++;
    }

    // Track bosses
    if (gameState.bossMonsters.length > lastGameState.bossMonsters.length) {
      newHistory.bossesEncountered = gameState.bossMonsters.length;
    }

    // Check for low HP units
    newHistory.lowHpUnits = playerUnits.filter(u => u.hp < u.maxHp * 0.3).length;

    // Check for surrounded units
    newHistory.surroundedUnits = countSurroundedUnits(gameState, isTraderPlayer);

    // Track progress
    const playerSilk = isTraderPlayer ? gameState.silkCountTrader : gameState.silkCountThief;
    const lastPlayerSilk = isTraderPlayer ? lastGameState.silkCountTrader : lastGameState.silkCountThief;
    const madeProgress =
      playerSilk > lastPlayerSilk ||
      gameState.goldDelivered > lastGameState.goldDelivered ||
      playerUnits.length > lastPlayerUnits.length;

    if (madeProgress) {
      newHistory.turnsWithoutProgress = 0;
    } else {
      newHistory.turnsWithoutProgress++;
    }

    setGameHistory(newHistory);
    setLastGameState(gameState);
  }, [gameState, isTraderPlayer]);

  // Check for triggered hints
  useEffect(() => {
    const now = Date.now();

    HINT_TRIGGERS.forEach(trigger => {
      // Skip if already shown and should only show once
      if (trigger.hint.showOnce && shownHints.has(trigger.id)) {
        return;
      }

      // Skip if on cooldown
      if (trigger.lastShown && now - trigger.lastShown < trigger.cooldown) {
        return;
      }

      // Check if condition is met
      if (trigger.condition(gameState, gameHistory)) {
        // Update last shown time
        trigger.lastShown = now;

        // Add hint to active hints
        setActiveHints(prev => {
          // Don't add if already active
          if (prev.some(h => h.id === trigger.hint.id)) return prev;

          // Add new hint
          const newHints = [...prev, trigger.hint];

          // Sort by priority (highest first)
          newHints.sort((a, b) => b.priority - a.priority);

          // Keep only top 3 hints
          return newHints.slice(0, 3);
        });

        // Mark as shown
        if (trigger.hint.showOnce) {
          setShownHints(prev => new Set([...prev, trigger.id]));
        }

        // Auto-dismiss if duration is set
        if (trigger.hint.duration) {
          setTimeout(() => {
            dismissHint(trigger.hint.id);
          }, trigger.hint.duration);
        }
      }
    });
  }, [gameState, gameHistory, shownHints]);

  const dismissHint = useCallback((hintId: string) => {
    setActiveHints(prev => prev.filter(h => h.id !== hintId));
  }, []);

  const dismissAllHints = useCallback(() => {
    setActiveHints([]);
  }, []);

  // Helper function to count surrounded units
  function countSurroundedUnits(gameState: GameState, isTraderPlayer: boolean): number {
    const playerUnits = isTraderPlayer ? gameState.traderUnits : gameState.thiefUnits;
    const enemyUnits = isTraderPlayer ? gameState.thiefUnits : gameState.traderUnits;

    return playerUnits.filter(unit => {
      // Count nearby enemies
      const nearbyEnemies = enemyUnits.filter(enemy => {
        const dist = Math.max(Math.abs(unit.row - enemy.row), Math.abs(unit.col - enemy.col));
        return dist <= 1;
      });

      return nearbyEnemies.length >= 3;
    }).length;
  }

  // Don't render if no hints
  if (activeHints.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 max-w-sm">
      <AnimatePresence mode="popLayout">
        {activeHints.map(hint => (
          <motion.div
            key={hint.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`
              p-4 rounded-lg shadow-lg border-2
              ${hint.type === 'info' ? 'bg-blue-900 border-blue-500' : ''}
              ${hint.type === 'warning' ? 'bg-red-900 border-red-500' : ''}
              ${hint.type === 'tip' ? 'bg-green-900 border-green-500' : ''}
              ${hint.type === 'strategy' ? 'bg-purple-900 border-purple-500' : ''}
            `}
          >
            <div className="flex items-start gap-3">
              <div className={`
                flex-shrink-0 mt-0.5
                ${hint.type === 'info' ? 'text-blue-400' : ''}
                ${hint.type === 'warning' ? 'text-red-400' : ''}
                ${hint.type === 'tip' ? 'text-green-400' : ''}
                ${hint.type === 'strategy' ? 'text-purple-400' : ''}
              `}>
                {hint.icon || <Lightbulb className="w-5 h-5" />}
              </div>

              <div className="flex-grow">
                <h4 className="text-white font-bold text-sm mb-1">
                  {hint.title}
                </h4>
                <p className="text-gray-200 text-xs leading-relaxed">
                  {hint.message}
                </p>
              </div>

              <button
                onClick={() => dismissHint(hint.id)}
                className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {activeHints.length > 1 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={dismissAllHints}
          className="w-full text-center text-xs text-gray-400 hover:text-white transition-colors py-2"
        >
          Dismiss All Hints
        </motion.button>
      )}
    </div>
  );
}
