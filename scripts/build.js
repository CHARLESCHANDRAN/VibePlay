#!/usr/bin/env node
/**
 * Build automation script for VibePlay
 * Uses unified build.config.json for iOS and Android builds
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Load build configuration
const configPath = path.join(__dirname, "../src/config/build.config.json");
const buildConfig = JSON.parse(fs.readFileSync(configPath, "utf8"));

const platform = process.argv[2]; // 'ios' or 'android'
const mode = process.argv[3] || "debug"; // 'debug' or 'release'

if (!platform || !["ios", "android"].includes(platform)) {
	console.error(
		"❌ Usage: node scripts/build.js <ios|android> [debug|release]"
	);
	process.exit(1);
}

console.log(
	`\n🚀 Building ${buildConfig.app.name} for ${platform} (${mode})\n`
);
console.log(`📦 Bundle ID: ${buildConfig.app.bundleId}`);
console.log(`📱 Version: ${buildConfig.app.version}\n`);

try {
	if (platform === "ios") {
		buildIOS(mode);
	} else {
		buildAndroid(mode);
	}

	console.log(`\n✅ Build completed successfully!\n`);
} catch (error) {
	console.error(`\n❌ Build failed:`, error.message);
	process.exit(1);
}

function buildIOS(mode) {
	const config = buildConfig.ios;
	const configuration =
		mode === "release"
			? config.configuration.release
			: config.configuration.debug;

	console.log(`📱 iOS Configuration: ${configuration}`);
	console.log(`📂 Workspace: ${config.workspace}`);
	console.log(`🎯 Scheme: ${config.scheme}\n`);

	// Install pods if needed
	console.log("📦 Installing CocoaPods...");
	execSync("cd ios && arch -arm64 pod install", { stdio: "inherit" });

	// Build command
	const buildCmd = `react-native run-ios --configuration ${configuration}`;
	console.log(`🔨 Running: ${buildCmd}\n`);
	execSync(buildCmd, { stdio: "inherit" });
}

function buildAndroid(mode) {
	const config = buildConfig.android;

	console.log(`🤖 Android Application ID: ${config.applicationId}`);
	console.log(`📂 Module: ${config.module}\n`);

	// Build command
	const buildCmd = `react-native run-android --mode=${mode}`;
	console.log(`🔨 Running: ${buildCmd}\n`);
	execSync(buildCmd, { stdio: "inherit" });
}
