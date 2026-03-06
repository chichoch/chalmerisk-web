interface Props {
  value: number;
  visible: boolean;
}

export function DiceView({ value, visible }: Props) {
  const src = visible
    ? `/resources/testdice${value}.gif`
    : '/resources/testdicetom.gif';

  return <img src={src} alt={visible ? `Dice: ${value}` : 'Not rolled'} style={{ width: 50, height: 50 }} />;
}
