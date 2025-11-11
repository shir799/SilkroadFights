/**
 * Tutorial System Integration Example
 *
 * This file demonstrates how to integrate the tutorial system
 * into your Silkroad Fights game components.
 */

"use client"

import React, { useState } from 'react'
import TutorialSystem from './TutorialSystem'
import QuickTips from './QuickTips'

// Example: Integrate into your main game component
export default function GameWithTutorial() {
  const [gameState, setGameState] = useState({
    board: Array(10).fill(null).map(() => Array(10).fill('EMPTY')),
    traderUnits: [
      { type: 'TRADER_WARRIOR', hp: 100, maxHp: 100, row: 0, col: 0, hasGold: false, abilities: [], buffs: [], debuffs: [] }
    ],
    thiefUnits: [
      { type: 'THIEF_SCOUT', hp: 60, maxHp: 60, row: 9, col: 9, hasGold: false, abilities: [], buffs: [], debuffs: [] }
    ],
    bossMonsters: [],
    silkCountTrader: 100,
    silkCountThief: 100,
    goldDelivered: 0,
    roundNumber: 1,
    currentPlayer: 'TRADER' as const,
    selectedUnit: null,
    lastUsedAbility: null,
    traderWins: 0,
    thiefWins: 0,
    nextSilkSpawn: 30,
    nextBossSpawn: 120,
    combatResult: null,
    traps: [],
    buffs: { TRADER: [], THIEF: [] },
    droppedGold: [],
    isTraderPlayer: true,
  });

  // Tutorial completion handler
  const handleTutorialComplete = () => {
    console.log('Tutorial completed! User earned rewards.');
    // Add silk reward, unlock features, etc.
    setGameState(prev => ({
      ...prev,
      silkCountTrader: prev.silkCountTrader + 100,
    }));
  };

  // Tutorial skip handler
  const handleTutorialSkip = () => {
    console.log('Tutorial skipped by user.');
  };

  return (
    <div className="relative w-full h-screen">
      {/* Your game components */}
      <div className="game-container">
        {/* Game board with data-tutorial attributes for highlighting */}
        <div data-tutorial="game-board" className="board">
          {/* Board content */}
        </div>

        {/* Units area */}
        <div data-tutorial="your-units" className="units">
          {/* Your units */}
        </div>

        {/* Enemy units */}
        <div data-tutorial="enemy-units" className="enemy-units">
          {/* Enemy units */}
        </div>

        {/* Ability bar */}
        <div data-tutorial="ability-bar" className="abilities">
          {/* Abilities */}
        </div>

        {/* Gold display */}
        <div data-tutorial="gold-display" className="gold-count">
          Gold: {gameState.goldDelivered}
        </div>

        {/* Silk display */}
        <div data-tutorial="silk-display" className="silk-count">
          Silk: {gameState.silkCountTrader}
        </div>

        {/* Victory conditions */}
        <div data-tutorial="victory-conditions" className="victory">
          {/* Victory progress */}
        </div>

        {/* Trader base */}
        <div data-tutorial="trader-base" className="base">
          {/* Base area */}
        </div>
      </div>

      {/* Tutorial System - Add this to your root game component */}
      <TutorialSystem
        gameState={gameState}
        isVisible={true}
        onComplete={handleTutorialComplete}
        onSkip={handleTutorialSkip}
        autoStart={true} // Auto-show welcome screen for new players
      />

      {/* Quick Tips - Add this for contextual hints */}
      <QuickTips
        gameState={gameState}
        position="bottom-right"
        autoHideDuration={8000}
        maxTipsShown={1}
      />
    </div>
  );
}

/**
 * INTEGRATION CHECKLIST:
 *
 * 1. Add data-tutorial attributes to key UI elements:
 *    - data-tutorial="game-board" - Main game board
 *    - data-tutorial="your-units" - Player's units
 *    - data-tutorial="enemy-units" - Enemy units
 *    - data-tutorial="ability-bar" - Ability buttons
 *    - data-tutorial="gold-display" - Gold counter
 *    - data-tutorial="silk-display" - Silk counter
 *    - data-tutorial="victory-conditions" - Victory progress
 *    - data-tutorial="trader-base" - Trader base location
 *
 * 2. Pass current gameState to TutorialSystem and QuickTips
 *
 * 3. Handle tutorial completion (award silk, unlock features)
 *
 * 4. Import TutorialSystem in your main game component:
 *    import TutorialSystem from '@/components/TutorialSystem'
 *    import QuickTips from '@/components/QuickTips'
 *
 * 5. The tutorial system will:
 *    - Auto-show welcome screen for new players
 *    - Save progress to localStorage
 *    - Show floating tutorial button for easy access
 *    - Display contextual tips based on game state
 *
 * 6. Customize tutorial steps in TutorialSteps.ts if needed
 *
 * 7. Add custom tips in QuickTips.tsx TIPS_DATABASE
 */

/**
 * EXAMPLE: Add to your main page.tsx or game screen component
 */
/*
"use client"

import { useState } from 'react'
import TutorialSystem from '@/components/TutorialSystem'
import QuickTips from '@/components/QuickTips'
import GameBoard from '@/components/GameBoard'
import GameHUD from '@/components/GameHUD'

export default function GamePage() {
  const [gameState, setGameState] = useState(initialGameState)

  return (
    <div className="relative">
      <GameHUD {...gameState} />
      <GameBoard gameState={gameState} />

      // Add these two lines:
      <TutorialSystem gameState={gameState} autoStart={true} />
      <QuickTips gameState={gameState} />
    </div>
  )
}
*/

/**
 * ADVANCED: Custom tutorial step completion checking
 *
 * You can add custom completion logic in TutorialSteps.ts:
 */
/*
{
  id: 'custom-step',
  title: 'Complete Your Action',
  description: 'Do something specific',
  requiresAction: true,
  checkCompletion: (gameState) => {
    // Your custom logic here
    return gameState.someCondition === true;
  },
  // ... other properties
}
*/
