# ASSET SPECIFICATIONS - Technical Reference
**Silkroad Auto Chess - Detailed Asset Specs**

---

## SPRITE SPECIFICATIONS

### Unit Sprite Sheet Layout

**Standard Unit (64x64px per frame)**
```
Frame Layout: Horizontal Sprite Sheet
Total Size: 512x64px (8 frames)

Frame 1: Idle (default stance)
Frame 2: Walk 1 (left foot forward)
Frame 3: Walk 2 (right foot forward)
Frame 4: Attack 1 (wind-up)
Frame 5: Attack 2 (strike)
Frame 6: Damage (hit reaction)
Frame 7: Die 1 (falling)
Frame 8: Die 2 (on ground)
```

**Animation Timing:**
```javascript
const ANIMATION_SPEEDS = {
  idle: 500,    // 500ms per frame (2 FPS)
  walk: 150,    // 150ms per frame (6.7 FPS)
  attack: 100,  // 100ms per frame (10 FPS)
  damage: 200,  // 200ms (one-shot)
  die: 300,     // 300ms per frame (3.3 FPS)
};
```

### Boss Sprite Sheet Layout

**Boss Unit (128x128px per frame)**
```
Frame Layout: Horizontal Sprite Sheet
Total Size: 1024x128px (8 frames)

Frame 1: Idle
Frame 2: Walk
Frame 3: Roar/Special 1
Frame 4: Attack Wind-up
Frame 5: Attack Strike
Frame 6: Damage
Frame 7: Die 1
Frame 8: Die 2
```

### Pixel Art Guidelines

**For Artists Creating Sprites:**

1. **Canvas Setup**
   - Size: 64x64px (units) or 128x128px (bosses)
   - Background: Transparent
   - Color Mode: Indexed Color (256 colors max)
   - Anti-aliasing: OFF (for clean pixels)

2. **Pixel Art Rules**
   - No blur or soft edges
   - Limited palette (8-16 colors per sprite)
   - 1px outlines for character definition
   - Readable silhouette at any angle

3. **Character Proportions**
   - Head: ~20% of body height
   - Body: ~50% of height
   - Legs: ~30% of height
   - Weapon: Clearly visible, 30-40% of body

4. **Color Palette Per Unit**
   - Base color: Main body/armor
   - Shadow: 1-2 shades darker
   - Highlight: 1 shade lighter
   - Outline: Black or very dark (not pure black for softer look)
   - Accent: 1-2 colors for details

5. **Animation Principles**
   - Anticipation (wind-up before action)
   - Follow-through (overshoot then settle)
   - Squash and stretch (subtle, for impact)
   - Timing (fast actions = fewer frames, slow = more)

### Unit-Specific Color Palettes

**Trader Warrior:**
```
Primary:   #FFD700 (Gold armor)
Shadow:    #B8860B (Dark gold)
Highlight: #FFED4E (Bright gold)
Accent 1:  #8B4513 (Brown leather)
Accent 2:  #DC143C (Crimson cape)
Outline:   #3A3A3A (Dark gray)
```

**Thief Scout:**
```
Primary:   #2C2C3E (Dark clothing)
Shadow:    #1A1A2E (Deep shadow)
Highlight: #4A4A5E (Light gray)
Accent 1:  #8B4789 (Purple details)
Accent 2:  #C0C0C0 (Silver blade)
Outline:   #0A0A0A (Near black)
```

**Boss - TigerGiry:**
```
Primary:   #FF8C00 (Orange fur)
Shadow:    #CC6600 (Dark orange)
Highlight: #FFB347 (Light orange)
Accent 1:  #000000 (Black stripes)
Accent 2:  #FFFFFF (White belly)
Accent 3:  #FFD700 (Gold ornaments)
Outline:   #2A2A2A (Dark gray)
```

---

## UI ICON SPECIFICATIONS

### Icon Grid System

**All icons follow a 32x32px grid:**
```
Padding: 2px from edge
Active Area: 28x28px (center)
Stroke Width: 2px for main shapes
Detail Stroke: 1px for fine details
```

**Icon Style Guide:**
- Flat design with subtle gradients
- 2-3 colors maximum per icon
- 45-degree highlights (top-left light source)
- Consistent stroke width across set
- Drop shadow: 1px offset, 20% opacity black

### Currency Icon Details

