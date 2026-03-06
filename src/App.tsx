import { useGameStore } from './store/gameStore';
import { MenuView } from './components/menu/MenuView';
import { GameBoard } from './components/game/GameBoard';
import { TutorialView } from './components/tutorial/TutorialView';

function App() {
  const screen = useGameStore((s) => s.screen);

  switch (screen) {
    case 'menu':
      return <MenuView />;
    case 'game':
      return <GameBoard />;
    case 'tutorial':
      return <TutorialView />;
  }
}

export default App;
