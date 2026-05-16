# PSD Learning App

<p align="center">
  <img src="assets/images/icon.png" alt="PSD Learning App Icon" width="180" />
</p>

A mobile learning app to prepare for the **Professional Scrum Developer (PSD I)** certification exam. Built with React Native and Expo — runs on iOS, Android, and web. Also deployable as a **Progressive Web App (PWA)** via Firebase Hosting.

---

## Features

- **336 exam questions** with shuffled answer options on every session
- **Training mode** — work through all questions batch by batch (10 at a time)
- **Review mode** — retry only the questions you previously answered incorrectly
- **Progress tracking** — persistent progress bar showing how many questions you've completed
- **Result screen** — summary of correct / incorrect answers after each batch
- **Cloud sync** — progress is saved to **Firebase Firestore** (anonymous auth) and synced across devices
- **Password protection** — simple one-time password gate before accessing the app
- **PWA support** — installable on mobile and desktop via browser (standalone mode, app icon, offline-ready shell)
- **Light & dark mode** support

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + Android Emulator
- For Firebase features: a Firebase project (see [Firebase Setup](#firebase-setup) below)

---

## Getting Started

```bash
# Install dependencies
npm install

# Copy the environment template and fill in your Firebase values
cp .env.example .env

# Start the Expo dev server
npm start
```

In the terminal output, press:
- `i` — open iOS Simulator
- `a` — open Android Emulator
- `w` — open in browser

---

## Available Scripts

| Command              | Description                                      |
|----------------------|--------------------------------------------------|
| `npm start`          | Start Expo dev server (interactive)              |
| `npm run ios`        | Build and run on iOS Simulator                   |
| `npm run android`    | Build and run on Android Emulator                |
| `npm run web`        | Start web version in browser                     |
| `npm run build:web`  | Export static web build + apply PWA post-processing |
| `npm run deploy`     | Build for web and deploy to Firebase Hosting     |
| `npm run lint`       | Run ESLint                                       |
| `npm test`           | Run unit tests (Jest)                            |

---

## Firebase Setup

This app uses Firebase for:
- **Anonymous Authentication** — each user gets a unique ID without registration
- **Firestore** — stores learning progress per user (`/progress/{userId}`)
- **Firebase Hosting** — serves the PWA

### Steps

1. Go to [console.firebase.google.com](https://console.firebase.google.com) and create a project.
2. Add a **Web App** (`</>`) and copy the config values.
3. Enable **Authentication → Sign-in method → Anonymous**.
4. Create a **Firestore Database** (start in test mode, then deploy the included rules).
5. Copy `.env.example` to `.env` and fill in your values:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=...
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
EXPO_PUBLIC_FIREBASE_APP_ID=...
```

6. Deploy Firestore security rules:

```bash
firebase deploy --only firestore:rules
```

> The app works without Firebase (falls back to local `AsyncStorage`), but progress won't sync across devices.

---

## PWA

The web build is a fully installable Progressive Web App:

- `npm run build:web` exports the app and runs `scripts/pwa-postbuild.js`, which generates `manifest.json` and injects PWA meta tags into `index.html`.
- `npm run deploy` builds the PWA and pushes it to Firebase Hosting.
- Users can install the app from the browser (standalone mode, no browser chrome, home screen icon).

---

## Testing

Unit tests cover the core business logic. UI components and Firebase integration are intentionally not tested (fragile or require heavy mocking).

```bash
npm test
```

| Test file | What is tested |
|---|---|
| `src/hooks/__tests__/shuffle.test.ts` | `shuffle` — length, element preservation, no mutation |
| `src/hooks/__tests__/useQuestions.test.ts` | Question filtering (seen exclusion, < 10 fallback, `pendingQuestion` ordering) |
| `src/hooks/__tests__/useQuestionSession.test.ts` | Option selection, reveal logic, batch accumulation, `markResults` flags, auto-reveal timer, option styles |

**Stack:** [jest-expo](https://github.com/expo/expo/tree/main/packages/jest-expo) + [@testing-library/react-native](https://testing-library.com/docs/react-native-testing-library/intro/)

---

## Project Structure

```
psd-learningapp/
├── app/                    # Expo Router file-based routes
│   ├── _layout.tsx         # Root layout (ThemeProvider + Stack navigator)
│   ├── index.tsx           # Entry point → HomeScreen
│   └── question.tsx        # Question route → QuestionScreen
├── src/
│   ├── components/         # Shared UI components (ResultCard, ScreenContainer, …)
│   ├── context/
│   │   ├── AuthContext.tsx     # Password gate — one-time unlock, persisted locally
│   │   └── TrainingContext.tsx # Global training state + Firebase/AsyncStorage sync
│   ├── hooks/
│   │   ├── useQuestions.ts     # Question loading, filtering, shuffle
│   │   ├── useQuestionSession.ts
│   │   └── __tests__/          # Jest unit tests
│   ├── lib/
│   │   └── firebase.ts     # Firebase initialisation (reads from .env)
│   └── screens/            # HomeScreen, PasswordScreen, QuestionScreen
├── scripts/
│   └── pwa-postbuild.js    # Generates manifest.json + injects PWA tags after expo export
├── assets/                 # Images, fonts, splash screen
├── constants/
│   └── theme.ts            # Colors and font definitions
├── firestore.rules         # Firestore security rules (deploy with firebase CLI)
├── firebase.json           # Firebase Hosting + Firestore config
└── src/data/               # PSD exam questions (JSON + source Markdown)
```

---

## Architecture

This app uses **Expo Router** (file-based routing) with React Native, targeting iOS, Android, and web.

### Key Concepts

**Routing** — `app/` directory maps directly to routes. The root layout wraps everything in a `Stack` navigator.

**Authentication** — `AuthContext` manages a simple password gate (`psd-learning`). The unlock state is persisted in `AsyncStorage` so the user only needs to enter it once per device/browser.

**Training state** — managed via `TrainingContext` (`src/context/TrainingContext.tsx`). Progress is synced to **Firestore** when Firebase is configured, and falls back to local `AsyncStorage` otherwise. It tracks:
- seen questions
- incorrect questions
- current question (resume on relaunch)
- review mode flag

**Firebase** — `src/lib/firebase.ts` initialises the Firebase app from `EXPO_PUBLIC_*` environment variables. It exposes `db` (Firestore) and `auth` (anonymous). If the env vars are missing, both are `null` and the app runs in offline-only mode.

**Firestore rules** — each user can only read/write their own document at `/progress/{userId}`. Unauthenticated access is denied.

**Question flow**
1. `useQuestions` loads and filters questions (excludes already-seen ones)
2. `useQuestionSession` manages the current batch: selection state, reveal logic, result accumulation
3. After each batch of 10, a `ResultCard` is shown
4. Incorrect answers are saved; the user can review them from the home screen

**Theming** — light/dark mode via `constants/theme.ts` + `hooks/use-theme-color.ts`. `ThemedText` and `ThemedView` automatically apply the correct colors.

**Icons** — `components/ui/icon-symbol.tsx` abstracts platform differences:
- iOS: native SF Symbols via `expo-symbols`
- Android/web: Material Icons via `@expo/vector-icons`

### Path Aliases

`@/` maps to `src/` (configured in `tsconfig.json`). Use it for all internal imports.

---

## Key Dependencies

| Package                     | Purpose                                 |
|-----------------------------|-----------------------------------------|
| `expo-router`               | File-based navigation                   |
| `firebase`                  | Auth (anonymous) + Firestore progress sync |
| `react-native-paper`        | Material Design UI components           |
| `react-native-reanimated`   | Animations                              |
| `expo-image`                | Optimized image component               |
| `@react-native-async-storage/async-storage` | Persistent progress storage |
| `beads-ui`                  | Additional UI component library         |
| `@expo-google-fonts/fira-sans` | Custom font                          |

---

## Data Source

The Scrum PSD exam questions used in this app are based on the repository by **Daniel Danielecki**:

> [https://github.com/Ditectrev/Scrum-Developer-I-PSD-I-Practice-Tests-Exams-Questions-Answers](https://github.com/Ditectrev/Scrum-Developer-I-PSD-I-Practice-Tests-Exams-Questions-Answers)

---

## Notes

- No test runner is configured yet.
- The new React Native architecture is enabled (`newArchEnabled: true`).
- The React Compiler is enabled (`reactCompiler: true`).
