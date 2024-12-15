// src/components/chat/DocumentViewer.jsx
import React, { useState, useEffect } from 'react';
import { useAppService } from '../../hooks/useAppService';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import { 
  X, Download, Share2, ExternalLink, Search,
  ZoomIn, ZoomOut, RotateCw, Printer, Eye 
} from 'lucide-react';

const DocumentViewer = ({ document, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const { isOnline, stats } = useAppService();

  useEffect(() => {
    const loadDocument = async () => {
      const perfMark = performanceMonitor.startMeasure('document_load');
      setLoading(true);

      try {
        // Vérifier le cache
        const cached = await caches.match(`/api/documents/${document.id}`);
        if (cached) {
          const cachedDoc = await cached.json();
          handleDocumentLoad(cachedDoc);
          return;
        }

        // Charger depuis le serveur si en ligne
        if (isOnline) {
          const response = await fetch(`/api/documents/${document.id}`);
          if (!response.ok) throw new Error('Erreur chargement document');
          
          const docData = await response.json();
          
          // Mettre en cache
          const cache = await caches.open('documents');
          await cache.put(`/api/documents/${document.id}`, new Response(JSON.stringify(docData)));
          
          handleDocumentLoad(docData);
        } else {
          throw new Error('Document non disponible hors ligne');
        }

      } catch (error) {
        console.error('Erreur chargement document:', error);
        setError(error.message);
        
        eventBus.emit(EventTypes.DOCUMENT.LOAD_ERROR, {
          documentId: document.id,
          error: error.message
        });
      } finally {
        setLoading(false);
        performanceMonitor.endMeasure(perfMark);
      }
    };

    loadDocument();
  }, [document.id, isOnline]);

  const handleDocumentLoad = (docData) => {
    eventBus.emit(EventTypes.DOCUMENT.LOADED, {
      documentId: document.id,
      type: docData.type,
      size: docData.size
    });
  };

  const handleZoom = (delta) => {
    setZoom(prev => Math.max(0.25, Math.min(3, prev + delta)));
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`);
      if (!response.ok) throw new Error('Erreur téléchargement');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = document.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      eventBus.emit(EventTypes.DOCUMENT.DOWNLOADED, {
        documentId: document.id
      });
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      setError('Erreur lors du téléchargement');
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: document.name,
          text: 'Document partagé depuis le chat',
          url: `/documents/${document.id}`
        });
      } else {
        await navigator.clipboard.writeText(window.location.origin + `/documents/${document.id}`);
        eventBus.emit(EventTypes.UI.SHOW_TOAST, {
          message: 'Lien copié dans le presse-papier',
          type: 'success'
        });
      }
    } catch (error) {
      console.error('Erreur partage:', error);
      setError('Erreur lors du partage');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto h-full p-4 flex flex-col">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 rounded-t-lg p-4 flex items-center justify-between">
          <div className="flex-1">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {document.name}
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} sur {document.pageCount || 1}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* Actions */}
            <button
              onClick={handleDownload}
              disabled={!isOnline}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Télécharger"
            >
              <Download className="w-5 h-5" />
            </button>
            <button
              onClick={handleShare}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Rotation"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZoom(0.1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Zoom avant"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => handleZoom(-0.1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Zoom arrière"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <button
              onClick={() => window.print()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Imprimer"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="flex-1 bg-white dark:bg-gray-800 overflow-auto">
          {loading ? (
            <div className="h-full flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            </div>
          ) : error ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-red-500">
                <p className="mb-4">{error}</p>
                {!isOnline && (
                  <p className="text-sm">
                    Ce document n'est pas disponible en mode hors ligne
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div 
              className="relative h-full"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                transformOrigin: 'center center'
              }}
            >
              {/* Contenu du document selon son type */}
              {document.type === 'pdf' ? (
                <iframe
                  src={`/api/documents/${document.id}/preview`}
                  className="w-full h-full"
                  title={document.name}
                />
              ) : document.type.startsWith('image/') ? (
                <img
                  src={`/api/documents/${document.id}/preview`}
                  alt={document.name}
                  className="max-w-full h-auto mx-auto"
                />
              ) : (
                <pre className="p-4 whitespace-pre-wrap">
                  {document.content}
                </pre>
              )}
            </div>
          )}
        </div>

        {/* Footer avec métadonnées */}
        <div className="bg-white dark:bg-gray-800 rounded-b-lg p-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span>{document.type}</span>
              <span>{(document.size / 1024).toFixed(2)} KB</span>
              <span>Modifié le {new Date(document.lastModified).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>{stats?.documentViews?.[document.id] || 0} vues</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
