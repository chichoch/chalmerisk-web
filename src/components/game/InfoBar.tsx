import { useGameStore } from '../../store/gameStore';
import { MessageType } from '../../types';

const TYPE_COLORS: Record<MessageType, string> = {
  [MessageType.INFO]: '#ffffff',
  [MessageType.WARNING]: '#ff0000',
  [MessageType.SUCCESS]: '#00ff00',
};

export function InfoBar() {
  const message = useGameStore((s) => s.message);

  if (!message) return <div style={{ flex: '1 1 auto', minHeight: 20 }} />;

  return (
    <div
      style={{
        flex: '1 1 auto',
        maxWidth: 320,
        color: TYPE_COLORS[message.type],
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 1.3,
      }}
    >
      {message.text}
    </div>
  );
}