**Gold Icon (32x32px):**
```
Shape: Circle with embossed symbol
Colors:
  - Base: #FFD700
  - Gradient: #FFA500 (bottom)
  - Highlight: #FFFF00 (top-left arc)
  - Shadow: #B8860B (bottom-right)
  - Outline: #8B6914 (2px)

Symbol: "G" or coin stack
  - Font: Bold, 18px
  - Color: #8B6914 (darker gold)
  - Position: Centered
```

**Silk Icon (32x32px):**
```
Shape: Flowing ribbon/fabric
Colors:
  - Base: #6B46C1 (purple)
  - Gradient: #8A5CF5 (lighter purple)
  - Shadow: #4B2C8F (darker purple)
  - Highlight: #AB7EFF (top shimmer)
  - Outline: #2A1650 (2px)

Design: S-curve ribbon with folds
  - Width: 6-8px ribbon
  - 2-3 visible folds
  - Shimmer effect on top edge
```

### Button State Specifications

**All buttons have 3 states:**

1. **Normal State**
   - Base color at 100%
   - 1px border, color darker 30%
   - Subtle inner shadow (1px, 10% white)

2. **Hover State**
   - Base color brightened 15%
   - Border brightened 15%
   - Subtle glow (2px blur, 30% opacity)
   - Cursor: pointer

3. **Disabled State**
   - Base color desaturated 50%
   - Opacity: 50%
   - Border: dashed or different style
   - Cursor: not-allowed

**Example CSS:**
```css
.button-gold {
  background: #FFD700;
  border: 2px solid #B8860B;
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.1);
  transition: all 0.2s ease;
}

.button-gold:hover {
  background: #FFE44D;
  border-color: #CCA31A;
  box-shadow: 0 0 8px rgba(255,215,0,0.3);
}

.button-gold:disabled {
  background: #9F9F7F;
  opacity: 0.5;
  cursor: not-allowed;
}
```

---

## PARTICLE EFFECT SPECIFICATIONS

### Hit Spark Effect

**Technical Specs:**
- Size: 32x32px per frame
- Frames: 4
- Frame Rate: 60 FPS (16.6ms per frame)
- Duration: 66ms total
- Format: PNG sprite sheet (128x32px)

**Frame Breakdown:**
```
Frame 1 (0ms):   Small burst, 8px radius
Frame 2 (16ms):  Expand to 16px, brightness peak
Frame 3 (33ms):  Fade start, 14px, particles scatter
Frame 4 (50ms):  Nearly transparent, 12px, final scatter
```

**Color Gradient:**
```
Center:  #FFFFFF (white)
Middle:  #FFD700 (yellow)
Outer:   #FF8C00 (orange)
Final:   #FF4500 (red-orange, fading)
```

**Particle Count:**
- 6-8 individual sparks
- Each spark: 2x6px rectangle
- Random rotation: 0-360°
- Velocity: 50-100px/s outward

### Damage Numbers

**Floating Damage Number System:**

**Specifications:**
- Font: Impact or Arial Black
- Size: 24px (normal), 32px (critical)
- Stroke: 2px black outline
- Shadow: 2px offset, 50% opacity

**Animation:**
```javascript
const damageAnimation = {
  duration: 1000, // 1 second
  startY: unitY - 10,
  endY: unitY - 60,
  opacity: {
    start: 1.0,
    end: 0.0,
    fadeStart: 700, // Start fading at 70%
  },
  scale: {
    start: 0.8,
    peak: 1.2,   // At 200ms
    end: 1.0,
  },
};
```

**Color Coding:**
```javascript
const damageColors = {
  normal: '#FFFFFF',        // White
  critical: '#FFD700',      // Gold
  miss: '#A0A0A0',          // Gray
  heal: '#4CAF50',          // Green
  poison: '#9C27B0',        // Purple
  fire: '#FF5722',          // Red-orange
  ice: '#2196F3',           // Blue
  lightning: '#FFEB3B',     // Yellow
};
```

---

## SOUND SPECIFICATIONS

### Sound Effect Requirements

**Technical Standards:**
```
Format: MP3 (192kbps) or OGG Vorbis
Sample Rate: 44.1kHz
Bit Depth: 16-bit
Channels: Mono (preferred for SFX)
Duration: 0.1s - 3s (most effects)
File Size: 10KB - 100KB per file
```

### Sound Categories & Properties

**UI Sounds (0.05s - 0.2s)**
```javascript
{
  ui_click: {
    duration: 0.05s,
    frequency: 1000Hz - 2000Hz,
    volume: -6dB,
    attack: 0ms,
    release: 50ms,
    description: "Sharp, quick click"
  },
  ui_hover: {
    duration: 0.03s,
    frequency: 800Hz - 1500Hz,
    volume: -12dB,
    attack: 0ms,
    release: 30ms,
    description: "Subtle whoosh"
  }
}
```

