import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal,
  ActivityIndicator
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Card, Badge, Icon, Button } from '../../src/components';
import { AppIcons } from '../../src/components/ui/Icon';
import { ideaPileService, aiService } from '../../src/services';
import { Idea } from '../../src/types';
import { useThemeColors } from '../../src/hooks';

export default function IdeaDetailScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [idea, setIdea] = useState<Idea | null>(null);
  const [allIdeas, setAllIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpandingAI, setIsExpandingAI] = useState(false);
  const [isFindingConnections, setIsFindingConnections] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    if (!id) {
      router.back();
      return;
    }

    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Carregar a ideia específica
      const fetchedIdea = await ideaPileService.getIdeaById(id!);
      if (!fetchedIdea) {
        setError('Ideia não encontrada');
        return;
      }
      setIdea(fetchedIdea);
      
      // Carregar todas as ideias para conexões
      const allFetchedIdeas = await ideaPileService.getAllIdeas();
      setAllIdeas(allFetchedIdeas);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateIdea = async (updates: Partial<Idea>) => {
    if (!idea) return;
    
    try {
      const updatedIdea = { ...idea, ...updates };
      await ideaPileService.updateIdea(updatedIdea);
      setIdea(updatedIdea);
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar a ideia');
    }
  };

  const handleExpandWithAI = async () => {
    if (!idea || (idea.aiExpansions && idea.aiExpansions.length > 0)) return;
    
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

      setIsExpandingAI(true);
      
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
      await loadData();

      Alert.alert('Sucesso!', 'Ideia expandida com IA! 🎉');
    } catch (error) {
      console.error('Error expanding with AI:', error);
      Alert.alert('Erro', 'Não foi possível expandir a ideia com IA. Verifique sua conexão e tente novamente.');
    } finally {
      setIsExpandingAI(false);
    }
  };

  const handleFindConnections = async () => {
    if (!idea || (idea.connections && idea.connections.length > 0)) return;
    
    try {
      setIsFindingConnections(true);
      
      // Encontrar conexões com IA
      const connections = await aiService.findConnections(idea, allIdeas);
      
      // Atualizar a ideia com as conexões
      await handleUpdateIdea({ connections });
      
      Alert.alert('Sucesso!', 'Conexões encontradas! 🔗');
    } catch (error) {
      console.error('Error finding connections:', error);
      Alert.alert('Erro', 'Não foi possível encontrar conexões.');
    } finally {
      setIsFindingConnections(false);
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

  const handleCopyText = () => {
    Alert.alert('Copiado', 'Texto copiado para a área de transferência!');
  };

  const handleShare = () => {
    Alert.alert('Compartilhar', 'Funcionalidade de compartilhamento em breve!');
  };

  const handleEdit = () => {
    Alert.alert('Editar', 'Funcionalidade de edição em breve!');
  };

  const handleDelete = async () => {
    if (!idea) return;

    Alert.alert(
      'Deletar Ideia',
      'Tem certeza que deseja deletar esta ideia?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Deletar',
          style: 'destructive',
          onPress: async () => {
            try {
              await ideaPileService.deleteIdea(idea.id);
              router.back();
              Alert.alert('Sucesso', 'Ideia deletada!');
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível deletar a ideia');
            }
          }
        }
      ]
    );
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString('pt-BR', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        alignItems: 'center', 
        justifyContent: 'center' 
      }}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ 
          color: colors.mutedForeground, 
          marginTop: 16 
        }}>
          Carregando ideia...
        </Text>
      </View>
    );
  }

  if (error || !idea) {
    return (
      <View style={{ 
        flex: 1, 
        backgroundColor: colors.background,
        alignItems: 'center', 
        justifyContent: 'center',
        paddingHorizontal: 24
      }}>
        <Text style={{ 
          color: colors.destructive, 
          textAlign: 'center', 
          marginBottom: 16 
        }}>
          {error || 'Ideia não encontrada'}
        </Text>
        <Button onPress={() => router.back()}>
          Voltar
        </Button>
      </View>
    );
  }

  const hasAIExpansions = idea.aiExpansions && idea.aiExpansions.length > 0;
  const hasConnections = idea.connections && idea.connections.length > 0;
  const connectedIdeas = hasConnections ? allIdeas.filter(i => idea.connections!.includes(i.id)) : [];

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style="light" />
      
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 24, 
        paddingVertical: 16, 
        paddingTop: 24,
        backgroundColor: colors.background + 'CC', // 80% opacity
        borderBottomWidth: 1, 
        borderBottomColor: colors.border
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          {/* Botão de voltar à esquerda */}
          <TouchableOpacity 
            onPress={() => router.back()} 
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <Icon name="arrow-back" library="Material" size={18} color={colors.foreground} />
          </TouchableOpacity>

          {/* Título no centro */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '500', 
              color: colors.foreground
            }}>
              Detalhes da Ideia
            </Text>
          </View>

          {/* Botão de menu à direita */}
          <TouchableOpacity 
            onPress={() => setShowMenu(true)} 
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <Icon name="more-vert" library="Material" size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1 }}>
        <View style={{ padding: 16, gap: 24 }}>
          {/* Main idea content */}
          <Card>
            <View style={{ padding:0, gap: 16 }}>
              <Text style={{ fontSize: 18, lineHeight: 26, color: colors.foreground }}>
                {idea.content}
              </Text>
              
              <View style={{ 
                flexDirection: 'row', 
                alignItems: 'center', 
                justifyContent: 'space-between' 
              }}>
                <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                  {formatTime(idea.timestamp)}
                </Text>
                <TouchableOpacity onPress={handleCopyText} style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: 8 
                }}>
                  <Icon name="content-copy" library="Material" size={16} color={colors.foreground} />
                  <Text style={{ 
                    marginLeft: 4, 
                    fontSize: 14, 
                    color: colors.foreground 
                  }}>
                    Copiar
                  </Text>
                </TouchableOpacity>
              </View>

                {/* Tags */}
              {idea.tags.length > 0 && (
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                  {idea.tags.map(tag => (
                    <View
                      key={tag}
                      style={{
                        backgroundColor: colors.muted + '100', // um pouco mais escuro
                        borderRadius: 8,
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        marginBottom: 4,
                      }}
                    >
                      <Text style={{ color: colors.foreground, fontSize: 13 }}>
                        {tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            

              {/* Favorite indicator */}
              {idea.isFavorite && (
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 8,
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  backgroundColor: colors.accent + '20',
                  borderRadius: 12,
                  alignSelf: 'flex-start'
                }}>
                  <Icon {...AppIcons.star} size={16} color={colors.accent} />
                  <Text style={{ fontSize: 12, color: colors.accent, fontWeight: '500' }}>
                    Favorita
                  </Text>
                </View>
              )}
            </View>
          </Card>

          {/* AI Features Section */}
          <View style={{ gap: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              Recursos de IA
            </Text>
            
            {/* AI Feature Cards */}
            <View style={{ gap: 12 }}>
              {/* Expand with AI Card */}
              <Card>
                <TouchableOpacity
                  onPress={handleExpandWithAI}
                  disabled={isExpandingAI || hasAIExpansions}
                  activeOpacity={0.7}
                >
                  <View style={{ 
                    padding: 8, 
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <View style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 16, 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Icon {...AppIcons.sparkles} size={20} color={colors.foreground} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
                        {hasAIExpansions ? 'Expandida com IA' : 'Expandir com IA'}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                        {hasAIExpansions ? 'IA forneceu contexto adicional' : 'Obtenha insights e sugestões de IA'}
                      </Text>
                    </View>
                    {isExpandingAI && (
                      <ActivityIndicator size="small" color={colors.primary} />
                    )}
                  </View>
                </TouchableOpacity>
              </Card>

              {/* Connections Card */}
              <Card>
                <TouchableOpacity
                  onPress={handleFindConnections}
                  disabled={isFindingConnections || hasConnections}
                  activeOpacity={0.7}
                >
                  <View style={{ 
                    padding: 8, 
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12
                  }}>
                    <View style={{ 
                      width: 32, 
                      height: 32, 
                      borderRadius: 16, 
                      alignItems: 'center', 
                      justifyContent: 'center' 
                    }}>
                      <Icon {...AppIcons.link} size={20} color={colors.foreground} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
                        {hasConnections ? 'Conexões Encontradas' : 'Encontrar Conexões'}
                      </Text>
                      <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
                        {hasConnections ? `${connectedIdeas.length} ideias relacionadas encontradas` : 'Descobrir ideias relacionadas'}
                      </Text>
                    </View>
                    {isFindingConnections && (
                      <ActivityIndicator size="small" color={colors.secondary} />
                    )}
                  </View>
                </TouchableOpacity>
              </Card>
            </View>
          </View>

          {/* AI Insights - Prominent Card */}
          {hasAIExpansions && (
            <Card>
              <View style={{ 
                padding: 20, 
                backgroundColor: colors.primary + '15', 
                borderRadius: 12,
                borderWidth: 1,
                borderColor: colors.primary + '30'
              }}>
                <View style={{ flexDirection: 'row', gap: 12, marginBottom: 12 }}>
                  <View style={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: 16, 
                    backgroundColor: colors.primary + '30', 
                    alignItems: 'center', 
                    justifyContent: 'center' 
                  }}>
                    <Icon {...AppIcons.sparkles} size={16} color={colors.primary} />
                  </View>
                  <Text style={{ fontSize: 18, fontWeight: '600', color: colors.primary }}>
                    Insights da IA
                  </Text>
                </View>
                <Text style={{ fontSize: 15, lineHeight: 22, color: colors.foreground }}>
                  {idea.aiExpansions![0].content}
                </Text>
              </View>
            </Card>
          )}

          {/* AI Connections Section */}
          {hasConnections && connectedIdeas.length > 0 && (
            <View style={{ gap: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Icon {...AppIcons.link} size={16} color={colors.secondary} />
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.secondary }}>
                  Ideias Relacionadas
                </Text>
              </View>
              
              {connectedIdeas.map((connection, index) => (
                <Card key={connection.id}>
                  <TouchableOpacity
                    onPress={() => router.push(`/idea/${connection.id}`)}
                    activeOpacity={0.7}
                  >
                    <View 
                      style={{ 
                        padding: 16, 
                        backgroundColor: colors.secondary + '10', 
                        borderRadius: 8,
                        borderWidth: 1,
                        borderColor: colors.secondary + '30'
                      }}
                    >
                      <Text style={{ fontSize: 14, lineHeight: 20, color: colors.foreground, marginBottom: 8 }}>
                        {connection.content.length > 100 
                          ? connection.content.substring(0, 100) + '...' 
                          : connection.content
                        }
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', gap: 4 }}>
                          {connection.tags.slice(0, 2).map(tag => (
                            <Badge key={tag} variant="outline">
                              {tag}
                            </Badge>
                          ))}
                        </View>
                        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                          {formatTime(connection.timestamp)}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Floating Menu Modal */}
      <Modal
        visible={showMenu}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity 
          style={{ 
            flex: 1, 
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'flex-end'
          }}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={{ 
            backgroundColor: colors.card,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            padding: 20,
            paddingBottom: 40
          }}>
            <View style={{ 
              width: 40, 
              height: 4, 
              backgroundColor: colors.border, 
              borderRadius: 2, 
              alignSelf: 'center',
              marginBottom: 20
            }} />
            
            <View style={{ gap: 16 }}>
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingVertical: 12,
                  paddingHorizontal: 16
                }}
                onPress={() => {
                  setShowMenu(false);
                  handleToggleFavorite();
                }}
              >
                <Icon 
                  {...(idea.isFavorite ? AppIcons.star : AppIcons.starOutline)} 
                  size={20} 
                  color={idea.isFavorite ? colors.accent : colors.foreground} 
                />
                <Text style={{ 
                  marginLeft: 16, 
                  fontSize: 16, 
                  color: colors.foreground 
                }}>
                  {idea.isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingVertical: 12,
                  paddingHorizontal: 16
                }}
                onPress={() => {
                  setShowMenu(false);
                  handleEdit();
                }}
              >
                <Icon {...AppIcons.edit} size={20} color={colors.foreground} />
                <Text style={{ 
                  marginLeft: 16, 
                  fontSize: 16, 
                  color: colors.foreground 
                }}>
                  Editar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingVertical: 12,
                  paddingHorizontal: 16
                }}
                onPress={() => {
                  setShowMenu(false);
                  handleShare();
                }}
              >
                <Icon {...AppIcons.link} size={20} color={colors.foreground} />
                <Text style={{ 
                  marginLeft: 16, 
                  fontSize: 16, 
                  color: colors.foreground 
                }}>
                  Compartilhar
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  paddingVertical: 12,
                  paddingHorizontal: 16
                }}
                onPress={() => {
                  setShowMenu(false);
                  handleDelete();
                }}
              >
                <Icon {...AppIcons.delete} size={20} color={colors.destructive} />
                <Text style={{ 
                  marginLeft: 16, 
                  fontSize: 16, 
                  color: colors.destructive 
                }}>
                  Excluir
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}
