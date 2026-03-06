# ChalmeRisk Web — Migration Plan

## Tech Stack

| Layer | Choice |
|---|---|
| Language | TypeScript (strict mode) |
| Framework | React 18+ |
| State management | Zustand |
| Build tool | Vite |
| Testing | Vitest |
| Styling | CSS Modules (or Tailwind — decide later) |
| Rendering | Positioned HTML elements over map background image |
| Multiplayer | None — local hot-seat only |

## Folder Structure

```
ChalmeRiskWeb/
├── public/
│   ├── resources/               # Copied from ChalmeRisk/resources/
│   │   ├── testmap1.jpg         # Map background images
│   │   ├── redInfantry.gif      # Troop icons (per color × type × selected)
│   │   ├── testdice1.gif        # Dice face images
│   │   ├── SQr1.gif             # Phase indicator images
│   │   └── ...                  # All other GIF/JPG/PNG assets
│   └── maps/                    # Copied from ChalmeRisk/maps/
│       └── testmap.txt
├── src/
│   ├── types/
│   │   └── index.ts             # All shared types and enums
│   ├── models/                  # Domain data structures (no logic)
│   │   ├── Country.ts
│   │   ├── Continent.ts
│   │   └── Player.ts
│   ├── logic/                   # Pure game logic functions (no React, no Zustand)
│   │   ├── mapParser.ts
│   │   ├── reinforcementLogic.ts
│   │   ├── attackLogic.ts
│   │   ├── diceLogic.ts
│   │   ├── movementLogic.ts
│   │   ├── turnManager.ts
│   │   └── countryRandomizer.ts
│   ├── store/
│   │   └── gameStore.ts         # Zustand store — single source of truth
│   ├── components/
│   │   ├── menu/
│   │   │   └── MenuView.tsx
│   │   ├── game/
│   │   │   ├── GameBoard.tsx
│   │   │   ├── CountryView.tsx
│   │   │   ├── InfoBar.tsx
│   │   │   ├── PlayerIndicator.tsx
│   │   │   ├── PhaseIndicator.tsx
│   │   │   ├── ReinforcementCursor.tsx
│   │   │   └── NextStepButton.tsx
│   │   ├── dialogs/
│   │   │   ├── AttackDialog.tsx
│   │   │   ├── MovementDialog.tsx
│   │   │   ├── DiceView.tsx
│   │   │   └── GameOverDialog.tsx
│   │   └── tutorial/
│   │       └── TutorialView.tsx
│   ├── hooks/
│   │   └── useMousePosition.ts  # For ReinforcementCursor (replaces MouseMotionListener)
│   ├── utils/
│   │   └── iconResolver.ts      # Replaces IconHandler — maps (color, troopCount, selected) → image path
│   ├── App.tsx                  # Top-level routing: menu vs game vs tutorial
│   ├── App.module.css
│   ├── main.tsx                 # React entry point
│   └── vite-env.d.ts
├── tests/
│   ├── mapParser.test.ts
│   ├── reinforcementLogic.test.ts
│   ├── diceLogic.test.ts
│   ├── movementLogic.test.ts
│   └── attackLogic.test.ts
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── PLAN.md                      # This file
```

---

## Types & Enums — Replacing Magic Integers

The Java codebase uses magic integers everywhere. Define proper enums first since
everything else depends on them.

```
TurnPhase        = REINFORCEMENT | ATTACK | MOVEMENT
BattleOutcome    = ATTACKER_KILLED_1 | DEFENDER_KILLED_1 | ATTACKER_KILLED_2 | DEFENDER_KILLED_2 | ONE_EACH
MessageType      = INFO | WARNING | SUCCESS
PlayerColor      = RED | GREEN | YELLOW | BLUE
TroopType        = INFANTRY | KNIGHT | CANNON       (derived: <5, 5-9, 10+)
```

### Java magic int → TypeScript enum mapping

