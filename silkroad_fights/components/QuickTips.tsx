"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  X,
  AlertCircle,
  Info,
  Zap,
  Target,
  Shield,
  Swords,
  Crown,
  Sparkles,
} from 'lucide-react'
import { theme } from '../lib/theme'

interface Tip {
  id: string;
  title: string;
  message: string;
  icon: React.ReactNode;
  color: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  condition: (gameState: any) => boolean;
  cooldown?: number; // Minutes before showing again
  category: 'strategy' | 'warning' | 'info' | 'achievement';
}

interface QuickTipsProps {
  gameState?: any;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  autoHideDuration?: number; // milliseconds (0 = no auto-hide)
  maxTipsShown?: number;
}

const TIPS_DATABASE: Tip[] = [
  // Strategic Tips
  {
    id: 'collect-gold-first',
    title: 'Gold Priority',
    message: 'Gold has spawned! Rush to collect it before your opponent does.',
    icon: <Target className="w-5 h-5" />,
    color: '#FFD700',
    priority: 'high',
    category: 'strategy',
    condition: (state) => {
      // Show when gold appears on board
      return state?.board?.some((row: string[]) => row.includes('GOLD')) || false;
    },
  },
  {
    id: 'protect-gold-carrier',
    title: 'Protect Your Carrier',
    message: 'Your unit is carrying gold! Keep it safe from enemies and move towards your base.',
    icon: <Shield className="w-5 h-5" />,
    color: '#4CAF50',
    priority: 'high',
    category: 'strategy',
    condition: (state) => {
      return state?.traderUnits?.some((unit: any) => unit.hasGold) || false;
    },
  },
  {
    id: 'silk-spawned',
    title: 'Silk Available',
    message: 'Silk has appeared! Collect it to power up your special abilities.',
    icon: <Sparkles className="w-5 h-5" />,
    color: '#FF69B4',
    priority: 'medium',
    category: 'info',
    condition: (state) => {
      return state?.board?.some((row: string[]) => row.includes('SILK')) || false;
    },
  },
  {
    id: 'boss-incoming',
    title: 'Boss Alert!',
    message: 'A boss monster has spawned! Team up or solo it for massive silk rewards.',
    icon: <AlertCircle className="w-5 h-5" />,
    color: '#FF4500',
    priority: 'critical',
    category: 'warning',
    condition: (state) => {
      return state?.bossMonsters?.length > 0 || false;
    },
  },
  {
    id: 'low-silk',
    title: 'Low on Silk',
    message: 'Your silk reserves are low. Collect more to use powerful abilities!',
    icon: <Zap className="w-5 h-5" />,
    color: '#FFA500',
    priority: 'medium',
    category: 'warning',
    condition: (state) => {
      const silkCount = state?.isTraderPlayer ? state?.silkCountTrader : state?.silkCountThief;
      return silkCount < 20;
    },
  },
  {
    id: 'unit-low-hp',
    title: 'Unit Critical',
    message: 'One of your units is critically injured! Consider retreating or using a heal ability.',
    icon: <AlertCircle className="w-5 h-5" />,
    color: '#F44336',
    priority: 'high',
    category: 'warning',
    condition: (state) => {
      const units = state?.isTraderPlayer ? state?.traderUnits : state?.thiefUnits;
      return units?.some((unit: any) => unit.hp < unit.maxHp * 0.3) || false;
    },
  },
  {
    id: 'ability-ready',
    title: 'Ability Ready',
    message: 'Your special abilities are ready! Use them to gain a tactical advantage.',
    icon: <Zap className="w-5 h-5" />,
    color: '#9C27B0',
    priority: 'medium',
    category: 'info',
    condition: (state) => {
      const silkCount = state?.isTraderPlayer ? state?.silkCountTrader : state?.silkCountThief;
      return silkCount >= 50 && !state?.lastUsedAbility;
    },
  },
  {
    id: 'enemy-has-gold',
    title: 'Enemy Gold Carrier',
    message: 'The enemy is carrying gold! Attack them to steal it and prevent their victory.',
    icon: <Swords className="w-5 h-5" />,
    color: '#DC143C',
    priority: 'critical',
    category: 'warning',
    condition: (state) => {
      const enemyUnits = state?.isTraderPlayer ? state?.thiefUnits : state?.traderUnits;
      return enemyUnits?.some((unit: any) => unit.hasGold) || false;
    },
  },
  {
    id: 'first-gold-delivered',
    title: 'Great Progress!',
    message: 'First gold delivered! One more to win the game. Keep it up!',
    icon: <Crown className="w-5 h-5" />,
    color: '#FFD700',
    priority: 'high',
    category: 'achievement',
    condition: (state) => {
      return state?.goldDelivered === 1;
    },
  },
  {
    id: 'outnumbered',
    title: 'Outnumbered',
    message: 'The enemy has more units! Play defensively and use abilities strategically.',
    icon: <Shield className="w-5 h-5" />,
    color: '#FF6347',
    priority: 'high',
    category: 'strategy',
    condition: (state) => {
      const yourUnits = state?.isTraderPlayer ? state?.traderUnits : state?.thiefUnits;
      const enemyUnits = state?.isTraderPlayer ? state?.thiefUnits : state?.traderUnits;
      return (yourUnits?.length || 0) < (enemyUnits?.length || 0);
    },
  },
  {
    id: 'buff-active',
    title: 'Buff Active',
    message: 'You have an active buff! Take advantage of your enhanced stats.',
    icon: <Sparkles className="w-5 h-5" />,
    color: '#00CED1',
    priority: 'medium',
    category: 'info',
    condition: (state) => {
      const faction = state?.isTraderPlayer ? 'TRADER' : 'THIEF';
      return state?.buffs?.[faction]?.length > 0 || false;
    },
  },
  {
    id: 'trap-deployed',
    title: 'Trap Set',
    message: 'Your trap is active! Lure enemies into it for a tactical advantage.',
    icon: <Target className="w-5 h-5" />,
    color: '#8B4513',
    priority: 'medium',
    category: 'info',
    condition: (state) => {
      return state?.traps?.length > 0 || false;
    },
  },
  {
    id: 'no-selection',
    title: 'Select a Unit',
    message: 'Click on one of your units to select it and see available actions.',
    icon: <Info className="w-5 h-5" />,
    color: '#2196F3',
    priority: 'low',
    category: 'info',
    condition: (state) => {
      return !state?.selectedUnit && state?.roundNumber === 1;
    },
  },
  {
    id: 'boss-defeated',
    title: 'Boss Defeated!',
    message: 'Excellent work! You earned bonus silk and a powerful temporary buff.',
    icon: <Crown className="w-5 h-5" />,
    color: '#FFD700',
    priority: 'high',
    category: 'achievement',
    condition: (state) => {
      // This would need to be triggered by a boss defeat event
      return false; // Placeholder
    },
  },
];

