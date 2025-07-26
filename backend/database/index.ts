import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  DatabaseSchema, 
  User, 
  Client, 
  Admin, 
  DailyHabits, 
  BloodworkDocument, 
  UserSession,
  ChangeLog,
  ApiResponse,
  PaginatedResponse
} from '@/types/habit';

class DatabaseService {
  private static instance: DatabaseService;
  private data: DatabaseSchema = {
    users: {},
    clients: {},
    admins: {},
    dailyHabits: {},
    bloodworkDocuments: {},
    sessions: {}
  };
  private changeLogs: ChangeLog[] = [];
  private isInitialized = false;

  private constructor() {}

  static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Load existing data from AsyncStorage
      const storedData = await AsyncStorage.getItem('database');
      if (storedData) {
        this.data = JSON.parse(storedData);
      } else {
        // Initialize with default admin user
        await this.seedDefaultData();
      }

      const storedLogs = await AsyncStorage.getItem('changeLogs');
      if (storedLogs) {
        this.changeLogs = JSON.parse(storedLogs);
      }

      this.isInitialized = true;
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      await this.seedDefaultData();
      this.isInitialized = true;
    }
  }

  private async seedDefaultData(): Promise<void> {
    const now = new Date().toISOString();
    
    // Create default admin
    const adminUser: Admin = {
      id: 'admin-1',
      name: 'Admin User',
      phoneNumber: '+1234567890',
      role: 'admin',
      createdAt: now,
      updatedAt: now,
      isActive: true,
      clientIds: [],
      permissions: ['all']
    };

    // Create default client
    const clientUser: Client = {
      id: 'client-1',
      name: 'Test Client',
      phoneNumber: '+0987654321',
      role: 'client',
      createdAt: now,
      updatedAt: now,
      isActive: true,
      adminId: 'admin-1',
      lastActive: now,
      profileData: {
        age: 30,
        weight: 70,
        height: 175,
        medicalConditions: ['diabetes'],
        goals: ['weight loss', 'better energy']
      }
    };

    this.data.users[adminUser.id] = adminUser;
    this.data.users[clientUser.id] = clientUser;
    this.data.admins[adminUser.id] = adminUser;
    this.data.clients[clientUser.id] = clientUser;
    
    // Update admin's client list
    this.data.admins[adminUser.id].clientIds = [clientUser.id];

    await this.persist();
  }

  private async persist(): Promise<void> {
    try {
      await AsyncStorage.setItem('database', JSON.stringify(this.data));
      await AsyncStorage.setItem('changeLogs', JSON.stringify(this.changeLogs));
    } catch (error) {
      console.error('Failed to persist database:', error);
    }
  }

  private logChange(entityType: ChangeLog['entityType'], entityId: string, action: ChangeLog['action'], changes: Record<string, any>, userId: string): void {
    const changeLog: ChangeLog = {
      id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      entityType,
      entityId,
      action,
      changes,
      userId,
      timestamp: new Date().toISOString()
    };
    
    this.changeLogs.push(changeLog);
    
    // Keep only last 1000 changes
    if (this.changeLogs.length > 1000) {
      this.changeLogs = this.changeLogs.slice(-1000);
    }
  }

  // User Management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>, password: string, createdBy?: string): Promise<ApiResponse<User>> {
    await this.initialize();
    
    try {
      // Check if phone number already exists
      const existingUser = Object.values(this.data.users).find(u => u.phoneNumber === userData.phoneNumber);
      if (existingUser) {
        return { success: false, error: 'Phone number already registered' };
      }

      const now = new Date().toISOString();
      const userId = `${userData.role}-${Date.now()}`;
      
      const newUser: User = {
        ...userData,
        id: userId,
        createdAt: now,
        updatedAt: now,
        isActive: true
      };

      this.data.users[userId] = newUser;

      if (userData.role === 'client') {
        const clientData: Client = {
          ...newUser,
          role: 'client',
          lastActive: now,
          profileData: {}
        };
        this.data.clients[userId] = clientData;
      } else if (userData.role === 'admin') {
        const adminData: Admin = {
          ...newUser,
          role: 'admin',
          clientIds: [],
          permissions: ['all']
        };
        this.data.admins[userId] = adminData;
      }

      // Store password hash (in real app, use proper hashing)
      await AsyncStorage.setItem(`password-${userId}`, password);

      this.logChange('user', userId, 'create', newUser, createdBy || userId);
      await this.persist();

      return { success: true, data: newUser, message: 'User created successfully' };
    } catch (error) {
      console.error('Error creating user:', error);
      return { success: false, error: 'Failed to create user' };
    }
  }

  async authenticateUser(phoneNumber: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    await this.initialize();
    
    try {
      const user = Object.values(this.data.users).find(u => u.phoneNumber === phoneNumber && u.isActive);
      if (!user) {
        return { success: false, error: 'Invalid credentials' };
      }

      const storedPassword = await AsyncStorage.getItem(`password-${user.id}`);
      if (storedPassword !== password) {
        return { success: false, error: 'Invalid credentials' };
      }

      // Create session
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const token = `token-${user.id}-${Date.now()}`;
      const session: UserSession = {
        id: sessionId,
        userId: user.id,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        createdAt: new Date().toISOString()
      };

      this.data.sessions[sessionId] = session;
      
      // Update last active for clients
      if (user.role === 'client') {
        this.data.clients[user.id].lastActive = new Date().toISOString();
      }

      await this.persist();

      return { success: true, data: { user, token }, message: 'Authentication successful' };
    } catch (error) {
      console.error('Error authenticating user:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  async getUserById(userId: string): Promise<User | null> {
    await this.initialize();
    return this.data.users[userId] || null;
  }

  async updateUser(userId: string, updates: Partial<User>, updatedBy: string): Promise<ApiResponse<User>> {
    await this.initialize();
    
    try {
      const user = this.data.users[userId];
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const updatedUser = {
        ...user,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      this.data.users[userId] = updatedUser;
      
      // Update in role-specific collections
      if (user.role === 'client') {
        this.data.clients[userId] = { ...this.data.clients[userId], ...updatedUser } as Client;
      } else if (user.role === 'admin') {
        this.data.admins[userId] = { ...this.data.admins[userId], ...updatedUser } as Admin;
      }

      this.logChange('user', userId, 'update', updates, updatedBy);
      await this.persist();

      return { success: true, data: updatedUser, message: 'User updated successfully' };
    } catch (error) {
      console.error('Error updating user:', error);
      return { success: false, error: 'Failed to update user' };
    }
  }

  // Client Management
  async getAllClients(adminId?: string): Promise<Client[]> {
    await this.initialize();
    
    const clients = Object.values(this.data.clients).filter(client => client.isActive);
    
    if (adminId) {
      return clients.filter(client => client.adminId === adminId);
    }
    
    return clients;
  }

  async getClientById(clientId: string): Promise<Client | null> {
    await this.initialize();
    return this.data.clients[clientId] || null;
  }

  async assignClientToAdmin(clientId: string, adminId: string, assignedBy: string): Promise<ApiResponse<Client>> {
    await this.initialize();
    
    try {
      const client = this.data.clients[clientId];
      const admin = this.data.admins[adminId];
      
      if (!client || !admin) {
        return { success: false, error: 'Client or admin not found' };
      }

      // Remove from previous admin if exists
      if (client.adminId && this.data.admins[client.adminId]) {
        this.data.admins[client.adminId].clientIds = this.data.admins[client.adminId].clientIds.filter(id => id !== clientId);
      }

      // Assign to new admin
      client.adminId = adminId;
      client.updatedAt = new Date().toISOString();
      
      if (!admin.clientIds.includes(clientId)) {
        admin.clientIds.push(clientId);
      }

      this.data.clients[clientId] = client;
      this.data.admins[adminId] = admin;
      this.data.users[clientId] = client;

      this.logChange('client', clientId, 'update', { adminId }, assignedBy);
      await this.persist();

      return { success: true, data: client, message: 'Client assigned successfully' };
    } catch (error) {
      console.error('Error assigning client:', error);
      return { success: false, error: 'Failed to assign client' };
    }
  }

  // Daily Habits Management
  async saveDailyHabits(habitsData: Omit<DailyHabits, 'id' | 'createdAt' | 'updatedAt'>, savedBy: string): Promise<ApiResponse<DailyHabits>> {
    await this.initialize();
    
    try {
      const now = new Date().toISOString();
      const habitId = `habit-${habitsData.userId}-${habitsData.date}`;
      
      const existingHabit = this.data.dailyHabits[habitId];
      const isUpdate = !!existingHabit;
      
      const habits: DailyHabits = {
        ...habitsData,
        id: habitId,
        createdAt: existingHabit?.createdAt || now,
        updatedAt: now,
        lastEditedBy: savedBy !== habitsData.userId ? savedBy : undefined
      };

      this.data.dailyHabits[habitId] = habits;
      
      // Update client's last active
      if (this.data.clients[habitsData.userId]) {
        this.data.clients[habitsData.userId].lastActive = now;
      }

      this.logChange('dailyHabits', habitId, isUpdate ? 'update' : 'create', habits, savedBy);
      await this.persist();

      return { success: true, data: habits, message: 'Habits saved successfully' };
    } catch (error) {
      console.error('Error saving habits:', error);
      return { success: false, error: 'Failed to save habits' };
    }
  }

  async getDailyHabits(userId: string, page = 1, limit = 50): Promise<PaginatedResponse<DailyHabits>> {
    await this.initialize();
    
    try {
      const userHabits = Object.values(this.data.dailyHabits)
        .filter(habit => habit.userId === userId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      const total = userHabits.length;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedHabits = userHabits.slice(startIndex, endIndex);

      return {
        data: paginatedHabits,
        total,
        page,
        limit,
        hasMore: endIndex < total
      };
    } catch (error) {
      console.error('Error fetching habits:', error);
      return {
        data: [],
        total: 0,
        page,
        limit,
        hasMore: false
      };
    }
  }

  async getDailyHabitByDate(userId: string, date: string): Promise<DailyHabits | null> {
    await this.initialize();
    const habitId = `habit-${userId}-${date}`;
    return this.data.dailyHabits[habitId] || null;
  }

  // Bloodwork Management
  async saveBloodworkDocument(docData: Omit<BloodworkDocument, 'id' | 'createdAt' | 'updatedAt'>, uploadedBy: string): Promise<ApiResponse<BloodworkDocument>> {
    await this.initialize();
    
    try {
      const now = new Date().toISOString();
      const docId = `bloodwork-${docData.userId}-${Date.now()}`;
      
      const document: BloodworkDocument = {
        ...docData,
        id: docId,
        createdAt: now,
        updatedAt: now
      };

      this.data.bloodworkDocuments[docId] = document;
      
      // Update client's last active
      if (this.data.clients[docData.userId]) {
        this.data.clients[docData.userId].lastActive = now;
      }

      this.logChange('bloodwork', docId, 'create', document, uploadedBy);
      await this.persist();

      return { success: true, data: document, message: 'Bloodwork uploaded successfully' };
    } catch (error) {
      console.error('Error saving bloodwork:', error);
      return { success: false, error: 'Failed to save bloodwork' };
    }
  }

  async getBloodworkDocuments(userId: string): Promise<BloodworkDocument[]> {
    await this.initialize();
    
    return Object.values(this.data.bloodworkDocuments)
      .filter(doc => doc.userId === userId)
      .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
  }

  // Change Log Management
  async getChangeLogs(entityType?: ChangeLog['entityType'], entityId?: string, limit = 100): Promise<ChangeLog[]> {
    await this.initialize();
    
    let logs = [...this.changeLogs];
    
    if (entityType) {
      logs = logs.filter(log => log.entityType === entityType);
    }
    
    if (entityId) {
      logs = logs.filter(log => log.entityId === entityId);
    }
    
    return logs
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  }

  // Data Sync
  async getDataForSync(userId: string, lastSyncAt?: string): Promise<{
    habits: DailyHabits[];
    bloodwork: BloodworkDocument[];
    profile: Client | null;
    changes: ChangeLog[];
  }> {
    await this.initialize();
    
    const syncTime = lastSyncAt ? new Date(lastSyncAt) : new Date(0);
    
    const habits = Object.values(this.data.dailyHabits)
      .filter(habit => 
        habit.userId === userId && 
        new Date(habit.updatedAt) > syncTime
      );
    
    const bloodwork = Object.values(this.data.bloodworkDocuments)
      .filter(doc => 
        doc.userId === userId && 
        new Date(doc.updatedAt) > syncTime
      );
    
    const profile = this.data.clients[userId] || null;
    
    const changes = this.changeLogs.filter(log => 
      (log.entityType === 'dailyHabits' || log.entityType === 'bloodwork' || log.entityType === 'client') &&
      (log.entityId === userId || (log.entityType === 'dailyHabits' && this.data.dailyHabits[log.entityId]?.userId === userId)) &&
      new Date(log.timestamp) > syncTime
    );
    
    return { habits, bloodwork, profile, changes };
  }

  // Admin specific methods
  async getAdminDashboardData(adminId: string): Promise<{
    clients: Client[];
    recentActivity: ChangeLog[];
    stats: {
      totalClients: number;
      activeToday: number;
      pendingHabits: number;
      newBloodwork: number;
    };
  }> {
    await this.initialize();
    
    const admin = this.data.admins[adminId];
    if (!admin) {
      throw new Error('Admin not found');
    }

    const clients = admin.clientIds.map(id => this.data.clients[id]).filter(Boolean);
    
    const today = new Date().toISOString().split('T')[0];
    const activeToday = clients.filter(client => 
      client.lastActive && client.lastActive.startsWith(today)
    ).length;

    const pendingHabits = clients.filter(client => {
      const todayHabit = this.data.dailyHabits[`habit-${client.id}-${today}`];
      return !todayHabit;
    }).length;

    const newBloodwork = Object.values(this.data.bloodworkDocuments)
      .filter(doc => 
        admin.clientIds.includes(doc.userId) &&
        doc.uploadDate.startsWith(today)
      ).length;

    const recentActivity = this.changeLogs
      .filter(log => {
        if (log.entityType === 'client') return admin.clientIds.includes(log.entityId);
        if (log.entityType === 'dailyHabits') {
          const habit = this.data.dailyHabits[log.entityId];
          return habit && admin.clientIds.includes(habit.userId);
        }
        if (log.entityType === 'bloodwork') {
          const doc = this.data.bloodworkDocuments[log.entityId];
          return doc && admin.clientIds.includes(doc.userId);
        }
        return false;
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 20);

    return {
      clients,
      recentActivity,
      stats: {
        totalClients: clients.length,
        activeToday,
        pendingHabits,
        newBloodwork
      }
    };
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    this.data = {
      users: {},
      clients: {},
      admins: {},
      dailyHabits: {},
      bloodworkDocuments: {},
      sessions: {}
    };
    this.changeLogs = [];
    await AsyncStorage.multiRemove(['database', 'changeLogs']);
    await this.seedDefaultData();
  }

  async exportData(): Promise<string> {
    await this.initialize();
    return JSON.stringify({
      data: this.data,
      changeLogs: this.changeLogs,
      exportedAt: new Date().toISOString()
    }, null, 2);
  }
}

export const db = DatabaseService.getInstance();
export default DatabaseService;