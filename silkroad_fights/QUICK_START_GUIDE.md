# 🚀 SILKROAD FIGHTS - QUICK START GUIDE

## 🎮 GET PLAYING IN 5 MINUTES

### Step 1: Install & Run (2 minutes)
```bash
cd silkroad_fights
npm install
npm run dev
```

### Step 2: Visit Demos (1 minute)
Open browser and test:
- `http://localhost:3000` - Full game
- `http://localhost:3000/battle-demo` - Combat only

### Step 3: Play! (2 minutes)
- Click units to select
- Click highlighted tiles to move
- Watch combat animations
- Use abilities with Silk

**DONE! You're playing!** 🎉

---

## 🎯 GAME OVERVIEW

### Objective
**Traders:** Deliver 2 Gold pieces to zone
**Thieves:** Eliminate both Traders

### Factions

#### 🟡 SILK TRADERS (Golden)
- **Trader** (2 HP) - Carries Gold, moves 1 tile
- **Hunter** (3 HP) - Protects Traders, moves 2 tiles
- **Win Condition:** Deliver 2 Gold to zone

#### 🔴 SHADOW THIEVES (Dark)
- **Thief** (2 HP) - Fast striker, moves 1 tile
- **KingThief** (3 HP) - Elite unit, moves 1 tile
- **Win Condition:** Kill all Traders

---

## 🎲 CORE MECHANICS

### Movement
1. **Select** your unit (click it)
2. **Valid moves** highlight in green
3. **Click** destination to move
4. **Combat** triggers if enemies nearby

### Combat System
- **Best-of-3** dice rolls
- Winner deals damage
- Dead units removed
- HP shown below units

### Resources

#### 💜 Silk (Currency)
- Spawns on 3 random tiles each round
- Used to activate abilities
- Pick up by moving over it

#### 💰 Gold (Objective)
- Fixed spawns at G4, G7
- Only Traders can carry
- Drops if Trader dies
- Hunter can reclaim dropped Gold

---

## ⚔️ ABILITIES

### 🟡 TRADER ABILITIES

| Ability | Cost | Effect |
|---------|------|--------|
| **Evasion** | 1 Silk | Dodge next attack |
| **Sprint** | 2 Silk | Move 4 tiles this turn |
| **Shield Bash** | 2 Silk | Reduce damage by 1 |
| **Track Prey** | 3 Silk | Reveal enemy positions |
| **Guard** | 1 Silk | Protect adjacent Trader |

### 🔴 THIEF ABILITIES

| Ability | Cost | Effect |
|---------|------|--------|
| **Shadow Step** | 2 Silk | Move through occupied tiles |
| **Steal Silk** | 3 Silk | Steal from adjacent enemy |
| **Set Trap** | 2 Silk | Place immobilizing trap |

---

## 👹 BOSS ENCOUNTERS

### Boss Spawning
- Appears every **10 rounds**
- Random boss type
- Both factions can attack
- Rewards to killer

### Boss Types

#### 🐯 Tiger Giry
- **HP:** 12
- **Attack:** 3x3 AoE damage
- **Behavior:** Charges nearest unit
- **Reward:** 5 Silk + Attack buff

#### 💀 Skeleto King
- **HP:** 10
- **Attack:** Spawns skeleton minions
- **Behavior:** Stationary summoner
- **Reward:** 4 Silk + Skeleton ally

#### 🐲 Murucha
- **HP:** 15
- **Attack:** Poison cloud (DoT)
- **Behavior:** Random movement
- **Reward:** 6 Silk + Poison resistance

---

## 🎮 GAMEPLAY FLOW

### Early Game (Rounds 1-3)
1. **Collect Silk** for abilities
2. **Position units** strategically
3. **Avoid combat** unless advantageous
4. Traders: **Secure Gold**
5. Thieves: **Pressure Traders**

