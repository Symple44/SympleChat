// src/shared/types/session.ts

export interface Session {
  id: string;
  userId: string;
  status: 'active' | 'archived' | 'deleted';
  metadata: SessionMetadata;
}

export interface SessionMetadata {
  title?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  language: string;
  tags?: string[];
}

export interface SessionState {
  data: Record<string, Session>;
  currentId: string | null;
  loading: boolean;
  error: string | null;
}
