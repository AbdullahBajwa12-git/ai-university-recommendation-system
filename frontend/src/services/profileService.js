import apiClient from './apiClient';

export const profileService = {
  /**
   * Get the current student's academic profile.
   */
  getProfile: async () => {
    const response = await apiClient.get('/student/profile');
    return response.data;
  },

  /**
   * Update the current student's academic profile.
   * @param {Object} data - Profile fields (empty fields should be omitted by caller)
   */
  updateProfile: async (data) => {
    const response = await apiClient.put('/student/profile', data);
    return response.data;
  },
};

export default profileService;
