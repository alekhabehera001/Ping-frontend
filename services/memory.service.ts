import { api } from './api';
import { MemoryType } from '../types';

export const memoryService = {
  getPresigned: (contentType: string, fileName: string) =>
    api.post('/v1/memories/presigned', { contentType, fileName }),

  createMemory: (data: {
    type: MemoryType;
    s3Key?: string;
    caption?: string;
    noteText?: string;
  }) => api.post('/v1/memories', data),

  getTimeline: (cursor?: string, limit = 20) =>
    api.get('/v1/memories', { params: { cursor, limit } }),

  getMonthlyRecap: () => api.get('/v1/memories/monthly-recap'),

  deleteMemory: (id: string) => api.delete(`/v1/memories/${id}`),
};
