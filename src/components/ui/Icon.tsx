import React from 'react';
import { 
  MaterialIcons, 
  MaterialCommunityIcons, 
  Ionicons, 
  FontAwesome5,
  Feather
} from '@expo/vector-icons';
import { Colors } from '../../constants';

export type IconLibrary = 'Material' | 'MaterialCommunity' | 'Ionicons' | 'FontAwesome5' | 'Feather';

export interface IconProps {
  name: string;
  size?: number;
  color?: string;
  library?: IconLibrary;
}

export const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color = Colors.foreground, 
  library = 'Material' 
}) => {
  const getIconComponent = () => {
    switch (library) {
      case 'Material':
        return <MaterialIcons name={name as any} size={size} color={color} />;
      case 'MaterialCommunity':
        return <MaterialCommunityIcons name={name as any} size={size} color={color} />;
      case 'Ionicons':
        return <Ionicons name={name as any} size={size} color={color} />;
      case 'FontAwesome5':
        return <FontAwesome5 name={name as any} size={size} color={color} />;
      case 'Feather':
        return <Feather name={name as any} size={size} color={color} />;
      default:
        return <MaterialIcons name={name as any} size={size} color={color} />;
    }
  };

  return getIconComponent();
};

// Ícones predefinidos para o app
export const AppIcons = {
  // Navegação e ações
  mic: { name: 'mic', library: 'Material' as IconLibrary },
  settings: { name: 'settings', library: 'Material' as IconLibrary },
  close: { name: 'close', library: 'Material' as IconLibrary },
  save: { name: 'save', library: 'Material' as IconLibrary },
  delete: { name: 'delete', library: 'Material' as IconLibrary },
  clear: { name: 'clear', library: 'Material' as IconLibrary },
  
  // Estados e feedback
  lightbulb: { name: 'lightbulb', library: 'Material' as IconLibrary },
  star: { name: 'star', library: 'Material' as IconLibrary },
  starOutline: { name: 'star-border', library: 'Material' as IconLibrary },
  
  // Conteúdo e dados
  tag: { name: 'local-offer', library: 'Material' as IconLibrary },
  link: { name: 'link', library: 'Material' as IconLibrary },
  expand: { name: 'auto-awesome', library: 'Material' as IconLibrary },
  calendar: { name: 'event', library: 'Material' as IconLibrary },
  clock: { name: 'access-time', library: 'Material' as IconLibrary },
  sparkles: { name: 'auto-awesome', library: 'Material' as IconLibrary },
  
  // Entrada de texto
  edit: { name: 'edit', library: 'Material' as IconLibrary },
  keyboard: { name: 'keyboard', library: 'Material' as IconLibrary },
  
  // Temas
  lightMode: { name: 'light-mode', library: 'Material' as IconLibrary },
  darkMode: { name: 'dark-mode', library: 'Material' as IconLibrary },
  
  // Conexão e teste
  test: { name: 'science', library: 'Material' as IconLibrary },
  loading: { name: 'refresh', library: 'Material' as IconLibrary },
};
