import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Shield, Zap, Download, Trash2, AlertTriangle } from 'lucide-react-native';

export default function SettingsScreen() {
  const [glitchMode, setGlitchMode] = useState(true);
  const [autoTranscribe, setAutoTranscribe] = useState(false);
  const [deleteCapture, setDeleteCapture] = useState(true);
  const [soundscapeEnabled, setSoundscapeEnabled] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(true);
  const [messageBlipsEnabled, setMessageBlipsEnabled] = useState(true);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Settings size={24} color="#666666" />
          <Text style={styles.headerTitle}>SYSTEM CONFIG</Text>
          <Zap size={24} color="#FFB000" />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* UI Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>INTERFACE</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Glitch Mode</Text>
                <Text style={styles.settingDescription}>Enable visual interference effects</Text>
              </View>
              <Switch
                value={glitchMode}
                onValueChange={setGlitchMode}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor={glitchMode ? '#00FFF7' : '#CCCCCC'}
              />
            </View>
          </View>

          {/* Surveillance Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SURVEILLANCE</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto Transcribe</Text>
                <Text style={styles.settingDescription}>Automatically transcribe voice messages</Text>
              </View>
              <Switch
                value={autoTranscribe}
                onValueChange={setAutoTranscribe}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor={autoTranscribe ? '#00FFF7' : '#CCCCCC'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Delete Capture</Text>
                <Text style={styles.settingDescription}>Archive deleted messages and files</Text>
              </View>
              <Switch
                value={deleteCapture}
                onValueChange={setDeleteCapture}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor={deleteCapture ? '#00FFF7' : '#CCCCCC'}
              />
            </View>
          </View>

          {/* Audio Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AUDIO SYSTEM</Text>
            
            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Soundscape</Text>
                <Text style={styles.settingDescription}>Enable cyberpunk audio effects</Text>
              </View>
              <Switch
                value={soundscapeEnabled}
                onValueChange={setSoundscapeEnabled}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor={soundscapeEnabled ? '#00FFF7' : '#CCCCCC'}
              />
            </View>

            {soundscapeEnabled && (
              <>
                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Ambient Static</Text>
                    <Text style={styles.settingDescription}>Background cyberpunk atmosphere</Text>
                  </View>
                  <Switch
                    value={ambientEnabled}
                    onValueChange={setAmbientEnabled}
                    trackColor={{ false: '#404040', true: '#FF2EC0' }}
                    thumbColor={ambientEnabled ? '#00FFF7' : '#CCCCCC'}
                  />
                </View>

                <View style={styles.settingRow}>
                  <View style={styles.settingInfo}>
                    <Text style={styles.settingLabel}>Message Blips</Text>
                    <Text style={styles.settingDescription}>Sound effects for new messages</Text>
                  </View>
                  <Switch
                    value={messageBlipsEnabled}
                    onValueChange={setMessageBlipsEnabled}
                    trackColor={{ false: '#404040', true: '#FF2EC0' }}
                    thumbColor={messageBlipsEnabled ? '#00FFF7' : '#CCCCCC'}
                  />
                </View>
              </>
            )}
          </View>

          {/* Storage Settings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>DATA STORAGE</Text>
            
            <TouchableOpacity style={styles.actionButton}>
              <Download size={16} color="#00FFF7" />
              <Text style={styles.actionButtonText}>Export Archive</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton}>
              <Shield size={16} color="#00FFF7" />
              <Text style={styles.actionButtonText}>Encrypt Local Data</Text>
            </TouchableOpacity>
          </View>

          {/* Danger Zone */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: '#FF0080' }]}>DANGER ZONE</Text>
            
            <TouchableOpacity style={[styles.actionButton, styles.dangerButton]}>
              <Trash2 size={16} color="#FFFFFF" />
              <Text style={[styles.actionButtonText, { color: '#FFFFFF' }]}>Purge All Data</Text>
            </TouchableOpacity>
          </View>

          {/* Warning */}
          <View style={styles.warningContainer}>
            <LinearGradient
              colors={['rgba(255, 0, 128, 0.1)', 'rgba(255, 184, 0, 0.05)']}
              style={styles.warningGradient}
            >
              <AlertTriangle size={20} color="#FF0080" />
              <Text style={styles.warningText}>
                VICE Logger operates in legal gray areas. Use responsibly and ensure compliance with local laws.
              </Text>
            </LinearGradient>
          </View>

          {/* Version Info */}
          <View style={styles.versionInfo}>
            <Text style={styles.versionText}>VICE Logger v1.0.0-ALPHA</Text>
            <Text style={styles.versionText}>Build: SURVEILLANCE.2025.001</Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FF2EC0',
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#AAAAAA',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    marginBottom: 16,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.3)',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.2)',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
    lineHeight: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 255, 247, 0.1)',
    borderWidth: 1,
    borderColor: '#00FFF7',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 8,
    gap: 8,
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 0, 128, 0.2)',
    borderColor: '#FF0080',
  },
  actionButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  warningContainer: {
    marginVertical: 24,
  },
  warningGradient: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 0, 128, 0.3)',
    gap: 12,
  },
  warningText: {
    flex: 1,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  versionInfo: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 4,
  },
  versionText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 1,
  },
});