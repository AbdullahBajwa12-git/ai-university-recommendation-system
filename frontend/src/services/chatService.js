import apiClient from './apiClient';

const chatService = {
  /** Fetch all saved sessions for the current user (newest first) */
  getSessions: async () => {
    const { data } = await apiClient.get('/chat-sessions');
    return data;
  },

  /** Save a completed chat session */
  saveSession: async ({ title, messages }) => {
    const { data } = await apiClient.post('/chat-sessions', {
      title,
      messages: messages
        .filter((m) => m.role !== 'welcome')
        .map((m) => ({ role: m.role, text: m.text })),
    });
    return data;
  },

  /** Delete a session by ID */
  deleteSession: async (sessionId) => {
    const { data } = await apiClient.delete(`/chat-sessions/${sessionId}`);
    return data;
  },
};

export default chatService;