| Java class | Magic int | Meaning | New enum |
|---|---|---|---|
| `Country.notifyObservers(0)` | 0 | Troops changed | Not needed — Zustand reactivity |
| `Country.notifyObservers(1)` | 1 | Owner changed | Not needed — Zustand reactivity |
| `Country.notifyObservers(2)` | 2 | Selection changed | Not needed — Zustand reactivity |
| `AttackModel.notifyObservers(0)` | 0 | New attack started | Store action `startAttack()` |
| `AttackModel.notifyObservers(1)` | 1 | Status text update | Store field `attackStatusText` |
| `AttackModel.notifyObservers(2)` | 2 | Attacker wins | Store field `attackResult` |
| `AttackModel.notifyObservers(3)` | 3 | Defender wins | Store field `attackResult` |
| `AttackModel.notifyObservers(4)` | 4 | Repaint troops | Not needed — automatic re-render |
| `AttackModel.notifyObservers(5)` | 5 | End fight | Store action `endFight()` |
| `InfoModel.notifyObservers(0)` | 0 | Info message | `MessageType.INFO` |
| `InfoModel.notifyObservers(1)` | 1 | Warning message | `MessageType.WARNING` |
| `InfoModel.notifyObservers(2)` | 2 | Success message | `MessageType.SUCCESS` |
| `TurnModel.notifyObservers(0)` | 0 | Phase changed | Not needed — Zustand reactivity |
| `DiceController.battle()` returns 1–5 | 1–5 | Battle outcome | `BattleOutcome` enum |

---

## Zustand Store Design

The store replaces **all** of these Java static state holders:
- `ChalmeRisk.*` (god object)
- `ViewBuilder.*` (static view refs — not needed, React handles this)
- `AttackController.dCtrl` (static dice controller)

### Store shape (conceptual)

```
GameStore {
  // Screen state
  screen: 'menu' | 'game' | 'tutorial'

  // Map data
  countries: Country[]
  continents: Continent[]
  mapBackgroundImage: string

  // Players
  players: Player[]
  currentPlayerIndex: number

  // Turn state
  turnPhase: TurnPhase
  isFirstRound: boolean
  firstRoundCount: number

  // Reinforcement
  // (reinforcements live on each Player object)

  // Attack state
  attackState: {
    selectedAttacker: number | null    // country ID
    selectedDefender: number | null    // country ID
    isDialogOpen: boolean
    statusText: string
    result: 'fighting' | 'attacker_won' | 'defender_won' | null
    takeOverCountry: boolean
    attackerDice: number[]             // 1-3 dice values
    defenderDice: number[]             // 1-2 dice values
  }

  // Movement state
  movementState: {
    selectedFrom: number | null        // country ID
    selectedTo: number | null          // country ID
    isDialogOpen: boolean
    movementUsedThisTurn: boolean
  }

  // UI feedback
  message: { text: string; type: MessageType } | null

  // Game over
  winner: Player | null

  // Actions
  startGame(players: PlayerConfig[], mapName: string): Promise<void>
  clickCountry(countryId: number): void
  nextStep(): void
  fight(): void
  endFight(): void
  moveTroops(count: number): void
  cancelMovement(): void
}
```

---

## Java → TypeScript Class-by-Class Mapping

### `core/` → `models/` + `logic/` + `store/`

| Java class | Web equivalent | Notes |
|---|---|---|
| `ChalmeRisk` | `gameStore.ts` | Static fields → Zustand store state |
| `Map` | Inline in store | Just `countries[]` + `continents[]` + `mapBackgroundImage` |
| `MapBuilder` | `mapParser.ts` | `async function parseMap(url: string): Promise<MapData>` — uses `fetch()` |
| `Country` | `Country.ts` (interface) | Plain data, no Observable. Zustand handles reactivity |
| `Continent` | `Continent.ts` (interface) | Plain data with `countryIds: number[]` |
| `Player` | `Player.ts` (interface) | Plain data with `color: PlayerColor` |
| `Round` | Store fields | `currentPlayerIndex` + `players[]` in store |
| `ActivePlayers` | Store action | Inline logic — filter `players` by country ownership count |
| `ReinforcementCalculator` | `reinforcementLogic.ts` | Pure function: `calculateReinforcements(player, countries, continents): number` |
| `RandomizeCountries` | `countryRandomizer.ts` | Pure function: `randomizeCountries(players, countries): Country[]` |
| `TurnModel` | Store fields | `turnPhase` + `isFirstRound` in store |
| `AttackModel` | Store fields | `attackState` object in store |
| `MovementModel` | Store fields | `movementState` object in store |
| `InfoModel` | Store field | `message: { text, type }` in store |
| `Dice` | `diceLogic.ts` | Pure function: `rollDice(): number` (1–6) |
| `IconHandler` | `iconResolver.ts` | Pure function: `getIconPath(color, troopCount, selected): string` |
| `GameOverException` | Store field | `winner: Player \| null` — `GameOverDialog` renders when non-null |

### `ctrl/` → `logic/` + store actions

