import type { Country } from '../types';

export function randomizeCountries(
  numPlayers: number,
  countries: Country[],
): Country[] {
  // Shuffle using Fisher-Yates
  const shuffled = [...countries];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Assign players round-robin starting from a random player
  let playerIndex = Math.floor(Math.random() * numPlayers);
  return shuffled.map((country) => {
    const assigned = { ...country, ownerIndex: playerIndex };
    playerIndex = (playerIndex + 1) % numPlayers;
    return assigned;
  });
}
