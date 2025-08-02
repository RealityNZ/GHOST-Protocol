import { useState, useCallback } from 'react';
import { useAIBackends } from './useAIBackends';
import { useDiscordConnection } from './useDiscordConnection';

interface ChannelMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
    discriminator?: string;
  };
  timestamp: string;
  attachments?: any[];
  embeds?: any[];
}

interface AnalysisResult {
  summary: string;
  keyTopics: string[];
  sentiment: 'positive' | 'negative' | 'neutral';
  participantCount: number;
  messageCount: number;
  timeRange: {
    start: string;
    end: string;
  };
  generatedAt: string;
}

interface ChannelAnalysisState {
  isAnalyzing: boolean;
  currentChannel: string | null;
  messages: ChannelMessage[];
  result: AnalysisResult | null;
  error: string | null;
}

export function useChannelAnalysis() {
  const [state, setState] = useState<ChannelAnalysisState>({
    isAnalyzing: false,
    currentChannel: null,
    messages: [],
    result: null,
    error: null,
  });

  const { getActiveBackend } = useAIBackends();
  const { getChannelMessages } = useDiscordConnection();

  const analyzeChannel = useCallback(async (
    channelId: string,
    channelName: string,
    messageCount: number,
    token: string
  ): Promise<boolean> => {
    const activeBackend = getActiveBackend();
    if (!activeBackend) {
      setState(prev => ({ ...prev, error: 'No AI backend configured' }));
      return false;
    }

    setState(prev => ({
      ...prev,
      isAnalyzing: true,
      currentChannel: channelId,
      error: null,
      result: null,
    }));

    try {
      // Fetch messages from Discord
      console.log(`📥 Fetching ${messageCount} messages from #${channelName}...`);
      const rawMessages = await getChannelMessages(channelId, token, messageCount);
      
      if (!rawMessages || rawMessages.length === 0) {
        throw new Error('No messages found in channel');
      }

      // Process messages
      const processedMessages: ChannelMessage[] = rawMessages
        .filter((msg: any) => msg.content && msg.content.trim().length > 0)
        .map((msg: any) => ({
          id: msg.id,
          content: msg.content,
          author: {
            id: msg.author.id,
            username: msg.author.username,
            discriminator: msg.author.discriminator,
          },
          timestamp: msg.timestamp,
          attachments: msg.attachments || [],
          embeds: msg.embeds || [],
        }));

      setState(prev => ({ ...prev, messages: processedMessages }));

      // Build analysis prompt
      const prompt = buildAnalysisPrompt(processedMessages, channelName);
      
      // Generate AI summary
      console.log(`🤖 Generating analysis using ${activeBackend.name}...`);
      const summary = await generateSummary(prompt, activeBackend);

      // Parse AI response and create result
      const result: AnalysisResult = {
        summary,
        keyTopics: extractKeyTopics(summary),
        sentiment: analyzeSentiment(processedMessages),
        participantCount: new Set(processedMessages.map(m => m.author.id)).size,
        messageCount: processedMessages.length,
        timeRange: {
          start: processedMessages[processedMessages.length - 1]?.timestamp || '',
          end: processedMessages[0]?.timestamp || '',
        },
        generatedAt: new Date().toISOString(),
      };

      setState(prev => ({ ...prev, result, isAnalyzing: false }));
      console.log(`✅ Analysis complete for #${channelName}`);
      return true;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      setState(prev => ({ 
        ...prev, 
        error: errorMessage, 
        isAnalyzing: false 
      }));
      console.error('Channel analysis error:', error);
      return false;
    }
  }, [getActiveBackend, getChannelMessages]);

  const buildAnalysisPrompt = useCallback((messages: ChannelMessage[], channelName: string): string => {
    const messageText = messages
      .slice(0, 50) // Limit to last 50 messages for token efficiency
      .reverse() // Chronological order
      .map(msg => `[${new Date(msg.timestamp).toLocaleTimeString()}] ${msg.author.username}: ${msg.content}`)
      .join('\n');

    return `Analyze the following Discord channel conversation from #${channelName}:

${messageText}

Please provide a comprehensive analysis including:

1. **Summary**: A concise overview of the main conversation topics and themes
2. **Key Topics**: The primary subjects discussed (list 3-5 main topics)
3. **Conversation Flow**: How the discussion evolved over time
4. **Notable Patterns**: Any interesting communication patterns or behaviors
5. **Context**: What this conversation reveals about the community/group

Format your response as a structured analysis that would be useful for understanding the channel's activity and community dynamics.

Focus on factual analysis rather than personal opinions. Keep the summary informative and objective.`;
  }, []);

  const generateSummary = useCallback(async (prompt: string, backend: any): Promise<string> => {
    // Mock AI response for demonstration
    // In real implementation, this would call the actual AI backend
    await new Promise(resolve => setTimeout(resolve, 3000));

    const mockSummaries = [
      `**Summary**: The conversation in this channel primarily focused on technical discussions about neural networks and AI development, with participants sharing resources and debugging code issues.

**Key Topics**:
• Machine learning model optimization
• Discord bot development challenges  
• Cybersecurity concerns and best practices
• Open source project collaboration
• Performance benchmarking results

**Conversation Flow**: The discussion started with technical troubleshooting, evolved into broader AI ethics debates, and concluded with resource sharing for future projects.

**Notable Patterns**: High technical expertise among participants, collaborative problem-solving approach, frequent code snippet sharing, and strong emphasis on security considerations.

**Context**: This appears to be a developer-focused community with members actively working on AI and automation projects, demonstrating both technical depth and ethical awareness.`,

      `**Summary**: This channel shows active community engagement around gaming, memes, and casual social interaction, with occasional technical discussions and project updates.

**Key Topics**:
• Gaming experiences and recommendations
• Meme sharing and humor
• Community events and meetups
• Technical project updates
• Social coordination and planning

**Conversation Flow**: Casual banter dominated early messages, transitioning to more focused discussions about upcoming events and collaborative projects.

**Notable Patterns**: Strong community bonds, inside jokes and references, supportive atmosphere for new members, and organic leadership emergence.

**Context**: A tight-knit community that balances social interaction with productive collaboration, showing healthy community dynamics and member engagement.`,
    ];

    return mockSummaries[Math.floor(Math.random() * mockSummaries.length)];
  }, []);

  const extractKeyTopics = useCallback((summary: string): string[] => {
    // Extract topics from bullet points in summary
    const topicMatches = summary.match(/• (.+)/g);
    if (topicMatches) {
      return topicMatches.map(match => match.replace('• ', '')).slice(0, 5);
    }
    
    // Fallback topics
    return ['General Discussion', 'Community Updates', 'Technical Topics'];
  }, []);

  const analyzeSentiment = useCallback((messages: ChannelMessage[]): 'positive' | 'negative' | 'neutral' => {
    // Simple sentiment analysis based on message content
    const positiveWords = ['good', 'great', 'awesome', 'love', 'thanks', 'amazing', 'perfect'];
    const negativeWords = ['bad', 'hate', 'terrible', 'awful', 'sucks', 'worst', 'horrible'];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    messages.forEach(msg => {
      const content = msg.content.toLowerCase();
      positiveWords.forEach(word => {
        if (content.includes(word)) positiveCount++;
      });
      negativeWords.forEach(word => {
        if (content.includes(word)) negativeCount++;
      });
    });
    
    if (positiveCount > negativeCount * 1.2) return 'positive';
    if (negativeCount > positiveCount * 1.2) return 'negative';
    return 'neutral';
  }, []);

  const clearAnalysis = useCallback(() => {
    setState({
      isAnalyzing: false,
      currentChannel: null,
      messages: [],
      result: null,
      error: null,
    });
  }, []);

  const exportAnalysis = useCallback((): string | null => {
    if (!state.result) return null;
    
    return JSON.stringify({
      analysis: state.result,
      messages: state.messages.map(msg => ({
        author: msg.author.username,
        content: msg.content,
        timestamp: msg.timestamp,
      })),
      metadata: {
        channelId: state.currentChannel,
        analyzedAt: new Date().toISOString(),
        messageCount: state.messages.length,
      },
    }, null, 2);
  }, [state]);

  return {
    state,
    analyzeChannel,
    clearAnalysis,
    exportAnalysis,
  };
}