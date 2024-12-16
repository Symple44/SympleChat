// src/core/socket/useWebSocket.ts

import { useState, useEffect, useCallback } from 'react';
import { socketManager } from './socket';
import type { WebSocketMessage } from './types';

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    socketManager.config.onConnect = () => setIsConnected(true);
    socketManager.config.onDisconnect = () => setIsConnected(false);
    socketManager.config.onMessage = (msg) => setLastMessage(msg);

    if (!socketManager.isConnected) {
      socketManager.connect();
    }

    return () => {
      socketManager.disconnect();
    };
  }, []);

  const send = useCallback((message: unknown) => {
    return socketManager.send(message);
  }, []);

  return {
    isConnected,
    lastMessage,
    send,
    connect: socketManager.connect.bind(socketManager),
    disconnect: socketManager.disconnect.bind(socketManager)
  };
}

export default useWebSocket;
