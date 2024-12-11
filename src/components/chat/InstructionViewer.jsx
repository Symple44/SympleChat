import { useState } from 'react';

const InstructionViewer = ({ instructions }) => {
  const [currentPage, setCurrentPage] = useState(0);
  
  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* En-tête du document */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800">
          {instructions.title}
        </h2>
        <p className="text-sm text-gray-500">
          Source: {instructions.source} (Page {instructions.page})
        </p>
      </div>

      {/* Instructions */}
      <div className="space-y-8">
        {instructions.steps.map((step, index) => (
          <div key={index} className="grid grid-cols-2 gap-6">
            {/* Texte de l'instruction */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-1">
                  {step.number}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-gray-600">{step.description}</p>
                </div>
              </div>
              {step.substeps && (
                <ul className="ml-12 space-y-2">
                  {step.substeps.map((substep, subIndex) => (
                    <li key={subIndex} className="text-gray-600 flex items-center">
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2" />
                      {substep}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Image associée */}
            {step.image && (
              <div className="border rounded-lg p-2 bg-gray-50">
                <img
                  src={step.image}
                  alt={`Étape ${step.number}`}
                  className="w-full h-auto object-contain"
                />
                {step.imageCaption && (
                  <p className="text-sm text-gray-500 mt-2 text-center">
                    {step.imageCaption}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation entre les pages si nécessaire */}
      {instructions.totalPages > 1 && (
        <div className="flex justify-between mt-6 pt-4 border-t">
          <button
            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm text-blue-600 disabled:text-gray-400"
          >
            Page précédente
          </button>
          <span className="text-sm text-gray-500">
            Page {currentPage + 1} sur {instructions.totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(instructions.totalPages - 1, p + 1))}
            disabled={currentPage === instructions.totalPages - 1}
            className="px-4 py-2 text-sm text-blue-600 disabled:text-gray-400"
          >
            Page suivante
          </button>
        </div>
      )}
    </div>
  );
};

export default InstructionViewer;
