# Compiling Loki Gym PWA to an Android APK

Since the project is built as a Progressive Web App (PWA), you can package it into a native Android `.apk` file using either **Capacitor** (recommended for adding native plugins) or **Bubblewrap** (recommended for a lightweight Trusted Web Activity).

---

## Method 1: Packaging with Capacitor (Recommended)

Capacitor wraps your React web application into a native Android container.

### Prerequisites
- [Node.js & npm](https://nodejs.org/) installed.
- [Android Studio](https://developer.android.com/studio) installed (with Android SDK and command-line tools).

### Step-by-Step Build Instructions

1. **Install Dependencies & Build the Web App**
   Run the following commands in the root of the project:
   ```bash
   npm install
   npm run build
   ```

2. **Initialize Capacitor**
   Install the Capacitor CLI and core libraries, then initialize the configuration:
   ```bash
   npm install @capacitor/core @capacitor/cli
   npx cap init "Loki Gym" "com.lokigym.app" --web-dir=dist
   ```

3. **Add the Android Platform**
   Install the Android platform package and add it to the project:
   ```bash
   npm install @capacitor/android
   npx cap add android
   ```

4. **Sync Web Assets to the Android Project**
   Every time you make changes to the web code and run `npm run build`, sync them to the Android folder:
   ```bash
   npx cap sync
   ```

5. **Compile the Debug APK**
   You can compile the debug APK directly from the command line using the Gradle wrapper:
   - **On Windows (PowerShell/CMD)**:
     ```powershell
     cd android
     ./gradlew assembleDebug
     ```
   - **On macOS/Linux**:
     ```bash
     cd android
     ./gradlew assembleDebug
     ```
   
   Alternatively, you can open the project in Android Studio to build it:
   ```bash
   npx cap open android
   # In Android Studio: Click "Build" > "Build Bundle(s) / APK(s)" > "Build APK(s)"
   ```

6. **Locate the APK**
   Once compiled, the debug APK will be saved at:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Method 2: Packaging with Bubblewrap (TWA)

Bubblewrap is the official Google tool to package PWAs as Trusted Web Activities (TWA) for the Google Play Store. It does not require Android Studio.

### Prerequisites
- [Node.js & npm](https://nodejs.org/) installed.
- Java Development Kit (JDK 17) and Android Command Line Tools installed.

### Step-by-Step Build Instructions

1. **Install Bubblewrap CLI Globally**
   ```bash
   npm install -g @bubblewrap/cli
   ```

2. **Initialize the Project from the Web Manifest**
   Bubblewrap will read your `manifest.json` and automatically set up the Android project:
   ```bash
   bubblewrap init --manifest=https://<your-hosted-pwa-url>/manifest.json
   ```
   *Follow the command prompts to configure the package name, app name, and signing keys.*

3. **Build the APK**
   ```bash
   bubblewrap build
   ```
   This will compile the project and output a signed release APK and a debug APK ready for sideloading onto your Android device.
