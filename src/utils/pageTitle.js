// src/utils/pageTitle.js
import { config } from '../config';

export const updatePageTitle = (suffix = '') => {
  const baseTitle = config.APP.NAME;
  const titleSuffix = suffix || config.APP.TITLE_SUFFIX;
  document.title = `${baseTitle}${titleSuffix ? ` ${titleSuffix}` : ''}`;
};
