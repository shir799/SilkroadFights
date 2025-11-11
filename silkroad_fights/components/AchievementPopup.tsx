"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Award, Zap, Crown, Target } from 'lucide-react';
import { Achievement, AchievementTier } from '@/lib/gameplayEnhancement';

interface AchievementPopupProps {
  achievement: Achievement | null;
  onClose: () => void;
  show: boolean;
}

const TIER_COLORS: Record<AchievementTier, { bg: string; border: string; glow: string; text: string }> = {
  BRONZE: {
    bg: 'bg-gradient-to-br from-orange-900/90 to-orange-700/90',
    border: 'border-orange-500',
    glow: 'shadow-orange-500/50',
    text: 'text-orange-300',
  },
  SILVER: {
    bg: 'bg-gradient-to-br from-gray-700/90 to-gray-500/90',
    border: 'border-gray-400',
    glow: 'shadow-gray-400/50',
    text: 'text-gray-200',
  },
  GOLD: {
    bg: 'bg-gradient-to-br from-yellow-700/90 to-yellow-500/90',
    border: 'border-yellow-400',
    glow: 'shadow-yellow-400/50',
    text: 'text-yellow-200',
  },
  PLATINUM: {
    bg: 'bg-gradient-to-br from-cyan-700/90 to-cyan-500/90',
    border: 'border-cyan-400',
    glow: 'shadow-cyan-400/50',
    text: 'text-cyan-200',
  },
  LEGENDARY: {
    bg: 'bg-gradient-to-br from-purple-900/90 to-pink-700/90',
    border: 'border-purple-400',
    glow: 'shadow-purple-500/50',
    text: 'text-purple-200',
  },
};

const TIER_ICONS: Record<AchievementTier, React.ReactNode> = {
  BRONZE: <Award className="w-8 h-8" />,
  SILVER: <Star className="w-8 h-8" />,
  GOLD: <Trophy className="w-8 h-8" />,
  PLATINUM: <Zap className="w-8 h-8" />,
  LEGENDARY: <Crown className="w-8 h-8" />,
};

