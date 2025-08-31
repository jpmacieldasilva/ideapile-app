import * as SQLite from 'expo-sqlite';
import { Idea, AIExpansion } from '../types';

// Singleton para gerenciar a conexão com o banco
class DatabaseService {
  private db: SQLite.SQLiteDatabase | null = null;

  // Inicializar conexão com banco
  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = SQLite.openDatabaseSync('ideapile.db');
      await this.createTables();
      console.log('📦 Database initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing database:', error);
      throw error;
    }
  }

  // Criar tabelas se não existirem
  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Tabela de ideias
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS ideas (
        id TEXT PRIMARY KEY,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        tags TEXT NOT NULL,
        is_favorite INTEGER DEFAULT 0,
        connections TEXT DEFAULT '[]',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        updated_at INTEGER DEFAULT (strftime('%s', 'now'))
      );
    `);

    // Tabela de expansões de IA
    this.db.execSync(`
      CREATE TABLE IF NOT EXISTS ai_expansions (
        id TEXT PRIMARY KEY,
        idea_id TEXT NOT NULL,
        type TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp INTEGER NOT NULL,
        related_ideas TEXT DEFAULT '[]',
        created_at INTEGER DEFAULT (strftime('%s', 'now')),
        FOREIGN KEY (idea_id) REFERENCES ideas (id) ON DELETE CASCADE
      );
    `);

    // Criar índices para performance
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_ideas_timestamp ON ideas(timestamp DESC);
    `);
    
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_ideas_favorite ON ideas(is_favorite);
    `);
    
    this.db.execSync(`
      CREATE INDEX IF NOT EXISTS idx_ai_expansions_idea_id ON ai_expansions(idea_id);
    `);

    console.log('📋 Database tables created successfully');
  }

  // Salvar uma nova ideia
  async saveIdea(idea: Idea): Promise<void> {
    if (!this.db) await this.init();

    try {
      this.db!.runSync(
        `INSERT INTO ideas (id, content, timestamp, tags, is_favorite, connections) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          idea.id,
          idea.content,
          idea.timestamp.getTime(),
          JSON.stringify(idea.tags),
          idea.isFavorite ? 1 : 0,
          JSON.stringify(idea.connections || [])
        ]
      );
      console.log('💾 Idea saved:', idea.id);
    } catch (error) {
      console.error('❌ Error saving idea:', error);
      throw error;
    }
  }

  // Buscar todas as ideias
  async getAllIdeas(): Promise<Idea[]> {
    if (!this.db) await this.init();

    try {
      const result = this.db!.getAllSync(
        `SELECT * FROM ideas ORDER BY timestamp DESC`
      );

      return result.map(this.mapRowToIdea);
    } catch (error) {
      console.error('❌ Error fetching ideas:', error);
      throw error;
    }
  }

  // Buscar ideia por ID
  async getIdeaById(id: string): Promise<Idea | null> {
    if (!this.db) await this.init();

    try {
      const result = this.db!.getFirstSync(
        `SELECT * FROM ideas WHERE id = ?`,
        [id]
      );

      return result ? this.mapRowToIdea(result as any) : null;
    } catch (error) {
      console.error('❌ Error fetching idea by ID:', error);
      throw error;
    }
  }

  // Atualizar ideia
  async updateIdea(idea: Idea): Promise<void> {
    if (!this.db) await this.init();

    try {
      await this.db!.runAsync(
        `UPDATE ideas 
         SET content = ?, tags = ?, is_favorite = ?, connections = ?, updated_at = strftime('%s', 'now')
         WHERE id = ?`,
        [
          idea.content,
          JSON.stringify(idea.tags),
          idea.isFavorite ? 1 : 0,
          JSON.stringify(idea.connections || []),
          idea.id
        ]
      );
      console.log('✏️ Idea updated:', idea.id);
    } catch (error) {
      console.error('❌ Error updating idea:', error);
      throw error;
    }
  }

  // Deletar ideia
  async deleteIdea(id: string): Promise<void> {
    if (!this.db) await this.init();

    try {
      await this.db!.runAsync(`DELETE FROM ideas WHERE id = ?`, [id]);
      console.log('🗑️ Idea deleted:', id);
    } catch (error) {
      console.error('❌ Error deleting idea:', error);
      throw error;
    }
  }

  // Salvar expansão de IA
  async saveAIExpansion(expansion: AIExpansion): Promise<void> {
    if (!this.db) await this.init();

    try {
      await this.db!.runAsync(
        `INSERT INTO ai_expansions (id, idea_id, type, content, timestamp, related_ideas) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          expansion.id,
          expansion.ideaId,
          expansion.type,
          expansion.content,
          expansion.timestamp.getTime(),
          JSON.stringify(expansion.relatedIdeas || [])
        ]
      );
      console.log('🧠 AI Expansion saved:', expansion.id);
    } catch (error) {
      console.error('❌ Error saving AI expansion:', error);
      throw error;
    }
  }

  // Buscar expansões de uma ideia
  async getIdeaExpansions(ideaId: string): Promise<AIExpansion[]> {
    if (!this.db) await this.init();

    try {
      const result = await this.db!.getAllAsync(
        `SELECT * FROM ai_expansions WHERE idea_id = ? ORDER BY timestamp DESC`,
        [ideaId]
      );

      return result.map(this.mapRowToExpansion);
    } catch (error) {
      console.error('❌ Error fetching expansions:', error);
      throw error;
    }
  }

  // Buscar ideias por texto (busca simples)
  async searchIdeas(query: string): Promise<Idea[]> {
    if (!this.db) await this.init();

    try {
      const result = await this.db!.getAllAsync(
        `SELECT * FROM ideas 
         WHERE content LIKE ? OR tags LIKE ?
         ORDER BY timestamp DESC`,
        [`%${query}%`, `%${query}%`]
      );

      return result.map(this.mapRowToIdea);
    } catch (error) {
      console.error('❌ Error searching ideas:', error);
      throw error;
    }
  }

  // Mapear linha do banco para objeto Idea
  private mapRowToIdea(row: any): Idea {
    return {
      id: row.id,
      content: row.content,
      timestamp: new Date(row.timestamp),
      tags: JSON.parse(row.tags),
      isFavorite: row.is_favorite === 1,
      connections: JSON.parse(row.connections || '[]'),
    };
  }

  // Mapear linha do banco para objeto AIExpansion
  private mapRowToExpansion(row: any): AIExpansion {
    return {
      id: row.id,
      ideaId: row.idea_id,
      type: row.type,
      content: row.content,
      timestamp: new Date(row.timestamp),
      relatedIdeas: JSON.parse(row.related_ideas || '[]'),
    };
  }

  // Método para debug - listar todas as tabelas
  async debugTables(): Promise<void> {
    if (!this.db) await this.init();

    try {
      const tables = await this.db!.getAllAsync(
        `SELECT name FROM sqlite_master WHERE type='table'`
      );
      console.log('📊 Database tables:', tables);

      const ideasCount = await this.db!.getFirstAsync(
        `SELECT COUNT(*) as count FROM ideas`
      );
      console.log('💡 Ideas count:', ideasCount);
    } catch (error) {
      console.error('❌ Error debugging tables:', error);
    }
  }
}

// Exportar instância singleton
export const database = new DatabaseService();
export default database;
