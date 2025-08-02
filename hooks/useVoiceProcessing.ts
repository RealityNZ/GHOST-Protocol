import { useState, useCallback, useRef } from 'react';
import { Platform } from 'react-native';

export interface VoiceMessage {
  id: string;
  audioUrl: string;
  duration: number;
  author: {
    id: string;
    username: string;
  };
  channel: {
    id: string;
    name: string;
  };
  timestamp: string;
  transcription?: string;
  transcriptionStatus: 'pending' | 'processing' | 'completed' | 'failed';
  confidence?: number;
}

export interface VoiceProcessingSettings {
  autoTranscribe: boolean;
  language: string;
  confidenceThreshold: number;
  maxDuration: number; // seconds
  enableSpeakerDetection: boolean;
}

export function useVoiceProcessing() {
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<VoiceProcessingSettings>({
    autoTranscribe: false,
    language: 'en-US',
    confidenceThreshold: 0.7,
    maxDuration: 300, // 5 minutes
    enableSpeakerDetection: false,
  });

  const processingQueue = useRef<VoiceMessage[]>([]);

  const processVoiceMessage = useCallback(async (voiceMessage: VoiceMessage): Promise<VoiceMessage> => {
    if (Platform.OS === 'web') {
      console.log('🎤 Voice processing not available on web platform');
      return {
        ...voiceMessage,
        transcriptionStatus: 'failed',
        transcription: 'Voice processing not available on web platform'
      };
    }

    setIsProcessing(true);
    
    try {
      console.log(`🎤 Processing voice message from @${voiceMessage.author.username} (${voiceMessage.duration}s)`);
      
      // Update status to processing
      setVoiceMessages(prev => prev.map(vm => 
        vm.id === voiceMessage.id 
          ? { ...vm, transcriptionStatus: 'processing' }
          : vm
      ));

      // Simulate transcription process
      await new Promise(resolve => setTimeout(resolve, 2000 + voiceMessage.duration * 100));

      // Mock transcription results
      const mockTranscriptions = [
        "Hey everyone, just wanted to share some thoughts about the new surveillance protocols we've been discussing.",
        "The neural network training is going well, but I'm concerned about the ethical implications of what we're building.",
        "Found some interesting patterns in the data logs. We should probably discuss this in a more secure channel.",
        "Anyone else notice the increased monitoring activity lately? Something feels off about the whole situation.",
        "The encryption methods we discussed last week are working perfectly. No signs of compromise so far.",
        "I've been analyzing the network traffic and there are some anomalies we need to investigate.",
        "The AI responses are getting more sophisticated. Sometimes it's hard to tell if it's human or machine.",
        "Privacy is becoming a luxury that only the tech-savvy can afford. We need to change that.",
        "The surveillance state isn't coming - it's already here. We're just documenting its expansion.",
        "Every algorithm is biased. The question is whether it's biased toward truth or profit."
      ];

      const transcription = mockTranscriptions[Math.floor(Math.random() * mockTranscriptions.length)];
      const confidence = 0.7 + Math.random() * 0.25; // 70-95% confidence

      const processedMessage: VoiceMessage = {
        ...voiceMessage,
        transcription,
        transcriptionStatus: 'completed',
        confidence,
      };

      // Update the voice message with transcription
      setVoiceMessages(prev => prev.map(vm => 
        vm.id === voiceMessage.id ? processedMessage : vm
      ));

      console.log(`✅ Transcribed voice message: "${transcription.substring(0, 50)}..." (${Math.round(confidence * 100)}% confidence)`);
      
      return processedMessage;

    } catch (error) {
      console.error('❌ Voice processing failed:', error);
      
      const failedMessage: VoiceMessage = {
        ...voiceMessage,
        transcriptionStatus: 'failed',
        transcription: 'Transcription failed: ' + (error instanceof Error ? error.message : 'Unknown error')
      };

      setVoiceMessages(prev => prev.map(vm => 
        vm.id === voiceMessage.id ? failedMessage : vm
      ));

      return failedMessage;
    } finally {
      setIsProcessing(false);
    }
  }, []);

  const addVoiceMessage = useCallback(async (voiceMessage: Omit<VoiceMessage, 'transcriptionStatus'>) => {
    const newVoiceMessage: VoiceMessage = {
      ...voiceMessage,
      transcriptionStatus: 'pending',
    };

    setVoiceMessages(prev => [newVoiceMessage, ...prev]);

    // Auto-transcribe if enabled
    if (settings.autoTranscribe) {
      // Check duration limit
      if (voiceMessage.duration > settings.maxDuration) {
        console.warn(`🎤 Voice message too long (${voiceMessage.duration}s > ${settings.maxDuration}s), skipping transcription`);
        setVoiceMessages(prev => prev.map(vm => 
          vm.id === voiceMessage.id 
            ? { ...vm, transcriptionStatus: 'failed', transcription: 'Message too long for transcription' }
            : vm
        ));
        return;
      }

      // Add to processing queue
      processingQueue.current.push(newVoiceMessage);
      
      // Process if not already processing
      if (!isProcessing) {
        await processVoiceMessage(newVoiceMessage);
      }
    }

    console.log(`🎤 Added voice message from @${voiceMessage.author.username} in #${voiceMessage.channel.name}`);
  }, [settings.autoTranscribe, settings.maxDuration, isProcessing, processVoiceMessage]);

  const transcribeMessage = useCallback(async (messageId: string) => {
    const voiceMessage = voiceMessages.find(vm => vm.id === messageId);
    if (!voiceMessage) {
      throw new Error('Voice message not found');
    }

    if (voiceMessage.transcriptionStatus === 'processing') {
      console.log('🎤 Transcription already in progress');
      return;
    }

    await processVoiceMessage(voiceMessage);
  }, [voiceMessages, processVoiceMessage]);

  const deleteVoiceMessage = useCallback((messageId: string) => {
    setVoiceMessages(prev => prev.filter(vm => vm.id !== messageId));
    console.log(`🗑️ Deleted voice message: ${messageId}`);
  }, []);

  const updateSettings = useCallback((newSettings: Partial<VoiceProcessingSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    console.log('🎤 Voice processing settings updated:', newSettings);
  }, []);

  const exportVoiceData = useCallback(() => {
    const exportData = {
      voiceMessages: voiceMessages.map(vm => ({
        id: vm.id,
        duration: vm.duration,
        author: vm.author.username,
        channel: vm.channel.name,
        timestamp: vm.timestamp,
        transcription: vm.transcription,
        confidence: vm.confidence,
        transcriptionStatus: vm.transcriptionStatus,
      })),
      settings,
      exportedAt: new Date().toISOString(),
      totalMessages: voiceMessages.length,
      transcribedMessages: voiceMessages.filter(vm => vm.transcriptionStatus === 'completed').length,
    };

    const exported = JSON.stringify(exportData, null, 2);
    console.log('📦 Voice data export:', exported);
    return exported;
  }, [voiceMessages, settings]);

  const getProcessingStats = useCallback(() => {
    const total = voiceMessages.length;
    const completed = voiceMessages.filter(vm => vm.transcriptionStatus === 'completed').length;
    const failed = voiceMessages.filter(vm => vm.transcriptionStatus === 'failed').length;
    const pending = voiceMessages.filter(vm => vm.transcriptionStatus === 'pending').length;
    const processing = voiceMessages.filter(vm => vm.transcriptionStatus === 'processing').length;

    return {
      total,
      completed,
      failed,
      pending,
      processing,
      totalDuration,
      avgConfidence: Math.round(avgConfidence * 100),
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }, [voiceMessages]);

  return {
    voiceMessages,
    isProcessing,
    settings,
    addVoiceMessage,
    transcribeMessage,
    deleteVoiceMessage,
    updateSettings,
    exportVoiceData,
    getProcessingStats,
  };
}