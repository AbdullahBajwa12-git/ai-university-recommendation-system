import apiClient from './apiClient';

export const scholarshipService = {
  /**
   * Fetch active scholarships (public). Optional filters: country, level, field, search.
   * @param {Object} [params]
   */
  getScholarships: async (params = {}) => {
    const response = await apiClient.get('/scholarships', { params });
    return response.data;
  },
};

export default scholarshipService;
