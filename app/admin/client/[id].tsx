import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Calendar, PlusCircle, ChevronLeft, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import Card from '@/components/Card';
import HabitHistoryCard from '@/components/HabitHistoryCard';
import Button from '@/components/Button';
import { useHabitsStore } from '@/store/habits-store';
import { DailyHabits } from '@/types/habit';
import { format, formatDisplayDate } from '@/utils/date';
import VoiceInput from '@/components/VoiceInput';
import VoiceHabitProcessor from '@/components/VoiceHabitProcessor';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { clientHabits, fetchClientHabits, isLoading } = useHabitsStore();
  
  const [client, setClient] = useState({
    id: id || 'unknown',
    name: 'Loading...',
    phoneNumber: '',
    role: 'client' as const,
    habits: {},
    lastActive: ''
  });
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewingHabit, setViewingHabit] = useState<DailyHabits | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  
  // Voice input state
  const [voiceProcessorVisible, setVoiceProcessorVisible] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  const [voiceTargetDate, setVoiceTargetDate] = useState<string>('');
  
  useEffect(() => {
    if (id) {
      fetchClientHabits(id);
      
      // In a real app, fetch client details from API
      // For now, use mock data
      if (id === 'client-1') {
        setClient({
          id: 'client-1',
          name: 'John Smith',
          phoneNumber: '+1234567890',
          role: 'client',
          habits: {},
          lastActive: '2023-06-15'
        });
      } else if (id === 'client-2') {
        setClient({
          id: 'client-2',
          name: 'Sarah Johnson',
          phoneNumber: '+0987654321',
          role: 'client',
          habits: {},
          lastActive: '2023-06-14'
        });
      } else if (id === 'client-3') {
        setClient({
          id: 'client-3',
          name: 'Michael Brown',
          phoneNumber: '+1122334455',
          role: 'client',
          habits: {},
          lastActive: '2023-06-10'
        });
      }
    }
  }, [id, fetchClientHabits]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleViewHabit = (habit: DailyHabits) => {
    setViewingHabit(habit);
    setViewModalVisible(true);
  };
  
  const handleEditHabit = (habit: DailyHabits) => {
    // Navigate to edit habit screen
    router.push(`/admin/client/${id}/edit-habit/${habit.date}`);
  };
  
  const handleAddHabit = () => {
    // Navigate to add habit screen
    router.push(`/admin/client/${id}/add-habit`);
  };
  
  // Voice input handlers
  const handleVoiceTranscription = (text: string) => {
    console.log('Voice transcription received:', text);
    setVoiceTranscription(text);
    setVoiceTargetDate(format(currentDate, 'yyyy-MM-dd'));
    setVoiceProcessorVisible(true);
  };
  
  const handleVoiceHabitUpdates = async (updates: Partial<DailyHabits>) => {
    console.log('Applying voice habit updates for admin:', updates);
    
    try {
      // Create a new habit entry or update existing one
      const targetDate = voiceTargetDate || format(currentDate, 'yyyy-MM-dd');
      const existingHabit = clientHabits[targetDate];
      
      const updatedHabit: DailyHabits = {
        date: targetDate,
        weightCheck: existingHabit?.weightCheck || null,
        morningAcvWater: existingHabit?.morningAcvWater || null,
        championWorkout: existingHabit?.championWorkout || null,
        meal10am: existingHabit?.meal10am || '',
        hungerTimes: existingHabit?.hungerTimes || '',
        outdoorTime: existingHabit?.outdoorTime || '',
        energyLevel2pm: existingHabit?.energyLevel2pm || 5,
        meal6pm: existingHabit?.meal6pm || '',
        energyLevel8pm: existingHabit?.energyLevel8pm || 5,
        wimHof: existingHabit?.wimHof || null,
        trackedSleep: existingHabit?.trackedSleep || null,
        dayDescription: existingHabit?.dayDescription || '',
        ...updates
      };
      
      // Save the updated habit (in a real app, this would call an API)
      // For now, we'll simulate the save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Refresh the client habits
      await fetchClientHabits(id!);
      
      Alert.alert(
        'Voice Input Applied',
        `Successfully updated ${Object.keys(updates).length} habit${Object.keys(updates).length !== 1 ? 's' : ''} for ${client.name} on ${formatDisplayDate(new Date(targetDate))}.`,
        [{ text: 'OK' }]
      );
      
    } catch (error) {
      console.error('Failed to apply voice updates:', error);
      Alert.alert(
        'Error',
        'Failed to apply voice input updates. Please try again.',
        [{ text: 'OK' }]
      );
    }
    
    setVoiceProcessorVisible(false);
    setVoiceTranscription('');
    setVoiceTargetDate('');
  };
  
  // Date navigation
  const goToPreviousDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    setCurrentDate(prevDate);
  };
  
  const goToNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Don't allow navigating to future dates
    if (nextDate <= new Date()) {
      setCurrentDate(nextDate);
    }
  };
  
  // Get habits for the current date
  const getHabitsForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return clientHabits[formattedDate] || null;
  };
  
  const currentDateHabits = getHabitsForDate(currentDate);
  
  // Get all habits sorted by date (newest first)
  const allHabits = Object.values(clientHabits).sort((a, b) => {
    const habitA = a as DailyHabits;
    const habitB = b as DailyHabits;
    return new Date(habitB.date).getTime() - new Date(habitA.date).getTime();
  });
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Client Details" showBackButton onBackPress={handleBack} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading client data...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <Header title="Client Details" showBackButton onBackPress={handleBack} />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.clientCard}>
            <Text style={styles.clientName}>{client.name}</Text>
            <Text style={styles.clientPhoneNumber}>{client.phoneNumber}</Text>
            <Text style={styles.lastActive}>Last active: {client.lastActive}</Text>
            
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Object.keys(clientHabits).length}</Text>
                <Text style={styles.statLabel}>Total Entries</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {allHabits.filter((h) => (h as DailyHabits).championWorkout === 'yes').length}
                </Text>
                <Text style={styles.statLabel}>Workouts</Text>
              </View>
              
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {allHabits.length > 0 
                    ? Math.round(allHabits.reduce((sum, h) => {
                        const habit = h as DailyHabits;
                        return sum + (habit.energyLevel2pm as number);
                      }, 0) / allHabits.length) 
                    : 0
                  }/10
                </Text>
                <Text style={styles.statLabel}>Avg Energy</Text>
              </View>
            </View>
          </Card>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Daily Habits</Text>
            <View style={styles.sectionActions}>
              <VoiceInput
                onTranscriptionComplete={handleVoiceTranscription}
                style={styles.voiceInputButton}
                disabled={isLoading}
              />
              <TouchableOpacity 
                style={styles.addButton}
                onPress={handleAddHabit}
              >
                <PlusCircle size={24} color={Colors.primary} />
                <Text style={styles.addButtonText}>Add Entry</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <Card style={styles.dateCard}>
            <View style={styles.dateNavigationContainer}>
              <TouchableOpacity 
                onPress={goToPreviousDay}
                style={styles.dateNavButton}
              >
                <ChevronLeft size={24} color={Colors.primary} />
              </TouchableOpacity>
              
              <Text style={styles.dateText}>{formatDisplayDate(currentDate)}</Text>
              
              <TouchableOpacity 
                onPress={goToNextDay}
                style={[
                  styles.dateNavButton,
                  new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) && styles.dateNavButtonDisabled
                ]}
                disabled={new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
              >
                <ChevronRight size={24} color={new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) ? Colors.textSecondary : Colors.primary} />
              </TouchableOpacity>
            </View>
            
            {currentDateHabits ? (
              <View style={styles.habitSummary}>
                <View style={styles.habitRow}>
                  <Text style={styles.habitLabel}>Weight Check:</Text>
                  <Text style={[
                    styles.habitValue,
                    currentDateHabits.weightCheck === 'yes' ? styles.positiveValue : 
                    currentDateHabits.weightCheck === 'no' ? styles.negativeValue : styles.neutralValue
                  ]}>
                    {currentDateHabits.weightCheck || 'Not recorded'}
                  </Text>
                </View>
                
                <View style={styles.habitRow}>
                  <Text style={styles.habitLabel}>Morning ACV + Water:</Text>
                  <Text style={[
                    styles.habitValue,
                    currentDateHabits.morningAcvWater === 'yes' ? styles.positiveValue : 
                    currentDateHabits.morningAcvWater === 'no' ? styles.negativeValue : styles.neutralValue
                  ]}>
                    {currentDateHabits.morningAcvWater || 'Not recorded'}
                  </Text>
                </View>
                
                <View style={styles.habitRow}>
                  <Text style={styles.habitLabel}>Champion Workout:</Text>
                  <Text style={[
                    styles.habitValue,
                    currentDateHabits.championWorkout === 'yes' ? styles.positiveValue : 
                    currentDateHabits.championWorkout === 'no' ? styles.negativeValue : styles.neutralValue
                  ]}>
                    {currentDateHabits.championWorkout || 'Not recorded'}
                  </Text>
                </View>
                
                <View style={styles.habitRow}>
                  <Text style={styles.habitLabel}>Energy at 2pm:</Text>
                  <Text style={[
                    styles.habitValue,
                    (currentDateHabits.energyLevel2pm as number) >= 7 ? styles.positiveValue : 
                    (currentDateHabits.energyLevel2pm as number) <= 3 ? styles.negativeValue : styles.neutralValue
                  ]}>
                    {currentDateHabits.energyLevel2pm}/10
                  </Text>
                </View>
                
                <View style={styles.habitRow}>
                  <Text style={styles.habitLabel}>Energy at 8pm:</Text>
                  <Text style={[
                    styles.habitValue,
                    (currentDateHabits.energyLevel8pm as number) >= 7 ? styles.positiveValue : 
                    (currentDateHabits.energyLevel8pm as number) <= 3 ? styles.negativeValue : styles.neutralValue
                  ]}>
                    {currentDateHabits.energyLevel8pm}/10
                  </Text>
                </View>
                
                <View style={styles.buttonContainer}>
                  <Button
                    title="Edit Entry"
                    variant="outline"
                    onPress={() => handleEditHabit(currentDateHabits)}
                    style={styles.editButton}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Calendar size={48} color={Colors.textSecondary} />
                <Text style={styles.noDataText}>No data for this date</Text>
                <Button
                  title="Add Entry for This Date"
                  onPress={handleAddHabit}
                  style={styles.addEntryButton}
                />
              </View>
            )}
          </Card>
          
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Habit History</Text>
          </View>
          
          {allHabits.length > 0 ? (
            allHabits.map((habit) => {
              const dailyHabit = habit as DailyHabits;
              return (
                <HabitHistoryCard 
                  key={dailyHabit.date}
                  habits={dailyHabit}
                  clientId={id}
                  onView={handleViewHabit}
                  onEdit={handleEditHabit}
                />
              );
            })
          ) : (
            <Card>
              <View style={styles.noHistoryContainer}>
                <Text style={styles.noHistoryText}>No habit history found</Text>
                <Text style={styles.noHistorySubtext}>
                  This client hasn't recorded any habits yet
                </Text>
                <Button
                  title="Add First Entry"
                  onPress={handleAddHabit}
                  style={styles.addFirstButton}
                />
              </View>
            </Card>
          )}
        </View>
      </ScrollView>
      
      {/* Voice Habit Processor Modal */}
      <VoiceHabitProcessor
        visible={voiceProcessorVisible}
        transcribedText={voiceTranscription}
        currentHabits={currentDateHabits || {
          date: format(currentDate, 'yyyy-MM-dd'),
          weightCheck: null,
          morningAcvWater: null,
          championWorkout: null,
          meal10am: '',
          hungerTimes: '',
          outdoorTime: '',
          energyLevel2pm: 5,
          meal6pm: '',
          energyLevel8pm: 5,
          wimHof: null,
          trackedSleep: null,
          dayDescription: ''
        }}
        onClose={() => {
          setVoiceProcessorVisible(false);
          setVoiceTranscription('');
          setVoiceTargetDate('');
        }}
        onApplyChanges={handleVoiceHabitUpdates}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    color: Colors.textSecondary,
  },
  clientCard: {
    marginBottom: 24,
  },
  clientName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  clientPhoneNumber: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  lastActive: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  sectionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  voiceInputButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 40,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
  dateCard: {
    marginBottom: 24,
  },
  dateNavigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  dateNavButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: `${Colors.primary}15`,
  },
  dateNavButtonDisabled: {
    opacity: 0.5,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    flex: 1,
  },
  habitSummary: {
    marginTop: 8,
  },
  habitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  habitLabel: {
    fontSize: 16,
    color: Colors.text,
  },
  habitValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  positiveValue: {
    color: Colors.success,
  },
  negativeValue: {
    color: Colors.error,
  },
  neutralValue: {
    color: Colors.textSecondary,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  editButton: {
    flex: 1,
  },
  noDataContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noDataText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    marginBottom: 16,
  },
  addEntryButton: {
    marginTop: 8,
  },
  noHistoryContainer: {
    alignItems: 'center',
    padding: 24,
  },
  noHistoryText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  noHistorySubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  addFirstButton: {
    marginTop: 8,
  },
});