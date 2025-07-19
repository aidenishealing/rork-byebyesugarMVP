import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Colors from '@/constants/colors';

interface SliderProps {
  label: string;
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  step?: number;
  style?: ViewStyle;
}

export function Slider({
  label,
  value,
  onValueChange,
  minimumValue = 0,
  maximumValue = 10,
  step = 1,
  style,
}: SliderProps) {
  // Create a simple custom slider with buttons since we don't have access to a proper slider component
  const decrementValue = () => {
    if (value > minimumValue) {
      onValueChange(value - step);
    }
  };

  const incrementValue = () => {
    if (value < maximumValue) {
      onValueChange(value + step);
    }
  };

  // Calculate the fill width as a percentage
  const fillPercentage = ((value - minimumValue) / (maximumValue - minimumValue)) * 100;

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.sliderContainer}>
        <Text style={styles.valueLabel}>{minimumValue}</Text>
        
        <View style={styles.sliderTrack}>
          <View 
            style={[
              styles.sliderFill, 
              { width: `${fillPercentage}%` }
            ]} 
          />
          
          <View style={styles.controlsContainer}>
            <View style={styles.buttonContainer}>
              <Text 
                style={[styles.button, value <= minimumValue && styles.disabledButton]} 
                onPress={decrementValue}
              >
                -
              </Text>
            </View>
            
            <Text style={styles.valueText}>{value}</Text>
            
            <View style={styles.buttonContainer}>
              <Text 
                style={[styles.button, value >= maximumValue && styles.disabledButton]} 
                onPress={incrementValue}
              >
                +
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.valueLabel}>{maximumValue}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 8,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sliderTrack: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
    backgroundColor: Colors.border,
    borderRadius: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  sliderFill: {
    position: 'absolute',
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 20,
    left: 0,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    height: '100%',
  },
  buttonContainer: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  button: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    width: 30,
    height: 30,
    textAlign: 'center',
    lineHeight: 30,
  },
  disabledButton: {
    opacity: 0.5,
  },
  valueLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    width: 20,
    textAlign: 'center',
  },
  valueText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Slider;