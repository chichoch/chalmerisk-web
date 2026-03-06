import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { PlayerColor } from '../../types';
import type { PlayerConfig } from '../../types';

const COLORS: PlayerColor[] = [
  PlayerColor.RED,
  PlayerColor.GREEN,
  PlayerColor.YELLOW,
  PlayerColor.BLUE,
];
const COLOR_CSS: Record<PlayerColor, string> = {
  [PlayerColor.RED]: '#ff0000',
  [PlayerColor.GREEN]: '#00ff00',
  [PlayerColor.YELLOW]: '#ffff00',
  [PlayerColor.BLUE]: '#0000ff',
};

export function MenuView() {
  const startGame = useGameStore((s) => s.startGame);
  const setScreen = useGameStore((s) => s.setScreen);
  const [showOptions, setShowOptions] = useState(false);
  const [numPlayers, setNumPlayers] = useState(2);
  const [names, setNames] = useState(['', '', '', '']);
  const [mapName] = useState('testmap');

  const handleStart = async () => {
    const configs: PlayerConfig[] = [];
    for (let i = 0; i < numPlayers; i++) {
      if (names[i].trim()) {
        configs.push({ name: names[i].trim(), color: COLORS[i] });
      }
    }
    if (configs.length < 2) {
      alert('At least Player 1 and Player 2 must have names!');
      return;
    }
    await startGame(configs, mapName);
  };

  const setName = (index: number, value: string) => {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  if (!showOptions) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#000',
        }}
      >
        <div style={{ display: 'flex', gap: 20, alignItems: 'center' }}>
          <img
            src="/resources/startHorse.jpg"
            alt=""
            style={{ maxHeight: 500 }}
          />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <img src="/resources/ChalmeRiskHeading.gif" alt="ChalmeRisk" />
            <button
              onClick={() => setShowOptions(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <img src="/resources/startGame.gif" alt="Start Game" />
            </button>
            <button
              onClick={() => setScreen('tutorial')}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <img src="/resources/tutorial.gif" alt="Tutorial" />
            </button>
          </div>
          <img
            src="/resources/startInf.jpg"
            alt=""
            style={{ maxHeight: 500 }}
          />
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff',
        gap: 15,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <label>How many players?</label>
        <select
          value={numPlayers}
          onChange={(e) => setNumPlayers(Number(e.target.value))}
          style={{ padding: '4px 8px' }}
        >
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </div>

      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <label style={{ color: COLOR_CSS[COLORS[i]], width: 180 }}>
            Name of player {i + 1}:
          </label>
          <input
            type="text"
            value={names[i]}
            onChange={(e) => setName(i, e.target.value)}
            disabled={i >= numPlayers}
            style={{ padding: '4px 8px', width: 240 }}
          />
        </div>
      ))}

      <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
        <button
          onClick={() => setShowOptions(false)}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <img src="/resources/backButton.gif" alt="Back" />
        </button>
        <button
          onClick={handleStart}
          style={{ background: 'none', border: 'none', cursor: 'pointer' }}
        >
          <img src="/resources/startButton.gif" alt="Start" />
        </button>
      </div>
    </div>
  );
}