| Java class | Web equivalent | Notes |
|---|---|---|
| `Turn` | `turnManager.ts` + store actions | `nextStep()` action handles phase transitions |
| `TurnState` | Not needed | Phase logic split into separate modules, `turnPhase` selects behavior |
| `ReinforcementController` | `reinforcementLogic.ts` | `handleReinforcementClick(countryId, state): StateUpdate` |
| `AttackController` | `attackLogic.ts` | `handleAttackClick(countryId, state): StateUpdate` + `fight(state): FightResult` + `endFight(state): StateUpdate` |
| `DiceController` | `diceLogic.ts` | `resolveBattle(attackerTroops, defenderTroops): BattleResult` — pure function, returns dice values + outcome |
| `TroopMovementController` | `movementLogic.ts` | `handleMovementClick(countryId, state): StateUpdate` + `doMovement(count, from, to): StateUpdate` |

### `view/` → `components/`

| Java class | React component | Notes |
|---|---|---|
| `MenuView` | `MenuView.tsx` | Form with player inputs, map dropdown, start button. Calls `store.startGame()` |
| `ViewBuilder` | Not needed | React component tree handles composition |
| `MainFrame` | `GameBoard.tsx` | Relative-positioned container. Map image as background. `CountryView` components absolutely positioned using `x`, `y` from country data. Click handler calls `store.clickCountry(id)` |
| `CountryView` | `CountryView.tsx` | Absolutely positioned `div`. Shows troop icon + count. Subscribes to its country's state slice via Zustand selector |
| `AttackDialog` | `AttackDialog.tsx` | Modal/overlay. Shows when `attackState.isDialogOpen`. Fight/Retreat buttons call store actions |
| `MovementDialog` | `MovementDialog.tsx` | Modal with range input (replaces `JSlider`). Calls `store.moveTroops(count)` |
| `DiceView` | `DiceView.tsx` | Shows dice face image based on value. Receives value as prop |
| `InfoView` | `InfoBar.tsx` | Reads `store.message`, sets text color by `MessageType` |
| `PlayerView` | `PlayerIndicator.tsx` | Reads `store.currentPlayer`, displays name in player color |
| `SequenceMap` | `PhaseIndicator.tsx` | Reads `store.turnPhase` + `store.currentPlayer.color`, shows phase image |
| `ReinforcementPanel` | `ReinforcementCursor.tsx` | Follows mouse via `useMousePosition` hook. Visible only during reinforcement phase |
| `TutorialView` | `TutorialView.tsx` | Scrollable page showing tutorial images |

### `io/` → `utils/`

| Java class | Web equivalent | Notes |
|---|---|---|
| `IFileReader` | Not needed | Just use `fetch()` |
| `FileReader` | Part of `mapParser.ts` | `fetch('/maps/testmap.txt')` → split lines → strip blanks/comments |

---

## Phase-by-Phase Implementation Plan

### Phase 1: Project Setup & Map Parsing
**Goal:** Vite project that can parse a map file and log the result.

Tasks:
1. `npm create vite@latest ChalmeRiskWeb -- --template react-ts`
2. Install Zustand: `npm install zustand`
3. Install Vitest: `npm install -D vitest`
4. Copy `ChalmeRisk/resources/*` → `ChalmeRiskWeb/public/resources/`
5. Copy `ChalmeRisk/maps/*` → `ChalmeRiskWeb/public/maps/`
6. Define types in `src/types/index.ts` — all enums and interfaces
7. Implement `src/logic/mapParser.ts`:
   - Port `FileReader` line-stripping logic (blank lines, `#` comments)
   - Port `MapBuilder` parsing logic (continent/country blocks)
   - Return typed `{ countries, continents, backgroundImage }`
8. Write `tests/mapParser.test.ts` — port `MapBuilderTest` + `FileReaderTest`

**Verify:** `npx vitest run` passes map parsing tests.

---

### Phase 2: Game Logic (Pure Functions, No UI)
**Goal:** All game rules implemented as testable pure functions.

Tasks:
1. `src/logic/diceLogic.ts`
   - `rollDice(): number` — random 1–6
   - `resolveBattle(attackerTroops, defenderTroops): BattleResult`
   - Port all the dice-count selection logic from `DiceController.getResult()`
   - Port comparison logic from `DiceController.battle()`
   - Return typed result: `{ attackerDice: number[], defenderDice: number[], outcome: BattleOutcome }`
2. `src/logic/reinforcementLogic.ts`
   - `calculateFirstRoundReinforcements(numPlayers): number` — `(50 - 5*n) / 3`
   - `calculateReinforcements(player, countries, continents): number` — port `ReinforcementCalculator.setReinforcementsMain()`
3. `src/logic/countryRandomizer.ts`
   - `randomizeCountries(players, countries): Country[]` — port `RandomizeCountries.randomize()`
