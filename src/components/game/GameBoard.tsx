import { useGameStore } from '../../store/gameStore';
import { CountryView } from './CountryView';
import { InfoBar } from './InfoBar';
import { PlayerIndicator } from './PlayerIndicator';
import { PhaseIndicator } from './PhaseIndicator';
import { NextStepButton } from './NextStepButton';
import { ReinforcementCursor } from './ReinforcementCursor';
import { AttackDialog } from '../dialogs/AttackDialog';
import { MovementDialog } from '../dialogs/MovementDialog';
import { GameOverDialog } from '../dialogs/GameOverDialog';

export function GameBoard() {
  const countries = useGameStore((s) => s.countries);
  const mapBackgroundImage = useGameStore((s) => s.mapBackgroundImage);

  return (
    <div
      style={{
        background: '#000',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          width: 1360,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '5px 0',
        }}
      >
        <PlayerIndicator />
        <PhaseIndicator />
        <div style={{ width: 200 }} />
      </div>

      <div
        style={{
          position: 'relative',
          width: 1360,
          height: 650,
          overflow: 'hidden',
        }}
      >
        <img
          src={`/${mapBackgroundImage}`}
          alt="Map"
          style={{
            position: 'absolute',
            width: 1360,
            height: 650,
          }}
          draggable={false}
        />
        {countries.map((country) => (
          <CountryView key={country.id} countryId={country.id} />
        ))}
        <ReinforcementCursor />
      </div>

      <div
        style={{
          width: 1360,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 20,
          padding: '8px 0',
        }}
      >
        <InfoBar />
        <NextStepButton />
      </div>

      <AttackDialog />
      <MovementDialog />
      <GameOverDialog />
    </div>
  );
}
