// src/store/index.ts

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { rootReducer } from './rootReducer';
import type { RootState, RootActions } from './rootReducer';

export type StoreState = RootState;
export type StoreActions = RootActions;

// Création du store avec persistance
export const useStore = create<StoreState & StoreActions>()(
  persist(
    (set, get) => ({
      ...rootReducer.initialState,
      
      // Chat actions
      setMessages: (messages) => 
        set((state) => rootReducer.chat.setMessages(state, messages)),
      
      addMessage: (message) => 
        set((state) => rootReducer.chat.addMessage(state, message)),
      
      clearMessages: () => 
        set((state) => rootReducer.chat.clearMessages(state)),
        
      // Session actions
      setCurrentSession: (session) =>
        set((state) => rootReducer.session.setCurrentSession(state, session)),
      
      setSessions: (sessions) =>
        set((state) => rootReducer.session.setSessions(state, sessions)),
        
      // UI actions
      setTheme: (isDark) =>
        set((state) => rootReducer.ui.setTheme(state, isDark)),
      
      setError: (error) =>
        set((state) => rootReducer.ui.setError(state, error)),
        
      clearError: () =>
        set((state) => rootReducer.ui.clearError(state)),
        
      // Actions communes
      resetStore: () => {
        set(rootReducer.initialState);
      },
      
      // Helper pour mettre à jour plusieurs états à la fois
      batchUpdate: (updates) => {
        set((state) => ({
          ...state,
          ...updates
        }));
      }
    }),
    {
      name: 'chat-app-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // On ne persiste que certaines parties du state
        chat: {
          messages: state.chat.messages
        },
        session: {
          currentSessionId: state.session.currentSessionId
        },
        ui: {
          theme: state.ui.theme
        }
      })
    }
  )
);

export default useStore;
