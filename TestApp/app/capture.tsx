import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { ideaPileService, speechService, storage } from '../src/services';
import { Colors, TextStyles, Spacing, BorderRadius, Shadows, AnimationDurations, createFadeAnimation, createScaleAnimation } from '../src/constants';

const { width, height } = Dimensions.get('window');

export default function CaptureScreen() {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [showTextInput, setShowTextInput] = useState(false);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [waveAnim] = useState(new Animated.Value(0));
  const [fadeInAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Verificar se speech está habilitado nas configurações
    checkSpeechSettings();
    
    // Animação de entrada da tela
    createFadeAnimation(fadeInAnim, 1, AnimationDurations.normal).start();
    
    // Cleanup ao sair da tela
    return () => {
      if (isListening) {
        speechService.stopListening().catch(console.error);
      }
    };
  }, []);

  // Animações para o microfone
  useEffect(() => {
    if (isListening) {
      // Animação de pulso
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Animação de onda
      Animated.loop(
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ).start();
    } else {
      pulseAnim.setValue(1);
      waveAnim.setValue(0);
    }
  }, [isListening]);

  const checkSpeechSettings = async () => {
    try {
      const settings = await storage.getSettings();
      setSpeechEnabled(settings.enableSpeechToText);
    } catch (error) {
      console.error('Error checking speech settings:', error);
    }
  };

  const handleStartListening = async () => {
    if (!speechEnabled) {
      Alert.alert(
        'Speech-to-Text desabilitado',
        'Habilite nas configurações para usar esta funcionalidade.',
        [
          { text: 'OK', style: 'cancel' },
          { text: 'Ir para configurações', onPress: () => router.push('/settings') }
        ]
      );
      return;
    }

    try {
      setIsListening(true);
      
      await speechService.startListening(
        (result) => {
          // Adicionar o texto reconhecido ao conteúdo atual
          const newContent = content 
            ? `${content}\n\n${result.text}` 
            : result.text;
          setContent(newContent);
          setIsListening(false);
          
          Alert.alert('Sucesso!', 'Texto capturado por voz! 🎤');
        },
        (error) => {
          setIsListening(false);
          Alert.alert('Erro', `Erro no reconhecimento de voz: ${error}`);
        }
      );
    } catch (error) {
      setIsListening(false);
      Alert.alert('Erro', 'Não foi possível iniciar o reconhecimento de voz');
    }
  };

  const handleStopListening = async () => {
    try {
      await speechService.stopListening();
      setIsListening(false);
    } catch (error) {
      console.error('Error stopping listening:', error);
      setIsListening(false);
    }
  };

  const handleSave = async () => {
    if (!content.trim()) {
      Alert.alert('Erro', 'Digite o conteúdo da sua ideia');
      return;
    }

    setSaving(true);
    try {
      // Processar tags
      const ideaTags = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      
      // Salvar no banco SQLite
      await ideaPileService.initialize(); // Garantir que está inicializado
      await ideaPileService.createIdea(content.trim(), ideaTags);
      
      Alert.alert('Sucesso', 'Ideia salva!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Erro ao salvar ideia:', error);
      Alert.alert('Erro', 'Não foi possível salvar a ideia');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (content.trim()) {
      Alert.alert(
        'Descartar',
        'Tem certeza que deseja descartar esta ideia?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => router.back() }
        ]
      );
    } else {
      router.back();
    }
  };

  if (showTextInput) {
    return (
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <StatusBar style="light" />
        
        {/* Header para modo texto */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowTextInput(false)} style={styles.backButton}>
            <Text style={styles.backText}>← Voltar</Text>
          </TouchableOpacity>
          
          <Text style={styles.headerTitle}>Escrever Ideia</Text>
          
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, (!content.trim() || saving) && styles.saveButtonDisabled]}
            disabled={!content.trim() || saving}
          >
            <Text style={[styles.saveText, (!content.trim() || saving) && styles.saveTextDisabled]}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.textContent} showsVerticalScrollIndicator={false}>
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="Digite sua ideia aqui..."
              placeholderTextColor={Colors.mutedForeground}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              textAlignVertical="top"
            />
          </View>

          <View style={styles.tagsContainer}>
            <Text style={styles.tagsLabel}>Tags (opcional)</Text>
            <TextInput
              style={styles.tagsInput}
              placeholder="Ex: trabalho, pessoal, projeto"
              placeholderTextColor={Colors.mutedForeground}
              value={tags}
              onChangeText={setTags}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  return (
    <Animated.View style={[styles.container, { opacity: fadeInAnim }]}>
      <StatusBar style="light" />
      
      {/* Header minimalista */}
      <View style={styles.voiceHeader}>
        <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Interface principal de voz */}
      <View style={styles.voiceContainer}>
        {/* Título e instruções */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>
            {isListening ? 'Escutando...' : 'Grave sua ideia'}
          </Text>
          <Text style={styles.subtitle}>
            {isListening ? 'Fale agora e eu vou capturar!' : 'Toque no microfone para começar'}
          </Text>
        </View>

        {/* Preview do texto capturado */}
        {content.length > 0 && (
          <View style={styles.textPreview}>
            <Text style={styles.previewText} numberOfLines={6}>
              {content}
            </Text>
          </View>
        )}

        {/* Microfone central com animações */}
        <View style={styles.microphoneSection}>
          {/* Ondas de áudio animadas */}
          {isListening && (
            <View style={styles.audioWaves}>
              {[...Array(3)].map((_, i) => (
                <Animated.View
                  key={i}
                  style={[
                    styles.wave,
                    {
                      opacity: waveAnim,
                      transform: [
                        {
                          scale: waveAnim.interpolate({
                            inputRange: [0, 1],
                            outputRange: [1, 1.5 + i * 0.3],
                          }),
                        },
                      ],
                    },
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* Botão do microfone */}
          <Animated.View style={[styles.micButton, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              onPress={isListening ? handleStopListening : handleStartListening}
              style={[styles.micTouchable, isListening && styles.micActive]}
              disabled={saving}
            >
              <Text style={styles.micIcon}>🎤</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>

        {/* Status e ações */}
        <View style={styles.actionsSection}>
          {isListening && (
            <Text style={styles.listeningStatus}>Toque novamente para parar</Text>
          )}
          
          {!isListening && content.length === 0 && (
            <TouchableOpacity 
              onPress={() => setShowTextInput(true)} 
              style={styles.textOption}
            >
              <Text style={styles.textOptionText}>✏️ Prefere escrever?</Text>
            </TouchableOpacity>
          )}

          {content.length > 0 && !isListening && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                onPress={() => setContent('')} 
                style={styles.clearButton}
              >
                <Text style={styles.clearText}>🗑️ Limpar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSave} 
                style={[styles.saveMainButton, saving && styles.saveMainButtonDisabled]}
                disabled={saving}
              >
                <Text style={[styles.saveMainText, saving && styles.saveMainTextDisabled]}>
                  {saving ? 'Salvando...' : '💾 Salvar Ideia'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  // Container principal
  container: {
    flex: 1,
    backgroundColor: Colors.speechBackground,
  },

  // === Headers ===
  // Header para modo texto
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.header,
  },
  backButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  backText: {
    ...TextStyles.body,
    color: Colors.mutedForeground,
  },
  headerTitle: {
    ...TextStyles.heading,
    color: Colors.foreground,
  },
  
  // Header para modo voz (minimalista)
  voiceHeader: {
    position: 'absolute',
    top: 50,
    right: Spacing.lg,
    zIndex: 10,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 18,
    color: Colors.foreground,
  },

  // === Interface de Voz ===
  voiceContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
  },
  
  // Título e instruções
  titleSection: {
    alignItems: 'center',
    marginTop: Spacing.xxxl,
  },
  mainTitle: {
    ...TextStyles.title,
    color: Colors.foreground,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  subtitle: {
    ...TextStyles.body,
    color: Colors.mutedForeground,
    textAlign: 'center',
    maxWidth: width * 0.8,
  },

  // Preview do texto capturado
  textPreview: {
    backgroundColor: Colors.speechCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginVertical: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    maxHeight: height * 0.25,
  },
  previewText: {
    ...TextStyles.body,
    color: Colors.cardForeground,
    lineHeight: 24,
  },

  // Seção do microfone
  microphoneSection: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  
  // Ondas de áudio animadas
  audioWaves: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  wave: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: Colors.speechAccent,
  },
  
  // Botão do microfone
  micButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micTouchable: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.speechAccent,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.xl,
  },
  micActive: {
    backgroundColor: Colors.error,
  },
  micIcon: {
    fontSize: 48,
  },

  // Seção de ações
  actionsSection: {
    alignItems: 'center',
    minHeight: 80,
  },
  listeningStatus: {
    ...TextStyles.body,
    color: Colors.speechAccent,
    textAlign: 'center',
  },
  textOption: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  textOptionText: {
    ...TextStyles.body,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  
  // Botões de ação quando há conteúdo
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.md,
  },
  clearButton: {
    backgroundColor: Colors.muted,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.lg,
  },
  clearText: {
    ...TextStyles.button,
    color: Colors.mutedForeground,
  },
  saveMainButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.lg,
    ...Shadows.md,
  },
  saveMainButtonDisabled: {
    backgroundColor: Colors.muted,
  },
  saveMainText: {
    ...TextStyles.button,
    color: Colors.primaryForeground,
  },
  saveMainTextDisabled: {
    color: Colors.mutedForeground,
  },

  // === Modo Texto ===
  textContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
  },
  textInputContainer: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
  },
  textInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...TextStyles.body,
    color: Colors.foreground,
    backgroundColor: Colors.input,
    minHeight: height * 0.4,
    textAlignVertical: 'top',
  },
  tagsContainer: {
    marginBottom: Spacing.xl,
  },
  tagsLabel: {
    ...TextStyles.labelBold,
    color: Colors.foreground,
    marginBottom: Spacing.sm,
  },
  tagsInput: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...TextStyles.body,
    color: Colors.foreground,
    backgroundColor: Colors.input,
  },

  // Botões padrão
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  saveButtonDisabled: {
    backgroundColor: Colors.muted,
  },
  saveText: {
    ...TextStyles.button,
    color: Colors.primaryForeground,
  },
  saveTextDisabled: {
    color: Colors.mutedForeground,
  },
});
