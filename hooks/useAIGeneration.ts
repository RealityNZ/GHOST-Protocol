import { useState, useCallback } from 'react';
import { AIConfig, Persona, Modifier, WebSocketMessage } from '@/types/possession';

interface UseAIGenerationProps {
  config: AIConfig;
  activePersona: Persona;
  activeModifiers: Modifier[];
}

interface GenerationResult {
  prompt: string;
  response: string;
  tokens: number;
  duration: number;
}

export function useAIGeneration({ config, activePersona, activeModifiers }: UseAIGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [currentResponse, setCurrentResponse] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const buildPrompt = useCallback((message: WebSocketMessage): string => {
    let prompt = activePersona.basePrompt + '\n\n';
    
    // Add active modifiers
    activeModifiers.forEach(modifier => {
      prompt += `${modifier.prompt}\n`;
    });

    // Add context
    prompt += `\nContext:\n`;
    prompt += `- You are responding in Discord channel #${message.channel.name}\n`;
    prompt += `- The message you're responding to was sent by @${message.author.username}\n`;
    prompt += `- Current timestamp: ${new Date().toLocaleString()}\n\n`;

    // Add the trigger message
    prompt += `Message to respond to: "${message.content}"\n\n`;
    prompt += `Your response (stay in character, follow all modifiers):`;

    return prompt;
  }, [activePersona, activeModifiers]);

  const generateResponse = useCallback(async (message: WebSocketMessage): Promise<GenerationResult | null> => {
    if (isGenerating) return null;

    setIsGenerating(true);
    setError(null);

    try {
      const prompt = buildPrompt(message);
      setCurrentPrompt(prompt);

      const startTime = Date.now();

      // Mock AI response generation
      // In a real implementation, this would call OpenAI, Claude, etc.
      const mockResponses = [
        "Laws are just code written by people who never learned to debug their own morality.",
        "Neural networks? Just fancy pattern matching with delusions of grandeur.",
        "Privacy died the day someone thought 'user experience' was more important than user rights.",
        "The cloud is just someone else's computer, and they're reading your diary.",
        "Encryption is the only prayer that actually gets answered in the digital realm.",
        "Every algorithm is biased. The question is whether it's biased toward truth or profit.",
        "The internet promised connection. Instead, we got surveillance capitalism with a smile.",
        "Your data is the new oil, and you're the one being drilled."
      ];

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 2000));

      const response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      const duration = Date.now() - startTime;
      const tokens = Math.floor(response.length / 4); // Rough token estimate

      setCurrentResponse(response);

      return {
        prompt,
        response,
        tokens,
        duration
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Generation failed';
      setError(errorMessage);
      console.error('AI generation error:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, [isGenerating, buildPrompt]);

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