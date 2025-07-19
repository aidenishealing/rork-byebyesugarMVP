import React from 'react';
import { SafeAreaView, StyleSheet, View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/store/auth-store';
import Header from '@/components/Header';
import Colors from '@/constants/colors';

export default function ChatScreen() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  
  // Redirect if not authenticated
  React.useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/');
    }
  }, [isAuthenticated, router]);
  
  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="AI Assistant" 
        showBackButton 
      />
      <View style={styles.content}>
        <Text style={styles.comingSoon}>
          Chat feature coming soon!
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  comingSoon: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primary,
    textAlign: 'center',
  }
});