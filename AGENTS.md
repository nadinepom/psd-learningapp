# AGENTS.md

This file gives coding agents the repository-specific context needed to work safely and consistently in this project.

## Project overview

PSD Learning is an English-language practice app for Professional Scrum Developer exam questions. It is an Expo 54 / React Native application for iOS, Android, and static web/PWA builds. Expo Router provides file-based routing, React Native Paper provides the main UI primitives, Montserrat is the primary interface font, and Roboto Mono highlights progress and navigation metadata. Learning explanations are bilingual and default to English, with German available as an optional in-card translation.

The app has a simple password gate, presents shuffled questions in batches of 10, tracks progress and incorrect answers, supports a review mode, and resumes a paused question. Progress is always stored locally. On web, configured Firebase Anonymous Auth and Firestore add cloud persistence.

## Commands

```bash
npm install              # Install dependencies
npm start                # Start the interactive Expo development server
npm run ios              # Build and run the iOS app
npm run android          # Build and run the Android app
npm run web              # Start the web version
npm run build:web        # Export static web output and apply PWA post-processing
npm run lint             # Run Expo ESLint
npm test                 # Run the Jest test suite
npm run deploy           # Build web and deploy Hosting/Firestore via Firebase
```

Before handing off code changes, run the narrowest relevant tests plus `npm run lint`. For changes that can affect the web bundle, also run `npm run build:web` when practical.

## Documentation maintenance

Treat `AGENTS.md` and `README.md` as part of every project change. Before finishing any task, review both files and update them whenever the change affects architecture, behavior, setup, commands, dependencies, assets, deployment, testing, or contributor guidance. Keep agent-specific implementation rules in `AGENTS.md` and user/developer-facing project documentation in `README.md`; do not leave known stale statements in either file.

## Repository map

- `app/_layout.tsx`: root providers, Montserrat/Roboto Mono loading, password gate, Paper theme, and stack navigator
- `app/index.tsx`: `/` route; renders `HomeScreen`
- `app/question.tsx`: `/question` route; renders `QuestionScreen`
- `src/screens/`: complete home, password, and question screens
- `src/components/`: shared UI (`AppIcon`, `AppText`, `ResultCard`, `ScreenContainer`)
- `src/components/LearningAidCard.tsx`: compact bilingual answer explanation and official reference shown after checking
- `src/context/AuthContext.tsx`: password validation and persisted unlock state
- `src/context/TrainingContext.tsx`: progress state, review mode, local persistence, and optional Firestore sync
- `src/hooks/useQuestions.ts`: question type, shuffle logic, unseen-question filtering, and resume ordering
- `src/hooks/useQuestionSession.ts`: answer selection, reveal behavior, batch results, and session navigation
- `src/hooks/__tests__/`: Jest tests for question and session behavior
- `src/data/questions.json`: runtime question bank; `correct` contains zero-based option indices
- `src/data/scrum_psd_questions.md`: source/reference material for the question bank
- `src/lib/firebase.ts`: optional Firebase initialization from public Expo environment variables
- `src/lib/learningAid.ts`: topic-based DE/EN learning guidance, official references, and curated question overrides
- `src/constants/theme.ts`: shared color and font constants
- `assets/images/icon.png`: opaque 1024x1024 primary iOS and general app icon
- `assets/images/adaptive-icon.png`: transparent, safe-area-padded Android adaptive foreground
- `assets/images/icon-192.png`, `icon-512.png`, `icon-maskable-512.png`, and `apple-touch-icon.png`: generated-size web/PWA icon assets
- `scripts/pwa-postbuild.js`: PWA manifest and HTML post-processing after Expo export
- `firestore.rules`: per-user access rules for `/progress/{uid}`

## Architecture and behavior

### Routing and providers

Keep route modules in `app/` thin; application UI and behavior belong under `src/`. The provider hierarchy in `app/_layout.tsx` is `AuthProvider` -> `PaperProvider` -> password-gated `TrainingProvider` -> Expo Router `Stack`. Code using `useTraining` must remain below the authenticated gate.

### Authentication

`AuthContext` compares user input with `EXPO_PUBLIC_APP_PASSWORD` and stores only the unlocked state under `psd_authenticated` in AsyncStorage. This is an access gate, not secure user authentication. Because `EXPO_PUBLIC_*` values are bundled into the client, do not treat the password or Firebase configuration as secrets.

### Questions and sessions

`useQuestions` snapshots its inputs once when a question screen mounts. It filters out seen questions while at least 10 unseen questions remain, otherwise it reshuffles the full bank. A pending question is moved to the front. Preserve this session-level behavior unless the requested change explicitly alters it.

`useQuestionSession` is the core business-logic hook. It limits selections to the number of correct options, keeps selections visually neutral until the user explicitly checks them, reveals feedback on the first action, and records/advances on the following action. It persists results at batch boundaries. `getExitSnapshot` collects previously completed questions plus the currently revealed question so a user can save and leave before completing a batch; an unchecked regular-training question remains pending for the next session. Normal training uses batches of 10; review mode uses the entire incorrect-question list. Changes here should include or update focused hook tests.

