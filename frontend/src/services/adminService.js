import apiClient from './apiClient';

export const adminService = {
  /**
   * Real platform counts for the admin dashboard.
   */
  getStats: async () => {
    const response = await apiClient.get('/admin/stats');
    return response.data;
  },

  /**
   * Safe user list (no password hashes / credentials).
   */
  getUsers: async () => {
    const response = await apiClient.get('/admin/users');
    return response.data;
  },

  /**
   * Real analytics for the admin dashboard charts.
   */
  getAnalytics: async () => {
    const response = await apiClient.get('/admin/analytics');
    return response.data;
  },

  /**
   * Update safe user fields (full_name, role, is_active). Never password/email.
   * @param {string} id
   * @param {{full_name?: string, role?: string, is_active?: boolean}} payload
   */
  updateUser: async (id, payload) => {
    const response = await apiClient.patch(`/admin/users/${id}`, payload);
    return response.data;
  },

  // ── Universities ──
  listUniversities: async () => {
    const response = await apiClient.get('/admin/universities');
    return response.data;
  },
  createUniversity: async (payload) => {
    const response = await apiClient.post('/admin/universities', payload);
    return response.data;
  },
  updateUniversity: async (id, payload) => {
    const response = await apiClient.patch(`/admin/universities/${id}`, payload);
    return response.data;
  },
  deleteUniversity: async (id) => {
    const response = await apiClient.delete(`/admin/universities/${id}`);
    return response.data;
  },

  // ── Countries ──
  listCountries: async () => {
    const response = await apiClient.get('/admin/countries');
    return response.data;
  },

  // ── Scholarships ──
  listScholarships: async () => {
    const response = await apiClient.get('/admin/scholarships');
    return response.data;
  },
  createScholarship: async (payload) => {
    const response = await apiClient.post('/admin/scholarships', payload);
    return response.data;
  },
  updateScholarship: async (id, payload) => {
    const response = await apiClient.patch(`/admin/scholarships/${id}`, payload);
    return response.data;
  },
  deleteScholarship: async (id) => {
    const response = await apiClient.delete(`/admin/scholarships/${id}`);
    return response.data;
  },
};

export default adminService;
