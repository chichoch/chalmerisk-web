import { create } from 'zustand';
import { TurnPhase, MessageType, BattleOutcome } from '../types';
import type {
  Country,
  Continent,
  Player,
  PlayerConfig,
  GameMessage,
} from '../types';
import { parseMap } from '../logic/mapParser';
import { randomizeCountries } from '../logic/countryRandomizer';
import {
  calculateFirstRoundReinforcements,
  calculateReinforcements,
} from '../logic/reinforcementLogic';
import { resolveBattle } from '../logic/diceLogic';
import {
  validateAttacker,
  validateDefender,
  applyBattleOutcome,
  applyTakeover,
} from '../logic/attackLogic';
import { doMovement } from '../logic/movementLogic';

interface AttackState {
  selectedAttacker: number | null;
  selectedDefender: number | null;
  isDialogOpen: boolean;
  statusText: string;
  result: 'fighting' | 'attacker_won' | 'defender_won' | null;
  takeOverCountry: boolean;
  attackerDice: number[];
  defenderDice: number[];
  attackerDiceCount: number;
  defenderDiceCount: number;
}

interface MovementState {
  selectedFrom: number | null;
  selectedTo: number | null;
  isDialogOpen: boolean;
  movementUsedThisTurn: boolean;
}

interface GameState {
  screen: 'menu' | 'game' | 'tutorial';
  countries: Country[];
  continents: Continent[];
  mapBackgroundImage: string;
  players: Player[];
  currentPlayerIndex: number;
  turnPhase: TurnPhase;
  isFirstRound: boolean;
  firstRoundCount: number;
  attackState: AttackState;
  movementState: MovementState;
  message: GameMessage | null;
  winner: Player | null;

  setScreen: (screen: 'menu' | 'game' | 'tutorial') => void;
  startGame: (playerConfigs: PlayerConfig[], mapName: string) => Promise<void>;
  clickCountry: (countryId: number) => void;
  nextStep: () => void;
  fight: () => void;
  endFight: () => void;
  moveTroops: (count: number) => void;
  cancelMovement: () => void;
  playAgain: () => void;
}

function getCountry(countries: Country[], id: number): Country | undefined {
  return countries.find((c) => c.id === id);
}

function updateCountry(countries: Country[], updated: Country): Country[] {
  return countries.map((c) => (c.id === updated.id ? updated : c));
}

function getActivePlayers(players: Player[], countries: Country[]): number[] {
  const active: number[] = [];
  for (let i = 0; i < players.length; i++) {
    if (countries.some((c) => c.ownerIndex === i)) {
      active.push(i);
    }
  }
  return active;
}

function getNextActivePlayer(
  currentIndex: number,
  players: Player[],
  countries: Country[],
): number {
  const active = getActivePlayers(players, countries);
  if (active.length === 0) return currentIndex;
  let next = currentIndex + 1;
  if (next >= players.length) next = 0;
  while (!active.includes(next)) {
    next = (next + 1) % players.length;
  }
  return next;
}

const initialAttackState: AttackState = {
  selectedAttacker: null,
  selectedDefender: null,
  isDialogOpen: false,
  statusText: '',
  result: null,
  takeOverCountry: false,
  attackerDice: [],
  defenderDice: [],
  attackerDiceCount: 0,
  defenderDiceCount: 0,
};

const initialMovementState: MovementState = {
  selectedFrom: null,
  selectedTo: null,
  isDialogOpen: false,
  movementUsedThisTurn: false,
};

