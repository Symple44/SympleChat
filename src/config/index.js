const isDev = import.meta.env.DEV;
const HOST = isDev ? 'http://192.168.0.15:8000' : window.location.origin;

export const config = {
  API_BASE_URL: `${HOST}/api`,
  WS_URL: `${HOST.replace('http', 'ws')}/ws/chat`,
  DEFAULT_USER_ID: 'oweo'
};

export default config;