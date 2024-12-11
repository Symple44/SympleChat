// src/components/chat/DocumentViewer.jsx
import React from 'react';
import { X } from 'lucide-react';

const DocumentViewer = ({ document, onClose }) => (
  <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-lg overflow-auto">
    <div className="sticky top-0 bg-white border-b px-4 py-2 flex justify-between items-center">
      <h3 className="text-lg font-semibold">{document.source.split('/').pop()}</h3>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    <div className="p-4">
      {document.images && document.images.length > 0 && (
        <div className="mb-4 grid grid-cols-2 gap-4">
          {document.images.map((img, index) => (
            <div key={index} className="border rounded overflow-hidden">
              <img
                src={`data:image/${img.type};base64,${img.data}`}
                alt={`Document image ${index + 1}`}
                className="w-full h-auto"
              />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-4">
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {document.context_before}
        </p>
        <p className="text-base text-black font-medium whitespace-pre-line">
          {document.text}
        </p>
        <p className="text-sm text-gray-600 whitespace-pre-line">
          {document.context_after}
        </p>
      </div>
    </div>
  </div>
);

export default DocumentViewer;
