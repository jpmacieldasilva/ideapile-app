// Serviços principais do IdeaPile
import { database } from './database';
import { storage } from './storage';
import { aiService } from './ai';
import { speechService } from './speech';
import { Idea, AIExpansion } from '../types';
import { generateId } from '../utils/uuid';

// Classe principal que gerencia todas as operações de dados
class IdeaPileService {
  
  // Inicializar todos os serviços
  async initialize(): Promise<void> {
    console.log('🚀 Initializing IdeaPile services...');
    
    try {
      // Inicializar banco de dados
      await database.init();
      
      // Limpar cache expirado
      await storage.clearExpiredCache();
      
      // Verificar se é primeiro uso
      const isFirstTime = await storage.isFirstLaunch();
      if (isFirstTime) {
        console.log('👋 First time user detected');
        await storage.markAsLaunched();
        
        // Criar ideia de exemplo
        await this.createWelcomeIdea();
      }
      
      console.log('✅ All services initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing services:', error);
      throw error;
    }
  }

  // Criar nova ideia
  async createIdea(content: string, tags: string[] = []): Promise<Idea> {
    try {
      const idea: Idea = {
        id: generateId(),
        content: content.trim(),
        timestamp: new Date(),
        tags,
        isFavorite: false,
        connections: [],
        aiExpansions: [],
      };

      await database.saveIdea(idea);
      console.log('💡 New idea created:', idea.id);
      
      return idea;
    } catch (error) {
      console.error('❌ Error creating idea:', error);
      throw error;
    }
  }

  // Buscar todas as ideias
  async getAllIdeas(): Promise<Idea[]> {
    try {
      const ideas = await database.getAllIdeas();
      
      // Carregar expansões de IA para cada ideia
      for (const idea of ideas) {
        idea.aiExpansions = await database.getIdeaExpansions(idea.id);
      }
      
      return ideas;
    } catch (error) {
      console.error('❌ Error fetching ideas:', error);
      throw error;
    }
  }

  // Buscar ideia por ID
  async getIdeaById(id: string): Promise<Idea | null> {
    try {
      const idea = await database.getIdeaById(id);
      
      if (idea) {
        idea.aiExpansions = await database.getIdeaExpansions(id);
      }
      
      return idea;
    } catch (error) {
      console.error('❌ Error fetching idea by ID:', error);
      throw error;
    }
  }

  // Atualizar ideia
  async updateIdea(idea: Idea): Promise<void> {
    try {
      await database.updateIdea(idea);
      console.log('✏️ Idea updated:', idea.id);
    } catch (error) {
      console.error('❌ Error updating idea:', error);
      throw error;
    }
  }

  // Deletar ideia
  async deleteIdea(id: string): Promise<void> {
    try {
      await database.deleteIdea(id);
      console.log('🗑️ Idea deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting idea:', error);
      throw error;
    }
  }

  // Favoritar/desfavoritar ideia
  async toggleFavorite(id: string): Promise<void> {
    try {
      const idea = await database.getIdeaById(id);
      if (!idea) throw new Error('Idea not found');

      idea.isFavorite = !idea.isFavorite;
      await database.updateIdea(idea);
      
      console.log('⭐ Favorite toggled for idea:', id);
    } catch (error) {
      console.error('❌ Error toggling favorite:', error);
      throw error;
    }
  }

  // Buscar ideias
  async searchIdeas(query: string): Promise<Idea[]> {
    try {
      if (!query.trim()) {
        return await this.getAllIdeas();
      }

      const ideas = await database.searchIdeas(query);
      
      // Carregar expansões de IA
      for (const idea of ideas) {
        idea.aiExpansions = await database.getIdeaExpansions(idea.id);
      }
      
      return ideas;
    } catch (error) {
      console.error('❌ Error searching ideas:', error);
      throw error;
    }
  }

  // Adicionar expansão de IA
  async addAIExpansion(
    ideaId: string, 
    type: AIExpansion['type'], 
    content: string,
    relatedIdeas?: string[]
  ): Promise<AIExpansion> {
    try {
      const expansion: AIExpansion = {
        id: generateId(),
        ideaId,
        type,
        content: content.trim(),
        timestamp: new Date(),
        relatedIdeas: relatedIdeas || [],
      };

      await database.saveAIExpansion(expansion);
      console.log('🧠 AI expansion added:', expansion.id);
      
      return expansion;
    } catch (error) {
      console.error('❌ Error adding AI expansion:', error);
      throw error;
    }
  }

  // Conectar duas ideias
  async connectIdeas(ideaId1: string, ideaId2: string): Promise<void> {
    try {
      const idea1 = await database.getIdeaById(ideaId1);
      const idea2 = await database.getIdeaById(ideaId2);

      if (!idea1 || !idea2) {
        throw new Error('One or both ideas not found');
      }

      // Adicionar conexão bidirecional
      if (!idea1.connections?.includes(ideaId2)) {
        idea1.connections = [...(idea1.connections || []), ideaId2];
        await database.updateIdea(idea1);
      }

      if (!idea2.connections?.includes(ideaId1)) {
        idea2.connections = [...(idea2.connections || []), ideaId1];
        await database.updateIdea(idea2);
      }

      console.log('🔗 Ideas connected:', ideaId1, '↔️', ideaId2);
    } catch (error) {
      console.error('❌ Error connecting ideas:', error);
      throw error;
    }
  }

  // Criar ideia de boas-vindas
  private async createWelcomeIdea(): Promise<void> {
    try {
      await this.createIdea(
        'Bem-vindo ao IdeaPile! 🎉\n\nEste é o lugar para capturar suas ideias brilhantes. Use o botão + para adicionar novas ideias e explore as funcionalidades de IA para expandir e conectar seus pensamentos.',
        ['bem-vindo', 'tutorial']
      );
    } catch (error) {
      console.error('❌ Error creating welcome idea:', error);
    }
  }

  // Estatísticas do usuário
  async getStats(): Promise<{
    totalIdeas: number;
    favoriteIdeas: number;
    aiExpansions: number;
    connections: number;
  }> {
    try {
      const ideas = await this.getAllIdeas();
      
      const stats = {
        totalIdeas: ideas.length,
        favoriteIdeas: ideas.filter(idea => idea.isFavorite).length,
        aiExpansions: ideas.reduce((acc, idea) => acc + (idea.aiExpansions?.length || 0), 0),
        connections: ideas.reduce((acc, idea) => acc + (idea.connections?.length || 0), 0) / 2, // Dividir por 2 pois são bidirecionais
      };

      console.log('📊 User stats:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Error getting stats:', error);
      return { totalIdeas: 0, favoriteIdeas: 0, aiExpansions: 0, connections: 0 };
    }
  }
}

// Exportar instância singleton
export const ideaPileService = new IdeaPileService();
export { database, storage, aiService, speechService };
export default ideaPileService;
