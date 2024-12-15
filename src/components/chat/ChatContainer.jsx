// src/components/chat/ChatContainer.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useServices } from '../../providers/ServiceProvider';
import { useModals } from '../../hooks/useModals';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import ChatHeader from './ChatHeader';
import FileUploadZone from './FileUploadZone';
import ConnectionStatus from '../common/ConnectionStatus';

const ChatContainer = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { services, initialized } = useServices();
  const { openModal } = useModals();

  const [state, setState] = useState({
    messages: [],
    loading: true,
    error: null,
    uploadActive: false
  });

  // Initialiser la session
  useEffect(() => {
    const initSession = async () => {
      if (!sessionId || !initialized) return;

      const perfMark = services.performance.startMeasure('init_session');

      try {
        // Charger la session depuis le cache d'abord
        const cachedSession = await services.app.loadCachedSession(sessionId);
        if (cachedSession) {
          setState(prev => ({
            ...prev,
            messages: cachedSession.messages,
            loading: false
          }));
        }

        // Charger les données fraîches si en ligne
        if (services.websocket.isConnected) {
          const sessionData = await services.app.loadSession(sessionId);
          setState(prev => ({
            ...prev,
            messages: sessionData.messages,
            loading: false
          }));

          // Mettre en cache
          await services.app.cacheSession(sessionData);
        }

        // Indexer les messages pour la recherche
        services.queue.addTask('indexing', async () => {
          await services.search.indexMessages(sessionData.messages);
        }, services.queue.priorities.LOW);

        eventBus.emit(EventTypes.SESSION.LOADED, {
          sessionId,
          messageCount: sessionData.messages.length
        });

      } catch (error) {
        console.error('Erreur chargement session:', error);
        setState(prev => ({
          ...prev,
          error: 'Erreur lors du chargement de la session',
          loading: false
        }));

        // Rediriger vers une nouvelle session si celle-ci n'existe pas
        if (error.code === 'SESSION_NOT_FOUND') {
          const newSession = await services.app.createSession();
          navigate(`/session/${newSession.id}`, { replace: true });
        }
      } finally {
        services.performance.endMeasure(perfMark);
      }
    };

    initSession();
  }, [sessionId, initialized, services, navigate]);

  // Gérer l'envoi des messages
  const handleSendMessage = useCallback(async (content, attachments = []) => {
    const perfMark = services.performance.startMeasure('send_message');

    try {
      // Ajouter à la file d'attente avec haute priorité
      await services.queue.addTask('messages', async () => {
        // Préparer les fichiers si présents
        let uploadedFiles = [];
        if (attachments.length > 0) {
          uploadedFiles = await Promise.all(
            attachments.map(file => services.app.uploadFile(file))
          );
        }

        // Créer le message
        const message = await services.app.sendMessage({
          sessionId,
          content,
          files: uploadedFiles,
          offline: !services.websocket.isConnected
        });

        // Mettre à jour l'état local immédiatement
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, message]
        }));

        // Mettre à jour le cache
        await services.app.cacheMessage(message);

        // Indexer le nouveau message
        await services.search.indexMessages([message]);

        eventBus.emit(EventTypes.MESSAGE.SENT, {
          messageId: message.id,
          sessionId,
          hasAttachments: attachments.length > 0
        });

        return message;
      }, services.queue.priorities.HIGH);

    } catch (error) {
      console.error('Erreur envoi message:', error);
      setState(prev => ({
        ...prev,
        error: 'Erreur lors de l\'envoi du message'
      }));

      eventBus.emit(EventTypes.MESSAGE.FAILED, {
        sessionId,
        error: error.message
      });
    } finally {
      services.performance.endMeasure(perfMark);
    }
  }, [sessionId, services]);

  // Gérer le glisser-déposer de fichiers
  const handleFileDrop = useCallback((files) => {
    setState(prev => ({ ...prev, uploadActive: true }));
    
    // Vérifier les fichiers
    const validFiles = files.filter(file => {
      const isValid = file.size <= 10 * 1024 * 1024; // 10MB max
      if (!isValid) {
        eventBus.emit(EventTypes.UI.SHOW_TOAST, {
          type: 'error',
          message: `${file.name} est trop volumineux (max 10MB)`
        });
      }
      return isValid;
    });

    if (validFiles.length > 0) {
      handleSendMessage('', validFiles);
    }

    setState(prev => ({ ...prev, uploadActive: false }));
  }, [handleSendMessage]);

  // Gérer les raccourcis clavier
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Ctrl/Cmd + F pour la recherche
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        openModal('search');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [openModal]);

  if (!initialized) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <ChatHeader 
        sessionId={sessionId}
        onSearchClick={() => openModal('search')}
      />

      <ConnectionStatus />

      <div className="flex-1 relative">
        <FileUploadZone
          active={state.uploadActive}
          onDrop={handleFileDrop}
          className="absolute inset-0 z-10"
        >
          <MessageList 
            messages={state.messages}
            loading={state.loading}
            error={state.error}
            onDocumentClick={(doc) => openModal('documentViewer', { document: doc })}
          />
        </FileUploadZone>
      </div>

      <MessageInput 
        onSend={handleSendMessage}
        disabled={state.loading || !services.websocket.isConnected}
      />
    </div>
  );
};

export default ChatContainer;
