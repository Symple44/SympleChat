// src/components/common/ConfirmationDialog.jsx
import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useStore } from '../../store/globalStore';
import { eventBus, EventTypes } from '../../services/events/EventBus';

const ConfirmationDialog = () => {
  const {
    confirmDialog,
    hideConfirmDialog
  } = useStore(state => ({
    confirmDialog: state.confirmDialog,
    hideConfirmDialog: state.hideConfirmDialog
  }));

  if (!confirmDialog) return null;

  const { title, message, onConfirm, onCancel, confirmText = 'Confirmer', cancelText = 'Annuler' } = confirmDialog;

  const handleConfirm = () => {
    hideConfirmDialog();
    onConfirm?.();
    eventBus.emit(EventTypes.SYSTEM.INFO, {
      message: 'Action confirmée',
      action: title
    });
  };

  const handleCancel = () => {
    hideConfirmDialog();
    onCancel?.();
    eventBus.emit(EventTypes.SYSTEM.INFO, {
      message: 'Action annulée',
      action: title
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:p-0">
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75 backdrop-blur-sm"
          onClick={handleCancel}
        />

        <div className="relative inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="ml-3 w-full">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {title}
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {message}
                </p>
              </div>
            </div>
            <button
              onClick={handleCancel}
              className="ml-auto flex-shrink-0 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                       bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                       rounded-md hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                       rounded-md hover:bg-blue-700"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
