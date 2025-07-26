export type HabitValue = 'yes' | 'no' | string | number | null;

// Core data types
export interface DailyHabits {
  id: string;
  userId: string;
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
  createdAt: string;
  updatedAt: string;
  lastEditedBy?: string; // admin ID who last edited
}

export interface User {
  id: string;
  name: string;
  phoneNumber: string;
  role: 'admin' | 'client';
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Client extends User {
  role: 'client';
  adminId?: string; // assigned admin
  lastActive: string;
  profileData: {
    age?: number;
    weight?: number;
    height?: number;
    medicalConditions?: string[];
    goals?: string[];
  };
}

export interface Admin extends User {
  role: 'admin';
  clientIds: string[];
  permissions: string[];
}

export interface BloodworkDocument {
  id: string;
  userId: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadDate: string;
  fileUrl: string;
  fileData?: string; // base64 for demo
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BloodworkUploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  fileData: string; // base64 encoded file data
}

// Database schema interfaces
export interface DatabaseSchema {
  users: Record<string, User>;
  clients: Record<string, Client>;
  admins: Record<string, Admin>;
  dailyHabits: Record<string, DailyHabits>;
  bloodworkDocuments: Record<string, BloodworkDocument>;
  sessions: Record<string, UserSession>;
}

export interface UserSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Sync and versioning
export interface DataSync {
  lastSyncAt: string;
  version: number;
  changes: ChangeLog[];
}

export interface ChangeLog {
  id: string;
  entityType: 'user' | 'client' | 'admin' | 'dailyHabits' | 'bloodwork';
  entityId: string;
  action: 'create' | 'update' | 'delete';
  changes: Record<string, any>;
  userId: string; // who made the change
  timestamp: string;
}