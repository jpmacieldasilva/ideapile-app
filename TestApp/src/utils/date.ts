// Utilitários para formatação de datas

export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  // Menos de 1 minuto
  if (diffInSeconds < 60) {
    return 'Agora';
  }

  // Menos de 1 hora
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}min atrás`;
  }

  // Menos de 1 dia
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h atrás`;
  }

  // Menos de 1 semana
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d atrás`;
  }

  // Mais de 1 semana - mostrar data
  const isThisYear = date.getFullYear() === now.getFullYear();
  
  if (isThisYear) {
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short'
    });
  } else {
    return date.toLocaleDateString('pt-BR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}

export function formatFullDate(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function isToday(date: Date): boolean {
  const today = new Date();
  return date.toDateString() === today.toDateString();
}

export function isYesterday(date: Date): boolean {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return date.toDateString() === yesterday.toDateString();
}

export function getDateGroup(date: Date): string {
  if (isToday(date)) {
    return 'Hoje';
  }
  
  if (isYesterday(date)) {
    return 'Ontem';
  }

  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / 86400000);

  if (diffInDays < 7) {
    return 'Esta semana';
  }

  if (diffInDays < 30) {
    return 'Este mês';
  }

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('pt-BR', { month: 'long' });
  }

  return date.getFullYear().toString();
}

export default {
  formatRelativeTime,
  formatFullDate,
  formatTime,
  isToday,
  isYesterday,
  getDateGroup,
};
