import React from 'react';
import { X } from 'lucide-react';
import { config } from '../../config';

const DocumentViewer = ({ document, onClose }) => {
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
          onClick={onClose}
          className="p-2 hover:bg-blue-200/50 dark:hover:bg-gray-600 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-blue-700 dark:text-blue-300" />
        </button>
      </div>

      <div className="p-8">
        {config.APP.SHOW_DOCUMENT_IMAGES && document.images && document.images.length > 0 && (
          <div className="flex justify-between items-start mb-8">
            <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
              <img
                src={`data:image/${document.images[0].type};base64,${document.images[0].data}`}
                alt="Logo gauche"
                className="h-12 object-contain"
              />
            </div>
            {document.images[1] && (
              <div className="bg-white dark:bg-gray-900 p-2 rounded-lg shadow-sm">
                <img
                  src={`data:image/${document.images[1].type};base64,${document.images[1].data}`}
                  alt="Logo droite"
                  className="h-12 object-contain"
                />
              </div>
            )}
          </div>
        )}

        {/* Informations de contact */}
        <div className="mb-8 p-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
          <div className="text-sm text-center text-blue-800 dark:text-blue-200">
            <p>2M-MANAGER – 16 rue Prosper Mérimée 11000 CARCASSONNE</p>
            <p>Tél : 04.68.77.02.81</p>
            <p>Organisme déclaré sous le n°73 65 00388 65</p>
          </div>
        </div>

        {/* Contenu principal */}
        <div className="space-y-4 bg-white dark:bg-gray-900 rounded-lg shadow-sm p-6">
          {/* Numéro de page */}
          <div className="text-right mb-4">
            <p className="text-sm text-blue-700 dark:text-blue-300">Page {document.page}</p>
          </div>

          {/* Contexte précédent */}
          {document.context_before && (
            <div className="text-blue-700 dark:text-blue-300 pb-4 border-b border-blue-100 dark:border-gray-700">
              {document.context_before.split('\n').map((line, i) => (
                line.trim() && <p key={i} className="mb-2">{line}</p>
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
                line.trim() && <p key={i} className="mb-2">{line}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentViewer;
