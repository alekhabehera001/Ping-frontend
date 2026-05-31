export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export const COLORS = {
  primary: '#FF4E8B',
  secondary: '#B24BF3',
  bg: '#0F0F1A',
  surface: '#1A1A2E',
  card: '#16213E',
  text: '#FFFFFF',
  muted: '#8B8B9E',
  success: '#4ADE80',
  error: '#F87171',
  warning: '#FACC15',
};

export const GRADIENTS = {
  primary: ['#FF4E8B', '#B24BF3'] as const,
  dark: ['#0F0F1A', '#1A1A2E'] as const,
  card: ['#16213E', '#0F0F1A'] as const,
};

export const MOOD_EMOJIS: Record<string, string> = {
  happy: '😄',
  sad: '😢',
  stressed: '😰',
  angry: '😤',
  excited: '🤩',
  loved: '🥰',
  tired: '😴',
};

export const MOOD_COLORS: Record<string, string> = {
  happy: '#FACC15',
  sad: '#60A5FA',
  stressed: '#FB923C',
  angry: '#F87171',
  excited: '#A78BFA',
  loved: '#F472B6',
  tired: '#6B7280',
};
