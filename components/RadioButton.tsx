import React from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  ViewStyle 
} from 'react-native';
import Colors from '@/constants/colors';

interface RadioButtonProps {
  label: string;
  value: string;
  selectedValue: string | null;
  onSelect: (value: string) => void;
  style?: ViewStyle;
}

export default function RadioButton({
  label,
  value,
  selectedValue,
  onSelect,
  style,
}: RadioButtonProps) {
  const isSelected = selectedValue === value;
  
  return (
    <TouchableOpacity 
      style={[styles.container, style]} 
      onPress={() => onSelect(value)}
      activeOpacity={0.7}
    >
      <View style={[styles.radio, isSelected && styles.radioSelected]}>
        {isSelected && <View style={styles.radioInner} />}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  radio: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioSelected: {
    borderColor: Colors.primary,
  },
  radioInner: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary,
  },
  label: {
    fontSize: 16,
    color: Colors.text,
  },
});