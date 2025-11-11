'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Item } from '@/lib/shopSystem';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Plus, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

interface ItemPanelProps {
  availableItems: Item[];
  onDragItem?: (item: Item) => void;
  onItemClick?: (item: Item) => void;
}

// Sample Item Database
export const ITEM_DATABASE: Record<string, Omit<Item, 'id'>> = {
  // Basic Components
  BF_SWORD: {
    name: 'B.F. Sword',
    icon: '⚔️',
    stats: { attack: 10 },
    isComplete: false,
  },
  CHAIN_VEST: {
    name: 'Chain Vest',
    icon: '🛡️',
    stats: { defense: 20 },
    isComplete: false,
  },
  NEEDLESSLY_LARGE_ROD: {
    name: 'Needlessly Large Rod',
    icon: '🔮',
    stats: { ability_power: 15 },
    isComplete: false,
  },
  RECURVE_BOW: {
    name: 'Recurve Bow',
    icon: '🏹',
    stats: { attack_speed: 15 },
    isComplete: false,
  },
  NEGATRON_CLOAK: {
    name: 'Negatron Cloak',
    icon: '🧥',
    stats: { magic_resist: 20 },
    isComplete: false,
  },
  GIANTS_BELT: {
    name: "Giant's Belt",
    icon: '❤️',
    stats: { health: 150 },
    isComplete: false,
  },
  SPATULA: {
    name: 'Spatula',
    icon: '🥄',
    stats: { special: 1 },
    isComplete: false,
  },
  TEAR_OF_GODDESS: {
    name: 'Tear of the Goddess',
    icon: '💧',
    stats: { mana: 20 },
    isComplete: false,
  },

  // Complete Items
  DEATHBLADE: {
    name: 'Deathblade',
    icon: '⚔️⚔️',
    stats: { attack: 25, critical_damage: 15 },
    components: ['BF_SWORD', 'BF_SWORD'],
    isComplete: true,
  },
  INFINITY_EDGE: {
    name: 'Infinity Edge',
    icon: '⚔️🔮',
    stats: { attack: 15, critical_chance: 35 },
    components: ['BF_SWORD', 'NEEDLESSLY_LARGE_ROD'],
    isComplete: true,
  },
  GUARDIAN_ANGEL: {
    name: 'Guardian Angel',
    icon: '⚔️🛡️',
    stats: { attack: 15, defense: 20, revive: 1 },
    components: ['BF_SWORD', 'CHAIN_VEST'],
    isComplete: true,
  },
  THORNMAIL: {
    name: 'Thornmail',
    icon: '🛡️🛡️',
    stats: { defense: 40, reflect_damage: 100 },
    components: ['CHAIN_VEST', 'CHAIN_VEST'],
    isComplete: true,
  },
  WARMOGS: {
    name: "Warmog's Armor",
    icon: '❤️🛡️',
    stats: { health: 200, defense: 20 },
    components: ['GIANTS_BELT', 'CHAIN_VEST'],
    isComplete: true,
  },
  RAPID_FIRECANNON: {
    name: 'Rapid Firecannon',
    icon: '🏹🏹',
    stats: { attack_speed: 30, range: 1 },
    components: ['RECURVE_BOW', 'RECURVE_BOW'],
    isComplete: true,
  },
  RABADONS: {
    name: "Rabadon's Deathcap",
    icon: '🔮🔮',
    stats: { ability_power: 40 },
    components: ['NEEDLESSLY_LARGE_ROD', 'NEEDLESSLY_LARGE_ROD'],
    isComplete: true,
  },
  BLUE_BUFF: {
    name: 'Blue Buff',
    icon: '💧🔮',
    stats: { mana: 20, ability_power: 15, mana_on_hit: 10 },
    components: ['TEAR_OF_GODDESS', 'NEEDLESSLY_LARGE_ROD'],
    isComplete: true,
  },
};

