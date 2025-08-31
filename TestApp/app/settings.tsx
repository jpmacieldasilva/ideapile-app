import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  Linking,
  Switch,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { storage, aiService } from '../src/services';
import { AppSettings } from '../src/types';

export default function SettingsScreen() {
  const [settings, setSettings] = useState<AppSettings>({
    openaiModel: 'gpt-3.5-turbo',
    aiTemperature: 0.7,
    theme: 'light',
    enableSpeechToText: true,
  });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await storage.getSettings();
      setSettings(savedSettings);
      
      const savedApiKey = await storage.getOpenAIKey();
      if (savedApiKey) {
        // Mostrar apenas os últimos 4 caracteres para segurança
        setApiKey(`${'*'.repeat(savedApiKey.length - 4)}${savedApiKey.slice(-4)}`);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Erro', 'Não foi possível carregar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await storage.saveSettings(settings);
      
      // Se a API key foi alterada (não tem asteriscos), salvar
      if (apiKey && !apiKey.includes('*')) {
        await storage.saveOpenAIKey(apiKey);
      }
      
      Alert.alert('Sucesso', 'Configurações salvas!');
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    } finally {
      setSaving(false);
    }
  };

  const handleTestAPI = async () => {
    if (!apiKey || apiKey.includes('*')) {
      Alert.alert('Erro', 'Digite uma chave da OpenAI válida');
      return;
    }

    setTesting(true);
    try {
      // Salvar temporariamente para testar
      await storage.saveOpenAIKey(apiKey);
      
      const isWorking = await aiService.testConnection();
      
      if (isWorking) {
        Alert.alert('Sucesso!', 'Conexão com OpenAI funcionando! 🎉');
      } else {
        Alert.alert('Erro', 'Não foi possível conectar com a OpenAI. Verifique sua chave.');
      }
    } catch (error) {
      console.error('Error testing API:', error);
      Alert.alert('Erro', 'Falha ao testar a conexão. Verifique sua internet e a chave da API.');
    } finally {
      setTesting(false);
    }
  };

  const openOpenAIHelp = () => {
    Linking.openURL('https://platform.openai.com/api-keys');
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Configurações</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Carregando configurações...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Configurações</Text>
        <TouchableOpacity 
          onPress={handleSaveSettings} 
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          disabled={saving}
        >
          <Text style={[styles.saveText, saving && styles.saveTextDisabled]}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Seção OpenAI */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 Inteligência Artificial</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Chave da API OpenAI</Text>
            <TextInput
              style={styles.input}
              placeholder="sk-..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={apiKey.includes('*')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={openOpenAIHelp} style={styles.helpButton}>
              <Text style={styles.helpText}>Como obter sua chave da API?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleTestAPI} 
            style={[styles.testButton, testing && styles.testButtonDisabled]}
            disabled={testing}
          >
            <Text style={styles.testButtonText}>
              {testing ? '🔄 Testando...' : '🧪 Testar Conexão'}
            </Text>
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Modelo da IA</Text>
            <View style={styles.modelContainer}>
              <TouchableOpacity
                style={[
                  styles.modelOption,
                  settings.openaiModel === 'gpt-3.5-turbo' && styles.modelOptionSelected
                ]}
                onPress={() => setSettings({ ...settings, openaiModel: 'gpt-3.5-turbo' })}
              >
                <Text style={[
                  styles.modelText,
                  settings.openaiModel === 'gpt-3.5-turbo' && styles.modelTextSelected
                ]}>
                  GPT-3.5 Turbo (Mais rápido)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modelOption,
                  settings.openaiModel === 'gpt-4' && styles.modelOptionSelected
                ]}
                onPress={() => setSettings({ ...settings, openaiModel: 'gpt-4' })}
              >
                <Text style={[
                  styles.modelText,
                  settings.openaiModel === 'gpt-4' && styles.modelTextSelected
                ]}>
                  GPT-4 (Mais inteligente)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>
              Criatividade da IA: {Math.round(settings.aiTemperature * 100)}%
            </Text>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Conservadora</Text>
              <View style={styles.sliderTrack}>
                <TouchableOpacity
                  style={[
                    styles.sliderThumb,
                    { left: `${settings.aiTemperature * 90}%` }
                  ]}
                  onPressIn={() => {
                    // Implementação simples do slider
                  }}
                />
              </View>
              <Text style={styles.sliderLabel}>Criativa</Text>
            </View>
            <Text style={styles.hint}>
              Maior criatividade pode gerar respostas mais inovadoras, mas menos precisas
            </Text>
          </View>
        </View>

        {/* Seção Geral */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>⚙️ Geral</Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Speech-to-Text</Text>
              <Text style={styles.settingDescription}>
                Captura de ideias por voz
              </Text>
            </View>
            <Switch
              value={settings.enableSpeechToText}
              onValueChange={(value) => 
                setSettings({ ...settings, enableSpeechToText: value })
              }
              trackColor={{ false: '#767577', true: '#2563eb' }}
              thumbColor={settings.enableSpeechToText ? '#f4f3f4' : '#f4f3f4'}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Text style={styles.settingLabel}>Tema</Text>
              <Text style={styles.settingDescription}>
                Aparência do aplicativo
              </Text>
            </View>
            <View style={styles.themeContainer}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  settings.theme === 'light' && styles.themeOptionSelected
                ]}
                onPress={() => setSettings({ ...settings, theme: 'light' })}
              >
                <Text style={styles.themeText}>☀️ Claro</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  settings.theme === 'dark' && styles.themeOptionSelected
                ]}
                onPress={() => setSettings({ ...settings, theme: 'dark' })}
              >
                <Text style={styles.themeText}>🌙 Escuro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Informações */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ Informações</Text>
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>IdeaPile v1.0.0</Text>
            <Text style={styles.infoText}>Capture e expanda suas ideias com IA</Text>
            <Text style={styles.infoSubtext}>
              Desenvolvido com React Native + Expo
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  backText: {
    fontSize: 16,
    color: '#2563eb',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  placeholder: {
    width: 60,
  },
  saveButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  saveTextDisabled: {
    color: '#d1d5db',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#f9fafb',
  },
  helpButton: {
    marginTop: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#2563eb',
    textDecorationLine: 'underline',
  },
  testButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  modelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  modelOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modelOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  modelText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  modelTextSelected: {
    color: '#2563eb',
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6b7280',
    minWidth: 70,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginHorizontal: 8,
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: '#2563eb',
    borderRadius: 10,
    top: -8,
  },
  hint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  themeOptionSelected: {
    borderColor: '#2563eb',
    backgroundColor: '#dbeafe',
  },
  themeText: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
  },
  bottomSpacing: {
    height: 50,
  },
});
