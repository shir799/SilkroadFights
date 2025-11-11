'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OwnedUnit, ShopUnit } from '@/lib/shopSystem';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, Shield, Swords, Target } from 'lucide-react';

interface UnitCardProps {
  unit: OwnedUnit | ShopUnit;
  mode: 'shop' | 'bench' | 'board';
  onBuy?: () => void;
  onSell?: () => void;
  onClick?: () => void;
  isDragging?: boolean;
  isSelected?: boolean;
  isCombineable?: boolean;
  combineProgress?: { current: number; needed: number };
  dragHandlers?: any;
}

export const UnitCard: React.FC<UnitCardProps> = ({
  unit,
  mode,
  onBuy,
  onSell,
  onClick,
  isDragging = false,
  isSelected = false,
  isCombineable = false,
  combineProgress,
  dragHandlers,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isOwnedUnit = 'instanceId' in unit;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: isDragging ? 0.5 : 1,
              scale: isDragging ? 0.95 : 1,
            }}
            whileHover={{ scale: mode !== 'board' ? 1.05 : 1 }}
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            onClick={onClick}
            {...dragHandlers}
          >
            {/* Main Card Container */}
            <div
              className={`
                relative w-full aspect-[3/4] rounded-lg overflow-hidden cursor-pointer
                transition-all duration-200
                ${isSelected ? 'ring-4 ring-amber-400 ring-offset-2 ring-offset-[#1A0F0F]' : ''}
                ${isCombineable ? 'animate-pulse ring-2 ring-green-400' : ''}
              `}
              style={{
                background: getCardBackground(unit.tier, mode),
                boxShadow: isSelected
                  ? '0 0 30px rgba(255, 215, 0, 0.6)'
                  : '0 4px 12px rgba(0, 0, 0, 0.5)',
              }}
            >
              {/* Tier Border */}
              <div
                className="absolute inset-0 border-4 rounded-lg pointer-events-none"
                style={{
                  borderColor: getTierColor(unit.tier),
                  borderImage: `linear-gradient(135deg, ${getTierColor(unit.tier)}, transparent) 1`,
                }}
              />

              {/* Unit Portrait */}
              <div className="relative w-full h-[60%] overflow-hidden bg-gradient-to-b from-black/20 to-black/60">
                <img
                  src={unit.icon}
                  alt={unit.type}
                  className="w-full h-full object-cover"
                  style={{
                    filter: isDragging ? 'brightness(0.6)' : 'brightness(1)',
                  }}
                />

                {/* Cost Badge (Shop only) */}
                {mode === 'shop' && (
                  <div className="absolute top-2 right-2 bg-amber-500 rounded-full px-2 py-1 flex items-center gap-1 shadow-lg">
                    <img
                      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold-vdQam3idaMrE1Z27PQDzhXF5gwuSyv.png"
                      alt="Gold"
                      className="w-4 h-4"
                    />
                    <span className="text-white font-bold text-sm">{unit.cost}</span>
                  </div>
                )}

                {/* Star Level */}
                <div className="absolute top-2 left-2 flex gap-0.5">
                  {Array.from({ length: unit.stars }).map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-lg"
                    />
                  ))}
                </div>

                {/* HP Bar (Owned units only) */}
                {isOwnedUnit && (
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/50">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-green-500 transition-all"
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
              </div>

              {/* Unit Info */}
              <div className="relative h-[40%] p-2 flex flex-col justify-between bg-gradient-to-b from-[#2A1810] to-[#1A0F0F]">
                {/* Unit Name */}
                <div className="text-center">
                  <h3 className="text-white font-bold text-xs truncate">
                    {formatUnitName(unit.type)}
                  </h3>

                  {/* Traits */}
                  <div className="flex gap-1 justify-center mt-1 flex-wrap">
                    {unit.traits.slice(0, 2).map((trait, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="text-[9px] px-1 py-0 h-4 bg-amber-900/50 text-amber-200 border border-amber-700"
                      >
                        {trait}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats Preview */}
                <div className="grid grid-cols-3 gap-1 text-[10px]">
                  <div className="flex items-center gap-0.5 justify-center text-red-400">
                    <Heart className="w-3 h-3" />
                    <span>{Math.floor(unit.stats.hp)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 justify-center text-orange-400">
                    <Swords className="w-3 h-3" />
                    <span>{Math.floor(unit.stats.attack)}</span>
                  </div>
                  <div className="flex items-center gap-0.5 justify-center text-blue-400">
                    <Shield className="w-3 h-3" />
                    <span>{Math.floor(unit.stats.defense)}</span>
                  </div>
                </div>

                {/* Item Slots (Owned units only) */}
                {isOwnedUnit && unit.items && (
                  <div className="flex gap-1 justify-center mt-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div
                        key={i}
                        className={`
                          w-5 h-5 rounded border-2
                          ${unit.items[i]
                            ? 'bg-purple-600 border-purple-400'
                            : 'bg-black/40 border-gray-600'
                          }
                        `}
                      >
                        {unit.items[i] && (
                          <img
                            src={unit.items[i].icon}
                            alt={unit.items[i].name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Combine Progress */}
                {combineProgress && combineProgress.current > 1 && (
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                    {combineProgress.current}/{combineProgress.needed}
                  </div>
                )}
              </div>

              {/* Hover Overlay */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2 p-2"
                  >
                    {mode === 'shop' && onBuy && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onBuy();
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold rounded-lg shadow-lg text-sm"
                      >
                        BUY
                      </motion.button>
                    )}

                    {(mode === 'bench' || mode === 'board') && onSell && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onSell();
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-red-500 to-red-700 text-white font-bold rounded-lg shadow-lg text-sm"
                      >
                        SELL
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Combineable Glow Effect */}
              {isCombineable && (
                <motion.div
                  className="absolute inset-0 border-4 border-green-400 rounded-lg pointer-events-none"
                  animate={{
                    opacity: [0.3, 1, 0.3],
                    scale: [0.98, 1.02, 0.98],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />
              )}
            </div>
          </motion.div>
        </TooltipTrigger>

        {/* Tooltip Content */}
        <TooltipContent
          side="top"
          className="bg-[#1A0F0F] border-2 border-amber-600 p-3 max-w-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-amber-200 font-bold">{formatUnitName(unit.type)}</h3>
              <div className="flex gap-0.5">
                {Array.from({ length: unit.stars }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>

            <div className="flex gap-2 flex-wrap">
              {unit.traits.map((trait, i) => (
                <Badge key={i} variant="outline" className="text-xs border-amber-600 text-amber-200">
                  {trait}
                </Badge>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-gray-300">
              <div className="flex items-center gap-1">
                <Heart className="w-4 h-4 text-red-400" />
                <span>HP: {Math.floor(unit.stats.hp)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Swords className="w-4 h-4 text-orange-400" />
                <span>ATK: {Math.floor(unit.stats.attack)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Shield className="w-4 h-4 text-blue-400" />
                <span>DEF: {Math.floor(unit.stats.defense)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target className="w-4 h-4 text-purple-400" />
                <span>RNG: {unit.stats.range}</span>
              </div>
            </div>

            {mode === 'shop' && (
              <div className="text-amber-400 font-bold flex items-center gap-1 pt-1 border-t border-amber-900">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold-vdQam3idaMrE1Z27PQDzhXF5gwuSyv.png"
                  alt="Gold"
                  className="w-4 h-4"
                />
                <span>Cost: {unit.cost} Gold</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getCardBackground(tier: number, mode: string): string {
  const baseColors = {
    1: 'linear-gradient(135deg, #4A4A4A 0%, #2A2A2A 100%)', // Gray
    2: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)', // Green
    3: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)', // Blue
    4: 'linear-gradient(135deg, #7B1FA2 0%, #4A148C 100%)', // Purple
    5: 'linear-gradient(135deg, #F57C00 0%, #E65100 100%)', // Orange/Gold
  };

  return baseColors[tier as keyof typeof baseColors] || baseColors[1];
}

function getTierColor(tier: number): string {
  const colors = {
    1: '#9E9E9E', // Gray
    2: '#4CAF50', // Green
    3: '#2196F3', // Blue
    4: '#9C27B0', // Purple
    5: '#FF9800', // Orange
  };

  return colors[tier as keyof typeof colors] || colors[1];
}

function formatUnitName(type: string): string {
  return type
    .replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0) + word.slice(1).toLowerCase())
    .join(' ');
}

export default UnitCard;
