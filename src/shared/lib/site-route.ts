import { sitePath } from './site-path';

export const SITE_ROUTE = {
  home: '',
  legal: 'legal',
} as const;

export type SiteRoute = (typeof SITE_ROUTE)[keyof typeof SITE_ROUTE];

export function localizedPath(base: string, language: string, route: SiteRoute): string {
  return sitePath(base, language, route);
}

export function absoluteUrl(siteUrl: string, path: string): string {
  return new URL(path, siteUrl).toString();
}
