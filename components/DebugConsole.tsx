import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Switch } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Terminal, X, Download, Trash2, Filter, Search, Settings, TriangleAlert as AlertTriangle, Info, Zap, Bug, Skull } from 'lucide-react-native';
import { useDebugLogger, DebugLogEntry } from '@/hooks/useDebugLogger';

interface DebugConsoleProps {
  onClose: () => void;
}

export default function DebugConsole({ onClose }: DebugConsoleProps) {
  const [activeTab, setActiveTab] = useState<'logs' | 'settings' | 'stats'>('logs');
  const [filterLevel, setFilterLevel] = useState<DebugLogEntry['level'] | 'all'>('all');
  const [filterCategory, setFilterCategory] = useState<DebugLogEntry['category'] | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  
  const scrollViewRef = useRef<ScrollView>(null);
  const {
    logs,
    isEnabled,
    clearLogs,
    exportLogs,
    getLogStats,
    updateSettings,
    state,
    logDebug,
    logInfo,
    logWarn,
    logError,
  } = useDebugLogger();

  useEffect(() => {
    if (autoScroll && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter(log => {
    const levelMatch = filterLevel === 'all' || log.level === filterLevel;
    const categoryMatch = filterCategory === 'all' || log.category === filterCategory;
    const searchMatch = !searchQuery || 
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return levelMatch && categoryMatch && searchMatch;
  });

  const getLevelColor = (level: DebugLogEntry['level']) => {
    switch (level) {
      case 'debug': return '#888888';
      case 'info': return '#00FFF7';
      case 'warn': return '#FFB000';
      case 'error': return '#FF2EC0';
      case 'fatal': return '#FF0000';
      default: return '#CCCCCC';
    }
  };

  const getLevelIcon = (level: DebugLogEntry['level']) => {
    switch (level) {
      case 'debug': return <Bug size={12} color={getLevelColor(level)} />;
      case 'info': return <Info size={12} color={getLevelColor(level)} />;
      case 'warn': return <AlertTriangle size={12} color={getLevelColor(level)} />;
      case 'error': return <Zap size={12} color={getLevelColor(level)} />;
      case 'fatal': return <Skull size={12} color={getLevelColor(level)} />;
      default: return <Terminal size={12} color={getLevelColor(level)} />;
    }
  };

  const getCategoryColor = (category: DebugLogEntry['category']) => {
    switch (category) {
      case 'system': return '#00FFF7';
      case 'discord': return '#5865F2';
      case 'ai': return '#FF2EC0';
      case 'security': return '#FFB000';
      case 'ui': return '#00FF00';
      case 'network': return '#FFA500';
      case 'storage': return '#9B59B6';
      default: return '#CCCCCC';
    }
  };

  const handleTestLogs = () => {
    logDebug('system', 'Debug test message', { testData: 'debug_value' });
    logInfo('discord', 'Connection established to server', { serverId: 'test_123', channels: 5 });
    logWarn('ai', 'Rate limit approaching', { remaining: 10, resetTime: new Date() });
    logError('network', 'Failed to fetch data', { endpoint: '/api/test', status: 404 });
  };

  const renderLogs = () => (
    <View style={styles.tabContent}>
      {/* Filters */}
      <View style={styles.filtersContainer}>
        <View style={styles.filterRow}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Level:</Text>
            <View style={styles.levelFilters}>
              {(['all', 'debug', 'info', 'warn', 'error', 'fatal'] as const).map(level => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.levelFilter,
                    filterLevel === level && styles.levelFilterActive,
                    { borderColor: level === 'all' ? '#00FFF7' : getLevelColor(level) }
                  ]}
                  onPress={() => setFilterLevel(level)}
                >
                  <Text style={[
                    styles.levelFilterText,
                    { color: level === 'all' ? '#00FFF7' : getLevelColor(level) }
                  ]}>
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.filterRow}>
          <View style={styles.searchContainer}>
            <Search size={14} color="#666666" />
            <TextInput
              style={styles.searchInput}
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search logs..."
              placeholderTextColor="#666666"
            />
          </View>
          
          <TouchableOpacity 
            style={styles.testButton}
            onPress={handleTestLogs}
          >
            <Bug size={14} color="#0C0C0C" />
            <Text style={styles.testButtonText}>TEST</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Log Entries */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.logsContainer} 
        showsVerticalScrollIndicator={false}
      >
        {filteredLogs.length === 0 ? (
          <View style={styles.emptyState}>
            <Terminal size={32} color="#666666" />
            <Text style={styles.emptyStateText}>No logs found</Text>
            <Text style={styles.emptyStateSubtext}>
              {searchQuery ? 'Try adjusting your search or filters' : 'System logs will appear here'}
            </Text>
          </View>
        ) : (
          filteredLogs.map(log => (
            <View key={log.id} style={styles.logEntry}>
              <LinearGradient
                colors={[
                  `${getLevelColor(log.level)}10`,
                  `${getLevelColor(log.level)}05`
                ]}
                style={styles.logGradient}
              >
                <View style={styles.logHeader}>
                  <View style={styles.logMeta}>
                    {getLevelIcon(log.level)}
                    <Text style={[styles.logLevel, { color: getLevelColor(log.level) }]}>
                      {log.level.toUpperCase()}
                    </Text>
                    <View style={[styles.categoryBadge, { backgroundColor: getCategoryColor(log.category) }]}>
                      <Text style={styles.categoryText}>{log.category.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.logTimestamp}>
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </Text>
                </View>

                <Text style={styles.logMessage}>{log.message}</Text>

                {log.details && state.verboseMode && (
                  <View style={styles.logDetails}>
                    <Text style={styles.logDetailsTitle}>Details:</Text>
                    <Text style={styles.logDetailsText}>
                      {typeof log.details === 'object' 
                        ? JSON.stringify(log.details, null, 2)
                        : String(log.details)
                      }
                    </Text>
                  </View>
                )}

                {log.stackTrace && (
                  <View style={styles.logStack}>
                    <Text style={styles.logStackTitle}>Stack Trace:</Text>
                    <Text style={styles.logStackText}>{log.stackTrace}</Text>
                  </View>
                )}

                {log.source && state.verboseMode && (
                  <Text style={styles.logSource}>Source: {log.source}</Text>
                )}
              </LinearGradient>
            </View>
          ))
        )}
      </ScrollView>

      {/* Auto-scroll toggle */}
      <View style={styles.autoScrollContainer}>
        <Text style={styles.autoScrollLabel}>Auto-scroll to new logs</Text>
        <Switch
          value={autoScroll}
          onValueChange={setAutoScroll}
          trackColor={{ false: '#333333', true: '#FF2EC0' }}
          thumbColor={autoScroll ? '#00FFF7' : '#666666'}
        />
      </View>
    </View>
  );

  const renderSettings = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>DEBUG SETTINGS</Text>
      
      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingName}>Debug Logging</Text>
          <Switch
            value={isEnabled}
            onValueChange={(enabled) => updateSettings({ isEnabled: enabled })}
            trackColor={{ false: '#333333', true: '#FF2EC0' }}
            thumbColor={isEnabled ? '#00FFF7' : '#666666'}
          />
        </View>
        <Text style={styles.settingDescription}>
          Enable comprehensive system logging and error capture
        </Text>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingName}>Verbose Mode</Text>
          <Switch
            value={state.verboseMode}
            onValueChange={(verbose) => updateSettings({ verboseMode: verbose })}
            trackColor={{ false: '#333333', true: '#FF2EC0' }}
            thumbColor={state.verboseMode ? '#00FFF7' : '#666666'}
          />
        </View>
        <Text style={styles.settingDescription}>
          Include detailed information, stack traces, and object dumps
        </Text>
      </View>

      <View style={styles.settingCard}>
        <Text style={styles.settingName}>Max Log Entries</Text>
        <TextInput
          style={styles.settingInput}
          value={state.maxLogs.toString()}
          onChangeText={(text) => updateSettings({ maxLogs: parseInt(text) || 1000 })}
          keyboardType="numeric"
        />
        <Text style={styles.settingDescription}>
          Maximum number of log entries to keep in memory
        </Text>
      </View>

      <View style={styles.settingCard}>
        <View style={styles.settingHeader}>
          <Text style={styles.settingName}>Auto-Export Crashes</Text>
          <Switch
            value={state.autoExport}
            onValueChange={(autoExport) => updateSettings({ autoExport })}
            trackColor={{ false: '#333333', true: '#FF2EC0' }}
            thumbColor={state.autoExport ? '#00FFF7' : '#666666'}
          />
        </View>
        <Text style={styles.settingDescription}>
          Automatically export crash reports to console
        </Text>
      </View>
    </View>
  );

  const renderStats = () => {
    const stats = getLogStats();
    
    return (
      <View style={styles.tabContent}>
        <Text style={styles.sectionTitle}>LOG STATISTICS</Text>
        
        <View style={styles.statsSection}>
          <Text style={styles.statsSubtitle}>BY LEVEL</Text>
          <View style={styles.statsGrid}>
            {Object.entries(stats.levels).map(([level, count]) => (
              <View key={level} style={styles.statCard}>
                <Text style={[styles.statValue, { 
                  color: level === 'total' ? '#00FFF7' : getLevelColor(level as any) 
                }]}>
                  {count}
                </Text>
                <Text style={styles.statLabel}>{level.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.statsSubtitle}>BY CATEGORY</Text>
          <View style={styles.statsGrid}>
            {Object.entries(stats.categories).map(([category, count]) => (
              <View key={category} style={styles.statCard}>
                <Text style={[styles.statValue, { color: getCategoryColor(category as any) }]}>
                  {count}
                </Text>
                <Text style={styles.statLabel}>{category.toUpperCase()}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.systemInfo}>
          <Text style={styles.systemInfoTitle}>SYSTEM INFO</Text>
          <Text style={styles.systemInfoText}>
            Memory: {(performance as any).memory ? 
              `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)}MB used` : 
              'N/A'
            }
          </Text>
          <Text style={styles.systemInfoText}>
            User Agent: {navigator.userAgent.substring(0, 50)}...
          </Text>
          <Text style={styles.systemInfoText}>
            Viewport: {window.innerWidth}x{window.innerHeight}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient colors={['#0C0C0C', '#1E1E1E']} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Terminal size={24} color="#00FFF7" />
          <Text style={styles.headerTitle}>DEBUG CONSOLE</Text>
          <View style={[styles.statusDot, { 
            backgroundColor: isEnabled ? '#00FF00' : '#FF0080' 
          }]} />
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.exportButton}
            onPress={() => {
              const exported = exportLogs();
              console.log('Debug logs exported:', exported);
            }}
          >
            <Download size={16} color="#FFB000" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearLogs}
          >
            <Trash2 size={16} color="#FF2EC0" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#FF2EC0" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        {[
          { key: 'logs', label: 'LOGS', icon: Terminal },
          { key: 'settings', label: 'SETTINGS', icon: Settings },
          { key: 'stats', label: 'STATS', icon: Info }
        ].map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key as any)}
          >
            <tab.icon size={14} color={activeTab === tab.key ? '#00FFF7' : '#666666'} />
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Content */}
      {activeTab === 'logs' && renderLogs()}
      {activeTab === 'settings' && renderSettings()}
      {activeTab === 'stats' && renderStats()}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#00FFF7',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#00FFF7',
    letterSpacing: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 184, 0, 0.2)',
    borderRadius: 4,
  },
  clearButton: {
    padding: 8,
    backgroundColor: 'rgba(255, 46, 192, 0.2)',
    borderRadius: 4,
  },
  closeButton: {
    padding: 8,
  },
  tabNavigation: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 255, 247, 0.2)',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 6,
    marginHorizontal: 4,
    gap: 6,
  },
  activeTab: {
    backgroundColor: 'rgba(0, 255, 247, 0.2)',
    borderWidth: 1,
    borderColor: '#00FFF7',
  },
  tabText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#888888',
    letterSpacing: 1,
  },
  activeTabText: {
    color: '#00FFF7',
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  filtersContainer: {
    marginBottom: 16,
    gap: 12,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  filterGroup: {
    flex: 1,
  },
  filterLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#CCCCCC',
    letterSpacing: 1,
    marginBottom: 6,
  },
  levelFilters: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  levelFilter: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderRadius: 4,
  },
  levelFilterActive: {
    backgroundColor: 'rgba(0, 255, 247, 0.1)',
  },
  levelFilterText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    letterSpacing: 1,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#E0E0E0',
    paddingVertical: 8,
  },
  testButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
    gap: 4,
  },
  testButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  logsContainer: {
    flex: 1,
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
  },
  emptyStateText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#666666',
    letterSpacing: 1,
  },
  emptyStateSubtext: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#888888',
    textAlign: 'center',
  },
  logEntry: {
    marginBottom: 8,
  },
  logGradient: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 247, 0.2)',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  logMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logLevel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    letterSpacing: 1,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  categoryText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 8,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  logTimestamp: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#888888',
  },
  logMessage: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#E0E0E0',
    lineHeight: 16,
    marginBottom: 4,
  },
  logDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
  },
  logDetailsTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#FFB000',
    letterSpacing: 1,
    marginBottom: 4,
  },
  logDetailsText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#CCCCCC',
    lineHeight: 14,
  },
  logStack: {
    backgroundColor: 'rgba(255, 46, 192, 0.1)',
    borderRadius: 4,
    padding: 8,
    marginTop: 6,
  },
  logStackTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 9,
    color: '#FF2EC0',
    letterSpacing: 1,
    marginBottom: 4,
  },
  logStackText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#CCCCCC',
    lineHeight: 12,
  },
  logSource: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 8,
    color: '#666666',
    marginTop: 4,
    fontStyle: 'italic',
  },
  autoScrollContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 247, 0.2)',
  },
  autoScrollLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    marginBottom: 16,
  },
  settingCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: 6,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 255, 247, 0.2)',
  },
  settingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  settingName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#E0E0E0',
    letterSpacing: 1,
  },
  settingDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#AAAAAA',
    lineHeight: 16,
  },
  settingInput: {
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFF7',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#E0E0E0',
    marginTop: 8,
    marginBottom: 8,
  },
  statsSection: {
    marginBottom: 20,
  },
  statsSubtitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#FFB000',
    letterSpacing: 2,
    marginBottom: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFF7',
    borderRadius: 6,
    padding: 12,
    alignItems: 'center',
    minWidth: '30%',
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    marginBottom: 4,
  },
  statLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#CCCCCC',
    letterSpacing: 1,
  },
  systemInfo: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#00FFF7',
    borderRadius: 8,
    padding: 16,
  },
  systemInfoTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    letterSpacing: 2,
    marginBottom: 12,
  },
  systemInfoText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#CCCCCC',
    lineHeight: 14,
    marginBottom: 4,
  },
});