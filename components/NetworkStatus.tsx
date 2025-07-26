import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Wifi, WifiOff } from 'lucide-react-native';
import Colors from '@/constants/colors';

interface NetworkStatusProps {
  onStatusChange?: (isOnline: boolean) => void;
}

export default function NetworkStatus({ onStatusChange }: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(true);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        setIsOnline(true);
        setShowStatus(true);
        onStatusChange?.(true);
        
        // Hide status after 3 seconds when back online
        setTimeout(() => setShowStatus(false), 3000);
      };

      const handleOffline = () => {
        setIsOnline(false);
        setShowStatus(true);
        onStatusChange?.(false);
      };

      // Check initial status
      setIsOnline(navigator.onLine);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // For mobile, we'll rely on API call failures to detect network issues
      // This is a simplified approach since React Native doesn't have built-in network detection
      onStatusChange?.(true);
    }
  }, [onStatusChange]);

  if (!showStatus && isOnline) {
    return null;
  }

  return (
    <View style={[
      styles.container,
      isOnline ? styles.onlineContainer : styles.offlineContainer
    ]}>
      <View style={styles.content}>
        {isOnline ? (
          <Wifi size={16} color={Colors.success} />
        ) : (
          <WifiOff size={16} color={Colors.background} />
        )}
        <Text style={[
          styles.text,
          isOnline ? styles.onlineText : styles.offlineText
        ]}>
          {isOnline ? 'Back online' : 'No internet connection'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 1000,
    borderRadius: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  onlineContainer: {
    backgroundColor: Colors.success,
  },
  offlineContainer: {
    backgroundColor: Colors.error,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  onlineText: {
    color: Colors.background,
  },
  offlineText: {
    color: Colors.background,
  },
});