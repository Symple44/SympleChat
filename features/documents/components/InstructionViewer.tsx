// src/features/documents/components/InstructionViewer.tsx

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InstructionStep {
  number: number;
  title: string;
  description: string;
  substeps?: string[];
  image?: {
    src: string;
    alt: string;
    caption?: string;
  };
}

interface Instructions {
  title: string;
  source: string;
  page: number;
  steps: InstructionStep[];
  totalPages: number;
}

interface InstructionViewerProps {
  instructions: Instructions;
  className?: string;
}

const InstructionViewer: React.FC<InstructionViewerProps> = ({
  instructions,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(0);

  const handlePreviousPage = () => {
    setCurrentPage(prev => Math.max(0, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(instructions.totalPages - 1, prev + 1));
  };
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 ${className}`}>
      {/* En-tête du document */}
      <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
          {instructions.title}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Source: {instructions.source} (Page {instructions.page})
        </p>
      </div>

      {/* Instructions */}
      <div className="space-y-8">
        {instructions.steps.map((step) => (
          <div key={step.number} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Texte de l'instruction */}
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 mt-1">
                  {step.number}
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {step.title}
                  </h3>
                  <p className="mt-1 text-gray-600 dark:text-gray-300">
                    {step.description}
                  </p>
                </div>
              </div>
              
              {step.substeps && step.substeps.length > 0 && (
                <ul className="ml-12 space-y-2">
                  {step.substeps.map((substep, index) => (
                    <li 
                      key={index} 
                      className="text-gray-600 dark:text-gray-300 flex items-center"
                    >
                      <div className="w-2 h-2 rounded-full bg-blue-400 mr-2" />
                      {substep}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Image associée */}
            {step.image && (
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-gray-50 dark:bg-gray-900">
                <img
                  src={step.image.src}
                  alt={step.image.alt}
                  className="w-full h-auto object-contain rounded"
                />
                {step.image.caption && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center">
                    {step.image.caption}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation entre les pages */}
      {instructions.totalPages > 1 && (
        <div className="flex justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={handlePreviousPage}
            disabled={currentPage === 0}
            className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400 
                     disabled:text-gray-400 dark:disabled:text-gray-600
                     disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Page précédente
          </button>
          
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {currentPage + 1} sur {instructions.totalPages}
          </span>
          
          <button
            onClick={handleNextPage}
            disabled={currentPage === instructions.totalPages - 1}
            className="px-4 py-2 text-sm text-blue-600 dark:text-blue-400
                     disabled:text-gray-400 dark:disabled:text-gray-600
                     disabled:cursor-not-allowed flex items-center gap-2"
          >
            Page suivante
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default InstructionViewer;
