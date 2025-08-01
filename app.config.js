import 'dotenv/config';

export default {
  expo: {
    name: process.env.EXPO_PUBLIC_APP_ENV === 'production' ? 'VICE Logger' : 'VICE Logger (Dev)',
    slug: 'vice-logger',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'vice-logger',
    userInterfaceStyle: 'dark',
    newArchEnabled: true,
    
    splash: {
      image: './assets/images/icon.png',
      resizeMode: 'contain',
      backgroundColor: '#0C0C0C'
    },
    
    assetBundlePatterns: [
      '**/*'
    ],
    
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.vice.logger',
      buildNumber: '1.0.0',
      infoPlist: {
        NSCameraUsageDescription: 'VICE Logger needs camera access for surveillance features',
        NSMicrophoneUsageDescription: 'VICE Logger needs microphone access for voice transcription',
        NSPhotoLibraryUsageDescription: 'VICE Logger needs photo library access to archive images'
      }
    },
    
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/images/icon.png',
        backgroundColor: '#0C0C0C'
      },
      package: 'com.vice.logger',
      versionCode: 1,
      permissions: [
        'android.permission.CAMERA',
        'android.permission.RECORD_AUDIO',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.INTERNET',
        'android.permission.ACCESS_NETWORK_STATE'
      ]
    },
    
    web: {
      bundler: 'metro',
      output: 'single',
      favicon: './assets/images/favicon.png'
    },
    
    plugins: [
      'expo-router',
      'expo-font',
      'expo-web-browser',
      'expo-camera',
      'expo-linear-gradient',
      [
        'expo-build-properties',
        {
          android: {
            compileSdkVersion: 34,
            targetSdkVersion: 34,
            buildToolsVersion: '34.0.0'
          },
          ios: {
            deploymentTarget: '13.0'
          }
        }
      ]
    ],
    
    experiments: {
      typedRoutes: true,
      tsconfigPaths: true
    },
    
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      apiTimeout: process.env.EXPO_PUBLIC_API_TIMEOUT,
      discordClientId: process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID,
      enableGlitchEffects: process.env.EXPO_PUBLIC_ENABLE_GLITCH_EFFECTS === 'true',
      enableSoundscape: process.env.EXPO_PUBLIC_ENABLE_SOUNDSCAPE === 'true',
      debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
      eas: {
        projectId: 'your-eas-project-id'
      }
    },
    
    updates: {
      fallbackToCacheTimeout: 0,
      url: 'https://u.expo.dev/your-project-id'
    },
    
    runtimeVersion: {
      policy: 'sdkVersion'
    }
  }
};