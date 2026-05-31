import { api } from './api';
import { MoodType } from '../types';

export const moodService = {
  sendMood: (mood: MoodType, note?: string) => api.post('/v1/moods', { mood, note }),
  getLatest: () => api.get('/v1/moods/latest'),
  getHistory: (page = 1, limit = 20) => api.get('/v1/moods/history', { params: { page, limit } }),
};
