import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  SafeAreaView, 
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform
} from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/colors';
import Header from '@/components/Header';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Card from '@/components/Card';
import { useHabitsStore } from '@/store/habits-store';
import { useAuthStore } from '@/store/auth-store';

export default function AddClientScreen() {
  const router = useRouter();
  const { isAuthenticated, isAdmin } = useAuthStore();
  const { isLoading } = useHabitsStore();
  
  const [clientName, setClientName] = useState('');
  const [clientPhoneNumber, setClientPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Check authentication
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
      return;
    }
    
    if (!isAdmin) {
      router.replace('/client');
      return;
    }
  }, [isAuthenticated, isAdmin, router]);
  
  const handleBack = () => {
    router.back();
  };
  
  const validatePhoneNumber = (phone: string) => {
    // Basic phone number validation
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };
  
  const handleSubmit = async () => {
    // Validate inputs
    if (!clientName.trim()) {
      Alert.alert('Error', 'Please enter a client name.');
      return;
    }
    
    if (!clientPhoneNumber.trim()) {
      Alert.alert('Error', 'Please enter a phone number.');
      return;
    }
    
    if (!validatePhoneNumber(clientPhoneNumber)) {
      Alert.alert('Error', 'Please enter a valid phone number.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call to create client
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create new client object
      const newClient = {
        id: `client-${Date.now()}`,
        name: clientName.trim(),
        phoneNumber: clientPhoneNumber.trim(),
        role: 'client' as const,
        habits: {},
        lastActive: new Date().toISOString().split('T')[0]
      };
      
      console.log('Creating client:', newClient);
      
      // Navigate back to admin dashboard with the new client data
      router.replace({
        pathname: '/admin',
        params: {
          newClient: JSON.stringify(newClient)
        }
      });
      
    } catch (error) {
      console.error('Error creating client:', error);
      Alert.alert(
        'Error',
        'Failed to create client. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleCancel = () => {
    if (clientName.trim() || clientPhoneNumber.trim()) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard the changes?',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => router.back()
          }
        ]
      );
    } else {
      router.back();
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Add New Client" 
        showBackButton 
        onBackPress={handleBack} 
      />
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Card style={styles.formCard}>
            <Text style={styles.formTitle}>Client Information</Text>
            <Text style={styles.formSubtitle}>
              Enter the details for the new client
            </Text>
            
            <Input
              label="Full Name"
              value={clientName}
              onChangeText={setClientName}
              placeholder="Enter client's full name"
              autoCapitalize="words"
              style={styles.input}
            />
            
            <Input
              label="Phone Number"
              value={clientPhoneNumber}
              onChangeText={setClientPhoneNumber}
              placeholder="Enter phone number (e.g., +1234567890)"
              keyboardType="phone-pad"
              style={styles.input}
            />
            
            <View style={styles.buttonContainer}>
              <Button
                title={isSubmitting ? "Creating Client..." : "Add Client"}
                onPress={handleSubmit}
                style={styles.submitButton}
                loading={isSubmitting}
                disabled={isSubmitting || isLoading}
              />
              
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleCancel}
                style={styles.cancelButton}
                disabled={isSubmitting}
              />
            </View>
          </Card>
          
          <Card style={styles.infoCard}>
            <Text style={styles.infoTitle}>📋 Instructions</Text>
            <Text style={styles.infoText}>
              • Enter the client's full name as it should appear in the system
            </Text>
            <Text style={styles.infoText}>
              • Phone number should include country code (e.g., +1 for US)
            </Text>
            <Text style={styles.infoText}>
              • The client will be able to log in using their phone number
            </Text>
            <Text style={styles.infoText}>
              • You can edit client details later from the admin dashboard
            </Text>
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
  formCard: {
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 8,
  },
  formSubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  input: {
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 24,
  },
  submitButton: {
    marginBottom: 12,
  },
  cancelButton: {
    marginBottom: 0,
  },
  infoCard: {
    backgroundColor: `${Colors.primary}08`,
    borderWidth: 1,
    borderColor: `${Colors.primary}20`,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});