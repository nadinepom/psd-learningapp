# PSD Learning App

<p align="center">
  <img src="assets/images/icon.png" alt="PSD Learning App Icon" width="180" />
</p>

A mobile learning app to prepare for the **Professional Scrum Developer (PSD I)** certification exam. Built with React Native and Expo — runs on iOS, Android, and web. Also deployable as a **Progressive Web App (PWA)** via Firebase Hosting.

---

## Features

- **336 exam questions** with shuffled answer options on every session
- **English-first interface** — navigation, status messages, controls, metadata, and PWA language settings are consistently English
- **Training mode** — work through all questions batch by batch (10 at a time)
- **Save and exit anytime** — checked answers are saved even before a 10-question batch is complete, and an unchecked question is resumed later
- **Review mode** — retry only the questions you previously answered incorrectly
- **Focused answer feedback** — selections stay neutral until they are checked, so the UI does not reveal the solution early
- **Bilingual learning aids** — incorrect answers reveal the correct answer and a concise German or English takeaway without interrupting successful answers
- **Official references** — each learning aid links to the Scrum Guide or Scrum.org Software Developer Learning Path for further study
- **Progress tracking** — persistent progress bar showing how many questions you've completed
- **Result screen** — summary of correct / incorrect answers after each batch
- **Cloud sync** — progress is saved to **Firebase Firestore** (anonymous auth) and synced across devices
- **Password protection** — simple one-time password gate before accessing the app
- **PWA support** — installable on mobile and desktop via browser (standalone mode, app icon, offline-ready shell)
- **Calm responsive interface** — white surfaces, generous spacing, accessible contrast, and mobile-friendly layouts

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- Expo CLI is included with the project dependencies; no global installation is required.
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

| Command             | Description                                         |
| ------------------- | --------------------------------------------------- |
| `npm start`         | Start Expo dev server (interactive)                 |
| `npm run ios`       | Build and run on iOS Simulator                      |
| `npm run android`   | Build and run on Android Emulator                   |
| `npm run web`       | Start web version in browser                        |
| `npm run build:web` | Export static web build + apply PWA post-processing |
| `npm run deploy`    | Build for web and deploy to Firebase Hosting        |
| `npm run lint`      | Run ESLint                                          |
| `npm test`          | Run unit tests (Jest)                               |

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
EXPO_PUBLIC_APP_PASSWORD=...
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

| Test file                                        | What is tested                                                                                            |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `src/hooks/__tests__/shuffle.test.ts`            | `shuffle` — length, element preservation, no mutation                                                     |
| `src/hooks/__tests__/useQuestions.test.ts`       | Question filtering (seen exclusion, < 10 fallback, `pendingQuestion` ordering)                            |
| `src/hooks/__tests__/useQuestionSession.test.ts` | Neutral selection, reveal flow, batch accumulation, partial-session exit snapshots, and option styles     |
| `src/lib/__tests__/learningAid.test.ts`          | Topic matching, official source selection, and curated explanation overrides                             |

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
└── src/
    └── constants/
        └── theme.ts        # Colors and font definitions
