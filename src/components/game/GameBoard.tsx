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
  const countries = useGameStore(s => s.countries);
  const mapBackgroundImage = useGameStore(s => s.mapBackgroundImage);

  return (
    <div style={{ background: '#000', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '5px 20px',
        background: '#000',
      }}>
        <PlayerIndicator />
        <PhaseIndicator />
        <div style={{ width: 200 }} />
      </div>

      <div style={{
        position: 'relative',
        flex: 1,
        overflow: 'hidden',
      }}>
        <img
          src={`/${mapBackgroundImage}`}
          alt="Map"
          style={{
            position: 'absolute',
            left: -18,
            top: -72,
            width: 1400,
            height: 800,
          }}
          draggable={false}
        />
        {countries.map(country => (
          <CountryView key={country.id} countryId={country.id} />
        ))}
        <ReinforcementCursor />
      </div>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: '8px 20px',
        background: '#000',
      }}>
        <InfoBar />
        <NextStepButton />
      </div>

      <AttackDialog />
      <MovementDialog />
      <GameOverDialog />
    </div>
  );
}
