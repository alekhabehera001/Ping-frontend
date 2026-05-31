import { api } from './api';

export const coupleService = {
  generateInvite: () => api.post('/v1/couples/invite'),
  joinCouple: (inviteCode: string) => api.post('/v1/couples/join', { inviteCode }),
  getCouple: () => api.get('/v1/couples/me'),
  setAnniversary: (anniversary: string) => api.patch('/v1/couples/anniversary', { anniversary }),
  unlinkPartner: () => api.delete('/v1/couples/unlink'),
};
