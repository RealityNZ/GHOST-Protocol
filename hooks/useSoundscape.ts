import { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';

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
  playSound: (soundType: SoundType) => void;
  isLoading: boolean;
  error: string | null;
}

type SoundType = 
  | 'ambient_static'
  | 'message_blip'
  | 'possession_activate'
  | 'possession_deactivate'
  | 'typing_synth'
  | 'system_success'
  | 'system_error'
  | 'glitch_stinger';

export function useSoundscape(): SoundscapeHook {
  const [settings, setSettings] = useState<SoundscapeSettings>({
    enabled: false,
    volume: 50,
    ambientEnabled: true,
    messageBlipsEnabled: true,
    possessionSoundsEnabled: true,
    systemSoundsEnabled: true,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRefs = useRef<Map<SoundType, any>>(new Map());
  const ambientLoopRef = useRef<any>(null);

  useEffect(() => {
    if (settings.enabled && Platform.OS !== 'web') {
      initializeAudio();
    } else {
      cleanupAudio();
    }

    return () => {
      cleanupAudio();
    };
  }, [settings.enabled]);

  const initializeAudio = async () => {
    if (Platform.OS === 'web') {
      console.log('🔊 Soundscape: Web platform detected - audio disabled');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock audio initialization for demonstration
      // In a real implementation, this would load actual audio files
      console.log('🔊 Initializing audio system...');
      
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock audio objects
      const mockAudio = {
        play: () => console.log('🔊 Playing audio'),
        pause: () => console.log('🔊 Pausing audio'),
        setVolume: (vol: number) => console.log(`🔊 Setting volume to ${vol}`),
        loop: false,
      };

      // Initialize sound library
      audioRefs.current.set('ambient_static', { ...mockAudio, loop: true });
      audioRefs.current.set('message_blip', mockAudio);
      audioRefs.current.set('possession_activate', mockAudio);
      audioRefs.current.set('possession_deactivate', mockAudio);
      audioRefs.current.set('typing_synth', mockAudio);
      audioRefs.current.set('system_success', mockAudio);
      audioRefs.current.set('system_error', mockAudio);
      audioRefs.current.set('glitch_stinger', mockAudio);

      console.log('🔊 Audio system initialized successfully');
      
      // Start ambient loop if enabled
      if (settings.ambientEnabled) {
        startAmbientLoop();
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize audio';
      setError(errorMessage);
      console.error('🔊 Audio initialization error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const cleanupAudio = () => {
    console.log('🔊 Cleaning up audio system...');
    
    // Stop ambient loop
    if (ambientLoopRef.current) {
      ambientLoopRef.current.pause();
      ambientLoopRef.current = null;
    }

    // Clear all audio references
    audioRefs.current.clear();
  };

  const startAmbientLoop = () => {
    if (!settings.enabled || !settings.ambientEnabled) return;

    const ambientAudio = audioRefs.current.get('ambient_static');
    if (ambientAudio) {
      ambientAudio.setVolume(settings.volume * 0.2 / 100); // 20% of main volume
      ambientAudio.loop = true;
      ambientAudio.play();
      ambientLoopRef.current = ambientAudio;
      console.log('🔊 Started ambient static loop');
    }
  };

  const stopAmbientLoop = () => {
    if (ambientLoopRef.current) {
      ambientLoopRef.current.pause();
      ambientLoopRef.current = null;
      console.log('🔊 Stopped ambient static loop');
    }
  };

  const playSound = (soundType: SoundType) => {
    if (!settings.enabled) {
      console.log(`🔊 Sound disabled: ${soundType}`);
      return;
    }

    // Check category-specific settings
    const categoryEnabled = getCategoryEnabled(soundType);
    if (!categoryEnabled) {
      console.log(`🔊 Category disabled: ${soundType}`);
      return;
    }

    if (Platform.OS === 'web') {
      console.log(`🔊 Web Mock: Playing ${soundType}`);
      return;
    }

    const audio = audioRefs.current.get(soundType);
    if (audio) {
      audio.setVolume(settings.volume / 100);
      audio.play();
      console.log(`🔊 Playing: ${soundType}`);
    } else {
      console.warn(`🔊 Audio not found: ${soundType}`);
    }
  };

  const getCategoryEnabled = (soundType: SoundType): boolean => {
    switch (soundType) {
      case 'ambient_static':
        return settings.ambientEnabled;
      case 'message_blip':
        return settings.messageBlipsEnabled;
      case 'possession_activate':
      case 'possession_deactivate':
      case 'typing_synth':
        return settings.possessionSoundsEnabled;
      case 'system_success':
      case 'system_error':
      case 'glitch_stinger':
        return settings.systemSoundsEnabled;
      default:
        return true;
    }
  };

  const updateSettings = (newSettings: Partial<SoundscapeSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      
      // Handle ambient loop changes
      if ('ambientEnabled' in newSettings) {
        if (updated.ambientEnabled && updated.enabled) {
          startAmbientLoop();
        } else {
          stopAmbientLoop();
        }
      }

      // Handle volume changes
      if ('volume' in newSettings && ambientLoopRef.current) {
        ambientLoopRef.current.setVolume(updated.volume * 0.2 / 100);
      }

      console.log('🔊 Settings updated:', newSettings);
      return updated;
    });
  };

  return {
    settings,
    updateSettings,
    playSound,
    isLoading,
    error,
  };
}