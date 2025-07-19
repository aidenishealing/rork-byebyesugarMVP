import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  Linking,
  Platform,
} from 'react-native';
import { FileText, Image as ImageIcon, File, Download, Eye } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Card from '@/components/Card';
import { BloodworkDocument } from '@/types/habit';

interface BloodworkDocumentsListProps {
  documents: BloodworkDocument[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function BloodworkDocumentsList({
  documents,
  isLoading = false,
  emptyMessage = 'No bloodwork documents found',
}: BloodworkDocumentsListProps) {
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText size={24} color={Colors.error} />;
    if (type.includes('image')) return <ImageIcon size={24} color={Colors.success} />;
    return <File size={24} color={Colors.primary} />;
  };

  const getFileTypeLabel = (type: string): string => {
    if (type.includes('pdf')) return 'PDF';
    if (type.includes('image/jpeg')) return 'JPEG';
    if (type.includes('image/png')) return 'PNG';
    if (type.includes('wordprocessingml')) return 'DOCX';
    if (type.includes('text/plain')) return 'TXT';
    return type.split('/')[1]?.toUpperCase() || 'FILE';
  };

  const handleViewDocument = async (document: BloodworkDocument) => {
    try {
      if (Platform.OS === 'web') {
        // For web, open in new tab
        window.open(document.fileUrl, '_blank');
      } else {
        // For mobile, try to open with system viewer
        const supported = await Linking.canOpenURL(document.fileUrl);
        if (supported) {
          await Linking.openURL(document.fileUrl);
        } else {
          Alert.alert(
            'Cannot Open File',
            'Unable to open this file type on your device.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error opening document:', error);
      Alert.alert(
        'Error',
        'Failed to open document. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleDownloadDocument = async (document: BloodworkDocument) => {
    try {
      if (Platform.OS === 'web') {
        // For web, trigger download
        const link = window.document.createElement('a');
        link.href = document.fileUrl;
        link.download = document.fileName;
        window.document.body.appendChild(link);
        link.click();
        window.document.body.removeChild(link);
      } else {
        // For mobile, show options
        Alert.alert(
          'Download Document',
          `Download ${document.fileName}?`,
          [
            { text: 'Cancel', style: 'cancel' },
            { 
              text: 'Download', 
              onPress: () => {
                // In a real app, implement download functionality
                Alert.alert('Download Started', 'Document download has started.');
              }
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error downloading document:', error);
      Alert.alert(
        'Error',
        'Failed to download document. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const renderDocumentItem = ({ item }: { item: BloodworkDocument }) => (
    <Card style={styles.documentCard}>
      <View style={styles.documentHeader}>
        <View style={styles.documentInfo}>
          {getFileIcon(item.fileType)}
          <View style={styles.documentDetails}>
            <Text style={styles.documentName} numberOfLines={2}>
              {item.fileName}
            </Text>
            <View style={styles.documentMeta}>
              <Text style={styles.documentMetaText}>
                {getFileTypeLabel(item.fileType)} • {formatFileSize(item.fileSize)}
              </Text>
              <Text style={styles.documentDate}>
                {formatDate(item.uploadDate)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.documentActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleViewDocument(item)}
          >
            <Eye size={20} color={Colors.primary} />
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDownloadDocument(item)}
          >
            <Download size={20} color={Colors.secondary} />
          </TouchableOpacity>
        </View>
      </View>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <FileText size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>No Documents</Text>
      <Text style={styles.emptyMessage}>{emptyMessage}</Text>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading documents...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={documents}
        renderItem={renderDocumentItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingBottom: 16,
  },
  documentCard: {
    marginBottom: 12,
    padding: 16,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  documentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 12,
  },
  documentDetails: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  documentMeta: {
    flexDirection: 'column',
  },
  documentMetaText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  documentDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  documentActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginLeft: 4,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}10`,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 48,
    marginTop: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyMessage: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 12,
  },
});