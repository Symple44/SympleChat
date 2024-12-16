// src/features/documents/components/DocumentViewer.tsx

import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useStore } from '../../../store';
import { DocumentFragment } from '../../../features/chat/types/chat';
import { APP_CONFIG } from '../../../config/app.config';

interface DocumentViewerProps {
  document: DocumentFragment;
  onClose: () => void;
  onNavigate?: (direction: 'prev' | 'next') => void;
  className?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onClose,
  onNavigate,
  className = ''
}) => {
  const theme = useStore(state => state.ui.theme);

  return (
    <div className={`
      absolute inset-x-0 top-[64px] bottom-[76px] z-50 
      overflow-auto shadow-lg 
      ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'}
      ${className}
    `}>
      {/* Header */}
      <div className={`
        sticky top-0 
        ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-blue-100 border-blue-200'}
        border-b px-4 py-2 flex justify-between items-center
      `}>
        <div className="flex-1">
          <h3 className={`text-base font-semibold ${
            theme === 'dark' ? 'text-blue-100' : 'text-blue-900'
          }`}>
            {document.source.split('/').pop()}
          </h3>
          {document.page && (
            <p className={`text-sm ${
              theme === 'dark' ? 'text-blue-300' : 'text-blue-700'
            }`}>
              Page {document.page}
            </p>
          )}
        </div>
        
        {/* Navigation buttons */}
        <div className="flex items-center space-x-2">
          {onNavigate && (
            <>
              <button
                onClick={() => onNavigate('prev')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-600 text-blue-300' 
                    : 'hover:bg-blue-200/50 text-blue-700'
                }`}
                title="Document précédent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => onNavigate('next')}
                className={`p-2 rounded-lg transition-colors ${
                  theme === 'dark' 
                    ? 'hover:bg-gray-600 text-blue-300' 
                    : 'hover:bg-blue-200/50 text-blue-700'
                }`}
                title="Document suivant"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
          
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ml-4 ${
              theme === 'dark' 
                ? 'hover:bg-gray-600 text-blue-300' 
                : 'hover:bg-blue-200/50 text-blue-700'
            }`}
            title="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-8">
        {APP_CONFIG.UI.SHOW_DOCUMENT_IMAGES && document.images?.length > 0 && (
          <div className="flex justify-between items-start mb-8">
            {document.images.map((image, index) => (
              <div key={index} className={`
                p-2 rounded-lg ${
                  theme === 'dark' ? 'bg-gray-900' : 'bg-white'
                } shadow-sm
              `}>
                <img
                  src={`data:image/${image.type};base64,${image.data}`}
                  alt={image.alt || 'Document image'}
                  className="h-12 object-contain"
                />
              </div>
            ))}
          </div>
        )}

        {/* Document content */}
        {document.context_before && (
          <div className={`pb-4 border-b ${
            theme === 'dark' 
              ? 'text-blue-300 border-gray-700' 
              : 'text-blue-700 border-blue-100'
          }`}>
            {document.context_before.split('\n').map((line, i) => (
              line.trim() && <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        )}

        <div className={`py-4 ${
          theme === 'dark' ? 'text-blue-50' : 'text-blue-900'
        }`}>
          {document.text.split('\n').map((line, i) => (
            line.trim() && (
              <p key={i} className={`mb-2 ${
                line.match(/^\d+[\.\)]/) ? 'font-semibold' : ''
              }`}>
                {line}
              </p>
            )
          ))}
        </div>

        {document.context_after && (
          <div className={`pt-4 border-t ${
            theme === 'dark' 
              ? 'text-blue-300 border-gray-700' 
              : 'text-blue-700 border-blue-100'
          }`}>
            {document.context_after.split('\n').map((line, i) => (
              line.trim() && <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;