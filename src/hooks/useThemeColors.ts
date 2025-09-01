import { useTheme } from '../contexts/ThemeContext';
import { Colors as StaticColors } from '../constants/colors';

// Hook para usar cores dinâmicas ou estáticas como fallback
export const useThemeColors = () => {
  try {
    const { colors, isLoading } = useTheme();
    // Se ainda carregando, usar cores estáticas como fallback
    return isLoading ? StaticColors : colors;
  } catch {
    // Se não estiver dentro do ThemeProvider, usar cores estáticas
    return StaticColors;
  }
};
