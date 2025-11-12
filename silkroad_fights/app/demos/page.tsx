"use client"

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import ShopDemo from '../../components/ShopDemo'
import GameFlowExample from '../../components/GameFlowExample'

export default function DemosHub() {
  const [activeDemo, setActiveDemo] = useState<'shop' | 'flow' | null>(null)

  const demos = [
    {
      id: 'battle',
      title: '⚔️ Battle Demo',
      description: 'Live combat system with dice rolls, boss spawns, and real-time combat log',
      link: '/battle-demo',
      color: 'from-red-600 to-red-800',
      features: ['Combat System', 'Boss Fights', 'Dice Rolls', 'Health Bars']
    },
    {
      id: 'shop',
      title: '🏪 Shop Demo',
      description: 'TFT-style shop with unit purchasing, bench system, and economy',
      component: 'shop',
      color: 'from-amber-600 to-amber-800',
      features: ['Buy/Sell Units', 'Rarity System', 'Gold Economy', 'Level/XP']
    },
    {
      id: 'flow',
      title: '🔄 Game Flow',
      description: 'Complete game loop showing preparation, combat, and results phases',
      component: 'flow',
      color: 'from-purple-600 to-purple-800',
      features: ['3 Phase System', 'Auto Combat', 'Round System', 'Rewards']
    },
    {
      id: 'tft',
      title: '🎮 TFT Game',
      description: 'Full TFT-style game with shop, bench, board, and all systems integrated',
      link: '/',
      color: 'from-blue-600 to-blue-800',
      features: ['Complete Game', 'All Systems', 'CSS Placeholders', 'Ready to Play']
    }
  ]

  const docs = [
    {
      title: '📚 Quick Start Guide',
      path: '/silkroad_fights/QUICK_START_GUIDE.md',
      description: 'Learn game mechanics, strategies, and how to play'
    },
    {
      title: '🔧 TFT Engine Docs',
      path: '/silkroad_fights/TFT_ENGINE_README.md',
      description: 'Technical documentation and API reference'
    },
    {
      title: '🎨 Asset README',
      path: '/ASSET_README.md',
      description: 'Asset overview and status'
    },
    {
      title: '⚡ Asset Quick Start',
      path: '/ASSET_QUICK_START.md',
      description: '10-minute setup guide'
    }
  ]

  if (activeDemo === 'shop') {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveDemo(null)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xl"
          >
            ← Back to Demos
          </motion.button>
        </div>
        <ShopDemo />
      </div>
    )
  }

  if (activeDemo === 'flow') {
    return (
      <div>
        <div className="fixed top-4 left-4 z-50">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveDemo(null)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-xl"
          >
            ← Back to Demos
          </motion.button>
        </div>
        <GameFlowExample />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-indigo-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-bold text-white mb-4">
            🎮 SILKROAD FIGHTS
          </h1>
          <p className="text-2xl text-gray-300 mb-2">Demo Hub</p>
          <p className="text-gray-400">Explore all game systems and demos</p>
        </motion.div>

        {/* Demos Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span>🎯</span>
            <span>Interactive Demos</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {demos.map((demo, i) => (
              <motion.div
                key={demo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`bg-gradient-to-br ${demo.color} p-6 rounded-2xl border-2 border-white/20 shadow-2xl cursor-pointer`}
                onClick={() => {
                  if (demo.link) {
                    window.location.href = demo.link
                  } else if (demo.component === 'shop') {
                    setActiveDemo('shop')
                  } else if (demo.component === 'flow') {
                    setActiveDemo('flow')
                  }
                }}
              >
                <h3 className="text-3xl font-bold text-white mb-3">{demo.title}</h3>
                <p className="text-white/90 mb-4">{demo.description}</p>

                <div className="flex flex-wrap gap-2 mb-4">
                  {demo.features.map((feature, j) => (
                    <span
                      key={j}
                      className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm text-white font-semibold"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-white/80 text-sm">
                    {demo.link ? 'Click to visit →' : 'Click to load →'}
                  </span>
                  <motion.div
                    animate={{ x: [0, 10, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-3xl"
                  >
                    →
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Documentation */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span>📚</span>
            <span>Documentation</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {docs.map((doc, i) => (
              <motion.a
                key={i}
                href={`https://github.com/yourusername/silkroad-fights/blob/main${doc.path}`}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                whileHover={{ scale: 1.05 }}
                className="bg-gray-800 p-4 rounded-xl border-2 border-gray-700 hover:border-blue-500 transition-colors"
              >
                <h3 className="text-lg font-bold text-white mb-2">{doc.title}</h3>
                <p className="text-sm text-gray-400">{doc.description}</p>
              </motion.a>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-white mb-6 flex items-center gap-3">
            <span>✨</span>
            <span>Features</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: '🎨', title: 'CSS Placeholders', desc: 'No assets needed' },
              { icon: '⚡', title: '60 FPS', desc: 'Smooth performance' },
              { icon: '🎮', title: 'Complete Game', desc: 'All systems ready' },
              { icon: '📱', title: 'Responsive', desc: 'Works everywhere' },
              { icon: '🔧', title: 'Extensible', desc: 'Easy to modify' },
              { icon: '💎', title: 'Production Ready', desc: 'Ship it now!' },
              { icon: '🚀', title: 'Fast Loading', desc: 'Instant start' },
              { icon: '🎯', title: 'TFT Quality', desc: 'Professional UI' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl border border-gray-700 text-center"
              >
                <div className="text-4xl mb-2">{feature.icon}</div>
                <h3 className="text-white font-bold mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tools */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-gradient-to-r from-green-600 to-green-800 p-6 rounded-2xl border-2 border-green-400 shadow-2xl"
        >
          <h2 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
            <span>🛠️</span>
            <span>Asset Generator</span>
          </h2>
          <p className="text-white/90 mb-4">
            Generate custom placeholder sprites for your game using our interactive tool.
          </p>
          <div className="flex gap-4">
            <a
              href="/scripts/generatePlaceholders.html"
              target="_blank"
              className="px-6 py-3 bg-white text-green-700 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Open Generator →
            </a>
            <span className="text-white/80 flex items-center">
              Download custom sprites as PNG
            </span>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="mt-12 text-center text-gray-400"
        >
          <p className="mb-2">Built with Next.js, React, TypeScript, Framer Motion, and ❤️</p>
          <p className="text-sm">All demos use CSS placeholders - no assets required!</p>
        </motion.div>
      </div>
    </div>
  )
}
