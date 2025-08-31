// Sistema de tipografia baseado nas referências Pile
import { Platform } from 'react-native';

// Font families similares ao Perplexity (Inter)
export const FontFamilies = {
  // Fonte principal - Inter em todas as plataformas (como Perplexity)
  primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  
  // Fonte mono para código (se necessário no futuro)
  mono: Platform.select({
    ios: 'Menlo',
    android: 'monospace',
    web: 'Fira Code, Monaco, Consolas, "Ubuntu Mono", monospace',
    default: 'monospace',
  }),
} as const;

// Font weights consistentes
export const FontWeights = {
  light: '300' as const,
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
} as const;

// Font sizes com hierarquia clara
export const FontSizes = {
  // Títulos principais
  title: 28,        // Títulos de tela principais
  subtitle: 24,     // Subtítulos e conteúdo hero
  heading: 20,      // Cabeçalhos de seções
  
  // Textos de corpo
  body: 16,         // Texto principal
  bodySmall: 14,    // Texto secundário
  
  // Labels e metadados
  label: 13,        // Labels e tags
  caption: 12,      // Timestamps e metadados
  small: 11,        // Textos muito pequenos
} as const;

// Line heights otimizados para legibilidade
export const LineHeights = {
  tight: 1.2,       // Para títulos grandes
  normal: 1.4,      // Para a maioria dos textos
  relaxed: 1.6,     // Para textos longos
  loose: 1.8,       // Para parágrafos extensos
} as const;

// Letter spacing para refinamento visual
export const LetterSpacing = {
  tight: -0.5,      // Títulos grandes
  normal: 0,        // Padrão
  wide: 0.5,        // Labels e botões
  wider: 1,         // Textos maiúsculos
} as const;

// Sistema de espaçamentos baseado em 8px grid
export const Spacing = {
  xs: 4,            // 4px
  sm: 8,            // 8px
  md: 16,           // 16px
  lg: 24,           // 24px
  xl: 32,           // 32px
  xxl: 48,          // 48px
  xxxl: 64,         // 64px
} as const;

// Border radius consistente
export const BorderRadius = {
  sm: 6,            // Elementos pequenos
  md: 8,            // Padrão
  lg: 12,           // Cards
  xl: 16,           // Cards grandes
  xxl: 24,          // Elementos especiais
  full: 9999,       // Círculos
} as const;

// Estilos de texto pré-definidos baseados na referência
export const TextStyles = {
  // Títulos
  title: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.title,
    fontWeight: FontWeights.bold,
    lineHeight: FontSizes.title * LineHeights.tight,
    letterSpacing: LetterSpacing.tight,
  },
  
  subtitle: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.subtitle,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.subtitle * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  heading: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.heading,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.heading * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Textos de corpo
  body: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.body,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.body * LineHeights.relaxed,
    letterSpacing: LetterSpacing.normal,
  },
  
  bodyMedium: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.body,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.body * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  bodySemibold: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.body * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  bodySmall: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.bodySmall,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.bodySmall * LineHeights.relaxed,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Labels e metadados
  label: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.label,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.label * LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  
  labelBold: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.label,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.label * LineHeights.normal,
    letterSpacing: LetterSpacing.wide,
  },
  
  caption: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.regular,
    lineHeight: FontSizes.caption * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  captionMedium: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.caption,
    fontWeight: FontWeights.medium,
    lineHeight: FontSizes.caption * LineHeights.normal,
    letterSpacing: LetterSpacing.normal,
  },
  
  // Botões
  button: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.body,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.body * LineHeights.tight,
    letterSpacing: LetterSpacing.wide,
  },
  
  buttonSmall: {
    fontFamily: FontFamilies.primary,
    fontSize: FontSizes.bodySmall,
    fontWeight: FontWeights.semibold,
    lineHeight: FontSizes.bodySmall * LineHeights.tight,
    letterSpacing: LetterSpacing.wide,
  },
} as const;

// Sombras consistentes
export const Shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  md: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  lg: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  
  xl: {
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

// Tipos para TypeScript
export type FontWeight = keyof typeof FontWeights;
export type FontSize = keyof typeof FontSizes;
export type LineHeight = keyof typeof LineHeights;
export type SpacingSize = keyof typeof Spacing;
export type BorderRadiusSize = keyof typeof BorderRadius;
export type TextStyle = keyof typeof TextStyles;
export type Shadow = keyof typeof Shadows;
