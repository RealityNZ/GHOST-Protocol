import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Zap, Brain } from 'lucide-react-native';

export default function ConfigScreen() {
  const [neuralLinkActive, setNeuralLinkActive] = useState(false);
  const [autoResponse, setAutoResponse] = useState(true);
  const [noirMode, setNoirMode] = useState(true);
  const [cynicalMode, setCynicalMode] = useState(true);
  const [crypticMode, setCrypticMode] = useState(false);

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Settings size={24} color="#FFB000" />
          <Text style={styles.headerTitle}>NEURAL CONFIG</Text>
          <Zap size={24} color="#00FFF7" />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* AI Control Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AI CONTROL</Text>
            
            <View style={styles.statusCard}>
              <LinearGradient
                colors={['rgba(0, 255, 247, 0.2)', 'rgba(255, 46, 192, 0.1)']}
                style={styles.statusGradient}
              >
                <View style={styles.statusHeader}>
                  <Brain size={20} color="#00FFF7" />
                  <Text style={styles.statusTitle}>ACTIVE BACKEND</Text>
                </View>
                <Text style={styles.backendName}>OpenAI GPT-4</Text>
                <Text style={styles.backendModel}>Model: gpt-4</Text>
              </LinearGradient>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Neural Link</Text>
                <Text style={styles.settingDescription}>Enable AI response generation</Text>
              </View>
              <Switch
                value={neuralLinkActive}
                onValueChange={setNeuralLinkActive}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor={neuralLinkActive ? '#00FFF7' : '#CCCCCC'}
              />
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Auto Response</Text>
                <Text style={styles.settingDescription}>Automatically respond to triggers</Text>
              </View>
              <Switch
                value={autoResponse}
                onValueChange={setAutoResponse}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor={autoResponse ? '#00FFF7' : '#CCCCCC'}
              />
            </View>
          </View>

          {/* Persona Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>ACTIVE PERSONA</Text>
            
            <View style={styles.personaCard}>
              <View style={styles.personaInfo}>
                <Text style={styles.personaName}>Digital Ghost</Text>
                <Text style={styles.personaDescription}>
                  Burned-out hacker from 2077 • Deadpan noir style
                </Text>
              </View>
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            </View>
          </View>

          {/* Behavior Modifiers */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BEHAVIOR MODIFIERS</Text>

            <View style={styles.modifierGrid}>
              <View style={styles.modifierItem}>
                <Text style={styles.modifierName}>Noir Deadpan</Text>
                <Switch
                  value={noirMode}
                  onValueChange={setNoirMode}
                  trackColor={{ false: '#404040', true: '#FF2EC0' }}
                  thumbColor={noirMode ? '#00FFF7' : '#CCCCCC'}
                  style={styles.miniSwitch}
                />
              </View>
              <View style={styles.modifierItem}>
                <Text style={styles.modifierName}>Cynical</Text>
                <Switch
                  value={cynicalMode}
                  onValueChange={setCynicalMode}
                  trackColor={{ false: '#404040', true: '#FF2EC0' }}
                  thumbColor={cynicalMode ? '#00FFF7' : '#CCCCCC'}
                  style={styles.miniSwitch}
                />
              </View>
              <View style={styles.modifierItem}>
                <Text style={styles.modifierName}>Cryptic</Text>
                <Switch
                  value={crypticMode}
                  onValueChange={setCrypticMode}
                  trackColor={{ false: '#404040', true: '#FF2EC0' }}
                  thumbColor={crypticMode ? '#00FFF7' : '#CCCCCC'}
                  style={styles.miniSwitch}
                />
              </View>
            </View>
          </View>

          {/* System Status */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>
            
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>TRIGGERS</Text>
                <Text style={styles.statusValue}>3 ACTIVE</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>BACKENDS</Text>
                <Text style={styles.statusValue}>1 READY</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>PLUGINS</Text>
                <Text style={styles.statusValue}>0 LOADED</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>TOKENS</Text>
                <Text style={styles.statusValue}>2 STORED</Text>
              </View>
            </View>
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
    color: '#FFB000',
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
  statusCard: {
    marginBottom: 16,
  },
  statusGradient: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FFF7',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  backendName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  backendModel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#AAAAAA',
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
  personaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 46, 192, 0.1)',
    borderWidth: 1,
    borderColor: '#FF2EC0',
    borderRadius: 6,
    padding: 12,
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  personaDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
    lineHeight: 15,
  },
  activeIndicator: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 8,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  modifierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modifierItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  modifierName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  miniSwitch: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#AAAAAA',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
});