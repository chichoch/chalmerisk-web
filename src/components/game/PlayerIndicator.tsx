import { useGameStore } from '../../store/gameStore';

export function PlayerIndicator() {
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const players = useGameStore((s) => s.players);

  const player = players[currentPlayerIndex];
  if (!player) return null;

  return (
    <div
      style={{
        color: player.color,
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: '"Courier New", monospace',
        width: '100%',
        maxWidth: 200,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {player.name}'s turn
    </div>
  );
}
