import { useGameStore } from '../../store/gameStore';
import { DiceView } from './DiceView';

function TroopIcons({
  troops,
  color,
  label,
}: {
  troops: number;
  color: string;
  label: string;
}) {
  const icons: React.ReactNode[] = [];
  let remaining = label === 'attacker' ? troops - 1 : troops;

  while (remaining > 0) {
    if (remaining >= 10) {
      icons.push(
        <img
          key={`cannon-${icons.length}`}
          src={`/resources/${color}Cannon.gif`}
          alt="Cannon"
        />,
      );
      remaining -= 10;
    } else if (remaining >= 5) {
      const colorCap = color.charAt(0).toUpperCase() + color.slice(1);
      icons.push(
        <img
          key={`knight-${icons.length}`}
          src={`/resources/Knight${colorCap}.gif`}
          alt="Knight"
        />,
      );
      remaining -= 5;
    } else {
      icons.push(
        <img
          key={`inf-${icons.length}`}
          src={`/resources/${color}Infantry.gif`}
          alt="Infantry"
        />,
      );
      remaining -= 1;
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        justifyContent: 'center',
        minHeight: 60,
      }}
    >
      {icons}
    </div>
  );
}

export function AttackDialog() {
  const attackState = useGameStore((s) => s.attackState);
  const countries = useGameStore((s) => s.countries);
  const players = useGameStore((s) => s.players);
  const fight = useGameStore((s) => s.fight);
  const endFight = useGameStore((s) => s.endFight);

  if (!attackState.isDialogOpen) return null;

  const attacker = countries.find((c) => c.id === attackState.selectedAttacker);
  const defender = countries.find((c) => c.id === attackState.selectedDefender);
  if (!attacker || !defender) return null;

  const attPlayer = players[attacker.ownerIndex];
  const defPlayer = players[defender.ownerIndex];

  const canFight =
    attackState.result === 'fighting' &&
    attacker.troops > 1 &&
    defender.troops > 0;

  let retreatLabel = 'Retreat';
  if (attackState.result === 'attacker_won') retreatLabel = 'Invade!';
  if (attackState.result === 'defender_won') retreatLabel = 'Flee';

  const { attackerDice, defenderDice, attackerDiceCount, defenderDiceCount } =
    attackState;

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
          width: 420,
          padding: 10,
        }}
      >
        <div style={{ display: 'flex', gap: 10 }}>
          <div
            style={{
              flex: 1,
              border: '1px solid #000',
              padding: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {attacker.name}
            </div>
            <TroopIcons
              troops={attacker.troops}
              color={attPlayer.color}
              label="attacker"
            />
          </div>

          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 'bold', fontSize: 13 }}>
              {attackState.statusText}
            </div>
            <button
              onClick={fight}
              disabled={!canFight}
              style={{
                padding: '6px 20px',
                cursor: canFight ? 'pointer' : 'not-allowed',
              }}
            >
              Fight!
            </button>
            <button
              onClick={endFight}
              style={{ padding: '6px 20px', cursor: 'pointer' }}
            >
              {retreatLabel}
            </button>
          </div>

          <div
            style={{
              flex: 1,
              border: '1px solid #000',
              padding: 8,
              textAlign: 'center',
            }}
          >
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>
              {defender.name}
            </div>
            <TroopIcons
              troops={defender.troops}
              color={defPlayer.color}
              label="defender"
            />
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 8,
            marginTop: 10,
          }}
        >
          <DiceView
            value={attackerDice[0] ?? 0}
            visible={attackerDiceCount >= 1 && attackerDice.length > 0}
          />
          <DiceView
            value={attackerDice[1] ?? 0}
            visible={attackerDiceCount >= 2 && attackerDice.length > 1}
          />
          <DiceView
            value={attackerDice[2] ?? 0}
            visible={attackerDiceCount >= 3 && attackerDice.length > 2}
          />
          <div style={{ width: 20 }} />
          <DiceView
            value={defenderDice[0] ?? 0}
            visible={defenderDiceCount >= 1 && defenderDice.length > 0}
          />
          <DiceView
            value={defenderDice[1] ?? 0}
            visible={defenderDiceCount >= 2 && defenderDice.length > 1}
          />
        </div>
      </div>
    </div>
  );
}
