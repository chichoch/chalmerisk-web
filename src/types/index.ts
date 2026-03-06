export const TurnPhase = {
  REINFORCEMENT: 0,
  ATTACK: 1,
  MOVEMENT: 2,
} as const;
export type TurnPhase = (typeof TurnPhase)[keyof typeof TurnPhase];

export const BattleOutcome = {
  DEFENDER_KILLED_1: 1,
  ATTACKER_KILLED_1: 2,
  DEFENDER_KILLED_2: 3,
  ATTACKER_KILLED_2: 4,
  ONE_EACH: 5,
} as const;
export type BattleOutcome = (typeof BattleOutcome)[keyof typeof BattleOutcome];

export const MessageType = {
  INFO: 'info',
  WARNING: 'warning',
  SUCCESS: 'success',
} as const;
export type MessageType = (typeof MessageType)[keyof typeof MessageType];

export const PlayerColor = {
  RED: 'red',
  GREEN: 'green',
  YELLOW: 'yellow',
  BLUE: 'blue',
} as const;
export type PlayerColor = (typeof PlayerColor)[keyof typeof PlayerColor];

export type TroopType = 'infantry' | 'knight' | 'cannon';

export function getTroopType(troops: number): TroopType {
  if (troops < 5) return 'infantry';
  if (troops < 10) return 'knight';
  return 'cannon';
}

export interface Country {
  id: number;
  name: string;
  x: number;
  y: number;
  troops: number;
  neighbours: number[];
  ownerIndex: number;
  continentName: string;
  isSelected: boolean;
}

export interface Continent {
  name: string;
  value: number;
  countryIds: number[];
}

export interface Player {
  name: string;
  color: PlayerColor;
  reinforcements: number;
}

export interface MapData {
  countries: Country[];
  continents: Continent[];
  backgroundImage: string;
}

export interface BattleResult {
  attackerDice: number[];
  defenderDice: number[];
  outcome: BattleOutcome;
  attackerDiceCount: number;
  defenderDiceCount: number;
}

export interface PlayerConfig {
  name: string;
  color: PlayerColor;
}

export interface GameMessage {
  text: string;
  type: MessageType;
}
