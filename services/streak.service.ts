import { api } from './api';

export const streakService = {
  getStreak: () => api.get('/v1/streaks'),
  recoverStreak: () => api.post('/v1/streaks/recover'),
};
