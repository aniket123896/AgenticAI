import api from './api';

export const authService = {
  sendOtp: async (email, purpose = 'login') => {
    const response = await api.post('/auth/send-otp', { email, purpose });
    return response.data;
  },

  verifyOtp: async (email, otp, purpose = 'login') => {
    const response = await api.post('/auth/verify-otp', { email, otp, purpose });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('ccms_token');
      localStorage.removeItem('ccms_user');
    }
  }
};
