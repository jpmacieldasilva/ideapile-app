import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { storage } from '../services';
import { AppSettings } from '../types';

// Cores para tema claro
const LightColors = {
  // Cores principais - Light Theme
  background: '#ffffff',       // Fundo principal branco
  foreground: '#111827',       // Texto principal escuro
  
  // Cards e superfícies
  card: '#f9fafb',            // Cards claros
  cardForeground: '#111827',   // Texto dos cards escuro
  cardBorder: '#e5e7eb',       // Bordas sutis dos cards
  
  // Primary (accent colors)
  primary: '#4f46e5',          // Azul accent
  primaryForeground: '#ffffff',
  
  // Secondary (tons de cinza claros)
  secondary: '#f3f4f6',
  secondaryForeground: '#374151',
  
  // Muted (textos secundários)
  muted: '#f3f4f6',
  mutedForeground: '#6b7280',  // Cinza médio para textos secundários
  
  // Accent (destaques sutis)
  accent: '#f0f9ff',
  accentForeground: '#0c4a6e',
  
  // Bordas e inputs
  border: '#e5e7eb',           // Bordas sutis claras
  input: '#ffffff',            // Fundos de input brancos
  ring: '#4f46e5',             // Focus ring
  
  // Estados
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  destructive: '#ef4444',
  
  // Tons específicos do app
  timeline: '#f9fafb',         // Fundo da timeline
  timelineText: '#6b7280',     // Texto da timeline
  ideaCard: '#ffffff',         // Cards de ideias claros
  ideaCardBorder: '#e5e7eb',   // Bordas dos cards
  fabBackground: '#4f46e5',    // FAB azul accent
  fabForeground: '#ffffff',
  
  // Speech interface
  speechBackground: '#ffffff', // Fundo da tela de speech
  speechCard: '#f9fafb',       // Card de preview do texto
  speechAccent: '#4f46e5',     // Microfone e elementos de destaque
  waveform: '#4f46e5',         // Cor da waveform
  
  // Headers e navegação
  header: '#ffffff',
  headerForeground: '#111827',
  headerBorder: '#e5e7eb',
} as const;

// Cores para tema escuro (existentes)
const DarkColors = {
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
  destructive: '#ef4444',
  
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

export type Colors = typeof DarkColors;

interface ThemeContextType {
  theme: 'light' | 'dark';
  colors: Colors;
  setTheme: (theme: 'light' | 'dark') => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setThemeState] = useState<'light' | 'dark'>('dark');
  const [colors, setColors] = useState<Colors>(DarkColors);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar tema salvo ao inicializar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const settings = await storage.getSettings();
        setThemeState(settings.theme);
        setColors(settings.theme === 'light' ? LightColors : DarkColors);
      } catch (error) {
        console.error('Error loading theme:', error);
        // Manter tema padrão (dark)
      } finally {
        setIsLoading(false);
      }
    };

    loadTheme();
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    setColors(newTheme === 'light' ? LightColors : DarkColors);
  };

  return (
    <ThemeContext.Provider value={{ theme, colors, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};
