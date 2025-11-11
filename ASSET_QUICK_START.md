# ASSET QUICK START GUIDE
**Get Your Assets Working in 30 Minutes**

---

## FASTEST PATH TO WORKING ASSETS

### Option A: Placeholders (10 minutes) ⚡

**Best for:** Immediate prototyping, testing game logic

1. **Open the Placeholder Generator**
   ```bash
   # Navigate to project
   cd /home/user/SilkroadFights

   # Open in browser
   open scripts/generatePlaceholders.html
   # OR visit: file:///home/user/SilkroadFights/scripts/generatePlaceholders.html
   ```

2. **Generate Assets**
   - Click "Generate ALL"
   - Click "Download All as ZIP"
   - Extract to `/public/`

3. **Done!** You now have:
   - 7 unit sprites
   - 3 boss sprites
   - 10 UI icons
   - Total time: ~2 minutes

**Pros:**
- Instant results
- No external dependencies
- Free
- Consistent style

**Cons:**
- Not production quality
- Emoji-based (limited)
- Will need replacement

---

### Option B: Free Asset Packs (30 minutes) 📦

**Best for:** Better quality, still free

#### Step 1: Download Assets (10 min)

**Go to OpenGameArt.org:**
```
Search: "desert rpg sprites"
Filter: License = CC0 or CC-BY
Download: 2-3 packs that match style
```

