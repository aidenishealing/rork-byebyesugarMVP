import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Check, X, Edit3 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { DailyHabits } from '@/types/habit';

interface VoiceHabitProcessorProps {
  visible: boolean;
  transcribedText: string;
  currentHabits: DailyHabits;
  onClose: () => void;
  onApplyChanges: (updatedHabits: Partial<DailyHabits>) => void;
}

interface HabitUpdate {
  field: keyof DailyHabits;
  value: any;
  confidence: 'high' | 'medium' | 'low';
  originalText: string;
}

export default function VoiceHabitProcessor({
  visible,
  transcribedText,
  currentHabits,
  onClose,
  onApplyChanges
}: VoiceHabitProcessorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedUpdates, setProcessedUpdates] = useState<HabitUpdate[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [editingUpdate, setEditingUpdate] = useState<HabitUpdate | null>(null);
  const [editValue, setEditValue] = useState('');

  React.useEffect(() => {
    if (visible && transcribedText) {
      processVoiceInput();
    }
  }, [visible, transcribedText]);

  const processVoiceInput = async () => {
    setIsProcessing(true);
    setShowResults(false);
    
    try {
      const updates = await analyzeVoiceInput(transcribedText);
      setProcessedUpdates(updates);
      setShowResults(true);
    } catch (error) {
      console.error('Voice processing error:', error);
      Alert.alert(
        'Processing Error',
        'Failed to process voice input. Please try again.',
        [{ text: 'OK', onPress: onClose }]
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const analyzeVoiceInput = async (text: string): Promise<HabitUpdate[]> => {
    // Use AI to analyze the voice input and extract habit information
    const prompt = `
    Analyze this voice input for a diabetes management habit tracker and extract specific habit information.
    
    Voice input: "${text}"
    
    Current habit fields and their types:
    - weightCheck: 'yes' | 'no' | null (did they check their weight?)
    - morningAcvWater: 'yes' | 'no' | null (did they drink ACV + 3 bottles of water in morning?)
    - championWorkout: 'yes' | 'no' | null (did they complete champion workout?)
    - meal10am: string (what they ate at 10am)
    - hungerTimes: string (when they felt hungry, e.g., "noon and 7pm")
    - outdoorTime: string (time spent outside, e.g., "30 minute walk")
    - energyLevel2pm: number 0-10 (energy level at 2pm)
    - meal6pm: string (what they ate at 6pm)
    - energyLevel8pm: number 0-10 (energy level at 8pm)
    - wimHof: 'yes' | 'no' | null (did they do Wim Hof breathing before bed?)
    - trackedSleep: 'yes' | 'no' | null (did they track their sleep?)
    - dayDescription: string (general description of their day)
    
    Extract only the information that is clearly mentioned in the voice input. 
    Return a JSON array of updates with this structure:
    [
      {
        "field": "fieldName",
        "value": "extractedValue",
        "confidence": "high|medium|low",
        "originalText": "relevant part of the input text"
      }
    ]
    
    Examples:
    - "I checked my weight this morning" -> {"field": "weightCheck", "value": "yes", "confidence": "high", "originalText": "I checked my weight this morning"}
    - "I had oatmeal with berries at 10am" -> {"field": "meal10am", "value": "oatmeal with berries", "confidence": "high", "originalText": "I had oatmeal with berries at 10am"}
    - "My energy was about 8 at 2pm" -> {"field": "energyLevel2pm", "value": 8, "confidence": "high", "originalText": "My energy was about 8 at 2pm"}
    - "I felt hungry around noon and 7pm" -> {"field": "hungerTimes", "value": "noon and 7pm", "confidence": "high", "originalText": "I felt hungry around noon and 7pm"}
    
    Only include updates for information that is explicitly mentioned. Do not make assumptions.
    `;

    try {
      const response = await fetch('https://toolkit.rork.com/text/llm/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that extracts habit information from voice input. Always respond with valid JSON only.'
            },
            {
              role: 'user',
              content: prompt
            }
          ]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      const updates = JSON.parse(result.completion);
      
      // Validate the updates
      return updates.filter((update: any) => 
        update.field && 
        update.value !== undefined && 
        update.confidence && 
        update.originalText
      );
    } catch (error) {
      console.error('AI analysis error:', error);
      // Fallback to simple keyword matching
      return performSimpleAnalysis(text);
    }
  };

  const performSimpleAnalysis = (text: string): HabitUpdate[] => {
    const updates: HabitUpdate[] = [];
    const lowerText = text.toLowerCase();

    // Simple keyword matching as fallback
    if (lowerText.includes('weight') && (lowerText.includes('checked') || lowerText.includes('weighed'))) {
      updates.push({
        field: 'weightCheck',
        value: 'yes',
        confidence: 'medium',
        originalText: 'mentioned checking weight'
      });
    }

    if (lowerText.includes('workout') || lowerText.includes('exercise')) {
      const didWorkout = lowerText.includes('did') || lowerText.includes('completed') || lowerText.includes('finished');
      updates.push({
        field: 'championWorkout',
        value: didWorkout ? 'yes' : 'no',
        confidence: 'medium',
        originalText: 'mentioned workout'
      });
    }

    // Extract energy levels
    const energyMatch = lowerText.match(/energy.*?(\d+)/);
    if (energyMatch) {
      const energyLevel = parseInt(energyMatch[1]);
      if (energyLevel >= 0 && energyLevel <= 10) {
        updates.push({
          field: 'energyLevel2pm',
          value: energyLevel,
          confidence: 'low',
          originalText: `mentioned energy level ${energyLevel}`
        });
      }
    }

    // Extract meal information
    const mealKeywords = ['ate', 'had', 'meal', 'breakfast', 'lunch', 'dinner'];
    if (mealKeywords.some(keyword => lowerText.includes(keyword))) {
      updates.push({
        field: 'dayDescription',
        value: text,
        confidence: 'low',
        originalText: 'mentioned food/meals'
      });
    }

    return updates;
  };

  const handleEditUpdate = (update: HabitUpdate) => {
    setEditingUpdate(update);
    setEditValue(String(update.value));
  };

  const handleSaveEdit = () => {
    if (!editingUpdate) return;

    const updatedUpdates = processedUpdates.map(update =>
      update === editingUpdate
        ? { ...update, value: editingUpdate.field.includes('energy') ? parseInt(editValue) || 0 : editValue }
        : update
    );

    setProcessedUpdates(updatedUpdates);
    setEditingUpdate(null);
    setEditValue('');
  };

  const handleRemoveUpdate = (updateToRemove: HabitUpdate) => {
    setProcessedUpdates(processedUpdates.filter(update => update !== updateToRemove));
  };

  const handleApplyChanges = () => {
    const habitUpdates: Partial<DailyHabits> = {};
    
    processedUpdates.forEach(update => {
      habitUpdates[update.field] = update.value;
    });

    onApplyChanges(habitUpdates);
    onClose();
  };

  const getFieldDisplayName = (field: keyof DailyHabits): string => {
    const fieldNames: Record<keyof DailyHabits, string> = {
      date: 'Date',
      weightCheck: 'Weight Check',
      morningAcvWater: 'Morning ACV + Water',
      championWorkout: 'Champion Workout',
      meal10am: '10am Meal',
      hungerTimes: 'Hunger Times',
      outdoorTime: 'Outdoor Time',
      energyLevel2pm: 'Energy Level 2pm',
      meal6pm: '6pm Meal',
      energyLevel8pm: 'Energy Level 8pm',
      wimHof: 'Wim Hof Breathing',
      trackedSleep: 'Sleep Tracking',
      dayDescription: 'Day Description'
    };
    return fieldNames[field] || field;
  };

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high': return Colors.success;
      case 'medium': return Colors.primary;
      case 'low': return Colors.secondary;
      default: return Colors.textSecondary;
    }
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Voice Habit Processing</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={Colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Original Voice Input:</Text>
            <Text style={styles.voiceText}>{transcribedText}</Text>
          </View>

          {isProcessing && (
            <View style={styles.processingContainer}>
              <Text style={styles.processingText}>Processing voice input...</Text>
            </View>
          )}

          {showResults && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Detected Habit Updates:</Text>
              
              {processedUpdates.length === 0 ? (
                <View style={styles.noUpdatesContainer}>
                  <Text style={styles.noUpdatesText}>
                    No specific habit information detected in your voice input.
                  </Text>
                  <Text style={styles.noUpdatesSubtext}>
                    Try being more specific about your habits, like "I checked my weight" or "I had oatmeal at 10am".
                  </Text>
                </View>
              ) : (
                processedUpdates.map((update, index) => (
                  <View key={index} style={styles.updateCard}>
                    <View style={styles.updateHeader}>
                      <Text style={styles.updateField}>
                        {getFieldDisplayName(update.field)}
                      </Text>
                      <View style={styles.updateActions}>
                        <View style={[styles.confidenceBadge, { backgroundColor: `${getConfidenceColor(update.confidence)}20` }]}>
                          <Text style={[styles.confidenceText, { color: getConfidenceColor(update.confidence) }]}>
                            {update.confidence}
                          </Text>
                        </View>
                        <TouchableOpacity
                          onPress={() => handleEditUpdate(update)}
                          style={styles.editButton}
                        >
                          <Edit3 size={16} color={Colors.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveUpdate(update)}
                          style={styles.removeButton}
                        >
                          <X size={16} color={Colors.error} />
                        </TouchableOpacity>
                      </View>
                    </View>
                    
                    <Text style={styles.updateValue}>
                      New value: <Text style={styles.updateValueText}>{String(update.value)}</Text>
                    </Text>
                    
                    <Text style={styles.originalText}>
                      From: "{update.originalText}"
                    </Text>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>

        {showResults && processedUpdates.length > 0 && (
          <View style={styles.footer}>
            <Button
              title="Cancel"
              variant="outline"
              onPress={onClose}
              style={styles.cancelButton}
            />
            <Button
              title={`Apply ${processedUpdates.length} Update${processedUpdates.length !== 1 ? 's' : ''}`}
              onPress={handleApplyChanges}
              style={styles.applyButton}
            />
          </View>
        )}

        {/* Edit Modal */}
        <Modal
          visible={!!editingUpdate}
          transparent
          animationType="fade"
          onRequestClose={() => setEditingUpdate(null)}
        >
          <View style={styles.editModalOverlay}>
            <View style={styles.editModal}>
              <Text style={styles.editModalTitle}>
                Edit {editingUpdate ? getFieldDisplayName(editingUpdate.field) : ''}
              </Text>
              
              <Input
                label="Value"
                value={editValue}
                onChangeText={setEditValue}
                multiline={editingUpdate?.field === 'dayDescription'}
                numberOfLines={editingUpdate?.field === 'dayDescription' ? 3 : 1}
                keyboardType={editingUpdate?.field.includes('energy') ? 'numeric' : 'default'}
              />
              
              <View style={styles.editModalButtons}>
                <Button
                  title="Cancel"
                  variant="outline"
                  onPress={() => setEditingUpdate(null)}
                  style={styles.editCancelButton}
                />
                <Button
                  title="Save"
                  onPress={handleSaveEdit}
                  style={styles.editSaveButton}
                />
              </View>
            </View>
          </View>
        </Modal>
      </View>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  voiceText: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    padding: 16,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  processingContainer: {
    alignItems: 'center',
    padding: 24,
  },
  processingText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  noUpdatesContainer: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: Colors.card,
    borderRadius: 8,
  },
  noUpdatesText: {
    fontSize: 16,
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  noUpdatesSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  updateCard: {
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  updateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  updateField: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    flex: 1,
  },
  updateActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  confidenceText: {
    fontSize: 12,
    fontWeight: '600',
  },
  editButton: {
    padding: 4,
    marginRight: 8,
  },
  removeButton: {
    padding: 4,
  },
  updateValue: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  updateValueText: {
    color: Colors.text,
    fontWeight: '500',
  },
  originalText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  cancelButton: {
    flex: 1,
    marginRight: 8,
  },
  applyButton: {
    flex: 2,
    marginLeft: 8,
  },
  editModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  editModal: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  editModalButtons: {
    flexDirection: 'row',
    marginTop: 16,
  },
  editCancelButton: {
    flex: 1,
    marginRight: 8,
  },
  editSaveButton: {
    flex: 1,
    marginLeft: 8,
  },
});