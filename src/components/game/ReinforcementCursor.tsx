import { useEffect, useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useMousePosition } from '../../hooks/useMousePosition';
import { TurnPhase } from '../../types';
import { getIconPath } from '../../utils/iconResolver';

const MOBILE_BREAKPOINT = 768;

function isMobileViewport() {
  return window.innerWidth < MOBILE_BREAKPOINT;
}

export function ReinforcementCursor() {
  const turnPhase = useGameStore((s) => s.turnPhase);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const players = useGameStore((s) => s.players);
  const { x, y } = useMousePosition();
  const [isMobile, setIsMobile] = useState(isMobileViewport);

  useEffect(() => {
    function handleResize() {
      setIsMobile(isMobileViewport());
    }

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
        left: isMobile ? 'auto' : x + 10,
        right: isMobile ? 12 : 'auto',
        top: isMobile ? 0 : y - 50,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: 0,
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
