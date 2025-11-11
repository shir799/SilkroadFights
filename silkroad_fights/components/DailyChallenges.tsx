"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  Trophy,
  Clock,
  Check,
  Lock,
  Zap,
  Crown,
  Star,
  Flame,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { DailyChallenge, PlayerProfile } from '@/lib/gameplayEnhancement';

interface DailyChallengesProps {
  profile: PlayerProfile;
  onChallengeClick?: (challenge: DailyChallenge) => void;
  compact?: boolean;
}

const DIFFICULTY_CONFIG = {
  EASY: {
    color: 'text-green-400',
    bg: 'bg-green-500/20',
    border: 'border-green-500/50',
    icon: <Target className="w-5 h-5" />,
    label: 'Easy',
  },
  MEDIUM: {
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/20',
    border: 'border-yellow-500/50',
    icon: <Zap className="w-5 h-5" />,
    label: 'Medium',
  },
  HARD: {
    color: 'text-orange-400',
    bg: 'bg-orange-500/20',
    border: 'border-orange-500/50',
    icon: <Flame className="w-5 h-5" />,
    label: 'Hard',
  },
  EXTREME: {
    color: 'text-red-400',
    bg: 'bg-red-500/20',
    border: 'border-red-500/50',
    icon: <Crown className="w-5 h-5" />,
    label: 'Extreme',
  },
};

