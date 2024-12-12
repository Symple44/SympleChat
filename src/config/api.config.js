// src/config/api.config.js
const isDev = import.meta.env.MODE === 'development';
const BACKEND_HOST = isDev ? '192.168.0.15:8000' : window.location.host;
const BACKEND_PROTOCOL = isDev ? 'http' : window.location.protocol;
const WS_PROTOCOL = isDev ? 'ws' : (window.location.protocol === 'https:' ? 'wss' : 'ws');

export const API_CONFIG = {
  BASE_URL: `${BACKEND_PROTOCOL}//${BACKEND_HOST}/api`,
  WS_URL: `${WS_PROTOCOL}://${BACKEND_HOST}/ws`,
  DEFAULT_USER_ID: 'oweo',
  ENDPOINTS: {
    CHAT: '/chat',
    SESSIONS: '/sessions',
    HISTORY: '/history',
    HEALTH: '/health'
  },
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json'
  }
};

export const MESSAGE_CONFIG = {
  MAX_LENGTH: 1000,
  DEFAULT_LANGUAGE: 'fr'
};

export default API_CONFIG;