export const useGameStore = create<GameState>((set, get) => ({
  screen: 'menu',
  countries: [],
  continents: [],
  mapBackgroundImage: '',
  players: [],
  currentPlayerIndex: 0,
  turnPhase: TurnPhase.REINFORCEMENT,
  isFirstRound: true,
  firstRoundCount: 0,
  attackState: { ...initialAttackState },
  movementState: { ...initialMovementState },
  message: null,
  winner: null,

  setScreen: (screen) => set({ screen }),

  startGame: async (playerConfigs, mapName) => {
    const mapData = await parseMap(`/maps/${mapName}.txt`);
    const players: Player[] = playerConfigs.map((pc) => ({
      name: pc.name,
      color: pc.color,
      reinforcements: 0,
    }));

    const assignedCountries = randomizeCountries(
      players.length,
      mapData.countries,
    );
    const reinforcements = calculateFirstRoundReinforcements(players.length);
    const playersWithReinforcements = players.map((p) => ({
      ...p,
      reinforcements,
    }));

    set({
      screen: 'game',
      countries: assignedCountries,
      continents: mapData.continents,
      mapBackgroundImage: mapData.backgroundImage,
      players: playersWithReinforcements,
      currentPlayerIndex: 0,
      turnPhase: TurnPhase.REINFORCEMENT,
      isFirstRound: true,
      firstRoundCount: 0,
      attackState: { ...initialAttackState },
      movementState: { ...initialMovementState },
      message: {
        text: 'Welcome to ChalmeRisk! You are now in the reinforcement state, place your reinforcements.',
        type: MessageType.INFO,
      },
      winner: null,
    });
  },

  clickCountry: (countryId) => {
    const state = get();
    if (state.winner) return;

    if (state.turnPhase === TurnPhase.REINFORCEMENT) {
      handleReinforcementClick(countryId, state, set);
    } else if (state.turnPhase === TurnPhase.ATTACK) {
      handleAttackClick(countryId, state, set);
    } else if (state.turnPhase === TurnPhase.MOVEMENT) {
      handleMovementClick(countryId, state, set);
    }
  },

  nextStep: () => {
    const state = get();
    if (state.winner) return;

    if (state.isFirstRound) {
      // First round: just reinforcement, then next player
      const nextPlayer = getNextActivePlayer(
        state.currentPlayerIndex,
        state.players,
        state.countries,
      );
      const newCount = state.firstRoundCount + 1;
      const totalFirstRounds = state.players.length * 3;
      const endingFirstRound = newCount >= totalFirstRounds;

      if (endingFirstRound) {
        // Transition to normal rounds
        const reinforcements = calculateReinforcements(
          nextPlayer,
          state.countries,
          state.continents,
        );
        const updatedPlayers = state.players.map((p, i) =>
          i === nextPlayer ? { ...p, reinforcements } : p,
        );
        set({
          currentPlayerIndex: nextPlayer,
          isFirstRound: false,
          firstRoundCount: newCount,
          turnPhase: TurnPhase.REINFORCEMENT,
          players: updatedPlayers,
          attackState: { ...initialAttackState },
          movementState: { ...initialMovementState },
          message: {
            text: 'You are now in the reinforcement state, place your reinforcements.',
            type: MessageType.INFO,
          },
        });
      } else {
        // Still in first rounds
        const firstRoundReinforcements = calculateFirstRoundReinforcements(
          state.players.length,
        );
        const updatedPlayers = state.players.map((p, i) =>
          i === nextPlayer
            ? { ...p, reinforcements: firstRoundReinforcements }
            : p,
        );
        set({
          currentPlayerIndex: nextPlayer,
          firstRoundCount: newCount,
          players: updatedPlayers,
          message: {
            text: 'You are now in the reinforcement state, place your reinforcements.',
            type: MessageType.INFO,
          },
        });
      }
    } else {
      // Normal turn progression
      if (state.turnPhase === TurnPhase.REINFORCEMENT) {
        set({
          turnPhase: TurnPhase.ATTACK,
          attackState: { ...initialAttackState },
          message: {
            text: 'You are now in the attack state.',
            type: MessageType.INFO,
          },
        });
      } else if (state.turnPhase === TurnPhase.ATTACK) {
        // Check game over
        const active = getActivePlayers(state.players, state.countries);
        if (active.length === 1) {
          set({ winner: state.players[active[0]] });
          return;
        }
        set({
          turnPhase: TurnPhase.MOVEMENT,
          movementState: { ...initialMovementState },
          message: {
            text: 'You are now in the troop movement state.',
            type: MessageType.INFO,
          },
        });
      } else if (state.turnPhase === TurnPhase.MOVEMENT) {
        // End turn, next player
        const nextPlayer = getNextActivePlayer(
          state.currentPlayerIndex,
          state.players,
          state.countries,
        );
        const reinforcements = calculateReinforcements(
          nextPlayer,
          state.countries,
          state.continents,
        );
        const updatedPlayers = state.players.map((p, i) =>
          i === nextPlayer ? { ...p, reinforcements } : p,
        );
        set({
          currentPlayerIndex: nextPlayer,
          turnPhase: TurnPhase.REINFORCEMENT,
          players: updatedPlayers,
          attackState: { ...initialAttackState },
          movementState: { ...initialMovementState },
          message: {
            text: 'You are now in the reinforcement state, place your reinforcements.',
            type: MessageType.INFO,
          },
        });
      }
    }
  },

  fight: () => {
    const state = get();
    const { attackState, countries } = state;
    if (
      attackState.selectedAttacker === null ||
      attackState.selectedDefender === null
    )
      return;

    const attacker = getCountry(countries, attackState.selectedAttacker)!;
    const defender = getCountry(countries, attackState.selectedDefender)!;

    const battleResult = resolveBattle(attacker.troops, defender.troops);
    const { attacker: newAtt, defender: newDef } = applyBattleOutcome(
      battleResult.outcome,
      attacker,
      defender,
    );

    let statusText = '';
    switch (battleResult.outcome) {
      case BattleOutcome.DEFENDER_KILLED_1:
        statusText = 'Attacker killed 1';
        break;
      case BattleOutcome.ATTACKER_KILLED_1:
        statusText = 'Defender killed 1';
        break;
      case BattleOutcome.DEFENDER_KILLED_2:
        statusText = 'Attacker killed 2';
        break;
      case BattleOutcome.ATTACKER_KILLED_2:
        statusText = 'Defender killed 2';
        break;
      case BattleOutcome.ONE_EACH:
        statusText = '1 of each killed';
        break;
    }

    let result: 'fighting' | 'attacker_won' | 'defender_won' = 'fighting';
    let takeOverCountry = false;

    if (newAtt.troops === 1) {
      result = 'defender_won';
    }
    if (newDef.troops <= 0) {
      result = 'attacker_won';
      takeOverCountry = true;
    }

    let updatedCountries = updateCountry(countries, newAtt);
    updatedCountries = updateCountry(updatedCountries, newDef);

    set({
      countries: updatedCountries,
      attackState: {
        ...attackState,
        statusText,
        result,
        takeOverCountry,
        attackerDice: battleResult.attackerDice,
        defenderDice: battleResult.defenderDice,
        attackerDiceCount: battleResult.attackerDiceCount,
        defenderDiceCount: battleResult.defenderDiceCount,
      },
    });
  },

  endFight: () => {
    const state = get();
    const { attackState, countries } = state;
    if (
      attackState.selectedAttacker === null ||
      attackState.selectedDefender === null
    )
      return;

    if (attackState.takeOverCountry) {
      const attacker = getCountry(countries, attackState.selectedAttacker)!;
      const defender = getCountry(countries, attackState.selectedDefender)!;
      const { attacker: newAtt, defender: newDef } = applyTakeover(
        attacker,
        defender,
      );

      let updatedCountries = updateCountry(countries, newAtt);
      updatedCountries = updateCountry(updatedCountries, newDef);

      // Check game over after takeover
      const active = getActivePlayers(state.players, updatedCountries);
      if (active.length === 1) {
        set({
          countries: updatedCountries,
          attackState: { ...initialAttackState },
          winner: state.players[active[0]],
        });
        return;
      }

      // Open movement dialog for post-conquest movement
      set({
        countries: updatedCountries,
        attackState: { ...initialAttackState },
        movementState: {
          ...state.movementState,
          selectedFrom: attackState.selectedAttacker,
          selectedTo: attackState.selectedDefender,
          isDialogOpen: newAtt.troops > 2, // only if there are troops to move (after -1 for takeover, need > 1 left = original > 2)
        },
      });
    } else {
      // Just close dialog (retreat / flee)
      set({
        attackState: { ...initialAttackState },
      });
    }
  },

  moveTroops: (count) => {
    const state = get();
    const { movementState, countries } = state;
    if (
      movementState.selectedFrom === null ||
      movementState.selectedTo === null
    )
      return;

    const from = getCountry(countries, movementState.selectedFrom)!;
    const to = getCountry(countries, movementState.selectedTo)!;
    const { from: newFrom, to: newTo } = doMovement(count, from, to);

    let updatedCountries = updateCountry(countries, newFrom);
    updatedCountries = updateCountry(updatedCountries, newTo);

    set({
      countries: updatedCountries,
      movementState: {
        selectedFrom: null,
        selectedTo: null,
        isDialogOpen: false,
        movementUsedThisTurn:
          state.turnPhase === TurnPhase.MOVEMENT
            ? true
            : state.movementState.movementUsedThisTurn,
      },
    });
  },

  cancelMovement: () => {
    set({
      movementState: {
        ...get().movementState,
        selectedFrom: null,
        selectedTo: null,
        isDialogOpen: false,
      },
    });
  },

  playAgain: () => {
    set({
      screen: 'menu',
      countries: [],
      continents: [],
      mapBackgroundImage: '',
      players: [],
      currentPlayerIndex: 0,
      turnPhase: TurnPhase.REINFORCEMENT,
      isFirstRound: true,
      firstRoundCount: 0,
      attackState: { ...initialAttackState },
      movementState: { ...initialMovementState },
      message: null,
      winner: null,
    });
  },
}));

