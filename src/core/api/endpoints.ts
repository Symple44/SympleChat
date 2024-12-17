// src/core/api/endpoints.ts

export const API_ENDPOINTS = {
  CHAT: {
    SEND: '/chat',
    STREAM: '/chat/stream',
    HISTORY: '/chat/history'
  },
  SESSION: {
    CREATE: '/sessions/new',
    GET: (id: string) => `/sessions/${id}`,
    HISTORY: (sessionId: string) => `/sessions/${sessionId}/history`
  },
  USER: {
    // Assurez-vous que cet endpoint retourne bien les données avec les IDs de session
    HISTORY: (userId: string) => `/history/user/${userId}`,
    SESSIONS: (userId: string) => `/users/${userId}/sessions`
  }
};

export type ApiEndpoints = typeof API_ENDPOINTS;

export default API_ENDPOINTS;
