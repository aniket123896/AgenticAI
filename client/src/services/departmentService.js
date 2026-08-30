import api from './api';

export const departmentService = {
  getDepartments: async () => {
    const response = await api.get('/departments');
    return response.data;
  },

  createDepartment: async (deptData) => {
    const response = await api.post('/departments', deptData);
    return response.data;
  },

  updateDepartment: async (id, deptData) => {
    const response = await api.put(`/departments/${id}`, deptData);
    return response.data;
  },

  deleteDepartment: async (id) => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  }
};
