import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, ArrowRight, ArrowLeft, Bot, User, Brain, Shield, CircleCheck as CheckCircle, Server, Key, Zap, SkipForward, ExternalLink } from 'lucide-react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withRepeat,
  withSequence 
} from 'react-native-reanimated';
import { useOnboarding } from '@/hooks/useOnboarding';
import { OnboardingData } from '@/types/onboarding';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const {
    state,
    updateData,
    nextStep,
    previousStep,
    completeOnboarding,
    skipOnboarding,
    getCurrentStep,
    getProgress,
    canProceed,
  } = useOnboarding();

  const [isProcessing, setIsProcessing] = useState(false);
  const glitchOpacity = useSharedValue(1);
  const progressWidth = useSharedValue(0);

  React.useEffect(() => {
    progressWidth.value = withTiming(getProgress(), { duration: 500 });
    
    // Glitch effect
    glitchOpacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2000 }),
        withTiming(0.8, { duration: 100 }),
        withTiming(1, { duration: 100 })
      ),
      -1,
      false
    );
  }, [state.currentStep]);

  const glitchStyle = useAnimatedStyle(() => ({
    opacity: glitchOpacity.value,
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const handleNext = async () => {
    if (getCurrentStep().id === 'complete') {
      setIsProcessing(true);
      const success = await completeOnboarding();
      setIsProcessing(false);
      
      if (success) {
        onComplete();
      } else {
        Alert.alert('Setup Error', 'Failed to complete setup. Please check your configuration.');
      }
    } else {
      nextStep();
    }
  };

  const handleSkip = () => {
    Alert.alert(
      'Skip Setup?',
      'You can configure these settings later in the app. Continue without setup?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Skip', 
          style: 'destructive',
          onPress: () => {
            skipOnboarding();
            onComplete();
          }
        }
      ]
    );
  };

  const renderWelcome = () => (
    <View style={styles.stepContent}>
      <Animated.View style={[styles.logoContainer, glitchStyle]}>
        <View style={styles.eye}>
          <View style={styles.eyeball} />
          <View style={styles.pupil} />
        </View>
      </Animated.View>
      
      <Text style={styles.welcomeTitle}>GHOST PROTOCOL</Text>
      <Text style={styles.welcomeSubtitle}>NEURAL SURVEILLANCE SYSTEM</Text>
      
      <View style={styles.welcomeDescription}>
        <Text style={styles.descriptionText}>
          Initialize your neural surveillance network. This setup will configure:
        </Text>
        
        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Server size={16} color="#00FFF7" />
            <Text style={styles.featureText}>Discord gateway connection</Text>
          </View>
          <View style={styles.featureItem}>
            <Brain size={16} color="#FF2EC0" />
            <Text style={styles.featureText}>AI response generation</Text>
          </View>
          <View style={styles.featureItem}>
            <Shield size={16} color="#FFB000" />
            <Text style={styles.featureText}>Security protocols</Text>
          </View>
          <View style={styles.featureItem}>
            <Eye size={16} color="#00FFF7" />
            <Text style={styles.featureText}>Surveillance parameters</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderDiscord = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>DISCORD GATEWAY</Text>
      <Text style={styles.stepDescription}>
        Configure how VICE Logger connects to Discord servers
      </Text>

      {/* Connection Mode */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>CONNECTION MODE</Text>
        <View style={styles.modeSelector}>
          <TouchableOpacity
            style={[
              styles.modeOption,
              state.data.discordMode === 'bot' && styles.modeOptionActive
            ]}
            onPress={() => updateData({ discordMode: 'bot' })}
          >
            <Bot size={16} color={state.data.discordMode === 'bot' ? '#00FFF7' : '#CCCCCC'} />
            <Text style={[
              styles.modeOptionText,
              { color: state.data.discordMode === 'bot' ? '#00FFF7' : '#CCCCCC' }
            ]}>
              BOT GATEWAY
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.modeOption,
              state.data.discordMode === 'user' && styles.modeOptionActive
            ]}
            onPress={() => updateData({ discordMode: 'user' })}
          >
            <User size={16} color={state.data.discordMode === 'user' ? '#FFB000' : '#CCCCCC'} />
            <Text style={[
              styles.modeOptionText,
              { color: state.data.discordMode === 'user' ? '#FFB000' : '#CCCCCC' }
            ]}>
              USER GATEWAY
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Token Configuration */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>TOKEN CONFIGURATION</Text>
        <TextInput
          style={styles.textInput}
          value={state.data.discordTokenName || ''}
          onChangeText={(text) => updateData({ discordTokenName: text })}
          placeholder="Token name (e.g., 'Main Bot', 'Personal Account')"
          placeholderTextColor="#666666"
        />
        <TextInput
          style={styles.textInput}
          value={state.data.discordToken || ''}
          onChangeText={(text) => updateData({ discordToken: text })}
          placeholder={state.data.discordMode === 'bot' ? 
            'Discord Bot Token...' : 
            'Discord User Token...'
          }
          placeholderTextColor="#666666"
          secureTextEntry
        />
      </View>

      {state.data.discordMode === 'user' && (
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>
            ⚠️ User Gateway violates Discord ToS and may result in account termination
          </Text>
        </View>
      )}

      <TouchableOpacity style={styles.helpButton}>
        <ExternalLink size={14} color="#00FFF7" />
        <Text style={styles.helpButtonText}>Need help getting a token?</Text>
      </TouchableOpacity>
    </View>
  );

  const renderAI = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>AI BACKEND</Text>
      <Text style={styles.stepDescription}>
        Configure the neural network for response generation
      </Text>

      {/* Backend Type */}
      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>BACKEND TYPE</Text>
        <View style={styles.backendGrid}>
          {[
            { key: 'openai', label: 'OpenAI', icon: Brain, color: '#00FFF7' },
            { key: 'anthropic', label: 'Anthropic', icon: Brain, color: '#FF2EC0' },
            { key: 'local', label: 'Local Model', icon: Server, color: '#FFB000' },
            { key: 'custom', label: 'Custom API', icon: Zap, color: '#CCCCCC' },
          ].map(backend => (
            <TouchableOpacity
              key={backend.key}
              style={[
                styles.backendOption,
                state.data.aiBackend === backend.key && styles.backendOptionActive
              ]}
              onPress={() => updateData({ aiBackend: backend.key as any })}
            >
              <backend.icon 
                size={20} 
                color={state.data.aiBackend === backend.key ? backend.color : '#666666'} 
              />
              <Text style={[
                styles.backendOptionText,
                { color: state.data.aiBackend === backend.key ? backend.color : '#666666' }
              ]}>
                {backend.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* API Configuration */}
      {state.data.aiBackend && state.data.aiBackend !== 'local' && (
        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>API CONFIGURATION</Text>
          <TextInput
            style={styles.textInput}
            value={state.data.aiApiKey || ''}
            onChangeText={(text) => updateData({ aiApiKey: text })}
            placeholder="API Key..."
            placeholderTextColor="#666666"
            secureTextEntry
          />
          
          {state.data.aiBackend === 'custom' && (
            <TextInput
              style={styles.textInput}
              value={state.data.aiEndpoint || ''}
              onChangeText={(text) => updateData({ aiEndpoint: text })}
              placeholder="API Endpoint URL..."
              placeholderTextColor="#666666"
            />
          )}
          
          <TextInput
            style={styles.textInput}
            value={state.data.aiModel || ''}
            onChangeText={(text) => updateData({ aiModel: text })}
            placeholder={`Model name (e.g., ${getModelPlaceholder()})`}
            placeholderTextColor="#666666"
          />
        </View>
      )}

      {state.data.aiBackend === 'local' && (
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            Local mode uses Ollama (localhost:11434). Make sure you have a local AI server running.
          </Text>
        </View>
      )}
    </View>
  );

  const getModelPlaceholder = (): string => {
    switch (state.data.aiBackend) {
      case 'openai': return 'gpt-4, gpt-3.5-turbo';
      case 'anthropic': return 'claude-3-sonnet-20240229';
      case 'local': return 'llama2, mistral, codellama';
      default: return 'model-name';
    }
  };

  const renderSecurity = () => (
    <View style={styles.stepContent}>
      <Text style={styles.stepTitle}>SECURITY PROTOCOLS</Text>
      <Text style={styles.stepDescription}>
        Initialize encryption and access controls for token storage
      </Text>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>MASTER PASSPHRASE</Text>
        <TextInput
          style={styles.textInput}
          value={state.data.masterPassphrase || ''}
          onChangeText={(text) => updateData({ masterPassphrase: text })}
          placeholder="Enter a strong passphrase (min 8 characters)..."
          placeholderTextColor="#666666"
          secureTextEntry
        />
        
        <View style={styles.passphraseStrength}>
          <Text style={styles.strengthLabel}>Strength:</Text>
          <View style={[
            styles.strengthBar,
            { backgroundColor: getPassphraseStrengthColor() }
          ]} />
          <Text style={styles.strengthText}>{getPassphraseStrengthText()}</Text>
        </View>
      </View>

      <View style={styles.inputSection}>
        <Text style={styles.inputLabel}>AUTO-LOCK TIMER</Text>
        <View style={styles.timerOptions}>
          {[15, 30, 60, 120].map(minutes => (
            <TouchableOpacity
              key={minutes}
              style={[
                styles.timerOption,
                state.data.autoLockMinutes === minutes && styles.timerOptionActive
              ]}
              onPress={() => updateData({ autoLockMinutes: minutes })}
            >
              <Text style={[
                styles.timerOptionText,
                { color: state.data.autoLockMinutes === minutes ? '#00FFF7' : '#CCCCCC' }
              ]}>
                {minutes}m
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.securityFeatures}>
        <View style={styles.securityFeature}>
          <CheckCircle size={16} color="#00FF00" />
          <Text style={styles.securityFeatureText}>AES-256 encryption</Text>
        </View>
        <View style={styles.securityFeature}>
          <CheckCircle size={16} color="#00FF00" />
          <Text style={styles.securityFeatureText}>Device key salting</Text>
        </View>
        <View style={styles.securityFeature}>
          <CheckCircle size={16} color="#00FF00" />
          <Text style={styles.securityFeatureText}>Automatic token expiry</Text>
        </View>
        <View style={styles.securityFeature}>
          <CheckCircle size={16} color="#00FF00" />
          <Text style={styles.securityFeatureText}>Complete audit logging</Text>
        </View>
      </View>
    </View>
  );

  const getPassphraseStrengthColor = (): string => {
    const length = state.data.masterPassphrase?.length || 0;
    if (length < 8) return '#FF0080';
    if (length < 12) return '#FFB000';
    return '#00FF00';
  };

  const getPassphraseStrengthText = (): string => {
    const length = state.data.masterPassphrase?.length || 0;
    if (length < 8) return 'WEAK';
    if (length < 12) return 'MEDIUM';
    return 'STRONG';
  };

  const renderComplete = () => (
    <View style={styles.stepContent}>
      <Animated.View style={[styles.completeIcon, glitchStyle]}>
        <CheckCircle size={64} color="#00FF00" />
      </Animated.View>
      
      <Text style={styles.completeTitle}>NEURAL LINK ESTABLISHED</Text>
      <Text style={styles.completeSubtitle}>VICE Logger is ready for surveillance operations</Text>
      
      <View style={styles.setupSummary}>
        <Text style={styles.summaryTitle}>CONFIGURATION SUMMARY</Text>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Discord:</Text>
          <Text style={styles.summaryValue}>
            {state.data.discordMode?.toUpperCase()} Gateway ({state.data.discordTokenName})
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>AI Backend:</Text>
          <Text style={styles.summaryValue}>
            {state.data.aiBackend?.toUpperCase()} ({state.data.aiModel || 'Default'})
          </Text>
        </View>
        
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Security:</Text>
          <Text style={styles.summaryValue}>
            Encryption Enabled, {state.data.autoLockMinutes}m Auto-Lock
          </Text>
        </View>
      </View>

      <View style={styles.readyIndicators}>
        <View style={styles.readyItem}>
          <View style={styles.readyDot} />
          <Text style={styles.readyText}>Token Vault Initialized</Text>
        </View>
        <View style={styles.readyItem}>
          <View style={styles.readyDot} />
          <Text style={styles.readyText}>AI Backend Configured</Text>
        </View>
        <View style={styles.readyItem}>
          <View style={styles.readyDot} />
          <Text style={styles.readyText}>Security Protocols Active</Text>
        </View>
      </View>
    </View>
  );

  const currentStep = getCurrentStep();

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SYSTEM INITIALIZATION</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <SkipForward size={16} color="#666666" />
          <Text style={styles.skipButtonText}>SKIP</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, progressStyle]} />
        </View>
        <Text style={styles.progressText}>
          Step {state.currentStep + 1} of {state.totalSteps}
        </Text>
      </View>

      {/* Step Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.stepContainer}>
          <Text style={styles.stepNumber}>
            {String(state.currentStep + 1).padStart(2, '0')}
          </Text>
          
          {currentStep.component === 'welcome' && renderWelcome()}
          {currentStep.component === 'discord' && renderDiscord()}
          {currentStep.component === 'ai' && renderAI()}
          {currentStep.component === 'security' && renderSecurity()}
          {currentStep.component === 'complete' && renderComplete()}
        </View>
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigation}>
        {state.currentStep > 0 && (
          <TouchableOpacity style={styles.navButton} onPress={previousStep}>
            <ArrowLeft size={16} color="#CCCCCC" />
            <Text style={styles.navButtonText}>BACK</Text>
          </TouchableOpacity>
        )}
        
        <View style={styles.navSpacer} />
        
        <TouchableOpacity 
          style={[
            styles.navButton,
            styles.nextButton,
            !canProceed() && styles.navButtonDisabled
          ]}
          onPress={handleNext}
          disabled={!canProceed() || isProcessing}
        >
          <Text style={styles.nextButtonText}>
            {isProcessing ? 'INITIALIZING...' : 
             currentStep.id === 'complete' ? 'ACTIVATE' : 'NEXT'}
          </Text>
          {currentStep.id !== 'complete' && (
            <ArrowRight size={16} color="#0C0C0C" />
          )}
        </TouchableOpacity>
      </View>

      {/* Static overlay */}
      <Animated.View style={[styles.staticOverlay, glitchStyle]} />
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
    borderBottomColor: '#FF2EC0',
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FF2EC0',
    letterSpacing: 2,
  },
  skipButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  skipButtonText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#666666',
    letterSpacing: 1,
  },
  progressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    fontSize: 11,
    color: '#E0E0E0',
    textAlign: 'center',
    letterSpacing: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stepContainer: {
    paddingVertical: 20,
  },
  stepNumber: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 48,
    color: 'rgba(255, 46, 192, 0.2)',
    textAlign: 'center',
    marginBottom: 20,
    letterSpacing: 4,
  },
  stepContent: {
    alignItems: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  eye: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#00FFF7',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0C0C0C',
  },
  eyeball: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00FFF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pupil: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#0C0C0C',
  },
  welcomeTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 32,
    color: '#00FFF7',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#FF2EC0',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 32,
  },
  welcomeDescription: {
    width: '100%',
    maxWidth: 400,
  },
  descriptionText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  featureList: {
    gap: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  stepTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    color: '#FF2EC0',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
  },
  inputLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    marginBottom: 12,
  },
  textInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#FF2EC0',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#E0E0E0',
    marginBottom: 12,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
  },
  modeOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    gap: 8,
  },
  modeOptionActive: {
    borderColor: '#FF2EC0',
    backgroundColor: 'rgba(255, 46, 192, 0.1)',
  },
  modeOptionText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  backendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  backendOption: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    gap: 8,
  },
  backendOptionActive: {
    borderColor: '#FF2EC0',
    backgroundColor: 'rgba(255, 46, 192, 0.1)',
  },
  backendOptionText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    letterSpacing: 1,
  },
  warningBox: {
    backgroundColor: 'rgba(255, 0, 128, 0.1)',
    borderWidth: 1,
    borderColor: '#FF0080',
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
  },
  warningText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 16,
  },
  infoBox: {
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#FFB000',
    borderRadius: 6,
    padding: 12,
    marginTop: 12,
  },
  infoText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
    textAlign: 'center',
    lineHeight: 16,
  },
  helpButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    gap: 6,
  },
  helpButtonText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  passphraseStrength: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  strengthLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  timerOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  timerOption: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    alignItems: 'center',
  },
  timerOptionActive: {
    borderColor: '#00FFF7',
    backgroundColor: 'rgba(0, 255, 247, 0.1)',
  },
  timerOptionText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  securityFeatures: {
    width: '100%',
    gap: 8,
    marginTop: 16,
  },
  securityFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  securityFeatureText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#E0E0E0',
  },
  completeIcon: {
    marginBottom: 24,
  },
  completeTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 24,
    color: '#00FF00',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 8,
  },
  completeSubtitle: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#E0E0E0',
    textAlign: 'center',
    marginBottom: 32,
  },
  setupSummary: {
    width: '100%',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFF7',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
  },
  summaryTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  summaryValue: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  readyIndicators: {
    width: '100%',
    gap: 8,
  },
  readyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  readyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
  },
  readyText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#E0E0E0',
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 46, 192, 0.2)',
  },
  navSpacer: {
    flex: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    gap: 6,
  },
  nextButton: {
    backgroundColor: '#00FFF7',
    borderColor: '#00FFF7',
  },
  navButtonDisabled: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderColor: '#333333',
  },
  navButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  nextButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  staticOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 46, 192, 0.01)',
    pointerEvents: 'none',
  },
});