**Combat Sounds (0.1s - 0.5s)**
```javascript
{
  sword_swing: {
    duration: 0.3s,
    frequencies: [200Hz - 800Hz], // Whoosh
    volume: -6dB,
    attack: 10ms,
    decay: 100ms,
    description: "Metal whoosh with air"
  },
  sword_clash: {
    duration: 0.2s,
    frequencies: [2000Hz - 8000Hz], // Metal clang
    volume: -3dB,
    attack: 0ms,
    decay: 200ms,
    description: "Sharp metal impact"
  }
}
```

### Spatial Audio Configuration

**3D Sound Properties:**
```javascript
const spatialConfig = {
  maxDistance: 15,      // Max audible distance (grid units)
  rolloffFactor: 2,     // How quickly sound fades
  referenceDistance: 1, // Full volume distance
  coneInnerAngle: 360,  // Omnidirectional
  coneOuterAngle: 360,
  coneOuterGain: 0,
};
```

**Distance-Based Volume:**
```
Distance 0-1 units:   100% volume
Distance 1-5 units:   100% - 50% (linear falloff)
Distance 5-10 units:  50% - 10% (exponential)
Distance 10-15 units: 10% - 0% (exponential)
Distance 15+ units:   0% (silence)
```

---

## MUSIC SPECIFICATIONS

### Music Technical Requirements

```
Format: MP3 (256kbps) or OGG Vorbis
Sample Rate: 44.1kHz or 48kHz
Bit Depth: 16-bit
Channels: Stereo
Duration: 2-4 minutes (loop)
File Size: 3-8MB per track
Loop Point: Seamless (0ms gap)
```

### Composition Guidelines

**Main Theme (2-3 minutes):**
```
Tempo: 90-110 BPM
Key: D minor or A minor (dramatic)
Structure:
  - Intro: 0:00-0:20 (20s)
  - Verse A: 0:20-1:00 (40s)
  - Verse B: 1:00-1:40 (40s)
  - Bridge: 1:40-2:00 (20s)
  - Verse A repeat: 2:00-2:40 (40s)
  - Outro/Loop: 2:40-3:00 (20s, seamless to intro)

Instruments:
  - Strings: Violins, cellos (sustaining)
  - Middle Eastern: Oud, ney flute
  - Percussion: Darbuka, frame drum
  - Bass: Double bass or synth bass
  - Atmosphere: Pad, wind sounds
```

**Battle Theme (3-4 minutes):**
```
Tempo: 130-150 BPM
Key: E minor or B minor (intense)
Structure:
  - Intro: 0:00-0:15 (15s, building)
  - Main A: 0:15-1:00 (45s, intense)
  - Main B: 1:00-1:45 (45s, variation)
  - Break: 1:45-2:15 (30s, quieter intensity)
  - Main C: 2:15-3:00 (45s, climax)
  - Outro/Loop: 3:00-3:15 (15s, to intro)

Instruments:
  - Drums: Epic taiko, snare, toms
  - Brass: Horns, trumpets (stabs)
  - Strings: Fast ostinatos, tremolos
  - Percussion: Aggressive rhythms
  - Electric: Synth bass, power chords
```

### Loop Point Implementation

**Seamless Looping:**
```javascript
// Audio file must have exact loop points
const musicTrack = {
  file: 'battle_music.mp3',
  loopStart: 15.0,  // seconds (after intro)
  loopEnd: 195.0,   // seconds (before outro)
  fadeIn: 0.5,      // fade in duration
  fadeOut: 1.0,     // fade out duration
};

// Implementation
audio.addEventListener('timeupdate', () => {
  if (audio.currentTime >= musicTrack.loopEnd) {
    audio.currentTime = musicTrack.loopStart;
  }
});
```

---

## BACKGROUND SPECIFICATIONS

### Background Image Requirements

**Technical Specs:**
```
Resolution: 1920x1080px (Full HD)
Aspect Ratio: 16:9
Format: JPG (95% quality) or WebP
Color Space: sRGB
File Size: 300KB - 800KB (compressed)
Backup: Mobile version at 1280x720px
```

### Parallax Layer System

**Battle Field Background Layers:**

