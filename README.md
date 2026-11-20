# 🌱 Your Growth (Mobile App)

A simple daily check-in app that helps you stay consistent. Answer one question each day, see your history, and get a nudge before you miss two days in a row.

**Backend:** [your-growth-backend](https://github.com/udit065/your-growth-backend)

## Features
- **Daily check-in**: "Did I try today?" → "What's one thing you did for yourself?"
- **Add a missed day**: log yesterday (or any day in the last week) if you forgot
- **Edit or delete** any entry
- **Daily reminder notification** at a time you pick, skipped on days you've already checked in, with a "Don't miss twice" message if you skipped yesterday
- **Streaks**: current streak, best streak, this month, and a last-7-days strip
- **History** grouped by month, with how many days you showed up
- **Offline-first and instant**: everything is cached on the phone, changes save immediately and sync in the background
- Light and dark mode

## Tech stack
React Native · Expo SDK 53 (Router, Notifications, Haptics) · AsyncStorage · Day.js · TypeScript

## Run locally
```bash
npm install
npx expo start
```
Open the app in Expo Go, or in an Android or iOS emulator. The app talks to the deployed API on Render. To use a local backend, create `.env.local` with:
```
EXPO_PUBLIC_API_URL=http://<your-computer-ip>:5000
```

Reminders need a development or production build (`eas build`); Expo Go on Android has limited notification support.

## Project layout
```
app/(tabs)/        Today, History and Settings tabs
app/entry/[date]   Add / edit an entry for a day
lib/store.ts       Offline-first cache + sync queue
lib/api.ts         API client
lib/notifications  Daily reminder scheduling
```

## Author
**Udit Yadav** · [GitHub](https://github.com/udit065) · [LinkedIn](https://www.linkedin.com/in/udit-yadav065)
