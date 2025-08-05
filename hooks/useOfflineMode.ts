import { useState, useCallback, useRef, useEffect } from 'react';

interface ArchiveMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
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
  edited?: boolean;
  deleted?: boolean;
}

interface DiscordArchive {
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

interface ReplaySession {
  id: string;
  name: string;
  description?: string;
  archiveId: string;
  createdAt: string;
  updatedAt: string;
  settings: {
    playbackSpeed: number;
    autoAdvance: boolean;
    includeDeleted: boolean;
    filterChannels: string[];
    filterUsers: string[];
  };
  currentPosition: number;
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

interface ReplayState {
  currentMessage?: ArchiveMessage;
  nextMessage?: ArchiveMessage;
  previousMessage?: ArchiveMessage;
  progress: number;
  timeRemaining: number;
  messagesRemaining: number;
}

interface ArchiveImportResult {
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

interface UseOfflineModeReturn {
  archives: DiscordArchive[];
  sessions: ReplaySession[];
  currentSession: ReplaySession | null;
  replayState: ReplayState;
  isImporting: boolean;
  importProgress: number;
  importArchive: (jsonData: string) => Promise<ArchiveImportResult>;
  deleteArchive: (archiveId: string) => void;
  createSession: (archiveId: string, name: string, description?: string) => ReplaySession;
  loadSession: (sessionId: string) => void;
  deleteSession: (sessionId: string) => void;
  exportSession: (sessionId: string) => string;
  startReplay: () => void;
  pauseReplay: () => void;
  stopReplay: () => void;
  seekToMessage: (messageIndex: number) => void;
  setPlaybackSpeed: (speed: number) => void;
  generateResponseToMessage: (messageId: string) => Promise<void>;
  exportArchive: (archiveId: string) => string;
}

export function useOfflineMode(): UseOfflineModeReturn {
  const [archives, setArchives] = useState<DiscordArchive[]>([]);
  const [sessions, setSessions] = useState<ReplaySession[]>([]);
  const [currentSession, setCurrentSession] = useState<ReplaySession | null>(null);
  const [replayState, setReplayState] = useState<ReplayState>({
    progress: 0,
    timeRemaining: 0,
    messagesRemaining: 0
  });
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const replayIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const importArchive = useCallback(async (jsonData: string): Promise<ArchiveImportResult> => {
    setIsImporting(true);
    setImportProgress(0);

    try {
      const data = JSON.parse(jsonData);
      const errors: string[] = [];
      const warnings: string[] = [];
      let messagesProcessed = 0;
      let duplicatesSkipped = 0;

      // Validate required fields
      if (!data.messages || !Array.isArray(data.messages)) {
        errors.push('Invalid format: messages array not found');
        return { success: false, errors, warnings, stats: { messagesProcessed: 0, channelsFound: 0, serversFound: 0, duplicatesSkipped: 0 } };
      }

      // Process messages with progress updates
      const totalMessages = data.messages.length;
      const processedMessages: ArchiveMessage[] = [];
      const seenIds = new Set<string>();

      for (let i = 0; i < totalMessages; i++) {
        const msg = data.messages[i];
        
        // Update progress
        setImportProgress(Math.floor((i / totalMessages) * 100));

        // Skip duplicates
        if (seenIds.has(msg.id)) {
          duplicatesSkipped++;
          continue;
        }
        seenIds.add(msg.id);

        // Validate message structure
        if (!msg.id || !msg.content || !msg.author || !msg.timestamp) {
          warnings.push(`Skipping invalid message at index ${i}`);
          continue;
        }

        // Normalize message format
        const normalizedMessage: ArchiveMessage = {
          id: msg.id,
          content: msg.content,
          author: {
            id: msg.author.id || 'unknown',
            username: msg.author.username || 'unknown',
            discriminator: msg.author.discriminator,
            avatar: msg.author.avatar
          },
          channel: {
            id: msg.channel?.id || 'unknown',
            name: msg.channel?.name || 'unknown',
            type: msg.channel?.type || 'text'
          },
          server: {
            id: msg.server?.id || msg.guild?.id || 'unknown',
            name: msg.server?.name || msg.guild?.name || 'unknown'
          },
          timestamp: msg.timestamp,
          attachments: msg.attachments || [],
          mentions: msg.mentions || [],
          reactions: msg.reactions || [],
          edited: msg.edited || false,
          deleted: msg.deleted || false
        };

        processedMessages.push(normalizedMessage);
        messagesProcessed++;
      }

      // Extract unique channels and servers
      const channelsMap = new Map();
      const serversMap = new Map();

      processedMessages.forEach(msg => {
        channelsMap.set(msg.channel.id, {
          id: msg.channel.id,
          name: msg.channel.name,
          type: msg.channel.type,
          messageCount: (channelsMap.get(msg.channel.id)?.messageCount || 0) + 1
        });

        serversMap.set(msg.server.id, {
          id: msg.server.id,
          name: msg.server.name
        });
      });

      const archive: DiscordArchive = {
        id: `archive-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: data.name || `Import ${new Date().toLocaleDateString()}`,
        description: data.description || `Imported archive with ${messagesProcessed} messages`,
        exportDate: data.exportDate || new Date().toISOString(),
        messageCount: messagesProcessed,
        channels: Array.from(channelsMap.values()),
        servers: Array.from(serversMap.values()),
        messages: processedMessages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()),
        metadata: {
          exportTool: data.metadata?.exportTool || 'Unknown',
          version: data.metadata?.version || '1.0.0',
          dateRange: {
            start: processedMessages[0]?.timestamp || new Date().toISOString(),
            end: processedMessages[processedMessages.length - 1]?.timestamp || new Date().toISOString()
          }
        }
      };

      setArchives(prev => [...prev, archive]);
      setImportProgress(100);

      return {
        success: true,
        archive,
        errors,
        warnings,
        stats: {
          messagesProcessed,
          channelsFound: channelsMap.size,
          serversFound: serversMap.size,
          duplicatesSkipped
        }
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown import error';
      return {
        success: false,
        errors: [errorMessage],
        warnings: [],
        stats: { messagesProcessed: 0, channelsFound: 0, serversFound: 0, duplicatesSkipped: 0 }
      };
    } finally {
      setIsImporting(false);
      setImportProgress(0);
    }
  }, []);

  const deleteArchive = useCallback((archiveId: string) => {
    setArchives(prev => prev.filter(archive => archive.id !== archiveId));
    setSessions(prev => prev.filter(session => session.archiveId !== archiveId));
    
    if (currentSession?.archiveId === archiveId) {
      stopReplay();
      setCurrentSession(null);
    }
  }, [currentSession]);

  const createSession = useCallback((archiveId: string, name: string, description?: string): ReplaySession => {
    const archive = archives.find(a => a.id === archiveId);
    if (!archive) {
      throw new Error('Archive not found');
    }

    const session: ReplaySession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      archiveId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      settings: {
        playbackSpeed: 1.0,
        autoAdvance: true,
        includeDeleted: false,
        filterChannels: [],
        filterUsers: []
      },
      currentPosition: 0,
      totalMessages: archive.messageCount,
      isPlaying: false,
      responses: []
    };

    setSessions(prev => [...prev, session]);
    return session;
  }, [archives]);

  const loadSession = useCallback((sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
      setCurrentSession(session);
      updateReplayState(session);
    }
  }, [sessions]);

  const deleteSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.filter(session => session.id !== sessionId));
    
    if (currentSession?.id === sessionId) {
      stopReplay();
      setCurrentSession(null);
    }
  }, [currentSession]);

  const exportSession = useCallback((sessionId: string): string => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) {
      throw new Error('Session not found');
    }

    const exportData = {
      session,
      exportedAt: new Date().toISOString(),
      version: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }, [sessions]);

  const updateReplayState = useCallback((session: ReplaySession) => {
    const archive = archives.find(a => a.id === session.archiveId);
    if (!archive) return;

    const filteredMessages = archive.messages.filter(msg => {
      if (!session.settings.includeDeleted && msg.deleted) return false;
      if (session.settings.filterChannels.length > 0 && !session.settings.filterChannels.includes(msg.channel.id)) return false;
      if (session.settings.filterUsers.length > 0 && !session.settings.filterUsers.includes(msg.author.id)) return false;
      return true;
    });

    const currentMessage = filteredMessages[session.currentPosition];
    const nextMessage = filteredMessages[session.currentPosition + 1];
    const previousMessage = filteredMessages[session.currentPosition - 1];

    const progress = filteredMessages.length > 0 ? (session.currentPosition / filteredMessages.length) * 100 : 0;
    const messagesRemaining = filteredMessages.length - session.currentPosition;
    const timeRemaining = messagesRemaining / session.settings.playbackSpeed;

    setReplayState({
      currentMessage,
      nextMessage,
      previousMessage,
      progress,
      timeRemaining,
      messagesRemaining
    });
  }, [archives]);

  const startReplay = useCallback(() => {
    if (!currentSession) return;

    const updatedSession = { ...currentSession, isPlaying: true };
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));

    // Start replay interval
    const intervalMs = 1000 / updatedSession.settings.playbackSpeed;
    replayIntervalRef.current = setInterval(() => {
      setCurrentSession(prev => {
        if (!prev || !prev.isPlaying) return prev;

        const archive = archives.find(a => a.id === prev.archiveId);
        if (!archive) return prev;

        const nextPosition = prev.currentPosition + 1;
        if (nextPosition >= archive.messageCount) {
          // End of replay
          if (replayIntervalRef.current) {
            clearInterval(replayIntervalRef.current);
            replayIntervalRef.current = null;
          }
          return { ...prev, isPlaying: false };
        }

        const updated = { ...prev, currentPosition: nextPosition };
        updateReplayState(updated);
        return updated;
      });
    }, intervalMs);
  }, [currentSession, archives, updateReplayState]);

  const pauseReplay = useCallback(() => {
    if (!currentSession) return;

    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
    }

    const updatedSession = { ...currentSession, isPlaying: false };
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
  }, [currentSession]);

  const stopReplay = useCallback(() => {
    if (replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
      replayIntervalRef.current = null;
    }

    if (currentSession) {
      const updatedSession = { 
        ...currentSession, 
        isPlaying: false, 
        currentPosition: 0 
      };
      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
      updateReplayState(updatedSession);
    }
  }, [currentSession, updateReplayState]);

  const seekToMessage = useCallback((messageIndex: number) => {
    if (!currentSession) return;

    const archive = archives.find(a => a.id === currentSession.archiveId);
    if (!archive) return;

    const clampedIndex = Math.max(0, Math.min(messageIndex, archive.messageCount - 1));
    const updatedSession = { ...currentSession, currentPosition: clampedIndex };
    
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));
    updateReplayState(updatedSession);
  }, [currentSession, archives, updateReplayState]);

  const setPlaybackSpeed = useCallback((speed: number) => {
    if (!currentSession) return;

    const clampedSpeed = Math.max(0.1, Math.min(speed, 10));
    const updatedSession = { 
      ...currentSession, 
      settings: { ...currentSession.settings, playbackSpeed: clampedSpeed }
    };
    
    setCurrentSession(updatedSession);
    setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));

    // Restart interval with new speed if playing
    if (updatedSession.isPlaying && replayIntervalRef.current) {
      clearInterval(replayIntervalRef.current);
      const intervalMs = 1000 / clampedSpeed;
      replayIntervalRef.current = setInterval(() => {
        // Replay logic here
      }, intervalMs);
    }
  }, [currentSession]);

  const generateResponseToMessage = useCallback(async (messageId: string): Promise<void> => {
    if (!currentSession) return;

    const archive = archives.find(a => a.id === currentSession.archiveId);
    if (!archive) return;

    const message = archive.messages.find(m => m.id === messageId);
    if (!message) return;

    try {
      // Mock AI response generation
      const mockResponses = [
        "Interesting perspective on digital surveillance...",
        "The neural networks are always watching, aren't they?",
        "Privacy is just an illusion in the digital age.",
        "Every message leaves a trace in the machine.",
        "The algorithm knows more about you than you know about yourself."
      ];

      // Simulate generation delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      
      const newResponse = {
        messageId,
        prompt: `Respond to: "${message.content}"`,
        response,
        persona: 'Digital Ghost',
        modifiers: ['noir-deadpan', 'cynical'],
        timestamp: new Date().toISOString()
      };

      const updatedSession = {
        ...currentSession,
        responses: [...currentSession.responses, newResponse],
        updatedAt: new Date().toISOString()
      };

      setCurrentSession(updatedSession);
      setSessions(prev => prev.map(s => s.id === updatedSession.id ? updatedSession : s));

    } catch (error) {
      console.error('Failed to generate response:', error);
    }
  }, [currentSession, archives]);

  const exportArchive = useCallback((archiveId: string): string => {
    const archive = archives.find(a => a.id === archiveId);
    if (!archive) {
      throw new Error('Archive not found');
    }

    const exportData = {
      ...archive,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }, [archives]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (replayIntervalRef.current) {
        clearInterval(replayIntervalRef.current);
      }
    };
  }, []);

  return {
    archives,
    sessions,
    currentSession,
    replayState,
    isImporting,
    importProgress,
    importArchive,
    deleteArchive,
    createSession,
    loadSession,
    deleteSession,
    exportSession,
    startReplay,
    pauseReplay,
    stopReplay,
    seekToMessage,
    setPlaybackSpeed,
    generateResponseToMessage,
    exportArchive
  };
}