import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { API_BASE_URL } from '../constants/config';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ping_access_token',
  REFRESH_TOKEN: 'ping_refresh_token',
};

const storage = {
  getItem: async (key: string) => {
    if (Platform.OS === 'web') return localStorage.getItem(key);
    return SecureStore.getItemAsync(key);
  },
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') { localStorage.setItem(key, value); return; }
    return SecureStore.setItemAsync(key, value);
  },
  deleteItem: async (key: string) => {
    if (Platform.OS === 'web') { localStorage.removeItem(key); return; }
    return SecureStore.deleteItemAsync(key);
  },
};

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.EXPO_PUBLIC_API_KEY || 'dev-api-key',
  },
  timeout: 15000,
});

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: unknown) => void }> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)));
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const refreshToken = await storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
        if (!refreshToken) throw new Error('No refresh token');
        const { data } = await api.post('/v1/auth/refresh', { refreshToken });
        const newTokens = data.data;
        await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, newTokens.accessToken);
        await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, newTokens.refreshToken);
        processQueue(null, newTokens.accessToken);
        originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;
        return api(originalRequest);
      } catch (err) {
        processQueue(err, null);
        await clearTokens();
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  },
);

export async function saveTokens(accessToken: string, refreshToken: string) {
  await storage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await storage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
}

export async function clearTokens() {
  await storage.deleteItem(STORAGE_KEYS.ACCESS_TOKEN);
  await storage.deleteItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export async function getAccessToken() {
  return storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

export async function getRefreshToken() {
  return storage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}
