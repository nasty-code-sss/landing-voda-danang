import { defineConfig } from 'astro/config';
import { settings } from './src/shared/config/current-settings';

const { site, languages } = settings.config;

export default defineConfig({
  site: site.url,
  base: site.base,
  trailingSlash: 'always',
  output: 'static',
  build: {
    format: 'directory',
  },
  i18n: {
    locales: languages.supported,
    defaultLocale: languages.default,
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },
});
