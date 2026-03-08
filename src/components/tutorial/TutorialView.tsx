import { useGameStore } from '../../store/gameStore';

export function TutorialView() {
  const setScreen = useGameStore((s) => s.setScreen);

  return (
    <div
      style={{
        background: '#000',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        overflowY: 'auto',
      }}
    >
      <button
        onClick={() => setScreen('menu')}
        style={{
          background: '#000',
          border: 'none',
          cursor: 'pointer',
          marginBottom: 10,
        }}
      >
        <img
          src="/resources/backBig.gif"
          alt="Back"
          style={{ maxWidth: '100%' }}
        />
      </button>
      <div
        style={{
          gap: '10px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <img
          src="/resources/tutorialheading.gif"
          alt="Tutorial"
          style={{ maxWidth: '100%' }}
        />
        <img
          src="/resources/tutorial1.gif"
          alt="Tutorial 1"
          style={{ maxWidth: '100%' }}
        />
        <img
          src="/resources/tutorialspace.gif"
          alt=""
          style={{ maxWidth: '100%' }}
        />
        <img
          src="/resources/tutorial2.gif"
          alt="Tutorial 2"
          style={{ maxWidth: '100%' }}
        />
        <img
          src="/resources/tutorialspace.gif"
          alt=""
          style={{ maxWidth: '100%' }}
        />
        <img
          src="/resources/tutorial3.gif"
          alt="Tutorial 3"
          style={{ maxWidth: '100%' }}
        />
        <img
          src="/resources/tutorialspace.gif"
          alt=""
          style={{ maxWidth: '100%' }}
        />
        <img
          src="/resources/tutorial4.gif"
          alt="Tutorial 4"
          style={{ maxWidth: '100%' }}
        />
      </div>
      <button
        onClick={() => setScreen('menu')}
        style={{
          background: '#000',
          border: 'none',
          cursor: 'pointer',
          marginTop: 10,
        }}
      >
        <img
          src="/resources/backBig.gif"
          alt="Back"
          style={{ maxWidth: '100%' }}
        />
      </button>
    </div>
  );
}
