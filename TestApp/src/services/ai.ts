import OpenAI from 'openai';
import { storage } from './storage';
import { Idea } from '../types';

// Configurações padrão da IA
const AI_CONFIG = {
  model: 'gpt-3.5-turbo',
  maxTokens: 500,
  temperature: 0.7,
};

// Tipos para as respostas da IA
export interface AIExpansionResult {
  type: 'expand' | 'combine' | 'suggest' | 'inspire';
  content: string;
  relatedIdeas?: string[];
}

// Classe para gerenciar operações de IA
class AIService {
  private openai: OpenAI | null = null;

  // Inicializar cliente OpenAI
  private async initOpenAI(): Promise<void> {
    if (this.openai) return;

    try {
      const apiKey = await storage.getOpenAIKey();
      if (!apiKey) {
        throw new Error('Chave da OpenAI não configurada. Configure nas configurações.');
      }

      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true, // Necessário para React Native
      });

      console.log('🤖 OpenAI client initialized');
    } catch (error) {
      console.error('❌ Error initializing OpenAI:', error);
      throw error;
    }
  }

  // Expandir uma ideia
  async expandIdea(idea: Idea): Promise<AIExpansionResult> {
    await this.initOpenAI();

    try {
      const prompt = `
Você é um assistente criativo que ajuda a expandir ideias. 

Ideia original: "${idea.content}"
Tags relacionadas: ${idea.tags.join(', ')}

Expanda esta ideia de forma criativa e útil. Adicione detalhes, possibilidades, exemplos práticos e caminhos de implementação. Seja específico e construtivo.

Responda apenas com a expansão da ideia, sem introduções ou explicações sobre o que você está fazendo.
      `.trim();

      const response = await this.openai!.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      console.log('🧠 Idea expanded successfully');
      return {
        type: 'expand',
        content,
      };
    } catch (error) {
      console.error('❌ Error expanding idea:', error);
      throw error;
    }
  }

  // Combinar múltiplas ideias
  async combineIdeas(ideas: Idea[]): Promise<AIExpansionResult> {
    await this.initOpenAI();

    if (ideas.length < 2) {
      throw new Error('Pelo menos 2 ideias são necessárias para combinar');
    }

    try {
      const ideasText = ideas.map((idea, index) => 
        `${index + 1}. "${idea.content}" (Tags: ${idea.tags.join(', ')})`
      ).join('\n');

      const prompt = `
Você é um assistente criativo que combina ideias diferentes em conceitos inovadores.

Ideias para combinar:
${ideasText}

Combine essas ideias de forma criativa e inovadora. Encontre conexões interessantes, sinergias e possibilidades que emergem quando essas ideias trabalham juntas. Crie uma nova perspectiva ou abordagem que aproveite o melhor de cada ideia.

Responda apenas com a combinação criativa, sem introduções ou explicações.
      `.trim();

      const response = await this.openai!.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      console.log('🔄 Ideas combined successfully');
      return {
        type: 'combine',
        content,
        relatedIdeas: ideas.map(idea => idea.id),
      };
    } catch (error) {
      console.error('❌ Error combining ideas:', error);
      throw error;
    }
  }

  // Sugerir ideias relacionadas
  async suggestRelatedIdeas(idea: Idea): Promise<AIExpansionResult> {
    await this.initOpenAI();

    try {
      const prompt = `
Você é um assistente criativo que sugere ideias relacionadas.

Ideia base: "${idea.content}"
Tags: ${idea.tags.join(', ')}

Sugira 3-5 ideias relacionadas que podem complementar, expandir ou conectar com esta ideia. As sugestões devem ser práticas, criativas e viáveis.

Formate sua resposta como uma lista numerada simples, apenas com as ideias sugeridas.
      `.trim();

      const response = await this.openai!.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: AI_CONFIG.temperature,
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      console.log('💡 Related ideas suggested successfully');
      return {
        type: 'suggest',
        content,
      };
    } catch (error) {
      console.error('❌ Error suggesting ideas:', error);
      throw error;
    }
  }

  // Inspirar com perspectivas diferentes
  async inspireIdea(idea: Idea): Promise<AIExpansionResult> {
    await this.initOpenAI();

    try {
      const prompt = `
Você é um assistente criativo que oferece perspectivas inspiradoras e diferentes.

Ideia original: "${idea.content}"
Tags: ${idea.tags.join(', ')}

Ofereça uma perspectiva completamente diferente sobre esta ideia. Pense fora da caixa, considere outras áreas, outras culturas, outras épocas. Como alguém de uma área completamente diferente abordaria isso? Que aspectos únicos ou inesperados podem ser explorados?

Seja inspirador e inovador na sua resposta.
      `.trim();

      const response = await this.openai!.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: AI_CONFIG.maxTokens,
        temperature: 0.9, // Maior criatividade para inspiração
      });

      const content = response.choices[0]?.message?.content?.trim();
      if (!content) {
        throw new Error('Resposta vazia da IA');
      }

      console.log('✨ Idea inspired successfully');
      return {
        type: 'inspire',
        content,
      };
    } catch (error) {
      console.error('❌ Error inspiring idea:', error);
      throw error;
    }
  }

  // Verificar se a API key está configurada
  async isConfigured(): Promise<boolean> {
    try {
      const apiKey = await storage.getOpenAIKey();
      return !!apiKey;
    } catch {
      return false;
    }
  }

  // Testar conexão com OpenAI
  async testConnection(): Promise<boolean> {
    try {
      await this.initOpenAI();
      
      const response = await this.openai!.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [{ role: 'user', content: 'Responda apenas: "OK"' }],
        max_tokens: 10,
      });

      return response.choices[0]?.message?.content?.includes('OK') || false;
    } catch (error) {
      console.error('❌ Error testing OpenAI connection:', error);
      return false;
    }
  }
}

// Exportar instância singleton
export const aiService = new AIService();
export default aiService;
