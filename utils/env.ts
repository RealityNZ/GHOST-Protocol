/**
 * Environment configuration utilities for VICE Logger
 * Provides type-safe access to environment variables
 */

export const ENV = {
  // Application Environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_ENV: process.env.EXPO_PUBLIC_APP_ENV || 'development',

  // API Configuration
  API_URL: process.env.EXPO_PUBLIC_API_URL || 'https://api.vice-logger.dev',
  API_TIMEOUT: parseInt(process.env.EXPO_PUBLIC_API_TIMEOUT || '30000'),

  // Discord Configuration
  DISCORD_CLIENT_ID: process.env.EXPO_PUBLIC_DISCORD_CLIENT_ID || '',
  DISCORD_REDIRECT_URI: process.env.EXPO_PUBLIC_DISCORD_REDIRECT_URI || '',

  // AI Backend Configuration
  OPENAI_API_URL: process.env.EXPO_PUBLIC_OPENAI_API_URL || 'https://api.openai.com/v1',
  ANTHROPIC_API_URL: process.env.EXPO_PUBLIC_ANTHROPIC_API_URL || 'https://api.anthropic.com',

  // Local AI Configuration
  OLLAMA_URL: process.env.EXPO_PUBLIC_OLLAMA_URL || 'http://localhost:11434',
  LM_STUDIO_URL: process.env.EXPO_PUBLIC_LM_STUDIO_URL || 'http://localhost:1234',

  // Security Configuration
  ENCRYPTION_ENABLED: process.env.EXPO_PUBLIC_ENCRYPTION_ENABLED === 'true',
  AUDIT_LOGGING: process.env.EXPO_PUBLIC_AUDIT_LOGGING === 'true',

  // Feature Flags
  ENABLE_GLITCH_EFFECTS: process.env.EXPO_PUBLIC_ENABLE_GLITCH_EFFECTS === 'true',
  ENABLE_SOUNDSCAPE: process.env.EXPO_PUBLIC_ENABLE_SOUNDSCAPE === 'true',
  ENABLE_OFFLINE_MODE: process.env.EXPO_PUBLIC_ENABLE_OFFLINE_MODE === 'true',

  // Development Configuration
  DEBUG_MODE: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  MOCK_WEBSOCKET: process.env.EXPO_PUBLIC_MOCK_WEBSOCKET === 'true',
  MOCK_AI_RESPONSES: process.env.EXPO_PUBLIC_MOCK_AI_RESPONSES === 'true',

  // Analytics
  ANALYTICS_ENABLED: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true',
  ANALYTICS_API_KEY: process.env.EXPO_PUBLIC_ANALYTICS_API_KEY,

  // Sentry Error Reporting
  SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
  SENTRY_ENABLED: process.env.EXPO_PUBLIC_SENTRY_ENABLED === 'true',
} as const;

/**
 * Check if the app is running in development mode
 */
export const isDevelopment = (): boolean => {
  return ENV.NODE_ENV === 'development' || ENV.APP_ENV === 'development';
};

/**
 * Check if the app is running in production mode
 */
export const isProduction = (): boolean => {
  return ENV.NODE_ENV === 'production' && ENV.APP_ENV === 'production';
};

/**
 * Check if debug mode is enabled
 */
export const isDebugMode = (): boolean => {
  return ENV.DEBUG_MODE && isDevelopment();
};

/**
 * Get API configuration for the current environment
 */
export const getApiConfig = () => ({
  baseURL: ENV.API_URL,
  timeout: ENV.API_TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': `VICE-Logger/${ENV.APP_ENV}`,
  },
});

/**
 * Get Discord configuration
 */
export const getDiscordConfig = () => ({
  clientId: ENV.DISCORD_CLIENT_ID,
  redirectUri: ENV.DISCORD_REDIRECT_URI,
  scopes: ['identify', 'guilds', 'guilds.members.read'],
});

/**
 * Get AI backend configurations
 */
export const getAIBackendConfigs = () => ({
  openai: {
    baseURL: ENV.OPENAI_API_URL,
    timeout: ENV.API_TIMEOUT,
  },
  anthropic: {
    baseURL: ENV.ANTHROPIC_API_URL,
    timeout: ENV.API_TIMEOUT,
  },
  ollama: {
    baseURL: ENV.OLLAMA_URL,
    timeout: ENV.API_TIMEOUT,
  },
  lmStudio: {
    baseURL: ENV.LM_STUDIO_URL,
    timeout: ENV.API_TIMEOUT,
  },
});

/**
 * Validate required environment variables
 */
export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  // Check required variables for production
  if (isProduction()) {
    if (!ENV.API_URL) {
      errors.push('EXPO_PUBLIC_API_URL is required in production');
    }
    if (!ENV.DISCORD_CLIENT_ID) {
      errors.push('EXPO_PUBLIC_DISCORD_CLIENT_ID is required in production');
    }
  }

  // Check feature flag consistency
  if (ENV.ENABLE_SOUNDSCAPE && !ENV.ENABLE_GLITCH_EFFECTS) {
    console.warn('Soundscape enabled without glitch effects - some audio cues may not work');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Log environment configuration (safe for development)
 */
export const logEnvironmentInfo = (): void => {
  if (!isDevelopment()) return;

  console.log('🔧 VICE Logger Environment Configuration:');
  console.log(`   Environment: ${ENV.APP_ENV}`);
  console.log(`   Debug Mode: ${ENV.DEBUG_MODE}`);
  console.log(`   API URL: ${ENV.API_URL}`);
  console.log(`   Glitch Effects: ${ENV.ENABLE_GLITCH_EFFECTS}`);
  console.log(`   Soundscape: ${ENV.ENABLE_SOUNDSCAPE}`);
  console.log(`   Offline Mode: ${ENV.ENABLE_OFFLINE_MODE}`);
  console.log(`   Mock WebSocket: ${ENV.MOCK_WEBSOCKET}`);
  console.log(`   Mock AI: ${ENV.MOCK_AI_RESPONSES}`);

  const validation = validateEnvironment();
  if (!validation.valid) {
    console.warn('⚠️ Environment validation errors:', validation.errors);
  }
};