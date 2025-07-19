import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { X, Upload, FileText, Image as ImageIcon, File } from 'lucide-react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { trpc } from '@/lib/trpc';

interface BloodworkUploadModalProps {
  visible: boolean;
  onClose: () => void;
  onUploadSuccess: () => void;
}

export default function BloodworkUploadModal({
  visible,
  onClose,
  onUploadSuccess,
}: BloodworkUploadModalProps) {
  const [selectedFile, setSelectedFile] = useState<{
    name: string;
    type: string;
    size: number;
    uri: string;
  } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = trpc.bloodwork.upload.useMutation({
    onSuccess: () => {
      setIsUploading(false);
      setUploadProgress(0);
      setSelectedFile(null);
      onUploadSuccess();
      onClose();
      Alert.alert('Success', 'Bloodwork document uploaded successfully!');
    },
    onError: (error) => {
      setIsUploading(false);
      setUploadProgress(0);
      Alert.alert('Upload Failed', error.message || 'Failed to upload document. Please try again.');
    },
  });

  const handleDocumentPick = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Check file size (10MB limit)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a file smaller than 10MB.');
          return;
        }

        setSelectedFile({
          name: file.name,
          type: file.mimeType || 'application/octet-stream',
          size: file.size || 0,
          uri: file.uri,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select document. Please try again.');
    }
  };

  const handleImagePick = async () => {
    try {
      // Request permission for image picker
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permission Required', 'Please allow access to your photo library to upload images.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const image = result.assets[0];
        
        // Check file size (10MB limit)
        if (image.fileSize && image.fileSize > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select an image smaller than 10MB.');
          return;
        }

        // Determine file type from URI
        const fileExtension = image.uri.split('.').pop()?.toLowerCase();
        const mimeType = fileExtension === 'png' ? 'image/png' : 'image/jpeg';

        setSelectedFile({
          name: image.fileName || `bloodwork_image.${fileExtension}`,
          type: mimeType,
          size: image.fileSize || 0,
          uri: image.uri,
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const convertFileToBase64 = async (uri: string): Promise<string> => {
    try {
      if (Platform.OS === 'web') {
        // For web, we need to handle file reading differently
        const response = await fetch(uri);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64 = (reader.result as string).split(',')[1];
            resolve(base64);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // For mobile, use expo-file-system
        const { FileSystem } = require('expo-file-system');
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
      }
    } catch (error) {
      console.error('Error converting file to base64:', error);
      throw new Error('Failed to process file');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      Alert.alert('No File Selected', 'Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert file to base64
      const fileData = await convertFileToBase64(selectedFile.uri);

      // Upload the file
      await uploadMutation.mutateAsync({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        fileSize: selectedFile.size,
        fileData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText size={24} color={Colors.error} />;
    if (type.includes('image')) return <ImageIcon size={24} color={Colors.success} />;
    return <File size={24} color={Colors.primary} />;
  };

  const handleClose = () => {
    if (isUploading) {
      Alert.alert(
        'Upload in Progress',
        'Are you sure you want to cancel the upload?',
        [
          { text: 'Continue Upload', style: 'cancel' },
          { 
            text: 'Cancel Upload', 
            style: 'destructive',
            onPress: () => {
              setIsUploading(false);
              setUploadProgress(0);
              setSelectedFile(null);
              onClose();
            }
          },
        ]
      );
    } else {
      setSelectedFile(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={handleClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Upload Bloodwork</Text>
          </View>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleClose}
            disabled={isUploading}
          >
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <Text style={styles.description}>
            Upload your bloodwork documents, lab reports, or medical images. 
            Supported formats: PDF, DOCX, TXT, JPEG, PNG (max 10MB)
          </Text>

          <View style={styles.uploadSection}>
            <Text style={styles.sectionTitle}>Select File Type</Text>
            
            <View style={styles.fileTypeButtons}>
              <TouchableOpacity 
                style={styles.fileTypeButton}
                onPress={handleDocumentPick}
                disabled={isUploading}
              >
                <FileText size={32} color={Colors.primary} />
                <Text style={styles.fileTypeText}>Documents</Text>
                <Text style={styles.fileTypeSubtext}>PDF, DOCX, TXT</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.fileTypeButton}
                onPress={handleImagePick}
                disabled={isUploading}
              >
                <ImageIcon size={32} color={Colors.secondary} />
                <Text style={styles.fileTypeText}>Images</Text>
                <Text style={styles.fileTypeSubtext}>JPEG, PNG</Text>
              </TouchableOpacity>
            </View>
          </View>

          {selectedFile && (
            <View style={styles.selectedFileSection}>
              <Text style={styles.sectionTitle}>Selected File</Text>
              <View style={styles.filePreview}>
                {getFileIcon(selectedFile.type)}
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{selectedFile.name}</Text>
                  <Text style={styles.fileDetails}>
                    {formatFileSize(selectedFile.size)} • {selectedFile.type.split('/')[1].toUpperCase()}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {isUploading && (
            <View style={styles.uploadProgress}>
              <Text style={styles.uploadProgressText}>
                Uploading... {uploadProgress}%
              </Text>
              <View style={styles.progressBar}>
                <View 
                  style={[
                    styles.progressFill, 
                    { width: `${uploadProgress}%` }
                  ]} 
                />
              </View>
              <ActivityIndicator 
                size="large" 
                color={Colors.primary} 
                style={styles.uploadSpinner}
              />
            </View>
          )}

          <View style={styles.buttonContainer}>
            <Button
              title={isUploading ? 'Uploading...' : 'Upload Document'}
              onPress={handleUpload}
              disabled={!selectedFile || isUploading}
              loading={isUploading}
              style={styles.uploadButton}
              icon={<Upload size={20} color="white" />}
            />

            <Button
              title="Cancel"
              variant="outline"
              onPress={handleClose}
              disabled={isUploading}
              style={styles.cancelButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary,
    lineHeight: 24,
    marginBottom: 24,
    textAlign: 'center',
  },
  uploadSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 16,
  },
  fileTypeButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  fileTypeButton: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.border,
    minWidth: 120,
  },
  fileTypeText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: 8,
  },
  fileTypeSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  selectedFileSection: {
    marginBottom: 24,
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 4,
  },
  fileDetails: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  uploadProgress: {
    marginBottom: 24,
    alignItems: 'center',
  },
  uploadProgressText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    marginBottom: 12,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 4,
  },
  uploadSpinner: {
    marginTop: 8,
  },
  buttonContainer: {
    marginTop: 24,
  },
  uploadButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 0,
  },
});