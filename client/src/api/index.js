import axios from 'axios';

export const API_BASE_URL = (location.hostname === 'localhost') ? 'http://localhost:8080' : 'https://api.sherlockhums.com/v1';
export const WS_BASE_URL = (location.hostname === 'localhost') ? 'ws://localhost:8080/ws' : 'ws://api.sherlockhums.com/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createSession = async (hostUsername) => {
  const response = await api.post('/session', { host_username: hostUsername });
  return response.data;
};

export const joinSession = async (sessionId, username) => {
  const response = await api.post('/session/join', { session_id: sessionId, username });
  return response.data;
};

export const getPlayersBySession = async (sessionId) => {
  const response = await api.get(`/session/${sessionId}/players`);
  return response.data;
};

export const startGameSubmission = async (sessionId, userId) => {
  const response = await api.post(`/session/${sessionId}/start/submission`, { session_id: sessionId, user_id: userId });
  return response.data;
}

export const songSubmission = async (sessionId, payload) => {
  const response = await api.post(`/session/${sessionId}/songs`, payload);
  return response.data;
}

export default api;
