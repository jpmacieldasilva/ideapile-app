import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  SectionList, 
  ActivityIndicator,
  RefreshControl, 
  Alert,
  Animated
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useFocusEffect } from 'expo-router';
import { ideaPileService } from '../src/services';
import { Idea } from '../src/types';
import { Colors, TextStyles, Spacing, BorderRadius, Shadows, AnimationDurations, createFadeAnimation, createScaleAnimation } from '../src/constants';
import { groupItemsByTime, getRelativeTime, getDetailedTime, TimeGroup } from '../src/utils';
import { AnimatedCard } from '../src/components';

export default function HomeScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animações
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fabScale = useRef(new Animated.Value(0)).current;
  const fabPressScale = useRef(new Animated.Value(1)).current;

  const loadIdeas = async () => {
    try {
      await ideaPileService.initialize(); // Garantir que está inicializado
      const allIdeas = await ideaPileService.getAllIdeas();
      setIdeas(allIdeas);
    } catch (error) {
      console.error('Erro ao carregar ideias:', error);
      Alert.alert('Erro', 'Não foi possível carregar as ideias');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadIdeas();
    setRefreshing(false);
  };

  const handleNewIdea = () => {
    router.push('/capture');
  };

  const handleFabPressIn = () => {
    createScaleAnimation(fabPressScale, 0.9, AnimationDurations.quick).start();
  };

  const handleFabPressOut = () => {
    createScaleAnimation(fabPressScale, 1, AnimationDurations.quick).start();
  };

  const handleIdeaPress = (idea: Idea) => {
    router.push(`/idea/${idea.id}`);
  };

  // Converter ideias para formato TimeGroup
  const getTimeGroups = (ideas: Idea[]): TimeGroup[] => {
    // Converter Idea[] para o formato esperado pelo groupItemsByTime
    const ideasWithTimestamp = ideas.map(idea => ({
      ...idea,
      timestamp: idea.timestamp instanceof Date ? idea.timestamp : new Date(idea.timestamp)
    }));
    
    return groupItemsByTime(ideasWithTimestamp);
  };

  // Carregar ideias quando a tela ganhar foco
  useFocusEffect(
    useCallback(() => {
      loadIdeas();
    }, [])
  );

  useEffect(() => {
    loadIdeas();
  }, []);

  // Animação de entrada da tela
  useEffect(() => {
    if (!loading) {
      // Fade in do conteúdo
      createFadeAnimation(fadeAnim, 1, AnimationDurations.normal).start();
      
      // FAB aparece com delay
      setTimeout(() => {
        createScaleAnimation(fabScale, 1, AnimationDurations.normal).start();
      }, 300);
    }
  }, [loading]);

  const renderTimelineItem = ({ item, index, section }: { item: Idea, index: number, section: any }) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineIndicator}>
        <View style={styles.timelineDot} />
        {index < section.data.length - 1 && <View style={styles.timelineLine} />}
      </View>
      
      <TouchableOpacity
        style={styles.ideaCard}
        onPress={() => handleIdeaPress(item)}
      >
        <Text style={styles.ideaContent} numberOfLines={4}>
          {item.content}
        </Text>
        
        <View style={styles.ideaFooter}>
          <Text style={styles.ideaTime}>
            {getRelativeTime(item.timestamp instanceof Date ? item.timestamp : new Date(item.timestamp))}
          </Text>
          
          {item.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {item.tags.slice(0, 2).map((tag, tagIndex) => (
                <View key={tagIndex} style={styles.tagBadge}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
              {item.tags.length > 2 && (
                <View style={styles.tagBadge}>
                  <Text style={styles.tagText}>+{item.tags.length - 2}</Text>
                </View>
              )}
            </View>
          )}
        </View>
        
        {(item.aiExpansions.length > 0 || item.connections.length > 0) && (
          <View style={styles.ideaStats}>
            {item.aiExpansions.length > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>✨</Text>
                <Text style={styles.statText}>{item.aiExpansions.length}</Text>
              </View>
            )}
            {item.connections.length > 0 && (
              <View style={styles.statItem}>
                <Text style={styles.statIcon}>🔗</Text>
                <Text style={styles.statText}>{item.connections.length}</Text>
              </View>
            )}
          </View>
        )}
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = ({ section }: { section: TimeGroup }) => (
    <View style={styles.sectionHeader}>
      <View style={styles.sectionTitleContainer}>
        <View style={[styles.sectionDot, { backgroundColor: section.color }]} />
        <View style={styles.sectionTextContainer}>
          <Text style={[styles.sectionTitle, { color: section.color }]}>
            {section.title}
          </Text>
          {section.subtitle && (
            <Text style={styles.sectionSubtitle}>
              {section.subtitle}
            </Text>
          )}
        </View>
        <Text style={styles.sectionCount}>
          {section.data.length} {section.data.length === 1 ? 'ideia' : 'ideias'}
        </Text>
            </View>
      <View style={[styles.sectionDivider, { backgroundColor: section.color, opacity: 0.3 }]} />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>IdeaPile</Text>
          <Text style={styles.subtitle}>Suas ideias brilhantes</Text>
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Carregando suas ideias...</Text>
        </View>
        <StatusBar style="light" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View>
            <Text style={styles.title}>IdeaPile</Text>
            <Text style={styles.subtitle}>
          {ideas.length} {ideas.length === 1 ? 'ideia' : 'ideias'}
        </Text>
      </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.settingsIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {ideas.length === 0 ? (
        <View style={styles.content}>
          <Text style={styles.emoji}>💡</Text>
          <Text style={styles.message}>Nenhuma ideia ainda</Text>
          <Text style={styles.description}>
            Toque no 🎤 para gravar sua primeira ideia!
          </Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <SectionList
            sections={getTimeGroups(ideas)}
          keyExtractor={(item) => item.id}
            renderItem={renderTimelineItem}
            renderSectionHeader={renderSectionHeader}
            contentContainerStyle={styles.timelineContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
                onRefresh={handleRefresh}
                colors={[Colors.primary]}
                tintColor={Colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
          />
        </View>
      )}

      <Animated.View
        style={[
          styles.fabContainer,
          {
            transform: [{ scale: fabScale }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleNewIdea}
          onPressIn={handleFabPressIn}
          onPressOut={handleFabPressOut}
          activeOpacity={0.8}
        >
          <Animated.View style={{ transform: [{ scale: fabPressScale }] }}>
            <Text style={styles.fabIcon}>🎤</Text>
          </Animated.View>
        </TouchableOpacity>
      </Animated.View>

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingTop: 48,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
    backgroundColor: Colors.header,
    borderBottomWidth: 1,
    borderBottomColor: Colors.headerBorder,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  settingsButton: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.secondary,
  },
  settingsIcon: {
    fontSize: 20,
  },
  title: {
    ...TextStyles.title,
    color: Colors.foreground,
  },
  subtitle: {
    ...TextStyles.caption,
    color: Colors.mutedForeground,
    marginTop: Spacing.xs,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  emoji: {
    fontSize: 64,
    marginBottom: Spacing.md,
  },
  message: {
    ...TextStyles.heading,
    color: Colors.foreground,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  description: {
    ...TextStyles.body,
    color: Colors.mutedForeground,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  loadingText: {
    ...TextStyles.body,
    color: Colors.mutedForeground,
    marginTop: Spacing.md,
  },
  // Timeline Container
  timelineContainer: {
    padding: Spacing.md,
    paddingBottom: 100, // Espaço para o FAB
  },
  
  // Section Headers
  sectionHeader: {
    marginTop: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  sectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: Spacing.sm,
  },
  sectionTextContainer: {
    flex: 1,
  },
  sectionTitle: {
    ...TextStyles.labelBold,
    fontSize: 16,
  },
  sectionSubtitle: {
    ...TextStyles.caption,
    color: Colors.mutedForeground,
    marginTop: 2,
  },
  sectionCount: {
    ...TextStyles.caption,
    color: Colors.mutedForeground,
    backgroundColor: Colors.muted,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  sectionDivider: {
    height: 1,
    marginLeft: Spacing.lg,
  },
  
  // Timeline Items
  timelineItem: {
    flexDirection: 'row',
    marginBottom: Spacing.sm,
  },
  timelineIndicator: {
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  timelineDot: {
    width: 8,
    height: 8,
    backgroundColor: Colors.primary,
    borderRadius: BorderRadius.full,
    marginTop: 8,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: Colors.border,
    marginTop: Spacing.sm,
  },
  
  // Idea Cards
  ideaCard: {
    flex: 1,
    backgroundColor: Colors.ideaCard,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.ideaCardBorder,
    ...Shadows.sm,
  },
  ideaContent: {
    ...TextStyles.body,
    color: Colors.cardForeground,
    marginBottom: Spacing.md,
    lineHeight: 22,
  },
  ideaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: Spacing.sm,
  },
  ideaTime: {
    ...TextStyles.caption,
    color: Colors.timelineText,
  },
  
  // Tags
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tagBadge: {
    backgroundColor: Colors.accent,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginLeft: Spacing.xs,
  },
  tagText: {
    ...TextStyles.caption,
    color: Colors.primary,
    fontSize: 10,
  },
  
  // Stats
  ideaStats: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  statIcon: {
    fontSize: 12,
    marginRight: Spacing.xs,
  },
  statText: {
    ...TextStyles.caption,
    color: Colors.mutedForeground,
    fontSize: 11,
  },
  
  // FAB
  fabContainer: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
  },
  fab: {
    width: 64,
    height: 64,
    backgroundColor: Colors.fabBackground,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.lg,
  },
  fabIcon: {
    fontSize: 28,
  },
});