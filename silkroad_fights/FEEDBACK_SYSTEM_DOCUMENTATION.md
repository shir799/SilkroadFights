# Feedback System Documentation

A comprehensive feedback system for Silkroad Fights with JUICE and satisfying interactions!

## Table of Contents

1. [Sound System](#sound-system)
2. [Particle System](#particle-system)
3. [Haptic Feedback](#haptic-feedback)
4. [Screen Effects](#screen-effects)
5. [Notification System](#notification-system)
6. [Tactile Feedback](#tactile-feedback)
7. [Integration Guide](#integration-guide)
8. [Performance Metrics](#performance-metrics)
9. [Action → Feedback Mapping](#action-feedback-mapping)

---

## Sound System

**Location:** `/lib/soundSystem.ts`

### Features

- 70+ pre-configured sound effects
- Spatial 3D audio
- Priority-based sound management
- Volume controls per category
- Sound pooling for performance
- Pitch variation for variety

### Usage

```typescript
import { soundSystem } from '@/lib/soundSystem';

// Preload sounds (do this on game start)
await soundSystem.preloadSounds([
  'unit_select',
  'attack_sword_clash',
  'gold_pickup'
]);

// Play a sound
soundSystem.play('unit_select', {
  position: { row: 5, col: 3 }, // Optional 3D position
  volume: 0.8, // Optional volume override
});

// Play with callback
soundSystem.play('ability_activate', {
  onComplete: () => {
    console.log('Sound finished!');
  }
});

// Control volume
soundSystem.setMasterVolume(0.7);
soundSystem.setCategoryVolume('combat', 0.5);

// Mute/unmute
soundSystem.setMuted(true);
soundSystem.toggleMute();

// Spatial audio (camera position)
soundSystem.setListenerPosition({ row: 10, col: 10 });

// Stop sounds
soundSystem.stopAll();
soundSystem.stopCategory('ambient');
```

### Sound Categories

- **UI:** Buttons, menus, notifications
- **Unit:** Selection, movement, death
- **Combat:** Attacks, hits, damage
- **Ability:** Special abilities, buffs, debuffs
- **Resource:** Gold, silk collection
- **Boss:** Boss-specific sounds
- **Ambient:** Background atmosphere
- **Music:** Background music tracks

### Complete Sound List

#### UI Sounds
- `ui_select`, `ui_click`, `ui_hover`, `ui_confirm`, `ui_cancel`, `ui_error`, `ui_notification`

#### Unit Sounds
- `unit_select`, `unit_deselect`, `unit_move_start`, `unit_footsteps_sand`, `unit_footsteps_stone`, `unit_death`, `unit_spawn`

#### Combat Sounds
- `attack_sword_swing`, `attack_sword_clash`, `attack_bow_shoot`, `attack_bow_hit`, `attack_spear_thrust`, `attack_punch`
- `hit_normal`, `hit_critical`, `hit_blocked`, `miss`, `damage_light`, `damage_heavy`

#### Ability Sounds
- `ability_activate`, `ability_whoosh`, `ability_fire`, `ability_lightning`, `ability_heal`, `ability_buff`, `ability_debuff`, `ability_teleport`, `ability_shield`, `ability_poison`

#### Resource Sounds
- `gold_pickup`, `gold_drop`, `gold_coins`, `silk_collect`, `silk_shimmer`, `silk_sparkle`, `treasure_open`

#### Boss Sounds
- `boss_roar`, `boss_spawn`, `boss_attack`, `boss_damaged`, `boss_defeated`, `boss_special_ability`

#### Game State Sounds
- `victory_fanfare`, `defeat_sound`, `round_start`, `round_end`, `countdown`, `level_up`, `achievement_unlock`

#### Ambient Sounds
- `ambient_wind`, `ambient_market`, `ambient_battle`, `ambient_night`

---

## Particle System

**Location:** `/lib/particleSystem.ts`

### Features

- 20+ particle effect types
- Canvas-based rendering
- Custom particle configurations
- Physics simulation (gravity, bounce)
- Trail effects
- Blend modes and glow

### Usage

```typescript
import { particleSystem } from '@/lib/particleSystem';

// Initialize (once, in your game component)
const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
particleSystem.initialize(canvas);

// Emit particles at screen coordinates
particleSystem.emit('explosion', { x: 400, y: 300 });

// Emit particles at grid position
particleSystem.emitAt('gold_coin', { row: 5, col: 3 }, 40); // cellSize = 40

// Custom particle configuration
particleSystem.emit('fire', { x: 200, y: 200 }, {
  count: 50,
  lifetime: 1000,
  speed: { min: 50, max: 100 },
});

// Control
particleSystem.setMaxParticles(2000);
particleSystem.clear(); // Clear all particles
particleSystem.stop(); // Stop animation
particleSystem.start(); // Start animation
```

### Particle Types

- **dust** - Movement dust clouds
- **blood** - Hit effects
- **gold_coin** - Gold collection
- **silk_sparkle** - Silk shimmer
- **fire** - Fire effects
- **lightning** - Lightning bolts
- **explosion** - Big explosions
- **healing** - Healing aura
- **buff** - Buff indicators
- **debuff** - Debuff indicators
- **footprint** - Fading footprints
- **impact** - Impact effects
- **slash** - Sword slashes
- **arrow_trail** - Arrow trails
- **smoke** - Smoke effects
- **magic_circle** - Magic circles
- **energy_burst** - Energy bursts
- **poison** - Poison clouds
- **ice** - Ice effects
- **shield_break** - Shield breaking
- **level_up** - Level up celebration
- **critical_hit** - Critical hit burst

---

## Haptic Feedback

**Location:** `/lib/hapticFeedback.ts`

### Features

- Mobile vibration patterns
- Custom patterns support
- Intensity control
- Advanced patterns (pulsate, crescendo)
- Game-specific helpers

### Usage

```typescript
import { hapticFeedback } from '@/lib/hapticFeedback';

// Check support
if (hapticFeedback.isHapticSupported()) {
  // Trigger haptics
  hapticFeedback.trigger('selection');
  hapticFeedback.trigger('critical_hit');

  // Custom pattern
  hapticFeedback.triggerPattern([50, 30, 50]);
  hapticFeedback.triggerCustom([100, 50, 100], 0.8);

  // Advanced patterns
  hapticFeedback.pulsate(1000, 100);
  hapticFeedback.crescendo(20, 100, 5);
  hapticFeedback.rhythmic([1, 1, 0.5, 0.5, 2], 500);

  // Game helpers
  hapticFeedback.onUnitSelect();
  hapticFeedback.onAttack(true); // isCritical
  hapticFeedback.onDamage(50, 100); // damage, maxHealth
  hapticFeedback.onAbilityActivate();
  hapticFeedback.onBossSpawn();
  hapticFeedback.onVictory();

  // Control
  hapticFeedback.setEnabled(true);
  hapticFeedback.setIntensity(0.8);
  hapticFeedback.stopAll();
}
```

### Haptic Types

- **selection** - Light buzz (10ms)
- **light** - 20ms vibration
- **medium** - 40ms vibration
- **heavy** - 60ms vibration
- **success** - Success pattern
- **warning** - Warning pattern
- **error** - Error pattern
- **impact_light/medium/heavy** - Impact feedback
- **critical_hit** - Special critical pattern
- **damage_light/heavy** - Damage feedback
- **ability_activate** - Ability activation
- **level_up** - Level up celebration
- **boss_spawn** - Boss entrance
- **victory/defeat** - Game end feedback

---

## Screen Effects

**Location:** `/components/ScreenEffects.tsx`

### Features

- Screen shake with decay
- Flash effects
- Slow motion
- Vignette overlay
- Color grading presets
- Camera zoom
- Blur effects
- Chromatic aberration
- Scanlines
- Freeze frame

### Usage

```tsx
import { ScreenEffectsProvider, useScreenEffects } from '@/components/ScreenEffects';

// Wrap your app
function App() {
  return (
    <ScreenEffectsProvider>
      <YourGameComponent />
    </ScreenEffectsProvider>
  );
}

// Use in components
function GameComponent() {
  const effects = useScreenEffects();

  // Screen shake
  effects.triggerShake({
    intensity: 8,
    duration: 500,
    frequency: 30,
    decay: true,
  });

  // Flash effect
  effects.triggerFlash({
    color: '#FFFFFF',
    duration: 200,
    intensity: 0.8,
  });

  // Slow motion
  effects.triggerSlowMotion({
    scale: 0.3, // 30% speed
    duration: 2000,
    easeIn: true,
    easeOut: true,
  });

  // Vignette
  effects.triggerVignette({
    intensity: 0.7,
    duration: 3000,
  });

  // Color grading
  effects.triggerColorGrading({
    preset: 'victory', // 'victory', 'defeat', 'boss', 'critical', 'fire', 'ice'
    duration: 5000,
  });

  // Custom color grading
  effects.triggerColorGrading({
    saturation: 1.5,
    brightness: 1.2,
    contrast: 1.1,
    hue: 30,
    duration: 3000,
  });

  // Zoom
  effects.triggerZoom({
    scale: 1.5,
    duration: 1000,
    targetX: 50, // % from left
    targetY: 50, // % from top
    easeIn: true,
    easeOut: true,
  });

  // Blur
  effects.triggerBlur({
    intensity: 5, // pixels
    duration: 1000,
  });

  // Other effects
  effects.triggerChromaticAberration(3, 500);
  effects.toggleScanlines(true);
  effects.triggerFreezeFrame(100);

  // Reset all
  effects.resetAll();
}
```

---

## Notification System

**Location:** `/components/NotificationSystem.tsx`

### Features

- Beautiful toast notifications
- Multiple notification types
- Custom positioning
- Auto-dismiss with progress
- Animated badges
- Click handlers
- Stacking support

### Usage

```tsx
import { NotificationSystemProvider, useNotifications } from '@/components/NotificationSystem';

// Wrap your app
function App() {
  return (
    <NotificationSystemProvider>
      <YourGameComponent />
    </NotificationSystemProvider>
  );
}

// Use in components
function GameComponent() {
  const notifications = useNotifications();

  // Show achievement
  notifications.showAchievement(
    'Master Trader',
    'Delivered 100 gold!',
    '100'
  );

  // Level up
  notifications.showLevelUp(10);

  // Ability unlock
  notifications.showAbilityUnlock(
    'Shadow Strike',
    'Deal massive damage from stealth'
  );

  // Challenge complete
  notifications.showChallengeComplete(
    'Speed Demon',
    '500 Silk'
  );

  // Boss events
  notifications.showBossSpawn('Tiger Giry');
  notifications.showBossDefeat('Tiger Giry', '1000 Silk + Attack Buff');

  // Critical moment
  notifications.showCriticalMoment('Your caravan is under attack!');

  // Game end
  notifications.showVictory('You have won the Silk Road!');
  notifications.showDefeat('Your caravan was destroyed.');

  // Basic notifications
  notifications.showInfo('New round starting...', 3000);
  notifications.showWarning('Low health!', 4000);
  notifications.showSuccess('Gold delivered!', 3000);
  notifications.showError('Cannot move there!', 5000);

  // Custom notification
  notifications.showNotification({
    type: 'achievement',
    title: 'Custom Title',
    message: 'Custom message',
    icon: <CustomIcon />,
    duration: 5000,
    position: 'top-right',
    badge: 'NEW',
    onClick: () => console.log('Clicked!'),
    onDismiss: () => console.log('Dismissed!'),
  });

  // Dismiss
  notifications.dismissAll();
}
```

### Notification Types

- **achievement** - Achievement unlocked
- **level_up** - Level progression
- **ability_unlock** - New ability
- **challenge_complete** - Challenge done
- **boss_spawn** - Boss warning
- **boss_defeat** - Boss defeated
- **critical_moment** - Important moment
- **victory** - Game won
- **defeat** - Game lost
- **info** - Information
- **warning** - Warning
- **success** - Success
- **error** - Error

---

## Tactile Feedback

**Location:** `/components/TactileFeedback.tsx`

### Features

- Interactive buttons with ripple
- Animated progress bars
- Count-up numbers
- Loading spinners
- Pulse indicators
- Skeleton loaders
- Hover cards
- Badges
- Tooltips

### Usage

```tsx
import {
  InteractiveButton,
  AnimatedProgressBar,
  CountUpNumber,
  LoadingSpinner,
  PulseIndicator,
  Skeleton,
  HoverCard,
  AnimatedBadge,
  Tooltip,
} from '@/components/TactileFeedback';

// Interactive button
<InteractiveButton
  variant="primary"
  size="md"
  loading={false}
  icon={<Icon />}
  onClick={handleClick}
>
  Click Me!
</InteractiveButton>

// Progress bar
<AnimatedProgressBar
  value={75}
  max={100}
  color="#3b82f6"
  height={24}
  showLabel
  animated
  striped
/>

// Count-up number
<CountUpNumber
  value={1000}
  duration={1500}
  decimals={0}
  prefix="$"
  suffix=" Gold"
  onComplete={() => console.log('Done!')}
/>

// Loading spinner
<LoadingSpinner size="md" color="#3b82f6" />

// Pulse indicator
<PulseIndicator color="#22c55e" size={12} speed="normal" />

// Skeleton loader
<Skeleton width={200} height={20} />
<Skeleton width={50} height={50} circle />

// Hover card
<HoverCard elevation={3} glowColor="#3b82f6">
  <div>Hover me!</div>
</HoverCard>

// Badge
<AnimatedBadge variant="success" pulse glow>
  NEW
</AnimatedBadge>

// Tooltip
<Tooltip content="This is a tooltip" position="top" delay={500}>
  <button>Hover me</button>
</Tooltip>
```

---

## Integration Guide

### Complete Game Integration Example

```tsx
'use client';

import React, { useEffect, useRef } from 'react';
import { soundSystem } from '@/lib/soundSystem';
import { particleSystem } from '@/lib/particleSystem';
import { hapticFeedback } from '@/lib/hapticFeedback';
import { ScreenEffectsProvider, useScreenEffects } from '@/components/ScreenEffects';
import { NotificationSystemProvider, useNotifications } from '@/components/NotificationSystem';
import { InteractiveButton } from '@/components/TactileFeedback';

function GameWithFeedback() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effects = useScreenEffects();
  const notifications = useNotifications();

  useEffect(() => {
    // Initialize systems
    const initializeFeedback = async () => {
      // Preload sounds
      await soundSystem.preloadSounds([
        'unit_select',
        'attack_sword_clash',
        'gold_pickup',
        'boss_roar',
      ]);

      // Initialize particle system
      if (canvasRef.current) {
        particleSystem.initialize(canvasRef.current);
      }

      // Set volumes
      soundSystem.setMasterVolume(0.7);
      soundSystem.setCategoryVolume('ambient', 0.3);
    };

    initializeFeedback();
  }, []);

  const handleUnitSelect = (position: { row: number; col: number }) => {
    // Sound
    soundSystem.play('unit_select', { position });

    // Particles
    particleSystem.emitAt('dust', position);

    // Haptic
    hapticFeedback.onUnitSelect();
  };

  const handleAttack = (isCritical: boolean, position: { row: number; col: number }) => {
    if (isCritical) {
      // Sound
      soundSystem.play('hit_critical', { position });

      // Particles
      particleSystem.emitAt('critical_hit', position);

      // Screen effects
      effects.triggerShake({ intensity: 10, duration: 300 });
      effects.triggerFlash({ color: '#FF0000', duration: 100, intensity: 0.5 });
      effects.triggerSlowMotion({ scale: 0.3, duration: 500 });

      // Haptic
      hapticFeedback.onAttack(true);

      // Notification
      notifications.showCriticalMoment('Critical Hit!');
    } else {
      // Normal attack
      soundSystem.play('hit_normal', { position });
      particleSystem.emitAt('impact', position);
      effects.triggerShake({ intensity: 3, duration: 200 });
      hapticFeedback.onAttack(false);
    }
  };

  const handleBossSpawn = (bossName: string, position: { row: number; col: number }) => {
    // Sound
    soundSystem.play('boss_spawn', { position });
    soundSystem.play('boss_roar', { position, delay: 500 });

    // Particles
    particleSystem.emitAt('explosion', position);
    setTimeout(() => particleSystem.emitAt('smoke', position), 200);

    // Screen effects
    effects.triggerShake({ intensity: 15, duration: 2000, decay: true });
    effects.triggerColorGrading({ preset: 'boss', duration: 5000 });
    effects.triggerVignette({ intensity: 0.5, duration: 3000 });

    // Haptic
    hapticFeedback.onBossSpawn();

    // Notification
    notifications.showBossSpawn(bossName);
  };

  const handleVictory = () => {
    // Sound
    soundSystem.play('victory_fanfare');

    // Particles
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        particleSystem.emit('level_up', {
          x: Math.random() * 800,
          y: Math.random() * 600,
        });
      }, i * 200);
    }

    // Screen effects
    effects.triggerColorGrading({ preset: 'victory', duration: 10000 });
    effects.triggerZoom({ scale: 1.2, duration: 3000 });

    // Haptic
    hapticFeedback.onVictory();

    // Notification
    notifications.showVictory('Silk Road Conquered!');
  };

  return (
    <div className="relative w-full h-full">
      {/* Particle Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        width={800}
        height={600}
      />

      {/* Game Content */}
      <div className="relative z-10">
        <InteractiveButton
          variant="primary"
          onClick={() => handleUnitSelect({ row: 0, col: 0 })}
        >
          Select Unit
        </InteractiveButton>

        <InteractiveButton
          variant="danger"
          onClick={() => handleAttack(true, { row: 5, col: 5 })}
        >
          Critical Attack!
        </InteractiveButton>

        <InteractiveButton
          variant="warning"
          onClick={() => handleBossSpawn('Tiger Giry', { row: 10, col: 10 })}
        >
          Spawn Boss
        </InteractiveButton>

        <InteractiveButton
          variant="success"
          onClick={handleVictory}
        >
          Victory!
        </InteractiveButton>
      </div>
    </div>
  );
}

// Main app wrapper
export default function App() {
  return (
    <ScreenEffectsProvider>
      <NotificationSystemProvider>
        <GameWithFeedback />
      </NotificationSystemProvider>
    </ScreenEffectsProvider>
  );
}
```

---

## Performance Metrics

### Target Performance

- **Response Time:** < 100ms for all feedback
- **Sound Latency:** < 50ms
- **Particle Count:** Max 2000 simultaneous
- **Frame Rate:** 60 FPS maintained
- **Memory:** < 100MB for all systems

### Optimization Tips

1. **Preload sounds** on game start
2. **Limit particle count** based on device capability
3. **Use sound pooling** for frequently played sounds
4. **Batch particle emissions** when possible
5. **Disable effects** on low-end devices

### Settings Panel Example

```tsx
function SettingsPanel() {
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [particlesEnabled, setParticlesEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);

  useEffect(() => {
    soundSystem.setMasterVolume(masterVolume);
  }, [masterVolume]);

  useEffect(() => {
    if (!particlesEnabled) {
      particleSystem.clear();
      particleSystem.stop();
    } else {
      particleSystem.start();
    }
  }, [particlesEnabled]);

  useEffect(() => {
    hapticFeedback.setEnabled(hapticsEnabled);
  }, [hapticsEnabled]);

  return (
    <div>
      <label>
        Master Volume: {Math.round(masterVolume * 100)}%
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={e => setMasterVolume(parseFloat(e.target.value))}
        />
      </label>

      <label>
        <input
          type="checkbox"
          checked={particlesEnabled}
          onChange={e => setParticlesEnabled(e.target.checked)}
        />
        Enable Particles
      </label>

      <label>
        <input
          type="checkbox"
          checked={hapticsEnabled}
          onChange={e => setHapticsEnabled(e.target.checked)}
        />
        Enable Haptics
      </label>
    </div>
  );
}
```

---

## Action → Feedback Mapping

### Complete Feedback Table

| Action | Sound | Particles | Haptic | Screen Effect | Notification |
|--------|-------|-----------|--------|---------------|--------------|
| **Unit Selection** | `unit_select` | `dust` | `selection` | - | - |
| **Unit Move** | `unit_move_start` + `unit_footsteps_sand` | `dust` + `footprint` | `light` | - | - |
| **Normal Attack** | `attack_sword_swing` + `hit_normal` | `impact` + `slash` | `impact_medium` | Shake (3) | - |
| **Critical Attack** | `hit_critical` | `critical_hit` | `critical_hit` | Shake (10) + Flash + Slow-Mo | `showCriticalMoment` |
| **Unit Death** | `unit_death` | `blood` | `impact_heavy` | Shake (5) | - |
| **Gold Pickup** | `gold_pickup` + `gold_coins` | `gold_coin` | `success` | - | - |
| **Silk Collect** | `silk_collect` + `silk_sparkle` | `silk_sparkle` | `success` | - | `showSuccess` |
| **Ability Activate** | `ability_activate` + specific | Ability-specific | `ability_activate` | Color tint | - |
| **Boss Spawn** | `boss_spawn` + `boss_roar` | `explosion` + `smoke` | `boss_spawn` | Shake (15) + Vignette + Color | `showBossSpawn` |
| **Boss Attack** | `boss_attack` | `energy_burst` | `damage_heavy` | Shake (8) + Flash | - |
| **Boss Defeat** | `boss_defeated` | `explosion` + `gold_coin` | `heavy` | Shake (12) + Zoom | `showBossDefeat` |
| **Level Up** | `level_up` | `level_up` | `level_up` | - | `showLevelUp` |
| **Victory** | `victory_fanfare` | `level_up` (multiple) | `victory` | Color (victory) + Zoom | `showVictory` |
| **Defeat** | `defeat_sound` | `smoke` | `defeat` | Color (defeat) + Vignette | `showDefeat` |
| **Achievement** | `achievement_unlock` | `silk_sparkle` | `success` | - | `showAchievement` |
| **Button Click** | `ui_click` | - | `selection` | Button scale | - |
| **Error** | `ui_error` | - | `error` | Shake (5) | `showError` |

### Intensity Guidelines

- **Light Actions:** Volume 0.3-0.5, Shake 1-3, Short haptics (10-20ms)
- **Medium Actions:** Volume 0.5-0.7, Shake 3-7, Medium haptics (30-50ms)
- **Heavy Actions:** Volume 0.7-0.9, Shake 7-15, Long haptics (60-100ms)
- **Critical Moments:** Volume 0.8-1.0, Shake 10-20, Complex haptic patterns

---

## Best Practices

### Do's

✅ Layer feedback (combine sound + particles + haptic)
✅ Keep response time < 100ms
✅ Provide settings to disable effects
✅ Use spatial audio for positioned actions
✅ Preload frequently used sounds
✅ Vary pitch/timing to avoid repetition
✅ Scale effects based on importance
✅ Test on mobile devices

### Don'ts

❌ Overwhelm with too many effects
❌ Use same sound repeatedly
❌ Block gameplay with effects
❌ Ignore performance impact
❌ Forget accessibility options
❌ Use effects without context
❌ Auto-play sounds before user interaction

---

## Troubleshooting

### Sound not playing?
- Check if sounds are preloaded
- Verify browser autoplay policy
- Check if muted
- Verify volume levels

### Particles not showing?
- Ensure canvas is initialized
- Check if particle system is started
- Verify z-index of canvas
- Check max particle limit

### Haptics not working?
- Verify device support
- Check if user has enabled vibration in OS
- Ensure HTTPS (required for vibration API)
- Check if haptics are enabled

### Screen effects not applying?
- Verify provider is wrapping components
- Check if effects are being reset
- Verify CSS filter support

---

## Audio File Setup

### Required Sound Files

Place sound files in `/public/sounds/` with this structure:

```
/public/sounds/
├── ui/
│   ├── select.mp3
│   ├── click.mp3
│   └── ...
├── unit/
│   ├── select.mp3
│   ├── footsteps_sand.mp3
│   └── ...
├── combat/
│   ├── sword_swing.mp3
│   ├── sword_clash.mp3
│   └── ...
├── ability/
│   ├── activate.mp3
│   ├── fire.mp3
│   └── ...
├── resource/
│   ├── gold_pickup.mp3
│   ├── silk_collect.mp3
│   └── ...
├── boss/
│   ├── roar.mp3
│   ├── spawn.mp3
│   └── ...
├── game/
│   ├── victory_fanfare.mp3
│   ├── defeat.mp3
│   └── ...
└── ambient/
    ├── wind.mp3
    ├── market.mp3
    └── ...
```

### Sound Format Recommendations

- **Format:** MP3 (best browser support)
- **Sample Rate:** 44.1kHz
- **Bit Rate:** 128-192 kbps
- **Duration:** Keep under 3 seconds for SFX
- **Normalization:** -6dB to -3dB peak

---

## License

MIT License - Feel free to use in your projects!

---

**Created for Silkroad Fights** - Making every action feel JUICY! 🎮✨
