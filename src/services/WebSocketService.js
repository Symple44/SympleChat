// src/services/WebSocketService.js
class WebSocketService {
  constructor(url) {
    this.url = url;
    this.ws = null;
    this.attempts = 0;
    this.maxAttempts = 5;
  }

  connect() {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('WebSocket connecté');
        this.attempts = 0;
      };

      this.ws.onclose = () => {
        console.log('WebSocket déconnecté');
        this.reconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Erreur WebSocket:', error);
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Erreur parsing message:', error);
        }
      };

    } catch (error) {
      console.error('Erreur connexion WebSocket:', error);
      this.reconnect();
    }
  }

  reconnect() {
    if (this.attempts >= this.maxAttempts) {
      console.log('Nombre maximum de tentatives atteint');
      return;
    }

    const delay = Math.min(1000 * Math.pow(2, this.attempts), 10000);
    console.log(`Reconnexion dans ${delay}ms...`);

    setTimeout(() => {
      this.attempts++;
      this.connect();
    }, delay);
  }

  send(message) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return true;
    }
    return false;
  }

  handleMessage(data) {
    switch (data.type) {
      case 'message':
        this.onMessage?.(data);
        break;
      case 'error':
        console.error('Erreur serveur:', data.error);
        break;
      default:
        console.log('Message reçu:', data);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new WebSocketService(import.meta.env.VITE_WS_URL);
export default wsService;
