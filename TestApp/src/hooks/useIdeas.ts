import { useState, useEffect, useCallback } from 'react';
import { Idea } from '../types';
import { ideaPileService } from '../services';

export function useIdeas() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar ideias
  const loadIdeas = useCallback(async () => {
    try {
      setError(null);
      const fetchedIdeas = await ideaPileService.getAllIdeas();
      setIdeas(fetchedIdeas);
    } catch (err) {
      console.error('Error loading ideas:', err);
      setError('Não foi possível carregar as ideias');
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh das ideias (pull-to-refresh)
  const refreshIdeas = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadIdeas();
    } finally {
      setRefreshing(false);
    }
  }, [loadIdeas]);

  // Adicionar nova ideia
  const addIdea = useCallback(async (content: string, tags: string[] = []) => {
    try {
      const newIdea = await ideaPileService.createIdea(content, tags);
      setIdeas(prevIdeas => [newIdea, ...prevIdeas]);
      return newIdea;
    } catch (err) {
      console.error('Error adding idea:', err);
      throw new Error('Não foi possível salvar a ideia');
    }
  }, []);

  // Atualizar ideia
  const updateIdea = useCallback(async (updatedIdea: Idea) => {
    try {
      await ideaPileService.updateIdea(updatedIdea);
      setIdeas(prevIdeas =>
        prevIdeas.map(idea =>
          idea.id === updatedIdea.id ? updatedIdea : idea
        )
      );
    } catch (err) {
      console.error('Error updating idea:', err);
      throw new Error('Não foi possível atualizar a ideia');
    }
  }, []);

  // Deletar ideia
  const deleteIdea = useCallback(async (ideaId: string) => {
    try {
      await ideaPileService.deleteIdea(ideaId);
      setIdeas(prevIdeas => prevIdeas.filter(idea => idea.id !== ideaId));
    } catch (err) {
      console.error('Error deleting idea:', err);
      throw new Error('Não foi possível deletar a ideia');
    }
  }, []);

  // Favoritar/desfavoritar ideia
  const toggleFavorite = useCallback(async (ideaId: string) => {
    try {
      await ideaPileService.toggleFavorite(ideaId);
      setIdeas(prevIdeas =>
        prevIdeas.map(idea =>
          idea.id === ideaId
            ? { ...idea, isFavorite: !idea.isFavorite }
            : idea
        )
      );
    } catch (err) {
      console.error('Error toggling favorite:', err);
      throw new Error('Não foi possível atualizar favorito');
    }
  }, []);

  // Buscar ideias
  const searchIdeas = useCallback(async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await ideaPileService.searchIdeas(query);
      setIdeas(searchResults);
    } catch (err) {
      console.error('Error searching ideas:', err);
      setError('Erro na busca');
    } finally {
      setLoading(false);
    }
  }, []);

  // Inicializar na primeira renderização
  useEffect(() => {
    // Inicializar serviços e carregar ideias
    const initializeApp = async () => {
      try {
        await ideaPileService.initialize();
        await loadIdeas();
      } catch (err) {
        console.error('Error initializing app:', err);
        setError('Erro ao inicializar o aplicativo');
        setLoading(false);
      }
    };

    initializeApp();
  }, [loadIdeas]);

  return {
    ideas,
    loading,
    refreshing,
    error,
    addIdea,
    updateIdea,
    deleteIdea,
    toggleFavorite,
    refreshIdeas,
    searchIdeas,
    retry: loadIdeas,
  };
}

export default useIdeas;
