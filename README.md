# ExpenseFlow — Daily Expense Tracker

A clean, fully offline personal finance app built with React Native + Expo. No backend, no account required — all data stays on your device.

---

## Screenshots

> Run `npx expo start --web` and open `localhost:8081` in your browser to preview, or install the APK on Android.

---

## Features

### Dashboard
- Monthly income, expenses, and balance at a glance
- Savings rate calculation
- Budget usage summary
- 5 most recent transactions

### Transactions
- Add, edit, and delete income/expense transactions
- Category assignment with custom icons and colors
- Date, description, amount, and optional notes
- Search and filter by type, category, and date range
- Chronological list with real-time updates

### Budgets
- Create monthly, weekly, or yearly budgets per category
- Visual progress bars showing spend vs. limit
- Over-budget warnings

### Reports
- Monthly spending breakdown by category
- Income vs. expense bar charts
- Historical trends

### Categories
- Default categories for both income and expense
- Create and manage custom categories with icons and colors

### Settings & Profile
- Display name and preferred currency
- Dark / light mode toggle
- Export data (CSV / Excel / PDF)
- Import data
- Privacy & Security settings
- Clear all local data

---

## Tech Stack

| Layer | Library | Version |
|---|---|---|
| Framework | Expo | ~56.0.9 |
| Language | TypeScript | ~6.0 |
| Navigation | Expo Router | ~56.2.9 |
| UI Components | React Native Paper | ^5.12.5 |
| State Management | Zustand | ^5.0.3 |
| Server State | TanStack Query | ^5.62.16 |
| Local Database | expo-sqlite | ~56.0.4 |
| Forms | React Hook Form + Zod | ^7 / ^3 |
| Charts | React Native Gifted Charts | ^1.4.31 |
| Animations | React Native Reanimated | 4.3.1 |
| Storage | AsyncStorage | 2.2.0 |

---

## Architecture

```
app/                        # Expo Router screens (file-based routing)
├── (tabs)/                 # Bottom tab navigator
│   ├── index.tsx           # Dashboard
│   ├── transactions.tsx    # Transaction list
│   ├── budgets.tsx         # Budget management
│   ├── reports.tsx         # Charts & reports
│   └── more.tsx            # Settings & profile links
├── transaction/            # Add / edit / detail screens
├── categories/             # Category management
├── profile/                # Profile editor
└── settings/               # Currency, language, export, import, privacy

src/
├── features/               # Feature-scoped components
├── hooks/                  # useTransactions, useBudgets, useCategories
├── services/
│   └── database/           # SQLite repositories (native only)
├── shared/                 # Reusable UI components, utils, constants
├── stores/                 # Zustand stores (auth, transaction, budget, category, ui)
└── types/                  # TypeScript models & API types
```

**Offline-first**: On Android/iOS, data is persisted in SQLite. On web, the Zustand in-memory store is the source of truth (SQLite is not available in the browser).

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- npm or yarn
- [Expo Go](https://expo.dev/go) on your phone (for quick testing), or follow the APK build steps below

### Run locally

```bash
npm install --legacy-peer-deps
npx expo start
```

Then:
- Press **a** to open on Android (requires Expo Go or Android emulator)
- Press **w** to open in the web browser

---

## Build APK for Android

The app uses [EAS Build](https://docs.expo.dev/build/introduction/) (Expo's cloud build service) to generate a standalone APK — no Android Studio required.

### 1. Install EAS CLI

```bash
npm install -g eas-cli
```

### 2. Log in to Expo

Create a free account at [expo.dev](https://expo.dev) if you don't have one.

```bash
eas login
```

### 3. Build the APK

```bash
eas build --platform android --profile preview
```

The `preview` profile in `eas.json` outputs a `.apk` (not `.aab`), so you can install it directly on any Android phone without going through the Play Store.

When the build finishes, EAS will print a download URL. Open it on your phone or scan the QR code to install.

> First build takes ~5–10 minutes (cloud build). Subsequent builds are faster.

### Local build (requires Android Studio)

If you prefer to build locally:

```bash
npx expo prebuild --platform android
cd android
./gradlew assembleRelease
```

The APK will be at `android/app/build/outputs/apk/release/app-release.apk`.

---

## Project Notes

- **No backend** — everything is local. No login, no sync, no CORS.
- **IDR default currency** — can be changed per-user in Profile settings.
- **Web support** — runs in the browser for development/demo. SQLite is skipped; Zustand store handles all state.
- **Dark mode** — toggle in the More tab. Respects system preference by default.

---

## License

MIT
