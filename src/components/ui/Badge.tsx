import React from 'react';
import { View, Text, ViewStyle, TextStyle } from 'react-native';
import { useThemeColors } from '../../hooks/useThemeColors';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'outline';
  style?: ViewStyle;
}

export function Badge({ 
  children, 
  variant = 'default',
  style 
}: BadgeProps) {
  const colors = useThemeColors();
  
  const getBadgeStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          backgroundColor: colors.primary,
        };
      case 'secondary':
        return {
          ...baseStyle,
          backgroundColor: colors.secondary,
        };
      case 'outline':
        return {
          ...baseStyle,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: colors.border,
        };
      default:
        return baseStyle;
    }
  };

  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: 12,
      fontWeight: '500',
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyle,
          color: colors.primaryForeground,
        };
      case 'secondary':
        return {
          ...baseStyle,
          color: colors.secondaryForeground,
        };
      case 'outline':
        return {
          ...baseStyle,
          color: colors.foreground,
        };
      default:
        return {
          ...baseStyle,
          color: colors.foreground,
        };
    }
  };

  return (
    <View style={[getBadgeStyle(), style]}>
      <Text style={getTextStyle()}>
        {children}
      </Text>
    </View>
  );
}
