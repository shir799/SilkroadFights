'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../lib/theme';

interface LoadingScreenProps {
  progress?: number;
  message?: string;
  showTips?: boolean;
}

const LOADING_TIPS = [
  '💡 Traders gain gold faster when protected!',
  '⚔️ Position units strategically on the hexagon grid',
  '🐉 Boss monsters appear every few rounds',
  '🧵 Collect silk to upgrade your forces',
  '🛡️ Defensive formations can turn the tide',
  '💰 Gold is the key to victory',
  '👥 Synergize units for powerful combos',
  '🎯 Target priority: Traders > Units > Bosses',
  '⚡ Abilities can change the battle instantly',
  '🗡️ Thieves excel at ambush tactics',
  '🏹 Ranged units are safer from melee attacks',
  '🔥 Each boss has unique attack patterns',
  '💎 Rare units are worth the investment',
  '🌟 Level up units to unlock new abilities',
  '🎲 Strategy beats luck every time',
];

const FLAVOR_QUOTES = [
  '"The Silk Road awaits..."',
  '"Fortune favors the bold"',
  '"Where traders meet thieves"',
  '"Legends are born on the road"',
  '"Your destiny awaits"',
  '"The sands remember all"',
];

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  progress,
  message,
  showTips = true,
}) => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [particles, setParticles] = useState<Array<{ id: number; x: number; delay: number }>>([]);

  // Rotate tips every 4 seconds
  useEffect(() => {
    if (!showTips) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % LOADING_TIPS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [showTips]);

  // Rotate quotes
  useEffect(() => {
    setCurrentQuoteIndex(Math.floor(Math.random() * FLAVOR_QUOTES.length));
  }, []);

  // Generate floating particles
  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        x: Math.random() * 100,
        delay: Math.random() * 3,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div
      className="fixed inset-0 w-full h-full flex flex-col items-center justify-center overflow-hidden"
      style={{ background: theme.colors.background }}
    >
      {/* Background gradient */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at center, rgba(255, 215, 0, 0.05) 0%, transparent 70%)',
        }}
      />

      {/* Floating particles */}
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.x}%`,
            backgroundColor: theme.colors.gold,
            boxShadow: `0 0 10px ${theme.colors.gold}`,
          }}
          animate={{
            y: ['100vh', '-10vh'],
            opacity: [0, 0.6, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            delay: particle.delay,
            duration: 8,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center max-w-2xl px-8">
        {/* Logo with silk icon rotation */}
        <div className="relative mb-12">
          <motion.img
            src={theme.images.logo}
            alt="Silkroad Auto Chess"
            className="h-48 w-48 object-contain"
            animate={{
              y: [0, -15, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
            style={{
              filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.5))',
            }}
          />

          {/* Rotating silk around logo */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
          >
            {[0, 120, 240].map((angle) => (
              <motion.img
                key={angle}
                src={theme.images.silk}
                alt="silk"
                className="absolute w-12 h-12"
                style={{
                  transform: `rotate(${angle}deg) translateX(100px)`,
                  filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8))',
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2,
                  delay: angle / 360,
                }}
              />
            ))}
          </motion.div>
        </div>

        {/* Progress Bar */}
        <div className="w-96 mb-8">
          <motion.div
            className="relative h-4 bg-gradient-to-r from-amber-900/30 to-amber-950/30 rounded-full overflow-hidden border-2 border-amber-600/30"
            style={{
              boxShadow: 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-500"
              initial={{ width: '0%' }}
              animate={{
                width: progress !== undefined ? `${progress}%` : '100%',
              }}
              transition={
                progress !== undefined
                  ? { duration: 0.5 }
                  : { duration: 2, repeat: Infinity, ease: 'easeInOut' }
              }
              style={{
                boxShadow: '0 0 20px rgba(255, 215, 0, 0.8)',
              }}
            />

            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
            />
          </motion.div>

          {/* Progress percentage */}
          {progress !== undefined && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center text-amber-300 mt-2 text-lg font-semibold"
            >
              {Math.round(progress)}%
            </motion.p>
          )}
        </div>

        {/* Loading message */}
        {message && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xl text-amber-200 mb-8 text-center"
          >
            {message}
          </motion.p>
        )}

        {/* Loading Text */}
        <motion.div
          className="mb-8"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <h2 className="text-3xl font-bold text-amber-300 text-center">
            Loading
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0 }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.2 }}
            >
              .
            </motion.span>
            <motion.span
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.4 }}
            >
              .
            </motion.span>
          </h2>
        </motion.div>

        {/* Flavor Quote */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-amber-400/80 italic mb-12 text-center"
        >
          {FLAVOR_QUOTES[currentQuoteIndex]}
        </motion.p>

        {/* Loading Tips */}
        {showTips && (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTipIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="backdrop-blur-md bg-black/30 rounded-xl p-6 border-2 border-amber-600/20 max-w-xl"
            >
              <div className="flex items-start gap-4">
                <motion.div
                  animate={{
                    rotate: [0, 10, -10, 0],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 2,
                    ease: 'easeInOut',
                  }}
                  className="text-3xl flex-shrink-0"
                >
                  {LOADING_TIPS[currentTipIndex].split(' ')[0]}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-amber-400 mb-1 uppercase tracking-wide">
                    Loading Tip
                  </h3>
                  <p className="text-base text-amber-200/90">
                    {LOADING_TIPS[currentTipIndex].split(' ').slice(1).join(' ')}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        )}

        {/* Tip indicator dots */}
        {showTips && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex gap-2 mt-6"
          >
            {LOADING_TIPS.map((_, index) => (
              <motion.div
                key={index}
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor:
                    index === currentTipIndex
                      ? theme.colors.gold
                      : 'rgba(255, 215, 0, 0.3)',
                }}
                animate={{
                  scale: index === currentTipIndex ? [1, 1.3, 1] : 1,
                }}
                transition={{
                  repeat: index === currentTipIndex ? Infinity : 0,
                  duration: 1,
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom decoration */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <svg width="200" height="40" viewBox="0 0 200 40" xmlns="http://www.w3.org/2000/svg">
          <motion.path
            d="M 10 20 Q 50 10, 100 20 T 190 20"
            stroke={theme.colors.gold}
            strokeWidth="2"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </svg>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;

