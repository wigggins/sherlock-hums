import axios from 'axios';
import { getRandomizedColor } from '../utils/generateRandomizedAvatar';

export const API_BASE_URL = (location.hostname === 'localhost') ? 'http://localhost:8080' : 'https://api.sherlockhums.com/v1';
export const WS_BASE_URL = (location.hostname === 'localhost') ? 'ws://localhost:8080/ws' : 'ws://api.sherlockhums.com/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createSession = async (hostUsername) => {
  const payload = { host_username: hostUsername, avatar_color: getRandomizedColor() }
  const response = await api.post('/session', payload);
  return response.data;
};

export const joinSession = async (sessionId, username) => {
  const response = await api.post('/session/join', { session_id: sessionId, username, avatar_color: getRandomizedColor() });
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

export const startGameGuessing = async (sessionId, userId) => {
  const response = await api.post(`/session/${sessionId}/start/guessing`, { user_id: userId });
  return response.data;
}

export const startRound = async (sessionId, userId, roundId) => {
  const response = await api.post(`/session/${sessionId}/round/${roundId}`, { user_id: userId });
  return response.data;
}

export const submitGuess = async (sessionId, roundId, userId, guessedUserId) => {
  const response = await api.post(`/session/${sessionId}/round/${roundId}/guess`, { user_id: userId, guessed_user_id: guessedUserId });
  return response.data;
}

export default api;
