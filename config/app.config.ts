// src/config/app.config.ts

export const APP_CONFIG = {
  NAME: "Eurêka Solutions",
  TITLE_SUFFIX: "Chat",
  
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
    } as const
  },

  UI: {
    SHOW_DOCUMENT_IMAGES: false,
    THEME: {
      DEFAULT: 'light' as const,
      STORAGE_KEY: 'theme'
    },
    ANIMATION_DURATION: 200,
    ERROR_TIMEOUT: 5000
  },

  STORAGE: {
    PREFIX: 'eureka_',
    VERSION: '1.0'
  }
} as const;

export default APP_CONFIG;
