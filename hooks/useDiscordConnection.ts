import { useState, useCallback, useRef } from 'react';
import { useTokenVault } from './useTokenVault';

interface DiscordConnectionConfig {
  mode: 'bot' | 'user';
  tokenVaultId?: string;
  autoReconnect: boolean;
  heartbeatInterval: number;
  maxReconnectAttempts: number;
}

interface ConnectionStatus {
  connected: boolean;
  connecting: boolean;
  error?: string;
  lastHeartbeat?: Date;
  reconnectAttempts: number;
  rateLimited: boolean;
  rateLimitReset?: Date;
}

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar?: string;
  bot: boolean;
}

interface DiscordGuild {
  id: string;
  name: string;
  icon?: string;
  permissions: string;
  channels: DiscordChannel[];
}

interface DiscordChannel {
  id: string;
  name: string;
  type: number;
  guild_id: string;
  position: number;
  permission_overwrites: any[];
}

export function useDiscordConnection() {
  const [config, setConfig] = useState<DiscordConnectionConfig>({
    mode: 'bot',
    autoReconnect: true,
    heartbeatInterval: 41250, // Discord recommended
    maxReconnectAttempts: 5,
  });

  const [status, setStatus] = useState<ConnectionStatus>({
    connected: false,
    connecting: false,
    reconnectAttempts: 0,
    rateLimited: false,
  });

  const [currentUser, setCurrentUser] = useState<DiscordUser | null>(null);
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectedServerId, setConnectedServerId] = useState<string | null>(null);
  const [availableChannels, setAvailableChannels] = useState<DiscordChannel[]>([]);

  const wsRef = useRef<WebSocket | null>(null);
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sequenceRef = useRef<number | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const { retrieveToken } = useTokenVault();

  const makeAPIRequest = useCallback(async (
    endpoint: string, 
    token: string, 
    options: RequestInit = {}
  ): Promise<any> => {
    const baseURL = 'https://discord.com/api/v10';
    const authHeader = config.mode === 'bot' ? `Bot ${token}` : token;

    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json',
          'User-Agent': 'VICE Logger (https://github.com/vice-logger, 1.0.0)',
          ...options.headers,
        },
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const resetTime = new Date(Date.now() + (parseInt(retryAfter || '1') * 1000));
        
        setStatus(prev => ({
          ...prev,
          rateLimited: true,
          rateLimitReset: resetTime,
        }));

        throw new Error(`Rate limited. Retry after ${retryAfter} seconds`);
      }

      if (!response.ok) {
        throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      console.error('Discord API request failed:', error);
      throw error;
    }
  }, [config.mode]);

  const validateToken = useCallback(async (token: string): Promise<DiscordUser | null> => {
    try {
      const userData = await makeAPIRequest('/users/@me', token);
      return userData;
    } catch (error) {
      console.error('Token validation failed:', error);
      return null;
    }
  }, [makeAPIRequest]);

  const fetchGuilds = useCallback(async (token: string): Promise<DiscordGuild[]> => {
    try {
      const guildsData = await makeAPIRequest('/users/@me/guilds', token);
      
      // Fetch channels for each guild
      const guildsWithChannels = await Promise.all(
        guildsData.map(async (guild: any) => {
          try {
            const channels = await makeAPIRequest(`/guilds/${guild.id}/channels`, token);
            return {
              ...guild,
              channels: channels.filter((ch: any) => ch.type === 0 || ch.type === 2), // Text and voice channels
            };
          } catch (error) {
            console.warn(`Failed to fetch channels for guild ${guild.id}:`, error);
            return { ...guild, channels: [] };
          }
        })
      );

      return guildsWithChannels;
    } catch (error) {
      console.error('Failed to fetch guilds:', error);
      return [];
    }
  }, [makeAPIRequest]);

  const fetchServerChannels = useCallback(async (serverId: string, token: string): Promise<DiscordChannel[]> => {
    try {
      console.log(`📡 Fetching channels for server ${serverId}...`);
      const channels = await makeAPIRequest(`/guilds/${serverId}/channels`, token);
      
      // Filter for text and voice channels only
      const filteredChannels = channels
        .filter((ch: any) => ch.type === 0 || ch.type === 2) // Text (0) and Voice (2) channels
        .map((ch: any) => ({
          id: ch.id,
          name: ch.name,
          type: ch.type,
          guild_id: serverId,
          position: ch.position || 0,
          permission_overwrites: ch.permission_overwrites || [],
        }));

      console.log(`✅ Found ${filteredChannels.length} channels in server`);
      return filteredChannels;
    } catch (error) {
      console.error('Failed to fetch server channels:', error);
      return [];
    }
  }, [makeAPIRequest]);

  const connectWebSocket = useCallback(async (token: string) => {
    try {
      setStatus(prev => ({ ...prev, connecting: true, error: undefined }));

      // Get Gateway URL
      const gatewayData = await makeAPIRequest('/gateway/bot', token);
      const gatewayUrl = gatewayData.url;

      // Create WebSocket connection
      const ws = new WebSocket(`${gatewayUrl}?v=10&encoding=json`);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('🔗 Discord Gateway connected');
        
        // Send identify payload
        const identifyPayload = {
          op: 2,
          d: {
            token: config.mode === 'bot' ? `Bot ${token}` : token,
            intents: 513, // GUILDS + GUILD_MESSAGES
            properties: {
              os: 'linux',
              browser: 'vice-logger',
              device: 'vice-logger',
            },
          },
        };

        ws.send(JSON.stringify(identifyPayload));
      };

      ws.onmessage = (event) => {
        const payload = JSON.parse(event.data);
        
        switch (payload.op) {
          case 10: // Hello
            const heartbeatInterval = payload.d.heartbeat_interval;
            setConfig(prev => ({ ...prev, heartbeatInterval }));
            
            // Start heartbeat
            heartbeatRef.current = setInterval(() => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({
                  op: 1,
                  d: sequenceRef.current,
                }));
                setStatus(prev => ({ ...prev, lastHeartbeat: new Date() }));
              }
            }, heartbeatInterval);
            break;

          case 0: // Dispatch
            sequenceRef.current = payload.s;
            
            if (payload.t === 'READY') {
              sessionIdRef.current = payload.d.session_id;
              setCurrentUser(payload.d.user);
              setStatus(prev => ({
                ...prev,
                connected: true,
                connecting: false,
                reconnectAttempts: 0,
              }));
              console.log('✅ Discord connection established');
            }
            break;

          case 11: // Heartbeat ACK
            // Heartbeat acknowledged
            break;
        }
      };

      ws.onclose = (event) => {
        console.log('🔌 Discord Gateway disconnected:', event.code, event.reason);
        setStatus(prev => ({ ...prev, connected: false, connecting: false }));
        
        if (heartbeatRef.current) {
          clearInterval(heartbeatRef.current);
          heartbeatRef.current = null;
        }

        // Auto-reconnect if enabled
        if (config.autoReconnect && status.reconnectAttempts < config.maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, status.reconnectAttempts), 30000);
          
          reconnectTimeoutRef.current = setTimeout(() => {
            setStatus(prev => ({ ...prev, reconnectAttempts: prev.reconnectAttempts + 1 }));
            connectWebSocket(token);
          }, delay);
        }
      };

      ws.onerror = (error) => {
        console.error('🚨 Discord Gateway error:', error);
        setStatus(prev => ({ 
          ...prev, 
          connected: false, 
          connecting: false,
          error: 'WebSocket connection failed'
        }));
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setStatus(prev => ({ 
        ...prev, 
        connected: false, 
        connecting: false,
        error: errorMessage
      }));
      console.error('Discord connection error:', error);
    }
  }, [config, status.reconnectAttempts, makeAPIRequest]);

  const connect = useCallback(async (tokenVaultId: string, passphrase: string, serverId?: string) => {
    setIsLoading(true);
    
    try {
      // Retrieve token from vault
      const token = await retrieveToken(tokenVaultId, passphrase);
      if (!token) {
        throw new Error('Failed to retrieve token from vault');
      }

      // Validate token
      const user = await validateToken(token);
      if (!user) {
        throw new Error('Invalid token or insufficient permissions');
      }

      setCurrentUser(user);

      // Fetch available guilds
      const userGuilds = await fetchGuilds(token);
      setGuilds(userGuilds);

      // Connect WebSocket
      await connectWebSocket(token);

      // If specific server ID provided, fetch its channels
      if (serverId) {
        console.log(`🔍 Scanning channels for server: ${serverId}`);
        const serverChannels = await fetchServerChannels(serverId, token);
        setAvailableChannels(serverChannels);
        setConnectedServerId(serverId);
      }

      console.log(`🎯 Connected as ${user.username} to ${userGuilds.length} servers`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setStatus(prev => ({ ...prev, error: errorMessage }));
      console.error('Discord connection failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [retrieveToken, validateToken, fetchGuilds, connectWebSocket]);

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
      connecting: false,
      reconnectAttempts: 0,
      rateLimited: false,
    });

    setCurrentUser(null);
    setGuilds([]);
    setConnectedServerId(null);
    setAvailableChannels([]);
    
    console.log('🔌 Disconnected from Discord');
  }, []);

  const updateConfig = useCallback((newConfig: Partial<DiscordConnectionConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  }, []);

  const sendMessage = useCallback(async (channelId: string, content: string, token: string) => {
    try {
      await makeAPIRequest(`/channels/${channelId}/messages`, token, {
        method: 'POST',
        body: JSON.stringify({ content }),
      });
      
      console.log(`📤 Message sent to channel ${channelId}`);
      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }, [makeAPIRequest]);

  const getChannelMessages = useCallback(async (
    channelId: string, 
    token: string, 
    limit: number = 50
  ) => {
    try {
      const messages = await makeAPIRequest(
        `/channels/${channelId}/messages?limit=${limit}`, 
        token
      );
      return messages;
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      return [];
    }
  }, [makeAPIRequest]);

  return {
    config,
    status,
    currentUser,
    guilds,
    connectedServerId,
    availableChannels,
    isLoading,
    connect,
    disconnect,
    updateConfig,
    sendMessage,
    getChannelMessages,
    validateToken,
  };
}