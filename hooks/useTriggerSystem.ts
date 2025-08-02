import { useState, useCallback, useEffect } from 'react';
import { WebSocketMessage } from '@/types/possession';

export interface TriggerRule {
  id: string;
  name: string;
  type: 'mention' | 'keyword' | 'reply' | 'thread' | 'regex' | 'custom';
  value: string;
  enabled: boolean;
  caseSensitive: boolean;
  wholeWord: boolean;
  channels: string[]; // Empty array means all channels
  cooldownMs: number;
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
}

export interface TriggerMatch {
  rule: TriggerRule;
  message: WebSocketMessage;
  matchedText: string;
  confidence: number;
}

export function useTriggerSystem() {
  const [triggers, setTriggers] = useState<TriggerRule[]>([
    {
      id: 'default-mention',
      name: 'Ghost User Mention',
      type: 'mention',
      value: '@ghost_user',
      enabled: true,
      caseSensitive: false,
      wholeWord: true,
      channels: [],
      cooldownMs: 5000,
      triggerCount: 0,
      createdAt: new Date().toISOString(),
    },
    {
      id: 'default-keyword',
      name: 'Neural Keyword',
      type: 'keyword',
      value: 'neural',
      enabled: false,
      caseSensitive: false,
      wholeWord: false,
      channels: [],
      cooldownMs: 10000,
      triggerCount: 0,
      createdAt: new Date().toISOString(),
    }
  ]);

  const [recentMatches, setRecentMatches] = useState<TriggerMatch[]>([]);

  const addTrigger = useCallback((trigger: Omit<TriggerRule, 'id' | 'triggerCount' | 'createdAt'>) => {
    const newTrigger: TriggerRule = {
      ...trigger,
      id: Math.random().toString(36).substr(2, 9),
      triggerCount: 0,
      createdAt: new Date().toISOString(),
    };

    setTriggers(prev => [...prev, newTrigger]);
    console.log(`🎯 Added trigger: ${newTrigger.name}`);
    return newTrigger.id;
  }, []);

  const updateTrigger = useCallback((id: string, updates: Partial<TriggerRule>) => {
    setTriggers(prev => prev.map(trigger => 
      trigger.id === id ? { ...trigger, ...updates } : trigger
    ));
  }, []);

  const deleteTrigger = useCallback((id: string) => {
    setTriggers(prev => prev.filter(trigger => trigger.id !== id));
  }, []);

  const toggleTrigger = useCallback((id: string) => {
    setTriggers(prev => prev.map(trigger => 
      trigger.id === id ? { ...trigger, enabled: !trigger.enabled } : trigger
    ));
  }, []);

  const checkTriggers = useCallback((message: WebSocketMessage): TriggerMatch[] => {
    const matches: TriggerMatch[] = [];
    const now = new Date();

    for (const trigger of triggers) {
      if (!trigger.enabled) continue;

      // Check cooldown
      if (trigger.lastTriggered) {
        const lastTriggered = new Date(trigger.lastTriggered);
        const timeSince = now.getTime() - lastTriggered.getTime();
        if (timeSince < trigger.cooldownMs) continue;
      }

      // Check channel filter
      if (trigger.channels.length > 0 && !trigger.channels.includes(message.channel.id)) {
        continue;
      }

      let isMatch = false;
      let matchedText = '';
      let confidence = 0;

      switch (trigger.type) {
        case 'mention':
          const mentionPattern = trigger.caseSensitive ? 
            trigger.value : trigger.value.toLowerCase();
          const messageContent = trigger.caseSensitive ? 
            message.content : message.content.toLowerCase();
          
          if (trigger.wholeWord) {
            const regex = new RegExp(`\\b${mentionPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
            isMatch = regex.test(messageContent);
          } else {
            isMatch = messageContent.includes(mentionPattern);
          }
          
          if (isMatch) {
            matchedText = trigger.value;
            confidence = 1.0;
          }
          break;

        case 'keyword':
          const keywordPattern = trigger.caseSensitive ? 
            trigger.value : trigger.value.toLowerCase();
          const content = trigger.caseSensitive ? 
            message.content : message.content.toLowerCase();
          
          if (trigger.wholeWord) {
            const regex = new RegExp(`\\b${keywordPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
            const match = content.match(regex);
            if (match) {
              isMatch = true;
              matchedText = match[0];
              confidence = 0.9;
            }
          } else {
            if (content.includes(keywordPattern)) {
              isMatch = true;
              matchedText = keywordPattern;
              confidence = 0.8;
            }
          }
          break;

        case 'reply':
          // Check if message is a reply to bot or mentions bot
          isMatch = message.content.startsWith('@') || 
                   message.mentions.some(mention => mention.includes('ghost_user'));
          if (isMatch) {
            matchedText = 'reply detected';
            confidence = 0.7;
          }
          break;

        case 'regex':
          try {
            const regex = new RegExp(trigger.value, trigger.caseSensitive ? 'g' : 'gi');
            const match = message.content.match(regex);
            if (match) {
              isMatch = true;
              matchedText = match[0];
              confidence = 0.95;
            }
          } catch (error) {
            console.warn(`Invalid regex in trigger ${trigger.name}:`, error);
          }
          break;
      }

      if (isMatch) {
        const match: TriggerMatch = {
          rule: trigger,
          message,
          matchedText,
          confidence,
        };

        matches.push(match);

        // Update trigger stats
        setTriggers(prev => prev.map(t => 
          t.id === trigger.id ? {
            ...t,
            lastTriggered: now.toISOString(),
            triggerCount: t.triggerCount + 1,
          } : t
        ));
      }
    }

    if (matches.length > 0) {
      setRecentMatches(prev => [...matches, ...prev.slice(0, 49)]); // Keep last 50 matches
    }

    return matches;
  }, [triggers]);

  const getActiveTriggers = useCallback(() => {
    return triggers.filter(t => t.enabled);
  }, [triggers]);

  const getTriggerStats = useCallback(() => {
    return {
      total: triggers.length,
      active: triggers.filter(t => t.enabled).length,
      totalTriggers: triggers.reduce((sum, t) => sum + t.triggerCount, 0),
      byType: {
        mention: triggers.filter(t => t.type === 'mention').length,
        keyword: triggers.filter(t => t.type === 'keyword').length,
        reply: triggers.filter(t => t.type === 'reply').length,
        regex: triggers.filter(t => t.type === 'regex').length,
      }
    };
  }, [triggers]);

  return {
    triggers,
    recentMatches,
    addTrigger,
    updateTrigger,
    deleteTrigger,
    toggleTrigger,
    checkTriggers,
    getActiveTriggers,
    getTriggerStats,
  };
}