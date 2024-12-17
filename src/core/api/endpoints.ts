// src/core/api/endpoints.ts

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

// Types pour l'API
export type ApiEndpoints = typeof API_ENDPOINTS;

// Helper type pour obtenir le type d'un endpoint spécifique
export type EndpointPath<
  T extends keyof ApiEndpoints,
  K extends keyof ApiEndpoints[T]
> = ApiEndpoints[T][K];

export default API_ENDPOINTS;

