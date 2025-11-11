'use client';

/**
 * AUTO-BATTLE DEMO PAGE
 * Showcase the complete auto-battle system with different team compositions
 */

import React, { useState } from 'react';
import BattleField from '@/components/BattleField';
import { UnitClass } from '@/lib/autoBattleSystem';

const PRESET_BATTLES = {
  tutorial: {
    name: '🎓 Tutorial: Basics',
    description: 'Simple 1v1 to learn the basics',
    teamA: ['BladeNovice'] as UnitClass[],
    teamB: ['BowNovice'] as UnitClass[],
  },
  tier1Battle: {
    name: '⚔️ Tier 1 Clash',
    description: 'Basic units battle it out',
    teamA: ['BladeNovice', 'BowNovice', 'ForceNovice'] as UnitClass[],
    teamB: ['BladeNovice', 'BowNovice', 'ForceNovice'] as UnitClass[],
  },
  tier2Power: {
    name: '💪 Tier 2 Showdown',
    description: 'Advanced units with AoE abilities',
    teamA: ['Blader', 'Bowman', 'Wizard'] as UnitClass[],
    teamB: ['Blader', 'Bowman', 'Wizard'] as UnitClass[],
  },
  supportVsDamage: {
    name: '🛡️ Support vs Damage',
    description: 'Support units vs pure damage',
    teamA: ['Warrior', 'Bard', 'Cleric'] as UnitClass[],
    teamB: ['Blader', 'Blader', 'Wizard'] as UnitClass[],
  },
  wizardWars: {
    name: '🔮 Wizard Wars',
    description: 'Epic elemental battle',
    teamA: ['FireWizard', 'IceWizard', 'LightningWizard'] as UnitClass[],
    teamB: ['FireWizard', 'IceWizard', 'LightningWizard'] as UnitClass[],
  },
  legendaryClash: {
    name: '⭐ Legendary Clash',
    description: 'The ultimate showdown',
    teamA: ['TigerGirl', 'Phoenix', 'Dragon'] as UnitClass[],
    teamB: ['TigerGirl', 'Phoenix', 'Dragon'] as UnitClass[],
  },
  asymmetric: {
    name: '🎯 David vs Goliath',
    description: 'Many weak vs few strong',
    teamA: ['BladeNovice', 'BladeNovice', 'BowNovice', 'BowNovice', 'ForceNovice'] as UnitClass[],
    teamB: ['Dragon', 'Phoenix'] as UnitClass[],
  },
  mixedTiers: {
    name: '🌈 Mixed Composition',
    description: 'Balanced team composition',
    teamA: ['Warrior', 'FireWizard', 'Bard', 'Blader'] as UnitClass[],
    teamB: ['Dragon', 'Cleric', 'LightningWizard'] as UnitClass[],
  },
};

