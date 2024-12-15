// src/features/documents/components/DocumentViewer.tsx

import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { DocumentFragment } from '../../chat/types/chat';

interface DocumentViewerProps {
  document: DocumentFragment;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onClose,
  onNext,
  onPrevious,
  className = ''
}) => {
  return (
    <div className={`
      absolute inset-x-0 top-[64px] bottom-[76px] z-50 
      overflow-auto shadow-lg 
      bg-blue-50 dark:bg-gray-800
      ${className}
    `}>
      {/* Header */}
      <div className="sticky top-0 bg-blue-100 dark:bg-gray-700 border-b border-blue-200 dark:border-gray-600 px-4 py-2 flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100">
            {document.source.split('/').pop()}
          </h3>
          {document.page && (
            <p className="text-sm text-blue-700 dark:text-blue-300">
              Page {document.page}
            </p>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          {onPrevious && (
            <button
              onClick={onPrevious}
              className="p-2 hover:bg-blue-200/50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Page précédente"
            >
              <ChevronLeft className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </button>
          )}
          
          {onNext && (
            <button
              onClick={onNext}
              className="p-2 hover:bg-blue-200/50 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title="Page suivante"
            >
              <ChevronRight className="w-5 h-5 text-blue-700 dark:text-blue-300" />
            </button>
          )}
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-blue-200/50 dark:hover:bg-gray-600 rounded-lg transition-colors ml-4"
            title="Fermer"
          >
            <X className="w-5 h-5 text-blue-700 dark:text-blue-300" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {/* Contexte précédent */}
        {document.context_before && (
          <div className="text-blue-700 dark:text-blue-300 pb-4 border-b border-blue-100 dark:border-gray-700">
            {document.context_before.split('\n').map((line, i) => (
              line.trim() && (
                <p key={i} className="mb-2">{line}</p>
              )
            ))}
          </div>
        )}

        {/* Texte principal */}
        <div className="text-blue-900 dark:text-blue-50 py-4">
          {document.text.split('\n').map((line, i) => (
            line.trim() && (
              <p 
                key={i} 
                className={`mb-2 ${line.match(/^\d+[\.\)]/) ? 'font-semibold' : ''}`}
              >
                {line}
              </p>
            )
          ))}
        </div>

        {/* Contexte suivant */}
        {document.context_after && (
          <div className="text-blue-700 dark:text-blue-300 pt-4 border-t border-blue-100 dark:border-gray-700">
            {document.context_after.split('\n').map((line, i) => (
              line.trim() && (
                <p key={i} className="mb-2">{line}</p>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
