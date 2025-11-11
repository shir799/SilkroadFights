/**
 * ScreenEffects.tsx - Camera and Screen Visual Effects
 * Provides screen shake, flash, slow motion, and other cinematic effects
 */

'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export type EffectType =
  | 'shake'
  | 'flash'
  | 'slow_motion'
  | 'vignette'
  | 'color_grading'
  | 'zoom'
  | 'blur'
  | 'chromatic_aberration'
  | 'scanlines'
  | 'freeze_frame';

export type ColorGradingPreset = 'normal' | 'victory' | 'defeat' | 'boss' | 'critical' | 'fire' | 'ice';

export interface ShakeConfig {
  intensity: number; // 0-10
  duration: number; // milliseconds
  frequency?: number; // Hz
  decay?: boolean;
}

export interface FlashConfig {
  color: string;
  duration: number;
  intensity: number; // 0-1
}

export interface SlowMotionConfig {
  scale: number; // 0-1, where 0.5 = half speed
  duration: number;
  easeIn?: boolean;
  easeOut?: boolean;
}

export interface VignetteConfig {
  intensity: number; // 0-1
  duration: number;
}

export interface ColorGradingConfig {
  preset?: ColorGradingPreset;
  saturation?: number; // 0-2
  brightness?: number; // 0-2
  contrast?: number; // 0-2
  hue?: number; // -180 to 180
  duration?: number;
}

export interface ZoomConfig {
  scale: number; // 1 = normal, 2 = 2x zoom
  duration: number;
  targetX?: number; // % of screen
  targetY?: number; // % of screen
  easeIn?: boolean;
  easeOut?: boolean;
}

export interface BlurConfig {
  intensity: number; // pixels
  duration: number;
}

export interface ScreenEffectState {
  shake: { x: number; y: number };
  flash: { color: string; opacity: number };
  slowMotion: number;
  vignette: number;
  colorGrading: ColorGradingConfig;
  zoom: number;
  zoomOrigin: { x: number; y: number };
  blur: number;
  chromaticAberration: number;
  scanlines: boolean;
  freezeFrame: boolean;
}

interface ScreenEffectsContextType {
  triggerShake: (config: ShakeConfig) => void;
  triggerFlash: (config: FlashConfig) => void;
  triggerSlowMotion: (config: SlowMotionConfig) => void;
  triggerVignette: (config: VignetteConfig) => void;
  triggerColorGrading: (config: ColorGradingConfig) => void;
  triggerZoom: (config: ZoomConfig) => void;
  triggerBlur: (config: BlurConfig) => void;
  triggerChromaticAberration: (intensity: number, duration: number) => void;
  toggleScanlines: (enabled: boolean) => void;
  triggerFreezeFrame: (duration: number) => void;
  resetAll: () => void;
  state: ScreenEffectState;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ScreenEffectsContext = createContext<ScreenEffectsContextType | undefined>(undefined);

export const useScreenEffects = () => {
  const context = useContext(ScreenEffectsContext);
  if (!context) {
    throw new Error('useScreenEffects must be used within ScreenEffectsProvider');
  }
  return context;
};

// ============================================================================
// PROVIDER COMPONENT
// ============================================================================

export const ScreenEffectsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ScreenEffectState>({
    shake: { x: 0, y: 0 },
    flash: { color: '#FFFFFF', opacity: 0 },
    slowMotion: 1,
    vignette: 0,
    colorGrading: {},
    zoom: 1,
    zoomOrigin: { x: 50, y: 50 },
    blur: 0,
    chromaticAberration: 0,
    scanlines: false,
    freezeFrame: false,
  });

  const activeEffects = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const shakeAnimationFrame = useRef<number | null>(null);

  // ============================================================================
  // SCREEN SHAKE
  // ============================================================================

