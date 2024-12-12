// src/config/index.js
const isDev = import.meta.env.MODE === 'development';
const BACKEND_HOST = '192.168.0.15:8000';
const FRONTEND_HOST = window.location.host;
const BACKEND_PROTOCOL = 'http';
const WS_PROTOCOL = 'ws';

export const config = {
  APP: {
    NAME: "Eurêka Solutions",
    TITLE_SUFFIX: "Chat"  // Pour construire des titres comme "CM Manager Chat"
  },
  API: {
    BASE_URL: `${BACKEND_PROTOCOL}://${BACKEND_HOST}/api`,
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
    WS_RECONNECT_DELAY: 3000,
    DATE_FORMAT_OPTIONS: {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }
  }
};

if (isDev) {
  console.log('Configuration chargée:', config);
}

export default config;
