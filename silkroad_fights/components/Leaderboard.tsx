'use client';

import React, { useState } from 'react';
import { LeaderboardEntry, LeaderboardSystem } from '@/lib/progressionSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LeaderboardProps {
  currentPlayerId: string;
  onBack: () => void;
}

export default function Leaderboard({ currentPlayerId, onBack }: LeaderboardProps) {
  const [selectedCategory, setSelectedCategory] = useState('Overall');
  const [timeFilter, setTimeFilter] = useState<'all' | 'weekly' | 'monthly'>('all');

  // In a real implementation, this would fetch from a backend
  // For now, we'll generate mock data
  const mockLeaderboard = generateMockLeaderboard(50, currentPlayerId);

  const categories = LeaderboardSystem.getCategories();

  // Filter leaderboard based on category
  const filteredLeaderboard = filterByCategory(mockLeaderboard, selectedCategory);

  // Find current player rank
  const currentPlayerRank = filteredLeaderboard.findIndex(
    entry => entry.playerId === currentPlayerId
  ) + 1;

  const currentPlayerEntry = filteredLeaderboard.find(
    entry => entry.playerId === currentPlayerId
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-orange-950 to-black p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline" className="border-amber-600 text-amber-200">
            Back
          </Button>
          <h1 className="text-4xl font-bold text-amber-200">Leaderboards</h1>
          <div className="w-24"></div>
        </div>

        {/* Time Filter */}
        <div className="flex justify-center gap-4 mb-8">
          <Button
            onClick={() => setTimeFilter('all')}
            className={timeFilter === 'all' ? 'bg-amber-600' : 'bg-black/60 border border-amber-600'}
          >
            All Time
          </Button>
          <Button
            onClick={() => setTimeFilter('weekly')}
            className={timeFilter === 'weekly' ? 'bg-amber-600' : 'bg-black/60 border border-amber-600'}
          >
            This Week
          </Button>
          <Button
            onClick={() => setTimeFilter('monthly')}
            className={timeFilter === 'monthly' ? 'bg-amber-600' : 'bg-black/60 border border-amber-600'}
          >
            This Month
          </Button>
        </div>

        {/* Category Tabs */}
        <Card className="bg-black/60 border-amber-600 p-6 mb-6">
          <div className="grid grid-cols-4 gap-3">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`${
                  selectedCategory === category
                    ? 'bg-amber-600 hover:bg-amber-700'
                    : 'bg-black/40 border border-amber-700 hover:bg-amber-800/50'
                }`}
              >
                {category}
              </Button>
            ))}
          </div>
        </Card>

        {/* Current Player Card */}
        {currentPlayerEntry && (
          <Card className="bg-gradient-to-r from-purple-900/60 to-blue-900/60 border-2 border-purple-400 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-purple-300">#{currentPlayerRank}</div>
                  <div className="text-sm text-purple-400">Your Rank</div>
                </div>
                <div className="h-16 w-px bg-purple-400"></div>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-blue-700 flex items-center justify-center text-3xl">
                    {currentPlayerEntry.avatar}
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-amber-200">{currentPlayerEntry.username}</div>
                    <div className="text-amber-400">{currentPlayerEntry.title}</div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-300">{currentPlayerEntry.score.toLocaleString()}</div>
                <div className="text-purple-400">Score</div>
              </div>
            </div>
          </Card>
        )}

        {/* Top 3 Podium */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {filteredLeaderboard.slice(0, 3).map((entry, index) => (
            <PodiumCard key={entry.playerId} entry={entry} position={index + 1} />
          ))}
        </div>

        {/* Leaderboard List */}
        <Card className="bg-black/60 border-amber-600">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-amber-200 mb-4">Rankings</h3>

            {/* Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-black/40 rounded-lg mb-2 font-bold text-amber-400">
              <div className="col-span-1">Rank</div>
              <div className="col-span-5">Player</div>
              <div className="col-span-2 text-center">Level</div>
              <div className="col-span-4 text-right">Score</div>
            </div>

            {/* Entries */}
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {filteredLeaderboard.slice(3).map((entry) => (
                <LeaderboardRow
                  key={entry.playerId}
                  entry={entry}
                  isCurrentPlayer={entry.playerId === currentPlayerId}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Season Info */}
        <Card className="bg-blue-900/20 border-blue-600 p-6 mt-6">
          <div className="flex items-start gap-4">
            <span className="text-3xl">🏆</span>
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-2">Competitive Season</h3>
              <p className="text-blue-200 mb-2">
                Season 1 is currently active! Compete for the top spots and earn exclusive rewards.
              </p>
              <div className="flex gap-6 text-sm">
                <div>
                  <span className="text-blue-400">Season Ends:</span>
                  <span className="text-blue-200 ml-2 font-bold">30 days</span>
                </div>
                <div>
                  <span className="text-blue-400">Total Players:</span>
                  <span className="text-blue-200 ml-2 font-bold">10,247</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Podium Card for Top 3
function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: number }) {
  const medals = ['🥇', '🥈', '🥉'];
  const colors = [
    'from-yellow-600 to-yellow-800 border-yellow-400',
    'from-gray-400 to-gray-600 border-gray-300',
    'from-orange-600 to-orange-800 border-orange-400',
  ];
  const heights = ['h-48', 'h-40', 'h-36'];

  return (
    <Card className={`bg-gradient-to-br ${colors[position - 1]} border-2 p-6 ${heights[position - 1]} flex flex-col justify-between`}>
      <div className="text-center">
        <div className="text-6xl mb-2">{medals[position - 1]}</div>
        <div className="text-4xl font-bold text-white mb-1">#{position}</div>
      </div>
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center text-3xl mx-auto mb-2">
          {entry.avatar}
        </div>
        <div className="text-xl font-bold text-white mb-1">{entry.username}</div>
        <div className="text-sm text-amber-100 mb-2">{entry.title}</div>
        <Badge className="bg-black/40 text-white">
          Level {entry.level}
        </Badge>
        <div className="text-2xl font-bold text-white mt-2">
          {entry.score.toLocaleString()}
        </div>
      </div>
    </Card>
  );
}

// Leaderboard Row
function LeaderboardRow({ entry, isCurrentPlayer }: { entry: LeaderboardEntry; isCurrentPlayer: boolean }) {
  return (
    <div
      className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg transition-all ${
        isCurrentPlayer
          ? 'bg-purple-900/40 border-2 border-purple-400'
          : 'bg-black/20 hover:bg-amber-900/20 border border-amber-700/30'
      }`}
    >
      {/* Rank */}
      <div className="col-span-1 flex items-center">
        <span className={`text-xl font-bold ${isCurrentPlayer ? 'text-purple-300' : 'text-amber-300'}`}>
          #{entry.rank}
        </span>
      </div>

      {/* Player */}
      <div className="col-span-5 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-700 flex items-center justify-center text-2xl">
          {entry.avatar}
        </div>
        <div>
          <div className={`font-bold ${isCurrentPlayer ? 'text-purple-200' : 'text-amber-200'}`}>
            {entry.username}
            {isCurrentPlayer && <span className="ml-2 text-purple-400">(You)</span>}
          </div>
          <div className="text-sm text-amber-500">{entry.title}</div>
        </div>
      </div>

      {/* Level */}
      <div className="col-span-2 flex items-center justify-center">
        <Badge className="bg-amber-600 text-white text-lg px-3">
          Lv {entry.level}
        </Badge>
      </div>

      {/* Score */}
      <div className="col-span-4 flex items-center justify-end">
        <span className={`text-2xl font-bold ${isCurrentPlayer ? 'text-purple-300' : 'text-amber-300'}`}>
          {entry.score.toLocaleString()}
        </span>
      </div>
    </div>
  );
}

// Helper function to generate mock leaderboard data
function generateMockLeaderboard(count: number, currentPlayerId: string): LeaderboardEntry[] {
  const titles = [
    'Silk Road Immortal',
    'Legendary Trader',
    'Master Tactician',
    'Boss Slayer',
    'Shadow Walker',
    'Elite Merchant',
    'Champion',
    'Veteran',
  ];

  const avatars = ['👤', '🎭', '👑', '🦁', '🐉', '🦅', '🐺', '🦊'];

  const entries: LeaderboardEntry[] = [];

  for (let i = 0; i < count; i++) {
    entries.push({
      rank: i + 1,
      playerId: i === 24 ? currentPlayerId : `player_${i}`,
      username: i === 24 ? 'You' : `Player${i + 1}`,
      avatar: avatars[Math.floor(Math.random() * avatars.length)],
      level: Math.max(1, 100 - Math.floor(i * 1.5)),
      score: Math.max(100, 10000 - i * 150 + Math.floor(Math.random() * 100)),
      title: titles[Math.min(Math.floor(i / 7), titles.length - 1)],
    });
  }

  return entries;
}

// Helper function to filter by category
function filterByCategory(leaderboard: LeaderboardEntry[], category: string): LeaderboardEntry[] {
  // In a real implementation, this would filter based on different stats
  // For now, we'll just return the same leaderboard with slight modifications
  const filtered = [...leaderboard];

  // Sort differently based on category
  switch (category) {
    case 'Most Wins':
      filtered.sort((a, b) => b.score - a.score);
      break;
    case 'Best Win Rate':
      filtered.sort((a, b) => b.level - a.level);
      break;
    case 'Boss Slayers':
      filtered.sort((a, b) => (b.score + b.level * 10) - (a.score + a.level * 10));
      break;
    default:
      // Keep original order
      break;
  }

  // Update ranks
  filtered.forEach((entry, index) => {
    entry.rank = index + 1;
  });

  return filtered;
}
