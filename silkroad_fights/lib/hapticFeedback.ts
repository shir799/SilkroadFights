/**
 * HapticFeedback.ts - Mobile Vibration System
 * Provides tactile feedback for mobile devices
 */

// ============================================================================
// HAPTIC TYPES AND PATTERNS
// ============================================================================

export type HapticType =
  | 'selection'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'success'
  | 'warning'
  | 'error'
  | 'impact_light'
  | 'impact_medium'
  | 'impact_heavy'
  | 'notification'
  | 'critical_hit'
  | 'damage_light'
  | 'damage_heavy'
  | 'ability_activate'
  | 'level_up'
  | 'boss_spawn'
  | 'victory'
  | 'defeat';

export interface HapticPattern {
  type: HapticType;
  pattern: number[]; // [vibrate, pause, vibrate, pause, ...]
  intensity?: number; // 0-1 (not supported by all browsers)
}

// ============================================================================
// HAPTIC PATTERNS CONFIGURATION
// ============================================================================

const HAPTIC_PATTERNS: Record<HapticType, HapticPattern> = {
  // Basic Haptics
  selection: {
    type: 'selection',
    pattern: [10],
    intensity: 0.3,
  },

  light: {
    type: 'light',
    pattern: [20],
    intensity: 0.4,
  },

  medium: {
    type: 'medium',
    pattern: [40],
    intensity: 0.6,
  },

  heavy: {
    type: 'heavy',
    pattern: [60],
    intensity: 0.8,
  },

  // Feedback Types
  success: {
    type: 'success',
    pattern: [30, 20, 30],
    intensity: 0.5,
  },

  warning: {
    type: 'warning',
    pattern: [50, 30, 50],
    intensity: 0.7,
  },

  error: {
    type: 'error',
    pattern: [100, 50, 100],
    intensity: 0.9,
  },

  // Impact Haptics
  impact_light: {
    type: 'impact_light',
    pattern: [15],
    intensity: 0.4,
  },

  impact_medium: {
    type: 'impact_medium',
    pattern: [35],
    intensity: 0.6,
  },

  impact_heavy: {
    type: 'impact_heavy',
    pattern: [70],
    intensity: 0.9,
  },

  notification: {
    type: 'notification',
    pattern: [40, 30, 40, 30, 40],
    intensity: 0.6,
  },

  // Game-Specific Haptics
  critical_hit: {
    type: 'critical_hit',
    pattern: [20, 10, 50, 10, 20],
    intensity: 0.8,
  },

  damage_light: {
    type: 'damage_light',
    pattern: [25],
    intensity: 0.5,
  },

  damage_heavy: {
    type: 'damage_heavy',
    pattern: [60, 20, 40],
    intensity: 0.9,
  },

  ability_activate: {
    type: 'ability_activate',
    pattern: [30, 15, 45],
    intensity: 0.7,
  },

  level_up: {
    type: 'level_up',
    pattern: [50, 30, 50, 30, 50, 30, 100],
    intensity: 0.8,
  },

  boss_spawn: {
    type: 'boss_spawn',
    pattern: [100, 50, 100, 50, 150],
    intensity: 1.0,
  },

  victory: {
    type: 'victory',
    pattern: [50, 30, 50, 30, 50, 30, 100, 50, 150],
    intensity: 0.8,
  },

  defeat: {
    type: 'defeat',
    pattern: [200, 100, 200],
    intensity: 0.9,
  },
};

// ============================================================================
// HAPTIC FEEDBACK CLASS
// ============================================================================

export class HapticFeedback {
  private static instance: HapticFeedback;
  private isEnabled: boolean = true;
  private isSupported: boolean = false;
  private globalIntensity: number = 1.0;
  private vibrationQueue: HapticPattern[] = [];
  private isVibrating: boolean = false;

  private constructor() {
    this.checkSupport();
  }

  public static getInstance(): HapticFeedback {
    if (!HapticFeedback.instance) {
      HapticFeedback.instance = new HapticFeedback();
    }
    return HapticFeedback.instance;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  private checkSupport(): void {
    // Check if vibration API is supported
    this.isSupported = 'vibrate' in navigator;

    if (!this.isSupported) {
      console.warn('Vibration API is not supported on this device');
    }
  }

  public isHapticSupported(): boolean {
    return this.isSupported;
  }

  // ============================================================================
  // HAPTIC TRIGGERING
  // ============================================================================

  public trigger(type: HapticType): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    const pattern = HAPTIC_PATTERNS[type];
    if (!pattern) {
      console.warn(`Unknown haptic type: ${type}`);
      return;
    }

    this.vibrate(pattern);
  }

