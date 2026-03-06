import { useGameStore } from '../../store/gameStore';
import { TurnPhase } from '../../types';

export function NextStepButton() {
  const nextStep = useGameStore(s => s.nextStep);
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const players = useGameStore(s => s.players);
  const turnPhase = useGameStore(s => s.turnPhase);
  const isFirstRound = useGameStore(s => s.isFirstRound);
  const winner = useGameStore(s => s.winner);

  const player = players[currentPlayerIndex];
  if (!player || winner) return null;

  const disabled =
    turnPhase === TurnPhase.REINFORCEMENT && player.reinforcements > 0;

  // During first rounds, only reinforcement phase exists
  const label = isFirstRound
    ? 'Next Player'
    : turnPhase === TurnPhase.MOVEMENT
    ? 'End Turn'
    : 'Next Step';

  return (
    <button
      onClick={nextStep}
      disabled={disabled}
      style={{
        padding: '8px 20px',
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  );
}
