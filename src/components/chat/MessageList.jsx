// src/components/chat/MessageList.jsx
import React, { useRef, useEffect, useMemo } from 'react';
import { useVirtual } from 'react-virtual';
import { useInView } from 'react-intersection-observer';
import { Bot, User, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { useAppService } from '../../hooks/useAppService';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import DocumentPreview from './DocumentPreview';
import TypingIndicator from './TypingIndicator';
import MessageSkeleton from './MessageSkeleton';

const MessageList = ({ sessionId, onDocumentClick }) => {
  const parentRef = useRef(null);
  const [bottomRef, inView] = useInView();
  const scrollPositionRef = useRef(0);

  const {
    messages,
    isLoading,
    error,
    isOnline,
    stats
  } = useAppService();

  // Virtualisation pour les performances
  const rowVirtualizer = useVirtual({
    size: messages.length,
    parentRef,
    estimateSize: useCallback(() => 100, []),
    overscan: 5,
    scrollToFn: useCallback((offset) => {
      const perfMark = performanceMonitor.startMeasure('scroll_to_position');
      parentRef.current.scrollTop = offset;
      performanceMonitor.endMeasure(perfMark);
    }, [])
  });

  // Gérer le scroll automatique
  useEffect(() => {
    if (!isLoading && messages.length > 0 && inView) {
      const perfMark = performanceMonitor.startMeasure('scroll_to_bottom');
      rowVirtualizer.scrollToIndex(messages.length - 1);
      performanceMonitor.endMeasure(perfMark);
    }
  }, [messages, isLoading, inView, rowVirtualizer]);

  // Sauvegarder la position du scroll
  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = parentRef.current.scrollTop;
    };

    const currentRef = parentRef.current;
    currentRef.addEventListener('scroll', handleScroll);
    return () => currentRef.removeEventListener('scroll', handleScroll);
  }, []);

  // Observer la lecture des messages
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const messageId = entry.target.dataset.messageId;
            if (messageId) {
              eventBus.emit(EventTypes.MESSAGE.READ, { messageId, sessionId });
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const elements = document.querySelectorAll('[data-message-id]');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, [sessionId, messages]);

  // Memoiser les groupes de messages par date
  const messageGroups = useMemo(() => {
    const groups = {};
    messages.forEach(msg => {
      const date = new Date(msg.timestamp).toLocaleDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(msg);
    });
    return groups;
  }, [messages]);

  const renderMessage = useCallback((message, index) => {
    const isUser = message.type === 'user';
    const isPending = message.status === 'pending';
    const hasError = message.status === 'error';

    return (
      <div
        key={message.id}
        data-message-id={message.id}
        className={`flex items-start space-x-3 p-4 
          ${isUser ? 'flex-row-reverse space-x-reverse' : ''} 
          ${isPending ? 'opacity-70' : ''} 
          ${hasError ? 'bg-red-50 dark:bg-red-900/10' : ''}`}
        style={rowVirtualizer.virtualItems[index]?.style}
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
          <div className={`rounded-lg px-4 py-2 ${
            isUser
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
          }`}>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {/* Documents */}
          {message.documents?.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.documents.map((doc, docIndex) => (
                <DocumentPreview
                  key={docIndex}
                  document={doc}
                  onClick={() => onDocumentClick(doc)}
                />
              ))}
            </div>
          )}

          {/* Métadonnées */}
          <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
            <span>
              {new Date(message.timestamp).toLocaleTimeString()}
            </span>
            {isPending && <span>•</span>}
            {isPending && <span>En attente</span>}
            {hasError && <span>•</span>}
            {hasError && (
              <span className="text-red-500">Erreur d'envoi</span>
            )}
            {message.edited && <span>•</span>}
            {message.edited && <span>Modifié</span>}
            {!isOnline && message.status === 'pending' && (
              <WifiOff className="w-3 h-3" />
            )}
          </div>
        </div>
      </div>
    );
  }, [isOnline, onDocumentClick]);

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full">
      {/* Indicateur hors ligne */}
      {!isOnline && (
        <div className="sticky top-0 z-10 bg-yellow-500/90 text-white px-4 py-2 text-sm text-center backdrop-blur-sm">
          <WifiOff className="w-4 h-4 inline-block mr-2" />
          Mode hors ligne - Les messages seront synchronisés une fois la connexion rétablie
        </div>
      )}

      {/* Liste des messages */}
      <div
        ref={parentRef}
        className="h-full overflow-auto"
        style={{ contain: 'strict' }}
      >
        <div
          style={{ height: `${rowVirtualizer.totalSize}px` }}
          className="relative"
        >
          {rowVirtualizer.virtualItems.map((virtualRow) => (
            renderMessage(messages[virtualRow.index], virtualRow.index)
          ))}
        </div>

        {/* Chargement */}
        {isLoading && (
          <div className="p-4 space-y-4">
            {[...Array(3)].map((_, i) => (
              <MessageSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Indicateur de frappe */}
        {stats?.typing && (
          <TypingIndicator />
        )}

        {/* Référence pour le scroll automatique */}
        <div ref={bottomRef} />
      </div>

      {/* Statistiques de performance en mode dev */}
      {import.meta.env.DEV && stats?.performance && (
        <div className="absolute bottom-4 right-4 bg-black/75 text-white text-xs rounded-lg px-2 py-1">
          FPS: {stats.performance.fps} | Messages: {messages.length}
        </div>
      )}
    </div>
  );
};

export default React.memo(MessageList);
