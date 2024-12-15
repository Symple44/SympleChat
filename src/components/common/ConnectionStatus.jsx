// src/components/common/ConnectionStatus.jsx
import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useServices } from '../../providers/ServiceProvider';

const ConnectionStatus = () => {
  const { services } = useServices();
  const { websocket, sync } = services;

  if (!websocket) return null;

  return (
    <div className="px-4 py-2 flex items-center justify-center text-sm">
      {websocket.isConnected ? (
        <>
          <Wifi className="w-4 h-4 text-green-500 mr-2" />
          <span className="text-green-600">Connecté</span>
          {sync.isSyncing && (
            <>
              <RefreshCw className="w-4 h-4 text-blue-500 animate-spin ml-4 mr-2" />
              <span className="text-blue-600">Synchronisation...</span>
            </>
          )}
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4 text-red-500 mr-2" />
          <span className="text-red-600">
            Déconnecté - Mode hors ligne activé
          </span>
        </>
      )}
    </div>
  );
};

export default ConnectionStatus;
