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
};

export default adminService;
