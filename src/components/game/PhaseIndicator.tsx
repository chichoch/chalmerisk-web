import { useGameStore } from '../../store/gameStore';
import { PlayerColor } from '../../types';

const COLOR_MAP: Record<PlayerColor, string> = {
  [PlayerColor.RED]: 'r',
  [PlayerColor.GREEN]: 'g',
  [PlayerColor.YELLOW]: 'y',
  [PlayerColor.BLUE]: 'b',
};

export function PhaseIndicator() {
  const currentPlayerIndex = useGameStore(s => s.currentPlayerIndex);
  const players = useGameStore(s => s.players);
  const turnPhase = useGameStore(s => s.turnPhase);
  const isFirstRound = useGameStore(s => s.isFirstRound);

  const player = players[currentPlayerIndex];
  if (!player) return null;

  const colorCode = COLOR_MAP[player.color];
  const phaseNumber = isFirstRound ? 1 : turnPhase + 1;
  const src = `/resources/SQ${colorCode}${phaseNumber}.gif`;

  return <img src={src} alt="Phase" style={{ height: 35 }} />;
}
