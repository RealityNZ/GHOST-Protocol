export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  component: 'welcome' | 'discord' | 'ai' | 'security' | 'complete';
  required: boolean;
  completed: boolean;
}

export interface OnboardingData {
  // Discord Configuration
  discordMode?: 'bot' | 'user';
  discordToken?: string;
  discordTokenName?: string;
  
  // AI Backend Configuration
  aiBackend?: 'openai' | 'anthropic' | 'local' | 'custom';
  aiApiKey?: string;
  aiEndpoint?: string;
  aiModel?: string;
  
  // Security Configuration
  masterPassphrase?: string;
  encryptionEnabled?: boolean;
  autoLockMinutes?: number;
  
  // Persona Configuration
  selectedPersona?: string;
  customPersonaName?: string;
  customPersonaPrompt?: string;
  
  // Trigger Configuration
  triggerKeywords?: string[];
  mentionTrigger?: string;
  
  // Interface Preferences
  glitchMode?: boolean;
  soundscapeEnabled?: boolean;
  debugMode?: boolean;
}

export interface OnboardingState {
  isFirstTime: boolean;
  currentStep: number;
  totalSteps: number;
  data: OnboardingData;
  completed: boolean;
  skipped: boolean;
}