# VibePlay — React Native CLI Starter (JavaScript)

Tech-Slick AI • Camera + Manual Mood • Movies (TMDb) + Music (Spotify via proxy)

## What This Is
A **JavaScript** starter to overlay onto a fresh **React Native CLI** app. It includes:
- Navigation + dark neon theme
- Screens: Onboarding, CaptureMood, Intent, Recommendations, Saved
- Zustand store for mood/intent/energy/valence
- TMDb integration + Spotify proxy stub
- **Stubbed emotion detector** (simulated) — swap in VisionCamera + model later
- `.env.example` for keys

---

## 1) Create a fresh RN CLI app

```bash
npx react-native init VibePlay --version 0.76.0
cd VibePlay
```

## 2) Copy the template files over
Copy the contents of this zip into your project root, **merging** folders:
- `App.js`
- `src/*`
- `.env.example`
- `package.json` (merge dependencies into your app's package.json if needed)
- `babel.config.js` (ensures Reanimated plugin)

Install deps:

```bash
npm i @react-navigation/native @react-navigation/native-stack react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context react-native-svg react-native-config zustand react-native-vision-camera
```

iOS pods:

```bash
cd ios && pod install && cd ..
```

## 3) Environment variables
Create `.env` at the project root (from `.env.example`):

```
TMDB_API_KEY=YOUR_TMDB_KEY
SPOTIFY_PROXY_BASE=https://your-proxy.example.com
```

`react-native-config` will expose these as `Config.TMDB_API_KEY` & `Config.SPOTIFY_PROXY_BASE`.

## 4) Permissions

### Android (`android/app/src/main/AndroidManifest.xml`)
```xml
<uses-permission android:name="android.permission.CAMERA"/>
```

### iOS (`ios/YourApp/Info.plist`)
```xml
<key>NSCameraUsageDescription</key>
<string>On-device mood detection.</string>
```

## 5) Run it

```bash
npm run android
# or
npm run ios
```

You should see:
- Onboarding → Capture (simulated detection) → Intent → Recommendations (movies from TMDb)

## 6) Next Up: Real Emotion Detection
- Use **react-native-vision-camera** + a **Frame Processor** to run a tiny classifier (TFLite) and update `useEmotionDetector.js` with real outputs.
- Keep inference **on-device**. Only send mood labels to services.

## 7) Spotify Music (Optional)
Stand up a tiny proxy (Cloudflare Worker/Node) for client-credentials + `/recommend` hits. App calls `/recommend?target_energy=...` with features from `mapMood.js`.

## Notes
- Pure **JavaScript**; no TypeScript.
- Designed for **fast hackathon demo** with a clean upgrade path to real camera inference.

**Enjoy VibePlay (JS)!** 🚀
