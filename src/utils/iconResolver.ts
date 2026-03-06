import { PlayerColor, getTroopType } from '../types';

export function getIconPath(color: PlayerColor, troops: number, selected: boolean): string {
  const troopType = getTroopType(troops);
  const selectedSuffix = selected ? 'Selected' : '';

  if (troopType === 'knight') {
    // Knight files use KnightColor format
    const colorName = color.charAt(0).toUpperCase() + color.slice(1);
    return `/resources/Knight${colorName}${selectedSuffix}.gif`;
  }

  // Infantry and Cannon use colorTroop format
  const typeName = troopType === 'infantry' ? 'Infantry' : 'Cannon';
  return `/resources/${color}${typeName}${selectedSuffix}.gif`;
}
