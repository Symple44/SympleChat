const isDev = import.meta.env ? import.meta.env.DEV : false;
const BACKEND_HOST = '192.168.0.15:8000';
const HOST = isDev ? `http://${BACKEND_HOST}` : window.location.origin;

export const config = {
  API_BASE_URL: isDev ? `${HOST}/api` : `http://${BACKEND_HOST}/api`,
  WS_URL: `ws://${BACKEND_HOST}/ws/chat`,  // Toujours pointer vers le backend
  DEFAULT_USER_ID: 'oweo'
};

export default config;
