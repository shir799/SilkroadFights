# Silkroad Auto Chess - Asset Requirements

## Current Assets (Already Available)

All these assets are already configured in `/lib/theme.ts` and available for use:

### Character & Unit Sprites
| Asset | Path | Used In | Dimensions |
|-------|------|---------|------------|
| Logo | `theme.images.logo` | Intro, Loading, Menu | 256x256px (recommended) |
| Trader | `theme.images.trader` | Intro Scene 2 & 3 | 256x256px |
| King Thief | `theme.images.kingThief` | Intro Scene 2 | 256x256px |
| Thief | `theme.images.thief` | Intro Scene 3 | 256x256px |
| Hunter | `theme.images.hunter` | Intro Scene 3 | 256x256px |

### Boss Monsters
| Asset | Path | Used In | Dimensions |
|-------|------|---------|------------|
| Tiger Giry | `theme.images.tigergiry` | Intro Scene 4 | 512x512px |
| Skeleto King | `theme.images.skeletoking` | Intro Scene 4 | 512x512px |
| Murucha | `theme.images.murucha` | Intro Scene 4 | 512x512px |

### Items & Resources
| Asset | Path | Used In | Dimensions |
|-------|------|---------|------------|
| Silk | `theme.images.silk` | Loading, Transitions | 128x128px |
| Gold | `theme.images.gold` | Victory Screen | 128x128px |
| Trap | `theme.images.trap` | (Available for future use) | 128x128px |

---

## Optional Enhancement Assets

These assets would enhance the experience but are not required:

### Sound Effects (Recommended)
Create or source these audio files:

#### Intro Sounds
- `intro_music.mp3` - Epic orchestral theme (45 seconds)
- `desert_wind.mp3` - Ambient desert sounds
- `caravan_bells.mp3` - Camel bells for caravan scene
- `boss_roar.mp3` - Boss encounter dramatic sound

#### UI Sounds
- `button_hover.mp3` - Subtle hover sound
- `button_click.mp3` - Button press sound
- `page_turn.mp3` - Screen transition sound
- `notification.mp3` - Achievement/notification sound

#### Victory Sounds
- `victory_fanfare.mp3` - Epic victory music
- `confetti_pop.mp3` - Confetti sound
- `firework_burst.mp3` - Firework explosions
- `gold_collect.mp3` - Coin collection sound

#### Defeat Sounds
- `defeat_theme.mp3` - Respectful defeat music
- `ember_crackle.mp3` - Ambient ember sounds

#### Loading Sounds
- `ambient_loop.mp3` - Subtle background music

### Background Images (Optional)
If you want to replace canvas-generated backgrounds:

- `desert_landscape.jpg` - High-res desert background (1920x1080px)
- `sand_dunes.jpg` - Parallax sand dunes layer (1920x600px)
- `night_sky.jpg` - Starry night sky background (1920x1080px)
- `silk_texture.jpg` - Silk fabric texture (512x512px tileable)

### Additional Character Sprites (For Expanded Intro)
- `merchant_caravan.png` - Full caravan sprite
- `guard_units.png` - Guard character sprites
- `boss_minions.png` - Smaller enemy units

---

## Asset Specifications

### Image Requirements

**Format:** PNG with transparency (preferred) or WEBP
**Color Space:** RGB
**Optimization:** Run through image optimizer (TinyPNG, ImageOptim)

#### Character Sprites
- **Resolution:** 256x256px minimum, 512x512px recommended
- **Transparency:** Yes (alpha channel)
- **Style:** Consistent art style across all units
- **Facing:** Front-facing or 3/4 view
- **Background:** Transparent

#### Boss Monsters
- **Resolution:** 512x512px minimum, 1024x1024px for high quality
- **Transparency:** Yes (alpha channel)
- **Details:** High detail with distinguishable features
- **Intimidation:** Should look powerful and menacing

#### UI Elements
- **Resolution:** 128x128px to 256x256px
- **Transparency:** Yes for icons
- **Style:** Flat or slightly 3D to match theme
- **Colors:** Match theme palette (amber, gold, brown)

### Audio Requirements

**Format:** MP3 (broad compatibility) or OGG (better quality)
**Bitrate:** 128kbps minimum, 192kbps recommended
**Sample Rate:** 44.1kHz

#### Music Tracks
- **Length:**
  - Intro music: 45-60 seconds
  - Victory/Defeat: 15-30 seconds
  - Background loops: 1-2 minutes (seamless loop)
- **Volume:** Normalized to -14 LUFS
- **Fade:** Include fade in/out

#### Sound Effects
- **Length:** 0.5-2 seconds
- **Volume:** Normalized, not clipping
- **Format:** Short MP3 or OGG files

---

## File Structure

Recommended folder structure for assets:

