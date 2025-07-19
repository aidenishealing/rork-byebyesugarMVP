import React from 'react';
import { 
  TouchableOpacity, 
  Text, 
  StyleSheet, 
  ActivityIndicator,
  View,
  ViewStyle,
  TextStyle
} from 'react-native';
import Colors from '@/constants/colors';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'text';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon
}: ButtonProps) {
  
  const handlePress = () => {
    console.log(`Button "${title}" pressed - variant: ${variant}, disabled: ${disabled}, loading: ${loading}`);
    if (!disabled && !loading) {
      onPress();
    } else {
      console.log(`Button "${title}" press blocked - disabled: ${disabled}, loading: ${loading}`);
    }
  };
  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.buttonSecondary;
      case 'outline':
        return styles.buttonOutline;
      case 'text':
        return styles.buttonText;
      default:
        return styles.buttonPrimary;
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'secondary':
        return styles.textSecondary;
      case 'outline':
        return styles.textOutline;
      case 'text':
        return styles.textText;
      default:
        return styles.textPrimary;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      delayPressIn={0}
      delayPressOut={100}
    >
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? 'white' : Colors.primary} />
      ) : (
        <View style={styles.content}>
          {icon}
          <Text style={[styles.text, getTextStyle(), textStyle]}>{title}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
    minWidth: 120,
  },
  buttonPrimary: {
    backgroundColor: Colors.primary,
  },
  buttonSecondary: {
    backgroundColor: Colors.secondary,
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  buttonText: {
    backgroundColor: 'transparent',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  textPrimary: {
    color: 'white',
  },
  textSecondary: {
    color: 'white',
  },
  textOutline: {
    color: Colors.primary,
  },
  textText: {
    color: Colors.primary,
  },
});

export default Button;