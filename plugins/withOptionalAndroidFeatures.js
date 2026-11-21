const { withAndroidManifest } = require('@expo/config-plugins');

const OPTIONAL_FEATURES = [
  'android.hardware.screen.portrait',
  'android.hardware.wifi',
];

module.exports = function withOptionalAndroidFeatures(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;
    manifest['uses-feature'] = manifest['uses-feature'] || [];

    for (const featureName of OPTIONAL_FEATURES) {
      const feature = manifest['uses-feature'].find(
        (item) => item.$?.['android:name'] === featureName
      );

      if (feature) {
        feature.$['android:required'] = 'false';
      } else {
        manifest['uses-feature'].push({
          $: {
            'android:name': featureName,
            'android:required': 'false',
          },
        });
      }
    }

    return config;
  });
};
