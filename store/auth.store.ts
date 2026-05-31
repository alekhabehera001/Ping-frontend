import { create } from 'zustand';
import { User, TokenPair } from '../types';
import { clearTokens, saveTokens } from '../services/api';

interface AuthStore {
  user: User | null;
  tokens: TokenPair | null;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: TokenPair) => Promise<void>;
  updateUser: (updates: Partial<User>) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,

  setAuth: async (user, tokens) => {
    await saveTokens(tokens.accessToken, tokens.refreshToken);
    set({ user, tokens, isAuthenticated: true });
  },

  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),

  logout: async () => {
    await clearTokens();
    set({ user: null, tokens: null, isAuthenticated: false });
  },
}));