export function AchievementPopup({ achievement, onClose, show }: AchievementPopupProps) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (show && achievement) {
      // Create particles for effect
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
      }));
      setParticles(newParticles);

      // Auto-close after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [show, achievement, onClose]);

  if (!achievement) return null;

  const tierStyle = TIER_COLORS[achievement.tier];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop blur */}
          <motion.div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Achievement Card */}
          <motion.div
            className={`relative pointer-events-auto ${tierStyle.bg} ${tierStyle.border} border-4 rounded-2xl shadow-2xl ${tierStyle.glow} overflow-hidden max-w-md w-full mx-4`}
            initial={{ scale: 0, rotate: -10, y: 100 }}
            animate={{
              scale: 1,
              rotate: 0,
              y: 0,
              transition: {
                type: 'spring',
                stiffness: 200,
                damping: 15,
              },
            }}
            exit={{
              scale: 0,
              rotate: 10,
              y: -100,
              transition: { duration: 0.3 },
            }}
          >
            {/* Animated particles */}
            <div className="absolute inset-0 overflow-hidden">
              {particles.map((particle) => (
                <motion.div
                  key={particle.id}
                  className={`absolute w-2 h-2 ${tierStyle.text} rounded-full`}
                  style={{
                    left: `${particle.x}%`,
                    top: `${particle.y}%`,
                  }}
                  initial={{ scale: 0, opacity: 1 }}
                  animate={{
                    scale: [0, 1, 0],
                    opacity: [0, 1, 0],
                    y: [-50, -100],
                  }}
                  transition={{
                    duration: 2,
                    delay: particle.id * 0.05,
                    repeat: Infinity,
                  }}
                />
              ))}
            </div>

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />

            {/* Content */}
            <div className="relative p-8">
              {/* Header */}
              <motion.div
                className="flex items-center justify-center mb-4"
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className={`${tierStyle.text} mr-3`}>
                  {TIER_ICONS[achievement.tier]}
                </div>
                <h3 className="text-2xl font-bold text-white uppercase tracking-wider">
                  Achievement Unlocked!
                </h3>
              </motion.div>

              {/* Icon and Title */}
              <motion.div
                className="text-center mb-6"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200 }}
              >
                <div className="text-6xl mb-3">{achievement.icon}</div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {achievement.name}
                </h2>
                <p className="text-lg text-white/80">{achievement.description}</p>
              </motion.div>

              {/* Tier Badge */}
              <motion.div
                className="flex justify-center mb-4"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
              >
                <div className={`px-6 py-2 ${tierStyle.border} border-2 rounded-full ${tierStyle.text} font-bold uppercase text-sm tracking-wider`}>
                  {achievement.tier} Tier
                </div>
              </motion.div>

              {/* Rewards */}
              <motion.div
                className="bg-black/30 rounded-lg p-4 backdrop-blur-sm"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <h4 className="text-white font-semibold mb-2 text-center">Rewards</h4>
                <div className="flex justify-center gap-4 flex-wrap">
                  {achievement.rewards.xp > 0 && (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">+{achievement.rewards.xp} XP</span>
                    </div>
                  )}
                  {achievement.rewards.silk && (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded">
                      <span className="text-purple-400">🧵</span>
                      <span className="text-white font-medium">+{achievement.rewards.silk} Silk</span>
                    </div>
                  )}
                  {achievement.rewards.title && (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded">
                      <Crown className="w-4 h-4 text-yellow-400" />
                      <span className="text-white font-medium">{achievement.rewards.title}</span>
                    </div>
                  )}
                  {achievement.rewards.cosmetic && (
                    <div className="flex items-center gap-2 bg-white/10 px-3 py-1 rounded">
                      <Star className="w-4 h-4 text-pink-400" />
                      <span className="text-white font-medium">New Cosmetic!</span>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Points */}
              <motion.div
                className="mt-4 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <span className={`${tierStyle.text} font-bold text-lg`}>
                  +{achievement.points} Achievement Points
                </span>
              </motion.div>

              {/* Close hint */}
              <motion.div
                className="mt-4 text-center text-white/50 text-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                Click anywhere to continue...
              </motion.div>
            </div>

            {/* Decorative corner elements */}
            <div className={`absolute top-0 left-0 w-20 h-20 ${tierStyle.border} border-l-4 border-t-4 rounded-tl-2xl`} />
            <div className={`absolute top-0 right-0 w-20 h-20 ${tierStyle.border} border-r-4 border-t-4 rounded-tr-2xl`} />
            <div className={`absolute bottom-0 left-0 w-20 h-20 ${tierStyle.border} border-l-4 border-b-4 rounded-bl-2xl`} />
            <div className={`absolute bottom-0 right-0 w-20 h-20 ${tierStyle.border} border-r-4 border-b-4 rounded-br-2xl`} />
          </motion.div>

          {/* Click anywhere to close */}
          <div
            className="absolute inset-0 cursor-pointer"
            onClick={onClose}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Achievement Toast (smaller notification)
interface AchievementToastProps {
  achievement: Achievement | null;
  show: boolean;
  onClose: () => void;
}

export function AchievementToast({ achievement, show, onClose }: AchievementToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!achievement) return null;

  const tierStyle = TIER_COLORS[achievement.tier];

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-4 right-4 z-[150] pointer-events-auto"
          initial={{ x: 400, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: 400, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        >
          <div className={`${tierStyle.bg} ${tierStyle.border} border-2 rounded-lg shadow-xl ${tierStyle.glow} p-4 min-w-[300px]`}>
            <div className="flex items-center gap-3">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className={`w-4 h-4 ${tierStyle.text}`} />
                  <span className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    Achievement
                  </span>
                </div>
                <h4 className="text-white font-bold">{achievement.name}</h4>
                <p className="text-white/80 text-sm">{achievement.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