├── firestore.rules         # Firestore security rules (deploy with firebase CLI)
├── firebase.json           # Firebase Hosting + Firestore config
└── src/data/               # PSD exam questions (JSON + source Markdown)
```

---

## Architecture

This app uses **Expo Router** (file-based routing) with React Native, targeting iOS, Android, and web.

### Key Concepts

**Routing** — `app/` directory maps directly to routes. The root layout wraps everything in a `Stack` navigator.

**Authentication** — `AuthContext` manages a simple password gate. The password is read from the `EXPO_PUBLIC_APP_PASSWORD` environment variable. The unlock state is persisted in `AsyncStorage` so the user only needs to enter it once per device/browser.

**Training state** — managed via `TrainingContext` (`src/context/TrainingContext.tsx`). Progress is synced to **Firestore** when Firebase is configured, and falls back to local `AsyncStorage` otherwise. It tracks:

- seen questions
- incorrect questions
- current question (resume on relaunch)
- review mode flag

**Firebase** — `src/lib/firebase.ts` initialises the Firebase app from `EXPO_PUBLIC_*` environment variables. It exposes `db` (Firestore) and `auth` (anonymous). If the env vars are missing, both are `null` and the app runs in offline-only mode.

**Firestore rules** — each user can only read/write their own document at `/progress/{userId}`. Unauthenticated access is denied.

**Question flow**

1. `useQuestions` loads and filters questions (excludes already-seen ones)
2. `useQuestionSession` manages the current batch: selection state, explicit answer checking, reveal logic, and result accumulation
3. The first action checks the answer without advancing; selected options remain visually neutral until this point
4. After an incorrect or incomplete answer, `LearningAidCard` shows the correct answer, a DE/EN topic takeaway, and an official reference; correct answers continue without the extra card
5. The next action advances; after each batch of 10, a `ResultCard` is shown
6. Closing early saves every checked answer immediately and returns to the home screen; an unchecked current question is kept for the next session
7. Incorrect answers are saved; the user can review them from the home screen

**Theming** — shared color and typography tokens live in `src/constants/theme.ts`. The current React Native Paper provider uses a customized `MD3LightTheme`. Montserrat is used for readable learning content, headings, and controls; Roboto Mono is reserved for progress values, counters, and small orientation labels. The visual system favors a near-white background, white cards, subtle borders, restrained blue/cyan accents, and soft semantic colors for correct and incorrect answers.

**Interface flow** — the home screen presents progress and accuracy in a compact status card. Actions follow a mobile-first rule: they use the available safe width on small screens and are centered with a 300 px maximum on larger layouts. Icon-only controls keep at least a 44×44 px touch target. Questions use a clear progress indicator, a focused white question card, and bordered answer cards. The password and result screens use the same spacing, radius, and surface language; secondary result information stays in a narrower centered panel so it does not compete with the score.

**Icons** — `@expo/vector-icons` (MaterialCommunityIcons) is loaded once in the root layout and rendered through the shared `AppIcon` wrapper on web, iOS, and Android. Navigation, answer states, password visibility, actions, and results use the same vector-icon source instead of platform-specific text glyphs or emoji.

**Learning aids** — after an incorrect or incomplete answer, `src/lib/learningAid.ts` assigns a concise bilingual topic explanation and an official reference from the question and answer text. Correct answers receive only the compact success state and can continue immediately. The card defaults to English and lets learners switch the explanation to German. A question can optionally define its own `topic`, `explanation`, and `source`; curated values take precedence over the fallback topic guidance. This lets the question bank gain detailed editorial explanations incrementally without leaving existing questions unsupported.

**App icon** — `assets/images/icon.png` is the opaque 1024×1024 primary icon used by iOS, the web configuration, the splash screen, and the home screen. Android uses the safe-area-padded `adaptive-icon.png`. The PWA build copies correctly sized 192×192, 512×512, maskable, and Apple Touch variants from `assets/images/`.

### Path Aliases

`@/` maps to `src/` (configured in `tsconfig.json`). Use it for all internal imports.

---

## Key Dependencies

| Package                                     | Purpose                                    |
| ------------------------------------------- | ------------------------------------------ |
| `expo-router`                               | File-based navigation                      |
| `@expo/vector-icons`                        | Cross-platform Material Community Icons    |
| `firebase`                                  | Auth (anonymous) + Firestore progress sync |
| `react-native-paper`                        | Material Design UI components              |
| `react-native-reanimated`                   | Animations                                 |
| `expo-image`                                | Optimized image component                  |
| `@react-native-async-storage/async-storage` | Persistent progress storage                |
| `beads-ui`                                  | Additional UI component library            |
| `@expo-google-fonts/montserrat`             | Primary UI and learning-content font       |
| `@expo-google-fonts/roboto-mono`            | Progress, counters, and metadata font      |

---

## Data Source

The Scrum PSD exam questions used in this app are based on the repository by **Daniel Danielecki**:

> [https://github.com/Ditectrev/Scrum-Developer-I-PSD-I-Practice-Tests-Exams-Questions-Answers](https://github.com/Ditectrev/Scrum-Developer-I-PSD-I-Practice-Tests-Exams-Questions-Answers)

---

## Notes

- The new React Native architecture is enabled (`newArchEnabled: true`).
- The React Compiler is enabled (`reactCompiler: true`).
- Keep this README and `AGENTS.md` synchronized with project changes. Update them whenever behavior, architecture, setup, commands, dependencies, assets, testing, or deployment changes.
