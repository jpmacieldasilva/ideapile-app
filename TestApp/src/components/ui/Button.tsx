import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, TouchableOpacityProps } from 'react-native';
import { cn } from '../../utils/cn';

export interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const buttonVariants = {
  default: 'bg-primary',
  secondary: 'bg-secondary',
  outline: 'border border-border bg-transparent',
  ghost: 'bg-transparent',
  danger: 'bg-red-500',
};

const buttonSizes = {
  sm: 'px-3 py-2',
  md: 'px-4 py-3',
  lg: 'px-6 py-4',
};

const textVariants = {
  default: 'text-primary-foreground',
  secondary: 'text-secondary-foreground',
  outline: 'text-foreground',
  ghost: 'text-foreground',
  danger: 'text-white',
};

const textSizes = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
};

export function Button({
  children,
  variant = 'default',
  size = 'md',
  loading = false,
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={cn(
        // Base styles
        'rounded-lg flex-row items-center justify-center',
        // Variant styles
        buttonVariants[variant],
        // Size styles
        buttonSizes[size],
        // Full width
        fullWidth && 'w-full',
        // Disabled styles
        isDisabled && 'opacity-50',
        className
      )}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading && (
        <ActivityIndicator
          size="small"
          color={variant === 'default' || variant === 'danger' ? '#ffffff' : '#1a1a1a'}
          style={{ marginRight: 8 }}
        />
      )}
      
      {typeof children === 'string' ? (
        <Text
          className={cn(
            'font-medium text-center',
            textVariants[variant],
            textSizes[size],
            loading && 'ml-2'
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}

export default Button;
