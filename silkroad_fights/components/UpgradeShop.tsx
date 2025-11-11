'use client';

import React, { useState } from 'react';
import { PlayerProfile, UpgradeSystem, UnitUpgrades } from '@/lib/progressionSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface UpgradeShopProps {
  profile: PlayerProfile;
  onUpgrade: (unitType: string, upgradeType: string) => void;
  onBack: () => void;
}

export default function UpgradeShop({ profile, onUpgrade, onBack }: UpgradeShopProps) {
  const [selectedUnit, setSelectedUnit] = useState<'trader' | 'thief' | 'hunter' | 'kingThief'>('trader');

  const unitUpgrades = profile.upgrades[selectedUnit];

  const unitInfo = {
    trader: {
      name: 'Trader',
      icon: '🛒',
      description: 'The backbone of your economy. Delivers gold and generates silk.',
      color: 'from-blue-600 to-blue-800',
    },
    thief: {
      name: 'Thief',
      icon: '🥷',
      description: 'Stealthy attacker with high mobility. Steals gold and eliminates enemies.',
      color: 'from-red-600 to-red-800',
    },
    hunter: {
      name: 'Hunter',
      icon: '🏹',
      description: 'Ranged specialist with tracking abilities. Excellent for zone control.',
      color: 'from-green-600 to-green-800',
    },
    kingThief: {
      name: 'King Thief',
      icon: '👑',
      description: 'Elite thief unit with command abilities. Unlocked at level 10.',
      color: 'from-purple-600 to-purple-800',
    },
  };

  const isUnitUnlocked = (unit: string) => {
    return profile.unlockedUnits.includes(unit);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-orange-950 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline" className="border-amber-600 text-amber-200">
            Back
          </Button>
          <h1 className="text-4xl font-bold text-amber-200">Upgrade Shop</h1>
          <div className="flex items-center gap-2 bg-black/60 px-6 py-3 rounded-lg border border-amber-600">
            <span className="text-2xl">💰</span>
            <span className="text-2xl font-bold text-amber-300">{profile.silk}</span>
            <span className="text-amber-500">Silk</span>
          </div>
        </div>

        {/* Unit Selection */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {Object.entries(unitInfo).map(([unitKey, info]) => {
            const unlocked = isUnitUnlocked(unitKey);
            const isSelected = selectedUnit === unitKey;

            return (
              <Card
                key={unitKey}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br ' + info.color + ' border-amber-400 border-2 scale-105'
                    : unlocked
                    ? 'bg-black/60 border-amber-600 hover:scale-102'
                    : 'bg-black/30 border-gray-600 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => unlocked && setSelectedUnit(unitKey as any)}
              >
                <div className="p-6 text-center">
                  <div className="text-6xl mb-3">{info.icon}</div>
                  <h3 className="text-xl font-bold text-amber-200 mb-2">{info.name}</h3>
                  {!unlocked && (
                    <Badge className="bg-red-600">
                      Locked
                    </Badge>
                  )}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Unit Info & Upgrades */}
        {isUnitUnlocked(selectedUnit) ? (
          <div className="grid grid-cols-3 gap-6">
            {/* Left: Unit Info */}
            <Card className="bg-black/60 border-amber-600 p-6">
              <div className="text-center mb-6">
                <div className="text-8xl mb-4">{unitInfo[selectedUnit].icon}</div>
                <h2 className="text-3xl font-bold text-amber-200 mb-2">
                  {unitInfo[selectedUnit].name}
                </h2>
                <p className="text-amber-400">{unitInfo[selectedUnit].description}</p>
              </div>

              <div className="space-y-4 mt-6">
                <div className="bg-black/40 p-4 rounded border border-amber-700">
                  <h4 className="text-amber-200 font-semibold mb-2">Current Stats</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-amber-500">Health:</span>
                      <span className="text-amber-300">Base + {unitUpgrades.healthLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">Attack:</span>
                      <span className="text-amber-300">Base + {unitUpgrades.attackLevel}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">Speed:</span>
                      <span className="text-amber-300">+{(unitUpgrades.speedLevel * 10)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-amber-500">Special:</span>
                      <span className="text-amber-300">Level {unitUpgrades.specialLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-black/40 p-4 rounded border border-amber-700">
                  <h4 className="text-amber-200 font-semibold mb-2">Total Investment</h4>
                  <div className="text-2xl font-bold text-amber-300">
                    {UpgradeSystem.calculateTotalUpgradeCost(unitUpgrades)} Silk
                  </div>
                </div>
              </div>
            </Card>

            {/* Right: Upgrade Options */}
            <div className="col-span-2 space-y-4">
              {/* Health Upgrade */}
              <UpgradeCard
                type="health"
                title="Health Upgrade"
                icon="❤️"
                description={UpgradeSystem.getUpgradeDescription(selectedUnit, 'health', unitUpgrades.healthLevel + 1)}
                currentLevel={unitUpgrades.healthLevel}
                maxLevel={unitUpgrades.maxLevel}
                cost={UpgradeSystem.getUpgradeCost('health', unitUpgrades.healthLevel)}
                playerSilk={profile.silk}
                onUpgrade={() => onUpgrade(selectedUnit, 'health')}
              />

              {/* Attack Upgrade */}
              <UpgradeCard
                type="attack"
                title="Attack Upgrade"
                icon="⚔️"
                description={UpgradeSystem.getUpgradeDescription(selectedUnit, 'attack', unitUpgrades.attackLevel + 1)}
                currentLevel={unitUpgrades.attackLevel}
                maxLevel={unitUpgrades.maxLevel}
                cost={UpgradeSystem.getUpgradeCost('attack', unitUpgrades.attackLevel)}
                playerSilk={profile.silk}
                onUpgrade={() => onUpgrade(selectedUnit, 'attack')}
              />

              {/* Speed Upgrade */}
              <UpgradeCard
                type="speed"
                title="Speed Upgrade"
                icon="⚡"
                description={UpgradeSystem.getUpgradeDescription(selectedUnit, 'speed', unitUpgrades.speedLevel + 1)}
                currentLevel={unitUpgrades.speedLevel}
                maxLevel={unitUpgrades.maxLevel}
                cost={UpgradeSystem.getUpgradeCost('speed', unitUpgrades.speedLevel)}
                playerSilk={profile.silk}
                onUpgrade={() => onUpgrade(selectedUnit, 'speed')}
              />

              {/* Special Upgrade */}
              <UpgradeCard
                type="special"
                title={`Special: ${unitInfo[selectedUnit].name} Enhancement`}
                icon="✨"
                description={UpgradeSystem.getUpgradeDescription(selectedUnit, 'special', unitUpgrades.specialLevel + 1)}
                currentLevel={unitUpgrades.specialLevel}
                maxLevel={unitUpgrades.maxLevel}
                cost={UpgradeSystem.getUpgradeCost('special', unitUpgrades.specialLevel)}
                playerSilk={profile.silk}
                onUpgrade={() => onUpgrade(selectedUnit, 'special')}
                special={true}
              />
            </div>
          </div>
        ) : (
          <Card className="bg-black/60 border-amber-600 p-12 text-center">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-3xl font-bold text-amber-200 mb-4">Unit Locked</h2>
            <p className="text-amber-400 text-lg">
              {selectedUnit === 'hunter' && 'Unlock the Hunter at Level 5'}
              {selectedUnit === 'kingThief' && 'Unlock the King Thief at Level 10'}
            </p>
          </Card>
        )}

        {/* Info Box */}
        <Card className="bg-blue-900/20 border-blue-600 p-6 mt-8">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-2">About Upgrades</h3>
              <ul className="text-blue-200 space-y-1">
                <li>• Upgrades are permanent and persist across all games</li>
                <li>• Each upgrade level increases in cost (exponential scaling)</li>
                <li>• Maximum upgrade level: 20 per stat</li>
                <li>• Special upgrades are unique to each unit type</li>
                <li>• When you prestige, you'll get 50% of your silk back</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Upgrade Card Component
interface UpgradeCardProps {
  type: string;
  title: string;
  icon: string;
  description: string;
  currentLevel: number;
  maxLevel: number;
  cost: number;
  playerSilk: number;
  onUpgrade: () => void;
  special?: boolean;
}

function UpgradeCard({
  type,
  title,
  icon,
  description,
  currentLevel,
  maxLevel,
  cost,
  playerSilk,
  onUpgrade,
  special = false,
}: UpgradeCardProps) {
  const isMaxLevel = currentLevel >= maxLevel;
  const canAfford = playerSilk >= cost;
  const progress = (currentLevel / maxLevel) * 100;

  const getTypeColor = () => {
    if (special) return 'from-purple-600 to-purple-800';
    switch (type) {
      case 'health': return 'from-red-600 to-red-800';
      case 'attack': return 'from-orange-600 to-orange-800';
      case 'speed': return 'from-green-600 to-green-800';
      default: return 'from-blue-600 to-blue-800';
    }
  };

  return (
    <Card className={`bg-gradient-to-br ${getTypeColor()} border-amber-600 p-6`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{icon}</span>
          <div>
            <h3 className="text-xl font-bold text-white">{title}</h3>
            <p className="text-amber-100 text-sm">{description}</p>
          </div>
        </div>
        <Badge className="bg-black/40 text-white text-lg px-3 py-1">
          Lv {currentLevel}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-amber-100 mb-1">
          <span>Level Progress</span>
          <span>{currentLevel} / {maxLevel}</span>
        </div>
        <Progress value={progress} className="h-3 bg-black/40">
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${progress}%` }} />
        </Progress>
      </div>

      {/* Upgrade Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <span className={`text-2xl font-bold ${canAfford ? 'text-amber-300' : 'text-red-400'}`}>
            {isMaxLevel ? 'MAX' : cost}
          </span>
          {!isMaxLevel && <span className="text-amber-200">Silk</span>}
        </div>

        <Button
          onClick={onUpgrade}
          disabled={isMaxLevel || !canAfford}
          className={`
            ${isMaxLevel ? 'bg-gray-600 cursor-not-allowed' :
              canAfford ? 'bg-amber-600 hover:bg-amber-700' : 'bg-red-600 cursor-not-allowed'}
          `}
        >
          {isMaxLevel ? 'Max Level' : canAfford ? 'Upgrade' : 'Not Enough Silk'}
        </Button>
      </div>
    </Card>
  );
}
