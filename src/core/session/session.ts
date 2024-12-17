// src/core/session/session.ts

import { apiClient } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';
import type { Session, SessionMetadata } from './types';

export class SessionManager {
  private currentSession: Session | null = null;

  async createSession(userId: string): Promise<Session> {
    try {
      const response = await apiClient.post<Session>(API_ENDPOINTS.SESSION.CREATE, {
        user_id: userId
      });

      this.currentSession = response;
      this.saveToStorage(response);
      return response;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getSession(sessionId: string): Promise<Session> {
    try {
      const response = await apiClient.get<Session>(
        API_ENDPOINTS.SESSION.GET(sessionId)
      );
      return response;
    } catch (error) {
      console.error('Error fetching session:', error);
      throw error;
    }
  }

  async getUserSessions(userId: string): Promise<Session[]> {
    try {
      const response = await apiClient.get<Session[]>(
        API_ENDPOINTS.USER.HISTORY(userId)
      );
      return response;
    } catch (error) {
      console.error('Error fetching user sessions:', error);
      throw error;
    }
  }

  async updateSessionMetadata(
    sessionId: string, 
    metadata: Partial<SessionMetadata>
  ): Promise<Session> {
    try {
      const response = await apiClient.put<Session>(
        API_ENDPOINTS.SESSION.GET(sessionId),
        { metadata }
      );
      
      if (this.currentSession?.id === sessionId) {
        this.currentSession = response;
        this.saveToStorage(response);
      }
      
      return response;
    } catch (error) {
      console.error('Error updating session metadata:', error);
      throw error;
    }
  }

  private saveToStorage(session: Session): void {
    try {
      localStorage.setItem('currentSession', JSON.stringify(session));
    } catch (error) {
      console.error('Error saving session to storage:', error);
    }
  }

  loadFromStorage(): Session | null {
    try {
      const stored = localStorage.getItem('currentSession');
      if (stored) {
        this.currentSession = JSON.parse(stored);
      }
      return this.currentSession;
    } catch (error) {
      console.error('Error loading session from storage:', error);
      return null;
    }
  }

  clearSession(): void {
    this.currentSession = null;
    localStorage.removeItem('currentSession');
  }

  getCurrentSession(): Session | null {
    return this.currentSession;
  }
}

export const sessionManager = new SessionManager();
export default sessionManager;
