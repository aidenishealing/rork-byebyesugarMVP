import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import Card from '@/components/Card';
import YesNoQuestion from '@/components/YesNoQuestion';
import Input from '@/components/Input';
import Slider from '@/components/Slider';
import Button from '@/components/Button';
import DatePicker from '@/components/DatePicker';
import { useHabitsStore } from '@/store/habits-store';
import { format, parseDate } from '@/utils/date';

export default function AddHabitScreen() {
  const { id, date: dateParam } = useLocalSearchParams<{ id: string; date?: string }>();
  const router = useRouter();
  const { isLoading, editHabit } = useHabitsStore();
  
  const [client, setClient] = useState({
    id: id || 'unknown',
    name: 'Loading...',
    phoneNumber: '',
    role: 'client' as const,
    habits: {},
    lastActive: ''
  });
  
  // Initialize with the passed date parameter or current date
  const initialDate = dateParam ? parseDate(dateParam) : new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [date, setDate] = useState(dateParam || format(new Date(), 'yyyy-MM-dd'));
  const [weightCheck, setWeightCheck] = useState<string | null>(null);
  const [morningAcvWater, setMorningAcvWater] = useState<string | null>(null);
  const [championWorkout, setChampionWorkout] = useState<string | null>(null);
  const [meal10am, setMeal10am] = useState('');
  const [hungerTimes, setHungerTimes] = useState('');
  const [outdoorTime, setOutdoorTime] = useState('');
  const [energyLevel2pm, setEnergyLevel2pm] = useState(5);
  const [meal6pm, setMeal6pm] = useState('');
  const [energyLevel8pm, setEnergyLevel8pm] = useState(5);
  const [wimHof, setWimHof] = useState<string | null>(null);
  const [trackedSleep, setTrackedSleep] = useState<string | null>(null);
  const [dayDescription, setDayDescription] = useState('');
  
  useEffect(() => {
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
  }, [id]);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleDateChange = (newDate: Date) => {
    const newDateString = format(newDate, 'yyyy-MM-dd');
    console.log('Date changed in add habits:', newDate, '->', newDateString);
    setSelectedDate(newDate);
    setDate(newDateString);
  };

  const handleSave = async () => {
    console.log('Saving new habit with date:', date, 'selectedDate:', selectedDate);
    
    const habitData = {
      id: `habit-${id}-${date}`,
      userId: id || '',
      date, // This should be the correctly formatted date
      weightCheck,
      morningAcvWater,
      championWorkout,
      meal10am,
      hungerTimes,
      outdoorTime,
      energyLevel2pm,
      meal6pm,
      energyLevel8pm,
      wimHof,
      trackedSleep,
      dayDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    try {
      console.log('Saving habit data:', habitData);
      const success = await editHabit(date, habitData);
      
      if (success) {
        Alert.alert(
          'Success',
          'Habit entry added successfully!',
          [
            { 
              text: 'OK', 
              onPress: () => router.back() 
            }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to add habit entry. Please try again.');
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={`Add Habit for ${client.name}`} 
        showBackButton 
        onBackPress={handleBack} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card>
            <Text style={styles.cardTitle}>Add New Habit Entry for {client.name}</Text>
            <View style={styles.dateContainer}>
              <Text style={styles.dateLabel}>Selected Date:</Text>
              <DatePicker
                selectedDate={selectedDate}
                onDateChange={handleDateChange}
                style={styles.datePicker}
                disabled={isLoading}
              />
            </View>
            
            <YesNoQuestion
              question="Weight Check?"
              value={weightCheck}
              onChange={setWeightCheck}
            />
            
            <YesNoQuestion
              question="Morning ACV + 3 Bottles of Water?"
              value={morningAcvWater}
              onChange={setMorningAcvWater}
            />
            
            <YesNoQuestion
              question="Completed Champion Workout?"
              value={championWorkout}
              onChange={setChampionWorkout}
            />
            
            <Input
              label="Write 10am meal:"
              value={meal10am}
              onChangeText={setMeal10am}
              multiline
              numberOfLines={2}
            />
            
            <Input
              label="When did you feel hunger? (EX: noon and 7pm)"
              value={hungerTimes}
              onChangeText={setHungerTimes}
            />
            
            <Input
              label="Time Outside (EX: 30 minute walk)"
              value={outdoorTime}
              onChangeText={setOutdoorTime}
            />
            
            <Slider
              label="Energy Levels 2pm 0-10:"
              value={energyLevel2pm}
              onValueChange={setEnergyLevel2pm}
            />
            
            <Input
              label="Write 6pm meal:"
              value={meal6pm}
              onChangeText={setMeal6pm}
              multiline
              numberOfLines={2}
            />
            
            <Slider
              label="Energy Levels 8pm 0-10:"
              value={energyLevel8pm}
              onValueChange={setEnergyLevel8pm}
            />
            
            <YesNoQuestion
              question="Wim Hof before bed?"
              value={wimHof}
              onChange={setWimHof}
            />
            
            <YesNoQuestion
              question="Tracked Sleep?"
              value={trackedSleep}
              onChange={setTrackedSleep}
            />
            
            <Input
              label="How was your day? Tell me as if you were calling me:"
              value={dayDescription}
              onChangeText={setDayDescription}
              placeholder="Examples: Traveling, important meetings, home with family, difficult due to functions"
              multiline
              numberOfLines={4}
              style={styles.dayDescriptionInput}
            />
            
            <Button
              title={isLoading ? "Saving..." : "Save Habit Entry"}
              onPress={handleSave}
              style={styles.saveButton}
              loading={isLoading}
              disabled={isLoading}
            />
            
            <Button
              title="Cancel"
              variant="outline"
              onPress={handleBack}
              style={styles.cancelButton}
            />
          </Card>
        </View>
      </ScrollView>
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
  cardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 18,
    color: Colors.primary,
    marginBottom: 24,
  },
  dayDescriptionInput: {
    marginTop: 16,
  },
  saveButton: {
    marginTop: 24,
  },
  cancelButton: {
    marginTop: 12,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 8,
  },
  dateLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginRight: 12,
  },
  datePicker: {
    flex: 1,
  },
});