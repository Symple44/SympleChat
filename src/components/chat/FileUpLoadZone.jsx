// src/components/chat/FileUploadZone.jsx
import React, { useCallback } from 'react';
import { Upload } from 'lucide-react';
import { useServices } from '../../providers/ServiceProvider';
import { eventBus, EventTypes } from '../../services/events/EventBus';

const FileUploadZone = ({ children, active, onDrop, className = '' }) => {
  const { services } = useServices();

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    // Vérifier si le service est disponible
    if (!services.app.isFileUploadAvailable) {
      eventBus.emit(EventTypes.UI.SHOW_TOAST, {
        type: 'error',
        message: 'Upload de fichiers non disponible pour le moment'
      });
      return;
    }

    const files = Array.from(e.dataTransfer.files);
    onDrop?.(files);
  }, [services.app.isFileUploadAvailable, onDrop]);

  return (
    <div
      className={`relative ${className}`}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {active && (
        <div className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm 
                     border-2 border-dashed border-blue-500 rounded-lg
                     flex items-center justify-center z-50">
          <div className="text-center">
            <Upload className="w-12 h-12 text-blue-500 mx-auto mb-2" />
            <p className="text-blue-600 font-medium">
              Déposez vos fichiers ici
            </p>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};

export default FileUploadZone;
