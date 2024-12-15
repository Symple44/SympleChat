// utils/dateFormatter.js
export const formatTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(date);
};

// utils/messageParser.js
export const parseMessage = (message) => {
  try {
    if (typeof message === 'string') {
      return JSON.parse(message);
    }
    return message;
  } catch (error) {
    console.error('Erreur parsing message:', error);
    return null;
  }
};

// utils/pageTitle.js
import { config } from '../config';

export const updatePageTitle = (suffix = '') => {
  const baseTitle = config.APP.NAME;
  const titleSuffix = suffix || config.APP.TITLE_SUFFIX;
  document.title = `${baseTitle}${titleSuffix ? ` ${titleSuffix}` : ''}`;
};
