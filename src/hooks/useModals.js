// src/hooks/useModals.js
import { useState, useCallback, useEffect } from 'react';
import { eventBus, EventTypes } from '../services/events/EventBus';

export const useModals = () => {
  const [activeModals, setActiveModals] = useState({
    search: false,
    documentViewer: null,
    commandPalette: false
  });

  const openModal = useCallback((modalName, props = {}) => {
    setActiveModals(prev => ({
      ...prev,
      [modalName]: props || true
    }));

    eventBus.emit(EventTypes.UI.MODAL_OPENED, {
      modal: modalName,
      props
    });
  }, []);

  const closeModal = useCallback((modalName) => {
    setActiveModals(prev => ({
      ...prev,
      [modalName]: null
    }));

    eventBus.emit(EventTypes.UI.MODAL_CLOSED, {
      modal: modalName
    });
  }, []);

  const closeAllModals = useCallback(() => {
    setActiveModals({
      search: false,
      documentViewer: null,
      commandPalette: false
    });

    eventBus.emit(EventTypes.UI.ALL_MODALS_CLOSED);
  }, []);

  // Écouter les événements globaux
  useEffect(() => {
    const handlers = {
      [EventTypes.UI.CLOSE_ALL_MODALS]: closeAllModals,
      [EventTypes.UI.TOGGLE_SEARCH]: () => openModal('search'),
      [EventTypes.UI.TOGGLE_COMMAND_PALETTE]: () => openModal('commandPalette'),
      'keydown': (e) => {
        if (e.key === 'Escape') {
          closeAllModals();
        }
      }
    };

    // Enregistrer les écouteurs
    Object.entries(handlers).forEach(([event, handler]) => {
      if (event === 'keydown') {
        window.addEventListener(event, handler);
      } else {
        eventBus.addEventListener(event, handler);
      }
    });

    // Nettoyage
    return () => {
      Object.entries(handlers).forEach(([event, handler]) => {
        if (event === 'keydown') {
          window.removeEventListener(event, handler);
        } else {
          eventBus.removeEventListener(event, handler);
        }
      });
    };
  }, [closeAllModals, openModal]);

  return {
    activeModals,
    openModal,
    closeModal,
    closeAllModals
  };
};

export default useModals;
