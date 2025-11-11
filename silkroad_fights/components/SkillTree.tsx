'use client';

import React, { useState } from 'react';
import { PlayerProfile, SkillTreeSystem, Skill, SkillTreeProgress } from '@/lib/progressionSystem';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface SkillTreeProps {
  profile: PlayerProfile;
  onUnlockSkill: (skillId: string) => void;
  onRespec: () => void;
  onBack: () => void;
}

export default function SkillTree({ profile, onUnlockSkill, onRespec, onBack }: SkillTreeProps) {
  const [selectedBranch, setSelectedBranch] = useState<'offense' | 'defense' | 'economy'>('offense');

  const skillTree = profile.skillTree;
  const respecCost = SkillTreeSystem.getRespecCost(skillTree.totalPointsSpent);
  const bonuses = SkillTreeSystem.calculateBonuses(skillTree);

  const branchInfo = {
    offense: {
      name: 'Offense',
      icon: '⚔️',
      color: 'from-red-600 to-red-800',
      description: 'Increase damage output and combat effectiveness',
    },
    defense: {
      name: 'Defense',
      icon: '🛡️',
      color: 'from-blue-600 to-blue-800',
      description: 'Improve survivability and unit durability',
    },
    economy: {
      name: 'Economy',
      icon: '💰',
      color: 'from-amber-600 to-amber-800',
      description: 'Boost resource generation and efficiency',
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-900 via-orange-950 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button onClick={onBack} variant="outline" className="border-amber-600 text-amber-200">
            Back
          </Button>
          <h1 className="text-4xl font-bold text-amber-200">Skill Tree</h1>
          <div className="flex items-center gap-4">
            <div className="bg-black/60 px-6 py-3 rounded-lg border border-purple-600">
              <span className="text-2xl">⭐</span>
              <span className="text-2xl font-bold text-purple-300 ml-2">{skillTree.pointsAvailable}</span>
              <span className="text-purple-400 ml-2">Points Available</span>
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <Card className="bg-black/60 border-amber-600 p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-amber-200 mb-2">Total Skill Points</h3>
              <div className="flex items-center gap-6">
                <div>
                  <span className="text-2xl font-bold text-purple-300">{skillTree.totalPointsSpent}</span>
                  <span className="text-amber-500 ml-2">Spent</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-green-300">{skillTree.pointsAvailable}</span>
                  <span className="text-amber-500 ml-2">Available</span>
                </div>
              </div>
            </div>

            <div className="flex-1 mx-8">
              <h3 className="text-xl font-bold text-amber-200 mb-2">Active Bonuses</h3>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(bonuses).slice(0, 8).map(([stat, value]) => (
                  <div key={stat} className="bg-black/40 px-3 py-2 rounded border border-green-600">
                    <div className="text-xs text-amber-400 capitalize">{stat.replace(/([A-Z])/g, ' $1').trim()}</div>
                    <div className="text-lg font-bold text-green-300">+{value}</div>
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={onRespec}
              disabled={skillTree.totalPointsSpent === 0 || profile.silk < respecCost}
              className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600"
            >
              <div className="text-center">
                <div>Respec</div>
                <div className="text-xs">{respecCost} Silk</div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Branch Selection */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(branchInfo).map(([branchKey, info]) => {
            const isSelected = selectedBranch === branchKey;
            const branch = skillTree[branchKey as keyof typeof skillTree] as any;
            const totalSkills = branch.skills?.length || 0;
            const unlockedSkills = branch.skills?.filter((s: Skill) => s.unlocked).length || 0;

            return (
              <Card
                key={branchKey}
                className={`cursor-pointer transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br ' + info.color + ' border-amber-400 border-2 scale-105'
                    : 'bg-black/60 border-amber-600 hover:scale-102'
                }`}
                onClick={() => setSelectedBranch(branchKey as any)}
              >
                <div className="p-6 text-center">
                  <div className="text-6xl mb-3">{info.icon}</div>
                  <h3 className="text-2xl font-bold text-amber-200 mb-2">{info.name}</h3>
                  <p className="text-amber-400 text-sm mb-3">{info.description}</p>
                  <Badge className="bg-black/40">
                    {unlockedSkills} / {totalSkills} Unlocked
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Skills Display */}
        <div className="space-y-8">
          {[1, 2, 3, 4].map((tier) => {
            const tierSkills = skillTree[selectedBranch].skills.filter((s: Skill) => s.tier === tier);
            if (tierSkills.length === 0) return null;

            return (
              <div key={tier}>
                <div className="flex items-center gap-3 mb-4">
                  <h3 className="text-2xl font-bold text-amber-200">Tier {tier}</h3>
                  <div className="flex-1 h-px bg-amber-600"></div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {tierSkills.map((skill: Skill) => (
                    <SkillCard
                      key={skill.id}
                      skill={skill}
                      skillTree={skillTree}
                      pointsAvailable={skillTree.pointsAvailable}
                      onUnlock={() => onUnlockSkill(skill.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Info */}
        <Card className="bg-blue-900/20 border-blue-600 p-6 mt-8">
          <div className="flex items-start gap-4">
            <span className="text-3xl">ℹ️</span>
            <div>
              <h3 className="text-xl font-bold text-blue-300 mb-2">Skill Tree Guide</h3>
              <ul className="text-blue-200 space-y-1">
                <li>• Gain 1 skill point per level</li>
                <li>• Skills can be upgraded multiple times up to their max rank</li>
                <li>• Higher tier skills require unlocking prerequisite skills</li>
                <li>• Passive skills are always active</li>
                <li>• Active skills can be used in-game with cooldowns</li>
                <li>• Use Respec to reset your skill tree (costs silk based on points spent)</li>
                <li>• Prestige grants bonus starting skill points</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Skill Card Component
interface SkillCardProps {
  skill: Skill;
  skillTree: SkillTreeProgress;
  pointsAvailable: number;
  onUnlock: () => void;
}

function SkillCard({ skill, skillTree, pointsAvailable, onUnlock }: SkillCardProps) {
  const canUnlock = SkillTreeSystem.canUnlockSkill(skill, skillTree);
  const isMaxRank = skill.currentRank >= skill.maxRank;
  const progress = (skill.currentRank / skill.maxRank) * 100;

  // Check if prerequisite is met
  const hasPrerequisite = skill.prerequisite !== undefined;
  let prerequisiteMet = true;
  let prerequisiteName = '';

  if (hasPrerequisite) {
    const branch = skill.id.startsWith('off') ? 'offense' :
                   skill.id.startsWith('def') ? 'defense' : 'economy';
    const prereqSkill = skillTree[branch].skills.find(s => s.id === skill.prerequisite);
    prerequisiteMet = prereqSkill ? prereqSkill.currentRank > 0 : false;
    prerequisiteName = prereqSkill?.name || '';
  }

  const getTypeColor = () => {
    if (skill.effect.type === 'active') return 'from-purple-600 to-purple-800';
    return skill.id.startsWith('off') ? 'from-red-700 to-red-900' :
           skill.id.startsWith('def') ? 'from-blue-700 to-blue-900' :
           'from-amber-700 to-amber-900';
  };

  const getTypeIcon = () => {
    if (skill.effect.type === 'active') return '🔥';
    return skill.id.startsWith('off') ? '⚔️' :
           skill.id.startsWith('def') ? '🛡️' : '💰';
  };

  return (
    <Card className={`bg-gradient-to-br ${getTypeColor()} border-2 ${
      skill.unlocked ? 'border-green-500' : canUnlock ? 'border-amber-400' : 'border-gray-600 opacity-70'
    } p-6`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{getTypeIcon()}</span>
          <div>
            <h4 className="text-xl font-bold text-white">{skill.name}</h4>
            <Badge className={`mt-1 ${skill.effect.type === 'active' ? 'bg-purple-500' : 'bg-blue-500'}`}>
              {skill.effect.type === 'active' ? 'Active' : 'Passive'}
            </Badge>
          </div>
        </div>
        <div className="text-right">
          <Badge className="bg-black/40 text-white text-lg px-3 py-1 mb-1">
            {skill.currentRank} / {skill.maxRank}
          </Badge>
          <div className="text-amber-200 text-sm">Cost: {skill.cost} SP</div>
        </div>
      </div>

      <p className="text-amber-100 mb-4">{skill.description}</p>

      {/* Prerequisites */}
      {hasPrerequisite && (
        <div className={`text-sm mb-3 flex items-center gap-2 ${prerequisiteMet ? 'text-green-300' : 'text-red-300'}`}>
          {prerequisiteMet ? '✅' : '🔒'} Requires: {prerequisiteName}
        </div>
      )}

      {/* Progress Bar */}
      {skill.currentRank > 0 && (
        <div className="mb-4">
          <div className="h-2 bg-black/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Effect Display */}
      <div className="bg-black/30 p-3 rounded mb-4 border border-amber-500/30">
        <div className="text-xs text-amber-400 mb-1">Effect:</div>
        <div className="text-amber-200 font-semibold">
          {formatEffect(skill.effect, skill.currentRank + 1)}
        </div>
        {skill.currentRank > 0 && (
          <div className="text-xs text-green-300 mt-1">
            Current: {formatEffect(skill.effect, skill.currentRank)}
          </div>
        )}
      </div>

      {/* Unlock Button */}
      <Button
        onClick={onUnlock}
        disabled={!canUnlock || isMaxRank}
        className={`w-full ${
          isMaxRank ? 'bg-gray-600 cursor-not-allowed' :
          canUnlock ? 'bg-amber-600 hover:bg-amber-700' :
          'bg-gray-600 cursor-not-allowed'
        }`}
      >
        {isMaxRank ? 'Max Rank' :
         skill.currentRank === 0 ? 'Unlock' :
         'Upgrade'}
      </Button>

      {/* Status Messages */}
      {!canUnlock && !isMaxRank && (
        <div className="mt-2 text-center text-sm">
          {pointsAvailable < skill.cost && (
            <span className="text-red-300">Not enough skill points</span>
          )}
          {!prerequisiteMet && pointsAvailable >= skill.cost && (
            <span className="text-red-300">Prerequisite not met</span>
          )}
        </div>
      )}
    </Card>
  );
}

// Helper function to format effect text
function formatEffect(effect: any, rank: number): string {
  const value = effect.stackable ? effect.value * rank : effect.value;

  switch (effect.stat) {
    case 'attackDamage':
      return `+${value} Attack Damage`;
    case 'attackSpeed':
      return `+${(value * 100).toFixed(0)}% Attack Speed`;
    case 'maxHp':
      return `+${value} Max HP`;
    case 'movementSpeed':
      return `+${(value * 100).toFixed(0)}% Movement Speed`;
    case 'critChance':
      return `${(value * 100).toFixed(0)}% Critical Strike Chance`;
    case 'healOnKill':
      return `Heal ${value} HP on Kill`;
    case 'damageReduction':
      return `${(value * 100).toFixed(0)}% Damage Reduction`;
    case 'dodgeChance':
      return `${(value * 100).toFixed(0)}% Dodge Chance`;
    case 'startingSilk':
      return `Start with +${value} Silk`;
    case 'silkSpawnRate':
      return `+${(value * 100).toFixed(0)}% Silk Spawn Rate`;
    case 'goldCapacity':
      return `+${value} Gold Capacity`;
    case 'unitCostReduction':
      return `${(value * 100).toFixed(0)}% Unit Cost Reduction`;
    case 'devastatingBlow':
      return `Deal ${value}x damage on next attack (30s CD)`;
    case 'fortify':
      return `Invulnerable for ${value} seconds (60s CD)`;
    case 'silkStorm':
      return `Gain ${value} silk instantly (90s CD)`;
    default:
      return `+${value} ${effect.stat}`;
  }
}
