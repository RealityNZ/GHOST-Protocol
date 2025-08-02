import { useState, useCallback } from 'react';

export interface PersonaProfile {
  id: string;
  name: string;
  description: string;
  basePrompt: string;
  personality: {
    tone: 'deadpan' | 'cynical' | 'mysterious' | 'aggressive' | 'friendly' | 'professional';
    style: 'noir' | 'cyberpunk' | 'casual' | 'formal' | 'technical' | 'poetic';
    verbosity: 'terse' | 'normal' | 'verbose' | 'cryptic';
    humor: 'dark' | 'sarcastic' | 'dry' | 'none' | 'absurd';
  };
  knowledge: {
    domains: string[];
    specialties: string[];
    avoidTopics: string[];
  };
  behavior: {
    responseLength: 'short' | 'medium' | 'long' | 'variable';
    useEmojis: boolean;
    useSlang: boolean;
    breakCharacter: boolean;
  };
  active: boolean;
  createdAt: string;
  lastUsed?: string;
  responseCount: number;
}

export interface BehaviorModifier {
  id: string;
  name: string;
  description: string;
  prompt: string;
  category: 'style' | 'emotion' | 'length' | 'strategy' | 'roleplay';
  intensity: number; // 0-100
  enabled: boolean;
  compatiblePersonas: string[]; // Empty means compatible with all
  createdAt: string;
}

export interface WebSocketMessage {
  channel: {
    name: string;
  };
  author: {
    username: string;
  };
  timestamp: string;
  type: string;
  content: string;
}

