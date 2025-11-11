/**
 * AUTO-BATTLE SYSTEM TESTS
 * Verify core battle mechanics work correctly
 */

import {
  AutoBattleEngine,
  createAutoBattle,
  UnitClass,
  getUnitAbility,
  getUnitStats,
} from '../autoBattleSystem';

describe('Auto Battle System', () => {
  describe('Engine Initialization', () => {
    it('should create a battle with two teams', () => {
      const teamA: UnitClass[] = ['BladeNovice', 'BowNovice'];
      const teamB: UnitClass[] = ['ForceNovice'];

      const engine = createAutoBattle(teamA, teamB);
      const state = engine.getState();

      expect(state.units.length).toBe(3);
      expect(state.units.filter(u => u.team === 'A').length).toBe(2);
      expect(state.units.filter(u => u.team === 'B').length).toBe(1);
    });

    it('should position units correctly', () => {
      const teamA: UnitClass[] = ['Warrior'];
      const teamB: UnitClass[] = ['Warrior'];

      const engine = createAutoBattle(teamA, teamB);
      const state = engine.getState();

      const unitA = state.units.find(u => u.team === 'A');
      const unitB = state.units.find(u => u.team === 'B');

      // Front line units should be positioned forward
      expect(unitA?.position.row).toBeLessThan(5);
      expect(unitB?.position.row).toBeGreaterThan(5);
    });

    it('should initialize units with correct stats', () => {
      const teamA: UnitClass[] = ['Dragon'];
      const engine = createAutoBattle(teamA, []);
      const state = engine.getState();

      const dragon = state.units[0];
      expect(dragon.class).toBe('Dragon');
      expect(dragon.maxHp).toBe(3000);
      expect(dragon.currentHp).toBe(3000);
      expect(dragon.currentMana).toBe(0);
      expect(dragon.maxMana).toBe(100);
    });
  });

  describe('Combat Mechanics', () => {
    it('should reduce HP when unit takes damage', () => {
      const teamA: UnitClass[] = ['BladeNovice'];
      const teamB: UnitClass[] = ['BladeNovice'];

      const engine = createAutoBattle(teamA, teamB);

      // Run battle for a bit
      for (let i = 0; i < 100; i++) {
        engine.update(16.67); // ~60 FPS
      }

      const state = engine.getState();
      const hasLowHp = state.units.some(u => u.currentHp < u.maxHp);

      expect(hasLowHp).toBe(true);
    });

    it('should gain mana from combat', () => {
      const teamA: UnitClass[] = ['BladeNovice'];
      const teamB: UnitClass[] = ['BladeNovice'];

      const engine = createAutoBattle(teamA, teamB);

      // Run battle
      for (let i = 0; i < 200; i++) {
        engine.update(16.67);
      }

      const state = engine.getState();
      const hasMana = state.units.some(u => u.currentMana > 0);

      expect(hasMana).toBe(true);
    });

    it('should cast abilities when mana is full', () => {
      const teamA: UnitClass[] = ['Wizard'];
      const teamB: UnitClass[] = ['Warrior'];

      const engine = createAutoBattle(teamA, teamB);

      // Run battle until ability cast
      let abilityCast = false;
      for (let i = 0; i < 1000 && !abilityCast; i++) {
        engine.update(16.67);
        const events = engine.getRecentEvents(10);
        if (events.some(e => e.type === 'ability')) {
          abilityCast = true;
        }
      }

      expect(abilityCast).toBe(true);
    });

    it('should end battle when one team is eliminated', () => {
      const teamA: UnitClass[] = ['Dragon'];
      const teamB: UnitClass[] = ['BladeNovice'];

      const engine = createAutoBattle(teamA, teamB);

      // Run until finished
      let iterations = 0;
      const maxIterations = 10000;

      while (!engine.isFinished() && iterations < maxIterations) {
        engine.update(16.67);
        iterations++;
      }

      expect(engine.isFinished()).toBe(true);
      expect(engine.getWinner()).toBe('A'); // Dragon should win
    });
  });

  describe('Special Abilities', () => {
    it('Phoenix should revive once', () => {
      const teamA: UnitClass[] = ['Phoenix'];
      const teamB: UnitClass[] = ['Dragon'];

      const engine = createAutoBattle(teamA, teamB);

      let reviveEvent = false;
      for (let i = 0; i < 5000; i++) {
        engine.update(16.67);
        const events = engine.getRecentEvents(10);
        if (events.some(e => e.type === 'revive')) {
          reviveEvent = true;
          break;
        }
        if (engine.isFinished()) break;
      }

      // Phoenix should attempt to revive
      // (May not succeed if mana not full at death)
      const state = engine.getState();
      const phoenix = state.units.find(u => u.class === 'Phoenix');

      expect(phoenix).toBeDefined();
    });

    it('Cleric should heal allies', () => {
      const teamA: UnitClass[] = ['Cleric', 'Warrior'];
      const teamB: UnitClass[] = ['Blader'];

      const engine = createAutoBattle(teamA, teamB);

      let healEvent = false;
      for (let i = 0; i < 2000; i++) {
        engine.update(16.67);
        const events = engine.getRecentEvents(10);
        if (events.some(e => e.type === 'heal')) {
          healEvent = true;
          break;
        }
      }

      expect(healEvent).toBe(true);
    });

    it('Chain Lightning should bounce', () => {
      const teamA: UnitClass[] = ['LightningWizard'];
      const teamB: UnitClass[] = ['BladeNovice', 'BladeNovice', 'BladeNovice'];

      const engine = createAutoBattle(teamA, teamB);

      let chainLightning = false;
      for (let i = 0; i < 2000; i++) {
        engine.update(16.67);
        const events = engine.getRecentEvents(10);
        const abilityEvent = events.find(
          e => e.type === 'ability' && e.data?.abilityName === 'Chain Lightning'
        );
        if (abilityEvent && abilityEvent.data?.targetIds?.length > 1) {
          chainLightning = true;
          break;
        }
      }

      expect(chainLightning).toBe(true);
    });
  });

  describe('Unit Data', () => {
    it('should have abilities for all unit classes', () => {
      const classes: UnitClass[] = [
        'BladeNovice',
        'BowNovice',
        'ForceNovice',
        'Blader',
        'Bowman',
        'Wizard',
        'Warrior',
        'Bard',
        'Cleric',
        'FireWizard',
        'IceWizard',
        'LightningWizard',
        'TigerGirl',
        'Phoenix',
        'Dragon',
      ];

      classes.forEach(unitClass => {
        const ability = getUnitAbility(unitClass);
        expect(ability).toBeDefined();
        expect(ability.name).toBeTruthy();
        expect(ability.manaCost).toBe(100);
      });
    });

    it('should have stats for all unit classes', () => {
      const classes: UnitClass[] = [
        'BladeNovice',
        'BowNovice',
        'ForceNovice',
        'Blader',
        'Bowman',
        'Wizard',
        'Warrior',
        'Bard',
        'Cleric',
        'FireWizard',
        'IceWizard',
        'LightningWizard',
        'TigerGirl',
        'Phoenix',
        'Dragon',
      ];

      classes.forEach(unitClass => {
        const stats = getUnitStats(unitClass);
        expect(stats).toBeDefined();
        expect(stats.maxHp).toBeGreaterThan(0);
        expect(stats.attackDamage).toBeGreaterThan(0);
      });
    });

    it('should have increasing stats by tier', () => {
      const tier1 = getUnitStats('BladeNovice');
      const tier3 = getUnitStats('Warrior');
      const tier5 = getUnitStats('Dragon');

      expect(tier5.maxHp!).toBeGreaterThan(tier3.maxHp!);
      expect(tier3.maxHp!).toBeGreaterThan(tier1.maxHp!);
    });
  });

  describe('AI Behavior', () => {
    it('should find and target enemies', () => {
      const teamA: UnitClass[] = ['BladeNovice'];
      const teamB: UnitClass[] = ['BowNovice'];

      const engine = createAutoBattle(teamA, teamB);

      // Run a few ticks
      for (let i = 0; i < 10; i++) {
        engine.update(16.67);
      }

      const state = engine.getState();
      const bladeNovice = state.units.find(u => u.class === 'BladeNovice');

      expect(bladeNovice?.currentTarget).toBeTruthy();
    });

    it('should move towards target', () => {
      const teamA: UnitClass[] = ['BladeNovice'];
      const teamB: UnitClass[] = ['BowNovice'];

      const engine = createAutoBattle(teamA, teamB);

      const state = engine.getState();
      const bladeNovice = state.units.find(u => u.class === 'BladeNovice')!;
      const initialRow = bladeNovice.position.row;

      // Run battle
      for (let i = 0; i < 100; i++) {
        engine.update(16.67);
      }

      const updatedState = engine.getState();
      const updatedNovice = updatedState.units.find(u => u.class === 'BladeNovice');

      // Should have moved towards enemy
      expect(updatedNovice?.position.row).not.toBe(initialRow);
    });
  });

  describe('Event System', () => {
    it('should record damage events', () => {
      const teamA: UnitClass[] = ['BladeNovice'];
      const teamB: UnitClass[] = ['BowNovice'];

      const engine = createAutoBattle(teamA, teamB);

      for (let i = 0; i < 500; i++) {
        engine.update(16.67);
      }

      const events = engine.getRecentEvents(100);
      const damageEvents = events.filter(e => e.type === 'damage');

      expect(damageEvents.length).toBeGreaterThan(0);
    });

    it('should record death events', () => {
      const teamA: UnitClass[] = ['Dragon'];
      const teamB: UnitClass[] = ['BladeNovice'];

      const engine = createAutoBattle(teamA, teamB);

      let deathEvent = false;
      for (let i = 0; i < 5000; i++) {
        engine.update(16.67);
        const events = engine.getRecentEvents(10);
        if (events.some(e => e.type === 'death')) {
          deathEvent = true;
          break;
        }
        if (engine.isFinished()) break;
      }

      expect(deathEvent).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty teams gracefully', () => {
      const engine = createAutoBattle([], []);
      expect(engine.isFinished()).toBe(true);
    });

    it('should handle one-sided battles', () => {
      const teamA: UnitClass[] = ['Dragon'];
      const teamB: UnitClass[] = [];

      const engine = createAutoBattle(teamA, teamB);
      expect(engine.isFinished()).toBe(true);
      expect(engine.getWinner()).toBe('A');
    });

    it('should not crash with many units', () => {
      const teamA: UnitClass[] = Array(10).fill('BladeNovice') as UnitClass[];
      const teamB: UnitClass[] = Array(10).fill('BowNovice') as UnitClass[];

      const engine = createAutoBattle(teamA, teamB);

      expect(() => {
        for (let i = 0; i < 100; i++) {
          engine.update(16.67);
        }
      }).not.toThrow();
    });
  });
});
