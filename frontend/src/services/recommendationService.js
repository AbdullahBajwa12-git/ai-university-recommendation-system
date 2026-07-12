import apiClient from './apiClient';

export const recommendationService = {
  /**
   * Get AI-powered university recommendations
   * @param {Object} data - Full student profile data
   */
  getRecommendations: async (data) => {
    const response = await apiClient.post('/ai/recommend', data);
    return response.data;
  },

  /**
   * Get recommendation history for the current user
   */
  getHistory: async () => {
    const response = await apiClient.get('/recommendations/history');
    return response.data;
  },

  /**
   * Get a specific recommendation session by ID
   * @param {string} sessionId 
   */
  getSessionDetails: async (sessionId) => {
    const response = await apiClient.get(`/recommendations/history/${sessionId}`);
    return response.data;
  },

  /**
   * Save a university to bookmarks
   */
  saveUniversity: async (data) => {
    const response = await apiClient.post('/universities/save', data);
    return response.data;
  },

  /**
   * Get all saved universities
   */
  getSavedUniversities: async () => {
    const response = await apiClient.get('/universities/saved');
    return response.data;
  },

  /**
   * Remove a saved university
   */
  unsaveUniversity: async (id) => {
    const response = await apiClient.delete(`/universities/saved/${id}`);
    return response.data;
  },

  /**
   * Delete recommendation history
   */
  deleteHistory: async (sessionId) => {
    const response = await apiClient.delete(`/recommendations/history/${sessionId}`);
    return response.data;
  }
};

export default recommendationService;
