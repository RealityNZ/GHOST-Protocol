export interface Plugin {
  id: string;
  name: string;
  description: string;
  category: 'preprocessor' | 'llm-swapper' | 'response-filter' | 'custom';
  version: string;
  author: string;
  enabled: boolean;
  code: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    executionCount: number;
    lastError?: string;
  };
}

export interface PluginExecution {
  pluginId: string;
  timestamp: string;
  input: any;
  output: any;
  duration: number;
  success: boolean;
  error?: string;
}

export interface PluginAPI {
  log: (message: string) => void;
  error: (message: string) => void;
  storage: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
    remove: (key: string) => void;
  };
  utils: {
    hash: (input: string) => string;
    timestamp: () => string;
    random: () => number;
  };
}

export interface PluginTemplate {
  name: string;
  description: string;
  category: Plugin['category'];
  code: string;
}

export const PLUGIN_TEMPLATES: PluginTemplate[] = [
  {
    name: 'Sentiment Analyzer',
    description: 'Analyzes message sentiment before processing',
    category: 'preprocessor',
    code: `// Sentiment Analysis Plugin
function execute(input, context, api) {
  const { message } = input;
  
  // Simple sentiment analysis
  const positiveWords = ['good', 'great', 'awesome', 'love', 'happy', 'excellent'];
  const negativeWords = ['bad', 'terrible', 'hate', 'awful', 'sad', 'horrible'];
  
  const words = message.toLowerCase().split(' ');
  let score = 0;
  
  words.forEach(word => {
    if (positiveWords.includes(word)) score += 1;
    if (negativeWords.includes(word)) score -= 1;
  });
  
  const sentiment = score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral';
  
  api.log(\`Sentiment analysis: \${sentiment} (score: \${score})\`);
  
  return {
    ...input,
    sentiment: {
      score,
      label: sentiment,
      confidence: Math.min(Math.abs(score) / words.length, 1)
    }
  };
}`
  },
  {
    name: 'Profanity Filter',
    description: 'Filters and replaces profanity in responses',
    category: 'response-filter',
    code: `// Profanity Filter Plugin
function execute(input, context, api) {
  const { response } = input;
  
  const profanityList = ['damn', 'hell', 'crap', 'stupid'];
  const replacements = ['darn', 'heck', 'crud', 'silly'];
  
  let filteredResponse = response;
  
  profanityList.forEach((word, index) => {
    const regex = new RegExp(word, 'gi');
    filteredResponse = filteredResponse.replace(regex, replacements[index]);
  });
  
  const changesCount = (response.match(/damn|hell|crap|stupid/gi) || []).length;
  
  if (changesCount > 0) {
    api.log(\`Filtered \${changesCount} profanity instances\`);
  }
  
  return {
    ...input,
    response: filteredResponse,
    filtered: changesCount > 0
  };
}`
  },
  {
    name: 'Local LLM Swapper',
    description: 'Routes requests to local Ollama instance',
    category: 'llm-swapper',
    code: `// Local LLM Swapper Plugin
async function execute(input, context, api) {
  const { prompt, model = 'llama2' } = input;
  
  try {
    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt,
        stream: false
      })
    });
    
    if (!response.ok) {
      throw new Error(\`Ollama API error: \${response.status}\`);
    }
    
    const data = await response.json();
    
    api.log(\`Generated response using local model: \${model}\`);
    
    return {
      ...input,
      response: data.response,
      model: model,
      backend: 'ollama-local'
    };
    
  } catch (error) {
    api.error(\`Local LLM error: \${error.message}\`);
    throw error;
  }
}`
  },
  {
    name: 'Response Length Limiter',
    description: 'Ensures responses stay within character limits',
    category: 'response-filter',
    code: `// Response Length Limiter Plugin
function execute(input, context, api) {
  const { response, maxLength = 2000 } = input;
  
  if (response.length <= maxLength) {
    return input;
  }
  
  // Smart truncation - try to end at sentence boundary
  let truncated = response.substring(0, maxLength);
  const lastSentence = truncated.lastIndexOf('.');
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSentence > maxLength * 0.8) {
    truncated = truncated.substring(0, lastSentence + 1);
  } else if (lastSpace > maxLength * 0.9) {
    truncated = truncated.substring(0, lastSpace) + '...';
  } else {
    truncated = truncated + '...';
  }
  
  api.log(\`Truncated response from \${response.length} to \${truncated.length} characters\`);
  
  return {
    ...input,
    response: truncated,
    truncated: true,
    originalLength: response.length
  };
}`
  },
  {
    name: 'Context Injector',
    description: 'Injects additional context into prompts',
    category: 'preprocessor',
    code: `// Context Injector Plugin
function execute(input, context, api) {
  const { prompt, message } = input;
  const { channel, author, timestamp } = context;
  
  const contextInfo = [
    \`Current time: \${new Date().toLocaleString()}\`,
    \`Channel: #\${channel?.name || 'unknown'}\`,
    \`Author: @\${author?.username || 'unknown'}\`,
    \`Message timestamp: \${timestamp || 'unknown'}\`
  ].join('\\n');
  
  const enhancedPrompt = \`\${prompt}

CONTEXT INFORMATION:
\${contextInfo}

Original message: "\${message}"

Please respond appropriately considering this context.\`;
  
  api.log('Injected contextual information into prompt');
  
  return {
    ...input,
    prompt: enhancedPrompt,
    contextInjected: true
  };
}`
  }
];