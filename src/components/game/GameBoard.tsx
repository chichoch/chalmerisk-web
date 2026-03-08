import { useGameStore } from '../../store/gameStore';
import { useMapScale } from '../../hooks/useMapScale';
import { CountryView } from './CountryView';
import { InfoBar } from './InfoBar';
import { PlayerIndicator } from './PlayerIndicator';
import { PhaseIndicator } from './PhaseIndicator';
import { NextStepButton } from './NextStepButton';
import { ReinforcementCursor } from './ReinforcementCursor';
import { AttackDialog } from '../dialogs/AttackDialog';
import { MovementDialog } from '../dialogs/MovementDialog';
import { GameOverDialog } from '../dialogs/GameOverDialog';

const MAP_WIDTH = 1360;
const MAP_HEIGHT = 650;

export function GameBoard() {
  const countries = useGameStore((s) => s.countries);
  const mapBackgroundImage = useGameStore((s) => s.mapBackgroundImage);
  const { scale, shouldCenterMap } = useMapScale();

  return (
    <div
      style={{
        background: '#000',
        height: '100dvh',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        touchAction: 'manipulation',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '5px 0',
          flex: '0 0 auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: MAP_WIDTH,
            display: 'grid',
            gridTemplateColumns: '1fr auto 1fr',
            alignItems: 'center',
            padding: '0 8px',
            boxSizing: 'border-box',
          }}
        >
          <PlayerIndicator />
          <PhaseIndicator />
          <div />
        </div>
      </div>

      <div
        style={{
          width: '100%',
          flex: '0 0 auto',
          overflowX: 'auto',
          overflowY: 'hidden',
          WebkitOverflowScrolling: 'touch',
          display: 'flex',
          justifyContent: shouldCenterMap ? 'center' : 'flex-start',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: MAP_WIDTH * scale,
            height: MAP_HEIGHT * scale,
            flex: '0 0 auto',
          }}
        >
          <div
            style={{
              position: 'relative',
              width: MAP_WIDTH,
              height: MAP_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: 'top left',
            }}
          >
            <img
              src={`/${mapBackgroundImage}`}
              alt="Map"
              style={{
                position: 'absolute',
                width: MAP_WIDTH,
                height: MAP_HEIGHT,
              }}
              draggable={false}
            />
            {countries.map((country) => (
              <CountryView key={country.id} countryId={country.id} />
            ))}
          </div>
        </div>
      </div>

      <div
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          padding: '8px 0',
          flex: '0 0 auto',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: '0 8px',
            boxSizing: 'border-box',
          }}
        >
          <InfoBar />
          <NextStepButton />
        </div>
      </div>

      <ReinforcementCursor />
      <AttackDialog />
      <MovementDialog />
      <GameOverDialog />
    </div>
  );
}
