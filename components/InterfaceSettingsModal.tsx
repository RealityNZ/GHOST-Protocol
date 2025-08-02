import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Palette, X, Volume2, Zap, Eye, Type, LayoutGrid as Layout, Download, Upload, RotateCcw } from 'lucide-react-native';
import { useInterfaceSettings } from '@/hooks/useInterfaceSettings';

interface InterfaceSettingsModalProps {
  onClose: () => void;
}

export default function InterfaceSettingsModal({ onClose }: InterfaceSettingsModalProps) {
  const {
    settings,
    updateSettings,
    resetSettings,
    toggleGlitchMode,
    setGlitchIntensity,
    toggleSoundscape,
    setSoundVolume,
    setAnimationSpeed,
    toggleCompactMode,
    setFontSize,
    exportSettings,
    importSettings,
  } = useInterfaceSettings();

  const handleExport = () => {
    const exported = exportSettings();
    console.log('Interface settings exported to console');
  };

  const handleImport = () => {
    // In a real implementation, this would open a file picker
    console.log('Import functionality would open file picker');
  };

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Palette size={24} color="#00FFF7" />
          <Text style={styles.headerTitle}>INTERFACE SETTINGS</Text>
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <X size={20} color="#FF2EC0" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Visual Effects Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>VISUAL EFFECTS</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingName}>Glitch Mode</Text>
              <Switch
                value={settings.glitchMode}
                onValueChange={toggleGlitchMode}
                trackColor={{ false: '#333333', true: '#FF2EC0' }}
                thumbColor={settings.glitchMode ? '#00FFF7' : '#666666'}
              />
            </View>
            <Text style={styles.settingDescription}>
              Enable cyberpunk glitch effects and visual distortions
            </Text>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingName}>Glitch Intensity</Text>
            <View style={styles.intensitySelector}>
              {(['subtle', 'medium', 'intense'] as const).map(intensity => (
                <TouchableOpacity
                  key={intensity}
                  style={[
                    styles.intensityOption,
                    settings.glitchIntensity === intensity && styles.intensityOptionActive
                  ]}
                  onPress={() => setGlitchIntensity(intensity)}
                  disabled={!settings.glitchMode}
                >
                  <Text style={[
                    styles.intensityText,
                    settings.glitchIntensity === intensity && styles.intensityTextActive,
                    !settings.glitchMode && styles.intensityTextDisabled
                  ]}>
                    {intensity.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingName}>Background Effects</Text>
              <Switch
                value={settings.backgroundEffects}
                onValueChange={(value) => updateSettings({ backgroundEffects: value })}
                trackColor={{ false: '#333333', true: '#FF2EC0' }}
                thumbColor={settings.backgroundEffects ? '#00FFF7' : '#666666'}
              />
            </View>
            <Text style={styles.settingDescription}>
              Neural grid patterns and floating elements
            </Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingName}>Scanline Effect</Text>
              <Switch
                value={settings.scanlineEffect}
                onValueChange={(value) => updateSettings({ scanlineEffect: value })}
                trackColor={{ false: '#333333', true: '#FF2EC0' }}
                thumbColor={settings.scanlineEffect ? '#00FFF7' : '#666666'}
              />
            </View>
            <Text style={styles.settingDescription}>
              CRT monitor scanlines for retro aesthetic
            </Text>
          </View>
        </View>

        {/* Animation Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ANIMATIONS</Text>
          
          <View style={styles.settingCard}>
            <Text style={styles.settingName}>Animation Speed</Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>0.5x</Text>
              <View style={styles.slider}>
                <View style={styles.sliderTrack}>
                  <View style={[
                    styles.sliderFill,
                    { width: `${((settings.animationSpeed - 0.5) / 1.5) * 100}%` }
                  ]} />
                </View>
                <TouchableOpacity 
                  style={[styles.sliderThumb, {
                    left: `${((settings.animationSpeed - 0.5) / 1.5) * 100}%`
                  }]}
                  onPress={() => {
                    // In a real implementation, this would be a draggable slider
                    const newSpeed = settings.animationSpeed >= 2.0 ? 0.5 : settings.animationSpeed + 0.5;
                    setAnimationSpeed(newSpeed);
                  }}
                />
              </View>
              <Text style={styles.sliderLabel}>2.0x</Text>
            </View>
            <Text style={styles.sliderValue}>{settings.animationSpeed}x</Text>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingName}>Reduce Motion</Text>
              <Switch
                value={settings.reduceMotion}
                onValueChange={(value) => updateSettings({ reduceMotion: value })}
                trackColor={{ false: '#333333', true: '#FF2EC0' }}
                thumbColor={settings.reduceMotion ? '#00FFF7' : '#666666'}
              />
            </View>
            <Text style={styles.settingDescription}>
              Minimize animations for accessibility
            </Text>
          </View>
        </View>

        {/* Audio Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AUDIO</Text>
          
          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingName}>Soundscape</Text>
              <Switch
                value={settings.soundscapeEnabled}
                onValueChange={toggleSoundscape}
                trackColor={{ false: '#333333', true: '#FF2EC0' }}
                thumbColor={settings.soundscapeEnabled ? '#00FFF7' : '#666666'}
              />
            </View>
            <Text style={styles.settingDescription}>
              Ambient cyberpunk audio and UI sound effects
            </Text>
          </View>

          <View style={styles.settingCard}>
            <Text style={styles.settingName}>Volume</Text>
            <View style={styles.volumeContainer}>
              <Volume2 size={16} color="#666666" />
              <View style={styles.volumeSlider}>
                <View style={styles.sliderTrack}>
                  <View style={[
                    styles.sliderFill,
                    { width: `${settings.soundVolume}%` }
                  ]} />
                </View>
                <TouchableOpacity 
                  style={[styles.sliderThumb, { left: `${settings.soundVolume}%` }]}
                  onPress={() => {
                    // Cycle through volume levels
                    const newVolume = settings.soundVolume >= 100 ? 0 : settings.soundVolume + 25;
                    setSoundVolume(newVolume);
                  }}
                />
              </View>
              <Text style={styles.volumeText}>{settings.soundVolume}%</Text>
            </View>
          </View>
        </View>

        {/* Typography Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TYPOGRAPHY</Text>
          
          <View style={styles.settingCard}>
            <Text style={styles.settingName}>Font Size</Text>
            <View style={styles.fontSizeSelector}>
              {(['small', 'medium', 'large'] as const).map(size => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.fontSizeOption,
                    settings.fontSize === size && styles.fontSizeOptionActive
                  ]}
                  onPress={() => setFontSize(size)}
                >
                  <Text style={[
                    styles.fontSizeText,
                    settings.fontSize === size && styles.fontSizeTextActive
                  ]}>
                    {size.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingCard}>
            <View style={styles.settingHeader}>
              <Text style={styles.settingName}>Compact Mode</Text>
              <Switch
                value={settings.compactMode}
                onValueChange={toggleCompactMode}
                trackColor={{ false: '#333333', true: '#FF2EC0' }}
                thumbColor={settings.compactMode ? '#00FFF7' : '#666666'}
              />
            </View>
            <Text style={styles.settingDescription}>
              Reduce spacing and padding for more content
            </Text>
          </View>
        </View>

        {/* Data Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SETTINGS DATA</Text>
          
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
              <Download size={16} color="#0C0C0C" />
              <Text style={styles.exportButtonText}>EXPORT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.importButton} onPress={handleImport}>
              <Upload size={16} color="#0C0C0C" />
              <Text style={styles.importButtonText}>IMPORT</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resetButton} onPress={resetSettings}>
              <RotateCcw size={16} color="#FFFFFF" />
              <Text style={styles.resetButtonText}>RESET</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00FFF7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#00FFF7',
    letterSpacing: 2,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginBottom: 24,
    paddingTop: 16,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FFB000',
    letterSpacing: 2,
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 247, 0.2)',
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  settingDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  intensitySelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  intensityOption: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 4,
    alignItems: 'center',
  },
  intensityOptionActive: {
    borderColor: '#00FFF7',
    backgroundColor: 'rgba(0, 255, 247, 0.1)',
  },
  intensityText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#CCCCCC',
    letterSpacing: 1,
  },
  intensityTextActive: {
    color: '#00FFF7',
  },
  intensityTextDisabled: {
    color: '#444444',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  sliderLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#888888',
  },
  slider: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  sliderTrack: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
  },
  sliderFill: {
    height: '100%',
    backgroundColor: '#00FFF7',
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 16,
    height: 16,
    backgroundColor: '#00FFF7',
    borderRadius: 8,
    marginLeft: -8,
    marginTop: -6,
  },
  sliderValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#00FFF7',
    letterSpacing: 1,
    minWidth: 30,
    textAlign: 'center',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  volumeSlider: {
    flex: 1,
    height: 20,
    justifyContent: 'center',
  },
  volumeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#00FFF7',
    letterSpacing: 1,
    minWidth: 35,
    textAlign: 'center',
  },
  fontSizeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  fontSizeOption: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 4,
    alignItems: 'center',
  },
  fontSizeOptionActive: {
    borderColor: '#00FFF7',
    backgroundColor: 'rgba(0, 255, 247, 0.1)',
  },
  fontSizeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#CCCCCC',
    letterSpacing: 1,
  },
  fontSizeTextActive: {
    color: '#00FFF7',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB000',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  exportButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  importButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  importButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  resetButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF2EC0',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  resetButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});