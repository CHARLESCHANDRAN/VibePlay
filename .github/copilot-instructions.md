# VibePlay - AI Coding Agent Instructions

## Project Overview

VibePlay is a React Native (CLI) mood-based recommendation app that suggests movies and music based on detected emotions. It's a **JavaScript-only** hackathon starter (no TypeScript) built for rapid prototyping with a path to production ML.

**Key Architecture**: Emotion detection (stubbed) → Mood state (Zustand) → Intent selection → Dual recommendations (TMDb movies + Spotify music via proxy)

## Critical Developer Workflows

### Running the App

```bash
npm run android  # or npm run ios
cd ios && pod install && cd ..  # iOS dependencies
```

### Environment Setup

- **Required**: Create `.env` with `TMDB_API_KEY` and `SPOTIFY_PROXY_BASE` (see `src/config.js` for hardcoded fallbacks)
- Config loaded via `src/config.js` (NOT react-native-config currently - keys are hardcoded for demo)
- Camera permissions required in `AndroidManifest.xml` and `Info.plist` for future ML integration

### Build Requirements

- React Native 0.76.0 with `react-native-reanimated` plugin in `babel.config.js`
- Must include `'react-native-reanimated/plugin'` as last babel plugin for animations to work

## State Management - Zustand Store Pattern

The **single source of truth** is `src/state/store.js`:

```javascript
{
	mood, confidence, energy, valence, intent;
}
```

**Pattern**: Screens read from store, update via `setMood()`, `setIntent()`, etc. No prop drilling.

**Example**: `CaptureMood.js` sets mood → `Intent.js` sets intent → `Recommendations.js` reads both to build params.

## Service Layer Architecture

### Mood → Recommendation Pipeline

1. **Emotion Detection** (`useEmotionDetector.js`): Currently **stubbed with cycling moods**. Swap for VisionCamera + TFLite model later.
2. **Mood Mapping** (`mapMood.js`): `buildParams(mood, intent, energy, valence)` returns `{ spotify: {...}, tmdb: {...} }`
3. **API Calls** (parallel): `discoverMovies()` + `getRecommendations()` in `Recommendations.js`

### Spotify Integration Pattern

- **Proxy Required**: Direct Spotify API needs OAuth. Uses `SPOTIFY_PROXY_BASE` (e.g., Render/Cloudflare Worker)
- **Seed Constraints**: Max 5 seeds total (artists + tracks + genres). See `capSeeds()` in `spotify.js`
- **Defaults**: Falls back to `["pop", "rock", "hip-hop"]` if no seeds provided
- **Parameters**: Expects `target_energy`, `target_valence`, `target_danceability`, etc. (0-1 range)

### TMDb Pattern

- Direct API calls with `api_key` query param
- Genre IDs hardcoded in `mapMood.js`: `{ feelgood: ['35','10751','10402'], serious: ['18','99'], ... }`
- Pagination randomized (pages 1-5) on refresh for variety

## UI/Navigation Conventions

### Screen Flow

`Onboarding → CaptureMood → Intent → Recommendations → Saved`

All screens use `react-navigation` native stack with `headerShown: false`, custom back buttons.

### Theme System (`src/theme/`)

- **Colors** (`colors.js`): Dark neon palette - `bg`, `neon`, `purple`, `lime`, `amber`
- **Styles** (`styles.js`): Shared button/text styles
- **Components**: `NeonButton`, `MoodSelector`, `RecommendationCard` all use theme

### Reusable Components Pattern

- `MoodSelector`: Emoji picker + sliders for energy (-100 to 100 valence, 0-100 energy)
- `NeonButton`: Pressable with neon border glow
- `RecommendationCard`: Movie/track display with poster/album art

## Mood Mapping Logic (Intent System)

**Two-axis system**: `mood` × `intent` → different params

- **Intent "keep"**: Reinforce current mood (e.g., sad + keep → acoustic/cozy)
- **Intent "shift"**: Change mood (e.g., sad + shift → upbeat/feelgood)

See `mapMood.js` switch statement for full matrix. Energy/valence values normalized to 0-1 range for Spotify.

## Common Gotchas

1. **Camera Stubbed**: `useEmotionDetector` cycles fake moods. Don't build camera logic until VisionCamera integration planned.
2. **Spotify Proxy**: App won't get music without valid `SPOTIFY_PROXY_BASE`. TMDb works standalone.
3. **Babel Config**: Reanimated plugin MUST be last in `babel.config.js` or animations break.
4. **Platform Files**: Native changes (permissions, etc.) in `android/` and `ios/` - modify carefully.
5. **No TypeScript**: This is pure JS by design. Don't add type annotations.

## Testing Recommendations Flow

1. Toggle "Live" off in `CaptureMood` to manually select mood
2. Adjust energy/valence sliders in `MoodSelector`
3. Pick intent ("keep" / "shift") in `Intent` screen
4. Verify `buildParams` output in console logs before API calls
5. Recommendations screen logs: "Loading movies/music with params" and "Received X movies/tracks"

## Future Integration Points

- **Emotion ML**: Replace `useEmotionDetector` hook - keep same return shape `{ mood, confidence }`
- **Saved Items**: `Saved.js` screen exists but not implemented
- **Music Player**: Currently opens Spotify URIs in external browser via `Linking`
- **Offline**: No local storage yet - all state resets on app restart
