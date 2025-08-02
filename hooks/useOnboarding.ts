import { useState, useCallback, useEffect } from 'react';
import { OnboardingStep, OnboardingData, OnboardingState } from '@/types/onboarding';
import { useTokenVault } from './useTokenVault';
import { useAIBackends } from './useAIBackends';

const ONBOARDING_STORAGE_KEY = 'vice_onboarding_completed';

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isFirstTime: true,
    currentStep: 0,
    totalSteps: 5,
    data: {},
    completed: false,
    skipped: false,
  });

  const { storeToken } = useTokenVault();
  const { addBackend, setActiveBackend } = useAIBackends();

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'WELCOME TO VICE LOGGER',
      description: 'Neural surveillance and AI possession system initialization',
      component: 'welcome',
      required: false,
      completed: false,
    },
    {
      id: 'discord',
      title: 'DISCORD CONNECTION',
      description: 'Configure Discord gateway for message interception',
      component: 'discord',
      required: true,
      completed: false,
    },
    {
      id: 'ai',
      title: 'AI BACKEND SETUP',
      description: 'Configure neural network for response generation',
      component: 'ai',
      required: true,
      completed: false,
    },
    {
      id: 'security',
      title: 'SECURITY PROTOCOLS',
      description: 'Initialize encryption and access controls',
      component: 'security',
      required: true,
      completed: false,
    },
    {
      id: 'complete',
      title: 'SYSTEM READY',
      description: 'Neural link established - surveillance active',
      component: 'complete',
      required: false,
      completed: false,
    },
  ];

  useEffect(() => {
    // Check if onboarding was previously completed
    const completed = localStorage?.getItem(ONBOARDING_STORAGE_KEY) === 'true';
    if (completed) {
      setState(prev => ({
        ...prev,
        isFirstTime: false,
        completed: true,
      }));
    }
  }, []);

  const updateData = useCallback((newData: Partial<OnboardingData>) => {
    setState(prev => ({
      ...prev,
      data: { ...prev.data, ...newData },
    }));
  }, []);

  const nextStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, prev.totalSteps - 1),
    }));
  }, []);

  const previousStep = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 0),
    }));
  }, []);

  const goToStep = useCallback((stepIndex: number) => {
    setState(prev => ({
      ...prev,
      currentStep: Math.max(0, Math.min(stepIndex, prev.totalSteps - 1)),
    }));
  }, []);

  const completeOnboarding = useCallback(async () => {
    try {
      // Apply all configurations
      const { data } = state;

      // 1. Store Discord token if provided
      if (data.discordToken && data.discordTokenName && data.masterPassphrase) {
        await storeToken(
          data.discordTokenName,
          data.discordToken,
          data.discordMode === 'bot' ? 'discord_bot' : 'discord_user',
          data.masterPassphrase,
          24 // 24 hour expiry
        );
        console.log('🔐 Discord token stored in vault');
      }

      // 2. Configure AI backend if provided
      if (data.aiBackend && data.aiApiKey) {
        const backendId = await addBackend({
          name: `${data.aiBackend.toUpperCase()} (Setup)`,
          type: data.aiBackend as any,
          endpoint: data.aiEndpoint || getDefaultEndpoint(data.aiBackend),
          apiKey: data.aiApiKey,
          model: data.aiModel || getDefaultModel(data.aiBackend),
          temperature: 0.7,
          maxTokens: 2000,
          timeout: 30000,
          enabled: true,
          authType: 'bearer',
          headers: {},
        });

        if (backendId) {
          setActiveBackend(backendId);
          console.log('🤖 AI backend configured and activated');
        }
      }

      // 3. Apply security settings
      if (data.masterPassphrase) {
        // Security settings are handled by the vault system
        console.log('🔒 Security protocols initialized');
      }

      // 4. Mark onboarding as completed
      localStorage?.setItem(ONBOARDING_STORAGE_KEY, 'true');
      
      setState(prev => ({
        ...prev,
        completed: true,
        isFirstTime: false,
      }));

      console.log('✅ GHOST Protocol onboarding completed successfully');
      return true;

    } catch (error) {
      console.error('❌ Onboarding completion failed:', error);
      return false;
    }
  }, [state, storeToken, addBackend, setActiveBackend]);

  const skipOnboarding = useCallback(() => {
    localStorage?.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setState(prev => ({
      ...prev,
      completed: true,
      skipped: true,
      isFirstTime: false,
    }));
    console.log('⏭️ Onboarding skipped');
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage?.removeItem(ONBOARDING_STORAGE_KEY);
    setState({
      isFirstTime: true,
      currentStep: 0,
      totalSteps: 5,
      data: {},
      completed: false,
      skipped: false,
    });
    console.log('🔄 Onboarding reset');
  }, []);

  const getDefaultEndpoint = (backend: string): string => {
    switch (backend) {
      case 'openai': return 'https://api.openai.com/v1';
      case 'anthropic': return 'https://api.anthropic.com/v1';
      case 'local': return 'http://localhost:11434'; // Ollama default
      default: return '';
    }
  };

  const getDefaultModel = (backend: string): string => {
    switch (backend) {
      case 'openai': return 'gpt-4';
      case 'anthropic': return 'claude-3-sonnet-20240229';
      case 'local': return 'llama2';
      default: return '';
    }
  };

  const getCurrentStep = useCallback((): OnboardingStep => {
    return steps[state.currentStep];
  }, [state.currentStep]);

  const getProgress = useCallback((): number => {
    return ((state.currentStep + 1) / state.totalSteps) * 100;
  }, [state.currentStep, state.totalSteps]);

  const canProceed = useCallback((): boolean => {
    const currentStep = getCurrentStep();
    const { data } = state;

    switch (currentStep.id) {
      case 'welcome':
        return true; // Always can proceed from welcome
      
      case 'discord':
        return !!(data.discordMode && data.discordToken && data.discordTokenName);
      
      case 'ai':
        return !!(data.aiBackend && (
          data.aiBackend === 'local' || // Local doesn't require API key
          data.aiApiKey // Cloud backends require API key
        ));
      
      case 'security':
        return !!(data.masterPassphrase && data.masterPassphrase.length >= 8);
      
      case 'complete':
        return true;
      
      default:
        return false;
    }
  }, [state, getCurrentStep]);

  return {
    state,
    steps,
    updateData,
    nextStep,
    previousStep,
    goToStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    getCurrentStep,
    getProgress,
    canProceed,
  };
}