import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Brain, Plus, CreditCard as Edit3, Trash2, Play, CircleCheck as CheckCircle, Circle as XCircle, Clock, Download, Upload, Zap, X } from 'lucide-react-native';
import { AIBackend, LOCAL_MODEL_PRESETS } from '@/types/ai-backends';

interface AIBackendManagerProps {
  backends: AIBackend[];
  activeBackend: AIBackend | null;
  tests: any[];
  isTesting: boolean;
  onAddBackend: (backend: Omit<AIBackend, 'id' | 'metadata'>) => void;
  onUpdateBackend: (id: string, updates: Partial<AIBackend>) => void;
  onDeleteBackend: (id: string) => void;
  onSetActiveBackend: (id: string) => void;
  onTestBackend: (id: string) => Promise<any>;
  onLoadPreset: (presetIndex: number) => Omit<AIBackend, 'id' | 'metadata'>;
}

export default function AIBackendManager({
  backends,
  activeBackend,
  tests,
  isTesting,
  onAddBackend,
  onUpdateBackend,
  onDeleteBackend,
  onSetActiveBackend,
  onTestBackend,
  onLoadPreset
}: AIBackendManagerProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [editingBackend, setEditingBackend] = useState<AIBackend | null>(null);
  const [showPresets, setShowPresets] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<AIBackend['type']>('custom');
  const [endpoint, setEndpoint] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [temperature, setTemperature] = useState('0.8');
  const [maxTokens, setMaxTokens] = useState('150');
  const [timeout, setTimeout] = useState('30000');
  const [authType, setAuthType] = useState<AIBackend['config']['authType']>('bearer');

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('custom');
    setEndpoint('');
    setApiKey('');
    setModel('');
    setTemperature('0.8');
    setMaxTokens('150');
    setTimeout('30000');
    setAuthType('bearer');
  };

  const loadBackendToForm = (backend: AIBackend) => {
    setName(backend.name);
    setDescription(backend.description);
    setType(backend.type);
    setEndpoint(backend.config.endpoint);
    // Load API key from vault if available
    if (backend.config.tokenId && backend.config.vaultId && vaultAccessors && !vaultAccessors.isLocked) {
      vaultAccessors.getToken(backend.config.vaultId, backend.config.tokenId)
        .then(token => setApiKey(token?.value || ''))
        .catch(() => setApiKey(''));
    } else {
      setApiKey('');
    }
    setModel(backend.config.model);
    setTemperature(backend.config.temperature.toString());
    setMaxTokens(backend.config.maxTokens.toString());
    setTimeout(backend.config.timeout.toString());
    setAuthType(backend.config.authType);
  };

  const handleSave = async () => {
    if (!name.trim() || !endpoint.trim() || !model.trim()) {
      Alert.alert('Error', 'Name, endpoint, and model are required');
      return;
    }

    // Handle API key storage in vault
    let tokenId: string | undefined;
    let vaultId: string | undefined;

    if (apiKey.trim() && vaultAccessors && !vaultAccessors.isLocked && vaultAccessors.activeVaultId) {
      try {
        // Determine token type based on backend type
        let tokenType = 'custom';
        if (type === 'openai') tokenType = 'openai';
        else if (type === 'anthropic') tokenType = 'anthropic';

        tokenId = await onAddToken(vaultAccessors.activeVaultId, {
          name: `${name} API Key`,
          type: tokenType,
          value: apiKey.trim(),
          description: `API key for ${name} backend`,
          metadata: {
            backendId: editingBackend?.id,
            endpoint: endpoint.trim()
          }
        });
        vaultId = vaultAccessors.activeVaultId;
      } catch (error) {
        Alert.alert('Error', `Failed to store API key in vault: ${error instanceof Error ? error.message : 'Unknown error'}`);
        return;
      }
    }
    const backendData: Omit<AIBackend, 'id' | 'metadata'> = {
      name: name.trim(),
      type,
      description: description.trim(),
      enabled: false,
      config: {
        endpoint: endpoint.trim(),
        tokenId,
        vaultId,
        model: model.trim(),
        temperature: parseFloat(temperature) || 0.8,
        maxTokens: parseInt(maxTokens) || 150,
        timeout: parseInt(timeout) || 30000,
        authType
      }
    };

    if (editingBackend) {
      onUpdateBackend(editingBackend.id, backendData);
    } else {
      onAddBackend(backendData);
    }

    resetForm();
    setEditingBackend(null);
    setShowEditor(false);
  };

  const handleEdit = (backend: AIBackend) => {
    setEditingBackend(backend);
    loadBackendToForm(backend);
    setShowEditor(true);
  };

  const handleLoadPreset = (presetIndex: number) => {
    try {
      const preset = onLoadPreset(presetIndex);
      loadBackendToForm({ ...preset, id: '', metadata: {} as any });
      setShowPresets(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to load preset');
    }
  };

  const handleTest = async (backendId: string) => {
    try {
      const result = await onTestBackend(backendId);
      if (result.success) {
        Alert.alert('Test Successful', `Response: "${result.response}"\nLatency: ${result.latency}ms`);
      } else {
        Alert.alert('Test Failed', result.error || 'Unknown error');
      }
    } catch (error) {
      Alert.alert('Test Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const getStatusColor = (backend: AIBackend) => {
    if (backend.metadata.lastError) return '#FF0080';
    if (backend.metadata.lastUsed) return '#00FF00';
    return '#FFB000';
  };

  const getStatusText = (backend: AIBackend) => {
    if (backend.metadata.lastError) return 'ERROR';
    if (backend.metadata.lastUsed) return 'READY';
    return 'UNTESTED';
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>AI BACKENDS</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.presetButton}
            onPress={() => setShowPresets(true)}
          >
            <Text style={styles.presetButtonText}>PRESETS</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => {
              resetForm();
              setEditingBackend(null);
              setShowEditor(true);
            }}
          >
            <Plus size={16} color="#0C0C0C" />
            <Text style={styles.addButtonText}>ADD</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Active Backend Status */}
      {activeBackend && (
        <View style={styles.activeBackendCard}>
          <LinearGradient
            colors={['rgba(0, 255, 247, 0.2)', 'rgba(255, 46, 192, 0.1)']}
            style={styles.activeBackendGradient}
          >
            <View style={styles.activeBackendHeader}>
              <Brain size={20} color="#00FFF7" />
              <Text style={styles.activeBackendTitle}>ACTIVE BACKEND</Text>
            </View>
            <Text style={styles.activeBackendName}>{activeBackend.name}</Text>
            <Text style={styles.activeBackendModel}>Model: {activeBackend.config.model}</Text>
            <View style={styles.activeBackendStats}>
              <Text style={styles.statText}>
                {activeBackend.metadata.requestCount} requests
              </Text>
              {activeBackend.metadata.avgLatency && (
                <Text style={styles.statText}>
                  {Math.round(activeBackend.metadata.avgLatency)}ms avg
                </Text>
              )}
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Backends List */}
      <ScrollView style={styles.backendsList} showsVerticalScrollIndicator={false}>
        {backends.map(backend => (
          <View key={backend.id} style={styles.backendCard}>
            <LinearGradient
              colors={backend.enabled ? 
                ['rgba(0, 255, 247, 0.1)', 'rgba(255, 46, 192, 0.05)'] :
                ['rgba(30, 30, 30, 0.3)', 'rgba(12, 12, 12, 0.5)']
              }
              style={styles.backendGradient}
            >
              <View style={styles.backendHeader}>
                <View style={styles.backendInfo}>
                  <View style={styles.backendTitleRow}>
                    <Text style={[styles.backendName, { 
                      color: backend.enabled ? '#FFFFFF' : '#AAAAAA' 
                    }]}>
                      {backend.name}
                    </Text>
                    <View style={[styles.statusDot, { 
                      backgroundColor: getStatusColor(backend) 
                    }]} />
                  </View>
                  <Text style={[styles.backendDescription, { 
                    color: backend.enabled ? '#AAAAAA' : '#666666' 
                  }]}>
                    {backend.description}
                  </Text>
                  <View style={styles.backendMeta}>
                    <Text style={styles.metaText}>
                      {backend.type.toUpperCase()} • {backend.config.model}
                    </Text>
                    <Text style={styles.statusText}>
                      {getStatusText(backend)}
                    </Text>
                  </View>
                </View>
                <View style={styles.backendActions}>
                  <TouchableOpacity 
                    style={styles.actionIcon}
                    onPress={() => handleTest(backend.id)}
                    disabled={isTesting}
                  >
                    {isTesting ? (
                      <Clock size={16} color="#FFB000" />
                    ) : (
                      <Play size={16} color="#00FFF7" />
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionIcon}
                    onPress={() => handleEdit(backend)}
                  >
                    <Edit3 size={16} color="#FFB000" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionIcon}
                    onPress={() => {
                      Alert.alert(
                        'Delete Backend',
                        `Delete "${backend.name}"?`,
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', style: 'destructive', onPress: () => onDeleteBackend(backend.id) }
                        ]
                      );
                    }}
                  >
                    <Trash2 size={16} color="#FF0080" />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.activateButton, {
                      backgroundColor: backend.id === activeBackend?.id ? '#00FF00' : '#666666'
                    }]}
                    onPress={() => {
                      if (backend.enabled) {
                        onSetActiveBackend(backend.id);
                      }
                    }}
                    disabled={!backend.enabled}
                  >
                    {backend.id === activeBackend?.id ? (
                      <CheckCircle size={12} color="#0C0C0C" />
                    ) : (
                      <Zap size={12} color="#FFFFFF" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        ))}
      </ScrollView>

      {/* Presets Modal */}
      {showPresets && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(12, 12, 12, 0.95)', 'rgba(30, 30, 30, 0.95)']}
            style={styles.modal}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>LOCAL MODEL PRESETS</Text>
              <TouchableOpacity onPress={() => setShowPresets(false)}>
                <X size={20} color="#AAAAAA" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent}>
              {LOCAL_MODEL_PRESETS.map((preset, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.presetCard}
                  onPress={() => handleLoadPreset(index)}
                >
                  <Text style={styles.presetName}>{preset.name}</Text>
                  <Text style={styles.presetDescription}>{preset.description}</Text>
                  <Text style={styles.presetEndpoint}>{preset.endpoint}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </LinearGradient>
        </View>
      )}

      {/* Backend Editor Modal */}
      {showEditor && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(12, 12, 12, 0.95)', 'rgba(30, 30, 30, 0.95)']}
            style={[styles.modal, styles.editorModal]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBackend ? 'EDIT BACKEND' : 'NEW BACKEND'}
              </Text>
              <TouchableOpacity onPress={() => setShowEditor(false)}>
                <X size={20} color="#AAAAAA" />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={name}
                  onChangeText={setName}
                  placeholder="Backend name..."
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={styles.textInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Backend description..."
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Type</Text>
                <View style={styles.typeContainer}>
                  {(['openai', 'anthropic', 'local', 'custom'] as const).map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.typeButton, type === t && styles.typeButtonActive]}
                      onPress={() => setType(t)}
                    >
                      <Text style={[styles.typeText, type === t && styles.typeTextActive]}>
                        {t.toUpperCase()}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Endpoint URL</Text>
                <TextInput
                  style={styles.textInput}
                  value={endpoint}
                  onChangeText={setEndpoint}
                  placeholder="https://api.example.com/v1/chat/completions"
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>API Key (optional)</Text>
                {vaultAccessors?.isLocked && (
                  <Text style={styles.vaultWarning}>
                    Vault is locked - unlock to manage API keys
                  </Text>
                )}
                <TextInput
                  style={styles.textInput}
                  value={apiKey}
                  onChangeText={setApiKey}
                  placeholder="sk-..."
                  placeholderTextColor="#666666"
                  secureTextEntry
                  editable={!vaultAccessors?.isLocked}
                />
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Model</Text>
                  <TextInput
                    style={styles.textInput}
                    value={model}
                    onChangeText={setModel}
                    placeholder="gpt-4"
                    placeholderTextColor="#666666"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Auth Type</Text>
                  <View style={styles.authContainer}>
                    {(['bearer', 'api-key', 'none'] as const).map(auth => (
                      <TouchableOpacity
                        key={auth}
                        style={[styles.authButton, authType === auth && styles.authButtonActive]}
                        onPress={() => setAuthType(auth)}
                      >
                        <Text style={[styles.authText, authType === auth && styles.authTextActive]}>
                          {auth.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={styles.inputLabel}>Temperature</Text>
                  <TextInput
                    style={styles.textInput}
                    value={temperature}
                    onChangeText={setTemperature}
                    placeholder="0.8"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                </View>
                <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={styles.inputLabel}>Max Tokens</Text>
                  <TextInput
                    style={styles.textInput}
                    value={maxTokens}
                    onChangeText={setMaxTokens}
                    placeholder="150"
                    placeholderTextColor="#666666"
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowEditor(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>SAVE</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  presetButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FFB000',
    backgroundColor: 'rgba(255, 184, 0, 0.1)',
  },
  presetButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#FFB000',
    letterSpacing: 1,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#00FFF7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  addButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  activeBackendCard: {
    marginBottom: 16,
  },
  activeBackendGradient: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00FFF7',
  },
  activeBackendHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  activeBackendTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  activeBackendName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  activeBackendModel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#AAAAAA',
    marginBottom: 8,
  },
  activeBackendStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#00FFF7',
  },
  backendsList: {
    flex: 1,
  },
  backendCard: {
    marginBottom: 12,
  },
  backendGradient: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  backendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  backendInfo: {
    flex: 1,
    marginRight: 12,
  },
  backendTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  backendName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    letterSpacing: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  backendDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 8,
  },
  backendMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 1,
  },
  statusText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#FFB000',
    letterSpacing: 1,
  },
  backendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  activateButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
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
    maxHeight: '80%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF2EC0',
  },
  editorModal: {
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 46, 192, 0.3)',
  },
  modalTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  presetCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  presetName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  presetDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  presetEndpoint: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#00FFF7',
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
    paddingVertical: 8,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#666666',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  typeButtonActive: {
    borderColor: '#FF2EC0',
    backgroundColor: 'rgba(255, 46, 192, 0.2)',
  },
  typeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  typeTextActive: {
    color: '#FF2EC0',
  },
  authContainer: {
    flexDirection: 'row',
    gap: 4,
  },
  authButton: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#666666',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    alignItems: 'center',
  },
  authButtonActive: {
    borderColor: '#00FFF7',
    backgroundColor: 'rgba(0, 255, 247, 0.2)',
  },
  authText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 8,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  authTextActive: {
    color: '#00FFF7',
  },
  modalActions: {
    flexDirection: 'row',
    padding: 16,
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
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#00FFF7',
    borderRadius: 6,
  },
  saveButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  vaultWarning: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#FF0080',
    marginBottom: 4,
  },
});