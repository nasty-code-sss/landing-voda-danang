export const PAGE_ANCHOR = {
  howItWorks: 'how-it-works',
  deposit: 'deposit',
  prices: 'prices',
  order: 'order',
  trust: 'trust',
  pump: 'pump',
  zone: 'zone',
  landlords: 'landlords',
  faq: 'faq',
} as const;

export const LEGAL_ANCHOR = {
  privacy: 'privacy',
  terms: 'terms',
  complaints: 'complaints',
} as const;

export type PageAnchor = (typeof PAGE_ANCHOR)[keyof typeof PAGE_ANCHOR];
export type LegalAnchor = (typeof LEGAL_ANCHOR)[keyof typeof LEGAL_ANCHOR];

export function anchorHref(anchor: PageAnchor | LegalAnchor, path = ''): string {
  return `${path}#${anchor}`;
}
