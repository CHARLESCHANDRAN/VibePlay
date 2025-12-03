# VibePlay Build Guide

This guide explains how to build signed IPA and APK files for VibePlay.

## Prerequisites

### iOS

- macOS with Xcode installed
- CocoaPods installed (`sudo gem install cocoapods`)
- Certificate: `ios/GTECH CORPORATION.p12` (password: `admin`)
- Provisioning Profile: `ios/XCVibeplay.mobileprovision`

### Android

- Java JDK 11 or higher
- Android SDK and build tools
- Keystore: `android/app/my-release-key.keystore` (password: `welcome`)

## Build Commands

### Build Everything (iOS + Android)

```bash
npm run build
# or
npm run build:all
# or
node scripts/build.js all release
```

This will create:

- `output/VibePlay.ipa` (iOS)
- `output/VibePlay-release.apk` (Android)

### Build iOS Only

```bash
npm run build:ios
# or
node scripts/build.js ios release
```

Output: `output/VibePlay.ipa`

### Build Android Only

```bash
npm run build:android
# or
node scripts/build.js android release
```

Output: `output/VibePlay-release.apk`

### Debug Builds

```bash
node scripts/build.js ios debug
node scripts/build.js android debug
node scripts/build.js all debug
```

## Build Configuration

All build settings are in `src/config/build.config.json`:

```json
{
	"ios": {
		"signing": {
			"certificate": "ios/GTECH CORPORATION.p12",
			"certificatePassword": "admin",
			"provisioningProfile": "ios/XCVibeplay.mobileprovision"
		}
	},
	"android": {
		"signing": {
			"keystorePath": "android/app/my-release-key.keystore",
			"keystorePassword": "welcome",
			"keyAlias": "my-key-alias",
			"keyPassword": "welcome"
		}
	}
}
```

## Output Directory

All build artifacts are placed in the `output/` directory at the project root:

```
output/
├── VibePlay.ipa                 # iOS app
├── VibePlay-release.apk         # Android release
└── VibePlay.xcarchive/          # iOS archive (intermediate)
```

The `output/` directory is in `.gitignore` and won't be committed to git.

## Signing Details

### iOS Signing

- **Certificate**: GTECH CORPORATION (.p12)
- **Password**: `admin`
- **Provisioning Profile**: XCVibeplay.mobileprovision
- **Bundle ID**: `com.VibePlay.app`
- **Export Method**: Ad-hoc (for testing/distribution)

### Android Signing

- **Keystore**: my-release-key.keystore
- **Store Password**: `welcome`
- **Key Alias**: `my-key-alias`
- **Key Password**: `welcome`
- **Application ID**: `com.vibeplay`

## Troubleshooting

### iOS Build Issues

**Certificate not found:**

```bash
# Check if certificate is imported
security find-identity -v -p codesigning
```

**Provisioning profile issues:**

```bash
# Check installed profiles
ls ~/Library/MobileDevice/Provisioning\ Profiles/
```

**CocoaPods issues:**

```bash
cd ios
rm -rf Pods Podfile.lock
arch -arm64 pod install
```

### Android Build Issues

**Keystore not found:**

```bash
# Verify keystore exists
ls -la android/app/my-release-key.keystore
```

**Gradle build fails:**

```bash
cd android
./gradlew clean
./gradlew assembleRelease --info
```

**Permission denied on gradlew:**

```bash
chmod +x android/gradlew
```

## CI/CD Integration

To use this build script in CI/CD:

1. Store signing credentials as secrets
2. Place certificate and provisioning profile in the correct locations
3. Run the build command:
   ```bash
   node scripts/build.js all release
   ```
4. Upload artifacts from `output/` directory

## Distribution

### iOS

- **Ad-hoc**: Share `VibePlay.ipa` via TestFlight or direct installation
- **App Store**: Change export method to `app-store` in `exportOptions.plist`

### Android

- **Direct**: Share `VibePlay-release.apk` for installation
- **Play Store**: Upload APK or generate AAB with `./gradlew bundleRelease`

## Version Management

Update version in `src/config/build.config.json`:

```json
{
	"app": {
		"version": "0.1.0"
	}
}
```

Also update in:

- `ios/VibePlay/Info.plist` (CFBundleShortVersionString)
- `android/app/build.gradle` (versionName and versionCode)