4. `src/logic/movementLogic.ts`
   - `doMovement(count, fromCountry, toCountry): { from: Country, to: Country }` — pure arithmetic
5. `src/logic/attackLogic.ts`
   - `validateAttacker(countryId, currentPlayer, countries): ValidationResult`
   - `validateDefender(attackerCountry, defenderCountryId, countries): ValidationResult`
   - `applyBattleOutcome(outcome, attacker, defender): { attacker: Country, defender: Country }`
   - `applyTakeover(attacker, defender): { attacker: Country, defender: Country }`
6. Write tests porting `GameTest`, `TroopMovementControllerTest` logic

**Verify:** All logic tests pass with no DOM or React dependency.

---

### Phase 3: Zustand Store
**Goal:** Complete game state machine wired to logic functions.

Tasks:
1. `src/store/gameStore.ts` — implement store shape from design above
2. Implement store actions:
   - `startGame(playerConfigs, mapName)` — fetch + parse map, randomize countries, set initial state
   - `clickCountry(id)` — delegates to phase-specific logic:
     - Reinforcement: place troop if valid
     - Attack: two-click select attacker then defender
     - Movement: two-click select from then to
   - `nextStep()` — phase transitions, first-round counting, player rotation, game-over check
   - `fight()` — roll dice, apply outcome, check win/lose conditions
   - `endFight()` — apply takeover if attacker won, close dialog, open movement dialog if needed
   - `moveTroops(count)` / `cancelMovement()` — apply movement, close dialog
3. Implement `getCountryById` helper (replaces `Map.getCountry(int)` linear scan — use a `Map<number, Country>` or simple find)
4. Port first-round logic from `Turn.firstRoundState()` + `Turn.changeState()`
5. Port game-over detection: check if only one player owns countries

**Verify:** Write integration tests — simulate a sequence of actions and assert state transitions.

---

### Phase 4: Game Board & Core UI
**Goal:** Playable game board with clickable countries.

Tasks:
1. `src/App.tsx` — conditional render based on `store.screen` (menu | game | tutorial)
2. `src/components/game/GameBoard.tsx`:
   - Container with `position: relative` and map background image
   - Render `CountryView` for each country, absolutely positioned at `(x, y)`
   - Click handler on each `CountryView` calls `store.clickCountry(id)`
3. `src/components/game/CountryView.tsx`:
   - Show troop icon (resolved via `iconResolver`) + troop count label
   - Highlight when selected (swap to selected icon variant)
   - Use Zustand selector: `useGameStore(s => s.countries.find(c => c.id === id))`
4. `src/utils/iconResolver.ts`:
   - `getIconPath(color: PlayerColor, troops: number, selected: boolean): string`
   - Returns path like `/resources/redInfantry.gif`
   - Port thresholds from `IconHandler`: <5 infantry, 5–9 knight, 10+ cannon
5. `src/components/game/InfoBar.tsx` — message text with color based on type
6. `src/components/game/PlayerIndicator.tsx` — current player name + color
7. `src/components/game/PhaseIndicator.tsx` — phase image from `/resources/SQ{color}{phase}.gif`
8. `src/components/game/NextStepButton.tsx` — disabled until reinforcements exhausted
9. `src/components/game/ReinforcementCursor.tsx` — `useMousePosition` hook, visible during reinforcement phase

**Verify:** Can place reinforcements, see troop counts update, advance through first rounds.

---

### Phase 5: Menu
**Goal:** Start screen matching original functionality.

Tasks:
1. `src/components/menu/MenuView.tsx`:
   - Player count dropdown (2/3/4)
   - Player name text inputs — enable/disable based on count (port `itemStateChanged` logic)
   - Player labels colored RED/GREEN/YELLOW/BLUE
   - Map selection dropdown
   - Start button — validates at least 2 players have names, calls `store.startGame()`
   - Tutorial button → sets screen to tutorial
2. Style to match original dark theme (black background)

**Verify:** Can configure 2–4 players, select map, start game, see game board.

---

### Phase 6: Attack Dialog
**Goal:** Full combat flow working.

Tasks:
1. `src/components/dialogs/AttackDialog.tsx`:
   - Modal overlay, shown when `attackState.isDialogOpen`
   - Attacker panel — troop icons (infantry/knight/cannon breakdown)
   - Defender panel — troop icons
   - Status text label
   - Fight button — calls `store.fight()`
   - Retreat/Invade/Flee button — label changes based on `attackState.result`, calls `store.endFight()`
   - Disable Fight when attacker has 1 troop or defender has 0
2. `src/components/dialogs/DiceView.tsx`:
   - Receives dice value as prop
   - Shows corresponding dice face image or blank
   - Handle "not tossed" state (fewer dice than 3/2) — show blank image
