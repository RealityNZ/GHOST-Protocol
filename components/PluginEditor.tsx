import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Code, Play, Save, X, Download, Upload } from 'lucide-react-native';

interface Plugin {
  id: string;
  name: string;
  description: string;
  category: 'preprocessor' | 'llm-swapper' | 'response-filter' | 'custom';
  version: string;
  author: string;
  enabled: boolean;
  code: string;
}

const PLUGIN_TEMPLATES = [
  {
    name: 'Sentiment Analyzer',
    description: 'Analyzes message sentiment',
    category: 'preprocessor',
    code: '// Plugin code here...'
  }
];

interface PluginEditorProps {
  plugin?: Plugin;
  onSave: (plugin: Omit<Plugin, 'id' | 'metadata'>) => void;
  onClose: () => void;
  onTest: (code: string, input: any) => Promise<{ success: boolean; result?: any; error?: string }>;
}

export default function PluginEditor({ plugin, onSave, onClose, onTest }: PluginEditorProps) {
  const [name, setName] = useState(plugin?.name || '');
  const [description, setDescription] = useState(plugin?.description || '');
  const [category, setCategory] = useState<Plugin['category']>(plugin?.category || 'custom');
  const [version, setVersion] = useState(plugin?.version || '1.0.0');
  const [author, setAuthor] = useState(plugin?.author || 'User');
  const [code, setCode] = useState(plugin?.code || '');
  const [testInput, setTestInput] = useState('{"test": "input"}');
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const handleTest = async () => {
    if (!code.trim()) {
      Alert.alert('Error', 'Please enter plugin code to test');
      return;
    }

    setIsTesting(true);
    setTestResult('Testing...');

    try {
      const input = JSON.parse(testInput);
      const result = await onTest(code, input);
      
      if (result.success) {
        setTestResult(`✅ Success:\n${JSON.stringify(result.result, null, 2)}`);
      } else {
        setTestResult(`❌ Error:\n${result.error}`);
      }
    } catch (error) {
      setTestResult(`❌ Test Error:\n${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!name.trim() || !code.trim()) {
      Alert.alert('Error', 'Name and code are required');
      return;
    }

    onSave({
      name: name.trim(),
      description: description.trim(),
      category,
      version: version.trim(),
      author: author.trim(),
      enabled: plugin?.enabled || false,
      code: code.trim()
    });
  };

  const loadTemplate = (templateIndex: number) => {
    const template = PLUGIN_TEMPLATES[templateIndex];
    if (template) {
      setName(template.name);
      setDescription(template.description);
      setCategory(template.category);
      setCode(template.code);
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['rgba(12, 12, 12, 0.95)', 'rgba(30, 30, 30, 0.95)']}
        style={styles.modal}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Code size={20} color="#00FFF7" />
            <Text style={styles.headerTitle}>
              {plugin ? 'EDIT PLUGIN' : 'NEW PLUGIN'}
            </Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#AAAAAA" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>BASIC INFO</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Name</Text>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Plugin name..."
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Description</Text>
              <TextInput
                style={styles.textInput}
                value={description}
                onChangeText={setDescription}
                placeholder="What does this plugin do?"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>Category</Text>
                <View style={styles.categoryContainer}>
                  {(['preprocessor', 'llm-swapper', 'response-filter', 'custom'] as const).map(cat => (
                    <TouchableOpacity
                      key={cat}
                      style={[styles.categoryButton, category === cat && styles.categoryButtonActive]}
                      onPress={() => setCategory(cat)}
                    >
                      <Text style={[styles.categoryText, category === cat && styles.categoryTextActive]}>
                        {cat.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text style={styles.inputLabel}>Version</Text>
                <TextInput
                  style={styles.textInput}
                  value={version}
                  onChangeText={setVersion}
                  placeholder="1.0.0"
                  placeholderTextColor="#666666"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                <Text style={styles.inputLabel}>Author</Text>
                <TextInput
                  style={styles.textInput}
                  value={author}
                  onChangeText={setAuthor}
                  placeholder="Your name"
                  placeholderTextColor="#666666"
                />
              </View>
            </View>
          </View>

          {/* Templates */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TEMPLATES</Text>
            <View style={styles.templateGrid}>
              {PLUGIN_TEMPLATES.map((template, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.templateButton}
                  onPress={() => loadTemplate(index)}
                >
                  <Text style={styles.templateName}>{template.name}</Text>
                  <Text style={styles.templateCategory}>{template.category}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Code Editor */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>CODE</Text>
            <View style={styles.codeContainer}>
              <TextInput
                style={styles.codeInput}
                value={code}
                onChangeText={setCode}
                placeholder="// Plugin code here..."
                placeholderTextColor="#666666"
                multiline
                textAlignVertical="top"
              />
            </View>
          </View>

          {/* Testing */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TESTING</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Test Input (JSON)</Text>
              <TextInput
                style={[styles.textInput, { height: 60 }]}
                value={testInput}
                onChangeText={setTestInput}
                placeholder='{"test": "data"}'
                placeholderTextColor="#666666"
                multiline
              />
            </View>

            <TouchableOpacity
              style={[styles.testButton, isTesting && styles.testButtonDisabled]}
              onPress={handleTest}
              disabled={isTesting}
            >
              <Play size={16} color="#0C0C0C" />
              <Text style={styles.testButtonText}>
                {isTesting ? 'TESTING...' : 'TEST PLUGIN'}
              </Text>
            </TouchableOpacity>

            {testResult && (
              <View style={styles.testResultContainer}>
                <Text style={styles.testResultLabel}>Test Result:</Text>
                <View style={styles.testResultBox}>
                  <Text style={styles.testResultText}>{testResult}</Text>
                </View>
              </View>
            )}
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footer}>
          <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
            <Text style={styles.cancelButtonText}>CANCEL</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Save size={16} color="#0C0C0C" />
            <Text style={styles.saveButtonText}>SAVE PLUGIN</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxHeight: '90%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF2EC0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 46, 192, 0.3)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FFB000',
    letterSpacing: 2,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#AAAAAA',
    letterSpacing: 1,
    marginBottom: 6,
  },
  textInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  categoryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#666666',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  categoryButtonActive: {
    borderColor: '#FF2EC0',
    backgroundColor: 'rgba(255, 46, 192, 0.2)',
  },
  categoryText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  categoryTextActive: {
    color: '#FF2EC0',
  },
  templateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  templateButton: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    padding: 12,
  },
  templateName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  templateCategory: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  codeContainer: {
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
  },
  codeInput: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#FFFFFF',
    padding: 12,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFB000',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
    marginTop: 12,
  },
  testButtonDisabled: {
    backgroundColor: '#666666',
  },
  testButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  testResultContainer: {
    marginTop: 16,
  },
  testResultLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#AAAAAA',
    letterSpacing: 1,
    marginBottom: 6,
  },
  testResultBox: {
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    padding: 12,
    maxHeight: 120,
  },
  testResultText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#FFFFFF',
    lineHeight: 14,
  },
  footer: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 46, 192, 0.3)',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
  },
  cancelButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  saveButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
});