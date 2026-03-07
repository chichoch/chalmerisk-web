import { useState, useEffect } from 'react';
import { useGameStore } from '../../store/gameStore';

export function MovementDialog() {
  const movementState = useGameStore((s) => s.movementState);
  const countries = useGameStore((s) => s.countries);
  const moveTroops = useGameStore((s) => s.moveTroops);
  const cancelMovement = useGameStore((s) => s.cancelMovement);
  const [sliderValue, setSliderValue] = useState(1);

  const fromCountry = countries.find(
    (c) => c.id === movementState.selectedFrom,
  );

  const maxMove = fromCountry ? fromCountry.troops - 1 : 1;

  useEffect(() => {
    setSliderValue(1);
  }, [movementState.isDialogOpen]);

  if (!movementState.isDialogOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 500,
      }}
    >
      <div
        style={{
          background: '#ddd',
          border: '2px solid #000',
          padding: 20,
          maxWidth: 320,
          width: '90vw',
        }}
      >
        <div
          style={{ marginBottom: 10, textAlign: 'center', fontWeight: 'bold' }}
        >
          Move Troops ({sliderValue})
        </div>
        <input
          type="range"
          min={1}
          max={maxMove}
          value={sliderValue}
          onChange={(e) => setSliderValue(Number(e.target.value))}
          style={{ width: '100%' }}
        />
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: 12,
            marginBottom: 10,
          }}
        >
          <span>1</span>
          <span>{maxMove}</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => moveTroops(sliderValue)}
            style={{ flex: 1, padding: '8px', cursor: 'pointer' }}
          >
            Move troops!
          </button>
          <button
            onClick={cancelMovement}
            style={{ flex: 1, padding: '8px', cursor: 'pointer' }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
