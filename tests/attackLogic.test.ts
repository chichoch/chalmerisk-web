import { describe, it, expect } from 'vitest';
import {
  validateAttacker,
  validateDefender,
  applyBattleOutcome,
  applyTakeover,
} from '../src/logic/attackLogic';
import { BattleOutcome, Country } from '../src/types';

function makeCountry(id: number, ownerIndex: number, troops: number, neighbours: number[] = []): Country {
  return {
    id,
    name: `Country${id}`,
    x: 100,
    y: 100,
    troops,
    neighbours,
    ownerIndex,
    continentName: '',
    isSelected: false,
  };
}

describe('attackLogic', () => {
  describe('validateAttacker', () => {
    const countries = [
      makeCountry(1, 0, 5, [2]),
      makeCountry(2, 1, 3, [1]),
      makeCountry(3, 0, 1, []),
    ];

    it('rejects non-owned country', () => {
      const result = validateAttacker(2, 0, countries);
      expect(result.valid).toBe(false);
    });

    it('rejects country with 1 troop', () => {
      const result = validateAttacker(3, 0, countries);
      expect(result.valid).toBe(false);
    });

    it('accepts valid attacker', () => {
      const result = validateAttacker(1, 0, countries);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateDefender', () => {
    const countries = [
      makeCountry(1, 0, 5, [2, 3]),
      makeCountry(2, 1, 3, [1]),
      makeCountry(3, 0, 2, [1]),
      makeCountry(4, 1, 2, []),
    ];

    it('rejects own country', () => {
      const result = validateDefender(countries[0], 3, countries);
      expect(result.valid).toBe(false);
    });

    it('rejects non-neighbour', () => {
      const result = validateDefender(countries[0], 4, countries);
      expect(result.valid).toBe(false);
    });

    it('accepts valid defender', () => {
      const result = validateDefender(countries[0], 2, countries);
      expect(result.valid).toBe(true);
    });
  });

  describe('applyBattleOutcome', () => {
    it('removes 1 defender troop for DEFENDER_KILLED_1', () => {
      const att = makeCountry(1, 0, 5);
      const def = makeCountry(2, 1, 3);
      const { attacker, defender } = applyBattleOutcome(BattleOutcome.DEFENDER_KILLED_1, att, def);
      expect(attacker.troops).toBe(5);
      expect(defender.troops).toBe(2);
    });

    it('removes 1 attacker troop for ATTACKER_KILLED_1', () => {
      const att = makeCountry(1, 0, 5);
      const def = makeCountry(2, 1, 3);
      const { attacker, defender } = applyBattleOutcome(BattleOutcome.ATTACKER_KILLED_1, att, def);
      expect(attacker.troops).toBe(4);
      expect(defender.troops).toBe(3);
    });

    it('removes 1 each for ONE_EACH', () => {
      const att = makeCountry(1, 0, 5);
      const def = makeCountry(2, 1, 3);
      const { attacker, defender } = applyBattleOutcome(BattleOutcome.ONE_EACH, att, def);
      expect(attacker.troops).toBe(4);
      expect(defender.troops).toBe(2);
    });
  });

  describe('applyTakeover', () => {
    it('transfers ownership and sets troops correctly', () => {
      const att = makeCountry(1, 0, 5);
      const def = makeCountry(2, 1, 0);
      const { attacker, defender } = applyTakeover(att, def);
      expect(attacker.troops).toBe(4);
      expect(defender.troops).toBe(1);
      expect(defender.ownerIndex).toBe(0);
    });
  });
});
