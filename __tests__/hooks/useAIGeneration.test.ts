import { renderHook, act } from '@testing-library/react-native';
import { useAIGeneration } from '@/hooks/useAIGeneration';
import { AIConfig, Persona, Modifier, WebSocketMessage } from '@/types/possession';

// Mock configuration
const mockConfig: AIConfig = {
  model: 'gpt-4o',
  temperature: 0.8,
  maxTokens: 150,
  streaming: false
};

const mockPersona: Persona = {
  id: 'test-persona',
  name: 'Test Persona',
  description: 'Test persona for unit tests',
  basePrompt: 'You are a test AI assistant.',
  modifiers: ['test-modifier'],
  active: true
};

const mockModifiers: Modifier[] = [
  {
    id: 'test-modifier',
    name: 'Test Modifier',
    description: 'Test modifier for unit tests',
    prompt: 'Be helpful and concise.',
    enabled: true,
    category: 'style'
  }
];

const mockMessage: WebSocketMessage = {
  type: 'message',
  content: 'Hello, AI!',
  author: {
    id: 'user123',
    username: 'testuser'
  },
  channel: {
    id: 'channel123',
    name: 'general'
  },
  mentions: [],
  timestamp: new Date().toISOString()
};

describe('useAIGeneration', () => {
  it('initializes with correct default state', () => {
    const { result } = renderHook(() => 
      useAIGeneration({
        config: mockConfig,
        activePersona: mockPersona,
        activeModifiers: mockModifiers
      })
    );

    expect(result.current.isGenerating).toBe(false);
    expect(result.current.currentPrompt).toBe('');
    expect(result.current.currentResponse).toBe('');
    expect(result.current.error).toBe(null);
  });

  it('builds prompt correctly with persona and modifiers', async () => {
    const { result } = renderHook(() => 
      useAIGeneration({
        config: mockConfig,
        activePersona: mockPersona,
        activeModifiers: mockModifiers
      })
    );

    await act(async () => {
      await result.current.generateResponse(mockMessage);
    });

    expect(result.current.currentPrompt).toContain('You are a test AI assistant.');
    expect(result.current.currentPrompt).toContain('Be helpful and concise.');
    expect(result.current.currentPrompt).toContain('Hello, AI!');
    expect(result.current.currentPrompt).toContain('#general');
    expect(result.current.currentPrompt).toContain('@testuser');
  });

  it('generates response successfully', async () => {
    const { result } = renderHook(() => 
      useAIGeneration({
        config: mockConfig,
        activePersona: mockPersona,
        activeModifiers: mockModifiers
      })
    );

    await act(async () => {
      await result.current.generateResponse(mockMessage);
    });

    expect(result.current.currentResponse).toBeTruthy();
    expect(result.current.currentResponse.length).toBeGreaterThan(0);
    expect(result.current.isGenerating).toBe(false);
  });

  it('clears generation state', () => {
    const { result } = renderHook(() => 
      useAIGeneration({
        config: mockConfig,
        activePersona: mockPersona,
        activeModifiers: mockModifiers
      })
    );

    act(() => {
      result.current.clearGeneration();
    });

    expect(result.current.currentPrompt).toBe('');
    expect(result.current.currentResponse).toBe('');
    expect(result.current.error).toBe(null);
  });
});