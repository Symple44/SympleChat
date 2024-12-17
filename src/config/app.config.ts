// src/config/app.config.ts

const getBaseUrl = () => {
  // Récupère le hostname actuel pour la configuration
  //const hostname = window.location.hostname;
  const isDev = import.meta.env.DEV;

  return {
    API_BASE: isDev ? 'http://192.168.0.15:8000' : 'https://chat.symple.fr',
    WS_BASE: isDev ? 'ws://192.168.0.15:8000' : 'wss://chat.symple.fr',
    APP_BASE: isDev ? 'http://localhost:3000' : 'https://chat.symple.fr'
  };
};

const { API_BASE, WS_BASE, APP_BASE } = getBaseUrl();

export const APP_CONFIG = {
  NAME: "Eurêka Solutions",
  TITLE_SUFFIX: "Chat",
  BASE_URL: APP_BASE,
  
  CHAT: {
    DEFAULT_USER_ID: 'oweo',
    MAX_MESSAGE_LENGTH: 1000,
    DEFAULT_LANGUAGE: 'fr',
    WS_RECONNECT_DELAY: 3000,
    API_BASE_URL: API_BASE,
    WS_BASE_URL: WS_BASE
  },

  API: {
    BASE_URL: API_BASE,
    WS_URL: WS_BASE,
    TIMEOUT: 30000,
    RETRY_COUNT: 3
  },

  UI: {
    SHOW_DOCUMENT_IMAGES: false,
    THEME: {
      DEFAULT: 'light' as const,
      STORAGE_KEY: 'theme'
    },
    DEBUG: true  // Pour activer les logs
  }
} as const;

export default APP_CONFIG;
