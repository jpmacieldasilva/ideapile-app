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
import { Colors, TextStyles, Spacing, BorderRadius } from '../src/constants';
import { Icon, AppIcons } from '../src/components/ui';
import { useTheme } from '../src/contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme, colors, setTheme, isLoading } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    openaiModel: 'gpt-3.5-turbo',
    aiTemperature: 0.7,
    theme: theme || 'dark',
    enableSpeechToText: true,
  });
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [userName, setUserName] = useState('');

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

      const savedUserName = await storage.getUserName();
      if (savedUserName) {
        setUserName(savedUserName);
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

      if (userName) {
        await storage.saveUserName(userName);
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
        Alert.alert('Sucesso!', 'Conexão com OpenAI funcionando!');
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

  const handleThemeChange = async (newTheme: 'light' | 'dark') => {
    const newSettings = { ...settings, theme: newTheme };
    setSettings(newSettings);
    
    // Atualizar o contexto de tema imediatamente
    setTheme(newTheme);
    
    // Salvar automaticamente a mudança de tema
    try {
      await storage.saveSettings(newSettings);
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração de tema');
    }
  };

  const handleSpeechToggle = async (enabled: boolean) => {
    const newSettings = { ...settings, enableSpeechToText: enabled };
    setSettings(newSettings);
    
    // Salvar automaticamente a mudança de speech
    try {
      await storage.saveSettings(newSettings);
    } catch (error) {
      console.error('Error saving speech setting:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração de fala');
    }
  };

  // Aguardar tanto o loading das configurações quanto do tema
  if (loading || isLoading) {
    // Usar estilos estáticos durante o loading
    const loadingStyles = createStyles(Colors);
    return (
      <View style={loadingStyles.container}>
        <View style={loadingStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={loadingStyles.backButton}>
            <Text style={loadingStyles.backText}>← Voltar</Text>
          </TouchableOpacity>
          <Text style={loadingStyles.title}>Configurações</Text>
          <View style={loadingStyles.placeholder} />
        </View>
        <View style={loadingStyles.loadingContainer}>
          <Text style={loadingStyles.loadingText}>Carregando configurações...</Text>
        </View>
      </View>
    );
  }

  const dynamicStyles = createStyles(colors);
  
  return (
    <View style={dynamicStyles.container}>
      <StatusBar style={theme === 'light' ? 'dark' : 'light'} />
      
      {/* Header */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={() => router.back()} style={dynamicStyles.backButton}>
          <Text style={dynamicStyles.backText}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Configurações</Text>
        <TouchableOpacity 
          onPress={handleSaveSettings} 
          style={[dynamicStyles.saveButton, saving && dynamicStyles.saveButtonDisabled]}
          disabled={saving}
        >
          <Text style={[dynamicStyles.saveText, saving && dynamicStyles.saveTextDisabled]}>
            {saving ? 'Salvando...' : 'Salvar'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Seção do Usuário */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="person" library="Material" size={18} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>Perfil do Usuário</Text>
          </View>
          
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Seu Nome</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="Digite seu nome"
              value={userName}
              onChangeText={setUserName}
              autoCapitalize="words"
              autoCorrect={false}
            />
            <Text style={dynamicStyles.helpText}>
              Este nome aparecerá na saudação da tela inicial
            </Text>
          </View>
        </View>

        {/* Seção OpenAI */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="smart-toy" library="Material" size={18} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>Inteligência Artificial</Text>
          </View>
          
          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Chave da API OpenAI</Text>
            <TextInput
              style={dynamicStyles.input}
              placeholder="sk-..."
              value={apiKey}
              onChangeText={setApiKey}
              secureTextEntry={apiKey.includes('*')}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <TouchableOpacity onPress={openOpenAIHelp} style={dynamicStyles.helpButton}>
              <Text style={dynamicStyles.helpText}>Como obter sua chave da API?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            onPress={handleTestAPI} 
            style={[dynamicStyles.testButton, testing && dynamicStyles.testButtonDisabled]}
            disabled={testing}
          >
            <View style={dynamicStyles.testButtonContent}>
              {testing ? (
                <>
                  <Icon {...AppIcons.loading} size={16} color={colors.primaryForeground} />
                  <Text style={dynamicStyles.testButtonText}>Testando...</Text>
                </>
              ) : (
                <>
                  <Icon {...AppIcons.test} size={16} color={colors.primaryForeground} />
                  <Text style={dynamicStyles.testButtonText}>Testar Conexão</Text>
                </>
              )}
            </View>
          </TouchableOpacity>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>Modelo da IA</Text>
            <View style={dynamicStyles.modelContainer}>
              <TouchableOpacity
                style={[
                  dynamicStyles.modelOption,
                  settings.openaiModel === 'gpt-3.5-turbo' && dynamicStyles.modelOptionSelected
                ]}
                onPress={() => setSettings({ ...settings, openaiModel: 'gpt-3.5-turbo' })}
              >
                <Text style={[
                  dynamicStyles.modelText,
                  settings.openaiModel === 'gpt-3.5-turbo' && dynamicStyles.modelTextSelected
                ]}>
                  GPT-3.5 Turbo (Mais rápido)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.modelOption,
                  settings.openaiModel === 'gpt-4' && dynamicStyles.modelOptionSelected
                ]}
                onPress={() => setSettings({ ...settings, openaiModel: 'gpt-4' })}
              >
                <Text style={[
                  dynamicStyles.modelText,
                  settings.openaiModel === 'gpt-4' && dynamicStyles.modelTextSelected
                ]}>
                  GPT-4 (Mais inteligente)
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={dynamicStyles.inputContainer}>
            <Text style={dynamicStyles.label}>
              Criatividade da IA: {Math.round(settings.aiTemperature * 100)}%
            </Text>
            <View style={dynamicStyles.sliderContainer}>
              <Text style={dynamicStyles.sliderLabel}>Conservadora</Text>
              <View style={dynamicStyles.sliderTrack}>
                <TouchableOpacity
                  style={[
                    dynamicStyles.sliderThumb,
                    { left: `${settings.aiTemperature * 90}%` }
                  ]}
                  onPressIn={() => {
                    // Implementação simples do slider
                  }}
                />
              </View>
              <Text style={dynamicStyles.sliderLabel}>Criativa</Text>
            </View>
            <Text style={dynamicStyles.hint}>
              Maior criatividade pode gerar respostas mais inovadoras, mas menos precisas
            </Text>
          </View>
        </View>

        {/* Seção Geral */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon {...AppIcons.settings} size={18} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>Geral</Text>
          </View>
          
          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingInfo}>
              <Text style={dynamicStyles.settingLabel}>Speech-to-Text</Text>
              <Text style={dynamicStyles.settingDescription}>
                Captura de ideias por voz
              </Text>
            </View>
            <Switch
              value={settings.enableSpeechToText}
              onValueChange={handleSpeechToggle}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={colors.primaryForeground}
            />
          </View>

          <View style={dynamicStyles.settingRow}>
            <View style={dynamicStyles.settingInfo}>
              <Text style={dynamicStyles.settingLabel}>Tema</Text>
              <Text style={dynamicStyles.settingDescription}>
                Aparência do aplicativo
              </Text>
            </View>
            <View style={dynamicStyles.themeContainer}>
              <TouchableOpacity
                style={[
                  dynamicStyles.themeOption,
                  settings.theme === 'light' && dynamicStyles.themeOptionSelected
                ]}
                onPress={() => handleThemeChange('light')}
              >
                <View style={dynamicStyles.themeOptionContent}>
                  <Icon {...AppIcons.lightMode} size={16} color={colors.foreground} />
                  <Text style={dynamicStyles.themeText}>Claro</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  dynamicStyles.themeOption,
                  settings.theme === 'dark' && dynamicStyles.themeOptionSelected
                ]}
                onPress={() => handleThemeChange('dark')}
              >
                <View style={dynamicStyles.themeOptionContent}>
                  <Icon {...AppIcons.darkMode} size={16} color={colors.foreground} />
                  <Text style={dynamicStyles.themeText}>Escuro</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Informações */}
        <View style={dynamicStyles.section}>
          <Text style={dynamicStyles.sectionTitle}>ℹ️ Informações</Text>
          <View style={dynamicStyles.infoContainer}>
            <Text style={dynamicStyles.infoText}>IdeaPile v1.0.0</Text>
            <Text style={dynamicStyles.infoText}>Capture e expanda suas ideias com IA</Text>
            <Text style={dynamicStyles.infoSubtext}>
              Desenvolvido com React Native + Expo
            </Text>
          </View>
        </View>

        <View style={dynamicStyles.bottomSpacing} />
      </ScrollView>
    </View>
  );
}

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.primary,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
  },
  placeholder: {
    width: 60,
  },
  saveButton: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  saveButtonDisabled: {
    backgroundColor: colors.muted,
  },
  saveText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryForeground,
  },
  saveTextDisabled: {
    color: colors.mutedForeground,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedForeground,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.foreground,
    marginLeft: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.input,
  },
  helpButton: {
    marginTop: 4,
  },
  helpText: {
    fontSize: 14,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
  testButton: {
    backgroundColor: colors.success,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  testButtonDisabled: {
    backgroundColor: colors.muted,
  },
  testButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primaryForeground,
    marginLeft: 8,
  },
  modelContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  modelOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  modelOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  modelText: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
  },
  modelTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    minWidth: 70,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: colors.muted,
    borderRadius: 2,
    marginHorizontal: 8,
    position: 'relative',
  },
  sliderThumb: {
    position: 'absolute',
    width: 20,
    height: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    top: -8,
  },
  hint: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.foreground,
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  themeContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  themeOption: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  themeOptionSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.accent,
  },
  themeOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeText: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginLeft: 8,
  },
  infoContainer: {
    padding: 16,
    backgroundColor: colors.muted,
    borderRadius: 8,
  },
  infoText: {
    fontSize: 16,
    color: colors.foreground,
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginTop: 8,
  },
  bottomSpacing: {
    height: 50,
  },
});

// Estilos estáticos para compatibilidade
const styles = createStyles(Colors);
