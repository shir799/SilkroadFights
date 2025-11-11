'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../lib/theme';

interface DefeatScreenProps {
  isVisible: boolean;
  playerRole: 'TRADER' | 'THIEF';
  stats: {
    goldCollected?: number;
    unitsDefeated?: number;
    bossesDefeated?: number;
    silkCollected?: number;
    roundsPlayed: number;
    timeElapsed?: string;
    defeatReason?: string;
  };
  tips?: string[];
  onTryAgain: () => void;
  onMainMenu: () => void;
}

const DefeatScreen: React.FC<DefeatScreenProps> = ({
  isVisible,
  playerRole,
  stats,
  tips = [
    'Balance offense and defense for better survivability',
    'Bosses have predictable patterns - learn them!',
    'Sometimes retreating is the best strategy',
    'Upgrade your units before facing tough opponents',
  ],
  onTryAgain,
  onMainMenu,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [embers, setEmbers] = useState<Array<{ x: number; y: number; delay: number; duration: number }>>([]);

  const roleColor = playerRole === 'TRADER' ? '#FFA500' : '#FF6B6B';
  const defeatTitle = playerRole === 'TRADER'
    ? 'The Journey Ends...'
    : 'The Shadows Fade...';
  const encouragement = [
    'Every defeat is a lesson learned',
    'The road to fortune is paved with perseverance',
    'Rise again, champion of the Silk Road',
    'Your legend is still being written',
  ];

  useEffect(() => {
    if (!isVisible) return;

    // Create ember particles
    const newEmbers = [];
    for (let i = 0; i < 40; i++) {
      newEmbers.push({
        x: Math.random() * 100,
        y: 100 + Math.random() * 20,
        delay: Math.random() * 3,
        duration: 3 + Math.random() * 3,
      });
    }
    setEmbers(newEmbers);

    // Show stats and tips with delay
    const statsTimer = setTimeout(() => setShowStats(true), 2000);
    const tipTimer = setTimeout(() => {
      setCurrentTipIndex(Math.floor(Math.random() * tips.length));
      setShowTip(true);
    }, 3500);

    return () => {
      clearTimeout(statsTimer);
      clearTimeout(tipTimer);
    };
  }, [isVisible, tips.length]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
      style={{
        background: 'radial-gradient(circle at center, rgba(40, 20, 20, 0.9) 0%, rgba(10, 5, 5, 0.98) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Falling embers */}
      {embers.map((ember, i) => (
        <motion.div
          key={i}
          initial={{
            left: `${ember.x}%`,
            top: `${ember.y}%`,
            opacity: 0,
            scale: 0,
          }}
          animate={{
            top: '-10%',
            opacity: [0, 0.8, 0.4, 0],
            scale: [0, 1, 0.5, 0],
            x: [0, (Math.random() - 0.5) * 50, (Math.random() - 0.5) * 100],
          }}
          transition={{
            delay: ember.delay,
            duration: ember.duration,
            repeat: Infinity,
            ease: 'easeOut',
          }}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            backgroundColor: '#FF6B35',
            boxShadow: '0 0 10px #FF6B35, 0 0 20px #FF4500',
          }}
        />
      ))}

      {/* Dark vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, 0.7) 100%)',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-8 text-center">
        {/* Defeat Banner */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 100, damping: 15 }}
          className="mb-8"
        >
          {/* Cracked shield or broken sword icon */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring', bounce: 0.3 }}
            className="mb-6 inline-block"
          >
            <div
              className="text-8xl opacity-70"
              style={{
                filter: 'drop-shadow(0 0 20px rgba(100, 30, 30, 0.8))',
              }}
            >
              {playerRole === 'TRADER' ? '💔' : '⚔️'}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="text-7xl font-bold mb-4"
            style={{
              color: '#CC6666',
              textShadow: '0 0 40px rgba(200, 100, 100, 0.5)',
            }}
          >
            DEFEAT
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-3xl font-semibold text-gray-300 mb-4"
          >
            {defeatTitle}
          </motion.p>

          {stats.defeatReason && (
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
              className="text-lg text-gray-400 italic"
            >
              {stats.defeatReason}
            </motion.p>
          )}
        </motion.div>

        {/* Encouragement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.8, duration: 0.8 }}
          className="mb-8"
        >
          <motion.p
            className="text-2xl font-semibold text-amber-400"
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              ease: 'easeInOut',
            }}
          >
            {encouragement[Math.floor(Math.random() * encouragement.length)]}
          </motion.p>
        </motion.div>

        {/* Stats Section */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              transition={{ duration: 0.8 }}
              className="mb-8 backdrop-blur-md bg-black/40 rounded-2xl p-8 border-2 border-gray-600/30"
            >
              <h2 className="text-2xl font-bold text-gray-300 mb-6">Your Performance</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {stats.goldCollected !== undefined && (
                  <StatItem
                    label="Gold Collected"
                    value={stats.goldCollected}
                    icon="💰"
                    delay={0}
                  />
                )}
                {stats.unitsDefeated !== undefined && (
                  <StatItem
                    label="Units Defeated"
                    value={stats.unitsDefeated}
                    icon="⚔️"
                    delay={0.1}
                  />
                )}
                {stats.bossesDefeated !== undefined && (
                  <StatItem
                    label="Bosses Defeated"
                    value={stats.bossesDefeated}
                    icon="🐉"
                    delay={0.2}
                  />
                )}
                {stats.silkCollected !== undefined && (
                  <StatItem
                    label="Silk Collected"
                    value={stats.silkCollected}
                    icon="🧵"
                    delay={0.3}
                  />
                )}
                <StatItem
                  label="Rounds Survived"
                  value={stats.roundsPlayed}
                  icon="🛡️"
                  delay={0.4}
                />
                {stats.timeElapsed && (
                  <StatItem
                    label="Time"
                    value={stats.timeElapsed}
                    icon="⏱️"
                    delay={0.5}
                    isString
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tip Section */}
        <AnimatePresence>
          {showTip && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.6 }}
              className="mb-8 backdrop-blur-md bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-2xl p-6 border-2 border-blue-500/30"
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">💡</div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-blue-300 mb-2">Strategy Tip</h3>
                  <p className="text-lg text-gray-300">{tips[currentTipIndex]}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4 }}
          className="flex justify-center gap-6"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              boxShadow: '0 0 30px rgba(255, 165, 0, 0.6)',
            }}
            whileTap={{ scale: 0.95 }}
            onClick={onTryAgain}
            className="px-10 py-4 rounded-xl text-xl font-bold text-white relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #FFA500 0%, #FF8C00 100%)',
              boxShadow: '0 10px 30px rgba(255, 165, 0, 0.3)',
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{
                repeat: Infinity,
                duration: 2,
                ease: 'linear',
              }}
              style={{ opacity: 0.2 }}
            />
            <span className="relative z-10 flex items-center gap-2">
              <span>Try Again</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              >
                →
              </motion.span>
            </span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMainMenu}
            className="px-10 py-4 rounded-xl text-xl font-bold text-gray-300 border-2 border-gray-600/50 bg-black/50 hover:bg-gray-800/50 transition-colors"
          >
            Main Menu
          </motion.button>
        </motion.div>

        {/* Motivational Quotes Rotation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 5 }}
          className="mt-8"
        >
          <motion.p
            animate={{
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              repeat: Infinity,
              duration: 4,
              ease: 'easeInOut',
            }}
            className="text-sm text-gray-500 italic"
          >
            "The greatest glory in living lies not in never falling, but in rising every time we fall."
          </motion.p>
        </motion.div>
      </div>

      {/* Subtle glow effects */}
      <motion.div
        animate={{
          opacity: [0.1, 0.3, 0.1],
          scale: [1, 1.2, 1],
        }}
        transition={{
          repeat: Infinity,
          duration: 5,
          ease: 'easeInOut',
        }}
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(139, 69, 19, 0.3) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
    </motion.div>
  );
};

// Stat Item Component
const StatItem: React.FC<{
  label: string;
  value: number | string;
  icon: string;
  delay: number;
  isString?: boolean;
}> = ({ label, value, icon, delay, isString = false }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="text-center"
  >
    <div className="text-3xl mb-2 opacity-70">{icon}</div>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: delay + 0.2, type: 'spring', bounce: 0.3 }}
      className="text-2xl font-bold text-gray-300 mb-1"
    >
      {isString ? value : (
        <motion.span>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </motion.span>
      )}
    </motion.div>
    <p className="text-sm text-gray-400">{label}</p>
  </motion.div>
);

export default DefeatScreen;
