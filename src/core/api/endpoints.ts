// src/core/api/endpoints.ts

export const API_ENDPOINTS = {
  CHAT: {
    SEND: '/chat',
    STREAM: '/chat/stream',
    HISTORY: '/chat/history'
  },
  SESSION: {
    CREATE: '/sessions/new',
    LIST: '/sessions',
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

export interface ApiRoutes {
  chat: {
    send: typeof API_ENDPOINTS.CHAT.SEND;
    stream: typeof API_ENDPOINTS.CHAT.STREAM;
    history: typeof API_ENDPOINTS.CHAT.HISTORY;
  };
  session: {
    create: typeof API_ENDPOINTS.SESSION.CREATE;
    get: (id: string) => string;
    list: typeof API_ENDPOINTS.SESSION.LIST;
    delete: (id: string) => string;
  };
  user: {
    history: (userId: string) => string;
    sessions: (userId: string) => string;
  };
  health: typeof API_ENDPOINTS.HEALTH;
}

