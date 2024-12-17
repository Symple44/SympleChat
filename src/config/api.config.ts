// src/config/api.config.ts

const isDev = import.meta.env.MODE === 'development';

export const API_CONFIG = {
  BASE_URL: 'http://192.168.0.15:8000/api',
  WS_URL: 'ws://192.168.0.15:8000/ws',
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Origin': isDev ? 'http://localhost:3000' : 'https://chat.symple.fr'
  },
  ENDPOINTS: {
    CHAT: {
      SEND: '/chat',
      STREAM: '/chat/stream',
      HISTORY: '/chat/history'
    },
    SESSION: {
      CREATE: '/sessions/new',
      GET: (id: string) => `/sessions/${id}`,
      LIST: '/sessions',
      DELETE: (id: string) => `/sessions/${id}`
    },
    USER: {
      HISTORY: (userId: string) => `/history/user/${userId}`,
      SESSIONS: (userId: string) => `/users/${userId}/sessions`
    },
    HEALTH: '/health'
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
} as const;

export default API_CONFIG;