3. Wire attack click flow: first click selects attacker (with validation), second click opens dialog

**Verify:** Full attack flow — select countries, fight rounds, see dice, attacker wins/defender wins, country takeover.

---

### Phase 7: Movement Dialog
**Goal:** Troop movement after conquest and in movement phase.

Tasks:
1. `src/components/dialogs/MovementDialog.tsx`:
   - Modal overlay, shown when `movementState.isDialogOpen`
   - Range slider (`input[type=range]`) — min 1, max (fromCountry.troops - 1)
   - "Move troops" button — calls `store.moveTroops(sliderValue)`
   - "Cancel" button — calls `store.cancelMovement()`
2. Post-conquest movement: after attacker wins, open movement dialog between attacker/defender country
3. Phase 2 movement: two-click select, open dialog, limit to one movement per turn

**Verify:** Can move troops after conquest and during movement phase. One movement per turn enforced.

---

### Phase 8: Game Over & Polish
**Goal:** Complete game loop, polished experience.

Tasks:
1. `src/components/dialogs/GameOverDialog.tsx` — modal showing winner name, play again button
2. Game-over detection in `nextStep()` after attack phase — check active players
3. `src/components/tutorial/TutorialView.tsx` — scrollable tutorial images
4. Edge cases:
   - Player eliminated mid-game (turn skipping)
   - All reinforcements placed enables next step
   - Attack with exactly 2 troops (1 die), 3 troops (2 dice), 4+ (3 dice)
5. Visual polish — hover effects on countries, transition animations
6. Discover maps from filesystem (manifest JSON) instead of hardcoded array

**Verify:** Complete game from start to finish with 2–4 players. Game ends correctly when one player remains.

---

## Known Bugs to Fix During Migration

These exist in the Java code and should be corrected in the web version:

1. **`AttackDialog` creates `new AttackController()`** on each button click — works accidentally because all state is static. In the web version, store actions handle this correctly by design.

2. **`Continent.getOwner()` returns a dummy `Player(Color.black, "Test")`** when no single owner — should return `null`.

3. **`SequenceMap` uses `Color.blue` (lowercase)** but players use `Color.BLUE` (uppercase constant) — these are the same object in Java, but the inconsistency is confusing. Use `PlayerColor` enum in web version.

4. **`Round.newRound()` catches `IndexOutOfBoundsException`** for flow control instead of proper bounds checking.

5. **`MenuView` validation bug** — checks `playerTextField3` twice instead of checking `playerTextField1`: `playerTextField2.getText().isEmpty() == true && playerTextField3.getText().isEmpty() == true && playerTextField3.getText().isEmpty() == true`.

6. **`FileReader` singleton reuses `sList`** — `getFile()` clears and reuses the same list, which would cause issues if called concurrently. Not a problem in single-threaded Swing, but good to avoid in web version.

7. **`CountryView` adds observer twice** — `country.addObserver(this)` is called in both the constructor body and at the end. Harmless duplication but sloppy.

---

## Asset Inventory

Copy these from `ChalmeRisk/resources/` to `ChalmeRiskWeb/public/resources/`:

| Category | Files | Count |
|---|---|---|
| Troop icons (normal) | `{red,green,blue,yellow}{Infantry,Cannon}.gif`, `Knight{Red,Green,Blue,Yellow}.gif` | 12 |
| Troop icons (selected) | Same pattern with `Selected` suffix | 12 |
| Dice faces | `testdice{1-6}.gif`, `testdicetom.gif`, `testdicetom1.gif` | 8 |
| Phase indicators | `SQ{r,g,b,y}{1,2,3}.gif` | 12 |
| Menu assets | `ChalmeRiskHeading.gif`, `startGame.gif`, `tutorial.gif`, `exitGame.gif`, `startButton.gif`, `backButton.gif`, `startHorse.jpg`, `startInf.jpg` | 8 |
| Map images | `testmap1.jpg`, `testmap.gif`, `Karta.jpg`, `riskmap_liten.png` | 4 |
| Tutorial | `tutorialheading.gif`, `tutorial{1-4}.gif`, `tutorialspace.gif` | 6 |
| Other UI | `leftPanelPic.jpg`, `rightPanelPic.jpg`, `greyInfantry.gif`, `colorInfantry.gif`, `continentvalue.gif`, `backBig.gif`, `images (1).jpg` | 7 |

Copy map data from `ChalmeRisk/maps/` to `ChalmeRiskWeb/public/maps/`:
- `testmap.txt` (43 countries, 7 continents)
