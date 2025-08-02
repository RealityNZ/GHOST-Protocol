import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Target, X, Save, TestTube, Hash, AtSign, MessageCircle, Regex, Zap } from 'lucide-react-native';
import { TriggerRule } from '@/hooks/useTriggerSystem';

interface TriggerEditorProps {
  trigger?: TriggerRule;
  onSave: (trigger: Omit<TriggerRule, 'id' | 'triggerCount' | 'createdAt' | 'lastTriggered'>) => void;
  onCancel: () => void;
  onTest?: (trigger: TriggerRule) => void;
}

export default function TriggerEditor({ trigger, onSave, onCancel, onTest }: TriggerEditorProps) {
  const [name, setName] = useState(trigger?.name || '');
  const [type, setType] = useState<TriggerRule['type']>(trigger?.type || 'keyword');
  const [value, setValue] = useState(trigger?.value || '');
  const [enabled, setEnabled] = useState(trigger?.enabled ?? true);
  const [caseSensitive, setCaseSensitive] = useState(trigger?.caseSensitive ?? false);
  const [wholeWord, setWholeWord] = useState(trigger?.wholeWord ?? false);
  const [cooldownMs, setCooldownMs] = useState(trigger?.cooldownMs?.toString() || '5000');
  const [channels, setChannels] = useState(trigger?.channels?.join(', ') || '');

  const handleSave = () => {
    if (!name.trim() || !value.trim()) {
      return;
    }

    onSave({
      name: name.trim(),
      type,
      value: value.trim(),
      enabled,
      caseSensitive,
      wholeWord,
      cooldownMs: parseInt(cooldownMs) || 5000,
      channels: channels.split(',').map(c => c.trim()).filter(c => c.length > 0),
    });
  };

  const handleTest = () => {
    if (onTest && name.trim() && value.trim()) {
      const testTrigger: TriggerRule = {
        id: 'test',
        name: name.trim(),
        type,
        value: value.trim(),
        enabled,
        caseSensitive,
        wholeWord,
        cooldownMs: parseInt(cooldownMs) || 5000,
        channels: channels.split(',').map(c => c.trim()).filter(c => c.length > 0),
        triggerCount: 0,
        createdAt: new Date().toISOString(),
      };
      onTest(testTrigger);
    }
  };

  const triggerTypes = [
    { value: 'mention', label: 'Mention', icon: AtSign, description: 'Trigger on @mentions' },
    { value: 'keyword', label: 'Keyword', icon: Hash, description: 'Trigger on specific words' },
    { value: 'reply', label: 'Reply', icon: MessageCircle, description: 'Trigger on replies to bot' },
    { value: 'regex', label: 'Regex', icon: Regex, description: 'Advanced pattern matching' },
  ] as const;

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Target size={24} color="#FFB000" />
            <Text style={styles.headerTitle}>
              {trigger ? 'EDIT TRIGGER' : 'NEW TRIGGER'}
            </Text>
          </View>
          <TouchableOpacity onPress={onCancel} style={styles.closeButton}>
            <X size={20} color="#FF2EC0" />
          </TouchableOpacity>
        </View>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRIGGER INFO</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Trigger name..."
              placeholderTextColor="#666666"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Type</Text>
            <View style={styles.typeSelector}>
              {triggerTypes.map(triggerType => (
                <TouchableOpacity
                  key={triggerType.value}
                  style={[
                    styles.typeOption,
                    type === triggerType.value && styles.typeOptionActive
                  ]}
                  onPress={() => setType(triggerType.value)}
                >
                  <triggerType.icon size={16} color={type === triggerType.value ? '#FFB000' : '#666666'} />
                  <Text style={[
                    styles.typeOptionText,
                    type === triggerType.value && styles.typeOptionTextActive
                  ]}>
                    {triggerType.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.typeDescription}>
              {triggerTypes.find(t => t.value === type)?.description}
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>
              {type === 'mention' ? 'Username/Mention' : 
               type === 'keyword' ? 'Keyword/Phrase' :
               type === 'regex' ? 'Regular Expression' : 'Pattern'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={value}
              onChangeText={setValue}
              placeholder={
                type === 'mention' ? '@username or user_id' :
                type === 'keyword' ? 'neural, AI, surveillance' :
                type === 'regex' ? '\\b(neural|AI)\\b' : 'pattern...'
              }
              placeholderTextColor="#666666"
            />
          </View>
        </View>

        {/* Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>OPTIONS</Text>
          
          <View style={styles.optionRow}>
            <Text style={styles.optionLabel}>Enabled</Text>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: '#333333', true: '#FF2EC0' }}
              thumbColor={enabled ? '#FFB000' : '#666666'}
            />
          </View>

          {(type === 'keyword' || type === 'mention') && (
            <>
              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Case Sensitive</Text>
                <Switch
                  value={caseSensitive}
                  onValueChange={setCaseSensitive}
                  trackColor={{ false: '#333333', true: '#FF2EC0' }}
                  thumbColor={caseSensitive ? '#FFB000' : '#666666'}
                />
              </View>

              <View style={styles.optionRow}>
                <Text style={styles.optionLabel}>Whole Word Only</Text>
                <Switch
                  value={wholeWord}
                  onValueChange={setWholeWord}
                  trackColor={{ false: '#333333', true: '#FF2EC0' }}
                  thumbColor={wholeWord ? '#FFB000' : '#666666'}
                />
              </View>
            </>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Cooldown (milliseconds)</Text>
            <TextInput
              style={styles.textInput}
              value={cooldownMs}
              onChangeText={setCooldownMs}
              placeholder="5000"
              placeholderTextColor="#666666"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Channels (comma-separated, empty = all)</Text>
            <TextInput
              style={styles.textInput}
              value={channels}
              onChangeText={setChannels}
              placeholder="general, tech-talk, announcements"
              placeholderTextColor="#666666"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          
          {onTest && (
            <TouchableOpacity onPress={handleTest} style={styles.testButton}>
              <TestTube size={16} color="#0C0C0C" />
              <Text style={styles.testButtonText}>TEST</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Save size={16} color="#0C0C0C" />
            <Text style={styles.saveButtonText}>SAVE</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#FFB000',
    marginBottom: 20,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFB000',
    letterSpacing: 2,
  },
  closeButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FFB000',
    letterSpacing: 2,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#E0E0E0',
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#FFB000',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#E0E0E0',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
  },
  typeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    gap: 6,
  },
  typeOptionActive: {
    borderColor: '#FFB000',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },
  typeOptionText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#CCCCCC',
  },
  typeOptionTextActive: {
    color: '#FFB000',
  },
  typeDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#888888',
    fontStyle: 'italic',
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  optionLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#CCCCCC',
    letterSpacing: 1,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 6,
    gap: 6,
  },
  testButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB000',
    paddingVertical: 16,
    borderRadius: 6,
    gap: 6,
  },
  saveButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
});