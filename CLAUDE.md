# CLAUDE.md — MilkX Project

## Stack
- Expo SDK 54.0.35 | React 19.0.0 | React Native 0.79.2
- expo-router 6.0.24 (file-based routing in app/ directory)
- expo-sqlite 16.0.10 + drizzle-orm 0.36.4 (local SQLite database)
- Zustand 5.0.14 (state management)
- expo-secure-store + expo-local-authentication (auth)
- Claude Sonnet 4.6 via Anthropic API (src/services/claudeAI.ts)
- EAS Build for Play Store + App Store publishing

## Key Files
- src/constants/theme.ts   → colors, typography, spacing, shadows
- src/types/index.ts       → all TypeScript interfaces
- src/db/schema.ts         → drizzle ORM table definitions
- src/db/client.ts         → SQLite client + runMigrations()
- src/store/authStore.ts   → zustand auth state
- src/services/claudeAI.ts → Claude API integration
- src/utils/calculations.ts → milk payment engine + formatINR()

## Business Rules
- Fat: 2.5% – 9.0% | SNF: 7.0% – 11.0%
- Rate methods: per_liter | per_fat | per_snf | fixed
- Shifts: morning | evening
- IDs: FAR001, FAR002... / COL001, COL002...
- Currency: always use formatINR() from src/utils/calculations.ts

## Commands
```bash
npx expo start --clear        # dev start
eas build --platform android --profile preview     # test APK
eas build --platform android --profile production  # Play Store
eas build --platform ios --profile production      # App Store
```

## IMPORTANT
- babel.config.js only has babel-preset-expo — do NOT add reanimated plugin manually
- .npmrc has legacy-peer-deps=true — required for this SDK
- No overrides block in package.json

## Phase Status
- ✅ Phase 1: Collector (auth, dashboard, farmers, milk entry, payments, profile)
- 🔄 Phase 2: Farmer module
- 📋 Phase 3: Admin panel
