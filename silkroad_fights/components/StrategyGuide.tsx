/**
 * STRATEGY GUIDE
 *
 * In-game strategy guide with:
 * - Unit counters and matchups
 * - Positioning tips
 * - Timing advice
 * - Advanced tactics
 * - Meta strategies
 * - Searchable content
 */

"use client"

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Book,
  Search,
  X,
  Sword,
  Shield,
  Zap,
  Target,
  Users,
  Trophy,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  ChevronDown
} from 'lucide-react';

// ============================================================================
// STRATEGY DATA
// ============================================================================

interface StrategyEntry {
  id: string;
  category: 'units' | 'abilities' | 'tactics' | 'bosses' | 'meta' | 'advanced';
  title: string;
  icon: React.ReactNode;
  content: string;
  tips?: string[];
  counters?: { unit: string; strength: string }[];
  tags: string[];
}

const STRATEGY_DATABASE: StrategyEntry[] = [
  // UNIT GUIDES
  {
    id: 'trader_warrior',
    category: 'units',
    title: 'Trader Warrior',
    icon: <Sword className="w-5 h-5" />,
    content:
      'The Trader Warrior is a balanced frontline unit with moderate HP, damage, and defense. Best used as a versatile fighter that can adapt to various situations.',
    tips: [
      'Use as primary frontline to absorb damage',
      'Pairs well with Archers for mixed damage',
      'Can solo most Thieves in fair fights',
      'Keep near gold carriers for protection'
    ],
    counters: [
      { unit: 'Thief Scout', strength: 'Strong - Can kite and escape' },
      { unit: 'Thief Bandit', strength: 'Even - Fair matchup' },
      { unit: 'Thief Assassin', strength: 'Weak - High burst damage kills quickly' }
    ],
    tags: ['trader', 'warrior', 'tank', 'frontline', 'balanced']
  },
  {
    id: 'trader_archer',
    category: 'units',
    title: 'Trader Archer',
    icon: <Target className="w-5 h-5" />,
    content:
      'Long-range damage dealer with high mobility but low HP. Excels at kiting enemies and dealing consistent damage from safety.',
    tips: [
      'Always maintain distance from melee units',
      'Use terrain and allies as barriers',
      'Focus fire on low HP targets',
      'Excellent against bosses (especially TigerGiry)',
      'Retreat when enemies get close'
    ],
    counters: [
      { unit: 'Thief Scout', strength: 'Weak - Speed closes gap quickly' },
      { unit: 'Thief Assassin', strength: 'Weak - One-shot potential' },
      { unit: 'SkeletoKing', strength: 'Strong - Ranged advantage vs stationary boss' }
    ],
    tags: ['trader', 'archer', 'ranged', 'dps', 'kiting']
  },
  {
    id: 'trader_guard',
    category: 'units',
    title: 'Trader Guard',
    icon: <Shield className="w-5 h-5" />,
    content:
      'Ultimate tank with highest HP and defense. Slow but incredibly durable. Perfect for protecting gold carriers and absorbing enemy focus.',
    tips: [
      'Always escort gold carriers',
      'Position between enemies and your squishies',
      'Use Shield Wall ability for maximum tankiness',
      'Accept being slow - your job is to absorb damage',
      'Draw aggro from multiple enemies'
    ],
    counters: [
      { unit: 'Thief Bandit', strength: 'Even - High damage vs high defense' },
      { unit: 'Multiple Thieves', strength: 'Strong - Can tank several at once' },
      { unit: 'Thief Scout', strength: 'Weak - Gets kited endlessly' }
    ],
    tags: ['trader', 'guard', 'tank', 'defense', 'escort']
  },
  {
    id: 'thief_scout',
    category: 'units',
    title: 'Thief Scout',
    icon: <Zap className="w-5 h-5" />,
    content:
      'Fastest unit in the game with high attack speed but lowest HP. Excels at harassment, interception, and hit-and-run tactics.',
    tips: [
      'Use speed to intercept gold carriers',
      'Never fight fair - hit and run',
      'Chase down wounded enemies',
      'Scout ahead and collect silk quickly',
      'Avoid tanky units'
    ],
    counters: [
      { unit: 'Trader Archer', strength: 'Strong - Can chase and finish' },
      { unit: 'Gold Carriers', strength: 'Strong - Intercept and harass' },
      { unit: 'Trader Guard', strength: 'Weak - Can\'t penetrate defense' }
    ],
    tags: ['thief', 'scout', 'speed', 'harassment', 'mobility']
  },
  {
    id: 'thief_bandit',
    category: 'units',
    title: 'Thief Bandit',
    icon: <Sword className="w-5 h-5" />,
    content:
      'Solid bruiser with high damage and good HP. The reliable frontline fighter for the Thief team.',
    tips: [
      'Lead attacks with your high damage',
      'Trade favorably against most Trader units',
      'Protect your Scouts and Assassins',
      'Focus on eliminating Archers first',
      'Can solo most units except Guards'
    ],
    counters: [
      { unit: 'Trader Warrior', strength: 'Strong - Higher damage wins' },
      { unit: 'Trader Guard', strength: 'Even - Damage vs defense' },
      { unit: 'Trader Archer', strength: 'Strong - If you can close gap' }
    ],
    tags: ['thief', 'bandit', 'bruiser', 'damage', 'frontline']
  },
  {
    id: 'thief_assassin',
    category: 'units',
    title: 'Thief Assassin',
    icon: <Sword className="w-5 h-5" />,
    content:
      'Glass cannon with highest damage output. High risk, high reward. Can delete priority targets instantly.',
    tips: [
      'One-shot Archers and wounded units',
      'Use Smoke Bomb before engaging',
      'Always have escape route planned',
      'Target gold carriers for maximum impact',
      'Never fight Guards head-on'
    ],
    counters: [
      { unit: 'Trader Archer', strength: 'Strong - If you strike first' },
      { unit: 'Trader Warrior', strength: 'Even - Burst vs sustain' },
      { unit: 'Trader Guard', strength: 'Weak - Can\'t burst through HP' }
    ],
    tags: ['thief', 'assassin', 'burst', 'glass-cannon', 'high-risk']
  },

  // BOSS STRATEGIES
  {
    id: 'boss_tigergiry',
    category: 'bosses',
    title: 'TigerGiry Strategy',
    icon: <AlertTriangle className="w-5 h-5" />,
    content:
      'TigerGiry is a fast melee boss with moderate HP. The key is kiting - use ranged units and movement abilities to maintain distance.',
    tips: [
      'Use Archers as primary damage dealers',
      'Keep at least 2 tiles distance',
      'Use Dash or Sprint to escape',
      'Lead boss away from your base',
      'Fight as a team - 2-3 units minimum',
      'Reward: Tiger Strength buff (+10 damage)'
    ],
    counters: [
      { unit: 'Trader Archer', strength: 'Excellent - Range advantage' },
      { unit: 'Units with Dash', strength: 'Good - Maintain distance' },
      { unit: 'Melee units', strength: 'Risky - High damage attacks' }
    ],
    tags: ['boss', 'tigergiry', 'kiting', 'ranged', 'speed']
  },
  {
    id: 'boss_skeletoking',
    category: 'bosses',
    title: 'SkeletoKing Strategy',
    icon: <AlertTriangle className="w-5 h-5" />,
    content:
      'SkeletoKing is the tankiest boss with high defense and area attacks. Requires sustained damage and careful positioning.',
    tips: [
      'Spread out units to minimize AoE damage',
      'Use high DPS units (Assassins, Warriors)',
      'Focus fire - attack together',
      'Expect a long fight (60+ seconds)',
      'Use abilities to break defense',
      'Reward: Skeleton Armor buff (+15 defense)'
    ],
    counters: [
      { unit: 'Multiple DPS', strength: 'Required - Solo is impossible' },
      { unit: 'Thief Assassin', strength: 'Good - Burst damage' },
      { unit: 'Abilities', strength: 'Essential - Break armor' }
    ],
    tags: ['boss', 'skeletoking', 'tank', 'focus-fire', 'teamwork']
  },
  {
    id: 'boss_murucha',
    category: 'bosses',
    title: 'Murucha Strategy',
    icon: <AlertTriangle className="w-5 h-5" />,
    content:
      'Murucha is fast and deadly with highest damage but lower HP. Requires burst damage and careful tanking.',
    tips: [
      'Use Guard to tank opening attacks',
      'Burst damage is key - kill fast',
      'Coordinate all units for alpha strike',
      'Use CC abilities if available',
      'Trade HP for quick kill',
      'Reward: Murucha Speed buff (+50% movement)'
    ],
    counters: [
      { unit: 'Trader Guard', strength: 'Essential - Tank damage' },
      { unit: 'Burst damage', strength: 'Required - Kill before wiped' },
      { unit: 'Solo units', strength: 'Suicide - Will be deleted' }
    ],
    tags: ['boss', 'murucha', 'burst', 'speed', 'dangerous']
  },

  // TACTICS
  {
    id: 'positioning',
    category: 'tactics',
    title: 'Positioning Fundamentals',
    icon: <Target className="w-5 h-5" />,
    content:
      'Good positioning is the difference between winning and losing. Always think about unit placement and formation.',
    tips: [
      'Keep units within 2 tiles for mutual support',
      'Place tanks in front, DPS in back',
      'Control chokepoints and narrow paths',
      'Maintain escape routes',
      'Use terrain to funnel enemies',
      'Surround enemies for bonus damage'
    ],
    tags: ['tactics', 'positioning', 'formation', 'fundamentals']
  },
  {
    id: 'gold_control',
    category: 'tactics',
    title: 'Gold Control & Delivery',
    icon: <Trophy className="w-5 h-5" />,
    content:
      'Gold is the primary win condition. Master the art of safely collecting and delivering gold.',
    tips: [
      'Always escort gold carriers',
      'Use fastest route to base',
      'Guards are best gold carriers',
      'Drop gold if surrounded to save it',
      'Time deliveries during enemy downtime',
      'Intercepting enemy gold is high priority'
    ],
    tags: ['tactics', 'gold', 'objective', 'win-condition']
  },
  {
    id: 'ability_timing',
    category: 'tactics',
    title: 'Ability Timing',
    icon: <Zap className="w-5 h-5" />,
    content: 'Abilities are powerful but limited by silk cost. Knowing when to use them is crucial.',
    tips: [
      'Save abilities for critical moments',
      'Defensive abilities when low HP',
      'Offensive abilities for kills',
      'Movement abilities for escapes/pursuits',
      'Don\'t hoard - use them!',
      'Coordinate abilities with team'
    ],
    tags: ['tactics', 'abilities', 'timing', 'resource-management']
  },
  {
    id: 'flanking',
    category: 'tactics',
    title: 'Flanking & Surround',
    icon: <Users className="w-5 h-5" />,
    content:
      'Attacking from multiple angles provides significant advantages. Master the art of the flank.',
    tips: [
      'Attack from 2+ sides simultaneously',
      'Split enemy attention',
      'Cut off escape routes',
      'Use Scouts to get behind enemies',
      'Pincer movements are devastating',
      'Don\'t overextend while flanking'
    ],
    tags: ['tactics', 'flanking', 'advanced', 'positioning']
  },

  // META STRATEGIES
  {
    id: 'early_game',
    category: 'meta',
    title: 'Early Game (Rounds 1-5)',
    icon: <TrendingUp className="w-5 h-5" />,
    content: 'The opening phase focuses on securing resources and establishing map control.',
    tips: [
      'Collect silk aggressively',
      'Avoid unnecessary fights',
      'Scout enemy positions',
      'Grab first gold spawn',
      'Establish map presence',
      'Save abilities for mid game'
    ],
    tags: ['meta', 'early-game', 'strategy', 'phases']
  },
  {
    id: 'mid_game',
    category: 'meta',
    title: 'Mid Game (Rounds 6-12)',
    icon: <TrendingUp className="w-5 h-5" />,
    content: 'The action phase where teams clash over objectives and positioning.',
    tips: [
      'Contest gold spawns actively',
      'Use abilities more frequently',
      'Take favorable fights',
      'Prepare for first boss spawn',
      'Maintain unit count',
      'Apply pressure or defend'
    ],
    tags: ['meta', 'mid-game', 'strategy', 'phases']
  },
  {
    id: 'late_game',
    category: 'meta',
    title: 'Late Game (Round 13+)',
    icon: <TrendingUp className="w-5 h-5" />,
    content: 'The decisive phase where one team pushes for victory.',
    tips: [
      'Go for game-ending plays',
      'Use all available abilities',
      'Coordinate boss takedowns',
      'Force decisive fights',
      'Protect leads aggressively',
      'Make risky plays if behind'
    ],
    tags: ['meta', 'late-game', 'strategy', 'phases']
  },

  // ADVANCED TACTICS
  {
    id: 'bait_and_punish',
    category: 'advanced',
    title: 'Bait & Punish',
    icon: <Target className="w-5 h-5" />,
    content: 'Use weak units or low HP bait to lure enemies into traps.',
    tips: [
      'Expose low HP unit as bait',
      'Have backup ready to collapse',
      'Use terrain to hide reinforcements',
      'Works best against aggressive AI',
      'Fake retreats to draw enemies out',
      'Requires good micro and timing'
    ],
    tags: ['advanced', 'tactics', 'bait', 'trap', 'high-skill']
  },
  {
    id: 'split_push',
    category: 'advanced',
    title: 'Split Push Strategy',
    icon: <Users className="w-5 h-5" />,
    content: 'Apply pressure in multiple locations to overwhelm enemy defenses.',
    tips: [
      'Send units to 2+ locations',
      'Force enemy to split up',
      'One group distracts, other scores',
      'Requires map awareness',
      'Risky but high reward',
      'Best when ahead in units'
    ],
    tags: ['advanced', 'tactics', 'split-push', 'map-control']
  },
  {
    id: 'ability_combos',
    category: 'advanced',
    title: 'Ability Combos',
    icon: <Zap className="w-5 h-5" />,
    content: 'Combine multiple abilities for devastating effects.',
    tips: [
      'Shield Wall + Power Strike = Safe aggression',
      'Sprint + Dash = Ultra mobility',
      'Smoke Bomb + Assassin = Safe burst',
      'Trap + Focus Fire = Guaranteed kill',
      'Timing is everything',
      'Expensive but game-changing'
    ],
    tags: ['advanced', 'abilities', 'combos', 'tactics']
  }
];