export const ItemPanel: React.FC<ItemPanelProps> = ({
  availableItems,
  onDragItem,
  onItemClick,
}) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  // Separate basic components and complete items
  const components = availableItems.filter(item => !item.isComplete);
  const completeItems = availableItems.filter(item => item.isComplete);

  const handleItemClick = (item: Item) => {
    if (selectedItems.includes(item.id)) {
      setSelectedItems(selectedItems.filter(id => id !== item.id));
    } else if (selectedItems.length < 2) {
      setSelectedItems([...selectedItems, item.id]);
    } else {
      setSelectedItems([item.id]);
    }

    onItemClick?.(item);
  };

  const getCombinedItem = (item1Id: string, item2Id: string): Item | null => {
    const item1 = availableItems.find(i => i.id === item1Id);
    const item2 = availableItems.find(i => i.id === item2Id);

    if (!item1 || !item2) return null;

    // Find complete item that matches these components
    const combined = Object.entries(ITEM_DATABASE).find(([_, itemData]) => {
      if (!itemData.components || itemData.components.length !== 2) return false;

      const comp1 = itemData.components[0];
      const comp2 = itemData.components[1];

      return (
        (item1.name === ITEM_DATABASE[comp1]?.name && item2.name === ITEM_DATABASE[comp2]?.name) ||
        (item1.name === ITEM_DATABASE[comp2]?.name && item2.name === ITEM_DATABASE[comp1]?.name)
      );
    });

    if (!combined) return null;

    return {
      id: `combined-${Date.now()}`,
      ...combined[1],
    };
  };

  const combinedPreview = selectedItems.length === 2
    ? getCombinedItem(selectedItems[0], selectedItems[1])
    : null;

  return (
    <div className="w-full bg-gradient-to-b from-[#2A1810] to-[#1A0F0F] rounded-lg shadow-2xl border-4 border-purple-900 p-4">
      <h2 className="text-purple-200 font-bold text-xl mb-4 flex items-center gap-2">
        <span className="text-2xl">✨</span>
        Item Forge
      </h2>

      {/* Item Combination Preview */}
      {selectedItems.length > 0 && (
        <div className="mb-4 bg-purple-900/30 rounded-lg p-3 border-2 border-purple-700">
          <div className="text-sm text-purple-200 mb-2 font-semibold">
            Combination Preview:
          </div>

          <div className="flex items-center justify-center gap-3">
            {selectedItems.map((itemId, index) => {
              const item = availableItems.find(i => i.id === itemId);
              if (!item) return null;

              return (
                <React.Fragment key={itemId}>
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-800 rounded-lg flex items-center justify-center text-3xl border-2 border-purple-400 shadow-lg">
                      {item.icon}
                    </div>
                    <div className="text-xs text-purple-200 mt-1 text-center">
                      {item.name}
                    </div>
                  </div>

                  {index < selectedItems.length - 1 && (
                    <Plus className="w-6 h-6 text-purple-400" />
                  )}
                </React.Fragment>
              );
            })}

            {selectedItems.length === 2 && (
              <>
                <ArrowRight className="w-6 h-6 text-purple-400" />

                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  className="flex flex-col items-center"
                >
                  {combinedPreview ? (
                    <>
                      <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center text-4xl border-4 border-amber-300 shadow-2xl relative overflow-hidden">
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
                          animate={{
                            x: [-100, 200],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                          }}
                        />
                        {combinedPreview.icon}
                      </div>
                      <div className="text-sm text-amber-200 mt-1 text-center font-bold">
                        {combinedPreview.name}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center text-4xl border-2 border-gray-600">
                        ❓
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        No Recipe
                      </div>
                    </>
                  )}
                </motion.div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Basic Components */}
      <div className="mb-4">
        <h3 className="text-amber-200 text-sm font-semibold mb-2 flex items-center gap-2">
          <span>🔧</span>
          Components ({components.length})
        </h3>

        <div className="grid grid-cols-8 gap-2">
          {components.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isSelected={selectedItems.includes(item.id)}
              onClick={() => handleItemClick(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            />
          ))}
        </div>
      </div>

      {/* Complete Items */}
      <div>
        <h3 className="text-amber-200 text-sm font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Complete Items ({completeItems.length})
        </h3>

        <div className="grid grid-cols-8 gap-2">
          {completeItems.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              isComplete
              onClick={() => onItemClick?.(item)}
              onMouseEnter={() => setHoveredItem(item.id)}
              onMouseLeave={() => setHoveredItem(null)}
            />
          ))}
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-4 text-xs text-gray-400 space-y-1">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full" />
          <span>Click items to see combination recipes</span>
        </div>
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>Drag items onto units to equip (max 3 per unit)</span>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ITEM CARD COMPONENT
// ============================================================================

interface ItemCardProps {
  item: Item;
  isSelected?: boolean;
  isComplete?: boolean;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ItemCard: React.FC<ItemCardProps> = ({
  item,
  isSelected = false,
  isComplete = false,
  onClick,
  onMouseEnter,
  onMouseLeave,
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            className={`
              relative w-full aspect-square rounded-lg cursor-pointer transition-all
              ${isComplete
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 border-2 border-amber-300'
                : 'bg-gradient-to-br from-purple-600 to-purple-800 border-2 border-purple-400'
              }
              ${isSelected ? 'ring-4 ring-green-400 ring-offset-2 ring-offset-[#1A0F0F]' : ''}
              shadow-lg hover:shadow-2xl
            `}
          >
            <div className="absolute inset-0 flex items-center justify-center text-3xl">
              {item.icon}
            </div>

            {isComplete && (
              <div className="absolute -top-1 -right-1 bg-amber-400 rounded-full p-1">
                <Sparkles className="w-3 h-3 text-amber-900" />
              </div>
            )}

            {isSelected && (
              <motion.div
                className="absolute inset-0 border-4 border-green-400 rounded-lg"
                animate={{
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                }}
              />
            )}
          </motion.div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="bg-[#1A0F0F] border-2 border-purple-600 p-3 max-w-xs"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-purple-200 font-bold flex items-center gap-2">
                {item.icon} {item.name}
              </h3>
              {isComplete && (
                <Badge className="bg-amber-500 text-white text-xs">
                  Complete
                </Badge>
              )}
            </div>

            {/* Stats */}
            <div className="space-y-1">
              {Object.entries(item.stats).map(([stat, value]) => (
                <div key={stat} className="flex justify-between text-xs text-gray-300">
                  <span className="text-purple-300 capitalize">
                    {stat.replace(/_/g, ' ')}:
                  </span>
                  <span className="text-green-400 font-bold">+{value}</span>
                </div>
              ))}
            </div>

            {/* Recipe */}
            {item.components && item.components.length > 0 && (
              <div className="pt-2 border-t border-purple-900">
                <div className="text-xs text-purple-300 mb-1">Recipe:</div>
                <div className="flex gap-1">
                  {item.components.map((comp, i) => {
                    const compItem = ITEM_DATABASE[comp];
                    return (
                      <Badge
                        key={i}
                        variant="outline"
                        className="text-xs border-purple-600 text-purple-200"
                      >
                        {compItem?.icon} {compItem?.name}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ItemPanel;
