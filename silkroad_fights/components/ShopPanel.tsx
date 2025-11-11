'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShopSystem, ShopUnit, SHOP_SIZE } from '@/lib/shopSystem';
import { UnitCard } from './UnitCard';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Lock, Unlock, RefreshCw, TrendingUp, Coins } from 'lucide-react';
import { toast } from 'sonner';

interface ShopPanelProps {
  shopSystem: ShopSystem;
  onBuyUnit: (shopIndex: number) => void;
  onRefresh: () => void;
  onToggleLock: () => void;
  onBuyXP: () => void;
}

export const ShopPanel: React.FC<ShopPanelProps> = ({
  shopSystem,
  onBuyUnit,
  onRefresh,
  onToggleLock,
  onBuyXP,
}) => {
  const [state, setState] = useState(shopSystem.getState());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Update state when shop changes
  useEffect(() => {
    setState(shopSystem.getState());
  }, [shopSystem]);

  const handleRefresh = () => {
    if (state.isLocked) {
      toast.error('Shop is locked! Unlock to refresh.');
      return;
    }

    if (state.gold < state.refreshCost) {
      toast.error(`Need ${state.refreshCost} gold to refresh!`);
      return;
    }

    setIsRefreshing(true);
    onRefresh();

    setTimeout(() => {
      setIsRefreshing(false);
      setState(shopSystem.getState());
    }, 500);
  };

  const handleBuyUnit = (shopIndex: number) => {
    const unit = state.currentShop[shopIndex];
    if (!unit) return;

    if (state.gold < unit.cost) {
      toast.error(`Need ${unit.cost} gold!`);
      return;
    }

    if (state.ownedUnits.length >= 9) {
      toast.error('Bench is full!');
      return;
    }

    onBuyUnit(shopIndex);
    setState(shopSystem.getState());
    toast.success(`Bought ${formatUnitName(unit.type)}!`);
  };

  const handleBuyXP = () => {
    if (state.gold < 4) {
      toast.error('Need 4 gold to buy XP!');
      return;
    }

    const leveledUp = onBuyXP();
    setState(shopSystem.getState());

    if (leveledUp) {
      toast.success(`Level Up! Now level ${state.level}!`, {
        icon: '⭐',
      });
    } else {
      toast.success('Bought 4 XP!');
    }
  };

  const xpProgress = state.level < 9
    ? (state.experience / state.experienceToNextLevel) * 100
    : 100;

  return (
    <div className="w-full bg-gradient-to-b from-[#2A1810] to-[#1A0F0F] rounded-lg shadow-2xl border-4 border-amber-900 p-4">
      {/* Header with Level, Gold, and XP */}
      <div className="flex items-center justify-between mb-4">
        {/* Level Display */}
        <div className="flex items-center gap-3">
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg border-4 border-amber-700">
              <span className="text-white font-bold text-2xl">{state.level}</span>
            </div>
            <div className="absolute -bottom-1 -right-1 bg-purple-600 rounded-full px-2 py-0.5 text-xs text-white font-bold border-2 border-purple-800">
              LVL
            </div>
          </motion.div>

          {/* XP Bar */}
          <div className="flex-1 min-w-[200px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-amber-200 text-xs font-semibold">Experience</span>
              <span className="text-amber-400 text-xs font-bold">
                {state.experience} / {state.experienceToNextLevel}
              </span>
            </div>
            <Progress
              value={xpProgress}
              className="h-3 bg-gray-800"
              style={{
                background: 'linear-gradient(to right, #4A148C, #7B1FA2)',
              }}
            />
            <Button
              onClick={handleBuyXP}
              disabled={state.gold < 4}
              size="sm"
              className="mt-1 bg-purple-600 hover:bg-purple-700 text-white text-xs h-6"
            >
              <TrendingUp className="w-3 h-3 mr-1" />
              Buy XP (4 <img src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold-vdQam3idaMrE1Z27PQDzhXF5gwuSyv.png" alt="G" className="w-3 h-3 inline" />)
            </Button>
          </div>
        </div>

        {/* Gold Display */}
        <motion.div
          className="flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-3 rounded-full shadow-lg border-4 border-amber-800"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        >
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold-vdQam3idaMrE1Z27PQDzhXF5gwuSyv.png"
            alt="Gold"
            className="w-8 h-8"
          />
          <span className="text-white font-bold text-2xl">{state.gold}</span>
        </motion.div>
      </div>

      {/* Shop Cards */}
      <div className="relative mb-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={state.rerollCount}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-5 gap-3"
          >
            {state.currentShop.map((unit, index) => (
              <motion.div
                key={`shop-${index}-${unit?.id || 'empty'}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="relative"
              >
                {unit ? (
                  <UnitCard
                    unit={unit}
                    mode="shop"
                    onBuy={() => handleBuyUnit(index)}
                  />
                ) : (
                  <div className="w-full aspect-[3/4] rounded-lg bg-black/40 border-2 border-dashed border-gray-600 flex items-center justify-center">
                    <span className="text-gray-600 text-xs">Empty</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Lock Overlay */}
        {state.isLocked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-blue-500/10 border-4 border-blue-400 rounded-lg pointer-events-none flex items-center justify-center"
          >
            <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold shadow-lg flex items-center gap-2">
              <Lock className="w-5 h-5" />
              LOCKED
            </div>
          </motion.div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-3">
        {/* Refresh Button */}
        <Button
          onClick={handleRefresh}
          disabled={state.isLocked || state.gold < state.refreshCost || isRefreshing}
          className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-6 text-lg shadow-lg disabled:opacity-50"
        >
          <motion.div
            animate={isRefreshing ? { rotate: 360 } : {}}
            transition={{ duration: 0.5, ease: 'linear' }}
          >
            <RefreshCw className="w-6 h-6 mr-2" />
          </motion.div>
          Refresh Shop ({state.refreshCost}{' '}
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold-vdQam3idaMrE1Z27PQDzhXF5gwuSyv.png"
            alt="Gold"
            className="w-5 h-5 inline ml-1"
          />
          )
        </Button>

        {/* Lock/Unlock Button */}
        <Button
          onClick={onToggleLock}
          className={`
            px-8 py-6 font-bold text-lg shadow-lg transition-all
            ${state.isLocked
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
            }
            text-white
          `}
        >
          {state.isLocked ? (
            <>
              <Lock className="w-6 h-6 mr-2" />
              Unlock
            </>
          ) : (
            <>
              <Unlock className="w-6 h-6 mr-2" />
              Lock
            </>
          )}
        </Button>
      </div>

      {/* Shop Info */}
      <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
        <div>
          Rerolls: <span className="text-amber-400 font-bold">{state.rerollCount}</span>
        </div>
        <div>
          Bench: <span className="text-amber-400 font-bold">{state.ownedUnits.filter(u => u.position === 'bench').length}/9</span>
        </div>
        <div>
          Board: <span className="text-amber-400 font-bold">{state.ownedUnits.filter(u => u.position === 'board').length}/{state.level}</span>
        </div>
      </div>

      {/* Shop Odds Display */}
      <div className="mt-3 bg-black/30 rounded-lg p-2">
        <div className="text-xs text-gray-400 text-center mb-1">Shop Odds (Level {state.level})</div>
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((tier) => (
            <div
              key={tier}
              className="flex flex-col items-center"
              style={{ color: getTierColor(tier) }}
            >
              <div className="text-xs font-bold">{getTierLabel(tier)}</div>
              <div className="text-[10px]">{getShopOdds(state.level, tier)}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function formatUnitName(type: string): string {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

function getTierColor(tier: number): string {
  const colors = {
    1: '#9E9E9E',
    2: '#4CAF50',
    3: '#2196F3',
    4: '#9C27B0',
    5: '#FF9800',
  };
  return colors[tier as keyof typeof colors] || colors[1];
}

function getTierLabel(tier: number): string {
  const labels = {
    1: '★',
    2: '★★',
    3: '★★★',
    4: '★★★★',
    5: '★★★★★',
  };
  return labels[tier as keyof typeof labels] || '★';
}

function getShopOdds(level: number, tier: number): number {
  const odds: Record<number, number[]> = {
    1: [100, 0, 0, 0, 0],
    2: [100, 0, 0, 0, 0],
    3: [75, 25, 0, 0, 0],
    4: [55, 30, 15, 0, 0],
    5: [45, 33, 20, 2, 0],
    6: [30, 40, 25, 5, 0],
    7: [19, 30, 35, 15, 1],
    8: [16, 20, 35, 25, 4],
    9: [10, 15, 33, 30, 12],
  };

  return odds[level]?.[tier - 1] || 0;
}

export default ShopPanel;
