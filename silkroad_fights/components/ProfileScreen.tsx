'use client';

import React, { useState } from 'react';
import { PlayerProfile, XPSystem, LeaderboardSystem, TitleSystem } from '@/lib/progressionSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ProfileScreenProps {
  profile: PlayerProfile;
  onBack: () => void;
  onEditProfile?: () => void;
}

export default function ProfileScreen({ profile, onBack, onEditProfile }: ProfileScreenProps) {
  const [selectedTab, setSelectedTab] = useState('stats');

  // Calculate XP progress
  const xpForNextLevel = XPSystem.getXPForLevel(profile.level + 1);
  const xpProgress = (profile.currentXP / xpForNextLevel) * 100;

  // Calculate player score
  const playerScore = LeaderboardSystem.calculatePlayerScore(profile);

  // Format playtime
  const formatPlaytime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  // Format date
  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-orange-950 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline" className="border-amber-600 text-amber-200">
            Back
          </Button>
          <h1 className="text-4xl font-bold text-amber-200">Player Profile</h1>
          {onEditProfile && (
            <Button onClick={onEditProfile} className="bg-amber-600 hover:bg-amber-700">
              Edit Profile
            </Button>
          )}
        </div>

        {/* Profile Header Card */}
        <Card className="bg-black/60 border-amber-600 p-8 mb-8">
          <div className="flex items-start gap-8">
            {/* Avatar */}
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center text-6xl">
              {profile.avatar === 'default' ? '👤' : profile.avatar}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h2 className="text-4xl font-bold text-amber-200">{profile.username}</h2>
                {profile.prestigeLevel > 0 && (
                  <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
                    Prestige {profile.prestigeLevel}
                  </Badge>
                )}
              </div>

              <p className="text-amber-400 text-xl mb-4">{profile.title}</p>

              {/* Level & XP */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-amber-200 text-lg">
                    Level {profile.level}
                  </span>
                  <span className="text-amber-400">
                    {profile.currentXP} / {xpForNextLevel} XP
                  </span>
                </div>
                <Progress value={xpProgress} className="h-4 bg-amber-950">
                  <div className="h-full bg-gradient-to-r from-amber-500 to-orange-600 transition-all" style={{ width: `${xpProgress}%` }} />
                </Progress>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <div className="bg-black/40 p-3 rounded-lg border border-amber-700">
                  <div className="text-2xl font-bold text-amber-300">{profile.stats.gamesWon}</div>
                  <div className="text-sm text-amber-500">Wins</div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-amber-700">
                  <div className="text-2xl font-bold text-amber-300">
                    {(profile.stats.winRate * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-amber-500">Win Rate</div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-amber-700">
                  <div className="text-2xl font-bold text-amber-300">{profile.silk}</div>
                  <div className="text-sm text-amber-500">Silk</div>
                </div>
                <div className="bg-black/40 p-3 rounded-lg border border-amber-700">
                  <div className="text-2xl font-bold text-purple-400">{playerScore}</div>
                  <div className="text-sm text-amber-500">Score</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
          <TabsList className="bg-black/60 border border-amber-600 mb-4">
            <TabsTrigger value="stats" className="data-[state=active]:bg-amber-600">
              Statistics
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-amber-600">
              Achievements
            </TabsTrigger>
            <TabsTrigger value="titles" className="data-[state=active]:bg-amber-600">
              Titles
            </TabsTrigger>
            <TabsTrigger value="unlocks" className="data-[state=active]:bg-amber-600">
              Unlocks
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-2 gap-6">
              {/* Combat Stats */}
              <Card className="bg-black/60 border-amber-600 p-6">
                <h3 className="text-2xl font-bold text-amber-200 mb-4">Combat Statistics</h3>
                <div className="space-y-3">
                  <StatRow label="Games Played" value={profile.stats.gamesPlayed} />
                  <StatRow label="Games Won" value={profile.stats.gamesWon} />
                  <StatRow label="Games Lost" value={profile.stats.gamesLost} />
                  <StatRow label="Win Rate" value={`${(profile.stats.winRate * 100).toFixed(1)}%`} />
                  <StatRow label="Units Killed" value={profile.stats.unitsKilled} />
                  <StatRow label="Units Lost" value={profile.stats.unitsLost} />
                  <StatRow label="K/D Ratio" value={(profile.stats.unitsKilled / Math.max(profile.stats.unitsLost, 1)).toFixed(2)} />
                  <StatRow label="Bosses Defeated" value={profile.stats.bossesDefeated} />
                  <StatRow label="Gold Delivered" value={profile.stats.goldDelivered} />
                </div>
              </Card>

              {/* Economy Stats */}
              <Card className="bg-black/60 border-amber-600 p-6">
                <h3 className="text-2xl font-bold text-amber-200 mb-4">Economy & Records</h3>
                <div className="space-y-3">
                  <StatRow label="Total Silk Earned" value={profile.stats.totalSilkEarned} />
                  <StatRow label="Total Silk Spent" value={profile.stats.totalSilkSpent} />
                  <StatRow label="Current Silk" value={profile.silk} color="text-amber-300" />
                  <StatRow label="Premium Silk" value={profile.premiumSilk} color="text-purple-400" />
                  <StatRow label="Total Playtime" value={formatPlaytime(profile.stats.totalPlaytimeSeconds)} />
                  <StatRow label="Longest Game" value={formatPlaytime(profile.stats.longestGameSeconds)} />
                  <StatRow label="Fastest Win" value={profile.stats.fastestWin === Infinity ? 'N/A' : `${Math.floor(profile.stats.fastestWin / 60)}:${String(profile.stats.fastestWin % 60).padStart(2, '0')}`} />
                  <StatRow label="Highest Win Streak" value={profile.stats.highestWinStreak} />
                  <StatRow label="Daily Streak" value={`${profile.dailyStreak} days`} />
                </div>
              </Card>

              {/* Account Info */}
              <Card className="bg-black/60 border-amber-600 p-6 col-span-2">
                <h3 className="text-2xl font-bold text-amber-200 mb-4">Account Information</h3>
                <div className="grid grid-cols-3 gap-4">
                  <StatRow label="Account Created" value={formatDate(profile.createdAt)} />
                  <StatRow label="Last Login" value={formatDate(profile.lastLogin)} />
                  <StatRow label="Player ID" value={profile.id.substring(0, 12) + '...'} />
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements">
            <Card className="bg-black/60 border-amber-600 p-6">
              <h3 className="text-2xl font-bold text-amber-200 mb-4">
                Achievements ({profile.achievements.filter(a => a.unlocked).length} / {profile.achievements.length})
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {profile.achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Titles Tab */}
          <TabsContent value="titles">
            <Card className="bg-black/60 border-amber-600 p-6">
              <h3 className="text-2xl font-bold text-amber-200 mb-4">Titles</h3>
              <div className="mb-4">
                <p className="text-amber-400">
                  Current Title: <span className="text-amber-200 font-bold">{profile.title}</span>
                </p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(TitleSystem.getAllTitles()).map(([title, info]) => (
                  <TitleCard
                    key={title}
                    title={title}
                    description={info.description}
                    requirement={info.requirement}
                    unlocked={profile.title === title || profile.achievements.some(a => a.reward.title === title && a.unlocked)}
                  />
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Unlocks Tab */}
          <TabsContent value="unlocks">
            <div className="grid grid-cols-2 gap-6">
              <Card className="bg-black/60 border-amber-600 p-6">
                <h3 className="text-2xl font-bold text-amber-200 mb-4">Unlocked Units</h3>
                <div className="space-y-2">
                  {profile.unlockedUnits.map((unit) => (
                    <div key={unit} className="flex items-center gap-3 bg-green-900/30 p-3 rounded border border-green-600">
                      <span className="text-2xl">
                        {unit === 'trader' ? '🛒' : unit === 'thief' ? '🥷' : unit === 'hunter' ? '🏹' : '👑'}
                      </span>
                      <span className="text-amber-200 font-semibold capitalize">{unit}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="bg-black/60 border-amber-600 p-6">
                <h3 className="text-2xl font-bold text-amber-200 mb-4">Unlocked Modes</h3>
                <div className="space-y-2">
                  {profile.unlockedModes.map((mode) => (
                    <div key={mode} className="flex items-center gap-3 bg-blue-900/30 p-3 rounded border border-blue-600">
                      <span className="text-2xl">🎮</span>
                      <span className="text-amber-200 font-semibold capitalize">{mode.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components
function StatRow({ label, value, color = 'text-amber-300' }: { label: string; value: string | number; color?: string }) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-amber-500">{label}:</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}

function AchievementCard({ achievement }: { achievement: any }) {
  const progress = (achievement.progress / achievement.goal) * 100;

  return (
    <div
      className={`p-4 rounded-lg border ${
        achievement.unlocked
          ? 'bg-green-900/30 border-green-600'
          : achievement.hidden && !achievement.unlocked
          ? 'bg-gray-900/30 border-gray-600'
          : 'bg-black/40 border-amber-700'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-bold ${achievement.unlocked ? 'text-green-300' : 'text-amber-300'}`}>
          {achievement.hidden && !achievement.unlocked ? '???' : achievement.name}
        </h4>
        {achievement.unlocked && <span className="text-2xl">✅</span>}
      </div>
      <p className="text-sm text-amber-500 mb-2">
        {achievement.hidden && !achievement.unlocked ? 'Hidden achievement' : achievement.description}
      </p>
      {!achievement.unlocked && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-amber-400 mb-1">
            <span>Progress</span>
            <span>{achievement.progress} / {achievement.goal}</span>
          </div>
          <Progress value={progress} className="h-2 bg-amber-950">
            <div className="h-full bg-amber-600 transition-all" style={{ width: `${progress}%` }} />
          </Progress>
        </div>
      )}
      <div className="mt-2 text-xs text-amber-400">
        Reward: {achievement.reward.xp} XP, {achievement.reward.silk} Silk
        {achievement.reward.title && ` + Title: ${achievement.reward.title}`}
      </div>
    </div>
  );
}

function TitleCard({ title, description, requirement, unlocked }: { title: string; description: string; requirement: string; unlocked: boolean }) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        unlocked ? 'bg-amber-900/30 border-amber-600' : 'bg-black/40 border-gray-600 opacity-50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h4 className={`font-bold ${unlocked ? 'text-amber-200' : 'text-gray-500'}`}>{title}</h4>
        {unlocked && <span className="text-xl">⭐</span>}
      </div>
      <p className="text-sm text-amber-500 mb-2">{description}</p>
      <p className="text-xs text-amber-600">{requirement}</p>
    </div>
  );
}
