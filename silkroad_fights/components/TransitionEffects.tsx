'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../lib/theme';

export type TransitionType = 'fade' | 'wipe' | 'dissolve' | 'silk_curtain' | 'sand_storm' | 'phase_shift';

interface TransitionEffectsProps {
  type: TransitionType;
  isActive: boolean;
  duration?: number;
  onComplete?: () => void;
  children?: React.ReactNode;
}

export const TransitionEffects: React.FC<TransitionEffectsProps> = ({
  type,
  isActive,
  duration = 1000,
  onComplete,
  children
}) => {
  useEffect(() => {
    if (isActive && onComplete) {
      const timer = setTimeout(onComplete, duration);
      return () => clearTimeout(timer);
    }
  }, [isActive, duration, onComplete]);

  return (
    <AnimatePresence>
      {isActive && (
        <>
          {type === 'fade' && <FadeTransition duration={duration} />}
          {type === 'wipe' && <WipeTransition duration={duration} />}
          {type === 'dissolve' && <DissolveTransition duration={duration} />}
          {type === 'silk_curtain' && <SilkCurtainTransition duration={duration} />}
          {type === 'sand_storm' && <SandStormTransition duration={duration} />}
          {type === 'phase_shift' && <PhaseShiftTransition duration={duration} />}
        </>
      )}
      {children}
    </AnimatePresence>
  );
};

// Fade Transition
const FadeTransition: React.FC<{ duration: number }> = ({ duration }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: duration / 1000 }}
    className="fixed inset-0 bg-black z-50 pointer-events-none"
  />
);

// Wipe Transition (Left to Right)
const WipeTransition: React.FC<{ duration: number }> = ({ duration }) => (
  <motion.div
    initial={{ x: '-100%' }}
    animate={{ x: '100%' }}
    exit={{ x: '100%' }}
    transition={{ duration: duration / 1000, ease: 'easeInOut' }}
    className="fixed inset-0 z-50 pointer-events-none"
    style={{
      background: `linear-gradient(90deg,
        transparent 0%,
        ${theme.colors.gold} 45%,
        ${theme.colors.primary} 50%,
        ${theme.colors.gold} 55%,
        transparent 100%)`
    }}
  />
);

// Dissolve Transition (Pixelated fade)
const DissolveTransition: React.FC<{ duration: number }> = ({ duration }) => {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 100; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        delay: Math.random() * 0.5,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: [0, 2, 0] }}
          transition={{
            duration: duration / 1000,
            delay: particle.delay,
            ease: 'easeInOut',
          }}
          className="absolute w-12 h-12 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            background: theme.colors.gold,
            boxShadow: `0 0 20px ${theme.colors.gold}`,
          }}
        />
      ))}
    </div>
  );
};

// Silk Curtain Transition
const SilkCurtainTransition: React.FC<{ duration: number }> = ({ duration }) => (
  <div className="fixed inset-0 z-50 pointer-events-none">
    {/* Left Curtain */}
    <motion.div
      initial={{ x: '-100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '-100%' }}
      transition={{ duration: duration / 2000, ease: 'easeInOut' }}
      className="absolute left-0 top-0 bottom-0 w-1/2"
      style={{
        background: `linear-gradient(90deg,
          ${theme.colors.primary} 0%,
          ${theme.colors.secondary} 50%,
          transparent 100%)`,
        boxShadow: '10px 0 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Silk Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="silk-pattern-left" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q10 10, 20 20 T40 20" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
              <path d="M0 0 Q10 10, 20 0 T40 0" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
              <path d="M0 40 Q10 30, 20 40 T40 40" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#silk-pattern-left)" />
        </svg>
      </div>
    </motion.div>

    {/* Right Curtain */}
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: '0%' }}
      exit={{ x: '100%' }}
      transition={{ duration: duration / 2000, ease: 'easeInOut' }}
      className="absolute right-0 top-0 bottom-0 w-1/2"
      style={{
        background: `linear-gradient(270deg,
          ${theme.colors.primary} 0%,
          ${theme.colors.secondary} 50%,
          transparent 100%)`,
        boxShadow: '-10px 0 30px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Silk Pattern */}
      <div className="absolute inset-0 opacity-20">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="silk-pattern-right" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 20 Q10 10, 20 20 T40 20" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
              <path d="M0 0 Q10 10, 20 0 T40 0" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
              <path d="M0 40 Q10 30, 20 40 T40 40" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#silk-pattern-right)" />
        </svg>
      </div>
    </motion.div>

    {/* Center Silk Icon */}
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0 }}
      transition={{ delay: duration / 4000, duration: duration / 2000 }}
      className="absolute inset-0 flex items-center justify-center"
    >
      <img
        src={theme.images.silk}
        alt="Silk"
        className="w-32 h-32 object-contain"
        style={{
          filter: 'drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))',
        }}
      />
    </motion.div>
  </div>
);

// Sand Storm Transition
const SandStormTransition: React.FC<{ duration: number }> = ({ duration }) => {
  const [particles, setParticles] = useState<Array<{ x: number; y: number; size: number; delay: number; duration: number }>>([]);

  useEffect(() => {
    const newParticles = [];
    for (let i = 0; i < 150; i++) {
      newParticles.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 4 + 1,
        delay: Math.random() * 0.5,
        duration: Math.random() * 2 + 1,
      });
    }
    setParticles(newParticles);
  }, []);

  return (
    <div className="fixed inset-0 z-50 pointer-events-none overflow-hidden">
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        transition={{ duration: duration / 1000 }}
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(circle, rgba(194, 178, 128, 0.3) 0%, rgba(26, 15, 15, 0.9) 100%)',
        }}
      />

      {/* Sand particles */}
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          initial={{ x: '-10%', y: `${particle.y}%`, opacity: 0 }}
          animate={{
            x: '110%',
            y: `${particle.y + Math.random() * 20 - 10}%`,
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            ease: 'linear',
          }}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            backgroundColor: 'rgba(194, 178, 128, 0.6)',
            boxShadow: '0 0 4px rgba(194, 178, 128, 0.4)',
          }}
        />
      ))}
    </div>
  );
};

// Phase Shift Transition (for round/phase changes)
const PhaseShiftTransition: React.FC<{ duration: number }> = ({ duration }) => (
  <div className="fixed inset-0 z-50 pointer-events-none">
    {/* Expanding rings */}
    {[0, 1, 2, 3].map((i) => (
      <motion.div
        key={i}
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{
          duration: duration / 1000,
          delay: i * 0.1,
          ease: 'easeOut',
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="w-32 h-32 rounded-full border-4"
          style={{
            borderColor: theme.colors.gold,
            boxShadow: `0 0 30px ${theme.colors.gold}`,
          }}
        />
      </motion.div>
    ))}

    {/* Flash effect */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 0] }}
      transition={{ duration: duration / 2000, times: [0, 0.5, 1] }}
      className="absolute inset-0 bg-white"
    />
  </div>
);

// Loading Screen Component with Transition
export const LoadingTransition: React.FC<{ isLoading: boolean }> = ({ isLoading }) => {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: theme.colors.background }}
        >
          <div className="text-center">
            <motion.img
              src={theme.images.silk}
              alt="Loading"
              className="w-32 h-32 mx-auto mb-8"
              animate={{
                rotate: 360,
                scale: [1, 1.2, 1],
              }}
              transition={{
                rotate: { repeat: Infinity, duration: 2, ease: 'linear' },
                scale: { repeat: Infinity, duration: 1, ease: 'easeInOut' },
              }}
            />
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <p className="text-2xl font-bold text-amber-300">Loading...</p>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TransitionEffects;
