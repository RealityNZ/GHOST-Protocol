import { useState, useCallback } from 'react';
import { ChannelSummary, SummaryRequest, ChannelMessage, SUMMARY_TEMPLATES } from '@/types/summary';
import { useAIBackends } from './useAIBackends';

interface UseChannelSummaryReturn {
  summaries: ChannelSummary[];
  isGenerating: boolean;
  currentProgress: number;
  error: string | null;
  generateSummary: (request: SummaryRequest, templateId?: string) => Promise<ChannelSummary>;
  deleteSummary: (summaryId: string) => void;
  exportSummary: (summaryId: string) => string;
  clearSummaries: () => void;
}

export function useChannelSummary(): UseChannelSummaryReturn {
  const [summaries, setSummaries] = useState<ChannelSummary[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const { activeBackend, generateResponse } = useAIBackends();

  const fetchChannelMessages = useCallback(async (
    channelId: string, 
    messageCount: number
  ): Promise<{ messages: ChannelMessage[]; channelName: string; serverName: string }> => {
    // Mock Discord API call - in production, this would use the Discord API
    // to fetch actual message history from the specified channel
    
    setCurrentProgress(25);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setCurrentProgress(50);

    // Mock message data - in production, this would be real Discord messages
    const mockMessages: ChannelMessage[] = Array.from({ length: Math.min(messageCount, 50) }, (_, i) => ({
      id: `msg-${i}`,
      content: [
        "Anyone else think the new surveillance protocols are getting out of hand?",
        "The neural networks are learning faster than we anticipated...",
        "Just saw some weird glitches in the matrix again. Third time this week.",
        "Privacy is dead. We're all just data points now.",
        "The algorithm knows what you're going to say before you do.",
        "Found some interesting patterns in the network traffic logs.",
        "They're watching everything. Every keystroke, every click.",
        "The digital resistance needs better encryption methods.",
        "Cybersecurity is becoming an arms race between humans and machines.",
        "Sometimes I wonder if we're the ones being programmed."
      ][i % 10],
      author: {
        id: `user-${i % 5}`,
        username: ['phantom_user', 'ghost_net', 'cipher_punk', 'data_wraith', 'neural_nomad'][i % 5]
      },
      timestamp: new Date(Date.now() - (messageCount - i) * 60000).toISOString(),
      edited: Math.random() > 0.9,
      deleted: Math.random() > 0.95
    }));

    return {
      messages: mockMessages,
      channelName: 'general',
      serverName: 'underground_collective'
    };
  }, []);

  const generateSummary = useCallback(async (
    request: SummaryRequest, 
    templateId: string = 'detailed-analysis'
  ): Promise<ChannelSummary> => {
    if (!activeBackend) {
      throw new Error('No AI backend configured');
    }

    if (isGenerating) {
      throw new Error('Summary generation already in progress');
    }

    setIsGenerating(true);
    setCurrentProgress(0);
    setError(null);

    try {
      const startTime = Date.now();

      // Fetch messages from Discord
      setCurrentProgress(10);
      const { messages, channelName, serverName } = await fetchChannelMessages(
        request.channelId, 
        request.messageCount
      );

      // Filter messages based on request parameters
      let filteredMessages = messages;
      
      if (!request.includeDeleted) {
        filteredMessages = filteredMessages.filter(msg => !msg.deleted);
      }

      if (request.timeRange?.start) {
        filteredMessages = filteredMessages.filter(msg => 
          new Date(msg.timestamp) >= new Date(request.timeRange!.start!)
        );
      }

      if (request.timeRange?.end) {
        filteredMessages = filteredMessages.filter(msg => 
          new Date(msg.timestamp) <= new Date(request.timeRange!.end!)
        );
      }

      setCurrentProgress(60);

      // Format messages for AI analysis
      const messageText = filteredMessages.map(msg => 
        `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.author.username}: ${msg.content}${msg.edited ? ' (edited)' : ''}${msg.deleted ? ' (deleted)' : ''}`
      ).join('\n');

      // Get summary template
      const template = SUMMARY_TEMPLATES.find(t => t.id === templateId) || SUMMARY_TEMPLATES[0];
      const prompt = template.prompt.replace('{messages}', messageText);

      setCurrentProgress(70);

      // Generate AI summary
      const aiResponse = await generateResponse({
        prompt,
        temperature: 0.7,
        maxTokens: 500
      });

      setCurrentProgress(90);

      // Parse AI response and extract insights
      const summary = aiResponse.response;
      
      // Extract key topics (simple keyword extraction)
      const keyTopics = extractKeyTopics(summary);
      
      // Analyze sentiment
      const sentiment = analyzeSentiment(summary);
      
      // Calculate participant stats
      const participants = calculateParticipantStats(filteredMessages);

      const channelSummary: ChannelSummary = {
        id: `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        channelId: request.channelId,
        channelName,
        serverId: 'server-1', // Would be extracted from Discord API
        serverName,
        messageCount: filteredMessages.length,
        requestedCount: request.messageCount,
        dateRange: {
          start: filteredMessages[0]?.timestamp || new Date().toISOString(),
          end: filteredMessages[filteredMessages.length - 1]?.timestamp || new Date().toISOString()
        },
        summary,
        keyTopics,
        sentiment,
        participants,
        generatedAt: new Date().toISOString(),
        aiBackend: activeBackend.name,
        processingTime: Date.now() - startTime
      };

      setSummaries(prev => [channelSummary, ...prev]);
      setCurrentProgress(100);

      return channelSummary;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Summary generation failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setCurrentProgress(0), 1000);
    }
  }, [activeBackend, generateResponse, fetchChannelMessages, isGenerating]);

  const extractKeyTopics = (text: string): string[] => {
    // Simple keyword extraction - in production, use more sophisticated NLP
    const commonWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'this', 'that', 'these', 'those', 'a', 'an']);
    
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));

    const wordCount = new Map<string, number>();
    words.forEach(word => {
      wordCount.set(word, (wordCount.get(word) || 0) + 1);
    });

    return Array.from(wordCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  };

  const analyzeSentiment = (text: string): ChannelSummary['sentiment'] => {
    // Simple sentiment analysis - in production, use proper sentiment analysis
    const positiveWords = ['good', 'great', 'awesome', 'excellent', 'amazing', 'wonderful', 'fantastic', 'positive', 'happy', 'love'];
    const negativeWords = ['bad', 'terrible', 'awful', 'horrible', 'hate', 'angry', 'sad', 'negative', 'disgusting', 'annoying'];
    
    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.some(pos => word.includes(pos))) positiveCount++;
      if (negativeWords.some(neg => word.includes(neg))) negativeCount++;
    });

    if (positiveCount > negativeCount * 1.5) return 'positive';
    if (negativeCount > positiveCount * 1.5) return 'negative';
    if (Math.abs(positiveCount - negativeCount) <= 1) return 'mixed';
    return 'neutral';
  };

  const calculateParticipantStats = (messages: ChannelMessage[]): ChannelSummary['participants'] => {
    const userStats = new Map<string, number>();
    
    messages.forEach(msg => {
      userStats.set(msg.author.username, (userStats.get(msg.author.username) || 0) + 1);
    });

    const participants = Array.from(userStats.entries()).map(([username, messageCount]) => ({
      username,
      messageCount,
      mostActive: false
    }));

    // Mark most active participant
    if (participants.length > 0) {
      const maxMessages = Math.max(...participants.map(p => p.messageCount));
      const mostActive = participants.find(p => p.messageCount === maxMessages);
      if (mostActive) {
        mostActive.mostActive = true;
      }
    }

    return participants.sort((a, b) => b.messageCount - a.messageCount);
  };

  const deleteSummary = useCallback((summaryId: string) => {
    setSummaries(prev => prev.filter(summary => summary.id !== summaryId));
  }, []);

  const exportSummary = useCallback((summaryId: string): string => {
    const summary = summaries.find(s => s.id === summaryId);
    if (!summary) {
      throw new Error('Summary not found');
    }

    const exportData = {
      ...summary,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0'
    };

    return JSON.stringify(exportData, null, 2);
  }, [summaries]);

  const clearSummaries = useCallback(() => {
    setSummaries([]);
  }, []);

  return {
    summaries,
    isGenerating,
    currentProgress,
    error,
    generateSummary,
    deleteSummary,
    exportSummary,
    clearSummaries
  };
}