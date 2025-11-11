/**
 * SoundSystem.ts - Complete Audio Manager
 * Handles all game sound effects with spatial audio, priority system, and volume controls
 */

import { Position } from './newTypes';

// ============================================================================
// SOUND TYPES AND CONFIGURATION
// ============================================================================

export type SoundCategory =
  | 'ui'
  | 'unit'
  | 'combat'
  | 'ability'
  | 'resource'
  | 'boss'
  | 'ambient'
  | 'music';

export type SoundEffect =
  // UI Sounds
  | 'ui_select'
  | 'ui_click'
  | 'ui_hover'
  | 'ui_confirm'
  | 'ui_cancel'
  | 'ui_error'
  | 'ui_notification'

  // Unit Sounds
  | 'unit_select'
  | 'unit_deselect'
  | 'unit_move_start'
  | 'unit_footsteps_sand'
  | 'unit_footsteps_stone'
  | 'unit_death'
  | 'unit_spawn'

  // Combat Sounds
  | 'attack_sword_swing'
  | 'attack_sword_clash'
  | 'attack_bow_shoot'
  | 'attack_bow_hit'
  | 'attack_spear_thrust'
  | 'attack_punch'
  | 'hit_normal'
  | 'hit_critical'
  | 'hit_blocked'
  | 'miss'
  | 'damage_light'
  | 'damage_heavy'

  // Ability Sounds
  | 'ability_activate'
  | 'ability_whoosh'
  | 'ability_fire'
  | 'ability_lightning'
  | 'ability_heal'
  | 'ability_buff'
  | 'ability_debuff'
  | 'ability_teleport'
  | 'ability_shield'
  | 'ability_poison'

  // Resource Sounds
  | 'gold_pickup'
  | 'gold_drop'
  | 'gold_coins'
  | 'silk_collect'
  | 'silk_shimmer'
  | 'silk_sparkle'
  | 'treasure_open'

  // Boss Sounds
  | 'boss_roar'
  | 'boss_spawn'
  | 'boss_attack'
  | 'boss_damaged'
  | 'boss_defeated'
  | 'boss_special_ability'

  // Game State Sounds
  | 'victory_fanfare'
  | 'defeat_sound'
  | 'round_start'
  | 'round_end'
  | 'countdown'
  | 'level_up'
  | 'achievement_unlock'

  // Ambient Sounds
  | 'ambient_wind'
  | 'ambient_market'
  | 'ambient_battle'
  | 'ambient_night';

export interface SoundConfig {
  id: string;
  url: string;
  category: SoundCategory;
  volume: number; // 0-1
  loop: boolean;
  priority: number; // 0-10, higher = more important
  maxInstances: number;
  pitchVariation: number; // 0-1, random pitch variance
  spatial: boolean; // Use 3D positioning
}

export interface SoundInstance {
  id: string;
  audio: HTMLAudioElement;
  config: SoundConfig;
  position?: Position;
  startTime: number;
  isPlaying: boolean;
  isPaused: boolean;
  volume: number;
}

export interface SpatialConfig {
  listenerPosition: Position;
  maxDistance: number; // Max distance for sound falloff
  rolloffFactor: number; // How quickly sound fades with distance
}

// ============================================================================
// SOUND LIBRARY CONFIGURATION
// ============================================================================

