// src/shared/types/message.ts

import type { DocumentReference, DocumentFragment } from './document';

export interface Message {
  id: string;
  content: string;
  type: 'user' | 'assistant';
  timestamp: string;
  sessionId: string;
  metadata?: MessageMetadata;
  documents?: DocumentReference[];
  fragments?: DocumentFragment[];
  confidence?: number;
}

export interface MessageMetadata {
  edited?: boolean;
  editedAt?: string;
  readAt?: string;
  language?: string;
  context?: Record<string, unknown>;
}

export interface ChatRequest {
  user_id: string;
  query: string;
  session_id?: string;
  context?: Record<string, unknown>;
  language?: string;
  application?: string;
}

export interface ChatResponse {
  response: string;
  session_id: string;
  conversation_id: string;
  documents_used: DocumentReference[];
  confidence_score: number;
  fragments?: DocumentFragment[];
  processing_time: number;
}
