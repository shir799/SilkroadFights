'use client';

/**
 * GameFlowExample.tsx
 *
 * Complete example showing how to integrate all intro & polish components
 * into a cohesive game flow with proper state management and transitions.
 */

import React, { useState, useEffect } from 'react';
import SilkroadIntro from './SilkroadIntro';
import MainMenu from './MainMenu';
import LoadingScreen from './LoadingScreen';
import VictoryScreen from './VictoryScreen';
import DefeatScreen from './DefeatScreen';
import { TransitionEffects } from './TransitionEffects';

// Game state types
type GameState = 'intro' | 'loading' | 'menu' | 'playing' | 'victory' | 'defeat';
type TransitionType = 'fade' | 'wipe' | 'dissolve' | 'silk_curtain' | 'sand_storm' | 'phase_shift';

interface GameFlowState {
  currentState: GameState;
  previousState: GameState | null;
  isTransitioning: boolean;
  transitionType: TransitionType;
  loadingProgress: number;
  loadingMessage: string;
}

interface PlayerData {
  name: string;
  level: number;
  experience: number;
  rank: string;
}

interface GameStats {
  goldCollected: number;
  unitsDefeated: number;
  bossesDefeated: number;
  silkCollected: number;
  roundsPlayed: number;
  timeElapsed: string;
  defeatReason?: string;
}