function handleReinforcementClick(
  countryId: number,
  state: GameState,
  set: (partial: Partial<GameState>) => void,
) {
  const country = getCountry(state.countries, countryId);
  if (!country) return;

  if (country.ownerIndex !== state.currentPlayerIndex) {
    set({
      message: {
        text: 'You can only place reinforcements in your countries',
        type: MessageType.WARNING,
      },
    });
    return;
  }

  const currentPlayer = state.players[state.currentPlayerIndex];
  if (currentPlayer.reinforcements <= 0) {
    set({
      message: {
        text: "You don't have any more reinforcements",
        type: MessageType.WARNING,
      },
    });
    return;
  }

  const updatedCountry = { ...country, troops: country.troops + 1 };
  const updatedCountries = updateCountry(state.countries, updatedCountry);
  const updatedPlayers = state.players.map((p, i) =>
    i === state.currentPlayerIndex
      ? { ...p, reinforcements: p.reinforcements - 1 }
      : p,
  );

  set({
    countries: updatedCountries,
    players: updatedPlayers,
    message: {
      text: 'You have placed one reinforcement in the selected country',
      type: MessageType.SUCCESS,
    },
  });
}

function handleAttackClick(
  countryId: number,
  state: GameState,
  set: (partial: Partial<GameState>) => void,
) {
  const { attackState, countries, currentPlayerIndex } = state;

  if (attackState.selectedAttacker === null) {
    // First click: select attacker
    const validation = validateAttacker(
      countryId,
      currentPlayerIndex,
      countries,
    );
    if (!validation.valid) {
      set({
        message: { text: validation.message!, type: MessageType.WARNING },
      });
      return;
    }

    const updatedCountries = countries.map((c) =>
      c.id === countryId ? { ...c, isSelected: true } : c,
    );

    set({
      countries: updatedCountries,
      attackState: { ...attackState, selectedAttacker: countryId },
      message: {
        text: 'You have selected the country to attack from',
        type: MessageType.SUCCESS,
      },
    });
  } else {
    // Second click: select defender
    const attacker = getCountry(countries, attackState.selectedAttacker)!;
    const validation = validateDefender(attacker, countryId, countries);

    if (!validation.valid) {
      // Deselect attacker if clicking own country
      const defender = getCountry(countries, countryId);
      if (defender && defender.ownerIndex === attacker.ownerIndex) {
        const updatedCountries = countries.map((c) =>
          c.id === attackState.selectedAttacker
            ? { ...c, isSelected: false }
            : c,
        );
        set({
          countries: updatedCountries,
          attackState: { ...initialAttackState },
          message: { text: validation.message!, type: MessageType.WARNING },
        });
      } else {
        set({
          message: { text: validation.message!, type: MessageType.WARNING },
        });
      }
      return;
    }

    // Valid defender — open attack dialog
    const updatedCountries = countries.map((c) =>
      c.id === attackState.selectedAttacker ? { ...c, isSelected: false } : c,
    );

    set({
      countries: updatedCountries,
      attackState: {
        ...initialAttackState,
        selectedAttacker: attackState.selectedAttacker,
        selectedDefender: countryId,
        isDialogOpen: true,
        result: 'fighting',
      },
    });
  }
}

