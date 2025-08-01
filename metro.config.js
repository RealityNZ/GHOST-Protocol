const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Audio formats
  'mp3',
  'wav',
  'aac',
  'm4a',
  'ogg',
  // Video formats
  'mp4',
  'mov',
  'avi',
  'mkv',
  // Font formats
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Other formats
  'db',
  'sqlite'
);

// Add support for TypeScript and JSX source extensions
config.resolver.sourceExts.push(
  'ts',
  'tsx',
  'js',
  'jsx',
  'json',
  'cjs',
  'mjs'
);

// Configure module resolution
config.resolver.alias = {
  '@': path.resolve(__dirname, './'),
  '@components': path.resolve(__dirname, './components'),
  '@hooks': path.resolve(__dirname, './hooks'),
  '@types': path.resolve(__dirname, './types'),
  '@app': path.resolve(__dirname, './app')
};

// Configure transformer options
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-svg-transformer'),
  unstable_allowRequireContext: true,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true
    }
  })
};

// Exclude SVG from asset extensions since we're using svg-transformer
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'svg');
config.resolver.sourceExts.push('svg');

// Configure watchman ignore patterns
config.watchFolders = [
  path.resolve(__dirname, './'),
  path.resolve(__dirname, './node_modules')
];

config.resolver.blacklistRE = /node_modules\/.*\/node_modules\/react-native\/.*/;

// Performance optimizations
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true
  }
};

// Enable experimental features
config.transformer.unstable_allowRequireContext = true;

module.exports = config;