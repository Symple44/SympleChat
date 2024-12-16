// src/features/documents/components/DocumentPreview.tsx

import React from 'react';
import { FileText, FileCode, FileImage, File } from 'lucide-react';
import type { DocumentFragment } from '../../chat/types/chat';

interface DocumentPreviewProps {
  document: DocumentFragment;
  onClick?: (document: DocumentFragment) => void;
  className?: string;
}

const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onClick,
  className = ''
}) => {
  // Déterminer l'icône en fonction du type de fichier
  const getFileIcon = () => {
    const extension = document.source.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'txt':
      case 'doc':
      case 'docx':
      case 'pdf':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'js':
      case 'ts':
      case 'jsx':
      case 'tsx':
      case 'py':
        return <FileCode className="h-5 w-5 text-green-500" />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <FileImage className="h-5 w-5 text-purple-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div 
      onClick={() => onClick?.(document)}
      className={`
        border rounded-lg p-2 bg-white dark:bg-gray-800 
        shadow-sm hover:shadow-md cursor-pointer mb-2
        transition-all duration-200
        hover:border-blue-300 dark:hover:border-blue-700
        dark:border-gray-700
        ${className}
      `}
    >
      <div className="flex items-center space-x-3">
        <div className="flex-shrink-0">
          {getFileIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
            {document.source.split('/').pop()}
          </p>
          {document.page && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Page {document.page}
            </p>
          )}
        </div>
        {document.text && (
          <div className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400">
            {document.text.length} caractères
          </div>
        )}
      </div>

      {document.text && (
        <div className="mt-2">
          <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
            {document.text}
          </p>
        </div>
      )}
    </div>
  );
};

export default DocumentPreview;
