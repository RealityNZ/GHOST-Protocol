import { useState, useEffect, useCallback } from 'react';

interface WebSocketMessage {
  type: string;
  content: string;
  author: { id: string; username: string };
  channel: { id: string; name: string };
  mentions: string[];
  timestamp: string;
}

interface TriggerCondition {
  type: string;
  value: string;
  enabled: boolean;
}

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

  const connect = useCallback(() => {
    if (!token || !isListening) return;

    setStatus({ connected: true, reconnecting: false, lastHeartbeat: new Date() });

    // Simulate incoming messages
    const interval = setInterval(() => {
      const mockMessage: WebSocketMessage = {
        type: 'message',
        content: 'Anyone else feeling like we\'re being watched?',
        author: { id: '123', username: 'phantom_user' },
        channel: { id: '456', name: 'general' },
        mentions: [],
        timestamp: new Date().toISOString()
      };

      onMessageReceived(mockMessage);

      // Check triggers
      triggers.forEach(trigger => {
        if (trigger.enabled && mockMessage.content.toLowerCase().includes(trigger.value.toLowerCase())) {
          onTriggerActivated(mockMessage, trigger);
        }
      });
    }, 10000);

    return () => clearInterval(interval);
  }, [token, isListening, triggers, onMessageReceived, onTriggerActivated]);

  const disconnect = useCallback(() => {
    setStatus({ connected: false, reconnecting: false });
  }, []);

  useEffect(() => {
    if (isListening && token) {
      const cleanup = connect();
      return cleanup;
    } else {
      disconnect();
    }
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