  const triggerShake = useCallback((config: ShakeConfig) => {
    const {
      intensity,
      duration,
      frequency = 30,
      decay = true,
    } = config;

    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = elapsed / duration;

      if (progress >= 1) {
        setState(prev => ({ ...prev, shake: { x: 0, y: 0 } }));
        return;
      }

      const currentIntensity = decay ? intensity * (1 - progress) : intensity;
      const offsetX = (Math.random() - 0.5) * currentIntensity * 2;
      const offsetY = (Math.random() - 0.5) * currentIntensity * 2;

      setState(prev => ({
        ...prev,
        shake: { x: offsetX, y: offsetY },
      }));

      shakeAnimationFrame.current = requestAnimationFrame(animate);
    };

    if (shakeAnimationFrame.current) {
      cancelAnimationFrame(shakeAnimationFrame.current);
    }

    animate();
  }, []);

  // ============================================================================
  // FLASH EFFECT
  // ============================================================================

  const triggerFlash = useCallback((config: FlashConfig) => {
    const { color, duration, intensity } = config;

    setState(prev => ({
      ...prev,
      flash: { color, opacity: intensity },
    }));

    const effectId = 'flash';
    if (activeEffects.current.has(effectId)) {
      clearTimeout(activeEffects.current.get(effectId)!);
    }

    const timeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        flash: { ...prev.flash, opacity: 0 },
      }));
      activeEffects.current.delete(effectId);
    }, duration);

    activeEffects.current.set(effectId, timeout);
  }, []);

  // ============================================================================
  // SLOW MOTION
  // ============================================================================

  const triggerSlowMotion = useCallback((config: SlowMotionConfig) => {
    const { scale, duration, easeIn = true, easeOut = true } = config;

    const startTime = Date.now();
    const startScale = 1;
    const targetScale = scale;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let currentScale: number;

      if (progress < 0.2 && easeIn) {
        // Ease in
        const easeProgress = progress / 0.2;
        currentScale = startScale + (targetScale - startScale) * easeProgress;
      } else if (progress > 0.8 && easeOut) {
        // Ease out
        const easeProgress = (progress - 0.8) / 0.2;
        currentScale = targetScale + (startScale - targetScale) * easeProgress;
      } else {
        currentScale = targetScale;
      }

      setState(prev => ({ ...prev, slowMotion: currentScale }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setState(prev => ({ ...prev, slowMotion: 1 }));
      }
    };

    animate();
  }, []);

  // ============================================================================
  // VIGNETTE
  // ============================================================================

  const triggerVignette = useCallback((config: VignetteConfig) => {
    const { intensity, duration } = config;

    setState(prev => ({ ...prev, vignette: intensity }));

    const effectId = 'vignette';
    if (activeEffects.current.has(effectId)) {
      clearTimeout(activeEffects.current.get(effectId)!);
    }

    if (duration > 0) {
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, vignette: 0 }));
        activeEffects.current.delete(effectId);
      }, duration);

      activeEffects.current.set(effectId, timeout);
    }
  }, []);

  // ============================================================================
  // COLOR GRADING
  // ============================================================================

  const triggerColorGrading = useCallback((config: ColorGradingConfig) => {
    const presets: Record<ColorGradingPreset, Partial<ColorGradingConfig>> = {
      normal: {
        saturation: 1,
        brightness: 1,
        contrast: 1,
        hue: 0,
      },
      victory: {
        saturation: 1.3,
        brightness: 1.2,
        contrast: 1.1,
        hue: 30, // Golden tint
      },
      defeat: {
        saturation: 0.5,
        brightness: 0.8,
        contrast: 0.9,
        hue: 0,
      },
      boss: {
        saturation: 1.2,
        brightness: 0.9,
        contrast: 1.3,
        hue: -15, // Reddish tint
      },
      critical: {
        saturation: 1.5,
        brightness: 1.1,
        contrast: 1.2,
        hue: 0,
      },
      fire: {
        saturation: 1.4,
        brightness: 1.1,
        contrast: 1.2,
        hue: 15, // Orange tint
      },
      ice: {
        saturation: 1.2,
        brightness: 1.0,
        contrast: 1.1,
        hue: -120, // Blue tint
      },
    };

    const preset = config.preset ? presets[config.preset] : {};
    const finalConfig = { ...preset, ...config };

    setState(prev => ({ ...prev, colorGrading: finalConfig }));

    const effectId = 'colorGrading';
    if (activeEffects.current.has(effectId)) {
      clearTimeout(activeEffects.current.get(effectId)!);
    }

    if (finalConfig.duration && finalConfig.duration > 0) {
      const timeout = setTimeout(() => {
        setState(prev => ({ ...prev, colorGrading: {} }));
        activeEffects.current.delete(effectId);
      }, finalConfig.duration);

      activeEffects.current.set(effectId, timeout);
    }
  }, []);

  // ============================================================================
  // ZOOM
  // ============================================================================

  const triggerZoom = useCallback((config: ZoomConfig) => {
    const {
      scale,
      duration,
      targetX = 50,
      targetY = 50,
      easeIn = true,
      easeOut = true,
    } = config;

    const startTime = Date.now();
    const startScale = 1;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      let currentScale: number;

      if (progress < 0.3 && easeIn) {
        const easeProgress = progress / 0.3;
        const eased = easeProgress * easeProgress;
        currentScale = startScale + (scale - startScale) * eased;
      } else if (progress > 0.7 && easeOut) {
        const easeProgress = (progress - 0.7) / 0.3;
        const eased = 1 - (1 - easeProgress) * (1 - easeProgress);
        currentScale = scale + (startScale - scale) * eased;
      } else {
        currentScale = scale;
      }

      setState(prev => ({
        ...prev,
        zoom: currentScale,
        zoomOrigin: { x: targetX, y: targetY },
      }));

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setState(prev => ({
          ...prev,
          zoom: 1,
          zoomOrigin: { x: 50, y: 50 },
        }));
      }
    };

    animate();
  }, []);

  // ============================================================================
  // BLUR
  // ============================================================================

  const triggerBlur = useCallback((config: BlurConfig) => {
    const { intensity, duration } = config;

    setState(prev => ({ ...prev, blur: intensity }));

    const effectId = 'blur';
    if (activeEffects.current.has(effectId)) {
      clearTimeout(activeEffects.current.get(effectId)!);
    }

    const timeout = setTimeout(() => {
      setState(prev => ({ ...prev, blur: 0 }));
      activeEffects.current.delete(effectId);
    }, duration);

    activeEffects.current.set(effectId, timeout);
  }, []);

  // ============================================================================
  // CHROMATIC ABERRATION
  // ============================================================================

  const triggerChromaticAberration = useCallback((intensity: number, duration: number) => {
    setState(prev => ({ ...prev, chromaticAberration: intensity }));

    const effectId = 'chromatic';
    if (activeEffects.current.has(effectId)) {
      clearTimeout(activeEffects.current.get(effectId)!);
    }

    const timeout = setTimeout(() => {
      setState(prev => ({ ...prev, chromaticAberration: 0 }));
      activeEffects.current.delete(effectId);
    }, duration);

    activeEffects.current.set(effectId, timeout);
  }, []);

  // ============================================================================
  // SCANLINES
  // ============================================================================

  const toggleScanlines = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, scanlines: enabled }));
  }, []);

  // ============================================================================
  // FREEZE FRAME
  // ============================================================================

  const triggerFreezeFrame = useCallback((duration: number) => {
    setState(prev => ({ ...prev, freezeFrame: true }));

    const effectId = 'freeze';
    if (activeEffects.current.has(effectId)) {
      clearTimeout(activeEffects.current.get(effectId)!);
    }

    const timeout = setTimeout(() => {
      setState(prev => ({ ...prev, freezeFrame: false }));
      activeEffects.current.delete(effectId);
    }, duration);

    activeEffects.current.set(effectId, timeout);
  }, []);

  // ============================================================================
  // RESET
  // ============================================================================

  const resetAll = useCallback(() => {
    if (shakeAnimationFrame.current) {
      cancelAnimationFrame(shakeAnimationFrame.current);
    }

    activeEffects.current.forEach(timeout => clearTimeout(timeout));
    activeEffects.current.clear();

    setState({
      shake: { x: 0, y: 0 },
      flash: { color: '#FFFFFF', opacity: 0 },
      slowMotion: 1,
      vignette: 0,
      colorGrading: {},
      zoom: 1,
      zoomOrigin: { x: 50, y: 50 },
      blur: 0,
      chromaticAberration: 0,
      scanlines: false,
      freezeFrame: false,
    });
  }, []);

  // ============================================================================
  // CLEANUP
  // ============================================================================

  useEffect(() => {
    return () => {
      if (shakeAnimationFrame.current) {
        cancelAnimationFrame(shakeAnimationFrame.current);
      }
      activeEffects.current.forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const value: ScreenEffectsContextType = {
    triggerShake,
    triggerFlash,
    triggerSlowMotion,
    triggerVignette,
    triggerColorGrading,
    triggerZoom,
    triggerBlur,
    triggerChromaticAberration,
    toggleScanlines,
    triggerFreezeFrame,
    resetAll,
    state,
  };

  // ============================================================================
  // BUILD FILTER STRING
  // ============================================================================

  const buildFilterString = () => {
    const filters: string[] = [];

    if (state.blur > 0) {
      filters.push(`blur(${state.blur}px)`);
    }

    if (state.colorGrading.saturation !== undefined && state.colorGrading.saturation !== 1) {
      filters.push(`saturate(${state.colorGrading.saturation})`);
    }

    if (state.colorGrading.brightness !== undefined && state.colorGrading.brightness !== 1) {
      filters.push(`brightness(${state.colorGrading.brightness})`);
    }

    if (state.colorGrading.contrast !== undefined && state.colorGrading.contrast !== 1) {
      filters.push(`contrast(${state.colorGrading.contrast})`);
    }

    if (state.colorGrading.hue !== undefined && state.colorGrading.hue !== 0) {
      filters.push(`hue-rotate(${state.colorGrading.hue}deg)`);
    }

    return filters.length > 0 ? filters.join(' ') : 'none';
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <ScreenEffectsContext.Provider value={value}>
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: '100%',
            height: '100%',
            transform: `translate(${state.shake.x}px, ${state.shake.y}px) scale(${state.zoom})`,
            transformOrigin: `${state.zoomOrigin.x}% ${state.zoomOrigin.y}%`,
            filter: buildFilterString(),
            transition: 'filter 0.3s ease',
          }}
        >
          {children}
        </div>

        {/* Flash Overlay */}
        {state.flash.opacity > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: state.flash.color,
              opacity: state.flash.opacity,
              pointerEvents: 'none',
              transition: 'opacity 0.1s ease-out',
              zIndex: 9998,
            }}
          />
        )}

        {/* Vignette Overlay */}
        {state.vignette > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle, transparent 0%, rgba(0, 0, 0, ${state.vignette}) 100%)`,
              pointerEvents: 'none',
              transition: 'background 0.3s ease',
              zIndex: 9997,
            }}
          />
        )}

        {/* Scanlines Overlay */}
        {state.scanlines && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.1) 0px, transparent 2px, transparent 4px)',
              pointerEvents: 'none',
              zIndex: 9996,
            }}
          />
        )}

        {/* Chromatic Aberration Overlay */}
        {state.chromaticAberration > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: 'none',
              zIndex: 9995,
              mixBlendMode: 'screen',
              filter: `blur(${state.chromaticAberration}px)`,
            }}
          />
        )}
      </div>
    </ScreenEffectsContext.Provider>
  );
};
