import api from './api';

export const complaintService = {
  // Student: Create complaint with optional FormData (attachments)
  createComplaint: async (formData) => {
    const response = await api.post('/complaints', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Student: Get my complaints
  getMyComplaints: async (params = {}) => {
    const response = await api.get('/complaints/my', { params });
    return response.data;
  },

  // Get single complaint details
  getComplaintById: async (id) => {
    const response = await api.get(`/complaints/${id}`);
    return response.data;
  },

  // Student/Admin: Close resolved complaint
  closeComplaint: async (id) => {
    const response = await api.post(`/complaints/${id}/close`);
    return response.data;
  },

  // Add comment
  addComment: async (id, comment) => {
    const response = await api.post(`/complaints/${id}/comments`, { comment });
    return response.data;
  },

  // Student: Submit Feedback
  submitFeedback: async (id, feedbackData) => {
    const response = await api.post(`/complaints/${id}/feedback`, feedbackData);
    return response.data;
  },

  // Get Feedback
  getFeedback: async (id) => {
    const response = await api.get(`/complaints/${id}/feedback`);
    return response.data;
  },

  // Admin: Get all complaints
  getAllComplaints: async (params = {}) => {
    const response = await api.get('/admin/complaints', { params });
    return response.data;
  },

  // Admin: Update status
  updateStatus: async (id, status, resolutionDetails) => {
    const response = await api.put(`/admin/complaints/${id}/status`, {
      status,
      resolutionDetails
    });
    return response.data;
  },

  // Admin: Update priority
  updatePriority: async (id, priority) => {
    const response = await api.put(`/admin/complaints/${id}/priority`, { priority });
    return response.data;
  },

  // Admin: Assign department & staff
  assignDepartmentAndStaff: async (id, { departmentId, staffId }) => {
    const response = await api.put(`/admin/complaints/${id}/assign`, {
      departmentId,
      staffId
    });
    return response.data;
  },

  // Admin: Resolve complaint
  resolveComplaint: async (id, resolutionText) => {
    const response = await api.put(`/admin/complaints/${id}/resolve`, { resolutionText });
    return response.data;
  }
};