```
Layer 1 - Sky (Static)
  Size: 1920x400px
  Position: Top
  Scroll Speed: 0x (fixed)
  Content: Sunset sky, clouds

Layer 2 - Far Background (Slow)
  Size: 2400x300px (wider for scroll)
  Position: Top + 200px
  Scroll Speed: 0.2x
  Content: Distant mountains, ruins

Layer 3 - Mid Background (Medium)
  Size: 2880x400px
  Position: Top + 400px
  Scroll Speed: 0.5x
  Content: Desert dunes, structures

Layer 4 - Ground (No Parallax)
  Size: 1920x680px
  Position: Bottom
  Scroll Speed: 1x (with camera)
  Content: Battle arena, grid overlay
```

**Implementation:**
```css
.bg-layer-sky {
  position: absolute;
  top: 0;
  left: 0;
  transform: translateX(0px); /* Fixed */
  z-index: 1;
}

.bg-layer-far {
  position: absolute;
  top: 200px;
  transform: translateX(calc(var(--camera-x) * -0.2));
  z-index: 2;
}

.bg-layer-mid {
  position: absolute;
  top: 400px;
  transform: translateX(calc(var(--camera-x) * -0.5));
  z-index: 3;
}

.bg-layer-ground {
  position: absolute;
  top: 400px;
  transform: translateX(calc(var(--camera-x) * -1));
  z-index: 4;
}
```

### Art Direction Guidelines

**Desert Battle Field:**
```
Time of Day: Golden Hour (sunset)
Lighting: Warm, directional from left
Atmosphere: Sandy, slightly hazy
Color Temperature: Warm (3500K-4500K)

Foreground Colors:
  Sand: #EDC9AF, #D2B48C
  Shadows: #8B7355, #6B5839

Midground Colors:
  Dunes: #C9A977, #B8945F
  Structures: #8B7355, #6B5839

Background Colors:
  Sky: #FF6B35, #FFA07A (sunset)
  Mountains: #4A4A5A (silhouette)
```

**Desert Market Shop:**
```
Time of Day: Midday
Lighting: Bright, overhead sun
Atmosphere: Busy, colorful
Color Temperature: Neutral-Warm (5000K-5500K)

Colors:
  Fabric/Awnings: #8B4789, #DC143C, #FFD700
  Ground: #D2B48C, #C9A977
  Shadows: Strong, #4A4A5A
  Highlights: Bright whites, #FFFFFF
```

---

## OPTIMIZATION GUIDE

### Image Optimization

