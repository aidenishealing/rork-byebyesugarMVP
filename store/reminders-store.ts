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

// Helper function to convert time string to minutes for comparison
const convertTimeToMinutes = (timeStr: string): number => {
  // Handle different time formats
  let time = timeStr.toLowerCase().trim();
  
  // Remove spaces and normalize
  time = time.replace(/\s+/g, '');
  
  // Check if it's in 12-hour format (has am/pm)
  const hasAmPm = time.includes('am') || time.includes('pm');
  const isAm = time.includes('am');
  const isPm = time.includes('pm');
  
  // Extract the time part (remove am/pm)
  const timePart = time.replace(/am|pm/g, '');
  
  // Split hours and minutes
  const [hoursStr, minutesStr = '0'] = timePart.split(':');
  let hours = parseInt(hoursStr, 10);
  const minutes = parseInt(minutesStr, 10);
  
  // Handle invalid numbers
  if (isNaN(hours)) hours = 0;
  if (isNaN(minutes)) return hours * 60;
  
  // Convert to 24-hour format if needed
  if (hasAmPm) {
    if (isPm && hours !== 12) {
      hours += 12;
    } else if (isAm && hours === 12) {
      hours = 0;
    }
  }
  
  // Return total minutes since midnight
  return hours * 60 + minutes;
};

// Helper function to sort reminders by time
const sortRemindersByTime = (reminders: Reminder[]): Reminder[] => {
  return [...reminders].sort((a, b) => {
    // Convert time strings to comparable format
    const timeA = convertTimeToMinutes(a.time);
    const timeB = convertTimeToMinutes(b.time);
    return timeA - timeB;
  });
};

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
      reminders: sortRemindersByTime(initialReminders),
      
      addReminder: (title, time) => {
        const newReminder = {
          id: Date.now().toString(),
          title,
          time,
          enabled: true,
        };
        
        set(state => ({
          reminders: sortRemindersByTime([...state.reminders, newReminder])
        }));
        
        return newReminder;
      },
      
      editReminder: (id, title, time) => {
        set(state => {
          const updatedReminders = state.reminders.map(reminder =>
            reminder.id === id
              ? { ...reminder, title, time }
              : reminder
          );
          return {
            reminders: sortRemindersByTime(updatedReminders)
          };
        });
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