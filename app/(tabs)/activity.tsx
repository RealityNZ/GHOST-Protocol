import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Activity, Download, Database, Trash2 } from 'lucide-react-native';

interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  status: 'success' | 'error' | 'warning';
}

export default function ActivityScreen() {
  const [logs] = useState<ActivityLog[]>([
    {
      id: '1',
      action: 'MESSAGE_SYNC',
      details: 'Synchronized 247 messages from #general',
      timestamp: new Date().toISOString(),
      status: 'success'
    },
    {
      id: '2',
      action: 'VOICE_TRANSCRIBE',
      details: 'Transcribed voice message (2:34) from whisper_net',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      status: 'success'
    },
    {
      id: '3',
      action: 'RATE_LIMIT',
      details: 'Discord API rate limit encountered',
      timestamp: new Date(Date.now() - 240000).toISOString(),
      status: 'error'
    },
    {
      id: '4',
      action: 'NEURAL_HIJACK',
      details: 'AI persona "Digital Ghost" activated successfully',
      timestamp: new Date(Date.now() - 360000).toISOString(),
      status: 'success'
    },
    {
      id: '5',
      action: 'IMAGE_CAPTURE',
      details: 'Archived deleted image from @phantom_user',
      timestamp: new Date(Date.now() - 480000).toISOString(),
      status: 'warning'
    }
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return '#00FF00';
      case 'warning': return '#FFB000';
      case 'error': return '#FF0080';
      default: return '#666666';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.gradient}>
        {/* Header */}
        <View style={styles.header}>
          <Activity size={24} color="#FFB000" />
          <Text style={styles.headerTitle}>SYSTEM LOGS</Text>
          <Database size={24} color="#00FFF7" />
        </View>

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

        {/* Export Controls */}
        <View style={styles.exportSection}>
          <TouchableOpacity style={styles.exportButton}>
            <Download size={16} color="#0C0C0C" />
            <Text style={styles.exportButtonText}>EXPORT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.exportButton, styles.dangerButton]}>
            <Trash2 size={16} color="#FFFFFF" />
            <Text style={[styles.exportButtonText, { color: '#FFFFFF' }]}>PURGE</Text>
          </TouchableOpacity>
        </View>

        {/* Activity Logs */}
        <ScrollView style={styles.logsContainer} showsVerticalScrollIndicator={false}>
          <Text style={styles.sectionTitle}>SYSTEM ACTIVITY</Text>
          
          {logs.map((log) => (
            <View key={log.id} style={styles.logEntry}>
              <LinearGradient
                colors={['rgba(255, 184, 0, 0.1)', 'rgba(0, 255, 247, 0.05)']}
                style={styles.logGradient}
              >
                <View style={styles.logHeader}>
                  <Text style={styles.logAction}>{log.action}</Text>
                  <View style={[styles.statusDot, { backgroundColor: getStatusColor(log.status) }]} />
                </View>
                
                <Text style={styles.logDetails}>{log.details}</Text>
                
                <Text style={styles.logTimestamp}>
                  {new Date(log.timestamp).toLocaleString()}
                </Text>
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
    color: '#FFB000',
    letterSpacing: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
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
  exportSection: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  exportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingVertical: 12,
    borderRadius: 6,
    gap: 6,
  },
  dangerButton: {
    backgroundColor: '#FF0080',
  },
  exportButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  logsContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FFB000',
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
  logAction: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logDetails: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 18,
  },
  logTimestamp: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#AAAAAA',
  },
});