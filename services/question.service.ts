import { api } from './api';

export const questionService = {
  getToday: () => api.get('/v1/questions/today'),
  list: (page = 1, limit = 20, category?: string) =>
    api.get('/v1/questions', { params: { page, limit, category } }),

  submitAnswer: (questionId: string, text: string) =>
    api.post('/v1/answers', { questionId, text }),

  getTodayAnswers: (questionId: string) =>
    api.get('/v1/answers/today', { params: { questionId } }),

  getAnswerHistory: (page = 1, limit = 20) =>
    api.get('/v1/answers/history', { params: { page, limit } }),
};
