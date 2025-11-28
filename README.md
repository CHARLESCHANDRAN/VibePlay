# VibePlay — React Native CLI Starter (JavaScript)

Integrated: Google Cloud Vision API for emotion detection

A React Native mood-based recommendation app that suggests movies and music based on detected emotions. Tech-Slick AI • Camera + Manual Mood • Movies (TMDb) + Music (Spotify via proxy)

## 📁 Project Structure## What This Is

A **JavaScript** starter to overlay onto a fresh **React Native CLI** app. It includes:

`````- Navigation + dark neon theme

VibePlay/- Screens: Onboarding, CaptureMood, Intent, Recommendations, Saved

├── src/- Zustand store for mood/intent/energy/valence

│   ├── components/          # Reusable UI components- TMDb integration + Spotify proxy stub

│   │   ├── CameraCapture.js- **Stubbed emotion detector** (simulated) — swap in VisionCamera + model later

│   │   ├── ErrorBoundary.js- `.env.example` for keys

│   │   ├── MoodSelector.js

│   │   ├── NeonButton.js---

│   │   ├── RecommendationCard.js

│   │   ├── SkeletonLoaders.js## 1) Create a fresh RN CLI app

│   │   └── Toast.js

│   ├── screens/             # Screen-level components```bash

│   │   ├── CaptureMood.jsnpx react-native init VibePlay --version 0.76.0

│   │   ├── Intent.jscd VibePlay

