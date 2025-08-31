// Utilitários para formatação e agrupamento de tempo
export interface TimeGroup {
  key: string;
  title: string;
  subtitle?: string;
  color: string;
  data: any[];
}

export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
  
  // Menos de 1 minuto
  if (diffInMinutes < 1) {
    return 'Agora há pouco';
  }
  
  // Menos de 1 hora
  if (diffInMinutes < 60) {
    return `Há ${diffInMinutes}min`;
  }
  
  // Menos de 24 horas
  if (diffInHours < 24) {
    return `Há ${diffInHours}h`;
  }
  
  // Menos de 7 dias
  if (diffInDays < 7) {
    if (diffInDays === 1) return 'Ontem';
    return `Há ${diffInDays} dias`;
  }
  
  // Menos de 30 dias
  if (diffInDays < 30) {
    const weeks = Math.floor(diffInDays / 7);
    return weeks === 1 ? 'Há 1 semana' : `Há ${weeks} semanas`;
  }
  
  // Mais de 30 dias
  const months = Math.floor(diffInDays / 30);
  if (months < 12) {
    return months === 1 ? 'Há 1 mês' : `Há ${months} meses`;
  }
  
  // Mais de 1 ano
  const years = Math.floor(diffInDays / 365);
  return years === 1 ? 'Há 1 ano' : `Há ${years} anos`;
};

export const getDetailedTime = (date: Date): string => {
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getTimeOfDay = (date: Date): string => {
  const hour = date.getHours();
  
  if (hour >= 5 && hour < 12) return 'manhã';
  if (hour >= 12 && hour < 18) return 'tarde';
  if (hour >= 18 && hour < 22) return 'noite';
  return 'madrugada';
};

export const groupItemsByTime = <T extends { timestamp: Date }>(
  items: T[]
): TimeGroup[] => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(today.getDate() - today.getDay());
  const lastWeekStart = new Date(thisWeekStart);
  lastWeekStart.setDate(thisWeekStart.getDate() - 7);
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(thisMonthStart);
  lastMonthStart.setMonth(lastMonthStart.getMonth() - 1);
  
  const groups: { [key: string]: TimeGroup } = {};
  
  // Ordenar itens por data (mais recente primeiro)
  const sortedItems = [...items].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  
  sortedItems.forEach(item => {
    const itemDate = new Date(item.timestamp);
    const itemDateOnly = new Date(itemDate.getFullYear(), itemDate.getMonth(), itemDate.getDate());
    
    let groupKey = '';
    let groupTitle = '';
    let groupSubtitle = '';
    let groupColor = '#4f46e5'; // primary color
    
    if (itemDateOnly.getTime() === today.getTime()) {
      // Hoje - subcategorizar por período do dia
      const timeOfDay = getTimeOfDay(itemDate);
      groupKey = `hoje-${timeOfDay}`;
      groupTitle = 'Hoje';
      groupSubtitle = `pela ${timeOfDay}`;
      groupColor = '#22c55e'; // success color
    } else if (itemDateOnly.getTime() === yesterday.getTime()) {
      // Ontem - subcategorizar por período do dia
      const timeOfDay = getTimeOfDay(itemDate);
      groupKey = `ontem-${timeOfDay}`;
      groupTitle = 'Ontem';
      groupSubtitle = `pela ${timeOfDay}`;
      groupColor = '#f59e0b'; // warning color
    } else if (itemDateOnly >= thisWeekStart) {
      // Esta semana
      const dayName = itemDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      groupKey = `esta-semana-${itemDate.getDay()}`;
      groupTitle = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      groupSubtitle = 'esta semana';
      groupColor = '#4f46e5'; // primary color
    } else if (itemDateOnly >= lastWeekStart) {
      // Semana passada
      const dayName = itemDate.toLocaleDateString('pt-BR', { weekday: 'long' });
      groupKey = `semana-passada-${itemDate.getDay()}`;
      groupTitle = dayName.charAt(0).toUpperCase() + dayName.slice(1);
      groupSubtitle = 'semana passada';
      groupColor = '#737373'; // muted color
    } else if (itemDateOnly >= thisMonthStart) {
      // Este mês
      const weekOfMonth = Math.ceil(itemDate.getDate() / 7);
      groupKey = `este-mes-semana-${weekOfMonth}`;
      groupTitle = `${weekOfMonth}ª semana`;
      groupSubtitle = 'deste mês';
      groupColor = '#6b7280'; // muted color
    } else if (itemDateOnly >= lastMonthStart) {
      // Mês passado
      groupKey = 'mes-passado';
      groupTitle = 'Mês passado';
      groupSubtitle = lastMonthStart.toLocaleDateString('pt-BR', { month: 'long' });
      groupColor = '#6b7280'; // muted color
    } else {
      // Mais antigo - agrupar por mês/ano
      const monthYear = itemDate.toLocaleDateString('pt-BR', { 
        month: 'long', 
        year: 'numeric' 
      });
      groupKey = `antigo-${itemDate.getFullYear()}-${itemDate.getMonth()}`;
      groupTitle = monthYear.charAt(0).toUpperCase() + monthYear.slice(1);
      groupSubtitle = getRelativeTime(itemDate);
      groupColor = '#9ca3af'; // muted color
    }
    
    if (!groups[groupKey]) {
      groups[groupKey] = {
        key: groupKey,
        title: groupTitle,
        subtitle: groupSubtitle,
        color: groupColor,
        data: []
      };
    }
    
    groups[groupKey].data.push(item);
  });
  
  // Converter para array e ordenar grupos
  const groupArray = Object.values(groups);
  
  // Ordem personalizada dos grupos
  const groupOrder = [
    'hoje-manha', 'hoje-tarde', 'hoje-noite', 'hoje-madrugada',
    'ontem-manha', 'ontem-tarde', 'ontem-noite', 'ontem-madrugada',
    // Esta semana (domingo = 0, segunda = 1, etc.)
    'esta-semana-6', 'esta-semana-5', 'esta-semana-4', 
    'esta-semana-3', 'esta-semana-2', 'esta-semana-1', 'esta-semana-0',
    // Semana passada
    'semana-passada-6', 'semana-passada-5', 'semana-passada-4',
    'semana-passada-3', 'semana-passada-2', 'semana-passada-1', 'semana-passada-0',
    // Este mês
    'este-mes-semana-4', 'este-mes-semana-3', 'este-mes-semana-2', 'este-mes-semana-1',
    // Outros (ordenados por data mais recente)
    'mes-passado'
  ];
  
  return groupArray.sort((a, b) => {
    const indexA = groupOrder.indexOf(a.key);
    const indexB = groupOrder.indexOf(b.key);
    
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // Para grupos antigos, ordenar por data mais recente
    if (a.data.length > 0 && b.data.length > 0) {
      return b.data[0].timestamp.getTime() - a.data[0].timestamp.getTime();
    }
    
    return 0;
  });
};

export const formatTimeRange = (startDate: Date, endDate: Date): string => {
  const isSameDay = startDate.toDateString() === endDate.toDateString();
  
  if (isSameDay) {
    return `${startDate.toLocaleDateString('pt-BR')} • ${startDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })} - ${endDate.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })}`;
  }
  
  return `${startDate.toLocaleDateString('pt-BR')} - ${endDate.toLocaleDateString('pt-BR')}`;
};

export const getTimestamp = (): Date => {
  return new Date();
};
