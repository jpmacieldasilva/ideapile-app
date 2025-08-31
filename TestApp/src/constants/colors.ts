// Cores baseadas na referência Pile - tema escuro elegante
export const Colors = {
  // Cores principais - Dark Theme
  background: '#0a0a0a',       // Fundo principal escuro
  foreground: '#ffffff',       // Texto principal branco
  
  // Cards e superfícies
  card: '#1a1a1a',            // Cards escuros
  cardForeground: '#ffffff',   // Texto dos cards
  cardBorder: '#2a2a2a',       // Bordas sutis dos cards
  
  // Primary (accent colors da referência)
  primary: '#4f46e5',          // Azul accent similar à referência
  primaryForeground: '#ffffff',
  
  // Secondary (tons de cinza escuros)
  secondary: '#1e1e1e',
  secondaryForeground: '#a1a1aa',
  
  // Muted (textos secundários)
  muted: '#262626',
  mutedForeground: '#737373',  // Cinza médio para textos secundários
  
  // Accent (destaques sutis)
  accent: '#1e1e1e',
  accentForeground: '#f4f4f5',
  
  // Bordas e inputs
  border: '#2a2a2a',           // Bordas sutis escuras
  input: '#1a1a1a',           // Fundos de input escuros
  ring: '#4f46e5',            // Focus ring
  
  // Estados
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Tons específicos do app inspirados na referência
  timeline: '#171717',         // Fundo da timeline
  timelineText: '#737373',     // Texto da timeline ("há 3 dias")
  ideaCard: '#1a1a1a',        // Cards de ideias escuros
  ideaCardBorder: '#2a2a2a',   // Bordas dos cards
  fabBackground: '#4f46e5',    // FAB azul accent
  fabForeground: '#ffffff',
  
  // Speech interface (baseado na referência)
  speechBackground: '#0a0a0a', // Fundo da tela de speech
  speechCard: '#1a1a1a',       // Card de preview do texto
  speechAccent: '#4f46e5',     // Microfone e elementos de destaque
  waveform: '#4f46e5',         // Cor da waveform
  
  // Headers e navegação
  header: '#0a0a0a',
  headerForeground: '#ffffff',
  headerBorder: '#1e1e1e',
} as const;

export type ColorKey = keyof typeof Colors;
