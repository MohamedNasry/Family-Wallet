import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  variant?: 'default' | 'green' | 'flat';
}

export const Card: React.FC<CardProps> = ({ children, style, variant = 'default' }) => (
  <View style={[styles.base, styles[variant], style]}>{children}</View>
);

const styles = StyleSheet.create({
  base: {
    borderRadius: 16,
    padding: 16,
  },
  default: {
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  green: {
    backgroundColor: 'rgba(14,164,114,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(14,164,114,0.2)',
  },
  flat: {
    backgroundColor: '#F7FAFE',
  },
});