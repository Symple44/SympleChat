// src/shares/types/document.ts

export interface DocumentReference {
  id: string;
  source: string;
  page?: number;
  excerpt?: string;
}

export interface DocumentFragment {
  text: string;
  page_num: number;
  images: DocumentImage[];
  confidence: number;
  source: string;
  context_before: string;
  context_after: string;
}

export interface DocumentImage {
  type: string;
  data: string;
  alt?: string;
}

export interface DocumentMetadata {
  author?: string;
  createdAt: string;
  updatedAt: string;
  version?: string;
  language?: string;
  tags?: string[];
}
