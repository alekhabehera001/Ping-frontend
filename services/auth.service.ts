import { api } from './api';

export const authService = {
  register: (email: string, password: string, name: string) =>
    api.post('/v1/auth/register', { email, password, name }),

  verifyOtp: (userId: string, otp: string) =>
    api.post('/v1/auth/verify-otp', { userId, otp }),

  resendOtp: (userId: string) =>
    api.post('/v1/auth/resend-otp', { userId }),

  login: (email: string, password: string) =>
    api.post('/v1/auth/login', { email, password }),

  refresh: (refreshToken: string) =>
    api.post('/v1/auth/refresh', { refreshToken }),

  forgotPassword: (email: string) =>
    api.post('/v1/auth/forgot-password', { email }),

  verifyResetOtp: (userId: string, otp: string) =>
    api.post('/v1/auth/verify-reset-otp', { userId, otp }),

  resetPassword: (verificationToken: string, newPassword: string, confirmPassword: string) =>
    api.post('/v1/auth/reset-password', { verificationToken, newPassword, confirmPassword }),

  logout: (refreshToken: string) =>
    api.post('/v1/auth/logout', { refreshToken }),

  requestDelete: () =>
    api.post('/v1/auth/request-delete'),

  deleteAccount: (otp: string) =>
    api.delete('/v1/auth/account', { data: { otp } }),
};