### Mid Game (Rounds 4-9)
1. **Use abilities** to gain advantage
2. **Force combat** when stronger
3. Traders: **Advance Gold** toward zone
4. Thieves: **Hunt Traders**, ignore Hunter
5. **Prepare** for Round 10 boss

### Boss Round (Round 10, 20, 30...)
1. **Decide:** Fight boss or each other?
2. **Coordinate** attacks on boss
3. **Claim rewards** quickly
4. **Exploit** opponent's weakness

### Late Game (Rounds 11+)
1. **Execute strategy:**
   - Traders: Sprint to victory
   - Thieves: Aggressive elimination
2. **Use buffs** from boss kills
3. **Calculate** win conditions
4. **Finish strong!**

---

## 💡 STRATEGY TIPS

### For TRADERS 🟡
- **Protect Gold carriers** - Use Hunter to block
- **Sprint ability** - Save 2 Silk for final dash
- **Trade positions** - Swap Traders to confuse Thieves
- **Zone control** - Stay near victory zone
- **Time bosses** - Attack when Thieves are weak

### For THIEVES 🔴
- **Focus Traders** - Ignore Hunter unless blocking
- **Shadow Step** - Move through units to reach Traders
- **Set Traps** - On Gold spawn points and victory zone
- **Steal Silk** - Deny Trader abilities
- **Boss timing** - Force Traders to fight boss

### Universal Tips
- **Silk is king** - More resources = more options
- **HP management** - Retreat when low
- **Ability timing** - Don't waste on bad turns
- **Board position** - Control center tiles
- **Boss rewards** - Worth the risk!

---

## 📊 INTERFACE GUIDE

### Game Screen Layout

```
┌─────────────────────────────────────┐
│  SILKROAD FIGHTS        🎵 SOUND   │
├─────────────────────────────────────┤
│  Faction: Traders  |  Epoch: 5     │
│  Silk: 3  Gold: 0  |  Enemy: 2     │
├──────────────────────┬──────────────┤
│                      │              │
│    8x8 GAME BOARD   │   ABILITIES  │
│    (Click to play)   │   - Evasion  │
│                      │   - Sprint   │
│                      │   - Shield   │
│                      │              │
│                      │   UNIT INFO  │
│                      │   HP: 2/2    │
│                      │              │
└──────────────────────┴──────────────┘
```

### Board Symbols
- **TR** 🟡 - Trader
- **H** 🟡 - Hunter
- **TH** 🔴 - Thief
- **KT** 🔴 - KingThief
- **SI** 💜 - Silk
- **G** 💰 - Gold
- **X** ⚠️ - Trap
- **Z** ⭐ - Victory Zone
- **Boss Icon** 👹 - Active Boss

### Visual Indicators
- **Green highlight** - Valid moves
- **Red highlight** - Enemy in combat range
- **Yellow highlight** - Selected unit
- **Health bar** - Below each unit
- **Dice animation** - During combat

---

## 🎮 GAME MODES

### 1. Human vs AI (Trader)
You play as Traders, AI controls Thieves.
- **Easy:** AI makes random moves
- **Normal:** AI uses basic strategy
- **Hard:** AI optimizes every move

### 2. Human vs AI (Thief)
You play as Thieves, AI controls Traders.
- **Easy:** AI plays defensively
- **Normal:** AI balances risk
- **Hard:** AI rushes victory

### 3. Human vs Human (Coming Soon)
Two players on same device.

### 4. Online Multiplayer (Planned)
Ranked matches with ELO system.

---

## 🚀 ADVANCED TECHNIQUES

### Trader Advanced
- **Gold juggling** - Pass Gold between Traders
- **Hunter sacrifice** - Block fatal damage
- **Sprint timing** - Wait for clear path
- **Trap awareness** - Scout with Hunter first

### Thief Advanced
- **Pincer attack** - Surround Traders with both units
- **Silk denial** - Control spawn points
- **Trap web** - Create inescapable zones
- **Boss baiting** - Lure Traders into boss range

