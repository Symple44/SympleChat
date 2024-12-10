// src/utils/messageParser.js
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