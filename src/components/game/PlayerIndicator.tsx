import { useGameStore } from '../../store/gameStore';

export function PlayerIndicator() {
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const players = useGameStore(s => s.players);

  const player = players[currentPlayerIndex];
  if (!player) return null;

  return (
    <div style={{
      color: player.color,
      fontSize: 18,
      fontWeight: 'bold',
      fontFamily: '"Courier New", monospace',
      width: 200,
    }}>
      {player.name}'s turn
    </div>
  );
}
