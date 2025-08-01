import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Server, Hash, Volume2, Shield, Plus, Wifi, ChartBar as BarChart3 } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';
import BackgroundEffects from '@/components/BackgroundEffects';
import ChannelSummaryModal from '@/components/ChannelSummaryModal';
import { useChannelSummary } from '@/hooks/useChannelSummary';

interface DiscordServer {
  id: string;
  name: string;
  channels: Channel[];
  connected: boolean;
}

interface Channel {
  id: string;
  name: string;
  type: 'text' | 'voice';
  monitored: boolean;
}

export default function ServersScreen() {
  const [token, setToken] = useState('');
  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<{ id: string; name: string; serverId: string; serverName: string } | null>(null);
  const [servers] = useState<DiscordServer[]>([
    {
      id: '1',
      name: 'underground_collective',
      connected: true,
      channels: [
        { id: '1', name: 'general', type: 'text', monitored: true },
        { id: '2', name: 'announcements', type: 'text', monitored: true },
        { id: '3', name: 'media-dump', type: 'text', monitored: false },
        { id: '4', name: 'voice-logs', type: 'voice', monitored: true },
      ]
    },
    {
      id: '2',
      name: 'digital_resistance',
      connected: false,
      channels: [
        { id: '5', name: 'planning', type: 'text', monitored: false },
        { id: '6', name: 'intel', type: 'text', monitored: false },
      ]
    }
  ]);

  const { 
    summaries, 
    isGenerating, 
    currentProgress, 
    error, 
    generateSummary 
  } = useChannelSummary();

  const glitchOpacity = useSharedValue(1);

  useEffect(() => {
    glitchOpacity.value = withRepeat(
      withTiming(0.95, { duration: 3000 }),
      -1,
      true
    );
  }, []);

  const handleChannelSummary = (channel: Channel, server: DiscordServer) => {
    setSelectedChannel({
      id: channel.id,
      name: channel.name,
      serverId: server.id,
      serverName: server.name
    });
    setShowSummaryModal(true);
  };

  const handleGenerateSummary = async (messageCount: number, templateId: string) => {
    if (!selectedChannel) return;

    try {
      await generateSummary({
        channelId: selectedChannel.id,
        messageCount,
        includeDeleted: false
      }, templateId);
    } catch (error) {
      console.error('Summary generation failed:', error);
    }
  };

  const handleExportSummary = () => {
    if (!selectedChannel) return;
    
    const summary = summaries.find(s => s.channelId === selectedChannel.id);
    if (summary) {
      // In a real app, this would trigger a download
      console.log('Exporting summary:', summary);
    }
  };

  const glitchStyle = useAnimatedStyle(() => ({
    opacity: glitchOpacity.value,
  }));

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      <BackgroundEffects variant="surveillance" intensity="subtle" />
      
      {/* Header */}
      <Animated.View style={[styles.header, glitchStyle]}>
        <Server size={24} color="#FF2EC0" />
        <Text style={styles.headerTitle}>SERVER MATRIX</Text>
        <Wifi size={24} color="#00FF00" />
      </Animated.View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Token Input */}
        <View style={styles.tokenSection}>
          <Text style={styles.sectionTitle}>BOT TOKEN INJECTION</Text>
          <View style={styles.tokenInputContainer}>
            <TextInput
              style={styles.tokenInput}
              placeholder="Paste Discord Bot Token..."
              placeholderTextColor="#666666"
              value={token}
              onChangeText={setToken}
              secureTextEntry
            />
            <TouchableOpacity style={styles.connectButton}>
              <Plus size={16} color="#0C0C0C" />
              <Text style={styles.connectButtonText}>INJECT</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Servers List */}
        <View style={styles.serversSection}>
          <Text style={styles.sectionTitle}>ACCESSIBLE SERVERS</Text>
          
          {servers.map(server => (
            <View key={server.id} style={styles.serverCard}>
              <LinearGradient
                colors={server.connected ? 
                  ['rgba(0, 255, 247, 0.1)', 'rgba(255, 46, 192, 0.05)'] :
                  ['rgba(30, 30, 30, 0.3)', 'rgba(12, 12, 12, 0.5)']
                }
                style={styles.serverGradient}
              >
                <View style={styles.serverHeader}>
                  <View style={styles.serverInfo}>
                    <Server size={20} color={server.connected ? '#00FFF7' : '#666666'} />
                    <Text style={[styles.serverName, { 
                      color: server.connected ? '#FFFFFF' : '#AAAAAA' 
                    }]}>
                      {server.name}
                    </Text>
                  </View>
                  <View style={[styles.connectionStatus, {
                    backgroundColor: server.connected ? '#00FF00' : '#FF0080'
                  }]} />
                </View>

                {server.connected && (
                  <View style={styles.channelsList}>
                    {server.channels.map(channel => (
                      <View
                        key={channel.id}
                        style={styles.channelItem}
                      >
                        <View style={styles.channelLeft}>
                          <View style={styles.channelInfo}>
                            {channel.type === 'text' ? 
                              <Hash size={14} color="#00FFF7" /> :
                              <Volume2 size={14} color="#FF2EC0" />
                            }
                            <Text style={styles.channelName}>{channel.name}</Text>
                          </View>
                          
                          {channel.type === 'text' && (
                            <TouchableOpacity
                              style={styles.summaryButton}
                              onPress={() => handleChannelSummary(channel, server)}
                            >
                              <BarChart3 size={12} color="#FFB000" />
                            </TouchableOpacity>
                          )}
                        </View>
                        
                        <View style={[styles.monitorToggle, {
                          backgroundColor: channel.monitored ? '#00FFF7' : '#404040'
                        }]}>
                          {channel.monitored && (
                            <Shield size={10} color="#0C0C0C" />
                          )}
                        </View>
                      </View>
                    ))}
                  </View>
                )}
              </LinearGradient>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Channel Summary Modal */}
      {selectedChannel && (
        <ChannelSummaryModal
          channelId={selectedChannel.id}
          channelName={selectedChannel.name}
          serverName={selectedChannel.serverName}
          isVisible={showSummaryModal}
          isGenerating={isGenerating}
          progress={currentProgress}
          summary={summaries.find(s => s.channelId === selectedChannel.id) || null}
          error={error}
          onClose={() => {
            setShowSummaryModal(false);
            setSelectedChannel(null);
          }}
          onGenerate={handleGenerateSummary}
          onExport={handleExportSummary}
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
    color: '#FF2EC0',
    letterSpacing: 2,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  tokenSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    marginBottom: 12,
  },
  tokenInputContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  tokenInput: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#FF2EC0',
    borderRadius: 6,
    paddingHorizontal: 16,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  connectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingHorizontal: 16,
    borderRadius: 6,
    gap: 6,
  },
  connectButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  serversSection: {
    flex: 1,
  },
  serverCard: {
    marginBottom: 16,
  },
  serverGradient: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
  },
  serverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  serverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  serverName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  connectionStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  channelsList: {
    gap: 8,
  },
  channelItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
  },
  channelLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  channelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  channelName: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#FFFFFF',
  },
  summaryButton: {
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FFB000',
    borderRadius: 4,
    padding: 4,
  },
  monitorToggle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});