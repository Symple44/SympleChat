// src/providers/SocketProvider.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { socketManager } from '../core/socket/socket';
import type { WebSocketMessage } from '../core/socket/types';
import { useWebSocket } from '../shared/hooks/useWebSocket';

interface SocketContextValue {
  isConnected: boolean;
  send: (message: WebSocketMessage) => boolean;
  lastMessage: WebSocketMessage | null;
}

const SocketContext = createContext<SocketContextValue | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  useEffect(() => {
    const handleConnect = () => {
      setIsConnected(true);
      console.log('WebSocket Connected');
    };

    const handleDisconnect = () => {
      setIsConnected(false);
      console.log('WebSocket Disconnected');
    };

    const handleMessage = (message: WebSocketMessage) => {
      setLastMessage(message);
      console.log('WebSocket Message:', message);
    };

    // Configuration des événements WebSocket
    socketManager.config.onConnect = handleConnect;
    socketManager.config.onDisconnect = handleDisconnect;
    socketManager.config.onMessage = handleMessage;

    // Connexion initiale
    socketManager.connect();

    // Nettoyage lors du démontage
    return () => {
      socketManager.disconnect();
    };
  }, []);

  const value: SocketContextValue = {
    isConnected,
    send: (message) => socketManager.send(message),
    lastMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
