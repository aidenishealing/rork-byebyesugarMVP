import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Platform,
  FlatList,
  Image,
  ColorValue
} from 'react-native';
import { useRouter } from 'expo-router';
import { Calendar, History, User, Bell, Edit, Plus, ChevronLeft, ChevronRight, MessageCircle, FileText } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Header from '@/components/Header';
import Card from '@/components/Card';
import YesNoQuestion from '@/components/YesNoQuestion';
import Input from '@/components/Input';
import Slider from '@/components/Slider';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useHabitsStore } from '@/store/habits-store';
import { useAuthStore } from '@/store/auth-store';
import { useRemindersStore } from '@/store/reminders-store';
import { formatDisplayDate, format } from '@/utils/date';
import { DailyHabits } from '@/types/habit';
import HabitHistoryCard from '@/components/HabitHistoryCard';
import ReminderModal from '@/components/ReminderModal';
import ConfirmationModal from '@/components/ConfirmationModal';
import VoiceInput from '@/components/VoiceInput';
import VoiceHabitProcessor from '@/components/VoiceHabitProcessor';
import BloodworkUploadModal from '@/components/BloodworkUploadModal';
import BloodworkDocumentsList from '@/components/BloodworkDocumentsList';
import DatePicker from '@/components/DatePicker';
import { BloodworkDocument } from '@/types/habit';

