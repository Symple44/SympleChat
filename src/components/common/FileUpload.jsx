// src/components/common/FileUpload.jsx
import React, { useRef, useState } from 'react';
import { Upload, X, File, CheckCircle, AlertCircle } from 'lucide-react';
import { useStore } from '../../store/globalStore';
import { eventBus, EventTypes } from '../../services/events/EventBus';
import { performanceMonitor } from '../../services/performance/PerformanceMonitor';

const FileUpload = ({ 
  accept = '.pdf,.doc,.docx,.txt',
  maxSize = 5 * 1024 * 1024, // 5MB
  multiple = false,
  onUpload 
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const validateFile = (file) => {
    if (file.size > maxSize) {
      return `Le fichier ${file.name} dépasse la taille maximale autorisée`;
    }

    const allowedTypes = accept.split(',').map(type => type.trim());
    const fileExtension = `.${file.name.split('.').pop().toLowerCase()}`;
    
    if (!allowedTypes.includes(fileExtension)) {
      return `Le type de fichier ${fileExtension} n'est pas autorisé`;
    }

    return null;
  };

  const processFiles = async (fileList) => {
    const perfMark = performanceMonitor.startMeasure('file_processing');
    
    const newFiles = Array.from(fileList);
    const newErrors = {};
    const validFiles = [];

    for (const file of newFiles) {
      const error = validateFile(file);
      if (error) {
        newErrors[file.name] = error;
      } else {
        validFiles.push(file);
      }
    }

    setErrors(newErrors);
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      onUpload?.(validFiles);
      
      eventBus.emit(EventTypes.SYSTEM.INFO, {
        message: `${validFiles.length} fichier(s) ajouté(s)`,
        files: validFiles.map(f => f.name)
      });
    }

    performanceMonitor.endMeasure(perfMark);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = e.target.files;
    processFiles(selectedFiles);
  };

  const removeFile = (fileName) => {
    setFiles(prev => prev.filter(f => f.name !== fileName));
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[fileName];
      return newErrors;
    });
  };

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-colors
          ${isDragging 
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
            : 'border-gray-300 dark:border-gray-700'}`}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
        />

        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Glissez-déposez vos fichiers ici ou{' '}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-700 dark:text-blue-400"
              onClick={() => fileInputRef.current?.click()}
            >
              parcourez
            </button>
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {accept.split(',').join(', ')} jusqu'à {Math.round(maxSize / 1024 / 1024)}MB
          </p>
        </div>
      </div>

      {/* Liste des fichiers */}
      {(files.length > 0 || Object.keys(errors).length > 0) && (
        <div className="mt-4 space-y-2">
          {files.map((file) => (
            <div
              key={file.name}
              className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
            >
              <div className="flex items-center space-x-2">
                <File className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {file.name}
                </span>
                <CheckCircle className="w-4 h-4 text-green-500" />
              </div>
              <button
                onClick={() => removeFile(file.name)}
                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>
          ))}

          {/* Erreurs */}
          {Object.entries(errors).map(([fileName, error]) => (
            <div
              key={fileName}
              className="flex items-center justify-between p-2 bg-red-50 dark:bg-red-900/20 rounded"
            >
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-500" />
                <span className="text-sm text-red-700 dark:text-red-300">
                  {error}
                </span>
              </div>
              <button
                onClick={() => removeFile(fileName)}
                className="p-1 hover:bg-red-100 dark:hover:bg-red-800/20 rounded"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
