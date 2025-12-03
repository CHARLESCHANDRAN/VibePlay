# Version Management

This project uses a centralized version configuration in `src/config/build.config.json`.

## Version Configuration

All version information is stored in `src/config/build.config.json`:

```json
{
	"app": {
		"version": "1.0.0", // Semantic version (shown to users)
		"versionCode": 1, // Android version code (integer, increments with each release)
		"buildNumber": "1" // iOS build number (CFBundleVersion)
	}
}
```

### Version Fields

- **`version`**: Semantic version string (e.g., "1.0.0", "2.1.3")

  - Used for: iOS `MARKETING_VERSION`, Android `versionName`, package.json
  - This is what users see in app stores

- **`versionCode`**: Integer version code for Android

  - Used for: Android `versionCode` in build.gradle
  - Must increment with each release to Play Store
  - Can skip numbers (e.g., 1 → 5 → 10)

- **`buildNumber`**: Build number string for iOS
  - Used for: iOS `CURRENT_PROJECT_VERSION` in Xcode project
  - Must increment with each release to App Store
  - Usually matches versionCode but can be different

## How It Works

### Android (build.gradle)

The `android/app/build.gradle` file reads from `build.config.json`:

```gradle
def buildConfig = getBuildConfig()

defaultConfig {
    versionCode buildConfig.app.versionCode
    versionName buildConfig.app.version
}
```

### iOS (build script)

The `scripts/build.js` automatically updates the Xcode project before building:

```javascript
function updateIOSVersion() {
	// Updates MARKETING_VERSION and CURRENT_PROJECT_VERSION
	// in ios/VibePlay.xcodeproj/project.pbxproj
}
```

### package.json Sync

Run `node scripts/sync-version.js` to sync the version to package.json:

```bash
npm run sync-version
```

This is automatically called during builds.

## Releasing a New Version

### 1. Update build.config.json

```json
{
	"app": {
		"version": "1.1.0", // Update version
		"versionCode": 2, // Increment version code
		"buildNumber": "2" // Increment build number
	}
}
```

### 2. Run the sync script

```bash
npm run sync-version
```

This updates `package.json` and displays current version info.

### 3. Build the app

```bash
# Build both platforms
npm run build:all

# Or build individually
npm run build:ios
npm run build:android
```

The build script will:

1. ✅ Sync version to package.json
2. ✅ Update iOS Xcode project with new version/build number
3. ✅ Android gradle reads version from config automatically
4. ✅ Generate signed IPA and APK with correct versions

### 4. Verify versions

After building, the output will show:

```
📱 Version: 1.1.0 (Code: 2, Build: 2)
```

## Version Increment Guidelines

### Semantic Versioning (version field)

- **Major (X.0.0)**: Breaking changes, major redesign
- **Minor (1.X.0)**: New features, non-breaking changes
- **Patch (1.0.X)**: Bug fixes, small improvements

### Version Code / Build Number

- ✅ **MUST** increment with every release
- ✅ Can skip numbers (1 → 5 is fine)
- ✅ Play Store and App Store reject if not incremented
- ⚠️ Cannot go backwards

### Example Version History

```
Release 1: version="1.0.0", versionCode=1, buildNumber="1"
Release 2: version="1.0.1", versionCode=2, buildNumber="2"
Release 3: version="1.1.0", versionCode=3, buildNumber="3"
Release 4: version="2.0.0", versionCode=4, buildNumber="4"
```

## Scripts

Add to package.json:

```json
{
	"scripts": {
		"sync-version": "node scripts/sync-version.js",
		"build:ios": "node scripts/build.js ios release",
		"build:android": "node scripts/build.js android release",
		"build:all": "node scripts/build.js all release"
	}
}
```

## Troubleshooting

### Android build fails with version error

- Check that `versionCode` is an integer (no quotes)
- Ensure `src/config/build.config.json` exists and is valid JSON

### iOS version not updating

- Run `npm run sync-version` before building
- Check that `scripts/build.js` has the `updateIOSVersion()` function
- Verify `ios/VibePlay.xcodeproj/project.pbxproj` is writable

### Version mismatch between platforms

- Always update all three fields together in `build.config.json`
- Run `npm run sync-version` to verify current versions
- Clean build both platforms: `cd ios && pod install`, `cd android && ./gradlew clean`
