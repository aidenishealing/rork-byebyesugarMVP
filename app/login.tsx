import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
  Image
} from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import Input from '@/components/Input';
import Button from '@/components/Button';
import Colors from '@/constants/colors';
import { useAuthStore } from '@/store/auth-store';
import { LinearGradient } from 'expo-linear-gradient';

export default function LoginScreen() {
  const router = useRouter();
  const login = useAuthStore(state => state.login);
  
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [credentialsModalVisible, setCredentialsModalVisible] = useState(false);
  
  const handleBack = () => {
    router.back();
  };
  
  const handleLogin = async () => {
    if (!phoneNumber || !password) {
      setError('Please enter both phone number and password');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const success = await login(phoneNumber, password);
      
      if (success) {
        // Get the current state after login
        const isAdmin = useAuthStore.getState().isAdmin;
        
        // Navigate based on role
        if (isAdmin) {
          router.replace('/admin');
        } else {
          router.replace('/client');
        }
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleDemoLogin = () => {
    setCredentialsModalVisible(true);
  };
  
  const handleSignup = () => {
    router.push('/signup');
  };
  
  const renderCredentialsModal = () => {
    return (
      <Modal
        visible={credentialsModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setCredentialsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Demo Credentials</Text>
            
            <View style={styles.credentialContainer}>
              <Text style={styles.credentialTitle}>Admin Login:</Text>
              <Text style={styles.credentialText}>Phone: <Text style={styles.credentialValue}>+1234567890</Text></Text>
              <Text style={styles.credentialText}>Password: <Text style={styles.credentialValue}>iamgod123</Text></Text>
            </View>
            
            <View style={styles.credentialContainer}>
              <Text style={styles.credentialTitle}>Client Login:</Text>
              <Text style={styles.credentialText}>Phone: <Text style={styles.credentialValue}>+0987654321</Text></Text>
              <Text style={styles.credentialText}>Password: <Text style={styles.credentialValue}>client123</Text></Text>
            </View>
            
            <Button
              title="Close"
              onPress={() => setCredentialsModalVisible(false)}
              style={styles.modalButton}
            />
          </View>
        </View>
      </Modal>
    );
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.background} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <ArrowLeft size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Image 
              source={{ uri: 'https://images.unsplash.com/photo-1620127682229-33388276e540?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80' }}
              style={styles.logoImage}
              resizeMode="cover"
            />
          </View>
        </View>
        
        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            <Text style={styles.titleFirst}>Welcome </Text>
            <Text style={styles.titleSecond}>Back</Text>
          </Text>
          <Text style={styles.subtitle}>Sign in to continue your journey</Text>
        </View>
        
        {error ? <Text style={styles.errorText}>{error}</Text> : null}
        
        <View style={styles.form}>
          <Input
            label="Phone Number"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="Enter your phone number"
            keyboardType="phone-pad"
          />
          
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
          
          <Button
            title="Sign In"
            onPress={handleLogin}
            style={styles.loginButton}
            loading={loading}
            disabled={loading}
          />
          
          <View style={styles.optionsContainer}>
            <TouchableOpacity 
              style={styles.demoButton} 
              onPress={handleDemoLogin}
              disabled={loading}
            >
              <Text style={styles.demoButtonText}>View Demo Credentials</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignup}
              disabled={loading}
            >
              <Text style={styles.signupButtonText}>Create New Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      {renderCredentialsModal()}
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
  header: {
    padding: 16,
  },
  backButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    backgroundColor: '#FFF8E8',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: '100%',
    height: '100%',
    tintColor: '#E6A817',
  },
  titleContainer: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 12,
    textAlign: 'center',
  },
  titleFirst: {
    color: Colors.primary,
  },
  titleSecond: {
    color: Colors.secondary,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginTop: 8,
  },
  loginButton: {
    marginTop: 24,
  },
  errorText: {
    color: Colors.error,
    fontSize: 16,
    marginBottom: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  demoButton: {
    marginBottom: 16,
    padding: 8,
  },
  demoButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '500',
  },
  signupButton: {
    marginTop: 8,
    padding: 8,
  },
  signupButtonText: {
    color: Colors.primary,
    fontSize: 18,
    fontWeight: '500',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 20,
  },
  credentialContainer: {
    width: '100%',
    backgroundColor: `${Colors.primary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  credentialTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 8,
  },
  credentialText: {
    fontSize: 16,
    color: Colors.text,
    marginBottom: 4,
  },
  credentialValue: {
    fontWeight: 'bold',
    color: Colors.secondary,
  },
  modalButton: {
    width: '100%',
    marginTop: 8,
  },
});