# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lasu Financial** is an investment portfolio tracker built with Expo SDK 53 / React Native 0.79. Uses TypeScript strict mode, NativeWind v4 for styling, Supabase for backend, and TanStack Query + Zustand + Zod for state management. Package manager is **pnpm**.

## Commands

```bash
# Development
pnpm start                       # Start Expo dev server
pnpm start:clear                 # Clear Metro cache and start
pnpm ios                         # Run on iOS Simulator (builds native)
pnpm android                     # Run on Android Emulator (builds native)
pnpm web                         # Start in browser

# Code quality
pnpm lint                        # ESLint
pnpm lint:fix                    # ESLint auto-fix
pnpm format                      # Prettier write
pnpm format:check                # Prettier check
pnpm typecheck                   # tsc --noEmit

# Packages — always use expo install for compatibility
npx expo install <package>
npx expo install --fix           # Fix version mismatches

# EAS workflows
pnpm draft                       # Preview update + website deploy
pnpm development-builds          # Build dev clients (iOS + Android)
pnpm deploy                      # Production build + store submission
```

There is no test runner configured in this project.

## Architecture

### Layer Stack

```
Expo Router (app/)           — file-based routing, screens are thin composition layers
  → Provider Layer           — QueryProvider, ThemeProvider, SafeArea (in app/_layout.tsx)
    → State Layer
        Server: TanStack Query (hooks/queries/, hooks/mutations/)
        Client: Zustand stores (stores/) → persisted to MMKV
    → Service Layer (lib/)
        supabase.ts          — DB + Auth (uses MMKV for auth storage)
        axios.ts             — external APIs only (not for Supabase)
        storage.ts           — MMKV instance + zustandStorage + supabaseStorage adapters
        query-client.ts      — QueryClient config
```

### State Management Rules

- **Server/API data** → TanStack Query (`useQuery`/`useMutation`). Never `useState` + `useEffect` for fetching.
- **Shared client state** → Zustand stores persisted to MMKV via `zustandStorage` adapter in `lib/storage.ts`. Do NOT use AsyncStorage.
- **Component-local state** → React `useState`/`useReducer`.
- **Zod schemas** (`schemas/`) are the single source of truth for data shapes. Derive TS types with `z.infer<>`. Never create standalone interfaces for API data.

### Data Fetching Pattern

Query hooks go in `hooks/queries/`, mutations in `hooks/mutations/`. Use the query key factory pattern (see `hooks/queries/index.ts`). Every query function must validate responses through Zod: `schema.parse(data)`.

### Module Boundaries

| Module        | Can Import From                                                                |
| ------------- | ------------------------------------------------------------------------------ |
| `app/`        | `components/`, `hooks/`, `lib/`, `stores/`, `schemas/`, `utils/`, `constants/` |
| `components/` | `hooks/`, `constants/`, `utils/`                                               |
| `hooks/`      | `lib/`, `schemas/`, `stores/`                                                  |
| `lib/`        | external packages only                                                         |
| `stores/`     | `lib/storage`                                                                  |
| `schemas/`    | `zod` only                                                                     |
| `utils/`      | pure functions, no React imports                                               |

### Network & Focus Management

`QueryProvider` (`providers/query-provider.tsx`) sets up `expo-network` for online detection (queries pause offline) and `AppState` for focus tracking (stale queries refetch on foreground).

## Code Conventions

### File Naming

**All files use kebab-case** — no exceptions. Components are PascalCase in code, kebab-case on disk (`themed-text.tsx` → `ThemedText`).

- Hooks: `use-*.ts` (e.g., `use-instruments.ts`)
- Stores: `*-store.ts` (e.g., `auth-store.ts`)
- Platform-specific: `*.ios.tsx` / `*.android.tsx`

### Exports

- **Named exports** for everything (components, hooks, utils, schemas)
- **Default exports** only for Expo Router screens (framework requirement)

### Import Order

1. React / React Native
2. Expo packages
3. Third-party libraries
4. Internal `@/` aliases
5. Local/relative imports

Separated by blank lines. Import sorting is manual.

### Styling

- Use **NativeWind v4** `className` prop — avoid `StyleSheet.create()` for new code
- Dark mode: `dark:` prefix
- Custom theme colors from `tailwind.config.js`: `primary-{50..950}`, `surface-{light,dark}`, `muted-{light,dark}`
- Inline styles only for dynamic/animated values from Reanimated

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `perf:`

### Git Hooks

Husky runs lint-staged on pre-commit: ESLint + Prettier on `.ts`/`.tsx`, Prettier on `.json`/`.md`/`.css`.

## Key Libraries

| Purpose      | Library                      | Notes                               |
| ------------ | ---------------------------- | ----------------------------------- |
| Routing      | `expo-router`                | File-based, typed routes enabled    |
| Styling      | `nativewind` v4              | `className` on all RN components    |
| Server state | `@tanstack/react-query` v5   | Cache + background refresh          |
| Client state | `zustand` v5                 | Persisted via MMKV                  |
| Forms        | `@tanstack/react-form` + Zod | Type-safe validation                |
| Validation   | `zod` v3                     | Runtime validation + type inference |
| HTTP         | `axios`                      | External APIs only, not Supabase    |
| Backend      | `@supabase/supabase-js`      | DB, auth, realtime                  |
| Lists        | `@shopify/flash-list`        | Use instead of FlatList             |
| Storage      | `react-native-mmkv` v3       | Sync KV store, requires dev build   |
| Animations   | `react-native-reanimated`    | Native-thread animations            |

## Troubleshooting

MMKV and FlashList require **development builds** — they don't work in Expo Go. If the app errors in Expo Go, run `pnpm development-builds` or `npx expo run:ios`. New dev builds are also needed after installing packages with native code or config plugins.

## Documentation

- `AGENTS.md` — Full AI agent instructions
- `docs/architecture.md` — Data flow diagrams, state management decision tree, auth flow
- `docs/conventions.md` — Naming rules, directory organization, import ordering, TypeScript guidelines
- `docs/environment.md` — Environment setup, Supabase CLI
- Expo docs for AI: https://docs.expo.dev/llms-full.txt (general), https://docs.expo.dev/llms-eas.txt (EAS), https://docs.expo.dev/llms-sdk.txt (SDK)

## Writing

- Write the dev content in English but the user content in Spanish
