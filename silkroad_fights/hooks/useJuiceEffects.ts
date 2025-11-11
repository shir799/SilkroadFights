/**
 * useJuiceEffects Hook
 *
 * Manages screen shake, slow-motion, particles, and other "juice" effects
 * that make the game feel AMAZING and ADDICTIVE
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { JuiceEffect, JUICE_CONFIG } from '@/lib/gameplayEnhancement';

interface JuiceState {
  screenShake: { intensity: number; duration: number } | null;
  slowMotion: { scale: number; duration: number } | null;
  flash: { intensity: number; duration: number } | null;
  particles: { type: string; position: { x: number; y: number } } | null;
}

export function useJuiceEffects() {
  const [juiceState, setJuiceState] = useState<JuiceState>({
    screenShake: null,
    slowMotion: null,
    flash: null,
    particles: null,
  });

  const timeScale = useRef(1);
  const shakeTransform = useRef('translate(0, 0)');

  // Screen Shake Effect
  const triggerScreenShake = useCallback((intensity: number, duration: number) => {
    setJuiceState(prev => ({ ...prev, screenShake: { intensity, duration } }));

    let elapsed = 0;
    const startTime = Date.now();

    const shake = () => {
      elapsed = Date.now() - startTime;

      if (elapsed < duration) {
        const progress = elapsed / duration;
        const currentIntensity = intensity * (1 - progress); // Decay over time

        const x = (Math.random() - 0.5) * currentIntensity * 20;
        const y = (Math.random() - 0.5) * currentIntensity * 20;
        const rotation = (Math.random() - 0.5) * currentIntensity * 2;

        shakeTransform.current = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

        requestAnimationFrame(shake);
      } else {
        shakeTransform.current = 'translate(0, 0) rotate(0deg)';
        setJuiceState(prev => ({ ...prev, screenShake: null }));
      }
    };

    shake();
  }, []);

  // Slow Motion Effect
  const triggerSlowMotion = useCallback((scale: number, duration: number) => {
    setJuiceState(prev => ({ ...prev, slowMotion: { scale, duration } }));
    timeScale.current = scale;

    setTimeout(() => {
      timeScale.current = 1;
      setJuiceState(prev => ({ ...prev, slowMotion: null }));
    }, duration);
  }, []);

  // Flash Effect
  const triggerFlash = useCallback((intensity: number, duration: number) => {
    setJuiceState(prev => ({ ...prev, flash: { intensity, duration } }));

    setTimeout(() => {
      setJuiceState(prev => ({ ...prev, flash: null }));
    }, duration);
  }, []);

  // Particle Effect
  const triggerParticles = useCallback((type: string, x: number, y: number) => {
    setJuiceState(prev => ({ ...prev, particles: { type, position: { x, y } } }));

    setTimeout(() => {
      setJuiceState(prev => ({ ...prev, particles: null }));
    }, 2000);
  }, []);

  // Main trigger function that handles all effect types
  const triggerEffect = useCallback((effect: JuiceEffect) => {
    switch (effect.type) {
      case 'SCREEN_SHAKE':
        triggerScreenShake(effect.intensity, effect.duration);
        break;
      case 'SLOW_MOTION':
        triggerSlowMotion(effect.intensity, effect.duration);
        break;
      case 'FLASH':
        triggerFlash(effect.intensity, effect.duration);
        break;
      case 'PARTICLES':
        // Trigger at center of screen by default
        triggerParticles(effect.trigger, window.innerWidth / 2, window.innerHeight / 2);
        break;
    }
  }, [triggerScreenShake, triggerSlowMotion, triggerFlash, triggerParticles]);

  // Preset effects
  const presetEffects = {
    criticalHit: () => {
      triggerScreenShake(
        JUICE_CONFIG.SCREEN_SHAKE.CRITICAL_HIT.intensity,
        JUICE_CONFIG.SCREEN_SHAKE.CRITICAL_HIT.duration
      );
      triggerSlowMotion(
        JUICE_CONFIG.SLOW_MOTION.CRITICAL_HIT.scale,
        JUICE_CONFIG.SLOW_MOTION.CRITICAL_HIT.duration
      );
      triggerFlash(0.3, 200);
    },

    bossHit: () => {
      triggerScreenShake(
        JUICE_CONFIG.SCREEN_SHAKE.BOSS_HIT.intensity,
        JUICE_CONFIG.SCREEN_SHAKE.BOSS_HIT.duration
      );
      triggerFlash(0.5, 300);
    },

    bossDeath: () => {
      triggerScreenShake(
        JUICE_CONFIG.SCREEN_SHAKE.BOSS_HIT.intensity,
        JUICE_CONFIG.SCREEN_SHAKE.BOSS_HIT.duration
      );
      triggerSlowMotion(
        JUICE_CONFIG.SLOW_MOTION.BOSS_DEATH.scale,
        JUICE_CONFIG.SLOW_MOTION.BOSS_DEATH.duration
      );
      triggerFlash(0.7, 500);
      triggerParticles('explosion', window.innerWidth / 2, window.innerHeight / 2);
    },

    death: () => {
      triggerScreenShake(
        JUICE_CONFIG.SCREEN_SHAKE.DEATH.intensity,
        JUICE_CONFIG.SCREEN_SHAKE.DEATH.duration
      );
    },

    victory: () => {
      triggerScreenShake(
        JUICE_CONFIG.SCREEN_SHAKE.VICTORY.intensity,
        JUICE_CONFIG.SCREEN_SHAKE.VICTORY.duration
      );
      triggerSlowMotion(0.5, 800);
      triggerParticles('confetti', window.innerWidth / 2, window.innerHeight / 3);
    },

    levelUp: () => {
      triggerFlash(0.4, 400);
      triggerParticles('confetti', window.innerWidth / 2, window.innerHeight / 2);
    },

    achievement: () => {
      triggerFlash(0.3, 300);
      triggerParticles('sparkles', window.innerWidth / 2, window.innerHeight / 2);
    },

    perfectRound: () => {
      triggerSlowMotion(
        JUICE_CONFIG.SLOW_MOTION.PERFECT_ROUND.scale,
        JUICE_CONFIG.SLOW_MOTION.PERFECT_ROUND.duration
      );
      triggerParticles('stars', window.innerWidth / 2, window.innerHeight / 2);
    },

    comboMilestone: () => {
      triggerFlash(0.2, 200);
      triggerParticles('fire', window.innerWidth / 2, window.innerHeight / 2);
    },
  };

  return {
    juiceState,
    shakeTransform: shakeTransform.current,
    timeScale: timeScale.current,
    triggerEffect,
    ...presetEffects,
  };
}

// Screen Shake Component Wrapper
export function ScreenShakeWrapper({
  children,
  shakeTransform
}: {
  children: React.ReactNode;
  shakeTransform: string;
}) {
  return (
    <div
      style={{
        transform: shakeTransform,
        transition: 'transform 0.05s ease-out',
      }}
    >
      {children}
    </div>
  );
}

// Flash Overlay Component
export function FlashOverlay({
  intensity,
  duration
}: {
  intensity: number | null;
  duration: number | null;
}) {
  if (intensity === null || duration === null) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none z-[9999]"
      style={{
        backgroundColor: `rgba(255, 255, 255, ${intensity})`,
        animation: `flashFade ${duration}ms ease-out`,
      }}
    />
  );
}

// Particle System Component
interface ParticleSystemProps {
  type: string | null;
  position: { x: number; y: number } | null;
}

export function ParticleSystem({ type, position }: ParticleSystemProps) {
  if (!type || !position) return null;

  const getParticleConfig = (type: string) => {
    switch (type) {
      case 'confetti':
        return {
          count: 50,
          colors: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A'],
          shapes: ['square', 'circle'],
          spread: 360,
          velocity: 25,
        };
      case 'sparkles':
        return {
          count: 30,
          colors: ['#FFD700', '#FFF', '#FFEB3B'],
          shapes: ['star'],
          spread: 360,
          velocity: 15,
        };
      case 'fire':
        return {
          count: 20,
          colors: ['#FF4500', '#FF6347', '#FFD700', '#FFA500'],
          shapes: ['circle'],
          spread: 180,
          velocity: 20,
        };
      case 'stars':
        return {
          count: 40,
          colors: ['#FFD700', '#FFF', '#87CEEB'],
          shapes: ['star'],
          spread: 360,
          velocity: 18,
        };
      case 'explosion':
        return {
          count: 60,
          colors: ['#FF4500', '#FF6347', '#FFA500', '#FFD700'],
          shapes: ['circle', 'square'],
          spread: 360,
          velocity: 30,
        };
      default:
        return {
          count: 20,
          colors: ['#FFD700'],
          shapes: ['circle'],
          spread: 360,
          velocity: 15,
        };
    }
  };

  const config = getParticleConfig(type);

  return (
    <div className="fixed inset-0 pointer-events-none z-[9998]">
      {Array.from({ length: config.count }).map((_, i) => {
        const angle = (Math.random() * config.spread - config.spread / 2) * (Math.PI / 180);
        const velocity = config.velocity * (0.5 + Math.random() * 0.5);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        const size = 8 + Math.random() * 8;

        return (
          <div
            key={i}
            className="absolute"
            style={{
              left: position.x,
              top: position.y,
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: config.shapes[Math.floor(Math.random() * config.shapes.length)] === 'circle' ? '50%' : '0%',
              animation: `particle-float ${1 + Math.random()}s ease-out forwards`,
              '--tx': `${Math.cos(angle) * velocity * 10}px`,
              '--ty': `${Math.sin(angle) * velocity * 10 - 200}px`,
            } as React.CSSProperties}
          />
        );
      })}
    </div>
  );
}

// Add these to your global CSS
export const juiceEffectsStyles = `
  @keyframes flashFade {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }

  @keyframes particle-float {
    0% {
      transform: translate(0, 0) rotate(0deg);
      opacity: 1;
    }
    100% {
      transform: translate(var(--tx), var(--ty)) rotate(360deg);
      opacity: 0;
    }
  }
`;
