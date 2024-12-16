// src/core/api/endpoints.ts

export const API_ENDPOINTS = {
  CHAT: {
    SEND: '/chat',
    STREAM: '/chat/stream',
    HISTORY: '/chat/history',
  },
  SESSION: {
    CREATE: '/sessions/new',
    GET: (id: string) => `/sessions/${id}`,
    LIST: '/sessions',
    DELETE: (id: string) => `/sessions/${id}`,
  },
  USER: {
    HISTORY: (userId: string) => `/history/user/${userId}`,
    SESSIONS: (userId: string) => `/users/${userId}/sessions`,
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
