import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '@/types/habit';
import { router } from 'expo-router';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (phoneNumber: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (name: string, phoneNumber: string) => void;
  register: (phoneNumber: string, password: string, name: string) => Promise<boolean>;
}

// Define a more specific type for mock users to match the expected structure
type MockUser = {
  phoneNumber: string;
  password: string;
  user: User;
};

// Create a mock users database for demo purposes
const mockUsers: MockUser[] = [
  {
    phoneNumber: '+1234567890',
    password: 'iamgod123',
    user: {
      id: 'admin-1',
      name: 'Admin User',
      phoneNumber: '+1234567890',
      role: 'admin',
    }
  },
  {
    phoneNumber: '+0987654321',
    password: 'client123',
    user: {
      id: 'client-1',
      name: 'Test Client',
      phoneNumber: '+0987654321',
      role: 'client',
    }
  }
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isAdmin: false,
      
      login: async (phoneNumber: string, password: string) => {
        try {
          console.log("Attempting login with:", phoneNumber);
          
          const userRecord = mockUsers.find(
            u => u.phoneNumber === phoneNumber && u.password === password
          );
          
          if (userRecord) {
            console.log("Login successful for:", userRecord.user.name);
            set({
              user: userRecord.user,
              isAuthenticated: true,
              isAdmin: userRecord.user.role === 'admin',
            });
            return true;
          }
          console.log("Login failed: Invalid credentials");
          return false;
        } catch (error) {
          console.error('Login error:', error);
          return false;
        }
      },
      
      logout: () => {
        console.log("Logging out user");
        set({
          user: null,
          isAuthenticated: false,
          isAdmin: false,
        });
        
        // Force navigation to welcome screen
        setTimeout(() => {
          router.replace('/');
        }, 100);
      },
      
      updateProfile: (name: string, phoneNumber: string) => {
        const currentUser = get().user;
        if (!currentUser) {
          console.log("Cannot update profile: No user logged in");
          return;
        }
        
        const updatedUser = {
          ...currentUser,
          name,
          phoneNumber
        };
        
        set({ user: updatedUser });
        console.log('Profile updated:', updatedUser);
      },
      
      register: async (phoneNumber: string, password: string, name: string) => {
        try {
          console.log("Attempting registration for:", phoneNumber);
          
          // Check if phone number already exists in mock data
          if (mockUsers.some(u => u.phoneNumber === phoneNumber)) {
            console.log("Registration failed: Phone number already exists");
            return false;
          }
          
          // Create new user with explicit role type
          const newUser: User = {
            id: `client-${Date.now()}`,
            name,
            phoneNumber,
            role: 'client',
          };
          
          // Add to mock database (in a real app, this would be a server call)
          // Fix: Create a properly typed MockUser object
          const newMockUser: MockUser = {
            phoneNumber,
            password,
            user: newUser
          };
          
          mockUsers.push(newMockUser);
          
          console.log("Registration successful for:", newUser.name);
          
          // Log in the new user
          set({
            user: newUser,
            isAuthenticated: true,
            isAdmin: false,
          });
          
          return true;
        } catch (error) {
          console.error('Registration error:', error);
          return false;
        }
      }
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isAdmin: state.isAdmin
      }),
    }
  )
);