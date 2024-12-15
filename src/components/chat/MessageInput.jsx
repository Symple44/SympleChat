// src/components/chat/MessageInput.jsx
import React, { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, Loader2, Smile, X } from 'lucide-react';
import { useAppService } from '../../hooks/useAppService';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import { FileUpload } from '../common/FileUpload';
import { EmojiPicker } from '../common/EmojiPicker';

const MessageInput = ({ sessionId }) => {
  const [message, setMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const textareaRef = useRef(null);

  const {
    isOnline,
    isSyncing,
    sendMessage,
    stats
  } = useAppService();

  // Ajuster la hauteur du textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const perfMark = performanceMonitor.startMeasure('adjust_textarea');
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    performanceMonitor.endMeasure(perfMark);
  }, []);

  // Gérer les fichiers
  const handleFileSelect = useCallback(async (files) => {
    const perfMark = performanceMonitor.startMeasure('process_files');
    
    try {
      setAttachments(prev => [...prev, ...files]);
      setShowUpload(false);

      eventBus.emit(EventTypes.MESSAGE.FILES_ATTACHED, {
        count: files.length,
        types: files.map(f => f.type)
      });
    } catch (error) {
      console.error('Erreur traitement fichiers:', error);
      eventBus.emit(EventTypes.MESSAGE.FILE_ERROR, {
        error: error.message
      });
    } finally {
      performanceMonitor.endMeasure(perfMark);
    }
  }, []);

  // Gérer les emojis
  const handleEmojiSelect = useCallback((emoji) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage = message.slice(0, start) + emoji + message.slice(end);
    
    setMessage(newMessage);
    setShowEmojiPicker(false);

    // Replacer le curseur
    setTimeout(() => {
      textarea.selectionStart = textarea.selectionEnd = start + emoji.length;
      textarea.focus();
    });

    eventBus.emit(EventTypes.MESSAGE.EMOJI_ADDED);
  }, [message]);

  // Envoyer le message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && !attachments.length) return;

    const perfMark = performanceMonitor.startMeasure('send_message');
    
    try {
      // Préparer les fichiers
      const formData = new FormData();
      attachments.forEach(file => {
        formData.append('files', file);
      });
      formData.append('message', message.trim());
      formData.append('sessionId', sessionId);

      await sendMessage(formData);

      // Réinitialiser le formulaire
      setMessage('');
      setAttachments([]);
      adjustTextareaHeight();

      eventBus.emit(EventTypes.MESSAGE.SENT, {
        sessionId,
        hasFiles: attachments.length > 0
      });

    } catch (error) {
      console.error('Erreur envoi message:', error);
      eventBus.emit(EventTypes.MESSAGE.FAILED, {
        error: error.message
      });
    } finally {
      performanceMonitor.endMeasure(perfMark);
    }
  };

  // Gérer les raccourcis clavier
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const isDisabled = !isOnline && !stats?.offlineSupport;

  return (
    <div className="border-t dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Zone des fichiers */}
      {showUpload && (
        <div className="p-4 border-b dark:border-gray-700">
          <FileUpload
            onUpload={handleFileSelect}
            onClose={() => setShowUpload(false)}
            maxSize={5 * 1024 * 1024}
            accept=".jpg,.png,.pdf,.doc,.docx"
          />
        </div>
      )}

      {/* Liste des fichiers attachés */}
      {attachments.length > 0 && (
        <div className="px-4 py-2 border-b dark:border-gray-700">
          <div className="flex flex-wrap gap-2">
            {attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 px-2 py-1 bg-gray-100 
                         dark:bg-gray-700 rounded-lg text-sm"
              >
                <span className="truncate max-w-xs">{file.name}</span>
                <button
                  onClick={() => setAttachments(a => a.filter((_, i) => i !== index))}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {attachments.length} fichier(s) - {
              (attachments.reduce((acc, file) => acc + file.size, 0) / 1024 / 1024).toFixed(2)
            } MB
          </p>
        </div>
      )}

      {/* Formulaire principal */}
      <form onSubmit={handleSubmit} className="p-4">
        <div className="flex flex-col space-y-2">
          {/* Zone de texte */}
          <div className="flex items-end space-x-2">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  adjustTextareaHeight();
                  
                  // Émettre l'événement de frappe
                  eventBus.emit(EventTypes.MESSAGE.TYPING, {
                    sessionId,
                    typing: e.target.value.length > 0
                  });
                }}
                onKeyDown={handleKeyDown}
                onCompositionStart={() => setIsComposing(true)}
                onCompositionEnd={() => setIsComposing(false)}
                placeholder={
                  isDisabled ? "Mode hors ligne - Messages désactivés" :
                  isSyncing ? "Synchronisation en cours..." :
                  "Votre message..."
                }
                disabled={isDisabled}
                className="w-full px-4 py-2 resize-none rounded-lg border 
                         dark:border-gray-600 bg-white dark:bg-gray-700 
                         text-gray-900 dark:text-white placeholder-gray-500
                         dark:placeholder-gray-400 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 
                         disabled:opacity-50 disabled:cursor-not-allowed
                         min-h-[44px] max-h-[200px]"
                rows={1}
              />

              {/* Compteur de caractères */}
              {message.length > 0 && (
                <div className="absolute right-2 bottom-2 text-xs text-gray-500 dark:text-gray-400">
                  {message.length}/2000
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex space-x-2">
              {/* Emoji picker */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  disabled={isDisabled}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                           rounded-lg disabled:opacity-50 
                           disabled:cursor-not-allowed"
                >
                  <Smile className="w-5 h-5 text-gray-500" />
                </button>

                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2">
                    <EmojiPicker
                      onSelect={handleEmojiSelect}
                      onClose={() => setShowEmojiPicker(false)}
                    />
                  </div>
                )}
              </div>

              {/* Upload fichier */}
              <button
                type="button"
                onClick={() => setShowUpload(!showUpload)}
                disabled={isDisabled}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 
                         rounded-lg disabled:opacity-50 
                         disabled:cursor-not-allowed"
              >
                <Paperclip className="w-5 h-5 text-gray-500" />
              </button>

              {/* Bouton d'envoi */}
              <button
                type="submit"
                disabled={
                  (!message.trim() && !attachments.length) ||
                  isDisabled ||
                  isComposing
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg 
                         hover:bg-blue-700 disabled:opacity-50 
                         disabled:cursor-not-allowed flex items-center 
                         space-x-2 min-w-[100px] justify-center"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Synchronisation...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    <span>Envoyer</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Barre de formatage */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex space-x-4">
              <span>
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                  Entrée
                </kbd>
                {' '}pour envoyer
              </span>
              <span>
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                  Maj
                </kbd>
                {' + '}
                <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                  Entrée
                </kbd>
                {' '}pour nouvelle ligne
              </span>
            </div>

            {/* Indicateur de mode hors ligne */}
            {!isOnline && (
              <span className="flex items-center space-x-1 text-yellow-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>En attente de connexion</span>
              </span>
            )}
          </div>
        </div>
      </form>

      {/* Indicateur de performance */}
      {import.meta.env.DEV && stats?.performance && (
        <div className="px-4 py-1 text-xs text-gray-500 border-t dark:border-gray-700">
          Latence: {stats.performance.messageLatency}ms
        </div>
      )}
    </div>
  );
};

export default React.memo(MessageInput);
