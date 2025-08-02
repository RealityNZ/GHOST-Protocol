import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Linking } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bot, User, Shield, TriangleAlert as AlertTriangle, ExternalLink, Copy, CircleCheck as CheckCircle, Circle as XCircle, Zap } from 'lucide-react-native';

interface DiscordConnectionWizardProps {
  onClose: () => void;
  onConnect: (token: string, mode: 'bot' | 'user') => void;
}

export default function DiscordConnectionWizard({ onClose, onConnect }: DiscordConnectionWizardProps) {
  const [step, setStep] = useState<'mode' | 'bot-setup' | 'user-setup' | 'test'>('mode');
  const [selectedMode, setSelectedMode] = useState<'bot' | 'user' | null>(null);
  const [token, setToken] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);
  const [connectionResult, setConnectionResult] = useState<'success' | 'error' | null>(null);

  const handleModeSelect = (mode: 'bot' | 'user') => {
    setSelectedMode(mode);
    setStep(mode === 'bot' ? 'bot-setup' : 'user-setup');
  };

  const testConnection = async () => {
    if (!token.trim()) {
      Alert.alert('Error', 'Please enter a token');
      return;
    }

    setIsTestingConnection(true);
    setConnectionResult(null);

    try {
      // Mock connection test - in real implementation, this would test the Discord API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random success/failure for demo
      const success = Math.random() > 0.3;
      
      if (success) {
        setConnectionResult('success');
        setTimeout(() => {
          onConnect(token, selectedMode!);
        }, 1500);
      } else {
        setConnectionResult('error');
      }
    } catch (error) {
      setConnectionResult('error');
    } finally {
      setIsTestingConnection(false);
    }
  };

  const copyToClipboard = (text: string) => {
    // In a real implementation, use Clipboard API
    console.log('Copied to clipboard:', text);
    Alert.alert('Copied', 'Text copied to clipboard');
  };

  const openLink = (url: string) => {
    Linking.openURL(url);
  };

  const renderModeSelection = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>SELECT CONNECTION MODE</Text>
      <Text style={styles.stepDescription}>
        Choose how VICE Logger will connect to Discord
      </Text>

      {/* Bot Gateway Option */}
      <TouchableOpacity 
        style={styles.modeCard}
        onPress={() => handleModeSelect('bot')}
      >
        <LinearGradient
          colors={['rgba(0, 255, 247, 0.1)', 'rgba(0, 255, 247, 0.05)']}
          style={styles.modeGradient}
        >
          <View style={styles.modeHeader}>
            <Bot size={24} color="#00FFF7" />
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>Bot Gateway</Text>
              <View style={styles.safetyBadge}>
                <Shield size={12} color="#00FF00" />
                <Text style={styles.safetyText}>SAFE</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.modeDescription}>
            Official Discord Bot API. Requires server admin approval but fully compliant with Discord ToS.
          </Text>
          
          <View style={styles.modeFeatures}>
            <Text style={styles.modeFeature}>✅ Discord ToS Compliant</Text>
            <Text style={styles.modeFeature}>✅ Transparent to users</Text>
            <Text style={styles.modeFeature}>✅ Configurable permissions</Text>
            <Text style={styles.modeFeature}>❌ Requires admin approval</Text>
            <Text style={styles.modeFeature}>❌ No DM access</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>

      {/* User Gateway Option */}
      <TouchableOpacity 
        style={styles.modeCard}
        onPress={() => handleModeSelect('user')}
      >
        <LinearGradient
          colors={['rgba(255, 184, 0, 0.1)', 'rgba(255, 0, 128, 0.05)']}
          style={styles.modeGradient}
        >
          <View style={styles.modeHeader}>
            <User size={24} color="#FFB000" />
            <View style={styles.modeInfo}>
              <Text style={styles.modeTitle}>User Gateway</Text>
              <View style={[styles.safetyBadge, { backgroundColor: 'rgba(255, 0, 128, 0.2)' }]}>
                <AlertTriangle size={12} color="#FF0080" />
                <Text style={[styles.safetyText, { color: '#FF0080' }]}>RISKY</Text>
              </View>
            </View>
          </View>
          
          <Text style={styles.modeDescription}>
            Uses your personal Discord account. Full access but violates Discord ToS.
          </Text>
          
          <View style={styles.modeFeatures}>
            <Text style={styles.modeFeature}>✅ Full account access</Text>
            <Text style={styles.modeFeature}>✅ DM monitoring</Text>
            <Text style={styles.modeFeature}>✅ No admin approval needed</Text>
            <Text style={[styles.modeFeature, { color: '#FF0080' }]}>❌ Violates Discord ToS</Text>
            <Text style={[styles.modeFeature, { color: '#FF0080' }]}>❌ Account ban risk</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );

  const renderBotSetup = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>BOT GATEWAY SETUP</Text>
      
      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Step 1: Create Discord Application</Text>
        <Text style={styles.instructionText}>
          1. Go to Discord Developer Portal
        </Text>
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => openLink('https://discord.com/developers/applications')}
        >
          <ExternalLink size={14} color="#00FFF7" />
          <Text style={styles.linkText}>Open Developer Portal</Text>
        </TouchableOpacity>
        
        <Text style={styles.instructionText}>
          2. Click "New Application" and name it{'\n'}
          3. Navigate to "Bot" section{'\n'}
          4. Click "Add Bot"{'\n'}
          5. Disable "Public Bot" for private use
        </Text>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Step 2: Configure Permissions</Text>
        <Text style={styles.instructionText}>
          Copy this permission integer for VICE Logger:
        </Text>
        <TouchableOpacity 
          style={styles.copyCard}
          onPress={() => copyToClipboard('274877908992')}
        >
          <Text style={styles.copyText}>274877908992</Text>
          <Copy size={16} color="#00FFF7" />
        </TouchableOpacity>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Step 3: Get Bot Token</Text>
        <Text style={styles.instructionText}>
          1. In Bot section, click "Reset Token"{'\n'}
          2. Copy the token immediately{'\n'}
          3. Paste it below:
        </Text>
        
        <TextInput
          style={styles.tokenInput}
          value={token}
          onChangeText={setToken}
          placeholder="Paste your bot token here..."
          placeholderTextColor="#666666"
          secureTextEntry
        />
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Step 4: Invite Bot to Server</Text>
        <Text style={styles.instructionText}>
          1. Use the OAuth2 URL Generator in Developer Portal{'\n'}
          2. Or use this template (replace YOUR_CLIENT_ID):
        </Text>
        <Text style={styles.urlTemplate}>
          https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=274877908992&scope=bot
        </Text>
        <Text style={styles.instructionText}>
          3. After inviting, get the Server ID:{'\n'}
          • Right-click the server name in Discord{'\n'}
          • Enable Developer Mode in Discord settings{'\n'}
          • Select "Copy Server ID"
        </Text>
      </View>

      <View style={styles.stepActions}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep('mode')}>
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => setStep('test')}
          disabled={!token.trim()}
        >
          <Text style={styles.testButtonText}>TEST CONNECTION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderUserSetup = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>USER GATEWAY SETUP</Text>
      
      <View style={styles.warningCard}>
        <AlertTriangle size={24} color="#FF0080" />
        <View style={styles.warningContent}>
          <Text style={styles.warningTitle}>HIGH RISK MODE</Text>
          <Text style={styles.warningText}>
            This method violates Discord's Terms of Service and may result in account termination. 
            Use only for educational purposes or with burner accounts.
          </Text>
        </View>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Method 1: Browser Developer Tools</Text>
        <Text style={styles.instructionText}>
          1. Open Discord in your browser{'\n'}
          2. Press F12 to open Developer Tools{'\n'}
          3. Go to Network tab{'\n'}
          4. Refresh Discord page{'\n'}
          5. Look for requests to discord.com/api{'\n'}
          6. Find Authorization header: "Bearer TOKEN_HERE"{'\n'}
          7. Copy the token (without "Bearer ")
        </Text>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Method 2: Console Extraction</Text>
        <Text style={styles.instructionText}>
          1. Open Discord in browser{'\n'}
          2. Press F12 → Console tab{'\n'}
          3. Paste and run this code:
        </Text>
        <TouchableOpacity 
          style={styles.codeCard}
          onPress={() => copyToClipboard('(webpackChunkdiscord_app.push([[\'\'],{},e=>{m=[];for(let c in e.c)m.push(e.c[c])}]),m).find(m=>m?.exports?.default?.getToken!==void 0).exports.default.getToken()')}
        >
          <Text style={styles.codeText}>
            (webpackChunkdiscord_app.push...
          </Text>
          <Copy size={14} color="#FFB000" />
        </TouchableOpacity>
      </View>

      <View style={styles.instructionCard}>
        <Text style={styles.instructionTitle}>Enter Your User Token</Text>
        <TextInput
          style={styles.tokenInput}
          value={token}
          onChangeText={setToken}
          placeholder="Paste your user token here..."
          placeholderTextColor="#666666"
          secureTextEntry
        />
      </View>

      <View style={styles.stepActions}>
        <TouchableOpacity style={styles.backButton} onPress={() => setStep('mode')}>
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.testButton}
          onPress={() => setStep('test')}
          disabled={!token.trim()}
        >
          <Text style={styles.testButtonText}>TEST CONNECTION</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderConnectionTest = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>CONNECTION TEST</Text>
      
      <View style={styles.testCard}>
        <View style={styles.testHeader}>
          <Text style={styles.testMode}>
            {selectedMode === 'bot' ? 'Bot Gateway' : 'User Gateway'} Mode
          </Text>
          {selectedMode === 'bot' ? (
            <Bot size={20} color="#00FFF7" />
          ) : (
            <User size={20} color="#FFB000" />
          )}
        </View>
        
        <Text style={styles.testDescription}>
          Testing connection to Discord API...
        </Text>

        {connectionResult === 'success' && (
          <View style={styles.resultCard}>
            <CheckCircle size={24} color="#00FF00" />
            <Text style={styles.successText}>Connection Successful!</Text>
            <Text style={styles.successSubtext}>
              Token validated and ready for use
            </Text>
          </View>
        )}

        {connectionResult === 'error' && (
          <View style={styles.resultCard}>
            <XCircle size={24} color="#FF0080" />
            <Text style={styles.errorText}>Connection Failed</Text>
            <Text style={styles.errorSubtext}>
              Check your token and try again
            </Text>
          </View>
        )}

        {!connectionResult && (
          <TouchableOpacity 
            style={styles.testConnectionButton}
            onPress={testConnection}
            disabled={isTestingConnection}
          >
            <Zap size={16} color="#0C0C0C" />
            <Text style={styles.testConnectionText}>
              {isTestingConnection ? 'TESTING...' : 'TEST CONNECTION'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.stepActions}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => setStep(selectedMode === 'bot' ? 'bot-setup' : 'user-setup')}
        >
          <Text style={styles.backButtonText}>BACK</Text>
        </TouchableOpacity>
        
        {connectionResult === 'success' && (
          <TouchableOpacity 
            style={styles.connectButton}
            onPress={() => onConnect(token, selectedMode!)}
          >
            <Text style={styles.connectButtonText}>CONNECT</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>DISCORD CONNECTION WIZARD</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>CLOSE</Text>
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View style={[
              styles.progressFill, 
              { 
                width: step === 'mode' ? '25%' : 
                       step === 'bot-setup' || step === 'user-setup' ? '75%' : 
                       '100%' 
              }
            ]} />
          </View>
          <Text style={styles.progressText}>
            Step {step === 'mode' ? '1' : step === 'test' ? '3' : '2'} of 3
          </Text>
        </View>

        {/* Step Content */}
        {step === 'mode' && renderModeSelection()}
        {step === 'bot-setup' && renderBotSetup()}
        {step === 'user-setup' && renderUserSetup()}
        {step === 'test' && renderConnectionTest()}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#FF2EC0',
    marginBottom: 20,
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#00FFF7',
    letterSpacing: 2,
  },
  closeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: 'rgba(255, 0, 128, 0.2)',
    borderRadius: 4,
  },
  closeButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#FF0080',
    letterSpacing: 1,
  },
  progressContainer: {
    marginBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FFF7',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  stepContent: {
    paddingBottom: 40,
  },
  stepTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FF2EC0',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  modeCard: {
    marginBottom: 16,
  },
  modeGradient: {
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  modeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  safetyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  safetyText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#00FF00',
    letterSpacing: 1,
  },
  modeDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#E0E0E0',
    lineHeight: 18,
    marginBottom: 16,
  },
  modeFeatures: {
    gap: 6,
  },
  modeFeature: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#CCCCCC',
    lineHeight: 16,
  },
  instructionCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.2)',
  },
  instructionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#00FFF7',
    letterSpacing: 1,
    marginBottom: 8,
  },
  instructionText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
    lineHeight: 16,
    marginBottom: 8,
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 247, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  linkText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  copyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFF7',
    borderRadius: 4,
    padding: 12,
  },
  copyText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  tokenInput: {
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#FF2EC0',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#E0E0E0',
  },
  urlTemplate: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#CCCCCC',
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    padding: 8,
    borderRadius: 4,
    lineHeight: 14,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 0, 128, 0.1)',
    borderWidth: 1,
    borderColor: '#FF0080',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FF0080',
    letterSpacing: 1,
    marginBottom: 6,
  },
  warningText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
    lineHeight: 16,
  },
  codeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#FFB000',
    borderRadius: 4,
    padding: 12,
  },
  codeText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#FFB000',
    flex: 1,
  },
  testCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderRadius: 8,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
    alignItems: 'center',
    marginBottom: 24,
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  testMode: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  testDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
  },
  resultCard: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  successText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#00FF00',
    letterSpacing: 1,
  },
  successSubtext: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  errorText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#FF0080',
    letterSpacing: 1,
  },
  errorSubtext: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
    textAlign: 'center',
  },
  testConnectionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB000',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  testConnectionText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  stepActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 20,
  },
  backButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    alignItems: 'center',
  },
  backButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  testButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#FFB000',
    borderRadius: 6,
    alignItems: 'center',
  },
  testButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  connectButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#00FFF7',
    borderRadius: 6,
    alignItems: 'center',
  },
  connectButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
});