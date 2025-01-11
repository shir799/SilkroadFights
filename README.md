# SilkroadFights
Turn-based 1v1 PvP with a story-driven solo mode as the first alpha.

Game Objective
Trader (Player 1):
Collect two Gold pieces and deliver them to the designated goal zones (A3, A6).
Protect your team (2 Traders and 1 Hunter) while navigating through enemy attacks and Boss threats.
Thief (Player 2 or AI):
Prevent Traders from delivering Gold by eliminating them.
Secure Gold for the Thieves by returning it to the Thief base zones (H3, H6).
Use stealth, ambushes, and the superior strength of the Kingthief to dominate.
Gameplay Mechanics
Board Setup
8x8 grid, labeled A1 (bottom-left) to H8 (top-right).
Fixed positions for Gold: H3, H6.
Silk spawns randomly, with a maximum of 3 Silk tiles on the board.
Central area (C4–F5) serves as the potential spawn zone for Bosses.
Starting Positions
Trader Side:
Trader 1: A2
Trader 2: A7
Hunter: B4
Thief Side:
Thief 1: H2
Thief 2: H7
Kingthief: G4
Character Mechanics
Trader Side
Traders:

Movement: 1 tile per turn (2 tiles with "Rush").
Gold Handling:
Can pick up Gold from H3/H6 or reclaim it from a Thief.
Can deliver only 1 Gold piece at a time to goal zones.
Abilities:
Rush: Move 2 tiles in one turn (cost: 1 Silk).
Shield Wall: Grants 1 round of immunity to damage (cost: 2 Silk).
Fortify: Increases HP of both Traders for 2 rounds (cost: 3 Silk).
Hunter:

Movement: 1 tile per turn.
Attack: Can target Thieves but not Bosses.
Gold Handling: Can only pick up Gold dropped by Thieves.
Thief Side
Thieves:

Movement: 1 tile per turn (2 tiles with "Sprint").
Gold Handling:
Can pick up Gold and deliver it to H3/H6.
If Gold is delivered to the Thief base, it’s lost to Traders.
Abilities:
Ambush: Places a trap to block movement (cost: 1 Silk).
Disarm: Disables an active Trader ability (cost: 2 Silk).
Shadowstep: Moves through obstacles or units (cost: 3 Silk).
Kingthief:

Damage: Double damage to Traders, regular damage to Hunter.
Tank Role: Higher HP than regular Thieves.
Boss Mechanics
Spawn every 10 rounds in the central area (C4–F5).
Bosses attack the nearest unit (Trader, Thief, or Hunter).
Each Boss has unique abilities and movement patterns:
Tiger Giry: High-speed movement and AoE damage.
Skeleto King: Summons skeleton minions and absorbs Silk.
Murucha: High defense with counterattack capabilities.
Rewards: Defeating a Boss grants Silk and temporary stat boosts.
Victory Conditions
Trader Victory:
Successfully deliver both Gold pieces to A3 and A6.
Survive Boss attacks and evade Thieves.
Thief Victory:
Eliminate both Traders.
Deliver stolen Gold to H3 or H6.
Prevent Gold delivery by controlling the board.
Silk Mechanics
Spawn: Randomly on empty tiles, max 3 Silk tiles at a time.
Collection: Any character can collect Silk by moving onto the tile.
Usage: Silk powers abilities unique to each side.
Balance: Silk availability ensures a balance of power between the factions.
Round System
Each player takes turns moving one character or using one ability.
Combat occurs if units from opposing sides collide.
Bosses act after both players' turns, targeting the nearest unit.
Bug Prevention Checklist
Round Logic: Ensure smooth transitions between turns.
Gold Handling:
Gold must drop on the correct tile when a Trader dies.
Only valid units can pick up Gold.
Silk Spawning: Prevent over-spawning or Silk on occupied tiles.
Combat System:
Damage calculation must follow rules (e.g., Kingthief's double damage).
End turn after combat.
Boss Mechanics:
Bosses should only spawn in designated areas.
Ensure fair targeting logic for Boss attacks.
Victory Conditions: Verify that win/loss scenarios trigger correctly.
Ability Usage:
Validate sufficient Silk before ability activation.
Prevent multiple ability uses in one turn.
Future Improvements
Add customizable skins and items via an in-game shop.
Integrate blockchain wallets for premium item purchases.
Develop a PvP matchmaking system for ranked play.
Expand Boss library for greater replayability.
Introduce new factions or special units for deeper strategy.
Setup Instructions
Clone this repository and run the project locally.
Refer to the included files for the base HTML structure and mechanics.
Use placeholder assets for visuals during initial testing.
Implement all mechanics step by step, ensuring balance and functionality.
This README serves as a comprehensive guide for implementing and understanding the game mechanics of Trader vs Thief.
