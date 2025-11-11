'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../lib/theme';

interface VictoryScreenProps {
  isVisible: boolean;
  playerRole: 'TRADER' | 'THIEF';
  stats: {
    goldCollected?: number;
    unitsDefeated?: number;
    bossesDefeated?: number;
    silkCollected?: number;
    roundsPlayed: number;
    timeElapsed?: string;
  };
  rewards: {
    gold: number;
    experience: number;
    unlocks?: string[];
  };
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

const VictoryScreen: React.FC<VictoryScreenProps> = ({
  isVisible,
  playerRole,
  stats,
  rewards,
  onPlayAgain,
  onMainMenu,
}) => {
  const [showStats, setShowStats] = useState(false);
  const [showRewards, setShowRewards] = useState(false);
  const [confetti, setConfetti] = useState<Particle[]>([]);
  const [fireworks, setFireworks] = useState<Array<{ x: number; y: number; delay: number }>>([]);

  const roleColor = playerRole === 'TRADER' ? '#FFD700' : '#FF6B6B';
  const roleTitle = playerRole === 'TRADER' ? 'Fortune Favors You!' : 'The Shadows Prevail!';

  // Initialize confetti and fireworks
  useEffect(() => {
    if (!isVisible) return;

    // Create confetti particles
    const newConfetti: Particle[] = [];
    for (let i = 0; i < 100; i++) {
      newConfetti.push({
        x: Math.random() * window.innerWidth,
        y: -20,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 5 + 2,
        life: 100,
        color: ['#FFD700', '#FFA500', '#FF6B6B', '#8B4513'][Math.floor(Math.random() * 4)],
        size: Math.random() * 8 + 4,
      });
    }
    setConfetti(newConfetti);

    // Create fireworks
    const newFireworks = [];
    for (let i = 0; i < 8; i++) {
      newFireworks.push({
        x: Math.random() * 80 + 10,
        y: Math.random() * 40 + 10,
        delay: Math.random() * 3,
      });
    }
    setFireworks(newFireworks);

    // Show stats after delay
    const statsTimer = setTimeout(() => setShowStats(true), 2000);
    const rewardsTimer = setTimeout(() => setShowRewards(true), 3500);

    return () => {
      clearTimeout(statsTimer);
      clearTimeout(rewardsTimer);
    };
  }, [isVisible]);

  // Animate confetti
  useEffect(() => {
    if (!isVisible || confetti.length === 0) return;

    const interval = setInterval(() => {
      setConfetti((prevConfetti) =>
        prevConfetti
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.vx,
            y: particle.y + particle.vy,
            vy: particle.vy + 0.2, // gravity
            life: particle.life - 1,
          }))
          .filter((particle) => particle.life > 0 && particle.y < window.innerHeight)
      );
    }, 30);