│   │   ├── Onboarding.js```

│   │   ├── Recommendations.js

│   │   └── Saved.js## 2) Copy the template files over

│   ├── navigation/          # Navigation configurationCopy the contents of this zip into your project root, **merging** folders:

│   │   └── AppNavigator.js- `App.js`

│   ├── hooks/               # Custom React hooks- `src/*`

│   │   ├── useEmotionDetector.js- `.env.example`

│   │   └── useToast.js- `package.json` (merge dependencies into your app's package.json if needed)

│   ├── services/            # API and external services- `babel.config.js` (ensures Reanimated plugin)

│   │   ├── mapMood.js

│   │   ├── spotify.jsInstall deps:

│   │   ├── tmdb.js

│   │   └── visionApi.js```bash

│   ├── config/              # App configurationnpm i @react-navigation/native @react-navigation/native-stack react-native-gesture-handler react-native-reanimated react-native-screens react-native-safe-area-context react-native-svg react-native-config zustand react-native-vision-camera

│   │   ├── index.js         # Environment variables```

│   │   └── build.config.json # Build configuration

│   ├── state/               # State management (Zustand)iOS pods:

│   │   └── store.js

│   ├── theme/               # Theme and styling```bash

│   │   ├── colors.jscd ios && pod install && cd ..

│   │   └── styles.js```

│   ├── utils/               # Utility functions

│   └── assets/              # Images, fonts, etc.## 3) Environment variables

├── ios/                     # Native iOS projectCreate `.env` at the project root (from `.env.example`):

├── android/                 # Native Android project

├── scripts/                 # Build and automation scripts```

│   └── build.jsTMDB_API_KEY=YOUR_TMDB_KEY

├── App.js                   # Root componentSPOTIFY_PROXY_BASE=https://your-proxy.example.com

├── package.json```

└── README.md

````react-native-config` will expose these as `Config.TMDB_API_KEY` & `Config.SPOTIFY_PROXY_BASE`.



## 🚀 Quick Start## 4) Permissions



### Prerequisites### Android (`android/app/src/main/AndroidManifest.xml`)

```xml

- Node.js >= 18<uses-permission android:name="android.permission.CAMERA"/>

- React Native CLI```

- Xcode (for iOS)

- Android Studio (for Android)### iOS (`ios/YourApp/Info.plist`)

- CocoaPods```xml

<key>NSCameraUsageDescription</key>

### Installation<string>On-device mood detection.</string>

`````

````bash

# Install dependencies## 5) Run it

npm install

```bash

# Install iOS podsnpm run android

cd ios && arch -arm64 pod install && cd ..# or

```npm run ios

````

### Environment Setup

You should see:

Create a `.env` file in the root directory:- Onboarding → Capture (simulated detection) → Intent → Recommendations (movies from TMDb)

````env## 6) Next Up: Real Emotion Detection

SPOTIFY_PROXY_BASE=https://your-spotify-proxy.com/api/spotify- Use **react-native-vision-camera** + a **Frame Processor** to run a tiny classifier (TFLite) and update `useEmotionDetector.js` with real outputs.

TMDB_API_KEY=your_tmdb_api_key- Keep inference **on-device**. Only send mood labels to services.

VISION_API_ENDPOINT=http://your-vision-api-endpoint.com

```## 7) Spotify Music (Optional)

Stand up a tiny proxy (Cloudflare Worker/Node) for client-credentials + `/recommend` hits. App calls `/recommend?target_energy=...` with features from `mapMood.js`.

**Important**: No spaces around `=` sign in `.env` file!

## Notes

## 🔨 Building & Running- Pure **JavaScript**; no TypeScript.

- Designed for **fast hackathon demo** with a clean upgrade path to real camera inference.

### Development

**Enjoy VibePlay (JS)!** 🚀

```bash
# Start Metro bundler
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
````

### Production Builds

```bash
# Build iOS release
npm run ios:release

# Build Android release
npm run android:release
```

### Using Build Script

The project includes a unified build script that uses `src/config/build.config.json`:

```bash
# iOS debug build
node scripts/build.js ios debug

# iOS release build
node scripts/build.js ios release

# Android debug build
node scripts/build.js android debug

# Android release build
node scripts/build.js android release
```

## ⚙️ Configuration

### Build Configuration

Edit `src/config/build.config.json` to manage:

- App name and bundle identifiers
- iOS signing certificates and provisioning profiles
- Android keystore configuration
- Build variants and schemes

### App Configuration

Edit `src/config/index.js` for:

- API endpoints
- Feature flags
- Environment-specific settings

## 🏗️ Architecture

### State Management

- **Zustand** for global state (`src/state/store.js`)
- Manages mood, energy, valence, and intent

### Navigation

- **React Navigation** (Native Stack)
- Flow: Onboarding → CaptureMood → Intent → Recommendations → Saved

### Emotion Detection

- **Google Cloud Vision API** for face emotion detection
- Images sent securely to backend (not stored permanently)
- Image compression before upload (max 800x800px, 70% quality)
- Maps 6 Vision API fields to 9 app emotions
- Backend URL: AWS Elastic Beanstalk (configurable in `.env`)

**Privacy Note:** Photos are processed via Google Cloud Vision API through your backend server. Images are analyzed for facial features and emotion detection but are not stored. The app receives only the emotion analysis results.

### Recommendations

- **TMDb API** for movie recommendations
- **Spotify API** (via proxy) for music recommendations
- Mood mapping system converts emotions to API parameters

## 🎨 Theme System

Located in `src/theme/`:

- `colors.js` - Dark neon palette
- `styles.js` - Shared component styles

## 🔒 Privacy & Security

### How Emotion Detection Works

1. **Capture**: App captures photo using device camera
2. **Compress**: Image resized to 800x800px at 70% quality (~100-300KB)
3. **Send**: Compressed image sent to your backend via HTTPS
4. **Process**: Backend forwards to Google Cloud Vision API
5. **Analyze**: Vision API returns emotion likelihood scores
6. **Map**: App maps 6 API fields to 9 emotions (happy, sad, etc.)
7. **Discard**: Image is not stored - only emotion data returned

### Data Flow

```
Camera → App → Your Backend → Google Vision API → Emotion Results
         ↓                                              ↓
    [Compressed]                                   [No Storage]
```

### Security Measures

- ✅ Images compressed before transmission (reduces bandwidth)
- ✅ HTTPS encryption for all API calls (production recommended)
- ✅ No permanent storage of photos
- ✅ Only emotion analysis results retained
- ✅ Backend URL configurable (use your own server)
- ⚠️ Development: HTTP allowed for local testing (disable in production)

### Privacy Considerations

**What's Sent:**

- Compressed photo (temporary, for analysis only)

**What's NOT Sent:**

- User identity
- Location data
- Device information
- Personal metadata

**What You Control:**

- Backend server location
- Vision API credentials
- Data retention policies (on your backend)

**Recommendation for Production:**

- Use HTTPS for all connections
- Implement rate limiting on backend
- Add authentication if needed
- Consider GDPR/privacy compliance for your region

## 🧹 Clean Commands

```bash
# Full clean and reinstall
npm run clean

# Clean iOS build
cd ios && rm -rf build Pods Podfile.lock

# Clean Android build
cd android && ./gradlew clean
```

## 📱 Platform-Specific Notes

### iOS

- **Minimum iOS**: 13.0
- **App Transport Security**: HTTP allowed for development backend
- **Permissions**: Camera, Photo Library

### Android

- **Minimum SDK**: 21 (Android 5.0)
- **Target SDK**: 34
- **Permissions**: Camera, Internet

## 🔧 Troubleshooting

### Metro Bundler Issues

```bash
# Reset Metro cache
npm start -- --reset-cache
```

### iOS Build Issues

```bash
# Clean and reinstall pods
cd ios
rm -rf Pods Podfile.lock build
arch -arm64 pod install
cd ..
```

### Android Build Issues

```bash
# Clean Gradle
cd android
./gradlew clean
cd ..
```

## 📦 Dependencies

### Core

- React Native 0.76.0
- React 18.2.0
- React Navigation 7.x
- Zustand 5.0.8

### UI & Camera

- react-native-vision-camera 4.7.2
- react-native-reanimated 3.16.1
- react-native-safe-area-context 4.8.2
- @bam.tech/react-native-image-resizer 3.0.11

### Utilities

- react-native-fs 2.20.0
- react-native-dotenv 3.4.11

## 🤝 Contributing

1. Follow the existing project structure
2. Keep components in appropriate directories
3. Update `build.config.json` for configuration changes
4. Run linting before committing: `npm run lint`

## 📄 License

MIT

## 🙏 Acknowledgments

- Google Cloud Vision API for emotion detection
- TMDb for movie data
- Spotify for music recommendations
