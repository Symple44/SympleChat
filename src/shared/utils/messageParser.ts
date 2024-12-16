// src/shared/utils/messageParser.ts

interface ParsedMessage<T = unknown> {
  parsed: T;
  isValid: boolean;
  error?: string;
}

export function parseMessage<T = unknown>(message: string | T): ParsedMessage<T> {
  try {
    if (typeof message === 'string') {
      const parsed = JSON.parse(message) as T;
      return {
        parsed,
        isValid: true
      };
    }
    return {
      parsed: message as T,
      isValid: true
    };
  } catch (error) {
    console.error('Erreur parsing message:', error);
    return {
      parsed: {} as T,
      isValid: false,
      error: error instanceof Error ? error.message : 'Erreur de parsing inconnue'
    };
  }
}

export function stringifyMessage<T>(message: T): string {
  try {
    return JSON.stringify(message);
  } catch (error) {
    console.error('Erreur stringification message:', error);
    return '';
  }
}

export default {
  parseMessage,
  stringifyMessage
};
