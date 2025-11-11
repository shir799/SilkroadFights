/**
 * feedbackIntegration.ts - Complete Feedback Integration Layer
 * Connects all feedback systems with game events
 */

import { soundSystem, SoundEffect } from './soundSystem';
import { particleSystem, ParticleType } from './particleSystem';
import { hapticFeedback, HapticType } from './hapticFeedback';
import type { Position, CombatEvent, PlayerAction } from './newTypes';

// ============================================================================
// FEEDBACK MANAGER
// ============================================================================

export class FeedbackManager {
  private static instance: FeedbackManager;
  private isInitialized = false;
  private settings = {
    soundEnabled: true,
    particlesEnabled: true,
    hapticsEnabled: true,
    screenEffectsEnabled: true,
    masterVolume: 0.7,
    particleQuality: 'high' as 'low' | 'medium' | 'high',
  };

  private constructor() {}

  public static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager();
    }
    return FeedbackManager.instance;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  public async initialize(particleCanvas?: HTMLCanvasElement): Promise<void> {
    if (this.isInitialized) {
      console.warn('FeedbackManager already initialized');
      return;
    }

    // Preload essential sounds
    const essentialSounds: SoundEffect[] = [
      'unit_select',
      'unit_move_start',
      'attack_sword_clash',
      'hit_normal',
      'hit_critical',
      'gold_pickup',
      'silk_collect',
      'boss_roar',
      'victory_fanfare',
      'defeat_sound',
    ];

    await soundSystem.preloadSounds(essentialSounds);

    // Initialize particle system
    if (particleCanvas) {
      particleSystem.initialize(particleCanvas);
      this.adjustParticleQuality();
    }

    // Apply initial settings
    soundSystem.setMasterVolume(this.settings.masterVolume);
    hapticFeedback.setEnabled(this.settings.hapticsEnabled);

    this.isInitialized = true;
    console.log('FeedbackManager initialized');
  }

  // ============================================================================
  // SETTINGS
  // ============================================================================

  public updateSettings(settings: Partial<typeof this.settings>): void {
    this.settings = { ...this.settings, ...settings };

    if (settings.soundEnabled !== undefined) {
      soundSystem.setMuted(!settings.soundEnabled);
    }

    if (settings.masterVolume !== undefined) {
      soundSystem.setMasterVolume(settings.masterVolume);
    }

    if (settings.hapticsEnabled !== undefined) {
      hapticFeedback.setEnabled(settings.hapticsEnabled);
    }

    if (settings.particlesEnabled !== undefined) {
      if (!settings.particlesEnabled) {
        particleSystem.clear();
        particleSystem.stop();
      } else {
        particleSystem.start();
      }
    }

    if (settings.particleQuality !== undefined) {
      this.adjustParticleQuality();
    }
  }

  private adjustParticleQuality(): void {
    const qualitySettings = {
      low: { maxParticles: 500 },
      medium: { maxParticles: 1000 },
      high: { maxParticles: 2000 },
    };

    const quality = qualitySettings[this.settings.particleQuality];
    particleSystem.setMaxParticles(quality.maxParticles);
  }

  public getSettings() {
    return { ...this.settings };
  }

  // ============================================================================
  // UNIT ACTIONS
  // ============================================================================

  public onUnitSelect(position: Position): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('unit_select', { position });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('dust', position);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onUnitSelect();
    }
  }

  public onUnitDeselect(position: Position): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('unit_deselect', { position });
    }
  }

  public onUnitMove(fromPosition: Position, toPosition: Position, terrainType: 'sand' | 'stone' = 'sand'): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('unit_move_start', { position: fromPosition });
      const footstepSound = terrainType === 'sand' ? 'unit_footsteps_sand' : 'unit_footsteps_stone';
      soundSystem.play(footstepSound, { position: toPosition });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('dust', fromPosition, { count: 5 });
      particleSystem.emitAt('footprint', toPosition);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onUnitMove();
    }
  }

  public onUnitDeath(position: Position, hasGold: boolean = false): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('unit_death', { position });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('blood', position);
      if (hasGold) {
        particleSystem.emitAt('gold_coin', position);
      }
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.trigger('impact_heavy');
    }
  }

  // ============================================================================
  // COMBAT ACTIONS
  // ============================================================================

  public onAttack(
    attackerPosition: Position,
    targetPosition: Position,
    weaponType: 'sword' | 'bow' | 'spear' | 'fist' = 'sword',
    isCritical: boolean = false
  ): void {
    // Attack sound
    if (this.settings.soundEnabled) {
      const attackSounds: Record<string, SoundEffect> = {
        sword: 'attack_sword_swing',
        bow: 'attack_bow_shoot',
        spear: 'attack_spear_thrust',
        fist: 'attack_punch',
      };
      soundSystem.play(attackSounds[weaponType], { position: attackerPosition });
    }

    // Weapon-specific particles
    if (this.settings.particlesEnabled) {
      if (weaponType === 'sword') {
        particleSystem.emitAt('slash', targetPosition);
      } else if (weaponType === 'bow') {
        particleSystem.emitAt('arrow_trail', targetPosition);
      }
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onAttack(isCritical);
    }
  }

  public onHit(
    position: Position,
    damage: number,
    maxHealth: number,
    isCritical: boolean = false,
    isBlocked: boolean = false
  ): { shake: number; flash?: { color: string; duration: number; intensity: number } } | null {
    if (!this.settings.soundEnabled && !this.settings.particlesEnabled && !this.settings.hapticsEnabled) {
      return null;
    }

    const screenEffects: { shake: number; flash?: { color: string; duration: number; intensity: number } } = {
      shake: 0,
    };

    if (isBlocked) {
      // Blocked attack
      if (this.settings.soundEnabled) {
        soundSystem.play('hit_blocked', { position });
      }
      if (this.settings.particlesEnabled) {
        particleSystem.emitAt('impact', position, { count: 10 });
      }
      screenEffects.shake = 2;
    } else if (isCritical) {
      // Critical hit
      if (this.settings.soundEnabled) {
        soundSystem.play('hit_critical', { position });
      }
      if (this.settings.particlesEnabled) {
        particleSystem.emitAt('critical_hit', position);
      }
      if (this.settings.hapticsEnabled) {
        hapticFeedback.trigger('critical_hit');
      }
      screenEffects.shake = 10;
      screenEffects.flash = { color: '#FF0000', duration: 100, intensity: 0.5 };
    } else {
      // Normal hit
      const damagePercent = damage / maxHealth;
      if (this.settings.soundEnabled) {
        const hitSound: SoundEffect = damagePercent > 0.3 ? 'damage_heavy' : 'damage_light';
        soundSystem.play(hitSound, { position });
      }
      if (this.settings.particlesEnabled) {
        particleSystem.emitAt('blood', position, { count: Math.floor(damage / 2) });
        particleSystem.emitAt('impact', position);
      }
      if (this.settings.hapticsEnabled) {
        hapticFeedback.onDamage(damage, maxHealth);
      }
      screenEffects.shake = damagePercent > 0.3 ? 7 : 3;
    }

    return this.settings.screenEffectsEnabled ? screenEffects : null;
  }

  public onMiss(position: Position): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('miss', { position });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('dust', position, { count: 5 });
    }
  }

  // ============================================================================
  // ABILITY ACTIONS
  // ============================================================================

  public onAbilityActivate(
    position: Position,
    abilityType: 'fire' | 'lightning' | 'heal' | 'buff' | 'debuff' | 'teleport' | 'shield' | 'poison' | 'ice'
  ): void {
    if (this.settings.soundEnabled) {
      const abilitySounds: Record<string, SoundEffect> = {
        fire: 'ability_fire',
        lightning: 'ability_lightning',
        heal: 'ability_heal',
        buff: 'ability_buff',
        debuff: 'ability_debuff',
        teleport: 'ability_teleport',
        shield: 'ability_shield',
        poison: 'ability_poison',
        ice: 'ability_fire', // Reuse fire for ice, or add specific sound
      };
      soundSystem.play('ability_activate', { position });
      soundSystem.play(abilitySounds[abilityType], { position, delay: 100 });
    }

    if (this.settings.particlesEnabled) {
      const abilityParticles: Record<string, ParticleType> = {
        fire: 'fire',
        lightning: 'lightning',
        heal: 'healing',
        buff: 'buff',
        debuff: 'debuff',
        teleport: 'magic_circle',
        shield: 'energy_burst',
        poison: 'poison',
        ice: 'ice',
      };
      particleSystem.emitAt(abilityParticles[abilityType], position);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onAbilityActivate();
    }
  }

  // ============================================================================
  // RESOURCE ACTIONS
  // ============================================================================

  public onGoldPickup(position: Position): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('gold_pickup', { position });
      soundSystem.play('gold_coins', { position, delay: 50 });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('gold_coin', position);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onGoldPickup();
    }
  }

  public onGoldDrop(position: Position): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('gold_drop', { position });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('gold_coin', position);
    }
  }

  public onSilkCollect(position: Position): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('silk_collect', { position });
      soundSystem.play('silk_shimmer', { position, delay: 100 });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('silk_sparkle', position);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onSilkCollect();
    }
  }

  // ============================================================================
  // BOSS ACTIONS
  // ============================================================================

  public onBossSpawn(position: Position): {
    shake: number;
    vignette: { intensity: number; duration: number };
    colorGrading: { preset: string; duration: number };
  } | null {
    if (this.settings.soundEnabled) {
      soundSystem.play('boss_spawn', { position });
      soundSystem.play('boss_roar', { position, delay: 500 });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('explosion', position);
      setTimeout(() => particleSystem.emitAt('smoke', position), 200);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onBossSpawn();
    }

    return this.settings.screenEffectsEnabled
      ? {
          shake: 15,
          vignette: { intensity: 0.5, duration: 3000 },
          colorGrading: { preset: 'boss', duration: 5000 },
        }
      : null;
  }

  public onBossAttack(position: Position): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('boss_attack', { position });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('energy_burst', position);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.trigger('damage_heavy');
    }
  }

  public onBossDefeat(position: Position): {
    shake: number;
    zoom: { scale: number; duration: number };
  } | null {
    if (this.settings.soundEnabled) {
      soundSystem.play('boss_defeated', { position });
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emitAt('explosion', position);
      setTimeout(() => particleSystem.emitAt('gold_coin', position), 300);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.trigger('heavy');
    }

    return this.settings.screenEffectsEnabled
      ? {
          shake: 12,
          zoom: { scale: 1.3, duration: 2000 },
        }
      : null;
  }

  // ============================================================================
  // GAME STATE ACTIONS
  // ============================================================================

  public onRoundStart(): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('round_start');
    }
  }

  public onRoundEnd(): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('round_end');
    }
  }

  public onLevelUp(position?: Position): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('level_up');
    }

    if (this.settings.particlesEnabled && position) {
      particleSystem.emitAt('level_up', position);
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onLevelUp();
    }
  }

  public onVictory(): {
    colorGrading: { preset: string; duration: number };
    zoom: { scale: number; duration: number };
  } | null {
    if (this.settings.soundEnabled) {
      soundSystem.play('victory_fanfare');
    }

    if (this.settings.particlesEnabled) {
      // Create victory particle burst
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          const x = Math.random() * 800;
          const y = Math.random() * 600;
          particleSystem.emit('level_up', { x, y });
        }, i * 200);
      }
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onVictory();
    }

    return this.settings.screenEffectsEnabled
      ? {
          colorGrading: { preset: 'victory', duration: 10000 },
          zoom: { scale: 1.2, duration: 3000 },
        }
      : null;
  }

  public onDefeat(): {
    colorGrading: { preset: string; duration: number };
    vignette: { intensity: number; duration: number };
  } | null {
    if (this.settings.soundEnabled) {
      soundSystem.play('defeat_sound');
    }

    if (this.settings.particlesEnabled) {
      particleSystem.emit('smoke', { x: 400, y: 300 });
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onDefeat();
    }

    return this.settings.screenEffectsEnabled
      ? {
          colorGrading: { preset: 'defeat', duration: 10000 },
          vignette: { intensity: 0.7, duration: 5000 },
        }
      : null;
  }

  // ============================================================================
  // UI ACTIONS
  // ============================================================================

  public onButtonClick(): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('ui_click');
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.trigger('selection');
    }
  }

  public onButtonHover(): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('ui_hover');
    }
  }

  public onConfirm(): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('ui_confirm');
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.trigger('success');
    }
  }

  public onCancel(): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('ui_cancel');
    }
  }

  public onError(message?: string): void {
    if (this.settings.soundEnabled) {
      soundSystem.play('ui_error');
    }

    if (this.settings.hapticsEnabled) {
      hapticFeedback.onError();
    }
  }

  // ============================================================================
  // COMBAT EVENT HANDLER
  // ============================================================================

  public handleCombatEvent(event: CombatEvent): void {
    switch (event.type) {
      case 'ATTACK_HIT':
        // Handle in game logic with more context
        break;

      case 'ATTACK_MISSED':
        // Handle in game logic
        break;

      case 'UNIT_DIED':
        // Handle in game logic
        break;

      case 'UNIT_MOVED':
        this.onUnitMove(event.fromPosition, event.toPosition);
        break;

      case 'GOLD_PICKED_UP':
        this.onGoldPickup(event.position);
        break;

      case 'GOLD_DROPPED':
        this.onGoldDrop(event.position);
        break;

      case 'SILK_COLLECTED':
        this.onSilkCollect(event.position);
        break;

      case 'BOSS_SPAWNED':
        this.onBossSpawn(event.position);
        break;

      case 'BOSS_DEFEATED':
        this.onBossDefeat(event.position);
        break;
    }
  }

  // ============================================================================
  // UTILITIES
  // ============================================================================

  public setListenerPosition(position: Position): void {
    soundSystem.setListenerPosition(position);
  }

  public stopAllSounds(): void {
    soundSystem.stopAll();
  }

  public clearAllParticles(): void {
    particleSystem.clear();
  }

  public resetAll(): void {
    soundSystem.stopAll();
    particleSystem.clear();
    hapticFeedback.stopAll();
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const feedbackManager = FeedbackManager.getInstance();
