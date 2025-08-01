export interface ChannelSummary {
  id: string;
  channelId: string;
  channelName: string;
  serverId: string;
  serverName: string;
  messageCount: number;
  requestedCount: number;
  dateRange: {
    start: string;
    end: string;
  };
  summary: string;
  keyTopics: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  participants: Array<{
    username: string;
    messageCount: number;
    mostActive: boolean;
  }>;
  generatedAt: string;
  aiBackend: string;
  processingTime: number;
}

export interface SummaryRequest {
  channelId: string;
  messageCount: number;
  includeDeleted?: boolean;
  timeRange?: {
    start?: string;
    end?: string;
  };
}

export interface ChannelMessage {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  timestamp: string;
  edited?: boolean;
  deleted?: boolean;
  attachments?: string[];
}

export interface SummaryPromptTemplate {
  id: string;
  name: string;
  description: string;
  prompt: string;
  outputFormat: 'detailed' | 'brief' | 'bullet-points' | 'analysis';
}

export const SUMMARY_TEMPLATES: SummaryPromptTemplate[] = [
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis',
    description: 'Comprehensive conversation analysis with insights',
    prompt: `Analyze the following Discord conversation and provide a detailed summary:

CONVERSATION DATA:
{messages}

Please provide:
1. MAIN TOPICS: Key discussion themes and subjects
2. SENTIMENT: Overall emotional tone of the conversation
3. KEY PARTICIPANTS: Most active users and their contributions
4. IMPORTANT EVENTS: Significant moments or decisions
5. SUMMARY: Concise overview of what happened

Format your response in a clear, structured manner suitable for surveillance analysis.`,
    outputFormat: 'detailed'
  },
  {
    id: 'brief-summary',
    name: 'Brief Summary',
    description: 'Quick overview of conversation highlights',
    prompt: `Provide a brief summary of this Discord conversation:

{messages}

Focus on:
- Main topics discussed
- Key decisions or outcomes
- Notable participant activity

Keep the summary concise but informative.`,
    outputFormat: 'brief'
  },
  {
    id: 'security-analysis',
    name: 'Security Analysis',
    description: 'Focus on security-relevant information',
    prompt: `Analyze this Discord conversation from a security perspective:

{messages}

Look for:
- Suspicious activities or discussions
- Security-related topics
- Potential threats or vulnerabilities
- Unusual behavior patterns
- Information sharing that might be sensitive

Provide a security-focused analysis suitable for surveillance purposes.`,
    outputFormat: 'analysis'
  },
  {
    id: 'bullet-points',
    name: 'Bullet Points',
    description: 'Key points in bullet format',
    prompt: `Summarize this Discord conversation as bullet points:

{messages}

Provide:
• Main topics discussed
• Key participants and their roles
• Important decisions or outcomes
• Notable events or announcements
• Overall conversation sentiment

Use clear, concise bullet points.`,
    outputFormat: 'bullet-points'
  }
];