# Build System Setup - Summary

## Overview

Configured automated build system for VibePlay to generate signed IPA (iOS) and APK (Android) files with a single command.

## Changes Made

### 1. Updated Build Configuration (`src/config/build.config.json`)

- Added iOS signing details:
  - Certificate: `ios/GTECH CORPORATION.p12` (password: `admin`)
  - Provisioning Profile: `ios/XCVibeplay.mobileprovision`
- Added Android signing details:
  - Keystore: `android/app/my-release-key.keystore`
  - Store password: `welcome`
  - Key alias: `my-key-alias`
  - Key password: `welcome`

### 2. Created iOS Export Options (`ios/exportOptions.plist`)

- Export method: Ad-hoc
- Signing style: Manual
- Configured provisioning profile mapping

### 3. Updated Android Gradle (`android/app/build.gradle`)

- Added release signing configuration
- Uses `my-release-key.keystore` for release builds
- Properly configured with keystore credentials

### 4. Enhanced Build Script (`scripts/build.js`)

**New Features:**

- Support for `platform="all"` to build both iOS and Android
- Automated iOS code signing with temporary keychain
- Generates signed IPA files
- Generates signed APK files
- Places all artifacts in `output/` directory
- Clean build process with proper error handling

**Build Process:**

- iOS: Clean → Pod install → Setup signing → Archive → Export IPA
- Android: Clean → Gradle assemble → Copy APK to output

### 5. Updated Package Scripts (`package.json`)

Added new build commands:

```json
"build:ios": "node scripts/build.js ios release",
"build:android": "node scripts/build.js android release",
"build:all": "node scripts/build.js all release",
"build": "node scripts/build.js all release"
```

### 6. Created Output Directory

- Created `output/` directory for build artifacts
- Added to `.gitignore` to prevent committing large binary files
- Added `.gitkeep` with documentation

### 7. Documentation

- Created `BUILD.md` with comprehensive build instructions
- Includes troubleshooting guide
- CI/CD integration tips
- Distribution instructions

## Usage

### Build Everything (Recommended)

```bash
npm run build
# or
npm run build:all
```

**Output:**

- `output/VibePlay.ipa` (iOS)
- `output/VibePlay-release.apk` (Android)

### Build Individual Platforms

```bash
npm run build:ios      # iOS only
npm run build:android  # Android only
```

### Debug Builds

```bash
node scripts/build.js all debug
node scripts/build.js ios debug
node scripts/build.js android debug
```

## Signing Credentials Summary

### iOS

- **Certificate File**: `ios/GTECH CORPORATION.p12`
- **Certificate Password**: `admin`
- **Provisioning Profile**: `ios/XCVibeplay.mobileprovision`
- **Bundle ID**: `com.VibePlay.app`

### Android

- **Keystore File**: `android/app/my-release-key.keystore`
- **Keystore Password**: `welcome`
- **Key Alias**: `my-key-alias`
- **Key Password**: `welcome`
- **Application ID**: `com.vibeplay`

## Security Notes

⚠️ **Important**: The signing credentials are currently hardcoded in `build.config.json` for development convenience.

**For production:**

1. Move credentials to environment variables
2. Use CI/CD secrets management
3. Never commit passwords to git (consider using `.env` file)

## Build Output Structure

```
output/
├── VibePlay.ipa                 # iOS app (signed, ready to install)
├── VibePlay-release.apk         # Android app (signed, ready to install)
└── VibePlay.xcarchive/          # iOS archive (intermediate artifact)
```

## Verification

To verify the builds are properly signed:

**iOS:**

```bash
codesign -dv --verbose=4 output/VibePlay.ipa
```

**Android:**

```bash
jarsigner -verify -verbose -certs output/VibePlay-release.apk
```

## Next Steps

1. Test the build command: `npm run build`
2. Verify IPA and APK are created in `output/` directory
3. Install and test on devices
4. Set up CI/CD pipeline if needed

## Troubleshooting

**iOS code signing issues:**

- Ensure Xcode is installed with command line tools
- Certificate must be valid and not expired
- Provisioning profile must match bundle ID

**Android build issues:**

- Ensure Java JDK 11+ is installed
- Verify keystore file exists and password is correct
- Check `ANDROID_HOME` environment variable is set

See `BUILD.md` for detailed troubleshooting steps.
