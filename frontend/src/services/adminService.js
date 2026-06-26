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
};

export default adminService;