export function DailyChallenges({ profile, onChallengeClick, compact = false }: DailyChallengesProps) {
  const [timeRemaining, setTimeRemaining] = useState('');
  const [selectedChallenge, setSelectedChallenge] = useState<DailyChallenge | null>(null);

  useEffect(() => {
    const updateTimer = () => {
      const now = Date.now();
      const tomorrow = new Date();
      tomorrow.setHours(24, 0, 0, 0);
      const remaining = tomorrow.getTime() - now;

      const hours = Math.floor(remaining / (1000 * 60 * 60));
      const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((remaining % (1000 * 60)) / 1000);

      setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, []);

  const completedCount = profile.dailyChallenges.filter(c => c.completed).length;
  const totalRewards = profile.dailyChallenges.reduce(
    (acc, c) => ({
      xp: acc.xp + (c.completed ? c.rewards.xp : 0),
      silk: acc.silk + (c.completed ? c.rewards.silk : 0),
    }),
    { xp: 0, silk: 0 }
  );

  if (compact) {
    return <CompactChallenges profile={profile} timeRemaining={timeRemaining} />;
  }

  return (
    <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/95 backdrop-blur-md rounded-xl p-6 border-2 border-purple-500/50 shadow-2xl shadow-purple-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-400" />
            Daily Challenges
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Complete challenges for bonus rewards!
          </p>
        </div>

        {/* Timer */}
        <div className="text-right">
          <div className="flex items-center gap-2 text-purple-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-semibold">Resets in</span>
          </div>
          <div className="text-xl font-bold text-white font-mono">
            {timeRemaining}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="mb-6 p-4 bg-black/40 rounded-lg border border-purple-500/30">
        <div className="flex items-center justify-between mb-3">
          <span className="text-white font-semibold">Daily Progress</span>
          <span className="text-purple-400 font-bold">
            {completedCount} / {profile.dailyChallenges.length}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-purple-500/50 mb-3">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-purple-600 to-purple-400"
            initial={{ width: '0%' }}
            animate={{
              width: `${(completedCount / profile.dailyChallenges.length) * 100}%`,
            }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ['-100%', '200%'] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
            />
          </motion.div>
        </div>

        {/* Total Rewards Earned */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white">
              <span className="font-bold text-yellow-400">{totalRewards.xp}</span> XP Earned
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-purple-400">🧵</span>
            <span className="text-white">
              <span className="font-bold text-purple-400">{totalRewards.silk}</span> Silk Earned
            </span>
          </div>
        </div>
      </div>

      {/* Challenges List */}
      <div className="space-y-3">
        {profile.dailyChallenges.map((challenge, index) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            index={index}
            onClick={() => {
              setSelectedChallenge(challenge);
              onChallengeClick?.(challenge);
            }}
          />
        ))}
      </div>

      {/* Bonus Info */}
      {completedCount === profile.dailyChallenges.length && (
        <motion.div
          className="mt-6 p-4 bg-gradient-to-r from-yellow-900/30 to-purple-900/30 rounded-lg border border-yellow-500/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Star className="w-5 h-5" />
            <span className="font-bold">All Challenges Completed!</span>
          </div>
          <p className="text-white/80 text-sm">
            Amazing work! Come back tomorrow for new challenges and rewards!
          </p>
        </motion.div>
      )}

      {/* Selected Challenge Modal */}
      <AnimatePresence>
        {selectedChallenge && (
          <ChallengeDetailModal
            challenge={selectedChallenge}
            onClose={() => setSelectedChallenge(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Challenge Card Component
interface ChallengeCardProps {
  challenge: DailyChallenge;
  index: number;
  onClick: () => void;
}

function ChallengeCard({ challenge, index, onClick }: ChallengeCardProps) {
  const config = DIFFICULTY_CONFIG[challenge.difficulty];
  const progress = Math.min((challenge.progress / challenge.objective.target) * 100, 100);
  const isCompleted = challenge.completed;

  return (
    <motion.div
      className={`
        relative overflow-hidden rounded-lg border-2 transition-all cursor-pointer
        ${isCompleted
          ? 'bg-green-900/20 border-green-500/50'
          : `bg-black/40 ${config.border}`
        }
        hover:scale-[1.02] hover:shadow-lg
      `}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      onClick={onClick}
      whileHover={{ x: 4 }}
    >
      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          {/* Challenge Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* Difficulty Badge */}
              <div className={`flex items-center gap-1 px-2 py-1 rounded ${config.bg} ${config.border} border`}>
                <div className={config.color}>{config.icon}</div>
                <span className={`text-xs font-bold ${config.color} uppercase`}>
                  {config.label}
                </span>
              </div>

              {/* Completed Badge */}
              {isCompleted && (
                <motion.div
                  className="flex items-center gap-1 bg-green-500/20 border border-green-500/50 rounded px-2 py-1"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200 }}
                >
                  <Check className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-bold text-green-400">DONE</span>
                </motion.div>
              )}
            </div>

            {/* Challenge Name & Description */}
            <h3 className="text-white font-bold text-lg mb-1">{challenge.name}</h3>
            <p className="text-gray-400 text-sm">{challenge.description}</p>
          </div>

          {/* Arrow Icon */}
          <ChevronRight className="w-5 h-5 text-gray-500 mt-2" />
        </div>

        {/* Progress Bar */}
        {!isCompleted && (
          <div className="mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Progress</span>
              <span className={`text-xs font-bold ${config.color}`}>
                {challenge.progress} / {challenge.objective.target}
              </span>
            </div>
            <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${config.color.replace('text-', 'from-')}`}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-white text-sm font-medium">
              {challenge.rewards.xp} XP
            </span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded">
            <span className="text-purple-400">🧵</span>
            <span className="text-white text-sm font-medium">
              {challenge.rewards.silk} Silk
            </span>
          </div>
          {challenge.rewards.title && (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1 rounded">
              <Crown className="w-4 h-4 text-yellow-400" />
              <span className="text-white text-sm font-medium">Title</span>
            </div>
          )}
        </div>
      </div>

      {/* Completion Overlay */}
      {isCompleted && (
        <motion.div
          className="absolute inset-0 bg-green-500/10 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
    </motion.div>
  );
}

// Challenge Detail Modal
interface ChallengeDetailModalProps {
  challenge: DailyChallenge;
  onClose: () => void;
}

function ChallengeDetailModal({ challenge, onClose }: ChallengeDetailModalProps) {
  const config = DIFFICULTY_CONFIG[challenge.difficulty];

  return (
    <motion.div
      className="fixed inset-0 z-[150] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 max-w-md w-full mx-4 border-2 border-purple-500/50 shadow-2xl"
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
      >
        {/* Header */}
        <div className="mb-4">
          <div className={`flex items-center gap-2 px-3 py-2 rounded ${config.bg} ${config.border} border inline-flex mb-3`}>
            <div className={config.color}>{config.icon}</div>
            <span className={`font-bold ${config.color} uppercase text-sm`}>
              {config.label} Challenge
            </span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">{challenge.name}</h2>
          <p className="text-gray-400">{challenge.description}</p>
        </div>

        {/* Objective Details */}
        <div className="mb-4 p-4 bg-black/40 rounded-lg border border-gray-700">
          <div className="flex items-center gap-2 text-white font-semibold mb-2">
            <Target className="w-5 h-5 text-purple-400" />
            Objective
          </div>
          <p className="text-gray-300">
            {getObjectiveDescription(challenge.objective)}
          </p>
        </div>

        {/* Progress */}
        {!challenge.completed && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-semibold">Your Progress</span>
              <span className={`font-bold ${config.color}`}>
                {challenge.progress} / {challenge.objective.target}
              </span>
            </div>
            <div className="relative h-4 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${config.color.replace('text-', 'from-')}`}
                initial={{ width: '0%' }}
                animate={{
                  width: `${Math.min((challenge.progress / challenge.objective.target) * 100, 100)}%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Rewards */}
        <div className="mb-4 p-4 bg-gradient-to-br from-yellow-900/20 to-purple-900/20 rounded-lg border border-yellow-500/30">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold mb-3">
            <Trophy className="w-5 h-5" />
            Rewards
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <Zap className="w-4 h-4 text-yellow-400" />
                <span>Experience Points</span>
              </div>
              <span className="text-yellow-400 font-bold">+{challenge.rewards.xp} XP</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <span>🧵</span>
                <span>Silk</span>
              </div>
              <span className="text-purple-400 font-bold">+{challenge.rewards.silk}</span>
            </div>
            {challenge.rewards.title && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-white">
                  <Crown className="w-4 h-4 text-yellow-400" />
                  <span>Special Title</span>
                </div>
                <span className="text-yellow-400 font-bold">{challenge.rewards.title}</span>
              </div>
            )}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors"
        >
          Got it!
        </button>
      </motion.div>
    </motion.div>
  );
}

// Compact Version for HUD
function CompactChallenges({ profile, timeRemaining }: { profile: PlayerProfile; timeRemaining: string }) {
  const completedCount = profile.dailyChallenges.filter(c => c.completed).length;

  return (
    <div className="bg-black/60 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-purple-400" />
          <span className="text-white font-bold text-sm">Daily Challenges</span>
        </div>
        <span className="text-purple-400 text-xs font-bold">
          {completedCount}/{profile.dailyChallenges.length}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <Clock className="w-3 h-3 text-gray-400" />
        <span className="text-gray-400">{timeRemaining}</span>
      </div>
    </div>
  );
}

// Helper function to get objective description
function getObjectiveDescription(objective: DailyChallenge['objective']): string {
  switch (objective.type) {
    case 'WIN_WITHOUT_LOSSES':
      return `Win a game without losing any units`;
    case 'DEFEAT_BOSS_FAST':
      return `Defeat a boss in under ${objective.target} rounds`;
    case 'COLLECT_SILK':
      return `Collect ${objective.target} silk`;
    case 'WIN_STREAK':
      return `Win ${objective.target} games in a row`;
    case 'PERFECT_GAME':
      return `Win a game without taking any damage`;
    case 'USE_ABILITY':
      return `Use abilities ${objective.target} times`;
    case 'KILL_COUNT':
      return `Eliminate ${objective.target} enemy units`;
    default:
      return 'Complete the challenge objective';
  }
}
