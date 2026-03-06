import { useGameStore } from '../../store/gameStore';
import { getIconPath } from '../../utils/iconResolver';

interface Props {
  countryId: number;
}

export function CountryView({ countryId }: Props) {
  const country = useGameStore(s => s.countries.find(c => c.id === countryId));
  const players = useGameStore(s => s.players);
  const clickCountry = useGameStore(s => s.clickCountry);

  if (!country) return null;

  const player = players[country.ownerIndex];
  if (!player) return null;

  const iconPath = getIconPath(player.color, country.troops, country.isSelected);

  return (
    <div
      onClick={() => clickCountry(countryId)}
      style={{
        position: 'absolute',
        left: country.x,
        top: country.y,
        width: 60,
        height: 75,
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        cursor: 'pointer',
        userSelect: 'none',
      }}
    >
      <img src={iconPath} alt={country.name} draggable={false} />
      <span style={{ color: '#fff', fontSize: 12, fontWeight: 'bold', textShadow: '1px 1px 2px #000' }}>
        {country.troops}
      </span>
    </div>
  );
}
