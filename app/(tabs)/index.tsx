import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, Hash, User, Clock } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming } from 'react-native-reanimated';

interface LogEntry {
  id: string;
  type: 'message' | 'image' | 'voice' | 'edit' | 'delete';
  content: string;
  author: string;
  channel: string;
  timestamp: string;
  server: string;
}

export default function FeedScreen() {
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      type: 'message',
      content: 'Anyone else feeling like we\'re being watched?',
      author: 'phantom_user',
      channel: 'general',
      timestamp: new Date().toISOString(),
      server: 'underground_collective'
    },
    {
      id: '2',
      type: 'voice',
      content: 'Voice message transcribed: "The neural networks are learning faster than expected..."',
      author: 'whisper_net',
      channel: 'voice-logs',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      server: 'digital_resistance'
    },
    {
      id: '3',
      type: 'edit',
      content: 'Message edited: "Nothing to see here" → "Everything is fine"',
      author: 'ghost_user',
      channel: 'announcements',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      server: 'underground_collective'
    }
  ]);

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

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'voice': return <User size={14} color="#FF2EC0" />;
      case 'edit': return <Clock size={14} color="#FFB000" />;
      case 'delete': return <Clock size={14} color="#FF0080" />;
      default: return <Hash size={14} color="#00FFF7" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'voice': return '#FF2EC0';
      case 'edit': return '#FFB000';
      case 'delete': return '#FF0080';
      default: return '#00FFF7';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.gradient}>
        {/* Header */}
        <Animated.View style={[styles.header, glitchStyle]}>
          <Eye size={24} color="#00FFF7" />
          <Text style={styles.headerTitle}>SURVEILLANCE FEED</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE</Text>
          </View>
        </Animated.View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1,247</Text>
            <Text style={styles.statLabel}>MESSAGES</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>89</Text>
            <Text style={styles.statLabel}>IMAGES</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>23</Text>
            <Text style={styles.statLabel}>VOICE</Text>
          </View>
        </View>

        {/* Feed */}
        <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>INTERCEPTED COMMUNICATIONS</Text>
          
          {logs.map((log, index) => (
            <View key={log.id} style={styles.logEntry}>
              <LinearGradient
                colors={['rgba(0, 255, 247, 0.1)', 'rgba(255, 46, 192, 0.05)']}
                style={styles.logGradient}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logMeta}>
                    {getTypeIcon(log.type)}
                    <Text style={[styles.logType, { color: getTypeColor(log.type) }]}>
                      {log.type.toUpperCase()}
                    </Text>
                  </View>
                  <Text style={styles.logTimestamp}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>
                
                <Text style={styles.logContent}>{log.content}</Text>
                
                <View style={styles.logFooter}>
                  <Text style={styles.logAuthor}>@{log.author}</Text>
                  <Text style={styles.logChannel}>#{log.channel}</Text>
                  <Text style={styles.logServer}>{log.server}</Text>
                </View>
              </LinearGradient>
            </View>
          ))}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0C0C0C',
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#FF2EC0',
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#00FFF7',
    letterSpacing: 2,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00FF00',
  },
  liveText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#00FF00',
    letterSpacing: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(50, 50, 50, 0.8)',
    borderWidth: 1,
    borderColor: '#FF2EC0',
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 18,
    color: '#00FFF7',
  },
  statLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#AAAAAA',
    letterSpacing: 1,
    marginTop: 2,
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    marginBottom: 16,
  },
  logEntry: {
    marginBottom: 12,
  },
  logGradient: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.2)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  logType: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  logTimestamp: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#AAAAAA',
  },
  logContent: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
  },
  logFooter: {
    flexDirection: 'row',
    gap: 12,
  },
  logAuthor: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#FF2EC0',
  },
  logChannel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#00FFF7',
  },
  logServer: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
  },
});