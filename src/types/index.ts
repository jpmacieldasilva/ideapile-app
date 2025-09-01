// Tipos principais do IdeaPile
export interface Idea {
  id: string;
  content: string;
  timestamp: Date;
  tags: string[];
  isFavorite: boolean;
  aiExpansions?: AIExpansion[];
  connections?: string[]; // IDs de outras ideias conectadas
}

export interface AIExpansion {
  id: string;
  type: 'expand' | 'combine' | 'suggest' | 'inspire';
  content: string;
  timestamp: Date;
  relatedIdeas?: string[];
  ideaId: string; // ID da ideia pai
}

export interface AppSettings {
  openaiApiKey?: string;
  openaiModel: 'gpt-3.5-turbo' | 'gpt-4';
  aiTemperature: number;
  theme: 'light' | 'dark' | 'system';
  enableSpeechToText: boolean;
  enableAutoTagging: boolean; // Nova configuração para geração automática de tags
}

export interface IdeaCardProps {
  idea: Idea;
  onPress: (idea: Idea) => void;
  onFavorite: (id: string) => void;
  onDelete?: (id: string) => void;
}

export interface CaptureInputProps {
  onSave: (content: string, tags: string[]) => void;
  onCancel: () => void;
  placeholder?: string;
  initialValue?: string;
}
