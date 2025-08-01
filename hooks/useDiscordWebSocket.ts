import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketMessage, TriggerCondition } from '@/types/possession';

interface UseDiscordWebSocketProps {
  token?: string;
  isListening: boolean;
  triggers: TriggerCondition[];
  onMessageReceived: (message: WebSocketMessage) => void;
  onTriggerActivated: (message: WebSocketMessage, trigger: TriggerCondition) => void;
}

interface ConnectionStatus {
  connected: boolean;
  reconnecting: boolean;
  error?: string;
  lastHeartbeat?: Date;
}

export function useDiscordWebSocket({
  token,
  isListening,
  triggers,
  onMessageReceived,
  onTriggerActivated
}: UseDiscordWebSocketProps) {
  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    reconnecting: false
  });
  
  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    if (!token || !isListening) return;

    try {
      setStatus(prev => ({ ...prev, reconnecting: true, error: undefined }));
      
      // Mock WebSocket connection for demonstration
      // In a real implementation, this would connect to Discord's Gateway
      const mockWs = {
        readyState: 1, // OPEN
        close: () => {},
        send: () => {}
      } as WebSocket;

      wsRef.current = mockWs;
      
      setStatus({
        connected: true,
        reconnecting: false,
        lastHeartbeat: new Date()
      });

      // Start heartbeat simulation
      heartbeatRef.current = setInterval(() => {
        setStatus(prev => ({ ...prev, lastHeartbeat: new Date() }));
      }, 30000);

      // Simulate incoming messages for demonstration
      const messageInterval = setInterval(() => {
        if (!isListening) return;

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
          }
        ];

        const randomMessage = mockMessages[Math.floor(Math.random() * mockMessages.length)];
        onMessageReceived(randomMessage);

        // Check for triggers
        const activeTriggers = triggers.filter(trigger => {
          if (!trigger.enabled) return false;
          
          switch (trigger.type) {
            case 'mention':
              return randomMessage.mentions.includes(trigger.value);
            case 'keyword':
              return randomMessage.content.toLowerCase().includes(trigger.value.toLowerCase());
            case 'reply':
              return randomMessage.content.startsWith('@');
            default:
              return false;
          }
        });

        activeTriggers.forEach(trigger => {
          onTriggerActivated(randomMessage, trigger);
        });

      }, Math.random() * 10000 + 5000); // Random interval between 5-15 seconds

      reconnectAttempts.current = 0;

      return () => {
        clearInterval(messageInterval);
      };

    } catch (error) {
      console.error('WebSocket connection error:', error);
      setStatus({
        connected: false,
        reconnecting: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      });
      scheduleReconnect();
    }
  }, [token, isListening, triggers, onMessageReceived, onTriggerActivated]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }

    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    setStatus({
      connected: false,
      reconnecting: false
    });
  }, []);

  const scheduleReconnect = useCallback(() => {
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      setStatus(prev => ({ 
        ...prev, 
        reconnecting: false, 
        error: 'Max reconnection attempts reached' 
      }));
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
    reconnectAttempts.current++;

    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    if (isListening && token) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [isListening, token, connect, disconnect]);

  return {
    status,
    connect,
    disconnect,
    reconnect: () => {
      disconnect();
      setTimeout(connect, 1000);
    }
  };
}