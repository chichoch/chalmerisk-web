import { useGameStore } from '../../store/gameStore';

export function GameOverDialog() {
  const winner = useGameStore((s) => s.winner);
  const playAgain = useGameStore((s) => s.playAgain);

  if (!winner) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: '#222',
          color: '#fff',
          padding: 40,
          borderRadius: 10,
          textAlign: 'center',
          minWidth: 300,
        }}
      >
        <h2>Game Over!</h2>
        <p style={{ fontSize: 24, color: winner.color }}>
          The winner is: {winner.name}!
        </p>
        <button
          onClick={playAgain}
          style={{
            marginTop: 20,
            padding: '10px 30px',
            fontSize: 18,
            cursor: 'pointer',
          }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
