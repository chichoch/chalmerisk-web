import { BattleOutcome } from '../types';
import type { BattleResult } from '../types';

export function rollDice(): number {
  return Math.floor(Math.random() * 6) + 1;
}

function getDiceCounts(
  attackingTroops: number,
  defendingTroops: number,
): { attDice: number; defDice: number } {
  let attDice: number;
  let defDice: number;

  if (defendingTroops === 1) {
    if (attackingTroops > 3) {
      attDice = 3;
      defDice = 1;
    } else if (attackingTroops === 3) {
      attDice = 2;
      defDice = 1;
    } else {
      attDice = 1;
      defDice = 1;
    }
  } else {
    // defendingTroops >= 2
    if (attackingTroops > 3) {
      attDice = 3;
      defDice = 2;
    } else if (attackingTroops === 3) {
      attDice = 2;
      defDice = 2;
    } else {
      attDice = 1;
      defDice = 2;
    }
  }

  return { attDice, defDice };
}

export function resolveBattle(
  attackingTroops: number,
  defendingTroops: number,
): BattleResult {
  const { attDice, defDice } = getDiceCounts(attackingTroops, defendingTroops);

  // Roll all dice
  const attackerDice: number[] = [];
  for (let i = 0; i < 3; i++) {
    attackerDice.push(rollDice());
  }
  const defenderDice: number[] = [];
  for (let i = 0; i < 2; i++) {
    defenderDice.push(rollDice());
  }

  const outcome = battle(attDice, defDice, attackerDice, defenderDice);

  return {
    attackerDice,
    defenderDice,
    outcome,
    attackerDiceCount: attDice,
    defenderDiceCount: defDice,
  };
}

function battle(
  attNumberOfDice: number,
  defNumberOfDice: number,
  attDiceValues: number[],
  defDiceValues: number[],
): BattleOutcome {
  const [a1, a2, a3] = attDiceValues;
  const [d1, d2] = defDiceValues;

  // Cases with only 1 defender die
  if (defNumberOfDice === 1) {
    let attMax: number;
    if (attNumberOfDice === 3) {
      attMax = Math.max(a1, a2, a3);
    } else if (attNumberOfDice === 2) {
      attMax = Math.max(a1, a2);
    } else {
      attMax = a1;
    }
    return attMax > d1
      ? BattleOutcome.DEFENDER_KILLED_1
      : BattleOutcome.ATTACKER_KILLED_1;
  }

  // Cases with 2 defender dice
  if (attNumberOfDice === 1) {
    const defMax = Math.max(d1, d2);
    return a1 > defMax
      ? BattleOutcome.DEFENDER_KILLED_1
      : BattleOutcome.ATTACKER_KILLED_1;
  }

  // 2 or 3 attacker dice vs 2 defender dice — compare top two
  let attSorted: number[];
  if (attNumberOfDice === 3) {
    attSorted = [a1, a2, a3].sort((x, y) => y - x);
  } else {
    attSorted = [a1, a2].sort((x, y) => y - x);
  }
  const defSorted = [d1, d2].sort((x, y) => y - x);

  const attWinsHigh = attSorted[0] > defSorted[0];
  const attWinsLow = attSorted[1] > defSorted[1];

  if (attWinsHigh && attWinsLow) return BattleOutcome.DEFENDER_KILLED_2;
  if (!attWinsHigh && !attWinsLow) return BattleOutcome.ATTACKER_KILLED_2;
  return BattleOutcome.ONE_EACH;
}
