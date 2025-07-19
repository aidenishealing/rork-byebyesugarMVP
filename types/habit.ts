export type HabitValue = 'yes' | 'no' | string | number | null;

export interface DailyHabits {
  date: string;
  weightCheck: HabitValue;
  morningAcvWater: HabitValue;
  championWorkout: HabitValue;
  meal10am: string;
  hungerTimes: string;
  outdoorTime: string;
  energyLevel2pm: number;
  meal6pm: string;
  energyLevel8pm: number;
  wimHof: HabitValue;
  trackedSleep: HabitValue;
  dayDescription: string;
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'admin' | 'client';
}

export interface Client extends User {
  role: 'client';
  habits: Record<string, DailyHabits>;
  lastActive: string;
}