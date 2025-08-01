declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Application Environment
      NODE_ENV: 'development' | 'production' | 'test';
      EXPO_PUBLIC_APP_ENV: 'development' | 'staging' | 'production';

      // API Configuration
      EXPO_PUBLIC_API_URL: string;
      EXPO_PUBLIC_API_TIMEOUT: string;

      // Discord Configuration
      EXPO_PUBLIC_DISCORD_CLIENT_ID: string;
      EXPO_PUBLIC_DISCORD_REDIRECT_URI: string;

      // AI Backend Configuration
      EXPO_PUBLIC_OPENAI_API_URL: string;
      EXPO_PUBLIC_ANTHROPIC_API_URL: string;

      // Local AI Configuration
      EXPO_PUBLIC_OLLAMA_URL: string;
      EXPO_PUBLIC_LM_STUDIO_URL: string;

      // Security Configuration
      EXPO_PUBLIC_ENCRYPTION_ENABLED: string;
      EXPO_PUBLIC_AUDIT_LOGGING: string;

      // Feature Flags
      EXPO_PUBLIC_ENABLE_GLITCH_EFFECTS: string;
      EXPO_PUBLIC_ENABLE_SOUNDSCAPE: string;
      EXPO_PUBLIC_ENABLE_OFFLINE_MODE: string;

      // Development Configuration
      EXPO_PUBLIC_DEBUG_MODE: string;
      EXPO_PUBLIC_MOCK_WEBSOCKET: string;
      EXPO_PUBLIC_MOCK_AI_RESPONSES: string;

      // Analytics
      EXPO_PUBLIC_ANALYTICS_ENABLED: string;
      EXPO_PUBLIC_ANALYTICS_API_KEY?: string;

      // Sentry Error Reporting
      EXPO_PUBLIC_SENTRY_DSN?: string;
      EXPO_PUBLIC_SENTRY_ENABLED: string;
    }
  }
}

// Ensure this file is treated as a module
export {};