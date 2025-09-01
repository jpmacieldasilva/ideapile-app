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
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { storage, aiService, ideaPileService } from '../src/services';
import { AppSettings, Idea, AIExpansion } from '../src/types';
import { Colors } from '../src/constants';
import { Icon, AppIcons } from '../src/components/ui';
import { useTheme } from '../src/contexts/ThemeContext';

export default function SettingsScreen() {
  const { theme, colors, setTheme, isLoading } = useTheme();
  const [settings, setSettings] = useState<AppSettings>({
    openaiModel: 'gpt-3.5-turbo',
    aiTemperature: 0.7,
    theme: theme || 'dark',
    enableSpeechToText: true,
    enableAutoTagging: true,
  });
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Skylar');
  const [userEmail, setUserEmail] = useState('');

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

      const savedUserEmail = await storage.getUserEmail();
      if (savedUserEmail) {
        setUserEmail(savedUserEmail);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      Alert.alert('Erro', 'Não foi possível carregar as configurações');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await storage.saveSettings(settings);
      
      // Se a API key foi alterada (não tem asteriscos), salvar
      if (apiKey && !apiKey.includes('*')) {
        await storage.saveOpenAIKey(apiKey);
      }

      if (userName) {
        await storage.saveUserName(userName);
      }

      if (userEmail) {
        await storage.saveUserEmail(userEmail);
      }
      
      Alert.alert('Sucesso', 'Configurações salvas!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Navegar de volta para a home para refletir as mudanças
            router.back();
          }
        }
      ]);
    } catch (error) {
      console.error('Error saving settings:', error);
      Alert.alert('Erro', 'Não foi possível salvar as configurações');
    }
  };

  const handleThemeChange = async (newTheme: 'light' | 'dark' | 'system') => {
    const newSettings = { ...settings, theme: newTheme as 'light' | 'dark' };
    setSettings(newSettings);
    
    // Atualizar o contexto de tema imediatamente
    if (newTheme !== 'system') {
      setTheme(newTheme as 'light' | 'dark');
    }
    
    // Salvar automaticamente a mudança de tema
    try {
      await storage.saveSettings(newSettings);
    } catch (error) {
      console.error('Error saving theme:', error);
      Alert.alert('Erro', 'Não foi possível salvar a configuração de tema');
    }
  };

  const handleExport = async (format: 'json' | 'csv' | 'txt') => {
    try {
      // Buscar todos os dados
      const allData = await storage.exportData() as any;
      const ideas = await ideaPileService.getAllIdeas();
      
      let exportContent = '';
      let fileName = `ideapile-export-${new Date().toISOString().split('T')[0]}`;
      let mimeType = '';
      
      switch (format) {
        case 'json':
          const jsonData = {
            exportDate: new Date().toISOString(),
            version: '1.0.0',
            user: {
              name: allData.data['@ideapile:user_name'] || 'Unknown',
              email: allData.data['@ideapile:user_email'] || '',
            },
            settings: allData.data['@ideapile:app_settings'] || {},
            ideas: ideas.map((idea: Idea) => ({
              id: idea.id,
              content: idea.content,
              timestamp: idea.timestamp.toISOString(),
              tags: idea.tags,
              isFavorite: idea.isFavorite,
              connections: idea.connections || [],
              aiExpansions: idea.aiExpansions || [],
            })),
            totalIdeas: ideas.length,
          };
          exportContent = JSON.stringify(jsonData, null, 2);
          fileName += '.json';
          mimeType = 'application/json';
          break;
          
        case 'csv':
          // Cabeçalho CSV
          exportContent = 'ID,Content,Timestamp,Tags,IsFavorite,Connections,AIExpansions\n';
          
          // Dados das ideias
          ideas.forEach((idea: Idea) => {
            const content = `"${idea.content.replace(/"/g, '""')}"`;
            const timestamp = idea.timestamp.toISOString();
            const tags = `"${idea.tags.join('; ')}"`;
            const isFavorite = idea.isFavorite ? 'true' : 'false';
            const connections = `"${(idea.connections || []).join('; ')}"`;
            const aiExpansions = `"${(idea.aiExpansions || []).map((exp: AIExpansion) => exp.type).join('; ')}"`;
            
            exportContent += `${idea.id},${content},${timestamp},${tags},${isFavorite},${connections},${aiExpansions}\n`;
          });
          fileName += '.csv';
          mimeType = 'text/csv';
          break;
          
        case 'txt':
          // Formato de texto legível
          exportContent = `IdeaPile Export\n`;
          exportContent += `Generated: ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n`;
          exportContent += `User: ${allData.data['@ideapile:user_name'] || 'Unknown'}\n`;
          exportContent += `Total Ideas: ${ideas.length}\n`;
          exportContent += `\n${'='.repeat(50)}\n\n`;
          
          ideas.forEach((idea: Idea, index: number) => {
            exportContent += `IDEA ${index + 1}\n`;
            exportContent += `ID: ${idea.id}\n`;
            exportContent += `Content: ${idea.content}\n`;
            exportContent += `Created: ${idea.timestamp.toLocaleDateString()} ${idea.timestamp.toLocaleTimeString()}\n`;
            exportContent += `Tags: ${idea.tags.join(', ')}\n`;
            exportContent += `Favorite: ${idea.isFavorite ? 'Yes' : 'No'}\n`;
            
            if (idea.connections && idea.connections.length > 0) {
              exportContent += `Connections: ${idea.connections.join(', ')}\n`;
            }
            
            if (idea.aiExpansions && idea.aiExpansions.length > 0) {
              exportContent += `AI Expansions:\n`;
              idea.aiExpansions.forEach((exp: AIExpansion) => {
                exportContent += `  - ${exp.type}: ${exp.content.substring(0, 100)}...\n`;
              });
            }
            
            exportContent += `\n${'-'.repeat(30)}\n\n`;
          });
          fileName += '.txt';
          mimeType = 'text/plain';
          break;
      }
      
      // Salvar arquivo temporário
      const fileUri = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(fileUri, exportContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      
      // Verificar se o compartilhamento está disponível
      const isAvailable = await Sharing.isAvailableAsync();
      
      if (isAvailable) {
        // Compartilhar arquivo
        await Sharing.shareAsync(fileUri, {
          mimeType,
          dialogTitle: `Export IdeaPile Data as ${format.toUpperCase()}`,
          UTI: format === 'json' ? 'public.json' : format === 'csv' ? 'public.comma-separated-values-text' : 'public.plain-text',
        });
        
        Alert.alert(
          'Export Successful', 
          `Your data has been exported as ${format.toUpperCase()} and is ready to share!`,
          [{ text: 'OK', style: 'default' }]
        );
      } else {
        // Fallback: mostrar conteúdo em alert
        Alert.alert(
          'Export Ready', 
          `Data exported as ${format.toUpperCase()}\n\nFile saved to: ${fileUri}\n\nFirst 500 characters:\n${exportContent.substring(0, 500)}...`,
          [
            { text: 'OK', style: 'default' },
            { 
              text: 'Copy to Clipboard', 
              onPress: () => {
                // Aqui você pode implementar a cópia para clipboard se necessário
                console.log('Copy to clipboard:', exportContent);
              }
            }
          ]
        );
      }
      
      console.log(`✅ Export completed: ${fileName}`);
    } catch (error) {
      console.error('❌ Error exporting data:', error);
      Alert.alert('Export Error', 'Failed to export data. Please try again.');
    }
  };

  // Aguardar tanto o loading das configurações quanto do tema
  if (loading || isLoading) {
    const loadingStyles = createStyles(Colors);
    return (
      <View style={loadingStyles.container}>
        <View style={loadingStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={loadingStyles.backButton}>
            <Icon name="arrow-back" library="Material" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={loadingStyles.title}>Settings</Text>
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
          <Icon name="arrow-back" library="Material" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Settings</Text>
        <TouchableOpacity 
          onPress={handleSaveSettings} 
          style={dynamicStyles.saveButton}
        >
          <Text style={dynamicStyles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* PROFILE Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="person" library="Material" size={20} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>PROFILE</Text>
          </View>
          
          <View style={dynamicStyles.card}>
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Name</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter your name"
                value={userName}
                onChangeText={setUserName}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
            
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Email</Text>
              <TextInput
                style={dynamicStyles.input}
                placeholder="Enter your email"
                value={userEmail}
                onChangeText={setUserEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
              />
            </View>
          </View>
        </View>

        {/* AI CONFIGURATION Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="build" library="Material" size={20} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>AI CONFIGURATION</Text>
          </View>
          
          <View style={dynamicStyles.card}>
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>OpenAI API Key</Text>
              <View style={dynamicStyles.passwordContainer}>
                <TextInput
                  style={dynamicStyles.passwordInput}
                  placeholder="sk-..."
                  value={apiKey}
                  onChangeText={setApiKey}
                  secureTextEntry={!showApiKey}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity 
                  onPress={() => setShowApiKey(!showApiKey)}
                  style={dynamicStyles.eyeButton}
                >
                  <Icon 
                    name={showApiKey ? "visibility-off" : "visibility"} 
                    library="Material" 
                    size={20} 
                    color={colors.mutedForeground} 
                  />
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.helpText}>
                Required for AI features like idea expansion and connections
              </Text>
            </View>

            {/* Auto Tagging Toggle */}
            <View style={dynamicStyles.inputContainer}>
              <View style={dynamicStyles.toggleRow}>
                <View style={dynamicStyles.toggleTextContainer}>
                  <Text style={dynamicStyles.label}>Geração Automática de Tags</Text>
                  <Text style={dynamicStyles.helpText}>
                    Gerar automaticamente 3 tags relevantes ao salvar ideias
                  </Text>
                </View>
                <TouchableOpacity 
                  onPress={() => setSettings({...settings, enableAutoTagging: !settings.enableAutoTagging})}
                  style={[
                    dynamicStyles.toggleSwitch,
                    { backgroundColor: settings.enableAutoTagging ? colors.primary : colors.border }
                  ]}
                >
                  <View style={[
                    dynamicStyles.toggleThumb,
                    { 
                      transform: [{ translateX: settings.enableAutoTagging ? 20 : 0 }],
                      backgroundColor: colors.background
                    }
                  ]} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* APPEARANCE Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="palette" library="Material" size={20} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>APPEARANCE</Text>
          </View>
          
          <View style={dynamicStyles.card}>
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Theme</Text>
              <TouchableOpacity 
                style={dynamicStyles.selectContainer}
                onPress={() => {
                  // Toggle between themes
                  const themes: ('light' | 'dark' | 'system')[] = ['light', 'dark', 'system'];
                  const currentIndex = themes.indexOf(settings.theme as any);
                  const nextTheme = themes[(currentIndex + 1) % themes.length];
                  handleThemeChange(nextTheme);
                }}
              >
                <View style={dynamicStyles.selectContent}>
                  <Icon name="computer" library="Material" size={16} color={colors.foreground} />
                  <Text style={dynamicStyles.selectText}>System</Text>
                </View>
                <Icon name="keyboard-arrow-down" library="Material" size={20} color={colors.mutedForeground} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* DATA & EXPORT Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="file-download" library="Material" size={20} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>DATA & EXPORT</Text>
          </View>
          
          <View style={dynamicStyles.card}>
            <View style={dynamicStyles.inputContainer}>
              <Text style={dynamicStyles.label}>Export Options</Text>
              <View style={dynamicStyles.exportButtonsContainer}>
                <TouchableOpacity 
                  style={dynamicStyles.exportButton}
                  onPress={() => handleExport('json')}
                >
                  <Icon name="storage" library="Material" size={20} color={colors.foreground} />
                  <Text style={dynamicStyles.exportButtonText}>JSON</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={dynamicStyles.exportButton}
                  onPress={() => handleExport('csv')}
                >
                  <Icon name="description" library="Material" size={20} color={colors.foreground} />
                  <Text style={dynamicStyles.exportButtonText}>CSV</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={dynamicStyles.exportButton}
                  onPress={() => handleExport('txt')}
                >
                  <Icon name="article" library="Material" size={20} color={colors.foreground} />
                  <Text style={dynamicStyles.exportButtonText}>TXT</Text>
                </TouchableOpacity>
              </View>
              <Text style={dynamicStyles.helpText}>
                Export all your ideas in your preferred format
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={dynamicStyles.footer}>
          <Text style={dynamicStyles.footerText}>IdeaPile v1.0.0</Text>
          <Text style={dynamicStyles.footerSubtext}>Built with ❤️ for creative minds</Text>
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
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.foreground,
  },
  placeholder: {
    width: 40,
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
    paddingHorizontal: 24,
  },
  section: {
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.mutedForeground,
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.input,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    paddingRight: 48,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.input,
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    padding: 4,
  },
  helpText: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  selectContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    backgroundColor: colors.input,
  },
  selectContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectText: {
    fontSize: 16,
    color: colors.foreground,
    marginLeft: 8,
  },
  exportButtonsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  exportButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  exportButtonText: {
    fontSize: 12,
    color: colors.foreground,
    marginTop: 4,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    color: colors.mutedForeground,
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 4,
  },
  bottomSpacing: {
    height: 50,
  },
  saveButton: {
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  saveText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  toggleTextContainer: {
    flex: 1,
  },
  toggleSwitch: {
    width: 50,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
});
