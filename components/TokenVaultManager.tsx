import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Shield, Plus, Eye, EyeOff, Copy, RotateCcw, Trash2, Lock, Clock as Unlock, Download, Upload, Key, Clock, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { TokenVault, VaultToken, TOKEN_TEMPLATES } from '@/types/security';

interface TokenVaultManagerProps {
  vaults: TokenVault[];
  activeVault: TokenVault | null;
  isLocked: boolean;
  auditLogs: any[];
  onCreateVault: (name: string, description?: string) => void;
  onDeleteVault: (vaultId: string) => void;
  onUnlockVault: (vaultId: string, password: string) => Promise<boolean>;
  onLockVault: (vaultId: string) => void;
  onAddToken: (vaultId: string, token: Omit<VaultToken, 'id' | 'createdAt' | 'usageCount'>) => void;
  onUpdateToken: (vaultId: string, tokenId: string, updates: Partial<VaultToken>) => void;
  onDeleteToken: (vaultId: string, tokenId: string) => void;
  onGetToken: (vaultId: string, tokenId: string) => string | null;
  onRotateToken: (vaultId: string, tokenId: string, newValue: string) => void;
  onExportVault: (vaultId: string, includeTokens: boolean) => string;
}

export default function TokenVaultManager({
  vaults,
  activeVault,
  isLocked,
  auditLogs,
  onCreateVault,
  onDeleteVault,
  onUnlockVault,
  onLockVault,
  onAddToken,
  onUpdateToken,
  onDeleteToken,
  onGetToken,
  onRotateToken,
  onExportVault
}: TokenVaultManagerProps) {
  const [showCreateVault, setShowCreateVault] = useState(false);
  const [showAddToken, setShowAddToken] = useState(false);
  const [showUnlock, setShowUnlock] = useState(false);
  const [selectedVaultId, setSelectedVaultId] = useState<string>('');
  const [password, setPassword] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [revealedTokens, setRevealedTokens] = useState<Set<string>>(new Set());

  // Form state
  const [vaultName, setVaultName] = useState('');
  const [vaultDescription, setVaultDescription] = useState('');
  const [tokenName, setTokenName] = useState('');
  const [tokenType, setTokenType] = useState<VaultToken['type']>('discord-bot');
  const [tokenValue, setTokenValue] = useState('');
  const [tokenDescription, setTokenDescription] = useState('');

  const handleUnlock = async () => {
    if (!password.trim() || !selectedVaultId) return;

    setIsUnlocking(true);
    try {
      const success = await onUnlockVault(selectedVaultId, password);
      if (success) {
        setShowUnlock(false);
        setPassword('');
        setSelectedVaultId('');
      } else {
        Alert.alert('Unlock Failed', 'Invalid password or vault locked');
      }
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Unlock failed');
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleCreateVault = () => {
    if (!vaultName.trim()) {
      Alert.alert('Error', 'Vault name is required');
      return;
    }

    onCreateVault(vaultName.trim(), vaultDescription.trim() || undefined);
    setVaultName('');
    setVaultDescription('');
    setShowCreateVault(false);
  };

  const handleAddToken = () => {
    if (!tokenName.trim() || !tokenValue.trim() || !activeVault) {
      Alert.alert('Error', 'Token name and value are required');
      return;
    }

    const template = TOKEN_TEMPLATES.find(t => t.type === tokenType);
    
    onAddToken(activeVault.id, {
      name: tokenName.trim(),
      type: tokenType,
      value: tokenValue.trim(),
      description: tokenDescription.trim() || undefined,
      permissions: template?.permissions || [],
      metadata: {}
    });

    setTokenName('');
    setTokenValue('');
    setTokenDescription('');
    setShowAddToken(false);
  };

  const toggleTokenVisibility = (tokenId: string) => {
    setRevealedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenId)) {
        newSet.delete(tokenId);
      } else {
        newSet.add(tokenId);
      }
      return newSet;
    });
  };

  const copyToken = (vaultId: string, tokenId: string) => {
    const tokenValue = onGetToken(vaultId, tokenId);
    if (tokenValue) {
      // In a real app, this would copy to clipboard
      Alert.alert('Copied', 'Token copied to clipboard');
    }
  };

  const getTokenTypeColor = (type: VaultToken['type']) => {
    switch (type) {
      case 'discord-bot': return '#5865F2';
      case 'discord-user': return '#5865F2';
      case 'openai': return '#00A67E';
      case 'anthropic': return '#D97706';
      case 'custom': return '#6B7280';
      default: return '#666666';
    }
  };

  const maskToken = (token: string): string => {
    if (token.length <= 8) return '••••••••';
    return token.slice(0, 4) + '••••••••' + token.slice(-4);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>TOKEN VAULT</Text>
        <View style={styles.headerActions}>
          {activeVault && !isLocked && (
            <TouchableOpacity 
              style={styles.lockButton}
              onPress={() => onLockVault(activeVault.id)}
            >
              <Lock size={16} color="#FF0080" />
              <Text style={styles.lockButtonText}>LOCK</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowCreateVault(true)}
          >
            <Plus size={16} color="#0C0C0C" />
            <Text style={styles.addButtonText}>VAULT</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Vault Status */}
      {activeVault ? (
        <View style={styles.vaultStatusCard}>
          <LinearGradient
            colors={isLocked ? 
              ['rgba(255, 0, 128, 0.2)', 'rgba(255, 184, 0, 0.1)'] :
              ['rgba(0, 255, 247, 0.2)', 'rgba(0, 255, 0, 0.1)']
            }
            style={styles.vaultStatusGradient}
          >
            <View style={styles.vaultStatusHeader}>
              <View style={styles.vaultInfo}>
                <View style={styles.vaultTitleRow}>
                  {isLocked ? (
                    <Lock size={20} color="#FF0080" />
                  ) : (
                    <Unlock size={20} color="#00FF00" />
                  )}
                  <Text style={styles.vaultName}>{activeVault.name}</Text>
                </View>
                <Text style={styles.vaultStats}>
                  {activeVault.tokens.length} tokens • {activeVault.accessCount} accesses
                </Text>
              </View>
              <View style={[styles.statusIndicator, {
                backgroundColor: isLocked ? '#FF0080' : '#00FF00'
              }]}>
                <Text style={styles.statusText}>
                  {isLocked ? 'LOCKED' : 'UNLOCKED'}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>
      ) : (
        <View style={styles.noVaultCard}>
          <Shield size={32} color="#666666" />
          <Text style={styles.noVaultText}>No vault selected</Text>
          <Text style={styles.noVaultSubtext}>Create or unlock a vault to manage tokens</Text>
        </View>
      )}

      {/* Vault List */}
      {vaults.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>AVAILABLE VAULTS</Text>
          <ScrollView style={styles.vaultsList} showsVerticalScrollIndicator={false}>
            {vaults.map(vault => (
              <TouchableOpacity
                key={vault.id}
                style={[styles.vaultCard, activeVault?.id === vault.id && styles.activeVaultCard]}
                onPress={() => {
                  if (activeVault?.id !== vault.id) {
                    setSelectedVaultId(vault.id);
                    setShowUnlock(true);
                  }
                }}
              >
                <LinearGradient
                  colors={activeVault?.id === vault.id ? 
                    ['rgba(0, 255, 247, 0.1)', 'rgba(255, 46, 192, 0.05)'] :
                    ['rgba(30, 30, 30, 0.3)', 'rgba(12, 12, 12, 0.5)']
                  }
                  style={styles.vaultCardGradient}
                >
                  <View style={styles.vaultCardHeader}>
                    <View style={styles.vaultCardInfo}>
                      <Text style={styles.vaultCardName}>{vault.name}</Text>
                      <Text style={styles.vaultCardStats}>
                        {vault.tokens.length} tokens • Created {new Date(vault.createdAt).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.vaultCardActions}>
                      <TouchableOpacity 
                        style={styles.actionIcon}
                        onPress={() => {
                          try {
                            const data = onExportVault(vault.id, false);
                            Alert.alert('Export Ready', 'Vault exported (tokens redacted)');
                          } catch (error) {
                            Alert.alert('Export Error', 'Failed to export vault');
                          }
                        }}
                      >
                        <Download size={14} color="#00FFF7" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionIcon}
                        onPress={() => {
                          Alert.alert(
                            'Delete Vault',
                            `Delete "${vault.name}" and all its tokens?`,
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => onDeleteVault(vault.id) }
                            ]
                          );
                        }}
                      >
                        <Trash2 size={14} color="#FF0080" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Tokens List */}
      {activeVault && !isLocked && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>STORED TOKENS</Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddToken(true)}
            >
              <Plus size={16} color="#0C0C0C" />
              <Text style={styles.addButtonText}>TOKEN</Text>
            </TouchableOpacity>
          </View>

          {activeVault.tokens.length === 0 ? (
            <View style={styles.emptyTokens}>
              <Key size={32} color="#666666" />
              <Text style={styles.emptyText}>No tokens stored</Text>
              <Text style={styles.emptySubtext}>Add tokens to begin secure storage</Text>
            </View>
          ) : (
            <ScrollView style={styles.tokensList} showsVerticalScrollIndicator={false}>
              {activeVault.tokens.map(token => {
                const isRevealed = revealedTokens.has(token.id);
                const decryptedValue = isRevealed ? onGetToken(activeVault.id, token.id) : null;
                
                return (
                  <View key={token.id} style={styles.tokenCard}>
                    <LinearGradient
                      colors={['rgba(0, 255, 247, 0.1)', 'rgba(255, 46, 192, 0.05)']}
                      style={styles.tokenGradient}
                    >
                      <View style={styles.tokenHeader}>
                        <View style={styles.tokenInfo}>
                          <View style={styles.tokenTitleRow}>
                            <View style={[styles.tokenTypeBadge, {
                              backgroundColor: getTokenTypeColor(token.type)
                            }]}>
                              <Text style={styles.tokenTypeBadgeText}>
                                {token.type.split('-')[0].toUpperCase()}
                              </Text>
                            </View>
                            <Text style={styles.tokenName}>{token.name}</Text>
                          </View>
                          {token.description && (
                            <Text style={styles.tokenDescription}>{token.description}</Text>
                          )}
                          <View style={styles.tokenMeta}>
                            <Text style={styles.tokenMetaText}>
                              Used {token.usageCount} times
                            </Text>
                            {token.lastUsed && (
                              <Text style={styles.tokenMetaText}>
                                Last: {new Date(token.lastUsed).toLocaleDateString()}
                              </Text>
                            )}
                          </View>
                        </View>
                        <View style={styles.tokenActions}>
                          <TouchableOpacity 
                            style={styles.actionIcon}
                            onPress={() => toggleTokenVisibility(token.id)}
                          >
                            {isRevealed ? (
                              <EyeOff size={14} color="#FFB000" />
                            ) : (
                              <Eye size={14} color="#00FFF7" />
                            )}
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.actionIcon}
                            onPress={() => copyToken(activeVault.id, token.id)}
                          >
                            <Copy size={14} color="#00FFF7" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.actionIcon}
                            onPress={() => {
                              Alert.prompt(
                                'Rotate Token',
                                'Enter new token value:',
                                (newValue) => {
                                  if (newValue?.trim()) {
                                    onRotateToken(activeVault.id, token.id, newValue.trim());
                                  }
                                },
                                'secure-text'
                              );
                            }}
                          >
                            <RotateCcw size={14} color="#FFB000" />
                          </TouchableOpacity>
                          <TouchableOpacity 
                            style={styles.actionIcon}
                            onPress={() => {
                              Alert.alert(
                                'Delete Token',
                                `Delete "${token.name}"?`,
                                [
                                  { text: 'Cancel', style: 'cancel' },
                                  { text: 'Delete', style: 'destructive', onPress: () => onDeleteToken(activeVault.id, token.id) }
                                ]
                              );
                            }}
                          >
                            <Trash2 size={14} color="#FF0080" />
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Token Value Display */}
                      <View style={styles.tokenValueContainer}>
                        <Text style={styles.tokenValueLabel}>TOKEN VALUE:</Text>
                        <View style={styles.tokenValueBox}>
                          <Text style={styles.tokenValue}>
                            {isRevealed && decryptedValue ? decryptedValue : maskToken(token.value)}
                          </Text>
                        </View>
                      </View>

                      {/* Permissions */}
                      {token.permissions.length > 0 && (
                        <View style={styles.permissionsContainer}>
                          <Text style={styles.permissionsLabel}>PERMISSIONS:</Text>
                          <View style={styles.permissionsList}>
                            {token.permissions.map(permission => (
                              <View key={permission} style={styles.permissionBadge}>
                                <Text style={styles.permissionText}>{permission}</Text>
                              </View>
                            ))}
                          </View>
                        </View>
                      )}
                    </LinearGradient>
                  </View>
                );
              })}
            </ScrollView>
          )}
        </View>
      )}

      {/* Recent Audit Logs */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>SECURITY AUDIT</Text>
        <ScrollView style={styles.auditList} showsVerticalScrollIndicator={false}>
          {auditLogs.slice(0, 5).map(log => (
            <View key={log.id} style={styles.auditEntry}>
              <View style={styles.auditHeader}>
                <View style={styles.auditInfo}>
                  <Text style={[styles.auditAction, {
                    color: log.severity === 'critical' ? '#FF0080' : 
                          log.severity === 'high' ? '#FFB000' : '#00FFF7'
                  }]}>
                    {log.action.toUpperCase()}
                  </Text>
                  <Text style={styles.auditTime}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                <View style={[styles.severityDot, {
                  backgroundColor: log.severity === 'critical' ? '#FF0080' : 
                                 log.severity === 'high' ? '#FFB000' : 
                                 log.severity === 'medium' ? '#00FFF7' : '#666666'
                }]} />
              </View>
              <Text style={styles.auditDetails}>{log.details}</Text>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* Create Vault Modal */}
      {showCreateVault && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(12, 12, 12, 0.95)', 'rgba(30, 30, 30, 0.95)']}
            style={styles.modal}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CREATE VAULT</Text>
              <TouchableOpacity onPress={() => setShowCreateVault(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Vault Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={vaultName}
                  onChangeText={setVaultName}
                  placeholder="Enter vault name..."
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={vaultDescription}
                  onChangeText={setVaultDescription}
                  placeholder="Vault description..."
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowCreateVault(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateVault}
              >
                <Shield size={16} color="#0C0C0C" />
                <Text style={styles.createButtonText}>CREATE</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Unlock Vault Modal */}
      {showUnlock && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(12, 12, 12, 0.95)', 'rgba(30, 30, 30, 0.95)']}
            style={styles.modal}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>UNLOCK VAULT</Text>
              <TouchableOpacity onPress={() => setShowUnlock(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Master Password</Text>
                <TextInput
                  style={styles.textInput}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter vault password..."
                  placeholderTextColor="#666666"
                  secureTextEntry
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowUnlock(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.unlockButton, isUnlocking && styles.unlockButtonDisabled]}
                onPress={handleUnlock}
                disabled={isUnlocking}
              >
                <Unlock size={16} color="#0C0C0C" />
                <Text style={styles.unlockButtonText}>
                  {isUnlocking ? 'UNLOCKING...' : 'UNLOCK'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Add Token Modal */}
      {showAddToken && activeVault && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(12, 12, 12, 0.95)', 'rgba(30, 30, 30, 0.95)']}
            style={styles.modal}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>ADD TOKEN</Text>
              <TouchableOpacity onPress={() => setShowAddToken(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Token Name</Text>
                <TextInput
                  style={styles.textInput}
                  value={tokenName}
                  onChangeText={setTokenName}
                  placeholder="Enter token name..."
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Token Type</Text>
                <View style={styles.typeContainer}>
                  {TOKEN_TEMPLATES.map(template => (
                    <TouchableOpacity
                      key={template.type}
                      style={[styles.typeButton, tokenType === template.type && styles.typeButtonActive]}
                      onPress={() => setTokenType(template.type)}
                    >
                      <Text style={[styles.typeText, tokenType === template.type && styles.typeTextActive]}>
                        {template.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Token Value</Text>
                <TextInput
                  style={styles.textInput}
                  value={tokenValue}
                  onChangeText={setTokenValue}
                  placeholder={TOKEN_TEMPLATES.find(t => t.type === tokenType)?.placeholder || 'Enter token...'}
                  placeholderTextColor="#666666"
                  secureTextEntry
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (optional)</Text>
                <TextInput
                  style={styles.textInput}
                  value={tokenDescription}
                  onChangeText={setTokenDescription}
                  placeholder="Token description..."
                  placeholderTextColor="#666666"
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowAddToken(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.addTokenButton}
                onPress={handleAddToken}
              >
                <Key size={16} color="#0C0C0C" />
                <Text style={styles.addTokenButtonText}>ADD TOKEN</Text>
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
  lockButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 128, 0.2)',
    borderWidth: 1,
    borderColor: '#FF0080',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  lockButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#FF0080',
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
  vaultStatusCard: {
    marginBottom: 16,
  },
  vaultStatusGradient: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#00FFF7',
  },
  vaultStatusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaultInfo: {
    flex: 1,
  },
  vaultTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  vaultName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  vaultStats: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  noVaultCard: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
    marginBottom: 16,
  },
  noVaultText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#AAAAAA',
  },
  noVaultSubtext: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#666666',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FFB000',
    letterSpacing: 2,
  },
  vaultsList: {
    maxHeight: 200,
  },
  vaultCard: {
    marginBottom: 8,
  },
  activeVaultCard: {
    borderWidth: 1,
    borderColor: '#00FFF7',
  },
  vaultCardGradient: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  vaultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vaultCardInfo: {
    flex: 1,
  },
  vaultCardName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  vaultCardStats: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#AAAAAA',
  },
  vaultCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  emptyTokens: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#AAAAAA',
  },
  emptySubtext: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#666666',
  },
  tokensList: {
    maxHeight: 300,
  },
  tokenCard: {
    marginBottom: 12,
  },
  tokenGradient: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  tokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  tokenInfo: {
    flex: 1,
    marginRight: 12,
  },
  tokenTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  tokenTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tokenTypeBadgeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 8,
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tokenName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#FFFFFF',
  },
  tokenDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  tokenMeta: {
    flexDirection: 'row',
    gap: 12,
  },
  tokenMetaText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#666666',
  },
  tokenActions: {
    flexDirection: 'row',
    gap: 8,
  },
  tokenValueContainer: {
    marginBottom: 12,
  },
  tokenValueLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#FFB000',
    letterSpacing: 1,
    marginBottom: 4,
  },
  tokenValueBox: {
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 4,
    padding: 8,
  },
  tokenValue: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#FFFFFF',
  },
  permissionsContainer: {
    marginTop: 8,
  },
  permissionsLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#00FFF7',
    letterSpacing: 1,
    marginBottom: 4,
  },
  permissionsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  permissionBadge: {
    backgroundColor: 'rgba(0, 255, 247, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  permissionText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 8,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  auditList: {
    maxHeight: 200,
  },
  auditEntry: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.2)',
    borderRadius: 6,
    padding: 12,
    marginBottom: 8,
  },
  auditHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  auditInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  auditAction: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  auditTime: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#666666',
  },
  severityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  auditDetails: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
    lineHeight: 15,
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
  closeButton: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#AAAAAA',
  },
  modalContent: {
    padding: 16,
    flex: 1,
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
  typeContainer: {
    gap: 8,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#666666',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
  },
  typeButtonActive: {
    borderColor: '#00FFF7',
    backgroundColor: 'rgba(0, 255, 247, 0.2)',
  },
  typeText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  typeTextActive: {
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
  createButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  createButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  unlockButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FF00',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  unlockButtonDisabled: {
    backgroundColor: '#666666',
  },
  unlockButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  addTokenButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  addTokenButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
});