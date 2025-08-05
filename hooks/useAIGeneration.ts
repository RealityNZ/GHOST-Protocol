import { useState, useCallback } from 'react';

interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  streaming: boolean;
}

interface Persona {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  modifiers: string[];
  active: boolean;
}

interface Modifier {
  id: string;
  name: string;
  description: string;
  prompt: string;
  enabled: boolean;
  category: string;
}

interface WebSocketMessage {
  type: string;
  content: string;
  author: { id: string; username: string };
  channel: { id: string; name: string };
  mentions: string[];
  timestamp: string;
}

interface UseAIGenerationProps {
  config: AIConfig;
  activePersona: Persona;
  activeModifiers: Modifier[];
}

export function useAIGeneration({ config, activePersona, activeModifiers }: UseAIGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const generateResponse = useCallback(async (message: WebSocketMessage) => {
    if (isGenerating) return null;

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = `${activePersona.basePrompt}\n\nRespond to: "${message.content}"`;
      setCurrentPrompt(prompt);

      // Mock AI response generation
      const mockResponses = [
        "Laws are just code written by people who never learned to debug their own morality.",
        "Neural networks? Just fancy pattern matching with delusions of grandeur.",
        "Privacy died the day someone thought 'user experience' was more important than user rights.",
        "The cloud is just someone else's computer, and they're reading your diary.",
      ];

      await new Promise(resolve => setTimeout(resolve, 1500));
      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      setCurrentResponse(response);

      return { prompt, response, tokens: 50, duration: 1500 };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, activePersona]);

  const clearGeneration = useCallback(() => {
    setCurrentPrompt('');
    setCurrentResponse('');
    setError(null);
  }, []);

  return {
    isGenerating,
    currentPrompt,
    currentResponse,
    error,
    generateResponse,
    clearGeneration
  };
}