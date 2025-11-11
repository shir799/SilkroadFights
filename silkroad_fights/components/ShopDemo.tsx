'use client';

/**
 * Complete Shop System Demo
 * This file demonstrates how to integrate all shop components together
 */

import { useState, useEffect } from 'react';
import { ShopSystem, createShopSystem } from '@/lib/shopSystem';
import { ShopPanel } from './ShopPanel';
import { BenchPanel } from './BenchPanel';
import { ItemPanel, ITEM_DATABASE } from './ItemPanel';
import { Toaster } from '@/components/ui/sonner';

export default function ShopDemo() {
  const [shopSystem] = useState(() => createShopSystem(50)); // Start with 50 gold for demo
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize shop on mount
  useEffect(() => {
    shopSystem.forceRefreshShop();
    setRefreshKey(prev => prev + 1);
  }, []);

  // Shop handlers
  const handleBuyUnit = (shopIndex: number) => {
    const result = shopSystem.buyUnit(shopIndex);
    if (result) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleRefresh = () => {
    const result = shopSystem.refreshShop();
    if (result) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleToggleLock = () => {
    shopSystem.toggleLock();
    setRefreshKey(prev => prev + 1);
  };

  const handleBuyXP = () => {
    const leveledUp = shopSystem.buyExperience();
    setRefreshKey(prev => prev + 1);
    return leveledUp;
  };

  // Bench/Board handlers
  const handleSellUnit = (instanceId: string) => {
    shopSystem.sellUnit(instanceId);
    setRefreshKey(prev => prev + 1);
  };

  const handleMoveToBoard = (instanceId: string) => {
    const result = shopSystem.moveUnitToBoard(instanceId);
    if (result) {
      setRefreshKey(prev => prev + 1);
    }
  };

  const handleMoveFromBoard = (instanceId: string) => {
    const result = shopSystem.moveUnitToBench(instanceId);
    if (result) {
      setRefreshKey(prev => prev + 1);
    }
  };

  // Sample items (in a real game, these would come from combat rewards)
  const [availableItems] = useState(() => {
    return Object.keys(ITEM_DATABASE).map((key, i) => ({
      id: `item-${i}`,
      ...ITEM_DATABASE[key],
    }));
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1A0F0F] to-black p-4 space-y-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-amber-400 mb-2 drop-shadow-lg">
          🐫 Silkroad Fights - Shop System 🐫
        </h1>
        <p className="text-amber-200/70 text-sm">
          TFT-Style Auto-Chess Shop & Inventory Management
        </p>
      </div>

      {/* Shop Panel */}
      <ShopPanel
        key={`shop-${refreshKey}`}
        shopSystem={shopSystem}
        onBuyUnit={handleBuyUnit}
        onRefresh={handleRefresh}
        onToggleLock={handleToggleLock}
        onBuyXP={handleBuyXP}
      />

      {/* Bench & Board Panel */}
      <BenchPanel
        key={`bench-${refreshKey}`}
        shopSystem={shopSystem}
        onSellUnit={handleSellUnit}
        onMoveToBoard={handleMoveToBoard}
        onMoveFromBoard={handleMoveFromBoard}
      />

      {/* Item Panel */}
      <ItemPanel
        availableItems={availableItems}
        onItemClick={(item) => {
          console.log('Item clicked:', item);
        }}
      />

      {/* Instructions */}
      <div className="bg-gradient-to-b from-[#2A1810] to-[#1A0F0F] rounded-lg border-4 border-amber-900 p-6">
        <h2 className="text-amber-200 font-bold text-xl mb-4 flex items-center gap-2">
          <span className="text-2xl">📖</span>
          How to Play
        </h2>

        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-300">
          <div className="space-y-2">
            <h3 className="text-amber-400 font-semibold">🛒 Shopping</h3>
            <ul className="space-y-1 pl-4 list-disc">
              <li>Click "BUY" on units in the shop to purchase them</li>
              <li>Click "Refresh Shop" to get new units (costs 2 gold)</li>
              <li>Click "Lock" to keep the same units next refresh</li>
              <li>Buy XP to level up and unlock more board slots</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-amber-400 font-semibold">⭐ Combining</h3>
            <ul className="space-y-1 pl-4 list-disc">
              <li>Buy 3 copies of the same unit to auto-combine</li>
              <li>1-star + 1-star + 1-star = 2-star unit</li>
              <li>2-star + 2-star + 2-star = 3-star unit</li>
              <li>Watch for the green glow on combineable units!</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-amber-400 font-semibold">🎒 Bench & Board</h3>
            <ul className="space-y-1 pl-4 list-disc">
              <li>Double-click units to move them to the board</li>
              <li>Double-click board units to move them back to bench</li>
              <li>Hover and click "SELL" to refund gold</li>
              <li>Board size = Your level (max 9)</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="text-amber-400 font-semibold">✨ Items</h3>
            <ul className="space-y-1 pl-4 list-disc">
              <li>Click 2 components to preview combination</li>
              <li>Drag items onto units to equip (max 3 per unit)</li>
              <li>Combine matching components for powerful items</li>
              <li>Hover items to see stats and recipes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Stats Panel */}
      <div className="bg-gradient-to-b from-[#2A1810] to-[#1A0F0F] rounded-lg border-4 border-purple-900 p-4">
        <h2 className="text-purple-200 font-bold text-lg mb-3">📊 Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-black/40 rounded-lg p-3 text-center">
            <div className="text-amber-400 font-bold text-2xl">
              {shopSystem.getState().gold}
            </div>
            <div className="text-gray-400 text-xs">Gold</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 text-center">
            <div className="text-purple-400 font-bold text-2xl">
              {shopSystem.getState().level}
            </div>
            <div className="text-gray-400 text-xs">Level</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 text-center">
            <div className="text-green-400 font-bold text-2xl">
              {shopSystem.getState().ownedUnits.filter(u => u.position === 'bench').length}/9
            </div>
            <div className="text-gray-400 text-xs">Bench</div>
          </div>
          <div className="bg-black/40 rounded-lg p-3 text-center">
            <div className="text-blue-400 font-bold text-2xl">
              {shopSystem.getState().ownedUnits.filter(u => u.position === 'board').length}/{shopSystem.getState().level}
            </div>
            <div className="text-gray-400 text-xs">Board</div>
          </div>
        </div>
      </div>

      {/* Toast notifications */}
      <Toaster position="bottom-right" />
    </div>
  );
}
