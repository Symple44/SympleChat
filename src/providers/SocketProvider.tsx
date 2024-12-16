// src/providers/SocketProvider.tsx

import React, { createContext, useContext } from 'react';
import { useWebSocket } from '../shared/hooks/useWebSocket';
import type { 
  WebSocketEventType, 
  WebSocketMessage, 
  WebSocketPayload 
} from '../core/socket/types';
import { API_CONFIG } from '../config/api.config';

interface SocketContextValue {
  isConnected: boolean;
  error: Error | null;
  send: <T extends WebSocketEventType>(type: T, payload: WebSocketPayload<T>) => boolean;
  connect: () => void;
  disconnect: () => void;
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
  const { 
    isConnected, 
    error, 
    send, 
    connect, 
    disconnect 
  } = useWebSocket({
    url: API_CONFIG.WS_URL,
    autoReconnect: true,
    reconnectAttempts: 5,
    reconnectDelay: 3000,
    debug: process.env.NODE_ENV === 'development'
  });

  const handleSend = <T extends WebSocketEventType>(
    type: T,
    payload: WebSocketPayload<T>
  ): boolean => {
    try {
      return send(type, payload);
    } catch (error) {
      console.error('Error sending WebSocket message:', error);
      return false;
    }
  };

  const value: SocketContextValue = {
    isConnected,
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
          <button 
            onClick={connect}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reconnecter
          </button>
        </div>
      )}
    </SocketContext.Provider>
  );
};

// Composant HOC pour garantir la connexion WebSocket
export const withSocketConnection = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  return function WithSocketConnection(props: P) {
    const { isConnected } = useSocket();

    if (!isConnected) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              Connection au serveur...
            </p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
};

export default SocketProvider;
