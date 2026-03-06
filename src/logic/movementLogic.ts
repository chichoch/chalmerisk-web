import type { Country } from '../types';

export function doMovement(
  count: number,
  fromCountry: Country,
  toCountry: Country
): { from: Country; to: Country } {
  return {
    from: { ...fromCountry, troops: fromCountry.troops - count },
    to: { ...toCountry, troops: toCountry.troops + count },
  };
}
