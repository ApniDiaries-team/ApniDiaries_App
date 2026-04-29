const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('expo/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// Apply NativeWind configuration
// Ensure "./global.css" exists in your project root.
module.exports = withNativeWind(config, { input: "./global.css" });

// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require("nativewind/metro");
// const path = require("path");

// /**
//  * Metro configuration
//  * https://reactnative.dev/docs/metro
//  *
//  * @type {import('expo/metro-config').MetroConfig}
//  */
// const config = getDefaultConfig(__dirname);

// // Apply NativeWind configuration first
// // Ensure "./global.css" exists in your project root.
// const nativeWindConfig = withNativeWind(config, { input: "./global.css" });

// // Stub out react-native-webrtc for Expo Go
// nativeWindConfig.resolver = {
//   ...nativeWindConfig.resolver,
//   extraNodeModules: {
//     ...nativeWindConfig.resolver?.extraNodeModules,
//     "react-native-webrtc": path.resolve(
//       __dirname,
//       "stubs/react-native-webrtc.js",
//     ),
//   },
// };

// module.exports = nativeWindConfig;
