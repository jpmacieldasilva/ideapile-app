import React from 'react';
import { TouchableOpacity, View, TouchableOpacityProps, StyleSheet } from 'react-native';

export interface FloatingActionButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
}

const fabSizes = {
  sm: { width: 48, height: 48 },
  md: { width: 56, height: 56 },
  lg: { width: 64, height: 64 },
};

const fabColors = {
  primary: '#4f46e5',
  secondary: '#6b7280',
  success: '#22c55e',
  danger: '#ef4444',
};

const fabPositions = {
  'bottom-right': { bottom: 24, right: 24 },
  'bottom-left': { bottom: 24, left: 24 },
  'bottom-center': { bottom: 24, alignSelf: 'center' as const },
};

export function FloatingActionButton({
  children,
  position = 'bottom-right',
  size = 'md',
  color = 'primary',
  style,
  ...props
}: FloatingActionButtonProps) {
  const fabStyle = [
    styles.base,
    fabSizes[size],
    fabPositions[position],
    { backgroundColor: fabColors[color] },
    style,
  ];

  return (
    <TouchableOpacity
      style={fabStyle}
      activeOpacity={0.8}
      {...props}
    >
      <View style={styles.content}>
        {children}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    position: 'absolute',
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default FloatingActionButton;
