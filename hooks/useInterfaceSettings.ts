import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import { useGlitchCore } from './useGlitchCore';
import { useSoundscape } from './useSoundscape';

export interface InterfaceSettings {
  // Visual Effects
  glitchMode: boolean;
  glitchIntensity: 'subtle' | 'medium' | 'intense';
  backgroundEffects: boolean;
  scanlineEffect: boolean;
  chromaticAberration: boolean;
  
  // Animation Settings
  animationSpeed: number; // 0.5x to 2.0x
  reduceMotion: boolean;
  particleEffects: boolean;
  
  // Color Theme
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  
  // Typography
  fontSize: 'small' | 'medium' | 'large';
  fontWeight: 'normal' | 'bold';
  letterSpacing: number;
  
  // Layout
  compactMode: boolean;
  showTimestamps: boolean;
  showMetadata: boolean;
  
  // Audio
  soundscapeEnabled: boolean;
  soundVolume: number;
  ambientSounds: boolean;
  uiSounds: boolean;
}

const DEFAULT_SETTINGS: InterfaceSettings = {
  glitchMode: true,
  glitchIntensity: 'medium',
  backgroundEffects: true,
  scanlineEffect: true,
  chromaticAberration: true,
  animationSpeed: 1.0,
  reduceMotion: false,
  particleEffects: true,
  primaryColor: '#00FFF7',
  accentColor: '#FF2EC0',
  backgroundColor: '#0C0C0C',
  fontSize: 'medium',
  fontWeight: 'normal',
  letterSpacing: 1,
  compactMode: false,
  showTimestamps: true,
  showMetadata: true,
  soundscapeEnabled: false,
  soundVolume: 50,
  ambientSounds: true,
  uiSounds: true,
};

export function useInterfaceSettings() {
  const [settings, setSettings] = useState<InterfaceSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);
  
  const { isGlitchActive, activateGlitch, deactivateGlitch } = useGlitchCore();
  const { settings: soundSettings, updateSettings: updateSoundSettings } = useSoundscape();

  // Load settings from storage on mount
  useEffect(() => {
    loadSettings();
  }, []);

  // Sync glitch mode with GlitchCore
  useEffect(() => {
    if (settings.glitchMode && !isGlitchActive) {
      activateGlitch();
    } else if (!settings.glitchMode && isGlitchActive) {
      deactivateGlitch();
    }
  }, [settings.glitchMode, isGlitchActive, activateGlitch, deactivateGlitch]);

  // Sync sound settings
  useEffect(() => {
    updateSoundSettings({
      enabled: settings.soundscapeEnabled,
      volume: settings.soundVolume,
      ambientEnabled: settings.ambientSounds,
      systemSoundsEnabled: settings.uiSounds,
    });
  }, [settings.soundscapeEnabled, settings.soundVolume, settings.ambientSounds, settings.uiSounds, updateSoundSettings]);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would load from AsyncStorage or similar
      const stored = localStorage?.getItem('vice_interface_settings');
      if (stored) {
        const parsedSettings = JSON.parse(stored);
        setSettings(prev => ({ ...prev, ...parsedSettings }));
        console.log('⚙️ Loaded interface settings from storage');
      }
    } catch (error) {
      console.warn('⚙️ Failed to load interface settings:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async (newSettings: InterfaceSettings) => {
    try {
      // In a real implementation, this would save to AsyncStorage or similar
      localStorage?.setItem('ghost_interface_settings', JSON.stringify(newSettings));
      console.log('⚙️ Saved interface settings to storage');
    } catch (error) {
      console.warn('⚙️ Failed to save interface settings:', error);
    }
  }, []);

  const updateSettings = useCallback((updates: Partial<InterfaceSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates };
      saveSettings(newSettings);
      return newSettings;
    });
    
    console.log('⚙️ Interface settings updated:', updates);
  }, [saveSettings]);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    saveSettings(DEFAULT_SETTINGS);
    console.log('⚙️ Interface settings reset to defaults');
  }, [saveSettings]);

  const toggleGlitchMode = useCallback(() => {
    updateSettings({ glitchMode: !settings.glitchMode });
  }, [settings.glitchMode, updateSettings]);

  const setGlitchIntensity = useCallback((intensity: InterfaceSettings['glitchIntensity']) => {
    updateSettings({ glitchIntensity: intensity });
  }, [updateSettings]);

  const toggleSoundscape = useCallback(() => {
    updateSettings({ soundscapeEnabled: !settings.soundscapeEnabled });
  }, [settings.soundscapeEnabled, updateSettings]);

  const setSoundVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(100, volume));
    updateSettings({ soundVolume: clampedVolume });
  }, [updateSettings]);

  const setAnimationSpeed = useCallback((speed: number) => {
    const clampedSpeed = Math.max(0.5, Math.min(2.0, speed));
    updateSettings({ animationSpeed: clampedSpeed });
  }, [updateSettings]);

  const toggleCompactMode = useCallback(() => {
    updateSettings({ compactMode: !settings.compactMode });
  }, [settings.compactMode, updateSettings]);

  const setFontSize = useCallback((fontSize: InterfaceSettings['fontSize']) => {
    updateSettings({ fontSize });
  }, [updateSettings]);

  const setThemeColors = useCallback((colors: {
    primaryColor?: string;
    accentColor?: string;
    backgroundColor?: string;
  }) => {
    updateSettings(colors);
  }, [updateSettings]);

  const exportSettings = useCallback(() => {
    const exportData = {
      settings,
      exportedAt: new Date().toISOString(),
      version: '1.0.0',
      platform: Platform.OS,
    };

    const exported = JSON.stringify(exportData, null, 2);
    console.log('📦 Interface settings export:', exported);
    return exported;
  }, [settings]);

  const importSettings = useCallback((settingsJson: string) => {
    try {
      const importData = JSON.parse(settingsJson);
      if (importData.settings) {
        setSettings(importData.settings);
        saveSettings(importData.settings);
        console.log('📥 Interface settings imported successfully');
        return true;
      } else {
        throw new Error('Invalid settings format');
      }
    } catch (error) {
      console.error('📥 Failed to import settings:', error);
      return false;
    }
  }, [saveSettings]);

  const getThemeCSS = useCallback(() => {
    // Generate CSS custom properties for theming
    return {
      '--vice-primary': settings.primaryColor,
      '--vice-accent': settings.accentColor,
      '--vice-background': settings.backgroundColor,
      '--vice-font-size': settings.fontSize === 'small' ? '12px' : 
                         settings.fontSize === 'large' ? '16px' : '14px',
      '--vice-letter-spacing': `${settings.letterSpacing}px`,
      '--vice-animation-speed': `${settings.animationSpeed}s`,
    };
  }, [settings]);

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
    toggleGlitchMode,
    setGlitchIntensity,
    toggleSoundscape,
    setSoundVolume,
    setAnimationSpeed,
    toggleCompactMode,
    setFontSize,
    setThemeColors,
    exportSettings,
    importSettings,
    getThemeCSS,
  };
}