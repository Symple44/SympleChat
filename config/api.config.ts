// src/config/api.config.ts

const isDev = import.meta.env.MODE === 'development';
const apiBase = isDev ? import.meta.env.VITE_API_URL || 'http://192.168.0.15:8000' : '';

// Configuration WebSocket
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsBase = isDev 
  ? `${wsProtocol}//${import.meta.env.VITE_WS_HOST || '192.168.0.15:8000'}`
  : `${wsProtocol}//${window.location.host}`;

export const API_CONFIG = {
  BASE_URL: `${apiBase}/api`,
  WS_URL: `${wsBase}/ws`,
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  },
  ENDPOINTS: {
    CHAT: {
      SEND: '/chat',
      STREAM: '/chat/stream',
      HISTORY: '/history'
    },
    SESSION: {
      CREATE: '/sessions/new',
      GET: (id: string) => `/sessions/${id}`,
      LIST: '/sessions'
    },
    USER: {
      HISTORY: (userId: string) => `/history/user/${userId}`,
      SESSIONS: (userId: string) => `/users/${userId}/sessions`
    }
  },
  TIMEOUT: 30000,
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000,
  CACHE_DURATION: 5 * 60 * 1000 // 5 minutes
} as const;

export default API_CONFIG;
