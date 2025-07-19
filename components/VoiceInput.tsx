import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
  Modal,
  Animated
} from 'react-native';
import { Mic, MicOff, Check, X } from 'lucide-react-native';
import { Audio } from 'expo-av';
import Colors from '@/constants/colors';
import Button from '@/components/Button';

interface VoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
  style?: any;
  disabled?: boolean;
}

interface TranscriptionResponse {
  text: string;
  language: string;
}

export default function VoiceInput({ onTranscriptionComplete, style, disabled }: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  const startPulseAnimation = () => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const stopPulseAnimation = () => {
    pulseAnim.stopAnimation();
    Animated.timing(pulseAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const startRecording = async () => {
    try {
      if (Platform.OS === 'web') {
        await startWebRecording();
      } else {
        await startMobileRecording();
      }
      
      setIsRecording(true);
      setRecordingDuration(0);
      startPulseAnimation();
      
      // Start duration counter
      durationInterval.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert(
        'Recording Error',
        'Failed to start recording. Please check your microphone permissions.',
        [{ text: 'OK' }]
      );
    }
  };

  const startWebRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };
      
      recorder.onstop = () => {
        setAudioChunks(chunks);
        stream.getTracks().forEach(track => track.stop());
      };
      
      setMediaRecorder(recorder);
      recorder.start();
    } catch (error) {
      throw new Error('Web recording failed: ' + error);
    }
  };

  const startMobileRecording = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Audio permission not granted');
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
    } catch (error) {
      throw new Error('Mobile recording failed: ' + error);
    }
  };

  const stopRecording = async () => {
    try {
      setIsRecording(false);
      stopPulseAnimation();
      
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
      
      if (Platform.OS === 'web') {
        await stopWebRecording();
      } else {
        await stopMobileRecording();
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert(
        'Recording Error',
        'Failed to stop recording. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopWebRecording = async () => {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop();
      
      // Wait for the recording to be processed
      await new Promise(resolve => {
        if (mediaRecorder) {
          mediaRecorder.onstop = () => resolve(void 0);
        }
      });
      
      await processWebAudio();
    }
  };

  const stopMobileRecording = async () => {
    if (recording) {
      await recording.stopAndUnloadAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      await processMobileAudio();
    }
  };

  const processWebAudio = async () => {
    try {
      setIsProcessing(true);
      
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      
      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: TranscriptionResponse = await response.json();
      
      if (result.text && result.text.trim()) {
        setTranscribedText(result.text.trim());
        setShowConfirmation(true);
      } else {
        Alert.alert(
          'No Speech Detected',
          'No speech was detected in the recording. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert(
        'Transcription Error',
        'Failed to transcribe audio. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
      setAudioChunks([]);
    }
  };

  const processMobileAudio = async () => {
    try {
      setIsProcessing(true);
      
      if (!recording) {
        throw new Error('No recording available');
      }
      
      const uri = recording.getURI();
      if (!uri) {
        throw new Error('Recording URI not available');
      }
      
      const uriParts = uri.split('.');
      const fileType = uriParts[uriParts.length - 1];
      
      const audioFile = {
        uri,
        name: "recording." + fileType,
        type: "audio/" + fileType
      };
      
      const formData = new FormData();
      formData.append('audio', audioFile as any);
      
      const response = await fetch('https://toolkit.rork.com/stt/transcribe/', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result: TranscriptionResponse = await response.json();
      
      if (result.text && result.text.trim()) {
        setTranscribedText(result.text.trim());
        setShowConfirmation(true);
      } else {
        Alert.alert(
          'No Speech Detected',
          'No speech was detected in the recording. Please try again.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Transcription error:', error);
      Alert.alert(
        'Transcription Error',
        'Failed to transcribe audio. Please check your internet connection and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsProcessing(false);
      setRecording(null);
    }
  };

  const handleConfirmTranscription = () => {
    onTranscriptionComplete(transcribedText);
    setShowConfirmation(false);
    setTranscribedText('');
  };

  const handleRejectTranscription = () => {
    setShowConfirmation(false);
    setTranscribedText('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePress = () => {
    if (disabled) return;
    
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.voiceButton, style, disabled && styles.disabled]}
        onPress={handlePress}
        disabled={disabled || isProcessing}
        activeOpacity={0.7}
      >
        <Animated.View style={[styles.buttonContent, { transform: [{ scale: pulseAnim }] }]}>
          {isProcessing ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <>
              {isRecording ? (
                <MicOff size={20} color="white" />
              ) : (
                <Mic size={20} color="white" />
              )}
            </>
          )}
        </Animated.View>
        
        {isRecording && (
          <View style={styles.recordingIndicator}>
            <View style={styles.recordingDot} />
            <Text style={styles.durationText}>{formatDuration(recordingDuration)}</Text>
          </View>
        )}
        
        {isProcessing && (
          <Text style={styles.processingText}>Processing...</Text>
        )}
      </TouchableOpacity>

      <Modal
        visible={showConfirmation}
        transparent
        animationType="fade"
        onRequestClose={handleRejectTranscription}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModal}>
            <Text style={styles.modalTitle}>Voice Transcription</Text>
            <Text style={styles.transcribedText}>{transcribedText}</Text>
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.rejectButton]}
                onPress={handleRejectTranscription}
              >
                <X size={20} color={Colors.error} />
                <Text style={styles.rejectButtonText}>Reject</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmTranscription}
              >
                <Check size={20} color="white" />
                <Text style={styles.confirmButtonText}>Use This</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  voiceButton: {
    backgroundColor: Colors.primary,
    borderRadius: 25,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  disabled: {
    opacity: 0.5,
    backgroundColor: Colors.textSecondary,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.error,
    marginRight: 8,
  },
  durationText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  processingText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  confirmationModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  transcribedText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  rejectButton: {
    backgroundColor: `${Colors.error}20`,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  confirmButton: {
    backgroundColor: Colors.success,
  },
  rejectButtonText: {
    color: Colors.error,
    fontWeight: '600',
    marginLeft: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
});