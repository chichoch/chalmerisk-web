import type { Country, Continent } from '../types';

export function calculateFirstRoundReinforcements(numPlayers: number): number {
  return Math.floor((50 - 5 * numPlayers) / 3);
}

export function calculateReinforcements(
  playerIndex: number,
  countries: Country[],
  continents: Continent[]
): number {
  // Continent bonus
  let contValue = 0;
  for (const cont of continents) {
    const contCountries = countries.filter(c => cont.countryIds.includes(c.id));
    const allOwned = contCountries.length > 0 && contCountries.every(c => c.ownerIndex === playerIndex);
    if (allOwned) {
      contValue += cont.value;
    }
  }

  // Country count bonus
  const numOwned = countries.filter(c => c.ownerIndex === playerIndex).length;
  if (numOwned > 9) {
    return Math.floor(numOwned / 3) + contValue;
  }
  return 3 + contValue;
}