Incorrect or incomplete resolved answers display `LearningAidCard`; correct answers intentionally skip it to keep successful practice fast and uncluttered. `getLearningAid` derives a bilingual topic takeaway and routes to either the official Scrum Guide or Scrum.org Software Developer Learning Path. The card defaults to English and offers German as the optional secondary language. The `Question` type supports optional `topic`, `explanation`, and `source` fields; use those fields for carefully curated question-specific content, while preserving the topic-based fallback for older entries. Do not describe fallback takeaways as question-specific proof.

Question identity and deduplication currently use the question text. Take care when editing question wording because it can affect saved progress, resume state, and the incorrect-question collection.

### Persistence

`TrainingContext` stores the complete `TrainingData` object in AsyncStorage under `psd_training_data`. Local storage is the fallback on native platforms, when Firebase is unconfigured, and when cloud operations fail.

Cloud persistence is web-only. It signs in anonymously, stores one document at `progress/{uid}`, migrates existing local data for a new cloud user, listens with `onSnapshot`, and still writes locally for offline support. Keep the stored data shape backward-compatible or add an explicit migration when changing it. Preserve the Firestore rule invariant that users can access only their own UID document.

`markResults` accepts an optional pending question text so partial-session answers and resume state are written in one persistence operation. Do not save partial results and then call `pauseTraining` separately: both operations would otherwise derive from the same render snapshot and could overwrite each other.

### Styling and imports

- Use the `@/` alias for imports from `src/`; it maps to `./src/*`, not the repository root.
- Reuse theme values and shared components before adding screen-local duplicates.
- The current Paper provider uses `MD3LightTheme`; do not assume dark mode is implemented merely because `userInterfaceStyle` is `automatic` in `app.json`.
- Use `MaterialCommunityIcons` through `AppIcon` for interface icons on every platform. The icon font is loaded in `app/_layout.tsx` and works on web, iOS, and Android. Prefer a meaningful library glyph over Unicode symbols, emoji, or screen-specific SVG implementations; verify new glyph names against the installed MaterialCommunityIcons map.
- Keep the interface, navigation, feedback, accessibility labels, and app/PWA metadata in English. German is only the optional secondary language inside bilingual learning explanations.

### Visual design system

The interface is intentionally calm, modern, and light. Use the tokens exported by `src/constants/theme.ts` instead of introducing ad-hoc colors. Favor the near-white app background, white surfaces, subtle borders, generous spacing, and restrained blue/cyan accents. Keep shadows soft, corner radii consistent, and semantic success/error states pale enough not to overpower question content.

Primary actions should be prominent but limited to one per view. Follow the shared mobile-first controls in `Layout`: action buttons use the available safe width on compact screens, are centered and capped at `Layout.actionMaxWidth` on larger layouts, and use `Layout.controlHeight`. Icon-only buttons must keep at least `Layout.minTouchTarget` in both dimensions. Secondary actions use outlined or text buttons. On learning screens, prioritize readable question content, clear progress, and large touch targets over decorative elements. Check narrow mobile layouts as well as the centered web/tablet width when changing spacing or fixed-size content.

Keep secondary result information visually subordinate to the score and primary action. Result notices should use concise copy and a centered, constrained panel rather than spanning the full desktop card width.

Use `Fonts.regular`, `Fonts.medium`, `Fonts.semibold`, and `Fonts.bold` for Montserrat UI copy. Use `Fonts.mono`, `Fonts.monoMedium`, or `Fonts.monoBold` sparingly for numeric progress, counters, uppercase eyebrow labels, and similar learning metadata. Keep question and answer prose in Montserrat; do not set entire screens in the monospace face.

## Environment and Firebase

Copy `.env.example` to `.env` and configure the Firebase values when cloud behavior is needed. The password gate additionally expects:

```env
EXPO_PUBLIC_APP_PASSWORD=...
```

The app intentionally continues in local-only mode if Firebase is not configured. Never commit `.env` or real credentials. Firebase changes should be checked against both `src/lib/firebase.ts` and `firestore.rules`.

## Testing guidance

Jest uses `jest-expo` and `@testing-library/react-native`. Existing tests intentionally focus on the business-logic hooks rather than Firebase integration or broad UI snapshots. Prefer deterministic hook/component tests and avoid depending on shuffled order unless `Math.random` is controlled.

When editing the question bank, validate that every entry has a question string, a non-empty options array, and valid zero-based indices in `correct`. Optional learning metadata must provide both `de` and `en` values for `topic` and `explanation`, plus a valid `label` and HTTPS `url` for `source`.

## Generated and deployment files

Do not hand-edit generated Expo output such as `dist/`. Make PWA changes in `app.json` or `scripts/pwa-postbuild.js`, then regenerate with `npm run build:web`. Do not run `npm run deploy` unless deployment is explicitly requested.
