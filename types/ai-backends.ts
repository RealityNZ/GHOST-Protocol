export interface AIBackend {
  id: string;
  name: string;
  type: 'openai' | 'anthropic' | 'local' | 'custom';
  description: string;
  enabled: boolean;
  config: {
    endpoint: string;
    tokenId?: string;
    vaultId?: string;
    model: string;
    temperature: number;
    maxTokens: number;
    timeout: number;
    headers?: Record<string, string>;
    authType: 'bearer' | 'api-key' | 'custom' | 'none';
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    lastUsed?: string;
    requestCount: number;
    avgLatency?: number;
    lastError?: string;
  };
}

export interface BackendTest {
  id: string;
  backendId: string;
  timestamp: string;
  success: boolean;
  latency?: number;
  error?: string;
  response?: string;
}

export interface LocalModelPreset {
  name: string;
  description: string;
  endpoint: string;
  defaultModel: string;
  authType: AIBackend['config']['authType'];
  headers?: Record<string, string>;
}

export const LOCAL_MODEL_PRESETS: LocalModelPreset[] = [
  {
    name: 'Ollama',
    description: 'Local Ollama instance',
    endpoint: 'http://localhost:11434/api/generate',
    defaultModel: 'llama2',
    authType: 'none'
  },
  {
    name: 'LM Studio',
    description: 'LM Studio local server',
    endpoint: 'http://localhost:1234/v1/chat/completions',
    defaultModel: 'local-model',
    authType: 'none',
    headers: {
      'Content-Type': 'application/json'
    }
  },
  {
    name: 'Text Generation WebUI',
    description: 'Oobabooga text-generation-webui',
    endpoint: 'http://localhost:5000/api/v1/generate',
    defaultModel: 'gpt-3.5-turbo',
    authType: 'none'
  },
  {
    name: 'LocalAI',
    description: 'LocalAI OpenAI-compatible API',
    endpoint: 'http://localhost:8080/v1/chat/completions',
    defaultModel: 'gpt-3.5-turbo',
    authType: 'bearer'
  },
  {
    name: 'Kobold.cpp',
    description: 'Kobold.cpp inference server',
    endpoint: 'http://localhost:5001/api/v1/generate',
    defaultModel: 'kobold',
    authType: 'none'
  }
];

export interface AIGenerationRequest {
  prompt: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIGenerationResponse {
  response: string;
  tokens: number;
  latency: number;
  model: string;
  backend: string;
}