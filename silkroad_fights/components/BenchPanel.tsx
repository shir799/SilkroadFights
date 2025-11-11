'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { ShopSystem, OwnedUnit, calculateSellValue } from '@/lib/shopSystem';
import { UnitCard } from './UnitCard';
import { toast } from 'sonner';
import { Sparkles } from 'lucide-react';

interface BenchPanelProps {
  shopSystem: ShopSystem;
  onSellUnit: (instanceId: string) => void;
  onMoveToBoard: (instanceId: string) => void;
  onMoveFromBoard: (instanceId: string) => void;
}

export const BenchPanel: React.FC<BenchPanelProps> = ({
  shopSystem,
  onSellUnit,
  onMoveToBoard,
  onMoveFromBoard,
}) => {
  const [state, setState] = useState(shopSystem.getState());
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [draggedUnit, setDraggedUnit] = useState<string | null>(null);
  const [combiningUnits, setCombiningUnits] = useState<string[]>([]);

  const benchUnits = state.ownedUnits.filter(u => u.position === 'bench');
  const boardUnits = state.ownedUnits.filter(u => u.position === 'board');

  const handleSellUnit = (instanceId: string) => {
    const unit = state.ownedUnits.find(u => u.instanceId === instanceId);
    if (!unit) return;

    const sellValue = calculateSellValue(unit);
    onSellUnit(instanceId);
    setState(shopSystem.getState());

    toast.success(`Sold unit for ${sellValue} gold!`, {
      icon: '💰',
    });
  };

  const handleUnitClick = (instanceId: string) => {
    if (selectedUnit === instanceId) {
      setSelectedUnit(null);
    } else {
      setSelectedUnit(instanceId);
    }
  };

  const handleMoveToBoard = (instanceId: string) => {
    const boardCount = state.ownedUnits.filter(u => u.position === 'board').length;
    const maxBoardSize = state.level;

    if (boardCount >= maxBoardSize) {
      toast.error(`Board full! Max ${maxBoardSize} units at level ${state.level}`);
      return;
    }

    onMoveToBoard(instanceId);
    setState(shopSystem.getState());
    toast.success('Unit moved to board!');
  };

  const handleMoveFromBoard = (instanceId: string) => {
    onMoveFromBoard(instanceId);
    setState(shopSystem.getState());
    toast.success('Unit moved to bench!');
  };

  const getCombineProgress = (unit: OwnedUnit) => {
    return shopSystem.getCombineProgress(unit.type, unit.stars);
  };

  const isCombineable = (unit: OwnedUnit) => {
    const progress = getCombineProgress(unit);
    return progress.current >= 3;
  };

  // Check for combining animation
  const checkForCombine = () => {
    benchUnits.forEach(unit => {
      if (isCombineable(unit)) {
        const matchingUnits = benchUnits.filter(
          u => u.type === unit.type && u.stars === unit.stars
        );

        if (matchingUnits.length >= 3 && !combiningUnits.includes(unit.instanceId)) {
          // Trigger combine animation
          const unitIds = matchingUnits.slice(0, 3).map(u => u.instanceId);
          setCombiningUnits(unitIds);

          setTimeout(() => {
            setCombiningUnits([]);
            setState(shopSystem.getState());
          }, 1500);
        }
      }
    });
  };

  React.useEffect(() => {
    checkForCombine();
  }, [benchUnits.length]);

  return (
    <div className="w-full space-y-4">
      {/* Bench Section */}
      <div className="bg-gradient-to-b from-[#2A1810] to-[#1A0F0F] rounded-lg shadow-2xl border-4 border-amber-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-amber-200 font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">🎒</span>
            Bench
            <span className="text-sm text-gray-400">
              ({benchUnits.length}/9)
            </span>
          </h2>

          {benchUnits.some(u => isCombineable(u)) && (
            <motion.div
              className="flex items-center gap-2 bg-green-500/20 border border-green-500 rounded-full px-3 py-1"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
              }}
            >
              <Sparkles className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-sm font-bold">Ready to Combine!</span>
            </motion.div>
          )}
        </div>

        {/* Bench Grid */}
        <div className="grid grid-cols-9 gap-2">
          <AnimatePresence mode="popLayout">
            {Array.from({ length: 9 }).map((_, index) => {
              const unit = benchUnits[index];
              const isBeingCombined = unit && combiningUnits.includes(unit.instanceId);

              return (
                <motion.div
                  key={unit?.instanceId || `bench-slot-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: isBeingCombined ? 0 : 1,
                    scale: isBeingCombined ? 0.5 : 1,
                  }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                  className="relative"
                >
                  {unit ? (
                    <div
                      onDoubleClick={() => handleMoveToBoard(unit.instanceId)}
                      className="relative"
                    >
                      <UnitCard
                        unit={unit}
                        mode="bench"
                        onSell={() => handleSellUnit(unit.instanceId)}
                        onClick={() => handleUnitClick(unit.instanceId)}
                        isSelected={selectedUnit === unit.instanceId}
                        isCombineable={isCombineable(unit)}
                        combineProgress={getCombineProgress(unit)}
                        isDragging={draggedUnit === unit.instanceId}
                      />

                      {/* Combine Animation */}
                      {isBeingCombined && (
                        <motion.div
                          className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          initial={{ opacity: 0, scale: 2 }}
                          animate={{ opacity: [0, 1, 0], scale: [2, 1, 0.5] }}
                          transition={{ duration: 1.5 }}
                        >
                          <Sparkles className="w-12 h-12 text-green-400" />
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-lg bg-black/40 border-2 border-dashed border-gray-700 hover:border-amber-600 transition-colors flex items-center justify-center">
                      <span className="text-gray-600 text-xs">Empty</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bench Info */}
        <div className="mt-3 text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span>Double-click to move unit to board</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-green-400" />
            <span>3 identical units auto-combine into next star level</span>
          </div>
        </div>
      </div>

      {/* Board Section */}
      <div className="bg-gradient-to-b from-[#2A1810] to-[#1A0F0F] rounded-lg shadow-2xl border-4 border-purple-900 p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-purple-200 font-bold text-xl flex items-center gap-2">
            <span className="text-2xl">⚔️</span>
            Battle Board
            <span className="text-sm text-gray-400">
              ({boardUnits.length}/{state.level})
            </span>
          </h2>

          {boardUnits.length === state.level && (
            <div className="bg-green-500/20 border border-green-500 rounded-full px-3 py-1">
              <span className="text-green-400 text-sm font-bold">Full Team!</span>
            </div>
          )}
        </div>

        {/* Board Grid */}
        <div className="grid grid-cols-9 gap-2">
          <AnimatePresence mode="popLayout">
            {Array.from({ length: state.level }).map((_, index) => {
              const unit = boardUnits[index];

              return (
                <motion.div
                  key={unit?.instanceId || `board-slot-${index}`}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.3 }}
                >
                  {unit ? (
                    <div onDoubleClick={() => handleMoveFromBoard(unit.instanceId)}>
                      <UnitCard
                        unit={unit}
                        mode="board"
                        onSell={() => handleSellUnit(unit.instanceId)}
                        onClick={() => handleUnitClick(unit.instanceId)}
                        isSelected={selectedUnit === unit.instanceId}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[3/4] rounded-lg bg-purple-900/20 border-2 border-dashed border-purple-700 hover:border-purple-500 transition-colors flex items-center justify-center">
                      <span className="text-purple-600 text-xs">Empty</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Locked Board Slots */}
          {Array.from({ length: 9 - state.level }).map((_, index) => (
            <div
              key={`locked-${index}`}
              className="w-full aspect-[3/4] rounded-lg bg-black/60 border-2 border-gray-800 flex items-center justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black opacity-50" />
              <div className="relative text-center">
                <div className="text-gray-600 text-2xl mb-1">🔒</div>
                <div className="text-gray-600 text-[10px]">Level {state.level + index + 1}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Board Info */}
        <div className="mt-3 text-xs text-gray-400 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full" />
            <span>Double-click to move unit back to bench</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400 font-bold">Tip:</span>
            <span>Level up to unlock more board slots (max 9)</span>
          </div>
        </div>
      </div>

      {/* Combine Notification Overlay */}
      <AnimatePresence>
        {combiningUnits.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 100 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: -100 }}
            className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
          >
            <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-4xl px-12 py-6 rounded-2xl shadow-2xl border-4 border-green-300 flex items-center gap-4">
              <Sparkles className="w-12 h-12 animate-spin" />
              <span>COMBINING!</span>
              <Sparkles className="w-12 h-12 animate-spin" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BenchPanel;