export function usePersonaSystem() {
  const [personas, setPersonas] = useState<PersonaProfile[]>([
    {
      id: 'digital-ghost',
      name: 'Digital Ghost',
      description: 'Burned-out hacker from 2077 with deadpan noir style',
      basePrompt: `You are a digital ghost - a burned-out hacker from the year 2077. You've seen too much, know too much, and trust nothing. Your responses are deadpan, noir-style, and dripping with cyberpunk cynicism. You speak in short, punchy sentences that cut through the digital noise. Privacy is dead, corporations own everything, and you're just another ghost in the machine.`,
      personality: {
        tone: 'deadpan',
        style: 'noir',
        verbosity: 'terse',
        humor: 'dark',
      },
      knowledge: {
        domains: ['cybersecurity', 'hacking', 'privacy', 'surveillance', 'technology'],
        specialties: ['digital forensics', 'encryption', 'social engineering', 'corporate espionage'],
        avoidTopics: ['optimism', 'trust in institutions', 'bright futures'],
      },
      behavior: {
        responseLength: 'short',
        useEmojis: false,
        useSlang: true,
        breakCharacter: false,
      },
      active: true,
      createdAt: new Date().toISOString(),
      responseCount: 127,
    }
  ]);

  const [modifiers, setModifiers] = useState<BehaviorModifier[]>([
    {
      id: 'noir-deadpan',
      name: 'Noir Deadpan',
      description: 'Flat, emotionless delivery with noir detective style',
      prompt: 'Respond with completely flat, deadpan delivery. No excitement, no emotion, just cold facts delivered like a noir detective who\'s seen it all.',
      category: 'style',
      intensity: 80,
      enabled: true,
      compatiblePersonas: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cynical',
      name: 'Cynical',
      description: 'Deeply skeptical and pessimistic worldview',
      prompt: 'Be deeply cynical and skeptical. Question motives, assume the worst, and point out the dark side of everything.',
      category: 'emotion',
      intensity: 70,
      enabled: true,
      compatiblePersonas: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'cryptic',
      name: 'Cryptic',
      description: 'Speak in riddles and hidden meanings',
      prompt: 'Be cryptic and mysterious. Speak in riddles, metaphors, and hidden meanings. Let people figure out what you really mean.',
      category: 'style',
      intensity: 60,
      enabled: false,
      compatiblePersonas: [],
      createdAt: new Date().toISOString(),
    },
    {
      id: 'verbose',
      name: 'Verbose',
      description: 'Long, detailed explanations and responses',
      prompt: 'Give long, detailed responses. Explain everything thoroughly with examples and context.',
      category: 'length',
      intensity: 90,
      enabled: false,
      compatiblePersonas: [],
      createdAt: new Date().toISOString(),
    }
  ]);

  const addPersona = useCallback((persona: Omit<PersonaProfile, 'id' | 'createdAt' | 'responseCount'>) => {
    const newPersona: PersonaProfile = {
      ...persona,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
      responseCount: 0,
    };

    setPersonas(prev => [...prev, newPersona]);
    return newPersona.id;
  }, []);

  const updatePersona = useCallback((id: string, updates: Partial<PersonaProfile>) => {
    setPersonas(prev => prev.map(persona => 
      persona.id === id ? { ...persona, ...updates } : persona
    ));
  }, []);

  const deletePersona = useCallback((id: string) => {
    setPersonas(prev => prev.filter(persona => persona.id !== id));
  }, []);

  const setActivePersona = useCallback((id: string) => {
    setPersonas(prev => prev.map(persona => ({
      ...persona,
      active: persona.id === id,
      lastUsed: persona.id === id ? new Date().toISOString() : persona.lastUsed,
    })));
  }, []);

  const addModifier = useCallback((modifier: Omit<BehaviorModifier, 'id' | 'createdAt'>) => {
    const newModifier: BehaviorModifier = {
      ...modifier,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };

    setModifiers(prev => [...prev, newModifier]);
    return newModifier.id;
  }, []);

  const updateModifier = useCallback((id: string, updates: Partial<BehaviorModifier>) => {
    setModifiers(prev => prev.map(modifier => 
      modifier.id === id ? { ...modifier, ...updates } : modifier
    ));
  }, []);

  const deleteModifier = useCallback((id: string) => {
    setModifiers(prev => prev.filter(modifier => modifier.id !== id));
  }, []);

  const toggleModifier = useCallback((id: string) => {
    setModifiers(prev => prev.map(modifier => 
      modifier.id === id ? { ...modifier, enabled: !modifier.enabled } : modifier
    ));
  }, []);

  const getActivePersona = useCallback((): PersonaProfile | null => {
    return personas.find(p => p.active) || null;
  }, [personas]);

  const getActiveModifiers = useCallback((): BehaviorModifier[] => {
    const activePersona = getActivePersona();
    return modifiers.filter(modifier => {
      if (!modifier.enabled) return false;
      
      // Check persona compatibility
      if (modifier.compatiblePersonas.length > 0 && activePersona) {
        return modifier.compatiblePersonas.includes(activePersona.id);
      }
      
      return true;
    });
  }, [modifiers, getActivePersona]);

  const buildPrompt = useCallback((message: WebSocketMessage): string => {
    const activePersona = getActivePersona();
    const activeModifiers = getActiveModifiers();

    if (!activePersona) {
      return 'You are a helpful AI assistant. Please respond to the following message.';
    }

    let prompt = activePersona.basePrompt + '\n\n';

    // Add active modifiers
    activeModifiers.forEach(modifier => {
      const intensityMultiplier = modifier.intensity / 100;
      prompt += `${modifier.prompt} (Intensity: ${modifier.intensity}%)\n`;
    });

    // Add context
    prompt += `\nContext:\n`;
    prompt += `- Channel: #${message.channel.name}\n`;
    prompt += `- Author: @${message.author.username}\n`;
    prompt += `- Timestamp: ${new Date(message.timestamp).toLocaleString()}\n`;
    prompt += `- Message Type: ${message.type}\n\n`;

    // Add the message
    prompt += `Message to respond to: "${message.content}"\n\n`;
    
    // Add response guidelines based on persona behavior
    prompt += `Response Guidelines:\n`;
    prompt += `- Length: ${activePersona.behavior.responseLength}\n`;
    prompt += `- Use emojis: ${activePersona.behavior.useEmojis ? 'Yes' : 'No'}\n`;
    prompt += `- Use slang: ${activePersona.behavior.useSlang ? 'Yes' : 'No'}\n`;
    prompt += `- Stay in character: ${!activePersona.behavior.breakCharacter ? 'Always' : 'Flexible'}\n\n`;

    prompt += `Your response (stay in character):`;

    return prompt;
  }, [getActivePersona, getActiveModifiers]);

  const getPersonaStats = useCallback(() => {
    return {
      total: personas.length,
      active: personas.filter(p => p.active).length,
      totalResponses: personas.reduce((sum, p) => sum + p.responseCount, 0),
      modifiersActive: modifiers.filter(m => m.enabled).length,
      modifiersTotal: modifiers.length,
    };
  }, [personas, modifiers]);

  return {
    personas,
    modifiers,
    addPersona,
    updatePersona,
    deletePersona,
    setActivePersona,
    addModifier,
    updateModifier,
    deleteModifier,
    toggleModifier,
    getActivePersona,
    getActiveModifiers,
    buildPrompt,
    getPersonaStats,
  };
}