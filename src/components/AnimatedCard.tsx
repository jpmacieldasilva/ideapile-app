import React, { useRef, useEffect } from 'react';
import { 
  Animated, 
  TouchableOpacity, 
  ViewStyle, 
  GestureResponderEvent 
} from 'react-native';
import { 
  createPressAnimation, 
  createListItemEnterAnimation,
  AnimationDurations,
  AnimationValues 
} from '../constants';

interface AnimatedCardProps {
  children: React.ReactNode;
  onPress?: (event: GestureResponderEvent) => void;
  style?: ViewStyle;
  enterDelay?: number;
  disabled?: boolean;
  disableEnterAnimation?: boolean;
  disablePressAnimation?: boolean;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onPress,
  style,
  enterDelay = 0,
  disabled = false,
  disableEnterAnimation = false,
  disablePressAnimation = false,
}) => {
  const scaleAnim = useRef(new Animated.Value(disablePressAnimation ? 1 : 1)).current;
  const enterAnim = useRef(new Animated.Value(disableEnterAnimation ? 1 : 0)).current;
  const translateAnim = useRef(new Animated.Value(disableEnterAnimation ? 0 : 20)).current;

  // Animação de entrada
  useEffect(() => {
    if (!disableEnterAnimation) {
      const animation = Animated.parallel([
        createListItemEnterAnimation(enterAnim, enterDelay),
        Animated.timing(translateAnim, {
          toValue: 0,
          duration: AnimationDurations.normal,
          delay: enterDelay,
          useNativeDriver: true,
        }),
      ]);
      
      animation.start();
    }
  }, [enterDelay, disableEnterAnimation]);

  const handlePressIn = () => {
    if (!disablePressAnimation && !disabled) {
      createPressAnimation(scaleAnim, true).start();
    }
  };

  const handlePressOut = () => {
    if (!disablePressAnimation && !disabled) {
      createPressAnimation(scaleAnim, false).start();
    }
  };

  const animatedStyle = {
    opacity: disableEnterAnimation ? 1 : enterAnim,
    transform: [
      { 
        scale: disablePressAnimation ? 1 : scaleAnim 
      },
      { 
        translateY: disableEnterAnimation ? 0 : translateAnim 
      },
    ],
  };

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        activeOpacity={disablePressAnimation ? 0.7 : 1}
      >
        <Animated.View style={[style, animatedStyle]}>
          {children}
        </Animated.View>
      </TouchableOpacity>
    );
  }

  return (
    <Animated.View style={[style, animatedStyle]}>
      {children}
    </Animated.View>
  );
};
