import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { Icon, AppIcons } from '../src/components/ui/Icon';
import { useThemeColors } from '../src/hooks/useThemeColors';
import { useIdeas } from '../src/hooks/useIdeas';
import { Idea } from '../src/types';

export default function CalendarViewScreen() {
  const colors = useThemeColors();
  const { ideas } = useIdeas();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const handleNavigateBack = () => {
    router.back();
  };

  // Navegação de meses
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentDate(newDate);
  };

  // Formatar mês e ano
  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatar dia da semana
  const formatWeekday = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'short'
    });
  };

  // Formatar data completa
  const formatFullDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Formatar hora
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: false
    });
  };

  // Gerar calendário do mês
  const generateCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Primeiro dia do mês
    const firstDay = new Date(year, month, 1);
    // Último dia do mês
    const lastDay = new Date(year, month + 1, 0);
    
    // Dia da semana do primeiro dia (0 = domingo, 1 = segunda, etc.)
    const firstDayOfWeek = firstDay.getDay();
    
    // Dias do mês anterior para preencher o início
    const daysFromPreviousMonth = firstDayOfWeek;
    const previousMonth = new Date(year, month, 0);
    const daysInPreviousMonth = previousMonth.getDate();
    
    const days = [];
    
    // Adicionar dias do mês anterior
    for (let i = daysFromPreviousMonth - 1; i >= 0; i--) {
      const day = new Date(year, month - 1, daysInPreviousMonth - i);
      days.push({
        date: day,
        isCurrentMonth: false,
        isSelected: false
      });
    }
    
    // Adicionar dias do mês atual
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      days.push({
        date,
        isCurrentMonth: true,
        isSelected: selectedDate && date.toDateString() === selectedDate.toDateString()
      });
    }
    
    // Adicionar dias do próximo mês para completar a grade
    const remainingDays = 42 - days.length; // 6 semanas * 7 dias
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isSelected: false
      });
    }
    
    return days;
  };

  // Agrupar ideias por data
  const ideasByDate = useMemo(() => {
    const groups: { [key: string]: Idea[] } = {};
    
    ideas.forEach(idea => {
      const dateKey = idea.timestamp.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(idea);
    });
    
    return groups;
  }, [ideas]);

  // Contar ideias por dia
  const getIdeasCountForDate = (date: Date) => {
    const dateKey = date.toDateString();
    return ideasByDate[dateKey]?.length || 0;
  };

  // Obter cor baseada na quantidade de ideias
  const getDayColor = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return 'transparent';
    
    const count = getIdeasCountForDate(date);
    if (count === 0) return colors.background;
    if (count === 1) return colors.muted;
    return colors.foreground;
  };

  // Obter ideias do dia selecionado
  const selectedDayIdeas = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = selectedDate.toDateString();
    return ideasByDate[dateKey] || [];
  }, [selectedDate, ideasByDate]);

  // Contar total de ideias do mês
  const totalIdeasThisMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    let count = 0;
    
    ideas.forEach(idea => {
      if (idea.timestamp.getFullYear() === year && idea.timestamp.getMonth() === month) {
        count++;
      }
    });
    
    return count;
  }, [ideas, currentDate]);

  const calendarDays = generateCalendarDays();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header Refinado */}
      <View style={{ 
         paddingHorizontal: 24, 
         paddingVertical: 16, 
         paddingTop: 32,
         backgroundColor: colors.background + 'CC', // 80% opacity
         borderBottomWidth: 1, 
         borderBottomColor: colors.border
      }}>
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center', // Centraliza verticalmente
          justifyContent: 'center', // Centraliza horizontalmente
          position: 'relative',
          height: 32, // Garante altura suficiente para centralização vertical
        }}>
          {/* Botão de voltar à esquerda */}
          <TouchableOpacity 
            onPress={handleNavigateBack}
            style={{
              position: 'absolute',
              right: 0,
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              zIndex: 2,
            }}
          >
            <Icon name="arrow-forward" library="Material" size={18} color={colors.foreground} />
          </TouchableOpacity>

          {/* Título centralizado */}
          <Text style={{ 
            fontSize: 18, 
            fontWeight: '500', 
            color: colors.foreground,
            textAlign: 'center',
          }}>
            Atividade
          </Text>

          {/* Espaçador à direita para simetria */}
          <View style={{ width: 36, position: 'absolute', left: 0 }} />
        </View>
      </View>

      {/* Month Navigation */}
      <View style={{ 
        flexDirection: 'row', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingVertical: 16
      }}>
        <TouchableOpacity 
          onPress={goToPreviousMonth}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}
        >
          <Icon name="chevron-left" size={20} color={colors.foreground} />
        </TouchableOpacity>

        <View style={{ alignItems: 'center' }}>
          <Text style={{ 
            fontSize: 20, 
            fontWeight: '700', 
            color: colors.foreground,
            
          }}>
            {formatMonthYear(currentDate)}
          </Text>
          <Text style={{ 
            fontSize: 14, 
            color: colors.mutedForeground,
            marginTop: 2
          }}>
            {totalIdeasThisMonth} ideia{totalIdeasThisMonth !== 1 ? 's' : ''} este mês
          </Text>
        </View>

        <TouchableOpacity 
          onPress={goToNextMonth}
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent'
          }}
        >
          <Icon name="chevron-right" size={20} color={colors.foreground} />
        </TouchableOpacity>
      </View>

      {/* Calendar Grid */}
      <View style={{ paddingHorizontal: 24 }}>
        {/* Days of Week Header */}
        <View style={{ 
          flexDirection: 'row', 
          marginBottom: 12
        }}>
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
            <View key={index} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ 
                fontSize: 12, 
                fontWeight: '500', 
                color: colors.mutedForeground 
              }}>
                {day}
              </Text>
            </View>
          ))}
        </View>

        {/* Calendar Days */}
        <View style={{ gap: 6 }}>
          {Array.from({ length: 6 }, (_, weekIndex) => (
            <View key={weekIndex} style={{ flexDirection: 'row', gap: 6 }}>
              {calendarDays.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => {
                const ideasCount = getIdeasCountForDate(day.date);
                const isSelected = day.isSelected;
                
                return (
                  <TouchableOpacity
                    key={dayIndex}
                    onPress={() => {
                      if (day.isCurrentMonth) {
                        setSelectedDate(day.date);
                      }
                    }}
                                         style={{
                       flex: 1,
                       aspectRatio: 1,
                       borderRadius: 6,
                       backgroundColor: getDayColor(day.date, day.isCurrentMonth),
                       borderWidth: isSelected ? 2 : 0,
                       borderColor: colors.foreground,
                       alignItems: 'center',
                       justifyContent: 'center',
                       position: 'relative'
                     }}
                  >
                                         <Text style={{ 
                       fontSize: 14, 
                       fontWeight: '500',
                       color: day.isCurrentMonth 
                         ? (getDayColor(day.date, day.isCurrentMonth) === colors.foreground 
                             ? colors.background 
                             : colors.foreground)
                         : colors.mutedForeground
                     }}>
                       {day.date.getDate()}
                     </Text>
                    
                                         {/* Badge com contagem de ideias */}
                     {ideasCount > 0 && (
                       <View style={{
                         position: 'absolute',
                         top: 1,
                         right: 1,
                         width: 14,
                         height: 14,
                         borderRadius: 7,
                         backgroundColor: colors.foreground,
                         alignItems: 'center',
                         justifyContent: 'center'
                       }}>
                         <Text style={{ 
                           fontSize: 9, 
                           fontWeight: '600',
                           color: colors.background
                         }}>
                           {ideasCount}
                         </Text>
                       </View>
                     )}
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>

                 {/* Pagination Indicator */}
         <View style={{ 
           flexDirection: 'row', 
           alignItems: 'center', 
           justifyContent: 'space-between',
           marginTop: 20
         }}>
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            Less
          </Text>
          
                     <View style={{ flexDirection: 'row', gap: 3 }}>
             {[1, 2, 3, 4, 5].map((dot, index) => (
               <View
                 key={index}
                 style={{
                   width: 5,
                   height: 5,
                   borderRadius: 2.5,
                   backgroundColor: index < 2 ? colors.muted : colors.foreground
                 }}
               />
             ))}
           </View>
          
          <Text style={{ fontSize: 14, color: colors.mutedForeground }}>
            More
          </Text>
        </View>
      </View>

      {/* Selected Day Ideas */}
      {selectedDate && (
        <View style={{ 
          flex: 1, 
          borderTopWidth: 1, 
          borderTopColor: colors.border,
          padding: 24
        }}>
          {/* Header */}
          <View style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: 16
          }}>
            <Text style={{ 
              fontSize: 16, 
              fontWeight: '600', 
              color: colors.foreground,
              textTransform: 'capitalize'
            }}>
              {formatFullDate(selectedDate)}
            </Text>
            <Text style={{ 
              fontSize: 14, 
              color: colors.mutedForeground 
            }}>
              {selectedDayIdeas.length} ideia{selectedDayIdeas.length !== 1 ? 's' : ''}
            </Text>
          </View>

          {/* Ideas List */}
          <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
            <View style={{ gap: 12 }}>
              {selectedDayIdeas.map((idea) => (
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
                    
                    <Text style={{ fontSize: 12, color: colors.mutedForeground }}>
                      {formatTime(idea.timestamp)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </View>
  );
}
