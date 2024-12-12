const isDev = import.meta.env ? import.meta.env.DEV : false;
const HOST = isDev ? 'http://192.168.0.15:8000' : window.location.origin;

export const config = {
  API_BASE_URL: `${HOST}/api`,
  WS_URL: isDev 
    ? 'ws://192.168.0.15:8000/ws/chat'
    : `ws://${window.location.hostname}:3000/ws/chat`,
  DEFAULT_USER_ID: 'oweo'
};

export default config;
