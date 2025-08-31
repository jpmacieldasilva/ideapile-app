export * from './colors';
export * from './typography';
export * from './animations';

// Configurações gerais do app
export const APP_CONFIG = {
  name: 'IdeaPile',
  version: '1.0.0',
  description: 'Capture e expanda suas ideias com IA',
  
  // Configurações de IA
  ai: {
    defaultModel: 'gpt-3.5-turbo' as const,
    maxTokens: 150,
    temperature: 0.7,
    maxIdeasForCombine: 5,
  },
  
  // Configurações de UI
  ui: {
    fabSize: 56,
    cardMinHeight: 80,
    animationDuration: 200,
    hapticFeedback: true,
  },
  
  // Configurações de armazenamento
  storage: {
    dbName: 'ideapile.db',
    cacheTimeout: 1000 * 60 * 30, // 30 minutos
  },
} as const;

// Mensagens padrão
export const MESSAGES = {
  errors: {
    networkError: 'Erro de conexão. Verifique sua internet.',
    aiError: 'Erro ao processar com IA. Tente novamente.',
    storageError: 'Erro ao salvar. Tente novamente.',
    noApiKey: 'Configure sua chave da OpenAI nas configurações.',
  },
  success: {
    ideaSaved: 'Ideia salva com sucesso!',
    ideaDeleted: 'Ideia removida.',
    configSaved: 'Configurações salvas.',
  },
  placeholders: {
    ideaInput: 'Digite sua ideia aqui...',
    searchIdeas: 'Buscar ideias...',
    apiKey: 'Cole sua chave da OpenAI aqui',
  },
} as const;
