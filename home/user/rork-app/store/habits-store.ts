import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { DailyHabits, Client } from '@/types/habit';

interface HabitsState {
  allClients: Client[];
  clientHabits: Record<string, DailyHabits>;
  todayHabits: DailyHabits | null;
  isLoading: boolean;
  error: string | null;
  calculateCompletionPercentage: (habits: DailyHabits) => number;
  initTodayHabits: () => void;
  updateHabit: (key: keyof DailyHabits, value: any) => void;
  saveHabits: (date: string) => Promise<boolean>;
  editHabit: (date: string, habit: DailyHabits) => Promise<boolean>;
  fetchClientHabits: (clientId: string) => Promise<void>;
  getHabitByDate: (date: string) => DailyHabits | null;
  updateClientDetails: (clientId: string, name: string, phoneNumber: string) => Promise<boolean>;
  archiveClient: (clientId: string) => Promise<boolean>;
  deleteClient: (clientId: string) => Promise<boolean>;
  exportHabits: () => Promise<void>;
}

export const useHabitsStore = create<HabitsState>()(persist(
  (set, get) => ({
    allClients: [],
    clientHabits: {},
    todayHabits: null,
    isLoading: false,
    error: null,
    
    calculateCompletionPercentage: (habits: DailyHabits) => {
      const totalQuestions = 6; // weightCheck, morningAcvWater, championWorkout, wimHof, trackedSleep, and energy levels
      let completed = 0;
      
      if (habits.weightCheck === 'yes') completed++;
      if (habits.morningAcvWater === 'yes') completed++;
      if (habits.championWorkout === 'yes') completed++;
      if (habits.wimHof === 'yes') completed++;
      if (habits.trackedSleep === 'yes') completed++;
      if (habits.energyLevel2pm >= 7 || habits.energyLevel8pm >= 7) completed++;
      
      return Math.round((completed / totalQuestions) * 100);
    },
    
    initTodayHabits: () => {
      const today = new Date().toISOString().split('T')[0];
      const now = new Date().toISOString();
      set({
        todayHabits: {
          id: `habit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: 'current_user', // This should be replaced with actual user ID from auth
          date: today,
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
          createdAt: now,
          updatedAt: now
        }
      });
    },
    
    updateHabit: (key: keyof DailyHabits, value: any) => {
      const { todayHabits } = get();
      if (!todayHabits) return;
      
      set({
        todayHabits: {
          ...todayHabits,
          [key]: value
        }
      });
    },
    
    saveHabits: async (date: string) => {
      const { todayHabits } = get();
      if (!todayHabits) return false;
      
      set({ isLoading: true, error: null });
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { clientHabits } = get();
        const now = new Date().toISOString();
        const habitToSave: DailyHabits = {
          ...todayHabits,
          date,
          updatedAt: now
        };
        
        set({
          clientHabits: {
            ...clientHabits,
            [date]: habitToSave
          },
          isLoading: false
        });
        
        return true;
      } catch (error) {
        set({ 
          isLoading: false, 
          error: 'Failed to save habits. Please try again.' 
        });
        return false;
      }
    },
    
    editHabit: async (date: string, habit: DailyHabits) => {
      set({ isLoading: true, error: null });
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { clientHabits } = get();
        const now = new Date().toISOString();
        const updatedHabit: DailyHabits = {
          ...habit,
          date,
          updatedAt: now
        };
        
        set({
          clientHabits: {
            ...clientHabits,
            [date]: updatedHabit
          },
          isLoading: false
        });
        
        return true;
      } catch (error) {
        set({ 
          isLoading: false, 
          error: 'Failed to update habit. Please try again.' 
        });
        return false;
      }
    },
    
    fetchClientHabits: async (clientId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock data for demonstration
        const now = new Date().toISOString();
        const mockHabits: Record<string, DailyHabits> = {
          '2023-06-15': {
            id: 'habit_20230615_001',
            userId: clientId,
            date: '2023-06-15',
            weightCheck: 'yes',
            morningAcvWater: 'yes',
            championWorkout: 'yes',
            meal10am: 'Oatmeal with berries',
            hungerTimes: 'noon and 7pm',
            outdoorTime: '30 minute walk',
            energyLevel2pm: 8,
            meal6pm: 'Grilled chicken with vegetables',
            energyLevel8pm: 7,
            wimHof: 'yes',
            trackedSleep: 'yes',
            dayDescription: 'Great day with family',
            createdAt: '2023-06-15T08:00:00.000Z',
            updatedAt: '2023-06-15T20:00:00.000Z'
          },
          '2023-06-14': {
            id: 'habit_20230614_001',
            userId: clientId,
            date: '2023-06-14',
            weightCheck: 'yes',
            morningAcvWater: 'no',
            championWorkout: 'yes',
            meal10am: 'Smoothie',
            hungerTimes: '11am and 6pm',
            outdoorTime: '45 minute jog',
            energyLevel2pm: 9,
            meal6pm: 'Salmon with quinoa',
            energyLevel8pm: 8,
            wimHof: 'yes',
            trackedSleep: 'yes',
            dayDescription: 'Productive work day',
            createdAt: '2023-06-14T08:00:00.000Z',
            updatedAt: '2023-06-14T20:00:00.000Z'
          }
        };
        
        set({
          clientHabits: mockHabits,
          isLoading: false
        });
      } catch (error) {
        set({ 
          isLoading: false, 
          error: 'Failed to fetch habits. Please try again.' 
        });
      }
    },
    
    getHabitByDate: (date: string) => {
      const { clientHabits } = get();
      return clientHabits[date] || null;
    },
    
    updateClientDetails: async (clientId: string, name: string, phoneNumber: string) => {
      set({ isLoading: true });
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { allClients } = get();
        const updatedClients = allClients.map(client => 
          client.id === clientId 
            ? { ...client, name, phoneNumber }
            : client
        );
        
        set({ 
          allClients: updatedClients,
          isLoading: false 
        });
        
        return true;
      } catch (error) {
        set({ isLoading: false });
        return false;
      }
    },
    
    archiveClient: async (clientId: string) => {
      set({ isLoading: true });
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({ isLoading: false });
        return true;
      } catch (error) {
        set({ isLoading: false });
        return false;
      }
    },
    
    deleteClient: async (clientId: string) => {
      set({ isLoading: true });
      
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const { allClients } = get();
        const updatedClients = allClients.filter(client => client.id !== clientId);
        
        set({ 
          allClients: updatedClients,
          isLoading: false 
        });
        
        return true;
      } catch (error) {
        set({ isLoading: false });
        return false;
      }
    },
    
    exportHabits: async () => {
      if (Platform.OS === 'web') {
        Alert.alert(
          'Export Not Available',
          'Export functionality is not available on web. Please use the mobile app.',
          [{ text: 'OK' }]
        );
        return;
      }
      
      try {
        const { clientHabits } = get();
        const csvContent = generateCSV(clientHabits);
        
        const fileUri = FileSystem.documentDirectory + 'habits_export.csv';
        await FileSystem.writeAsStringAsync(fileUri, csvContent);
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri);
        } else {
          Alert.alert('Success', `Habits exported to: ${fileUri}`);
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to export habits. Please try again.');
      }
    }
  }),
  {
    name: 'habits-storage',
    storage: createJSONStorage(() => AsyncStorage),
    partialize: (state) => ({
      clientHabits: state.clientHabits,
      todayHabits: state.todayHabits
    })
  }
));

// Helper function to generate CSV content
function generateCSV(habits: Record<string, DailyHabits>): string {
  const headers = [
    'Date',
    'Weight Check',
    'Morning ACV + Water',
    'Champion Workout',
    '10am Meal',
    'Hunger Times',
    'Outdoor Time',
    'Energy Level 2pm',
    '6pm Meal',
    'Energy Level 8pm',
    'Wim Hof',
    'Tracked Sleep',
    'Day Description'
  ];
  
  const rows = Object.values(habits).map(habit => [
    habit.date,
    habit.weightCheck || '',
    habit.morningAcvWater || '',
    habit.championWorkout || '',
    habit.meal10am || '',
    habit.hungerTimes || '',
    habit.outdoorTime || '',
    habit.energyLevel2pm?.toString() || '',
    habit.meal6pm || '',
    habit.energyLevel8pm?.toString() || '',
    habit.wimHof || '',
    habit.trackedSleep || '',
    habit.dayDescription || ''
  ]);
  
  return [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');
}