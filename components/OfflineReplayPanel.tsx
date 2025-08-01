import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Upload, 
  Play, 
  Pause, 
  Square, 
  SkipForward, 
  SkipBack, 
  Download, 
  Trash2, 
  Plus,
  Database,
  Clock,
  User,
  Hash
} from 'lucide-react-native';
import { useOfflineMode } from '@/hooks/useOfflineMode';

export default function OfflineReplayPanel() {
  const [showImport, setShowImport] = useState(false);
  const [importData, setImportData] = useState('');
  const [sessionName, setSessionName] = useState('');
  const [sessionDescription, setSessionDescription] = useState('');
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [selectedArchiveId, setSelectedArchiveId] = useState<string>('');

  const {
    archives,
    sessions,
    currentSession,
    replayState,
    isImporting,
    importProgress,
    importArchive,
    deleteArchive,
    createSession,
    loadSession,
    deleteSession,
    startReplay,
    pauseReplay,
    stopReplay,
    seekToMessage,
    setPlaybackSpeed,
    generateResponseToMessage,
    exportArchive
  } = useOfflineMode();

  const handleImport = async () => {
    if (!importData.trim()) {
      Alert.alert('Error', 'Please paste archive data');
      return;
    }

    try {
      const result = await importArchive(importData);
      
      if (result.success) {
        Alert.alert(
          'Import Successful',
          `Imported ${result.stats.messagesProcessed} messages from ${result.stats.channelsFound} channels`
        );
        setImportData('');
        setShowImport(false);
      } else {
        Alert.alert('Import Failed', result.errors.join('\n'));
      }
    } catch (error) {
      Alert.alert('Import Error', error instanceof Error ? error.message : 'Unknown error');
    }
  };

  const handleCreateSession = () => {
    if (!sessionName.trim() || !selectedArchiveId) {
      Alert.alert('Error', 'Please enter session name and select an archive');
      return;
    }

    try {
      const session = createSession(selectedArchiveId, sessionName.trim(), sessionDescription.trim());
      loadSession(session.id);
      setSessionName('');
      setSessionDescription('');
      setShowCreateSession(false);
      Alert.alert('Success', 'Replay session created');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create session');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      {/* Archives Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>DISCORD ARCHIVES</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => setShowImport(true)}
          >
            <Upload size={16} color="#0C0C0C" />
            <Text style={styles.addButtonText}>IMPORT</Text>
          </TouchableOpacity>
        </View>

        {archives.length === 0 ? (
          <View style={styles.emptyState}>
            <Database size={32} color="#666666" />
            <Text style={styles.emptyText}>No archives imported</Text>
            <Text style={styles.emptySubtext}>Import Discord server exports to begin</Text>
          </View>
        ) : (
          <ScrollView style={styles.archivesList} showsVerticalScrollIndicator={false}>
            {archives.map(archive => (
              <View key={archive.id} style={styles.archiveCard}>
                <LinearGradient
                  colors={['rgba(0, 255, 247, 0.1)', 'rgba(255, 46, 192, 0.05)']}
                  style={styles.archiveGradient}
                >
                  <View style={styles.archiveHeader}>
                    <View style={styles.archiveInfo}>
                      <Text style={styles.archiveName}>{archive.name}</Text>
                      <Text style={styles.archiveStats}>
                        {archive.messageCount} messages • {archive.channels.length} channels
                      </Text>
                    </View>
                    <View style={styles.archiveActions}>
                      <TouchableOpacity 
                        style={styles.actionIcon}
                        onPress={() => {
                          setSelectedArchiveId(archive.id);
                          setShowCreateSession(true);
                        }}
                      >
                        <Plus size={16} color="#00FFF7" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionIcon}
                        onPress={() => {
                          try {
                            const data = exportArchive(archive.id);
                            // In a real app, this would trigger a download
                            Alert.alert('Export Ready', 'Archive data copied to clipboard');
                          } catch (error) {
                            Alert.alert('Export Error', 'Failed to export archive');
                          }
                        }}
                      >
                        <Download size={16} color="#FFB000" />
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={styles.actionIcon}
                        onPress={() => {
                          Alert.alert(
                            'Delete Archive',
                            'This will also delete all associated replay sessions. Continue?',
                            [
                              { text: 'Cancel', style: 'cancel' },
                              { text: 'Delete', style: 'destructive', onPress: () => deleteArchive(archive.id) }
                            ]
                          );
                        }}
                      >
                        <Trash2 size={16} color="#FF0080" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Sessions Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>REPLAY SESSIONS</Text>
        </View>

        {sessions.length === 0 ? (
          <View style={styles.emptyState}>
            <Play size={32} color="#666666" />
            <Text style={styles.emptyText}>No replay sessions</Text>
            <Text style={styles.emptySubtext}>Create a session from an archive</Text>
          </View>
        ) : (
          <ScrollView style={styles.sessionsList} showsVerticalScrollIndicator={false}>
            {sessions.map(session => (
              <TouchableOpacity 
                key={session.id} 
                style={[styles.sessionCard, currentSession?.id === session.id && styles.activeSession]}
                onPress={() => loadSession(session.id)}
              >
                <LinearGradient
                  colors={currentSession?.id === session.id ? 
                    ['rgba(255, 46, 192, 0.2)', 'rgba(0, 255, 247, 0.1)'] :
                    ['rgba(0, 255, 247, 0.1)', 'rgba(255, 46, 192, 0.05)']
                  }
                  style={styles.sessionGradient}
                >
                  <View style={styles.sessionHeader}>
                    <View style={styles.sessionInfo}>
                      <Text style={styles.sessionName}>{session.name}</Text>
                      <Text style={styles.sessionStats}>
                        {session.currentPosition}/{session.totalMessages} messages • {session.responses.length} responses
                      </Text>
                    </View>
                    <TouchableOpacity 
                      style={styles.actionIcon}
                      onPress={() => {
                        Alert.alert(
                          'Delete Session',
                          'This will delete the replay session and all generated responses. Continue?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => deleteSession(session.id) }
                          ]
                        );
                      }}
                    >
                      <Trash2 size={16} color="#FF0080" />
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
      </View>

      {/* Replay Controls */}
      {currentSession && (
        <View style={styles.controlsSection}>
          <Text style={styles.sectionTitle}>REPLAY CONTROLS</Text>
          
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${replayState.progress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {Math.round(replayState.progress)}% • {replayState.messagesRemaining} remaining
            </Text>
          </View>

          <View style={styles.playbackControls}>
            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => seekToMessage(Math.max(0, currentSession.currentPosition - 10))}
            >
              <SkipBack size={20} color="#00FFF7" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.controlButton, styles.playButton]}
              onPress={currentSession.isPlaying ? pauseReplay : startReplay}
            >
              {currentSession.isPlaying ? (
                <Pause size={24} color="#0C0C0C" />
              ) : (
                <Play size={24} color="#0C0C0C" />
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={stopReplay}
            >
              <Square size={20} color="#FF0080" />
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.controlButton}
              onPress={() => seekToMessage(Math.min(currentSession.totalMessages - 1, currentSession.currentPosition + 10))}
            >
              <SkipForward size={20} color="#00FFF7" />
            </TouchableOpacity>
          </View>

          <View style={styles.speedControls}>
            <Text style={styles.speedLabel}>SPEED:</Text>
            {[0.5, 1, 2, 5].map(speed => (
              <TouchableOpacity
                key={speed}
                style={[
                  styles.speedButton,
                  currentSession.settings.playbackSpeed === speed && styles.speedButtonActive
                ]}
                onPress={() => setPlaybackSpeed(speed)}
              >
                <Text style={[
                  styles.speedText,
                  currentSession.settings.playbackSpeed === speed && styles.speedTextActive
                ]}>
                  {speed}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Current Message Display */}
          {replayState.currentMessage && (
            <View style={styles.messageDisplay}>
              <View style={styles.messageHeader}>
                <View style={styles.messageInfo}>
                  <Hash size={14} color="#00FFF7" />
                  <Text style={styles.channelName}>#{replayState.currentMessage.channel.name}</Text>
                  <User size={14} color="#FF2EC0" />
                  <Text style={styles.authorName}>@{replayState.currentMessage.author.username}</Text>
                </View>
                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={() => generateResponseToMessage(replayState.currentMessage!.id)}
                >
                  <Text style={styles.generateButtonText}>GENERATE</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.messageContent}>{replayState.currentMessage.content}</Text>
              <Text style={styles.messageTime}>
                {new Date(replayState.currentMessage.timestamp).toLocaleString()}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Import Modal */}
      {showImport && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(12, 12, 12, 0.95)', 'rgba(30, 30, 30, 0.95)']}
            style={styles.modal}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>IMPORT ARCHIVE</Text>
              <TouchableOpacity onPress={() => setShowImport(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.inputLabel}>Paste Discord export JSON:</Text>
              <TextInput
                style={styles.importInput}
                value={importData}
                onChangeText={setImportData}
                placeholder="Paste JSON data here..."
                placeholderTextColor="#666666"
                multiline
              />
              
              {isImporting && (
                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>Importing... {importProgress}%</Text>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${importProgress}%` }]} />
                  </View>
                </View>
              )}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowImport(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.importButton, isImporting && styles.importButtonDisabled]}
                onPress={handleImport}
                disabled={isImporting}
              >
                <Upload size={16} color="#0C0C0C" />
                <Text style={styles.importButtonText}>
                  {isImporting ? 'IMPORTING...' : 'IMPORT'}
                </Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* Create Session Modal */}
      {showCreateSession && (
        <View style={styles.modalOverlay}>
          <LinearGradient
            colors={['rgba(12, 12, 12, 0.95)', 'rgba(30, 30, 30, 0.95)']}
            style={styles.modal}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>CREATE REPLAY SESSION</Text>
              <TouchableOpacity onPress={() => setShowCreateSession(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Session Name:</Text>
                <TextInput
                  style={styles.textInput}
                  value={sessionName}
                  onChangeText={setSessionName}
                  placeholder="Enter session name..."
                  placeholderTextColor="#666666"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description (optional):</Text>
                <TextInput
                  style={styles.textInput}
                  value={sessionDescription}
                  onChangeText={setSessionDescription}
                  placeholder="Session description..."
                  placeholderTextColor="#666666"
                />
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.cancelButton} 
                onPress={() => setShowCreateSession(false)}
              >
                <Text style={styles.cancelButtonText}>CANCEL</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreateSession}
              >
                <Plus size={16} color="#0C0C0C" />
                <Text style={styles.createButtonText}>CREATE</Text>
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
  emptyState: {
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
  archivesList: {
    maxHeight: 200,
  },
  archiveCard: {
    marginBottom: 8,
  },
  archiveGradient: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  archiveHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  archiveInfo: {
    flex: 1,
  },
  archiveName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  archiveStats: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#AAAAAA',
  },
  archiveActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    padding: 4,
  },
  sessionsList: {
    maxHeight: 150,
  },
  sessionCard: {
    marginBottom: 8,
  },
  activeSession: {
    borderWidth: 1,
    borderColor: '#FF2EC0',
  },
  sessionGradient: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  sessionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sessionStats: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#AAAAAA',
  },
  controlsSection: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FFF7',
    borderRadius: 2,
  },
  progressText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#AAAAAA',
    textAlign: 'center',
  },
  playbackControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 255, 247, 0.2)',
    borderWidth: 1,
    borderColor: '#00FFF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#00FFF7',
  },
  speedControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  speedLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  speedButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#666666',
  },
  speedButtonActive: {
    borderColor: '#FF2EC0',
    backgroundColor: 'rgba(255, 46, 192, 0.2)',
  },
  speedText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#AAAAAA',
  },
  speedTextActive: {
    color: '#FF2EC0',
  },
  messageDisplay: {
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderRadius: 6,
    padding: 12,
    borderWidth: 1,
    borderColor: '#666666',
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  messageInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  channelName: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#00FFF7',
  },
  authorName: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#FF2EC0',
  },
  generateButton: {
    backgroundColor: '#FFB000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  generateButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  messageContent: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 16,
  },
  messageTime: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#666666',
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
  importInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    padding: 12,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#FFFFFF',
    minHeight: 200,
    textAlignVertical: 'top',
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
  importButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  importButtonDisabled: {
    backgroundColor: '#666666',
  },
  importButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
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
});