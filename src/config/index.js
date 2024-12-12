// src/config/index.js
const isDev = import.meta.env.MODE === 'development';

// En production, on utilise des chemins relatifs
const API_BASE = isDev ? 'http://192.168.0.15:8000' : '';
const WS_BASE = isDev ? 'ws://192.168.0.15:8000' : 'ws://' + window.location.host;

export const config = {
  APP: {
    NAME: "Eurêka Solutions",
    TITLE_SUFFIX: "Chat",
    SHOW_DOCUMENT_IMAGES: true
  },
  API: {
    BASE_URL: `${API_BASE}/api`,
    WS_URL: `${WS_BASE}/ws`,
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
