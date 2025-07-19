import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Client } from '@/types/habit';
import { useHabitsStore } from '@/store/habits-store';

interface ClientCardProps {
  client: Client;
  onEdit: (client: Client) => void;
  onDelete: (clientId: string) => void;
}

export default function ClientCard({ client, onEdit, onDelete }: ClientCardProps) {
  const router = useRouter();
  const { calculateCompletionPercentage } = useHabitsStore();
  
  const getAverageCompletion = () => {
    if (!client.habits || Object.keys(client.habits).length === 0) return 0;
    
    const completionRates = Object.values(client.habits)
      .map(habit => calculateCompletionPercentage(habit));
    
    const average = completionRates.reduce((a, b) => a + b, 0) / completionRates.length;
    return Math.round(average);
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => router.push(`/admin/client/${client.id}`)}
      activeOpacity={0.7}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name}>{client.name}</Text>
          <ChevronRight size={20} color={Colors.primary} />
        </View>
        
        <Text style={styles.phoneNumber}>{client.phoneNumber}</Text>
        
        <View style={styles.stats}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {Object.keys(client.habits || {}).length}
            </Text>
            <Text style={styles.statLabel}>Entries</Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {getAverageCompletion()}%
            </Text>
            <Text style={styles.statLabel}>Completion</Text>
          </View>
          
          <View style={styles.stat}>
            <Text style={styles.statValue}>
              {client.lastActive ? new Date(client.lastActive).toLocaleDateString() : 'Never'}
            </Text>
            <Text style={styles.statLabel}>Last Active</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  phoneNumber: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});