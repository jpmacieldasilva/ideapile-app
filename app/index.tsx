import React, { useState, useEffect, useMemo } from 'react'
import { View, Text, ScrollView, TouchableOpacity } from 'react-native'
import { router } from 'expo-router'
import { Idea } from '../src/types'
import { Button, Card, Badge, Icon, FloatingActionButton } from '../src/components/ui'
import { AppIcons } from '../src/components/ui/Icon'
import { useIdeas } from '../src/hooks/useIdeas'
import { useThemeColors } from '../src/hooks/useThemeColors'
import { useUserSettings } from '../src/hooks/useUserSettings'

export default function HomeScreen() {
  const { ideas, addIdea, updateIdea, deleteIdea, loading, error } = useIdeas()
  const colors = useThemeColors()
  const { settings: userSettings, refreshSettings } = useUserSettings()
  
  // Estado para filtro de tags
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  
  // Recarregar configurações do usuário quando a tela for montada
  useEffect(() => {
    refreshSettings();
  }, [refreshSettings]);
  
  // Extrair tags únicas de todas as ideias
  const tags = useMemo(() => {
    const allTags = ideas.flatMap(idea => idea.tags || [])
    return [...new Set(allTags)].sort()
  }, [ideas])
  
  // Filtrar ideias por tag selecionada
  const filteredIdeas = useMemo(() => {
    if (!selectedTag) return ideas
    return ideas.filter(idea => idea.tags && idea.tags.includes(selectedTag))
  }, [ideas, selectedTag])



  const handleNavigateToDetails = (id: string) => {
    router.push(`/idea/${id}`)
  }

  const handleNavigateToCapture = () => {
    router.push('/capture')
  }

  const handleNavigateToSettings = () => {
    router.push('/settings')
  }

  const handleNavigateToCalendar = () => {
    router.push('/calendarview')
  }

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleString('pt-BR', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    })
  }

  const formatDate = (timestamp: Date) => {
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    
    if (timestamp.toDateString() === today.toDateString()) {
      return 'Hoje'
    } else if (timestamp.toDateString() === yesterday.toDateString()) {
      return 'Ontem'
    } else {
      return timestamp.toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      })
    }
  }

  const groupIdeasByDate = (ideas: Idea[]) => {
    const groups: { [key: string]: Idea[] } = {}
    
    ideas.forEach(idea => {
      const dateKey = idea.timestamp.toDateString()
      if (!groups[dateKey]) {
        groups[dateKey] = []
      }
      groups[dateKey].push(idea)
    })
    
    // Ordenar por data (mais recente primeiro)
    return Object.entries(groups)
      .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
      .map(([dateKey, ideasInGroup]) => ({
        date: new Date(dateKey),
        ideas: ideasInGroup
      }))
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        paddingHorizontal: 24, 
        paddingVertical: 16, 
        paddingTop: 44,
        backgroundColor: colors.background + 'CC', // 80% opacity
        borderBottomWidth: 1, 
        borderBottomColor: colors.border
      }}>
        {/* Top row: Calendar, Greeting, Settings */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          marginBottom: 16
        }}>
          {/* Botão de calendário à esquerda */}
          <TouchableOpacity 
            onPress={handleNavigateToCalendar}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <Icon {...AppIcons.calendar} size={18} color={colors.foreground} />
          </TouchableOpacity>

          {/* Saudação e contador no centro */}
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '500', 
              color: colors.foreground,
              marginBottom: 2
            }}>
              Olá, {userSettings.userName}!
            </Text>
            <Text style={{ 
              fontSize: 13, 
              color: colors.mutedForeground 
            }}>
              {filteredIdeas.length} ideia{filteredIdeas.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Botão de configurações à direita */}
          <TouchableOpacity 
            onPress={handleNavigateToSettings}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent'
            }}
          >
            <Icon {...AppIcons.settings} size={18} color={colors.foreground} />
          </TouchableOpacity>
        </View>

        {/* Categorias */}
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          gap: 8
        }}>
          <TouchableOpacity
            style={{
              paddingHorizontal: 16,
              paddingVertical: 6,
              backgroundColor: selectedTag === null ? colors.muted : 'transparent',
              borderRadius: 16,
              borderWidth: 1,
              borderColor: colors.border
            }}
            onPress={() => setSelectedTag(null)}
          >
            <Text style={{ 
              fontSize: 13, 
              fontWeight: '500', 
              color: colors.foreground 
            }}>
              Todas as categorias
            </Text>
          </TouchableOpacity>
          {tags.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 6,
                backgroundColor: selectedTag === tag ? colors.muted : 'transparent',
                borderRadius: 16,
                borderWidth: 1,
                borderColor: colors.border
              }}
              onPress={() => setSelectedTag(tag)}
            >
              <Text style={{ 
                fontSize: 13, 
                color: colors.foreground,
                fontWeight: selectedTag === tag ? '500' : '400'
              }}>
                {tag}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Timeline */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {loading ? (
          <View style={{ 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: 60 
          }}>
            <Text style={{ fontSize: 16, color: colors.mutedForeground }}>
              Carregando ideias...
            </Text>
          </View>
        ) : error ? (
          <View style={{ 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: 60 
          }}>
            <Text style={{ fontSize: 16, color: colors.destructive }}>
              {error}
            </Text>
          </View>
        ) : filteredIdeas.length === 0 ? (
          <View style={{ 
            flex: 1, 
            alignItems: 'center', 
            justifyContent: 'center', 
            paddingVertical: 60 
          }}>
            <View style={{ 
              width: 80, 
              height: 80, 
              borderRadius: 40, 
              backgroundColor: colors.muted, 
              alignItems: 'center', 
              justifyContent: 'center',
              marginBottom: 16
            }}>
              <Icon {...AppIcons.lightbulb} size={32} color={colors.mutedForeground} />
            </View>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: colors.foreground, 
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Nenhuma ideia ainda
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.mutedForeground, 
              textAlign: 'center',
              lineHeight: 20
            }}>
              Toque no botão + para gravar sua primeira ideia
            </Text>
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            {groupIdeasByDate(filteredIdeas).map(({ date, ideas: ideasInGroup }, groupIndex) => (
              <View key={date.toISOString()} style={{ gap: 16 }}>
                {/* Header da data */}
                <View style={{ 
                  flexDirection: 'row', 
                  alignItems: 'center', 
                  gap: 12,
                  paddingHorizontal: 4
                }}>
                  <View style={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: 4, 
                    backgroundColor: colors.primary 
                  }} />
                  <Text style={{ 
                    fontSize: 14, 
                    fontWeight: '600', 
                    color: colors.foreground,
                    textTransform: 'capitalize'
                  }}>
                    {formatDate(date)}
                  </Text>
                </View>

                {/* Cards da data com timeline */}
                <View style={{ paddingLeft: 20, position: 'relative' }}>
                  {/* Linha contínua da timeline */}
                  <View style={{ 
                    position: 'absolute',
                    left: 8,
                    top: 0,
                    bottom: 0,
                    width: 2, 
                    backgroundColor: colors.border,
                  }} />
                  
                  {ideasInGroup.map((idea, ideaIndex) => (
                    <View key={idea.id} style={{ 
                      flexDirection: 'row', 
                      alignItems: 'flex-start',
                      marginBottom: 12,
                      position: 'relative'
                    }}>
                      
                      {/* Card da ideia */}
                      <View style={{ flex: 1, marginLeft: 4 }}>
                        <TouchableOpacity
                          onPress={() => handleNavigateToDetails(idea.id)}
                          activeOpacity={0.7}
                        >
                          <Card style={{ 
                            borderWidth: 1, 
                            borderColor: colors.border,
                            borderRadius: 16
                          }}>
                            <View style={{ padding: 8, gap: 12 }}>
                              <Text style={{ 
                                fontSize: 16, 
                                lineHeight: 24, 
                                color: colors.foreground,
                                flex: 1
                              }}>
                                {idea.content}
                              </Text>
                              
                              <View style={{ 
                                flexDirection: 'row', 
                                alignItems: 'center', 
                                justifyContent: 'space-between' 
                              }}>
                                <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                                  {formatTime(idea.timestamp)}
                                </Text>
                                
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                  {idea.tags.slice(0, 2).map(tag => (
                                    <Badge key={tag} variant="secondary">
                                      <Text style={{ fontSize: 10 }}>{tag}</Text>
                                    </Badge>
                                  ))}
                                  {idea.tags.length > 2 && (
                                    <Badge variant="outline">
                                      <Text style={{ fontSize: 10 }}>+{idea.tags.length - 2}</Text>
                                    </Badge>
                                  )}
                                </View>
                              </View>

                              {/* Indicadores de IA */}
                              {((idea.aiExpansions && idea.aiExpansions.length > 0) || (idea.connections && idea.connections.length > 0)) && (
                                <View style={{ flexDirection: 'row', gap: 8 }}>
                                  {idea.aiExpansions && idea.aiExpansions.length > 0 && (
                                    <View style={{ 
                                      flexDirection: 'row', 
                                      alignItems: 'center', 
                                      gap: 4,
                                      paddingHorizontal: 8,
                                      paddingVertical: 4,
                                      backgroundColor: colors.primary + '20',
                                      borderRadius: 12
                                    }}>
                                      <Icon {...AppIcons.sparkles} size={12} color={colors.primary} />
                                      <Text style={{ fontSize: 10, color: colors.primary }}>
                                        Expandida
                                      </Text>
                                    </View>
                                  )}
                                  {idea.connections && idea.connections.length > 0 && (
                                    <View style={{ 
                                      flexDirection: 'row', 
                                      alignItems: 'center', 
                                      gap: 4,
                                      paddingHorizontal: 8,
                                      paddingVertical: 4,
                                      backgroundColor: colors.secondary + '20',
                                      borderRadius: 12
                                    }}>
                                      <Icon {...AppIcons.link} size={12} color={colors.secondary} />
                                      <Text style={{ fontSize: 10, color: colors.secondary }}>
                                        {idea.connections.length} conexão{idea.connections.length !== 1 ? 'ões' : ''}
                                      </Text>
                                    </View>
                                  )}
                                </View>
                              )}
                            </View>
                          </Card>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* FAB para gravar */}
      <FloatingActionButton
        onPress={handleNavigateToCapture}
        position="bottom-right"
        color="primary"
        size="lg"
      >
        <Icon {...AppIcons.mic} size={24} color="white" />
      </FloatingActionButton>
    </View>
  )
}