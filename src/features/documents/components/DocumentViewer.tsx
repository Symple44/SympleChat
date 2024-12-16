// src/features/documents/components/DocumentViewer.tsx

import React from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTheme } from '../../../shared/hooks/useTheme';
import type { DocumentFragment } from '../types/document';
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
  const { isDark } = useTheme();

  const renderHeader = () => (
    <div className={`
      sticky top-0 
      ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-blue-100 border-blue-200'}
      border-b px-4 py-2 flex justify-between items-center
    `}>
      <div className="flex-1">
        <h3 className={`text-base font-semibold ${
          isDark ? 'text-blue-100' : 'text-blue-900'
        }`}>
          {document.source.split('/').pop()}
        </h3>
        {document.page && (
          <p className={`text-sm ${
            isDark ? 'text-blue-300' : 'text-blue-700'
          }`}>
            Page {document.page}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {onNavigate && (
          <>
            <button
              onClick={() => onNavigate('prev')}
              className={`p-2 rounded-lg transition-colors ${
                isDark 
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
                isDark 
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
            isDark 
              ? 'hover:bg-gray-600 text-blue-300' 
              : 'hover:bg-blue-200/50 text-blue-700'
          }`}
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className={`
      absolute inset-x-0 top-[64px] bottom-[76px] z-50 
      overflow-auto shadow-lg 
      ${isDark ? 'bg-gray-800' : 'bg-blue-50'}
      ${className}
    `}>
      {renderHeader()}

      <div className="p-8">
        {APP_CONFIG.UI.SHOW_DOCUMENT_IMAGES && document.images?.length > 0 && (
          <div className="flex justify-between items-start mb-8">
            {document.images.map((image, index) => (
              <div key={index} className={`
                p-2 rounded-lg ${
                  isDark ? 'bg-gray-900' : 'bg-white'
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

        {document.text.split('\n').map((line, i) => (
          line.trim() && (
            <p key={i} className={`mb-2 ${
              isDark ? 'text-blue-50' : 'text-blue-900'
            }`}>
              {line}
            </p>
          )
        ))}
      </div>
    </div>
  );
};

export default DocumentViewer;
