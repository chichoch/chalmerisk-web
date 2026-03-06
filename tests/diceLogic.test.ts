import { describe, it, expect } from 'vitest';
import { rollDice, resolveBattle } from '../src/logic/diceLogic';
import { BattleOutcome } from '../src/types';

describe('diceLogic', () => {
  describe('rollDice', () => {
    it('returns values between 1 and 6', () => {
      for (let i = 0; i < 100; i++) {
        const value = rollDice();
        expect(value).toBeGreaterThanOrEqual(1);
        expect(value).toBeLessThanOrEqual(6);
      }
    });
  });

  describe('resolveBattle', () => {
    it('always returns a valid BattleOutcome', () => {
      const validOutcomes = [
        BattleOutcome.DEFENDER_KILLED_1,
        BattleOutcome.ATTACKER_KILLED_1,
        BattleOutcome.DEFENDER_KILLED_2,
        BattleOutcome.ATTACKER_KILLED_2,
        BattleOutcome.ONE_EACH,
      ];
      for (let i = 0; i < 100; i++) {
        const result = resolveBattle(4, 3);
        expect(validOutcomes).toContain(result.outcome);
      }
    });

    it('returns 3 attacker dice when attacker has >3 troops', () => {
      for (let i = 0; i < 50; i++) {
        const result = resolveBattle(5, 2);
        expect(result.attackerDiceCount).toBe(3);
      }
    });

    it('returns 2 attacker dice when attacker has 3 troops', () => {
      for (let i = 0; i < 50; i++) {
        const result = resolveBattle(3, 2);
        expect(result.attackerDiceCount).toBe(2);
      }
    });

    it('returns 1 attacker die when attacker has 2 troops', () => {
      for (let i = 0; i < 50; i++) {
        const result = resolveBattle(2, 2);
        expect(result.attackerDiceCount).toBe(1);
      }
    });

    it('returns 1 defender die when defender has 1 troop', () => {
      for (let i = 0; i < 50; i++) {
        const result = resolveBattle(4, 1);
        expect(result.defenderDiceCount).toBe(1);
      }
    });

    it('returns 2 defender dice when defender has >=2 troops', () => {
      for (let i = 0; i < 50; i++) {
        const result = resolveBattle(4, 3);
        expect(result.defenderDiceCount).toBe(2);
      }
    });

    it('only kills 1 when only 1 die each', () => {
      for (let i = 0; i < 50; i++) {
        const result = resolveBattle(2, 1);
        expect([
          BattleOutcome.DEFENDER_KILLED_1,
          BattleOutcome.ATTACKER_KILLED_1,
        ]).toContain(result.outcome);
      }
    });
  });
});
