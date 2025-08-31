// Barrel export para todos os utilitários
export * from './uuid';
export * from './date';
export * from './timeUtils';

// Utilitários gerais
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}

export function extractHashtags(text: string): string[] {
  const hashtags = text.match(/#[a-zA-Z0-9_]+/g);
  return hashtags ? hashtags.map(tag => tag.substring(1)) : [];
}

export function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function sanitizeText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Múltiplos espaços viram um só
    .replace(/\n{3,}/g, '\n\n'); // Múltiplas quebras viram duas
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
}

export function generateRandomColor(): string {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308',
    '#84cc16', '#22c55e', '#10b981', '#14b8a6',
    '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
    '#8b5cf6', '#a855f7', '#d946ef', '#ec4899',
    '#f43f5e'
  ];
  
  return colors[Math.floor(Math.random() * colors.length)];
}

export default {
  truncateText,
  extractHashtags,
  highlightText,
  sanitizeText,
  debounce,
  validateEmail,
  getInitials,
  generateRandomColor,
};
