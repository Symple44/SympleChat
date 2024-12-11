import React from 'react';
import { X } from 'lucide-react';

const DocumentViewer = ({ document, onClose }) => (
  <div className="fixed right-0 top-0 h-full w-1/2 bg-white shadow-lg overflow-auto">
    {/* Header avec le titre et le bouton de fermeture */}
    <div className="sticky top-0 bg-white border-b px-4 py-2 flex justify-between items-center">
      <div className="flex-1">
        <h3 className="text-base font-semibold text-gray-700">
          {document.source.split('/').pop()}
        </h3>
        <p className="text-sm text-gray-500">Page {document.page}</p>
      </div>
      <button
        onClick={onClose}
        className="p-1 hover:bg-gray-100 rounded-full"
      >
        <X className="w-5 h-5" />
      </button>
    </div>

    {/* Contenu du document */}
    <div className="p-8">
      {/* En-tête du document avec logo */}
      {document.images && document.images.length > 0 && (
        <div className="flex justify-between items-start mb-8">
          <img
            src={`data:image/${document.images[0].type};base64,${document.images[0].data}`}
            alt="Logo gauche"
            className="h-12 object-contain"
          />
          {document.images[1] && (
            <img
              src={`data:image/${document.images[1].type};base64,${document.images[1].data}`}
              alt="Logo droite"
              className="h-12 object-contain"
            />
          )}
        </div>
      )}

      {/* Informations de contact */}
      <div className="text-sm text-center mb-8">
        <p>2M-MANAGER – 16 rue Prosper Mérimée 11000 CARCASSONNE</p>
        <p>Tél : 04.68.77.02.81</p>
        <p>Organisme déclaré sous le n°73 65 00388 65</p>
      </div>

      {/* Numéro de page */}
      <div className="text-right mb-8">
        <p className="text-sm">Page {document.page}</p>
      </div>

      {/* Contenu principal */}
      <div className="space-y-6">
        {/* Contexte précédent */}
        {document.context_before && (
          <div className="text-gray-600">
            {document.context_before.split('\n').map((line, i) => (
              line.trim() && <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        )}

        {/* Texte principal */}
        <div className="text-black">
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
          <div className="text-gray-600">
            {document.context_after.split('\n').map((line, i) => (
              line.trim() && <p key={i} className="mb-2">{line}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default DocumentViewer;
