// src/config/index.js
const isDev = import.meta.env.MODE === 'development';
const BACKEND_HOST = isDev ? '192.168.0.15:8000' : window.location.host;
const BACKEND_PROTOCOL = isDev ? 'http' : window.location.protocol;
const WS_PROTOCOL = isDev ? 'ws' : (window.location.protocol === 'https:' ? 'wss' : 'ws');

export const config = {
  API: {
    BASE_URL: `${BACKEND_PROTOCOL}//${BACKEND_HOST}/api`,
    WS_URL: `${WS_PROTOCOL}://${BACKEND_HOST}/ws`,
    ENDPOINTS: {
      CHAT: '/chat',
      SESSIONS: '/sessions',
      HISTORY: '/history',
      HEALTH: '/health'
    },
    HEADERS: {
      'Content-Type': 'application/json'
    }
  },
  CHAT: {
    DEFAULT_USER_ID: 'oweo',
    MAX_MESSAGE_LENGTH: 1000,
    DEFAULT_LANGUAGE: 'fr',
    DATE_FORMAT_OPTIONS: {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  }
};

export default config;