**Recommended Packs:**
- [LPC Base Assets](https://opengameart.org/content/liberated-pixel-cup-lpc-base-assets-sprites-map-tiles)
- [Tiny RPG Characters](https://opengameart.org/content/tiny-16-basic-rpg-sprites)

#### Step 2: Extract & Organize (5 min)

```bash
# Extract downloaded zips
unzip ~/Downloads/asset-pack-1.zip -d /tmp/assets

# Copy to project
cp /tmp/assets/warrior.png public/sprites/units/trader_warrior.png
cp /tmp/assets/thief.png public/sprites/units/thief_scout.png
# ... etc
```

#### Step 3: Get Sounds from Freesound (10 min)

```
Go to: freesound.org
Search: "game ui click"
Download: 10 essential sounds
Rename to match sound system
```

#### Step 4: Add Google Fonts (5 min)

Add to `/app/layout.tsx`:

```tsx
import { Cinzel, Roboto, Orbitron } from 'next/font/google';

const cinzel = Cinzel({ subsets: ['latin'], weight: ['400', '700', '900'] });
const roboto = Roboto({ subsets: ['latin'], weight: ['400', '500', '700'] });
const orbitron = Orbitron({ subsets: ['latin'], weight: ['400', '700', '900'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={roboto.className}>
        {children}
      </body>
    </html>
  );
}
```

**Done!** You have functional free assets.

---

### Option C: AI Generation (60 minutes) 🤖

**Best for:** Custom, unique assets

**Requirements:**
- Midjourney subscription ($10/month) OR
- DALL-E 3 via ChatGPT Plus ($20/month) OR
- Stable Diffusion (free, local)

#### Midjourney Prompts

**Unit Sprite:**
```
/imagine 64x64 pixel art desert trader warrior, golden armor,
RPG game sprite, side view, transparent background,
simple pixel art style --ar 1:1 --v 6
```

**Boss Sprite:**
```
/imagine 128x128 pixel art tiger warrior boss, orange fur,
intimidating pose, RPG game boss sprite, front view,
transparent background, detailed pixel art --ar 1:1 --v 6
```

**Background:**
```
/imagine desert battlefield background, sunset lighting,
ancient ruins, sand dunes, 16:9 aspect ratio,
game background art, warm colors --ar 16:9 --v 6
```

#### Workflow:

1. Generate 4 variations
2. Pick best one
3. Upscale
4. Download
5. Remove background (if needed): remove.bg
6. Resize to target dimensions
7. Save to project

**Time per asset:** ~5 minutes
**Total for MVP:** ~60 minutes

---

## INTEGRATION STEPS

### 1. Create Directory Structure (2 min)

```bash
cd /home/user/SilkroadFights/silkroad_fights

mkdir -p public/sprites/units
mkdir -p public/sprites/bosses
mkdir -p public/ui/icons
mkdir -p public/backgrounds
mkdir -p public/sounds/ui
mkdir -p public/sounds/combat
mkdir -p public/music
```

### 2. Copy Assets to Directories (3 min)

```bash
# Units
cp ~/Downloads/warrior.png public/sprites/units/trader_warrior.png
cp ~/Downloads/archer.png public/sprites/units/trader_archer.png
# ... etc

# Sounds
cp ~/Downloads/click.mp3 public/sounds/ui/click.mp3
# ... etc
```

### 3. Verify Assets Load (5 min)

Create test page at `/app/test-assets/page.tsx`:

```tsx
'use client';

import Image from 'next/image';

export default function TestAssets() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Asset Test</h1>

      <h2>Units</h2>
      <Image src="/sprites/units/trader_warrior.png" width={64} height={64} alt="Warrior" />
      <Image src="/sprites/units/trader_archer.png" width={64} height={64} alt="Archer" />

      <h2>Bosses</h2>
      <Image src="/sprites/bosses/tigergiry.png" width={128} height={128} alt="Tiger" />

      <h2>Icons</h2>
      <Image src="/ui/icons/gold_icon.png" width={32} height={32} alt="Gold" />

      <h2>Sounds</h2>
      <button onClick={() => new Audio('/sounds/ui/click.mp3').play()}>
        Test UI Click
      </button>
      <button onClick={() => new Audio('/sounds/combat/hit_normal.mp3').play()}>
        Test Combat Hit
      </button>
    </div>
  );
}
```

Visit: `http://localhost:3000/test-assets`

Check for:
- ✅ All images display
- ✅ No 404 errors in console
- ✅ Sounds play when clicked

### 4. Integrate into Game (10 min)

**Update GameBoard.tsx:**

```tsx
// Example: Render unit sprite
<div
  className="unit"
  style={{
    backgroundImage: `url(/sprites/units/${unit.type}.png)`,
    width: '64px',
    height: '64px',
  }}
/>
```

**Use Sound System:**

```tsx
import { soundSystem } from '@/lib/soundSystem';

// On unit click
soundSystem.play('ui_click');

// On combat hit
soundSystem.play('hit_normal', {
  position: { row: unit.row, col: unit.col }
});
```

---

## TROUBLESHOOTING

### Assets Not Loading (404)

**Check:**
1. File path is correct (case-sensitive!)
   ```bash
   # Check actual filename
   ls -la public/sprites/units/
   ```

2. File extension matches
   ```bash
   # Should be .png, not .PNG
   # Should be .mp3, not .wav
   ```

3. Public directory is correct
   ```bash
   # Next.js: /public/
   # NOT /src/public/ or /app/public/
   ```

**Fix:**
```bash
# Rename if needed
mv public/sprites/units/Warrior.png public/sprites/units/trader_warrior.png

# Check permissions
chmod 644 public/sprites/units/*.png
```

### Sounds Not Playing

**Check:**
1. Browser allows audio
   ```javascript
   // User must interact first
   document.addEventListener('click', () => {
     const audio = new Audio('/sounds/ui/click.mp3');
     audio.play();
   }, { once: true });
   ```

2. File format supported
   - Use MP3 (best compatibility)
   - Fallback to OGG if needed

3. Volume not muted
   ```javascript
   audio.volume = 0.8; // 80% volume
   ```

**Fix:**
```typescript
// Wrapper for safe audio play
function playSound(src: string) {
  try {
    const audio = new Audio(src);
    audio.play().catch(err => {
      console.warn('Audio play failed:', err);
    });
  } catch (err) {
    console.error('Audio error:', err);
  }
}
```

### Images Look Pixelated

**Problem:** Next.js Image optimization causes blur

**Fix:**
```tsx
<Image
  src="/sprites/units/warrior.png"
  width={64}
  height={64}
  alt="Warrior"
  unoptimized // Disable blur for pixel art
  style={{ imageRendering: 'pixelated' }} // Keep sharp pixels
/>
```

Or use CSS:
```css
.pixel-art {
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
}
```

### Performance Issues

**Problem:** Too many assets loading at once

**Fix:** Implement preloader

```typescript
// lib/assetPreloader.ts
export async function preloadAssets(urls: string[]) {
  const promises = urls.map(url => {
    if (url.endsWith('.png') || url.endsWith('.jpg')) {
      // Preload image
      return new Promise((resolve, reject) => {
        const img = new window.Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = url;
      });
    } else if (url.endsWith('.mp3')) {
      // Preload audio
      return new Promise((resolve, reject) => {
        const audio = new Audio();
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject);
        audio.src = url;
      });
    }
  });

  await Promise.all(promises);
}

// Usage
await preloadAssets([
  '/sprites/units/trader_warrior.png',
  '/sounds/ui/click.mp3',
  // ...
]);
```

---

## MVP ASSET LIST (COPY THIS!)

**Minimum assets needed to launch:**

### Visual (20 files)
```
/public/sprites/units/
  trader_warrior.png (64x64)
  trader_archer.png (64x64)
  trader_guard.png (64x64)
  thief_scout.png (64x64)
  thief_bandit.png (64x64)
  thief_assassin.png (64x64)
  hunter.png (64x64)

/public/sprites/bosses/
  tigergiry.png (128x128) ← Already exists!
  skeletoking.png (128x128)
  murucha.png (128x128)

/public/ui/icons/
  gold_icon.png (32x32)
  silk_icon.png (32x32) ← Already exists!
  hp_icon.png (32x32)
  refresh_icon.png (32x32)
  lock_icon.png (32x32)
  buy_icon.png (32x32)
  sell_icon.png (32x32)

/public/backgrounds/
  battlefield_bg.jpg (1920x1080)
  menu_bg.jpg (already exists: wüste.png)
```

### Audio (11 files)
```
/public/sounds/ui/
  click.mp3
  hover.mp3
  confirm.mp3

/public/sounds/combat/
  sword_swing.mp3
  hit_normal.mp3
  unit_death.mp3

/public/sounds/game/
  victory_fanfare.mp3
  defeat_sound.mp3

/public/music/
  battle_music.mp3
```

### Fonts (0 files - Use Google Fonts CDN)
```
Cinzel (titles)
Roboto (UI)
Orbitron (numbers)
```

**TOTAL: 31 files to source**

---

## BUDGET OPTIONS

### $0 Budget
- **Time:** 2-4 hours
- **Source:** OpenGameArt.org + Freesound.org + Placeholders
- **Quality:** 6/10 (good enough for testing)

### $50 Budget
- **Time:** 4-6 hours
- **Source:** Itch.io paid pack ($20) + Fiverr artist ($30)
- **Quality:** 7.5/10 (decent)

### $200 Budget
- **Time:** 8-12 hours
- **Source:** Unity Asset Store ($100) + Commissioned sprites ($100)
- **Quality:** 9/10 (professional)

---

## RECOMMENDED WORKFLOW

**Day 1: Placeholders (2 hours)**
1. Generate placeholders (10 min)
2. Set up directories (10 min)
3. Integrate into game (60 min)
4. Test everything (40 min)

**Result:** Fully functional game with placeholder art

**Day 2: Source Better Assets (4 hours)**
1. Browse OpenGameArt/Itch.io (60 min)
2. Download 3-5 asset packs (30 min)
3. Extract and organize (60 min)
4. Replace placeholders (60 min)
5. Test and polish (30 min)

**Result:** Game with decent free assets

**Day 3: Polish & Optimize (2 hours)**
1. Compress all images (30 min)
2. Balance sound levels (30 min)
3. Add missing assets (40 min)
4. Final testing (20 min)

**Result:** Production-ready assets

---

## CHECKLIST FOR LAUNCH

**Before you can launch, you MUST have:**

- [ ] All 7 unit sprites
- [ ] All 3 boss sprites (1 exists)
- [ ] 7 essential UI icons
- [ ] 1 battle background
- [ ] 5 UI sounds
- [ ] 3 combat sounds
- [ ] 2 game state sounds
- [ ] 1 music track
- [ ] Fonts integrated

**Nice to have (can add later):**

- [ ] Unit animations
- [ ] Item sprites
- [ ] Particle effects
- [ ] Additional backgrounds
- [ ] Full sound library
- [ ] Multiple music tracks

---

## RESOURCES AT A GLANCE

### Free Assets
- **Sprites:** https://opengameart.org
- **Icons:** https://kenney.nl
- **Sounds:** https://freesound.org
- **Music:** https://incompetech.com
- **Fonts:** https://fonts.google.com

### Paid Assets
- **All-in-one:** https://itch.io/game-assets
- **Professional:** https://assetstore.unity.com
- **Freelancers:** https://fiverr.com

### Tools
- **Compress Images:** https://tinypng.com
- **Remove Background:** https://remove.bg
- **Edit Audio:** https://audacity.com (free)
- **Edit Sprites:** https://aseprite.org ($20)

---

## NEXT STEPS

1. **Choose your option** (A, B, or C above)
2. **Set a timer** (30-60 minutes)
3. **Get the MVP assets**
4. **Test in game**
5. **Iterate and improve**

**Remember:** Placeholder assets are better than no assets. Get something working first, then make it beautiful!

---

## QUESTIONS?

**Common Questions:**

**Q: Can I mix free and paid assets?**
A: Yes! Just check license compatibility.

**Q: Do I need all assets at once?**
A: No! Start with units and sounds. Add rest later.

**Q: What if I can't find matching art styles?**
A: Use placeholders for now. Consistent style > mixed quality.

**Q: Can I use AI-generated assets commercially?**
A: Check the AI tool's terms. Most allow it (Midjourney, DALL-E).

**Q: How do I credit free assets?**
A: Add attribution to game credits. See ASSET_DOCUMENTATION.md for format.

---

**Ready to start?** Pick an option above and GO! 🚀

**Need help?** Reference these docs:
- Full details: `ASSET_DOCUMENTATION.md`
- Technical specs: `ASSET_SPECIFICATIONS.md`
- Integration guide: `ASSET_INTEGRATION_CHECKLIST.md`

**Good luck, and have fun building Silkroad Auto Chess!** 🎮✨
