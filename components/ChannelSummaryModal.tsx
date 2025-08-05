import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Hash, Brain, X, Play, Download, Clock, Users, TrendingUp, MessageSquare } from 'lucide-react-native';

interface ChannelSummary {
  id: string;
  channelId: string;
  channelName: string;
  serverName: string;
  messageCount: number;
  summary: string;
  keyTopics: string[];
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  participants: Array<{
    username: string;
    messageCount: number;
    mostActive: boolean;
  }>;
  generatedAt: string;
  aiBackend: string;
  processingTime: number;
}

const SUMMARY_TEMPLATES = [
  {
    id: 'detailed-analysis',
    name: 'Detailed Analysis',
    description: 'Comprehensive conversation analysis with insights'
  },
  {
    id: 'brief-summary', 
    name: 'Brief Summary',
    description: 'Quick overview of conversation highlights'
  }
];

interface ChannelSummaryModalProps {
  channelId: string;
  channelName: string;
  serverName: string;
  isVisible: boolean;
  isGenerating: boolean;
  progress: number;
  summary: ChannelSummary | null;
  error: string | null;
  onClose: () => void;
  onGenerate: (messageCount: number, templateId: string) => void;
  onExport: () => void;
}

export default function ChannelSummaryModal({
  channelId,
  channelName,
  serverName,
  isVisible,
  isGenerating,
  progress,
  summary,
  error,
  onClose,
  onGenerate,
  onExport
}: ChannelSummaryModalProps) {
  const [messageCount, setMessageCount] = useState('50');
  const [selectedTemplate, setSelectedTemplate] = useState('detailed-analysis');

  if (!isVisible) return null;

  const handleGenerate = () => {
    const count = parseInt(messageCount);
    if (isNaN(count) || count < 1 || count > 1000) {
      Alert.alert('Invalid Input', 'Please enter a number between 1 and 1000');
      return;
    }
    onGenerate(count, selectedTemplate);
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return '#00FF00';
      case 'negative': return '#FF0080';
      case 'mixed': return '#FFB000';
      default: return '#00FFF7';
    }
  };

  const formatDuration = (ms: number): string => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <View style={styles.overlay}>
      <LinearGradient
        colors={['rgba(12, 12, 12, 0.98)', 'rgba(30, 30, 30, 0.98)']}
        style={styles.modal}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Hash size={20} color="#00FFF7" />
            <View style={styles.channelInfo}>
              <Text style={styles.channelName}>#{channelName}</Text>
              <Text style={styles.serverName}>{serverName}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={20} color="#AAAAAA" />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Configuration Section */}
          {!summary && !isGenerating && (
            <View style={styles.configSection}>
              <Text style={styles.sectionTitle}>ANALYSIS CONFIGURATION</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Message Count</Text>
                <TextInput
                  style={styles.numberInput}
                  value={messageCount}
                  onChangeText={setMessageCount}
                  placeholder="50"
                  placeholderTextColor="#666666"
                  keyboardType="numeric"
                />
                <Text style={styles.inputHint}>Max: 1000 messages</Text>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Analysis Template</Text>
                <View style={styles.templateGrid}>
                  {SUMMARY_TEMPLATES.map(template => (
                    <TouchableOpacity
                      key={template.id}
                      style={[
                        styles.templateButton,
                        selectedTemplate === template.id && styles.templateButtonActive
                      ]}
                      onPress={() => setSelectedTemplate(template.id)}
                    >
                      <Text style={[
                        styles.templateName,
                        selectedTemplate === template.id && styles.templateNameActive
                      ]}>
                        {template.name}
                      </Text>
                      <Text style={styles.templateDescription}>
                        {template.description}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <TouchableOpacity 
                style={styles.generateButton}
                onPress={handleGenerate}
              >
                <Brain size={20} color="#0C0C0C" />
                <Text style={styles.generateButtonText}>ANALYZE CHANNEL</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Generation Progress */}
          {isGenerating && (
            <View style={styles.progressSection}>
              <Text style={styles.sectionTitle}>GENERATING ANALYSIS</Text>
              
              <View style={styles.progressContainer}>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <Text style={styles.progressText}>{progress}% Complete</Text>
              </View>

              <View style={styles.progressSteps}>
                <View style={[styles.progressStep, progress >= 25 && styles.progressStepActive]}>
                  <MessageSquare size={16} color={progress >= 25 ? '#00FFF7' : '#666666'} />
                  <Text style={[styles.progressStepText, progress >= 25 && styles.progressStepTextActive]}>
                    Fetching Messages
                  </Text>
                </View>
                <View style={[styles.progressStep, progress >= 60 && styles.progressStepActive]}>
                  <Brain size={16} color={progress >= 60 ? '#00FFF7' : '#666666'} />
                  <Text style={[styles.progressStepText, progress >= 60 && styles.progressStepTextActive]}>
                    AI Analysis
                  </Text>
                </View>
                <View style={[styles.progressStep, progress >= 90 && styles.progressStepActive]}>
                  <TrendingUp size={16} color={progress >= 90 ? '#00FFF7' : '#666666'} />
                  <Text style={[styles.progressStepText, progress >= 90 && styles.progressStepTextActive]}>
                    Processing Results
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Error Display */}
          {error && (
            <View style={styles.errorSection}>
              <Text style={styles.errorTitle}>ANALYSIS FAILED</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={() => setMessageCount('50')}
              >
                <Text style={styles.retryButtonText}>RETRY</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Summary Results */}
          {summary && (
            <View style={styles.summarySection}>
              <View style={styles.summaryHeader}>
                <Text style={styles.sectionTitle}>ANALYSIS RESULTS</Text>
                <TouchableOpacity style={styles.exportButton} onPress={onExport}>
                  <Download size={16} color="#0C0C0C" />
                  <Text style={styles.exportButtonText}>EXPORT</Text>
                </TouchableOpacity>
              </View>

              {/* Summary Stats */}
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MessageSquare size={16} color="#00FFF7" />
                  <Text style={styles.statValue}>{summary.messageCount}</Text>
                  <Text style={styles.statLabel}>MESSAGES</Text>
                </View>
                <View style={styles.statCard}>
                  <Users size={16} color="#FF2EC0" />
                  <Text style={styles.statValue}>{summary.participants.length}</Text>
                  <Text style={styles.statLabel}>USERS</Text>
                </View>
                <View style={styles.statCard}>
                  <TrendingUp size={16} color={getSentimentColor(summary.sentiment)} />
                  <Text style={[styles.statValue, { color: getSentimentColor(summary.sentiment) }]}>
                    {summary.sentiment.toUpperCase()}
                  </Text>
                  <Text style={styles.statLabel}>SENTIMENT</Text>
                </View>
                <View style={styles.statCard}>
                  <Clock size={16} color="#FFB000" />
                  <Text style={styles.statValue}>{formatDuration(summary.processingTime)}</Text>
                  <Text style={styles.statLabel}>PROCESSED</Text>
                </View>
              </View>

              {/* Key Topics */}
              {summary.keyTopics.length > 0 && (
                <View style={styles.topicsSection}>
                  <Text style={styles.subsectionTitle}>KEY TOPICS</Text>
                  <View style={styles.topicsList}>
                    {summary.keyTopics.map(topic => (
                      <View key={topic} style={styles.topicBadge}>
                        <Text style={styles.topicText}>{topic}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Participants */}
              <View style={styles.participantsSection}>
                <Text style={styles.subsectionTitle}>TOP PARTICIPANTS</Text>
                {summary.participants.slice(0, 5).map(participant => (
                  <View key={participant.username} style={styles.participantRow}>
                    <View style={styles.participantInfo}>
                      <Text style={[styles.participantName, participant.mostActive && styles.mostActiveUser]}>
                        @{participant.username}
                      </Text>
                      {participant.mostActive && (
                        <View style={styles.mostActiveBadge}>
                          <Text style={styles.mostActiveText}>MOST ACTIVE</Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.participantCount}>{participant.messageCount}</Text>
                  </View>
                ))}
              </View>

              {/* AI Summary */}
              <View style={styles.summaryTextSection}>
                <Text style={styles.subsectionTitle}>AI ANALYSIS</Text>
                <View style={styles.summaryTextContainer}>
                  <Text style={styles.summaryText}>{summary.summary}</Text>
                </View>
              </View>

              {/* Metadata */}
              <View style={styles.metadataSection}>
                <Text style={styles.subsectionTitle}>METADATA</Text>
                <View style={styles.metadataGrid}>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>AI Backend</Text>
                    <Text style={styles.metadataValue}>{summary.aiBackend}</Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Generated</Text>
                    <Text style={styles.metadataValue}>
                      {new Date(summary.generatedAt).toLocaleString()}
                    </Text>
                  </View>
                  <View style={styles.metadataItem}>
                    <Text style={styles.metadataLabel}>Date Range</Text>
                    <Text style={styles.metadataValue}>
                      {new Date(summary.dateRange.start).toLocaleDateString()} - {new Date(summary.dateRange.end).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '95%',
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
    gap: 12,
  },
  channelInfo: {
    gap: 2,
  },
  channelName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  serverName: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#AAAAAA',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  configSection: {
    gap: 20,
  },
  sectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#00FFF7',
    letterSpacing: 2,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  numberInput: {
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  inputHint: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#666666',
    textAlign: 'center',
  },
  templateGrid: {
    gap: 8,
  },
  templateButton: {
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 16,
  },
  templateButtonActive: {
    borderColor: '#FF2EC0',
    backgroundColor: 'rgba(255, 46, 192, 0.1)',
  },
  templateName: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 13,
    color: '#AAAAAA',
    marginBottom: 4,
  },
  templateNameActive: {
    color: '#FFFFFF',
  },
  templateDescription: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 11,
    color: '#666666',
    lineHeight: 15,
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00FFF7',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
    marginTop: 8,
  },
  generateButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 14,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  progressSection: {
    gap: 20,
  },
  progressContainer: {
    gap: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00FFF7',
    borderRadius: 3,
  },
  progressText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
    textAlign: 'center',
    letterSpacing: 1,
  },
  progressSteps: {
    gap: 12,
  },
  progressStep: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
  },
  progressStepActive: {
    backgroundColor: 'rgba(0, 255, 247, 0.1)',
    borderRadius: 6,
    paddingHorizontal: 12,
  },
  progressStepText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#666666',
  },
  progressStepTextActive: {
    color: '#00FFF7',
  },
  errorSection: {
    alignItems: 'center',
    gap: 16,
    paddingVertical: 40,
  },
  errorTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FF0080',
    letterSpacing: 2,
  },
  errorText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#AAAAAA',
    textAlign: 'center',
    lineHeight: 18,
  },
  retryButton: {
    backgroundColor: '#FF2EC0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 6,
  },
  retryButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  summarySection: {
    gap: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
    gap: 4,
  },
  exportButtonText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255, 46, 192, 0.3)',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  statValue: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 16,
    color: '#FFFFFF',
  },
  statLabel: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 9,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  subsectionTitle: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#FFB000',
    letterSpacing: 2,
    marginBottom: 12,
  },
  topicsSection: {
    gap: 12,
  },
  topicsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicBadge: {
    backgroundColor: 'rgba(0, 255, 247, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  topicText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 11,
    color: '#00FFF7',
    letterSpacing: 1,
  },
  participantsSection: {
    gap: 12,
  },
  participantRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.5)',
    borderRadius: 6,
    padding: 12,
  },
  participantInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  participantName: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#FFFFFF',
  },
  mostActiveUser: {
    color: '#FF2EC0',
  },
  mostActiveBadge: {
    backgroundColor: '#FF2EC0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mostActiveText: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 8,
    color: '#0C0C0C',
    letterSpacing: 1,
  },
  participantCount: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 12,
    color: '#00FFF7',
  },
  summaryTextSection: {
    gap: 12,
  },
  summaryTextContainer: {
    backgroundColor: 'rgba(12, 12, 12, 0.8)',
    borderWidth: 1,
    borderColor: '#666666',
    borderRadius: 8,
    padding: 16,
  },
  summaryText: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 12,
    color: '#FFFFFF',
    lineHeight: 18,
  },
  metadataSection: {
    gap: 12,
  },
  metadataGrid: {
    gap: 8,
  },
  metadataItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 30, 30, 0.3)',
    borderRadius: 4,
    padding: 10,
  },
  metadataLabel: {
    fontFamily: 'JetBrainsMono-Bold',
    fontSize: 10,
    color: '#AAAAAA',
    letterSpacing: 1,
  },
  metadataValue: {
    fontFamily: 'JetBrainsMono-Regular',
    fontSize: 10,
    color: '#FFFFFF',
  },
});