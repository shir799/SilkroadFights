"use client"

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Star, Crown, Award, TrendingUp, Trophy } from 'lucide-react';
import { PlayerProfile, PROGRESSION_CONFIG } from '@/lib/gameplayEnhancement';

interface ProgressionBarProps {
  profile: PlayerProfile;
  showDetails?: boolean;
  compact?: boolean;
}

export function ProgressionBar({ profile, showDetails = false, compact = false }: ProgressionBarProps) {
  const [xpProgress, setXpProgress] = useState(0);
  const [isLevelingUp, setIsLevelingUp] = useState(false);

  const xpRequired = getXPRequiredForLevel(profile.level);
  const percentage = Math.min((profile.xp / xpRequired) * 100, 100);

  useEffect(() => {
    // Animate XP bar fill
    const timer = setTimeout(() => {
      setXpProgress(percentage);
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  // Compact version
  if (compact) {
    return (
      <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-yellow-500/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-white font-bold">Level {profile.level}</span>
            {profile.prestigeLevel > 0 && (
              <div className="flex items-center gap-1">
                <Crown className="w-3 h-3 text-purple-400" />
                <span className="text-purple-400 text-xs font-bold">P{profile.prestigeLevel}</span>
              </div>
            )}
          </div>
          <span className="text-yellow-400 text-sm font-medium">
            {profile.xp.toLocaleString()} / {xpRequired.toLocaleString()} XP
          </span>
        </div>

        {/* XP Bar */}
        <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden border border-yellow-500/50">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400"
            initial={{ width: '0%' }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
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
        </div>
      </div>
    );
  }

  // Full version
  return (
    <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 backdrop-blur-md rounded-xl p-6 border-2 border-yellow-500/50 shadow-2xl shadow-yellow-500/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Level Badge */}
          <motion.div
            className="relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-600 to-yellow-400 flex items-center justify-center border-4 border-yellow-300 shadow-lg shadow-yellow-500/50">
              <div className="text-center">
                <div className="text-xs text-yellow-900 font-bold uppercase">Level</div>
                <div className="text-2xl font-bold text-white">{profile.level}</div>
              </div>
            </div>
            {/* Prestige Crown */}
            {profile.prestigeLevel > 0 && (
              <motion.div
                className="absolute -top-1 -right-1 w-8 h-8 bg-gradient-to-br from-purple-600 to-purple-400 rounded-full border-2 border-purple-300 flex items-center justify-center shadow-lg shadow-purple-500/50"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
              >
                <Crown className="w-4 h-4 text-white" />
              </motion.div>
            )}
          </motion.div>

          {/* Player Info */}
          <div>
            <h3 className="text-2xl font-bold text-white flex items-center gap-2">
              {profile.username}
              {profile.currentTitle && (
                <span className="text-sm text-yellow-400 font-normal italic">
                  "{profile.currentTitle}"
                </span>
              )}
            </h3>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex items-center gap-1 text-yellow-400">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {profile.totalXp.toLocaleString()} Total XP
                </span>
              </div>
              {profile.prestigeLevel > 0 && (
                <div className="flex items-center gap-1 text-purple-400">
                  <Crown className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    Prestige {profile.prestigeLevel}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Win Rate */}
        <div className="text-right">
          <div className="text-3xl font-bold text-white">
            {profile.totalGamesPlayed > 0
              ? Math.round((profile.totalWins / profile.totalGamesPlayed) * 100)
              : 0}%
          </div>
          <div className="text-sm text-gray-400">Win Rate</div>
          <div className="text-xs text-gray-500 mt-1">
            {profile.totalWins}W / {profile.totalLosses}L
          </div>
        </div>
      </div>

      {/* XP Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-semibold flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            Progress to Level {profile.level + 1}
          </span>
          <span className="text-yellow-400 font-bold">
            {profile.xp.toLocaleString()} / {xpRequired.toLocaleString()} XP
          </span>
        </div>

        <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden border-2 border-yellow-500/50 shadow-inner">
          {/* Background grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="h-full w-full" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 10px, rgba(255,255,255,0.1) 10px, rgba(255,255,255,0.1) 11px)' }} />
          </div>

          {/* Progress fill */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-400"
            initial={{ width: '0%' }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          >
            {/* Animated shine */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{
                duration: 2,
                repeat: Infinity,
                repeatDelay: 1,
              }}
            />
          </motion.div>

          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white font-bold text-sm drop-shadow-lg">
              {Math.round(percentage)}%
            </span>
          </div>

          {/* Glow effect */}
          <motion.div
            className="absolute inset-0 bg-yellow-400/20 blur-xl"
            animate={{
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        </div>

        {/* XP needed text */}
        <div className="mt-2 text-center text-sm text-gray-400">
          {(xpRequired - profile.xp).toLocaleString()} XP needed for next level
        </div>
      </div>

      {/* Stats Grid */}
      {showDetails && (
        <motion.div
          className="grid grid-cols-2 gap-3"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Win Streak */}
          <StatCard
            icon={<Award className="w-5 h-5" />}
            label="Win Streak"
            value={profile.winStreak}
            color="text-green-400"
            subtext={`Best: ${profile.bestWinStreak}`}
          />

          {/* Total Kills */}
          <StatCard
            icon={<Star className="w-5 h-5" />}
            label="Total Kills"
            value={profile.totalKills}
            color="text-red-400"
          />

          {/* Silk Collected */}
          <StatCard
            icon={<span className="text-lg">🧵</span>}
            label="Silk Collected"
            value={profile.totalSilkCollected}
            color="text-purple-400"
          />

          {/* Bosses Defeated */}
          <StatCard
            icon={<Trophy className="w-5 h-5" />}
            label="Bosses"
            value={profile.totalBossesDefeated}
            color="text-orange-400"
          />
        </motion.div>
      )}

      {/* Prestige Info */}
      {profile.level >= PROGRESSION_CONFIG.PRESTIGE_LEVEL && (
        <motion.div
          className="mt-4 p-3 bg-purple-900/30 border border-purple-500/50 rounded-lg"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center gap-2 text-purple-400">
            <Crown className="w-5 h-5" />
            <span className="font-bold">Prestige Available!</span>
          </div>
          <p className="text-sm text-purple-300 mt-1">
            Reset to level 1 for permanent bonuses and exclusive rewards
          </p>
        </motion.div>
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  color: string;
  subtext?: string;
}

function StatCard({ icon, label, value, color, subtext }: StatCardProps) {
  return (
    <motion.div
      className="bg-black/40 rounded-lg p-3 border border-gray-700/50 hover:border-gray-600 transition-colors"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-center gap-2 mb-1">
        <div className={color}>{icon}</div>
        <span className="text-gray-400 text-xs font-medium uppercase">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${color}`}>
        {typeof value === 'number' ? value.toLocaleString() : value}
      </div>
      {subtext && (
        <div className="text-xs text-gray-500 mt-1">{subtext}</div>
      )}
    </motion.div>
  );
}

// Helper function (matches the one in gameplayEnhancement.ts)
function getXPRequiredForLevel(level: number): number {
  return Math.floor(
    PROGRESSION_CONFIG.XP_PER_LEVEL *
    Math.pow(PROGRESSION_CONFIG.LEVEL_SCALING, level - 1)
  );
}

// Mini version for HUD
interface MiniProgressionBarProps {
  profile: PlayerProfile;
}

export function MiniProgressionBar({ profile }: MiniProgressionBarProps) {
  const xpRequired = getXPRequiredForLevel(profile.level);
  const percentage = Math.min((profile.xp / xpRequired) * 100, 100);

  return (
    <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 border border-yellow-500/30">
      {/* Level Badge */}
      <div className="flex items-center gap-1">
        <Star className="w-4 h-4 text-yellow-400" />
        <span className="text-white font-bold text-sm">{profile.level}</span>
        {profile.prestigeLevel > 0 && (
          <>
            <Crown className="w-3 h-3 text-purple-400" />
            <span className="text-purple-400 text-xs">{profile.prestigeLevel}</span>
          </>
        )}
      </div>

      {/* Mini XP Bar */}
      <div className="w-24 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400"
          initial={{ width: '0%' }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* XP Text */}
      <span className="text-yellow-400 text-xs font-medium">
        {Math.round(percentage)}%
      </span>
    </div>
  );
}