// ============================================================================
// STRATEGY GUIDE COMPONENT
// ============================================================================

interface StrategyGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StrategyGuide({ isOpen, onClose }: StrategyGuideProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);

  const categories = [
    { id: 'all', name: 'All Topics', icon: <Book className="w-4 h-4" /> },
    { id: 'units', name: 'Units', icon: <Users className="w-4 h-4" /> },
    { id: 'bosses', name: 'Bosses', icon: <AlertTriangle className="w-4 h-4" /> },
    { id: 'tactics', name: 'Tactics', icon: <Target className="w-4 h-4" /> },
    { id: 'meta', name: 'Meta Game', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'advanced', name: 'Advanced', icon: <Zap className="w-4 h-4" /> }
  ];

  // Filter entries based on search and category
  const filteredEntries = STRATEGY_DATABASE.filter(entry => {
    const matchesCategory = selectedCategory === 'all' || entry.category === selectedCategory;
    const matchesSearch =
      searchTerm === '' ||
      entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
      entry.content.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={e => e.stopPropagation()}
        className="bg-gradient-to-b from-amber-900 to-amber-950 rounded-lg border-4 border-amber-600 shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b-2 border-amber-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Book className="w-8 h-8 text-amber-400" />
              <h2 className="text-3xl font-bold text-amber-100">Strategy Guide</h2>
            </div>
            <button
              onClick={onClose}
              className="text-amber-400 hover:text-amber-200 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search strategies, units, tactics..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-amber-950 border-2 border-amber-700 text-amber-100 placeholder-amber-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 mt-4 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all
                  ${
                    selectedCategory === cat.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-amber-950 text-amber-400 hover:bg-amber-800'
                  }
                `}
              >
                {cat.icon}
                <span className="text-sm font-semibold">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredEntries.length === 0 ? (
            <div className="text-center py-12 text-amber-600">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-lg">No strategies found matching your search.</p>
              <p className="text-sm mt-2">Try different keywords or browse all categories.</p>
            </div>
          ) : (
            filteredEntries.map(entry => (
              <div
                key={entry.id}
                className="bg-amber-950 border-2 border-amber-800 rounded-lg overflow-hidden hover:border-amber-600 transition-colors"
              >
                <button
                  onClick={() => setExpandedEntry(expandedEntry === entry.id ? null : entry.id)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-amber-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-amber-400">{entry.icon}</div>
                    <div>
                      <h3 className="text-lg font-bold text-amber-100">{entry.title}</h3>
                      <div className="flex gap-2 mt-1">
                        {entry.tags.slice(0, 3).map(tag => (
                          <span
                            key={tag}
                            className="text-xs bg-amber-800 text-amber-300 px-2 py-0.5 rounded"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {expandedEntry === entry.id ? (
                    <ChevronDown className="w-5 h-5 text-amber-400" />
                  ) : (
                    <ChevronRight className="w-5 h-5 text-amber-400" />
                  )}
                </button>

                <AnimatePresence>
                  {expandedEntry === entry.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t-2 border-amber-800"
                    >
                      <div className="p-4 space-y-4">
                        <p className="text-amber-200 leading-relaxed">{entry.content}</p>

                        {entry.tips && entry.tips.length > 0 && (
                          <div>
                            <h4 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                              <Zap className="w-4 h-4" />
                              Tips & Tricks
                            </h4>
                            <ul className="space-y-1">
                              {entry.tips.map((tip, idx) => (
                                <li key={idx} className="text-amber-300 text-sm flex items-start gap-2">
                                  <span className="text-amber-600 mt-1">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {entry.counters && entry.counters.length > 0 && (
                          <div>
                            <h4 className="text-amber-400 font-bold mb-2 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Matchups
                            </h4>
                            <div className="space-y-2">
                              {entry.counters.map((counter, idx) => (
                                <div
                                  key={idx}
                                  className="bg-amber-900 p-2 rounded text-sm flex items-center justify-between"
                                >
                                  <span className="text-amber-200 font-semibold">{counter.unit}</span>
                                  <span
                                    className={`
                                    text-xs px-2 py-1 rounded
                                    ${counter.strength.toLowerCase().includes('strong') ? 'bg-green-800 text-green-200' : ''}
                                    ${counter.strength.toLowerCase().includes('weak') ? 'bg-red-800 text-red-200' : ''}
                                    ${counter.strength.toLowerCase().includes('even') ? 'bg-yellow-800 text-yellow-200' : ''}
                                  `}
                                  >
                                    {counter.strength}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-amber-700 bg-amber-900">
          <p className="text-center text-amber-300 text-sm">
            {filteredEntries.length} strategies available • Keep learning to master Silkroad Fights!
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
