import { useState, useEffect } from 'react';
import { storage } from '../services';

export interface UserSettings {
  userName: string;
  userEmail?: string;
}

const DEFAULT_USER_SETTINGS: UserSettings = {
  userName: 'Usuário',
  userEmail: '',
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS);
  const [loading, setLoading] = useState(true);

  // Carregar configurações do usuário
  const loadUserSettings = async () => {
    try {
      const savedUserName = await storage.getUserName();
      const savedUserEmail = await storage.getUserEmail();
      
      setSettings({
        userName: savedUserName || DEFAULT_USER_SETTINGS.userName,
        userEmail: savedUserEmail || DEFAULT_USER_SETTINGS.userEmail,
      });
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Salvar nome do usuário
  const saveUserName = async (userName: string) => {
    try {
      await storage.saveUserName(userName);
      setSettings(prev => ({ ...prev, userName }));
    } catch (error) {
      console.error('Error saving user name:', error);
      throw error;
    }
  };

  // Salvar email do usuário
  const saveUserEmail = async (userEmail: string) => {
    try {
      await storage.saveUserEmail(userEmail);
      setSettings(prev => ({ ...prev, userEmail }));
    } catch (error) {
      console.error('Error saving user email:', error);
      throw error;
    }
  };

  // Recarregar configurações (útil para sincronizar após mudanças)
  const refreshSettings = async () => {
    setLoading(true);
    await loadUserSettings();
  };

  useEffect(() => {
    loadUserSettings();
  }, []);

  return {
    settings,
    loading,
    saveUserName,
    saveUserEmail,
    loadUserSettings,
    refreshSettings,
  };
}
