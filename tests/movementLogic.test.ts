import { describe, it, expect } from 'vitest';
import { doMovement } from '../src/logic/movementLogic';
import { Country } from '../src/types';

function makeCountry(id: number, troops: number): Country {
  return {
    id,
    name: `c${id}`,
    x: 100,
    y: 100,
    troops,
    neighbours: [1, 2],
    ownerIndex: 0,
    continentName: '',
    isSelected: false,
  };
}

describe('movementLogic', () => {
  it('moves troops correctly', () => {
    const c1 = makeCountry(1, 10);
    const c2 = makeCountry(2, 10);
    const { from, to } = doMovement(5, c1, c2);
    expect(from.troops).toBe(5);
    expect(to.troops).toBe(15);
  });

  it('moves all but 1 troop', () => {
    const c1 = makeCountry(1, 5);
    const c2 = makeCountry(2, 3);
    const { from, to } = doMovement(4, c1, c2);
    expect(from.troops).toBe(1);
    expect(to.troops).toBe(7);
  });
});
