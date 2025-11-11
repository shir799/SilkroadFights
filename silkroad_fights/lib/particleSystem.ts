/**
 * ParticleSystem.ts - Advanced Particle Effects Engine
 * Creates beautiful visual feedback for all game actions
 */

import { Position } from './newTypes';

// ============================================================================
// PARTICLE TYPES AND CONFIGURATION
// ============================================================================

export type ParticleType =
  | 'dust'
  | 'blood'
  | 'gold_coin'
  | 'silk_sparkle'
  | 'fire'
  | 'lightning'
  | 'explosion'
  | 'healing'
  | 'buff'
  | 'debuff'
  | 'footprint'
  | 'impact'
  | 'slash'
  | 'arrow_trail'
  | 'smoke'
  | 'magic_circle'
  | 'energy_burst'
  | 'poison'
  | 'ice'
  | 'shield_break'
  | 'level_up'
  | 'critical_hit';

export interface ParticleConfig {
  type: ParticleType;
  count: number;
  lifetime: number; // milliseconds
  size: { min: number; max: number };
  speed: { min: number; max: number };
  spread: number; // angle in degrees
  gravity: number;
  fade: boolean;
  color: string | string[];
  shape: 'circle' | 'square' | 'star' | 'spark' | 'image';
  imageUrl?: string;
  rotation: { min: number; max: number };
  rotationSpeed: { min: number; max: number };
  blendMode?: 'normal' | 'additive' | 'multiply' | 'screen';
  glow?: boolean;
  bounce?: boolean;
  trail?: boolean;
}

export interface Particle {
  id: string;
  type: ParticleType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  rotationSpeed: number;
  color: string;
  alpha: number;
  lifetime: number;
  maxLifetime: number;
  config: ParticleConfig;
  trailPoints?: { x: number; y: number; alpha: number }[];
}

// ============================================================================
// PARTICLE PRESETS
// ============================================================================

