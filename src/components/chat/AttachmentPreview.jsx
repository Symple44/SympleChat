// src/components/chat/AttachmentPreview.jsx
import React, { useState, useEffect } from 'react';
import { X, FileText, Image, File, AlertCircle, Eye } from 'lucide-react';
import { useServices } from '../../providers/ServiceProvider';
import { eventBus, EventTypes } from '../../services/events/EventBus';

const AttachmentPreview = ({ attachment, onRemove }) => {
  const { services } = useServices();
  const [previewError, setPreviewError] = useState(false);
  const [loading, setLoading] = useState(true);

  const { file, preview } = attachment;
  const isImage = file.type.startsWith('image/');

  useEffect(() => {
    const validateAttachment = async () => {
      try {
        setLoading(true);
        // Vérifier l'intégrité du fichier
        await services.app.validateFile(file);
        
        // Générer la prévisualisation si nécessaire
        if (isImage && !preview) {
          const newPreview = await services.app.generateImagePreview(file);
          attachment.preview = newPreview;
        }
      } catch (error) {
        console.error('Erreur validation fichier:', error);
        setPreviewError(true);
        eventBus.emit(EventTypes.MESSAGE.FILE_ERROR, {
          fileName: file.name,
          error: error.message
        });
      } finally {
        setLoading(false);
      }
    };

    validateAttachment();
  }, [file, preview, isImage, services.app, attachment]);

  const handlePreview = () => {
    if (previewError) return;

    services.app.previewFile(file).catch(error => {
      console.error('Erreur prévisualisation:', error);
      services.app.showToast({
        type: 'error',
        message: 'Erreur lors de la prévisualisation'
      });
    });
  };

  return (
    <div className={`relative group flex items-center p-2 rounded-lg border 
                    ${previewError 
                      ? 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                      : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'}`}>
      {/* Aperçu ou icône */}
      <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden">
        {loading ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent" />
          </div>
        ) : isImage && preview && !previewError ? (
          <img
            src={preview}
            alt={file.name}
            className="w-full h-full object-cover"
            onClick={handlePreview}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-700">
            {previewError ? (
              <AlertCircle className="w-6 h-6 text-red-500" />
            ) : file.type.includes('pdf') ? (
              <FileText className="w-6 h-6 text-blue-500" />
            ) : file.type.includes('image') ? (
              <Image className="w-6 h-6 text-green-500" />
            ) : (
              <File className="w-6 h-6 text-gray-500" />
            )}
          </div>
        )}
      </div>

      {/* Informations */}
      <div className="ml-3 flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {(file.size / 1024).toFixed(1)} KB
        </p>
        {previewError && (
          <p className="text-xs text-red-500 mt-1">
            Erreur lors du traitement du fichier
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="ml-2 flex items-center space-x-2">
        {!previewError && (
          <button
            onClick={handlePreview}
            className="p-1 text-gray-500 hover:text-gray-700 
                     dark:text-gray-400 dark:hover:text-gray-300"
          >
            <Eye className="w-4 h-4" />
          </button>
        )}
        <button
          onClick={onRemove}
          className="p-1 text-gray-500 hover:text-gray-700 
                   dark:text-gray-400 dark:hover:text-gray-300"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Barre de progression pour le chargement */}
      {loading && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700">
          <div className="h-full bg-blue-500 animate-pulse" />
        </div>
      )}
    </div>
  );
};

export default React.memo(AttachmentPreview);
