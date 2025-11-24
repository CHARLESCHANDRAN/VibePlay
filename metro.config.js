const { getDefaultConfig, mergeConfig } = require("@react-native/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
	resolver: {
		assetExts: [
			...defaultConfig.resolver.assetExts,
			"bin", // ⬅️ needed for TF.js shards
			"tflite", // ⬅️ you already had this
			"txt",
			"db",
			"jpg",
			"jpeg",
			"png",
			"gif",
			"bmp",
			"webp",
		],
	},
};

module.exports = mergeConfig(defaultConfig, config);