const PARTICLE_PRESETS: Record<ParticleType, Partial<ParticleConfig>> = {
  dust: {
    count: 15,
    lifetime: 800,
    size: { min: 2, max: 6 },
    speed: { min: 20, max: 50 },
    spread: 360,
    gravity: 0.1,
    fade: true,
    color: ['#D2B48C', '#C19A6B', '#A67C52'],
    shape: 'circle',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: -2, max: 2 },
    blendMode: 'normal',
  },

  blood: {
    count: 25,
    lifetime: 600,
    size: { min: 3, max: 8 },
    speed: { min: 50, max: 120 },
    spread: 180,
    gravity: 0.5,
    fade: true,
    color: ['#8B0000', '#A52A2A', '#DC143C'],
    shape: 'circle',
    rotation: { min: 0, max: 0 },
    rotationSpeed: { min: 0, max: 0 },
    blendMode: 'normal',
  },

  gold_coin: {
    count: 8,
    lifetime: 1200,
    size: { min: 8, max: 12 },
    speed: { min: 80, max: 150 },
    spread: 120,
    gravity: 0.8,
    fade: false,
    color: ['#FFD700', '#FFA500', '#FF8C00'],
    shape: 'circle',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 5, max: 15 },
    blendMode: 'additive',
    glow: true,
    bounce: true,
  },

  silk_sparkle: {
    count: 30,
    lifetime: 1500,
    size: { min: 2, max: 5 },
    speed: { min: 30, max: 80 },
    spread: 360,
    gravity: -0.2,
    fade: true,
    color: ['#E6E6FA', '#DDA0DD', '#DA70D6', '#BA55D3'],
    shape: 'star',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 10, max: 30 },
    blendMode: 'additive',
    glow: true,
  },

  fire: {
    count: 40,
    lifetime: 800,
    size: { min: 4, max: 12 },
    speed: { min: 20, max: 60 },
    spread: 90,
    gravity: -0.3,
    fade: true,
    color: ['#FF4500', '#FF6347', '#FFA500', '#FFD700'],
    shape: 'circle',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: -5, max: 5 },
    blendMode: 'additive',
    glow: true,
  },

  lightning: {
    count: 20,
    lifetime: 300,
    size: { min: 3, max: 8 },
    speed: { min: 100, max: 200 },
    spread: 30,
    gravity: 0,
    fade: true,
    color: ['#00FFFF', '#ADD8E6', '#87CEEB', '#FFFFFF'],
    shape: 'spark',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 0, max: 0 },
    blendMode: 'additive',
    glow: true,
  },

  explosion: {
    count: 50,
    lifetime: 1000,
    size: { min: 5, max: 15 },
    speed: { min: 100, max: 250 },
    spread: 360,
    gravity: 0.2,
    fade: true,
    color: ['#FF4500', '#FF6347', '#FFA500', '#FFD700', '#FFFF00'],
    shape: 'circle',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: -10, max: 10 },
    blendMode: 'additive',
    glow: true,
  },

  healing: {
    count: 25,
    lifetime: 1200,
    size: { min: 3, max: 8 },
    speed: { min: 20, max: 50 },
    spread: 360,
    gravity: -0.4,
    fade: true,
    color: ['#00FF00', '#32CD32', '#00FA9A', '#7FFF00'],
    shape: 'star',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 5, max: 15 },
    blendMode: 'additive',
    glow: true,
  },

  buff: {
    count: 20,
    lifetime: 1000,
    size: { min: 4, max: 10 },
    speed: { min: 30, max: 70 },
    spread: 360,
    gravity: -0.3,
    fade: true,
    color: ['#FFD700', '#FFA500', '#FFFF00'],
    shape: 'star',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 10, max: 20 },
    blendMode: 'additive',
    glow: true,
  },

  debuff: {
    count: 20,
    lifetime: 1000,
    size: { min: 4, max: 10 },
    speed: { min: 30, max: 70 },
    spread: 360,
    gravity: 0.3,
    fade: true,
    color: ['#8B008B', '#9370DB', '#BA55D3', '#4B0082'],
    shape: 'circle',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: -10, max: -5 },
    blendMode: 'additive',
    glow: true,
  },

  footprint: {
    count: 1,
    lifetime: 2000,
    size: { min: 8, max: 10 },
    speed: { min: 0, max: 0 },
    spread: 0,
    gravity: 0,
    fade: true,
    color: ['#8B7355'],
    shape: 'circle',
    rotation: { min: 0, max: 0 },
    rotationSpeed: { min: 0, max: 0 },
    blendMode: 'multiply',
  },

  impact: {
    count: 30,
    lifetime: 500,
    size: { min: 3, max: 8 },
    speed: { min: 80, max: 150 },
    spread: 180,
    gravity: 0.3,
    fade: true,
    color: ['#FFFFFF', '#F0F0F0', '#E0E0E0'],
    shape: 'circle',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: -5, max: 5 },
    blendMode: 'additive',
    glow: true,
  },

  slash: {
    count: 15,
    lifetime: 400,
    size: { min: 5, max: 12 },
    speed: { min: 100, max: 180 },
    spread: 45,
    gravity: 0,
    fade: true,
    color: ['#C0C0C0', '#FFFFFF', '#E8E8E8'],
    shape: 'spark',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 0, max: 0 },
    blendMode: 'additive',
    glow: true,
  },

  arrow_trail: {
    count: 5,
    lifetime: 600,
    size: { min: 2, max: 4 },
    speed: { min: 10, max: 20 },
    spread: 15,
    gravity: 0,
    fade: true,
    color: ['#8B4513', '#A0522D'],
    shape: 'circle',
    rotation: { min: 0, max: 0 },
    rotationSpeed: { min: 0, max: 0 },
    blendMode: 'normal',
    trail: true,
  },

  smoke: {
    count: 20,
    lifetime: 1500,
    size: { min: 10, max: 25 },
    speed: { min: 20, max: 50 },
    spread: 60,
    gravity: -0.2,
    fade: true,
    color: ['#696969', '#808080', '#A9A9A9'],
    shape: 'circle',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: -2, max: 2 },
    blendMode: 'normal',
  },

  magic_circle: {
    count: 12,
    lifetime: 1000,
    size: { min: 3, max: 6 },
    speed: { min: 50, max: 100 },
    spread: 360,
    gravity: 0,
    fade: true,
    color: ['#9370DB', '#BA55D3', '#DDA0DD'],
    shape: 'star',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 20, max: 40 },
    blendMode: 'additive',
    glow: true,
  },

  energy_burst: {
    count: 35,
    lifetime: 800,
    size: { min: 4, max: 10 },
    speed: { min: 80, max: 180 },
    spread: 360,
    gravity: 0,
    fade: true,
    color: ['#00BFFF', '#1E90FF', '#4169E1', '#0000FF'],
    shape: 'spark',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 0, max: 0 },
    blendMode: 'additive',
    glow: true,
  },

  poison: {
    count: 25,
    lifetime: 1200,
    size: { min: 4, max: 9 },
    speed: { min: 20, max: 60 },
    spread: 360,
    gravity: -0.1,
    fade: true,
    color: ['#00FF00', '#32CD32', '#228B22', '#006400'],
    shape: 'circle',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: -3, max: 3 },
    blendMode: 'additive',
    glow: true,
  },

  ice: {
    count: 30,
    lifetime: 1000,
    size: { min: 3, max: 8 },
    speed: { min: 40, max: 100 },
    spread: 360,
    gravity: 0.3,
    fade: true,
    color: ['#E0FFFF', '#AFEEEE', '#87CEEB', '#B0E0E6'],
    shape: 'star',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 5, max: 15 },
    blendMode: 'additive',
    glow: true,
  },

  shield_break: {
    count: 40,
    lifetime: 800,
    size: { min: 4, max: 12 },
    speed: { min: 100, max: 200 },
    spread: 360,
    gravity: 0.5,
    fade: true,
    color: ['#4169E1', '#6495ED', '#87CEEB', '#FFFFFF'],
    shape: 'square',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: -15, max: 15 },
    blendMode: 'additive',
    glow: true,
  },

  level_up: {
    count: 60,
    lifetime: 2000,
    size: { min: 3, max: 8 },
    speed: { min: 50, max: 120 },
    spread: 360,
    gravity: -0.5,
    fade: true,
    color: ['#FFD700', '#FFA500', '#FF8C00', '#FFFF00'],
    shape: 'star',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 10, max: 30 },
    blendMode: 'additive',
    glow: true,
  },

  critical_hit: {
    count: 45,
    lifetime: 700,
    size: { min: 5, max: 12 },
    speed: { min: 120, max: 220 },
    spread: 360,
    gravity: 0.1,
    fade: true,
    color: ['#FF0000', '#FF4500', '#FF6347', '#FFD700'],
    shape: 'star',
    rotation: { min: 0, max: 360 },
    rotationSpeed: { min: 15, max: 30 },
    blendMode: 'additive',
    glow: true,
  },
};