const SOUND_LIBRARY: Record<SoundEffect, Omit<SoundConfig, 'id'>> = {
  // UI Sounds
  ui_select: {
    url: '/sounds/ui/select.mp3',
    category: 'ui',
    volume: 0.5,
    loop: false,
    priority: 3,
    maxInstances: 1,
    pitchVariation: 0.1,
    spatial: false,
  },
  ui_click: {
    url: '/sounds/ui/click.mp3',
    category: 'ui',
    volume: 0.4,
    loop: false,
    priority: 2,
    maxInstances: 3,
    pitchVariation: 0.05,
    spatial: false,
  },
  ui_hover: {
    url: '/sounds/ui/hover.mp3',
    category: 'ui',
    volume: 0.3,
    loop: false,
    priority: 1,
    maxInstances: 1,
    pitchVariation: 0.05,
    spatial: false,
  },
  ui_confirm: {
    url: '/sounds/ui/confirm.mp3',
    category: 'ui',
    volume: 0.6,
    loop: false,
    priority: 4,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  ui_cancel: {
    url: '/sounds/ui/cancel.mp3',
    category: 'ui',
    volume: 0.5,
    loop: false,
    priority: 3,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  ui_error: {
    url: '/sounds/ui/error.mp3',
    category: 'ui',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  ui_notification: {
    url: '/sounds/ui/notification.mp3',
    category: 'ui',
    volume: 0.7,
    loop: false,
    priority: 6,
    maxInstances: 3,
    pitchVariation: 0,
    spatial: false,
  },

  // Unit Sounds
  unit_select: {
    url: '/sounds/unit/select.mp3',
    category: 'unit',
    volume: 0.6,
    loop: false,
    priority: 4,
    maxInstances: 1,
    pitchVariation: 0.1,
    spatial: true,
  },
  unit_deselect: {
    url: '/sounds/unit/deselect.mp3',
    category: 'unit',
    volume: 0.4,
    loop: false,
    priority: 2,
    maxInstances: 1,
    pitchVariation: 0.1,
    spatial: true,
  },
  unit_move_start: {
    url: '/sounds/unit/move_start.mp3',
    category: 'unit',
    volume: 0.5,
    loop: false,
    priority: 3,
    maxInstances: 5,
    pitchVariation: 0.15,
    spatial: true,
  },
  unit_footsteps_sand: {
    url: '/sounds/unit/footsteps_sand.mp3',
    category: 'unit',
    volume: 0.4,
    loop: true,
    priority: 2,
    maxInstances: 10,
    pitchVariation: 0.2,
    spatial: true,
  },
  unit_footsteps_stone: {
    url: '/sounds/unit/footsteps_stone.mp3',
    category: 'unit',
    volume: 0.4,
    loop: true,
    priority: 2,
    maxInstances: 10,
    pitchVariation: 0.2,
    spatial: true,
  },
  unit_death: {
    url: '/sounds/unit/death.mp3',
    category: 'unit',
    volume: 0.8,
    loop: false,
    priority: 7,
    maxInstances: 5,
    pitchVariation: 0.1,
    spatial: true,
  },
  unit_spawn: {
    url: '/sounds/unit/spawn.mp3',
    category: 'unit',
    volume: 0.6,
    loop: false,
    priority: 4,
    maxInstances: 3,
    pitchVariation: 0.1,
    spatial: true,
  },

  // Combat Sounds
  attack_sword_swing: {
    url: '/sounds/combat/sword_swing.mp3',
    category: 'combat',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 8,
    pitchVariation: 0.2,
    spatial: true,
  },
  attack_sword_clash: {
    url: '/sounds/combat/sword_clash.mp3',
    category: 'combat',
    volume: 0.7,
    loop: false,
    priority: 6,
    maxInstances: 8,
    pitchVariation: 0.15,
    spatial: true,
  },
  attack_bow_shoot: {
    url: '/sounds/combat/bow_shoot.mp3',
    category: 'combat',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 6,
    pitchVariation: 0.1,
    spatial: true,
  },
  attack_bow_hit: {
    url: '/sounds/combat/bow_hit.mp3',
    category: 'combat',
    volume: 0.5,
    loop: false,
    priority: 5,
    maxInstances: 6,
    pitchVariation: 0.15,
    spatial: true,
  },
  attack_spear_thrust: {
    url: '/sounds/combat/spear_thrust.mp3',
    category: 'combat',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 6,
    pitchVariation: 0.15,
    spatial: true,
  },
  attack_punch: {
    url: '/sounds/combat/punch.mp3',
    category: 'combat',
    volume: 0.5,
    loop: false,
    priority: 4,
    maxInstances: 8,
    pitchVariation: 0.25,
    spatial: true,
  },
  hit_normal: {
    url: '/sounds/combat/hit_normal.mp3',
    category: 'combat',
    volume: 0.6,
    loop: false,
    priority: 6,
    maxInstances: 10,
    pitchVariation: 0.2,
    spatial: true,
  },
  hit_critical: {
    url: '/sounds/combat/hit_critical.mp3',
    category: 'combat',
    volume: 0.8,
    loop: false,
    priority: 8,
    maxInstances: 5,
    pitchVariation: 0.1,
    spatial: true,
  },
  hit_blocked: {
    url: '/sounds/combat/hit_blocked.mp3',
    category: 'combat',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 6,
    pitchVariation: 0.15,
    spatial: true,
  },
  miss: {
    url: '/sounds/combat/miss.mp3',
    category: 'combat',
    volume: 0.4,
    loop: false,
    priority: 3,
    maxInstances: 6,
    pitchVariation: 0.2,
    spatial: true,
  },
  damage_light: {
    url: '/sounds/combat/damage_light.mp3',
    category: 'combat',
    volume: 0.5,
    loop: false,
    priority: 5,
    maxInstances: 8,
    pitchVariation: 0.2,
    spatial: true,
  },
  damage_heavy: {
    url: '/sounds/combat/damage_heavy.mp3',
    category: 'combat',
    volume: 0.7,
    loop: false,
    priority: 7,
    maxInstances: 6,
    pitchVariation: 0.15,
    spatial: true,
  },

  // Ability Sounds
  ability_activate: {
    url: '/sounds/ability/activate.mp3',
    category: 'ability',
    volume: 0.7,
    loop: false,
    priority: 6,
    maxInstances: 5,
    pitchVariation: 0.1,
    spatial: true,
  },
  ability_whoosh: {
    url: '/sounds/ability/whoosh.mp3',
    category: 'ability',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 5,
    pitchVariation: 0.15,
    spatial: true,
  },
  ability_fire: {
    url: '/sounds/ability/fire.mp3',
    category: 'ability',
    volume: 0.7,
    loop: false,
    priority: 6,
    maxInstances: 4,
    pitchVariation: 0.1,
    spatial: true,
  },
  ability_lightning: {
    url: '/sounds/ability/lightning.mp3',
    category: 'ability',
    volume: 0.8,
    loop: false,
    priority: 7,
    maxInstances: 4,
    pitchVariation: 0.1,
    spatial: true,
  },
  ability_heal: {
    url: '/sounds/ability/heal.mp3',
    category: 'ability',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 5,
    pitchVariation: 0.05,
    spatial: true,
  },
  ability_buff: {
    url: '/sounds/ability/buff.mp3',
    category: 'ability',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 5,
    pitchVariation: 0.1,
    spatial: true,
  },
  ability_debuff: {
    url: '/sounds/ability/debuff.mp3',
    category: 'ability',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 5,
    pitchVariation: 0.1,
    spatial: true,
  },
  ability_teleport: {
    url: '/sounds/ability/teleport.mp3',
    category: 'ability',
    volume: 0.7,
    loop: false,
    priority: 6,
    maxInstances: 3,
    pitchVariation: 0.05,
    spatial: true,
  },
  ability_shield: {
    url: '/sounds/ability/shield.mp3',
    category: 'ability',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 4,
    pitchVariation: 0.1,
    spatial: true,
  },
  ability_poison: {
    url: '/sounds/ability/poison.mp3',
    category: 'ability',
    volume: 0.5,
    loop: false,
    priority: 5,
    maxInstances: 4,
    pitchVariation: 0.15,
    spatial: true,
  },

  // Resource Sounds
  gold_pickup: {
    url: '/sounds/resource/gold_pickup.mp3',
    category: 'resource',
    volume: 0.7,
    loop: false,
    priority: 6,
    maxInstances: 5,
    pitchVariation: 0.1,
    spatial: true,
  },
  gold_drop: {
    url: '/sounds/resource/gold_drop.mp3',
    category: 'resource',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 5,
    pitchVariation: 0.15,
    spatial: true,
  },
  gold_coins: {
    url: '/sounds/resource/gold_coins.mp3',
    category: 'resource',
    volume: 0.5,
    loop: false,
    priority: 4,
    maxInstances: 8,
    pitchVariation: 0.2,
    spatial: true,
  },
  silk_collect: {
    url: '/sounds/resource/silk_collect.mp3',
    category: 'resource',
    volume: 0.7,
    loop: false,
    priority: 7,
    maxInstances: 3,
    pitchVariation: 0.05,
    spatial: true,
  },
  silk_shimmer: {
    url: '/sounds/resource/silk_shimmer.mp3',
    category: 'resource',
    volume: 0.5,
    loop: false,
    priority: 4,
    maxInstances: 5,
    pitchVariation: 0.1,
    spatial: true,
  },
  silk_sparkle: {
    url: '/sounds/resource/silk_sparkle.mp3',
    category: 'resource',
    volume: 0.6,
    loop: false,
    priority: 5,
    maxInstances: 5,
    pitchVariation: 0.15,
    spatial: true,
  },
  treasure_open: {
    url: '/sounds/resource/treasure_open.mp3',
    category: 'resource',
    volume: 0.7,
    loop: false,
    priority: 6,
    maxInstances: 2,
    pitchVariation: 0.05,
    spatial: true,
  },

  // Boss Sounds
  boss_roar: {
    url: '/sounds/boss/roar.mp3',
    category: 'boss',
    volume: 0.9,
    loop: false,
    priority: 9,
    maxInstances: 2,
    pitchVariation: 0.1,
    spatial: true,
  },
  boss_spawn: {
    url: '/sounds/boss/spawn.mp3',
    category: 'boss',
    volume: 0.9,
    loop: false,
    priority: 10,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: true,
  },
  boss_attack: {
    url: '/sounds/boss/attack.mp3',
    category: 'boss',
    volume: 0.8,
    loop: false,
    priority: 8,
    maxInstances: 3,
    pitchVariation: 0.1,
    spatial: true,
  },
  boss_damaged: {
    url: '/sounds/boss/damaged.mp3',
    category: 'boss',
    volume: 0.8,
    loop: false,
    priority: 7,
    maxInstances: 3,
    pitchVariation: 0.15,
    spatial: true,
  },
  boss_defeated: {
    url: '/sounds/boss/defeated.mp3',
    category: 'boss',
    volume: 0.9,
    loop: false,
    priority: 10,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: true,
  },
  boss_special_ability: {
    url: '/sounds/boss/special_ability.mp3',
    category: 'boss',
    volume: 0.8,
    loop: false,
    priority: 8,
    maxInstances: 2,
    pitchVariation: 0.05,
    spatial: true,
  },

  // Game State Sounds
  victory_fanfare: {
    url: '/sounds/game/victory_fanfare.mp3',
    category: 'ui',
    volume: 0.8,
    loop: false,
    priority: 10,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  defeat_sound: {
    url: '/sounds/game/defeat.mp3',
    category: 'ui',
    volume: 0.7,
    loop: false,
    priority: 10,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  round_start: {
    url: '/sounds/game/round_start.mp3',
    category: 'ui',
    volume: 0.6,
    loop: false,
    priority: 7,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  round_end: {
    url: '/sounds/game/round_end.mp3',
    category: 'ui',
    volume: 0.6,
    loop: false,
    priority: 7,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  countdown: {
    url: '/sounds/game/countdown.mp3',
    category: 'ui',
    volume: 0.7,
    loop: false,
    priority: 8,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  level_up: {
    url: '/sounds/game/level_up.mp3',
    category: 'ui',
    volume: 0.7,
    loop: false,
    priority: 7,
    maxInstances: 2,
    pitchVariation: 0,
    spatial: false,
  },
  achievement_unlock: {
    url: '/sounds/game/achievement.mp3',
    category: 'ui',
    volume: 0.8,
    loop: false,
    priority: 8,
    maxInstances: 2,
    pitchVariation: 0,
    spatial: false,
  },

  // Ambient Sounds
  ambient_wind: {
    url: '/sounds/ambient/wind.mp3',
    category: 'ambient',
    volume: 0.3,
    loop: true,
    priority: 1,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  ambient_market: {
    url: '/sounds/ambient/market.mp3',
    category: 'ambient',
    volume: 0.4,
    loop: true,
    priority: 2,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  ambient_battle: {
    url: '/sounds/ambient/battle.mp3',
    category: 'ambient',
    volume: 0.4,
    loop: true,
    priority: 2,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
  ambient_night: {
    url: '/sounds/ambient/night.mp3',
    category: 'ambient',
    volume: 0.3,
    loop: true,
    priority: 1,
    maxInstances: 1,
    pitchVariation: 0,
    spatial: false,
  },
};

// ============================================================================
// SOUND SYSTEM CLASS
// ============================================================================

export class SoundSystem {
  private static instance: SoundSystem;
  private activeSounds: Map<string, SoundInstance[]> = new Map();
  private masterVolume: number = 1.0;
  private categoryVolumes: Map<SoundCategory, number> = new Map();
  private isMuted: boolean = false;
  private spatialConfig: SpatialConfig = {
    listenerPosition: { row: 0, col: 0 },
    maxDistance: 15,
    rolloffFactor: 2,
  };
  private soundPool: Map<string, HTMLAudioElement[]> = new Map();
  private preloadedSounds: Set<SoundEffect> = new Set();

  private constructor() {
    // Initialize category volumes
    const categories: SoundCategory[] = ['ui', 'unit', 'combat', 'ability', 'resource', 'boss', 'ambient', 'music'];
    categories.forEach(category => {
      this.categoryVolumes.set(category, 1.0);
    });
  }

  public static getInstance(): SoundSystem {
    if (!SoundSystem.instance) {
      SoundSystem.instance = new SoundSystem();
    }
    return SoundSystem.instance;
  }

  // ============================================================================
  // PRELOADING
  // ============================================================================

  public async preloadSound(sound: SoundEffect): Promise<void> {
    if (this.preloadedSounds.has(sound)) {
      return;
    }

    const config = SOUND_LIBRARY[sound];
    const audio = new Audio(config.url);

    return new Promise((resolve, reject) => {
      audio.addEventListener('canplaythrough', () => {
        this.preloadedSounds.add(sound);
        if (!this.soundPool.has(sound)) {
          this.soundPool.set(sound, []);
        }
        this.soundPool.get(sound)!.push(audio);
        resolve();
      });
      audio.addEventListener('error', reject);
      audio.load();
    });
  }

  public async preloadSounds(sounds: SoundEffect[]): Promise<void> {
    await Promise.all(sounds.map(sound => this.preloadSound(sound)));
  }

  public async preloadAllSounds(): Promise<void> {
    const allSounds = Object.keys(SOUND_LIBRARY) as SoundEffect[];
    await this.preloadSounds(allSounds);
  }

  // ============================================================================
  // PLAYBACK
  // ============================================================================

  public play(
    sound: SoundEffect,
    options: {
      position?: Position;
      volume?: number;
      delay?: number;
      onComplete?: () => void;
    } = {}
  ): string | null {
    if (this.isMuted) {
      return null;
    }

    const config = { ...SOUND_LIBRARY[sound], id: sound };
    const instances = this.activeSounds.get(sound) || [];

    // Check max instances
    if (instances.length >= config.maxInstances) {
      // Remove oldest instance if at max
      const oldest = instances[0];
      this.stop(oldest.id);
    }

    // Create or get audio element from pool
    const audio = this.getAudioFromPool(sound);
    if (!audio) {
      console.warn(`Failed to create audio for ${sound}`);
      return null;
    }

    // Apply pitch variation
    if (config.pitchVariation > 0) {
      const pitchVariance = 1 + (Math.random() - 0.5) * config.pitchVariation;
      audio.playbackRate = pitchVariance;
    }

    // Calculate final volume
    const categoryVolume = this.categoryVolumes.get(config.category) || 1.0;
    const baseVolume = options.volume ?? config.volume;
    let finalVolume = this.masterVolume * categoryVolume * baseVolume;

    // Apply spatial audio if enabled
    if (config.spatial && options.position) {
      finalVolume *= this.calculateSpatialVolume(options.position);
    }

    audio.volume = Math.max(0, Math.min(1, finalVolume));
    audio.loop = config.loop;

    // Create instance
    const instanceId = `${sound}_${Date.now()}_${Math.random()}`;
    const instance: SoundInstance = {
      id: instanceId,
      audio,
      config,
      position: options.position,
      startTime: Date.now(),
      isPlaying: true,
      isPaused: false,
      volume: finalVolume,
    };

    // Store instance
    if (!this.activeSounds.has(sound)) {
      this.activeSounds.set(sound, []);
    }
    this.activeSounds.get(sound)!.push(instance);

    // Setup cleanup
    audio.addEventListener('ended', () => {
      this.removeInstance(sound, instanceId);
      options.onComplete?.();
    });

    // Play with optional delay
    if (options.delay) {
      setTimeout(() => {
        audio.play().catch(err => console.warn(`Failed to play ${sound}:`, err));
      }, options.delay);
    } else {
      audio.play().catch(err => console.warn(`Failed to play ${sound}:`, err));
    }

    return instanceId;
  }

  public stop(instanceId: string): void {
    for (const [sound, instances] of this.activeSounds.entries()) {
      const instance = instances.find(i => i.id === instanceId);
      if (instance) {
        instance.audio.pause();
        instance.audio.currentTime = 0;
        instance.isPlaying = false;
        this.removeInstance(sound, instanceId);
        break;
      }
    }
  }

  public stopAll(): void {
    for (const instances of this.activeSounds.values()) {
      instances.forEach(instance => {
        instance.audio.pause();
        instance.audio.currentTime = 0;
        instance.isPlaying = false;
      });
    }
    this.activeSounds.clear();
  }

  public stopCategory(category: SoundCategory): void {
    for (const [sound, instances] of this.activeSounds.entries()) {
      const config = SOUND_LIBRARY[sound as SoundEffect];
      if (config.category === category) {
        instances.forEach(instance => {
          instance.audio.pause();
          instance.audio.currentTime = 0;
          instance.isPlaying = false;
        });
        this.activeSounds.delete(sound);
      }
    }
  }

  public pause(instanceId: string): void {
    for (const instances of this.activeSounds.values()) {
      const instance = instances.find(i => i.id === instanceId);
      if (instance && !instance.isPaused) {
        instance.audio.pause();
        instance.isPaused = true;
        instance.isPlaying = false;
        break;
      }
    }
  }

  public resume(instanceId: string): void {
    for (const instances of this.activeSounds.values()) {
      const instance = instances.find(i => i.id === instanceId);
      if (instance && instance.isPaused) {
        instance.audio.play().catch(err => console.warn('Failed to resume:', err));
        instance.isPaused = false;
        instance.isPlaying = true;
        break;
      }
    }
  }

  // ============================================================================
  // VOLUME CONTROLS
  // ============================================================================

  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateAllVolumes();
  }

  public getMasterVolume(): number {
    return this.masterVolume;
  }

  public setCategoryVolume(category: SoundCategory, volume: number): void {
    this.categoryVolumes.set(category, Math.max(0, Math.min(1, volume)));
    this.updateCategoryVolumes(category);
  }

  public getCategoryVolume(category: SoundCategory): number {
    return this.categoryVolumes.get(category) || 1.0;
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (muted) {
      this.activeSounds.forEach(instances => {
        instances.forEach(instance => {
          instance.audio.volume = 0;
        });
      });
    } else {
      this.updateAllVolumes();
    }
  }

  public isMutedStatus(): boolean {
    return this.isMuted;
  }

  public toggleMute(): void {
    this.setMuted(!this.isMuted);
  }

  // ============================================================================
  // SPATIAL AUDIO
  // ============================================================================

  public setListenerPosition(position: Position): void {
    this.spatialConfig.listenerPosition = position;
    this.updateSpatialAudio();
  }

  public setSpatialConfig(config: Partial<SpatialConfig>): void {
    this.spatialConfig = { ...this.spatialConfig, ...config };
    this.updateSpatialAudio();
  }

  private calculateSpatialVolume(soundPosition: Position): number {
    const dx = soundPosition.col - this.spatialConfig.listenerPosition.col;
    const dy = soundPosition.row - this.spatialConfig.listenerPosition.row;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return 1.0;
    if (distance >= this.spatialConfig.maxDistance) return 0.0;

    // Inverse square law with rolloff factor
    const falloff = 1 / (1 + this.spatialConfig.rolloffFactor * (distance / this.spatialConfig.maxDistance));
    return Math.max(0, Math.min(1, falloff));
  }

  private updateSpatialAudio(): void {
    for (const instances of this.activeSounds.values()) {
      instances.forEach(instance => {
        if (instance.config.spatial && instance.position) {
          const spatialVolume = this.calculateSpatialVolume(instance.position);
          const categoryVolume = this.categoryVolumes.get(instance.config.category) || 1.0;
          const finalVolume = this.masterVolume * categoryVolume * instance.config.volume * spatialVolume;
          instance.audio.volume = this.isMuted ? 0 : Math.max(0, Math.min(1, finalVolume));
          instance.volume = finalVolume;
        }
      });
    }
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  private getAudioFromPool(sound: SoundEffect): HTMLAudioElement | null {
    const pool = this.soundPool.get(sound);

    // Try to find an available audio element
    if (pool && pool.length > 0) {
      const available = pool.find(audio => audio.paused || audio.ended);
      if (available) {
        available.currentTime = 0;
        return available;
      }
    }

    // Create new audio element
    const config = SOUND_LIBRARY[sound];
    const audio = new Audio(config.url);

    if (!this.soundPool.has(sound)) {
      this.soundPool.set(sound, []);
    }
    this.soundPool.get(sound)!.push(audio);

    return audio;
  }

  private removeInstance(sound: string, instanceId: string): void {
    const instances = this.activeSounds.get(sound);
    if (instances) {
      const index = instances.findIndex(i => i.id === instanceId);
      if (index !== -1) {
        instances.splice(index, 1);
      }
      if (instances.length === 0) {
        this.activeSounds.delete(sound);
      }
    }
  }

  private updateAllVolumes(): void {
    for (const instances of this.activeSounds.values()) {
      instances.forEach(instance => {
        const categoryVolume = this.categoryVolumes.get(instance.config.category) || 1.0;
        let finalVolume = this.masterVolume * categoryVolume * instance.config.volume;

        if (instance.config.spatial && instance.position) {
          finalVolume *= this.calculateSpatialVolume(instance.position);
        }

        instance.audio.volume = this.isMuted ? 0 : Math.max(0, Math.min(1, finalVolume));
        instance.volume = finalVolume;
      });
    }
  }

  private updateCategoryVolumes(category: SoundCategory): void {
    const categoryVolume = this.categoryVolumes.get(category) || 1.0;

    for (const instances of this.activeSounds.values()) {
      instances.forEach(instance => {
        if (instance.config.category === category) {
          let finalVolume = this.masterVolume * categoryVolume * instance.config.volume;

          if (instance.config.spatial && instance.position) {
            finalVolume *= this.calculateSpatialVolume(instance.position);
          }

          instance.audio.volume = this.isMuted ? 0 : Math.max(0, Math.min(1, finalVolume));
          instance.volume = finalVolume;
        }
      });
    }
  }

  // ============================================================================
  // DIAGNOSTICS
  // ============================================================================

  public getActiveSoundCount(): number {
    let count = 0;
    for (const instances of this.activeSounds.values()) {
      count += instances.length;
    }
    return count;
  }

  public getActiveSounds(): { sound: string; count: number }[] {
    const result: { sound: string; count: number }[] = [];
    for (const [sound, instances] of this.activeSounds.entries()) {
      if (instances.length > 0) {
        result.push({ sound, count: instances.length });
      }
    }
    return result;
  }

  public getPreloadedSounds(): SoundEffect[] {
    return Array.from(this.preloadedSounds);
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const soundSystem = SoundSystem.getInstance();
