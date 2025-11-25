#!/usr/bin/env node
/**
 * Build automation script for VibePlay
 * Uses unified build.config.json for iOS and Android builds
 * Generates signed IPA and APK files in output/ directory
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load build configuration
const configPath = path.join(__dirname, "../src/config/build.config.json");
const buildConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

const platform = process.argv[2]; // 'ios', 'android', or 'all'
const mode = process.argv[3] || "release"; // 'debug' or 'release'

if (!platform || !["ios", "android", "all"].includes(platform)) {
	console.error(
		"❌ Usage: node scripts/build.js <ios|android|all> [debug|release]"
	);
	process.exit(1);
}

const outputDir = path.join(__dirname, "../output");

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
	fs.mkdirSync(outputDir, { recursive: true });
	console.log(`📁 Created output directory: ${outputDir}\n`);
}

console.log(
	`\n🚀 Building ${buildConfig.app.name} for ${platform} (${mode})\n`
);
console.log(`📦 Bundle ID: ${buildConfig.app.bundleId}`);
console.log(`📱 Version: ${buildConfig.app.version}`);
console.log(`📂 Output: ${outputDir}\n`);

try {
	if (platform === "all") {
		console.log("🔨 Building for both iOS and Android...\n");
		buildIOS(mode);
		buildAndroid(mode);
	} else if (platform === "ios") {
		buildIOS(mode);
	} else {
		buildAndroid(mode);
	}

	console.log(`\n✅ Build completed successfully!\n`);
	console.log(`📦 Build artifacts are in: ${outputDir}\n`);
} catch (error) {
	console.error(`\n❌ Build failed:`, error.message);
	process.exit(1);
}

function buildIOS(mode) {
	console.log("\n📱 ========== iOS BUILD ==========\n");

	const config = buildConfig.ios;
	const configuration =
		mode === "release"
			? config.configuration.release
			: config.configuration.debug;

	console.log(`📱 iOS Configuration: ${configuration}`);
	console.log(`📂 Workspace: ${config.workspace}`);
	console.log(`🎯 Scheme: ${config.scheme}`);
	console.log(`🔑 Certificate: ${config.signing.certificate}`);
	console.log(`📜 Provisioning: ${config.signing.provisioningProfile}\n`);

	// Install pods
	console.log("📦 Installing CocoaPods...");
	execSync("cd ios && arch -arm64 pod install", { stdio: "inherit" });

	// Import certificate to temporary keychain for CI/automation
	const certPath = path.join(__dirname, "..", config.signing.certificate);
	const certPassword = config.signing.certificatePassword;
	const provisionPath = path.join(
		__dirname,
		"..",
		config.signing.provisioningProfile
	);

	console.log("\n🔐 Setting up code signing...");

	// Create a temporary keychain
	const keychainName = "build.keychain";
	const keychainPassword = "temp123";

	try {
		// Delete keychain if it exists
		try {
			execSync(`security delete-keychain ${keychainName}`, {
				stdio: "ignore",
			});
		} catch (e) {
			// Keychain doesn't exist, that's fine
		}

		// Create temporary keychain
		execSync(
			`security create-keychain -p ${keychainPassword} ${keychainName}`,
			{ stdio: "inherit" }
		);
		execSync(`security default-keychain -s ${keychainName}`, {
			stdio: "inherit",
		});
		execSync(
			`security unlock-keychain -p ${keychainPassword} ${keychainName}`,
			{
				stdio: "inherit",
			}
		);
		execSync(`security set-keychain-settings -t 3600 -u ${keychainName}`, {
			stdio: "inherit",
		});

		// Import certificate
		console.log("📥 Importing certificate...");
		execSync(
			`security import "${certPath}" -k ${keychainName} -P ${certPassword} -T /usr/bin/codesign -T /usr/bin/security`,
			{ stdio: "inherit" }
		);

		// Set key partition list
		execSync(
			`security set-key-partition-list -S apple-tool:,apple: -s -k ${keychainPassword} ${keychainName}`,
			{ stdio: "ignore" }
		);

		// Install provisioning profile
		console.log("📥 Installing provisioning profile...");
		const provisioningDir = path.join(
			process.env.HOME,
			"Library/MobileDevice/Provisioning Profiles"
		);
		if (!fs.existsSync(provisioningDir)) {
			fs.mkdirSync(provisioningDir, { recursive: true });
		}

		// Get UUID from provisioning profile
		const profileContent = execSync(`security cms -D -i "${provisionPath}"`, {
			encoding: "utf8",
		});
		const uuidMatch = profileContent.match(
			/<key>UUID<\/key>\s*<string>([^<]+)<\/string>/
		);
		const uuid = uuidMatch ? uuidMatch[1] : "profile";

		fs.copyFileSync(
			provisionPath,
			path.join(provisioningDir, `${uuid}.mobileprovision`)
		);

		console.log("✅ Code signing setup complete\n");
	} catch (error) {
		console.warn(
			"⚠️  Automated code signing setup failed. Make sure certificates are installed in Xcode."
		);
		console.warn(`   Error: ${error.message}\n`);
	}

	// Clean build folder
	console.log("🧹 Cleaning iOS build...");
	const projectPath = path.join(__dirname, "..", config.workspace);
	execSync(
		`xcodebuild clean -workspace "${projectPath}" -scheme ${config.scheme} -configuration ${configuration}`,
		{ stdio: "inherit" }
	);

	// Build archive
	console.log("\n🔨 Building iOS archive...");
	const archivePath = path.join(outputDir, "VibePlay.xcarchive");
	const teamId = buildConfig.ios.teamId;
	const provisioningProfileSpecifier =
		buildConfig.ios.signing.provisioningProfileSpecifier || "XCVibeplay";

	execSync(
		`xcodebuild archive -workspace "${projectPath}" -scheme ${config.scheme} -configuration ${configuration} -archivePath "${archivePath}" DEVELOPMENT_TEAM=${teamId} PROVISIONING_PROFILE_SPECIFIER="${provisioningProfileSpecifier}" CODE_SIGN_STYLE=Manual CODE_SIGN_IDENTITY="iPhone Distribution"`,
		{ stdio: "inherit" }
	);

	// Export IPA
	console.log("\n📦 Exporting IPA...");
	const exportPath = outputDir;
	const exportOptions = path.join(
		__dirname,
		"..",
		config.signing.exportOptionsPlist
	);

	execSync(
		`xcodebuild -exportArchive -archivePath "${archivePath}" -exportPath "${exportPath}" -exportOptionsPlist "${exportOptions}"`,
		{ stdio: "inherit" }
	);

	// Clean up temporary keychain
	try {
		execSync(`security delete-keychain ${keychainName}`, { stdio: "ignore" });
	} catch (e) {
		// Ignore cleanup errors
	}

	console.log(`\n✅ iOS IPA created: ${path.join(outputDir, "VibePlay.ipa")}`);
}

function buildAndroid(mode) {
	console.log("\n🤖 ========== ANDROID BUILD ==========\n");

	const config = buildConfig.android;

	console.log(`🤖 Android Application ID: ${config.applicationId}`);
	console.log(`📂 Module: ${config.module}`);
	console.log(`🔑 Keystore: ${config.signing.keystorePath}\n`);

	// Clean build
	console.log("🧹 Cleaning Android build...");
	execSync("cd android && ./gradlew clean", { stdio: "inherit" });

	// Build APK
	console.log("\n🔨 Building Android APK...");
	const buildType = mode === "release" ? "Release" : "Debug";
	const gradleTask = `assemble${buildType}`;

	execSync(`cd android && ./gradlew ${gradleTask}`, { stdio: "inherit" });

	// Copy APK to output directory
	const apkSource = path.join(
		__dirname,
		`../android/app/build/outputs/apk/${mode}/app-${mode}.apk`
	);
	const apkDest = path.join(outputDir, `VibePlay-${mode}.apk`);

	if (fs.existsSync(apkSource)) {
		fs.copyFileSync(apkSource, apkDest);
		console.log(`\n✅ Android APK created: ${apkDest}`);
	} else {
		console.error(`\n❌ APK not found at: ${apkSource}`);
	}
}
