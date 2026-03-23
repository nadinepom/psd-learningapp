# PSD Learning App

A mobile learning app to prepare for the **Professional Scrum Developer (PSD I)** certification exam. Built with React Native and Expo — runs on iOS, Android, and web.

---

## Features

- **336 exam questions** with shuffled answer options on every session
- **Training mode** — work through all questions batch by batch (10 at a time)
- **Review mode** — retry only the questions you previously answered incorrectly
- **Progress tracking** — persistent progress bar showing how many questions you've completed
- **Result screen** — summary of correct / incorrect answers after each batch
- **Light & dark mode** support

---

## Prerequisites

- [Node.js](https://nodejs.org/) >= 18
- [Expo CLI](https://docs.expo.dev/get-started/installation/) (`npm install -g expo-cli`)
- For iOS: Xcode + iOS Simulator
- For Android: Android Studio + Android Emulator

---

## Getting Started

```bash
# Install dependencies
npm install

# Start the Expo dev server
npm start
```

In the terminal output, press:
- `i` — open iOS Simulator
- `a` — open Android Emulator
- `w` — open in browser

---

## Available Scripts

| Command           | Description                          |
|-------------------|--------------------------------------|
| `npm start`       | Start Expo dev server (interactive)  |
| `npm run ios`     | Build and run on iOS Simulator       |
| `npm run android` | Build and run on Android Emulator    |
| `npm run web`     | Start web version in browser         |
| `npm run lint`    | Run ESLint                           |

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
│   ├── context/            # TrainingContext — global training state + persistence
│   ├── hooks/              # useQuestions, useQuestionSession
│   └── screens/            # HomeScreen, QuestionScreen
├── assets/                 # Images, fonts, splash screen
├── constants/
│   └── theme.ts            # Colors and font definitions
└── data/                   # PSD exam questions (Markdown → parsed at runtime)
```

---

## Architecture

This app uses **Expo Router** (file-based routing) with React Native, targeting iOS, Android, and web.

### Key Concepts

**Routing** — `app/` directory maps directly to routes. The root layout wraps everything in a `Stack` navigator.

**Training state** — managed via `TrainingContext` (`src/context/TrainingContext.tsx`), which persists progress using `AsyncStorage`. It tracks:
- seen questions
- incorrect questions
- current question (resume on relaunch)
- review mode flag

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

`@/` maps to the project root (configured in `tsconfig.json`). Use it for all internal imports.

---

## Key Dependencies

| Package                     | Purpose                                 |
|-----------------------------|-----------------------------------------|
| `expo-router`               | File-based navigation                   |
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
