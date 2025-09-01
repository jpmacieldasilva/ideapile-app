// Constantes de animação para consistência visual
import { Animated, Easing } from 'react-native';

// Durações padrão das animações
export const AnimationDurations = {
  quick: 150,        // Micro-interações rápidas
  normal: 250,       // Transições padrão
  slow: 400,         // Animações mais elaboradas
  extended: 600,     // Animações complexas
} as const;

// Configurações de easing
export const AnimationEasing = {
  // Easing suaves para entrada
  easeOut: Easing.out(Easing.quad),
  easeIn: Easing.in(Easing.quad),
  easeInOut: Easing.inOut(Easing.quad),
  
  // Easing mais dramáticos
  spring: Easing.elastic(1.2),
  bounce: Easing.bounce,
  
  // Easing para micro-interações
  subtle: Easing.out(Easing.sin),
  sharp: Easing.out(Easing.exp),
} as const;

// Valores de transformação comuns
export const AnimationValues = {
  scale: {
    pressed: 0.95,
    hover: 1.05,
    pop: 1.1,
  },
  opacity: {
    hidden: 0,
    dim: 0.6,
    visible: 1,
  },
  translate: {
    slideUp: 50,
    slideDown: -50,
    slideLeft: -50,
    slideRight: 50,
  },
} as const;

// Funções helper para animações comuns
export const createFadeAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = AnimationDurations.normal,
  easing: any = AnimationEasing.easeOut
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

export const createScaleAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = AnimationDurations.quick,
  easing: any = AnimationEasing.easeOut
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

export const createSlideAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  duration: number = AnimationDurations.normal,
  easing: any = AnimationEasing.easeOut
): Animated.CompositeAnimation => {
  return Animated.timing(animatedValue, {
    toValue,
    duration,
    easing,
    useNativeDriver: true,
  });
};

export const createSpringAnimation = (
  animatedValue: Animated.Value,
  toValue: number,
  tension: number = 100,
  friction: number = 8
): Animated.CompositeAnimation => {
  return Animated.spring(animatedValue, {
    toValue,
    tension,
    friction,
    useNativeDriver: true,
  });
};

// Sequências de animação predefinidas
export const createStaggeredAnimation = (
  animations: Animated.CompositeAnimation[],
  staggerDelay: number = 100
): Animated.CompositeAnimation => {
  return Animated.stagger(staggerDelay, animations);
};

export const createSequenceAnimation = (
  animations: Animated.CompositeAnimation[]
): Animated.CompositeAnimation => {
  return Animated.sequence(animations);
};

// Animações de entrada para elementos de lista
export const createListItemEnterAnimation = (
  animatedValue: Animated.Value,
  delay: number = 0
): Animated.CompositeAnimation => {
  return Animated.sequence([
    Animated.delay(delay),
    Animated.parallel([
      createFadeAnimation(animatedValue, 1, AnimationDurations.normal),
      createSlideAnimation(animatedValue, 0, AnimationDurations.normal),
    ]),
  ]);
};

// Animação de tap/press feedback
export const createPressAnimation = (
  scaleValue: Animated.Value,
  pressIn: boolean = true
): Animated.CompositeAnimation => {
  return createScaleAnimation(
    scaleValue,
    pressIn ? AnimationValues.scale.pressed : 1,
    AnimationDurations.quick,
    pressIn ? AnimationEasing.easeIn : AnimationEasing.easeOut
  );
};

// Animação de loading/pulse
export const createPulseAnimation = (
  animatedValue: Animated.Value,
  minValue: number = 0.8,
  maxValue: number = 1.2,
  duration: number = 1000
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: maxValue,
        duration: duration / 2,
        easing: AnimationEasing.easeInOut,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: minValue,
        duration: duration / 2,
        easing: AnimationEasing.easeInOut,
        useNativeDriver: true,
      }),
    ])
  );
};

// Animação de ondas (para indicadores de audio)
export const createWaveAnimation = (
  animatedValue: Animated.Value,
  amplitude: number = 1.5,
  duration: number = 800
): Animated.CompositeAnimation => {
  return Animated.loop(
    Animated.sequence([
      Animated.timing(animatedValue, {
        toValue: amplitude,
        duration: duration / 2,
        easing: AnimationEasing.easeInOut,
        useNativeDriver: true,
      }),
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: duration / 2,
        easing: AnimationEasing.easeInOut,
        useNativeDriver: true,
      }),
    ])
  );
};
