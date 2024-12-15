// src/shared/utils/dateFormatter.ts

interface DateFormatOptions extends Intl.DateTimeFormatOptions {
  locale?: string;
}

export function formatTimestamp(
  timestamp: string | number | Date,
  options: DateFormatOptions = {}
): string {
  const {
    locale = 'fr-FR',
    ...formatOptions
  } = options;

  const defaultOptions: Intl.DateTimeFormatOptions = {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    ...formatOptions
  };

  const date = new Date(timestamp);
  return new Intl.DateTimeFormat(locale, defaultOptions).format(date);
}

export function formatRelativeTime(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'À l\'instant';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `Il y a ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `Il y a ${hours} heure${hours > 1 ? 's' : ''}`;
  } else {
    return formatTimestamp(date, {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}

export default {
  formatTimestamp,
  formatRelativeTime
};
