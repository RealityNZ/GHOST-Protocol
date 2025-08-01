export interface Modifier {
  id: string;
  name: string;
  description: string;
  prompt: string;
  enabled: boolean;
  category: 'style' | 'strategy' | 'emotion' | 'length' | 'roleplay';
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  modifiers: string[]; // Array of modifier IDs
  active: boolean;
}

export interface AIConfig {
  model: 'gpt-4o' | 'gpt-3.5-turbo' | 'claude-3' | 'local';
  temperature: number;
  maxTokens: number;
  streaming: boolean;
  apiKey?: string;
  endpoint?: string;
}

export interface TriggerCondition {
  type: 'mention' | 'keyword' | 'reply' | 'thread' | 'custom';
  value: string;
  enabled: boolean;
}

export interface PossessionLog {
  id: string;
  timestamp: string;
  trigger: {
    type: string;
    content: string;
    author: string;
    channel: string;
  };
  prompt: string;
  response: string;
  sent: boolean;
  persona: string;
  modifiers: string[];
}

export interface WebSocketMessage {
  type: 'message' | 'edit' | 'delete';
  content: string;
  author: {
    id: string;
    username: string;
  };
  channel: {
    id: string;
    name: string;
  };
  mentions: string[];
  timestamp: string;
}

export interface LogEntry {
  id: string;
  type: 'message' | 'image' | 'voice' | 'edit' | 'delete';
  content: string;
  author: string;
  channel: string;
  timestamp: string;
  server: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
}

export interface DiscordServer {
  id: string;
  name: string;
  channels: Channel[];
  connected: boolean;
}

export interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  monitored: boolean;
}