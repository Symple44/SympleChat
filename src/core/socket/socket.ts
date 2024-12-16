// src/core/socket/socket.ts

import { API_CONFIG } from '../../config/api.config';

interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
}

export class WebSocketManager {
  public config: Required<WebSocketConfig>;
  private socket: WebSocket | null = null;
  private reconnectCount = 0;
  private reconnectTimeout: number | null = null;

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectAttempts: 5,
      reconnectDelay: 3000,
      onMessage: () => {},
      onConnect: () => {},
      onDisconnect: () => {},
      onError: () => {},
      ...config
    };
  }

  public connect(): void {
    if (this.socket?.readyState === WebSocket.OPEN) return;

    try {
      this.socket = new WebSocket(this.config.url);
      this.setupEventListeners();
    } catch (error) {
      console.error('WebSocket connection error:', error);
      this.handleReconnect();
    }
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.onopen = () => {
      this.reconnectCount = 0;
      this.config.onConnect();
      console.log('WebSocket connected');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        this.config.onMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    this.socket.onclose = () => {
      this.config.onDisconnect();
      this.handleReconnect();
      console.log('WebSocket disconnected');
    };

    this.socket.onerror = (error: Event) => {
      this.config.onError(error);
      console.error('WebSocket error:', error);
    };
  }

  private handleReconnect(): void {
    if (this.reconnectCount >= this.config.reconnectAttempts) {
      console.error('Max reconnection attempts reached');
      return;
    }

    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
    }

    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectCount++;
      console.log(`Reconnection attempt ${this.reconnectCount}`);
      this.connect();
    }, this.config.reconnectDelay);
  }

  public send(message: unknown): boolean {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      console.error('WebSocket is not connected');
      return false;
    }

    try {
      const data = typeof message === 'string' ? message : JSON.stringify(message);
      this.socket.send(data);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  public disconnect(): void {
    if (this.reconnectTimeout) {
      window.clearTimeout(this.reconnectTimeout);
    }

    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  public get isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }
}

// Instance par défaut
export const socketManager = new WebSocketManager({
  url: API_CONFIG.WS_URL
});

export default socketManager;