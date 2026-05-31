import { api } from './api';

export const notificationService = {
  getNotifications: (page = 1, limit = 20) =>
    api.get('/v1/notifications', { params: { page, limit } }),
  markRead: (id: string) => api.patch(`/v1/notifications/${id}/read`),
  markAllRead: () => api.patch('/v1/notifications/read-all'),
};