  public triggerPattern(pattern: number[]): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    this.vibrate({
      type: 'light',
      pattern,
      intensity: 0.5,
    });
  }

  public triggerCustom(pattern: number[], intensity: number = 0.5): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    this.vibrate({
      type: 'light',
      pattern,
      intensity,
    });
  }

  // ============================================================================
  // VIBRATION EXECUTION
  // ============================================================================

  private vibrate(hapticPattern: HapticPattern): void {
    if (!this.isSupported) return;

    // Apply global intensity modifier
    const adjustedPattern = hapticPattern.pattern.map(
      duration => duration * this.globalIntensity
    );

    try {
      // Cancel any ongoing vibration
      navigator.vibrate(0);

      // Start new vibration
      navigator.vibrate(adjustedPattern);
    } catch (error) {
      console.warn('Failed to trigger vibration:', error);
    }
  }

  // ============================================================================
  // ADVANCED PATTERNS
  // ============================================================================

  public pulsate(duration: number = 1000, frequency: number = 100): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    const pattern: number[] = [];
    const pulseCount = Math.floor(duration / (frequency * 2));

    for (let i = 0; i < pulseCount; i++) {
      pattern.push(frequency / 2);
      pattern.push(frequency / 2);
    }

    this.triggerPattern(pattern);
  }

  public crescendo(startIntensity: number = 20, endIntensity: number = 100, steps: number = 5): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    const pattern: number[] = [];
    const stepSize = (endIntensity - startIntensity) / steps;

    for (let i = 0; i < steps; i++) {
      const intensity = startIntensity + stepSize * i;
      pattern.push(intensity);
      pattern.push(30); // Pause between steps
    }

    this.triggerPattern(pattern);
  }

  public decrescendo(startIntensity: number = 100, endIntensity: number = 20, steps: number = 5): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    const pattern: number[] = [];
    const stepSize = (startIntensity - endIntensity) / steps;

    for (let i = 0; i < steps; i++) {
      const intensity = startIntensity - stepSize * i;
      pattern.push(intensity);
      pattern.push(30); // Pause between steps
    }

    this.triggerPattern(pattern);
  }

  public rhythmic(beats: number[], tempo: number = 500): void {
    if (!this.isEnabled || !this.isSupported) {
      return;
    }

    const pattern: number[] = [];

    for (const beat of beats) {
      const duration = (beat * tempo) / 4; // Convert beat to duration
      pattern.push(duration * 0.7); // Vibration
      pattern.push(duration * 0.3); // Pause
    }

    this.triggerPattern(pattern);
  }

  // ============================================================================
  // CONTROLS
  // ============================================================================

  public enable(): void {
    this.isEnabled = true;
  }

  public disable(): void {
    this.isEnabled = false;
    this.stopAll();
  }

  public toggle(): void {
    if (this.isEnabled) {
      this.disable();
    } else {
      this.enable();
    }
  }

  public setEnabled(enabled: boolean): void {
    if (enabled) {
      this.enable();
    } else {
      this.disable();
    }
  }

  public isHapticEnabled(): boolean {
    return this.isEnabled;
  }

  public setIntensity(intensity: number): void {
    this.globalIntensity = Math.max(0, Math.min(1, intensity));
  }

  public getIntensity(): number {
    return this.globalIntensity;
  }

  public stopAll(): void {
    if (this.isSupported) {
      navigator.vibrate(0);
    }
    this.vibrationQueue = [];
    this.isVibrating = false;
  }

  // ============================================================================
  // GAME-SPECIFIC HELPERS
  // ============================================================================

  public onUnitSelect(): void {
    this.trigger('selection');
  }

  public onUnitMove(): void {
    this.trigger('light');
  }

  public onAttack(isCritical: boolean = false): void {
    if (isCritical) {
      this.trigger('critical_hit');
    } else {
      this.trigger('impact_medium');
    }
  }

  public onDamage(damageAmount: number, maxHealth: number): void {
    const damagePercent = damageAmount / maxHealth;

    if (damagePercent > 0.3) {
      this.trigger('damage_heavy');
    } else {
      this.trigger('damage_light');
    }
  }

  public onAbilityActivate(): void {
    this.trigger('ability_activate');
  }

  public onGoldPickup(): void {
    this.trigger('success');
  }

  public onSilkCollect(): void {
    this.trigger('success');
  }

  public onBossSpawn(): void {
    this.trigger('boss_spawn');
  }

  public onLevelUp(): void {
    this.trigger('level_up');
  }

  public onVictory(): void {
    this.trigger('victory');
  }

  public onDefeat(): void {
    this.trigger('defeat');
  }

  public onError(): void {
    this.trigger('error');
  }

  public onWarning(): void {
    this.trigger('warning');
  }

  public onNotification(): void {
    this.trigger('notification');
  }

  // ============================================================================
  // TESTING
  // ============================================================================

  public test(): void {
    if (!this.isSupported) {
      console.log('Haptic feedback is not supported on this device');
      return;
    }

    console.log('Testing haptic feedback patterns...');

    const types: HapticType[] = [
      'selection',
      'light',
      'medium',
      'heavy',
      'success',
      'critical_hit',
    ];

    let delay = 0;
    types.forEach((type, index) => {
      setTimeout(() => {
        console.log(`Testing ${type}...`);
        this.trigger(type);
      }, delay);
      delay += 1000;
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const hapticFeedback = HapticFeedback.getInstance();
