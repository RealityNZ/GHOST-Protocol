export interface ArchiveMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator?: string;
    avatar?: string;
  };
  channel: {
    id: string;
    name: string;
    type: 'text' | 'voice';
  };
  server: {
    id: string;
    name: string;
  };
  timestamp: string;
  attachments?: string[];
  mentions?: string[];
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
  edited?: boolean;
  deleted?: boolean;
}

export interface DiscordArchive {
  id: string;
  name: string;
  description?: string;
  exportDate: string;
  messageCount: number;
  channels: Array<{
    id: string;
    name: string;
    type: 'text' | 'voice';
    messageCount: number;
  }>;
  servers: Array<{
    id: string;
    name: string;
  }>;
  messages: ArchiveMessage[];
  metadata: {
    exportTool: string;
    version: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export interface ReplaySession {
  id: string;
  name: string;
  description?: string;
  archiveId: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    playbackSpeed: number; // 0.1x to 10x
    autoAdvance: boolean;
    includeDeleted: boolean;
    filterChannels: string[];
    filterUsers: string[];
    startTime?: string;
    endTime?: string;
  };
  currentPosition: number; // Message index
  totalMessages: number;
  isPlaying: boolean;
  responses: Array<{
    messageId: string;
    prompt: string;
    response: string;
    persona: string;
    modifiers: string[];
    timestamp: string;
  }>;
}

export interface ReplayState {
  currentMessage?: ArchiveMessage;
  nextMessage?: ArchiveMessage;
  previousMessage?: ArchiveMessage;
  progress: number; // 0-100
  timeRemaining: number; // seconds
  messagesRemaining: number;
}

export interface ArchiveImportResult {
  success: boolean;
  archive?: DiscordArchive;
  errors: string[];
  warnings: string[];
  stats: {
    messagesProcessed: number;
    channelsFound: number;
    serversFound: number;
    duplicatesSkipped: number;
  };
}