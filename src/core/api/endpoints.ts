// src/core/api/endpoints.ts

// Définition des endpoints de l'API
// Définition des endpoints de l'API
export const API_ENDPOINTS = {
  CHAT: {
    SEND: '/chat',
    STREAM: '/chat/stream',
    HISTORY: '/chat/history'
  },
  SESSION: {
    CREATE: '/sessions/new',
    GET: (id: string) => `/sessions/${id}`,
    HISTORY: (sessionId: string) => `/history/session/${sessionId}`
  },
  USER: {
    HISTORY: (userId: string) => `/history/user/${userId}`
  },
  HEALTH: '/health'
} as const;

export type ApiEndpoints = typeof API_ENDPOINTS;

export default API_ENDPOINTS;
