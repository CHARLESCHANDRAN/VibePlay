#!/usr/bin/env node
/**
 * Sync version from build.config.json to package.json
 * Run this script whenever you update the version in build.config.json
 */

const fs = require("fs");
const path = require("path");

// Read build config
const buildConfigPath = path.join(__dirname, "../src/config/build.config.json");
const buildConfig = JSON.parse(fs.readFileSync(buildConfigPath, "utf8"));

// Read package.json
const packageJsonPath = path.join(__dirname, "../package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));

// Update package.json version
const oldVersion = packageJson.version;
const newVersion = buildConfig.app.version;

if (oldVersion !== newVersion) {
	packageJson.version = newVersion;
	fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, "\t"));
	console.log(`✅ Updated package.json version: ${oldVersion} → ${newVersion}`);
} else {
	console.log(`✅ package.json version is already up to date: ${newVersion}`);
}

console.log("\n📱 Current version info:");
console.log(`   Version: ${buildConfig.app.version}`);
console.log(`   Version Code (Android): ${buildConfig.app.versionCode}`);
console.log(`   Build Number (iOS): ${buildConfig.app.buildNumber}`);
console.log(`   Bundle ID: ${buildConfig.app.bundleId}\n`);
