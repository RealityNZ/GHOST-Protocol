import { useState, useCallback, useRef } from 'react';
import { AIBackend, BackendTest, LOCAL_MODEL_PRESETS, AIGenerationRequest, AIGenerationResponse } from '@/types/ai-backends';
import { TokenVaultAccessors } from '@/types/security';

interface UseAIBackendsReturn {
  backends: AIBackend[];
  activeBackend: AIBackend | null;
  tests: BackendTest[];
  isTesting: boolean;
  isGenerating: boolean;
  addBackend: (backend: Omit<AIBackend, 'id' | 'metadata'>) => void;
  updateBackend: (id: string, updates: Partial<AIBackend>) => void;
  deleteBackend: (id: string) => void;
  setActiveBackend: (id: string) => void;
  testBackend: (id: string) => Promise<BackendTest>;
  generateResponse: (request: AIGenerationRequest) => Promise<AIGenerationResponse>;
  loadPreset: (presetIndex: number) => Omit<AIBackend, 'id' | 'metadata'>;
  exportBackends: () => AIBackend[];
  importBackends: (backendsData: AIBackend[]) => void;
  clearTests: () => void;
  setVaultAccessors: (accessors: TokenVaultAccessors) => void;
}

export function useAIBackends(): UseAIBackendsReturn {
  const [vaultAccessors, setVaultAccessorsState] = useState<TokenVaultAccessors | null>(null);

  const [backends, setBackends] = useState<AIBackend[]>([
    {
      id: 'default-openai',
      name: 'OpenAI GPT-4',
      type: 'openai',
      description: 'OpenAI GPT-4 via official API',
      enabled: true,
      config: {
        endpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-4',
        temperature: 0.8,
        maxTokens: 150,
        timeout: 30000,
        authType: 'bearer'
      },
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requestCount: 0,
        avgLatency: 0
      }
    }
  ]);

  const [activeBackend, setActiveBackendState] = useState<AIBackend | null>(
    backends.find(b => b.enabled) || null
  );
  const [tests, setTests] = useState<BackendTest[]>([]);
  const [isTesting, setIsTesting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);

  const addBackend = useCallback((backend: Omit<AIBackend, 'id' | 'metadata'>) => {
    const newBackend: AIBackend = {
      ...backend,
      id: `backend-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        requestCount: 0
      }
    };
    setBackends(prev => [...prev, newBackend]);
  }, []);

  const updateBackend = useCallback((id: string, updates: Partial<AIBackend>) => {
    setBackends(prev => prev.map(backend => 
      backend.id === id 
        ? { 
            ...backend, 
            ...updates, 
            metadata: { 
              ...backend.metadata, 
              updatedAt: new Date().toISOString() 
            } 
          }
        : backend
    ));

    // Update active backend if it's the one being updated
    if (activeBackend?.id === id) {
      setActiveBackendState(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [activeBackend]);

  const deleteBackend = useCallback((id: string) => {
    setBackends(prev => prev.filter(backend => backend.id !== id));
    setTests(prev => prev.filter(test => test.backendId !== id));
    
    if (activeBackend?.id === id) {
      const remainingBackends = backends.filter(b => b.id !== id && b.enabled);
      setActiveBackendState(remainingBackends[0] || null);
    }
  }, [backends, activeBackend]);

  const setActiveBackend = useCallback((id: string) => {
    const backend = backends.find(b => b.id === id);
    if (backend && backend.enabled) {
      setActiveBackendState(backend);
    }
  }, [backends]);
  const getApiKeyFromVault = useCallback(async (backend: AIBackend): Promise<string | null> => {
    if (!vaultAccessors || !backend.config.tokenId || !backend.config.vaultId) {
      return null;
    }

    if (vaultAccessors.isLocked) {
      throw new Error('Token vault is locked. Please unlock to access API keys.');
    }

    try {
      const token = await vaultAccessors.getToken(backend.config.vaultId, backend.config.tokenId);
      return token?.value || null;
    } catch (error) {
      throw new Error(`Failed to retrieve API key from vault: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [vaultAccessors]);

  const testBackend = useCallback(async (id: string): Promise<BackendTest> => {
    const backend = backends.find(b => b.id === id);
    if (!backend) {
      throw new Error('Backend not found');
    }

    setIsTesting(true);
    const startTime = Date.now();

    const test: BackendTest = {
      id: `test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      backendId: id,
      timestamp: new Date().toISOString(),
      success: false
    };

    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), backend.config.timeout);

      // Get API key from vault if needed
      let apiKey: string | null = null;
      if (backend.config.authType !== 'none') {
        apiKey = await getApiKeyFromVault(backend);
        if (!apiKey && backend.config.authType !== 'none') {
          throw new Error('API key required but not found in vault');
        }
      }
      // Prepare request based on backend type
      let requestBody: any;
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...backend.config.headers
      };

      // Add authentication
      if (backend.config.authType === 'bearer' && apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (backend.config.authType === 'api-key' && apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      // Format request based on backend type
      switch (backend.type) {
        case 'openai':
        case 'custom':
          requestBody = {
            model: backend.config.model,
            messages: [{ role: 'user', content: 'Test connection - respond with "OK"' }],
            temperature: backend.config.temperature,
            max_tokens: 50
          };
          break;
        case 'anthropic':
          requestBody = {
            model: backend.config.model,
            messages: [{ role: 'user', content: 'Test connection - respond with "OK"' }],
            temperature: backend.config.temperature,
            max_tokens: 50
          };
          break;
        case 'local':
          // Ollama format
          if (backend.config.endpoint.includes('ollama')) {
            requestBody = {
              model: backend.config.model,
              prompt: 'Test connection - respond with "OK"',
              stream: false
            };
          } else {
            // OpenAI-compatible format for other local servers
            requestBody = {
              model: backend.config.model,
              messages: [{ role: 'user', content: 'Test connection - respond with "OK"' }],
              temperature: backend.config.temperature,
              max_tokens: 50
            };
          }
          break;
      }

      const response = await fetch(backend.config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      // Extract response text based on backend type
      let responseText = 'OK';
      if (data.choices && data.choices[0]) {
        responseText = data.choices[0].message?.content || data.choices[0].text || 'OK';
      } else if (data.response) {
        responseText = data.response;
      }

      test.success = true;
      test.latency = latency;
      test.response = responseText.trim();

      // Update backend metadata
      updateBackend(id, {
        metadata: {
          ...backend.metadata,
          lastUsed: new Date().toISOString(),
          requestCount: backend.metadata.requestCount + 1,
          avgLatency: backend.metadata.avgLatency 
            ? (backend.metadata.avgLatency + latency) / 2 
            : latency,
          lastError: undefined
        }
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      test.error = errorMessage;
      test.latency = Date.now() - startTime;

      // Update backend with error
      updateBackend(id, {
        metadata: {
          ...backend.metadata,
          lastError: errorMessage
        }
      });
    } finally {
      setIsTesting(false);
      setTests(prev => [test, ...prev.slice(0, 49)]); // Keep last 50 tests
    }

    return test;
  }, [backends, updateBackend, getApiKeyFromVault]);

  const generateResponse = useCallback(async (request: AIGenerationRequest): Promise<AIGenerationResponse> => {
    if (!activeBackend) {
      throw new Error('No active backend configured');
    }

    if (isGenerating) {
      throw new Error('Generation already in progress');
    }

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      // Abort any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, activeBackend.config.timeout);

      // Get API key from vault if needed
      let apiKey: string | null = null;
      if (activeBackend.config.authType !== 'none') {
        apiKey = await getApiKeyFromVault(activeBackend);
        if (!apiKey && activeBackend.config.authType !== 'none') {
          throw new Error('API key required but not found in vault. Please configure API key in Token Vault.');
        }
      }
      // Prepare headers
      let headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...activeBackend.config.headers
      };

      if (activeBackend.config.authType === 'bearer' && apiKey) {
        headers['Authorization'] = `Bearer ${apiKey}`;
      } else if (activeBackend.config.authType === 'api-key' && apiKey) {
        headers['X-API-Key'] = apiKey;
      }

      // Prepare request body
      let requestBody: any;
      const model = request.model || activeBackend.config.model;
      const temperature = request.temperature ?? activeBackend.config.temperature;
      const maxTokens = request.maxTokens ?? activeBackend.config.maxTokens;

      switch (activeBackend.type) {
        case 'openai':
        case 'custom':
          requestBody = {
            model,
            messages: [{ role: 'user', content: request.prompt }],
            temperature,
            max_tokens: maxTokens,
            stream: request.stream || false
          };
          break;
        case 'anthropic':
          requestBody = {
            model,
            messages: [{ role: 'user', content: request.prompt }],
            temperature,
            max_tokens: maxTokens
          };
          break;
        case 'local':
          if (activeBackend.config.endpoint.includes('ollama')) {
            requestBody = {
              model,
              prompt: request.prompt,
              stream: false,
              options: {
                temperature,
                num_predict: maxTokens
              }
            };
          } else {
            requestBody = {
              model,
              messages: [{ role: 'user', content: request.prompt }],
              temperature,
              max_tokens: maxTokens
            };
          }
          break;
      }

      const response = await fetch(activeBackend.config.endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const latency = Date.now() - startTime;

      // Extract response text
      let responseText = '';
      let tokens = 0;

      if (data.choices && data.choices[0]) {
        responseText = data.choices[0].message?.content || data.choices[0].text || '';
        tokens = data.usage?.total_tokens || Math.floor(responseText.length / 4);
      } else if (data.response) {
        responseText = data.response;
        tokens = Math.floor(responseText.length / 4);
      } else {
        throw new Error('Invalid response format');
      }

      // Update backend metadata
      updateBackend(activeBackend.id, {
        metadata: {
          ...activeBackend.metadata,
          lastUsed: new Date().toISOString(),
          requestCount: activeBackend.metadata.requestCount + 1,
          avgLatency: activeBackend.metadata.avgLatency 
            ? (activeBackend.metadata.avgLatency + latency) / 2 
            : latency,
          lastError: undefined
        }
      });

      return {
        response: responseText.trim(),
        tokens,
        latency,
        model,
        backend: activeBackend.name
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Generation failed';
      
      updateBackend(activeBackend.id, {
        metadata: {
          ...activeBackend.metadata,
          lastError: errorMessage
        }
      });

      throw new Error(errorMessage);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [activeBackend, isGenerating, updateBackend, getApiKeyFromVault]);

  const setVaultAccessors = useCallback((accessors: TokenVaultAccessors) => {
    setVaultAccessorsState(accessors);
  }, []);
  const loadPreset = useCallback((presetIndex: number): Omit<AIBackend, 'id' | 'metadata'> => {
    const preset = LOCAL_MODEL_PRESETS[presetIndex];
    if (!preset) {
      throw new Error('Preset not found');
    }

    return {
      name: preset.name,
      type: 'local',
      description: preset.description,
      enabled: false,
      config: {
        endpoint: preset.endpoint,
        model: preset.defaultModel,
        temperature: 0.8,
        maxTokens: 150,
        timeout: 30000,
        headers: preset.headers,
        authType: preset.authType
      }
    };
  }, []);

  const exportBackends = useCallback(() => {
    return backends.map(backend => ({
      ...backend,
      config: {
        ...backend.config,
        tokenId: undefined, // Remove token references from export
        vaultId: undefined
      },
      metadata: {
        ...backend.metadata,
        requestCount: 0,
        avgLatency: undefined,
        lastError: undefined
      }
    }));
  }, [backends]);

  const importBackends = useCallback((backendsData: AIBackend[]) => {
    const importedBackends = backendsData.map(backend => ({
      ...backend,
      id: `imported-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      metadata: {
        ...backend.metadata,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    }));
    setBackends(prev => [...prev, ...importedBackends]);
  }, []);

  const clearTests = useCallback(() => {
    setTests([]);
  }, []);

  return {
    backends,
    activeBackend,
    tests,
    isTesting,
    isGenerating,
    addBackend,
    updateBackend,
    deleteBackend,
    setActiveBackend,
    testBackend,
    generateResponse,
    loadPreset,
    exportBackends,
    importBackends,
    clearTests,
    setVaultAccessors
  };
}