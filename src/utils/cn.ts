// Utilitário para combinar classes CSS (className utility)
// Inspirado no clsx/classnames mas otimizado para React Native

export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs
    .filter(Boolean)
    .join(' ')
    .trim();
}

export default cn;
