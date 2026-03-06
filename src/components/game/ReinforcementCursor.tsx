import { useGameStore } from '../../store/gameStore';
import { useMousePosition } from '../../hooks/useMousePosition';
import { TurnPhase } from '../../types';
import { getIconPath } from '../../utils/iconResolver';

export function ReinforcementCursor() {
  const turnPhase = useGameStore((s) => s.turnPhase);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const players = useGameStore((s) => s.players);
  const { x, y } = useMousePosition();

  const player = players[currentPlayerIndex];
  if (!player) return null;

  if (turnPhase !== TurnPhase.REINFORCEMENT || player.reinforcements <= 0) {
    return null;
  }

  const iconPath = getIconPath(player.color, 1, false);

  return (
    <div
      style={{
        position: 'fixed',
        left: x + 10,
        top: y - 50,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        zIndex: 100,
      }}
    >
      <img src={iconPath} alt="" />
      <span
        style={{
          color: '#fff',
          fontSize: 12,
          fontWeight: 'bold',
          textShadow: '1px 1px 2px #000',
        }}
      >
        {player.reinforcements}
      </span>
    </div>
  );
}
