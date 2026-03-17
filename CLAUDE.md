# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start              # Start Expo dev server (interactive: i=iOS, a=Android, w=web)
npm run ios            # Start with iOS simulator
npm run android        # Start with Android emulator
npm run web            # Start web version
npm run lint           # Run ESLint (expo lint)
```

No test runner is configured yet.

## Architecture

This is an **Expo Router** app (file-based routing) with React Native, targeting iOS, Android, and web. The new React Native architecture is enabled (`newArchEnabled: true`), along with the React Compiler (`reactCompiler: true`).

### Routing

Expo Router uses the `app/` directory for file-based routing:
- `app/_layout.tsx` — root layout wrapping everything in `ThemeProvider` + `Stack` navigator
- `app/(tabs)/` — tab group with `_layout.tsx` defining the bottom tab bar
- `app/modal.tsx` — modal screen accessible via `href="/modal"`

### Theming

The app supports light/dark mode automatically:
- `constants/theme.ts` exports `Colors` (light/dark palette) and `Fonts` (platform-specific font stacks)
- `hooks/use-theme-color.ts` — resolves a color key from `Colors` based on current scheme, with optional per-component override
- `hooks/use-color-scheme.ts` — re-exports `useColorScheme` from `react-native` (web variant in `use-color-scheme.web.ts`)
- Themed primitives: `ThemedText` and `ThemedView` in `components/` automatically apply colors from the theme

### Icons

`components/ui/icon-symbol.tsx` abstracts platform icon differences:
- iOS: native SF Symbols via `expo-symbols`
- Android/web: Material Icons via `@expo/vector-icons`
- New icons need a mapping added to the `MAPPING` object (SF Symbol name → Material Icon name)

### Path Aliases

`@/` maps to the project root (configured in `tsconfig.json`). Use it for all internal imports.

### Key Dependencies

- `expo-router` — file-based navigation
- `react-native-reanimated` — animations (e.g., `HelloWave`)
- `expo-image` — optimized image component (prefer over RN's `Image`)
- `beads-ui` — UI component library (included as dependency)
