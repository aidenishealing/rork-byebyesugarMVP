import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Edit } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { DailyHabits } from '@/types/habit';
import { format } from '@/utils/date';

interface HabitHistoryCardProps {
  habits: DailyHabits;
  clientId?: string;
  onView: (habits: DailyHabits) => void;
  onEdit: (habits: DailyHabits) => void;
}

export default function HabitHistoryCard({ 
  habits, 
  clientId,
  onView,
  onEdit
}: HabitHistoryCardProps) {
  const router = useRouter();
  
  // Calculate completion percentage
  const calculateCompletion = () => {
    const totalItems = 9; // Number of yes/no questions + text fields that should be filled
    let completed = 0;
    
    if (habits.weightCheck === 'yes') completed++;
    if (habits.morningAcvWater === 'yes') completed++;
    if (habits.championWorkout === 'yes') completed++;
    if (habits.meal10am && habits.meal10am.trim() !== '') completed++;
    if (habits.hungerTimes && habits.hungerTimes.trim() !== '') completed++;
    if (habits.outdoorTime && habits.outdoorTime.trim() !== '') completed++;
    if (habits.meal6pm && habits.meal6pm.trim() !== '') completed++;
    if (habits.wimHof === 'yes') completed++;
    if (habits.trackedSleep === 'yes') completed++;
    
    // Ensure we don't exceed 100%
    return Math.min(Math.round((completed / totalItems) * 100), 100);
  };
  
  const completion = calculateCompletion();
  
  // Format date for display
  const displayDate = new Date(habits.date);
  const formattedDate = format(displayDate, 'MM/dd/yyyy');
  
  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <Text style={styles.date}>{formattedDate}</Text>
        <View style={styles.completionContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${completion}%` },
                completion < 30 ? styles.lowCompletion : 
                completion < 70 ? styles.mediumCompletion : 
                styles.highCompletion
              ]} 
            />
          </View>
          <Text style={styles.completionText}>{completion}% Complete</Text>
        </View>
      </View>
      
      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => onEdit(habits)}
        >
          <Edit size={20} color={Colors.secondary} />
          <Text style={[styles.actionText, { color: Colors.secondary }]}>Edit</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  content: {
    flex: 1,
    marginBottom: 12,
  },
  date: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 10,
  },
  completionContainer: {
    marginTop: 6,
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
  },
  lowCompletion: {
    backgroundColor: Colors.error,
  },
  mediumCompletion: {
    backgroundColor: Colors.warning,
  },
  highCompletion: {
    backgroundColor: Colors.success,
  },
  completionText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 12,
    marginTop: 4,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  actionText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  }
});