// ============================================================================
// PARTICLE SYSTEM CLASS
// ============================================================================

export class ParticleSystem {
  private static instance: ParticleSystem;
  private particles: Particle[] = [];
  private nextId: number = 0;
  private isRunning: boolean = false;
  private lastUpdateTime: number = 0;
  private maxParticles: number = 2000;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animationFrameId: number | null = null;

  private constructor() {}

  public static getInstance(): ParticleSystem {
    if (!ParticleSystem.instance) {
      ParticleSystem.instance = new ParticleSystem();
    }
    return ParticleSystem.instance;
  }

  // ============================================================================
  // INITIALIZATION
  // ============================================================================

  public initialize(canvas: HTMLCanvasElement): void {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Failed to get 2D context');
      return;
    }
    this.start();
  }

  public setMaxParticles(max: number): void {
    this.maxParticles = max;
  }

  // ============================================================================
  // PARTICLE EMISSION
  // ============================================================================

  public emit(
    type: ParticleType,
    position: { x: number; y: number },
    options: Partial<ParticleConfig> = {}
  ): void {
    const preset = PARTICLE_PRESETS[type];
    const config: ParticleConfig = {
      type,
      ...preset,
      ...options,
    } as ParticleConfig;

    const count = config.count;
    const baseAngle = options.spread !== undefined ? 0 : -90; // Default upward

    for (let i = 0; i < count; i++) {
      // Check max particles limit
      if (this.particles.length >= this.maxParticles) {
        // Remove oldest particle
        this.particles.shift();
      }

      // Calculate angle
      const spread = config.spread;
      const angle = baseAngle + (Math.random() - 0.5) * spread;
      const angleRad = (angle * Math.PI) / 180;

      // Calculate velocity
      const speed = config.speed.min + Math.random() * (config.speed.max - config.speed.min);
      const vx = Math.cos(angleRad) * speed;
      const vy = Math.sin(angleRad) * speed;

      // Choose color
      const colors = Array.isArray(config.color) ? config.color : [config.color];
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Create particle
      const particle: Particle = {
        id: `particle_${this.nextId++}`,
        type,
        x: position.x + (Math.random() - 0.5) * 5, // Small spawn variance
        y: position.y + (Math.random() - 0.5) * 5,
        vx,
        vy,
        size: config.size.min + Math.random() * (config.size.max - config.size.min),
        rotation: config.rotation.min + Math.random() * (config.rotation.max - config.rotation.min),
        rotationSpeed:
          config.rotationSpeed.min +
          Math.random() * (config.rotationSpeed.max - config.rotationSpeed.min),
        color,
        alpha: 1,
        lifetime: config.lifetime,
        maxLifetime: config.lifetime,
        config,
        trailPoints: config.trail ? [] : undefined,
      };

      this.particles.push(particle);
    }
  }

  public emitAt(type: ParticleType, gridPosition: Position, cellSize: number = 40): void {
    const x = gridPosition.col * cellSize + cellSize / 2;
    const y = gridPosition.row * cellSize + cellSize / 2;
    this.emit(type, { x, y });
  }

  // ============================================================================
  // PARTICLE UPDATE
  // ============================================================================

  private update(deltaTime: number): void {
    const dt = deltaTime / 1000; // Convert to seconds

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];

      // Update lifetime
      particle.lifetime -= deltaTime;
      if (particle.lifetime <= 0) {
        this.particles.splice(i, 1);
        continue;
      }

      // Update position
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;

      // Apply gravity
      particle.vy += particle.config.gravity * 100 * dt;

      // Update rotation
      particle.rotation += particle.rotationSpeed;

      // Update alpha (fade)
      if (particle.config.fade) {
        particle.alpha = particle.lifetime / particle.maxLifetime;
      }

      // Bounce
      if (particle.config.bounce && this.canvas) {
        if (particle.y + particle.size / 2 > this.canvas.height) {
          particle.y = this.canvas.height - particle.size / 2;
          particle.vy *= -0.6; // Energy loss on bounce
          particle.vx *= 0.8; // Friction
        }
      }

      // Trail
      if (particle.trailPoints) {
        particle.trailPoints.push({
          x: particle.x,
          y: particle.y,
          alpha: particle.alpha,
        });

        // Limit trail length
        if (particle.trailPoints.length > 10) {
          particle.trailPoints.shift();
        }
      }
    }
  }

  // ============================================================================
  // PARTICLE RENDERING
  // ============================================================================

  private render(): void {
    if (!this.ctx || !this.canvas) return;

    for (const particle of this.particles) {
      this.ctx.save();

      // Set alpha
      this.ctx.globalAlpha = particle.alpha;

      // Set blend mode
      if (particle.config.blendMode) {
        this.ctx.globalCompositeOperation = particle.config.blendMode;
      }

      // Translate and rotate
      this.ctx.translate(particle.x, particle.y);
      this.ctx.rotate((particle.rotation * Math.PI) / 180);

      // Apply glow
      if (particle.config.glow) {
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = particle.color;
      }

      // Draw trail
      if (particle.trailPoints && particle.trailPoints.length > 1) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = particle.size / 2;
        this.ctx.lineCap = 'round';

        for (let i = 0; i < particle.trailPoints.length - 1; i++) {
          const point = particle.trailPoints[i];
          const nextPoint = particle.trailPoints[i + 1];
          const relativeX = point.x - particle.x;
          const relativeY = point.y - particle.y;
          const nextRelativeX = nextPoint.x - particle.x;
          const nextRelativeY = nextPoint.y - particle.y;

          if (i === 0) {
            this.ctx.moveTo(relativeX, relativeY);
          }
          this.ctx.lineTo(nextRelativeX, nextRelativeY);
        }
        this.ctx.stroke();
      }

      // Draw particle shape
      this.ctx.fillStyle = particle.color;

      switch (particle.config.shape) {
        case 'circle':
          this.ctx.beginPath();
          this.ctx.arc(0, 0, particle.size / 2, 0, Math.PI * 2);
          this.ctx.fill();
          break;

        case 'square':
          this.ctx.fillRect(
            -particle.size / 2,
            -particle.size / 2,
            particle.size,
            particle.size
          );
          break;

        case 'star':
          this.drawStar(this.ctx, 0, 0, 5, particle.size / 2, particle.size / 4);
          break;

        case 'spark':
          this.drawSpark(this.ctx, particle.size);
          break;
      }

      this.ctx.restore();
    }
  }

  private drawStar(
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    spikes: number,
    outerRadius: number,
    innerRadius: number
  ): void {
    let rot = (Math.PI / 2) * 3;
    const step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);

    for (let i = 0; i < spikes; i++) {
      ctx.lineTo(cx + Math.cos(rot) * outerRadius, cy + Math.sin(rot) * outerRadius);
      rot += step;
      ctx.lineTo(cx + Math.cos(rot) * innerRadius, cy + Math.sin(rot) * innerRadius);
      rot += step;
    }

    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  }

  private drawSpark(ctx: CanvasRenderingContext2D, size: number): void {
    ctx.beginPath();
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(size / 2, 0);
    ctx.moveTo(0, -size / 2);
    ctx.lineTo(0, size / 2);
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  // ============================================================================
  // ANIMATION LOOP
  // ============================================================================

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastUpdateTime = performance.now();
    this.loop();
  }

  public stop(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private loop = (): void => {
    if (!this.isRunning) return;

    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastUpdateTime;
    this.lastUpdateTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  public clear(): void {
    this.particles = [];
  }

  public getParticleCount(): number {
    return this.particles.length;
  }

  public setPosition(x: number, y: number): void {
    // Offset all particles (for camera movement)
    this.particles.forEach(particle => {
      particle.x += x;
      particle.y += y;
    });
  }
}

// ============================================================================
// EXPORT SINGLETON INSTANCE
// ============================================================================

export const particleSystem = ParticleSystem.getInstance();
