// src/config/index.js
const isDev = import.meta.env.MODE === 'development';
const apiBase = isDev ? import.meta.env.VITE_API_URL || 'http://192.168.0.15:8000' : '';

// Construction de l'URL WebSocket en fonction de l'environnement
const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsBase = isDev 
  ? `${wsProtocol}//${import.meta.env.VITE_WS_HOST || '192.168.0.15:8000'}`
  : `${wsProtocol}//${window.location.host}`;

export const config = {
  APP: {
    NAME: "Eurêka Solutions",
    TITLE_SUFFIX: "Chat",
    SHOW_DOCUMENT_IMAGES: false
  },
  API: {
    BASE_URL: `${apiBase}/api`,
    WS_URL: `${wsBase}/ws`,
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
