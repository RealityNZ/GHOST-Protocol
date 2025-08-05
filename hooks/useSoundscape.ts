import { useState } from 'react';

interface SoundscapeSettings {
  enabled: boolean;
  volume: number;
  ambientEnabled: boolean;
  messageBlipsEnabled: boolean;
  possessionSoundsEnabled: boolean;
  systemSoundsEnabled: boolean;
}

interface SoundscapeHook {
  settings: SoundscapeSettings;
  updateSettings: (newSettings: Partial<SoundscapeSettings>) => void;
  playSound: (soundType: string) => void;
  isLoading: boolean;
  error: string | null;
}

export function useSoundscape(): SoundscapeHook {
  const [settings, setSettings] = useState<SoundscapeSettings>({
    enabled: false,
    volume: 50,
    ambientEnabled: true,
    messageBlipsEnabled: true,
    possessionSoundsEnabled: true,
    systemSoundsEnabled: true,
  });

  const updateSettings = (newSettings: Partial<SoundscapeSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const playSound = (soundType: string) => {
    console.log(`🔊 Playing sound: ${soundType}`);
  };

  return {
    settings,
    updateSettings,
    playSound,
    isLoading: false,
    error: null,
  };
}