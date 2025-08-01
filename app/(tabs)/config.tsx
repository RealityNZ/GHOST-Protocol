import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Settings, Plus, CreditCard as Edit3, Brain, Zap, Code, Trash2, Play, Upload, Download } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import BackgroundEffects from '@/components/BackgroundEffects';
import PluginEditor from '@/components/PluginEditor';
import { usePluginLoader } from '@/hooks/usePluginLoader';
import { useAIBackends } from '@/hooks/useAIBackends';
import { useOfflineMode } from '@/hooks/useOfflineMode';
import { useTokenVault } from '@/hooks/useTokenVault';
import TokenVaultManager from '@/components/TokenVaultManager';

export default function ConfigScreen() {
  const [showPluginEditor, setShowPluginEditor] = useState(false);
  const [editingPlugin, setEditingPlugin] = useState<any>(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importData, setImportData] = useState('');
  
  const { 
    plugins, 
    addPlugin, 
    updatePlugin, 
    deletePlugin, 
    testPlugin 
  } = usePluginLoader();
  
  const {
    backends,
    activeBackend,
    isTesting,
    addBackend,
    updateBackend,
    deleteBackend,
    setActiveBackend,
    testBackend,
    loadPreset,
    setVaultAccessors
  } = useAIBackends();

  const {
    archives,
    sessions,
    importArchive,
    deleteArchive,
    createSession
  } = useOfflineMode();
  
  const {
    vaults,
    activeVault,
    isLocked,
    auditLogs,
    createVault,
    deleteVault,
    unlockVault,
    lockVault,
    addToken,
    updateToken,
    deleteToken,
    getToken,
    rotateToken,
    exportVault
  } = useTokenVault();
  
  // Provide vault accessors to AI backends
  useEffect(() => {
    setVaultAccessors({
      getToken,
      activeVaultId: activeVault?.id || null,
      isLocked
    });
  }, [getToken, activeVault?.id, isLocked, setVaultAccessors]);

  const glitchOpacity = useSharedValue(1);

  useEffect(() => {
    glitchOpacity.value = withRepeat(
      withTiming(0.95, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const glitchStyle = useAnimatedStyle(() => ({
    opacity: glitchOpacity.value,
  }));

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'preprocessor': return '#00FFF7';
      case 'llm-swapper': return '#FF2EC0';
      case 'response-filter': return '#FFB000';
      case 'custom': return '#AAAAAA';
      default: return '#666666';
    }
  };

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      <BackgroundEffects variant="neural" intensity="subtle" />
      
      {/* Header */}
      <Animated.View style={[styles.header, glitchStyle]}>
        <Settings size={24} color="#FFB000" />
        <Text style={styles.headerTitle}>NEURAL CONFIG</Text>
        <Zap size={24} color="#00FFF7" />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* AI & Triggers Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AI CONTROL</Text>
          
          {/* Active Backend Status */}
          {activeBackend && (
            <View style={styles.statusCard}>
              <LinearGradient
                colors={['rgba(0, 255, 247, 0.2)', 'rgba(255, 46, 192, 0.1)']}
                style={styles.statusGradient}
              >
                <View style={styles.statusHeader}>
                  <Brain size={20} color="#00FFF7" />
                  <Text style={styles.statusTitle}>ACTIVE BACKEND</Text>
                </View>
                <Text style={styles.backendName}>{activeBackend.name}</Text>
                <Text style={styles.backendModel}>Model: {activeBackend.config.model}</Text>
              </LinearGradient>
            </View>
          )}

          {/* Quick Triggers */}
          <View style={styles.subsection}>
            <View style={styles.subsectionHeader}>
              <Text style={styles.subsectionTitle}>TRIGGERS</Text>
              <TouchableOpacity style={styles.miniButton}>
                <Plus size={12} color="#0C0C0C" />
              </TouchableOpacity>
            </View>

            <View style={styles.triggerRow}>
              <View style={styles.triggerItem}>
                <Text style={styles.triggerType}>MENTION</Text>
                <Text style={styles.triggerValue}>@ghost_user</Text>
                <Switch
                  value={true}
                  trackColor={{ false: '#404040', true: '#FF2EC0' }}
                  thumbColor="#00FFF7"
                  style={styles.miniSwitch}
                />
              </View>
              <View style={styles.triggerItem}>
                <Text style={styles.triggerType}>KEYWORD</Text>
                <Text style={styles.triggerValue}>neural</Text>
                <Switch
                  value={false}
                  trackColor={{ false: '#404040', true: '#FF2EC0' }}
                  thumbColor="#666666"
                  style={styles.miniSwitch}
                />
              </View>
            </View>
          </View>

          {/* Active Persona */}
          <View style={styles.subsection}>
            <View style={styles.subsectionHeader}>
              <Text style={styles.subsectionTitle}>PERSONA</Text>
              <TouchableOpacity style={styles.miniButton}>
                <Edit3 size={12} color="#0C0C0C" />
              </TouchableOpacity>
            </View>

            <View style={styles.personaCard}>
              <View style={styles.personaInfo}>
                <Text style={styles.personaName}>Digital Ghost</Text>
                <Text style={styles.personaDescription}>
                  Burned-out hacker from 2077 • Deadpan noir style
                </Text>
              </View>
              <View style={styles.activeIndicator}>
                <Text style={styles.activeText}>ACTIVE</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Plugins Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>PLUGIN SYSTEM</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => {
                setEditingPlugin(null);
                setShowPluginEditor(true);
              }}
            >
              <Plus size={16} color="#0C0C0C" />
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>

          {plugins.slice(0, 3).map(plugin => (
            <View key={plugin.id} style={styles.pluginCard}>
              <LinearGradient
                colors={plugin.enabled ? 
                  ['rgba(0, 255, 247, 0.1)', 'rgba(255, 46, 192, 0.05)'] :
                  ['rgba(30, 30, 30, 0.3)', 'rgba(12, 12, 12, 0.5)']
                }
                style={styles.pluginGradient}
              >
                <View style={styles.pluginHeader}>
                  <View style={styles.pluginInfo}>
                    <View style={styles.pluginTitleRow}>
                      <Code size={14} color={plugin.enabled ? '#00FFF7' : '#666666'} />
                      <Text style={[styles.pluginName, { 
                        color: plugin.enabled ? '#FFFFFF' : '#AAAAAA' 
                      }]}>
                        {plugin.name}
                      </Text>
                      <View style={[styles.categoryBadge, { 
                        backgroundColor: getCategoryColor(plugin.category) 
                      }]}>
                        <Text style={styles.categoryBadgeText}>
                          {plugin.category.split('-')[0].toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <Text style={[styles.pluginDescription, { 
                      color: plugin.enabled ? '#AAAAAA' : '#666666' 
                    }]}>
                      {plugin.description}
                    </Text>
                  </View>
                  <View style={styles.pluginActions}>
                    <TouchableOpacity 
                      style={styles.actionIcon}
                      onPress={() => {
                        setEditingPlugin(plugin);
                        setShowPluginEditor(true);
                      }}
                    >
                      <Edit3 size={12} color="#FFB000" />
                    </TouchableOpacity>
                    <Switch
                      value={plugin.enabled}
                      onValueChange={(enabled) => updatePlugin(plugin.id, { enabled })}
                      trackColor={{ false: '#404040', true: '#FF2EC0' }}
                      thumbColor={plugin.enabled ? '#00FFF7' : '#666666'}
                      style={styles.miniSwitch}
                    />
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}

          {plugins.length > 3 && (
            <TouchableOpacity style={styles.showMoreButton}>
              <Text style={styles.showMoreText}>
                +{plugins.length - 3} MORE PLUGINS
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* AI Backends Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>AI BACKENDS</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={16} color="#0C0C0C" />
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>

          {backends.slice(0, 2).map(backend => (
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
                    <Text style={[styles.backendName, { 
                      color: backend.enabled ? '#FFFFFF' : '#AAAAAA' 
                    }]}>
                      {backend.name}
                    </Text>
                    {backend.config.authType !== 'none' && !backend.config.tokenId && (
                      <Text style={styles.noTokenWarning}>
                        No API key configured
                      </Text>
                    )}
                    <Text style={styles.backendMeta}>
                      {backend.type.toUpperCase()} • {backend.config.model}
                    </Text>
                  </View>
                  <View style={styles.backendActions}>
                    <TouchableOpacity 
                      style={styles.actionIcon}
                      onPress={() => testBackend(backend.id)}
                      disabled={isTesting}
                    >
                      <Play size={12} color="#00FFF7" />
                    </TouchableOpacity>
                    <View style={[styles.activeDot, {
                      backgroundColor: backend.id === activeBackend?.id ? '#00FF00' : '#666666'
                    }]} />
                  </View>
                </View>
              </LinearGradient>
            </View>
          ))}
        </View>

        {/* Offline Archives Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>OFFLINE ARCHIVES</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowImportModal(true)}
            >
              <Upload size={16} color="#0C0C0C" />
              <Text style={styles.addButtonText}>IMPORT</Text>
            </TouchableOpacity>
          </View>

          {archives.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No archives imported</Text>
              <Text style={styles.emptySubtext}>Import Discord exports for offline replay</Text>
            </View>
          ) : (
            <>
              {archives.slice(0, 2).map(archive => (
                <View key={archive.id} style={styles.archiveCard}>
                  <LinearGradient
                    colors={['rgba(255, 184, 0, 0.1)', 'rgba(0, 255, 247, 0.05)']}
                    style={styles.archiveGradient}
                  >
                    <View style={styles.archiveInfo}>
                      <Text style={styles.archiveName}>{archive.name}</Text>
                      <Text style={styles.archiveStats}>
                        {archive.messageCount} messages • {archive.channels.length} channels
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.actionIcon}>
                      <Play size={12} color="#FFB000" />
                    </TouchableOpacity>
                  </LinearGradient>
                </View>
              ))}
              
              <View style={styles.sessionStats}>
                <Text style={styles.sessionStatsText}>
                  {sessions.length} replay sessions created
                </Text>
              </View>
            </>
          )}
        </View>

        {/* Behavior Modifiers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>BEHAVIOR MODIFIERS</Text>
            <TouchableOpacity style={styles.addButton}>
              <Plus size={16} color="#0C0C0C" />
              <Text style={styles.addButtonText}>ADD</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.modifierGrid}>
            <View style={styles.modifierItem}>
              <Text style={styles.modifierName}>Noir Deadpan</Text>
              <Switch
                value={true}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor="#00FFF7"
                style={styles.miniSwitch}
              />
            </View>
            <View style={styles.modifierItem}>
              <Text style={styles.modifierName}>Cynical</Text>
              <Switch
                value={true}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor="#00FFF7"
                style={styles.miniSwitch}
              />
            </View>
            <View style={styles.modifierItem}>
              <Text style={styles.modifierName}>Cryptic</Text>
              <Switch
                value={false}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor="#666666"
                style={styles.miniSwitch}
              />
            </View>
            <View style={styles.modifierItem}>
              <Text style={styles.modifierName}>Verbose</Text>
              <Switch
                value={false}
                trackColor={{ false: '#404040', true: '#FF2EC0' }}
                thumbColor="#666666"
                style={styles.miniSwitch}
              />
            </View>
          </View>
        </View>

        {/* System Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SYSTEM STATUS</Text>
          
          <View style={styles.statusGrid}>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>PLUGINS</Text>
              <Text style={styles.statusValue}>{plugins.filter(p => p.enabled).length} ACTIVE</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>BACKENDS</Text>
              <Text style={styles.statusValue}>{backends.filter(b => b.enabled).length} READY</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>ARCHIVES</Text>
              <Text style={styles.statusValue}>{archives.length} LOADED</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>SESSIONS</Text>
              <Text style={styles.statusValue}>{sessions.length} CREATED</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>VAULTS</Text>
              <Text style={styles.statusValue}>{vaults.length} SECURED</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={styles.statusLabel}>TOKENS</Text>
              <Text style={styles.statusValue}>
                {vaults.reduce((total, vault) => total + vault.tokens.length, 0)} STORED
              </Text>
            </View>
          </View>
        </View>

        {/* Token Vault Section */}
        <View style={styles.section}>
          <TokenVaultManager
            vaults={vaults}
            activeVault={activeVault}
            isLocked={isLocked}
            auditLogs={auditLogs}
            onCreateVault={createVault}
            onDeleteVault={deleteVault}
            onUnlockVault={unlockVault}
            onLockVault={lockVault}
            onAddToken={addToken}
            onUpdateToken={updateToken}
            onDeleteToken={deleteToken}
            onGetToken={getToken}
            onRotateToken={rotateToken}
            onExportVault={exportVault}
          />
        </View>
      </ScrollView>

      {/* Plugin Editor Modal */}
      {showPluginEditor && (
        <PluginEditor
          plugin={editingPlugin}
          onSave={(pluginData) => {
            if (editingPlugin) {
              updatePlugin(editingPlugin.id, pluginData);
            } else {
              addPlugin(pluginData);
            }
            setShowPluginEditor(false);
            setEditingPlugin(null);
          }}
          onClose={() => {
            setShowPluginEditor(false);
            setEditingPlugin(null);
          }}
          onTest={testPlugin}
        />
      )}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FF2EC0',
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFB000',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  section: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
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
  statusCard: {
    marginBottom: 16,
  },
  statusGradient: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00FFF7',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  backendName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  backendModel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#AAAAAA',
  },
  subsection: {
    marginBottom: 16,
  },
  subsectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  subsectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#FFB000',
    letterSpacing: 2,
  },
  miniButton: {
    backgroundColor: '#FFB000',
    padding: 4,
    borderRadius: 3,
  },
  triggerRow: {
    flexDirection: 'row',
    gap: 8,
  },
  triggerItem: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  triggerType: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#00FFF7',
    letterSpacing: 1,
    marginBottom: 4,
  },
  triggerValue: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  miniSwitch: {
    transform: [{ scaleX: 0.7 }, { scaleY: 0.7 }],
  },
  personaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 46, 192, 0.1)',
    borderWidth: 1,
    borderColor: '#FF2EC0',
    borderRadius: 6,
    padding: 12,
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  personaDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
    lineHeight: 15,
  },
  activeIndicator: {
    backgroundColor: '#00FF00',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 8,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  pluginCard: {
    marginBottom: 8,
  },
  pluginGradient: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  pluginHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pluginInfo: {
    flex: 1,
    marginRight: 12,
  },
  pluginTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 6,
  },
  pluginName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    letterSpacing: 1,
  },
  categoryBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryBadgeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 7,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  pluginDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    lineHeight: 14,
  },
  pluginActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  showMoreButton: {
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    borderStyle: 'dashed',
  },
  showMoreText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 1,
  },
  backendCard: {
    marginBottom: 8,
  },
  backendGradient: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  backendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backendInfo: {
    flex: 1,
  },
  backendName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    letterSpacing: 1,
    marginBottom: 2,
  },
  backendMeta: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#666666',
    letterSpacing: 1,
  },
  backendActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  archiveCard: {
    marginBottom: 8,
  },
  archiveGradient: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 0, 0.3)',
  },
  archiveInfo: {
    flex: 1,
  },
  archiveName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  archiveStats: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#AAAAAA',
  },
  sessionStats: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  sessionStatsText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#666666',
    letterSpacing: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
    gap: 4,
  },
  emptyText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#AAAAAA',
  },
  emptySubtext: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#666666',
  },
  modifierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  modifierItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  modifierName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#FFFFFF',
    letterSpacing: 1,
    marginBottom: 6,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statusItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
  },
  statusLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#AAAAAA',
    letterSpacing: 1,
    marginBottom: 4,
  },
  statusValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  noTokenWarning: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#FF0080',
    marginBottom: 2,
  },
});