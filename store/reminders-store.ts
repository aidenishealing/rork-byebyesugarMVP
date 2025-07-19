import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Reminder {
  id: string;
  title: string;
  time: string;
  enabled: boolean;
}

interface RemindersState {
  reminders: Reminder[];
  addReminder: (title: string, time: string) => Reminder;
  editReminder: (id: string, title: string, time: string) => void;
  deleteReminder: (id: string) => void;
  toggleReminder: (id: string) => void;
}

// Default reminders for clients to edit
const initialReminders: Reminder[] = [
  {
    id: '1',
    title: 'Morning ACV + Water',
    time: '07:00',
    enabled: true,
  },
  {
    id: '2',
    title: 'Champion Workout',
    time: '09:00',
    enabled: true,
  },
  {
    id: '3',
    title: 'Log your meals',
    time: '19:00',
    enabled: true,
  },
  {
    id: '4',
    title: 'Evening Wim Hof breathing',
    time: '21:00',
    enabled: true,
  },
  {
    id: '5',
    title: 'Track your sleep',
    time: '22:00',
    enabled: true,
  }
];

export const useRemindersStore = create<RemindersState>()(
  persist(
    (set, get) => ({
      reminders: initialReminders,
      
      addReminder: (title, time) => {
        const newReminder = {
          id: Date.now().toString(),
          title,
          time,
          enabled: true,
        };
        
        set(state => ({
          reminders: [...state.reminders, newReminder]
        }));
        
        return newReminder;
      },
      
      editReminder: (id, title, time) => {
        set(state => ({
          reminders: state.reminders.map(reminder =>
            reminder.id === id
              ? { ...reminder, title, time }
              : reminder
          )
        }));
      },
      
      deleteReminder: (id) => {
        set(state => ({
          reminders: state.reminders.filter(reminder => reminder.id !== id)
        }));
      },
      
      toggleReminder: (id) => {
        set(state => ({
          reminders: state.reminders.map(reminder =>
            reminder.id === id
              ? { ...reminder, enabled: !reminder.enabled }
              : reminder
          )
        }));
      }
    }),
    {
      name: 'reminders-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        reminders: state.reminders
      }),
    }
  )
);