const QuickTips: React.FC<QuickTipsProps> = ({
  gameState,
  position = 'bottom-right',
  autoHideDuration = 8000,
  maxTipsShown = 1,
}) => {
  const [activeTips, setActiveTips] = useState<Tip[]>([]);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());
  const [cooldowns, setCooldowns] = useState<Map<string, number>>(new Map());

  // Calculate active tips based on game state
  const availableTips = useMemo(() => {
    if (!gameState) return [];

    const now = Date.now();

    return TIPS_DATABASE
      .filter(tip => {
        // Check if dismissed
        if (dismissedTips.has(tip.id)) return false;

        // Check cooldown
        const cooldownEnd = cooldowns.get(tip.id);
        if (cooldownEnd && now < cooldownEnd) return false;

        // Check condition
        try {
          return tip.condition(gameState);
        } catch (error) {
          console.error(`Error checking tip condition for ${tip.id}:`, error);
          return false;
        }
      })
      .sort((a, b) => {
        // Sort by priority
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      })
      .slice(0, maxTipsShown);
  }, [gameState, dismissedTips, cooldowns, maxTipsShown]);

  // Update active tips
  useEffect(() => {
    setActiveTips(availableTips);
  }, [availableTips]);

  // Auto-hide tips
  useEffect(() => {
    if (autoHideDuration > 0) {
      activeTips.forEach(tip => {
        if (tip.priority !== 'critical') {
          const timer = setTimeout(() => {
            dismissTip(tip.id);
          }, autoHideDuration);

          return () => clearTimeout(timer);
        }
      });
    }
  }, [activeTips, autoHideDuration]);

  const dismissTip = (tipId: string) => {
    setActiveTips(prev => prev.filter(t => t.id !== tipId));
    setDismissedTips(prev => new Set([...prev, tipId]));

    // Set cooldown (5 minutes default)
    const cooldownMs = 5 * 60 * 1000;
    setCooldowns(prev => new Map(prev).set(tipId, Date.now() + cooldownMs));
  };

  const getPositionClasses = () => {
    switch (position) {
      case 'top-left':
        return 'top-6 left-6';
      case 'top-right':
        return 'top-6 right-6';
      case 'bottom-left':
        return 'bottom-6 left-6';
      case 'bottom-right':
      default:
        return 'bottom-6 right-6';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'strategy':
        return <Lightbulb className="w-4 h-4" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4" />;
      case 'achievement':
        return <Crown className="w-4 h-4" />;
      case 'info':
      default:
        return <Info className="w-4 h-4" />;
    }
  };

  if (activeTips.length === 0) return null;

  return (
    <div className={`fixed ${getPositionClasses()} z-40 space-y-3 max-w-sm`}>
      <AnimatePresence>
        {activeTips.map((tip, index) => (
          <motion.div
            key={tip.id}
            className="relative rounded-lg shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.98), rgba(40, 25, 25, 0.98))',
              border: `2px solid ${tip.color}`,
              boxShadow: `0 8px 25px rgba(0, 0, 0, 0.8), 0 0 20px ${tip.color}40`,
            }}
            initial={{ x: position.includes('right') ? 100 : -100, opacity: 0, scale: 0.8 }}
            animate={{ x: 0, opacity: 1, scale: 1 }}
            exit={{ x: position.includes('right') ? 100 : -100, opacity: 0, scale: 0.8 }}
            transition={{
              type: 'spring',
              stiffness: 200,
              damping: 20,
              delay: index * 0.1,
            }}
          >
            {/* Animated border glow */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `linear-gradient(90deg, ${tip.color}00, ${tip.color}60, ${tip.color}00)`,
              }}
              animate={{
                x: ['-100%', '200%'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Priority indicator bar */}
            {tip.priority === 'critical' && (
              <motion.div
                className="absolute top-0 left-0 right-0 h-1"
                style={{ background: tip.color }}
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            )}

            <div className="relative p-4">
              {/* Close button */}
              <button
                onClick={() => dismissTip(tip.id)}
                className="absolute top-2 right-2 p-1 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <X className="w-4 h-4 text-gray-400 hover:text-white" />
              </button>

              {/* Header */}
              <div className="flex items-start gap-3 mb-2">
                <motion.div
                  className="flex-shrink-0 p-2 rounded-lg"
                  style={{
                    background: `${tip.color}20`,
                    color: tip.color,
                  }}
                  animate={{
                    scale: tip.priority === 'critical' ? [1, 1.1, 1] : 1,
                  }}
                  transition={{
                    duration: 1,
                    repeat: tip.priority === 'critical' ? Infinity : 0,
                  }}
                >
                  {tip.icon}
                </motion.div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-bold text-sm"
                      style={{ color: tip.color }}
                    >
                      {tip.title}
                    </h3>
                    <div
                      className="text-xs opacity-50"
                      style={{ color: tip.color }}
                    >
                      {getCategoryIcon(tip.category)}
                    </div>
                  </div>
                  <p className="text-sm text-gray-200 leading-snug pr-6">
                    {tip.message}
                  </p>
                </div>
              </div>

              {/* Decorative corner */}
              <motion.div
                className="absolute bottom-2 right-2 opacity-20"
                style={{ color: tip.color }}
                animate={{
                  rotate: [0, 10, 0],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                <Lightbulb className="w-6 h-6" />
              </motion.div>
            </div>

            {/* Bottom accent */}
            <div
              className="h-1"
              style={{
                background: `linear-gradient(90deg, transparent, ${tip.color}, transparent)`,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* "Did you know?" rotating facts */}
      {activeTips.length === 0 && gameState?.roundNumber > 3 && (
        <motion.div
          className="p-4 rounded-lg"
          style={{
            background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.95), rgba(40, 25, 25, 0.95))',
            border: '2px solid #D4AF37',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.6)',
          }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Lightbulb className="w-4 h-4" />
            <span className="text-xs font-bold">Did You Know?</span>
          </div>
          <p className="text-xs text-gray-300">
            Boss buffs stack! Defeat multiple bosses for even stronger effects.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default QuickTips;
