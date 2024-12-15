// src/components/chat/DocumentViewer.jsx
import React from 'react';
import { X } from 'lucide-react';
import { useStore } from '../../store/globalStore';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import { analytics } from '../../services/analytics/AnalyticsService';
import { config } from '../../config';

const DocumentViewer = ({ document, onClose }) => {
  const theme = useStore(state => state.theme);

  const handleClose = () => {
    onClose();
    eventBus.emit(EventTypes.SYSTEM.INFO, {
      message: 'Document fermé',
      documentId: document.id
    });
  };

  React.useEffect(() => {
    analytics.trackEvent('document', 'viewed', {
      documentId: document.id,
      source: document.source
    });
  }, [document]);

  return (
    <div className="absolute inset-x-0 top-[64px] bottom-[76px] z-50 overflow-auto shadow-lg bg-blue-50 dark:bg-gray-800">
      <div className="sticky top-0 bg-blue-100 dark:bg-gray-700 border-b border-blue-200 dark:border-gray-600 px-4 py-2 flex justify-between items-center">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-blue-900 dark:text-blue-100">
            {document.source.split('/').pop()}
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">Page {document.page}</p>
        </div>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-blue-200/50 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-blue-700 dark:text-blue-300" />
        </button>
      </div>

      <div className="p-8">
        {config.APP.SHOW_DOCUMENT_IMAGES && document.images && document.images.length > 0 && (
          <div className="flex justify-between items-start mb-8">
            {document.images.map((image, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
                <img
                  src={`data:image/${image.type};base64,${image.data}`}
                  alt={`Image ${index + 1}`}
                  className="h-12 object-contain"
                />
              </div>
            ))}
          </div>
        )}

        <div className="space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          {document.text.split('\n').map((line, i) => (
            line.trim() && (
              <p key={i} className={`mb-2 ${
                line.match(/^\d+[\.\)]/) ? 'font-semibold' : ''
              } text-blue-900 dark:text-blue-50`}>
                {line}
              </p>
            )
          ))}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
