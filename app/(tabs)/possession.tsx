import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Zap, Play, Send, Eye } from 'lucide-react-native';

export default function PossessionScreen() {
  const [isActive, setIsActive] = useState(false);
  const [currentPrompt] = useState('Waiting for trigger...');
  const [currentResponse, setCurrentResponse] = useState('');

  const togglePossession = () => {
    setIsActive(!isActive);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Brain size={24} color="#FF2EC0" />
          <Text style={styles.headerTitle}>NEURAL HIJACK</Text>
          <Zap size={24} color={isActive ? '#00FF00' : '#666666'} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Possession Control */}
          <View style={styles.controlSection}>
            <Text style={styles.sectionTitle}>POSSESSION STATUS</Text>
            
            <TouchableOpacity 
              style={[styles.possessionButton, isActive && styles.possessionButtonActive]}
              onPress={togglePossession}
            >
              <View style={styles.possessionIcon}>
                <Eye size={32} color={isActive ? '#00FFF7' : '#888888'} />
              </View>
              <Text style={[styles.possessionText, { color: isActive ? '#00FFF7' : '#AAAAAA' }]}>
                {isActive ? 'NEURAL LINK ACTIVE' : 'NEURAL LINK DORMANT'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Generation Interface */}
          {isActive && (
            <View style={styles.generationSection}>
              <Text style={styles.sectionTitle}>RESPONSE GENERATION</Text>
              
              <View style={styles.promptContainer}>
                <Text style={styles.promptLabel}>CURRENT PROMPT:</Text>
                <View style={styles.promptBox}>
                  <Text style={styles.promptText}>{currentPrompt}</Text>
                </View>
              </View>

              <View style={styles.responseContainer}>
                <Text style={styles.responseLabel}>GENERATED RESPONSE:</Text>
                <View style={styles.responseBox}>
                  <TextInput
                    style={styles.responseInput}
                    multiline
                    placeholder="Response will appear here..."
                    placeholderTextColor="#666666"
                    value={currentResponse}
                    onChangeText={setCurrentResponse}
                  />
                </View>
              </View>

              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Play size={16} color="#0C0C0C" />
                  <Text style={styles.actionButtonText}>GENERATE</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.sendButton}>
                  <Send size={16} color="#0C0C0C" />
                  <Text style={styles.sendButtonText}>SEND</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Status Display */}
          <View style={styles.statusSection}>
            <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>
            
            <View style={styles.statusGrid}>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>TRIGGERS</Text>
                <Text style={styles.statusValue}>3 ACTIVE</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>PERSONA</Text>
                <Text style={styles.statusValue}>DIGITAL GHOST</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>MODIFIERS</Text>
                <Text style={styles.statusValue}>5 ENABLED</Text>
              </View>
              <View style={styles.statusItem}>
                <Text style={styles.statusLabel}>RESPONSES</Text>
                <Text style={styles.statusValue}>127 SENT</Text>
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
    color: '#FF2EC0',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  controlSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    marginBottom: 16,
  },
  possessionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderWidth: 2,
    borderColor: '#666666',
    borderRadius: 12,
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  possessionButtonActive: {
    borderColor: '#FF2EC0',
    backgroundColor: 'rgba(255, 46, 192, 0.1)',
  },
  possessionIcon: {
    marginBottom: 12,
  },
  possessionText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    letterSpacing: 2,
  },
  generationSection: {
    marginBottom: 30,
  },
  promptContainer: {
    marginBottom: 20,
  },
  promptLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#FFB000',
    letterSpacing: 1,
    marginBottom: 8,
  },
  promptBox: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#FFB000',
    borderRadius: 6,
    padding: 12,
    minHeight: 60,
  },
  promptText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 16,
  },
  responseContainer: {
    marginBottom: 20,
  },
  responseLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#00FFF7',
    letterSpacing: 1,
    marginBottom: 8,
  },
  responseBox: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFF7',
    borderRadius: 6,
    minHeight: 100,
  },
  responseInput: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    padding: 12,
    textAlignVertical: 'top',
    minHeight: 100,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB000',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  actionButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  sendButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  sendButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  statusSection: {
    marginBottom: 30,
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