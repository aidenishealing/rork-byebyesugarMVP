import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  TouchableWithoutFeedback,
  Alert,
  Platform,
  TextInput
} from 'react-native';
import { X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Input from '@/components/Input';

interface ReminderModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (title: string, time: string) => void;
  reminder?: {
    id: string;
    title: string;
    time: string;
    enabled: boolean;
  } | null;
  isEditing?: boolean;
}

export default function ReminderModal({ 
  visible, 
  onClose, 
  onSave, 
  reminder, 
  isEditing = false 
}: ReminderModalProps) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('');
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showTimeInput, setShowTimeInput] = useState(false);
  
  useEffect(() => {
    if (reminder && isEditing) {
      setTitle(reminder.title);
      setTime(reminder.time);
    } else {
      setTitle('');
      setTime('');
    }
  }, [reminder, isEditing, visible]);
  
  const handleSave = () => {
    if (!title.trim() || !time.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    onSave(title.trim(), time.trim());
    setTitle('');
    setTime('');
  };
  
  const handleTimePress = () => {
    if (Platform.OS === 'web') {
      setShowTimeInput(true);
    } else {
      setShowTimePicker(true);
    }
  };
  
  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const timeString = selectedTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
      setTime(timeString);
    }
  };
  
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback onPress={() => {}}>
            <View style={styles.modalContainer}>
              <View style={styles.header}>
                <Text style={styles.title}>
                  {isEditing ? 'Edit Reminder' : 'Add Reminder'}
                </Text>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                  <X size={24} color={Colors.text} />
                </TouchableOpacity>
              </View>
              
              <View style={styles.content}>
                <Input
                  label="Reminder Title"
                  value={title}
                  onChangeText={setTitle}
                  placeholder="e.g., Take morning supplements"
                />
                
                {Platform.OS === 'web' && showTimeInput ? (
                  <View style={styles.timeInputContainer}>
                    <Text style={styles.timeButtonLabel}>Time</Text>
                    <TextInput
                      style={styles.timeInput}
                      value={time}
                      onChangeText={setTime}
                      placeholder="e.g., 08:00 AM"
                      placeholderTextColor={Colors.textSecondary}
                      onBlur={() => setShowTimeInput(false)}
                      autoFocus
                    />
                  </View>
                ) : (
                  <TouchableOpacity 
                    style={styles.timeButton}
                    onPress={handleTimePress}
                  >
                    <Text style={styles.timeButtonLabel}>Time</Text>
                    <Text style={time ? styles.timeButtonText : styles.timeButtonTextPlaceholder}>
                      {time || 'Select time'}
                    </Text>
                  </TouchableOpacity>
                )}
                
                <View style={styles.buttons}>
                  <TouchableOpacity 
                    style={[styles.button, styles.saveButton]}
                    onPress={handleSave}
                  >
                    <Text style={styles.saveButtonText}>
                      {isEditing ? 'Update' : 'Add'} Reminder
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.button, styles.cancelButton]}
                    onPress={onClose}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {showTimePicker && Platform.OS !== 'web' && (
                <View style={styles.timePickerContainer}>
                  {/* Time picker would go here for native platforms */}
                  <TouchableOpacity 
                    style={styles.timePickerDone}
                    onPress={() => setShowTimePicker(false)}
                  >
                    <Text style={styles.timePickerDoneText}>Done</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  timeButton: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  timeButtonLabel: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
    fontWeight: '500',
  },
  timeButtonText: {
    fontSize: 18,
    color: Colors.text,
  },
  timeButtonTextPlaceholder: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  buttons: {
    marginTop: 24,
  },
  button: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '500',
  },
  timePickerContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  timePickerDone: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  timePickerDoneText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  timeInputContainer: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
  },
  timeInput: {
    fontSize: 18,
    color: Colors.text,
    marginTop: 4,
    padding: 0,
  },
});