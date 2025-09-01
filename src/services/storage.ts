import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppSettings } from '../types';

// Chaves para o AsyncStorage
const STORAGE_KEYS = {
  APP_SETTINGS: '@ideapile:app_settings',
  FIRST_LAUNCH: '@ideapile:first_launch',
  AI_CACHE: '@ideapile:ai_cache',
} as const;

// Configurações padrão
const DEFAULT_SETTINGS: AppSettings = {
  openaiModel: 'gpt-3.5-turbo',
  aiTemperature: 0.7,
  theme: 'light',
  enableSpeechToText: true,
};

class StorageService {
  // Salvar configurações do app
  async saveSettings(settings: Partial<AppSettings>): Promise<void> {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      
      await AsyncStorage.setItem(
        STORAGE_KEYS.APP_SETTINGS,
        JSON.stringify(updatedSettings)
      );
      
      console.log('⚙️ Settings saved successfully');
    } catch (error) {
      console.error('❌ Error saving settings:', error);
      throw error;
    }
  }

  // Carregar configurações do app
  async getSettings(): Promise<AppSettings> {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
      
      if (settingsJson) {
        const savedSettings = JSON.parse(settingsJson);
        return { ...DEFAULT_SETTINGS, ...savedSettings };
      }
      
      return DEFAULT_SETTINGS;
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  // Salvar chave da API OpenAI
  async saveOpenAIKey(apiKey: string): Promise<void> {
    try {
      await this.saveSettings({ openaiApiKey: apiKey });
      console.log('🔑 OpenAI API key saved');
    } catch (error) {
      console.error('❌ Error saving OpenAI key:', error);
      throw error;
    }
  }

  // Buscar chave da API OpenAI
  async getOpenAIKey(): Promise<string | null> {
    try {
      const settings = await this.getSettings();
      return settings.openaiApiKey || null;
    } catch (error) {
      console.error('❌ Error getting OpenAI key:', error);
      return null;
    }
  }

  // Verificar se é o primeiro lançamento
  async isFirstLaunch(): Promise<boolean> {
    try {
      const firstLaunch = await AsyncStorage.getItem(STORAGE_KEYS.FIRST_LAUNCH);
      return firstLaunch === null;
    } catch (error) {
      console.error('❌ Error checking first launch:', error);
      return true;
    }
  }

  // Marcar que o app já foi lançado
  async markAsLaunched(): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FIRST_LAUNCH, 'false');
      console.log('🚀 App marked as launched');
    } catch (error) {
      console.error('❌ Error marking as launched:', error);
    }
  }

  // Cache para respostas da IA (economizar tokens)
  async saveAICache(prompt: string, response: string, expiresIn: number = 1800000): Promise<void> { // 30 minutos
    try {
      const cacheKey = `${STORAGE_KEYS.AI_CACHE}:${this.hashString(prompt)}`;
      const cacheData = {
        response,
        timestamp: Date.now(),
        expiresAt: Date.now() + expiresIn,
      };
      
      await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('🧠 AI response cached');
    } catch (error) {
      console.error('❌ Error caching AI response:', error);
    }
  }

  // Buscar resposta da IA no cache
  async getAICache(prompt: string): Promise<string | null> {
    try {
      const cacheKey = `${STORAGE_KEYS.AI_CACHE}:${this.hashString(prompt)}`;
      const cacheJson = await AsyncStorage.getItem(cacheKey);
      
      if (!cacheJson) return null;
      
      const cacheData = JSON.parse(cacheJson);
      
      // Verificar se o cache ainda é válido
      if (Date.now() > cacheData.expiresAt) {
        await AsyncStorage.removeItem(cacheKey);
        return null;
      }
      
      console.log('💾 AI response found in cache');
      return cacheData.response;
    } catch (error) {
      console.error('❌ Error reading AI cache:', error);
      return null;
    }
  }

  // Limpar cache expirado
  async clearExpiredCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(STORAGE_KEYS.AI_CACHE));
      
      for (const key of cacheKeys) {
        const cacheJson = await AsyncStorage.getItem(key);
        if (cacheJson) {
          const cacheData = JSON.parse(cacheJson);
          if (Date.now() > cacheData.expiresAt) {
            await AsyncStorage.removeItem(key);
          }
        }
      }
      
      console.log('🧹 Expired cache cleared');
    } catch (error) {
      console.error('❌ Error clearing expired cache:', error);
    }
  }

  // Limpar todos os dados (reset do app)
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.clear();
      console.log('🗑️ All data cleared');
    } catch (error) {
      console.error('❌ Error clearing all data:', error);
      throw error;
    }
  }

  // Exportar dados para backup
  async exportData(): Promise<object> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const allData: Record<string, any> = {};
      
      for (const key of allKeys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          allData[key] = JSON.parse(value);
        }
      }
      
      return {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data: allData,
      };
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      throw error;
    }
  }

  // Salvar nome do usuário
  async saveUserName(userName: string): Promise<void> {
    try {
      await AsyncStorage.setItem('@ideapile:user_name', userName);
      console.log('👤 User name saved');
    } catch (error) {
      console.error('❌ Error saving user name:', error);
      throw error;
    }
  }

  // Buscar nome do usuário
  async getUserName(): Promise<string | null> {
    try {
      const userName = await AsyncStorage.getItem('@ideapile:user_name');
      return userName;
    } catch (error) {
      console.error('❌ Error getting user name:', error);
      return null;
    }
  }

  // Método genérico para buscar item
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`❌ Error getting item ${key}:`, error);
      return null;
    }
  }

  // Método genérico para salvar item
  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`❌ Error setting item ${key}:`, error);
      throw error;
    }
  }

  // Função helper para criar hash simples
  private hashString(str: string): string {
    let hash = 0;
    if (str.length === 0) return hash.toString();
    
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    return Math.abs(hash).toString();
  }

  // Debug - listar todas as chaves
  async debugStorage(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      console.log('🔍 AsyncStorage keys:', keys);
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        console.log(`📦 ${key}:`, value);
      }
    } catch (error) {
      console.error('❌ Error debugging storage:', error);
    }
  }
}

// Exportar instância singleton
export const storage = new StorageService();
export default storage;
