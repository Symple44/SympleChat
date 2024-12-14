// src/store/globalStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { dbCache } from '../services/storage/IndexedDBCache';
import { config } from '../config';
import { analytics } from '../services/analytics/AnalyticsService';
import { performanceMonitor } from '../services/performance/PerformanceMonitor';

const createGlobalStore = () => {
  return create(
    devtools(
      persist(
        (set, get) => ({
          // État
          messages: [],
          sessions: [],
          currentSession: null,
          isLoading: false,
          error: null,
          connected: false,
          theme: 'light',
          debug: {
            isDebugPanelOpen: false,
            performanceWarnings: []
          },

          // Actions
          setTheme: (theme) => set({ theme }),
          
          setError: (error) => {
            set({ error });
            if (error) {
              analytics.trackError(new Error(error));
              setTimeout(() => set({ error: null }), 5000);
            }
          },

          // Sessions
          loadSessions: async () => {
            set({ isLoading: true });
            try {
              const result = await performanceMonitor.measureAsync(
                'loadSessions',
                dbCache.getSessions()
              );
              
              set({ sessions: result });
              analytics.trackEvent('sessions', 'loaded', { count: result.length });
            } catch (error) {
              console.error('Erreur chargement sessions:', error);
              set({ error: 'Erreur lors du chargement des sessions' });
            } finally {
              set({ isLoading: false });
            }
          },

          createSession: async () => {
            set({ isLoading: true });
            try {
              const response = await fetch(`${config.API.BASE_URL}/api/sessions/new`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ user_id: config.CHAT.DEFAULT_USER_ID })
              });

              if (!response.ok) throw new Error('Erreur création session');

              const { session_id } = await response.json();
              const newSession = {
                session_id,
                timestamp: new Date().toISOString(),
                first_message: "Nouvelle conversation"
              };

              set(state => ({
                sessions: [newSession, ...state.sessions],
                currentSession: newSession,
                isLoading: false
              }));

              await dbCache.saveSessions([newSession]);
              analytics.trackEvent('session', 'created', { session_id });

              return session_id;
            } catch (error) {
              console.error('Erreur création session:', error);
              set({ 
                error: 'Erreur lors de la création de la session',
                isLoading: false 
              });
              return null;
            }
          },

          // Messages
          loadMessages: async (sessionId) => {
            if (!sessionId) return;

            set({ isLoading: true });
            try {
              const messages = await performanceMonitor.measureAsync(
                'loadMessages',
                dbCache.getSessionMessages(sessionId)
              );

              set({ messages });
              analytics.trackEvent('messages', 'loaded', { 
                sessionId,
                count: messages.length 
              });
            } catch (error) {
              console.error('Erreur chargement messages:', error);
              set({ error: 'Erreur lors du chargement des messages' });
            } finally {
              set({ isLoading: false });
            }
          },

          sendMessage: async (content) => {
            const { currentSession } = get();
            if (!content.trim() || !currentSession) return;

            set({ isLoading: true });
            try {
              const result = await performanceMonitor.measureAsync(
                'sendMessage',
                fetch(`${config.API.BASE_URL}/api/chat`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    user_id: config.CHAT.DEFAULT_USER_ID,
                    query: content,
                    session_id: currentSession.session_id,
                    language: config.CHAT.DEFAULT_LANGUAGE
                  })
                }).then(r => r.json())
              );

              const newMessages = [
                {
                  id: Date.now(),
                  content,
                  type: 'user',
                  timestamp: new Date().toISOString(),
                  sessionId: currentSession.session_id
                },
                {
                  id: Date.now() + 1,
                  content: result.response,
                  type: 'assistant',
                  timestamp: new Date().toISOString(),
                  documents: result.documents_used,
                  fragments: result.fragments,
                  confidence: result.confidence_score,
                  sessionId: currentSession.session_id
                }
              ];

              await dbCache.saveMessages(newMessages);
              
              set(state => ({
                messages: [...state.messages, ...newMessages],
                isLoading: false
              }));

              analytics.trackEvent('message', 'sent', {
                sessionId: currentSession.session_id
              });

            } catch (error) {
              console.error('Erreur envoi message:', error);
              set({ 
                error: 'Erreur lors de l\'envoi du message',
                isLoading: false 
              });
            }
          },

          // Debug
          toggleDebugPanel: () => 
            set(state => ({ 
              debug: { 
                ...state.debug, 
                isDebugPanelOpen: !state.debug.isDebugPanelOpen 
              } 
            })),

          addPerformanceWarning: (warning) =>
            set(state => ({
              debug: {
                ...state.debug,
                performanceWarnings: [
                  ...state.debug.performanceWarnings,
                  { ...warning, timestamp: Date.now() }
                ]
              }
            }))
        }),
        {
          name: 'chat-storage',
          partialize: (state) => ({
            sessions: state.sessions,
            theme: state.theme,
            debug: state.debug
          })
        }
      )
    )
  );
};

export const useStore = createGlobalStore();