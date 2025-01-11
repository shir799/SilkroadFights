SILKROAD Fights
The ultimate turn-based PvP strategy game where cunning and strategy meet on the Silkroad.

Game Concept
Welcome to Silkroad Fights, a dynamic 1v1 strategy game played on an 8x8 board. Players take control of either Shadow Thieves or Golden Traders, each with unique abilities and victory conditions. The objective? Outwit and outmaneuver your opponent, leveraging resources like Gold, Silk, and powerful Boss mechanics to claim victory.

Victory Conditions
Golden Traders Win:
Deliver 2 Gold pieces to the designated Trader zone on the board.
If both Gold pieces are carried to the zone, the Traders secure victory.

Shadow Thieves Win:
Eliminate both Trader units before they can deliver their Gold.
If only the Hunter remains alive, the Thieves automatically win.

Board Setup
The game is played on an 8x8 grid, each tile representing a battlefield square.
Starting Positions:
Traders: A1, B1
Hunter: C1
Thieves: H3, H6
Gold: G4, G7
Silk Spawns: Randomly at the beginning of each round (3 empty tiles).
Gameplay Mechanics
Player Turns
Each player alternates turns.
On a turn, a player can move one unit and use one ability (if resources allow).
Movement and abilities are constrained by the unit’s range and available resources.
Movement
Traders: Move 1 tile per turn.
Hunter: Moves up to 2 tiles per turn.
Thieves: Move 1 tile per turn (can sprint 2 tiles using abilities).
Bosses: Special movement logic (see Boss section).
Resources
Gold
Found on fixed tiles (G4, G7).
Only Traders can carry Gold.
If a Trader carrying Gold dies, the Gold drops on their tile.
The Hunter can reclaim dropped Gold from a Thief by defeating them but cannot carry it otherwise.
Silk
Spawns randomly on 3 empty tiles at the beginning of each round.
Used to activate abilities:
Shadow Thieves: Shadowstep, Steal, Trap
Golden Traders: Rush, Trade, Shield
Abilities
Golden Trader Abilities:
Rush (2 Silk): Move up to 2 tiles in one turn.
Trade (3 Silk): Swap positions with another Trader unit.
Shield (3 Silk): Activate a shield for 1 turn to block incoming damage.
Shadow Thief Abilities:
Shadowstep (2 Silk): Move to any adjacent empty tile, bypassing obstacles.
Steal (3 Silk): Steal 1 Silk from the opponent’s reserve.
Trap (2 Silk): Place a trap on an adjacent tile to deal damage to opponents.
Boss Mechanics
Every 10 rounds, a powerful Boss spawns on the board to disrupt the battlefield:
Tiger Giry:
Deals AoE damage to all units in a 3x3 area.
Prioritizes the nearest unit.
Skeletoking:
Spawns skeleton minions on adjacent tiles.
Murucha:
Releases a poison cloud affecting units within 2 tiles (damage over time).
Combat System
Engage Combat:

Combat is triggered when units move into the same tile.
Damage Rules:

Thieves: Deal 1 damage per attack.
Kingthief: Deals 2 damage to Traders, 1 to Hunters.
Hunter: Can only attack Thieves or Bosses.
Turn-Based Combat:

Each unit may attack once per turn.
A health bar below each unit displays remaining health.
Dice Rolls:

Combat outcomes are determined by a best-of-3 dice roll.
Units with abilities (e.g., Shield) may gain additional bonuses.
Key Features for Development
Game Logic:
Fix turn-based mechanics to ensure proper alternation of turns.
Validate combat rules and prevent interactions after unit death.
Resource Handling:
Ensure Silk spawns on empty tiles.
Allow Gold to drop and be reclaimed under the defined conditions.
Boss Logic:
Implement spawning rules every 10 rounds.
Define Boss movement and targeting priorities.
Victory Logic:
Traders win when both Gold pieces are delivered.
Thieves win if both Traders are eliminated.
Planned Improvements
Story Mode:

Play through a campaign with unique Boss encounters.
PvP Multiplayer:

Competitive 1v1 matches with ranked matchmaking.
Customizations:

Unlock Skins and Icons for units using Silk or in-game achievements.
Dynamic AI:

Implement three difficulty levels for AI (Easy, Normal, Hard).
Adjust AI behavior to prioritize victory conditions.
Potential Bugs to Monitor
Ensure turn order is respected.
Prevent multiple units from occupying the same tile.
Fix health bars to update dynamically during combat.
Ensure dead units are removed from the board and cannot act further.
How to Play
Choose your faction: Traders or Thieves.
Plan your moves: Use abilities and resources strategically.
Claim victory: Complete your faction’s objectives before your opponent does.
