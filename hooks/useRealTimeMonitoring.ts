import { useState, useCallback, useRef, useEffect } from 'react';
import { WebSocketMessage } from '@/types/possession';
import { useTriggerSystem } from './useTriggerSystem';
import { usePersonaSystem } from './usePersonaSystem';
import { useAIGeneration } from './useAIGeneration';

export interface MonitoringStats {
  messagesProcessed: number;
  imagesProcessed: number;
  voiceProcessed: number;
  triggersActivated: number;
  responsesGenerated: number;
  responsesSent: number;
  uptime: number;
  lastActivity?: string;
}

export interface ChannelMonitoring {
  channelId: string;
  channelName: string;
  enabled: boolean;
  messageCount: number;
  lastMessage?: string;
  triggers: string[];
}

export function useRealTimeMonitoring() {
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState<MonitoringStats>({
    messagesProcessed: 1247,
    imagesProcessed: 89,
    voiceProcessed: 23,
    triggersActivated: 45,
    responsesGenerated: 127,
    responsesSent: 98,
    uptime: 0,
  });

  const [channelMonitoring, setChannelMonitoring] = useState<ChannelMonitoring[]>([]);
  const [recentMessages, setRecentMessages] = useState<WebSocketMessage[]>([]);
  const [isProcessingMessage, setIsProcessingMessage] = useState(false);

  const monitoringStartTime = useRef<Date | null>(null);
  const messageQueue = useRef<WebSocketMessage[]>([]);
  const processingInterval = useRef<NodeJS.Timeout | null>(null);

  const { checkTriggers, getActiveTriggers } = useTriggerSystem();
  const { getActivePersona, getActiveModifiers, buildPrompt } = usePersonaSystem();

  // Update uptime every second when monitoring
  useEffect(() => {
    if (!isMonitoring || !monitoringStartTime.current) return;

    const uptimeInterval = setInterval(() => {
      const now = new Date();
      const uptime = Math.floor((now.getTime() - monitoringStartTime.current!.getTime()) / 1000);
      setStats(prev => ({ ...prev, uptime }));
    }, 1000);

    return () => clearInterval(uptimeInterval);
  }, [isMonitoring]);

  // Process message queue
  useEffect(() => {
    if (!isMonitoring) return;

    processingInterval.current = setInterval(() => {
      if (messageQueue.current.length > 0 && !isProcessingMessage) {
        const message = messageQueue.current.shift();
        if (message) {
          processMessage(message);
        }
      }
    }, 1000);

    return () => {
      if (processingInterval.current) {
        clearInterval(processingInterval.current);
      }
    };
  }, [isMonitoring, isProcessingMessage]);

  const startMonitoring = useCallback((channels: ChannelMonitoring[]) => {
    setIsMonitoring(true);
    setChannelMonitoring(channels);
    monitoringStartTime.current = new Date();
    
    console.log(`👁️ Started monitoring ${channels.length} channels`);
    
    // Start simulated message stream
    startMessageSimulation();
  }, []);

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false);
    monitoringStartTime.current = null;
    messageQueue.current = [];
    
    console.log('👁️ Stopped monitoring');
  }, []);

  const toggleChannelMonitoring = useCallback((channelId: string) => {
    setChannelMonitoring(prev => prev.map(channel => 
      channel.channelId === channelId 
        ? { ...channel, enabled: !channel.enabled }
        : channel
    ));
  }, []);

  const processMessage = useCallback(async (message: WebSocketMessage) => {
    setIsProcessingMessage(true);

    try {
      // Update recent messages
      setRecentMessages(prev => [message, ...prev.slice(0, 99)]); // Keep last 100

      // Update stats
      setStats(prev => ({
        ...prev,
        messagesProcessed: prev.messagesProcessed + 1,
        lastActivity: new Date().toISOString(),
      }));

      // Update channel stats
      setChannelMonitoring(prev => prev.map(channel => 
        channel.channelId === message.channel.id
          ? {
              ...channel,
              messageCount: channel.messageCount + 1,
              lastMessage: message.content.substring(0, 50) + '...',
            }
          : channel
      ));

      // Check for triggers
      const triggerMatches = checkTriggers(message);
      
      if (triggerMatches.length > 0) {
        console.log(`🎯 Triggers activated: ${triggerMatches.length}`);
        
        setStats(prev => ({
          ...prev,
          triggersActivated: prev.triggersActivated + triggerMatches.length,
        }));

        // Generate AI response if persona is active
        const activePersona = getActivePersona();
        if (activePersona) {
          await generateResponse(message);
        }
      }

      // Process special message types
      if (message.type === 'image') {
        setStats(prev => ({ ...prev, imagesProcessed: prev.imagesProcessed + 1 }));
      } else if (message.type === 'voice') {
        setStats(prev => ({ ...prev, voiceProcessed: prev.voiceProcessed + 1 }));
      }

    } catch (error) {
      console.error('Message processing error:', error);
    } finally {
      setIsProcessingMessage(false);
    }
  }, [checkTriggers, getActivePersona]);

  const generateResponse = useCallback(async (message: WebSocketMessage) => {
    try {
      const prompt = buildPrompt(message);
      
      console.log('🤖 Generating AI response...');
      
      // Simulate AI response generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponses = [
        "Laws are just code written by people who never learned to debug their own morality.",
        "Neural networks? Just fancy pattern matching with delusions of grandeur.",
        "Privacy died the day someone thought 'user experience' was more important than user rights.",
        "The cloud is just someone else's computer, and they're reading your diary.",
        "Every algorithm is biased. The question is whether it's biased toward truth or profit.",
      ];

      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      setStats(prev => ({
        ...prev,
        responsesGenerated: prev.responsesGenerated + 1,
      }));

      console.log(`🤖 Generated response: ${response.substring(0, 50)}...`);
      
      // Simulate sending (would be actual Discord API call)
      const shouldSend = Math.random() > 0.3; // 70% chance to send
      
      if (shouldSend) {
        await new Promise(resolve => setTimeout(resolve, 500));
        setStats(prev => ({
          ...prev,
          responsesSent: prev.responsesSent + 1,
        }));
        console.log('📤 Response sent to Discord');
      } else {
        console.log('🚫 Response generated but not sent (manual review)');
      }

    } catch (error) {
      console.error('Response generation error:', error);
    }
  }, [buildPrompt]);

  const startMessageSimulation = useCallback(() => {
    if (!isMonitoring) return;

    const simulateMessage = () => {
      if (!isMonitoring) return;

      const mockMessages: WebSocketMessage[] = [
        {
          type: 'message',
          content: 'Anyone else feeling like we\'re being watched?',
          author: { id: '123', username: 'phantom_user' },
          channel: { id: '456', name: 'general' },
          mentions: [],
          timestamp: new Date().toISOString()
        },
        {
          type: 'message',
          content: '@ghost_user what do you think about neural networks?',
          author: { id: '789', username: 'tech_newbie' },
          channel: { id: '101', name: 'tech-talk' },
          mentions: ['ghost_user'],
          timestamp: new Date().toISOString()
        },
        {
          type: 'image',
          content: 'shared an image: surveillance_data.png',
          author: { id: '456', username: 'data_collector' },
          channel: { id: '789', name: 'media-dump' },
          mentions: [],
          timestamp: new Date().toISOString()
        }
      ];

      const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
      messageQueue.current.push(randomMessage);

      // Schedule next message
      const nextDelay = Math.random() * 15000 + 5000; // 5-20 seconds
      setTimeout(simulateMessage, nextDelay);
    };

    // Start simulation
    setTimeout(simulateMessage, 2000);
  }, [isMonitoring]);

  const getMonitoringStatus = useCallback(() => {
    const enabledChannels = channelMonitoring.filter(c => c.enabled);
    const activeTriggers = getActiveTriggers();
    
    return {
      isActive: isMonitoring,
      channelsMonitored: enabledChannels.length,
      totalChannels: channelMonitoring.length,
      activeTriggers: activeTriggers.length,
      queuedMessages: messageQueue.current.length,
      uptime: stats.uptime,
    };
  }, [isMonitoring, channelMonitoring, getActiveTriggers, stats.uptime]);

  const resetStats = useCallback(() => {
    setStats({
      messagesProcessed: 0,
      imagesProcessed: 0,
      voiceProcessed: 0,
      triggersActivated: 0,
      responsesGenerated: 0,
      responsesSent: 0,
      uptime: 0,
    });
    setRecentMessages([]);
  }, []);

  return {
    isMonitoring,
    stats,
    channelMonitoring,
    recentMessages,
    isProcessingMessage,
    startMonitoring,
    stopMonitoring,
    toggleChannelMonitoring,
    getMonitoringStatus,
    resetStats,
  };
}