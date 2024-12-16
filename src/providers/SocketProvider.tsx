// src/providers/SocketProvider.tsx

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useWebSocket } from '../shared/hooks/useWebSocket';
import type { WebSocketMessage } from '../core/socket/types';

interface SocketContextValue {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  error: Error | null;
  send: (message: unknown) => boolean;
  connect: () => void;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextValue | null>(null);

interface SocketProviderProps {
  children: React.ReactNode;
}

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const { isConnected, error, send, connect, disconnect } = useWebSocket();

  useEffect(() => {
    // Connexion initiale
    if (!isConnected) {
      connect();
    }

    // Nettoyage lors du démontage
    return () => {
      disconnect();
    };
  }, [isConnected, connect, disconnect]);

  // Gestion des messages
  const handleSend = (message: unknown): boolean => {
    try {
      return send(message);
    } catch (error) {
      console.error('Erreur envoi message socket:', error);
      return false;
    }
  };

  const value: SocketContextValue = {
    isConnected,
    lastMessage,
    error,
    send: handleSend,
    connect,
    disconnect
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
      {error && (
        <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg">
          <p className="font-bold">Erreur de connexion</p>
          <p>{error.message}</p>
        </div>
      )}
    </SocketContext.Provider>
  );
};

export default SocketProvider;
