import React from 'react';
import { TouchableOpacity, View, TouchableOpacityProps } from 'react-native';
import { cn } from '../../utils/cn';

export interface FloatingActionButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  position?: 'bottom-right' | 'bottom-left' | 'bottom-center';
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'secondary' | 'success' | 'danger';
}

const fabSizes = {
  sm: 'w-12 h-12',
  md: 'w-14 h-14',
  lg: 'w-16 h-16',
};

const fabColors = {
  primary: 'bg-primary',
  secondary: 'bg-secondary',
  success: 'bg-green-500',
  danger: 'bg-red-500',
};

const fabPositions = {
  'bottom-right': 'absolute bottom-6 right-6',
  'bottom-left': 'absolute bottom-6 left-6',
  'bottom-center': 'absolute bottom-6 self-center',
};

export function FloatingActionButton({
  children,
  position = 'bottom-right',
  size = 'md',
  color = 'primary',
  className,
  ...props
}: FloatingActionButtonProps) {
  return (
    <TouchableOpacity
      className={cn(
        // Base styles
        'rounded-full items-center justify-center',
        'shadow-lg elevation-8', // Sombra para Android
        // Size
        fabSizes[size],
        // Color
        fabColors[color],
        // Position
        fabPositions[position],
        className
      )}
      activeOpacity={0.8}
      {...props}
    >
      <View className="items-center justify-center">
        {children}
      </View>
    </TouchableOpacity>
  );
}

export default FloatingActionButton;
