const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  resolver: {
    assetExts: ['tflite', 'txt', 'db', 'jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
