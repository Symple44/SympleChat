// src/features/documents/types/document.ts

export interface DocumentImage {
  type: string;
  data: string;  // Base64
  width?: number;
  height?: number;
  alt?: string;
}

export interface DocumentMetadata {
  author?: string;
  createdAt: string;
  updatedAt: string;
  version?: string;
  language?: string;
  tags?: string[];
  category?: string;
  confidentiality?: 'public' | 'private' | 'confidential';
}

export interface DocumentFragment {
  source: string;
  page: number;
  text: string;
  context_before?: string;
  context_after?: string;
  images?: DocumentImage[];
  highlights?: DocumentHighlight[];
  relevance_score?: number;
}

export interface DocumentHighlight {
  text: string;
  startOffset: number;
  endOffset: number;
  color?: string;
}

export interface DocumentReference {
  id: string;
  source: string;
  page?: number;
  excerpt?: string;
  metadata?: DocumentMetadata;
}

export interface InstructionStep {
  number: number;
  title: string;
  description: string;
  substeps?: string[];
  image?: DocumentImage;
  importance?: 'low' | 'medium' | 'high';
  estimatedDuration?: number; // en minutes
}

export interface Instructions {
  title: string;
  source: string;
  page: number;
  steps: InstructionStep[];
  totalPages: number;
  metadata?: DocumentMetadata;
  prerequisite?: string[];
  tools?: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface DocumentState {
  currentDocument: DocumentFragment | null;
  loadingDocument: boolean;
  error: string | null;
}

export type DocumentViewMode = 'preview' | 'full' | 'instruction';

export interface DocumentViewerProps {
  document: DocumentFragment;
  mode?: DocumentViewMode;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  className?: string;
}

export interface DocumentPreviewProps {
  document: DocumentFragment;
  onClick?: (document: DocumentFragment) => void;
  className?: string;
}

export interface DocumentActions {
  openDocument: (document: DocumentFragment) => void;
  closeDocument: () => void;
  setError: (error: string | null) => void;
  clearState: () => void;
}

export type DocumentContextValue = DocumentState & DocumentActions;