```
public/
├── images/
│   ├── characters/
│   │   ├── trader.png
│   │   ├── thief.png
│   │   ├── king_thief.png
│   │   └── hunter.png
│   ├── bosses/
│   │   ├── tigergiry.png
│   │   ├── skeletoking.png
│   │   └── murucha.png
│   ├── items/
│   │   ├── silk.png
│   │   ├── gold.png
│   │   └── trap.png
│   └── ui/
│       └── logo.png
└── audio/
    ├── music/
    │   ├── intro_theme.mp3
    │   ├── victory_theme.mp3
    │   └── defeat_theme.mp3
    └── sfx/
        ├── button_click.mp3
        ├── firework.mp3
        └── confetti.mp3
```

---

## Current Asset URLs

All assets are currently hosted on Vercel Blob Storage:

```typescript
// From /lib/theme.ts
images: {
  logo: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-7q5joYEqr6I7lnCVvnIpU33b1Ic3wd.png',
  gold: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/gold-vdQam3idaMrE1Z27PQDzhXF5gwuSyv.png',
  silk: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/silk-vZQHPjDw5GCbrH2f08K7UvsYQCbvsE.png',
  kingThief: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/kingthief-ELevBdvYg2EBX9YEu4ESdlXEabyskF.png',
  thief: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Thief.png-hyVXxRC4m0a3B2MWEG2b2tlzpLkvCe.webp',
  trap: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trap.png-FLsHAaqx9V7kGZ6u5yFbRkT8QXx5fB.webp',
  hunter: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hunter-GF8068loplMRGwOj09mx0j1un6rqYr.png',
  trader: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/trader-WwNbJNwXqeZoGZiDdXpn5yS86eyKhG.png',
  murucha: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/maracha.png-uTti0RpeOgiQP5K9CUhCMRLkcbsie0.webp',
  skeletoking: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/skeletonking.png-T35NoP83bJDMf09TUK8DY3949cVZAq.webp',
  tigergiry: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/tigergiry.png-AZjsfzPqffCZRxICDn8MS1pA5Ve6yW.webp'
}
```

---

## Performance Optimization

### Image Optimization Checklist
- [ ] Run images through compression tool
- [ ] Use appropriate file format (PNG for sprites, WEBP for photos)
- [ ] Implement lazy loading for non-critical images
- [ ] Use srcset for responsive images
- [ ] Consider using CDN for faster delivery
- [ ] Cache assets with appropriate headers

### Audio Optimization Checklist
- [ ] Compress audio files without quality loss
- [ ] Use audio sprites for short sounds
- [ ] Implement lazy loading for audio
- [ ] Preload critical audio (intro music)
- [ ] Use Web Audio API for better control

---

## Browser Compatibility Notes

### Image Format Support
- **PNG:** Universal support
- **WEBP:** Modern browsers (Chrome, Firefox, Edge, Safari 14+)
- **AVIF:** Future-ready (Chrome 85+, limited support)

### Audio Format Support
- **MP3:** Universal support
- **OGG:** Good support (not Safari)
- **AAC/M4A:** Safari preferred
- **Recommendation:** Provide MP3 + OGG for best compatibility

---

## Creating New Assets

### For Custom Sprites
1. **Tools:** Aseprite, Photoshop, GIMP, Procreate
2. **Style Guide:** Match existing Silkroad theme (desert, oriental, medieval blend)
3. **Export:** PNG with transparency at 2x resolution (512x512)
4. **Naming:** Use descriptive names (e.g., `unit_desert_archer.png`)

### For Audio
1. **Tools:** Audacity, FL Studio, Logic Pro, GarageBand
2. **Style:** Epic orchestral for bosses, light percussion for UI
3. **Format:** Export as MP3 (192kbps) and OGG
4. **Licensing:** Ensure you have rights to use the audio

### Free Asset Resources
- **Images:**
  - OpenGameArt.org
  - Itch.io (game assets)
  - Kenney.nl (game assets)
- **Audio:**
  - Freesound.org
  - OpenGameArt.org
  - Incompetech.com (royalty-free music)

---

## Asset Loading Strategy

### Critical Assets (Load First)
1. Logo
2. Loading screen background
3. Main menu essentials

### High Priority (Load During Intro)
1. Character sprites
2. Boss sprites
3. UI elements

### Low Priority (Lazy Load)
1. Victory/Defeat screen assets
2. Non-critical sound effects
3. Background decorations

### Implementation Example
```typescript
// Preload critical assets
const preloadImages = [
  theme.images.logo,
  theme.images.silk,
  theme.images.gold,
];

preloadImages.forEach(src => {
  const img = new Image();
  img.src = src;
});
```

---

## Summary

### Assets Status
- ✅ **Available:** All character sprites, bosses, items (10 images)
- ⚠️ **Optional:** Sound effects and music (0 files)
- ⚠️ **Optional:** Enhanced backgrounds (0 files)

### Total Asset Count
- **Required:** 10 images (all available)
- **Optional:** ~20 audio files + additional images
- **Total Size:** Current ~5MB, Optimal with audio ~15-20MB

---

**Note:** All components work perfectly with just the existing assets. Sound effects and enhanced backgrounds are purely optional enhancements for an even more immersive experience.