**Compression Tools:**
1. **TinyPNG** (https://tinypng.com)
   - Reduces PNG size by 50-80%
   - Maintains transparency
   - Batch processing available

2. **ImageOptim** (Mac) / **Trimage** (Linux)
   - Local lossless compression
   - Removes metadata
   - Fast batch processing

3. **Squoosh** (https://squoosh.app)
   - WebP conversion
   - Side-by-side comparison
   - Manual quality adjustment

**Optimization Targets:**
```
Sprite (64x64px):     < 10KB
Icon (32x32px):       < 5KB
Boss (128x128px):     < 30KB
Background (1920x1080): < 500KB
Effect (32x32px):     < 8KB
```

### Sprite Sheet Packing

**Benefits:**
- Reduces HTTP requests
- Improves loading time
- Enables texture caching

**Tool: TexturePacker**
```
Settings:
  Algorithm: MaxRects
  Pack: Tight
  Allow Rotation: No (for easier CSS)
  Size Constraints: POT (Power of Two)
  Output: PNG + JSON

Example Output:
  units_sheet.png (512x512px)
  units_sheet.json (frame coordinates)
```

**Usage:**
```javascript
// Load sprite sheet
const spriteSheet = {
  image: 'units_sheet.png',
  frames: {
    'trader_warrior_idle': { x: 0, y: 0, w: 64, h: 64 },
    'trader_warrior_walk': { x: 64, y: 0, w: 64, h: 64 },
    // ...
  }
};

// Render sprite
function drawSprite(ctx, spriteName, x, y) {
  const frame = spriteSheet.frames[spriteName];
  ctx.drawImage(
    spriteSheet.image,
    frame.x, frame.y, frame.w, frame.h,
    x, y, frame.w, frame.h
  );
}
```

### Audio Optimization

**Compression:**
```bash
# Convert WAV to MP3 (192kbps)
ffmpeg -i input.wav -b:a 192k output.mp3

# Convert to OGG Vorbis
ffmpeg -i input.wav -c:a libvorbis -q:a 5 output.ogg

# Reduce file size (lower quality)
ffmpeg -i input.mp3 -b:a 128k output_compressed.mp3
```

**Sprite Sound (for very short SFX):**
```javascript
// Combine multiple SFX into one audio sprite
const audioSprite = {
  src: 'sfx_sprite.mp3',
  sprite: {
    click: [0, 50],        // Start: 0ms, Duration: 50ms
    hover: [50, 30],       // Start: 50ms, Duration: 30ms
    confirm: [80, 200],    // Start: 80ms, Duration: 200ms
  }
};
```

---

## ASSET NAMING CONVENTIONS

### File Naming Rules

**Format:** `category_descriptor_variant.extension`

**Examples:**
```
✅ Good:
  unit_trader_warrior_idle.png
  ui_icon_gold_32.png
  sfx_combat_sword_clash.mp3
  bg_battlefield_sunset.jpg

❌ Bad:
  warrior.png (too generic)
  icon1.png (numbered, not descriptive)
  sound.mp3 (no context)
  background.jpg (vague)
```

### Directory Structure

```
/public/
  /sprites/
    /units/
      trader_warrior.png
      trader_archer.png
      thief_scout.png
      ...
    /bosses/
      tigergiry.png
      skeletoking.png
      murucha.png
    /items/
      /components/
        item_sword.png
        item_bow.png
      /combined/
        giant_slayer.png
        rabadons.png
    /effects/
      hit_spark.png
      slash_effect.png
      fireball.png

  /ui/
    /icons/
      gold_icon.png
      silk_icon.png
      hp_icon.png
    /traits/
      trait_trader.png
      trait_thief.png
    /buttons/
      btn_refresh.png
      btn_lock.png
    /panels/
      shop_panel.png
      bench_panel.png

  /backgrounds/
    battlefield_bg.png
    shop_bg.png
    menu_bg.png

  /sounds/
    /ui/
      click.mp3
      hover.mp3
    /combat/
      sword_swing.mp3
      hit_normal.mp3
    /... (see main doc)

  /music/
    silkroad_theme.mp3
    battle_music.mp3

  /fonts/
    (use Google Fonts CDN)
```

---

## QUALITY CHECKLIST

### Before Publishing Assets

**Visual Assets:**
- [ ] Correct dimensions (exact pixel size)
- [ ] Transparent background (where needed)
- [ ] Optimized file size
- [ ] No artifacts or compression issues
- [ ] Consistent style across set
- [ ] Readable at target size
- [ ] Proper naming convention
- [ ] Includes all animation frames

**Audio Assets:**
- [ ] Correct format (MP3/OGG)
- [ ] Proper bitrate (192kbps for SFX, 256 for music)
- [ ] No clipping or distortion
- [ ] Normalized volume (-6dB to -3dB peak)
- [ ] Clean start/end (no clicks)
- [ ] Seamless loop (for music)
- [ ] Proper length (not too long)
- [ ] Mono for SFX, stereo for music

**Integration:**
- [ ] Files in correct directories
- [ ] Referenced correctly in code
- [ ] Loads without 404 errors
- [ ] Preloading works correctly
- [ ] Performance acceptable (<100ms load)
- [ ] Mobile compatible
- [ ] Fallbacks in place

---

## APPENDIX: Export Settings

### Photoshop Export Settings

**For Sprites:**
```
File > Export > Export As...
Format: PNG-24
Transparency: Yes
Interlaced: No
Metadata: None
Color Profile: Convert to sRGB
```

**For Backgrounds:**
```
File > Export > Save for Web (Legacy)
Format: JPEG
Quality: 80-90
Optimized: Yes
Convert to sRGB: Yes
```

### Aseprite Export Settings

**For Pixel Art:**
```
File > Export Sprite Sheet
Layout: Horizontal Strip or Packed
Item Size: 64x64 (for units)
Padding: 0
Output File: PNG-8
Transparent Color: Magic Pink (#FF00FF)
```

### Audacity Export Settings

**For Sound Effects:**
```
File > Export > Export as MP3
Bit Rate Mode: Constant
Quality: 192 kbps
Channel Mode: Mono (for SFX)
Sample Rate: 44100 Hz
```

### GIMP Export Settings

**For Sprites:**
```
File > Export As > PNG
Compression Level: 9 (maximum)
Save background color: No
Save gamma: No
Save layer offset: No
```

---

**Document Version:** 1.0
**Last Updated:** 2025-11-11
**For:** Silkroad Auto Chess Asset Pipeline