export default function BattleDemoPage() {
  const [selectedBattle, setSelectedBattle] = useState<keyof typeof PRESET_BATTLES>('tutorial');
  const [battleKey, setBattleKey] = useState(0);
  const [wins, setWins] = useState({ A: 0, B: 0 });

  const currentBattle = PRESET_BATTLES[selectedBattle];

  const handleBattleEnd = (winner: 'A' | 'B') => {
    setWins(prev => ({
      ...prev,
      [winner]: prev[winner] + 1,
    }));
  };

  const resetBattle = () => {
    setBattleKey(prev => prev + 1);
  };

  const resetStats = () => {
    setWins({ A: 0, B: 0 });
    setBattleKey(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            ⚔️ AUTO-BATTLE ARENA ⚔️
          </h1>
          <p className="text-xl text-gray-400">
            Watch AI-controlled units battle with abilities, mana, and strategy!
          </p>
        </div>

        {/* Battle Selector */}
        <div className="mb-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">Select Battle</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(PRESET_BATTLES).map(([key, battle]) => (
              <button
                key={key}
                onClick={() => {
                  setSelectedBattle(key as keyof typeof PRESET_BATTLES);
                  setBattleKey(prev => prev + 1);
                }}
                className={`p-4 rounded-lg transition-all ${
                  selectedBattle === key
                    ? 'bg-blue-600 shadow-lg scale-105'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="text-lg font-bold mb-1">{battle.name}</div>
                <div className="text-xs text-gray-300">{battle.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Current Battle Info */}
        <div className="mb-6 bg-gray-800 rounded-lg p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold mb-2">{currentBattle.name}</h2>
              <p className="text-gray-400">{currentBattle.description}</p>
            </div>

            <div className="flex gap-4">
              <div className="text-center bg-blue-900 px-6 py-3 rounded">
                <div className="text-3xl font-bold">{wins.A}</div>
                <div className="text-sm">Team A Wins</div>
              </div>

              <div className="text-center bg-red-900 px-6 py-3 rounded">
                <div className="text-3xl font-bold">{wins.B}</div>
                <div className="text-sm">Team B Wins</div>
              </div>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <button
              onClick={resetBattle}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
            >
              🔄 Restart Battle
            </button>
            <button
              onClick={resetStats}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-bold"
            >
              ♻️ Reset Stats
            </button>
          </div>
        </div>

        {/* Battlefield */}
        <BattleField
          key={battleKey}
          teamA={currentBattle.teamA}
          teamB={currentBattle.teamB}
          onBattleEnd={handleBattleEnd}
          autoStart={true}
        />

        {/* Features List */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">🎮 Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon="🤖"
              title="Smart AI"
              description="Units use pathfinding, kiting, and target prioritization"
            />
            <FeatureCard
              icon="⚡"
              title="Mana System"
              description="Gain 10 mana per attack, 20 per damage taken. Cast at 100 mana"
            />
            <FeatureCard
              icon="💥"
              title="Combat Mechanics"
              description="Crits, dodge, armor, magic resist, lifesteal"
            />
            <FeatureCard
              icon="🔥"
              title="Abilities"
              description="Unique abilities for all 15 unit types"
            />
            <FeatureCard
              icon="🎯"
              title="AoE & DoT"
              description="Area damage, damage over time, and status effects"
            />
            <FeatureCard
              icon="✨"
              title="Visual Effects"
              description="Projectiles, particles, damage numbers, animations"
            />
            <FeatureCard
              icon="🎬"
              title="60 FPS"
              description="Smooth animations with lerp interpolation"
            />
            <FeatureCard
              icon="📹"
              title="Playback Control"
              description="Pause, resume, and speed control (0.5x - 4x)"
            />
            <FeatureCard
              icon="🐉"
              title="Legendary Units"
              description="TigerGirl, Phoenix (revive), Dragon breath"
            />
          </div>
        </div>

        {/* Unit Guide */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📖 Unit Guide</h2>

          <div className="space-y-6">
            <TierSection
              tier={1}
              title="Tier 1: Novices"
              units={[
                { class: 'BladeNovice', emoji: '🗡️', ability: 'Slash - 150 single target damage' },
                { class: 'BowNovice', emoji: '🏹', ability: 'Arrow Shot - 120 ranged damage' },
                { class: 'ForceNovice', emoji: '✨', ability: 'Magic Bolt - 100 magic damage' },
              ]}
            />

            <TierSection
              tier={2}
              title="Tier 2: Advanced"
              units={[
                { class: 'Blader', emoji: '⚔️', ability: 'Whirlwind - 200 AoE damage' },
                { class: 'Bowman', emoji: '🏹', ability: 'Multi-Shot - 150 damage to 3 targets' },
                { class: 'Wizard', emoji: '🔮', ability: 'Fireball - 250 AoE explosion' },
              ]}
            />

            <TierSection
              tier={3}
              title="Tier 3: Support"
              units={[
                { class: 'Warrior', emoji: '🛡️', ability: 'Taunt - Force enemies to attack, +50 armor' },
                { class: 'Bard', emoji: '🎵', ability: 'Inspiring Song - Allies +30% attack speed' },
                { class: 'Cleric', emoji: '✝️', ability: 'Holy Light - Heal lowest HP ally 300 HP' },
              ]}
            />

            <TierSection
              tier={4}
              title="Tier 4: Elite Casters"
              units={[
                { class: 'FireWizard', emoji: '🔥', ability: 'Meteor - 500 AoE + burn DoT' },
                { class: 'IceWizard', emoji: '❄️', ability: 'Blizzard - 300 AoE + 50% slow' },
                { class: 'LightningWizard', emoji: '⚡', ability: 'Chain Lightning - 400 damage, bounces 3x' },
              ]}
            />

            <TierSection
              tier={5}
              title="Tier 5: Legendary"
              units={[
                { class: 'TigerGirl', emoji: '🐯', ability: 'Roar - 800 AoE + 2s stun' },
                { class: 'Phoenix', emoji: '🦅', ability: 'Rebirth - Revive with 50% HP on death' },
                { class: 'Dragon', emoji: '🐉', ability: 'Dragon Breath - 1200 damage line AoE' },
              ]}
            />
          </div>
        </div>

        {/* Combat Formulas */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold mb-4">📊 Combat Formulas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <FormulaCard
              title="Physical Damage"
              formula="Final = (Base + AttackDamage) × (1 - Armor/(Armor + 100)) × CritMultiplier"
            />
            <FormulaCard
              title="Magical Damage"
              formula="Final = Ability Damage × (1 - MagicResist/(MagicResist + 100))"
            />
            <FormulaCard
              title="Critical Hit"
              formula="Damage × CritMultiplier (usually 1.5x - 2.5x)"
            />
            <FormulaCard
              title="Lifesteal"
              formula="Heal = Damage Dealt × Lifesteal% (max HP capped)"
            />
            <FormulaCard
              title="Mana Gain"
              formula="Attack: +10 mana | Take Damage: +20 mana | Max: 100"
            />
            <FormulaCard
              title="Ability Cast"
              formula="Auto-cast when Mana = 100 (resets to 0)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <div className="text-3xl mb-2">{icon}</div>
      <h3 className="font-bold mb-1">{title}</h3>
      <p className="text-sm text-gray-400">{description}</p>
    </div>
  );
}

function TierSection({
  tier,
  title,
  units,
}: {
  tier: number;
  title: string;
  units: Array<{ class: string; emoji: string; ability: string }>;
}) {
  const colors = ['gray', 'green', 'blue', 'purple', 'yellow'];
  const color = colors[tier - 1];

  return (
    <div className={`bg-${color}-900 bg-opacity-30 p-4 rounded-lg border border-${color}-700`}>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <div className="space-y-2">
        {units.map(unit => (
          <div key={unit.class} className="flex items-start gap-3">
            <span className="text-2xl">{unit.emoji}</span>
            <div>
              <div className="font-bold">{unit.class}</div>
              <div className="text-sm text-gray-400">{unit.ability}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormulaCard({ title, formula }: { title: string; formula: string }) {
  return (
    <div className="bg-gray-700 p-4 rounded-lg">
      <h3 className="font-bold mb-2 text-blue-400">{title}</h3>
      <code className="text-xs text-green-400">{formula}</code>
    </div>
  );
}
