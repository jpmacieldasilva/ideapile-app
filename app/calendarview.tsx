import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Icon, AppIcons } from '../src/components/ui/Icon';
import { useThemeColors } from '../src/hooks/useThemeColors';
import { useIdeas } from '../src/hooks/useIdeas';

export default function CalendarViewScreen() {
  const colors = useThemeColors();
  const { ideas } = useIdeas();

  const handleNavigateBack = () => {
    router.back();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const groupIdeasByMonth = () => {
    const groups: { [key: string]: typeof ideas } = {};
    
    ideas.forEach(idea => {
      const monthKey = `${idea.timestamp.getFullYear()}-${idea.timestamp.getMonth()}`;
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(idea);
    });
    
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([monthKey, ideasInMonth]) => {
        const [year, month] = monthKey.split('-').map(Number);
        const date = new Date(year, month);
        return { date, ideas: ideasInMonth };
      });
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        padding: 24, 
        paddingTop: 60,
        borderBottomWidth: 1, 
        borderBottomColor: colors.border,
        backgroundColor: colors.card
      }}>
        <TouchableOpacity 
          onPress={handleNavigateBack}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.muted
          }}
        >
          <Icon {...AppIcons.close} size={20} color={colors.foreground} />
        </TouchableOpacity>
        
        <Text style={{ fontSize: 20, fontWeight: '700', color: colors.foreground }}>
          Visualização do Calendário
        </Text>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {ideas.length === 0 ? (
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
              <Icon {...AppIcons.calendar} size={32} color={colors.mutedForeground} />
            </View>
            <Text style={{ 
              fontSize: 18, 
              fontWeight: '600', 
              color: colors.foreground, 
              marginBottom: 8,
              textAlign: 'center'
            }}>
              Nenhuma ideia para mostrar
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.mutedForeground, 
              textAlign: 'center',
              lineHeight: 20
            }}>
              Crie algumas ideias para ver a visualização do calendário
            </Text>
          </View>
        ) : (
          <View style={{ gap: 24 }}>
            {groupIdeasByMonth().map(({ date, ideas: ideasInMonth }) => (
              <View key={date.toISOString()} style={{ gap: 16 }}>
                {/* Header do mês */}
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
                    fontSize: 16, 
                    fontWeight: '700', 
                    color: colors.foreground,
                    textTransform: 'capitalize'
                  }}>
                    {formatDate(date)}
                  </Text>
                  <Text style={{ 
                    fontSize: 14, 
                    color: colors.mutedForeground 
                  }}>
                    ({ideasInMonth.length} ideia{ideasInMonth.length !== 1 ? 's' : ''})
                  </Text>
                </View>

                {/* Lista de ideias do mês */}
                <View style={{ gap: 12 }}>
                  {ideasInMonth.map((idea) => (
                    <View key={idea.id} style={{
                      padding: 16,
                      backgroundColor: colors.card,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: colors.border
                    }}>
                      <Text style={{ 
                        fontSize: 14, 
                        lineHeight: 20, 
                        color: colors.foreground,
                        marginBottom: 8
                      }}>
                        {idea.content}
                      </Text>
                      
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center', 
                        justifyContent: 'space-between' 
                      }}>
                        <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                          {idea.timestamp.toLocaleDateString('pt-BR', {
                            day: 'numeric',
                            month: 'short',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: false
                          })}
                        </Text>
                        
                        <View style={{ flexDirection: 'row', gap: 8 }}>
                          {idea.tags.slice(0, 2).map(tag => (
                            <View key={tag} style={{
                              paddingHorizontal: 8,
                              paddingVertical: 4,
                              backgroundColor: colors.muted,
                              borderRadius: 8
                            }}>
                              <Text style={{ fontSize: 10, color: colors.mutedForeground }}>
                                {tag}
                              </Text>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
