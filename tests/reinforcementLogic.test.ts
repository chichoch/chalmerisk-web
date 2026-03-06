import { describe, it, expect } from 'vitest';
import {
  calculateFirstRoundReinforcements,
  calculateReinforcements,
} from '../src/logic/reinforcementLogic';
import { Country, Continent, PlayerColor } from '../src/types';

function makeCountry(id: number, ownerIndex: number): Country {
  return {
    id,
    name: `Country${id}`,
    x: 100,
    y: 100,
    troops: 1,
    neighbours: Array.from({ length: 15 }, (_, i) => i + 1),
    ownerIndex,
    continentName: '',
    isSelected: false,
  };
}

describe('reinforcementLogic', () => {
  describe('calculateFirstRoundReinforcements', () => {
    it('returns 10 for 4 players: (50-20)/3 = 10', () => {
      expect(calculateFirstRoundReinforcements(4)).toBe(10);
    });

    it('returns 11 for 3 players: (50-15)/3 = 11', () => {
      expect(calculateFirstRoundReinforcements(3)).toBe(11);
    });

    it('returns 13 for 2 players: (50-10)/3 = 13', () => {
      expect(calculateFirstRoundReinforcements(2)).toBe(13);
    });
  });

  describe('calculateReinforcements', () => {
    it('gives country-based + continent bonus when player owns all countries', () => {
      // Player 0 owns all 15 countries across 3 continents of value 5
      const countries = Array.from({ length: 15 }, (_, i) => makeCountry(i + 1, 0));
      const continents: Continent[] = [
        { name: 'Cont1', value: 5, countryIds: [1, 2, 3, 4, 5] },
        { name: 'Cont2', value: 5, countryIds: [6, 7, 8, 9, 10] },
        { name: 'Cont3', value: 5, countryIds: [11, 12, 13, 14, 15] },
      ];

      // 15/3 + 5*3 = 5 + 15 = 20
      expect(calculateReinforcements(0, countries, continents)).toBe(20);
    });

    it('gives minimum + continent bonus when player owns few countries', () => {
      // Player 0 owns 5 countries (all in Cont3), another player owns the rest
      const countries: Country[] = [];
      for (let i = 1; i <= 10; i++) {
        countries.push(makeCountry(i, 1)); // player 1
      }
      for (let i = 11; i <= 15; i++) {
        countries.push(makeCountry(i, 0)); // player 0
      }
      const continents: Continent[] = [
        { name: 'Cont1', value: 5, countryIds: [1, 2, 3, 4, 5] },
        { name: 'Cont2', value: 5, countryIds: [6, 7, 8, 9, 10] },
        { name: 'Cont3', value: 5, countryIds: [11, 12, 13, 14, 15] },
      ];

      // min 3 + continent 5 = 8
      expect(calculateReinforcements(0, countries, continents)).toBe(8);
    });
  });
});