    return () => clearInterval(interval);
  }, [isVisible, confetti.length]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.7) 0%, rgba(0, 0, 0, 0.95) 100%)',
        backdropFilter: 'blur(10px)',
      }}
    >
      {/* Confetti */}
      {confetti.map((particle, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            left: particle.x,
            top: particle.y,
            width: particle.size,
            height: particle.size,
            backgroundColor: particle.color,
            opacity: particle.life / 100,
            borderRadius: '2px',
            transform: `rotate(${particle.life * 4}deg)`,
          }}
        />
      ))}

      {/* Fireworks */}
      {fireworks.map((firework, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 2, 3],
          }}
          transition={{
            delay: firework.delay,
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 4,
          }}
          className="absolute pointer-events-none"
          style={{
            left: `${firework.x}%`,
            top: `${firework.y}%`,
            width: '100px',
            height: '100px',
          }}
        >
          <div
            className="w-full h-full rounded-full"
            style={{
              border: `3px solid ${roleColor}`,
              boxShadow: `0 0 40px ${roleColor}, inset 0 0 40px ${roleColor}`,
            }}
          />
        </motion.div>
      ))}

      {/* Main Content */}
      <div className="relative z-10 max-w-4xl w-full mx-auto px-8 text-center">
        {/* Victory Banner */}
        <motion.div
          initial={{ y: -100, opacity: 0, scale: 0.5 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', bounce: 0.5, duration: 1 }}
          className="mb-12"
        >
          <motion.h1
            className="text-8xl font-bold mb-4"
            style={{
              background: `linear-gradient(180deg, ${roleColor} 0%, ${playerRole === 'TRADER' ? '#FFA500' : '#CC0000'} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: `0 0 60px ${roleColor}`,
              filter: `drop-shadow(0 10px 40px ${roleColor})`,
            }}
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              repeat: Infinity,
              duration: 2,
              ease: 'easeInOut',
            }}
          >
            VICTORY!
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-3xl font-semibold"
            style={{ color: roleColor }}
          >
            {roleTitle}
          </motion.p>

          {/* Trophy Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 1, type: 'spring', bounce: 0.6 }}
            className="mt-8 inline-block"
          >
            <div
              className="text-9xl"
              style={{
                filter: `drop-shadow(0 0 30px ${roleColor})`,
              }}
            >
              {playerRole === 'TRADER' ? '👑' : '🗡️'}
            </div>
          </motion.div>
        </motion.div>

        {/* Stats Section */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-8 backdrop-blur-md bg-black/40 rounded-2xl p-8 border-2"
              style={{ borderColor: roleColor + '40' }}
            >
              <h2 className="text-3xl font-bold text-amber-300 mb-6">Battle Statistics</h2>
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
                  label="Rounds Played"
                  value={stats.roundsPlayed}
                  icon="🎯"
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

        {/* Rewards Section */}
        <AnimatePresence>
          {showRewards && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: 'spring' }}
              className="mb-8 backdrop-blur-md bg-gradient-to-br from-amber-900/30 to-amber-950/30 rounded-2xl p-8 border-2 border-amber-600/50"
            >
              <h2 className="text-3xl font-bold text-amber-300 mb-6">Rewards Earned</h2>
              <div className="flex justify-center gap-12 mb-6">
                <RewardItem
                  label="Gold"
                  value={rewards.gold}
                  icon={theme.images.gold}
                  delay={0}
                />
                <RewardItem
                  label="Experience"
                  value={rewards.experience}
                  icon="✨"
                  delay={0.2}
                />
              </div>

              {rewards.unlocks && rewards.unlocks.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 pt-6 border-t border-amber-600/30"
                >
                  <h3 className="text-xl font-semibold text-amber-300 mb-4">
                    New Unlocks!
                  </h3>
                  <div className="flex flex-wrap justify-center gap-4">
                    {rewards.unlocks.map((unlock, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.7 + i * 0.1, type: 'spring', bounce: 0.5 }}
                        className="px-4 py-2 bg-amber-900/50 border border-amber-600/50 rounded-lg text-amber-200"
                      >
                        {unlock}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
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
            whileHover={{ scale: 1.05, boxShadow: `0 0 30px ${roleColor}` }}
            whileTap={{ scale: 0.95 }}
            onClick={onPlayAgain}
            className="px-10 py-4 rounded-xl text-xl font-bold text-white relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${roleColor} 0%, ${playerRole === 'TRADER' ? '#FFA500' : '#CC0000'} 100%)`,
              boxShadow: `0 10px 30px ${roleColor}40`,
            }}
          >
            <motion.div
              className="absolute inset-0 bg-white"
              initial={{ x: '-100%', opacity: 0.3 }}
              animate={{ x: '100%' }}
              transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
              style={{ opacity: 0.2 }}
            />
            <span className="relative z-10">Play Again</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onMainMenu}
            className="px-10 py-4 rounded-xl text-xl font-bold text-amber-200 border-2 border-amber-600/50 bg-black/50 hover:bg-amber-900/30 transition-colors"
          >
            Main Menu
          </motion.button>
        </motion.div>
      </div>

      {/* Sparkle Effects */}
      {[...Array(30)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            opacity: 0,
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
          }}
          transition={{
            delay: Math.random() * 3,
            duration: 2,
            repeat: Infinity,
            repeatDelay: Math.random() * 5,
          }}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            backgroundColor: roleColor,
            boxShadow: `0 0 10px ${roleColor}`,
          }}
        />
      ))}
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
    <div className="text-4xl mb-2">{icon}</div>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: delay + 0.2, type: 'spring', bounce: 0.5 }}
      className="text-3xl font-bold text-amber-300 mb-1"
    >
      {isString ? value : (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.3 }}
        >
          {typeof value === 'number' ? value.toLocaleString() : value}
        </motion.span>
      )}
    </motion.div>
    <p className="text-sm text-amber-100/70">{label}</p>
  </motion.div>
);

// Reward Item Component
const RewardItem: React.FC<{
  label: string;
  value: number;
  icon: string;
  delay: number;
}> = ({ label, value, icon, delay }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay, type: 'spring', bounce: 0.6 }}
      className="flex flex-col items-center"
    >
      {icon.startsWith('http') ? (
        <img src={icon} alt={label} className="w-20 h-20 object-contain mb-3" />
      ) : (
        <div className="text-6xl mb-3">{icon}</div>
      )}
      <motion.div
        className="text-4xl font-bold text-amber-300 mb-2"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5, delay }}
      >
        +{displayValue.toLocaleString()}
      </motion.div>
      <p className="text-lg text-amber-100/80">{label}</p>
    </motion.div>
  );
};

export default VictoryScreen;
