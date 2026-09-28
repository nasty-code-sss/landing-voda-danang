import { defineConfig, fontProviders } from 'astro/config';
import { BRAND_FONT_VARIABLE } from './src/shared/config/font-variable';
import { settings } from './src/shared/config/current-settings';

const { site, languages, design } = settings.config;
const FONT_STYLES = ['normal'] as const;
const GENERIC_FALLBACK = 'sans-serif';
const [firstSubset, ...otherSubsets] = design.font.subsets;
if (firstSubset === undefined) {
  throw new Error('design.font.subsets must name at least one subset');
}

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
  fonts: [
    {
      provider: fontProviders.npm({ remote: false }),
      name: design.font.family,
      cssVariable: BRAND_FONT_VARIABLE,
      weights: [design.font.weights],
      styles: [...FONT_STYLES],
      subsets: [firstSubset, ...otherSubsets],
      fallbacks: [GENERIC_FALLBACK],
      optimizedFallbacks: false,
      options: { package: design.font.package },
    },
  ],
});
