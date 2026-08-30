import api from './api';

export const dashboardService = {
  getStudentDashboard: async () => {
    const response = await api.get('/dashboard/student');
    return response.data;
  },

  getAdminDashboard: async () => {
    const response = await api.get('/dashboard/admin');
    return response.data;
  }
};
