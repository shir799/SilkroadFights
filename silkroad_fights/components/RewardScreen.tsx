'use client';

import React, { useState, useEffect } from 'react';
import { Reward, Achievement, DailyReward, RewardSystem } from '@/lib/progressionSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RewardScreenProps {
  rewards: Reward;
  levelUps?: number;
  newLevel?: number;
  unlockedAchievements?: Achievement[];
  onContinue: () => void;
}

export default function RewardScreen({
  rewards,
  levelUps = 0,
  newLevel,
  unlockedAchievements = [],
  onContinue,
}: RewardScreenProps) {
  const [animationStage, setAnimationStage] = useState(0);
  const [displayedRewards, setDisplayedRewards] = useState({
    xp: 0,
    silk: 0,
    premiumSilk: 0,
  });

  // Animate rewards counting up
  useEffect(() => {
    const stages = [
      { delay: 500, stage: 1 }, // Show XP
      { delay: 1500, stage: 2 }, // Show Silk
      { delay: 2500, stage: 3 }, // Show Premium Silk (if any)
      { delay: 3500, stage: 4 }, // Show Achievements
    ];

    stages.forEach(({ delay, stage }) => {
      setTimeout(() => setAnimationStage(stage), delay);
    });

    // Animate numbers counting up
    const duration = 1000;
    const steps = 20;
    const stepDelay = duration / steps;

    const animateNumber = (target: number, key: 'xp' | 'silk' | 'premiumSilk', delay: number) => {
      setTimeout(() => {
        for (let i = 0; i <= steps; i++) {
          setTimeout(() => {
            setDisplayedRewards(prev => ({
              ...prev,
              [key]: Math.floor((target * i) / steps),
            }));
          }, i * stepDelay);
        }
      }, delay);
    };

    animateNumber(rewards.xp, 'xp', 500);
    animateNumber(rewards.silk, 'silk', 1500);
    if (rewards.premiumSilk) {
      animateNumber(rewards.premiumSilk, 'premiumSilk', 2500);
    }
  }, [rewards]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-orange-950 to-black flex items-center justify-center p-8">
      <div className="max-w-4xl w-full">
        {/* Victory Banner */}
        <div className="text-center mb-8 animate-bounce">
          <h1 className="text-6xl font-bold text-amber-200 mb-4">
            🎉 Victory! 🎉
          </h1>
          <p className="text-2xl text-amber-400">You've earned rewards!</p>
        </div>

        {/* Rewards Cards */}
        <div className="space-y-6 mb-8">
          {/* XP Reward */}
          <Card
            className={`bg-gradient-to-r from-blue-900/60 to-purple-900/60 border-2 border-blue-400 p-6 transition-all duration-500 ${
              animationStage >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-6xl">⭐</div>
                <div>
                  <h3 className="text-3xl font-bold text-blue-200">Experience Gained</h3>
                  <p className="text-blue-400">Level up to unlock more content!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-blue-300">
                  +{displayedRewards.xp.toLocaleString()}
                </div>
                <div className="text-blue-400">XP</div>
              </div>
            </div>
          </Card>

          {/* Level Up Banner */}
          {levelUps > 0 && animationStage >= 1 && (
            <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-300 p-6 animate-pulse">
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl">🎊</span>
                <div className="text-center">
                  <h3 className="text-4xl font-bold text-white">LEVEL UP!</h3>
                  <p className="text-2xl text-yellow-100">
                    {levelUps > 1 ? `+${levelUps} Levels!` : `Level ${newLevel}!`}
                  </p>
                  <p className="text-yellow-200 mt-2">
                    You gained {levelUps} skill {levelUps > 1 ? 'points' : 'point'}!
                  </p>
                </div>
                <span className="text-6xl">🎊</span>
              </div>
            </Card>
          )}

          {/* Silk Reward */}
          <Card
            className={`bg-gradient-to-r from-amber-900/60 to-orange-900/60 border-2 border-amber-400 p-6 transition-all duration-500 ${
              animationStage >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-6xl">💰</div>
                <div>
                  <h3 className="text-3xl font-bold text-amber-200">Silk Earned</h3>
                  <p className="text-amber-400">Use silk to upgrade units and skills!</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-5xl font-bold text-amber-300">
                  +{displayedRewards.silk.toLocaleString()}
                </div>
                <div className="text-amber-400">Silk</div>
              </div>
            </div>
          </Card>

          {/* Premium Silk Reward */}
          {rewards.premiumSilk && (
            <Card
              className={`bg-gradient-to-r from-purple-900/60 to-pink-900/60 border-2 border-purple-400 p-6 transition-all duration-500 ${
                animationStage >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="text-6xl">💎</div>
                  <div>
                    <h3 className="text-3xl font-bold text-purple-200">Premium Silk</h3>
                    <p className="text-purple-400">Rare currency for exclusive items!</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold text-purple-300">
                    +{displayedRewards.premiumSilk.toLocaleString()}
                  </div>
                  <div className="text-purple-400">Premium</div>
                </div>
              </div>
            </Card>
          )}

          {/* Title Reward */}
          {rewards.title && (
            <Card className="bg-gradient-to-r from-pink-900/60 to-red-900/60 border-2 border-pink-400 p-6">
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl">👑</span>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-pink-200 mb-2">New Title Unlocked!</h3>
                  <div className="text-4xl font-bold text-white">{rewards.title}</div>
                </div>
                <span className="text-6xl">👑</span>
              </div>
            </Card>
          )}

          {/* Unlock Reward */}
          {rewards.unlock && (
            <Card className="bg-gradient-to-r from-green-900/60 to-teal-900/60 border-2 border-green-400 p-6">
              <div className="flex items-center justify-center gap-4">
                <span className="text-6xl">🔓</span>
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-green-200 mb-2">New Content Unlocked!</h3>
                  <div className="text-3xl font-bold text-white capitalize">
                    {rewards.unlock.split(',').join(', ')}
                  </div>
                </div>
                <span className="text-6xl">🔓</span>
              </div>
            </Card>
          )}

          {/* Achievements */}
          {unlockedAchievements.length > 0 && animationStage >= 4 && (
            <Card className="bg-gradient-to-r from-indigo-900/60 to-blue-900/60 border-2 border-indigo-400 p-6">
              <h3 className="text-3xl font-bold text-indigo-200 mb-4 text-center">
                🏆 Achievements Unlocked! 🏆
              </h3>
              <div className="space-y-3">
                {unlockedAchievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="bg-black/30 p-4 rounded-lg border border-indigo-500 animate-pulse"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-4xl">✅</span>
                        <div>
                          <div className="text-xl font-bold text-indigo-200">{achievement.name}</div>
                          <div className="text-indigo-400">{achievement.description}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg text-indigo-300">
                          +{achievement.reward.xp} XP, +{achievement.reward.silk} Silk
                        </div>
                        {achievement.reward.title && (
                          <Badge className="bg-pink-600 mt-1">Title: {achievement.reward.title}</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={onContinue}
            className="bg-amber-600 hover:bg-amber-700 text-2xl px-12 py-6"
          >
            Continue
          </Button>
        </div>
      </div>
    </div>
  );
}

// Daily Reward Screen Component
interface DailyRewardScreenProps {
  currentDay: number;
  onClaim: () => void;
  onClose: () => void;
}

export function DailyRewardScreen({ currentDay, onClaim, onClose }: DailyRewardScreenProps) {
  const dailyRewards = RewardSystem.getDailyRewards();
  const currentReward = dailyRewards[currentDay - 1];

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <Card className="bg-gradient-to-b from-amber-900 to-orange-950 border-2 border-amber-400 p-8 max-w-2xl w-full">
        <div className="text-center mb-6">
          <h2 className="text-4xl font-bold text-amber-200 mb-2">Daily Login Bonus</h2>
          <p className="text-xl text-amber-400">Day {currentDay} of 7</p>
        </div>

        {/* Current Day Reward */}
        <Card className="bg-gradient-to-r from-yellow-600 to-orange-600 border-2 border-yellow-300 p-6 mb-6">
          <div className="text-center">
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-3xl font-bold text-white mb-4">Today's Reward</h3>
            <div className="flex justify-center gap-6 mb-4">
              <div className="bg-black/30 px-6 py-3 rounded-lg">
                <div className="text-3xl font-bold text-yellow-200">{currentReward.silk}</div>
                <div className="text-yellow-300">Silk</div>
              </div>
              {currentReward.premiumSilk && (
                <div className="bg-black/30 px-6 py-3 rounded-lg">
                  <div className="text-3xl font-bold text-purple-300">{currentReward.premiumSilk}</div>
                  <div className="text-purple-300">Premium</div>
                </div>
              )}
            </div>
            {currentReward.multiplier > 1 && (
              <Badge className="bg-red-600 text-white text-lg">
                {currentReward.multiplier}x BONUS!
              </Badge>
            )}
          </div>
        </Card>

        {/* Weekly Calendar */}
        <div className="grid grid-cols-7 gap-2 mb-6">
          {dailyRewards.map((reward, index) => {
            const day = index + 1;
            const isCurrent = day === currentDay;
            const isCompleted = day < currentDay;

            return (
              <div
                key={day}
                className={`p-3 rounded-lg border-2 text-center ${
                  isCurrent
                    ? 'bg-yellow-600 border-yellow-300'
                    : isCompleted
                    ? 'bg-green-800 border-green-600'
                    : 'bg-black/40 border-gray-600'
                }`}
              >
                <div className="text-xs text-amber-200 mb-1">Day {day}</div>
                <div className="text-lg font-bold text-white">{reward.silk}</div>
                {reward.premiumSilk && (
                  <div className="text-xs text-purple-300">+{reward.premiumSilk} 💎</div>
                )}
                {isCompleted && <div className="text-xl">✅</div>}
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button onClick={onClaim} className="flex-1 bg-amber-600 hover:bg-amber-700 text-xl py-6">
            Claim Reward
          </Button>
          <Button onClick={onClose} variant="outline" className="border-amber-600 text-amber-200">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}

// Loot Box Opening Component
interface LootBoxProps {
  tier: 'common' | 'rare' | 'epic' | 'legendary';
  onOpen: () => void;
  onClose: () => void;
}

export function LootBox({ tier, onOpen, onClose }: LootBoxProps) {
  const [opened, setOpened] = useState(false);
  const [reward, setReward] = useState<Reward | null>(null);

  const tierInfo = {
    common: { color: 'from-gray-600 to-gray-800', icon: '📦', name: 'Common' },
    rare: { color: 'from-blue-600 to-blue-800', icon: '📦', name: 'Rare' },
    epic: { color: 'from-purple-600 to-purple-800', icon: '🎁', name: 'Epic' },
    legendary: { color: 'from-yellow-600 to-orange-600', icon: '💎', name: 'Legendary' },
  };

  const handleOpen = () => {
    const generatedReward = RewardSystem.generateLootBox(tier);
    setReward(generatedReward);
    setOpened(true);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-8">
      <Card className={`bg-gradient-to-br ${tierInfo[tier].color} border-2 border-amber-400 p-8 max-w-lg w-full`}>
        {!opened ? (
          <div className="text-center">
            <div className="text-9xl mb-6 animate-bounce">{tierInfo[tier].icon}</div>
            <h2 className="text-4xl font-bold text-white mb-4">{tierInfo[tier].name} Loot Box</h2>
            <p className="text-xl text-amber-100 mb-8">Click to reveal your rewards!</p>
            <Button onClick={handleOpen} className="bg-amber-600 hover:bg-amber-700 text-2xl px-12 py-6">
              Open Box
            </Button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="text-3xl font-bold text-white mb-6">Rewards Obtained!</h2>
            <div className="space-y-4 mb-6">
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-4xl font-bold text-blue-300">+{reward?.xp}</div>
                <div className="text-blue-200">Experience</div>
              </div>
              <div className="bg-black/30 p-4 rounded-lg">
                <div className="text-4xl font-bold text-amber-300">+{reward?.silk}</div>
                <div className="text-amber-200">Silk</div>
              </div>
              {reward?.premiumSilk && (
                <div className="bg-black/30 p-4 rounded-lg">
                  <div className="text-4xl font-bold text-purple-300">+{reward.premiumSilk}</div>
                  <div className="text-purple-200">Premium Silk</div>
                </div>
              )}
            </div>
            <Button onClick={onClose} className="bg-amber-600 hover:bg-amber-700 text-xl px-8 py-4">
              Continue
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}
