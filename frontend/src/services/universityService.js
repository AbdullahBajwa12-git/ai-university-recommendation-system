import apiClient from './apiClient';

export const universityService = {
  /**
   * Fetch the full university catalog.
   */
  getUniversities: async () => {
    const response = await apiClient.get('/universities');
    return response.data;
  },

  /**
   * Fetch a single university by its id.
   * @param {string} id
   */
  getUniversityById: async (id) => {
    const response = await apiClient.get(`/universities/${id}`);
    return response.data;
  },
};

export default universityService;