export default function ClientHomeScreen() {
  const router = useRouter();
  const { isAuthenticated, isAdmin, user, updateProfile, logout } = useAuthStore();
  const { 
    todayHabits, 
    initTodayHabits, 
    updateHabit, 
    saveHabits,
    clientHabits,
    editHabit,
    fetchClientHabits,
    getHabitByDate,
    isLoading,
    error
  } = useHabitsStore();
  
  const {
    reminders,
    addReminder,
    editReminder,
    deleteReminder,
    toggleReminder
  } = useRemindersStore();
  
  const [activeTab, setActiveTab] = useState('today');
  const [editingHabit, setEditingHabit] = useState<DailyHabits | null>(null);
  const [viewingHabit, setViewingHabit] = useState<DailyHabits | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [profileModalVisible, setProfileModalVisible] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profilePhoneNumber, setProfilePhoneNumber] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Reminder state
  const [reminderModalVisible, setReminderModalVisible] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<any>(null);
  const [isEditingReminder, setIsEditingReminder] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [reminderToDelete, setReminderToDelete] = useState<string | null>(null);
  
  // Logout confirmation
  const [logoutConfirmVisible, setLogoutConfirmVisible] = useState(false);
  
  // Voice input state
  const [voiceProcessorVisible, setVoiceProcessorVisible] = useState(false);
  const [voiceTranscription, setVoiceTranscription] = useState('');
  
  // Bloodwork state
  const [bloodworkModalVisible, setBloodworkModalVisible] = useState(false);
  const [bloodworkDocuments, setBloodworkDocuments] = useState<BloodworkDocument[]>([]);
  const [loadingBloodwork, setLoadingBloodwork] = useState(false);
  
  useEffect(() => {
    // Check authentication
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    
    // Redirect admin users
    if (isAdmin) {
      router.replace('/admin');
      return;
    }
    
    // Initialize today's habits
    initTodayHabits();
    
    // Fetch client habits if user exists
    if (user) {
      fetchClientHabits(user.id);
      setProfileName(user.name);
      setProfilePhoneNumber(user.phoneNumber);
    }
  }, [isAuthenticated, isAdmin, router, initTodayHabits, user, fetchClientHabits]);
  
  // Effect to load habits when date changes
  useEffect(() => {
    if (user) {
      const formattedDate = format(currentDate, 'yyyy-MM-dd');
      const habitForDate = getHabitByDate(formattedDate);
      
      if (habitForDate) {
        // If we have data for this date, load it
        updateHabit('date', formattedDate);
        updateHabit('weightCheck', habitForDate.weightCheck);
        updateHabit('morningAcvWater', habitForDate.morningAcvWater);
        updateHabit('championWorkout', habitForDate.championWorkout);
        updateHabit('meal10am', habitForDate.meal10am);
        updateHabit('hungerTimes', habitForDate.hungerTimes);
        updateHabit('outdoorTime', habitForDate.outdoorTime);
        updateHabit('energyLevel2pm', habitForDate.energyLevel2pm);
        updateHabit('meal6pm', habitForDate.meal6pm);
        updateHabit('energyLevel8pm', habitForDate.energyLevel8pm);
        updateHabit('wimHof', habitForDate.wimHof);
        updateHabit('trackedSleep', habitForDate.trackedSleep);
        updateHabit('dayDescription', habitForDate.dayDescription);
      } else {
        // If no data for this date, initialize with empty values
        updateHabit('date', formattedDate);
        updateHabit('weightCheck', null);
        updateHabit('morningAcvWater', null);
        updateHabit('championWorkout', null);
        updateHabit('meal10am', '');
        updateHabit('hungerTimes', '');
        updateHabit('outdoorTime', '');
        updateHabit('energyLevel2pm', 5);
        updateHabit('meal6pm', '');
        updateHabit('energyLevel8pm', 5);
        updateHabit('wimHof', null);
        updateHabit('trackedSleep', null);
        updateHabit('dayDescription', '');
      }
    }
  }, [currentDate, user, getHabitByDate]);
  
  const handleSave = async () => {
    if (isLoading) return;
    
    // Format the current date to match the expected format
    const formattedDate = format(currentDate, 'yyyy-MM-dd');
    console.log('Saving habits for date:', formattedDate, 'currentDate:', currentDate, 'currentDate ISO:', currentDate.toISOString());
    
    const success = await saveHabits(formattedDate);
    
    if (success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
      
      Alert.alert(
        'Success',
        'Your habits have been saved successfully!',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Error',
        'Failed to save your habits. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleLogout = () => {
    setLogoutConfirmVisible(true);
  };
  
  const confirmLogout = () => {
    logout();
    // Force navigation to welcome screen
    router.replace('/');
  };
  
  const handleEditHabit = (habit: DailyHabits) => {
    setEditingHabit({...habit});
    setEditModalVisible(true);
  };
  
  const handleViewHabit = (habit: DailyHabits) => {
    setViewingHabit({...habit});
    setViewModalVisible(true);
  };
  
  const handleUpdateHabitInEdit = (key: keyof DailyHabits, value: any) => {
    if (!editingHabit) return;
    
    setEditingHabit({
      ...editingHabit,
      [key]: value
    });
  };
  
  const handleSaveEdit = async () => {
    if (!editingHabit || isLoading) return;
    
    const success = await editHabit(editingHabit.date, editingHabit);
    setEditModalVisible(false);
    
    if (success) {
      Alert.alert(
        'Success',
        'Your habit entry has been updated!',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Error',
        'Failed to update your habit entry. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };
  
  const handleSaveProfile = () => {
    updateProfile(profileName, profilePhoneNumber);
    setProfileModalVisible(false);
    
    Alert.alert(
      'Success',
      'Your profile has been updated!',
      [{ text: 'OK' }]
    );
  };
  
  // Date navigation
  const goToPreviousDay = () => {
    const prevDate = new Date(currentDate);
    prevDate.setDate(prevDate.getDate() - 1);
    console.log('Going to previous day:', prevDate, 'formatted:', format(prevDate, 'yyyy-MM-dd'));
    setCurrentDate(prevDate);
  };
  
  const goToNextDay = () => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + 1);
    
    // Don't allow navigating to future dates
    if (nextDate <= new Date()) {
      console.log('Going to next day:', nextDate, 'formatted:', format(nextDate, 'yyyy-MM-dd'));
      setCurrentDate(nextDate);
    }
  };
  
  const handleDateChange = (newDate: Date) => {
    console.log('Date changed in client:', newDate, 'formatted:', format(newDate, 'yyyy-MM-dd'));
    setCurrentDate(newDate);
  };
  
  // Reminder handlers
  const handleAddReminder = () => {
    if (Platform.OS === 'web') {
      Alert.alert(
        'Reminders',
        'Reminders are not available on web. Please use the mobile app.',
        [{ text: 'OK' }]
      );
      return;
    }
    
    setSelectedReminder(null);
    setIsEditingReminder(false);
    setReminderModalVisible(true);
  };
  
  const handleEditReminderClick = (reminder: any) => {
    setSelectedReminder(reminder);
    setIsEditingReminder(true);
    setReminderModalVisible(true);
  };
  
  const handleDeleteReminderClick = (id: string) => {
    setReminderToDelete(id);
    setDeleteConfirmVisible(true);
  };
  
  const handleSaveReminder = (title: string, time: string) => {
    console.log('Saving reminder:', { title, time, isEditing: isEditingReminder });
    
    if (isEditingReminder && selectedReminder) {
      console.log('Editing reminder:', selectedReminder.id, 'from', selectedReminder.time, 'to', time);
      editReminder(selectedReminder.id, title, time);
      Alert.alert('Success', 'Reminder updated successfully!');
    } else {
      console.log('Adding new reminder:', { title, time });
      addReminder(title, time);
      Alert.alert('Success', 'Reminder added successfully!');
    }
    setReminderModalVisible(false);
  };
  
  const handleConfirmDeleteReminder = () => {
    if (reminderToDelete) {
      deleteReminder(reminderToDelete);
      setReminderToDelete(null);
      Alert.alert('Success', 'Reminder deleted successfully!');
    }
    setDeleteConfirmVisible(false);
  };
  
  const handleToggleReminder = (id: string) => {
    toggleReminder(id);
    Alert.alert('Success', 'Reminder status updated!');
  };
  
  // Bloodwork handlers
  const handleBloodworkUploadSuccess = () => {
    // Refresh bloodwork documents list
    fetchBloodworkDocuments();
  };
  
  const fetchBloodworkDocuments = async () => {
    setLoadingBloodwork(true);
    try {
      // In a real app, this would use trpc.bloodwork.get.useQuery()
      // For now, we'll simulate with mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockDocuments: BloodworkDocument[] = [
        {
          id: 'doc_1',
          userId: user?.id || '',
          fileName: 'Blood_Test_Results_Jan_2024.pdf',
          fileType: 'application/pdf',
          fileSize: 2048576,
          uploadDate: '2024-01-15T10:30:00Z',
          fileUrl: 'https://storage.example.com/bloodwork/doc_1',
          createdAt: '2024-01-15T10:30:00Z',
          updatedAt: '2024-01-15T10:30:00Z',
        },
        {
          id: 'doc_2',
          userId: user?.id || '',
          fileName: 'Lab_Report_Dec_2023.pdf',
          fileType: 'application/pdf',
          fileSize: 1536000,
          uploadDate: '2023-12-20T14:45:00Z',
          fileUrl: 'https://storage.example.com/bloodwork/doc_2',
          createdAt: '2023-12-20T14:45:00Z',
          updatedAt: '2023-12-20T14:45:00Z',
        },
      ];
      
      setBloodworkDocuments(mockDocuments);
    } catch (error) {
      console.error('Error fetching bloodwork documents:', error);
      Alert.alert('Error', 'Failed to load bloodwork documents.');
    } finally {
      setLoadingBloodwork(false);
    }
  };
  
  // Load bloodwork documents on component mount
  useEffect(() => {
    if (user) {
      fetchBloodworkDocuments();
    }
  }, [user]);
  
  // Voice input handlers
  const handleVoiceTranscription = (text: string) => {
    console.log('Voice transcription received:', text);
    setVoiceTranscription(text);
    setVoiceProcessorVisible(true);
  };
  
  const handleVoiceHabitUpdates = (updates: Partial<DailyHabits>) => {
    console.log('Applying voice habit updates:', updates);
    
    // Apply each update to the current habits
    Object.entries(updates).forEach(([key, value]) => {
      updateHabit(key as keyof DailyHabits, value);
    });
    
    // Show success message
    Alert.alert(
      'Voice Input Applied',
      `Successfully updated ${Object.keys(updates).length} habit${Object.keys(updates).length !== 1 ? 's' : ''} from your voice input.`,
      [{ text: 'OK' }]
    );
    
    setVoiceProcessorVisible(false);
    setVoiceTranscription('');
  };
  
  // History tab content
  const renderHistoryTab = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Loading your habit history...</Text>
        </View>
      );
    }
    
    const habitsList = Object.values(clientHabits).sort((a, b) => {
      const habitA = a as DailyHabits;
      const habitB = b as DailyHabits;
      return new Date(habitB.date).getTime() - new Date(habitA.date).getTime();
    });
    
    if (habitsList.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No habit history found.</Text>
          <Text style={styles.emptySubtext}>
            Start tracking your habits today!
          </Text>
        </View>
      );
    }
    
    return (
      <View style={styles.historyContainer}>
        <Text style={styles.historyTitle}>Your Habit History</Text>
        {habitsList.map((habit) => {
          const dailyHabit = habit as DailyHabits;
          return (
            <HabitHistoryCard 
              key={dailyHabit.date}
              habits={dailyHabit}
              onView={handleViewHabit}
              onEdit={handleEditHabit}
            />
          );
        })}
      </View>
    );
  };
  
  // Profile tab content
  const renderProfileTab = () => {
    // Define gradient colors with proper typing
    const gradientColors: readonly [ColorValue, ColorValue] = ['#E6A817', '#FFD166'];
    
    return (
      <View style={styles.profileContainer}>
        <View style={styles.profileHeader}>
          <View style={styles.profileAvatar}>
            <LinearGradient
              colors={gradientColors}
              style={styles.profileAvatarGradient}
            >
              <Text style={styles.profileAvatarText}>
                {user?.name?.charAt(0) || 'U'}
              </Text>
            </LinearGradient>
          </View>
          <Text style={styles.profileName}>{user?.name || 'User'}</Text>
          <Text style={styles.profilePhoneNumber}>{user?.phoneNumber || ''}</Text>
        </View>
        
        <Card style={styles.profileCard}>
          <TouchableOpacity 
            style={styles.profileOption}
            onPress={() => setProfileModalVisible(true)}
          >
            <Edit size={24} color={Colors.primary} />
            <Text style={styles.profileOptionText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.profileOption}
            onPress={() => setBloodworkModalVisible(true)}
          >
            <FileText size={24} color={Colors.accent} />
            <Text style={[styles.profileOptionText, { color: Colors.accent }]}>Add Bloodwork</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.profileOption}
            onPress={() => setActiveTab('reminders')}
          >
            <Bell size={24} color={Colors.secondary} />
            <Text style={[styles.profileOptionText, { color: Colors.secondary }]}>Reminders</Text>
          </TouchableOpacity>
          
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.profileOption}
            onPress={handleLogout}
          >
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </Card>
        
        <Card style={styles.profileCard}>
          <View style={styles.bloodworkHeader}>
            <Text style={styles.bloodworkTitle}>Bloodwork</Text>
            <TouchableOpacity 
              style={styles.addBloodworkButton}
              onPress={() => setBloodworkModalVisible(true)}
            >
              <Plus size={20} color={Colors.primary} />
              <Text style={styles.addBloodworkText}>Add</Text>
            </TouchableOpacity>
          </View>
          
          <BloodworkDocumentsList
            documents={bloodworkDocuments}
            isLoading={loadingBloodwork}
            emptyMessage="Upload your first bloodwork document to get started"
          />
        </Card>
      </View>
    );
  };
  
  // Reminders tab content
  const renderRemindersTab = () => {
    return (
      <View style={styles.remindersContainer}>
        <Text style={styles.remindersTitle}>Daily Reminders</Text>
        
        {reminders.length > 0 ? (
          <View style={styles.reminderListContainer}>
            {reminders.map(item => (
              <Card key={item.id} style={styles.reminderCard}>
                <View style={styles.reminderHeader}>
                  <Text style={styles.reminderTime}>{item.time}</Text>
                  <TouchableOpacity
                    onPress={() => handleToggleReminder(item.id)}
                    style={[
                      styles.toggleButton,
                      item.enabled ? styles.toggleButtonEnabled : styles.toggleButtonDisabled
                    ]}
                  >
                    <Text style={[
                      styles.toggleText,
                      item.enabled ? styles.toggleEnabled : styles.toggleDisabled
                    ]}>
                      {item.enabled ? "ON" : "OFF"}
                    </Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.reminderText}>{item.title}</Text>
                <View style={styles.reminderActions}>
                  <TouchableOpacity 
                    style={styles.reminderButton}
                    onPress={() => handleEditReminderClick(item)}
                  >
                    <Text style={styles.reminderButtonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.reminderButton, styles.reminderDeleteButton]}
                    onPress={() => handleDeleteReminderClick(item.id)}
                  >
                    <Text style={styles.reminderDeleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            ))}
          </View>
        ) : (
          <View style={styles.emptyReminders}>
            <Text style={styles.emptyRemindersText}>No reminders set</Text>
            <Text style={styles.emptyRemindersSubtext}>
              Add reminders to help you stay on track with your habits
            </Text>
          </View>
        )}
        

        
        <Button
          title="Back to Profile"
          variant="outline"
          onPress={() => setActiveTab('profile')}
          style={styles.backButton}
        />
      </View>
    );
  };
  
  // Today tab content (habit tracking)
  const renderTodayTab = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>
            {isLoading ? "Saving your habits..." : "Loading your habits..."}
          </Text>
        </View>
      );
    }
    
    if (!todayHabits) {
      return (
        <View style={styles.loadingContainer}>
          <Text>No habit data available. Please try again.</Text>
          <Button 
            title="Reload" 
            onPress={initTodayHabits}
            style={styles.reloadButton}
          />
        </View>
      );
    }
    
    return (
      <View style={styles.todayContainer}>
        <View style={styles.dateNavigationContainer}>
          <TouchableOpacity 
            onPress={goToPreviousDay}
            style={styles.dateNavButton}
          >
            <ChevronLeft size={24} color={Colors.primary} />
          </TouchableOpacity>
          
          <View style={styles.dateAndVoiceContainer}>
            <DatePicker
              selectedDate={currentDate}
              onDateChange={handleDateChange}
              style={styles.datePicker}
              disabled={isLoading}
            />
            <VoiceInput
              onTranscriptionComplete={handleVoiceTranscription}
              style={styles.voiceInputButton}
              disabled={isLoading}
            />
          </View>
          
          <TouchableOpacity 
            onPress={goToNextDay}
            style={[
              styles.dateNavButton,
              // Disable next button if current date is today
              new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) && styles.dateNavButtonDisabled
            ]}
            disabled={new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0)}
          >
            <ChevronRight size={24} color={new Date(currentDate).setHours(0,0,0,0) >= new Date().setHours(0,0,0,0) ? Colors.textSecondary : Colors.primary} />
          </TouchableOpacity>
        </View>
        
        <Card>
          <View style={styles.cardGradient}>
            <Text style={styles.cardTitle}>Daily Habits Tracker</Text>
            
            <YesNoQuestion
              question="Weight Check?"
              value={todayHabits.weightCheck as string}
              onChange={(value) => updateHabit('weightCheck', value)}
            />
            
            <YesNoQuestion
              question="Morning ACV + 3 Bottles of Water?"
              value={todayHabits.morningAcvWater as string}
              onChange={(value) => updateHabit('morningAcvWater', value)}
            />
            
            <YesNoQuestion
              question="Completed Champion Workout?"
              value={todayHabits.championWorkout as string}
              onChange={(value) => updateHabit('championWorkout', value)}
            />
            
            <Input
              label="Write 10am meal:"
              value={todayHabits.meal10am}
              onChangeText={(text) => updateHabit('meal10am', text)}
              multiline
              numberOfLines={2}
            />
            
            <Input
              label="When did you feel hunger? (EX: noon and 7pm)"
              value={todayHabits.hungerTimes}
              onChangeText={(text) => updateHabit('hungerTimes', text)}
            />
            
            <Input
              label="Time Outside (EX: 30 minute walk)"
              value={todayHabits.outdoorTime}
              onChangeText={(text) => updateHabit('outdoorTime', text)}
            />
            
            <Slider
              label="Energy Levels 2pm 0-10:"
              value={todayHabits.energyLevel2pm as number}
              onValueChange={(value) => updateHabit('energyLevel2pm', value)}
            />
            
            <Input
              label="Write 6pm meal:"
              value={todayHabits.meal6pm}
              onChangeText={(text) => updateHabit('meal6pm', text)}
              multiline
              numberOfLines={2}
            />
            
            <Slider
              label="Energy Levels 8pm 0-10:"
              value={todayHabits.energyLevel8pm as number}
              onValueChange={(value) => updateHabit('energyLevel8pm', value)}
            />
            
            <YesNoQuestion
              question="Wim Hof before bed?"
              value={todayHabits.wimHof as string}
              onChange={(value) => updateHabit('wimHof', value)}
            />
            
            <YesNoQuestion
              question="Tracked Sleep?"
              value={todayHabits.trackedSleep as string}
              onChange={(value) => updateHabit('trackedSleep', value)}
            />
            
            <Input
              label="How was your day? Tell me as if you were calling me:"
              value={todayHabits.dayDescription || ''}
              onChangeText={(text) => updateHabit('dayDescription', text)}
              placeholder="Examples: Traveling, important meetings, home with family, difficult due to functions"
              multiline
              numberOfLines={4}
              style={styles.dayDescriptionInput}
            />
            
            <Button
              title={isLoading ? "Saving your habits..." : "Save Today's Habits"}
              onPress={handleSave}
              style={styles.saveButton}
              loading={isLoading}
              disabled={isLoading}
            />
            
            {saveSuccess && (
              <View style={styles.successMessage}>
                <Text style={styles.successText}>✓ Habits saved successfully!</Text>
              </View>
            )}
            
            {error && <Text style={styles.errorText}>{error}</Text>}
          </View>
        </Card>
      </View>
    );
  };
  
  // Edit Habit Modal
  const renderEditModal = () => {
    if (!editingHabit) return null;
    
    const habitDate = new Date(editingHabit.date);
    const formattedDate = habitDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return (
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Header 
            title={`Edit Habits - ${formattedDate}`} 
            showBackButton 
            onBackPress={() => setEditModalVisible(false)} 
          />
          
          <ScrollView style={styles.modalContent}>
            <Card>
              <YesNoQuestion
                question="Weight Check?"
                value={editingHabit.weightCheck as string}
                onChange={(value) => handleUpdateHabitInEdit('weightCheck', value)}
              />
              
              <YesNoQuestion
                question="Morning ACV + 3 Bottles of Water?"
                value={editingHabit.morningAcvWater as string}
                onChange={(value) => handleUpdateHabitInEdit('morningAcvWater', value)}
              />
              
              <YesNoQuestion
                question="Completed Champion Workout?"
                value={editingHabit.championWorkout as string}
                onChange={(value) => handleUpdateHabitInEdit('championWorkout', value)}
              />
              
              <Input
                label="Write 10am meal:"
                value={editingHabit.meal10am}
                onChangeText={(text) => handleUpdateHabitInEdit('meal10am', text)}
                multiline
                numberOfLines={2}
              />
              
              <Input
                label="When did you feel hunger? (EX: noon and 7pm)"
                value={editingHabit.hungerTimes}
                onChangeText={(text) => handleUpdateHabitInEdit('hungerTimes', text)}
              />
              
              <Input
                label="Time Outside (EX: 30 minute walk)"
                value={editingHabit.outdoorTime}
                onChangeText={(text) => handleUpdateHabitInEdit('outdoorTime', text)}
              />
              
              <Slider
                label="Energy Levels 2pm 0-10:"
                value={editingHabit.energyLevel2pm as number}
                onValueChange={(value) => handleUpdateHabitInEdit('energyLevel2pm', value)}
              />
              
              <Input
                label="Write 6pm meal:"
                value={editingHabit.meal6pm}
                onChangeText={(text) => handleUpdateHabitInEdit('meal6pm', text)}
                multiline
                numberOfLines={2}
              />
              
              <Slider
                label="Energy Levels 8pm 0-10:"
                value={editingHabit.energyLevel8pm as number}
                onValueChange={(value) => handleUpdateHabitInEdit('energyLevel8pm', value)}
              />
              
              <YesNoQuestion
                question="Wim Hof before bed?"
                value={editingHabit.wimHof as string}
                onChange={(value) => handleUpdateHabitInEdit('wimHof', value)}
              />
              
              <YesNoQuestion
                question="Tracked Sleep?"
                value={editingHabit.trackedSleep as string}
                onChange={(value) => handleUpdateHabitInEdit('trackedSleep', value)}
              />
              
              <Input
                label="How was your day? Tell me as if you were calling me:"
                value={editingHabit.dayDescription || ''}
                onChangeText={(text) => handleUpdateHabitInEdit('dayDescription', text)}
                placeholder="Examples: Traveling, important meetings, home with family, difficult due to functions"
                multiline
                numberOfLines={4}
                style={styles.dayDescriptionInput}
              />
              
              <Button
                title={isLoading ? "Saving..." : "Save Changes"}
                onPress={handleSaveEdit}
                style={styles.saveButton}
                loading={isLoading}
                disabled={isLoading}
              />
              
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setEditModalVisible(false)}
                style={styles.cancelButton}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };
  
  // View Habit Modal
  const renderViewModal = () => {
    if (!viewingHabit) return null;
    
    const habitDate = new Date(viewingHabit.date);
    const formattedDate = habitDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    return (
      <Modal
        visible={viewModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setViewModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Header 
            title={`Habits - ${formattedDate}`} 
            showBackButton 
            onBackPress={() => setViewModalVisible(false)} 
          />
          
          <ScrollView style={styles.modalContent}>
            <Card>
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Weight Check:</Text>
                <Text style={[
                  styles.viewValue,
                  viewingHabit.weightCheck === 'yes' ? styles.positiveValue : 
                  viewingHabit.weightCheck === 'no' ? styles.negativeValue : styles.neutralValue
                ]}>
                  {viewingHabit.weightCheck || 'Not recorded'}
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Morning ACV + Water:</Text>
                <Text style={[
                  styles.viewValue,
                  viewingHabit.morningAcvWater === 'yes' ? styles.positiveValue : 
                  viewingHabit.morningAcvWater === 'no' ? styles.negativeValue : styles.neutralValue
                ]}>
                  {viewingHabit.morningAcvWater || 'Not recorded'}
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Champion Workout:</Text>
                <Text style={[
                  styles.viewValue,
                  viewingHabit.championWorkout === 'yes' ? styles.positiveValue : 
                  viewingHabit.championWorkout === 'no' ? styles.negativeValue : styles.neutralValue
                ]}>
                  {viewingHabit.championWorkout || 'Not recorded'}
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>10am Meal:</Text>
                <Text style={styles.viewValue}>
                  {viewingHabit.meal10am || 'Not recorded'}
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Hunger Times:</Text>
                <Text style={styles.viewValue}>
                  {viewingHabit.hungerTimes || 'Not recorded'}
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Outdoor Time:</Text>
                <Text style={styles.viewValue}>
                  {viewingHabit.outdoorTime || 'Not recorded'}
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Energy at 2pm:</Text>
                <Text style={[
                  styles.viewValue,
                  viewingHabit.energyLevel2pm >= 7 ? styles.positiveValue : 
                  viewingHabit.energyLevel2pm <= 3 ? styles.negativeValue : styles.neutralValue
                ]}>
                  {viewingHabit.energyLevel2pm}/10
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>6pm Meal:</Text>
                <Text style={styles.viewValue}>
                  {viewingHabit.meal6pm || 'Not recorded'}
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Energy at 8pm:</Text>
                <Text style={[
                  styles.viewValue,
                  viewingHabit.energyLevel8pm >= 7 ? styles.positiveValue : 
                  viewingHabit.energyLevel8pm <= 3 ? styles.negativeValue : styles.neutralValue
                ]}>
                  {viewingHabit.energyLevel8pm}/10
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Wim Hof before bed:</Text>
                <Text style={[
                  styles.viewValue,
                  viewingHabit.wimHof === 'yes' ? styles.positiveValue : 
                  viewingHabit.wimHof === 'no' ? styles.negativeValue : styles.neutralValue
                ]}>
                  {viewingHabit.wimHof || 'Not recorded'}
                </Text>
              </View>
              
              <View style={styles.viewItem}>
                <Text style={styles.viewLabel}>Tracked Sleep:</Text>
                <Text style={[
                  styles.viewValue,
                  viewingHabit.trackedSleep === 'yes' ? styles.positiveValue : 
                  viewingHabit.trackedSleep === 'no' ? styles.negativeValue : styles.neutralValue
                ]}>
                  {viewingHabit.trackedSleep || 'Not recorded'}
                </Text>
              </View>
              
              {viewingHabit.dayDescription && (
                <View style={styles.dayDescriptionView}>
                  <Text style={styles.dayDescriptionLabel}>How was your day:</Text>
                  <Text style={styles.dayDescriptionValue}>
                    {viewingHabit.dayDescription}
                  </Text>
                </View>
              )}
              
              <Button
                title="Edit This Entry"
                onPress={() => {
                  setViewModalVisible(false);
                  handleEditHabit(viewingHabit);
                }}
                style={styles.editButton}
              />
              
              <Button
                title="Close"
                variant="outline"
                onPress={() => setViewModalVisible(false)}
                style={styles.cancelButton}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };
  
  // Profile Edit Modal
  const renderProfileModal = () => {
    return (
      <Modal
        visible={profileModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Header 
            title="Edit Profile" 
            showBackButton 
            onBackPress={() => setProfileModalVisible(false)} 
          />
          
          <ScrollView style={styles.modalContent}>
            <Card>
              <Input
                label="Name"
                value={profileName}
                onChangeText={setProfileName}
                placeholder="Enter your name"
              />
              
              <Input
                label="Phone Number"
                value={profilePhoneNumber}
                onChangeText={setProfilePhoneNumber}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
              
              <Button
                title="Save Profile"
                onPress={handleSaveProfile}
                style={styles.saveButton}
              />
              
              <Button
                title="Cancel"
                variant="outline"
                onPress={() => setProfileModalVisible(false)}
                style={styles.cancelButton}
              />
            </Card>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background} />
      
      <Header 
        title={
          <View style={styles.headerTitleContainer}>
            <View style={styles.headerLogo}>
              <Image 
                source={{ uri: 'https://images.unsplash.com/photo-1620127682229-33388276e540?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' }}
                style={styles.headerLogoImage}
                resizeMode="cover"
              />
            </View>
            {activeTab === 'today' ? (
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitleFirst}>Bye</Text>
                <Text style={styles.headerTitleSecond}>Bye</Text>
                <Text style={styles.headerTitleThird}>Sugar</Text>
              </View>
            ) : (
              <Text style={styles.headerText}>
                {activeTab === 'history' ? 'Habit History' : 
                activeTab === 'reminders' ? 'Reminders' : 'Profile'}
              </Text>
            )}
          </View>
        } 
        showLogout={activeTab !== 'profile' && activeTab !== 'reminders'} 
        onLogout={handleLogout}
      />
      
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
      >
        {activeTab === 'today' && renderTodayTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'profile' && renderProfileTab()}
        {activeTab === 'reminders' && renderRemindersTab()}
      </ScrollView>
      
      <View style={styles.tabBar} pointerEvents="box-none">
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => {
            console.log('Today tab pressed');
            setActiveTab('today');
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          delayPressIn={0}
          delayPressOut={50}
          testID="tab-today"
        >
          <Calendar 
            size={24} 
            color={activeTab === 'today' ? Colors.primary : Colors.textSecondary} 
          />
          <Text 
            style={activeTab === 'today' ? styles.tabTextActive : styles.tabText}
          >
            Today
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => {
            console.log('History tab pressed');
            setActiveTab('history');
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          delayPressIn={0}
          delayPressOut={50}
          testID="tab-history"
        >
          <History 
            size={24} 
            color={activeTab === 'history' ? Colors.secondary : Colors.textSecondary} 
          />
          <Text 
            style={[
              activeTab === 'history' ? styles.tabTextActive : styles.tabText,
              activeTab === 'history' && { color: Colors.secondary }
            ]}
          >
            History
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tabItem} 
          onPress={() => {
            console.log('Profile tab pressed');
            setActiveTab('profile');
          }}
          activeOpacity={0.7}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          delayPressIn={0}
          delayPressOut={50}
          testID="tab-profile"
        >
          <User 
            size={24} 
            color={activeTab === 'profile' || activeTab === 'reminders' ? Colors.accent : Colors.textSecondary} 
          />
          <Text 
            style={[
              activeTab === 'profile' || activeTab === 'reminders' ? styles.tabTextActive : styles.tabText,
              (activeTab === 'profile' || activeTab === 'reminders') && { color: Colors.accent }
            ]}
          >
            Profile
          </Text>
        </TouchableOpacity>
      </View>
      
      {renderEditModal()}
      {renderViewModal()}
      {renderProfileModal()}
      
      {/* Reminder Modal */}
      <ReminderModal
        visible={reminderModalVisible}
        onClose={() => setReminderModalVisible(false)}
        onSave={handleSaveReminder}
        reminder={selectedReminder}
        isEditing={isEditingReminder}
      />
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        visible={deleteConfirmVisible}
        onClose={() => setDeleteConfirmVisible(false)}
        onConfirm={handleConfirmDeleteReminder}
        title="Delete Reminder"
        message="Are you sure you want to delete this reminder? This action cannot be undone."
        confirmText="Delete"
        isDestructive={true}
      />
      
      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        visible={logoutConfirmVisible}
        onClose={() => setLogoutConfirmVisible(false)}
        onConfirm={confirmLogout}
        title="Logout"
        message="Are you sure you want to logout from your account?"
        confirmText="Logout"
        isDestructive={true}
      />
      
      {/* Voice Habit Processor Modal */}
      <VoiceHabitProcessor
        visible={voiceProcessorVisible}
        transcribedText={voiceTranscription}
        currentHabits={todayHabits || {
          id: 'temp-id',
          userId: user?.id || '',
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
          dayDescription: '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }}
        onClose={() => {
          setVoiceProcessorVisible(false);
          setVoiceTranscription('');
        }}
        onApplyChanges={handleVoiceHabitUpdates}
      />
      
      {/* Bloodwork Upload Modal */}
      <BloodworkUploadModal
        visible={bloodworkModalVisible}
        onClose={() => setBloodworkModalVisible(false)}
        onUploadSuccess={handleBloodworkUploadSuccess}
      />
      
      {/* Chat button */}
      <TouchableOpacity 
        style={styles.chatButton}
        onPress={() => {
          console.log('Chat button pressed');
          router.push('/chat');
        }}
        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
        delayPressIn={0}
        delayPressOut={50}
        activeOpacity={0.8}
        testID="chat-button"
      >
        <MessageCircle size={24} color="white" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100, // Extra padding for tab bar
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 18,
    color: Colors.textSecondary,
  },
  reloadButton: {
    marginTop: 16,
  },
  errorText: {
    color: Colors.error,
    marginTop: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  successMessage: {
    backgroundColor: `${Colors.success}20`,
    padding: 12,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  successText: {
    color: Colors.success,
    fontSize: 16,
    fontWeight: '600',
  },
  
  // Header styles
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerLogo: {
    width: 36,
    height: 36,
    marginRight: 10,
    backgroundColor: '#FFF8E8',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    overflow: 'hidden',
  },
  headerLogoImage: {
    width: '100%',
    height: '100%',
    tintColor: '#E6A817',
  },
  headerTextContainer: {
    flexDirection: 'row',
  },
  headerText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.text,
  },
  headerTitleFirst: {
    color: '#E6A817',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitleSecond: {
    color: '#E6A817',
    fontSize: 28,
    fontWeight: 'bold',
  },
  headerTitleThird: {
    color: '#000000',
    fontSize: 28,
    fontWeight: 'bold',
  },
  
  // Today tab styles
  todayContainer: {
    flex: 1,
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
  dateAndVoiceContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 12,
  },
  datePicker: {
    marginBottom: 12,
    alignSelf: 'center',
  },
  voiceInputButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 40,
  },
  cardGradient: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  cardTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 24,
  },
  saveButton: {
    marginTop: 24,
  },
  cancelButton: {
    marginTop: 12,
  },
  editButton: {
    marginTop: 24,
  },
  dayDescriptionInput: {
    marginTop: 16,
  },
  dayDescriptionView: {
    marginTop: 16,
    padding: 16,
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
  },
  dayDescriptionLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  dayDescriptionValue: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
  },
  
  // History tab styles
  historyContainer: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginTop: 40,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Profile tab styles
  profileContainer: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    overflow: 'hidden',
  },
  profileAvatarGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 44,
    fontWeight: 'bold',
    color: 'white',
  },
  profileName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 4,
  },
  profilePhoneNumber: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  profileCard: {
    marginBottom: 16,
  },
  profileOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
  },
  profileOptionText: {
    fontSize: 20,
    color: Colors.primary,
    marginLeft: 12,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 8,
  },
  logoutText: {
    fontSize: 20,
    color: Colors.error,
    fontWeight: '500',
  },
  
  // Reminders tab styles
  remindersContainer: {
    flex: 1,
  },
  remindersTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  reminderListContainer: {
    marginBottom: 16,
  },
  reminderCard: {
    marginBottom: 16,
  },
  reminderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  reminderTime: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  toggleButton: {
    padding: 8,
    borderRadius: 16,
    minWidth: 60,
    alignItems: 'center',
  },
  toggleButtonEnabled: {
    backgroundColor: `${Colors.success}20`,
  },
  toggleButtonDisabled: {
    backgroundColor: `${Colors.textSecondary}20`,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  toggleEnabled: {
    color: Colors.success,
  },
  toggleDisabled: {
    color: Colors.textSecondary,
  },
  reminderText: {
    fontSize: 18,
    color: Colors.text,
    marginBottom: 16,
  },
  reminderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
  },
  reminderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: `${Colors.secondary}20`,
    marginLeft: 12,
  },
  reminderButtonText: {
    color: Colors.secondary,
    fontWeight: '600',
    fontSize: 16,
  },
  reminderDeleteButton: {
    backgroundColor: `${Colors.error}20`,
  },
  reminderDeleteText: {
    color: Colors.error,
    fontWeight: '600',
    fontSize: 16,
  },
  addReminderButton: {
    marginTop: 16,
  },
  backButton: {
    marginTop: 12,
  },
  emptyReminders: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    marginVertical: 20,
    backgroundColor: Colors.card,
    borderRadius: 16,
  },
  emptyRemindersText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 8,
  },
  emptyRemindersSubtext: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalContent: {
    flex: 1,
    padding: 16,
  },
  
  // View habit styles
  viewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  viewLabel: {
    fontSize: 18,
    color: Colors.text,
    flex: 1,
    paddingRight: 8,
  },
  viewValue: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.text,
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
  
  // Tab bar styles
  tabBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingVertical: 10,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    // Ensure tab bar doesn't interfere with touch events
    zIndex: 10,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    minHeight: 48,
    flex: 1,
    // Ensure proper touch handling
    overflow: 'visible',
  },
  tabText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  tabTextActive: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  
  // Chat button
  chatButton: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    // Ensure chat button is always touchable
    zIndex: 20,
    overflow: 'visible',
  },
  
  // Bloodwork styles
  bloodworkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bloodworkTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
  },
  addBloodworkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: `${Colors.primary}15`,
    borderRadius: 8,
  },
  addBloodworkText: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
    marginLeft: 4,
  },
});