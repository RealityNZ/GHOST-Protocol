module.exports = function (api) {
  api.cache(true);
  
  return {
    presets: [
      'babel-preset-expo'
    ],
    plugins: [
      // React Native Reanimated plugin (must be last)
      'react-native-reanimated/plugin'
    ],
    env: {
      production: {
        plugins: [
          'react-native-paper/babel',
          'transform-remove-console'
        ]
      },
      test: {
        plugins: [
          '@babel/plugin-transform-modules-commonjs'
        ]
      }
    }
  };
};