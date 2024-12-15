// src/components/chat/MessageItem.jsx
import React from 'react';
import { User, Bot } from 'lucide-react';
import { useServices } from '../../providers/ServiceProvider';
import DocumentPreview from './DocumentPreview';

const MessageItem = ({ message, style, onDocumentClick }) => {
  const { services } = useServices();
  const isUser = message.type === 'user';

  const timeFormatter = new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div
      data-message-id={message.id}
      className={`flex items-start space-x-3 p-4 ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
      style={style}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 rounded-full p-2 ${
        isUser 
          ? 'bg-blue-100 dark:bg-blue-900' 
          : 'bg-green-100 dark:bg-green-900'
      }`}>
        {isUser 
          ? <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          : <Bot className="w-4 h-4 text-green-600 dark:text-green-400" />
        }
      </div>

      {/* Contenu */}
      <div className={`flex flex-col space-y-1 max-w-2xl ${
        isUser ? 'items-end' : 'items-start'
      }`}>
        {/* Bulle de message */}
        <div className={`rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-blue-500 text-white'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
        </div>

        {/* Documents attachés */}
        {message.documents?.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.documents.map((doc, index) => (
              <DocumentPreview
                key={index}
                document={doc}
                onClick={() => onDocumentClick(doc)}
              />
            ))}
          </div>
        )}

        {/* Métadonnées */}
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <span>{timeFormatter.format(new Date(message.timestamp))}</span>
          
          {message.status === 'pending' && (
            <span className="text-yellow-500">En attente</span>
          )}
          
          {message.status === 'error' && (
            <span className="text-red-500">Erreur d'envoi</span>
          )}
          
          {message.edited && <span>•</span>}
          {message.edited && <span>Modifié</span>}
          
          {!services.websocket.isConnected && message.status === 'pending' && (
            <span className="text-yellow-500">Hors ligne</span>
          )}

          {message.confidence && (
            <>
              <span>•</span>
              <span>Confiance: {(message.confidence * 100).toFixed(0)}%</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MessageItem);
