// src/features/chat/types/chat.ts

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

export interface ChatRequest {
  user_id: string;
  query: string;
  session_id?: string;
  context?: Record<string, unknown>;
  language?: string;
  application?: string;
}

export interface MessageMetadata {
  edited?: boolean;
  editedAt?: string;
  readAt?: string;
  language?: string;
  context?: Record<string, unknown>;
}

export interface DocumentReference {
  id: string;
  source: string;
  page?: number;
  excerpt?: string;
}

export interface DocumentImage {
  type: string;
  data: string;
  alt?: string;
}

export interface DocumentFragment {
  source: string;
  page: number;
  text: string;
  context_before?: string;
  context_after?: string;
  images?: DocumentImage[];
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentSessionId: string | null;
}

export interface SendMessageOptions {
  sessionId?: string;
  metadata?: MessageMetadata;
  useStream?: boolean;
}

export interface ChatContextValue {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  currentSessionId: string | null;
  sendMessage: (content: string) => Promise<void>;
}
