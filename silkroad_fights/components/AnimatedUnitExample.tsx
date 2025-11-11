/**
 * ⚔️ ANIMATED UNIT USAGE EXAMPLES ⚔️
 *
 * This file demonstrates how to use the AnimatedUnit component
 * with various animation states and effects
 */

import React, { useState } from 'react';
import { AnimatedUnit, AnimationState } from './AnimatedUnit';
import { Unit } from '../lib/types';
import { theme } from '../lib/theme';
import { motion } from 'framer-motion';

// ============================================================================
// BASIC USAGE EXAMPLE
// ============================================================================

export const BasicAnimatedUnitExample: React.FC = () => {
  const [animationState, setAnimationState] = useState<AnimationState>('idle');

  const exampleUnit: Unit = {
    type: 'TR',
    hp: 3,
    maxHp: 3,
    row: 0,
    col: 0,
    abilities: ['Slash', 'Defend'],
    buffs: [],
    debuffs: [],
  };

  return (
    <div className="p-8 bg-gray-900 rounded-lg">
      <h2 className="text-2xl text-white mb-4">Basic Animated Unit</h2>

      <div className="w-32 h-32 mb-4">
        <AnimatedUnit
          unit={exampleUnit}
          imageUrl={theme.images.trader}
          animationState={animationState}
          showEffects={true}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setAnimationState('idle')}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Idle
        </button>
        <button
          onClick={() => setAnimationState('attacking-slash')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Slash Attack
        </button>
        <button
          onClick={() => setAnimationState('attacking-stab')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Stab Attack
        </button>
        <button
          onClick={() => setAnimationState('hit')}
          className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600"
        >
          Take Hit
        </button>
        <button
          onClick={() => setAnimationState('victory')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Victory
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// COMBAT SIMULATION EXAMPLE
// ============================================================================

export const CombatSimulationExample: React.FC = () => {
  const [attackerState, setAttackerState] = useState<AnimationState>('idle');
  const [defenderState, setDefenderState] = useState<AnimationState>('idle');
  const [defenderHp, setDefenderHp] = useState(3);
  const [damageAmount, setDamageAmount] = useState<number | undefined>();
  const [isCritical, setIsCritical] = useState(false);

  const attacker: Unit = {
    type: 'TR',
    hp: 3,
    maxHp: 3,
    row: 0,
    col: 0,
    abilities: ['Slash'],
    buffs: [],
    debuffs: [],
  };

  const defender: Unit = {
    type: 'TH',
    hp: defenderHp,
    maxHp: 3,
    row: 0,
    col: 5,
    abilities: [],
    buffs: [],
    debuffs: [],
  };

  const simulateAttack = (critical: boolean = false) => {
    setIsCritical(critical);
    setAttackerState('attacking-slash');

    setTimeout(() => {
      const damage = critical ? 2 : 1;
      setDefenderHp((prev) => Math.max(0, prev - damage));
      setDamageAmount(damage);
      setDefenderState('hit');

      setTimeout(() => {
        setAttackerState('idle');
        setDefenderState(defenderHp - damage <= 0 ? 'dying' : 'idle');
        setDamageAmount(undefined);
      }, 300);
    }, 150);
  };

  const resetCombat = () => {
    setDefenderHp(3);
    setAttackerState('idle');
    setDefenderState('idle');
    setDamageAmount(undefined);
  };

  return (
    <div className="p-8 bg-gray-900 rounded-lg">
      <h2 className="text-2xl text-white mb-4">Combat Simulation</h2>

      <div className="flex justify-between items-center mb-4">
        {/* Attacker */}
        <div className="text-center">
          <div className="w-32 h-32 mb-2">
            <AnimatedUnit
              unit={attacker}
              imageUrl={theme.images.trader}
              animationState={attackerState}
              showEffects={true}
            />
          </div>
          <p className="text-white">Attacker</p>
        </div>

        {/* VS */}
        <div className="text-4xl text-white font-bold">⚔️ VS ⚔️</div>

        {/* Defender */}
        <div className="text-center">
          <div className="w-32 h-32 mb-2">
            <AnimatedUnit
              unit={defender}
              imageUrl={theme.images.thief}
              animationState={defenderState}
              showEffects={true}
              damageAmount={damageAmount}
              isCritical={isCritical}
            />
          </div>
          <p className="text-white">
            Defender (HP: {defenderHp}/3)
          </p>
        </div>
      </div>

      <div className="flex gap-2 justify-center">
        <button
          onClick={() => simulateAttack(false)}
          disabled={defenderHp <= 0}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
        >
          Normal Attack
        </button>
        <button
          onClick={() => simulateAttack(true)}
          disabled={defenderHp <= 0}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
        >
          Critical Attack
        </button>
        <button
          onClick={resetCombat}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Reset
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// UNIT TYPES SHOWCASE
// ============================================================================

export const UnitTypesShowcase: React.FC = () => {
  const units = [
    { type: 'TR', name: 'Trader', image: theme.images.trader, hp: 3 },
    { type: 'H', name: 'Hunter', image: theme.images.hunter, hp: 3 },
    { type: 'TH', name: 'Thief', image: theme.images.thief, hp: 2 },
    { type: 'KT', name: 'King Thief', image: theme.images.kingThief, hp: 3 },
  ];

  return (
    <div className="p-8 bg-gray-900 rounded-lg">
      <h2 className="text-2xl text-white mb-4">All Unit Types</h2>

      <div className="grid grid-cols-4 gap-4">
        {units.map((unitData) => {
          const unit: Unit = {
            type: unitData.type,
            hp: unitData.hp,
            maxHp: unitData.hp,
            row: 0,
            col: 0,
            abilities: [],
            buffs: [],
            debuffs: [],
          };

          return (
            <div key={unitData.type} className="text-center">
              <div className="w-24 h-24 mx-auto mb-2 bg-gray-800 rounded-lg p-2">
                <AnimatedUnit
                  unit={unit}
                  imageUrl={unitData.image}
                  animationState="idle"
                  showEffects={true}
                />
              </div>
              <p className="text-white text-sm">{unitData.name}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ============================================================================
// EFFECTS SHOWCASE
// ============================================================================

export const EffectsShowcase: React.FC = () => {
  const [activeEffect, setActiveEffect] = useState<string | null>(null);

  const unit: Unit = {
    type: 'TR',
    hp: 3,
    maxHp: 3,
    row: 0,
    col: 0,
    abilities: [],
    buffs: activeEffect === 'buff' ? [{ type: 'Attack+', duration: 3 }] : [],
    debuffs: activeEffect === 'debuff' ? [{ type: 'Slow', duration: 2 }] : [],
    isImmobilized: activeEffect === 'immobilized',
  };

  return (
    <div className="p-8 bg-gray-900 rounded-lg">
      <h2 className="text-2xl text-white mb-4">Status Effects</h2>

      <div className="w-32 h-32 mx-auto mb-4">
        <AnimatedUnit
          unit={unit}
          imageUrl={theme.images.trader}
          animationState="idle"
          showEffects={true}
          collectingSilk={activeEffect === 'silk'}
          nearGold={activeEffect === 'gold'}
        />
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => setActiveEffect('buff')}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Show Buff
        </button>
        <button
          onClick={() => setActiveEffect('debuff')}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Show Debuff
        </button>
        <button
          onClick={() => setActiveEffect('immobilized')}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
        >
          Immobilized
        </button>
        <button
          onClick={() => setActiveEffect('silk')}
          className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600"
        >
          Collect Silk
        </button>
        <button
          onClick={() => setActiveEffect('gold')}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Near Gold
        </button>
        <button
          onClick={() => setActiveEffect(null)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Clear
        </button>
      </div>
    </div>
  );
};

// ============================================================================
// INTEGRATION WITH GAME BOARD
// ============================================================================

/**
 * Example of how to integrate AnimatedUnit into the existing GameBoard
 */
export const GameBoardIntegrationExample = `
// In your GameBoard.tsx, replace static images with AnimatedUnit:

import { AnimatedUnit } from './AnimatedUnit';
import { AnimationState } from './AnimatedUnit';

// Add state for tracking animations
const [unitAnimations, setUnitAnimations] = useState<Record<string, AnimationState>>({});
const [selectedPosition, setSelectedPosition] = useState<{row: number, col: number} | null>(null);

// In your cell rendering:
{cell.includes('TR') || cell.includes('H') || cell.includes('TH') || cell.includes('KT') ? (
  <AnimatedUnit
    unit={{
      type: cell.includes('TR') ? 'TR' :
            cell.includes('H') ? 'H' :
            cell.includes('TH') ? 'TH' : 'KT',
      hp: displayHp,
      maxHp: maxHp,
      row: rowIndex,
      col: colIndex,
      abilities: [],
      buffs: [],
      debuffs: [],
    }}
    imageUrl={imageSrc}
    animationState={unitAnimations[\`\${rowIndex}-\${colIndex}\`] || 'idle'}
    isSelected={selectedPosition?.row === rowIndex && selectedPosition?.col === colIndex}
    showEffects={true}
    onAnimationComplete={(state) => {
      // Reset to idle after animation completes
      if (state === 'idle') {
        setUnitAnimations(prev => ({
          ...prev,
          [\`\${rowIndex}-\${colIndex}\`]: 'idle'
        }));
      }
    }}
  />
) : null}

// When an attack happens:
const handleAttack = (attackerPos, defenderPos, damage, isCritical) => {
  // Trigger attack animation
  setUnitAnimations(prev => ({
    ...prev,
    [\`\${attackerPos.row}-\${attackerPos.col}\`]: 'attacking-slash'
  }));

  // After a delay, trigger hit animation on defender
  setTimeout(() => {
    setUnitAnimations(prev => ({
      ...prev,
      [\`\${defenderPos.row}-\${defenderPos.col}\`]: 'hit'
    }));
  }, 150);
};

// When collecting silk:
const handleSilkCollection = (unitPos) => {
  // Show silk collection effect
  setUnitAnimations(prev => ({
    ...prev,
    [\`\${unitPos.row}-\${unitPos.col}\`]: 'victory'
  }));
};
`;

// ============================================================================
// COMPLETE DEMO COMPONENT
// ============================================================================

export const AnimatedUnitDemoPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-black p-8 space-y-8">
      <h1 className="text-4xl text-white font-bold text-center mb-8">
        ⚔️ Silkroad Fights - Animation System Demo ⚔️
      </h1>

      <BasicAnimatedUnitExample />
      <CombatSimulationExample />
      <UnitTypesShowcase />
      <EffectsShowcase />

      <div className="p-8 bg-gray-900 rounded-lg">
        <h2 className="text-2xl text-white mb-4">Integration Guide</h2>
        <pre className="bg-gray-800 p-4 rounded text-white text-xs overflow-x-auto">
          {GameBoardIntegrationExample}
        </pre>
      </div>
    </div>
  );
};

export default AnimatedUnitDemoPage;
