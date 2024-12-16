// src/core/api/endpoints.ts

export const API_ENDPOINTS = {
  CHAT: {
    SEND: '/chat',
  },
  SESSION: {
    CREATE: '/sessions/new',
    GET: (id: string) => `/sessions/${id}`,
    MESSAGES: (sessionId: string) => `/history/session/${sessionId}`
  },
  USER: {
    HISTORY: (userId: string) => `/history/user/${userId}`
  },
  HEALTH: '/health'
} as const;

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

export default API_ENDPOINTS;
