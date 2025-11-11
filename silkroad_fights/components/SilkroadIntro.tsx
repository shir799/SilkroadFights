'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { theme } from '../lib/theme';

interface SilkroadIntroProps {
  onComplete: () => void;
  onSkip?: () => void;
}

type Scene = 'desert' | 'traders_thieves' | 'battle_formation' | 'boss_encounters' | 'title_card' | 'complete';

const SilkroadIntro: React.FC<SilkroadIntroProps> = ({ onComplete, onSkip }) => {
  const [currentScene, setCurrentScene] = useState<Scene>('desert');
  const [showSkipButton, setShowSkipButton] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  // Scene timing configuration (in seconds)
  const SCENE_TIMINGS = {
    desert: 10,
    traders_thieves: 10,
    battle_formation: 10,
    boss_encounters: 10,
    title_card: 5,
  };

  // Particle system for sandstorm effect
  useEffect(() => {
    if (currentScene !== 'desert') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    for (let i = 0; i < 100; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: Math.random() * 3 + 1,
        speedY: Math.random() * 0.5,
        opacity: Math.random() * 0.5 + 0.1,
      });
    }

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        ctx.fillStyle = `rgba(194, 178, 128, ${particle.opacity})`;
        ctx.fillRect(particle.x, particle.y, particle.size, particle.size);

        particle.x += particle.speedX;
        particle.y += particle.speedY;

        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y > canvas.height) particle.y = 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [currentScene]);

  // Scene progression
  useEffect(() => {
    const scenes: Scene[] = ['desert', 'traders_thieves', 'battle_formation', 'boss_encounters', 'title_card'];
    const currentIndex = scenes.indexOf(currentScene);

    if (currentIndex === -1 || currentIndex === scenes.length - 1) {
      if (currentScene === 'title_card') {
        const timer = setTimeout(() => {
          setCurrentScene('complete');
          onComplete();
        }, SCENE_TIMINGS.title_card * 1000);
        return () => clearTimeout(timer);
      }
      return;
    }

    const duration = SCENE_TIMINGS[currentScene] * 1000;
    const timer = setTimeout(() => {
      setCurrentScene(scenes[currentIndex + 1]);
    }, duration);

    return () => clearTimeout(timer);
  }, [currentScene, onComplete]);

  const handleSkip = () => {
    setCurrentScene('complete');
    if (onSkip) onSkip();
    onComplete();
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Escape' || e.key === ' ') {
      handleSkip();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-black z-50">
      {/* Canvas for particle effects */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: currentScene === 'desert' ? 'block' : 'none' }}
      />

      {/* Skip Button */}
      <AnimatePresence>
        {showSkipButton && currentScene !== 'complete' && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleSkip}
            className="absolute top-8 right-8 z-50 px-6 py-3 bg-black/50 backdrop-blur-sm border border-amber-600/50 rounded-lg text-amber-200 hover:bg-amber-900/30 transition-all"
          >
            <span className="text-sm font-semibold">Skip (ESC)</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Scene 1: Desert Caravan */}
      <AnimatePresence>
        {currentScene === 'desert' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            {/* Desert Background */}
            <div className="absolute inset-0 bg-gradient-to-b from-amber-900/40 via-amber-800/30 to-amber-950/50" />

            {/* Caravan Silhouettes */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '100%' }}
              transition={{ duration: 8, ease: 'linear' }}
              className="absolute bottom-1/3 w-full"
            >
              <svg viewBox="0 0 800 200" className="w-full h-32 opacity-60">
                {/* Camel 1 */}
                <g transform="translate(100, 50)">
                  <ellipse cx="30" cy="80" rx="40" ry="25" fill="#1a0f0f" />
                  <rect x="20" y="50" width="20" height="30" fill="#1a0f0f" />
                  <circle cx="30" cy="40" r="15" fill="#1a0f0f" />
                  <path d="M 30 40 Q 40 35 45 30" stroke="#1a0f0f" strokeWidth="3" fill="none" />
                </g>

                {/* Camel 2 */}
                <g transform="translate(200, 60)">
                  <ellipse cx="30" cy="80" rx="40" ry="25" fill="#1a0f0f" />
                  <rect x="20" y="50" width="20" height="30" fill="#1a0f0f" />
                  <circle cx="30" cy="40" r="15" fill="#1a0f0f" />
                  <path d="M 30 40 Q 40 35 45 30" stroke="#1a0f0f" strokeWidth="3" fill="none" />
                </g>

                {/* Person */}
                <g transform="translate(150, 70)">
                  <circle cx="10" cy="10" r="8" fill="#1a0f0f" />
                  <rect x="5" y="18" width="10" height="20" fill="#1a0f0f" />
                </g>
              </svg>
            </motion.div>

            {/* Text Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 2, duration: 1.5 }}
              className="relative z-10 text-center"
            >
              <h1 className="text-6xl font-bold text-amber-100 tracking-wider mb-4" style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)'
              }}>
                The Silk Road...
              </h1>
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ delay: 3.5, duration: 1 }}
                className="h-1 w-64 mx-auto bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 2: Trader & Thief */}
      <AnimatePresence>
        {currentScene === 'traders_thieves' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-amber-950 to-black" />

            {/* Split Screen */}
            <div className="relative h-full flex">
              {/* Left Side - Traders */}
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="flex-1 relative overflow-hidden border-r-2 border-amber-600/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.img
                    src={theme.images.trader}
                    alt="Trader"
                    className="h-96 object-contain filter drop-shadow-2xl"
                    animate={{
                      y: [0, -10, 0],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut"
                    }}
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
                >
                  <h3 className="text-4xl font-bold text-amber-300 mb-2">Traders</h3>
                  <p className="text-xl text-amber-100/80">Merchants of Fortune</p>
                </motion.div>
              </motion.div>

              {/* Right Side - Thieves */}
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="flex-1 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-bl from-red-950/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.img
                    src={theme.images.kingThief}
                    alt="Thief"
                    className="h-96 object-contain filter drop-shadow-2xl"
                    animate={{
                      y: [0, -10, 0],
                      scale: [1, 1.02, 1]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 3,
                      ease: "easeInOut",
                      delay: 0.5
                    }}
                  />
                </div>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.5 }}
                  className="absolute bottom-20 left-1/2 transform -translate-x-1/2 text-center"
                >
                  <h3 className="text-4xl font-bold text-red-400 mb-2">Thieves</h3>
                  <p className="text-xl text-red-100/80">Shadows of the Road</p>
                </motion.div>
              </motion.div>
            </div>

            {/* Center Text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.5, duration: 1 }}
              className="absolute top-1/3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center z-10"
            >
              <h2 className="text-5xl font-bold text-amber-100 mb-4" style={{
                textShadow: '0 0 30px rgba(0, 0, 0, 0.8), 0 0 60px rgba(255, 215, 0, 0.4)'
              }}>
                A path of fortune and danger
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 3: Battle Formation */}
      <AnimatePresence>
        {currentScene === 'battle_formation' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-black" />

            {/* Hexagon Grid Background */}
            <div className="absolute inset-0 opacity-20">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="hexagons" width="100" height="87" patternUnits="userSpaceOnUse">
                    <polygon points="50,0 93.3,25 93.3,75 50,100 6.7,75 6.7,25"
                             stroke="#FFD700" strokeWidth="1" fill="none"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#hexagons)" />
              </svg>
            </div>

            {/* Unit Formation */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="relative z-10 grid grid-cols-3 gap-12 mb-16"
            >
              {[
                { img: theme.images.trader, name: 'Merchant', type: 'Blade', delay: 0 },
                { img: theme.images.hunter, name: 'Hunter', type: 'Bow', delay: 0.3 },
                { img: theme.images.thief, name: 'Assassin', type: 'Force', delay: 0.6 },
              ].map((unit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ y: 100, opacity: 0, scale: 0.5 }}
                  animate={{ y: 0, opacity: 1, scale: 1 }}
                  transition={{ delay: unit.delay + 1.5, duration: 0.8, type: 'spring' }}
                  className="flex flex-col items-center"
                >
                  <div className="relative mb-4">
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(255, 215, 0, 0.5)',
                          '0 0 40px rgba(255, 215, 0, 0.8)',
                          '0 0 20px rgba(255, 215, 0, 0.5)',
                        ]
                      }}
                      transition={{ repeat: Infinity, duration: 2, delay: unit.delay }}
                      className="w-40 h-40 rounded-full bg-gradient-to-br from-amber-900/30 to-amber-950/30 flex items-center justify-center border-2 border-amber-500/50"
                    >
                      <img src={unit.img} alt={unit.name} className="w-32 h-32 object-contain" />
                    </motion.div>
                  </div>
                  <h3 className="text-2xl font-bold text-amber-100 mb-1">{unit.name}</h3>
                  <span className="text-sm px-3 py-1 rounded-full bg-amber-900/50 border border-amber-600/50 text-amber-300">
                    {unit.type}
                  </span>
                </motion.div>
              ))}
            </motion.div>

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 3, duration: 1 }}
              className="relative z-10 text-center"
            >
              <h2 className="text-5xl font-bold text-amber-100" style={{
                textShadow: '0 0 20px rgba(255, 215, 0, 0.5)'
              }}>
                Choose your champions
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 4: Boss Encounters */}
      <AnimatePresence>
        {currentScene === 'boss_encounters' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-red-950/50 via-black to-black" />

            {/* Boss Showcase */}
            <div className="relative z-10 w-full h-full flex items-center justify-center">
              {/* TigerGiry */}
              <motion.div
                initial={{ x: -200, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="absolute left-20 top-1/4"
              >
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    rotate: [0, 5, 0, -5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3 }}
                >
                  <img src={theme.images.tigergiry} alt="TigerGiry" className="w-64 h-64 object-contain filter drop-shadow-2xl" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center mt-4"
                  >
                    <h3 className="text-3xl font-bold text-orange-400">Tiger Giry</h3>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Skeletoking */}
              <motion.div
                initial={{ y: -200, opacity: 0, scale: 0.5 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="absolute top-20"
              >
                <motion.div
                  animate={{
                    y: [0, -20, 0],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{ repeat: Infinity, duration: 2.5 }}
                >
                  <img src={theme.images.skeletoking} alt="SkeletoKing" className="w-80 h-80 object-contain filter drop-shadow-2xl" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="text-center mt-4"
                  >
                    <h3 className="text-3xl font-bold text-purple-400">Skeleto King</h3>
                  </motion.div>
                </motion.div>
              </motion.div>

              {/* Murucha */}
              <motion.div
                initial={{ x: 200, opacity: 0, scale: 0.5 }}
                animate={{ x: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
                className="absolute right-20 bottom-1/4"
              >
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    rotate: [0, -5, 0, 5, 0]
                  }}
                  transition={{ repeat: Infinity, duration: 3.5 }}
                >
                  <img src={theme.images.murucha} alt="Murucha" className="w-64 h-64 object-contain filter drop-shadow-2xl" />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                    className="text-center mt-4"
                  >
                    <h3 className="text-3xl font-bold text-red-400">Murucha</h3>
                  </motion.div>
                </motion.div>
              </motion.div>
            </div>

            {/* Lightning Effects */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ repeat: Infinity, duration: 4, times: [0, 0.1, 0.2] }}
              className="absolute inset-0 bg-white/10 pointer-events-none"
            />

            {/* Text */}
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 3, duration: 1 }}
              className="absolute bottom-32 left-1/2 transform -translate-x-1/2 text-center z-20"
            >
              <h2 className="text-6xl font-bold text-red-400 mb-2" style={{
                textShadow: '0 0 30px rgba(255, 0, 0, 0.8), 0 0 60px rgba(255, 0, 0, 0.4)'
              }}>
                Face legendary foes
              </h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scene 5: Title Card */}
      <AnimatePresence>
        {currentScene === 'title_card' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="absolute inset-0 bg-black" />

            {/* Animated Background Rays */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 20, ease: 'linear' }}
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at center, transparent 30%, rgba(255, 215, 0, 0.05) 70%)',
              }}
            />

            <div className="relative z-10 text-center">
              {/* Main Title */}
              <motion.div
                initial={{ opacity: 0, y: -50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, duration: 1, type: 'spring', bounce: 0.4 }}
              >
                <h1 className="text-8xl md:text-9xl font-bold mb-4" style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 50%, #8B4513 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 60px rgba(255, 215, 0, 0.5)',
                  filter: 'drop-shadow(0 10px 30px rgba(255, 215, 0, 0.3))',
                }}>
                  SILKROAD
                </h1>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ delay: 1, duration: 0.8 }}
                className="h-2 w-96 mx-auto mb-4 bg-gradient-to-r from-transparent via-amber-500 to-transparent"
              />

              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 1.5, duration: 1, type: 'spring', bounce: 0.4 }}
              >
                <h2 className="text-6xl md:text-7xl font-bold mb-8" style={{
                  background: 'linear-gradient(180deg, #FFD700 0%, #FFA500 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 0 40px rgba(255, 215, 0, 0.4)',
                }}>
                  AUTO CHESS
                </h2>
              </motion.div>

              {/* Subtitle */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2, duration: 1 }}
                className="mb-12"
              >
                <p className="text-2xl text-amber-300/90 font-semibold tracking-wide italic">
                  Fortune awaits the bold
                </p>
              </motion.div>

              {/* Press to Start */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 0] }}
                transition={{ delay: 3, repeat: Infinity, duration: 2, repeatDelay: 0.5 }}
              >
                <p className="text-xl text-amber-200/80 tracking-widest">
                  PRESS ANY KEY TO START
                </p>
              </motion.div>
            </div>

            {/* Sparkle Effects */}
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                initial={{
                  opacity: 0,
                  x: `${50}%`,
                  y: `${50}%`
                }}
                animate={{
                  opacity: [0, 1, 0],
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0]
                }}
                transition={{
                  delay: 2 + Math.random() * 2,
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 3
                }}
                className="absolute w-2 h-2 bg-amber-400 rounded-full"
                style={{
                  boxShadow: '0 0 10px rgba(255, 215, 0, 0.8)',
                }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SilkroadIntro;
