# ChalmeRisk Web — Agent Guidelines

## Project Overview

ChalmeRisk Web is a browser-based Risk-style board game, migrated from a Java Swing application. It is a local hot-seat multiplayer game (no networking). See `PLAN.md` for the full migration plan, Java-to-TypeScript class mappings, and phased implementation roadmap.

## Tech Stack

- **Language:** TypeScript (strict mode — see `tsconfig.app.json`)
- **Framework:** React 19 with function components only (no classes)
- **State:** Zustand (single store in `src/store/gameStore.ts`)
- **Build:** Vite
- **Testing:** Vitest (tests in `tests/`, imports from `../src/`)
- **Styling:** Inline styles (no CSS modules or Tailwind currently in use)
- **Linting:** ESLint with typescript-eslint + react-hooks + react-refresh

## Commands

- `yarn dev` — Start dev server
- `yarn build` — Type-check and build (`tsc -b && vite build`)
- `yarn test` — Run tests (`vitest run`)
- `yarn lint` — Lint with ESLint

## Architecture

### Layers

```
src/types/        → Shared types, enums, interfaces (no logic)
src/logic/        → Pure game logic functions (no React, no Zustand, no side effects)
src/store/        → Zustand store — single source of truth for all game state
src/components/   → React components (consume store via useGameStore selectors)
src/utils/        → Pure utility functions (e.g. icon path resolution)
src/hooks/        → Custom React hooks
```

### Key design decisions

- **No classes.** All domain objects (`Country`, `Continent`, `Player`) are plain TypeScript interfaces. Logic lives in standalone pure functions, not methods.
- **Immutable state.** All state updates in the store use spread copies (`{ ...obj }`). Never mutate state objects directly.
- **Const object enums.** Enums use `as const` object pattern (not TypeScript `enum` keyword). See `src/types/index.ts` for examples — e.g. `TurnPhase`, `BattleOutcome`, `PlayerColor`.
- **Single Zustand store.** All game state lives in `useGameStore`. Components select specific slices via selectors: `useGameStore(s => s.fieldName)`.
- **Logic functions are pure.** Files in `src/logic/` must not import React or Zustand. They take state in, return new state out. The store calls them.
- **No Observer pattern.** The Java codebase used `Observable`/`Observer` with magic integers. React + Zustand reactivity replaces all of that.

### File naming conventions

- Components: `PascalCase.tsx` — named exports matching filename (`export function GameBoard()`)
- Logic/utils: `camelCase.ts` — named function exports
- Tests: `camelCase.test.ts` in `tests/` directory, mirror `src/logic/` names
- Types: all in `src/types/index.ts`

## Code Conventions

- Function components only — `export function ComponentName()`, no arrow-function components
- Component props via `interface Props` defined above the component
- Imports: separate `import type` from value imports (enforced by `verbatimModuleSyntax`)
- Store helper functions (`getCountry`, `updateCountry`, `getActivePlayers`) live in `gameStore.ts` as module-level functions, not inside the store
- Phase-specific click handlers (`handleReinforcementClick`, `handleAttackClick`, `handleMovementClick`) are module-level functions in `gameStore.ts` called by the `clickCountry` action

## Testing Conventions

- Tests use `describe`/`it`/`expect` from Vitest
- Test files import directly from `../src/` paths
- Logic tests should be pure — no DOM, no React, no mocking of Zustand
- Tests for randomized logic (e.g. dice) use loops to verify statistical properties

## Static Assets

- Map background images, troop icons, dice faces, UI images: `public/resources/`
- Map data files: `public/maps/`
- Referenced at runtime with absolute paths from root (e.g. `/resources/redInfantry.gif`, `/maps/testmap.txt`)
- Icon path resolution logic is in `src/utils/iconResolver.ts`

## Game State Machine

The turn flows through phases: **Reinforcement → Attack → Movement → next player**.

During first rounds (`isFirstRound: true`), only the Reinforcement phase runs, cycling through all players 3 times before switching to normal rounds.

Key store actions:
- `startGame()` — parses map, randomizes countries, sets initial state
- `clickCountry()` — delegates to phase-specific handler
- `nextStep()` — advances phase or rotates to next player
- `fight()` — resolves one round of combat dice
- `endFight()` — applies takeover if attacker won, may open movement dialog
- `moveTroops()` / `cancelMovement()` — handles troop movement

## Known Issues / TODOs

See `PLAN.md` "Known Bugs to Fix During Migration" section for Java bugs being corrected, and the Phase-by-Phase plan for remaining work.
