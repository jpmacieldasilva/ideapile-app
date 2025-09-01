import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ideaPileService } from '../../../src/services';
import { Idea } from '../../../src/types';
import { Colors } from '../../../src/constants';
import { Icon } from '../../../src/components/ui';
import { useTheme } from '../../../src/contexts/ThemeContext';
import { extractHashtags, sanitizeText } from '../../../src/utils';

export default function EditIdeaScreen() {
  const { theme, colors, isLoading } = useTheme();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setContent(fetchedIdea.content);
      setTags(fetchedIdea.tags);
      
    } catch (err) {
      console.error('Error loading idea:', err);
      setError('Erro ao carregar ideia');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const trimmedContent = content.trim();
    
    if (!trimmedContent) {
      Alert.alert('Atenção', 'Por favor, digite alguma coisa antes de salvar.');
      return;
    }

    try {
      setSaving(true);
      
      if (!idea) return;
      
      // Limpar e extrair tags do conteúdo
      const cleanContent = sanitizeText(trimmedContent);
      const extractedTags = extractHashtags(cleanContent);
      
      // Combinar tags extraídas com tags manuais
      const allTags = [...new Set([...extractedTags, ...tags])];
      
      const updatedIdea: Idea = {
        ...idea,
        content: cleanContent,
        tags: allTags,
      };

      await ideaPileService.updateIdea(updatedIdea);
      
      Alert.alert('Sucesso', 'Ideia atualizada!', [
        { 
          text: 'OK', 
          onPress: () => {
            router.back();
          }
        }
      ]);
    } catch (error) {
      console.error('Error saving idea:', error);
      Alert.alert('Erro', 'Não foi possível salvar a ideia. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() !== idea?.content) {
      Alert.alert(
        'Descartar alterações?',
        'Você tem alterações não salvas. Deseja realmente cancelar?',
        [
          { text: 'Continuar editando', style: 'cancel' },
          { 
            text: 'Descartar', 
            style: 'destructive',
            onPress: () => router.back()
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const addTag = (tag: string) => {
    const cleanTag = tag.trim().toLowerCase();
    if (cleanTag && !tags.includes(cleanTag)) {
      setTags([...tags, cleanTag]);
      setNewTag(''); // Limpar o input
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const characterCount = content.length;
  const isNearLimit = characterCount > 450;
  const isOverLimit = characterCount > 500;

  // Aguardar tanto o loading da ideia quanto do tema
  if (loading || isLoading) {
    const loadingStyles = createStyles(Colors);
    return (
      <View style={loadingStyles.container}>
        <View style={loadingStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={loadingStyles.backButton}>
            <Icon name="arrow-back" library="Material" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={loadingStyles.title}>Editar Ideia</Text>
          <View style={loadingStyles.placeholder} />
        </View>
        <View style={loadingStyles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={loadingStyles.loadingText}>Carregando ideia...</Text>
        </View>
      </View>
    );
  }

  if (error || !idea) {
    const errorStyles = createStyles(Colors);
    return (
      <View style={errorStyles.container}>
        <View style={errorStyles.header}>
          <TouchableOpacity onPress={() => router.back()} style={errorStyles.backButton}>
            <Icon name="arrow-back" library="Material" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={errorStyles.title}>Editar Ideia</Text>
          <View style={errorStyles.placeholder} />
        </View>
        <View style={errorStyles.loadingContainer}>
          <Text style={errorStyles.errorText}>
            {error || 'Ideia não encontrada'}
          </Text>
          <TouchableOpacity 
            style={errorStyles.retryButton}
            onPress={loadIdea}
          >
            <Text style={errorStyles.retryButtonText}>Tentar Novamente</Text>
          </TouchableOpacity>
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
        <TouchableOpacity onPress={handleCancel} style={dynamicStyles.backButton}>
          <Icon name="arrow-back" library="Material" size={24} color={colors.foreground} />
        </TouchableOpacity>
        <Text style={dynamicStyles.title}>Editar Ideia</Text>
        <TouchableOpacity 
          onPress={handleSave} 
          style={[
            dynamicStyles.saveButton,
            (!content.trim() || isOverLimit || saving) && dynamicStyles.saveButtonDisabled
          ]}
          disabled={!content.trim() || isOverLimit || saving}
        >
          {saving ? (
            <ActivityIndicator size="small" color={colors.background} />
          ) : (
            <Text style={dynamicStyles.saveText}>Salvar</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={dynamicStyles.content} showsVerticalScrollIndicator={false}>
        {/* Content Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="edit" library="Material" size={20} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>CONTEÚDO</Text>
          </View>
          
          <View style={dynamicStyles.card}>
            <TextInput
              style={[
                dynamicStyles.textInput,
                isOverLimit && dynamicStyles.textInputError
              ]}
              placeholder="Digite sua ideia aqui..."
              placeholderTextColor={colors.mutedForeground}
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              textAlignVertical="top"
            />
            
            {/* Character count */}
            <View style={dynamicStyles.characterCount}>
              <Text style={[
                dynamicStyles.characterCountText,
                isOverLimit ? dynamicStyles.characterCountError : 
                isNearLimit ? dynamicStyles.characterCountWarning : 
                dynamicStyles.characterCountNormal
              ]}>
                {characterCount}/500 caracteres
              </Text>
            </View>
          </View>
        </View>

        {/* Tags Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="local-offer" library="Material" size={20} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>TAGS</Text>
          </View>
          
          <View style={dynamicStyles.card}>
            {/* Current tags */}
            {tags.length > 0 && (
              <View style={dynamicStyles.tagsContainer}>
                <Text style={dynamicStyles.tagsLabel}>Tags atuais:</Text>
                <View style={dynamicStyles.tagsList}>
                  {tags.map((tag, index) => (
                    <TouchableOpacity
                      key={index}
                      style={dynamicStyles.tagItem}
                      onPress={() => removeTag(tag)}
                    >
                      <Text style={dynamicStyles.tagText}>#{tag}</Text>
                      <Icon name="close" library="Material" size={16} color={colors.mutedForeground} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Add new tag */}
            <View style={dynamicStyles.addTagContainer}>
              <Text style={dynamicStyles.addTagLabel}>Adicionar tag:</Text>
              <View style={dynamicStyles.addTagInputContainer}>
                <TextInput
                  style={dynamicStyles.addTagInput}
                  placeholder="Digite uma tag..."
                  placeholderTextColor={colors.mutedForeground}
                  value={newTag}
                  onChangeText={setNewTag}
                  onSubmitEditing={() => addTag(newTag)}
                  returnKeyType="done"
                />
                <TouchableOpacity 
                  style={dynamicStyles.addTagButton}
                  onPress={() => addTag(newTag)}
                  disabled={!newTag.trim()}
                >
                  <Icon 
                    name="add" 
                    library="Material" 
                    size={20} 
                    color={newTag.trim() ? colors.primary : colors.mutedForeground} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <Text style={dynamicStyles.helpText}>
              As tags são automaticamente extraídas do texto (palavras com #). Você também pode adicionar tags manualmente.
            </Text>
          </View>
        </View>

        {/* Info Section */}
        <View style={dynamicStyles.section}>
          <View style={dynamicStyles.sectionHeader}>
            <Icon name="info" library="Material" size={20} color={colors.foreground} />
            <Text style={dynamicStyles.sectionTitle}>INFORMAÇÕES</Text>
          </View>
          
          <View style={dynamicStyles.card}>
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Criada em:</Text>
              <Text style={dynamicStyles.infoValue}>
                {idea.timestamp.toLocaleString('pt-BR')}
              </Text>
            </View>
            
            <View style={dynamicStyles.infoRow}>
              <Text style={dynamicStyles.infoLabel}>Favorita:</Text>
              <Text style={dynamicStyles.infoValue}>
                {idea.isFavorite ? 'Sim' : 'Não'}
              </Text>
            </View>
            
            {idea.connections && idea.connections.length > 0 && (
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Conexões:</Text>
                <Text style={dynamicStyles.infoValue}>
                  {idea.connections.length} ideia(s)
                </Text>
              </View>
            )}
            
            {idea.aiExpansions && idea.aiExpansions.length > 0 && (
              <View style={dynamicStyles.infoRow}>
                <Text style={dynamicStyles.infoLabel}>Expansões IA:</Text>
                <Text style={dynamicStyles.infoValue}>
                  {idea.aiExpansions.length} expansão(ões)
                </Text>
              </View>
            )}
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
    paddingHorizontal: 24,
  },
  loadingText: {
    fontSize: 16,
    color: colors.mutedForeground,
    marginTop: 16,
  },
  errorText: {
    fontSize: 16,
    color: colors.destructive,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: colors.background,
    fontSize: 16,
    fontWeight: '600',
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
  textInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.input,
    minHeight: 120,
    textAlignVertical: 'top',
  },
  textInputError: {
    borderColor: colors.destructive,
  },
  characterCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
  },
  characterCountNormal: {
    color: colors.mutedForeground,
  },
  characterCountWarning: {
    color: colors.warning,
  },
  characterCountError: {
    color: colors.destructive,
  },
  tagsContainer: {
    marginBottom: 16,
  },
  tagsLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  tagsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 4,
  },
  tagText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  addTagContainer: {
    marginBottom: 12,
  },
  addTagLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.foreground,
    marginBottom: 8,
  },
  addTagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addTagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.foreground,
    backgroundColor: colors.input,
  },
  addTagButton: {
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    backgroundColor: colors.input,
  },
  helpText: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 8,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.mutedForeground,
  },
  infoValue: {
    fontSize: 14,
    color: colors.foreground,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 50,
  },
  saveButton: {
    padding: 8,
    backgroundColor: colors.primary,
    borderRadius: 8,
    minWidth: 60,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: colors.muted,
  },
  saveText: {
    color: colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
});
