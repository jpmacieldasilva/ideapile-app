import React from 'react';
import { View, ViewProps, ViewStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export function Card({
  children,
  variant = 'default',
  padding = 'md',
  style,
  ...props
}: CardProps) {
  const colors = useThemeColors();
  
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 8,
      backgroundColor: colors.card,
    };

    const paddingStyle: ViewStyle = {
      none: {},
      sm: { padding: 12 },
      md: { padding: 16 },
      lg: { padding: 24 },
    }[padding];

    switch (variant) {
      case 'outlined':
        return {
          ...baseStyle,
          ...paddingStyle,
          borderWidth: 1,
          borderColor: colors.border,
        };
      case 'elevated':
        return {
          ...baseStyle,
          ...paddingStyle,
          shadowColor: colors.foreground,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 3,
        };
      default:
        return {
          ...baseStyle,
          ...paddingStyle,
        };
    }
  };

  return (
    <View
      style={[getCardStyle(), style]}
      {...props}
    >
      {children}
    </View>
  );
}

export default Card;
