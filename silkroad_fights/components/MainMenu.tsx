'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../lib/theme';

interface MainMenuProps {
  onPlay: () => void;
  onProfile?: () => void;
  onCollection?: () => void;
  onSettings?: () => void;
  onExit?: () => void;
  playerData?: {
    name: string;
    level: number;
    experience: number;
    rank?: string;
  };
}

type MenuTab = 'main' | 'profile' | 'collection' | 'settings';

const MainMenu: React.FC<MainMenuProps> = ({
  onPlay,
  onProfile,
  onCollection,
  onSettings,
  onExit,
  playerData = {
    name: 'Traveler',
    level: 1,
    experience: 0,
    rank: 'Novice',
  },
}) => {
  const [activeTab, setActiveTab] = useState<MenuTab>('main');
  const [caravanPosition, setCaravanPosition] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated caravan background
  useEffect(() => {
    const interval = setInterval(() => {
      setCaravanPosition((prev) => (prev + 0.5) % 100);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Parallax sand dunes background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const drawDunes = () => {
      // Clear canvas
      ctx.fillStyle = 'rgba(26, 15, 15, 0.95)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw multiple layers of dunes
      const layers = [
        { color: 'rgba(139, 69, 19, 0.3)', speed: 0.5, amplitude: 60, frequency: 0.002 },
        { color: 'rgba(160, 82, 45, 0.2)', speed: 0.3, amplitude: 80, frequency: 0.0015 },
        { color: 'rgba(194, 178, 128, 0.15)', speed: 0.2, amplitude: 100, frequency: 0.001 },
      ];

      layers.forEach((layer, index) => {
        const offset = (Date.now() * layer.speed) % canvas.width;
        ctx.fillStyle = layer.color;
        ctx.beginPath();
        ctx.moveTo(-offset, canvas.height);

        for (let x = -offset; x < canvas.width + offset; x += 10) {
          const y =
            canvas.height -
            100 -
            index * 50 +
            Math.sin(x * layer.frequency) * layer.amplitude;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width + offset, canvas.height);
        ctx.closePath();
        ctx.fill();
      });
    };

    const animate = () => {
      drawDunes();
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  const menuButtons = [
    {
      label: 'Play',
      icon: '⚔️',
      onClick: onPlay,
      gradient: 'from-amber-600 to-amber-800',
      shadow: 'rgba(255, 215, 0, 0.5)',
      description: 'Start your journey',
    },
    {
      label: 'Profile',
      icon: '👤',
      onClick: onProfile || (() => setActiveTab('profile')),
      gradient: 'from-blue-600 to-blue-800',
      shadow: 'rgba(59, 130, 246, 0.5)',
      description: 'View stats & achievements',
    },
    {
      label: 'Collection',
      icon: '📚',
      onClick: onCollection || (() => setActiveTab('collection')),
      gradient: 'from-purple-600 to-purple-800',
      shadow: 'rgba(168, 85, 247, 0.5)',
      description: 'Units & items',
    },
    {
      label: 'Settings',
      icon: '⚙️',
      onClick: onSettings || (() => setActiveTab('settings')),
      gradient: 'from-gray-600 to-gray-800',
      shadow: 'rgba(107, 114, 128, 0.5)',
      description: 'Configure game',
    },
  ];

  if (onExit) {
    menuButtons.push({
      label: 'Exit',
      icon: '🚪',
      onClick: onExit,
      gradient: 'from-red-600 to-red-800',
      shadow: 'rgba(239, 68, 68, 0.5)',
      description: 'Leave game',
    });
  }

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      {/* Animated Background Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Gradient Overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 30% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 50%), radial-gradient(circle at 70% 50%, rgba(139, 69, 19, 0.2) 0%, transparent 50%)',
        }}
      />

      {/* Animated Caravan Silhouettes */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <motion.div
          animate={{ x: ['0%', '100%'] }}
          transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
          className="absolute bottom-1/4 w-full"
        >
          <svg viewBox="0 0 800 100" className="w-full h-20">
            <g transform="translate(0, 20)">
              <ellipse cx="50" cy="50" rx="30" ry="20" fill="#1a0f0f" />
              <rect x="35" y="30" width="15" height="20" fill="#1a0f0f" />
              <circle cx="50" cy="20" r="12" fill="#1a0f0f" />
            </g>
            <g transform="translate(100, 30)">
              <ellipse cx="50" cy="50" rx="30" ry="20" fill="#1a0f0f" />
              <rect x="35" y="30" width="15" height="20" fill="#1a0f0f" />
              <circle cx="50" cy="20" r="12" fill="#1a0f0f" />
            </g>
          </svg>
        </motion.div>
      </div>

      {/* Main Content Container */}
      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="pt-12 px-8"
        >
          {/* Logo and Title */}
          <div className="text-center mb-8">
            <motion.img
              src={theme.images.logo}
              alt="Silkroad Auto Chess"
              className="w-32 h-32 mx-auto mb-4"
              animate={{
                y: [0, -10, 0],
                filter: [
                  'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
                  'drop-shadow(0 0 40px rgba(255, 215, 0, 0.8))',
                  'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))',
                ],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
                ease: 'easeInOut',
              }}
            />
            <motion.h1
              className="text-6xl font-bold mb-2"
              style={{
                background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(255, 215, 0, 0.3)',
              }}
            >
              SILKROAD AUTO CHESS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-xl text-amber-300/80 italic"
            >
              Where Fortune Meets Strategy
            </motion.p>
          </div>

          {/* Player Info Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1 }}
            className="max-w-md mx-auto mb-8 p-4 rounded-xl backdrop-blur-md bg-black/40 border-2 border-amber-600/30"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-3xl border-2 border-amber-400"
                  style={{
                    boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)',
                  }}
                >
                  👑
                </div>
                <div className="text-left">
                  <h3 className="text-xl font-bold text-amber-200">{playerData.name}</h3>
                  <p className="text-sm text-amber-400/80">{playerData.rank}</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-amber-300">
                  Lv. {playerData.level}
                </div>
                <div className="w-32 h-2 bg-gray-700 rounded-full overflow-hidden mt-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${playerData.experience}%` }}
                    transition={{ delay: 1.2, duration: 1 }}
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-600"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Menu Buttons */}
        <div className="flex-1 flex items-center justify-center px-8 pb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl w-full">
            {menuButtons.map((button, index) => (
              <motion.button
                key={button.label}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 1.2 + index * 0.1,
                  type: 'spring',
                  bounce: 0.4,
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  boxShadow: `0 20px 60px ${button.shadow}`,
                }}
                whileTap={{ scale: 0.95 }}
                onClick={button.onClick}
                className={`relative group p-8 rounded-2xl bg-gradient-to-br ${button.gradient} border-2 border-white/20 overflow-hidden`}
                style={{
                  boxShadow: `0 10px 40px ${button.shadow}`,
                }}
              >
                {/* Shine effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                  initial={{ x: '-100%' }}
                  whileHover={{ x: '100%' }}
                  transition={{ duration: 0.6 }}
                />

                {/* Content */}
                <div className="relative z-10">
                  <div className="text-6xl mb-4">{button.icon}</div>
                  <h3 className="text-2xl font-bold text-white mb-2">{button.label}</h3>
                  <p className="text-sm text-white/80">{button.description}</p>
                </div>

                {/* Glow effect on hover */}
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `radial-gradient(circle at center, ${button.shadow} 0%, transparent 70%)`,
                  }}
                />
              </motion.button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="pb-8 text-center"
        >
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-sm text-amber-300/60"
          >
            Press any button to continue
          </motion.p>
        </motion.div>
      </div>

      {/* Floating silk particles */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={i}
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100,
            opacity: 0,
          }}
          animate={{
            y: -100,
            opacity: [0, 0.6, 0],
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            delay: i * 0.5,
            duration: 10 + Math.random() * 10,
            repeat: Infinity,
            ease: 'linear',
          }}
          className="absolute w-2 h-2 rounded-full pointer-events-none"
          style={{
            backgroundColor: '#FFD700',
            boxShadow: '0 0 10px #FFD700',
          }}
        />
      ))}

      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-64 h-64 opacity-10 pointer-events-none">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M 0 0 Q 50 25, 0 50 Q 25 25, 50 0 Z"
            fill="#FFD700"
          />
        </svg>
      </div>
      <div className="absolute bottom-0 right-0 w-64 h-64 opacity-10 pointer-events-none rotate-180">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <path
            d="M 0 0 Q 50 25, 0 50 Q 25 25, 50 0 Z"
            fill="#FFD700"
          />
        </svg>
      </div>
    </div>
  );
};

export default MainMenu;
