import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  ActivityIndicator,
  Alert,
  StyleSheet,
  TouchableOpacity
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Card, Button } from '../../src/components';
import { ideaPileService, aiService } from '../../src/services';
import { Idea } from '../../src/types';
import { getDetailedTime, getRelativeTime } from '../../src/utils';
import { Colors, TextStyles, Spacing, BorderRadius, Shadows } from '../../src/constants';

export default function IdeaDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }

    loadIdea();
  }, [id]);

  const loadIdea = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const fetchedIdea = await ideaPileService.getIdeaById(id!);
      
      if (!fetchedIdea) {
        setError('Ideia não encontrada');
        return;
      }
      
      setIdea(fetchedIdea);
    } catch (err) {
      console.error('Error loading idea:', err);
      setError('Erro ao carregar ideia');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!idea) return;

    try {
      await ideaPileService.toggleFavorite(idea.id);
      setIdea({
        ...idea,
        isFavorite: !idea.isFavorite,
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar favorito');
    }
  };

  const handleExpandWithAI = async () => {
    if (!idea) return;

    try {
      // Verificar se a IA está configurada
      const isConfigured = await aiService.isConfigured();
      if (!isConfigured) {
        Alert.alert(
          'Configuração necessária',
          'Configure sua chave da OpenAI nas configurações para usar funcionalidades de IA.',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Ir para configurações', onPress: () => {
              router.push('/settings');
            }}
          ]
        );
        return;
      }

      setAiLoading(true);
      
      // Expandir a ideia com IA
      const expansion = await aiService.expandIdea(idea);
      
      // Salvar a expansão no banco
      await ideaPileService.addAIExpansion(
        idea.id,
        expansion.type,
        expansion.content,
        expansion.relatedIdeas
      );

      // Recarregar a ideia para mostrar a nova expansão
      await loadIdea();

      Alert.alert('Sucesso!', 'Ideia expandida com IA! 🎉');
    } catch (error) {
      console.error('Error expanding with AI:', error);
      Alert.alert('Erro', 'Não foi possível expandir a ideia com IA. Verifique sua conexão e tente novamente.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!idea) return;

    Alert.alert(
      'Confirmar',
      'Deseja realmente deletar esta ideia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ideaPileService.deleteIdea(idea.id);
              router.back();
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a ideia');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>
          Carregando ideia...
        </Text>
      </View>
    );
  }

  if (error || !idea) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {error || 'Ideia não encontrada'}
        </Text>
        <Button onPress={() => router.back()}>
          Voltar
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <ScrollView style={styles.scrollView}>
        {/* Hero Section - Idea Content */}
        <View style={styles.heroSection}>
          <Text style={styles.ideaTitle}>
            {idea.content}
          </Text>
          
          {/* Date and metadata */}
          <View style={styles.metadataRow}>
            <View style={styles.timestampContainer}>
              <Text style={styles.relativeTime}>
                {getRelativeTime(new Date(idea.timestamp.toISOString()))}
              </Text>
              <Text style={styles.detailedTime}>
                📅 {getDetailedTime(new Date(idea.timestamp.toISOString()))}
              </Text>
            </View>
            {idea.isFavorite && (
              <Text style={styles.favoriteIndicator}>⭐</Text>
            )}
          </View>
        </View>

        {/* Tags Section */}
        {idea.tags.length > 0 && (
          <View style={styles.tagsSection}>
            <Text style={styles.sectionLabel}>🏷️ Tags</Text>
            <View style={styles.tagsContainer}>
              {idea.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🔗</Text>
            <Text style={styles.statText}>
              {idea.connections?.length || 0} conexões
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statIcon}>🧠</Text>
            <Text style={styles.statText}>
              {idea.aiExpansions?.length || 0} expansões
            </Text>
          </View>
        </View>

        {/* AI Expansions */}
        {idea.aiExpansions && idea.aiExpansions.length > 0 && (
          <View style={styles.expansionsSection}>
            <Text style={styles.sectionTitle}>
              Expansões de IA
            </Text>
            {idea.aiExpansions.map((expansion) => (
              <Card 
                key={expansion.id} 
                variant="outlined" 
                padding="md" 
                style={styles.expansionCard}
              >
                <View style={styles.expansionHeader}>
                  <View style={styles.expansionTypeContainer}>
                    <Text style={styles.expansionType}>
                      {expansion.type}
                    </Text>
                  </View>
                  <Text style={styles.expansionDate}>
                    {getDetailedTime(new Date(expansion.timestamp.toISOString()))}
                  </Text>
                </View>
                <Text style={styles.expansionContent}>
                  {expansion.content}
                </Text>
              </Card>
            ))}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionLabel}>⚡ Ações</Text>
          
          <View style={styles.actionsGrid}>
            {/* Favorite Action */}
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={handleToggleFavorite}
            >
              <Text style={styles.actionIcon}>
                {idea.isFavorite ? '⭐' : '☆'}
              </Text>
              <Text style={styles.actionTitle}>
                {idea.isFavorite ? 'Favorito' : 'Favoritar'}
              </Text>
              <Text style={styles.actionSubtitle}>
                {idea.isFavorite ? 'Remover' : 'Adicionar'}
              </Text>
            </TouchableOpacity>

            {/* AI Expand Action */}
            <TouchableOpacity 
              style={[styles.actionCard, aiLoading && styles.actionCardDisabled]}
              onPress={handleExpandWithAI}
              disabled={aiLoading}
            >
              <Text style={styles.actionIcon}>
                {aiLoading ? '⏳' : '🧠'}
              </Text>
              <Text style={styles.actionTitle}>
                {aiLoading ? 'Expandindo' : 'Expandir'}
              </Text>
              <Text style={styles.actionSubtitle}>
                {aiLoading ? 'Aguarde...' : 'Com IA'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Delete Action - Separado por ser destrutivo */}
          <TouchableOpacity 
            style={styles.deleteActionCard}
            onPress={handleDelete}
          >
            <Text style={styles.deleteActionIcon}>🗑️</Text>
            <Text style={styles.deleteActionText}>Deletar ideia</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: Colors.mutedForeground,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  errorText: {
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 16,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
  },
  
  // Hero Section
  heroSection: {
    marginBottom: Spacing.xl,
    paddingHorizontal: Spacing.xs,
  },
  ideaTitle: {
    ...TextStyles.subtitle,
    color: Colors.foreground,
    marginBottom: Spacing.md,
  },
  metadataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  timestampContainer: {
    flex: 1,
  },
  relativeTime: {
    ...TextStyles.labelBold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  detailedTime: {
    ...TextStyles.bodySmall,
    color: Colors.mutedForeground,
  },
  favoriteIndicator: {
    fontSize: 20,
    marginLeft: Spacing.md,
  },

  // Sections
  sectionLabel: {
    ...TextStyles.labelBold,
    color: Colors.foreground,
    marginBottom: Spacing.md,
  },

  // Tags Section
  tagsSection: {
    marginBottom: Spacing.lg,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  tag: {
    backgroundColor: Colors.accent,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
  },
  tagText: {
    ...TextStyles.label,
    color: Colors.accentForeground,
  },

  // Stats Section
  statsSection: {
    flexDirection: 'row',
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  statIcon: {
    fontSize: 16,
  },
  statText: {
    ...TextStyles.bodySmall,
    color: Colors.mutedForeground,
    fontWeight: '500',
  },
  expansionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.foreground,
    marginBottom: 16,
  },
  expansionCard: {
    marginBottom: 12,
  },
  expansionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  expansionTypeContainer: {
    backgroundColor: Colors.accent,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  expansionType: {
    fontSize: 12,
    color: Colors.primary,
    textTransform: 'capitalize',
  },
  expansionDate: {
    fontSize: 12,
    color: Colors.mutedForeground,
  },
  expansionContent: {
    fontSize: 16,
    color: Colors.foreground,
    lineHeight: 22,
  },
  // Actions Section
  actionsSection: {
    marginBottom: Spacing.xl,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadows.sm,
  },
  actionCardDisabled: {
    opacity: 0.6,
  },
  actionIcon: {
    fontSize: 24,
    marginBottom: Spacing.sm,
  },
  actionTitle: {
    ...TextStyles.labelBold,
    color: Colors.foreground,
    marginBottom: Spacing.xs,
  },
  actionSubtitle: {
    ...TextStyles.caption,
    color: Colors.mutedForeground,
  },
  deleteActionCard: {
    backgroundColor: Colors.error,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    ...Shadows.sm,
  },
  deleteActionIcon: {
    fontSize: 18,
  },
  deleteActionText: {
    ...TextStyles.button,
    color: Colors.primaryForeground,
  },
});
