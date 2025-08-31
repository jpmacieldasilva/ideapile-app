import * as Speech from 'expo-speech';
import Voice from '@react-native-voice/voice';
import { Platform } from 'react-native';

// Interface para resultados de speech-to-text
export interface SpeechResult {
  text: string;
  confidence?: number;
}

// Configurações padrão para speech
const SPEECH_CONFIG = {
  language: 'pt-BR', // Português brasileiro
  maxResults: 1,
  partialResults: true,
};

// Classe para gerenciar funcionalidades de voz
class SpeechService {
  private isListening = false;
  private onResultCallback: ((result: SpeechResult) => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;

  constructor() {
    // Só configurar callbacks do Voice se não estiver na web (Expo Go)
    if (Platform.OS !== 'web') {
      try {
        Voice.onSpeechStart = this.onSpeechStart.bind(this);
        Voice.onSpeechRecognized = this.onSpeechRecognized.bind(this);
        Voice.onSpeechEnd = this.onSpeechEnd.bind(this);
        Voice.onSpeechError = this.onSpeechError.bind(this);
        Voice.onSpeechResults = this.onSpeechResults.bind(this);
        Voice.onSpeechPartialResults = this.onSpeechPartialResults.bind(this);
        Voice.onSpeechVolumeChanged = this.onSpeechVolumeChanged.bind(this);
      } catch (error) {
        console.warn('⚠️ Voice callbacks setup failed (provavelmente Expo Go):', error);
      }
    }
  }

  // Callbacks do Voice
  private onSpeechStart = (e: any) => {
    console.log('🎤 Speech recognition started');
    this.isListening = true;
  };

  private onSpeechRecognized = (e: any) => {
    console.log('🎤 Speech recognized');
  };

  private onSpeechEnd = (e: any) => {
    console.log('🎤 Speech recognition ended');
    this.isListening = false;
  };

  private onSpeechError = (e: any) => {
    console.error('❌ Speech recognition error:', e.error);
    this.isListening = false;
    if (this.onErrorCallback) {
      this.onErrorCallback(`Erro no reconhecimento: ${e.error?.message || e.error}`);
    }
  };

  private onSpeechResults = (e: any) => {
    console.log('✅ Speech results:', e.value);
    if (e.value && e.value.length > 0 && this.onResultCallback) {
      const bestResult = e.value[0]; // Pegar o melhor resultado
      this.onResultCallback({
        text: bestResult,
        confidence: 0.95 // Voice não fornece confidence, então estimamos
      });
    }
    this.isListening = false;
  };

  private onSpeechPartialResults = (e: any) => {
    console.log('🔄 Partial results:', e.value);
    // Podemos mostrar resultados parciais se necessário
  };

  private onSpeechVolumeChanged = (e: any) => {
    // console.log('🔊 Volume changed:', e.value);
  };

  // Verificar se speech-to-text está disponível
  async isAvailable(): Promise<boolean> {
    try {
      // Se estiver na web (Expo Go), retornar false mas não dar erro
      if (Platform.OS === 'web') {
        console.log('🌐 Running on web (Expo Go) - Voice not available');
        return false;
      }

      const available = await Voice.isAvailable();
      console.log('🎤 Speech recognition available:', available);
      return available;
    } catch (error) {
      console.error('❌ Error checking speech availability:', error);
      return false;
    }
  }

  // Iniciar captura de voz REAL
  async startListening(
    onResult: (result: SpeechResult) => void,
    onError: (error: string) => void
  ): Promise<void> {
    try {
      if (this.isListening) {
        throw new Error('Já está escutando');
      }

      // Verificar se está disponível
      const available = await this.isAvailable();
      if (!available) {
        // Fallback para quando não está disponível (Expo Go, etc)
        console.log('🔄 Using fallback speech simulation');
        this.simulateSpeechRecognition(onResult, onError);
        return;
      }

      // Configurar callbacks
      this.onResultCallback = onResult;
      this.onErrorCallback = onError;

      // Configurações do reconhecimento
      const options = {
        'EXTRA_LANGUAGE_MODEL': 'LANGUAGE_MODEL_FREE_FORM',
        'EXTRA_CALLING_PACKAGE': 'com.wseen.wseen',
        'EXTRA_PARTIAL_RESULTS': true,
        'REQUEST_PERMISSIONS_AUTO': true,
        'EXTRA_SPEECH_INPUT_MINIMUM_LENGTH_MILLIS': 10000,
        'EXTRA_SPEECH_INPUT_COMPLETE_SILENCE_LENGTH_MILLIS': 1500,
        'EXTRA_SPEECH_INPUT_POSSIBLY_COMPLETE_SILENCE_LENGTH_MILLIS': 1500,
      };

      // Iniciar reconhecimento
      await Voice.start(SPEECH_CONFIG.language, options);
      console.log('🎤 Voice recognition started with language:', SPEECH_CONFIG.language);

    } catch (error) {
      console.error('❌ Error starting speech recognition:', error);
      this.isListening = false;
      this.onResultCallback = null;
      this.onErrorCallback = null;
      onError(error instanceof Error ? error.message : 'Erro ao iniciar reconhecimento de voz');
    }
  }

  // Parar captura de voz
  async stopListening(): Promise<void> {
    try {
      if (this.isListening) {
        // Só chamar Voice.stop() se não estiver na web
        if (Platform.OS !== 'web') {
          try {
            await Voice.stop();
            console.log('🛑 Voice recognition stopped');
          } catch (error) {
            console.warn('⚠️ Voice stop failed (expected in Expo Go):', error);
          }
        } else {
          console.log('🛑 [SIMULAÇÃO] Reconhecimento interrompido');
        }
      }
      this.isListening = false;
      this.onResultCallback = null;
      this.onErrorCallback = null;
    } catch (error) {
      console.error('❌ Error stopping speech recognition:', error);
      this.isListening = false;
      this.onResultCallback = null;
      this.onErrorCallback = null;
    }
  }

  // Verificar se está ouvindo
  getIsListening(): boolean {
    return this.isListening;
  }

  // Simulação para quando Voice não está disponível (Expo Go)
  private simulateSpeechRecognition(
    onResult: (result: SpeechResult) => void,
    onError: (error: string) => void
  ): void {
    this.isListening = true;
    console.log('🎤 [SIMULAÇÃO] Iniciando reconhecimento de voz...');

    // Simular processo de captura de voz
    setTimeout(() => {
      if (this.isListening) {
        const simulatedTexts = [
          'Implementar autenticação com biometria no aplicativo',
          'Criar uma funcionalidade de backup automático das ideias',
          'Desenvolver um sistema de categorização inteligente',
          'Adicionar integração com calendário para lembretes',
          'Criar modo escuro para o aplicativo',
          'Implementar sincronização com nuvem',
          'Adicionar funcionalidade de compartilhamento de ideias',
          'Criar dashboard de analytics das ideias',
          'Implementar busca avançada com filtros'
        ];
        
        const randomText = simulatedTexts[Math.floor(Math.random() * simulatedTexts.length)];
        
        onResult({
          text: `[DEMO] ${randomText}`,
          confidence: 0.92
        });

        this.isListening = false;
        console.log('✅ [SIMULAÇÃO] Reconhecimento concluído');
      }
    }, 2500); // 2.5 segundos para simular tempo real
  }

  // Text-to-speech (ler texto em voz alta)
  async speak(text: string, options?: {
    language?: string;
    pitch?: number;
    rate?: number;
    volume?: number;
  }): Promise<void> {
    try {
      const speechOptions = {
        language: options?.language || 'pt-BR',
        pitch: options?.pitch || 1.0,
        rate: options?.rate || 0.8,
        volume: options?.volume || 1.0,
      };

      await Speech.speak(text, speechOptions);
      console.log('🔊 Speaking text:', text.substring(0, 50) + '...');
    } catch (error) {
      console.error('❌ Error speaking text:', error);
      throw error;
    }
  }

  // Parar fala
  async stopSpeaking(): Promise<void> {
    try {
      await Speech.stop();
      console.log('🔇 Stopped speaking');
    } catch (error) {
      console.error('❌ Error stopping speech:', error);
    }
  }

  // Verificar se está falando
  async isSpeaking(): Promise<boolean> {
    try {
      return await Speech.isSpeakingAsync();
    } catch (error) {
      console.error('❌ Error checking if speaking:', error);
      return false;
    }
  }

  // Listar idiomas disponíveis
  async getAvailableLanguages(): Promise<string[]> {
    try {
      // Lista básica de idiomas suportados
      return [
        'pt-BR', // Português brasileiro
        'en-US', // Inglês americano
        'es-ES', // Espanhol
        'fr-FR', // Francês
        'de-DE', // Alemão
        'it-IT', // Italiano
        'ja-JP', // Japonês
        'ko-KR', // Coreano
        'zh-CN', // Chinês simplificado
      ];
    } catch (error) {
      console.error('❌ Error getting available languages:', error);
      return ['pt-BR'];
    }
  }

  // Configurar idioma padrão
  setDefaultLanguage(language: string): void {
    // Aqui poderíamos salvar nas configurações
    console.log('🌐 Default language set to:', language);
  }

  // Funcionalidade experimental: transcrever áudio para ideias
  async transcribeAudioToIdea(audioUri?: string): Promise<SpeechResult> {
    try {
      // Em uma implementação real, aqui processaríamos o arquivo de áudio
      // usando serviços como:
      // - Google Speech-to-Text
      // - AWS Transcribe
      // - Azure Speech Services
      // - OpenAI Whisper API

      console.log('🎵 Transcribing audio to idea...');
      
      // Simulação por enquanto
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return {
        text: 'Ideia transcrita de áudio: Criar um aplicativo que use IA para organizar pensamentos',
        confidence: 0.87
      };
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      throw new Error('Erro ao transcrever áudio');
    }
  }

  // Cleanup - limpar recursos
  async cleanup(): Promise<void> {
    try {
      await this.stopListening();
      await this.stopSpeaking();
      
      // Destruir o reconhecimento de voz apenas se não estiver na web
      if (Platform.OS !== 'web') {
        try {
          await Voice.destroy();
        } catch (error) {
          console.warn('⚠️ Voice destroy failed (expected in Expo Go):', error);
        }
      }
      
      console.log('🧹 Speech service cleaned up');
    } catch (error) {
      console.error('❌ Error cleaning up speech service:', error);
    }
  }
}

// Exportar instância singleton
export const speechService = new SpeechService();
export default speechService;
