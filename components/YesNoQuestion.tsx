import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import RadioButton from './RadioButton';
import Colors from '@/constants/colors';

interface YesNoQuestionProps {
  question: string;
  value: string | null;
  onChange: (value: string) => void;
}

export default function YesNoQuestion({ 
  question, 
  value, 
  onChange 
}: YesNoQuestionProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.question}>{question}</Text>
      <View style={styles.optionsContainer}>
        <RadioButton
          label="Yes"
          value="yes"
          selectedValue={value}
          onSelect={onChange}
          style={styles.radioButton}
        />
        <RadioButton
          label="No"
          value="no"
          selectedValue={value}
          onSelect={onChange}
          style={styles.radioButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  question: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  radioButton: {
    marginRight: 24,
  },
});