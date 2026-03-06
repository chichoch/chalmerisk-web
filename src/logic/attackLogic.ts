import { BattleOutcome } from '../types';
import type { Country } from '../types';

export interface ValidationResult {
  valid: boolean;
  message?: string;
}

export function validateAttacker(
  countryId: number,
  currentPlayerIndex: number,
  countries: Country[],
): ValidationResult {
  const country = countries.find((c) => c.id === countryId);
  if (!country) return { valid: false, message: 'Country not found' };
  if (country.ownerIndex !== currentPlayerIndex) {
    return {
      valid: false,
      message: 'You have to attack from one of your own countries!',
    };
  }
  if (country.troops <= 1) {
    return {
      valid: false,
      message: 'You have too few troops to attack from this country!',
    };
  }
  return { valid: true };
}

export function validateDefender(
  attackerCountry: Country,
  defenderCountryId: number,
  countries: Country[],
): ValidationResult {
  const defender = countries.find((c) => c.id === defenderCountryId);
  if (!defender) return { valid: false, message: 'Country not found' };
  if (defender.ownerIndex === attackerCountry.ownerIndex) {
    return { valid: false, message: "You can't attack your own country!" };
  }
  if (!attackerCountry.neighbours.includes(defenderCountryId)) {
    return {
      valid: false,
      message: 'You have to attack a neighbouring country!',
    };
  }
  return { valid: true };
}

export function applyBattleOutcome(
  outcome: BattleOutcome,
  attacker: Country,
  defender: Country,
): { attacker: Country; defender: Country } {
  let attTroops = attacker.troops;
  let defTroops = defender.troops;

  switch (outcome) {
    case BattleOutcome.DEFENDER_KILLED_1:
      defTroops -= 1;
      break;
    case BattleOutcome.ATTACKER_KILLED_1:
      attTroops -= 1;
      break;
    case BattleOutcome.DEFENDER_KILLED_2:
      defTroops -= 2;
      break;
    case BattleOutcome.ATTACKER_KILLED_2:
      attTroops -= 2;
      break;
    case BattleOutcome.ONE_EACH:
      attTroops -= 1;
      defTroops -= 1;
      break;
  }

  return {
    attacker: { ...attacker, troops: attTroops },
    defender: { ...defender, troops: defTroops },
  };
}

export function applyTakeover(
  attacker: Country,
  defender: Country,
): { attacker: Country; defender: Country } {
  return {
    attacker: { ...attacker, troops: attacker.troops - 1 },
    defender: { ...defender, troops: 1, ownerIndex: attacker.ownerIndex },
  };
}
