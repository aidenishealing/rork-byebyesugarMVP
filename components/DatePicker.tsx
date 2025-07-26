import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Platform,
  Alert
} from 'react-native';
import { Calendar as CalendarIcon, X } from 'lucide-react-native';
import Colors from '@/constants/colors';
import Button from '@/components/Button';
import { format, formatDisplayDate } from '@/utils/date';

interface DatePickerProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  style?: any;
  disabled?: boolean;
  maxDate?: Date;
  minDate?: Date;
}

export default function DatePicker({
  selectedDate,
  onDateChange,
  style,
  disabled = false,
  maxDate = new Date(),
  minDate
}: DatePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempDate, setTempDate] = useState(selectedDate);

  const handleDatePress = () => {
    if (disabled) return;
    setTempDate(selectedDate);
    setModalVisible(true);
  };

  const handleConfirm = () => {
    onDateChange(tempDate);
    setModalVisible(false);
  };

  const handleCancel = () => {
    setTempDate(selectedDate);
    setModalVisible(false);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(tempDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setTempDate(newDate);
  };

  const selectDay = (day: number) => {
    const newDate = new Date(tempDate);
    newDate.setDate(day);
    
    // Check if date is within bounds
    if (maxDate && newDate > maxDate) {
      Alert.alert('Invalid Date', 'Cannot select a future date.');
      return;
    }
    
    if (minDate && newDate < minDate) {
      Alert.alert('Invalid Date', 'Cannot select a date before the minimum allowed date.');
      return;
    }
    
    setTempDate(newDate);
  };

  const renderCalendar = () => {
    const year = tempDate.getFullYear();
    const month = tempDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <View key={`empty-${i}`} style={styles.dayCell} />
      );
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDate = new Date(year, month, day);
      const isSelected = day === tempDate.getDate();
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isDisabled = (maxDate && dayDate > maxDate) || (minDate && dayDate < minDate);
      
      days.push(
        <TouchableOpacity
          key={day}
          style={[
            styles.dayCell,
            isSelected && styles.selectedDay,
            isToday && !isSelected && styles.todayDay,
            isDisabled && styles.disabledDay
          ]}
          onPress={() => !isDisabled && selectDay(day)}
          disabled={isDisabled}
        >
          <Text style={[
            styles.dayText,
            isSelected && styles.selectedDayText,
            isToday && !isSelected && styles.todayDayText,
            isDisabled && styles.disabledDayText
          ]}>
            {day}
          </Text>
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('prev')}
          >
            <Text style={styles.navButtonText}>‹</Text>
          </TouchableOpacity>
          
          <Text style={styles.monthYearText}>
            {monthNames[month]} {year}
          </Text>
          
          <TouchableOpacity
            style={styles.navButton}
            onPress={() => navigateMonth('next')}
          >
            <Text style={styles.navButtonText}>›</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.dayNamesRow}>
          {dayNames.map(dayName => (
            <View key={dayName} style={styles.dayNameCell}>
              <Text style={styles.dayNameText}>{dayName}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.daysGrid}>
          {days}
        </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.dateButton, disabled && styles.dateButtonDisabled, style]}
        onPress={handleDatePress}
        disabled={disabled}
      >
        <CalendarIcon size={20} color={disabled ? Colors.textSecondary : Colors.primary} />
        <Text style={[styles.dateButtonText, disabled && styles.dateButtonTextDisabled]}>
          {formatDisplayDate(selectedDate)}
        </Text>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Date</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleCancel}
              >
                <X size={24} color={Colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {renderCalendar()}
            
            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="outline"
                onPress={handleCancel}
                style={styles.modalButton}
              />
              <Button
                title="Confirm"
                onPress={handleConfirm}
                style={styles.modalButton}
              />
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.card,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  dateButtonDisabled: {
    opacity: 0.6,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  dateButtonTextDisabled: {
    color: Colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  calendar: {
    marginBottom: 20,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: `${Colors.primary}15`,
  },
  navButtonText: {
    fontSize: 24,
    color: Colors.primary,
    fontWeight: 'bold',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.text,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  dayNameCell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  dayNameText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  selectedDay: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
  },
  todayDay: {
    backgroundColor: `${Colors.secondary}20`,
    borderRadius: 8,
  },
  disabledDay: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: Colors.text,
  },
  selectedDayText: {
    color: 'white',
    fontWeight: 'bold',
  },
  todayDayText: {
    color: Colors.secondary,
    fontWeight: 'bold',
  },
  disabledDayText: {
    color: Colors.textSecondary,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
  },
});