function handleMovementClick(
  countryId: number,
  state: GameState,
  set: (partial: Partial<GameState>) => void,
) {
  const { movementState, countries, currentPlayerIndex } = state;

  if (movementState.selectedFrom === null) {
    const country = getCountry(countries, countryId);
    if (!country) return;

    if (country.ownerIndex !== currentPlayerIndex) {
      set({
        message: {
          text: 'You can only move troops from your own country',
          type: MessageType.WARNING,
        },
      });
      return;
    }
    if (country.troops <= 1) {
      set({
        message: {
          text: 'There are not enough troops for a troop movement',
          type: MessageType.WARNING,
        },
      });
      return;
    }

    const updatedCountries = countries.map((c) =>
      c.id === countryId ? { ...c, isSelected: true } : c,
    );

    set({
      countries: updatedCountries,
      movementState: { ...movementState, selectedFrom: countryId },
      message: {
        text: 'You have marked the country to move troops from',
        type: MessageType.SUCCESS,
      },
    });
  } else {
    const fromCountry = getCountry(countries, movementState.selectedFrom)!;
    const toCountry = getCountry(countries, countryId);
    if (!toCountry) return;

    if (toCountry.ownerIndex !== fromCountry.ownerIndex) {
      const updatedCountries = countries.map((c) =>
        c.id === movementState.selectedFrom ? { ...c, isSelected: false } : c,
      );
      set({
        countries: updatedCountries,
        movementState: { ...movementState, selectedFrom: null },
        message: {
          text: 'You can only move troops between your own countries',
          type: MessageType.WARNING,
        },
      });
      return;
    }

    if (!fromCountry.neighbours.includes(countryId)) {
      set({
        message: {
          text: 'You can only move troops to a neighbouring country',
          type: MessageType.WARNING,
        },
      });
      return;
    }

    if (movementState.movementUsedThisTurn) {
      set({
        message: {
          text: 'You can only move troops once every turn',
          type: MessageType.WARNING,
        },
      });
      const updatedCountries = countries.map((c) =>
        c.id === movementState.selectedFrom ? { ...c, isSelected: false } : c,
      );
      set({
        countries: updatedCountries,
        movementState: { ...movementState, selectedFrom: null },
      });
      return;
    }

    // Deselect and open movement dialog
    const updatedCountries = countries.map((c) =>
      c.id === movementState.selectedFrom ? { ...c, isSelected: false } : c,
    );

    set({
      countries: updatedCountries,
      movementState: {
        ...movementState,
        selectedFrom: movementState.selectedFrom,
        selectedTo: countryId,
        isDialogOpen: true,
      },
    });
  }
}
