# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Lasu Financial** is a **cross-platform** (iOS, Android, Web) investment portfolio tracker built with Expo SDK 54 / React Native 0.81. Uses TypeScript strict mode, **shadcn-style UI components via [React Native Reusables](https://rnr-docs.vercel.app/)** (@rn-primitives) styled with NativeWind v4, Supabase for backend, and TanStack Query + Zustand + Zod for state management. Package manager is **pnpm**.

**CRITICAL LANGUAGE CONVENTION:**

- **User-facing content** (UI text, labels, error messages, buttons, etc.): **Spanish**
- **Code** (variables, functions, types, comments, commit messages, documentation): **English**

## Commands

**All commands use pnpm** — never use npm or yarn.

```bash
# Development (cross-platform: works on iOS, Android, and Web)
pnpm start                       # Start Expo dev server
pnpm start:clear                 # Clear Metro cache and start
pnpm ios                         # Run on iOS Simulator (builds native)
pnpm android                     # Run on Android Emulator (builds native)
pnpm web                         # Start in browser (React Native Web)

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

### UI Components (shadcn-style with React Native Reusables)

All UI components in `components/ui/` follow the **React Native Reusables** pattern (shadcn for React Native):

- Built on `@rn-primitives/*` packages for accessibility (ARIA-compliant)
- Styled with NativeWind using `class-variance-authority` (cva)
- Unstyled primitives composed with styling utilities
- Cross-platform compatible (iOS, Android, Web)

**Available UI Components:**

- `button.tsx` — Pressable with variants (default, destructive, outline, secondary, ghost, link) and sizes
- `text-input.tsx` — Accessible input with label integration
- `text.tsx` — Typography with context-based styling
- `alert-dialog.tsx` — Modal dialogs from @rn-primitives/alert-dialog
- `avatar.tsx` — User avatars from @rn-primitives/avatar
- `card.tsx`, `separator.tsx`, `label.tsx` — Layout primitives
- `announcement.tsx` — Screen reader announcements for accessibility

**IMPORTANT**: These components only accept their defined props (variants, sizes, standard Pressable/View props). They do NOT accept custom props like `loading`, `isLoading`, etc. Use composition instead:

```tsx
// ❌ WRONG - 'loading' prop doesn't exist
<Button loading={isPending} disabled={isPending}>Submit</Button>

// ✅ CORRECT - use disabled and conditional rendering
<Button disabled={isPending}>
  {isPending ? 'Enviando...' : 'Enviar'}
</Button>

// ✅ CORRECT - compose with conditional icon
<Button disabled={isPending}>
  {isPending && <ActivityIndicator size="small" />}
  <Text>{isPending ? 'Cargando...' : 'Continuar'}</Text>
</Button>
```

Reference: [React Native Reusables Docs](https://rnr-docs.vercel.app/)

### Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `perf:`

### Git Hooks

Husky runs lint-staged on pre-commit: ESLint + Prettier on `.ts`/`.tsx`, Prettier on `.json`/`.md`/`.css`.

## Key Libraries

| Purpose       | Library                                                       | Notes                               |
| ------------- | ------------------------------------------------------------- | ----------------------------------- |
| Routing       | `expo-router`                                                 | File-based, typed routes enabled    |
| UI Components | `@rn-primitives/*` (React Native Reusables)                   | shadcn-style accessible primitives  |
| Styling       | `nativewind` v4 + `class-variance-authority`                  | `className` on all RN components    |
| Icons         | `lucide-react-native` + `@expo/vector-icons` + `expo-symbols` | Lucide icons + platform icons       |
| Server state  | `@tanstack/react-query` v5                                    | Cache + background refresh          |
| Client state  | `zustand` v5                                                  | Persisted via MMKV                  |
| Forms         | `@tanstack/react-form` + Zod                                  | Type-safe validation                |
| Validation    | `zod` v3                                                      | Runtime validation + type inference |
| HTTP          | `axios`                                                       | External APIs only, not Supabase    |
| Backend       | `@supabase/supabase-js`                                       | DB, auth, realtime                  |
| Lists         | `@shopify/flash-list`                                         | Use instead of FlatList             |
| Storage       | `react-native-mmkv` v3                                        | Sync KV store, requires dev build   |
| Animations    | `react-native-reanimated`                                     | Native-thread animations            |
| Gestures      | `react-native-gesture-handler`                                | Native gesture recognition          |
| Utilities     | `clsx` + `tailwind-merge`                                     | Class name utilities                |

## Troubleshooting

### Development Builds Required

MMKV and FlashList require **development builds** — they don't work in Expo Go. If the app errors in Expo Go, run `pnpm development-builds` or `npx expo run:ios`. New dev builds are also needed after installing packages with native code or config plugins.

### TypeScript Errors with UI Components

If you see errors like `Property 'loading' does not exist on type...` on Button or other UI components:

**Cause**: React Native Reusables components only accept their defined variant props (from cva) plus standard React Native props. They do NOT accept custom props like `loading`, `isLoading`, `icon`, etc.

**Solution**: Use composition with conditional rendering:

```tsx
// ❌ WRONG - these props don't exist on Button
<Button loading={isPending} icon={<Mail />}>Submit</Button>

// ✅ CORRECT - compose the button children
<Button disabled={isPending}>
  <Mail className="text-primary-foreground" size={16} />
  <Text>{isPending ? 'Cargando...' : 'Enviar'}</Text>
</Button>
```

### Accessibility Requirements

- All interactive components must have `accessibilityLabel` and `accessibilityRole`
- Use the `Announcement` component for screen reader announcements
- Form inputs must be wrapped with `Label` component for proper association
- Custom hooks available: `useFormFocusManagement`, `usePrefersReducedMotion`

## Documentation

- `AGENTS.md` — Full AI agent instructions
- `docs/architecture.md` — Data flow diagrams, state management decision tree, auth flow
- `docs/conventions.md` — Naming rules, directory organization, import ordering, TypeScript guidelines
- `docs/environment.md` — Environment setup, Supabase CLI
- Expo docs for AI: https://docs.expo.dev/llms-full.txt (general), https://docs.expo.dev/llms-eas.txt (EAS), https://docs.expo.dev/llms-sdk.txt (SDK)

## Cross-Platform Considerations

This app runs on **iOS, Android, and Web** via React Native Web. Keep in mind:

- Test features on all three platforms when possible
- Use `Platform.select()` for platform-specific code
- Platform-specific files: `*.ios.tsx`, `*.android.tsx`, `*.web.tsx`
- Some features may need web-specific implementations (see `use-color-scheme.web.ts` for hydration handling)
- UI components from React Native Reusables are already cross-platform compatible
