"use client"

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Zap, Star, Trophy, Award } from 'lucide-react';
import { StreakBonus } from '@/lib/gameplayEnhancement';

interface StreakNotificationProps {
  streak: StreakBonus | null;
  show: boolean;
  onClose: () => void;
}

export function StreakNotification({ streak, show, onClose }: StreakNotificationProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!streak) return null;

  const getStreakConfig = (count: number) => {
    if (count >= 10) {
      return {
        color: 'from-purple-600 to-pink-600',
        borderColor: 'border-purple-500',
        textColor: 'text-purple-300',
        icon: <Trophy className="w-12 h-12" />,
        title: 'LEGENDARY!',
        glow: 'shadow-purple-500/50',
      };
    } else if (count >= 5) {
      return {
        color: 'from-orange-600 to-red-600',
        borderColor: 'border-orange-500',
        textColor: 'text-orange-300',
        icon: <Flame className="w-12 h-12" />,
        title: 'ON FIRE!',
        glow: 'shadow-orange-500/50',
      };
    } else if (count >= 3) {
      return {
        color: 'from-yellow-600 to-orange-600',
        borderColor: 'border-yellow-500',
        textColor: 'text-yellow-300',
        icon: <Zap className="w-12 h-12" />,
        title: 'HOT STREAK!',
        glow: 'shadow-yellow-500/50',
      };
    }
    return {
      color: 'from-green-600 to-blue-600',
      borderColor: 'border-green-500',
      textColor: 'text-green-300',
      icon: <Star className="w-12 h-12" />,
      title: 'STREAK!',
      glow: 'shadow-green-500/50',
    };
  };

  const config = getStreakConfig(streak.count);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed top-1/4 left-1/2 transform -translate-x-1/2 z-[150]"
          initial={{ scale: 0, rotate: -10, y: 50 }}
          animate={{
            scale: 1,
            rotate: 0,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 15,
            },
          }}
          exit={{
            scale: 0,
            rotate: 10,
            y: -50,
            transition: { duration: 0.3 },
          }}
        >
          <div
            className={`
              relative bg-gradient-to-br ${config.color}
              border-4 ${config.borderColor}
              rounded-2xl shadow-2xl ${config.glow}
              overflow-hidden
            `}
          >
            {/* Animated background */}
            <motion.div
              className="absolute inset-0 opacity-30"
              style={{
                background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 20px)',
              }}
              animate={{
                backgroundPosition: ['0px 0px', '40px 40px'],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'linear',
              }}
            />

            {/* Shine effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 0.5,
              }}
            />

            <div className="relative p-8 text-center min-w-[300px]">
              {/* Icon */}
              <motion.div
                className={`${config.textColor} mb-4 flex justify-center`}
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              >
                {config.icon}
              </motion.div>

              {/* Title */}
              <motion.h2
                className="text-4xl font-black text-white mb-2 drop-shadow-lg"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  repeatDelay: 0.5,
                }}
              >
                {config.title}
              </motion.h2>

              {/* Streak Count */}
              <div className="mb-4">
                <motion.div
                  className="text-6xl font-black text-white drop-shadow-lg"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  {streak.count}x
                </motion.div>
                <div className="text-xl font-bold text-white/90">
                  {streak.type === 'WIN_STREAK' ? 'Win Streak' : 'Combo'}
                </div>
              </div>

              {/* Bonuses */}
              <div className="space-y-2">
                <motion.div
                  className="bg-black/30 rounded-lg p-3 backdrop-blur-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-bold">
                      +{streak.bonusXP} Bonus XP
                    </span>
                  </div>
                </motion.div>

                {streak.bonusSilk > 0 && (
                  <motion.div
                    className="bg-black/30 rounded-lg p-3 backdrop-blur-sm"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-purple-400">🧵</span>
                      <span className="text-white font-bold">
                        +{streak.bonusSilk} Bonus Silk
                      </span>
                    </div>
                  </motion.div>
                )}

                <motion.div
                  className="bg-black/30 rounded-lg p-3 backdrop-blur-sm"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Award className="w-5 h-5 text-green-400" />
                    <span className="text-white font-bold">
                      {streak.multiplier.toFixed(1)}x Multiplier
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Particle effects */}
            {Array.from({ length: 10 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-white rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0],
                  y: [-20, -60],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.1,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Mini streak indicator for HUD
interface MiniStreakIndicatorProps {
  streakCount: number;
  type: 'WIN_STREAK' | 'KILL_COMBO' | 'PERFECT_ROUND';
}

export function MiniStreakIndicator({ streakCount, type }: MiniStreakIndicatorProps) {
  if (streakCount < 3) return null;

  const getColor = () => {
    if (streakCount >= 10) return 'text-purple-400';
    if (streakCount >= 5) return 'text-orange-400';
    return 'text-yellow-400';
  };

  const getIcon = () => {
    if (type === 'WIN_STREAK') return <Trophy className="w-4 h-4" />;
    if (type === 'KILL_COMBO') return <Zap className="w-4 h-4" />;
    return <Star className="w-4 h-4" />;
  };

  return (
    <motion.div
      className={`
        flex items-center gap-2 bg-black/60 backdrop-blur-sm
        rounded-full px-3 py-1 border-2
        ${streakCount >= 10 ? 'border-purple-500' : streakCount >= 5 ? 'border-orange-500' : 'border-yellow-500'}
      `}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      exit={{ scale: 0, rotate: 180 }}
      transition={{ type: 'spring', stiffness: 200 }}
    >
      <motion.div
        className={getColor()}
        animate={{
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      >
        {getIcon()}
      </motion.div>
      <motion.span
        className={`font-bold ${getColor()}`}
        animate={{
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      >
        {streakCount}x
      </motion.span>
      {streakCount >= 10 && (
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          <Flame className="w-4 h-4 text-purple-400" />
        </motion.div>
      )}
    </motion.div>
  );
}
