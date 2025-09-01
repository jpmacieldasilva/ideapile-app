// Utilitário para gerar IDs únicos
// Usando uma implementação simples e confiável para React Native

export function generateId(): string {
  // Timestamp em hexadecimal + random
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  
  return `${timestamp}-${randomPart}`;
}

// Função para verificar se um ID é válido
export function isValidId(id: string): boolean {
  return typeof id === 'string' && id.length > 0 && id.includes('-');
}

// Função para criar ID baseado em conteúdo (para cache)
export function createContentId(content: string): string {
  // Remove espaços e caracteres especiais, cria hash simples
  const clean = content.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  const hash = Array.from(clean).reduce((acc, char) => {
    return ((acc << 5) - acc + char.charCodeAt(0)) & 0xffffffff;
  }, 0);
  
  return `content-${Math.abs(hash).toString(36)}`;
}

export default {
  generate: generateId,
  isValid: isValidId,
  fromContent: createContentId,
};
