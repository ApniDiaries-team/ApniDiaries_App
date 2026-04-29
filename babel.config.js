// babel.config.js — fixed for NativeWind v4
// Removed "nativewind/babel" preset (that's NativeWind v2 only)
module.exports = function (api) {
  api.cache(true);
  return {
    presets: [["babel-preset-expo", { jsxImportSource: "nativewind" }]],
    plugins: [
      "react-native-worklets-core/plugin",
      "react-native-reanimated/plugin",
    ],
  };
};
