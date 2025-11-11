"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen,
  Play,
  RotateCcw,
  Award,
  Trophy,
  Star,
  Sparkles,
  X,
} from 'lucide-react'
import TutorialOverlay from './TutorialOverlay'
import {
  TUTORIAL_STEPS,
  TutorialProgress,
  DEFAULT_TUTORIAL_PROGRESS,
  TUTORIAL_REWARDS,
  getTutorialStepById,
  getNextStep,
  getPreviousStep,
} from './TutorialSteps'
import { theme } from '../lib/theme'

interface TutorialSystemProps {
  gameState?: any;
  isVisible?: boolean;
  onComplete?: () => void;
  onSkip?: () => void;
  autoStart?: boolean;
}

const STORAGE_KEY = 'silkroad_tutorial_progress';

const TutorialSystem: React.FC<TutorialSystemProps> = ({
  gameState,
  isVisible = true,
  onComplete,
  onSkip,
  autoStart = false,
}) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progress, setProgress] = useState<TutorialProgress>(DEFAULT_TUTORIAL_PROGRESS);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  // Load progress from localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem(STORAGE_KEY);
    if (savedProgress) {
      try {
        const parsed = JSON.parse(savedProgress);
        setProgress(parsed);
        setCurrentStepIndex(parsed.currentStepIndex);

        // Hide floating button if tutorial is completed
        if (parsed.completed || parsed.skipped) {
          setShowFloatingButton(false);
        }
      } catch (error) {
        console.error('Failed to load tutorial progress:', error);
      }
    } else if (autoStart && !progress.completed && !progress.skipped) {
      // Auto-start tutorial for first-time players
      setTimeout(() => {
        setShowWelcome(true);
      }, 1000);
    }
  }, [autoStart]);

  // Save progress to localStorage
  const saveProgress = useCallback((newProgress: TutorialProgress) => {
    setProgress(newProgress);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
  }, []);

  // Start tutorial
  const startTutorial = useCallback(() => {
    setIsActive(true);
    setShowWelcome(false);
    setCurrentStepIndex(0);
    saveProgress({
      ...progress,
      currentStepIndex: 0,
      completedSteps: [],
    });
  }, [progress, saveProgress]);

  // Resume tutorial
  const resumeTutorial = useCallback(() => {
    setIsActive(true);
    setShowWelcome(false);
  }, []);

  // Restart tutorial
  const restartTutorial = useCallback(() => {
    setCurrentStepIndex(0);
    saveProgress({
      ...DEFAULT_TUTORIAL_PROGRESS,
      currentStepIndex: 0,
    });
    setIsActive(true);
    setShowWelcome(false);
  }, [saveProgress]);

  // Next step
  const handleNext = useCallback(() => {
    const currentStep = TUTORIAL_STEPS[currentStepIndex];

    // Mark current step as completed
    const newCompletedSteps = [...progress.completedSteps];
    if (!newCompletedSteps.includes(currentStep.id)) {
      newCompletedSteps.push(currentStep.id);
    }

    // Check if this is the last step
    if (currentStepIndex >= TUTORIAL_STEPS.length - 1) {
      // Tutorial completed!
      saveProgress({
        ...progress,
        currentStepIndex: currentStepIndex,
        completedSteps: newCompletedSteps,
        completed: true,
      });
      setIsActive(false);
      setShowCompletion(true);
      setShowFloatingButton(false);
      onComplete?.();
    } else {
      // Move to next step
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      saveProgress({
        ...progress,
        currentStepIndex: nextIndex,
        completedSteps: newCompletedSteps,
      });
    }
  }, [currentStepIndex, progress, saveProgress, onComplete]);

  // Previous step
  const handlePrevious = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      saveProgress({
        ...progress,
        currentStepIndex: prevIndex,
      });
    }
  }, [currentStepIndex, progress, saveProgress]);

  // Skip tutorial
  const handleSkip = useCallback(() => {
    saveProgress({
      ...progress,
      skipped: true,
      completed: false,
    });
    setIsActive(false);
    setShowWelcome(false);
    setShowFloatingButton(false);
    onSkip?.();
  }, [progress, saveProgress, onSkip]);

  // Close tutorial
  const handleClose = useCallback(() => {
    setIsActive(false);
    setShowFloatingButton(true);
  }, []);

  const currentStep = TUTORIAL_STEPS[currentStepIndex];

  if (!isVisible) return null;

  return (
    <>
      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && !isActive && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative max-w-2xl mx-4 p-8 rounded-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.98), rgba(50, 30, 30, 0.98))',
                border: '3px solid #FFD700',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(255, 215, 0, 0.3)',
              }}
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 10 }}
              transition={{ type: 'spring', stiffness: 200 }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowWelcome(false)}
                className="absolute top-4 right-4 p-2 rounded-full hover:bg-white hover:bg-opacity-10 transition-colors"
              >
                <X className="w-6 h-6 text-gray-400 hover:text-white" />
              </button>

              {/* Header */}
              <motion.div
                className="text-center mb-6"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="text-7xl mb-4"
                  animate={{
                    rotate: [0, -10, 10, -10, 10, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                  }}
                >
                  🏺
                </motion.div>
                <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2">
                  Welcome to Silkroad Fights!
                </h1>
                <p className="text-xl text-gray-300">
                  Embark on an epic journey through ancient trade routes
                </p>
              </motion.div>

              {/* Description */}
              <motion.div
                className="text-center mb-8 space-y-4"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <p className="text-lg text-gray-200 leading-relaxed">
                  Master Chen, the wise merchant, will guide you through the basics
                  of trading, combat, and strategy. Learn to command your forces,
                  collect precious gold and silk, and defeat legendary bosses!
                </p>

                <div
                  className="flex items-center gap-3 p-4 rounded-lg mx-auto max-w-md"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 140, 0, 0.2))',
                    border: '2px solid #FFD700',
                  }}
                >
                  <Sparkles className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                  <div className="text-sm text-yellow-200 text-left">
                    <div className="font-bold mb-1">Tutorial Rewards:</div>
                    <div>+{TUTORIAL_REWARDS.silk} Silk • {TUTORIAL_REWARDS.achievement}</div>
                  </div>
                </div>
              </motion.div>

              {/* Stats */}
              <motion.div
                className="grid grid-cols-3 gap-4 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                  <div className="text-3xl font-bold text-yellow-400">{TUTORIAL_STEPS.length}</div>
                  <div className="text-sm text-gray-400">Steps</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                  <div className="text-3xl font-bold text-yellow-400">~10</div>
                  <div className="text-sm text-gray-400">Minutes</div>
                </div>
                <div className="text-center p-3 rounded-lg" style={{ background: 'rgba(255, 215, 0, 0.1)' }}>
                  <div className="text-3xl font-bold text-yellow-400">100%</div>
                  <div className="text-sm text-gray-400">Fun</div>
                </div>
              </motion.div>

              {/* Buttons */}
              <motion.div
                className="flex flex-col gap-3"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {progress.currentStepIndex > 0 && !progress.completed ? (
                  <button
                    onClick={resumeTutorial}
                    className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                    style={{
                      background: 'linear-gradient(135deg, #4169E1, #1E3A8A)',
                      border: '2px solid #FFD700',
                      color: 'white',
                      boxShadow: '0 8px 25px rgba(65, 105, 225, 0.4)',
                    }}
                  >
                    <Play className="w-6 h-6" />
                    Resume Tutorial (Step {progress.currentStepIndex + 1})
                  </button>
                ) : null}

                <button
                  onClick={startTutorial}
                  className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                  style={{
                    background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                    border: '2px solid #FFFFFF',
                    color: '#1A0F0F',
                    boxShadow: '0 8px 25px rgba(255, 215, 0, 0.5)',
                  }}
                >
                  <BookOpen className="w-6 h-6" />
                  {progress.currentStepIndex > 0 && !progress.completed ? 'Start Over' : 'Start Tutorial'}
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full px-8 py-3 rounded-xl font-semibold text-gray-400 hover:text-white hover:bg-white hover:bg-opacity-5 transition-all"
                >
                  Skip Tutorial (Not Recommended)
                </button>
              </motion.div>

              {/* Decorative elements */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: '#FFD700',
                    left: `${10 + i * 12}%`,
                    top: i % 2 === 0 ? '5%' : '95%',
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0.3, 1, 0.3],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.2,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <AnimatePresence>
        {isActive && currentStep && (
          <TutorialOverlay
            step={currentStep}
            stepNumber={currentStepIndex + 1}
            totalSteps={TUTORIAL_STEPS.length}
            onNext={handleNext}
            onPrevious={handlePrevious}
            onSkip={handleSkip}
            onClose={handleClose}
            gameState={gameState}
          />
        )}
      </AnimatePresence>

      {/* Completion Modal */}
      <AnimatePresence>
        {showCompletion && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative max-w-2xl mx-4 p-8 rounded-3xl text-center"
              style={{
                background: 'linear-gradient(135deg, rgba(26, 15, 15, 0.98), rgba(50, 30, 30, 0.98))',
                border: '3px solid #FFD700',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.9), 0 0 60px rgba(255, 215, 0, 0.5)',
              }}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 150 }}
            >
              {/* Trophy animation */}
              <motion.div
                className="text-8xl mb-6"
                animate={{
                  rotate: [0, -15, 15, -15, 15, 0],
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
              >
                🏆
              </motion.div>

              <motion.h1
                className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-yellow-400 mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                Tutorial Complete!
              </motion.h1>

              <motion.p
                className="text-xl text-gray-300 mb-8"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                You are now a certified Silkroad master!
              </motion.p>

              {/* Rewards */}
              <motion.div
                className="grid grid-cols-3 gap-4 mb-8"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7, type: 'spring' }}
              >
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.2))',
                    border: '2px solid #FFD700',
                  }}
                >
                  <Star className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-white">+{TUTORIAL_REWARDS.silk}</div>
                  <div className="text-sm text-gray-400">Silk</div>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.2))',
                    border: '2px solid #FFD700',
                  }}
                >
                  <Award className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">{TUTORIAL_REWARDS.achievement}</div>
                  <div className="text-sm text-gray-400">Achievement</div>
                </div>
                <div
                  className="p-4 rounded-lg"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255, 215, 0, 0.3), rgba(255, 140, 0, 0.2))',
                    border: '2px solid #FFD700',
                  }}
                >
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <div className="text-lg font-bold text-white">All Features</div>
                  <div className="text-sm text-gray-400">Unlocked</div>
                </div>
              </motion.div>

              <motion.button
                onClick={() => setShowCompletion(false)}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #FFD700, #FFA500)',
                  border: '2px solid #FFFFFF',
                  color: '#1A0F0F',
                  boxShadow: '0 8px 25px rgba(255, 215, 0, 0.5)',
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.9 }}
              >
                Start Playing!
              </motion.button>

              {/* Fireworks */}
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 rounded-full"
                  style={{
                    background: ['#FFD700', '#FFA500', '#FF4500'][i % 3],
                    left: '50%',
                    top: '50%',
                  }}
                  animate={{
                    x: [0, (Math.random() - 0.5) * 600],
                    y: [0, (Math.random() - 0.5) * 600],
                    opacity: [1, 0],
                    scale: [1, 0],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 1,
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Tutorial Button */}
      <AnimatePresence>
        {showFloatingButton && !isActive && !showWelcome && !showCompletion && (
          <motion.button
            onClick={() => setShowWelcome(true)}
            className="fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-40"
            style={{
              background: 'linear-gradient(135deg, #FFD700, #FFA500)',
              border: '3px solid #FFFFFF',
              boxShadow: '0 8px 25px rgba(255, 215, 0, 0.6)',
            }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 200 }}
          >
            <motion.div
              animate={{
                rotate: [0, -10, 10, -10, 10, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              <BookOpen className="w-6 h-6 text-gray-900" />
            </motion.div>

            {/* Notification badge for incomplete tutorial */}
            {!progress.completed && !progress.skipped && progress.currentStepIndex > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-xs font-bold text-white"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                !
              </motion.div>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* Replay button (after completion) */}
      <AnimatePresence>
        {progress.completed && !isActive && !showWelcome && !showCompletion && (
          <motion.button
            onClick={restartTutorial}
            className="fixed bottom-6 left-6 flex items-center gap-2 px-4 py-3 rounded-full shadow-2xl z-40"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 69, 19, 0.95), rgba(101, 67, 33, 0.95))',
              border: '2px solid #D4AF37',
              color: 'white',
            }}
            initial={{ scale: 0, x: -50 }}
            animate={{ scale: 1, x: 0 }}
            exit={{ scale: 0, x: -50 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw className="w-5 h-5" />
            <span className="text-sm font-semibold">Replay Tutorial</span>
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
};

export default TutorialSystem;
