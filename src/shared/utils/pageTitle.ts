// src/shared/utils/pageTitle.ts

interface PageTitleOptions {
  suffix?: string;
  separator?: string;
  appName?: string;
}

export function updatePageTitle(options: PageTitleOptions = {}): void {
  const {
    suffix = '',
    separator = ' | ',
    appName = 'Eurêka Solutions'
  } = options;

  const titleParts = [appName];

  if (suffix) {
    titleParts.push(suffix);
  }

  document.title = titleParts.join(separator);
}

export function setDynamicPageTitle(title: string, options: PageTitleOptions = {}): void {
  updatePageTitle({ ...options, suffix: title });
}

export default {
  updatePageTitle,
  setDynamicPageTitle
};
