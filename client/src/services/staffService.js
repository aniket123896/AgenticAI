import api from './api';

export const staffService = {
  getStaff: async (params = {}) => {
    const response = await api.get('/staff', { params });
    return response.data;
  },

  createStaff: async (staffData) => {
    const response = await api.post('/staff', staffData);
    return response.data;
  },

  updateStaff: async (id, staffData) => {
    const response = await api.put(`/staff/${id}`, staffData);
    return response.data;
  },

  deleteStaff: async (id) => {
    const response = await api.delete(`/staff/${id}`);
    return response.data;
  }
};
