# ⚡ Loki Gym - Workout Tracker & Timer

<div align="center">
  <h3>Nordic Titan High-Performance Progressive Workout Tracker, Timer & Cardio GPS</h3>
  <p>Available as a modern Progressive Web App (PWA) and native Android application with direct GitHub self-updating.</p>
</div>

---

## 🚀 Features

- **Titan & Loki AI Workout Architecture**: Targeted muscle-group routines, weekly split planner, customizable rest timers, and exercise library.
- **Cardio GPS & Google Terrain Mapping**: Real-time GPS distance calculation, elevation metrics, average pace tracking, and topographic Google Terrain route display.
- **Background Vocal Cadence**: Native background Text-to-Speech distance announcements at every mile or kilometer boundary.
- **Direct GitHub Releases Self-Updating**: Automatically checks for updates directly from [github.com/blitzkrieg14/lokigym](https://github.com/blitzkrieg14/lokigym) with in-app changelogs and one-tap APK installation.
- **Health Connect & Wearables Sync**: Automatic background step counting, calories, and health metric tracking via Android Health Connect.
- **Local-First & Privacy Focused**: All workouts, PRs, and logs are encrypted and persisted locally on your device with JSON backup/restore and Discord/Home Assistant webhooks.

---

## 🛠️ Local Development

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- npm

### Quick Start
```bash
# 1. Install dependencies
npm install

# 2. Configure Gemini API key for AI features (optional)
cp .env.example .env

# 3. Start development server
npm run dev
```

---

## 📱 Building the Android APK

1. **Build Web Assets**:
   ```bash
   npm run build
   ```

2. **Sync with Capacitor**:
   ```bash
   npx cap sync android
   ```

3. **Compile the APK**:
   ```bash
   cd android
   ./gradlew assembleDebug
   ```

The compiled APK will be generated at:
`android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🔄 Automated Releases & In-App Updates

This repository includes a GitHub Actions CI/CD workflow (`.github/workflows/build-and-release.yml`).

Whenever you push a version tag (e.g., `v3.3.0`) or trigger the workflow manually:
1. GitHub Actions automatically compiles the web app and builds the Android APK.
2. A new GitHub Release is created with the APK attached as an asset (`LokiGym-vX.X.X.apk`).
3. Installed instances of the Loki Gym app will automatically notify users and allow them to download and install the update directly from the app.