const GameFlowExample: React.FC = () => {
  // State management
  const [flowState, setFlowState] = useState<GameFlowState>({
    currentState: 'intro',
    previousState: null,
    isTransitioning: false,
    transitionType: 'fade',
    loadingProgress: 0,
    loadingMessage: 'Initializing...',
  });

  const [playerData, setPlayerData] = useState<PlayerData>({
    name: 'Desert Wanderer',
    level: 5,
    experience: 65,
    rank: 'Apprentice Trader',
  });

  const [gameStats, setGameStats] = useState<GameStats>({
    goldCollected: 0,
    unitsDefeated: 0,
    bossesDefeated: 0,
    silkCollected: 0,
    roundsPlayed: 0,
    timeElapsed: '00:00',
  });

  // Check if intro has been seen
  useEffect(() => {
    const hasSeenIntro = localStorage.getItem('silkroad_intro_seen');
    if (hasSeenIntro === 'true') {
      setFlowState(prev => ({ ...prev, currentState: 'menu' }));
    }
  }, []);

  // Transition helper function
  const transitionTo = (
    newState: GameState,
    transitionType: TransitionType = 'fade',
    duration: number = 1000
  ) => {
    setFlowState(prev => ({
      ...prev,
      previousState: prev.currentState,
      isTransitioning: true,
      transitionType,
    }));

    setTimeout(() => {
      setFlowState(prev => ({
        ...prev,
        currentState: newState,
        isTransitioning: false,
      }));
    }, duration);
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleIntroComplete = () => {
    localStorage.setItem('silkroad_intro_seen', 'true');
    transitionTo('menu', 'silk_curtain', 1500);
  };

  const handleSkipIntro = () => {
    localStorage.setItem('silkroad_intro_seen', 'true');
    transitionTo('menu', 'fade', 500);
  };

  const handleStartGame = () => {
    // Start loading with progress simulation
    setFlowState(prev => ({
      ...prev,
      currentState: 'loading',
      loadingProgress: 0,
      loadingMessage: 'Loading game world...',
    }));

    // Simulate loading progress
    const messages = [
      'Loading game world...',
      'Spawning units...',
      'Preparing battlefield...',
      'Almost ready...',
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      const messageIndex = Math.floor((progress / 100) * messages.length);

      setFlowState(prev => ({
        ...prev,
        loadingProgress: Math.min(progress, 100),
        loadingMessage: messages[Math.min(messageIndex, messages.length - 1)],
      }));

      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          transitionTo('playing', 'phase_shift', 1000);
          // Reset game stats
          setGameStats({
            goldCollected: 0,
            unitsDefeated: 0,
            bossesDefeated: 0,
            silkCollected: 0,
            roundsPlayed: 0,
            timeElapsed: '00:00',
          });
        }, 500);
      }
    }, 100);
  };

  const handleGameVictory = (finalStats: GameStats) => {
    setGameStats(finalStats);
    transitionTo('victory', 'dissolve', 1500);

    // Update player data (simulate level up, XP gain)
    setPlayerData(prev => ({
      ...prev,
      experience: Math.min(prev.experience + 20, 100),
      level: prev.experience + 20 >= 100 ? prev.level + 1 : prev.level,
    }));
  };

  const handleGameDefeat = (finalStats: GameStats) => {
    setGameStats(finalStats);
    transitionTo('defeat', 'sand_storm', 1500);
  };

  const handlePlayAgain = () => {
    handleStartGame();
  };

  const handleBackToMenu = () => {
    transitionTo('menu', 'silk_curtain', 1500);
  };

  const handleResetIntro = () => {
    localStorage.removeItem('silkroad_intro_seen');
    transitionTo('intro', 'fade', 1000);
  };

  // ============================================================================
  // DEMO CONTROLS (Remove in production)
  // ============================================================================

  const DemoControls = () => (
    <div className="fixed bottom-4 right-4 z-[100] bg-black/80 backdrop-blur-md rounded-lg p-4 border-2 border-amber-600/50">
      <h3 className="text-amber-300 font-bold mb-2 text-sm">Demo Controls</h3>
      <div className="flex flex-col gap-2 text-xs">
        <button
          onClick={() => transitionTo('intro', 'fade')}
          className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded"
        >
          Show Intro
        </button>
        <button
          onClick={() => transitionTo('menu', 'fade')}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Go to Menu
        </button>
        <button
          onClick={handleStartGame}
          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded"
        >
          Start Game
        </button>
        <button
          onClick={() =>
            handleGameVictory({
              goldCollected: 1500,
              unitsDefeated: 25,
              bossesDefeated: 3,
              silkCollected: 50,
              roundsPlayed: 12,
              timeElapsed: '15:30',
            })
          }
          className="px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white rounded"
        >
          Test Victory
        </button>
        <button
          onClick={() =>
            handleGameDefeat({
              goldCollected: 800,
              unitsDefeated: 15,
              bossesDefeated: 1,
              silkCollected: 20,
              roundsPlayed: 8,
              timeElapsed: '10:15',
              defeatReason: 'Overwhelmed by boss monster',
            })
          }
          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded"
        >
          Test Defeat
        </button>
        <button
          onClick={handleResetIntro}
          className="px-3 py-1 bg-gray-600 hover:bg-gray-700 text-white rounded"
        >
          Reset Intro
        </button>
        <div className="mt-2 pt-2 border-t border-amber-600/30">
          <p className="text-amber-200">State: {flowState.currentState}</p>
        </div>
      </div>
    </div>
  );

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="relative w-full h-screen overflow-hidden">
      {/* Cinematic Intro */}
      {flowState.currentState === 'intro' && (
        <SilkroadIntro
          onComplete={handleIntroComplete}
          onSkip={handleSkipIntro}
        />
      )}

      {/* Loading Screen */}
      {flowState.currentState === 'loading' && (
        <LoadingScreen
          progress={flowState.loadingProgress}
          message={flowState.loadingMessage}
          showTips={true}
        />
      )}

      {/* Main Menu */}
      {flowState.currentState === 'menu' && (
        <MainMenu
          onPlay={handleStartGame}
          onProfile={() => console.log('Profile clicked')}
          onCollection={() => console.log('Collection clicked')}
          onSettings={() => console.log('Settings clicked')}
          playerData={playerData}
        />
      )}

      {/* Game Playing State */}
      {flowState.currentState === 'playing' && (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-950 via-slate-900 to-black">
          <div className="text-center text-amber-200">
            <h2 className="text-4xl font-bold mb-4">Game is Playing!</h2>
            <p className="text-xl mb-8">Your game board would be here</p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={() =>
                  handleGameVictory({
                    goldCollected: 1500,
                    unitsDefeated: 25,
                    bossesDefeated: 3,
                    silkCollected: 50,
                    roundsPlayed: 12,
                    timeElapsed: '15:30',
                  })
                }
                className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold"
              >
                Simulate Victory
              </button>
              <button
                onClick={() =>
                  handleGameDefeat({
                    goldCollected: 800,
                    unitsDefeated: 15,
                    bossesDefeated: 1,
                    silkCollected: 20,
                    roundsPlayed: 8,
                    timeElapsed: '10:15',
                    defeatReason: 'Overwhelmed by enemy forces',
                  })
                }
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold"
              >
                Simulate Defeat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Victory Screen */}
      <VictoryScreen
        isVisible={flowState.currentState === 'victory'}
        playerRole="TRADER"
        stats={gameStats}
        rewards={{
          gold: 500,
          experience: 1200,
          unlocks: ['New Unit: Desert Warrior', 'Achievement: First Victory'],
        }}
        onPlayAgain={handlePlayAgain}
        onMainMenu={handleBackToMenu}
      />

      {/* Defeat Screen */}
      <DefeatScreen
        isVisible={flowState.currentState === 'defeat'}
        playerRole="TRADER"
        stats={gameStats}
        tips={[
          'Balance offense and defense for better survivability',
          'Bosses have predictable patterns - learn them!',
          'Sometimes retreating is the best strategy',
          'Upgrade your units before facing tough opponents',
        ]}
        onTryAgain={handlePlayAgain}
        onMainMenu={handleBackToMenu}
      />

      {/* Scene Transitions */}
      <TransitionEffects
        type={flowState.transitionType}
        isActive={flowState.isTransitioning}
        duration={1000}
      />

      {/* Demo Controls (Remove in production) */}
      <DemoControls />
    </div>
  );
};

export default GameFlowExample;
