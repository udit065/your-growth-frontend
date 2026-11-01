# 🌱 Your Growth (Mobile App)

A simple daily check-in app that helps you stay consistent. Answer one question each day, see your history, and get a nudge if you're about to miss two days in a row.

**Backend:** [your-growth-backend](https://github.com/udit065/your-growth-backend)

## Features
- **Daily check-in** that can be submitted once per day
- **"Don't miss twice" reminder** when your last entry was two or more days ago
- **History tab** showing your past entries
- Tab navigation with Expo Router

## Tech stack
React Native · Expo (Router, Haptics, Blur) · React Navigation · Axios · Day.js · TypeScript

## Run locally
```bash
npm install
npx expo start
```
Open the app in Expo Go, or in an Android or iOS emulator. The app talks to the deployed API on Render. To use a local backend, change `API_URL` in `app/screens`.

## Author
**Udit Yadav** · [GitHub](https://github.com/udit065) · [LinkedIn](https://www.linkedin.com/in/udit-yadav065)
