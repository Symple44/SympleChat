// src/components/chat/DocumentPreview.jsx
import React from 'react';
import { FileText } from 'lucide-react';

const DocumentPreview = ({ document, onClick }) => (
  <div 
    className="border rounded-lg p-2 bg-white shadow-sm hover:shadow-md cursor-pointer mb-2"
    onClick={onClick}
  >
    <div className="flex items-center space-x-2">
      <div className="flex-shrink-0">
        <FileText className="h-5 w-5 text-blue-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {document.source.split('/').pop()}
        </p>
        <p className="text-xs text-gray-500">
          Page {document.page}
        </p>
      </div>
    </div>
  </div>
);

// Ajout de l'export par défaut
export default DocumentPreview;
