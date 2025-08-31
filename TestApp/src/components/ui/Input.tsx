import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';
import { cn } from '../../utils/cn';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  ...props
}: InputProps) {
  return (
    <View className={cn('w-full', containerClassName)}>
      {/* Label */}
      {label && (
        <Text className="text-sm font-medium text-foreground mb-2">
          {label}
        </Text>
      )}

      {/* Input Container */}
      <View
        className={cn(
          'flex-row items-center bg-input border border-border rounded-lg px-3 py-3',
          error && 'border-red-500',
          props.editable === false && 'opacity-50'
        )}
      >
        {/* Left Icon */}
        {leftIcon && (
          <View className="mr-3">
            {leftIcon}
          </View>
        )}

        {/* Text Input */}
        <TextInput
          className={cn(
            'flex-1 text-base text-foreground',
            'min-h-[24px]', // Altura mínima para evitar layout shift
            className
          )}
          placeholderTextColor="#64748b"
          {...props}
        />

        {/* Right Icon */}
        {rightIcon && (
          <View className="ml-3">
            {rightIcon}
          </View>
        )}
      </View>

      {/* Error or Hint */}
      {(error || hint) && (
        <Text
          className={cn(
            'text-xs mt-1',
            error ? 'text-red-500' : 'text-muted-foreground'
          )}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}

export default Input;
