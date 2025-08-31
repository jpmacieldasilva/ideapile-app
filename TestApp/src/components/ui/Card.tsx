import React from 'react';
import { View, ViewProps } from 'react-native';
import { cn } from '../../utils/cn';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const cardVariants = {
  default: 'bg-card',
  outlined: 'bg-card border border-border',
  elevated: 'bg-card shadow-lg',
};

const cardPadding = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={cn(
        'rounded-lg',
        cardVariants[variant],
        cardPadding[padding],
        className
      )}
      {...props}
    >
      {children}
    </View>
  );
}

export default Card;