### Pro Tips
- **Turn counting** - Track boss spawns
- **Resource math** - Calculate ability sequences
- **Movement prediction** - Anticipate opponent moves
- **Risk assessment** - Know when to retreat

---

## 🔧 TECHNICAL FEATURES

### Performance
- **60 FPS** on all devices
- **Instant response** to inputs
- **Smooth animations** using CSS transforms
- **Mobile optimized** touch controls

### Visual Polish
- **CSS gradients** for professional look
- **Framer Motion** for smooth transitions
- **Responsive design** scales to any screen
- **Asset fallbacks** - No loading delays

### Accessibility
- **Clear visual feedback** for all actions
- **High contrast** UI elements
- **Mobile-friendly** touch targets
- **Keyboard support** (coming soon)

---

## 🎨 CUSTOMIZATION

### Using CSS Placeholders
All missing assets automatically render as:
- **Gradient backgrounds** matching faction colors
- **Text labels** for unit identification
- **Unicode symbols** for icons
- **Smooth animations** for polish

### Adding Real Assets
1. Edit `lib/theme.ts`
2. Replace URLs with your assets
3. Refresh browser
4. Done!

No complex configuration needed!

---

## 🐛 TROUBLESHOOTING

### Game not starting?
```bash
# Clear node modules
rm -rf node_modules
npm install
npm run dev
```

### Units not moving?
- Check if it's your turn
- Verify unit belongs to your faction
- Ensure destination is valid (highlighted green)

### Abilities not working?
- Check Silk count (top of screen)
- Verify ability isn't on cooldown
- Ensure ability is applicable to current situation

### Performance issues?
- Close other browser tabs
- Disable browser extensions
- Use Chrome/Firefox for best performance

---

## 📚 LEARNING PATH

### Beginner (First Hour)
1. ✅ Complete tutorial
2. ✅ Play vs Easy AI
3. ✅ Learn all abilities
4. ✅ See all boss types

### Intermediate (First Day)
1. ✅ Beat Normal AI
2. ✅ Master one faction
3. ✅ Win with both factions
4. ✅ Kill each boss type

### Advanced (First Week)
1. ✅ Beat Hard AI consistently
2. ✅ Win without losing units
3. ✅ Speed run (fewest turns)
4. ✅ Create your own strategies

### Expert (Ongoing)
1. ✅ Win 90%+ vs Hard AI
2. ✅ Compete in online matches
3. ✅ Contribute to strategy guides
4. ✅ Join the community!

---

## 🎯 CHALLENGES

Try these for extra fun:

### Speed Run
- Win in under 15 turns

### Pacifist (Traders)
- Win without Hunter attacking

### Aggressive (Traders)
- Kill all Thieves before delivering Gold

### Boss Hunter
- Kill 3 bosses in one game

### Resource Master
- Collect 10+ Silk in one game

### Flawless Victory
- Win without losing any HP

---

## 📞 NEXT STEPS

### Want to Play?
```bash
npm run dev
# Visit http://localhost:3000
```

### Want to Learn More?
- **Tech Details:** `TFT_ENGINE_README.md`
- **Asset Info:** `/ASSET_README.md`
- **Quick Setup:** `/ASSET_QUICK_START.md`

### Want to Customize?
- Edit `lib/gameLogic.ts` for rules
- Edit `lib/theme.ts` for visuals
- Edit `components/` for UI

---

## ✨ HAVE FUN!

Silkroad Fights is designed to be:
- **Easy to learn** (5 min tutorial)
- **Hard to master** (endless strategy)
- **Fast to play** (10-20 min games)
- **Fun to watch** (epic animations)

**Now go play and dominate the Silkroad!** 🎮⚔️✨

---

**Pro Tip:** The best way to learn is to PLAY! Start with Easy AI and experiment. Every loss teaches you something new. 🚀
